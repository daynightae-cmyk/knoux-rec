const {
  app,
  BrowserWindow,
  desktopCapturer,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  shell,
  Tray,
  session,
  screen,
} = require("electron");
const crypto = require("node:crypto");
const { createNativeAudioService } = require("./native-audio.cjs");
const { detectEncoders, muxNativeSystemAudio, probeMedia, readRuntimeManifest } = require("./media-backend.cjs");
const { openRegionOverlay } = require("./region-overlay.cjs");
const { createProjectService } = require("./project-service.cjs");
const fs = require("node:fs");
const path = require("node:path");

const isDevelopment = !app.isPackaged;
const MAX_CHUNK_BYTES = 128 * 1024 * 1024;
const DEFAULT_SETTINGS = Object.freeze({
  locale: "en",
  defaultFrameRate: 30,
  defaultQuality: "1080p",
  countdownSeconds: 3,
  openLibraryAfterSave: true,
});

let mainWindow = null;
let tray = null;
const activeSessions = new Map();
const nativeAudio = createNativeAudioService({
  helperPath: isDevelopment
    ? path.join(__dirname, "audio-helper", "runtime", "KnouxRecAudioHelper.exe")
    : path.join(process.resourcesPath, "app.asar.unpacked", "desktop", "audio-helper", "runtime", "KnouxRecAudioHelper.exe"),
});

function paths() {
  const root = app.getPath("userData");
  return {
    root,
    recordings: path.join(root, "recordings"),
    settings: path.join(root, "settings.json"),
    library: path.join(root, "recordings.json"),
    projects: path.join(root, "projects"),
    journals: path.join(root, "journals"),
  };
}

function ensureDirectories() {
  const current = paths();
  fs.mkdirSync(current.recordings, { recursive: true });
  fs.mkdirSync(current.projects, { recursive: true });
  fs.mkdirSync(current.journals, { recursive: true });
  if (!fs.existsSync(current.library)) fs.writeFileSync(current.library, "[]\n", "utf8");
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryPath, filePath);
}

function getSettings() {
  const current = paths();
  const stored = readJson(current.settings, {});
  const recordingDirectory =
    typeof stored.recordingDirectory === "string" && stored.recordingDirectory.trim()
      ? stored.recordingDirectory
      : current.recordings;
  fs.mkdirSync(recordingDirectory, { recursive: true });
  return { ...DEFAULT_SETTINGS, ...stored, recordingDirectory };
}

function saveSettings(nextSettings) {
  writeJson(paths().settings, nextSettings);
  return nextSettings;
}

function readLibrary() {
  const records = readJson(paths().library, []);
  return Array.isArray(records) ? records.filter((record) => record && typeof record.id === "string") : [];
}

function saveLibrary(records) {
  writeJson(paths().library, records);
}

function projectService() {
  return createProjectService({ projectDirectory: paths().projects });
}

function journalPath(id) {
  return path.join(paths().journals, `${id}.json`);
}

function writeJournal(sessionRecord, state) {
  writeJson(journalPath(sessionRecord.id), {
    sessionId: sessionRecord.id,
    createdAt: sessionRecord.startedAt,
    captureSource: sessionRecord.sourceId,
    output: sessionRecord.temporaryPath,
    lastCompletedChunk: sessionRecord.chunksWritten,
    bytesWritten: sessionRecord.bytesWritten,
    audioState: sessionRecord.nativeSystemAudio ? "attached" : "none",
    cameraState: Boolean(sessionRecord.hasCamera),
    recordingState: state,
  });
}

function removeJournal(id) {
  const source = journalPath(id);
  if (fs.existsSync(source)) fs.unlinkSync(source);
}

function assertObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(message);
  return value;
}

function assertString(value, label, maxLength = 512) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new Error(`Invalid ${label}.`);
  }
  return value;
}

function assertBoolean(value, label) {
  if (typeof value !== "boolean") throw new Error(`Invalid ${label}.`);
  return value;
}

function assertNullableNumber(value, label) {
  if (value !== null && (!Number.isFinite(value) || value < 0)) throw new Error(`Invalid ${label}.`);
  return value;
}

