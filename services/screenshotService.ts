export interface ScreenshotRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenshotOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  captureMode?: "screen" | "window" | "tab" | "region";
  filename?: string;
  timestamp?: boolean;
  watermark?: boolean;
  region?: ScreenshotRegion;
}

export interface ScreenshotResult {
  success: boolean;
  blob?: Blob;
  dataUrl?: string;
  filename?: string;
  size?: number;
  dimensions?: { width: number; height: number };
  timestamp?: Date;
  error?: string;
}

function extensionFor(format: NonNullable<ScreenshotOptions["format"]>): string {
  return format === "jpeg" ? "jpg" : format;
}

function mimeFor(format: NonNullable<ScreenshotOptions["format"]>): string {
  return `image/${format}`;
}

function sanitizeFilename(value: string): string {
  return value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").trim();
}

async function waitForVideo(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return;

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("error", onError);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Could not decode the captured display stream."));
    };

    video.addEventListener("loadedmetadata", onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Browser failed to encode the screenshot."));
      },
      mimeType,
      quality,
    );
  });
}

export class ScreenshotService {
  private activeStream: MediaStream | null = null;

  async captureScreenshot(
    options: ScreenshotOptions = {},
  ): Promise<ScreenshotResult> {
    const format = options.format ?? "png";
    const quality = Math.min(1, Math.max(0, options.quality ?? 0.92));
    const captureMode = options.captureMode ?? "screen";

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen capture is not supported by this runtime.");
      }

      if (captureMode === "region" && !options.region) {
        throw new Error(
          "Region capture requires explicit x, y, width and height coordinates.",
        );
      }

      // Browser display capture always uses the trusted OS/browser picker.
      // "window" and "tab" are user choices in that picker in this web baseline.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      this.activeStream = stream;

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;

      await waitForVideo(video);
      await video.play();

      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;

      if (!sourceWidth || !sourceHeight) {
        throw new Error("Captured source reported an invalid resolution.");
      }

      const region = options.region;
      const sourceX = region?.x ?? 0;
      const sourceY = region?.y ?? 0;
      const sourceW = region?.width ?? sourceWidth;
      const sourceH = region?.height ?? sourceHeight;

      if (
        sourceX < 0 ||
        sourceY < 0 ||
        sourceW <= 0 ||
        sourceH <= 0 ||
        sourceX + sourceW > sourceWidth ||
        sourceY + sourceH > sourceHeight
      ) {
        throw new Error("Requested screenshot region is outside the captured source.");
      }

      const canvas = document.createElement("canvas");
      canvas.width = sourceW;
      canvas.height = sourceH;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("2D canvas is unavailable.");
      }

      context.drawImage(
        video,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        sourceW,
        sourceH,
      );

      if (options.watermark === true) {
        this.drawWatermark(context, canvas);
      }

      if (options.timestamp === true) {
        this.drawTimestamp(context);
      }

      const dataUrl = canvas.toDataURL(mimeFor(format), quality);
      const blob = await canvasToBlob(canvas, mimeFor(format), quality);
      const now = new Date();

      const defaultFilename = `knoux-screenshot-${now
        .toISOString()
        .replace(/[:.]/g, "-")}.${extensionFor(format)}`;
      const filename = sanitizeFilename(options.filename ?? defaultFilename);

      return {
        success: true,
        blob,
        dataUrl,
        filename,
        size: blob.size,
        dimensions: { width: canvas.width, height: canvas.height },
        timestamp: now,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Screenshot capture failed.",
      };
    } finally {
      this.cleanup();
    }
  }

  cleanup(): void {
    this.activeStream?.getTracks().forEach((track) => track.stop());
    this.activeStream = null;
  }

  private drawWatermark(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ): void {
    const padding = 16;
    context.save();
    context.font = "600 16px system-ui, sans-serif";
    context.textAlign = "right";
    context.textBaseline = "bottom";

    const text = "KNOuX REC";
    const width = context.measureText(text).width;

    context.fillStyle = "rgba(0, 0, 0, 0.55)";
    context.fillRect(
      canvas.width - width - padding * 2,
      canvas.height - 42,
      width + padding * 2,
      34,
    );

    context.fillStyle = "rgba(255, 255, 255, 0.95)";
    context.fillText(text, canvas.width - padding, canvas.height - 16);
    context.restore();
  }

  private drawTimestamp(context: CanvasRenderingContext2D): void {
    const text = new Date().toLocaleString();
    context.save();
    context.font = "12px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.textAlign = "left";
    context.textBaseline = "top";

    const padding = 8;
    const width = context.measureText(text).width;

    context.fillStyle = "rgba(0, 0, 0, 0.65)";
    context.fillRect(padding, padding, width + padding * 2, 28);

    context.fillStyle = "white";
    context.fillText(text, padding * 2, padding * 1.75);
    context.restore();
  }
}

export const screenshotService = new ScreenshotService();