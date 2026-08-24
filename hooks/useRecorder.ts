import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioOutputDevice, CaptureSource, NativeAudioCapture, RecordingRecord, RecordingSession, RecordingState, RegionSelection } from "../desktop/contracts";
import { screenshotService, type ScreenshotOptions, type ScreenshotResult } from "../services/screenshotService";

export type RecordingQuality = "720p" | "1080p" | "1440p" | "4k";

interface QualityPreset {
  width: number;
  height: number;
  bitRate: number;
  frameRate: 30 | 60;
}

const QUALITY: Record<RecordingQuality, QualityPreset> = {
  "720p": { width: 1280, height: 720, bitRate: 3_000_000, frameRate: 30 },
  "1080p": { width: 1920, height: 1080, bitRate: 6_000_000, frameRate: 30 },
  "1440p": { width: 2560, height: 1440, bitRate: 12_000_000, frameRate: 60 },
  "4k": { width: 3840, height: 2160, bitRate: 22_000_000, frameRate: 60 },
};

export interface RecorderState {
  status: RecordingState;
  recordingTime: number;
  error: string | null;
  isInitialized: boolean;
  isDesktop: boolean;
  sources: CaptureSource[];
  selectedSourceId: string | null;
  regionSelection: RegionSelection | null;
  devices: MediaDeviceInfo[];
  currentDevice: string | null;
  recordingQuality: RecordingQuality;
  includeSystemAudio: boolean;
  includeMicrophone: boolean;
  includeCamera: boolean;
  audioOutputDevices: AudioOutputDevice[];
  selectedAudioOutputId: string | null;
  nativeAudioCapture: NativeAudioCapture | null;
  frameRate: 30 | 60;
  bitRate: number;
  bytesWritten: number;
  chunksWritten: number;
  lastRecording: RecordingRecord | null;
}

export interface RecorderActions {
  initialize: () => Promise<void>;
  refreshSources: () => Promise<void>;
  selectSource: (sourceId: string | null) => void;
  selectRegion: () => Promise<void>;
  clearRegion: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  setRecordingQuality: (quality: RecordingQuality) => void;
  setIncludeSystemAudio: (include: boolean) => void;
  setIncludeMicrophone: (include: boolean) => void;
  setIncludeCamera: (include: boolean) => void;
  refreshAudioOutputs: () => Promise<void>;
  setAudioOutput: (deviceId: string | null) => void;
  setDevice: (deviceId: string) => void;
  setFrameRate: (fps: 30 | 60) => void;
  takeScreenshot: (options?: ScreenshotOptions) => Promise<ScreenshotResult>;
  revealLastRecording: () => Promise<void>;
  openLastRecording: () => Promise<void>;
  clearError: () => void;
}

export interface UseRecorderReturn {
  state: RecorderState;
  actions: RecorderActions;
}

interface ActiveDesktopSession {
  desktopSession: RecordingSession | null;
  nativeAudioSessionId: string | null;
  fallbackChunks: Blob[];
}

