# INTEGRATION GUIDE

## Overview
This visual candidate package provides 10 screens for KNOUX REC that can be integrated into the existing application without modifying the core app.

## Integration Approach

### 1. Add the Module
Add the `KNOUX_REC_VISUAL_CANDIDATE` module to your `settings.gradle.kts`:
```kotlin
include(":KNOUX_REC_VISUAL_CANDIDATE")
```

### 2. Add Dependency
In your app module's `build.gradle.kts`:
```kotlin
dependencies {
    implementation(project(":KNOUX_REC_VISUAL_CANDIDATE"))
}
```

### 3. Create Feature Gateway Adapter
Implement `CandidateFeatureGateway` using your existing services:

```kotlin
class RealFeatureGateway(
    private val recorder: RecorderHolder,
    private val mediaRepository: MediaRepository,
    private val settingsStore: KnoxSettingsStore
) : CandidateFeatureGateway {
    // Map your existing services to the gateway interface
}
```

### 4. Use Candidate Screens
Replace existing screens with candidate screens:

| Existing Screen | Candidate Screen | Notes |
|---|---|---|
| SplashActivity/Fragment | SplashCandidateScreen | Update with your initialization logic |
| HomeScreen | HomeCandidateScreen | Wire to CaptureCoordinator |
| CaptureSetupScreen | CaptureSetupCandidateScreen | Use your consent flow |
| RecordingScreen | LiveRecordingCandidateScreen | Connect to RecorderHolder |
| PauseScreen | PauseResumeCandidateScreen | Connect to RecorderState |
| ResultScreen | RecordingResultCandidateScreen | Use MediaRepository |
| LibraryScreen | MediaLibraryCandidateScreen | Use MediaStore |
| ToolsScreen | ToolsStudioCandidateScreen | Local algorithms implemented |
| SettingsScreen | SettingsCandidateScreen | Use KnoxSettingsStore |
| DiagnosticsScreen | DiagnosticsCandidateScreen | Use your capability checks |

## Contract Mapping

### Actions
- `PauseRecording` → `recorder.pause()`
- `ResumeRecording` → `recorder.resume()`
- `StopAndSaveRecording` → `recorder.stop()`
- `PlayMedia` → Open with your media player
- `ShareMedia` → Use Android share sheet
- `SetCaptureResolution` → Update settings
- etc.

### State
Map your existing state to candidate state classes or use them directly where compatible.

## What to Keep/Replace
- **Keep**: MediaProjection, MediaCodec, Room, DataStore implementations
- **Replace**: UI layer only (Composables)
- **Modify**: Navigation to use candidate screens
- **Test**: After integration, test all flows

## Notes
- All screens use preview fixtures by default
- Real data comes through the gateway
- No fake backends implemented
- Arabic RTL supported
- Dark theme optimized
- Responsive layouts included

## Testing Checklist
- [ ] All screens compile
- [ ] Navigation works
- [ ] Recording flow tested
- [ ] Permissions handled
- [ ] Media playback/sharing works
- [ ] Settings persist
- [ ] Diagnostics accurate
- [ ] RTL layout tested (Arabic)
- [ ] Different screen sizes tested