function assertInteger(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Invalid ${label}.`);
  return value;
}

function safeFileBaseName(value) {
  const cleaned = String(value)
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || `recording-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

function extensionForMime(mimeType) {
  if (mimeType.includes("mp4")) return ".mp4";
  if (mimeType.includes("webm")) return ".webm";
  throw new Error("Unsupported recording container. Only WebM and MP4 are accepted.");
}

function recordingPathFor(session) {
  const settings = getSettings();
  const extension = extensionForMime(session.mimeType);
  return path.join(settings.recordingDirectory, `${safeFileBaseName(session.suggestedName)}-${session.id}${extension}`);
}

function sendToRenderer(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
}

async function listSources(rawOptions) {
  const options = rawOptions && typeof rawOptions === "object" ? rawOptions : {};
  const width = Number.isInteger(options.thumbnailWidth)
    ? Math.max(160, Math.min(640, options.thumbnailWidth))
    : 480;
  const height = Number.isInteger(options.thumbnailHeight)
    ? Math.max(90, Math.min(360, options.thumbnailHeight))
    : 270;
  const includeWindows = options.includeWindows !== false;
  const sources = await desktopCapturer.getSources({
    types: includeWindows ? ["screen", "window"] : ["screen"],
    thumbnailSize: { width, height },
    fetchWindowIcons: includeWindows,
  });

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    kind: source.id.startsWith("screen:") ? "screen" : "window",
    thumbnailDataUrl: source.thumbnail.toDataURL(),
    displayId: source.display_id || "",
    appIconDataUrl: source.appIcon ? source.appIcon.toDataURL() : null,
  }));
}

