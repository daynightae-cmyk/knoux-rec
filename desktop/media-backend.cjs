const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { app } = require("electron");

const MAX_PROCESS_OUTPUT = 256 * 1024;
const FFMPEG_RUNTIME_FOLDER = path.join("desktop", "ffmpeg", "runtime");

function runtimeDirectory() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked", FFMPEG_RUNTIME_FOLDER)
    : path.join(__dirname, "ffmpeg", "runtime");
}

function runtimePaths() {
  const directory = runtimeDirectory();
  return {
    directory,
    ffmpeg: path.join(directory, "ffmpeg.exe"),
    ffprobe: path.join(directory, "ffprobe.exe"),
    manifest: path.join(directory, "manifest.json"),
  };
}

function boundedOutput(existing, chunk) {
  const joined = `${existing}${chunk}`;
  return joined.length > MAX_PROCESS_OUTPUT ? joined.slice(-MAX_PROCESS_OUTPUT) : joined;
}

function runBinary(binaryPath, args, label) {
  if (!fs.existsSync(binaryPath)) {
    throw new Error(`${label} runtime is unavailable. Run npm run build:ffmpeg before packaging.`);
  }
  return new Promise((resolve, reject) => {
    const processHandle = childProcess.spawn(binaryPath, args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    processHandle.stderr.on("data", (chunk) => {
      stderr = boundedOutput(stderr, chunk.toString());
    });
    processHandle.once("error", (error) => reject(new Error(`${label} could not start: ${error.message}`)));
    processHandle.once("close", (code, signal) => {
      if (code === 0) return resolve({ stderr });
      const detail = stderr.trim() || `process exited with code ${code ?? "unknown"}${signal ? ` (${signal})` : ""}`;
      reject(new Error(`${label} failed: ${detail}`));
    });
  });
}

function parseJsonOutput(binaryPath, args, label) {
  if (!fs.existsSync(binaryPath)) throw new Error(`${label} runtime is unavailable.`);
  return new Promise((resolve, reject) => {
    const processHandle = childProcess.spawn(binaryPath, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    processHandle.stdout.on("data", (chunk) => { stdout = boundedOutput(stdout, chunk.toString()); });
    processHandle.stderr.on("data", (chunk) => { stderr = boundedOutput(stderr, chunk.toString()); });
    processHandle.once("error", (error) => reject(new Error(`${label} could not start: ${error.message}`)));
    processHandle.once("close", (code) => {
      if (code !== 0) return reject(new Error(`${label} failed: ${stderr.trim() || `process exited with code ${code}`}`));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`${label} returned invalid JSON.`));
      }
    });
  });
}