function chooseMimeType(): string | undefined {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

function recordingName() {
  return `KNOuX REC ${new Date().toISOString().replace("T", " ").replace(/[.:]/g, "-").slice(0, 19)}`;
}

function electronDesktopConstraints(sourceId: string, preset: QualityPreset, frameRate: number, withAudio: boolean): MediaStreamConstraints {
  const desktopMandatory = {
    chromeMediaSource: "desktop",
    chromeMediaSourceId: sourceId,
    maxWidth: preset.width,
    maxHeight: preset.height,
    maxFrameRate: frameRate,
  };
  return {
    video: { mandatory: desktopMandatory },
    audio: withAudio ? { mandatory: desktopMandatory } : false,
  } as unknown as MediaStreamConstraints;
}

function getVideoDimensions(stream: MediaStream): { width: number | null; height: number | null } {
  const settings = stream.getVideoTracks()[0]?.getSettings();
  return { width: settings?.width ?? null, height: settings?.height ?? null };
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>({
    status: "idle",
    recordingTime: 0,
    error: null,
    isInitialized: false,
    isDesktop: Boolean(window.knouxRec),
    sources: [],
    selectedSourceId: null,
    regionSelection: null,
    devices: [],
    currentDevice: null,
    recordingQuality: "1080p",
    includeSystemAudio: false,
    includeMicrophone: false,
    includeCamera: false,
    audioOutputDevices: [],
    selectedAudioOutputId: null,
    nativeAudioCapture: null,
    frameRate: 30,
    bitRate: QUALITY["1080p"].bitRate,
    bytesWritten: 0,
    chunksWritten: 0,
    lastRecording: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const captureStreamRef = useRef<MediaStream | null>(null);
  const sourceCaptureStreamRef = useRef<MediaStream | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const regionCompositorFrameRef = useRef<number | null>(null);
  const cameraCompositorFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const activeSessionRef = useRef<ActiveDesktopSession | null>(null);
  const pendingWriteRef = useRef<Promise<void>>(Promise.resolve());
  const completionRef = useRef<Promise<void> | null>(null);
  const completeRef = useRef<(() => void) | null>(null);
  const failRef = useRef<((reason: Error) => void) | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    if (regionCompositorFrameRef.current !== null) cancelAnimationFrame(regionCompositorFrameRef.current);
    if (cameraCompositorFrameRef.current !== null) cancelAnimationFrame(cameraCompositorFrameRef.current);
    regionCompositorFrameRef.current = null;
    cameraCompositorFrameRef.current = null;
    captureStreamRef.current?.getTracks().forEach((track) => track.stop());
    sourceCaptureStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    captureStreamRef.current = null;
    sourceCaptureStreamRef.current = null;
    microphoneStreamRef.current = null;
    cameraStreamRef.current = null;
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") void audioContext.close();
  }, []);

  const elapsedSeconds = useCallback(() => {
    if (!startedAtRef.current) return 0;
    const activePauseMs = pausedAtRef.current === null ? 0 : Date.now() - pausedAtRef.current;
    return Math.max(0, Math.floor((Date.now() - startedAtRef.current - totalPausedMsRef.current - activePauseMs) / 1000));
  }, []);

  const syncTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setState((previous) => ({ ...previous, recordingTime: elapsedSeconds() }));
    }, 250);
  }, [clearTimer, elapsedSeconds]);

  const refreshSources = useCallback(async () => {
    const desktop = window.knouxRec;
    if (!desktop) return;
    const sources = await desktop.capture.listSources({ includeWindows: true, thumbnailWidth: 480, thumbnailHeight: 270 });
    setState((previous) => ({
      ...previous,
      sources,
      selectedSourceId: sources.some((source) => source.id === previous.selectedSourceId)
        ? previous.selectedSourceId
        : sources.find((source) => source.kind === "screen")?.id ?? sources[0]?.id ?? null,
    }));
  }, []);

  const selectRegion = useCallback(async () => {
    try {
      const desktop = window.knouxRec;
      if (!desktop) throw new Error("Region recording is available only in the Windows desktop application.");
      const regionSelection = await desktop.region.select();
      setState((previous) => {
        const matchingDisplay = previous.sources.find((source) => source.kind === "screen" && source.displayId === regionSelection.displayId);
        if (!matchingDisplay) {
          return { ...previous, error: "The selected display is no longer available for recording." };
        }
        return { ...previous, regionSelection, selectedSourceId: matchingDisplay.id, error: null };
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        error: error instanceof Error ? error.message : "Region selection failed.",
      }));
    }
  }, []);

  const refreshAudioOutputs = useCallback(async () => {
    if (!window.knouxRec) return;
    const audioOutputDevices = await window.knouxRec.audio.listOutputDevices();
    setState((previous) => ({
      ...previous,
      audioOutputDevices,
      selectedAudioOutputId: audioOutputDevices.some((device) => device.id === previous.selectedAudioOutputId)
        ? previous.selectedAudioOutputId
        : audioOutputDevices.find((device) => device.isDefault)?.id ?? audioOutputDevices[0]?.id ?? null,
    }));
  }, []);

  const initialize = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
        throw new Error("This runtime does not provide the Web Media APIs required for recording.");
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      if (window.knouxRec) await Promise.all([refreshSources(), refreshAudioOutputs()]);
      setState((previous) => ({
        ...previous,
        isInitialized: true,
        devices: cameras,
        currentDevice: previous.currentDevice ?? cameras[0]?.deviceId ?? null,
        error: null,
      }));
    } catch (error) {
      setState((previous) => ({
        ...previous,
        isInitialized: false,
        error: error instanceof Error ? error.message : "Recorder initialization failed.",
      }));
    }
  }, [refreshAudioOutputs, refreshSources]);

  const attachMicrophone = useCallback(async (baseStream: MediaStream): Promise<MediaStream> => {
    if (!stateRef.current.includeMicrophone) return baseStream;
    const microphone = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    microphoneStreamRef.current = microphone;
    const microphoneTrack = microphone.getAudioTracks()[0];
    if (!microphoneTrack) throw new Error("Microphone was requested but no input track was available.");

    const existingAudioTracks = baseStream.getAudioTracks();
    if (!existingAudioTracks.length) {
      baseStream.addTrack(microphoneTrack);
      return baseStream;
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const destination = audioContext.createMediaStreamDestination();
    audioContext.createMediaStreamSource(new MediaStream(existingAudioTracks)).connect(destination);
    audioContext.createMediaStreamSource(microphone).connect(destination);
    existingAudioTracks.forEach((track) => baseStream.removeTrack(track));
    const mixedTrack = destination.stream.getAudioTracks()[0];
    if (!mixedTrack) throw new Error("Audio mixing failed to produce an output track.");
    baseStream.addTrack(mixedTrack);
    return baseStream;
  }, []);

  const composeRegion = useCallback(async (baseStream: MediaStream): Promise<MediaStream> => {
    const region = stateRef.current.regionSelection;
    if (!region) return baseStream;
    const settings = baseStream.getVideoTracks()[0]?.getSettings();
    const displayWidth = region.displayPhysicalBounds.width;
    const displayHeight = region.displayPhysicalBounds.height;
    if (!settings.width || !settings.height || displayWidth <= 0 || displayHeight <= 0) throw new Error("The selected display did not expose capture dimensions for region recording.");
    const ratioX = settings.width / displayWidth;
    const ratioY = settings.height / displayHeight;
    const sourceX = Math.round((region.physicalBounds.x - region.displayPhysicalBounds.x) * ratioX);
    const sourceY = Math.round((region.physicalBounds.y - region.displayPhysicalBounds.y) * ratioY);
    const sourceWidth = Math.round(region.physicalBounds.width * ratioX);
    const sourceHeight = Math.round(region.physicalBounds.height * ratioY);
    if (sourceX < 0 || sourceY < 0 || sourceWidth < 1 || sourceHeight < 1 || sourceX + sourceWidth > settings.width + 1 || sourceY + sourceHeight > settings.height + 1) {
      throw new Error("The region could not be mapped safely to the captured display.");
    }
    const input = document.createElement("video");
    input.muted = true;
    input.playsInline = true;
    input.srcObject = baseStream;
    await input.play();
    const canvas = document.createElement("canvas");
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The region compositor could not create a canvas context.");
    const draw = () => {
      context.drawImage(input, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      regionCompositorFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    const cropped = canvas.captureStream(stateRef.current.frameRate);
    baseStream.getAudioTracks().forEach((track) => cropped.addTrack(track));
    return cropped;
  }, []);

  const composeCamera = useCallback(async (baseStream: MediaStream): Promise<MediaStream> => {
    const snapshot = stateRef.current;
    if (!snapshot.includeCamera) return baseStream;
    const camera = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: snapshot.currentDevice ? { exact: snapshot.currentDevice } : undefined, frameRate: { ideal: snapshot.frameRate } },
      audio: false,
    });
    cameraStreamRef.current = camera;
    const sourceSettings = baseStream.getVideoTracks()[0]?.getSettings();
    const width = sourceSettings?.width ?? QUALITY[snapshot.recordingQuality].width;
    const height = sourceSettings?.height ?? QUALITY[snapshot.recordingQuality].height;
    const screenVideo = document.createElement("video");
    const cameraVideo = document.createElement("video");
    screenVideo.muted = true;
    cameraVideo.muted = true;
    screenVideo.playsInline = true;
    cameraVideo.playsInline = true;
    screenVideo.srcObject = baseStream;
    cameraVideo.srcObject = camera;
    await Promise.all([screenVideo.play(), cameraVideo.play()]);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The camera compositor could not create a canvas context.");
    const pipWidth = Math.max(160, Math.round(width * 0.22));
    const pipHeight = Math.max(90, Math.round(pipWidth * 9 / 16));
    const inset = Math.max(16, Math.round(width * 0.025));
    const draw = () => {
      context.drawImage(screenVideo, 0, 0, width, height);
      context.save();
      context.beginPath();
      const x = width - pipWidth - inset;
      const y = height - pipHeight - inset;
      const radius = Math.max(10, Math.round(pipWidth * 0.08));
      context.moveTo(x + radius, y);
      context.arcTo(x + pipWidth, y, x + pipWidth, y + pipHeight, radius);
      context.arcTo(x + pipWidth, y + pipHeight, x, y + pipHeight, radius);
      context.arcTo(x, y + pipHeight, x, y, radius);
      context.arcTo(x, y, x + pipWidth, y, radius);
      context.closePath();
      context.clip();
      context.drawImage(cameraVideo, x, y, pipWidth, pipHeight);
      context.restore();
      context.strokeStyle = "rgba(255,255,255,0.85)";
      context.lineWidth = Math.max(2, Math.round(width * 0.002));
      context.stroke();
      cameraCompositorFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    const composite = canvas.captureStream(snapshot.frameRate);
    baseStream.getAudioTracks().forEach((track) => composite.addTrack(track));
    return composite;
  }, []);

  const createCaptureStream = useCallback(async (): Promise<MediaStream> => {
    const snapshot = stateRef.current;
    const preset = QUALITY[snapshot.recordingQuality];
    const desktop = window.knouxRec;
    let stream: MediaStream;
    if (desktop && snapshot.selectedSourceId) {
      stream = await navigator.mediaDevices.getUserMedia(
        electronDesktopConstraints(snapshot.selectedSourceId, preset, snapshot.frameRate, false),
      );
    } else {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: preset.width }, height: { ideal: preset.height }, frameRate: { ideal: snapshot.frameRate } },
        audio: snapshot.includeSystemAudio,
      });
    }
    if (!desktop && snapshot.includeSystemAudio && stream.getAudioTracks().length === 0) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("System audio was requested, but the selected capture source did not expose an audio track. Turn off System Audio or choose a compatible source.");
    }
    const withMicrophone = await attachMicrophone(stream);
    sourceCaptureStreamRef.current = withMicrophone;
    const cropped = await composeRegion(withMicrophone);
    return composeCamera(cropped);
  }, [attachMicrophone, composeCamera, composeRegion]);

  const finalize = useCallback(async () => {
    const active = activeSessionRef.current;
    const recorder = mediaRecorderRef.current;
    const stream = captureStreamRef.current;
    try {
      await pendingWriteRef.current;
      const durationMs = Math.max(0, Math.round((elapsedSeconds()) * 1000));
      if (active?.desktopSession && window.knouxRec) {
        const dimensions = stream ? getVideoDimensions(stream) : { width: null, height: null };
        if (active.nativeAudioSessionId) {
          const nativeAudio = await window.knouxRec.audio.stopNativeSystemAudio(active.nativeAudioSessionId);
          await window.knouxRec.recording.attachNativeAudio(active.desktopSession.id, nativeAudio);
        }
        const record = await window.knouxRec.recording.finishFile({
          id: active.desktopSession.id,
          durationMs,
          frameCount: null,
          droppedFrames: null,
        });
        setState((previous) => ({
          ...previous,
          status: "idle",
          recordingTime: Math.floor(record.durationMs / 1000),
          lastRecording: record,
          error: null,
          bytesWritten: record.sizeBytes,
          chunksWritten: previous.chunksWritten,
        }));
        void dimensions;
      } else if (active && recorder) {
        const blob = new Blob(active.fallbackChunks, { type: recorder.mimeType || "video/webm" });
        if (!blob.size) throw new Error("No media data was produced.");
        const downloadUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = downloadUrl;
        anchor.download = `${recordingName()}.webm`;
        anchor.click();
        URL.revokeObjectURL(downloadUrl);
        setState((previous) => ({ ...previous, status: "idle", recordingTime: elapsedSeconds(), error: null }));
      }
    } catch (error) {
      if (active?.desktopSession && window.knouxRec) {
        try {
          await window.knouxRec.recording.cancelFile(active.desktopSession.id);
        } catch {
          // The original failure is the actionable error.
        }
      }
      setState((previous) => ({
        ...previous,
        status: "failed",
        error: error instanceof Error ? error.message : "The recording could not be finalized safely.",
      }));
    } finally {
      clearTimer();
      stopTracks();
      activeSessionRef.current = null;
      mediaRecorderRef.current = null;
      completeRef.current?.();
      completeRef.current = null;
      failRef.current = null;
    }
  }, [clearTimer, elapsedSeconds, stopTracks]);

  const beginSession = useCallback(async (stream: MediaStream) => {
    const snapshot = stateRef.current;
    const mimeType = chooseMimeType();
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: snapshot.bitRate,
      audioBitsPerSecond: 160_000,
    });
    const dimensions = getVideoDimensions(stream);
    const desktopSession = window.knouxRec
      ? await window.knouxRec.recording.startFile({
          suggestedName: recordingName(),
          mimeType: recorder.mimeType || mimeType || "video/webm",
          sourceId: snapshot.selectedSourceId,
          hasSystemAudio: false,
          hasMicrophone: snapshot.includeMicrophone,
          frameRate: snapshot.frameRate,
          width: dimensions.width,
          height: dimensions.height,
        })
      : null;
    let nativeAudioSessionId: string | null = null;
    if (desktopSession && snapshot.includeSystemAudio && window.knouxRec) {
      try {
        const nativeAudio = await window.knouxRec.audio.startNativeSystemAudio(snapshot.selectedAudioOutputId);
        nativeAudioSessionId = nativeAudio.id;
        setState((previous) => ({ ...previous, nativeAudioCapture: nativeAudio }));
      } catch (error) {
        await window.knouxRec.recording.cancelFile(desktopSession.id);
        throw error;
      }
    }

    captureStreamRef.current = stream;
    mediaRecorderRef.current = recorder;
    activeSessionRef.current = { desktopSession, nativeAudioSessionId, fallbackChunks: [] };
    pendingWriteRef.current = Promise.resolve();
    completionRef.current = new Promise<void>((resolve, reject) => {
      completeRef.current = resolve;
      failRef.current = reject;
    });
    startedAtRef.current = Date.now();
    pausedAtRef.current = null;
    totalPausedMsRef.current = 0;

    recorder.addEventListener("dataavailable", (event) => {
      if (!event.data.size) return;
      const active = activeSessionRef.current;
      if (!active) return;
      if (active.desktopSession && window.knouxRec) {
        const desktopSessionId = active.desktopSession.id;
        pendingWriteRef.current = pendingWriteRef.current
          .then(async () => {
            const bytes = await event.data.arrayBuffer();
            await window.knouxRec?.recording.appendChunk(desktopSessionId, bytes);
            setState((previous) => ({
              ...previous,
              bytesWritten: previous.bytesWritten + bytes.byteLength,
              chunksWritten: previous.chunksWritten + 1,
            }));
          })
          .catch((error) => {
            const failure = error instanceof Error ? error : new Error("Unable to write a recording chunk.");
            failRef.current?.(failure);
            if (recorder.state !== "inactive") recorder.stop();
            throw failure;
          });
      } else {
        active.fallbackChunks.push(event.data);
        setState((previous) => ({
          ...previous,
          bytesWritten: previous.bytesWritten + event.data.size,
          chunksWritten: previous.chunksWritten + 1,
        }));
      }
    });

    recorder.addEventListener("stop", () => {
      void finalize();
    });
    recorder.addEventListener("error", () => {
      setState((previous) => ({ ...previous, error: "The media recorder reported an unrecoverable error." }));
    });
    stream.getVideoTracks()[0]?.addEventListener("ended", () => {
      if (recorder.state !== "inactive") recorder.stop();
    }, { once: true });

    recorder.start(1000);
    syncTimer();
    setState((previous) => ({
      ...previous,
      status: "recording",
      recordingTime: 0,
      bytesWritten: 0,
      chunksWritten: 0,
      error: null,
      lastRecording: null,
    }));
  }, [finalize, syncTimer]);

  const startRecording = useCallback(async () => {
    if (stateRef.current.status !== "idle" && stateRef.current.status !== "failed") return;
    try {
      setState((previous) => ({ ...previous, error: null, status: "idle" }));
      const stream = await createCaptureStream();
      await beginSession(stream);
    } catch (error) {
      stopTracks();
      setState((previous) => ({
        ...previous,
        status: "failed",
        error: error instanceof Error ? error.message : "Recording could not start.",
      }));
    }
  }, [beginSession, createCaptureStream, stopTracks]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    setState((previous) => ({ ...previous, status: "finalizing" }));
    recorder.stop();
    try {
      await completionRef.current;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        status: "failed",
        error: error instanceof Error ? error.message : "Unable to write a recording chunk.",
      }));
    }
  }, []);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    pausedAtRef.current = Date.now();
    setState((previous) => ({ ...previous, status: "paused" }));
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    if (pausedAtRef.current !== null) totalPausedMsRef.current += Date.now() - pausedAtRef.current;
    pausedAtRef.current = null;
    setState((previous) => ({ ...previous, status: "recording" }));
  }, []);

  const setRecordingQuality = useCallback((recordingQuality: RecordingQuality) => {
    const preset = QUALITY[recordingQuality];
    setState((previous) => ({
      ...previous,
      recordingQuality,
      bitRate: preset.bitRate,
      frameRate: preset.frameRate,
    }));
  }, []);

  const takeScreenshot = useCallback(async (options?: ScreenshotOptions) => screenshotService.captureScreenshot(options), []);

  const revealLastRecording = useCallback(async () => {
    if (!stateRef.current.lastRecording || !window.knouxRec) return;
    await window.knouxRec.recording.reveal(stateRef.current.lastRecording.id);
  }, []);

  const openLastRecording = useCallback(async () => {
    if (!stateRef.current.lastRecording || !window.knouxRec) return;
    await window.knouxRec.recording.open(stateRef.current.lastRecording.id);
  }, []);

  useEffect(() => {
    void initialize();
    return () => {
      clearTimer();
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      stopTracks();
      screenshotService.cleanup();
    };
  }, [clearTimer, initialize, stopTracks]);

  useEffect(() => {
    if (!window.knouxRec) return;
    return window.knouxRec.events.onToggleRequested(() => {
      const current = stateRef.current.status;
      if (current === "recording" || current === "paused") {
        void stopRecording();
      } else if (current === "idle" || current === "failed") {
        void startRecording();
      }
    });
  }, [startRecording, stopRecording]);

  return useMemo(() => ({
    state,
    actions: {
      initialize,
      refreshSources,
      selectSource: (selectedSourceId) => setState((previous) => ({ ...previous, selectedSourceId, regionSelection: null })),
      selectRegion,
      clearRegion: () => setState((previous) => ({ ...previous, regionSelection: null })),
    startRecording,
    stopRecording,
      pauseRecording,
      resumeRecording,
      setRecordingQuality,
      setIncludeSystemAudio: (includeSystemAudio) => setState((previous) => ({ ...previous, includeSystemAudio })),
    setIncludeMicrophone: (includeMicrophone) => setState((previous) => ({ ...previous, includeMicrophone })),
    setIncludeCamera: (includeCamera) => setState((previous) => ({ ...previous, includeCamera })),
    refreshAudioOutputs,
    setAudioOutput: (selectedAudioOutputId) => setState((previous) => ({ ...previous, selectedAudioOutputId })),
    setDevice: (currentDevice) => setState((previous) => ({ ...previous, currentDevice })),
      setFrameRate: (frameRate) => setState((previous) => ({ ...previous, frameRate })),
      takeScreenshot,
      revealLastRecording,
      openLastRecording,
      clearError: () => setState((previous) => ({ ...previous, error: null, status: previous.status === "failed" ? "idle" : previous.status })),
    },
  }), [
    initialize,
    openLastRecording,
    pauseRecording,
    refreshAudioOutputs,
    refreshSources,
    resumeRecording,
    selectRegion,
    revealLastRecording,
    setRecordingQuality,
    startRecording,
    state,
    stopRecording,
    takeScreenshot,
  ]);
}
