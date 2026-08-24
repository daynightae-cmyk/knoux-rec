/// <reference types="vite/client" />

import type { RecorderDesktopApi } from "./desktop/contracts";

declare global {
  interface Window {
    knouxRec?: RecorderDesktopApi;
  }
}

export {};
