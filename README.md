# KNOuX REC

KNOuX REC is currently a **clean screen-recorder-only baseline**.

## What works in this baseline

- Real browser/runtime screen capture through `getDisplayMedia`
- Real camera capture through `getUserMedia`
- Optional microphone capture
- Requested shared/system audio validation
- Pause / resume / stop
- Real screenshot capture
- Recording download
- Local production build with no runtime Tailwind or Google Fonts CDN

## What this baseline is NOT claiming yet

It is **not yet the final Windows production recorder**.

The production roadmap still includes:

- Secure Electron desktop shell
- Native Windows source enumeration
- Windows system-audio backend
- Incremental crash-safe disk recording
- Hardware encoder selection
- Global hotkeys and tray HUD
- Region recorder overlay
- Persistent recording library
- Non-destructive screen-recording editor
- Smart Zoom / cursor metadata
- Local transcription and caption translation
- Professional NSIS installer
- Automated tests and clean-machine validation

No unrelated image/body/AI-toolbox suites belong in this repository.