package com.knoux.rec.visualcandidate.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.components.AdaptiveScreenLayout
import com.knoux.rec.visualcandidate.components.BackArrow
import com.knoux.rec.visualcandidate.components.MediaPreviewCard
import com.knoux.rec.visualcandidate.components.SectionHeader
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.contract.RecordingResultUiState
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography
import com.knoux.rec.visualcandidate.contract.CaptureResolution
import com.knoux.rec.visualcandidate.contract.RecordingReadiness
import com.knoux.rec.visualcandidate.components.StatusBadge
import com.knoux.rec.visualcandidate.components.PremiumCard
import com.knoux.rec.visualcandidate.components.PremiumCardVariant
import com.knoux.rec.visualcandidate.components.KnouxBottomNavigation
import com.knoux.rec.visualcandidate.components.KnouxBrandHeader
import kotlin.math.max
import kotlin.math.min

@Composable
fun RecordingResultCandidateScreen(
    modifier: Modifier = Modifier,
    state: RecordingResultUiState,
    onAction: (CandidateAction) -> Unit
) {
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
                    verticalArrangement = Arrangement.spacedBy(20.dp)
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
                                    text = "Recording saved",
                                    style = CandidateTypography.HeadlineSmall.copy(fontSize = 16.sp),
                                    color = CandidateColors.PrimaryText
                                )
                                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 2.dp))
                                Text(
                                    text = "LOCAL FILE · READY FOR PLAYBACK",
                                    style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
                                    color = CandidateColors.SuccessGreenBright
                                )
                            }
                            BackArrow(
                                modifier = Modifier.padding(start = 12.dp),
                                onClick = { onAction(CandidateAction.NavigateBack) }
                            )
                        }
                    }

                    VerifiedSaveBadge(modifier = Modifier.fillMaxWidth())

                    androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(vertical = 8.dp))

                    RecordedMediaPreview(
                        modifier = Modifier.fillMaxWidth(),
                        verified = state.verified,
                        onPlayClick = { onAction(CandidateAction.PlayMedia(state.mediaId)) }
                    )

                    MediaMetadataCard(
                        modifier = Modifier.fillMaxWidth(),
                        result = state
                    )

                    MediaActionRow(
                        modifier = Modifier.fillMaxWidth(),
                        onPlayClick = { onAction(CandidateAction.PlayMedia(state.mediaId)) },
                        onShareClick = { onAction(CandidateAction.ShareMedia(state.mediaId)) },
                        onLibraryClick = { onAction(CandidateAction.OpenMediaDetails(state.mediaId)) }
                    )

                    com.knoux.rec.visualcandidate.components.SectionHeader(
                        title = "ADVANCED EDITING",
                        subtitle = "Planned for a later native release.",
                        accentColor = CandidateColors.VioletAccent,
                        showDivider = true
                    )

                    BadgeBadge(text = "PLANNED", variant = StatusBadgeVariant.Planned)
                }
            }
        }
    )
}

@Composable
fun VerifiedSaveBadge(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(CandidateShapes.Pill)
            .background(CandidateColors.SuccessGreenTransparent, CandidateShapes.Pill),
        contentAlignment = Alignment.Center
    ) {
        Canvas(
            modifier = Modifier.fillMaxSize().padding(14.dp),
            onDraw = {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val cx = width / 2f
                val cy = height / 2f

                val checkPath = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx - width * 0.2f, cy + height * 0.05f)
                    quadTo(cx - width * 0.05f, cy + height * 0.35f, cx + width * 0.2f, cy - height * 0.25f)
                    lineTo(cx + width * 0.05f, cy - height * 0.05f)
                    close()
                }
                drawPath(checkPath, Color.White, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = max(width, height) * 0.03f) {
                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                }
            }
        )
        Column(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "SAVED LOCALLY",
                style = CandidateTypography.ChipLabel.copy(fontSize = 11.sp),
                color = CandidateColors.SuccessGreenBright
            )
        }
    }
}

@Composable
fun RecordedMediaPreview(
    modifier: Modifier = Modifier,
    verified: Boolean,
    onPlayClick: () -> Unit
) {
    if (!verified) {
        val errorAlpha = androidx.compose.animation.core.animateFloatAsState(
            targetValue = 1f,
            animationSpec = androidx.compose.animation.core.tween(500),
            label = "errorFade"
        ).value

        Box(
            modifier = modifier.padding(horizontal = 24.dp).fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            MediaPreviewCard(
                modifier = Modifier.fillMaxWidth(),
                title = "Verification pending",
                subtitle = "File could not be verified locally yet.",
                duration = null,
                resolution = state?.resolution?.displayName ?: "Unknown",
                codec = "N/A",
                accentColor = CandidateColors.RecordingRed,
                showPlayButton = false,
                showDivider = false
            )
        }
    } else {
        MediaPreviewCard(
            modifier = modifier.padding(horizontal = 24.dp).fillMaxWidth(),
            title = "SCREEN RECORDING",
            subtitle = "October 28, 2026",
            duration = "",
            resolution = state?.resolution?.displayName ?: "1080P",
            codec = "H.264 / AAC",
            accentColor = CandidateColors.PrimaryGold,
            showPlayButton = true,
            onPlayClick = onPlayClick
        )
    }
}

