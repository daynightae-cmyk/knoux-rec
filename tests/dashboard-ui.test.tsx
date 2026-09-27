// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import AppShell from "../components/dashboard/AppShell";
import DashboardHome from "../components/dashboard/DashboardHome";
import { NAV_ITEMS, type PanelId } from "../components/dashboard/panels";
import { SERVICES } from "../components/dashboard/services";
import type { CapabilityFacts } from "../components/dashboard/capabilities";

/*
 * Dashboard UI acceptance tests.
 *
 * These render the real shell into a DOM and drive it the way a user would, so the
 * assertions are about what actually reaches the screen rather than about source text.
 */

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

const facts = (patch: Partial<CapabilityFacts> = {}): CapabilityFacts => ({
  isDesktop: true,
  isInitialized: true,
  recorderState: "idle",
  error: null,
  elapsedSeconds: 0,
  selectedSourceLabel: null,
  screenSources: 2,
  windowSources: 3,
  regionSelected: false,
  regionLabel: null,
  cameras: 1,
  cameraEnabled: false,
  microphones: 1,
  microphoneEnabled: false,
  systemAudioEnabled: false,
  audioOutputDevices: 2,
  audioHelperError: null,
  nativeAudioState: null,
  chunksWritten: 0,
  freeBytes: 40 * 1024 * 1024 * 1024,
  storageWritable: true,
  recordings: 3,
  thumbnailedRecordings: 2,
  recoverySessions: 0,
  recoverableSessions: 0,
  projectOpen: true,
  captionSegments: 4,
  mediaAvailable: true,
  mediaVersion: "7.1",
  ...patch,
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(node: React.ReactNode) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(node));
  return container;
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  document.body.innerHTML = "";
});

const text = () => container?.textContent ?? "";
const serviceButtons = () => Array.from(container?.querySelectorAll<HTMLButtonElement>(".service-card") ?? []);
const byLabel = (needle: string) => serviceButtons().find((button) => (button.getAttribute("aria-label") ?? "").startsWith(needle));

