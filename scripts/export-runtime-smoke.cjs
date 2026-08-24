const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { app } = require("electron");

app.whenReady().then(async () => {
  const { exportProjectClip, generateThumbnail, probeMedia } = require("../desktop/media-backend.cjs");
  const runtime = path.join(__dirname, "..", "desktop", "ffmpeg", "runtime", "ffmpeg.exe");
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "knoux-rec-export-"));
  const source = path.join(directory, "source.webm");
  const destination = path.join(directory, "export.mp4");
  const thumbnail = path.join(directory, "thumbnail.jpg");
  const childProcess = require("node:child_process");
  await new Promise((resolve, reject) => {
    const child = childProcess.spawn(runtime, ["-hide_banner", "-nostdin", "-y", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=30", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "1.2", "-c:v", "libvpx-vp9", "-c:a", "libopus", source], { windowsHide: true });
    child.once("error", reject); child.once("close", (code) => code === 0 ? resolve() : reject(new Error(`fixture FFmpeg exited ${code}`)));
  });
  const thumbnailPath = await generateThumbnail({ inputPath: source, outputPath: thumbnail, seekMs: 300, width: 320 });
  const thumbnailProbe = await probeMedia(thumbnailPath);
  if (!thumbnailProbe.video || thumbnailProbe.video.width !== 320 || fs.statSync(thumbnailPath).size <= 0) {
    throw new Error("Thumbnail smoke verification failed.");
  }
  const result = await exportProjectClip({ inputPath: source, outputPath: destination, startMs: 0, endMs: 1000, format: "mp4" });
  const verified = await probeMedia(result.outputPath);
  if (!verified.video || verified.format?.includes("mp4") === false) throw new Error("Export smoke verification failed.");
  console.log(JSON.stringify({ format: verified.format, duration: verified.durationSeconds, video: verified.video.codec, audio: verified.audio?.codec || null }));
  fs.rmSync(directory, { recursive: true, force: true });
  app.quit();
}).catch((error) => { console.error(error); app.exitCode = 1; app.quit(); });
