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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.knoux.rec.visualcandidate.components.ToolBoxCard
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.contract.ToolsStudioUiState
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun ToolsStudioCandidateScreen(
    modifier: Modifier = Modifier,
    state: ToolsStudioUiState,
    onAction: (CandidateAction) -> Unit
) {
    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = true,
        bottomNavTab = NavigationTab.Tools,
        onBottomNavClick = { tab ->
            when (tab) {
                NavigationTab.Home -> onAction(CandidateAction.NavigateTo(NavigationDestination.Home))
                NavigationTab.Library -> onAction(CandidateAction.NavigateTo(NavigationDestination.MediaLibrary))
                NavigationTab.Tools -> {}
                NavigationTab.Settings -> onAction(CandidateAction.NavigateTo(NavigationDestination.Settings))
                NavigationTab.Diagnostics -> onAction(CandidateAction.NavigateTo(NavigationDestination.Diagnostics))
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
                            text = "TEXT & UTILITIES",
                            style = CandidateTypography.HeadlineSmall.copy(fontSize = 16.sp),
                            color = CandidateColors.PrimaryText
                        )
                        Text(
                            text = "Creative tools",
                            style = CandidateTypography.TitleMedium.copy(fontSize = 18.sp),
                            color = CandidateColors.PrimaryGold
                        )
                        Text(
                            text = "Useful local capabilities. No cloud required.",
                            style = CandidateTypography.BodyMedium,
                            color = CandidateColors.SecondaryText
                        )
                    }

                    ArabicTextAnalysisCard(
                        modifier = Modifier.fillMaxWidth(),
                        state = state,
                        onTextChange = { text -> 
                            val words = text.split("\\s+".toRegex()).filter { it.isNotEmpty() }.size
                            val letters = text.count { it.isLetter() }
                            val diacritics = text.count { 
                                val category = Character.getType(it)
                                category == Character.NON_SPACING_MARK.toInt()
                            }
                            val arabicIndic = text.count { it in '٠'..'٩' }
                        },
                        onCleanClick = { onAction(CandidateAction.RunArabicCleaner(state.arabicInputText)) },
                        onConvertClick = { onAction(CandidateAction.ConvertDigits(state.arabicInputText, true)) }
                    )

                    SectionHeader(
                        title = "MORE FEATURES",
                        subtitle = "Toolbox",
                        accentColor = CandidateColors.CyanAccent
                    )

                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 32.dp)
                    ) {
                        item {
                            ToolBoxCard(
                                modifier = Modifier.fillMaxWidth(),
                                title = "Arabic cleaner",
                                subtitle = "Normalize and clean Arabic text",
                                status = if (state.cleanerAvailable) "AVAILABLE" else "UNAVAILABLE",
                                statusVariant = if (state.cleanerAvailable) StatusBadgeVariant.Available else StatusBadgeVariant.Blocked,
                                accentColor = CandidateColors.CyanAccent,
                                icon = { CleanIcon(it, CandidateColors.CyanAccent) },
                                enabled = state.cleanerAvailable,
                                onClick = { if (state.cleanerAvailable) onAction(CandidateAction.RunArabicCleaner(state.arabicInputText)) }
                            )
                        }
                        item {
                            ToolBoxCard(
                                modifier = Modifier.fillMaxWidth(),
                                title = "Digit converter",
                                subtitle = "Arabic-Indic ↔ Western digits",
                                status = if (state.digitConverterAvailable) "AVAILABLE" else "UNAVAILABLE",
                                statusVariant = if (state.digitConverterAvailable) StatusBadgeVariant.Available else StatusBadgeVariant.Blocked,
                                accentColor = CandidateColors.PrimaryGold,
                                icon = { ConvertIcon(it, CandidateColors.PrimaryGold) },
                                enabled = state.digitConverterAvailable,
                                onClick = { if (state.digitConverterAvailable) onAction(CandidateAction.ConvertDigits(state.arabicInputText, true)) }
                            )
                        }
                        item {
                            ToolBoxCard(
                                modifier = Modifier.fillMaxWidth(),
                                title = "Screenshot editor",
                                subtitle = "Crop, annotate & edit",
                                status = "PLANNED",
                                statusVariant = StatusBadgeVariant.Planned,
                                accentColor = CandidateColors.VioletAccent,
                                icon = { EditIcon(it, CandidateColors.VioletAccent) },
                                enabled = false,
                                onClick = { }
                            )
                        }
                        item {
                            ToolBoxCard(
                                modifier = Modifier.fillMaxWidth(),
                                title = "Video trimming",
                                subtitle = "Cut and trim recordings",
                                status = "PLANNED",
                                statusVariant = StatusBadgeVariant.Planned,
                                accentColor = CandidateColors.AmberWarning,
                                icon = { TrimIcon(it, CandidateColors.AmberWarning) },
                                enabled = false,
                                onClick = { }
                            )
                        }
                        item {
                            ToolBoxCard(
                                modifier = Modifier.fillMaxWidth(),
                                title = "Offline AI models",
                                subtitle = "On-device intelligence",
                                status = "BLOCKED",
                                statusVariant = StatusBadgeVariant.Blocked,
                                accentColor = CandidateColors.RecordingRed,
                                icon = { AIIcon(it, CandidateColors.RecordingRed) },
                                enabled = false,
                                onClick = { }
                            )
                        }
                    }
                }
            }
        }
    )
}

