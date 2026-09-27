import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * Local media runtime manifest reader.
 *
 * Regression guard for a real P0 defect: Windows PowerShell 5.1 wrote the manifest with
 * a UTF-8 BOM, JSON.parse rejects a leading U+FEFF, and the failure was swallowed, so a
 * fully working FFmpeg install reported itself as unavailable and the dashboard showed
 * the export engine, thumbnails and output verification as missing.
 *
 * The parsing is a pure function of the manifest path, so it is exercised directly with
 * real files rather than through a mocked Electron.
 */

const { readMediaManifest } = await import("../desktop/media-backend.cjs");

const runtimeDirectory = mkdtempSync(join(tmpdir(), "knoux-media-runtime-"));
const manifestPath = join(runtimeDirectory, "manifest.json");

const manifest = {
  assetName: "ffmpeg-test.zip",
  sourceUrl: "https://example.invalid/ffmpeg-test.zip",
  archiveSha256: "a".repeat(64),
  ffmpegSha256: "b".repeat(64),
  ffprobeSha256: "c".repeat(64),
  version: "ffmpeg version test",
  license: "LGPL-2.1-or-later",
  builtAt: "2026-08-24T12:54:07.0000000Z",
};

const write = (contents: string) => writeFileSync(manifestPath, contents, "utf8");

afterAll(() => {
  rmSync(runtimeDirectory, { recursive: true, force: true });
});

describe("local media runtime manifest", () => {
  beforeAll(() => {
    write(JSON.stringify(manifest, null, 2));
  });

  it("reads a plain UTF-8 manifest and reports no error", () => {
    const runtime = readMediaManifest(manifestPath);
    expect(runtime.manifest?.version).toBe("ffmpeg version test");
    expect(runtime.error).toBeNull();
  });

  it("still reads a manifest that carries a UTF-8 BOM", () => {
    write(`\uFEFF${JSON.stringify(manifest, null, 2)}`);
    const runtime = readMediaManifest(manifestPath);
    expect(runtime.manifest?.version).toBe("ffmpeg version test");
    expect(runtime.error).toBeNull();
  });

  it("reports a readable reason instead of silently claiming the runtime is absent", () => {
    write("{ this is not json");
    const runtime = readMediaManifest(manifestPath);
    expect(runtime.manifest).toBeNull();
    expect(runtime.error).toBeTruthy();
    expect(runtime.error).toContain("could not be read");
  });

  it("reports a missing manifest with actionable guidance", () => {
    rmSync(manifestPath, { force: true });
    const runtime = readMediaManifest(manifestPath);
    expect(runtime.manifest).toBeNull();
    expect(runtime.error).toContain("build:ffmpeg");
  });
});

describe("FFmpeg runtime provisioning", () => {
  it("writes the manifest without a byte-order mark", () => {
    const script = readFileSync(join(process.cwd(), "desktop", "ffmpeg", "build-runtime.ps1"), "utf8");
    expect(script).toContain("UTF8Encoding($false)");
    expect(script).not.toMatch(/Set-Content[^\n]*-Encoding\s+utf8/i);
  });
});
