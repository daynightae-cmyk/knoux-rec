const crypto = require("node:crypto");
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function parseEvent(line) {
  try {
    const payload = JSON.parse(String(line).trim());
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

function createNativeAudioService({ helperPath }) {
  const sessions = new Map();

  function requireHelper() {
    if (!fs.existsSync(helperPath)) throw new Error("Native WASAPI audio helper is not packaged.");
  }

  function publicSession(session) {
    return {
      id: session.id,
      state: session.state,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      filePath: session.filePath,
      fileBytes: session.fileBytes,
      bytesRecorded: session.bytesRecorded,
      peakPermille: session.peakPermille,
      sampleRate: session.sampleRate,
      channels: session.channels,
      bitsPerSample: session.bitsPerSample,
      error: session.error,
      startedAt: session.startedAt,
      stoppedAt: session.stoppedAt,
    };
  }

  function listOutputDevices() {
    requireHelper();
    const result = spawnSync(helperPath, ["list"], { encoding: "utf8", windowsHide: true, timeout: 10_000 });
    if (result.error) throw new Error(`Native WASAPI enumeration failed: ${result.error.message}`);
    const payload = String(result.stdout || "").split(/\r?\n/).map(parseEvent).find(Boolean);
    if (!payload || payload.event !== "devices" || !Array.isArray(payload.devices)) {
      throw new Error(`Native WASAPI enumeration failed: ${payload?.message || String(result.stderr || "invalid helper response")}`);
    }
    return payload.devices
      .filter((device) => device && typeof device.id === "string" && typeof device.name === "string")
      .map((device) => ({ id: device.id, name: device.name, state: String(device.state || "Unknown"), isDefault: Boolean(device.isDefault) }));
  }

  function start(deviceId, recordingDirectory) {
    if (deviceId !== null && deviceId !== undefined && typeof deviceId !== "string") throw new Error("Invalid native audio device ID.");
    if (typeof recordingDirectory !== "string" || !recordingDirectory.trim()) throw new Error("Invalid recording directory.");
    const selected = (deviceId ? listOutputDevices().find((device) => device.id === deviceId) : listOutputDevices().find((device) => device.isDefault));
    if (!selected) throw new Error("The selected Windows output device is not active.");

    const id = crypto.randomUUID();
    const sidecarDirectory = path.join(recordingDirectory, "native-audio");
    fs.mkdirSync(sidecarDirectory, { recursive: true });
    const filePath = path.join(sidecarDirectory, `system-${id}.wav`);
    const child = spawn(helperPath, ["capture", "--device", selected.id, "--output", filePath], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    const session = {
      id, child, state: "starting", deviceId: selected.id, deviceName: selected.name, filePath,
      fileBytes: 0, bytesRecorded: 0, peakPermille: 0, sampleRate: null, channels: null,
      bitsPerSample: null, error: null, startedAt: null, stoppedAt: null,
    };
    sessions.set(id, session);
    let resolveReady;
    let rejectReady;
    let resolveDone;
    const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
    const done = new Promise((resolve) => { resolveDone = resolve; });
    session.done = done;
    let buffer = "";

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      for (const line of lines) {
        const payload = parseEvent(line);
        if (!payload) continue;
        if (payload.event === "ready") {
          session.state = "recording";
          session.deviceName = String(payload.deviceName || selected.name);
          session.sampleRate = Number.isFinite(payload.sampleRate) ? payload.sampleRate : null;
          session.channels = Number.isFinite(payload.channels) ? payload.channels : null;
          session.bitsPerSample = Number.isFinite(payload.bitsPerSample) ? payload.bitsPerSample : null;
          session.startedAt = new Date().toISOString();
          resolveReady(publicSession(session));
        } else if (payload.event === "meter") {
          session.bytesRecorded = Number.isFinite(payload.bytesRecorded) ? payload.bytesRecorded : session.bytesRecorded;
          session.peakPermille = Number.isFinite(payload.peakPermille) ? payload.peakPermille : session.peakPermille;
        } else if (payload.event === "stopped") {
          session.state = "idle";
          session.bytesRecorded = Number.isFinite(payload.bytesRecorded) ? payload.bytesRecorded : session.bytesRecorded;
          session.fileBytes = Number.isFinite(payload.fileBytes) ? payload.fileBytes : 0;
          session.peakPermille = Number.isFinite(payload.peakPermille) ? payload.peakPermille : session.peakPermille;
          session.stoppedAt = new Date().toISOString();
        } else if (payload.event === "error") {
          session.state = "failed";
          session.error = String(payload.message || "Native WASAPI capture failed.");
          rejectReady(new Error(session.error));
        }
      }
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => { session.error = String(chunk).trim() || session.error; });
    child.on("error", (error) => {
      session.state = "failed";
      session.error = error.message;
      rejectReady(error);
      resolveDone(publicSession(session));
    });
    child.on("exit", () => {
      if (session.state === "starting") {
        session.state = "failed";
        session.error = session.error || "Native WASAPI helper exited before it was ready.";
        rejectReady(new Error(session.error));
      }
      if (fs.existsSync(filePath)) session.fileBytes = fs.statSync(filePath).size;
      if (!session.stoppedAt) session.stoppedAt = new Date().toISOString();
      resolveDone(publicSession(session));
    });

    return Promise.race([
      ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Native WASAPI helper did not become ready within five seconds.")), 5_000)),
    ]);
  }

  async function stop(id) {
    const session = sessions.get(String(id));
    if (!session) throw new Error("Native audio session was not found.");
    if (session.state === "recording" || session.state === "starting") {
      session.state = "stopping";
      session.child.stdin.write("stop\n");
    }
    const result = await Promise.race([
      session.done,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Native WASAPI helper did not stop within ten seconds.")), 10_000)),
    ]);
    sessions.delete(session.id);
    if (result.bytesRecorded <= 0 || result.fileBytes <= 58) {
      throw new Error("Native system audio produced no PCM data; the WAV sidecar was rejected.");
    }
    return result;
  }

  function get(id) {
    const session = sessions.get(String(id));
    return session ? publicSession(session) : null;
  }

  return { listOutputDevices, start, stop, get };
}

module.exports = { createNativeAudioService };
