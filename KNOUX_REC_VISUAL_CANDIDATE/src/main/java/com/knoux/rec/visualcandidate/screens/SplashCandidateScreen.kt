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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.px
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.components.CosmicBackground
import com.knoux.rec.visualcandidate.components.GoldenOrbitalSystem
import com.knoux.rec.visualcandidate.components.GoldenParticlesLayer
import com.knoux.rec.visualcandidate.components.KnouxBrandHeader
import com.knoux.rec.visualcandidate.components.KnouxSplashBranding
import com.knoux.rec.visualcandidate.components.KnouxSplashTagline
import com.knoux.rec.visualcandidate.components.PremiumCard
import com.knoux.rec.visualcandidate.components.PremiumCardVariant
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.SplashUiState
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

@Composable
fun SplashCandidateScreen(
    modifier: Modifier = Modifier,
    state: SplashUiState,
    onAction: (CandidateAction) -> Unit
) {
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "splashAmbient")
    val ambientTime by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 40000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "ambientTime"
    )

    val progressAnimated = androidx.compose.animation.core.animateFloatAsState(
        targetValue = state.progress,
        animationSpec = tween(500),
        label = "progressAnimation"
    ).value

    FullScreenLayout(modifier) { _, _ ->
        Box(modifier = Modifier.fillMaxSize()) {
            CosmicBackground(
                modifier = Modifier.fillMaxSize(),
                showStars = true,
                showNebula = true,
                animate = true
            )

            GoldenOrbitalSystem(
                modifier = Modifier.fillMaxSize(),
                ringCount = 5,
                animate = true,
                centerX = 0.5f,
                centerY = 0.35f,
                baseRadius = 0.15f,
                ringSpacing = 0.06f
            )

            GoldenParticlesLayer(
                modifier = Modifier.fillMaxSize(),
                particleCount = 30,
                centerX = 0.5f,
                centerY = 0.35f,
                radius = 0.4f,
                animate = true
            )

            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Top,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 60.dp))

                KnouxSplashTagline()

                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 40.dp))

                KnouxSplashBranding()

                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.weight(1f))

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 32.dp, bottom = 40.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    PremiumCard(
                        modifier = Modifier.fillMaxWidth(),
                        variant = PremiumCardVariant.Glass
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = state.statusMessage,
                                style = CandidateTypography.SectionLabel.copy(fontSize = 11.sp),
                                color = CandidateColors.PrimaryGold.copy(alpha = 0.8f)
                            )

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(4.dp)
                                    .clip(CandidateShapes.ProgressTrack)
                                    .background(CandidateColors.CardStroke.copy(alpha = 0.2f), CandidateShapes.ProgressTrack)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .width(progressAnimated)
                                        .fillMaxHeight()
                                        .clip(CandidateShapes.ProgressTrack)
                                        .background(
                                            Brush.horizontalGradient(
                                                colors = listOf(
                                                    CandidateColors.PrimaryGold,
                                                    CandidateColors.BrightGold,
                                                    CandidateColors.GoldenShadow
                                                )
                                            ),
                                            CandidateShapes.ProgressTrack
                                        )
                                )
                            }

                            when (state.phase) {
                                SplashUiState.SplashPhase.Failed -> {
                                    Text(
                                        text = state.errorMessage ?: "Initialization failed",
                                        style = CandidateTypography.BodySmall,
                                        color = CandidateColors.RecordingRedBright,
                                        textAlign = TextAlign.Center
                                    )
                                    if (state.canRetry) {
                                        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 8.dp))
                                        com.knoux.rec.visualcandidate.components.GhostAction(
                                            text = "RETRY INITIALIZATION",
                                            onClick = { onAction(CandidateAction.RetryStartup()) },
                                            color = CandidateColors.PrimaryGold
                                        )
                                    }
                                }
                                SplashUiState.SplashPhase.Retrying -> {
                                    Text(
                                        text = "RETRYING...",
                                        style = CandidateTypography.BodySmall,
                                        color = CandidateColors.PrimaryGold,
                                        textAlign = TextAlign.Center
                                    )
                                }
                                SplashUiState.SplashPhase.Ready -> {
                                    Text(
                                        text = "STUDIO READY",
                                        style = CandidateTypography.SectionLabel.copy(fontSize = 11.sp),
                                        color = CandidateColors.SuccessGreenBright,
                                        textAlign = TextAlign.Center
                                    )
                                }
                                else -> {
                                    Text(
                                        text = "ANDROID 8+ · NATIVE EXPERIENCE",
                                        style = CandidateTypography.Caption.copy(fontSize = 10.sp),
                                        color = CandidateColors.TertiaryText,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    }
                }
            }

            EarthAtmosphereLayer(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 200.dp, bottom = 100.dp),
                time = ambientTime
            )

            FloatingMediaPanels(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 250.dp, bottom = 150.dp),
                time = ambientTime
            )

            GoldenStage(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .padding(bottom = 120.dp, horizontal = 40.dp),
                time = ambientTime
            )
        }
    }
}

