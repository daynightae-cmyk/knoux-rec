import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MAX_RECORDING_CHUNK_BYTES,
  MAX_SOURCE_THUMBNAIL_HEIGHT,
  MAX_SOURCE_THUMBNAIL_WIDTH,
} from "../desktop/contracts";

const root = process.cwd();
const readProjectFile = (fileName: string) => readFileSync(resolve(root, fileName), "utf8");

describe("KNOuX REC desktop architecture", () => {
  it("sets bounded contracts for thumbnails and incremental media chunks", () => {
    expect(MAX_SOURCE_THUMBNAIL_WIDTH).toBeLessThanOrEqual(640);
    expect(MAX_SOURCE_THUMBNAIL_HEIGHT).toBeLessThanOrEqual(360);
    expect(MAX_RECORDING_CHUNK_BYTES).toBe(128 * 1024 * 1024);
  });

  it("keeps Electron web contents isolated and disables direct Node integration", () => {
    const main = readProjectFile("desktop/main.cjs");

    expect(main).toContain("nodeIntegration: false");
    expect(main).toContain("contextIsolation: true");
    expect(main).toContain("sandbox: true");
    expect(main).toContain("webSecurity: true");
    expect(main).toContain("setWindowOpenHandler(() => ({ action: \"deny\" }))");
  });

  it("writes incoming media chunks to a temporary file before final atomic move", () => {
    const main = readProjectFile("desktop/main.cjs");

    expect(main).toContain("recording:append-chunk");
    expect(main).toContain("fs.appendFileSync(sessionRecord.temporaryPath");
    expect(main).toContain("fs.renameSync(sessionRecord.temporaryPath, filePath)");
    expect(main).toContain("No media data was written for this recording.");
  });

  it("guards recording starts against low disk space and unwritable destinations", () => {
    const hook = readProjectFile("hooks/useRecorder.ts");
    const main = readProjectFile("desktop/main.cjs");

    expect(main).toContain("MIN_FREE_RECORDING_BYTES = 512 * 1024 * 1024");
    expect(main).toContain("function assertRecordingDirectoryReady");
    expect(main).toContain("Temporary recording storage");
    expect(main).toContain("Recording folder");
    expect(main).toContain("Free disk space before recording.");
    expect(main).toContain("Temporary recording storage fell below the safe reserve.");
    expect(hook).toContain("terminalWriteErrorRef");
    expect(hook).toContain("Recording stopped safely.");
    expect(hook).toContain("terminalWriteErrorRef.current?.message");
  });
  it("uses a bounded native WASAPI helper and does not accept an empty sidecar WAV", () => {
    const helper = readProjectFile("desktop/audio-helper/Program.cs");
    const service = readProjectFile("desktop/native-audio.cjs");
    expect(helper).toContain("WasapiLoopbackCapture");
    expect(helper).toContain("MMDeviceEnumerator");
    expect(service).toContain("listOutputDevices");
    expect(service).toContain("result.bytesRecorded <= 0");
    expect(service).toContain("Native system audio produced no PCM data");
  });

  it("keeps region selection in a transparent overlay and converts DIP to physical bounds", () => {
    const main = readProjectFile("desktop/main.cjs");

    const overlay = readProjectFile("desktop/region-overlay.cjs");
    expect(main).toContain("openRegionOverlay");
    expect(overlay).toContain("transparent: true");
    expect(overlay).toContain("screen.dipToScreenRect");
    expect(overlay).toContain("event.sender !== overlay.webContents");
    expect(overlay).toContain("REGION_MIN_SIZE");
  });

  it("uses canvas compositors for region cropping and camera PiP before encoding", () => {
    const hook = readProjectFile("hooks/useRecorder.ts");

    expect(hook).toContain("const composeRegion");
    expect(hook).toContain("canvas.captureStream");
    expect(hook).toContain("const composeCamera");
    expect(hook).toContain("sourceCaptureStreamRef");
  });

  it("writes a durable recording journal and preserves interrupted parts at shutdown", () => {
    const main = readProjectFile("desktop/main.cjs");

    expect(main).toContain("function writeJournal");
    expect(main).toContain("lastCompletedChunk");
    expect(main).toContain("nativeSystemAudioPath");
    expect(main).toContain("writeJournal(sessionRecord, \"recording\")");
    expect(main).toContain("writeJournal(sessionRecord, \"interrupted\")");
    expect(main).toContain("removeJournal(id)");
  });

  it("exposes constrained inspection and safe recovery for interrupted media parts", () => {
    const main = readProjectFile("desktop/main.cjs");

    const preload = readProjectFile("desktop/preload.cjs");
    const recovery = readProjectFile("desktop/recovery-service.cjs");
    const app = readProjectFile("App.tsx");
    const packageJson = readProjectFile("package.json");
    expect(main).toContain("recovery:list");
    expect(main).toContain("recovery:recover");
    expect(main).toContain("recovery:discard");
    expect(preload).toContain("recovery:recover");
    expect(recovery).toContain("WASAPI sidecar recovery is unavailable");
    expect(recovery).toContain("FFprobe could not verify a video stream");
    expect(recovery).toContain("isPathInside");
    expect(app).toContain("window.knouxRec.recovery.recover(id)");
    expect(app).toContain("recoveryHint");
    expect(packageJson).toContain("test:recovery");
    expect(packageJson).toContain("recovery-runtime-smoke.cjs");
  });

  it("creates versioned non-destructive recording projects through narrow IPC", () => {
    const main = readProjectFile("desktop/main.cjs");

    const preload = readProjectFile("desktop/preload.cjs");
    const projects = readProjectFile("desktop/project-service.cjs");
    expect(main).toContain("project:get");
    expect(main).toContain("createFromRecording(record)");
    expect(preload).toContain("project:save");
    expect(projects).toContain("schemaVersion: 1");
    expect(projects).toContain(".knouxrec");
    expect(projects).toContain("atomicJsonWrite");
  });

  it("routes studio controls through real audio, camera, and presentation compositors", () => {
    const hook = readProjectFile("hooks/useRecorder.ts");

    const app = readProjectFile("App.tsx");
    expect(hook).toContain("audioContext.createGain()");
    expect(hook).toContain("audioContext.createAnalyser()");
    expect(hook).toContain("nativeAudioPollRef.current = setInterval");
    expect(hook).toContain('current?.state === "failed"');
    expect(hook).toContain("System audio stopped during recording:");
    expect(hook).toContain("System-audio sidecar could not be finalized:");
    expect(hook).toContain("sessionWarningRef.current");
    expect(hook).toContain("const composePresentation");
    expect(hook).toContain("snapshot.cameraMirror");
    expect(hook).toContain("snapshot.cameraPosition");
    expect(hook).toContain("projectPresentation: { padding: snapshot.presentationPadding");
    expect(hook).toContain("projectCamera: { enabled: snapshot.includeCamera");
    expect(hook).toContain("project.save({ ...project, presentation: active.projectPresentation, camera: active.projectCamera })");
    expect(app).toContain("Audio Studio");
    expect(app).toContain("Camera Studio");
    expect(app).toContain("setMicrophoneGain");
  });

  it("exports SRT only from real caption segments in a versioned project", () => {
    const projects = readProjectFile("desktop/project-service.cjs");
    const main = readProjectFile("desktop/main.cjs");

    expect(projects).toContain("function formatSrt");
    expect(projects).toContain("Project has no caption segments to export.");
    expect(projects).toContain(".srt");
    expect(main).toContain("project:export-srt");
  });

  it("keeps the project export path constrained and covered by a runtime MP4 smoke test", () => {
    const mediaBackend = readProjectFile("desktop/media-backend.cjs");
    const main = readProjectFile("desktop/main.cjs");

    const projects = readProjectFile("desktop/project-service.cjs");
    const packageJson = readProjectFile("package.json");
    expect(mediaBackend).toContain("async function exportProjectClip");
    expect(mediaBackend).toContain("FFmpeg export");
    expect(mediaBackend).toContain("mpeg4");
    expect(packageJson).toContain("test:export");
    expect(packageJson).toContain("export-runtime-smoke.cjs");
    expect(main).toContain("project:export");
    expect(main).toContain("getContinuousTrim(project)");
    expect(main).toContain("startMs: range.startMs");
    expect(main).not.toContain("value.startMs");
    expect(projects).toContain("Only one continuous trim range is supported.");
    expect(readProjectFile("desktop/preload.cjs")).toContain("project:export");
  });

  it("provides project-backed editor and caption controls instead of placeholder pages", () => {
    const app = readProjectFile("App.tsx");
    const workspace = readProjectFile("components/ProjectWorkspace.tsx");
    expect(app).toContain('"editor" | "captions" | "export"');
    expect(app).toContain("<ProjectWorkspace");
    expect(app).toContain("window.knouxRec.project.save(project)");
    expect(workspace).toContain("window.knouxRec.project.exportSrt(selectedRecordingId)");
    expect(workspace).toContain("window.knouxRec.project.export({ recordingId: selectedRecordingId, format: \"mp4\" })");
    expect(workspace).toContain("Automatic transcription is unavailable in this build.");
    expect(workspace).toContain("knoux-rec-media://recording/");
    expect(readProjectFile("desktop/main.cjs")).toContain("protocol.handle(\"knoux-rec-media\"");
    expect(readProjectFile("desktop/main.cjs")).toContain("pathToFileURL(record.filePath)");
  });

  it("uses a constrained local FFmpeg backend for muxing and post-output probing", () => {
    const mediaBackend = readProjectFile("desktop/media-backend.cjs");
    const main = readProjectFile("desktop/main.cjs");

    expect(mediaBackend).toContain("muxNativeSystemAudio");
    expect(mediaBackend).toContain("probeMedia");
    expect(mediaBackend).toContain("FFprobe could not verify both video and mixed audio streams.");
    expect(mediaBackend).toContain("childProcess.spawn(binaryPath, args");
    expect(mediaBackend).not.toContain("exec(command)");
    expect(main).toContain("media:get-runtime-status");
    expect(main).toContain("muxNativeSystemAudio({");
  });

  it("keeps release scripts connected to desktop packaging and verification", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as { main: string; scripts: Record<string, string>; build: { asarUnpack: string[] } };
    expect(packageJson.main).toBe("desktop/main.cjs");
    expect(packageJson.scripts["build:audio-helper"]).toContain("build-helper.ps1");
    expect(packageJson.scripts["build:ffmpeg"]).toContain("build-runtime.ps1");
    expect(packageJson.scripts["test:ffmpeg"]).toContain("scripts/ffmpeg-runtime-smoke.cjs");
    expect(packageJson.scripts["desktop:pack"]).toContain("electron-builder --dir --win");
    expect(packageJson.scripts["desktop:dist"]).toContain("electron-builder --win nsis");
    expect(packageJson.scripts["verify:release"]).toContain("scripts/verify-release.mjs");
    expect(packageJson.build.asarUnpack).toContain("desktop/ffmpeg/runtime/**");
  });
});
