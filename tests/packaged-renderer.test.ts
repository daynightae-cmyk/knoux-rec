import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

/*
 * Packaged renderer integrity.
 *
 * The renderer is loaded with loadFile(), so the built document must reference its
 * assets relatively. A root-absolute URL resolves to the filesystem root under file://,
 * the module never executes, and the packaged window renders completely blank while
 * every artifact-existence check still passes.
 */

describe("packaged renderer entry point", () => {
  const config = read("vite.config.ts");
  const main = read("desktop/main.cjs");

  it("builds with a relative base so file:// can resolve the bundle", () => {
    expect(config).toMatch(/base:\s*"\.\/"/);
  });

  it("loads the built renderer from disk rather than a dev server in production", () => {
    expect(main).toContain("loadFile(");
    expect(main).toContain("isDevelopment");
  });

  it("keeps the release gate able to catch a blank-window build", () => {
    const verify = read("scripts/verify-release.mjs");
    expect(verify).toContain("root-absolute");
    expect(verify).toContain("does not reference any relative asset");
    expect(verify).toContain("would render blank");
  });
});
