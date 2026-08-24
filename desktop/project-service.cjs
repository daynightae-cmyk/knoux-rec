const fs = require("node:fs");
const path = require("node:path");

function assertString(value, label, maximum = 1024) {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new Error(`Invalid ${label}.`);
  return value;
}

function assertNumber(value, label, minimum = 0, maximum = 86_400_000) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) throw new Error(`Invalid ${label}.`);
  return value;
}

function atomicJsonWrite(filePath, value) {
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, filePath);
}

function validateProject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid project payload.");
  if (value.schemaVersion !== 1) throw new Error("Unsupported project schema version.");
  const project = {
    schemaVersion: 1,
    id: assertString(value.id, "project ID", 80),
    createdAt: assertString(value.createdAt, "project creation time", 64),
    updatedAt: new Date().toISOString(),
    media: {
      videoPath: assertString(value.media?.videoPath, "project video path"),
      systemAudioPath: value.media?.systemAudioPath === null ? null : assertString(value.media?.systemAudioPath, "project audio path"),
    },
    timeline: {
      durationMs: assertNumber(value.timeline?.durationMs, "project duration"),
      cuts: Array.isArray(value.timeline?.cuts) ? value.timeline.cuts.map((cut) => ({
        id: assertString(cut?.id, "cut ID", 80), startMs: assertNumber(cut?.startMs, "cut start"), endMs: assertNumber(cut?.endMs, "cut end"),
      })) : [],
    },
    presentation: {
      padding: assertNumber(value.presentation?.padding ?? 0, "presentation padding", 0, 0.2),
      background: assertString(value.presentation?.background ?? "#10182e", "presentation background", 16),
    },
    camera: {
      enabled: Boolean(value.camera?.enabled), shape: assertString(value.camera?.shape ?? "rounded", "camera shape", 32), position: assertString(value.camera?.position ?? "bottom-right", "camera position", 32), scale: assertNumber(value.camera?.scale ?? 0.22, "camera scale", 0.12, 0.4), mirror: Boolean(value.camera?.mirror), opacity: assertNumber(value.camera?.opacity ?? 1, "camera opacity", 0.2, 1),
    },
    captions: {
      language: value.captions?.language === null || value.captions?.language === undefined ? null : assertString(value.captions.language, "caption language", 16),
      segments: Array.isArray(value.captions?.segments) ? value.captions.segments.map((segment) => ({ id: assertString(segment?.id, "caption ID", 80), startMs: assertNumber(segment?.startMs, "caption start"), endMs: assertNumber(segment?.endMs, "caption end"), text: assertString(segment?.text, "caption text", 10000) })) : [],
    },
  };
  for (const cut of project.timeline.cuts) if (cut.endMs <= cut.startMs || cut.endMs > project.timeline.durationMs) throw new Error("Invalid cut range.");
  for (const segment of project.captions.segments) if (segment.endMs <= segment.startMs || segment.endMs > project.timeline.durationMs) throw new Error("Invalid caption range.");
  return project;
}

function createProjectService({ projectDirectory }) {
  fs.mkdirSync(projectDirectory, { recursive: true });
  const projectPath = (id) => path.join(projectDirectory, `${id}.knouxrec`);
  return {
    createFromRecording(record) {
      const project = validateProject({ schemaVersion: 1, id: record.id, createdAt: record.createdAt, media: { videoPath: record.filePath, systemAudioPath: record.nativeSystemAudio?.filePath || null }, timeline: { durationMs: record.durationMs, cuts: [] }, presentation: { padding: 0, background: "#10182e" }, camera: { enabled: false, shape: "rounded", position: "bottom-right", scale: 0.22, mirror: false, opacity: 1 }, captions: { language: null, segments: [] } });
      const destination = projectPath(record.id);
      atomicJsonWrite(destination, project);
      return { project, path: destination };
    },
    get(id) {
      const source = projectPath(assertString(id, "project ID", 80));
      if (!fs.existsSync(source)) return null;
      return validateProject(JSON.parse(fs.readFileSync(source, "utf8")));
    },
    save(value) {
      const project = validateProject(value);
      atomicJsonWrite(projectPath(project.id), project);
      return project;
    },
    remove(id) {
      const source = projectPath(assertString(id, "project ID", 80));
      if (fs.existsSync(source)) fs.unlinkSync(source);
    },
  };
}

module.exports = { createProjectService };
