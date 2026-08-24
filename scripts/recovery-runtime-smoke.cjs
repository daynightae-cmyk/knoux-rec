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
  const { createProjectService } = require("../desktop/project-service.cjs");
  const { createRecoveryService } = require("../desktop/recovery-service.cjs");
  const { probeMedia } = require("../desktop/media-backend.cjs");
  const runtime = path.join(__dirname, "..", "desktop", "ffmpeg", "runtime", "ffmpeg.exe");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "knoux-rec-recovery-"));
  const journalDirectory = path.join(root, "journals");
  const partDirectory = path.join(root, "parts");
  const recordingDirectory = path.join(root, "recordings");
  const projectDirectory = path.join(root, "projects");
  fs.mkdirSync(journalDirectory, { recursive: true });
  fs.mkdirSync(partDirectory, { recursive: true });
  fs.mkdirSync(recordingDirectory, { recursive: true });
  const id = "recovery-smoke";
  const partPath = path.join(partDirectory, `${id}.part`);
  const library = [];
  try {
    await run(runtime, ["-hide_banner", "-nostdin", "-y", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=30", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "1.2", "-c:v", "libvpx-vp9", "-c:a", "libopus", "-f", "webm", partPath], "Fixture FFmpeg");
    fs.writeFileSync(path.join(journalDirectory, `${id}.json`), JSON.stringify({
      sessionId: id,
      createdAt: new Date().toISOString(),
      captureSource: "screen:1",
      output: partPath,
      lastCompletedChunk: 2,
      bytesWritten: fs.statSync(partPath).size,
      suggestedName: "Recovered smoke recording",
      mimeType: "video/webm;codecs=vp9,opus",
      hasSystemAudio: false,
      hasMicrophone: true,
      frameRate: 30,
      width: 320,
      height: 180,
      nativeSystemAudioPath: null,
      recordingState: "interrupted",
    }, null, 2));
    const projectService = createProjectService({ projectDirectory });
    const recovery = createRecoveryService({
      journalDirectory,
      partDirectory,
      recordingDirectory,
      readLibrary: () => library,
      saveLibrary: (next) => { library.splice(0, library.length, ...next); },
      createProject: (record) => projectService.createFromRecording(record),
      probeMedia,
    });
    const listed = recovery.list();
    if (listed.length !== 1 || !listed[0].recoverable || listed[0].hasNativeSystemAudio) throw new Error(`Recovery inspection failed: ${JSON.stringify(listed)}`);
    const record = await recovery.recover(id);
    if (!fs.existsSync(record.filePath) || fs.existsSync(partPath) || fs.existsSync(path.join(journalDirectory, `${id}.json`)) || library.length !== 1 || !record.projectPath || !fs.existsSync(record.projectPath)) {
      throw new Error("Recovered recording artifacts are incomplete.");
    }
    console.log(JSON.stringify({ id: record.id, format: record.media.format, duration: record.durationMs, project: Boolean(record.projectPath) }));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  app.quit();
}).catch((error) => { console.error(error); app.exitCode = 1; app.quit(); });
