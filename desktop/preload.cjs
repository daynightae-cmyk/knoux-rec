const { contextBridge, ipcRenderer } = require("electron");

function invoke(channel, ...args) {
  return ipcRenderer.invoke(channel, ...args);
}

contextBridge.exposeInMainWorld("knouxRec", {
  capture: {
    listSources: (options) => invoke("capture:list-sources", options),
  },
  region: {
    select: () => invoke("region:select"),
    complete: (bounds) => ipcRenderer.send("region:confirm", bounds),
    cancel: () => ipcRenderer.send("region:cancel"),
    onConfiguration: (listener) => {
      const handler = (_event, payload) => listener(payload);
      ipcRenderer.on("region:configuration", handler);
      return () => ipcRenderer.removeListener("region:configuration", handler);
    },
  },
  media: {
    getRuntimeStatus: () => invoke("media:get-runtime-status"),
  },
  audio: {
    listOutputDevices: () => invoke("audio:list-output-devices"),
    startNativeSystemAudio: (deviceId) => invoke("audio:start-native-system", deviceId),
    stopNativeSystemAudio: (id) => invoke("audio:stop-native-system", id),
    getNativeSystemAudio: (id) => invoke("audio:get-native-system", id),
  },
  project: {
    get: (recordingId) => invoke("project:get", recordingId),
    save: (project) => invoke("project:save", project),
    export: (input) => invoke("project:export", input),
  },
  recording: {
    startFile: (input) => invoke("recording:start-file", input),
    appendChunk: (id, bytes) => invoke("recording:append-chunk", id, bytes),
    attachNativeAudio: (recordingId, capture) => invoke("recording:attach-native-audio", recordingId, capture),
    finishFile: (input) => invoke("recording:finish-file", input),
    cancelFile: (id) => invoke("recording:cancel-file", id),
    list: () => invoke("recording:list"),
    reveal: (id) => invoke("recording:reveal", id),
    open: (id) => invoke("recording:open", id),
    revealNativeAudio: (id) => invoke("recording:reveal-native-audio", id),
    openNativeAudio: (id) => invoke("recording:open-native-audio", id),
    remove: (id) => invoke("recording:remove", id),
  },
  settings: {
    get: () => invoke("settings:get"),
    update: (patch) => invoke("settings:update", patch),
  },
  system: {
    health: () => invoke("system:health"),
    chooseRecordingDirectory: () => invoke("system:choose-recording-directory"),
  },
  events: {
    onToggleRequested: (listener) => {
      const handler = () => listener();
      ipcRenderer.on("recording:toggle-request", handler);
      return () => ipcRenderer.removeListener("recording:toggle-request", handler);
    },
  },
});
