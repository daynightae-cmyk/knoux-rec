/* eslint-disable @typescript-eslint/no-require-imports, no-control-regex */
const fs = require("node:fs");
const path = require("node:path");

const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{1,80}$/;

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(path.resolve(parentPath), path.resolve(candidatePath));
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertSessionId(value) {
  if (typeof value !== "string" || !SESSION_ID_PATTERN.test(value)) throw new Error("Invalid recovery session ID.");
  return value;
}

function safeFileBaseName(value) {
  const cleaned = String(value || "Recovered recording")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || "Recovered recording";
}

function extensionForMime(mimeType) {
  if (typeof mimeType !== "string") throw new Error("Journal MIME type is unavailable.");
  if (mimeType.includes("mp4")) return ".mp4";
  if (mimeType.includes("webm")) return ".webm";
  throw new Error("Interrupted recording uses an unsupported container.");
}

function readJournalFile(filePath) {
  try {
    const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value;
  } catch {
    return null;
  }
}

function createRecoveryService({ journalDirectory, partDirectory, recordingDirectory, readLibrary, saveLibrary, createProject, probeMedia }) {
  fs.mkdirSync(journalDirectory, { recursive: true });
  const journalFile = (id) => path.join(journalDirectory, `${assertSessionId(id)}.json`);

  function inspect(id) {
    const source = journalFile(id);
    if (!fs.existsSync(source)) return null;
    const journal = readJournalFile(source);
    if (!journal || journal.sessionId !== id || !SESSION_ID_PATTERN.test(journal.sessionId)) return null;
    const temporaryPath = typeof journal.output === "string" ? journal.output : null;
    if (!temporaryPath || !isPathInside(partDirectory, temporaryPath)) return null;
    const partExists = fs.existsSync(temporaryPath);
    const partBytes = partExists && fs.statSync(temporaryPath).isFile() ? fs.statSync(temporaryPath).size : 0;
    const supportedContainer = typeof journal.mimeType === "string" && (journal.mimeType.includes("webm") || journal.mimeType.includes("mp4"));
    const hasNativeSystemAudio = Boolean(journal.nativeSystemAudioPath);
    const recoverable = partBytes > 0 && supportedContainer && !hasNativeSystemAudio;
    let reason = null;
    if (!partExists) reason = "The interrupted media part is missing.";
    else if (partBytes === 0) reason = "The interrupted media part contains no data.";
    else if (!supportedContainer) reason = "The interrupted media container is unsupported.";
    else if (hasNativeSystemAudio) reason = "WASAPI sidecar recovery is unavailable; the part and journal were preserved.";
    return {
      id: journal.sessionId,
      createdAt: typeof journal.createdAt === "string" ? journal.createdAt : null,
      recordingState: typeof journal.recordingState === "string" ? journal.recordingState : "unknown",
      sourceId: typeof journal.captureSource === "string" ? journal.captureSource : null,
      bytesWritten: Number.isFinite(journal.bytesWritten) ? journal.bytesWritten : partBytes,
      chunksWritten: Number.isInteger(journal.lastCompletedChunk) ? journal.lastCompletedChunk : 0,
      partBytes,
      hasNativeSystemAudio,
      recoverable,
      reason,
    };
  }

  function list() {
    return fs.readdirSync(journalDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => inspect(entry.name.slice(0, -5)))
      .filter(Boolean)
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
  }

  async function recover(id) {
    const session = inspect(assertSessionId(id));
    if (!session) throw new Error("Recovery journal was not found or is invalid.");
    if (!session.recoverable) throw new Error(session.reason || "Interrupted recording cannot be recovered safely.");
    const journal = readJournalFile(journalFile(id));
    const temporaryPath = journal.output;
    const media = await probeMedia(temporaryPath);
    if (!media?.video) throw new Error("FFprobe could not verify a video stream in the interrupted media part.");
    const extension = extensionForMime(journal.mimeType);
    const destination = path.join(recordingDirectory, `${safeFileBaseName(journal.suggestedName)}-${id}${extension}`);
    if (!isPathInside(recordingDirectory, destination)) throw new Error("Recovered recording path is invalid.");
    if (fs.existsSync(destination)) fs.unlinkSync(destination);
    fs.renameSync(temporaryPath, destination);
    const record = {
      id,
      fileName: path.basename(destination),
      filePath: destination,
      mimeType: journal.mimeType,
      sizeBytes: fs.statSync(destination).size,
      createdAt: typeof journal.createdAt === "string" ? journal.createdAt : new Date().toISOString(),
      durationMs: Math.max(0, Math.round((media.durationSeconds || 0) * 1000)),
      frameCount: null,
      droppedFrames: null,
      sourceId: typeof journal.captureSource === "string" ? journal.captureSource : null,
      hasSystemAudio: Boolean(journal.hasSystemAudio && media.audio),
      hasMicrophone: Boolean(journal.hasMicrophone && media.audio),
      frameRate: Number.isInteger(journal.frameRate) ? journal.frameRate : 0,
      width: Number.isFinite(journal.width) ? journal.width : null,
      height: Number.isFinite(journal.height) ? journal.height : null,
      nativeSystemAudio: null,
      systemAudioMuxed: false,
      media: { ...media, path: destination, sizeBytes: fs.statSync(destination).size },
      projectPath: null,
    };
    const project = createProject(record);
    record.projectPath = project.path;
    saveLibrary([record, ...readLibrary().filter((item) => item.id !== id)]);
    fs.unlinkSync(journalFile(id));
    return record;
  }

  function discard(id) {
    const session = inspect(assertSessionId(id));
    if (!session) throw new Error("Recovery journal was not found or is invalid.");
    const journal = readJournalFile(journalFile(id));
    const temporaryPath = journal.output;
    if (typeof temporaryPath === "string" && isPathInside(partDirectory, temporaryPath) && fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    fs.unlinkSync(journalFile(id));
  }

  return { discard, inspect, list, recover };
}

module.exports = { createRecoveryService };
