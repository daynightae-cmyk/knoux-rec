package com.knoux.rec.visualcandidate.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.components.AdaptiveScreenLayout
import com.knoux.rec.visualcandidate.components.KnouxBrandHeader
import com.knoux.rec.visualcandidate.components.NavigationTab
import com.knoux.rec.visualcandidate.components.PremiumCard
import com.knoux.rec.visualcandidate.components.PremiumCardVariant
import com.knoux.rec.visualcandidate.components.SectionHeader
import com.knoux.rec.visualcandidate.components.StatusBadge
import com.knoux.rec.visualcandidate.components.StatusBadgeVariant
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.CapabilityStatus
import com.knoux.rec.visualcandidate.contract.DiagnosticsUiState
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun DiagnosticsCandidateScreen(
    modifier: Modifier = Modifier,
    state: DiagnosticsUiState,
    onAction: (CandidateAction) -> Unit
) {
    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = true,
        bottomNavTab = NavigationTab.Settings,
        onBottomNavClick = { tab ->
            when (tab) {
                NavigationTab.Home -> onAction(CandidateAction.NavigateTo(NavigationDestination.Home))
                NavigationTab.Library -> onAction(CandidateAction.NavigateTo(NavigationDestination.MediaLibrary))
                NavigationTab.Tools -> onAction(CandidateAction.NavigateTo(NavigationDestination.ToolsStudio))
                NavigationTab.Settings -> onAction(CandidateAction.NavigateTo(NavigationDestination.Settings))
                NavigationTab.Diagnostics -> {}
            }
        },
        topBar = {
            KnouxBrandHeader(
                modifier = Modifier.fillMaxWidth(),
                showBadge = false,
                showSubtitle = false,
                compact = true
            )
        },
        content = { contentModifier, insets ->
            Box(contentModifier.fillMaxSize().padding(bottom = 88.dp + insets.bottom.dp)) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Diagnostics",
                            style = CandidateTypography.HeadlineSmall.copy(fontSize = 16.sp),
                            color = CandidateColors.PrimaryText
                        )
                        Text(
                            text = "DEVICE CAPABILITIES · LOCAL CHECKS",
                            style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
                            color = CandidateColors.PrimaryGold
                        )
                    }

                    DeviceHealthHero(
                        modifier = Modifier.fillMaxWidth(),
                        state = state,
                        onRefreshClick = { onAction(CandidateAction.RefreshDiagnostics) }
                    )

                    SectionHeader(
                        title = "CAPABILITY REPORT",
                        subtitle = "System services",
                        accentColor = CandidateColors.CyanAccent
                    )

                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 32.dp)
                    ) {
                        item {
                            CapabilityStatusRow(
                                title = "Screen projection",
                                subtitle = "MediaProjection permission",
                                status = state.capabilities.screenProjection,
                                onClick = { onAction(CandidateAction.OpenPermissionExplanation("SCREEN_PROJECTION")) }
                            )
                        }
                        item {
                            CapabilityStatusRow(
                                title = "H.264 encoder",
                                subtitle = "Video encoding",
                                status = state.capabilities.h264Encoder,
                                onClick = null
                            )
                        }
                        item {
                            CapabilityStatusRow(
                                title = "Microphone recording",
                                subtitle = "Audio input",
                                status = state.capabilities.microphoneRecording,
                                onClick = { onAction(CandidateAction.OpenPermissionExplanation("MICROPHONE")) }
                            )
                        }
                        item {
                            CapabilityStatusRow(
                                title = "Internal audio",
                                subtitle = "Android 10+ only",
                                status = state.capabilities.internalAudio,
                                onClick = null
                            )
                        }
                        item {
                            CapabilityStatusRow(
                                title = "Local media access",
                                subtitle = "Scoped storage",
                                status = state.capabilities.localMediaAccess,
                                onClick = { onAction(CandidateAction.OpenPermissionExplanation("MEDIA_ACCESS")) }
                            )
                        }
                        item {
                            CapabilityStatusRow(
                                title = "Model inference",
                                subtitle = "No bundled weights",
                                status = state.capabilities.modelInference,
                                onClick = null
                            )
                        }
                    }

                    Box(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No background telemetry · Local checks only",
                            style = CandidateTypography.Caption,
                            color = CandidateColors.TertiaryText
                        )
                    }
                }
            }
        }
    )
}

