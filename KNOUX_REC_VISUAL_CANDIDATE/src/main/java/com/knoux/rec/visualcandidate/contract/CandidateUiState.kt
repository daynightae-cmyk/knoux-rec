package com.knoux.rec.visualcandidate.contract

import androidx.compose.runtime.Stable
import kotlinx.serialization.Serializable

@Stable
@Serializable
data class SplashUiState(
    val phase: SplashPhase = SplashPhase.Initializing,
    val progress: Float = 0f,
    val statusMessage: String = "PREPARING YOUR STUDIO",
    val errorMessage: String? = null,
    val canRetry: Boolean = false
) {
    val isReady: Boolean
        get() = phase == SplashPhase.Ready

    val isFailed: Boolean
        get() = phase == SplashPhase.Failed
}

enum class SplashPhase {
    Initializing, Ready, Failed, Retrying
}

@Stable
@Serializable
data class HomeUiState(
    val recordingReadiness: RecordingReadiness = RecordingReadiness.Ready,
    val supportedResolutions: List<CaptureResolution> = listOf(CaptureResolution.HD720, CaptureResolution.FHD1080, CaptureResolution.Device),
    val supportedFrameRates: List<CaptureFrameRate> = listOf(CaptureFrameRate.FPS24, CaptureFrameRate.FPS30, CaptureFrameRate.FPS60),
    val microphonePermissionGranted: Boolean = false,
    val internalAudioSupported: Boolean = false,
    val currentResolution: CaptureResolution = CaptureResolution.FHD1080,
    val currentFrameRate: CaptureFrameRate = CaptureFrameRate.FPS30
)

enum class RecordingReadiness {
    Ready, Recording, Paused, Error, Unavailable
}

@Stable
@Serializable
data class CaptureSetupUiState(
    val availableResolutions: List<CaptureResolution> = listOf(CaptureResolution.HD720, CaptureResolution.FHD1080, CaptureResolution.Device),
    val selectedResolution: CaptureResolution = CaptureResolution.FHD1080,
    val availableFrameRates: List<CaptureFrameRate> = listOf(CaptureFrameRate.FPS24, CaptureFrameRate.FPS30, CaptureFrameRate.FPS60),
    val selectedFrameRate: CaptureFrameRate = CaptureFrameRate.FPS30,
    val microphonePermissionStatus: PermissionStatus = PermissionStatus.NotDetermined,
    val internalAudioCapability: InternalAudioCapability = InternalAudioCapability.Unsupported,
    val microphoneEnabled: Boolean = true,
    val internalAudioEnabled: Boolean = false,
    val consentAvailable: Boolean = true,
    val initializationError: String? = null
)

enum class PermissionStatus {
    NotDetermined, Granted, Denied, PermanentlyDenied
}

enum class InternalAudioCapability {
    Supported, Unsupported, RequiresApi29, RequiresPermission
}

@Stable
@Serializable
data class LiveRecordingUiState(
    val elapsedTime: Long = 0,
    val currentResolution: CaptureResolution = CaptureResolution.FHD1080,
    val currentFrameRate: CaptureFrameRate = CaptureFrameRate.FPS30,
    val microphoneEnabled: Boolean = true,
    val audioLevels: List<Float> = emptyList(),
    val recording: Boolean = true,
    val paused: Boolean = false,
    val errorMessage: String? = null
) {
    val formattedElapsed: String
        get() = formatDuration(elapsedTime)

    companion object {
        fun formatDuration(millis: Long): String {
            val hours = millis / 3_600_000
            val minutes = (millis % 3_600_000) / 60_000
            val seconds = (millis % 60_000) / 1000
            return if (hours > 0) {
                String.format("%02d:%02d:%02d", hours, minutes, seconds)
            } else {
                String.format("%02d:%02d", minutes, seconds)
            }
        }
    }
}

@Stable
@Serializable
data class PauseRecordingUiState(
    val elapsedTime: Long = 0,
    val currentResolution: CaptureResolution = CaptureResolution.FHD1080,
    val currentFrameRate: CaptureFrameRate = CaptureFrameRate.FPS30,
    val format: String = "MP4",
    val canResume: Boolean = true,
    val errorMessage: String? = null
) {
    val formattedElapsed: String
        get() = LiveRecordingUiState.formatDuration(elapsedTime)
}

