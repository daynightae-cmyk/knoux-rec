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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.px
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography
import kotlin.math.max
import kotlin.math.min

@Composable
fun MediaPreviewCard(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    duration: String,
    resolution: String,
    codec: String,
    accentColor: Color = CandidateColors.PrimaryGold,
    showPlayButton: Boolean = true,
    onPlayClick: (() -> Unit)? = null,
    onCardClick: (() -> Unit)? = null
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "mediaPreview")
    val pulse by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 3000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
        ),
        label = "previewPulse"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(220.dp)
            .clip(CandidateShapes.MediaPreview)
            .pointerInput(Unit) {
                onCardClick?.let { androidx.compose.foundation.gestures.detectTapGestures(onTap = it) }
            }
            .graphicsLayer {
                scaleX = if (pressed.value) 0.99f else 1f
                scaleY = if (pressed.value) 0.99f else 1f
            }
            .background(CandidateColors.DarkBackground, CandidateShapes.MediaPreview)
    ) {
        Canvas(modifier = Modifier.fillMaxSize().clip(CandidateShapes.MediaPreview)) {
            val width = size.width.toFloat()
            val height = size.height.toFloat()
            val cx = width / 2f
            val cy = height / 2f

            val bgBrush = Brush.verticalGradient(
                colors = CandidateColors.mediaPreviewGradientStops()
            )
            drawRect(brush = bgBrush, rect = Rect(Offset.Zero, Size(width, height)))

            val ringCount = 3
            for (i in 0 until ringCount) {
                val ringRadius = min(width, height) * (0.15f + i * 0.1f) * (0.8f + 0.2f * sin(pulse * 2f * 3.14159f + i * 1.5f))
                val alpha = (0.05f + 0.08f * (1f - i * 0.25f)) * (0.5f + 0.5f * sin(pulse * 2f * 3.14159f + i * 1.2f))
                val strokeWidth = max(width, height) * 0.002f

                drawCircle(
                    color = accentColor.copy(alpha = alpha),
                    center = Offset(cx, cy),
                    radius = ringRadius,
                    style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                    strokeWidth = strokeWidth
                )
            }

            val centerGlow = min(width, height) * 0.12f * (0.9f + 0.1f * sin(pulse * 2f * 3.14159f))
            drawCircle(
                color = accentColor.copy(alpha = 0.15f * (0.5f + 0.5f * sin(pulse * 2f * 3.14159f))),
                center = Offset(cx, cy),
                radius = centerGlow
            )
        }

        if (showPlayButton && onPlayClick != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CandidateShapes.MediaPreview)
                    .pointerInput(Unit) {
                        androidx.compose.foundation.gestures.detectTapGestures(onTap = onPlayClick)
                    },
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CandidateShapes.Circle)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(
                                    accentColor.copy(red = min(1f, accentColor.red + 0.2f), green = min(1f, accentColor.green + 0.2f), blue = min(1f, accentColor.blue + 0.2f)),
                                    accentColor,
                                    accentColor.copy(red = accentColor.red * 0.6f, green = accentColor.green * 0.6f, blue = accentColor.blue * 0.6f)
                                ),
                                center = Offset(0.3f, 0.3f),
                                radius = 0.7f
                            ),
                            CandidateShapes.Circle
                        )
                        .border(2.dp, accentColor.copy(alpha = 0.5f), CandidateShapes.Circle)
                ) {
                    Canvas(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(18.dp),
                        onDraw = {
                            val width = size.width.toFloat()
                            val height = size.height.toFloat()
                            val cx = width / 2f
                            val cy = height / 2f
                            val triSize = min(width, height) * 0.4f

                            val path = androidx.compose.ui.graphics.Path().apply {
                                moveTo(cx + triSize * 0.6f, cy)
                                lineTo(cx - triSize * 0.4f, cy - triSize * 0.7f)
                                lineTo(cx - triSize * 0.4f, cy + triSize * 0.7f)
                                close()
                            }

                            val iconBrush = Brush.linearGradient(
                                colors = listOf(
                                    CandidateColors.DarkBackground,
                                    CandidateColors.DarkBackground.copy(red = 0.1f, green = 0.1f, blue = 0.15f)
                                ),
                                start = Offset(cx - triSize, cy - triSize),
                                end = Offset(cx + triSize, cy + triSize)
                            )

                            drawPath(path = path, brush = iconBrush)
                        }
                    )
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = androidx.compose.foundation.layout.Arrangement.Bottom,
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = title,
                style = CandidateTypography.TitleMedium.copy(fontSize = 16.sp),
                color = CandidateColors.PrimaryText,
                maxLines = 1,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
            )
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
            Text(
                text = subtitle,
                style = CandidateTypography.BodySmall,
                color = CandidateColors.SecondaryText,
                maxLines = 1,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
            )
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 8.dp))
            Row(
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(12.dp)
            ) {
                BadgeChip(text = duration, color = accentColor)
                BadgeChip(text = resolution, color = CandidateColors.CyanAccent)
                BadgeChip(text = codec, color = CandidateColors.VioletAccent)
            }
        }
    }
}

@Composable
fun BadgeChip(
    modifier: Modifier = Modifier,
    text: String,
    color: Color = CandidateColors.PrimaryGold
) {
    Box(
        modifier = modifier
            .padding(horizontal = 10.dp, vertical = 4.dp)
            .background(color.copy(alpha = 0.15f), CandidateShapes.Chip)
            .border(1.dp, color.copy(alpha = 0.5f), CandidateShapes.Chip)
    ) {
        Text(
            text = text,
            style = CandidateTypography.LabelSmall.copy(fontSize = 9.sp),
            color = color
        )
    }
}