@Composable
fun MediaMetadataCard(
    modifier: Modifier = Modifier,
    result: RecordingResultUiState
) {
    val formattedDuration = result.formattedDuration
    val formattedSize = result.formattedFileSize
    val formattedDate = result.formattedDate

    PremiumCard(
        modifier = modifier.fillMaxWidth(),
        variant = PremiumCardVariant.Panel
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            val metadataRows = listOf(
                MetadataRow("Filename", result.fileName),
                MetadataRow("Resolution", result.resolution.displayName),
                MetadataRow("Codec", result.codec),
                MetadataRow("Duration", formattedDuration),
                MetadataRow("Size", formattedSize),
                MetadataRow("Date", formattedDate),
                MetadataRow("ID", result.mediaId)
            )

            metadataRows.forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box(
                        modifier = Modifier.weight(1f).padding(end = 16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = row.value,
                            style = CandidateTypography.BodyMedium.copy(fontSize = 14.sp),
                            color = CandidateColors.PrimaryText
                        )
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .padding(start = 16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = row.label,
                            style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
                            color = CandidateColors.TertiaryText
                        )
                    }
                }
            }
        }
    }
}

data class MetadataRow(val label: String, val value: String)

@Composable
fun MediaActionRow(
    modifier: Modifier = Modifier,
    onPlayClick: () -> Unit,
    onShareClick: () -> Unit,
    onLibraryClick: () -> Unit
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ActionButton(
            text = "Play",
            icon = { PlayIcon(it, CandidateColors.PrimaryGold) },
            onClick = onPlayClick,
            enabled = true
        )
        ActionButton(
            text = "Share",
            icon = { ShareIcon(it, CandidateColors.CyanAccent) },
            onClick = onShareClick,
            enabled = true
        )
        ActionButton(
            text = "Library",
            icon = { LibraryBackIcon(it, CandidateColors.VioletAccent), it, CandidateColors.VioletAccent
            },
            onClick = onLibraryClick,
            enabled = true
        )
    }
}

@Composable
private fun ActionButton(
    modifier: Modifier = Modifier,
    text: String,
    icon: @Composable (Modifier) -> Unit,
    onClick: () -> Unit,
    enabled: Boolean = true
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
                if (pressed.value && enabled) CandidateColors.PrimaryGold.copy(alpha = 0.1f) else Color.Transparent,
                CandidateShapes.ButtonCompact
            )
            .border(1.dp, if (enabled) CandidateColors.GoldBorder else CandidateColors.DisabledStroke, CandidateShapes.ButtonCompact)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.padding(end = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            icon(Modifier.size(18.dp))
            Text(
                text = text,
                style = CandidateTypography.LabelLarge.copy(fontSize = 11.sp),
                color = if (enabled) CandidateColors.PrimaryGold else CandidateColors.DisabledText
            )
        }
    }
}

@Composable
private fun BadgeBadge(
    modifier: Modifier = Modifier,
    text: String,
    variant: StatusBadgeVariant = StatusBadgeVariant.Default
) {
    Box(
        modifier = modifier
            .padding(horizontal = 24.dp, vertical = 8.dp),
            contentAlignment = Alignment.Center
    ) {
        StatusBadge(text = text, variant = variant)
    }
}

private fun PlayIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx, cy - s * 0.3f)
            lineTo(cx + s * 0.2f, cy + s * 0.3f)
            lineTo(cx - s * 0.15f, cy + s * 0.3f)
            close()
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Fill)
    })
}

private fun ShareIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)
        val sw = s * 0.08f

        val rect = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(Rect(Offset(cx - s * 0.3f, cy - s * 0.15f), Size(s * 0.6f, s * 0.3f)), s * 0.06f)
        }
        drawPath(rect, color, style = androidx.compose.ui.graphics.Paint.Style.Fill)

        val line = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.3f, cy - s * 0.2f)
            lineTo(cx + s * 0.5f, cy + s * 0.2f)
        }
        drawPath(line, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val arrowPath = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.4f, cy - s * 0.1f)
            lineTo(cx + s * 0.55f, cy + s * 0.1f)
            lineTo(cx + s * 0.2f, cy + s * 0.1f)
            close()
        }
        drawPath(arrowPath, color, style = androidx.compose.ui.graphics.Paint.Style.Fill)
    })
}

private fun LibraryBackIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val sw = s * 0.08f

        val rect = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(Rect(Offset(cx - s * 0.3f, cy - s * 0.2f), Size(s * 0.6f, s * 0.4f)), s * 0.06f)
        }
        drawPath(rect, color, style = androidx.compose.ui.graphics.Paint.Style.Fill)

        val spine1 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.15f, cy - s * 0.2f)
            lineTo(cx - s * 0.15f, cy + s * 0.2f)
        }
        drawPath(spine1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val spine2 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.15f, cy - s * 0.2f)
            lineTo(cx + s * 0.15f, cy + s * 0.2f)
        }
        drawPath(spine2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}