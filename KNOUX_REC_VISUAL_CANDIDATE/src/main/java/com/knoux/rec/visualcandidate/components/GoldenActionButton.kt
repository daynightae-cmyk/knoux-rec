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
import androidx.compose.material.ripple.rememberRipple
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
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.px
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography
import kotlin.math.max
import kotlin.math.min

@Composable
fun GoldenPrimaryAction(
    modifier: Modifier = Modifier,
    text: String,
    onClick: () -> Unit,
    enabled: Boolean = true,
    loading: Boolean = false,
    icon: (@Composable (Modifier) -> Unit)? = null,
    fullWidth: Boolean = true,
    height: androidx.compose.ui.unit.Dp = 56.dp
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "buttonPulse")
    val pulse by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 2000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
        ),
        label = "buttonPulse"
    )

    val bgBrush = Brush.linearGradient(
        colors = listOf(
            CandidateColors.BrightGold,
            CandidateColors.PrimaryGold,
            CandidateColors.GoldenShadow,
            CandidateColors.PrimaryGold
        ),
        start = Offset.Zero,
        end = Offset(0f, 1f)
    )

    val disabledBrush = Brush.horizontalGradient(
        colors = listOf(
            CandidateColors.DisabledSurface,
            CandidateColors.DisabledSurface.copy(alpha = 0.8f)
        )
    )

    val contentColor = if (enabled) CandidateColors.DarkBackground else CandidateColors.DisabledText
    val borderColor = if (enabled) CandidateColors.GoldenShadow else CandidateColors.DisabledStroke
    val shadowColor = if (enabled) CandidateColors.PrimaryGold.copy(alpha = 0.3f) else Color.Transparent

    val buttonModifier = modifier
        .fillMaxWidth()
        .height(height)
        .clip(CandidateShapes.Button)
        .pointerInput(Unit) {
            androidx.compose.foundation.gestures.detectTapGestures(
                onPress = { pressed.value = true },
                onRelease = { pressed.value = false },
                onTap = { if (enabled && !loading) onClick() }
            )
        }

    Box(
        modifier = buttonModifier
            .graphicsLayer {
                scaleX = if (pressed.value && enabled) 0.98f else 1f
                scaleY = if (pressed.value && enabled) 0.98f else 1f
            }
            .background(
                brush = if (enabled) bgBrush else disabledBrush,
                shape = CandidateShapes.Button
            )
            .border(1.5.dp, borderColor, CandidateShapes.Button)
    ) {
        if (enabled && !loading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CandidateShapes.Button)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                CandidateColors.GoldenHighlight.copy(alpha = 0.15f * (0.5f + 0.5f * sin(pulse * 2f * 3.14159f))),
                                Color.Transparent
                            ),
                            center = Offset(size.width / 2f, size.height / 2f),
                            radius = max(size.width, size.height) * 0.8f
                        ),
                        CandidateShapes.Button
                    )
            )
        }

        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.Center
        ) {
            if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = contentColor,
                    strokeWidth = 2.5.dp
                )
            } else {
                icon?.invoke(Modifier.size(20.dp).padding(end = 10.dp))
                Text(
                    text = text,
                    style = CandidateTypography.ButtonLabel,
                    color = contentColor,
                    maxLines = 1,
                    overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
fun GoldenSecondaryAction(
    modifier: Modifier = Modifier,
    text: String,
    onClick: () -> Unit,
    enabled: Boolean = true,
    icon: (@Composable (Modifier) -> Unit)? = null,
    fullWidth: Boolean = true,
    height: androidx.compose.ui.unit.Dp = 56.dp
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)

    val contentColor = if (enabled) CandidateColors.PrimaryGold else CandidateColors.DisabledText
    val borderColor = if (enabled) CandidateColors.GoldBorder else CandidateColors.DisabledStroke
    val bgColor = if (enabled) CandidateColors.DeepElevatedSurface else CandidateColors.DisabledSurface

    val buttonModifier = modifier
        .fillMaxWidth()
        .height(height)
        .clip(CandidateShapes.Button)
        .pointerInput(Unit) {
            androidx.compose.foundation.gestures.detectTapGestures(
                onPress = { pressed.value = true },
                onRelease = { pressed.value = false },
                onTap = { if (enabled) onClick() }
            )
        }

    Box(
        modifier = buttonModifier
            .graphicsLayer {
                scaleX = if (pressed.value && enabled) 0.98f else 1f
                scaleY = if (pressed.value && enabled) 0.98f else 1f
            }
            .background(bgColor, CandidateShapes.Button)
            .border(1.5.dp, borderColor, CandidateShapes.Button)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.Center
        ) {
            icon?.invoke(Modifier.size(20.dp).padding(end = 10.dp))
            Text(
                text = text,
                style = CandidateTypography.ButtonLabel,
                color = contentColor,
                maxLines = 1,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
fun GhostAction(
    modifier: Modifier = Modifier,
    text: String,
    onClick: () -> Unit,
    enabled: Boolean = true,
    color: Color = CandidateColors.PrimaryText,
    height: androidx.compose.ui.unit.Dp = 48.dp
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)

    val contentColor = if (enabled) color else CandidateColors.DisabledText
    val bgColor = if (enabled) color.copy(alpha = 0.1f) else Color.Transparent

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height)
            .clip(CandidateShapes.Button)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onPress = { pressed.value = true },
                    onRelease = { pressed.value = false },
                    onTap = { if (enabled) onClick() }
                )
            }
            .graphicsLayer {
                scaleX = if (pressed.value && enabled) 0.98f else 1f
                scaleY = if (pressed.value && enabled) 0.98f else 1f
            }
            .background(if (pressed.value && enabled) bgColor else Color.Transparent, CandidateShapes.Button)
    ) {
        Text(
            text = text,
            style = CandidateTypography.ButtonLabel.copy(fontSize = 14.sp),
            color = contentColor,
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .wrapContentSize(Alignment.Center)
        )
    }
}

