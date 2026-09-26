# KNOuX REC — Current Baseline

Date: 2026-09-27
Branch: `feat/production-recorder-completion`
Verified HEAD before this documentation cleanup: `18cc75606899478085d2f96f03a7a85a4776bc2c`

This document is the current handoff authority for continued implementation. Older August delivery reports are preserved under `docs/history/` and must not override repository reality.

## Repository reality

- Local branch matched `origin/feat/production-recorder-completion` at `18cc756...`.
- Working tree was clean before the documentation reorganization.
- The feature branch was 28 commits ahead of `origin/main` at `7365bbb...`.
- A complete Git bundle was preserved at `D:\Knoux_Rec_PRESERVE_20260927\knoux-rec-all.bundle`.
- The verified 1.1.0 installer was preserved outside the repository before deleting reproducible release output.

## Verified cleanup gate

The following commands passed on the real Windows workstation immediately before cleanup:

| Gate | Result |
|---|---|
| `npm run type-check` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 18/18 |
| `npm run build` | PASS |
| `npm run test:ffmpeg` | PASS — real WebM, VP9 + Opus evidence |
| `npm run test:export` | PASS — real MP4-family output, MPEG-4 + AAC |
| `npm run test:project-export` | PASS — verified trimmed MP4 export |
| `npm run test:caption-srt` | PASS — 2 SRT entries written |
| `npm run test:recovery` | PASS — recoverable recording/project evidence |
| `npm run verify:release` | PASS |

The installer preserved before cleanup matched the source copy byte-for-byte:

`SHA-256 47D168995C67FDA64B82E46BAA957787309A4D82B20004EC698D8B45DC251923`

## Implemented product surface

Current code and commit history include:

- hardened Electron shell with constrained preload IPC
- screen and window source capture
- constrained region capture and compositor
- camera PiP composition
- native WASAPI helper
- incremental disk-backed recording
- low-storage start guard and safe stop behavior
- native-audio failure preservation behavior
- local FFmpeg/FFprobe runtime and verified media processing
- versioned `.knouxrec` project persistence
- local project trim/export
- interrupted-session journal and recovery workflow
- manual caption editing and SRT export
- constrained local recording thumbnails
- recording library search and sorting
- timeline zoom controls
- supported export-format selection

## Truth boundaries

The application is not yet declared production-ready. Existing implementation still needs broader real-device evidence for long recording sessions, multi-monitor/DPI interaction, camera/audio device loss, A/V drift, installer install/uninstall behavior and larger-library behavior.

Automatic transcription, translation, Smart Zoom/cursor intelligence, advanced multi-cut/ripple editing, annotations, collaboration and broadcasting must remain unavailable until backed by real engines and acceptance evidence.

No pre-cleanup mock AI, random system statistics, placeholder media, CDN-dependent styling or permissive Electron security flags may be reintroduced.

## Cleanup result

Reproducible or temporary directories removed after all gates passed:

- `release/`
- `dist/`
- `desktop/ffmpeg/.cache/`
- `.knoux-local/`

Preserved for immediate development:

- `node_modules/`
- `desktop/ffmpeg/runtime/`
- `desktop/audio-helper/packages/`

Project footprint fell from approximately 2383.91 MB to 775.17 MB. D: free space increased from approximately 11.90 GB to 13.47 GB.
