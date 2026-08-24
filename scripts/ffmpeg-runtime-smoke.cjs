const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const runtime = path.join(root, "desktop", "ffmpeg", "runtime");
const ffmpeg = path.join(runtime, "ffmpeg.exe");
const ffprobe = path.join(runtime, "ffprobe.exe");

function run(binary, args, label) {
  const result = childProcess.spawnSync(binary, args, { encoding: "utf8", windowsHide: true });
  if (result.error) throw new Error(`${label} could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${label} failed: ${(result.stderr || result.stdout || `exit ${result.status}`).trim()}`);
  return result.stdout;
}

if (!fs.existsSync(ffmpeg) || !fs.existsSync(ffprobe)) {
  throw new Error("FFmpeg runtime is missing. Run npm run build:ffmpeg first.");
}

const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "knoux-rec-ffmpeg-smoke-"));
try {
  const video = path.join(workspace, "video.webm");
  const audio = path.join(workspace, "system.wav");
  const output = path.join(workspace, "muxed.webm");
  run(ffmpeg, [
    "-hide_banner", "-nostdin", "-y",
    "-f", "lavfi", "-i", "testsrc2=size=640x360:rate=30",
    "-t", "1.5", "-an", "-c:v", "libvpx-vp9", "-deadline", "realtime", video,
  ], "FFmpeg video generation");
  run(ffmpeg, [
    "-hide_banner", "-nostdin", "-y",
    "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000",
    "-t", "1.5", "-c:a", "pcm_s16le", audio,
  ], "FFmpeg audio generation");
  run(ffmpeg, [
    "-hide_banner", "-nostdin", "-y",
    "-i", video, "-i", audio,
    "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "copy", "-c:a", "libopus", "-b:a", "192k", "-shortest", output,
  ], "FFmpeg system-audio mux");
  const inspection = JSON.parse(run(ffprobe, [
    "-v", "error",
    "-show_entries", "format=format_name,duration:stream=codec_type,codec_name,sample_rate,channels,width,height",
    "-of", "json", output,
  ], "FFprobe output verification"));
  const streams = Array.isArray(inspection.streams) ? inspection.streams : [];
  const videoStream = streams.find((stream) => stream.codec_type === "video");
  const audioStream = streams.find((stream) => stream.codec_type === "audio");
  if (!videoStream || !audioStream || Number(audioStream.sample_rate) !== 48000 || audioStream.channels < 1 || Number(videoStream.width) !== 640 || Number(videoStream.height) !== 360) {
    throw new Error(`FFprobe verification failed: ${JSON.stringify(inspection)}`);
  }
  process.stdout.write(`${JSON.stringify({ format: inspection.format?.format_name, duration: inspection.format?.duration, video: videoStream.codec_name, audio: audioStream.codec_name, sampleRate: audioStream.sample_rate, channels: audioStream.channels })}\n`);
} finally {
  fs.rmSync(workspace, { recursive: true, force: true });
}