function installIpcHandlers() {
  ipcMain.handle("capture:list-sources", async (_event, options) => listSources(options));
  ipcMain.handle("region:select", () => openRegionOverlay({
    BrowserWindow,
    ipcMain,
    screen,
    preloadPath: path.join(__dirname, "preload.cjs"),
  }));
  ipcMain.handle("media:get-runtime-status", async () => {
    const runtime = readRuntimeManifest();
    if (!runtime.available) return { ...runtime, encoders: [] };
    const detected = await detectEncoders();
    return { ...runtime, encoders: detected.encoders };
  });
  ipcMain.handle("audio:list-output-devices", () => nativeAudio.listOutputDevices());
  ipcMain.handle("audio:start-native-system", (_event, deviceId) => nativeAudio.start(deviceId ?? null, getSettings().recordingDirectory));
  ipcMain.handle("audio:stop-native-system", async (_event, id) => nativeAudio.stop(assertString(id, "native audio ID", 80)));
  ipcMain.handle("audio:get-native-system", (_event, id) => nativeAudio.get(assertString(id, "native audio ID", 80)));

  ipcMain.handle("project:get", (_event, recordingId) => projectService().get(assertString(recordingId, "recording ID", 80)));
  ipcMain.handle("project:save", (_event, project) => projectService().save(project));

  ipcMain.handle("recording:start-file", (_event, input) => {
    const value = assertObject(input, "Invalid recording metadata.");
    const suggestedName = assertString(value.suggestedName, "recording name", 120);
    const mimeType = assertString(value.mimeType, "MIME type", 80);
    extensionForMime(mimeType);
    const frameRate = assertInteger(value.frameRate, "frame rate", 1, 240);
    const hasSystemAudio = assertBoolean(value.hasSystemAudio, "system audio flag");
    const hasMicrophone = assertBoolean(value.hasMicrophone, "microphone flag");
    const sourceId = value.sourceId === null ? null : assertString(value.sourceId, "source ID", 300);
    const width = assertNullableNumber(value.width, "width");
    const height = assertNullableNumber(value.height, "height");

    const id = crypto.randomUUID();
    const temporaryPath = path.join(paths().root, "recordings", `${id}.part`);
    fs.closeSync(fs.openSync(temporaryPath, "w"));
    activeSessions.set(id, {
      id,
      suggestedName,
      mimeType,
      sourceId,
      hasSystemAudio,
      hasMicrophone,
      frameRate,
      width,
      height,
      temporaryPath,
      startedAt: new Date().toISOString(),
      bytesWritten: 0,
      chunksWritten: 0,
    });
    writeJournal(activeSessions.get(id), "recording");
    return { id, startedAt: activeSessions.get(id).startedAt, temporaryPath };
  });

  ipcMain.handle("recording:append-chunk", (_event, id, buffer) => {
    const sessionRecord = activeSessions.get(assertString(id, "recording ID", 80));
    if (!sessionRecord) throw new Error("Recording session no longer exists.");
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength === 0 || buffer.byteLength > MAX_CHUNK_BYTES) {
      throw new Error("Invalid recording chunk.");
    }
    fs.appendFileSync(sessionRecord.temporaryPath, Buffer.from(buffer));
    sessionRecord.bytesWritten += buffer.byteLength;
    sessionRecord.chunksWritten += 1;
    writeJournal(sessionRecord, "recording");
  });

  ipcMain.handle("recording:attach-native-audio", (_event, recordingId, capture) => {
    const sessionRecord = activeSessions.get(assertString(recordingId, "recording ID", 80));
    if (!sessionRecord) throw new Error("Recording session no longer exists.");
    const value = assertObject(capture, "Invalid native audio capture.");
    if (typeof value.id !== "string" || typeof value.filePath !== "string" || !fs.existsSync(value.filePath)) {
      throw new Error("Native audio sidecar file is not available.");
    }
    const fileBytes = fs.statSync(value.filePath).size;
    if (fileBytes <= 44) throw new Error("Native audio sidecar contains no PCM data.");
    sessionRecord.nativeSystemAudio = { ...value, fileBytes };
    sessionRecord.hasSystemAudio = true;
  });

  ipcMain.handle("recording:finish-file", async (_event, input) => {
    const value = assertObject(input, "Invalid completion metadata.");
    const id = assertString(value.id, "recording ID", 80);
    const sessionRecord = activeSessions.get(id);
    if (!sessionRecord) throw new Error("Recording session no longer exists.");
    const durationMs = assertInteger(value.durationMs, "duration", 0, 86_400_000);
    const frameCount = assertNullableNumber(value.frameCount, "frame count");
    const droppedFrames = assertNullableNumber(value.droppedFrames, "dropped frames");
    if (sessionRecord.bytesWritten === 0) throw new Error("No media data was written for this recording.");

    const filePath = recordingPathFor(sessionRecord);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    let media;
    let systemAudioMuxed = false;
    if (sessionRecord.nativeSystemAudio?.filePath) {
      media = await muxNativeSystemAudio({
        videoPath: sessionRecord.temporaryPath,
        systemAudioPath: sessionRecord.nativeSystemAudio.filePath,
        outputPath: filePath,
      });
      systemAudioMuxed = true;
      fs.unlinkSync(sessionRecord.temporaryPath);
    } else {
      media = await probeMedia(sessionRecord.temporaryPath);
      fs.renameSync(sessionRecord.temporaryPath, filePath);
      media = { ...media, path: filePath, sizeBytes: fs.statSync(filePath).size };
    }
    const record = {
      id,
      fileName: path.basename(filePath),
      filePath,
      mimeType: sessionRecord.mimeType,
      sizeBytes: fs.statSync(filePath).size,
      createdAt: sessionRecord.startedAt,
      durationMs,
      frameCount,
      droppedFrames,
      sourceId: sessionRecord.sourceId,
      hasSystemAudio: sessionRecord.hasSystemAudio,
      hasMicrophone: sessionRecord.hasMicrophone,
      frameRate: sessionRecord.frameRate,
      width: sessionRecord.width,
      height: sessionRecord.height,
      nativeSystemAudio: sessionRecord.nativeSystemAudio || null,
      systemAudioMuxed,
      media,
      projectPath: null,
    };
    const createdProject = projectService().createFromRecording(record);
    record.projectPath = createdProject.path;
    saveLibrary([record, ...readLibrary().filter((item) => item.id !== id)]);
    activeSessions.delete(id);
    removeJournal(id);
    return record;
  });

  ipcMain.handle("recording:cancel-file", (_event, id) => {
    const sessionRecord = activeSessions.get(assertString(id, "recording ID", 80));
    if (!sessionRecord) return;
    activeSessions.delete(sessionRecord.id);
    removeJournal(sessionRecord.id);
    if (fs.existsSync(sessionRecord.temporaryPath)) fs.unlinkSync(sessionRecord.temporaryPath);
    if (typeof sessionRecord.nativeSystemAudio?.filePath === "string" && fs.existsSync(sessionRecord.nativeSystemAudio.filePath)) {
      fs.unlinkSync(sessionRecord.nativeSystemAudio.filePath);
    }
  });

  ipcMain.handle("recording:list", () =>
    readLibrary().filter((record) => {
      try {
        return fs.existsSync(record.filePath) && fs.statSync(record.filePath).size > 0;
      } catch {
        return false;
      }
    }),
  );

  ipcMain.handle("recording:reveal", (_event, id) => {
    const record = readLibrary().find((item) => item.id === assertString(id, "recording ID", 80));
    if (!record) throw new Error("Recording was not found.");
    shell.showItemInFolder(record.filePath);
  });

  ipcMain.handle("recording:open", async (_event, id) => {
    const record = readLibrary().find((item) => item.id === assertString(id, "recording ID", 80));
    if (!record) throw new Error("Recording was not found.");
    const error = await shell.openPath(record.filePath);
    if (error) throw new Error(error);
  });

  ipcMain.handle("recording:reveal-native-audio", (_event, id) => {
    const record = readLibrary().find((item) => item.id === assertString(id, "recording ID", 80));
    const audioPath = record?.nativeSystemAudio?.filePath;
    if (typeof audioPath !== "string" || !fs.existsSync(audioPath)) throw new Error("Native system-audio sidecar was not found.");
    shell.showItemInFolder(audioPath);
  });

  ipcMain.handle("recording:open-native-audio", async (_event, id) => {
    const record = readLibrary().find((item) => item.id === assertString(id, "recording ID", 80));
    const audioPath = record?.nativeSystemAudio?.filePath;
    if (typeof audioPath !== "string" || !fs.existsSync(audioPath)) throw new Error("Native system-audio sidecar was not found.");
    const error = await shell.openPath(audioPath);
    if (error) throw new Error(error);
  });

  ipcMain.handle("recording:remove", (_event, id) => {
    const recordingId = assertString(id, "recording ID", 80);
    const records = readLibrary();
    const record = records.find((item) => item.id === recordingId);
    if (!record) throw new Error("Recording was not found.");
    if (fs.existsSync(record.filePath)) fs.unlinkSync(record.filePath);
    if (typeof record.nativeSystemAudio?.filePath === "string" && fs.existsSync(record.nativeSystemAudio.filePath)) {
      fs.unlinkSync(record.nativeSystemAudio.filePath);
    }
    projectService().remove(recordingId);
    saveLibrary(records.filter((item) => item.id !== recordingId));
  });

  ipcMain.handle("settings:get", () => getSettings());
  ipcMain.handle("settings:update", (_event, patch) => {
    const value = assertObject(patch, "Invalid settings update.");
    const current = getSettings();
    const next = { ...current };
    if (value.locale !== undefined) {
      if (value.locale !== "en" && value.locale !== "ar") throw new Error("Invalid locale.");
      next.locale = value.locale;
    }
    if (value.defaultFrameRate !== undefined) {
      if (value.defaultFrameRate !== 30 && value.defaultFrameRate !== 60) throw new Error("Invalid frame rate.");
      next.defaultFrameRate = value.defaultFrameRate;
    }
    if (value.defaultQuality !== undefined) {
      if (!["720p", "1080p", "1440p", "4k"].includes(value.defaultQuality)) throw new Error("Invalid quality.");
      next.defaultQuality = value.defaultQuality;
    }
    if (value.countdownSeconds !== undefined) {
      if (![0, 3, 5, 10].includes(value.countdownSeconds)) throw new Error("Invalid countdown.");
      next.countdownSeconds = value.countdownSeconds;
    }
    if (value.openLibraryAfterSave !== undefined) {
      if (typeof value.openLibraryAfterSave !== "boolean") throw new Error("Invalid library preference.");
      next.openLibraryAfterSave = value.openLibraryAfterSave;
    }
    return saveSettings(next);
  });

  ipcMain.handle("system:choose-recording-directory", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Choose recording folder",
      properties: ["openDirectory", "createDirectory"],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const next = { ...getSettings(), recordingDirectory: result.filePaths[0] };
    saveSettings(next);
    return next.recordingDirectory;
  });

  ipcMain.handle("system:health", () => {
    const settings = getSettings();
    let writable = false;
    let freeBytes = null;
    let totalBytes = null;
    try {
      fs.mkdirSync(settings.recordingDirectory, { recursive: true });
      fs.accessSync(settings.recordingDirectory, fs.constants.W_OK);
      writable = true;
      if (typeof fs.statfsSync === "function") {
        const stats = fs.statfsSync(settings.recordingDirectory);
        freeBytes = Number(stats.bavail) * Number(stats.bsize);
        totalBytes = Number(stats.blocks) * Number(stats.bsize);
      }
    } catch {
      writable = false;
    }
    return {
      recordingDirectory: settings.recordingDirectory,
      freeBytes,
      totalBytes,
      writable,
      platform: process.platform,
      appVersion: app.getVersion(),
    };
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: "#080b15",
    title: "KNOuX REC",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });
  mainWindow.removeMenu();
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  if (isDevelopment) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || "http://127.0.0.1:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function configureSecurity() {
  const activeSession = session.defaultSession;
  activeSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const trusted = webContents.getURL().startsWith("file:") || webContents.getURL().startsWith("http://127.0.0.1:");
    callback(trusted && permission === "media");
  });
  activeSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' ws://127.0.0.1:* http://127.0.0.1:*; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
        ],
      },
    });
  });
}

function createTray() {
  const iconPath = path.join(__dirname, "..", "public", "tray-icon.png");
  if (!fs.existsSync(iconPath)) return;
  tray = new Tray(iconPath);
  tray.setToolTip("KNOuX REC");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show KNOuX REC", click: () => mainWindow?.show() },
      { label: "Start or stop recording", accelerator: "Ctrl+Shift+R", click: () => sendToRenderer("recording:toggle-request") },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
  tray.on("click", () => mainWindow?.show());
}

app.whenReady().then(() => {
  ensureDirectories();
  configureSecurity();
  installIpcHandlers();
  createWindow();
  createTray();
  globalShortcut.register("Control+Shift+R", () => sendToRenderer("recording:toggle-request"));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  globalShortcut.unregisterAll();
  for (const sessionRecord of activeSessions.values()) {
    try {
      writeJournal(sessionRecord, "interrupted");
    } catch {
      // A failed journal write must not block process shutdown; the partial file remains intact.
    }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