@Composable
fun MediaLibraryItem(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    mediaType: MediaTypeFilter,
    duration: String? = null,
    date: String,
    thumbnailColor: Color = CandidateColors.PrimaryGold,
    onClick: () -> Unit,
    onLongClick: (() -> Unit)? = null
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onTap = onClick,
                    onLongPress = { onLongClick?.invoke() }
                )
            }
            .graphicsLayer {
                scaleX = if (pressed.value) 0.99f else 1f
                scaleY = if (pressed.value) 0.99f else 1f
            }
            .background(
                if (pressed.value) CandidateColors.SecondarySurface else Color.Transparent,
                CandidateShapes.PanelCompact
            )
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CandidateShapes.Small)
                .background(thumbnailColor.copy(alpha = 0.2f), CandidateShapes.Small)
                .border(1.dp, thumbnailColor.copy(alpha = 0.4f), CandidateShapes.Small),
            contentAlignment = Alignment.Center
        ) {
            when (mediaType) {
                MediaTypeFilter.Videos -> VideoIcon(Modifier.size(24.dp), thumbnailColor)
                MediaTypeFilter.Images -> ImageIcon(Modifier.size(24.dp), thumbnailColor)
                MediaTypeFilter.Audio -> AudioIcon(Modifier.size(24.dp), thumbnailColor)
                else -> VideoIcon(Modifier.size(24.dp), thumbnailColor)
            }
        }
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(start = 16.dp))
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center,
            crossAxisAlignment = Alignment.Start
        ) {
            Text(
                text = title,
                style = CandidateTypography.BodyMedium.copy(fontSize = 15.sp),
                color = CandidateColors.PrimaryText,
                maxLines = 1,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
            )
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 2.dp))
            Row(
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = subtitle,
                    style = CandidateTypography.BodySmall,
                    color = CandidateColors.SecondaryText
                )
                if (duration != null) {
                    Text(
                        text = "· $duration",
                        style = CandidateTypography.BodySmall,
                        color = CandidateColors.TertiaryText
                    )
                }
                Text(
                    text = "· $date",
                    style = CandidateTypography.BodySmall,
                    color = CandidateColors.TertiaryText
                )
            }
        }
        StatusBadge(
            text = mediaType.displayName,
            variant = when (mediaType) {
                MediaTypeFilter.Videos -> StatusBadgeVariant.Cyan
                MediaTypeFilter.Images -> StatusBadgeVariant.Violet
                MediaTypeFilter.Audio -> StatusBadgeVariant.Amber
                else -> StatusBadgeVariant.Gold
            }
        )
    }
}

@Composable
fun VideoIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.08f

        val path = androidx.compose.ui.graphics.Path().apply {
            val r = s * 0.35f
            moveTo(cx - r, cy - r * 0.7f)
            lineTo(cx + r, cy - r * 0.7f)
            lineTo(cx + r, cy + r * 0.7f)
            lineTo(cx - r, cy + r * 0.7f)
            close()
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val playPath = androidx.compose.ui.graphics.Path().apply {
            val ps = s * 0.15f
            moveTo(cx + ps * 0.5f, cy)
            lineTo(cx - ps * 0.3f, cy - ps * 0.5f)
            lineTo(cx - ps * 0.3f, cy + ps * 0.5f)
            close()
        }
        drawPath(playPath, color, style = androidx.compose.ui.graphics.Paint.Style.Fill)
    })
}

@Composable
fun ImageIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.08f

        val path = androidx.compose.ui.graphics.Path().apply {
            val r = s * 0.35f
            moveTo(cx - r, cy - r)
            lineTo(cx + r, cy - r)
            lineTo(cx + r, cy + r)
            lineTo(cx - r, cy + r)
            close()
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val mountain = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - r * 0.5f, cy + r * 0.3f)
            lineTo(cx - r * 0.1f, cy - r * 0.3f)
            lineTo(cx + r * 0.2f, cy + r * 0.1f)
            lineTo(cx + r * 0.5f, cy - r * 0.4f)
            lineTo(cx + r, cy - r * 0.4f)
            lineTo(cx + r, cy + r)
            lineTo(cx - r, cy + r)
            close()
        }
        drawPath(mountain, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val sun = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + r * 0.6f, cy - r * 0.6f)
            lineTo(cx + r * 0.6f, cy - r * 0.8f)
            moveTo(cx + r * 0.8f, cy - r * 0.6f)
            lineTo(cx + r * 0.6f, cy - r * 0.6f)
            lineTo(cx + r * 0.6f, cy - r * 0.4f)
        }
        drawPath(sun, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun AudioIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.08f

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.3f, cy - s * 0.35f)
            lineTo(cx - s * 0.1f, cy - s * 0.35f)
            lineTo(cx + s * 0.05f, cy - s * 0.15f)
            lineTo(cx + s * 0.05f, cy + s * 0.15f)
            lineTo(cx - s * 0.1f, cy + s * 0.35f)
            lineTo(cx - s * 0.3f, cy + s * 0.35f)
            close()
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val wave1 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.1f, cy - s * 0.25f)
            lineTo(cx + s * 0.25f, cy)
            lineTo(cx + s * 0.1f, cy + s * 0.25f)
        }
        drawPath(wave1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val wave2 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.25f, cy - s * 0.35f)
            lineTo(cx + s * 0.4f, cy)
            lineTo(cx + s * 0.25f, cy + s * 0.35f)
        }
        drawPath(wave2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}