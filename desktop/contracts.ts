export type CaptureSourceKind = "screen" | "window";

export interface CaptureSource {
  id: string;
  name: string;
  kind: CaptureSourceKind;
  thumbnailDataUrl: string;
  displayId: string;
  appIconDataUrl: string | null;
}

export interface CaptureSourceOptions {
  includeWindows?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

export type RecordingState = "idle" | "recording" | "paused" | "finalizing" | "failed";

export interface RecordingSession {
  id: string;
  startedAt: string;
  temporaryPath: string;
}

export interface StartRecordingFileInput {
  suggestedName: string;
  mimeType: string;
  sourceId: string | null;
  hasSystemAudio: boolean;
  hasMicrophone: boolean;
  frameRate: number;
  width: number | null;
  height: number | null;
}

export interface CompleteRecordingInput {
  id: string;
  durationMs: number;
  frameCount: number | null;
  droppedFrames: number | null;
}

export interface AudioOutputDevice {
  id: string;
  name: string;
  state: "Active" | "Disabled" | "NotPresent" | "Unplugged" | string;
  isDefault: boolean;
}

export type NativeAudioCaptureState = "idle" | "starting" | "recording" | "stopping" | "failed";

export interface NativeAudioCapture {
  id: string;
  state: NativeAudioCaptureState;
  deviceId: string;
  deviceName: string;
  filePath: string | null;
  fileBytes: number;
  bytesRecorded: number;
  peakPermille: number;
  sampleRate: number | null;
  channels: number | null;
  bitsPerSample: number | null;
  error: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
}

export interface RecordingRecord {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  durationMs: number;
  frameCount: number | null;
  droppedFrames: number | null;
  sourceId: string | null;
  hasSystemAudio: boolean;
  hasMicrophone: boolean;
  frameRate: number;
  width: number | null;
  height: number | null;
  nativeSystemAudio: NativeAudioCapture | null;
}

export interface RecorderSettings {
  locale: "en" | "ar";
  recordingDirectory: string;
  defaultFrameRate: 30 | 60;
  defaultQuality: "720p" | "1080p" | "1440p" | "4k";
  countdownSeconds: 0 | 3 | 5 | 10;
  openLibraryAfterSave: boolean;
}

export interface RecorderHealth {
  recordingDirectory: string;
  freeBytes: number | null;
  totalBytes: number | null;
  writable: boolean;
  platform: string;
  appVersion: string;
}

export interface RecorderDesktopApi {
  capture: {
    listSources: (options?: CaptureSourceOptions) => Promise<CaptureSource[]>;
  };
  audio: {
    listOutputDevices: () => Promise<AudioOutputDevice[]>;
    startNativeSystemAudio: (deviceId: string | null) => Promise<NativeAudioCapture>;
    stopNativeSystemAudio: (id: string) => Promise<NativeAudioCapture>;
    getNativeSystemAudio: (id: string) => Promise<NativeAudioCapture | null>;
  };
  recording: {
    startFile: (input: StartRecordingFileInput) => Promise<RecordingSession>;
    appendChunk: (id: string, bytes: ArrayBuffer) => Promise<void>;
    attachNativeAudio: (recordingId: string, capture: NativeAudioCapture) => Promise<void>;
    finishFile: (input: CompleteRecordingInput) => Promise<RecordingRecord>;
    cancelFile: (id: string) => Promise<void>;
    list: () => Promise<RecordingRecord[]>;
    reveal: (id: string) => Promise<void>;
    open: (id: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
  };
  settings: {
    get: () => Promise<RecorderSettings>;
    update: (patch: Partial<Omit<RecorderSettings, "recordingDirectory">>) => Promise<RecorderSettings>;
  };
  system: {
    health: () => Promise<RecorderHealth>;
    chooseRecordingDirectory: () => Promise<string | null>;
  };
  events: {
    onToggleRequested: (listener: () => void) => () => void;
  };
}

export interface DesktopRecordingStats {
  bytesWritten: number;
  chunksWritten: number;
}

export const MAX_RECORDING_CHUNK_BYTES = 128 * 1024 * 1024;
export const MAX_SOURCE_THUMBNAIL_WIDTH = 640;
export const MAX_SOURCE_THUMBNAIL_HEIGHT = 360;
