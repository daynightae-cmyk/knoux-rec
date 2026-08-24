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

  it("keeps release scripts connected to desktop packaging and verification", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as { main: string; scripts: Record<string, string> };
    expect(packageJson.main).toBe("desktop/main.cjs");
    expect(packageJson.scripts["desktop:pack"]).toContain("electron-builder --dir --win");
    expect(packageJson.scripts["desktop:dist"]).toContain("electron-builder --win nsis");
    expect(packageJson.scripts["verify:release"]).toContain("scripts/verify-release.mjs");
  });
});
