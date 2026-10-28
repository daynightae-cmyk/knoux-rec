package com.knoux.rec.visualcandidate.integration

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.CandidateFeatureGateway
import com.knoux.rec.visualcandidate.contract.PreviewFeatureGateway
import com.knoux.rec.visualcandidate.screens.*

/**
 * INTEGRATION EXAMPLE - Shows how to use the candidate screens with a feature gateway
 * 
 * The real KNOUX REC app can use this pattern:
 * - Replace PreviewFeatureGateway with the actual implementation
 * - The screens will work with the actual services
 * - No modifications to the actual app source needed
 */
@Composable
fun CandidateAppIntegration(
    gateway: CandidateFeatureGateway = PreviewFeatureGateway(),
    onNavigation: (com.knoux.rec.visualcandidate.contract.NavigationDestination) -> Unit = {}
) {
    val splashState by gateway.splashState.collectAsState()
    val homeState by gateway.homeState.collectAsState()
    val captureSetupState by gateway.captureSetupState.collectAsState()
    val liveRecordingState by gateway.liveRecordingState.collectAsState()
    val pauseRecordingState by gateway.pauseRecordingState.collectAsState()
    val recordingResultState by gateway.recordingResultState.collectAsState()
    val mediaLibraryState by gateway.mediaLibraryState.collectAsState()
    val toolsStudioState by gateway.toolsStudioState.collectAsState()
    val settingsState by gateway.settingsState.collectAsState()
    val diagnosticsState by gateway.diagnosticsState.collectAsState()

    val handleAction: (CandidateAction) -> Unit = { action ->
        when (action) {
            is CandidateAction.StartupCompleted -> {
                if (action.success) onNavigation(com.knoux.rec.visualcandidate.contract.NavigationDestination.Home)
            }
            is CandidateAction.RetryStartup -> gateway.initialize()
            is CandidateAction.NavigateTo -> onNavigation(action.destination)
            is CandidateAction.NavigateBack -> {}
            is CandidateAction.RequestCaptureConsent -> action.callback(true)
            is CandidateAction.SetCaptureResolution -> {}
            is CandidateAction.SetCaptureFrameRate -> {}
            is CandidateAction.SetMicrophoneEnabled -> gateway.toggleMicrophone()
            is CandidateAction.SetInternalAudioEnabled -> gateway.toggleInternalAudio()
            is CandidateAction.ToggleMicrophone -> gateway.toggleMicrophone()
            is CandidateAction.ToggleInternalAudio -> gateway.toggleInternalAudio()
            is CandidateAction.PauseRecording -> gateway.pauseRecording()
            is CandidateAction.ResumeRecording -> gateway.resumeRecording()
            is CandidateAction.StopAndSaveRecording -> {
                gateway.stopAndSaveRecording()
                onNavigation(com.knoux.rec.visualcandidate.contract.NavigationDestination.RecordingResult)
            }
            is CandidateAction.TakeSnapshot -> gateway.takeSnapshot()
            is CandidateAction.PlayMedia -> gateway.playMedia(action.mediaId)
            is CandidateAction.ShareMedia -> gateway.shareMedia(action.mediaId)
            is CandidateAction.OpenMediaDetails -> {}
            is CandidateAction.DeleteMediaRequested -> gateway.deleteMedia(action.mediaId)
            is CandidateAction.SearchMedia -> {}
            is CandidateAction.SelectMediaFilter -> {}
            is CandidateAction.RunArabicCleaner -> gateway.runArabicCleaner(action.text)
            is CandidateAction.ConvertDigits -> gateway.convertDigits(action.text, action.toArabicIndic)
            is CandidateAction.SetLanguage -> gateway.setLanguage(action.language)
            is CandidateAction.SetTheme -> gateway.setTheme(action.theme)
            is CandidateAction.SetReducedMotion -> gateway.setReducedMotion(action.enabled)
            is CandidateAction.SetCaptureQuality -> gateway.setCaptureQuality(action.quality)
            is CandidateAction.SetCaptureFrameRatePref -> gateway.setCaptureFrameRate(action.frameRate)
            is CandidateAction.SetMicrophonePreference -> gateway.setMicrophonePreference(action.preference)
            is CandidateAction.RefreshDiagnostics -> gateway.refreshDiagnostics()
            is CandidateAction.OpenPermissionExplanation -> gateway.openPermissionSettings(action.permission)
            is CandidateAction.OpenStorageSettings -> gateway.openStorageSettings()
            is CandidateAction.OpenPrivacyInformation -> gateway.openPrivacyInformation()
        }
    }
}