package com.knoux.rec.visualcandidate.contract

import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import androidx.navigation.NavHost
import androidx.navigation.NavType
import androidx.navigation.composable.composable
import androidx.navigation.compose.rememberNavController

@Composable
fun CandidateNavHost(
    startDestination: String = NavigationDestination.Home.name,
    builder: NavController.() -> Unit
) {
    val navController = rememberNavController()
    NavHost(navController, startDestination) {
        builder(navController)
    }
}

fun NavController.addCandidateScreens(
    onAction: (CandidateAction) -> Unit
) {
    composable(NavigationDestination.Splash.name) {
        com.knoux.rec.visualcandidate.screens.SplashCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.splashState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.Home.name) {
        com.knoux.rec.visualcandidate.screens.HomeCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.homeState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.CaptureSetup.name) {
        com.knoux.rec.visualcandidate.screens.CaptureSetupCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.captureSetupState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.LiveRecording.name) {
        com.knoux.rec.visualcandidate.screens.LiveRecordingCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.liveRecordingState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.PauseRecording.name) {
        com.knoux.rec.visualcandidate.screens.PauseResumeCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.pauseRecordingState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.RecordingResult.name) {
        com.knoux.rec.visualcandidate.screens.RecordingResultCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.recordingResultState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.MediaLibrary.name) {
        com.knoux.rec.visualcandidate.screens.MediaLibraryCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.mediaLibraryState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.ToolsStudio.name) {
        com.knoux.rec.visualcandidate.screens.ToolsStudioCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.toolsStudioState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.Settings.name) {
        com.knoux.rec.visualcandidate.screens.SettingsCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.settingsState,
            onAction = onAction
        )
    }
    composable(NavigationDestination.Diagnostics.name) {
        com.knoux.rec.visualcandidate.screens.DiagnosticsCandidateScreen(
            state = com.knoux.rec.visualcandidate.preview.CandidatePreviewData.diagnosticsState,
            onAction = onAction
        )
    }
}

@Composable
fun CandidateNavigationHelper(
    navController: NavController,
    onAction: (CandidateAction) -> Unit
) {
    androidx.compose.runtime.DisposableEffect(Unit) {
        onAction(CandidateAction.NavigateTo(NavigationDestination.Splash))
        onDispose {}
    }
}