@Composable
fun IconActionButton(
    modifier: Modifier = Modifier,
    icon: @Composable (Modifier) -> Unit,
    onClick: () -> Unit,
    enabled: Boolean = true,
    size: androidx.compose.ui.unit.Dp = 48.dp,
    backgroundColor: Color = CandidateColors.SecondarySurface,
    iconColor: Color = CandidateColors.PrimaryText,
    borderColor: Color = CandidateColors.CardStroke,
    shape: RoundedCornerShape = CandidateShapes.Circle
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)

    Box(
        modifier = modifier
            .size(size)
            .clip(shape)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onPress = { pressed.value = true },
                    onRelease = { pressed.value = false },
                    onTap = { if (enabled) onClick() }
                )
            }
            .graphicsLayer {
                scaleX = if (pressed.value && enabled) 0.9f else 1f
                scaleY = if (pressed.value && enabled) 0.9f else 1f
            }
            .background(
                if (enabled) backgroundColor else CandidateColors.DisabledSurface,
                shape
            )
            .border(1.dp, if (enabled) borderColor else CandidateColors.DisabledStroke, shape)
    ) {
        icon(Modifier
            .fillMaxSize()
            .padding(12.dp)
            .graphicsLayer {
                alpha = if (enabled) 1f else 0.4f
            }
        )
    }
}

@Composable
fun CircularProgressIndicator(
    modifier: Modifier = Modifier,
    color: Color = CandidateColors.PrimaryGold,
    strokeWidth: androidx.compose.ui.unit.Dp = 3.dp,
    progress: Float? = null
) {
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "circularProgress")
    val rotation by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 1000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "rotation"
    )
    val sweep by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 1500, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
        ),
        label = "sweep"
    )

    Canvas(
        modifier = modifier.clip(CandidateShapes.Circle),
        onDraw = {
            val width = size.width.toFloat()
            val height = size.height.toFloat()
            val centerX = width / 2f
            val centerY = height / 2f
            val radius = min(width, height) / 2f - strokeWidth.toPx() / 2f
            val sw = strokeWidth.toPx()

            drawCircle(
                color = color.copy(alpha = 0.15f),
                center = Offset(centerX, centerY),
                radius = radius,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = sw
            )

            val currentSweep = progress?.let { it * 360f } ?: (90f + sweep * 270f)
            val startAngle = rotation * 360f - 90f

            drawArc(
                color = color,
                startAngle = startAngle,
                sweepAngle = currentSweep,
                useCenter = false,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = sw
            ) {
                this@drawArc.strokeCap = StrokeCap.Round
            }
        }
    )
}

