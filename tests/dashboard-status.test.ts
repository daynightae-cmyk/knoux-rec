import { describe, expect, it } from "vitest";
import {
  MIN_FREE_RECORDING_BYTES,
  STATUS_META,
  resolveIncrementalRecording,
  resolveMediaRuntime,
  resolveShellStatus,
  resolveStorageProtection,
  resolveWasapi,
  type CapabilityFacts,
  type StatusKey,
} from "../components/dashboard/capabilities";
import { NAV_ITEMS, type PanelId } from "../components/dashboard/panels";
import { SERVICES, SERVICE_SECTIONS, STATUS_TEXT, describeStatus } from "../components/dashboard/services";

/*
 * Product-truth tests.
 *
 * These assert the rule that matters most for this screen: a service is only ever
 * described as available when the runtime facts say so, and no status text exists
 * without a localized template in both supported languages.
 */

const baseFacts = (patch: Partial<CapabilityFacts> = {}): CapabilityFacts => ({
  isDesktop: true,
  isInitialized: true,
  recorderState: "idle",
  error: null,
  elapsedSeconds: 0,
  selectedSourceLabel: null,
  screenSources: 2,
  windowSources: 4,
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
  thumbnailedRecordings: 3,
  recoverySessions: 0,
  recoverableSessions: 0,
  projectOpen: true,
  captionSegments: 4,
  mediaAvailable: true,
  mediaVersion: "7.1",
  ...patch,
});

