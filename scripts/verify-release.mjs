import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "dist/index.html",
  "desktop/main.cjs",
  "desktop/preload.cjs",
  "desktop/native-audio.cjs",
  "desktop/media-backend.cjs",
  "desktop/ffmpeg/runtime/ffmpeg.exe",
  "desktop/ffmpeg/runtime/ffprobe.exe",
  "desktop/ffmpeg/runtime/manifest.json",
  "desktop/region-overlay.cjs",
  "desktop/audio-helper/runtime/KnouxRecAudioHelper.exe",
  "desktop/audio-helper/runtime/NAudio.Core.dll",
  "desktop/audio-helper/runtime/NAudio.Wasapi.dll",
  "package.json",
];
const failures = [];

for (const relativePath of required) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath) || statSync(absolutePath).size === 0) {
    failures.push(`Missing or empty required artifact: ${relativePath}`);
  }
}

const main = readFileSync(resolve(root, "desktop/main.cjs"), "utf8");
for (const setting of ["nodeIntegration: false", "contextIsolation: true", "sandbox: true", "webSecurity: true"]) {
  if (!main.includes(setting)) failures.push(`Missing Electron security setting: ${setting}`);
}
for (const channel of [
  "recording:start-file",
  "recording:append-chunk",
  "recording:finish-file",
  "recording:attach-native-audio",
  "capture:list-sources",
  "audio:list-output-devices",
  "audio:start-native-system",
  "region:select",
  "media:get-runtime-status",
]) {
  if (!main.includes(channel)) failures.push(`Missing domain IPC handler: ${channel}`);
}

const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
if (!Array.isArray(packageJson.build?.asarUnpack) || !packageJson.build.asarUnpack.includes("desktop/audio-helper/runtime/**")) {
  failures.push("Native WASAPI runtime is not configured for ASAR unpacking.");
}
if (!Array.isArray(packageJson.build?.asarUnpack) || !packageJson.build.asarUnpack.includes("desktop/ffmpeg/runtime/**")) {
  failures.push("FFmpeg runtime is not configured for ASAR unpacking.");
}

const releaseDirectory = resolve(root, "release");
if (existsSync(releaseDirectory)) {
  const files = readdirSync(releaseDirectory, { recursive: true }).map(String);
  const installers = files.filter((file) => /Setup.*\.exe$/i.test(file));
  if (!installers.length) failures.push("Release directory exists but contains no NSIS installer executable.");
  const unpackedRuntime = resolve(releaseDirectory, "win-unpacked/resources/app.asar.unpacked/desktop/audio-helper/runtime/KnouxRecAudioHelper.exe");
  if (existsSync(resolve(releaseDirectory, "win-unpacked")) && (!existsSync(unpackedRuntime) || statSync(unpackedRuntime).size === 0)) {
    failures.push("Packaged application is missing the unpacked native WASAPI executable.");
  }
  const unpackedFfmpeg = resolve(releaseDirectory, "win-unpacked/resources/app.asar.unpacked/desktop/ffmpeg/runtime/ffmpeg.exe");
  const unpackedFfprobe = resolve(releaseDirectory, "win-unpacked/resources/app.asar.unpacked/desktop/ffmpeg/runtime/ffprobe.exe");
  if (existsSync(resolve(releaseDirectory, "win-unpacked")) && (!existsSync(unpackedFfmpeg) || !existsSync(unpackedFfprobe) || statSync(unpackedFfmpeg).size === 0 || statSync(unpackedFfprobe).size === 0)) {
    failures.push("Packaged application is missing the unpacked FFmpeg and FFprobe executables.");
  }
}

if (failures.length) {
  console.error("KNOuX REC release verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("KNOuX REC release verification passed.");
  console.log("Validated secure Electron settings, native WASAPI/region/media IPC, ASAR-unpacked runtimes, and required build artifacts.");
}
