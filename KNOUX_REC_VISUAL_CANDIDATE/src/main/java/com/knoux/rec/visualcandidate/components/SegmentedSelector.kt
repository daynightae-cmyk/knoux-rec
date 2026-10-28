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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun SegmentedSelector<T>(
    modifier: Modifier = Modifier,
    options: List<T>,
    selectedOption: T,
    onOptionSelected: (T) -> Unit,
    optionLabel: (T) -> String,
    enabled: Boolean = true,
    accentColor: Color = CandidateColors.PrimaryGold
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp, vertical = 4.dp)
            .background(CandidateColors.SecondarySurface, CandidateShapes.SegmentedControl)
            .border(1.dp, CandidateColors.CardStroke.copy(alpha = 0.5f), CandidateShapes.SegmentedControl)
            .clip(CandidateShapes.SegmentedControl),
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(4.dp)
    ) {
        options.forEach { option ->
            val isSelected = selectedOption == option
            val weight = 1f / options.size
            Box(
                modifier = Modifier
                    .weight(weight, fill = true)
                    .height(44.dp)
                    .clip(CandidateShapes.SegmentedControl)
                    .pointerInput(Unit) {
                        if (enabled) {
                            androidx.compose.foundation.gestures.detectTapGestures(onTap = { onOptionSelected(option) })
                        }
                    }
                    .background(
                        if (isSelected) accentColor.copy(alpha = 0.15f) else Color.Transparent,
                        CandidateShapes.SegmentedControl
                    )
                    .border(
                        if (isSelected) 1.dp else 0.dp,
                        if (isSelected) accentColor else Color.Transparent,
                        CandidateShapes.SegmentedControl
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = optionLabel(option),
                    style = CandidateTypography.LabelMedium.copy(fontSize = 12.sp),
                    color = if (isSelected) accentColor else (if (enabled) CandidateColors.SecondaryText else CandidateColors.DisabledText),
                    maxLines = 1,
                    overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
fun ThreeOptionSelector(
    modifier: Modifier = Modifier,
    option1: String,
    option2: String,
    option3: String,
    selectedIndex: Int,
    onSelected: (Int) -> Unit,
    enabled: Boolean = true,
    accentColor: Color = CandidateColors.PrimaryGold
) {
    val options = listOf(option1, option2, option3)
    SegmentedSelector(
        modifier = modifier,
        options = listOf(0, 1, 2),
        selectedOption = selectedIndex,
        onOptionSelected = onSelected,
        optionLabel = { options[it] },
        enabled = enabled,
        accentColor = accentColor
    )
}

@Composable
fun ToggleSwitch(
    modifier: Modifier = Modifier,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    enabled: Boolean = true,
    label: String? = null,
    subtitle: String? = null,
    accentColor: Color = CandidateColors.PrimaryGold,
    trackColorOn: Color = CandidateColors.PrimaryGold,
    trackColorOff: Color = CandidateColors.DisabledStroke.copy(alpha = 0.5f)
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    val animatedPosition = androidx.compose.animation.core.animateFloatAsState(
        targetValue = if (checked) 1f else 0f,
        animationSpec = androidx.compose.animation.core.tween(200),
        label = "switchPosition"
    ).value

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp)
            .pointerInput(Unit) {
                if (enabled) {
                    androidx.compose.foundation.gestures.detectTapGestures(onTap = { onCheckedChange(!checked) })
                }
            },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween
    ) {
        Column(
            modifier = Modifier.weight(1f).padding(end = 16.dp),
            crossAxisAlignment = Alignment.Start
        ) {
            label?.let {
                Text(
                    text = it,
                    style = CandidateTypography.BodyMedium.copy(fontSize = 15.sp),
                    color = if (enabled) CandidateColors.PrimaryText else CandidateColors.DisabledText
                )
            }
            subtitle?.let {
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 2.dp))
                Text(
                    text = it,
                    style = CandidateTypography.BodySmall,
                    color = if (enabled) CandidateColors.TertiaryText else CandidateColors.DisabledText
                )
            }
        }

        Box(
            modifier = Modifier
                .size(56.dp, 32.dp)
                .clip(CandidateShapes.Pill)
                .background(
                    if (checked) trackColorOn.copy(alpha = 0.3f) else trackColorOff,
                    CandidateShapes.Pill
                )
                .border(
                    1.dp,
                    if (checked) trackColorOn else trackColorOff.copy(alpha = 0.5f),
                    CandidateShapes.Pill
                ),
            contentAlignment = Alignment.CenterLeft
        ) {
            Box(
                modifier = Modifier
                    .size(26.dp)
                    .offset(x = (26.dp.toPx() + 4.dp.toPx()) * animatedPosition - 2.dp.toPx())
                    .clip(CandidateShapes.Circle)
                    .background(
                        if (checked) trackColorOn else CandidateColors.DisabledText,
                        CandidateShapes.Circle
                    )
                    .graphicsLayer {
                        shadowElevation = if (checked) 4.dp.toPx() else 2.dp.toPx()
                    }
            )
        }
    }
}