@Composable
fun EarthAtmosphereLayer(
    modifier: Modifier = Modifier,
    time: Float
) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width * 0.5f
        val cy = height * 0.6f
        val radius = min(width, height) * 0.25f

        for (i in 0..2) {
            val layerRadius = radius * (1f + i * 0.15f)
            val alpha = (0.08f - i * 0.02f) * (0.7f + 0.3f * sin(time * 0.001f * 0.5f + i * 1.2f))
            drawCircle(
                color = CandidateColors.CyanAccent.copy(alpha = alpha),
                center = Offset(cx, cy),
                radius = layerRadius,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = max(width, height) * 0.001f
            )
        }

        val landColor = CandidateColors.VioletAccent.copy(alpha = 0.15f)
        val continentCount = 6
        for (i in 0 until continentCount) {
            val angle = (i * 360f / continentCount + time * 0.001f * 2f) * PI / 180f
            val dist = radius * 0.6f
            val x = cx + cos(angle) * dist
            val y = cy + sin(angle) * dist * 0.5f
            val size = radius * 0.15f * (0.5f + 0.5f * sin(time * 0.001f + i * 1.5f))

            val continent = Path().apply {
                addOval(Rect(Offset(x - size, y - size * 0.6f), Offset(x + size, y + size * 0.6f)))
            }
            drawPath(
                path = continent,
                color = landColor,
                style = androidx.compose.ui.graphics.Paint.Style.Fill
            )
        }

        val glowRadius = radius * 1.1f
        drawCircle(
            color = CandidateColors.CyanAccent.copy(alpha = 0.05f),
            center = Offset(cx, cy),
            radius = glowRadius
        )
    })
}

@Composable
fun FloatingMediaPanels(
    modifier: Modifier = Modifier,
    time: Float
) {
    val panels = remember {
        listOf(
            FloatingPanel(-0.35f, -0.2f, 0.18f, 0.12f, CandidateColors.CyanAccent, "SCREEN"),
            FloatingPanel(0.35f, -0.15f, 0.16f, 0.14f, CandidateColors.VioletAccent, "AUDIO"),
            FloatingPanel(-0.25f, 0.25f, 0.14f, 0.1f, CandidateColors.SuccessGreen, "IMAGE"),
            FloatingPanel(0.3f, 0.3f, 0.15f, 0.11f, CandidateColors.AmberWarning, "VIDEO")
        )
    }

    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()

        for (panel in panels) {
            val x = width * (0.5f + panel.offsetX)
            val y = height * (0.5f + panel.offsetY)
            val w = width * panel.widthRatio
            val h = height * panel.heightRatio

            val floatY = y + sin(time * 0.001f * 0.8f + panel.phase) * 15f
            val floatX = x + cos(time * 0.001f * 0.6f + panel.phase) * 8f

            val rect = Rect(
                Offset(floatX - w / 2f, floatY - h / 2f),
                Offset(floatX + w / 2f, floatY + h / 2f)
            )

            val bgBrush = Brush.verticalGradient(
                colors = listOf(
                    panel.color.copy(alpha = 0.2f),
                    panel.color.copy(alpha = 0.05f)
                )
            )
            drawRect(
                brush = bgBrush,
                rect = rect,
                style = androidx.compose.ui.graphics.Paint.Style.Fill
            )

            drawRoundRect(
                brush = Brush.horizontalGradient(
                    colors = listOf(
                        panel.color.copy(alpha = 0.5f),
                        panel.color.copy(alpha = 0.1f)
                    )
                ),
                rect = rect,
                cornerRadius = 8f
            )

            val textSize = min(w, h) * 0.15f
            drawText(
                text = androidx.compose.ui.text.AnnotatedString(panel.label),
                color = panel.color,
                offset = Offset(floatX - w * 0.3f, floatY - textSize / 2f),
                style = androidx.compose.ui.text.TextStyle(
                    fontSize = textSize,
                    fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                    color = panel.color
                )
            )
        }
    })
}

data class FloatingPanel(
    val offsetX: Float,
    val offsetY: Float,
    val widthRatio: Float,
    val heightRatio: Float,
    val color: Color,
    val label: String,
    val phase: Float = 0f
) {
    init {
        if (phase == 0f) {
            this.phase = java.util.Random().nextFloat() * 2f * PI
        }
    }
}

@Composable
fun GoldenStage(
    modifier: Modifier = Modifier,
    time: Float
) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height * 0.8f
        val stageWidth = width * 0.6f
        val stageHeight = height * 0.6f

        val stageBrush = Brush.verticalGradient(
            colors = listOf(
                CandidateColors.DeepElevatedSurface,
                CandidateColors.DarkBackground
            )
        )
        drawRoundRect(
            brush = stageBrush,
            rect = Rect(Offset(cx - stageWidth / 2f, cy - stageHeight), Offset(cx + stageWidth / 2f, cy)),
            cornerRadius = 8f
        )

        drawLine(
            color = CandidateColors.PrimaryGold.copy(alpha = 0.3f),
            start = Offset(cx - stageWidth / 2f, cy - stageHeight),
            end = Offset(cx + stageWidth / 2f, cy - stageHeight),
            strokeWidth = 1.5f
        )

        val reflectionCount = 5
        for (i in 0 until reflectionCount) {
            val rx = cx - stageWidth / 2f + stageWidth * (i + 0.5f) / reflectionCount
            val alpha = (0.1f + 0.15f * sin(time * 0.001f * 2f + i * 1.3f))
            drawLine(
                color = CandidateColors.PrimaryGold.copy(alpha = alpha),
                start = Offset(rx, cy - stageHeight),
                end = Offset(rx + sin(time * 0.001f + i) * 5f, cy),
                strokeWidth = 0.5f
            )
        }
    })
}

@Composable
fun FullScreenLayout(
    modifier: Modifier = Modifier,
    content: @Composable (Modifier, androidx.compose.ui.window.WindowInsets) -> Unit
) {
    val insets = remember { mutableStateOf(androidx.compose.ui.window.WindowInsets(0, 0, 0, 0)) }
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(CandidateColors.DarkBackground)
    ) {
        content(Modifier.fillMaxSize(), insets.value)
    }
}