const statusOf = (id: string, patch: Partial<CapabilityFacts> = {}) => {
  const service = SERVICES.find((entry) => entry.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return describeStatus(service.resolve(baseFacts(patch)), "en");
};

describe("dashboard status truth", () => {
  it("resolves a healthy desktop runtime to Ready", () => {
    const status = describeStatus(resolveShellStatus(baseFacts()), "en");
    expect(status.tone).toBe("success");
    expect(status.label).toBe("Ready");
  });

  it("never reports Ready outside the desktop runtime", () => {
    const browser = describeStatus(resolveShellStatus(baseFacts({ isDesktop: false })), "en");
    expect(browser.label).toBe("Runtime unavailable");
    expect(browser.tone).toBe("blocked");
    for (const service of SERVICES) {
      const label = describeStatus(service.resolve(baseFacts({ isDesktop: false })), "en").label;
      expect(label).not.toBe("Ready");
      expect(label).not.toBe("Available");
    }
  });

  it("prefers the live recording state over every other signal", () => {
    const recording = describeStatus(resolveShellStatus(baseFacts({ recorderState: "recording", error: "stale" })), "en");
    expect(recording.label).toBe("Recording");
    expect(describeStatus(resolveShellStatus(baseFacts({ recorderState: "paused" })), "en").label).toBe("Paused");
    expect(describeStatus(resolveShellStatus(baseFacts({ recorderState: "finalizing" })), "en").label).toBe("Finalizing");
  });

  it("reports a real recorder failure message instead of a generic label", () => {
    const failed = describeStatus(resolveShellStatus(baseFacts({ recorderState: "failed", error: "Recording stopped safely." })), "en");
    expect(failed.tone).toBe("danger");
    expect(failed.detail).toBe("Recording stopped safely.");
  });

  it("surfaces real recovery sessions rather than a hardcoded ready state", () => {
    const status = describeStatus(resolveShellStatus(baseFacts({ recoverySessions: 2, recoverableSessions: 1 })), "en");
    expect(status.label).toBe("Recovery");
    expect(status.detail).toContain("1");
    expect(statusOf("recording-recovery", { recoverySessions: 2, recoverableSessions: 1 }).label).toBe("Recovery");
    expect(statusOf("recording-recovery").label).toBe("None found");
  });

  it("reports a limited runtime when only the export engine is missing", () => {
    const status = describeStatus(resolveShellStatus(baseFacts({ mediaAvailable: false })), "en");
    expect(status.label).toBe("Limited");
    expect(statusOf("export-engine", { mediaAvailable: false }).label).toBe("Runtime unavailable");
    expect(statusOf("output-verification", { mediaAvailable: false }).tone).toBe("blocked");
  });

  it("distinguishes checking from unavailable for the media runtime", () => {
    expect(statusOf("export-engine", { mediaAvailable: null }).label).toBe("Checking");
    expect(describeStatus(resolveMediaRuntime(baseFacts({ mediaAvailable: null }), "mediaAvailable"), "en").label).toBe("Checking");
  });

  it("reports missing devices truthfully instead of Ready", () => {
    expect(statusOf("camera-pip", { cameras: 0 }).label).toBe("No camera");
    expect(statusOf("microphone-input", { microphones: 0 }).label).toBe("No microphone");
    expect(statusOf("screen-capture", { screenSources: 0 }).label).toBe("No display");
    expect(statusOf("window-capture", { windowSources: 0 }).label).toBe("No window");
    expect(statusOf("system-audio", { audioOutputDevices: 0 }).label).toBe("No output device");
  });

  it("reflects the real native audio helper failure", () => {
    const status = describeStatus(resolveWasapi(baseFacts({ audioHelperError: "Native WASAPI audio helper is not packaged." })), "en");
    expect(status.tone).toBe("danger");
    expect(status.label).toBe("Helper unavailable");
    expect(status.detail).toBe("Native WASAPI audio helper is not packaged.");
  });

  it("reports low storage from the real free-space measurement", () => {
    expect(describeStatus(resolveStorageProtection(baseFacts({ freeBytes: MIN_FREE_RECORDING_BYTES - 1 })), "en").label).toBe("Low storage");
    expect(describeStatus(resolveStorageProtection(baseFacts({ freeBytes: null })), "en").label).toBe("Storage unknown");
    expect(describeStatus(resolveStorageProtection(baseFacts({ storageWritable: false })), "en").tone).toBe("danger");
    expect(describeStatus(resolveStorageProtection(baseFacts()), "en").label).toBe("Protected");
  });

  it("derives incremental recording from the real write journal", () => {
    expect(describeStatus(resolveIncrementalRecording(baseFacts()), "en").label).toBe("Protected");
    const active = describeStatus(resolveIncrementalRecording(baseFacts({ recorderState: "recording", chunksWritten: 12 })), "en");
    expect(active.label).toBe("Active");
    expect(active.detail).toContain("12");
  });

  it("locks project services until a recording exists", () => {
    expect(statusOf("trim-export", { recordings: 0 }).label).toBe("No recordings");
    expect(statusOf("srt-export", { captionSegments: 0 }).label).toBe("No captions");
    expect(statusOf("thumbnail-generation", { recordings: 0 }).label).toBe("No recordings");
  });

  it("gives every status a localized template in both languages", () => {
    const keys = Object.keys(STATUS_META) as StatusKey[];
    for (const key of keys) {
      for (const locale of ["en", "ar"] as const) {
        const template = STATUS_TEXT[locale][key];
        expect(template, `${key}/${locale}`).toBeTruthy();
        expect(template.label.length, `${key}/${locale} label`).toBeGreaterThan(0);
        expect(template.detail.length, `${key}/${locale} detail`).toBeGreaterThan(0);
        const slots = (template.detail.match(/\{\d+\}/g) ?? []).map((slot) => Number(slot.slice(1, -1)));
        expect(Math.max(-1, ...slots), `${key}/${locale} slot count`).toBeLessThan(STATUS_META[key].slots + 1);
      }
    }
  });

  it("routes every service to a real navigation destination", () => {
    const panels = new Set<PanelId>(NAV_ITEMS.map((item) => item.id));
    expect(panels.size).toBe(NAV_ITEMS.length);
    for (const service of SERVICES) {
      expect(panels.has(service.target), `${service.id} -> ${service.target}`).toBe(true);
    }
  });

  it("registers every service exactly once and covers all five domains", () => {
    expect(new Set(SERVICES.map((service) => service.id)).size).toBe(SERVICES.length);
    expect(SERVICE_SECTIONS.map((section) => section.id)).toEqual(["capture", "audio", "project", "library", "deliver"]);
    const listed = SERVICE_SECTIONS.flatMap((section) => section.services.map((service) => service.id));
    expect(listed.sort()).toEqual(SERVICES.map((service) => service.id).sort());
  });

  it("uses one reserved constant for the free-space guard", () => {
    expect(MIN_FREE_RECORDING_BYTES).toBe(512 * 1024 * 1024);
  });
});
