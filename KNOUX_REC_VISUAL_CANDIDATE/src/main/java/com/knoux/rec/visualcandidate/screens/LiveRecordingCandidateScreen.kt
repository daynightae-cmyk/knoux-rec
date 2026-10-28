package com.knoux.rec.visualcandidate.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.components.AdaptiveScreenLayout
import com.knoux.rec.visualcandidate.components.MicWaveformCard
import com.knoux.rec.visualcandidate.components.RecordingStopButton
import com.knoux.rec.visualcandidate.components.StatusBadge
import com.knoux.rec.visualcandidate.components.ThreeOptionSelector
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.CaptureFrameRate
import com.knoux.rec.visualcandidate.contract.CaptureResolution
import com.knoux.rec.visualcandidate.contract.LiveRecordingUiState
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography
import com.knoux.rec.visualcandidate.components.NavigationTab
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.contract.RecordingReadiness
import com.knoux.rec.visualcandidate.components.KnouxBottomNavigation
import com.knoux.rec.visualcandidate.components.KnouxBrandHeader
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

@Composable
fun LiveRecordingCandidateScreen(
    modifier: Modifier = Modifier,
    state: LiveRecordingUiState,
    onAction: (CandidateAction) -> Unit
) {
    val waveformAnimation by animateFloatAsState(
        targetValue = state.microphoneEnabled && state.audioLevels.isNotEmpty() ?: 0f,
        animationSpec = tween(100),
        label = "waveform"
    ).value

    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = true,
        bottomNavTab = NavigationTab.LiveRecording,
        onBottomNavClick = { tab ->
            when (tab) {
                NavigationTab.Home -> onAction(CandidateAction.NavigateBack)
                NavigationTab.Library -> onAction(CandidateAction.NavigateTo(NavigationDestination.MediaLibrary))
                NavigationTab.Tools -> onAction(CandidateAction.NavigateTo(NavigationDestination.ToolsStudio))
                NavigationTab.Settings -> onAction(CandidateAction.NavigateTo(NavigationDestination.Settings))
                NavigationTab.Diagnostics -> onAction(CandidateAction.NavigateBack)
            }
        },
        topBar = {
            KnouxBrandHeader(
                modifier = Modifier.fillMaxWidth(),
                showBadge = false,
                showSubtitle = true,
                compact = true
            )
        },
        content = { contentModifier, insets ->
            Box(contentModifier.fillMaxSize().padding(bottom = 88.dp + insets.bottom.dp)) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Live capture",
                                style = CandidateTypography.HeadlineSmall.copy(fontSize = 16.sp),
                                color = CandidateColors.PrimaryText
                            )
                            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 2.dp))
                            Text(
                                text = "RECORDING IN PROGRESS",
                                style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
                                color = CandidateColors.RecordingRedBright
                            )
                        }
                        StatusBadge(
                            text = "REC",
                            variant = StatusBadgeVariant.Red,
                            icon = { RecordingRedBadge() }
                        )
                    }
                }

                RecordingStatusStrip(
                    modifier = Modifier.fillMaxWidth(),
                    recording = state.recording,
                    resolution = state.currentResolution,
                    frameRate = state.currentFrameRate
                )

                LargeElapsedTimer(
                    modifier = Modifier.fillMaxWidth(),
                    elapsedTime = state.elapsedTime,
                    isPaused = state.paused
                )

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MicWaveformCard(
                        modifier = Modifier.fillMaxWidth(),
                        audioLevels = state.audioLevels,
                        enabled = state.microphoneEnabled && !state.paused,
                        paused = state.paused
                    )
                }

                SectionHeader(
                    title = "CONTROL ROOM",
                    subtitle = "Stay in control",
                    accentColor = CandidateColors.CyanAccent
                )

                RecordingControlRow(
                    modifier = Modifier.fillMaxWidth(),
                    recording = state.recording,
                    microphoneEnabled = state.microphoneEnabled,
                    canTakeSnapshot = !state.paused,
                    onToggleMicrophone = { onAction(CandidateAction.ToggleMicrophone) },
                    onPauseRecording = { onAction(CandidateAction.PauseRecording) },
                    onTakeSnapshot = { onAction(CandidateAction.TakeSnapshot) }
                )

                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(vertical = 16.dp))

                TwoColumnGrid(
                    modifier = Modifier.fillMaxWidth(),
                    content = {
                        RecordingSummaryCard(
                            label = "ELAPSED",
                            value = state.formattedElapsed
                        )
                        RecordingSummaryCard(
                            label = "OUTPUT",
                            value = "${state.currentResolution.displayName} · ${state.currentFrameRate.displayName}"
                        )
                    }
                )

                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 24.dp))

                GoldenPrimaryAction(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp),
                    text = "STOP & SAVE RECORDING",
                    onClick = { onAction(CandidateAction.StopAndSaveRecording) },
                    enabled = state.recording,
                    loading = false
                )

                if (!state.recording) {
                    androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(vertical = 24.dp))
                    Text(
                        text = "Recording has been stopped.",
                        style = CandidateTypography.BodyMedium,
                        color = CandidateColors.TertiaryText,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    )
}

