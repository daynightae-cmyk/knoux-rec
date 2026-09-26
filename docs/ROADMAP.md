# KNOuX REC — Continuation Roadmap

This roadmap starts from the verified current baseline. It is not a redesign.

## P0 — Reliability and runtime proof

1. Long-session recording evidence
   - real 10 / 30 / 60 minute sessions
   - measure file growth, memory, CPU, dropped-frame indicators and A/V drift
   - verify final media with FFprobe

2. Device-failure handling
   - microphone disconnect/reconnect
   - WASAPI device loss
   - camera loss during PiP
   - explicit preserved-video behavior when native audio fails

3. Multi-monitor / DPI acceptance
   - negative screen coordinates
   - mixed scaling
   - region overlay selection across real displays
   - verify physical crop matches selected bounds

4. Recovery acceptance
   - force-kill the packaged app during a recording
   - recover supported partial sessions
   - prove unrecoverable cases are reported honestly

## P1 — Editor and library depth

1. Multi-segment non-destructive timeline
   - split
   - multiple trims
   - delete/ripple policy
   - persisted undo/redo history

2. Export pipeline
   - timeline-aware export of every supported edit
   - progress based on real FFmpeg progress
   - cancellation that terminates the real job
   - output validation with FFprobe

3. Library 2.0
   - filters
   - missing-file detection
   - large-library performance
   - batch-safe metadata refresh
   - resilient thumbnail regeneration

4. Captions
   - VTT in addition to SRT
   - embed/burn options only when real FFmpeg path is implemented
   - preserve caption timing through trims

## P2 — Premium recording intelligence

- real cursor-event metadata
- Smart Zoom driven by captured interaction evidence
- annotations and callouts
- configurable PiP placement/size
- microphone/system-audio meters
- gain and mute behavior backed by runtime state
- richer hotkeys and recording HUD
- scene/template concepts only after the capture core remains stable

## P3 — Local AI, only when real

Automatic transcription, translation, silence detection or AI editing must not be exposed as working until an actual local model/runtime is installed, licensed, loaded and acceptance-tested.

No random neural fallback, fake transcript, fake confidence score or timer-driven progress is acceptable.

## P4 — Release acceptance

- package from a clean checkout
- install NSIS on Windows
- launch installed application offline
- record and export real media
- close/reopen and verify persistence
- uninstall without deleting user data unexpectedly
- rerun security boundary checks
- merge only after branch CI and final acceptance evidence are green

## Working rule

Every new visible control must map to a real service or explicit unavailable state. Preserve the current secure Electron boundary and avoid parallel shells, duplicate recorder engines or resurrected pre-cleanup components.