@Stable
@Serializable
data class RecordingResultUiState(
    val mediaId: String = "",
    val contentUri: String? = null,
    val fileName: String = "",
    val duration: Long = 0,
    val resolution: CaptureResolution = CaptureResolution.FHD1080,
    val codec: String = "H.264 / AAC",
    val fileSize: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val verified: Boolean = false,
    val previewAvailable: Boolean = true,
    val editingAvailable: Boolean = false,
    val errorMessage: String? = null
) {
    val formattedDuration: String
        get() = LiveRecordingUiState.formatDuration(duration)

    val formattedFileSize: String
        get() = formatFileSize(fileSize)

    val formattedDate: String
        get() = formatDate(timestamp)

    companion object {
        fun formatFileSize(bytes: Long): String {
            if (bytes < 1024) return "$bytes B"
            val kb = bytes / 1024
            if (kb < 1024) return "${kb} KB"
            val mb = kb / 1024
            if (mb < 1024) return String.format("%.1f MB", mb.toDouble())
            val gb = mb / 1024
            return String.format("%.1f GB", gb.toDouble())
        }

        fun formatDate(timestamp: Long): String {
            return java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date(timestamp))
        }
    }
}

@Stable
@Serializable
data class MediaLibraryUiState(
    val mediaItems: List<MediaItem> = emptyList(),
    val selectedFilter: com.knoux.rec.visualcandidate.components.MediaTypeFilter = com.knoux.rec.visualcandidate.components.MediaTypeFilter.All,
    val searchQuery: String = "",
    val totalItems: Int = 0,
    val totalStorageBytes: Long = 0,
    val loading: Boolean = false,
    val errorMessage: String? = null
) {
    val filteredItems: List<MediaItem>
        get() = if (searchQuery.isBlank()) {
            mediaItems.filter { selectedFilter == com.knoux.rec.visualcandidate.components.MediaTypeFilter.All || it.type == selectedFilter }
        } else {
            mediaItems.filter { it.title.contains(searchQuery, ignoreCase = true) }
                .filter { selectedFilter == com.knoux.rec.visualcandidate.components.MediaTypeFilter.All || it.type == selectedFilter }
        }

    val formattedTotalStorage: String
        get() = RecordingResultUiState.formatFileSize(totalStorageBytes)
}

@Stable
@Serializable
data class MediaItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val type: com.knoux.rec.visualcandidate.components.MediaTypeFilter,
    val duration: String?,
    val date: String,
    val thumbnailColor: Int = 0xFFFFDE00,
    val contentUri: String? = null,
    val fileSize: Long = 0
)

@Stable
@Serializable
data class ToolsStudioUiState(
    val arabicInputText: String = "",
    val arabicWordCount: Int = 0,
    val arabicLetterCount: Int = 0,
    val arabicDiacriticCount: Int = 0,
    val arabicIndicDigitCount: Int = 0,
    val cleanerAvailable: Boolean = true,
    val digitConverterAvailable: Boolean = true,
    val screenshotEditorPlanned: Boolean = true,
    val videoTrimmingPlanned: Boolean = true,
    val aiModelsBlocked: Boolean = true,
    val lastCleanerResult: String? = null,
    val lastConverterResult: String? = null
)

@Stable
@Serializable
data class SettingsUiState(
    val language: AppLanguage = AppLanguage.English,
    val theme: ThemeMode = ThemeMode.Dark,
    val reducedMotion: Boolean = false,
    val captureQuality: CaptureQuality = CaptureQuality.FHD1080,
    val captureFrameRate: CaptureFrameRate = CaptureFrameRate.FPS30,
    val microphonePreference: MicrophonePreference = MicrophonePreference.AskWhenNeeded,
    val storageLocation: String = "On-device MediaStore",
    val privacyPolicyUrl: String = "https://knoux.rec/privacy"
)

@Stable
@Serializable
data class DiagnosticsUiState(
    val deviceHealth: DeviceHealth = DeviceHealth.Unknown,
    val capabilities: DeviceCapabilities = DeviceCapabilities(),
    val lastCheckTimestamp: Long = 0,
    val checking: Boolean = false,
    val errorMessage: String? = null
) {
    val isHealthy: Boolean
        get() = deviceHealth == DeviceHealth.Healthy
}

enum class DeviceHealth {
    Healthy, Degraded, Critical, Unknown
}