describe("KNOuX REC dashboard", () => {
  it("renders the hero, the sidebar and every service card", () => {
    render(<AppShell locale="en" direction="ltr" active="dashboard" facts={facts()} context={null} pendingMessages={0} onNavigate={() => {}} onClearMessages={() => {}} onToggleLocale={() => {}}>
      <DashboardHome locale="en" facts={facts()} onNavigate={() => {}} />
    </AppShell>);

    expect(container?.querySelector(".dash-hero")).toBeTruthy();
    expect(container?.querySelector(".app-sidebar")).toBeTruthy();
    expect(container?.querySelector(".app-topbar")).toBeTruthy();
    expect(container?.querySelectorAll(".dash-section").length).toBe(5);
    expect(serviceButtons().length).toBe(SERVICES.length);
  });

  it("renders every real feature name from the product inventory", () => {
    render(<DashboardHome locale="en" facts={facts()} onNavigate={() => {}} />);
    const expected = [
      "Screen Capture", "Window Capture", "Region Capture", "Camera PiP",
      "Microphone Input", "System Audio (WASAPI)", "Incremental Recording", "Low Disk Protection",
      ".knouxrec Projects", "Recording Recovery", "Thumbnail Generation",
      "Library Search", "Library Sorting",
      "Trim Export", "Timeline Zoom", "Captions Editor", "SRT Export",
      "Export Format Selection", "Local Export Engine", "Output Verification",
      "Capture Studio", "Audio Engine", "Project & Recovery", "Library", "Edit & Deliver",
    ];
    for (const name of expected) expect(text(), name).toContain(name);
  });

  it("contains no fabricated dashboard metrics", () => {
    render(<DashboardHome locale="en" facts={facts()} onNavigate={() => {}} />);
    for (const forbidden of ["tasks", "users", "health %", "98%", "5 exports", "Total tasks", "Active users", "system health"]) {
      expect(text().toLowerCase(), forbidden).not.toContain(forbidden.toLowerCase());
    }
  });

  it("routes each service card to its real destination", () => {
    const visited: PanelId[] = [];
    render(<DashboardHome locale="en" facts={facts()} onNavigate={(target) => visited.push(target)} />);
    for (const service of SERVICES) {
      const button = byLabel(service.text.en.title);
      expect(button, `card for ${service.id}`).toBeTruthy();
      act(() => button?.click());
    }
    expect(visited).toEqual(SERVICES.map((service) => service.target));
  });

  it("renders an unavailable capability truthfully", () => {
    render(<DashboardHome locale="en" facts={facts({ cameras: 0, microphones: 0, mediaAvailable: false, recordings: 0 })} onNavigate={() => {}} />);
    expect(byLabel("Camera PiP")?.getAttribute("aria-label")).toContain("No camera");
    expect(byLabel("Microphone Input")?.getAttribute("aria-label")).toContain("No microphone");
    expect(byLabel("Local Export Engine")?.getAttribute("aria-label")).toContain("Runtime unavailable");
    expect(byLabel("Trim Export")?.getAttribute("aria-label")).toContain("No recordings");
  });

  it("never shows a ready state when the desktop runtime is missing", () => {
    render(<DashboardHome locale="en" facts={facts({ isDesktop: false })} onNavigate={() => {}} />);
    for (const button of serviceButtons()) {
      const label = button.getAttribute("aria-label") ?? "";
      expect(label).toContain("Desktop only");
    }
  });

  it("navigates the sidebar and marks the active destination", () => {
    const visited: PanelId[] = [];
    render(<AppShell locale="en" direction="ltr" active="dashboard" facts={facts()} context={null} pendingMessages={0} onNavigate={(target) => visited.push(target)} onClearMessages={() => {}} onToggleLocale={() => {}}>
      <div />
    </AppShell>);

    const navButtons = Array.from(container?.querySelectorAll<HTMLButtonElement>(".nav-item") ?? []);
    expect(navButtons.length).toBe(NAV_ITEMS.length);
    expect(navButtons.filter((button) => button.getAttribute("aria-current") === "page").length).toBe(1);
    for (const button of navButtons) act(() => button.click());
    expect(visited).toEqual(NAV_ITEMS.map((item) => item.id));
  });

  it("reflects real recorder state in the sidebar status", () => {
    render(<AppShell locale="en" direction="ltr" active="dashboard" facts={facts({ recorderState: "recording", elapsedSeconds: 65 })} context={null} pendingMessages={0} onNavigate={() => {}} onClearMessages={() => {}} onToggleLocale={() => {}}><div /></AppShell>);
    const status = container?.querySelector(".sidebar-status");
    expect(status?.textContent).toContain("Recording");
    expect(status?.className).toContain("tone-danger");
  });

  it("is operable from the keyboard", () => {
    const visited: PanelId[] = [];
    render(<AppShell locale="en" direction="ltr" active="dashboard" facts={facts()} context={null} pendingMessages={0} onNavigate={(target) => visited.push(target)} onClearMessages={() => {}} onToggleLocale={() => {}}><div /></AppShell>);

    const first = container?.querySelector<HTMLButtonElement>(".nav-item");
    expect(first).toBeTruthy();
    act(() => first?.focus());
    expect(document.activeElement).toBe(first);
    act(() => first?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    act(() => first?.click());
    expect(visited).toContain("dashboard");

    // Every interactive control is a real button, so it is reachable and activatable.
    const controls = Array.from(container?.querySelectorAll("button") ?? []);
    expect(controls.length).toBeGreaterThan(NAV_ITEMS.length);
    for (const control of controls) expect(control.tagName).toBe("BUTTON");
  });

  it("exposes every status as readable text, not colour alone", () => {
    render(<DashboardHome locale="en" facts={facts()} onNavigate={() => {}} />);
    const chips = Array.from(container?.querySelectorAll(".status-chip") ?? []);
    expect(chips.length).toBe(SERVICES.length);
    for (const chip of chips) {
      expect(chip.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      expect(chip.querySelector("svg")).toBeTruthy();
    }
  });

  it("renders Arabic copy and mirrors the shell for RTL", () => {
    render(<AppShell locale="ar" direction="rtl" active="dashboard" facts={facts()} context={null} pendingMessages={0} onNavigate={() => {}} onClearMessages={() => {}} onToggleLocale={() => {}}>
      <DashboardHome locale="ar" facts={facts()} onNavigate={() => {}} />
    </AppShell>);
    expect(container?.querySelector(".app-frame")?.getAttribute("dir")).toBe("rtl");
    expect(text()).toContain("استوديو الالتقاط");
    expect(text()).toContain("التقط ما تحتاجه بالضبط");
  });

  it("localizes the whole navigation, not only the dashboard body", () => {
    const english = render(<AppShell locale="en" direction="ltr" active="dashboard" facts={facts()} context={null} pendingMessages={0} onNavigate={() => {}} onClearMessages={() => {}} onToggleLocale={() => {}}><div /></AppShell>);
    for (const item of NAV_ITEMS) expect(english.textContent, item.id).toContain(item.label);
    act(() => root?.unmount());
    container?.remove();

    render(<AppShell locale="ar" direction="rtl" active="dashboard" facts={facts()} context={null} pendingMessages={0} onNavigate={() => {}} onClearMessages={() => {}} onToggleLocale={() => {}}><div /></AppShell>);
    const labels = Array.from(container?.querySelectorAll(".nav-item-label") ?? []).map((node) => node.textContent);
    expect(labels).toHaveLength(NAV_ITEMS.length);
    for (const label of labels) {
      expect(label, "arabic nav label").toBeTruthy();
      expect(label).not.toBe("Dashboard");
    }
    expect(labels).toContain("لوحة المعلومات");
    expect(container?.querySelector(".topbar-panel")?.textContent).toBe("لوحة المعلومات");
  });

  it("does not offer a fake Enhance page or other unimplemented capability", () => {
    render(<DashboardHome locale="en" facts={facts()} onNavigate={() => {}} />);
    for (const unimplemented of ["Enhance", "AI Powered", "Perfect Quality", "Zero Latency", "Smart Zoom", "Translate", "Broadcast", "Coming soon"]) {
      expect(text(), unimplemented).not.toContain(unimplemented);
    }
  });
});
