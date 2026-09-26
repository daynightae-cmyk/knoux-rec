# KNOuX REC

KNOuX REC is a Windows-first local screen recorder and lightweight non-destructive recording workspace built with React, TypeScript and a hardened Electron shell.

> **Current authority:** read [docs/CURRENT_BASELINE.md](./docs/CURRENT_BASELINE.md) before changing product behavior. Historical delivery reports live under [docs/history](./docs/history/).

## Current product reality

The active implementation includes real screen/window capture, constrained region capture, camera PiP composition, a native WASAPI helper, incremental disk-backed recording, low-disk guards, local recording recovery, FFmpeg/FFprobe-backed media verification and export, versioned `.knouxrec` projects, trimmed project export, manual captions with SRT export, local thumbnails, library search/sorting and timeline zoom controls.

The product intentionally distinguishes **implemented** from **fully runtime-verified**. Several capabilities remain PARTIAL until they pass real-device, long-session, multi-DPI, failure-recovery or installer acceptance gates.

## Security boundaries

- `nodeIntegration: false`
- `contextIsolation: true`
- sandboxed renderer and `webSecurity: true`
- narrow typed preload bridge
- validated IPC inputs
- no renderer access to raw shell/IPC primitives
- local constrained media protocols and runtimes

## Development

```powershell
npm ci
npm run dev
```

Core verification:

```powershell
npm run type-check
npm run lint
npm test
npm run build
npm run test:ffmpeg
npm run test:export
npm run test:project-export
npm run test:caption-srt
npm run test:recovery
npm run verify:release
```

Production packaging regenerates the ignored `dist/`, `release/` and FFmpeg build-cache directories. The verified FFmpeg runtime and installed dependencies are intentionally kept locally for fast continued development.

## Status and roadmap

- Current evidence: [docs/CURRENT_BASELINE.md](./docs/CURRENT_BASELINE.md)
- Remaining work: [docs/ROADMAP.md](./docs/ROADMAP.md)
- Detailed status matrix: [docs/PRODUCTION_STATUS.md](./docs/PRODUCTION_STATUS.md)
- Project format: [docs/PROJECT_FORMAT.md](./docs/PROJECT_FORMAT.md)
- Architecture notes: [docs/ELECTRON_IMPLEMENTATION_NOTES.md](./docs/ELECTRON_IMPLEMENTATION_NOTES.md)

Do not resurrect old mock AI, fake system metrics, placeholder media, permissive Electron flags or duplicated standalone shells from pre-cleanup archives. Historical material is reference-only.
