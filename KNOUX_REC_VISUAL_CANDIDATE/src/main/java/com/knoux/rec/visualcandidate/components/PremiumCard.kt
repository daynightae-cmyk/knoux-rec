package com.knoux.rec.visualcandidate.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.px
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun PremiumCard(
    modifier: Modifier = Modifier,
    variant: PremiumCardVariant = PremiumCardVariant.Default,
    elevation: Boolean = true,
    content: @Composable (Modifier) -> Unit
) {
    val (borderColor, surfaceColor, shadowColor) = when (variant) {
        PremiumCardVariant.Default -> CandidateColors.CardStroke to CandidateColors.DeepElevatedSurface to Color.Black
        PremiumCardVariant.Gold -> CandidateColors.CardStrokeGold to CandidateColors.DeepElevatedSurface to CandidateColors.PrimaryGold.copy(alpha = 0.15f)
        PremiumCardVariant.Violet -> CandidateColors.CardStrokeViolet to CandidateColors.DeepElevatedSurface to CandidateColors.VioletAccent.copy(alpha = 0.15f)
        PremiumCardVariant.Cyan -> CandidateColors.CardStrokeCyan to CandidateColors.DeepElevatedSurface to CandidateColors.CyanAccent.copy(alpha = 0.15f)
        PremiumCardVariant.Red -> CandidateColors.CardStrokeRed to CandidateColors.DeepElevatedSurface to CandidateColors.RecordingRed.copy(alpha = 0.15f)
        PremiumCardVariant.Green -> CandidateColors.CardStrokeGreen to CandidateColors.DeepElevatedSurface to CandidateColors.SuccessGreen.copy(alpha = 0.15f)
        PremiumCardVariant.Hero -> CandidateColors.CardStrokeGold to CandidateColors.DeepElevatedSurface to CandidateColors.PrimaryGold.copy(alpha = 0.2f)
        PremiumCardVariant.MediaPreview -> CandidateColors.CardStrokeGold to CandidateColors.DarkBackground to CandidateColors.PrimaryGold.copy(alpha = 0.1f)
        PremiumCardVariant.Panel -> CandidateColors.CardStroke.copy(alpha = 0.5f) to CandidateColors.SecondarySurface to Color.Black
        PremiumCardVariant.Glass -> CandidateColors.CardStroke.copy(alpha = 0.3f) to CandidateColors.DeepElevatedSurface.copy(alpha = 0.7f) to Color.Black
    }

    val cardShape = when (variant) {
        PremiumCardVariant.Hero -> CandidateShapes.HeroCard
        PremiumCardVariant.MediaPreview -> CandidateShapes.MediaPreview
        PremiumCardVariant.Panel -> CandidateShapes.Panel
        else -> CandidateShapes.Card
    }

    val borderWidth = when (variant) {
        PremiumCardVariant.Hero -> 1.5.dp
        PremiumCardVariant.Gold -> 1.5.dp
        PremiumCardVariant.MediaPreview -> 1.dp
        else -> 1.dp
    }

    Box(
        modifier = modifier
            .clip(cardShape)
            .background(surfaceColor, cardShape)
            .border(borderWidth, borderColor, cardShape)
    ) {
        if (elevation && variant != PremiumCardVariant.Glass) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(cardShape)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                shadowColor.copy(alpha = 0.03f),
                                Color.Transparent,
                                Color.Transparent,
                                shadowColor.copy(alpha = 0.02f)
                            )
                        ),
                        cardShape
                    )
            )
        }
        content(Modifier.fillMaxSize())
    }
}

enum class PremiumCardVariant {
    Default, Gold, Violet, Cyan, Red, Green, Hero, MediaPreview, Panel, Glass
}