@Composable
fun MediaTypeFilterRow(
    modifier: Modifier = Modifier,
    filters: List<MediaTypeFilter>,
    selectedFilter: MediaTypeFilter,
    onFilterSelected: (MediaTypeFilter) -> Unit
) {
    androidx.compose.foundation.layout.Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp)
    ) {
        filters.forEach { filter ->
            val isSelected = selectedFilter == filter
            Box(
                modifier = Modifier
                    .padding(horizontal = 12.dp, vertical = 8.dp)
                    .clip(CandidateShapes.Chip)
                    .pointerInput(Unit) {
                        androidx.compose.foundation.gestures.detectTapGestures(onTap = { onFilterSelected(filter) })
                    }
                    .background(
                        if (isSelected) CandidateColors.GoldTransparent else CandidateColors.SecondarySurface,
                        CandidateShapes.Chip
                    )
                    .border(
                        if (isSelected) 1.5.dp else 1.dp,
                        if (isSelected) CandidateColors.GoldBorder else CandidateColors.CardStroke.copy(alpha = 0.5f),
                        CandidateShapes.Chip
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = filter.displayName,
                    style = CandidateTypography.LabelSmall.copy(fontSize = 11.sp),
                    color = if (isSelected) CandidateColors.PrimaryGold else CandidateColors.SecondaryText
                )
            }
        }
    }
}

enum class MediaTypeFilter(val displayName: String, val accentColor: Color) {
    All("All", CandidateColors.PrimaryGold),
    Videos("Videos", CandidateColors.CyanAccent),
    Images("Images", CandidateColors.VioletAccent),
    Audio("Audio", CandidateColors.AmberWarning)
}

@Composable
fun CapabilityStatusRow(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    status: CapabilityStatus,
    onClick: (() -> Unit)? = null
) {
    val (statusColor, statusLabel, statusIcon) = when (status) {
        CapabilityStatus.Supported -> CandidateColors.SuccessGreen to "Supported" to { SuccessIcon(Modifier.size(18.dp), CandidateColors.SuccessGreen) }
        CapabilityStatus.Unsupported -> CandidateColors.ErrorRed to "Unsupported" to { ErrorIcon(Modifier.size(18.dp), CandidateColors.ErrorRed) }
        CapabilityStatus.PermissionRequired -> CandidateColors.PrimaryGold to "Permission Required" to { PermissionIcon(Modifier.size(18.dp), CandidateColors.PrimaryGold) }
        CapabilityStatus.Blocked -> CandidateColors.ErrorRed to "Blocked" to { BlockedIcon(Modifier.size(18.dp), CandidateColors.ErrorRed) }
        CapabilityStatus.Unknown -> CandidateColors.TertiaryText to "Unknown" to { UnknownIcon(Modifier.size(18.dp), CandidateColors.TertiaryText) }
        CapabilityStatus.Checking -> CandidateColors.CyanAccent to "Checking..." to { CheckingIcon(Modifier.size(18.dp), CandidateColors.CyanAccent) }
        CapabilityStatus.Error -> CandidateColors.ErrorRed to "Error" to { ErrorIcon(Modifier.size(18.dp), CandidateColors.ErrorRed) }
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp)
            .pointerInput(Unit) {
                onClick?.let { androidx.compose.foundation.gestures.detectTapGestures(onTap = it) }
            },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.weight(1f).padding(end = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(14.dp)
        ) {
            statusIcon()
            Column(
                verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = title,
                    style = CandidateTypography.BodyMedium.copy(fontSize = 15.sp),
                    color = CandidateColors.PrimaryText
                )
                Text(
                    text = subtitle,
                    style = CandidateTypography.BodySmall,
                    color = CandidateColors.SecondaryText
                )
            }
        }

        StatusBadge(
            text = statusLabel,
            variant = when (status) {
                CapabilityStatus.Supported -> StatusBadgeVariant.Available
                CapabilityStatus.PermissionRequired -> StatusBadgeVariant.Gold
                CapabilityStatus.Blocked -> StatusBadgeVariant.Blocked
                CapabilityStatus.Checking -> StatusBadgeVariant.Cyan
                else -> StatusBadgeVariant.Default
            }
        )
    }
}

