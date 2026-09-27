import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "../components/dashboard/panels";

/*
 * Shell architecture guards.
 *
 * The visual transplant is only acceptable if it stays inside the constraints the
 * product already runs under: local fonts and assets, a native window frame, a single
 * navigation system, responsive layout instead of fixed screenshot coordinates, and no
 * regression markers in runtime source.
 */

const root = process.cwd();
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const dashboardDir = resolve(root, "components/dashboard");
const dashboardSources = readdirSync(dashboardDir).filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"));
const readAll = () => dashboardSources.map((name) => read(`components/dashboard/${name}`)).join("\n");
/** Brand mark and hero illustration carry their own SVG paint; nothing else may. */
const artworkSources = new Set(["BrandMark.tsx", "HeroWorkspace.tsx"]);
const shellCss = read("styles/shell.css");
const dashboardCss = read("styles/dashboard.css");
const tokensCss = read("styles/tokens.css");

describe("KNOuX REC shell architecture", () => {
  it("centralizes design tokens instead of scattering raw colours through components", () => {
    for (const token of ["--rec-bg", "--rec-panel", "--rec-border", "--rec-border-active", "--rec-blue", "--rec-violet", "--rec-magenta", "--rec-record", "--rec-success", "--rec-warning", "--rec-danger", "--rec-text", "--rec-text-secondary", "--rec-muted", "--rec-radius-lg", "--rec-radius-md"]) {
      expect(tokensCss, token).toContain(`${token}:`);
    }
    for (const name of dashboardSources) {
      if (artworkSources.has(name)) continue;
      expect(read(`components/dashboard/${name}`).match(/#[0-9a-fA-F]{3,8}\b/g) ?? [], name).toEqual([]);
    }
    // Artwork paint stays confined to the two brand modules and stays small.
    const artworkHex = dashboardSources.filter((name) => artworkSources.has(name))
      .flatMap((name) => read(`components/dashboard/${name}`).match(/#[0-9a-fA-F]{6}\b/g) ?? []);
    expect(artworkHex.length).toBeGreaterThan(0);
    expect(artworkHex.length).toBeLessThanOrEqual(40);
  });

  it("lays the shell out with intrinsic CSS rather than screenshot coordinates", () => {
    expect(shellCss).toContain("grid-template-columns: var(--rec-sidebar-width) minmax(0, 1fr)");
    expect(shellCss).toContain("overflow-x: hidden");
    expect(dashboardCss).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(dashboardCss).toContain("clamp(");
    const fixedOffsets = dashboardCss.match(/(?:^|[;{\s])(?:left|top|right|bottom):\s*\d+px/g) ?? [];
    expect(fixedOffsets, "dashboard CSS must not position against fixed pixel offsets").toEqual([]);
  });

  it("adapts to the required desktop viewports", () => {
    for (const breakpoint of ["1600px", "1440px", "1300px", "1120px"]) {
      expect(dashboardCss, breakpoint).toContain(`max-width: ${breakpoint}`);
    }
    for (const breakpoint of ["1500px", "1380px"]) {
      expect(tokensCss, breakpoint).toContain(`max-width: ${breakpoint}`);
    }
    expect(shellCss).toContain("max-width: 980px");
  });

  it("respects reduced motion and keeps the sidebar fixed", () => {
    expect(tokensCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(shellCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(dashboardCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(shellCss).toContain("height: 100vh");
    expect(shellCss).toContain("min-height: var(--rec-topbar-height)");
  });

  it("provides a visible keyboard focus ring", () => {
    expect(shellCss).toContain(":focus-visible");
  });

  it("does not draw window controls over the native Windows title bar", () => {
    const main = read("desktop/main.cjs");
    expect(main).not.toContain("frame: false");
    const topBar = read("components/dashboard/TopBar.tsx");
    for (const control of ["minimize", "maximize", "restore", "close-window", "windowControl"]) {
      expect(topBar, control).not.toContain(control);
    }
  });

  it("keeps a single navigation system inside the canonical shell", () => {
    const app = read("App.tsx");
    expect(app).toContain("<AppShell");
    expect(app).not.toContain('className="app-shell"');
    expect(app).not.toContain('className="nav-list"');
    expect(app).not.toContain('className="sidebar"');
    // Every navigation destination is reachable from this one shell, and the dashboard is home.
    for (const item of NAV_ITEMS) expect(app, item.id).toContain(`"${item.id}"`);
    expect(app).toContain('useState<Panel>("dashboard")');
    // Project-backed surfaces are narrowed through the ProjectWorkspace branch.
    expect(app).toContain("<ProjectWorkspace");
  });

  it("keeps the presentation surface presentational and free of backend ownership", () => {
    for (const name of dashboardSources) {
      const source = read(`components/dashboard/${name}`);
      expect(source, `${name} must not touch desktop IPC`).not.toContain("window.knouxRec");
      expect(source, `${name} must not spawn processes`).not.toMatch(/child_process|exec\(/);
    }
  });

  it("introduces no remote runtime asset", () => {
    const combined = [readAll(), shellCss, dashboardCss, tokensCss, read("App.tsx")].join("\n");
    for (const marker of ["http://", "https://", "//cdn", "cdn.", "unpkg", "jsdelivr", "googleapis", "placehold.co", "@import url("]) {
      expect(combined, marker).not.toContain(marker);
    }
    expect(combined).not.toContain("Math.random");
  });

  it("does not reintroduce permissive Electron flags or regression markers", () => {
    const main = read("desktop/main.cjs");
    expect(main).toContain("nodeIntegration: false");
    expect(main).toContain("contextIsolation: true");
    expect(main).toContain("sandbox: true");
    expect(main).toContain("webSecurity: true");
    for (const marker of ["webSecurity: false", "nodeIntegration: true", "contextIsolation: false", "disable-web-security"]) {
      expect(main, marker).not.toContain(marker);
    }
    const runtime = [read("App.tsx"), read("index.tsx"), readAll()].join("\n").toLowerCase();
    for (const marker of ["placeholder.co", "lorem ipsum", "todo: fake", "dummy data", "sample data", "fake stat", "mock data", "hardcoded ready"]) {
      expect(runtime, marker).not.toContain(marker);
    }
  });

  it("keeps a real font strategy with no runtime font fetch", () => {
    const combined = [readAll(), shellCss, dashboardCss, tokensCss, read("index.css")].join("\n");
    expect(combined).not.toContain("@font-face");
    expect(combined).not.toContain("fonts.googleapis");
    expect(tokensCss).toContain("--rec-font:");
  });
});