function assertExistingFile(filePath, label) {
  if (typeof filePath !== "string" || !filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} is not available.`);
  }
  return filePath;
}

async function probeMedia(filePath) {
  const input = assertExistingFile(filePath, "Media input");
  const { ffprobe } = runtimePaths();
  const result = await parseJsonOutput(ffprobe, [
    "-v", "error",
    "-show_entries", "format=format_name,duration,size:stream=index,codec_type,codec_name,codec_long_name,width,height,avg_frame_rate,r_frame_rate,sample_rate,channels,duration",
    "-of", "json",
    input,
  ], "FFprobe");
  const streams = Array.isArray(result.streams) ? result.streams : [];
  const video = streams.find((stream) => stream.codec_type === "video") || null;
  const audio = streams.find((stream) => stream.codec_type === "audio") || null;
  return {
    path: input,
    format: typeof result.format?.format_name === "string" ? result.format.format_name : null,
    durationSeconds: Number.isFinite(Number(result.format?.duration)) ? Number(result.format.duration) : null,
    sizeBytes: Number.isFinite(Number(result.format?.size)) ? Number(result.format.size) : null,
    video: video ? {
      codec: video.codec_name || null,
      width: Number.isInteger(video.width) ? video.width : null,
      height: Number.isInteger(video.height) ? video.height : null,
      frameRate: video.avg_frame_rate || video.r_frame_rate || null,
    } : null,
    audio: audio ? {
      codec: audio.codec_name || null,
      sampleRate: Number.isFinite(Number(audio.sample_rate)) ? Number(audio.sample_rate) : null,
      channels: Number.isInteger(audio.channels) ? audio.channels : null,
    } : null,
    streams: streams.map((stream) => ({ type: stream.codec_type || null, codec: stream.codec_name || null })),
  };
}

function buildMuxArguments(videoPath, wavPath, outputPath, videoAlreadyHasAudio) {
  const base = ["-hide_banner", "-nostdin", "-y", "-i", videoPath, "-i", wavPath];
  if (videoAlreadyHasAudio) {
    return [
      ...base,
      "-filter_complex", "[0:a:0][1:a:0]amix=inputs=2:duration=longest:dropout_transition=0[aout]",
      "-map", "0:v:0",
      "-map", "[aout]",
      "-c:v", "copy",
      "-c:a", "libopus",
      "-b:a", "192k",
      "-shortest",
      outputPath,
    ];
  }
  return [
    ...base,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "libopus",
    "-b:a", "192k",
    "-shortest",
    outputPath,
  ];
}

async function muxNativeSystemAudio({ videoPath, systemAudioPath, outputPath }) {
  const sourceVideo = assertExistingFile(videoPath, "Recorded video");
  const sourceAudio = assertExistingFile(systemAudioPath, "System-audio WAV");
  if (fs.statSync(sourceAudio).size <= 44) throw new Error("System-audio WAV contains no PCM data.");
  const current = await probeMedia(sourceVideo);
  if (!current.video) throw new Error("Recorded video has no video stream and cannot be muxed.");
  const extension = path.extname(outputPath) || ".webm";
  const temporaryOutput = `${outputPath}.muxing${extension}`;
  if (fs.existsSync(temporaryOutput)) fs.unlinkSync(temporaryOutput);
  const { ffmpeg } = runtimePaths();
  try {
    await runBinary(ffmpeg, buildMuxArguments(sourceVideo, sourceAudio, temporaryOutput, Boolean(current.audio)), "FFmpeg mux");
    const verified = await probeMedia(temporaryOutput);
    if (!verified.video || !verified.audio) throw new Error("FFprobe could not verify both video and mixed audio streams.");
    fs.renameSync(temporaryOutput, outputPath);
    return verified;
  } catch (error) {
    if (fs.existsSync(temporaryOutput)) fs.unlinkSync(temporaryOutput);
    throw error;
  }
}

async function exportProjectClip({ inputPath, outputPath, startMs = 0, endMs = null, format = "mp4" }) {
  const source = assertExistingFile(inputPath, "Project video");
  if (typeof outputPath !== "string" || !outputPath.trim()) throw new Error("Invalid export output path.");
  if (!Number.isFinite(startMs) || startMs < 0 || (endMs !== null && (!Number.isFinite(endMs) || endMs <= startMs))) throw new Error("Invalid export range.");
  if (format !== "mp4" && format !== "webm") throw new Error("Unsupported export format.");
  const suffix = format === "mp4" ? ".mp4" : ".webm";
  const destination = outputPath.endsWith(suffix) ? outputPath : `${outputPath}${suffix}`;
  const temporary = `${destination}.exporting${suffix}`;
  if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  const args = ["-hide_banner", "-nostdin", "-y", "-ss", (startMs / 1000).toFixed(3), "-i", source];
  if (endMs !== null) args.push("-t", ((endMs - startMs) / 1000).toFixed(3));
  if (format === "mp4") args.push("-map", "0:v:0", "-map", "0:a?", "-c:v", "mpeg4", "-q:v", "3", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", temporary);
  else args.push("-map", "0:v:0", "-map", "0:a?", "-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0", "-c:a", "libopus", "-b:a", "160k", temporary);
  try {
    await runBinary(runtimePaths().ffmpeg, args, "FFmpeg export");
    const verified = await probeMedia(temporary);
    if (!verified.video) throw new Error("FFprobe could not verify an exported video stream.");
    fs.renameSync(temporary, destination);
    return { outputPath: destination, media: verified };
  } catch (error) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    throw error;
  }
}

async function generateThumbnail({ inputPath, outputPath, seekMs = 300, width = 480 }) {
  const source = assertExistingFile(inputPath, "Thumbnail video");
  if (typeof outputPath !== "string" || !outputPath.trim()) throw new Error("Invalid thumbnail output path.");
  if (!Number.isFinite(seekMs) || seekMs < 0 || seekMs > 30_000) throw new Error("Invalid thumbnail seek time.");
  if (!Number.isInteger(width) || width < 160 || width > 640) throw new Error("Invalid thumbnail width.");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporaryOutput = `${outputPath}.generating.jpg`;
  if (fs.existsSync(temporaryOutput)) fs.unlinkSync(temporaryOutput);
  const args = [
    "-hide_banner", "-nostdin", "-y", "-ss", (seekMs / 1000).toFixed(3), "-i", source,
    "-map", "0:v:0", "-frames:v", "1",
    "-vf", `scale=${width}:-2:force_original_aspect_ratio=decrease`,
    "-q:v", "4", temporaryOutput,
  ];
  try {
    await runBinary(runtimePaths().ffmpeg, args, "FFmpeg thumbnail");
    if (!fs.existsSync(temporaryOutput) || fs.statSync(temporaryOutput).size <= 0) {
      throw new Error("FFmpeg thumbnail produced no image data.");
    }
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    fs.renameSync(temporaryOutput, outputPath);
    return outputPath;
  } catch (error) {
    if (fs.existsSync(temporaryOutput)) fs.unlinkSync(temporaryOutput);
    throw error;
  }
}
function readRuntimeManifest() {
  const { manifest, ffmpeg, ffprobe } = runtimePaths();
  if (!fs.existsSync(manifest)) {
    return { available: false, ffmpegPath: ffmpeg, ffprobePath: ffprobe, manifest: null };
  }
  try {
    return { available: fs.existsSync(ffmpeg) && fs.existsSync(ffprobe), ffmpegPath: ffmpeg, ffprobePath: ffprobe, manifest: JSON.parse(fs.readFileSync(manifest, "utf8")) };
  } catch {
    return { available: false, ffmpegPath: ffmpeg, ffprobePath: ffprobe, manifest: null };
  }
}

async function detectEncoders() {
  const { ffmpeg } = runtimePaths();
  if (!fs.existsSync(ffmpeg)) return { available: false, encoders: [] };
  return new Promise((resolve, reject) => {
    const processHandle = childProcess.spawn(ffmpeg, ["-hide_banner", "-encoders"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    processHandle.stdout.on("data", (chunk) => { stdout = boundedOutput(stdout, chunk.toString()); });
    processHandle.stderr.on("data", (chunk) => { stderr = boundedOutput(stderr, chunk.toString()); });
    processHandle.once("error", (error) => reject(new Error(`FFmpeg encoder detection could not start: ${error.message}`)));
    processHandle.once("close", (code) => {
      if (code !== 0) return reject(new Error(`FFmpeg encoder detection failed: ${stderr.trim() || code}`));
      const encoderNames = new Set((stdout.match(/^\s*[VAS\.]{6}\s+([^\s]+)/gm) || []).map((line) => line.trim().split(/\s+/).at(-1)));
      resolve({
        available: true,
        encoders: [
          { id: "libvpx-vp9", label: "VP9 software", available: encoderNames.has("libvpx-vp9"), kind: "software" },
          { id: "libaom-av1", label: "AV1 software", available: encoderNames.has("libaom-av1"), kind: "software" },
          { id: "libx264", label: "H.264 software", available: encoderNames.has("libx264"), kind: "software" },
          { id: "h264_nvenc", label: "NVIDIA NVENC H.264", available: encoderNames.has("h264_nvenc"), kind: "hardware" },
          { id: "h264_qsv", label: "Intel Quick Sync H.264", available: encoderNames.has("h264_qsv"), kind: "hardware" },
          { id: "h264_amf", label: "AMD AMF H.264", available: encoderNames.has("h264_amf"), kind: "hardware" },
        ],
      });
    });
  });
}

module.exports = { detectEncoders, exportProjectClip, generateThumbnail, muxNativeSystemAudio, probeMedia, readRuntimeManifest };