@Composable
fun RecordingRedBadge(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .size(36.dp)
            .clip(CandidateShapes.Circle)
            .background(CandidateColors.RecordingRed.copy(alpha = 0.2f), CandidateShapes.Circle)
            .border(2.dp, CandidateColors.RecordingRed, CandidateShapes.Circle)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width.toFloat()
            val height = size.height.toFloat()
            val cx = width / 2f
            val cy = height / 2f
            val r = min(width, height) * 0.45f
            val strokeWidth = max(width, height) * 0.05f

            val path = androidx.compose.ui.graphics.Path().apply {
                moveTo(cx, cy - r)
                lineTo(cx + r, cy + r)
                moveTo(cx + r, cy - r)
                lineTo(cx - r, cy + r)
            }
            drawPath(path, Color.White, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            }
        }
    }
}

@Composable
fun RecordingStatusStrip(
    modifier: Modifier = Modifier,
    recording: Boolean,
    resolution: CaptureResolution,
    frameRate: CaptureFrameRate
) {
    val leftContent = Column(
        modifier = Modifier.padding(start = 16.dp, horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .clip(CandidateShapes.Circle)
                .background(
                    if (recording) CandidateColors.RecordingRed.copy(alpha = 0.9f) else CandidateColors.TertiaryText.copy(alpha = 0.5f),
                    CandidateShapes.Circle
                )
        ) {
            Canvas(modifier = Modifier.size(12.dp)) {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val cx = width / 2f
                val cy = height / 2f
                val r = width / 2f
                val dot = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx - r * 0.3f, cy)
                    lineTo(cx + r * 0.3f, cy)
                    moveTo(cx, cy - r * 0.3f)
                    lineTo(cx, cy + r * 0.3f)
                }
                drawPath(dot, Color.White, style = androidx.compose.ui.graphics.Paint.Style.Fill)
            }
        }
        Text(
            text = "RECORDING",
            style = CandidateTypography.LabelSmall.copy(fontSize = 10.sp),
            color = if (recording) CandidateColors.RecordingRedBright else CandidateColors.TertiaryText
        )
    }

    val rightContent = Column(
        modifier = Modifier.padding(end = 16.dp, horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        Text(
            text = resolution.displayName,
            style = CandidateTypography.LabelLarge.copy(fontSize = 16.sp),
            color = CandidateColors.PrimaryGold
        )
        Text(
            text = frameRate.displayName,
            style = CandidateTypography.BodySmall,
            color = CandidateColors.SecondaryText
        )
    }

    Box(
        modifier = modifier.fillMaxWidth().clip(CandidateShapes.PanelCompact),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxHeight().padding(vertical = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                contentPadding = androidx.compose.foundation.layout.PaddingValues(8.dp)
            ) {
                leftContent
                rightContent
            }
        }
    }
}

@Composable
fun LargeElapsedTimer(
    modifier: Modifier = Modifier,
    elapsedTime: Long,
    isPaused: Boolean
) {
    val scale = androidx.compose.animation.core.animateFloatAsState(
        targetValue = if (isPaused) 0.85f else 1f,
        animationSpec = tween(300),
        label = "timerScale"
    ).value

    Box(
        modifier = modifier
            .padding(horizontal = 24.dp)
            .scale(scale),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width.toFloat()
            val height = size.height.toFloat()
            val cx = width / 2f
            val cy = height / 2f

            val bgBrush = Brush.radialGradient(
                colors = listOf(
                    Color.Transparent,
                    CandidateColors.DarkBackground.copy(alpha = 0.9f),
                    CandidateColors.DarkBackground.copy(alpha = 0.98f)
                ),
                center = Offset(cx, cy),
                radius = max(width, height) * 0.5f
            )
            drawRect(brush = bgBrush, rect = Rect(Offset.Zero, Size(width, height)))

            val ringRadius = min(width, height) * 0.35f
            drawCircle(
                color = CandidateColors.RecordingRedBright.copy(alpha = 0.15f),
                center = Offset(cx, cy),
                radius = ringRadius,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = max(width, height) * 0.004f
            )

            val textColor = if (isPaused) CandidateColors.AmberWarning.copy(alpha = 0.8f) else CandidateColors.PrimaryGold
            drawText(
                text = LiveRecordingUiState.formatDuration(elapsedTime),
                color = textColor,
                offset = Offset(cx - textWidth / 2f, cy - textHeight / 2f),
                style = CandidateTypography.TimerDisplayCompact
            )
        }
    }
}

