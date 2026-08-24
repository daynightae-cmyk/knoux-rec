# KNOuX REC — Phase 2 Baseline

**Recorded:** 24 August 2026  
**Working tree:** `D:\Knoux Projects\Knoux_Project_Center\01_Ready\Knoux_Rec`

## Git position

| Item | Recorded value |
|---|---|
| Current branch | `main` |
| Current HEAD | `7365bbbc12307dad5b69a93b413170b2d8dec6a9` |
| `origin/main` after fetch | `7365bbbc12307dad5b69a93b413170b2d8dec6a9` |
| Tracking state | `main...origin/main` |
| Remote | `https://github.com/daynightae-cmyk/knoux-rec.git` |
| Last committed baseline | `chore: establish clean KNOuX REC screen recorder baseline` |

The phase-one implementation is intentionally **uncommitted** at re-entry. It modifies the application shell, recorder hook, styles, package configuration, and type declarations, and adds Electron, scripts, tests, public assets, reports, and this documentation directory. The remote has no newer commit after `git fetch --all --prune`.

## Architecture found

The active application is a single Electron architecture rooted in `desktop/`, not the requested-but-absent `electron/`, `client/`, or `shared/` directories. The Electron main process owns `desktopCapturer`, file-system writes, recording-library persistence, settings, source enumeration, tray control, and global shortcut dispatch. React remains in the repository root and is bundled with Vite. The preload bridge exposes named domain APIs only.

| Area | Implemented and inspected | Evidence state |
|---|---|---|
| Electron security | `nodeIntegration: false`, `contextIsolation: true`, sandbox, web security, restrictive CSP, denied window opening | Source inspected; prior architecture test passed |
| Capture picker | Screen/window source enumeration with 480×270 thumbnails and optional application icon data | Prior operational smoke test: 3 sources, including 1 screen and 2 windows |
| Incremental writer | One-second MediaRecorder chunks reach a per-session `.part` file through bounded IPC, then rename to finalized media | Source inspected; 128 MiB per-chunk limit |
| Recording library | JSON index, real-file filtering, open/reveal/delete calls | Source inspected |
| Settings | Locale, default quality, frame rate, countdown, library preference, recording folder | Source inspected |
| UI localization | English and Arabic RTL UI | Prior build evidence |
| Packaging | NSIS configuration, custom `icon.ico`, tray icon, unpacked executable and installer | Installer present at `release\KNOuX-REC-1.1.0-Setup.exe` |
| Tests | One Vitest file with 4 architecture tests | Prior gate passed |

## Security state

The previous delivery report and the current `desktop/main.cjs` agree that the renderer cannot directly access Node or raw IPC. The main process validates recording metadata, IDs, numeric ranges, chunk type and chunk size. It uses temporary file paths for active sessions and only indexes a finalized file after at least one media chunk has been written.

> The current `before-quit` behavior deletes active `.part` files. This is a known limitation for crash recovery rather than evidence of a completed recovery feature.

## Features that are partial rather than complete

| Capability | Current behavior | Why it remains partial |
|---|---|---|
| System audio | Uses the Electron/Chromium stream returned for the selected desktop source and errors if requested audio is missing | No native WASAPI loopback backend, output-device selection, mixer UI, metering, or separate tracks |
| Window capture | Enumerates window sources and captures a selected source ID | No handling or tested evidence for minimize, close, resize, move, or monitor migration |
| Screen capture | Enumerates displays and allows selected desktop source recording | No display labels, resolution/scaling labels, or multi-monitor validation matrix |
| Camera | Enumerates camera devices in settings | No camera-only recording or screen-plus-camera composition |
| Screenshots | Browser capture service can create a real screenshot | No desktop screenshot center/library integration |
| Long-recording reliability | Disk-first chunks and finalization are present | No measured 5/30/60/120-minute run or A/V drift data |
| Global hotkey and tray | Main process registers `Ctrl+Shift+R` and tray menu sends a UI event | No interaction-level verification documented |

## Missing features at phase-two start

Native WASAPI loopback, real audio mixer and meters, device-change recovery, timestamp-based A/V drift measurement, native multi-monitor region overlay, region presets, real webcam compositor/PiP, recording canvas, cursor metadata and zoom, annotation/redaction, crash-safe partial-media recovery, thumbnails, non-destructive editor, transcription, captions, translation, FFmpeg export pipeline, ffprobe verification, automated longevity tests, packaged E2E installer test, and clean-machine/offline validation remain unimplemented.

## Baseline commands executed

```powershell
git status --short --branch
git remote -v
git branch -vv
git log --oneline --decorate -20
git diff --stat
git fetch --all --prune
```

The baseline source and previous delivery report were inspected before phase-two modifications. The source tree was also searched previously for `mock`, `fake`, `TODO`, and `placeholder` terms outside generated, dependency, archive, and release paths; no active-source hit was reported.

## Release state

| Artifact | State at re-entry |
|---|---|
| NSIS installer | `release\KNOuX-REC-1.1.0-Setup.exe`, 111,088,533 bytes in prior report |
| Installer SHA-256 | `89C895F7537ECFB494CD13056E7EC212EEA9AB0C84AF98A821CFC838A651AC63` |
| Unpacked application | `release\win-unpacked\KNOuX REC.exe` |
| Release verifier | `scripts/verify-release.mjs` |

## Phase-two rule

The incremental disk-first recording principle is preserved:

```text
capture → bounded media chunks → incremental temporary-file write → finalization → index
```

No phase-two change may replace it with a full-recording-in-RAM design or claim a capability not accompanied by an operational pathway and a stated verification boundary.
