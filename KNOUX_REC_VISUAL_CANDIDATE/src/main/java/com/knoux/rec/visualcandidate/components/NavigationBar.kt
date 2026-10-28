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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun KnouxBottomNavigation(
    modifier: Modifier = Modifier,
    currentTab: NavigationTab,
    onTabSelected: (NavigationTab) -> Unit,
    showLabels: Boolean = true
) {
    val navItems = listOf(
        NavigationTab.Home to "Home" to { HomeIcon(Modifier.size(24.dp), CandidateColors.PrimaryText) },
        NavigationTab.Library to "Library" to { LibraryIcon(Modifier.size(24.dp), CandidateColors.PrimaryText) },
        NavigationTab.Tools to "Tools" to { ToolsIcon(Modifier.size(24.dp), CandidateColors.PrimaryText) },
        NavigationTab.Settings to "Settings" to { SettingsIcon(Modifier.size(24.dp), CandidateColors.PrimaryText) }
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(88.dp)
            .padding(bottom = 16.dp, horizontal = 16.dp)
            .background(
                CandidateColors.DeepElevatedSurface.copy(alpha = 0.95f),
                CandidateShapes.BottomSheet
            )
            .border(1.dp, CandidateColors.CardStrokeGold, CandidateShapes.BottomSheet)
            .clip(CandidateShapes.BottomSheet)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 8.dp, vertical = 8.dp),
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            navItems.forEach { (tab, label, icon) ->
                val isSelected = currentTab == tab
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .pointerInput(Unit) {
                            androidx.compose.foundation.gestures.detectTapGestures(
                                onTap = { onTabSelected(tab) }
                            )
                        }
                        .background(
                            if (isSelected) CandidateColors.GoldTransparent else Color.Transparent,
                            CandidateShapes.Pill
                        )
                        .border(
                            if (isSelected) 1.dp else 0.dp,
                            if (isSelected) CandidateColors.GoldBorder else Color.Transparent,
                            CandidateShapes.Pill
                        ),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(4.dp)
                ) {
                    icon()
                    if (showLabels) {
                        Text(
                            text = label,
                            style = CandidateTypography.NavLabel.copy(
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) androidx.compose.ui.text.font.FontWeight.SemiBold else androidx.compose.ui.text.font.FontWeight.Medium
                            ),
                            color = if (isSelected) CandidateColors.PrimaryGold else CandidateColors.TertiaryText
                        )
                    }
                }
            }
        }
    }
}

enum class NavigationTab {
    Home, Library, Tools, Settings, Diagnostics
}

@Composable
fun HomeIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.1f

        val path = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx, cy - s * 0.35f)
            lineTo(cx - s * 0.3f, cy + s * 0.1f)
            lineTo(cx - s * 0.1f, cy + s * 0.1f)
            lineTo(cx - s * 0.1f, cy + s * 0.35f)
            lineTo(cx + s * 0.1f, cy + s * 0.35f)
            lineTo(cx + s * 0.1f, cy + s * 0.1f)
            lineTo(cx + s * 0.3f, cy + s * 0.1f)
            close()
        }
        drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val chimney = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.15f, cy - s * 0.15f)
            lineTo(cx + s * 0.15f, cy - s * 0.35f)
            lineTo(cx + s * 0.25f, cy - s * 0.35f)
            lineTo(cx + s * 0.25f, cy - s * 0.15f)
        }
        drawPath(chimney, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun LibraryIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.1f

        val rect = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.35f, cy - s * 0.3f)
            lineTo(cx + s * 0.35f, cy - s * 0.3f)
            lineTo(cx + s * 0.35f, cy + s * 0.35f)
            lineTo(cx - s * 0.35f, cy + s * 0.35f)
            close()
        }
        drawPath(rect, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val spine1 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.15f, cy - s * 0.3f)
            lineTo(cx - s * 0.15f, cy + s * 0.35f)
        }
        drawPath(spine1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val spine2 = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.15f, cy - s * 0.3f)
            lineTo(cx + s * 0.15f, cy + s * 0.35f)
        }
        drawPath(spine2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun ToolsIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.09f

        val wrench = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.35f, cy + s * 0.35f)
            lineTo(cx - s * 0.1f, cy + s * 0.1f)
            lineTo(cx - s * 0.2f, cy - s * 0.05f)
            lineTo(cx + s * 0.05f, cy - s * 0.3f)
            lineTo(cx + s * 0.2f, cy - s * 0.15f)
            lineTo(cx + s * 0.35f, cy - s * 0.3f)
            lineTo(cx + s * 0.2f, cy - s * 0.15f)
            lineTo(cx + s * 0.05f, cy - s * 0.3f)
            lineTo(cx - s * 0.2f, cy - s * 0.05f)
            lineTo(cx - s * 0.1f, cy + s * 0.1f)
            close()
        }
        drawPath(wrench, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val screw = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx + s * 0.1f, cy + s * 0.2f)
            lineTo(cx + s * 0.3f, cy + s * 0.2f)
            lineTo(cx + s * 0.3f, cy + s * 0.3f)
            lineTo(cx + s * 0.1f, cy + s * 0.3f)
            close()
        }
        drawPath(screw, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth * 0.7f) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
