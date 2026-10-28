package com.knoux.rec.visualcandidate.contract

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

interface CandidateFeatureGateway {

    val splashState: StateFlow<SplashUiState>
    val homeState: StateFlow<HomeUiState>
    val captureSetupState: StateFlow<CaptureSetupUiState>
    val liveRecordingState: StateFlow<LiveRecordingUiState>
    val pauseRecordingState: StateFlow<PauseRecordingUiState>
    val recordingResultState: StateFlow<RecordingResultUiState>
    val mediaLibraryState: StateFlow<MediaLibraryUiState>
    val toolsStudioState: StateFlow<ToolsStudioUiState>
    val settingsState: StateFlow<SettingsUiState>
    val diagnosticsState: StateFlow<DiagnosticsUiState>

    fun initialize()
    fun shutdown()

    fun requestCaptureConsent(callback: (Boolean) -> Unit)
    fun startRecording()
    fun pauseRecording()
    fun resumeRecording()
    fun stopAndSaveRecording()
    fun takeSnapshot()
    fun toggleMicrophone()
    fun toggleInternalAudio()

    fun playMedia(mediaId: String)
    fun shareMedia(mediaId: String)
    fun deleteMedia(mediaId: String)
    fun loadMediaLibrary()

    fun runArabicCleaner(text: String): String
    fun convertDigits(text: String, toArabicIndic: Boolean): String

    fun setLanguage(language: AppLanguage)
    fun setTheme(theme: ThemeMode)
    fun setReducedMotion(enabled: Boolean)
    fun setCaptureQuality(quality: CaptureQuality)
    fun setCaptureFrameRate(frameRate: CaptureFrameRate)
    fun setMicrophonePreference(preference: MicrophonePreference)

    fun refreshDiagnostics()
    fun openPermissionSettings(permission: String)
    fun openStorageSettings()
    fun openPrivacyInformation()
}

class PreviewFeatureGateway : CandidateFeatureGateway {
    override val splashState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.splashState)
    override val homeState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.homeState)
    override val captureSetupState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.captureSetupState)
    override val liveRecordingState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.liveRecordingState)
    override val pauseRecordingState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.pauseRecordingState)
    override val recordingResultState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.recordingResultState)
    override val mediaLibraryState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.mediaLibraryState)
    override val toolsStudioState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.toolsStudioState)
    override val settingsState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.settingsState)
    override val diagnosticsState = MutableStateFlow(com.knoux.rec.visualcandidate.preview.CandidatePreviewData.diagnosticsState)

    override fun initialize() {}
    override fun shutdown() {}

    override fun requestCaptureConsent(callback: (Boolean) -> Unit) {
        callback(true)
    }

    override fun startRecording() {
        liveRecordingState.value = liveRecordingState.value.copy(recording = true, paused = false)
    }

    override fun pauseRecording() {
        liveRecordingState.value = liveRecordingState.value.copy(paused = true)
    }

    override fun resumeRecording() {
        liveRecordingState.value = liveRecordingState.value.copy(paused = false)
    }

    override fun stopAndSaveRecording() {
        val elapsed = liveRecordingState.value.elapsedTime
        recordingResultState.value = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.recordingResultState.copy(
            duration = elapsed,
            verified = true
        )
    }

    override fun takeSnapshot() {}

    override fun toggleMicrophone() {
        liveRecordingState.value = liveRecordingState.value.copy(microphoneEnabled = !liveRecordingState.value.microphoneEnabled)
    }

    override fun toggleInternalAudio() {}

    override fun playMedia(mediaId: String) {}
    override fun shareMedia(mediaId: String) {}
    override fun deleteMedia(mediaId: String) {}
    override fun loadMediaLibrary() {}

    override fun runArabicCleaner(text: String): String {
        return text
            .replace("\\p{M}".toRegex(), "")
            .replace("\\s+".toRegex(), " ")
            .trim()
    }

    override fun convertDigits(text: String, toArabicIndic: Boolean): String {
        val arabicDigits = "٠١٢٣٤٥٦٧٨٩"
        val westernDigits = "0123456789"
        return if (toArabicIndic) {
            text.map { c ->
                val idx = westernDigits.indexOf(c)
                if (idx >= 0) arabicDigits[idx] else c
            }.joinToString("")
        } else {
            text.map { c ->
                val idx = arabicDigits.indexOf(c)
                if (idx >= 0) westernDigits[idx] else c
            }.joinToString("")
        }
    }

    override fun setLanguage(language: AppLanguage) {
        settingsState.value = settingsState.value.copy(language = language)
    }

    override fun setTheme(theme: ThemeMode) {
        settingsState.value = settingsState.value.copy(theme = theme)
    }

    override fun setReducedMotion(enabled: Boolean) {
        settingsState.value = settingsState.value.copy(reducedMotion = enabled)
    }

    override fun setCaptureQuality(quality: CaptureQuality) {
        settingsState.value = settingsState.value.copy(captureQuality = quality)
    }

    override fun setCaptureFrameRate(frameRate: CaptureFrameRate) {
        settingsState.value = settingsState.value.copy(captureFrameRate = frameRate)
    }

    override fun setMicrophonePreference(preference: MicrophonePreference) {
        settingsState.value = settingsState.value.copy(microphonePreference = preference)
    }

    override fun refreshDiagnostics() {
        diagnosticsState.value = diagnosticsState.value.copy(checking = true)
        // Simulated async check
        kotlinx.coroutines.GlobalScope.launch {
            kotlinx.coroutines.delay(1500)
            diagnosticsState.value = diagnosticsState.value.copy(
                checking = false,
                deviceHealth = DeviceHealth.Healthy,
                capabilities = DeviceCapabilities(
                    screenProjection = CapabilityStatus.PermissionRequired,
                    h264Encoder = CapabilityStatus.Supported,
                    microphoneRecording = CapabilityStatus.Supported,
                    internalAudio = CapabilityStatus.RequiresApi29,
                    localMediaAccess = CapabilityStatus.Supported,
                    modelInference = CapabilityStatus.Blocked
                ),
                lastCheckTimestamp = System.currentTimeMillis()
            )
        }
    }

    override fun openPermissionSettings(permission: String) {}
    override fun openStorageSettings() {}
    override fun openPrivacyInformation() {}
}