@Composable
fun DeviceHealthHero(
    modifier: Modifier = Modifier,
    state: DiagnosticsUiState,
    onRefreshClick: () -> Unit
) {
    PremiumCard(
        modifier = modifier.fillMaxWidth(),
        variant = PremiumCardVariant.Hero
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CandidateShapes.Circle)
                        .background(
                            if (state.isHealthy) CandidateColors.SuccessGreen.copy(alpha = 0.15f) else CandidateColors.AmberWarning.copy(alpha = 0.15f),
                            CandidateShapes.Circle
                        )
                        .border(
                            2.dp,
                            if (state.isHealthy) CandidateColors.SuccessGreen else CandidateColors.AmberWarning,
                            CandidateShapes.Circle
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    DeviceChipIcon(Modifier.size(32.dp), if (state.isHealthy) CandidateColors.SuccessGreen else CandidateColors.AmberWarning)
                }
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = if (state.checking) "CHECKING..." else if (state.isHealthy) "SYSTEM READY" else "DEGRADED",
                        style = CandidateTypography.HeadlineMedium.copy(fontSize = 20.sp),
                        color = if (state.checking) CandidateColors.CyanAccent else if (state.isHealthy) CandidateColors.SuccessGreen else CandidateColors.AmberWarning
                    )
                    Text(
                        text = "Device health",
                        style = CandidateTypography.BodyMedium,
                        color = CandidateColors.SecondaryText
                    )
                    Text(
                        text = "Transparent status, no simulated services.",
                        style = CandidateTypography.BodySmall,
                        color = CandidateColors.TertiaryText
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                RefreshButton(
                    modifier = Modifier.weight(1f),
                    onClick = onRefreshClick,
                    enabled = !state.checking,
                    loading = state.checking
                )
                CapabilityCountBadge(
                    count: Int = state.capabilities.run { 
                        listOf(screenProjection, h264Encoder, microphoneRecording, internalAudio, localMediaAccess, modelInference)
                            .count { it == CapabilityStatus.Supported }
                    }
                )
            }
        }
    }
}

@Composable
private fun DeviceChipIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)
        val sw = s * 0.08f

        val rect = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(Rect(Offset(cx - s * 0.35f, cy - s * 0.25f), Size(s * 0.7f, s * 0.5f)), s * 0.08f)
        }
        drawPath(rect, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        for (i in 0..2) {
            val yOffset = (i - 1) * s * 0.15f
            val pin = androidx.compose.ui.graphics.Path().apply {
                moveTo(cx - s * 0.4f, cy + yOffset)
                lineTo(cx - s * 0.35f, cy + yOffset)
            }
            drawPath(pin, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
                this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            }

            val pin2 = androidx.compose.ui.graphics.Path().apply {
                moveTo(cx + s * 0.35f, cy + yOffset)
                lineTo(cx + s * 0.4f, cy + yOffset)
            }
            drawPath(pin2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
                this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            }
        }

        drawCircle(color = color, center = Offset(cx - s * 0.1f, cy - s * 0.05f), radius = s * 0.02f)
        drawCircle(color = color, center = Offset(cx + s * 0.1f, cy - s * 0.05f), radius = s * 0.02f)
    })
}

@Composable
private fun RefreshButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    enabled: Boolean = true,
    loading: Boolean = false
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    Box(
        modifier = modifier
            .clip(CandidateShapes.ButtonCompact)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onPress = { pressed.value = true },
                    onRelease = { pressed.value = false },
                    onTap = { if (enabled) onClick() }
                )
            }
            .background(
                if (enabled) CandidateColors.CyanAccent.copy(alpha = 0.15f) else CandidateColors.DisabledSurface,
                CandidateShapes.ButtonCompact
            )
            .border(1.dp, if (enabled) CandidateColors.CyanAccent else CandidateColors.DisabledStroke, CandidateShapes.ButtonCompact)
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = CandidateColors.CyanAccent,
                    strokeWidth = 2.dp
                )
            } else {
                Canvas(modifier = Modifier.size(16.dp), onDraw = {
                    val width = size.width.toFloat()
                    val height = size.height.toFloat()
                    val cx = width / 2f
                    val cy = height / 2f
                    val s = min(width, height)
                    val sw = s * 0.12f

                    val path = androidx.compose.ui.graphics.Path().apply {
                        moveTo(cx, cy - s * 0.3f)
                        lineTo(cx + s * 0.2f, cy - s * 0.1f)
                        lineTo(cx, cy - s * 0.1f)
                        close()
                        moveTo(cx, cy + s * 0.3f)
                        lineTo(cx - s * 0.2f, cy + s * 0.1f)
                        lineTo(cx, cy + s * 0.1f)
                        close()
                    }
                    drawPath(path, CandidateColors.CyanAccent, style = androidx.compose.ui.graphics.Paint.Style.Fill)
                })
            }
            Text(
                text = if (loading) "CHECKING" else "REFRESH",
                style = CandidateTypography.LabelLarge.copy(fontSize = 11.sp),
                color = if (enabled) CandidateColors.CyanAccent else CandidateColors.DisabledText
            )
        }
    }
}

@Composable
private fun CapabilityCountBadge(count: Int) {
    Box(
        modifier = Modifier
            .clip(CandidateShapes.ButtonCompact)
            .background(CandidateColors.PrimaryGold.copy(alpha = 0.15f), CandidateShapes.ButtonCompact)
            .border(1.dp, CandidateColors.GoldBorder, CandidateShapes.ButtonCompact)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = count.toString(),
                style = CandidateTypography.HeadlineMedium.copy(fontSize = 18.sp),
                color = CandidateColors.PrimaryGold
            )
            Text(
                text = "/ 6",
                style = CandidateTypography.BodyMedium,
                color = CandidateColors.SecondaryText
            )
        }
    }
}