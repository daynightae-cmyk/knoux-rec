import type { NativeAudioCaptureState, RecordingState } from "../../desktop/contracts";
import { MIN_FREE_RECORDING_BYTES } from "../../desktop/contracts";

/*
 * Capability facts and status vocabulary.
 *
 * The dashboard never stores its own readiness. Every value below is derived from real
 * recorder state, real desktop IPC results or real local filesystem measurements, so a
 * status can always be traced back to the source that produced it.
 *
 * A status is a single key. Its colour, its label and its explanation all come from
 * `STATUS_META` and the localized template table, so a chip can never show a colour that
 * disagrees with the sentence next to it.
 *
 * The free-space reserve is imported from the shared contract rather than restated, so
 * the shell can never disagree with the guard desktop/main.cjs actually enforces.
 */

export type StatusTone = "success" | "active" | "warning" | "danger" | "blocked" | "neutral";

export { MIN_FREE_RECORDING_BYTES };

export type StatusKey =
  | "ready"
  | "starting"
  | "recording"
  | "paused"
  | "finalizing"
  | "needsAttention"
  | "runtimeUnavailable"
  | "limited"
  | "recoveryAvailable"
  | "desktopOnly"
  | "noDisplaySource"
  | "noWindowSource"
  | "displaySources"
  | "windowSources"
  | "regionSet"
  | "regionAvailable"
  | "noCamera"
  | "cameraActive"
  | "camerasDetected"
  | "noMicrophone"
  | "microphoneActive"
  | "microphonesDetected"
  | "helperUnavailable"
  | "wasapiFailed"
  | "wasapiRecording"
  | "wasapiEnabled"
  | "wasapiDevices"
  | "noOutputDevice"
  | "incrementalActive"
  | "incrementalProtected"
  | "storageUnavailable"
  | "storageUnknown"
  | "lowStorage"
  | "protected"
  | "noRecordings"
  | "projectOpen"
  | "projectLocal"
  | "recoveryBlocked"
  | "noRecovery"
  | "thumbnailsReady"
  | "thumbnailsNoSource"
  | "localSearch"
  | "localSorting"
  | "editorAvailable"
  | "captionsAvailable"
  | "noCaptions"
  | "captionsReady"
  | "formatsAvailable"
  | "mediaChecking"
  | "mediaAvailable"
  | "mediaUnavailable"
  | "outputVerified"
  | "outputVerificationUnavailable";

type StatusMeta = { tone: StatusTone; slots: number };

/**
 * Central status table. `slots` is the number of `{0}`/`{1}` placeholders the localized
 * template may use, which the test suite cross-checks against the copy table.
 */
export const STATUS_META: Record<StatusKey, StatusMeta> = {
  ready: { tone: "success", slots: 0 },
  starting: { tone: "warning", slots: 0 },
  recording: { tone: "danger", slots: 0 },
  paused: { tone: "warning", slots: 0 },
  finalizing: { tone: "active", slots: 0 },
  needsAttention: { tone: "danger", slots: 0 },
  runtimeUnavailable: { tone: "blocked", slots: 0 },
  limited: { tone: "warning", slots: 0 },
  recoveryAvailable: { tone: "warning", slots: 1 },
  desktopOnly: { tone: "blocked", slots: 0 },
  noDisplaySource: { tone: "warning", slots: 0 },
  noWindowSource: { tone: "warning", slots: 0 },
  displaySources: { tone: "success", slots: 1 },
  windowSources: { tone: "success", slots: 1 },
  regionSet: { tone: "active", slots: 1 },
  regionAvailable: { tone: "success", slots: 0 },
  noCamera: { tone: "warning", slots: 0 },
  cameraActive: { tone: "active", slots: 0 },
  camerasDetected: { tone: "success", slots: 1 },
  noMicrophone: { tone: "warning", slots: 0 },
  microphoneActive: { tone: "active", slots: 0 },
  microphonesDetected: { tone: "success", slots: 1 },
  helperUnavailable: { tone: "danger", slots: 0 },
  wasapiFailed: { tone: "danger", slots: 0 },
  wasapiRecording: { tone: "active", slots: 0 },
  wasapiEnabled: { tone: "active", slots: 0 },
  wasapiDevices: { tone: "success", slots: 1 },
  noOutputDevice: { tone: "warning", slots: 0 },
  incrementalActive: { tone: "active", slots: 1 },
  incrementalProtected: { tone: "success", slots: 0 },
  storageUnavailable: { tone: "danger", slots: 0 },
  storageUnknown: { tone: "blocked", slots: 0 },
  lowStorage: { tone: "warning", slots: 0 },
  protected: { tone: "success", slots: 0 },
  noRecordings: { tone: "neutral", slots: 0 },
  projectOpen: { tone: "active", slots: 0 },
  projectLocal: { tone: "success", slots: 0 },
  recoveryBlocked: { tone: "neutral", slots: 1 },
  noRecovery: { tone: "success", slots: 0 },
  thumbnailsReady: { tone: "success", slots: 1 },
  thumbnailsNoSource: { tone: "neutral", slots: 0 },
  localSearch: { tone: "success", slots: 0 },
  localSorting: { tone: "success", slots: 0 },
  editorAvailable: { tone: "success", slots: 0 },
  captionsAvailable: { tone: "success", slots: 0 },
  noCaptions: { tone: "neutral", slots: 0 },
  captionsReady: { tone: "success", slots: 1 },
  formatsAvailable: { tone: "success", slots: 0 },
  mediaChecking: { tone: "neutral", slots: 0 },
  mediaAvailable: { tone: "success", slots: 0 },
  mediaUnavailable: { tone: "blocked", slots: 0 },
  outputVerified: { tone: "success", slots: 0 },
  outputVerificationUnavailable: { tone: "blocked", slots: 0 },
};