fun SettingsIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.09f

        val outerRadius = s * 0.35f
        val innerRadius = s * 0.18f
        val toothCount = 8

        for (i in 0 until toothCount) {
            val angle = i * 360f / toothCount
            val startRad = (angle - 15f) * 3.14159f / 180f
            val endRad = (angle + 15f) * 3.14159f / 180f

            val tooth = androidx.compose.ui.graphics.Path().apply {
                moveTo(cx + cos(startRad) * innerRadius, cy + sin(startRad) * innerRadius)
                lineTo(cx + cos(startRad) * outerRadius, cy + sin(startRad) * outerRadius)
                lineTo(cx + cos(endRad) * outerRadius, cy + sin(endRad) * outerRadius)
                lineTo(cx + cos(endRad) * innerRadius, cy + sin(endRad) * innerRadius)
                close()
            }
            drawPath(tooth, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
            }
        }

        drawCircle(
            color = color,
            center = Offset(cx, cy),
            radius = innerRadius * 0.6f,
            style = androidx.compose.ui.graphics.Paint.Style.Stroke,
            strokeWidth = strokeWidth
        )
    })
}

@Composable
fun BackArrow(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .size(48.dp)
            .clip(CandidateShapes.Circle)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(onTap = onClick)
            }
            .background(CandidateColors.SecondarySurface, CandidateShapes.Circle)
            .border(1.dp, CandidateColors.CardStroke, CandidateShapes.Circle)
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            onDraw = {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val s = min(width, height)
                val cx = width / 2f
                val cy = height / 2f
                val strokeWidth = s * 0.12f

                val path = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx + s * 0.3f, cy - s * 0.3f)
                    lineTo(cx - s * 0.1f, cy)
                    lineTo(cx + s * 0.3f, cy + s * 0.3f)
                }
                drawPath(path, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                    this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
                }
            }
        )
    }
}

@Composable
fun CloseIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .size(48.dp)
            .clip(CandidateShapes.Circle)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(onTap = onClick)
            }
            .background(CandidateColors.SecondarySurface, CandidateShapes.Circle)
            .border(1.dp, CandidateColors.CardStroke, CandidateShapes.Circle)
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            onDraw = {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val s = min(width, height)
                val cx = width / 2f
                val cy = height / 2f
                val strokeWidth = s * 0.12f

                val path1 = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx - s * 0.3f, cy - s * 0.3f)
                    lineTo(cx + s * 0.3f, cy + s * 0.3f)
                }
                drawPath(path1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                }

                val path2 = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx + s * 0.3f, cy - s * 0.3f)
                    lineTo(cx - s * 0.3f, cy + s * 0.3f)
                }
                drawPath(path2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                }
            }
        )
    }
}

@Composable
fun SettingsCategoryTabs(
    modifier: Modifier = Modifier,
    categories: List<SettingsCategory>,
    selectedCategory: SettingsCategory,
    onCategorySelected: (SettingsCategory) -> Unit
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp)
    ) {
        categories.forEach { category ->
            val isSelected = selectedCategory == category
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(44.dp)
                    .clip(CandidateShapes.SegmentedControl)
                    .pointerInput(Unit) {
                        androidx.compose.foundation.gestures.detectTapGestures(onTap = { onCategorySelected(category) })
                    }
                    .background(
                        if (isSelected) CandidateColors.GoldTransparent else CandidateColors.SecondarySurface,
                        CandidateShapes.SegmentedControl
                    )
                    .border(
                        if (isSelected) 1.5.dp else 1.dp,
                        if (isSelected) CandidateColors.GoldBorder else CandidateColors.CardStroke.copy(alpha = 0.5f),
                        CandidateShapes.SegmentedControl
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = category.displayName,
                    style = CandidateTypography.LabelMedium.copy(fontSize = 12.sp),
                    color = if (isSelected) CandidateColors.PrimaryGold else CandidateColors.SecondaryText
                )
            }
        }
    }
}

enum class SettingsCategory(val displayName: String) {
    General("General"),
    Capture("Capture"),
    Appearance("Appearance")
}