package com.knoux.rec.visualcandidate.contract

sealed interface CandidateAction {
    data class StartupCompleted(val success: Boolean, val errorMessage: String? = null) : CandidateAction
    data class RetryStartup(val reason: String? = null) : CandidateAction
    data class NavigateTo(val destination: NavigationDestination) : CandidateAction
    object NavigateBack : CandidateAction
    data class RequestCaptureConsent(val callback: (Boolean) -> Unit) : CandidateAction
    data class SetCaptureResolution(val resolution: CaptureResolution) : CandidateAction
    data class SetCaptureFrameRate(val frameRate: CaptureFrameRate) : CandidateAction
    data class SetMicrophoneEnabled(val enabled: Boolean) : CandidateAction
    data class SetInternalAudioEnabled(val enabled: Boolean) : CandidateAction
    data class ToggleMicrophone : CandidateAction
    data class ToggleInternalAudio : CandidateAction
    data class PauseRecording : CandidateAction
    data class ResumeRecording : CandidateAction
    data class StopAndSaveRecording : CandidateAction
    data class TakeSnapshot : CandidateAction
    data class PlayMedia(val mediaId: String) : CandidateAction
    data class ShareMedia(val mediaId: String) : CandidateAction
    data class OpenMediaDetails(val mediaId: String) : CandidateAction
    data class DeleteMediaRequested(val mediaId: String) : CandidateAction
    data class SearchMedia(val query: String) : CandidateAction
    data class SelectMediaFilter(val filter: com.knoux.rec.visualcandidate.components.MediaTypeFilter) : CandidateAction
    data class RunArabicCleaner(val text: String) : CandidateAction
    data class ConvertDigits(val text: String, val toArabicIndic: Boolean) : CandidateAction
    data class SetLanguage(val language: AppLanguage) : CandidateAction
    data class SetTheme(val theme: ThemeMode) : CandidateAction
    data class SetReducedMotion(val enabled: Boolean) : CandidateAction
    data class SetCaptureQuality(val quality: CaptureQuality) : CandidateAction
    data class SetCaptureFrameRatePref(val frameRate: CaptureFrameRate) : CandidateAction
    data class SetMicrophonePreference(val preference: MicrophonePreference) : CandidateAction
    data class RefreshDiagnostics : CandidateAction
    data class OpenPermissionExplanation(val permission: String) : CandidateAction
    data class OpenStorageSettings : CandidateAction
    data class OpenPrivacyInformation : CandidateAction
}

enum class NavigationDestination {
    Splash, Home, CaptureSetup, LiveRecording, PauseRecording, RecordingResult,
    MediaLibrary, ToolsStudio, Settings, Diagnostics
}

enum class CaptureResolution {
    HD720("720P", 1280, 720),
    FHD1080("1080P", 1920, 1080),
    Device("Device", -1, -1)

    val displayName: String
    val width: Int
    val height: Int

    constructor(displayName: String, width: Int, height: Int) {
        this.displayName = displayName
        this.width = width
        this.height = height
    }
}

enum class CaptureFrameRate(val value: Int, val displayName: String) {
    FPS24(24, "24 FPS"),
    FPS30(30, "30 FPS"),
    FPS60(60, "60 FPS")
}

enum class AppLanguage(val code: String, val displayName: String, val nativeName: String) {
    English("en", "English", "English"),
    Arabic("ar", "Arabic", "العربية")
}

enum class ThemeMode(val displayName: String) {
    System("System"),
    Dark("Dark"),
    Light("KNOUX Gold")
}

enum class CaptureQuality(val displayName: String, val resolution: CaptureResolution) {
    HD720("720P", CaptureResolution.HD720),
    FHD1080("1080P", CaptureResolution.FHD1080),
    Device("Auto", CaptureResolution.Device)
}

enum class MicrophonePreference(val displayName: String) {
    AlwaysOn("Always On"),
    AskWhenNeeded("Ask When Needed"),
    AlwaysOff("Always Off")
}

@kotlinx.serialization.Serializable
data class ScreenResolution(val width: Int, val height: Int)

@kotlinx.serialization.Serializable
data class DeviceCapabilities(
    val screenProjection: CapabilityStatus = CapabilityStatus.Unknown,
    val h264Encoder: CapabilityStatus = CapabilityStatus.Unknown,
    val microphoneRecording: CapabilityStatus = CapabilityStatus.Unknown,
    val internalAudio: CapabilityStatus = CapabilityStatus.Unknown,
    val localMediaAccess: CapabilityStatus = CapabilityStatus.Unknown,
    val modelInference: CapabilityStatus = CapabilityStatus.Unknown
)

enum class CapabilityStatus {
    Supported, Unsupported, PermissionRequired, Blocked, Unknown, Checking, Error
}