@Composable
fun LinearProgressIndicator(
    modifier: Modifier = Modifier,
    progress: Float,
    color: Color = CandidateColors.PrimaryGold,
    trackColor: Color = CandidateColors.CardStroke.copy(alpha = 0.2f),
    height: androidx.compose.ui.unit.Dp = 4.dp,
    animate: Boolean = true
) {
    val animatedProgress = androidx.compose.animation.core.animateFloatAsState(
        targetValue = progress,
        animationSpec = if (animate) androidx.compose.animation.core.tween(300) else androidx.compose.animation.core.snap(),
        label = "linearProgress"
    ).value

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height)
            .clip(CandidateShapes.ProgressTrack)
            .background(trackColor, CandidateShapes.ProgressTrack)
    ) {
        Box(
            modifier = Modifier
                .width(animatedProgress)
                .fillMaxHeight()
                .clip(CandidateShapes.ProgressTrack)
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            color,
                            color.copy(red = min(1f, color.red + 0.1f), green = min(1f, color.green + 0.1f), blue = min(1f, color.blue + 0.1f))
                        )
                    ),
                    CandidateShapes.ProgressTrack
                )
        )
    }
}

@Composable
fun RecordingStopButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    size: androidx.compose.ui.unit.Dp = 80.dp,
    enabled: Boolean = true,
    recording: Boolean = true
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "stopButton")
    val pulse by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 1000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
        ),
        label = "stopPulse"
    )

    val bgColor = if (recording) CandidateColors.RecordingRed else CandidateColors.AmberWarning
    val borderColor = if (recording) CandidateColors.RecordingRedBright else CandidateColors.AmberBright
    val contentColor = CandidateColors.PrimaryText

    Box(
        modifier = modifier
            .size(size)
            .clip(CandidateShapes.Circle)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onPress = { pressed.value = true },
                    onRelease = { pressed.value = false },
                    onTap = { if (enabled) onClick() }
                )
            }
            .graphicsLayer {
                scaleX = if (pressed.value && enabled) 0.92f else 1f
                scaleY = if (pressed.value && enabled) 0.92f else 1f
            }
            .background(bgColor, CandidateShapes.Circle)
            .border(2.dp, borderColor, CandidateShapes.Circle)
    ) {
        if (recording) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CandidateShapes.Circle)
                    .background(
                        CandidateColors.RecordingRedBright.copy(alpha = 0.15f * (0.5f + 0.5f * sin(pulse * 2f * 3.14159f))),
                        CandidateShapes.Circle
                    )
            )

            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp),
                onDraw = {
                    val width = size.width.toFloat()
                    val height = size.height.toFloat()
                    val s = min(width, height)

                    drawRect(
                        color = contentColor,
                        rect = Rect(
                            Offset((width - s) / 2f, (height - s) / 2f),
                            Size(s, s)
                        )
                    )
                }
            )
        } else {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp),
                onDraw = {
                    val width = size.width.toFloat()
                    val height = size.height.toFloat()
                    val barWidth = width * 0.25f
                    val gap = width * 0.15f

                    drawRect(
                        color = contentColor,
                        rect = Rect(
                            Offset((width - 2 * barWidth - gap) / 2f, 0f),
                            Size(barWidth, height)
                        )
                    )
                    drawRect(
                        color = contentColor,
                        rect = Rect(
                            Offset((width + gap) / 2f, 0f),
                            Size(barWidth, height)
                        )
                    )
                }
            )
        }
    }
}