export type CapabilityFacts = {
  isDesktop: boolean;
  isInitialized: boolean;
  recorderState: RecordingState;
  error: string | null;
  /** Real elapsed session time in seconds, as reported by the recorder. */
  elapsedSeconds: number;
  /** Real name of the selected capture source, or null when nothing is selected. */
  selectedSourceLabel: string | null;
  screenSources: number;
  windowSources: number;
  regionSelected: boolean;
  regionLabel: string | null;
  cameras: number;
  cameraEnabled: boolean;
  microphones: number;
  microphoneEnabled: boolean;
  systemAudioEnabled: boolean;
  audioOutputDevices: number;
  audioHelperError: string | null;
  nativeAudioState: NativeAudioCaptureState | null;
  chunksWritten: number;
  freeBytes: number | null;
  storageWritable: boolean | null;
  recordings: number;
  thumbnailedRecordings: number;
  recoverySessions: number;
  recoverableSessions: number;
  projectOpen: boolean;
  captionSegments: number;
  mediaAvailable: boolean | null;
  mediaVersion: string | null;
};

/** A resolved status: a key from the central table, its interpolated values and an optional real runtime message. */
export type ResolvedStatus = { key: StatusKey; values?: (string | number)[]; detail?: string };

export function toneOf(status: ResolvedStatus): StatusTone {
  return STATUS_META[status.key].tone;
}

const desktopOnlyStatus = (): ResolvedStatus => ({ key: "desktopOnly" });

/* Shared resolvers. Each one reads only real state. */

export function resolveShellStatus(facts: CapabilityFacts): ResolvedStatus {
  if (facts.recorderState === "recording") return { key: "recording" };
  if (facts.recorderState === "paused") return { key: "paused" };
  if (facts.recorderState === "finalizing") return { key: "finalizing" };
  if (facts.recorderState === "failed") return { key: "needsAttention", detail: facts.error ?? undefined };
  if (!facts.isDesktop) return { key: "runtimeUnavailable" };
  if (facts.error) return { key: "needsAttention", detail: facts.error };
  if (!facts.isInitialized) return { key: "starting" };
  if (facts.storageWritable === false) return { key: "storageUnavailable" };
  if (facts.freeBytes !== null && facts.freeBytes < MIN_FREE_RECORDING_BYTES) return { key: "lowStorage" };
  if (facts.recoverableSessions > 0) return { key: "recoveryAvailable", values: [facts.recoverableSessions] };
  if (facts.mediaAvailable === false) return { key: "limited" };
  return { key: "ready" };
}

export function resolveStorageProtection(facts: CapabilityFacts): ResolvedStatus {
  // The guard is enforced by the main process, so it can only be claimed in the packaged app.
  if (!facts.isDesktop) return { key: "desktopOnly" };
  if (facts.storageWritable === false) return { key: "storageUnavailable" };
  if (facts.freeBytes === null) return { key: "storageUnknown" };
  if (facts.freeBytes < MIN_FREE_RECORDING_BYTES) return { key: "lowStorage" };
  return { key: "protected" };
}

/** Incremental disk recording has no user toggle, so its state follows the real write journal. */
export function resolveIncrementalRecording(facts: CapabilityFacts): ResolvedStatus {
  if (!facts.isDesktop) return desktopOnlyStatus();
  if ((facts.recorderState === "recording" || facts.recorderState === "paused") && facts.chunksWritten > 0) {
    return { key: "incrementalActive", values: [facts.chunksWritten] };
  }
  return { key: "incrementalProtected" };
}

export function resolveWasapi(facts: CapabilityFacts): ResolvedStatus {
  if (!facts.isDesktop) return desktopOnlyStatus();
  if (facts.audioHelperError) return { key: "helperUnavailable", detail: facts.audioHelperError };
  if (facts.nativeAudioState === "failed") return { key: "wasapiFailed" };
  if (facts.nativeAudioState === "recording") return { key: "wasapiRecording" };
  if (facts.systemAudioEnabled) return { key: "wasapiEnabled" };
  if (facts.audioOutputDevices > 0) return { key: "wasapiDevices", values: [facts.audioOutputDevices] };
  return { key: "noOutputDevice" };
}

/** Local FFmpeg/FFprobe runtime truth. `null` means the probe has not answered yet. */
export function resolveMediaRuntime(facts: CapabilityFacts, ready: StatusKey): ResolvedStatus {
  if (facts.mediaAvailable === null) return { key: "mediaChecking" };
  return { key: facts.mediaAvailable ? ready : "mediaUnavailable" };
}

export function plural(count: number, singular: string, many = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : many}`;
}
