# KNOuX REC

KNOuX REC is a focused Windows desktop screen-recorder foundation. It packages a React renderer in a secure Electron shell and records through selected desktop sources with a local, incremental file-writing path.

> **Honest status:** this is a buildable, packaged desktop foundation — not yet a full production screen-recording suite. See [DELIVERY_REPORT.md](./DELIVERY_REPORT.md) for tested evidence and the remaining limitations.

## What is implemented

| Area | Current behavior |
|---|---|
| Secure desktop shell | Electron main process, isolated preload API, no renderer Node integration, sandbox, CSP, and validated IPC inputs |
| Source picker | Real screen and window enumeration with desktop thumbnails and selected-source capture |
| Recording path | MediaRecorder chunks are forwarded to a `.part` file, then moved to the finalized local recording only after real bytes are written |
| Audio protection | Requested system audio must be present in the selected stream or recording start fails visibly; microphone mixing is supported when an input is available |
| Library | Persisted local metadata with open, reveal, and delete operations against actual files |
| Interface | Capture dashboard, data-written indicator, local settings, English/Arabic RTL UI, and a global `Ctrl + Shift + R` request shortcut |
| Packaging | Windows NSIS installer and portable unpacked app, using a local KNOuX REC icon |

## Deliberately not claimed

The current build does **not** claim native WASAPI loopback, separate audio tracks, region-overlay capture, camera-only/camera-overlay recording, long-recording validation, crash recovery of media containers, a timeline editor, Smart Zoom, transcription, captions, translation, FFmpeg export, or code-signing trust. These are future implementation work, not hidden or simulated features.

## Development

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run desktop:pack
npm run desktop:dist
npm run verify:release
```

The generated installer is written to `release/KNOuX-REC-<version>-Setup.exe`.

## Technical reference

The source picker uses Electron's `desktopCapturer` interface for screen and window enumeration.[1] The application uses a narrow context-isolated bridge rather than exposing raw IPC capabilities to the renderer.[2]

[1]: https://www.electronjs.org/docs/latest/api/desktop-capturer "Electron desktopCapturer"
[2]: https://www.electronjs.org/docs/latest/tutorial/context-isolation "Electron Context Isolation"
