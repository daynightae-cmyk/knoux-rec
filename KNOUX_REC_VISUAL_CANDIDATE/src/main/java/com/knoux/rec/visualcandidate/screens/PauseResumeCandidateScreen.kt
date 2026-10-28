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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.components.AdaptiveScreenLayout
import com.knoux.rec.visualcandidate.components.BackArrow
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.CaptureFrameRate
import com.knoux.rec.visualcandidate.contract.CaptureResolution
import com.knoux.rec.visualcandidate.contract.PauseRecordingUiState
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography
import com.knoux.rec.visualcandidate.components.RecordingReadiness
import com.knoux.rec.visualcandidate.components.KnouxBottomNavigation
import com.knoux.rec.visualcandidate.components.KnouxBrandHeader
import kotlin.math.max
import kotlin.math.min

@Composable
fun PauseResumeCandidateScreen(
    modifier: Modifier = Modifier,
    state: PauseRecordingUiState,
    onAction: (CandidateAction) -> Unit
) {
    val ringRotation by animateFloatAsState(
        targetValue = 0f,
        animationSpec = tween(100),
        label = "pauseRingRotation"
    ).value

    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = true,
        bottomNavTab = NavigationTab.Home,
        onBottomNavClick = { _ -> onAction(CandidateAction.NavigateBack) },
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
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Recording paused",
                                    style = CandidateTypography.HeadlineSmall.copy(fontSize = 16.sp),
                                    color = CandidateColors.PrimaryText
                                )
                                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 2.dp))
                                Text(
                                    text = "SAFE TO RESUME OR SAVE",
                                    style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
                                    color = CandidateColors.AmberWarning
                                )
                            }
                            BackArrow(
                                modifier = Modifier.padding(start = 12.dp),
                                onClick = { onAction(CandidateAction.NavigateBack) }
                            )
                        }
                    }

                    PausedStatusNotice(
                        modifier = Modifier.fillMaxWidth()
                    )

                    PauseOrbitalVisualization(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
                        time = 0f,
                        rotation = ringRotation
                    )

                    PremiumCard(
                        modifier = Modifier.fillMaxWidth(),
                        variant = PremiumCardVariant.Panel
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "CURRENT SESSION",
                                style = CandidateTypography.SectionLabel.copy(fontSize = 11.sp),
                                color = CandidateColors.PrimaryGold
                            )
                            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                InfoChip("Resolution", state.currentResolution.displayName)
                                InfoChip("Frame rate", state.currentFrameRate.displayName)
                                InfoChip("Format", state.format)
                            }
                        }
                    }

                    androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(vertical = 16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            GoldResumeButton(
                                modifier = Modifier.padding(end = 4.dp),
                                onClick = { onAction(CandidateAction.ResumeRecording) }
                            )
                            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(horizontal = 8.dp))
                            DarkStopButton(
                                modifier = Modifier.padding(end = 16.dp),
                                onClick = { onAction(CandidateAction.StopAndSaveRecording) },
                                primary = false
                            )
                        }
                    }

                    androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 24.dp))
                }
            }
        }
    )
}