enum class CapabilityStatus {
    Supported, Unsupported, PermissionRequired, Blocked, Unknown, Checking, Error
}

@Composable
fun SuccessIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.SuccessGreen) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.1f

        drawCircle(
            color = color.copy(alpha = 0.2f),
            center = Offset(cx, cy),
            radius = s * 0.45f
        )

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.25f, cy)
            lineTo(cx - s * 0.05f, cy + s * 0.2f)
            lineTo(cx + s * 0.25f, cy - s * 0.25f)
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }
    })
}

@Composable
fun ErrorIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.ErrorRed) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.1f

        drawCircle(
            color = color.copy(alpha = 0.2f),
            center = Offset(cx, cy),
            radius = s * 0.45f
        )

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.2f, cy - s * 0.2f)
            lineTo(cx + s * 0.2f, cy + s * 0.2f)
            moveTo(cx + s * 0.2f, cy - s * 0.2f)
            lineTo(cx - s * 0.2f, cy + s * 0.2f)
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun PermissionIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryGold) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.1f

        drawCircle(
            color = color.copy(alpha = 0.2f),
            center = Offset(cx, cy),
            radius = s * 0.45f
        )

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx, cy - s * 0.2f)
            lineTo(cx, cy + s * 0.05f)
            moveTo(cx, cy + s * 0.2f)
            drawCircle(Offset(cx, cy + s * 0.2f), s * 0.03f)
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun BlockedIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.ErrorRed) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.1f

        drawCircle(
            color = color.copy(alpha = 0.2f),
            center = Offset(cx, cy),
            radius = s * 0.45f
        )

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.2f, cy - s * 0.2f)
            lineTo(cx + s * 0.2f, cy + s * 0.2f)
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun UnknownIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.TertiaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.1f

        drawCircle(
            color = color.copy(alpha = 0.2f),
            center = Offset(cx, cy),
            radius = s * 0.45f
        )

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx, cy - s * 0.2f)
            lineTo(cx, cy)
            moveTo(cx, cy + s * 0.15f)
            drawCircle(Offset(cx, cy + s * 0.15f), s * 0.03f)
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun CheckingIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.CyanAccent) {
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "checkingSpin")
    val rotation by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 1000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "spin"
    )

    Canvas(
        modifier = modifier
            .graphicsLayer { rotationZ = rotation * 360f },
        onDraw = {
            val width = size.width.toFloat()
            val height = size.height.toFloat()
            val s = min(width, height)
            val cx = width / 2f
            val cy = height / 2f
            val strokeWidth = s * 0.1f

            drawCircle(
                color = color.copy(alpha = 0.2f),
                center = Offset(cx, cy),
                radius = s * 0.45f
            )

            drawArc(
                color = color,
                startAngle = -90f,
                sweepAngle = 270f,
                useCenter = false,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = strokeWidth,
                topLeft = Offset(cx - s * 0.45f, cy - s * 0.45f),
                size = Size(s * 0.9f, s * 0.9f)
            ) {
                this@drawArc.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            }
        }
    )
}