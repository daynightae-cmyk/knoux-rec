/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const childProcess = require("node:child_process");
const { app } = require("electron");

function run(binary, args, label) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(binary, args, { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-65536); });
    child.once("error", reject);
    child.once("close", (code) => code === 0 ? resolve() : reject(new Error(`${label} exited ${code}: ${stderr}`)));
  });
}

app.whenReady().then(async () => {
  const { createProjectService, getContinuousTrim } = require("../desktop/project-service.cjs");
  const { exportProjectClip, probeMedia } = require("../desktop/media-backend.cjs");
  const runtime = path.join(__dirname, "..", "desktop", "ffmpeg", "runtime", "ffmpeg.exe");
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "knoux-rec-project-trim-"));
  const source = path.join(directory, "source.webm");
  const destination = path.join(directory, "trimmed.mp4");
  try {
    await run(runtime, ["-hide_banner", "-nostdin", "-y", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=30", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "3", "-c:v", "libvpx-vp9", "-c:a", "libopus", source], "Fixture FFmpeg");
    const service = createProjectService({ projectDirectory: path.join(directory, "projects") });
    const created = service.createFromRecording({ id: "trim-smoke", createdAt: new Date().toISOString(), filePath: source, nativeSystemAudio: null, durationMs: 3000 });
    const project = service.save({
      ...created.project,
      timeline: { durationMs: 3000, cuts: [{ id: "primary-trim", startMs: 500, endMs: 1500 }] },
    });
    const range = getContinuousTrim(project);
    if (range.startMs !== 500 || range.endMs !== 1500) throw new Error("Saved project trim was not read back.");
    const output = await exportProjectClip({ inputPath: project.media.videoPath, outputPath: destination, startMs: range.startMs, endMs: range.endMs, format: "mp4" });
    const verified = await probeMedia(output.outputPath);
    if (!verified.video || !verified.audio || !verified.format?.includes("mp4") || !verified.durationSeconds || verified.durationSeconds < 0.75 || verified.durationSeconds > 1.35) {
      throw new Error(`Trim export verification failed: ${JSON.stringify(verified)}`);
    }
    console.log(JSON.stringify({ range, format: verified.format, duration: verified.durationSeconds, video: verified.video.codec, audio: verified.audio.codec }));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  app.quit();
}).catch((error) => { console.error(error); app.exitCode = 1; app.quit(); });