@Composable
fun GoldRecordingOrb(
    modifier: Modifier = Modifier,
    size: androidx.compose.ui.unit.Dp = 160.dp,
    showInnerRings: Boolean = true,
    showPlayIcon: Boolean = true,
    animated: Boolean = false,
    readiness: RecordingReadiness = RecordingReadiness.Ready
) {
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "goldOrb")
    val pulse by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 2000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
        ),
        label = "orbPulse"
    )
    val rotation by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 30000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "orbRotation"
    )

    val (orbColor, ringColor, iconColor, pulseColor) = when (readiness) {
        RecordingReadiness.Ready -> CandidateColors.PrimaryGold to CandidateColors.PrimaryGold to CandidateColors.DarkBackground to CandidateColors.PrimaryGold
        RecordingReadiness.Recording -> CandidateColors.RecordingRed to CandidateColors.RecordingRed to CandidateColors.PrimaryText to CandidateColors.RecordingRed
        RecordingReadiness.Paused -> CandidateColors.AmberWarning to CandidateColors.AmberWarning to CandidateColors.DarkBackground to CandidateColors.AmberWarning
        RecordingReadiness.Error -> CandidateColors.ErrorRed to CandidateColors.ErrorRed to CandidateColors.PrimaryText to CandidateColors.ErrorRed
    }

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val width = size.width.toFloat()
            val height = size.height.toFloat()
            val centerX = width / 2f
            val centerY = height / 2f
            val radius = min(width, height) / 2f

            if (showInnerRings) {
                for (i in 0..3) {
                    val ringRadius = radius * (0.9f - i * 0.12f)
                    val ringAlpha = (0.15f + 0.1f * sin(pulse * 2f * 3.14159f + i * 1.2f)).coerceIn(0.05f, 0.3f)
                    val strokeWidth = max(width, height) * 0.008f * (1f - i * 0.15f)

                    drawCircle(
                        color = ringColor.copy(alpha = ringAlpha),
                        center = Offset(centerX, centerY),
                        radius = ringRadius,
                        style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                        strokeWidth = strokeWidth
                    )
                }
            }

            val outerGlowRadius = radius * (1f + 0.15f * (0.5f + 0.5f * sin(pulse * 2f * 3.14159f)))
            drawCircle(
                color = pulseColor.copy(alpha = 0.1f * (0.5f + 0.5f * sin(pulse * 2f * 3.14159f))),
                center = Offset(centerX, centerY),
                radius = outerGlowRadius
            )

            val mainBrush = Brush.radialGradient(
                colors = listOf(
                    orbColor.copy(red = min(1f, orbColor.red + 0.3f), green = min(1f, orbColor.green + 0.2f), blue = min(1f, orbColor.blue + 0.1f)),
                    orbColor,
                    orbColor.copy(red = orbColor.red * 0.7f, green = orbColor.green * 0.7f, blue = orbColor.blue * 0.7f),
                    orbColor.copy(red = orbColor.red * 0.4f, green = orbColor.green * 0.4f, blue = orbColor.blue * 0.4f)
                ),
                center = Offset(centerX - radius * 0.2f, centerY - radius * 0.2f),
                radius = radius * 1.3f
            )

            drawCircle(
                brush = mainBrush,
                center = Offset(centerX, centerY),
                radius = radius * 0.95f
            )

            drawCircle(
                color = CandidateColors.GoldenHighlight.copy(alpha = 0.3f),
                center = Offset(centerX - radius * 0.15f, centerY - radius * 0.15f),
                radius = radius * 0.5f
            )

            val strokeWidth = max(width, height) * 0.025f
            drawCircle(
                color = ringColor,
                center = Offset(centerX, centerY),
                radius = radius * 0.95f,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = strokeWidth
            )

            if (showPlayIcon) {
                val triSize = radius * 0.55f
                val path = Path().apply {
                    moveTo(
                        centerX + triSize * 0.6f,
                        centerY
                    )
                    lineTo(
                        centerX - triSize * 0.4f,
                        centerY - triSize * 0.7f
                    )
                    lineTo(
                        centerX - triSize * 0.4f,
                        centerY + triSize * 0.7f
                    )
                    close()
                }

                val iconBrush = Brush.linearGradient(
                    colors = listOf(
                        iconColor.copy(red = min(1f, iconColor.red + 0.2f), green = min(1f, iconColor.green + 0.2f), blue = min(1f, iconColor.blue + 0.2f)),
                        iconColor,
                        iconColor.copy(red = iconColor.red * 0.6f, green = iconColor.green * 0.6f, blue = iconColor.blue * 0.6f)
                    ),
                    start = Offset(centerX - triSize, centerY - triSize),
                    end = Offset(centerX + triSize, centerY + triSize)
                )

                drawPath(
                    path = path,
                    brush = iconBrush
                )

                val highlightPath = Path().apply {
                    moveTo(
                        centerX + triSize * 0.5f,
                        centerY
                    )
                    lineTo(
                        centerX - triSize * 0.3f,
                        centerY - triSize * 0.5f
                    )
                    lineTo(
                        centerX - triSize * 0.3f,
                        centerY + triSize * 0.1f
                    )
                    close()
                }
                drawPath(
                    path = highlightPath,
                    color = CandidateColors.GoldenHighlight.copy(alpha = 0.4f)
                )
            }
        }
    }
}

enum class RecordingReadiness {
    Ready, Recording, Paused, Error
}

