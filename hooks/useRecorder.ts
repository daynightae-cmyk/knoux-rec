import { useCallback, useEffect, useRef, useState } from "react";
import {
  screenshotService,
  type ScreenshotOptions,
  type ScreenshotResult,
} from "../services/screenshotService";

export type RecordingQuality = "low" | "medium" | "high" | "ultra";

export interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  recordingBlob: Blob | null;
  error: string | null;
  isInitialized: boolean;
  devices: MediaDeviceInfo[];
  currentDevice: string | null;
  recordingQuality: RecordingQuality;
  includeAudio: boolean;
  includeMicrophone: boolean;
  frameRate: number;
  bitRate: number;
}

export interface RecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  initialize: () => Promise<void>;
  setRecordingQuality: (quality: RecordingQuality) => void;
  setIncludeAudio: (include: boolean) => void;
  setIncludeMicrophone: (include: boolean) => void;
  setDevice: (deviceId: string) => void;
  setFrameRate: (fps: number) => void;
  setBitRate: (bitrate: number) => void;
  downloadRecording: () => void;
  clearRecording: () => void;
  takeScreenshot: (options?: ScreenshotOptions) => Promise<ScreenshotResult>;
  startWebcamRecording: () => Promise<void>;
}

export interface UseRecorderReturn {
  state: RecorderState;
  actions: RecorderActions;
}

const QUALITY = {
  low: { width: 1280, height: 720, bitRate: 2_500_000, frameRate: 30 },
  medium: { width: 1920, height: 1080, bitRate: 5_000_000, frameRate: 30 },
  high: { width: 2560, height: 1440, bitRate: 8_000_000, frameRate: 30 },
  ultra: { width: 3840, height: 2160, bitRate: 15_000_000, frameRate: 60 },
} satisfies Record<
  RecordingQuality,
  { width: number; height: number; bitRate: number; frameRate: number }
>;

