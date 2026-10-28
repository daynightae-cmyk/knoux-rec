package com.knoux.rec.visualcandidate.preview

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import com.knoux.rec.visualcandidate.contract.*
import com.knoux.rec.visualcandidate.screens.*
import com.knoux.rec.visualcandidate.theme.CandidateTheme
import com.knoux.rec.visualcandidate.components.MediaTypeFilter

object CandidatePreviewData {

    val splashState = SplashUiState(
        phase = SplashUiState.SplashPhase.Initializing,
        progress = 0.45f,
        statusMessage = "PREPARING YOUR STUDIO",
        errorMessage = null,
        canRetry = false
    )

    val homeState = HomeUiState(
        recordingReadiness = RecordingReadiness.Ready,
        supportedResolutions = listOf(CaptureResolution.HD720, CaptureResolution.FHD1080, CaptureResolution.Device),
        supportedFrameRates = listOf(CaptureFrameRate.FPS24, CaptureFrameRate.FPS30, CaptureFrameRate.FPS60),
        microphonePermissionGranted = false,
        internalAudioSupported = false,
        currentResolution = CaptureResolution.FHD1080,
        currentFrameRate = CaptureFrameRate.FPS30
    )

    val captureSetupState = CaptureSetupUiState(
        availableResolutions = listOf(CaptureResolution.HD720, CaptureResolution.FHD1080, CaptureResolution.Device),
        selectedResolution = CaptureResolution.FHD1080,
        availableFrameRates = listOf(CaptureFrameRate.FPS24, CaptureFrameRate.FPS30, CaptureFrameRate.FPS60),
        selectedFrameRate = CaptureFrameRate.FPS30,
        microphonePermissionStatus = PermissionStatus.NotDetermined,
        internalAudioCapability = InternalAudioCapability.Unsupported,
        microphoneEnabled = true,
        internalAudioEnabled = false,
        consentAvailable = true,
        initializationError = null
    )

    val liveRecordingState = LiveRecordingUiState(
        elapsedTime = 327000,
        currentResolution = CaptureResolution.FHD1080,
        currentFrameRate = CaptureFrameRate.FPS30,
        microphoneEnabled = true,
        audioLevels = listOf(0.2f, 0.4f, 0.6f, 0.8f, 0.6f, 0.4f, 0.3f, 0.5f, 0.7f, 0.5f, 0.3f),
        recording = true,
        paused = false
    )

    val pauseRecordingState = PauseRecordingUiState(
        elapsedTime = 327000,
        currentResolution = CaptureResolution.FHD1080,
        currentFrameRate = CaptureFrameRate.FPS30,
        format = "MP4",
        canResume = true
    )

    val recordingResultState = RecordingResultUiState(
        mediaId = "rec_20261028_1441_001",
        contentUri = "content://media/external/video/media/12345",
        fileName = "Capture_2026-10-28_1441.mp4",
        duration = 327000,
        resolution = CaptureResolution.FHD1080,
        codec = "H.264 / AAC",
        fileSize = 156000000,
        timestamp = System.currentTimeMillis() - 3600000,
        verified = true,
        previewAvailable = true,
        editingAvailable = false
    )

    val mediaLibraryState = MediaLibraryUiState(
        mediaItems = listOf(
            MediaItem("1", "Design walkthrough", "Tutorial", MediaTypeFilter.Videos, "05:27", "Oct 28", 0xFFFFDE00),
            MediaItem("2", "Tutorial screen recording", "Educational", MediaTypeFilter.Videos, "12:45", "Oct 27", 0xFF00D9FF),
            MediaItem("3", "Audio note · take 03", "Personal", MediaTypeFilter.Audio, "02:18", "Oct 26", 0xFFFBBF24),
            MediaItem("4", "Interface inspiration", "Reference", MediaTypeFilter.Images, null, "Oct 25", 0xFF8B5CF6)
        ),
        selectedFilter = MediaTypeFilter.All,
        searchQuery = "",
        totalItems = 24,
        totalStorageBytes = 2580000000
    )

    val toolsStudioState = ToolsStudioUiState(
        arabicInputText = "مرحبا بك في كنوس ريك تسجيل الشاشة",
        arabicWordCount = 6,
        arabicLetterCount = 42,
        arabicDiacriticCount = 0,
        arabicIndicDigitCount = 0,
        cleanerAvailable = true,
        digitConverterAvailable = true,
        screenshotEditorPlanned = true,
        videoTrimmingPlanned = true,
        aiModelsBlocked = true,
        lastCleanerResult = null,
        lastConverterResult = null
    )

    val settingsState = SettingsUiState(
        language = AppLanguage.English,
        theme = ThemeMode.Dark,
        reducedMotion = false,
        captureQuality = CaptureQuality.FHD1080,
        captureFrameRate = CaptureFrameRate.FPS30,
        microphonePreference = MicrophonePreference.AskWhenNeeded,
        storageLocation = "On-device MediaStore",
        privacyPolicyUrl = "https://knoux.rec/privacy"
    )

    val diagnosticsState = DiagnosticsUiState(
        deviceHealth = com.knoux.rec.visualcandidate.contract.DeviceHealth.Healthy,
        capabilities = DeviceCapabilities(
            screenProjection = CapabilityStatus.PermissionRequired,
            h264Encoder = CapabilityStatus.Supported,
            microphoneRecording = CapabilityStatus.Supported,
            internalAudio = CapabilityStatus.RequiresApi29,
            localMediaAccess = CapabilityStatus.Supported,
            modelInference = CapabilityStatus.Blocked
        ),
        lastCheckTimestamp = System.currentTimeMillis(),
        checking = false
    )
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun SplashPreview() {
    CandidateTheme {
        SplashCandidateScreen(state = CandidatePreviewData.splashState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun HomePreview() {
    CandidateTheme {
        HomeCandidateScreen(state = CandidatePreviewData.homeState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun CaptureSetupPreview() {
    CandidateTheme {
        CaptureSetupCandidateScreen(state = CandidatePreviewData.captureSetupState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun LiveRecordingPreview() {
    CandidateTheme {
        LiveRecordingCandidateScreen(state = CandidatePreviewData.liveRecordingState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun PauseRecordingPreview() {
    CandidateTheme {
        PauseResumeCandidateScreen(state = CandidatePreviewData.pauseRecordingState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun RecordingResultPreview() {
    CandidateTheme {
        RecordingResultCandidateScreen(state = CandidatePreviewData.recordingResultState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun MediaLibraryPreview() {
    CandidateTheme {
        MediaLibraryCandidateScreen(state = CandidatePreviewData.mediaLibraryState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun ToolsStudioPreview() {
    CandidateTheme {
        ToolsStudioCandidateScreen(state = CandidatePreviewData.toolsStudioState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun SettingsPreview() {
    CandidateTheme {
        SettingsCandidateScreen(state = CandidatePreviewData.settingsState, onAction = {})
    }
}

@Preview(showBackground = true, widthDp = 393, heightDp = 852)
@Composable
fun DiagnosticsPreview() {
    CandidateTheme {
        DiagnosticsCandidateScreen(state = CandidatePreviewData.diagnosticsState, onAction = {})
    }
}