@Composable
fun CaptureReadinessChip(
    modifier: Modifier = Modifier,
    readiness: RecordingReadiness = RecordingReadiness.Ready,
    compact: Boolean = false
) {
    val (text, color, bgColor) = when (readiness) {
        RecordingReadiness.Ready -> "READY TO CAPTURE" to CandidateColors.DarkBackground to CandidateColors.PrimaryGold
        RecordingReadiness.Recording -> "RECORDING" to CandidateColors.PrimaryText to CandidateColors.RecordingRed
        RecordingReadiness.Paused -> "PAUSED" to CandidateColors.DarkBackground to CandidateColors.AmberWarning
        RecordingReadiness.Error -> "ERROR" to CandidateColors.PrimaryText to CandidateColors.ErrorRed
    }

    val chipShape = CandidateShapes.Pill
    val horizontalPadding = if (compact) 16.dp else 20.dp
    val verticalPadding = if (compact) 6.dp else 8.dp
    val fontSize = if (compact) 10.sp else 11.sp

    Box(
        modifier = modifier
            .padding(horizontal = horizontalPadding, vertical = verticalPadding)
            .background(bgColor, chipShape)
    ) {
        Text(
            text = text,
            style = CandidateTypography.ChipLabel.copy(fontSize = fontSize),
            color = color
        )
    }
}

@Composable
fun StatusBadge(
    modifier: Modifier = Modifier,
    text: String,
    variant: StatusBadgeVariant = StatusBadgeVariant.Default,
    icon: (@Composable (Modifier) -> Unit)? = null
) {
    val (bgColor, textColor, borderColor) = when (variant) {
        StatusBadgeVariant.Default -> CandidateColors.SecondarySurface to CandidateColors.SecondaryText to CandidateColors.CardStroke
        StatusBadgeVariant.Gold -> CandidateColors.GoldTransparent to CandidateColors.PrimaryGold to CandidateColors.GoldBorder
        StatusBadgeVariant.Violet -> CandidateColors.VioletTransparent to CandidateColors.VioletBright to CandidateColors.VioletMuted
        StatusBadgeVariant.Cyan -> CandidateColors.CyanTransparent to CandidateColors.CyanBright to CandidateColors.CyanMuted
        StatusBadgeVariant.Red -> CandidateColors.RecordingRedTransparent to CandidateColors.RecordingRedBright to CandidateColors.RecordingRedMuted
        StatusBadgeVariant.Green -> CandidateColors.SuccessGreenTransparent to CandidateColors.SuccessGreenBright to CandidateColors.SuccessGreenMuted
        StatusBadgeVariant.Amber -> CandidateColors.PrimaryGold.copy(alpha = 0.15f) to CandidateColors.AmberWarning to CandidateColors.GoldBorder
        StatusBadgeVariant.Planned -> CandidateColors.DisabledSurface to CandidateColors.TertiaryText to CandidateColors.DisabledStroke
        StatusBadgeVariant.Blocked -> CandidateColors.RecordingRedTransparent to CandidateColors.ErrorRed to CandidateColors.RecordingRedMuted
        StatusBadgeVariant.Available -> CandidateColors.SuccessGreenTransparent to CandidateColors.SuccessGreenBright to CandidateColors.SuccessGreenMuted
    }

    val chipShape = CandidateShapes.Pill

    Row(
        modifier = modifier
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .background(bgColor, chipShape)
            .border(1.dp, borderColor, chipShape),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(6.dp)
    ) {
        icon?.invoke(Modifier.size(14.dp))
        Text(
            text = text,
            style = CandidateTypography.LabelSmall.copy(fontSize = 10.sp),
            color = textColor
        )
    }
}

enum class StatusBadgeVariant {
    Default, Gold, Violet, Cyan, Red, Green, Amber, Planned, Blocked, Available
}

@Composable
fun SectionHeader(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String? = null,
    accentColor: Color = CandidateColors.PrimaryGold,
    showDivider: Boolean = true
) {
    Column(modifier = modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                style = CandidateTypography.HeadlineMedium.copy(fontSize = 20.sp),
                color = CandidateColors.PrimaryText
            )
            if (showDivider) {
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(start = 12.dp))
                androidx.compose.ui.graphics.Canvas(modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                ) {
                    val brush = Brush.horizontalGradient(
                        colors = listOf(
                            accentColor.copy(alpha = 0f),
                            accentColor.copy(alpha = 0.5f),
                            accentColor.copy(alpha = 0f)
                        )
                    )
                    drawRect(
                        brush = brush,
                        rect = Rect(Offset.Zero, Size(size.width, size.height.toFloat()))
                    )
                }
            }
        }
        subtitle?.let {
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
            Text(
                text = it,
                style = CandidateTypography.BodyMedium,
                color = CandidateColors.SecondaryText
            )
        }
    }
}

@Composable
fun MetricCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    accentColor: Color = CandidateColors.PrimaryGold,
    icon: (@Composable (Modifier) -> Unit)? = null
) {
    PremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp)
            .padding(16.dp),
        variant = PremiumCardVariant.Panel
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            icon?.invoke(Modifier.size(28.dp).padding(bottom = 8.dp))
            Text(
                text = value,
                style = CandidateTypography.HeadlineMedium.copy(fontSize = 24.sp),
                color = accentColor
            )
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
            Text(
                text = label,
                style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
                color = CandidateColors.TertiaryText
            )
        }
    }
}