@Composable
fun RecordingControlRow(
    modifier: Modifier = Modifier,
    recording: Boolean,
    microphoneEnabled: Boolean,
    canTakeSnapshot: Boolean,
    onToggleMicrophone: () -> Unit,
    onPauseRecording: () -> Unit,
    onTakeSnapshot: () -> Unit
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        IconActionButton(
            modifier = Modifier.weight(1f),
            icon = { MicrophoneControlIcon(it, CandidateColors.CyanAccent) },
            onClick = onToggleMicrophone,
            enabled = recording && microphoneEnabled,
            backgroundColor = CandidateColors.CyanAccent.copy(alpha = 0.15f),
            iconColor = CandidateColors.CyanAccent
        )
        IconActionButton(
            modifier = Modifier.weight(1f),
            icon = { PauseControlIcon(it, CandidateColors.AmberWarning) },
            onClick = onPauseRecording,
            enabled = recording,
            backgroundColor = CandidateColors.AmberWarning.copy(alpha = 0.15f),
            iconColor = CandidateColors.AmberWarning
        )
        IconActionButton(
            modifier = Modifier
                .weight(1f)
                .size(72.dp)
                .clip(CandidateShapes.Circle)
                .padding(horizontal = 12.dp)
                .background(CandidateColors.VioletAccent.copy(alpha = 0.1f), CandidateShapes.Circle),
            icon = { SnapshotControlIcon(it, CandidateColors.VioletAccent) },
            onClick = onTakeSnapshot,
            enabled = canTakeSnapshot,
            backgroundColor = Color.Transparent,
            iconColor = CandidateColors.VioletAccent
        )
    }
}

@Composable
fun RecordingSummaryCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String
) {
    androidx.compose.foundation.layout.Column(
        modifier = modifier
            .weight(1f, fill = true)
            .padding(16.dp)
    ) {
        Text(
            text = value,
            style = CandidateTypography.HeadlineMedium.copy(fontSize = 20.sp),
            color = CandidateColors.PrimaryGold,
            textAlign = TextAlign.Center
        )
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
        Text(
            text = label,
            style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
            color = CandidateColors.TertiaryText,
            textAlign = TextAlign.Center
        )
    }
}

private fun MicrophoneControlIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier) {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.08f

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx, cy + s * 0.3f)
            quadTo(cx, cy, cx - s * 0.3f, cy)
            quadTo(cx, cy, cx, cy + s * 0.3f)
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Fill)

        val waveLine = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.3f, cy - s * 0.1f)
            quadTo(cx - s * 0.4f, cy - s * 0.2f, cx - s * 0.3f, cy + s * 0.1f)
            moveTo(cx + s * 0.2f, cy - s * 0.1f)
            quadTo(cx + s * 0.3f, cy - s * 0.2f, cx + s * 0.2f, cy + s * 0.1f)
        }
        drawPath(waveLine, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f)
    }
}

private fun PauseControlIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier) {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.08f

        for (i in 0 until 2) {
            val offset = i == 0 ?: -s * 0.25f
            val pauseY = cy + offset

            val topBar = androidx.compose.ui.graphics.Path().apply {
                moveTo(cx - s * 0.3f, pauseY - s * 0.2f)
                lineTo(cx + s * 0.3f, pauseY - s * 0.2f)
            }
            drawPath(topBar, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            }

            val bottomBar = androidx.compose.ui.graphics.Path().apply {
                moveTo(cx - s * 0.3f, pauseY + s * 0.2f)
                lineTo(cx + s * 0.3f, pauseY + s * 0.2f)
            }
            drawPath(bottomBar, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            }
        }
    }
}

private fun SnapshotControlIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier) {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.08f

        val rect = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(
                Rect(Offset(cx - s * 0.3f, cy - s * 0.15f), Size(s * 0.6f, s * 0.3f)),
                cornerRadius = s * 0.08f
            )
        }
        drawPath(rect, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val playPath = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.1f, cy)
            lineTo(cx - s * 0.05f, cy - s * 0.15f)
            lineTo(cx + s * 0.1f, cy - s * 0.15f)
            close()
        }
        drawPath(playPath, color, style = androidx.compose.ui.graphics.Paint.Style.Fill)
    }
}

@Composable
fun TwoColumnGrid(
    modifier: Modifier = Modifier,
    horizontalSpacing: androidx.compose.ui.unit.Dp = 16.dp,
    verticalSpacing: androidx.compose.ui.unit.Dp = 16.dp,
    content: @Composable () -> Unit
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(horizontalSpacing)
        ) {
            content()
            content()
        }
    }
}