@Composable
fun ArabicTextAnalysisCard(
    modifier: Modifier = Modifier,
    state: ToolsStudioUiState,
    onTextChange: (String) -> Unit,
    onCleanClick: () -> Unit,
    onConvertClick: () -> Unit
) {
    PremiumCard(
        modifier = modifier,
        variant = PremiumCardVariant.Panel
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "ARABIC TEXT ANALYSIS",
                style = CandidateTypography.SectionLabel.copy(fontSize = 11.sp),
                color = CandidateColors.CyanAccent
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .clip(CandidateShapes.PanelCompact)
                    .background(CandidateColors.DarkBackground, CandidateShapes.PanelCompact)
                    .border(1.dp, CandidateColors.CardStrokeCyan, CandidateShapes.PanelCompact)
                    .padding(12.dp)
            ) {
                androidx.compose.material3.TextField(
                    value = state.arabicInputText,
                    onValueChange = onTextChange,
                    placeholder = { Text("أدخل نصًا بالعربية هنا...", color = CandidateColors.TertiaryText) },
                    colors = androidx.compose.material3.TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        focusedTextColor = CandidateColors.PrimaryText,
                        unfocusedTextColor = CandidateColors.PrimaryText
                    ),
                    modifier = Modifier.fillMaxSize()
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricBox("WORDS", "${state.arabicWordCount}", CandidateColors.PrimaryGold)
                MetricBox("LETTERS", "${state.arabicLetterCount}", CandidateColors.VioletAccent)
                MetricBox("ARABIC", "${state.arabicIndicDigitCount}", CandidateColors.CyanAccent)
            }
        }
    }
}

@Composable
private fun MetricBox(label: String, value: String, color: Color) {
    Column(
        modifier = Modifier
            .weight(1f)
            .clip(CandidateShapes.PanelCompact)
            .background(color.copy(alpha = 0.1f), CandidateShapes.PanelCompact)
            .border(1.dp, color.copy(alpha = 0.4f), CandidateShapes.PanelCompact)
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = value,
            style = CandidateTypography.HeadlineMedium.copy(fontSize = 18.sp),
            color = color
        )
        Text(
            text = label,
            style = CandidateTypography.SectionLabel.copy(fontSize = 9.sp),
            color = CandidateColors.TertiaryText
        )
    }
}

@Composable
fun ToolBoxCard(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    status: String,
    statusVariant: StatusBadgeVariant,
    accentColor: Color,
    icon: @Composable (Modifier) -> Unit,
    enabled: Boolean,
    onClick: () -> Unit
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    Box(
        modifier = modifier
            .clip(CandidateShapes.Card)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onPress = { pressed.value = true },
                    onRelease = { pressed.value = false },
                    onTap = { if (enabled) onClick() }
                )
            }
            .background(CandidateColors.DeepElevatedSurface, CandidateShapes.Card)
            .border(1.dp, if (enabled) accentColor.copy(alpha = 0.4f) else CandidateColors.CardStroke.copy(alpha = 0.3f), CandidateShapes.Card)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CandidateShapes.Circle)
                    .background(accentColor.copy(alpha = 0.15f), CandidateShapes.Circle)
                    .border(1.dp, accentColor.copy(alpha = 0.5f), CandidateShapes.Circle),
                contentAlignment = Alignment.Center
            ) {
                icon(Modifier.size(24.dp))
            }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = title,
                    style = CandidateTypography.TitleMedium.copy(fontSize = 15.sp),
                    color = if (enabled) CandidateColors.PrimaryText else CandidateColors.TertiaryText
                )
                Text(
                    text = subtitle,
                    style = CandidateTypography.BodySmall,
                    color = CandidateColors.SecondaryText
                )
            }
            StatusBadge(text = status, variant = statusVariant)
        }
    }
}

