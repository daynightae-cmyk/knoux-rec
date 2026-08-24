/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createProjectService } = require("../desktop/project-service.cjs");

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "knoux-rec-caption-srt-"));
try {
  const service = createProjectService({ projectDirectory: path.join(directory, "projects") });
  const created = service.createFromRecording({ id: "caption-smoke", createdAt: new Date().toISOString(), filePath: path.join(directory, "source.webm"), nativeSystemAudio: null, durationMs: 12_000 });
  service.save({
    ...created.project,
    captions: {
      language: "en",
      segments: [
        { id: "caption-1", startMs: 500, endMs: 2000, text: "First caption" },
        { id: "caption-2", startMs: 2250, endMs: 5000, text: "Second\ncaption" },
      ],
    },
  });
  const output = service.exportSrt("caption-smoke", path.join(directory, "exports"));
  const srt = fs.readFileSync(output, "utf8");
  if (!srt.includes("00:00:00,500 --> 00:00:02,000") || !srt.includes("Second\ncaption")) throw new Error(`SRT verification failed: ${srt}`);
  console.log(JSON.stringify({ output, entries: 2, bytes: Buffer.byteLength(srt) }));
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