@Composable
fun PausedStatusNotice(modifier: Modifier = Modifier) {
    val pulse by animateFloatAsState(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = tween(2000),
        label = "statusPulse"
    ).value

    Column(
        modifier = modifier.fillMaxWidth().padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .height(72.dp)
                .padding(horizontal = 24.dp)
                .clip(CandidateShapes.Circle)
                .background(
                    CandidateColors.AmberWarning.copy(alpha = 0.15f * pulse),
                    CandidateShapes.Circle
                )
                .border(2.dp, CandidateColors.AmberWarning.copy(alpha = 0.5f * pulse), CandidateShapes.Circle)
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val cx = width / 2f
                val cy = height / 2f
                val s = min(width, height) * 0.35f

                val dotPath = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx - s * 0.3f, cy - s * 0.3f)
                    quadTo(cx - s * 0.15f, cy, cx, cy - s * 0.3f)
                    moveTo(cx - s * 0.3f, cy + s * 0.3f)
                    quadTo(cx - s * 0.15f, cy, cx, cy + s * 0.3f)
                }
                drawPath(dotPath, CandidateColors.AmberWarning, style = androidx.compose.ui.graphics.Paint.Style.Fill)

                val pauseBarTop = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx - s * 0.2f, cy + s * 0.2f)
                    lineTo(cx + s * 0.2f, cy + s * 0.2f)
                    lineTo(cx + s * 0.2f, cy + s * 0.35f)
                    lineTo(cx - s * 0.2f, cy + s * 0.35f)
                    close()
                }
                drawPath(pauseBarTop, CandidateColors.AmberWarning, style = androidx.compose.ui.graphics.Paint.Style.Fill)

                val pauseBarBottom = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx - s * 0.2f, cy - s * 0.35f)
                    lineTo(cx + s * 0.2f, cy - s * 0.35f)
                    lineTo(cx + s * 0.2f, cy - s * 0.2f)
                    lineTo(cx - s * 0.2f, cy - s * 0.2f)
                    close()
                }
                drawPath(pauseBarBottom, CandidateColors.AmberWarning, style = androidx.compose.ui.graphics.Paint.Style.Fill)
            }
        }

        Text(
            text = "PAUSED · No new frames being captured",
            style = CandidateTypography.HeadlineSmall.copy(fontSize = 20.sp),
            color = CandidateColors.AmberWarning,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun PauseOrbitalVisualization(
    modifier: Modifier = Modifier,
    time: Float,
    rotation: Float
) {
    Canvas(modifier = modifier.fillMaxWidth().padding(horizontal = 40.dp), onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val maxDim = min(width, height)

        for (i in 0..4) {
            val radius = maxDim * (0.3f + i * 0.06f)
            val startAngle = rotation + i * (30f + 60f * (1f - i * 0.25f))
            val sweepAngle = 180f - 40f * (1f - i * 0.2f)

            val alpha = (0.05f + 0.08f * (1f - i * 0.15f)).coerceIn(0.05f, 0.25f)
            val strokeWidth = maxDim * 0.002f * (0.7f + 0.3f * (1f - i * 0.15f))

            val gapSize = 50f
            val actualStart = startAngle
            val actualSweep = sweepAngle

            val arc = androidx.compose.ui.graphics.Path().apply {
                addArc(
                    Rect(
                        Offset(cx - radius, cy - radius),
                        Offset(cx + radius, cy + radius)
                    ),
                    actualStart,
                    actualSweep
                )
            }

            val colors = listOf(
                CandidateColors.PrimaryGold.copy(alpha = alpha),
                CandidateColors.VioletAccent.copy(alpha = alpha)
            )

            drawArc(
                colors = colors,
                startAngle = actualStart,
                sweepAngle = actualSweep,
                useCenter = false,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = strokeWidth,
                topLeft = Offset(cx - radius, cy - radius),
                size = Size(radius * 2f, radius * 2f)
            ) {
                this@drawArc.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            }
        }

        val innerRadius = maxDim * 0.15f
        drawCircle(
            color = CandidateColors.DarkBackground,
            center = Offset(cx, cy),
            radius = innerRadius
        )

        val dotRadius = innerRadius * 0.4f
        drawCircle(
            color = CandidateColors.PrimaryGold,
            center = Offset(cx, cy),
            radius = dotRadius * 0.8f
        )

        // Golden play triangle
        val triSize = dotRadius * 1.5f
        val playPath = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + triSize * 0.5f, cy)
            lineTo(cx - triSize * 0.3f, cy - triSize * 0.6f)
            lineTo(cx - triSize * 0.3f, cy + triSize * 0.6f)
            close()
        }
        drawPath(playPath, CandidateColors.GoldenHighlight, style = androidx.compose.ui.graphics.Paint.Style.Fill)
    })
}

@Composable
fun GoldResumeButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(CandidateShapes.ButtonCompact)
            .background(
                Brush.verticalGradient(listOf(CandidateColors.BrightGold, CandidateColors.GoldenShadow)),
                CandidateShapes.ButtonCompact
            )
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "RESUME RECORDING",
            style = CandidateTypography.ButtonLabel,
            color = CandidateColors.DarkBackground,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun DarkStopButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    primary: Boolean = true
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    val borderColor = if (primary) CandidateColors.GoldBorder else CandidateColors.CardStrokeGold

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(CandidateShapes.ButtonCompact)
            .background(CandidateColors.DeepElevatedSurface.copy(alpha = 0.6f), CandidateShapes.ButtonCompact)
            .border(1.dp, borderColor, CandidateShapes.ButtonCompact)
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "STOP & SAVE",
            style = CandidateTypography.ButtonLabel,
            color = if (primary) CandidateColors.PrimaryGold else CandidateColors.SecondaryText,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun InfoChip(label: String, value: String) {
    Column(
        modifier = Modifier
            .weight(1f)
            .padding(end = 24.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        Text(
            text = value,
            style = CandidateTypography.HeadlineMedium.copy(fontSize = 18.sp),
            color = CandidateColors.PrimaryGold
        )
        Text(
            text = label,
            style = CandidateTypography.SectionLabel.copy(fontSize = 9.sp),
            color = CandidateColors.TertiaryText
        )
    }
}