private fun CleanIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)
        val sw = s * 0.08f

        val brush = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(Rect(Offset(cx - s * 0.3f, cy - s * 0.15f), Size(s * 0.6f, s * 0.3f)), s * 0.04f)
        }
        drawPath(brush, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val bristle1 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.25f, cy - s * 0.05f)
            lineTo(cx - s * 0.25f, cy - s * 0.25f)
        }
        drawPath(bristle1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

private fun ConvertIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)
        val sw = s * 0.08f

        val arrow1 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.3f, cy - s * 0.1f)
            lineTo(cx - s * 0.15f, cy - s * 0.25f)
            lineTo(cx - s * 0.15f, cy - s * 0.05f)
            lineTo(cx + s * 0.15f, cy - s * 0.05f)
        }
        drawPath(arrow1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val arrow2 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.3f, cy + s * 0.1f)
            lineTo(cx + s * 0.15f, cy + s * 0.25f)
            lineTo(cx + s * 0.15f, cy + s * 0.05f)
            lineTo(cx - s * 0.15f, cy + s * 0.05f)
        }
        drawPath(arrow2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }
    })
}

private fun EditIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)
        val sw = s * 0.08f

        val pencil = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.2f, cy + s * 0.2f)
            lineTo(cx + s * 0.15f, cy - s * 0.15f)
            lineTo(cx + s * 0.25f, cy - s * 0.05f)
            lineTo(cx - s * 0.1f, cy + s * 0.3f)
            close()
        }
        drawPath(pencil, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val tip = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.2f, cy + s * 0.2f)
            lineTo(cx - s * 0.25f, cy + s * 0.25f)
        }
        drawPath(tip, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

private fun TrimIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)
        val sw = s * 0.08f

        val scissors = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.25f, cy - s * 0.15f)
            lineTo(cx + s * 0.05f, cy + s * 0.15f)
            lineTo(cx - s * 0.25f, cy + s * 0.15f)
            close()
            moveTo(cx - s * 0.25f, cy + s * 0.15f)
            lineTo(cx + s * 0.05f, cy - s * 0.15f)
        }
        drawPath(scissors, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val blade1 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.05f, cy + s * 0.15f)
            lineTo(cx + s * 0.25f, cy + s * 0.25f)
        }
        drawPath(blade1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val blade2 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.05f, cy - s * 0.15f)
            lineTo(cx + s * 0.25f, cy - s * 0.25f)
        }
        drawPath(blade2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

private fun AIIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val cx = width / 2f
        val cy = height / 2f
        val s = min(width, height)
        val sw = s * 0.08f

        val brain = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.2f, cy - s * 0.15f)
            quadTo(cx, cy - s * 0.25f, cx + s * 0.2f, cy - s * 0.15f)
            quadTo(cx + s * 0.25f, cy, cx + s * 0.2f, cy + s * 0.15f)
            quadTo(cx, cy + s * 0.25f, cx - s * 0.2f, cy + s * 0.15f)
            quadTo(cx - s * 0.25f, cy, cx - s * 0.2f, cy - s * 0.15f)
            close()
        }
        drawPath(brain, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val dots = listOf(
            Offset(cx - s * 0.1f, cy - s * 0.05f),
            Offset(cx, cy - s * 0.08f),
            Offset(cx + s * 0.1f, cy - s * 0.05f),
            Offset(cx - s * 0.05f, cy + s * 0.02f),
            Offset(cx, cy + s * 0.05f),
            Offset(cx + s * 0.05f, cy + s * 0.02f)
        )
        dots.forEach { dot ->
            drawCircle(color = color, center = dot, radius = s * 0.02f)
        }
    })
}