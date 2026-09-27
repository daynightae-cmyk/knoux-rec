# P0 Reliability Findings — 2026-09-27

Branch: `feat/production-recorder-completion`
Feature commit: `089a604` (dashboard shell) + the fixes recorded below
Verified against the **packaged** application (`electron-builder --dir --win`), not only the source tree.

This document records measured evidence only. Items that were not measured are listed as
such and must not be reported as passing.

## Defect 1 — the packaged application rendered a blank window (fixed)

**Severity:** P0, ships-broken.

`desktop/main.cjs` loads the built renderer with `mainWindow.loadFile(...)`, which uses the
`file://` protocol. `vite.config.ts` declared no `base`, so Vite emitted root-absolute asset
URLs. Under `file://` those resolve to the filesystem root, not the bundle directory.

Measured, packaged build before the fix:

| Evidence | Value |
|---|---|
| Renderer URL | `file:///.../resources/app.asar/dist/index.html` |
| Resolved script URL | `file:///C:/assets/index-D2USYYYr.js` |
| `C:/assets/index-D2USYYYr.js` exists | `false` |
| `#root` child count | `0` |
| DOM node count | `10` |
| Visible text | empty |

The recorder engine, FFmpeg, WASAPI and the whole IPC surface were healthy, so every
artifact-existence check passed while the product was unusable. `scripts/verify-release.mjs`
only asserted that `dist/index.html` existed and was non-empty.

**Fix**

- `vite.config.ts` now sets `base: "./"`.
- `scripts/verify-release.mjs` now fails the release when the built document references any
  root-absolute asset, when it references no relative asset, or when a referenced asset is
  missing from `dist`.
- `tests/packaged-renderer.test.ts` guards all three conditions.

Measured, packaged build after the fix:

| Evidence | Value |
|---|---|
| Resolved script URL | `file:///.../app.asar/dist/assets/index-D2USYYYr.js` |
| `#root` child count | `1` |
| DOM node count | `692` |
| Visible text | full application shell |

## Defect 2 — a working FFmpeg install reported itself as unavailable (fixed)

**Severity:** P0, silent capability loss.

`desktop/ffmpeg/build-runtime.ps1` wrote the manifest with
`Set-Content -Encoding utf8`. Windows PowerShell 5.1 emits **UTF-8 with a BOM**, so
`manifest.json` began with `U+FEFF`. `JSON.parse` rejects that, and the `catch` in
`readRuntimeManifest()` swallowed the failure and returned `available: false`.

Measured before the fix, on a machine with a complete, working FFmpeg runtime:

| Evidence | Value |
|---|---|
| First character of `manifest.json` | `65279` (`U+FEFF`) |
| `JSON.parse` | throws `Unexpected token` |
| `media.getRuntimeStatus().available` | `false` |
| `media.getRuntimeStatus().manifest` | `null` |
| Reported UI state | "Limited — Recording available; export runtime unavailable" |

Export, thumbnails and output verification were all reported missing while
`npm run test:ffmpeg`, `npm run test:export` and `npm run test:project-export` were
producing real WebM and MP4 output from the same binaries.

**Fix**

- `readMediaManifest(manifestPath)` in `desktop/media-backend.cjs` strips a leading BOM and
  returns a readable `error` string instead of failing silently. Exported for direct testing.
- `build-runtime.ps1` writes UTF-8 without a BOM via `UTF8Encoding($false)`.
- `MediaRuntimeStatus` gained `error: string | null`.
- `tests/media-runtime-manifest.test.ts` reads real manifests through the real reader and
  covers plain UTF-8, BOM, malformed and missing files, plus the generator encoding.

Measured after the fix, packaged:

| Evidence | Value |
|---|---|
| `available` | `true` |
| `manifest.version` | `ffmpeg version n9.0.1-6-g9d4ca21220-20260823` |
| Detected encoders | `6` |
| Native WASAPI helper reachable | yes, `1` output device |

## Measured recording evidence

Real end-to-end recording through the packaged application: real desktop source, real
`MediaRecorder`, real incremental chunk writes, real finalize, real FFprobe of the result.

| Measurement | 1-minute run |
|---|---|
| Reported duration | 69,000 ms |
| Reported size | 28,753,075 bytes |
| Bytes on disk | 28,753,075 bytes (exact match) |
| Resolution / rate | 1920x1080 @ 30 |
| FFprobe container | `matroska,webm` |
| FFprobe video codec | `vp9` |
| FFprobe audio | none, system audio sidecar was rejected |
| Peak working set (all app processes) | 798.9 MB |
| Chunk growth | 14 -> 65 chunks, monotonic |

## Host capability limits on this workstation

These were measured, not assumed, and they bound what P0 evidence can exist here.

| Capability | Host reality | Consequence |
|---|---|---|
| Camera devices | none present (`Win32_PnPEntity` `PNPClass='Camera'` empty) | Camera PiP and camera disconnect/lifecycle are **untestable** |
| Displays | 1 (`1920x1080`) | Multi-monitor behaviour is **untestable** |
| Display scaling | `AppliedDPI=96`, 100% | Mixed-DPI and scaling behaviour is **untestable** |
| Negative-coordinate displays | none | Negative-coordinate region capture is **untestable** |
| Physical device disconnect | requires unplugging hardware | Microphone, camera and output-device loss are **untestable as specified** |
| System audio loopback | Realtek output enumerates, but produced no PCM data | System-audio muxing and therefore A/V drift are **not measurable here** |

## Not measured

The following are **not** covered by evidence and must not be reported as passing:

- 30 and 60 minute sessions.
- A/V drift, because system audio never produced PCM data on this host.
- Microphone, camera and audio output device disconnect.
- Camera PiP in any form, because no camera exists on this host.
- Multi-monitor, mixed-DPI and negative-coordinate region capture.
- NSIS installer install and offline end-to-end run.
- Any CI run: the repository has no workflow definition.