function chooseMimeType(): string | undefined {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    recordingBlob: null,
    error: null,
    isInitialized: false,
    devices: [],
    currentDevice: null,
    recordingQuality: "medium",
    includeAudio: true,
    includeMicrophone: false,
    frameRate: 30,
    bitRate: QUALITY.medium.bitRate,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    micStreamRef.current = null;

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }
  }, []);

  const currentElapsedSeconds = useCallback(() => {
    if (!startedAtRef.current) return 0;

    const now = Date.now();
    const activePauseMs =
      pausedAtRef.current === null ? 0 : now - pausedAtRef.current;

    return Math.max(
      0,
      Math.floor(
        (now -
          startedAtRef.current -
          totalPausedMsRef.current -
          activePauseMs) /
          1000,
      ),
    );
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setState((previous) => ({
        ...previous,
        recordingTime: currentElapsedSeconds(),
      }));
    }, 250);
  }, [clearTimer, currentElapsedSeconds]);

  const initialize = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen capture is not supported by this runtime.");
      }
      if (typeof MediaRecorder === "undefined") {
        throw new Error("MediaRecorder is not supported by this runtime.");
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

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
        error: error instanceof Error ? error.message : "Initialization failed.",
      }));
    }
  }, []);

  const attachMicrophone = useCallback(
    async (baseStream: MediaStream): Promise<MediaStream> => {
      if (!state.includeMicrophone) return baseStream;

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      micStreamRef.current = micStream;

      const microphoneTracks = micStream.getAudioTracks();
      if (microphoneTracks.length === 0) {
        throw new Error("Microphone was requested but no microphone audio track was provided.");
      }

      const existingAudioTracks = baseStream.getAudioTracks();

      if (existingAudioTracks.length === 0) {
        microphoneTracks.forEach((track) => baseStream.addTrack(track));
        return baseStream;
      }

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const destination = audioContext.createMediaStreamDestination();

      const systemSource = audioContext.createMediaStreamSource(
        new MediaStream(existingAudioTracks),
      );
      const microphoneSource = audioContext.createMediaStreamSource(micStream);

      systemSource.connect(destination);
      microphoneSource.connect(destination);

      existingAudioTracks.forEach((track) => {
        baseStream.removeTrack(track);
        track.stop();
      });

      const mixedTrack = destination.stream.getAudioTracks()[0];
      if (!mixedTrack) {
        throw new Error("Failed to create the mixed audio track.");
      }

      baseStream.addTrack(mixedTrack);
      return baseStream;
    },
    [state.includeMicrophone],
  );

  const createScreenStream = useCallback(async () => {
    const preset = QUALITY[state.recordingQuality];

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: preset.width },
        height: { ideal: preset.height },
        frameRate: { ideal: state.frameRate, max: state.frameRate },
      },
      audio: state.includeAudio,
    });

    if (state.includeAudio && stream.getAudioTracks().length === 0) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error(
        "System audio was requested, but the selected source did not provide an audio track. Enable audio in the system share picker or turn System Audio off.",
      );
    }

    return attachMicrophone(stream);
  }, [
    attachMicrophone,
    state.frameRate,
    state.includeAudio,
    state.recordingQuality,
  ]);

  const createWebcamStream = useCallback(async () => {
    const preset = QUALITY[state.recordingQuality];

    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: state.currentDevice
          ? { exact: state.currentDevice }
          : undefined,
        width: { ideal: preset.width },
        height: { ideal: preset.height },
        frameRate: { ideal: state.frameRate, max: state.frameRate },
      },
      audio: state.includeMicrophone
        ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : false,
    });
  }, [
    state.currentDevice,
    state.frameRate,
    state.includeMicrophone,
    state.recordingQuality,
  ]);

  const beginSession = useCallback(
    (stream: MediaStream) => {
      const mimeType = chooseMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: state.bitRate,
        audioBitsPerSecond: 128_000,
      });

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      pausedAtRef.current = null;
      totalPausedMsRef.current = 0;

      recorder.addEventListener("dataavailable", (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });

        clearTimer();
        const duration = currentElapsedSeconds();
        stopTracks();

        mediaRecorderRef.current = null;
        setState((previous) => ({
          ...previous,
          isRecording: false,
          isPaused: false,
          recordingTime: duration,
          recordingBlob: blob.size > 0 ? blob : null,
          error: blob.size > 0 ? null : "Recording stopped, but no media data was produced.",
        }));
      });

      recorder.start(1000);
      startTimer();

      setState((previous) => ({
        ...previous,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        recordingBlob: null,
        error: null,
      }));

      const videoTrack = stream.getVideoTracks()[0];
      videoTrack?.addEventListener(
        "ended",
        () => {
          const activeRecorder = mediaRecorderRef.current;
          if (activeRecorder && activeRecorder.state !== "inactive") {
            activeRecorder.stop();
          }
        },
        { once: true },
      );
    },
    [clearTimer, currentElapsedSeconds, startTimer, state.bitRate, stopTracks],
  );

  const startRecording = useCallback(async () => {
    try {
      if (state.isRecording) return;
      setState((previous) => ({ ...previous, error: null }));
      const stream = await createScreenStream();
      beginSession(stream);
    } catch (error) {
      stopTracks();
      setState((previous) => ({
        ...previous,
        isRecording: false,
        isPaused: false,
        error: error instanceof Error ? error.message : "Could not start screen recording.",
      }));
    }
  }, [beginSession, createScreenStream, state.isRecording, stopTracks]);

  const startWebcamRecording = useCallback(async () => {
    try {
      if (state.isRecording) return;
      setState((previous) => ({ ...previous, error: null }));
      const stream = await createWebcamStream();
      beginSession(stream);
    } catch (error) {
      stopTracks();
      setState((previous) => ({
        ...previous,
        isRecording: false,
        isPaused: false,
        error: error instanceof Error ? error.message : "Could not start camera recording.",
      }));
    }
  }, [beginSession, createWebcamStream, state.isRecording, stopTracks]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      clearTimer();
      stopTracks();
      setState((previous) => ({
        ...previous,
        isRecording: false,
        isPaused: false,
      }));
      return;
    }

    await new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.stop();
    });
  }, [clearTimer, stopTracks]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    recorder.pause();
    pausedAtRef.current = Date.now();
    setState((previous) => ({ ...previous, isPaused: true }));
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;

    recorder.resume();

    if (pausedAtRef.current !== null) {
      totalPausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }

    setState((previous) => ({ ...previous, isPaused: false }));
  }, []);

  const setRecordingQuality = useCallback((quality: RecordingQuality) => {
    setState((previous) => ({
      ...previous,
      recordingQuality: quality,
      bitRate: QUALITY[quality].bitRate,
      frameRate: QUALITY[quality].frameRate,
    }));
  }, []);

  const setIncludeAudio = useCallback((include: boolean) => {
    setState((previous) => ({ ...previous, includeAudio: include }));
  }, []);

  const setIncludeMicrophone = useCallback((include: boolean) => {
    setState((previous) => ({ ...previous, includeMicrophone: include }));
  }, []);

  const setDevice = useCallback((deviceId: string) => {
    setState((previous) => ({ ...previous, currentDevice: deviceId }));
  }, []);

  const setFrameRate = useCallback((fps: number) => {
    setState((previous) => ({ ...previous, frameRate: fps }));
  }, []);

  const setBitRate = useCallback((bitrate: number) => {
    setState((previous) => ({ ...previous, bitRate: bitrate }));
  }, []);

  const downloadRecording = useCallback(() => {
    if (!state.recordingBlob) return;

    const url = URL.createObjectURL(state.recordingBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `knoux-rec-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.webm`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [state.recordingBlob]);

  const clearRecording = useCallback(() => {
    setState((previous) => ({
      ...previous,
      recordingBlob: null,
      recordingTime: 0,
      error: null,
    }));
  }, []);

  const takeScreenshot = useCallback(
    (options?: ScreenshotOptions) =>
      screenshotService.captureScreenshot(options),
    [],
  );

  useEffect(() => {
    void initialize();

    return () => {
      clearTimer();

      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }

      stopTracks();
      screenshotService.cleanup();
    };
  }, [clearTimer, initialize, stopTracks]);

  return {
    state,
    actions: {
      startRecording,
      stopRecording,
      pauseRecording,
      resumeRecording,
      initialize,
      setRecordingQuality,
      setIncludeAudio,
      setIncludeMicrophone,
      setDevice,
      setFrameRate,
      setBitRate,
      downloadRecording,
      clearRecording,
      takeScreenshot,
      startWebcamRecording,
    },
  };
}