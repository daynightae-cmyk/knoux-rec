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
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.weight
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
import com.knoux.rec.visualcandidate.components.CosmicBackground
import com.knoux.rec.visualcandidate.components.GoldRecordingOrb
import com.knoux.rec.visualcandidate.components.KnouxBrandHeader
import com.knoux.rec.visualcandidate.components.KnouxBottomNavigation
import com.knoux.rec.visualcandidate.components.MetricCard
import com.knoux.rec.visualcandidate.components.PremiumCard
import com.knoux.rec.visualcandidate.components.PremiumCardVariant
import com.knoux.rec.visualcandidate.components.SectionHeader
import com.knoux.rec.visualcandidate.components.WelcomeBackHeader
import com.knoux.rec.visualcandidate.components.CaptureReadinessChip
import com.knoux.rec.visualcandidate.components.GoldenPrimaryAction
import com.knoux.rec.visualcandidate.components.IconActionButton
import com.knoux.rec.visualcandidate.components.RecordingReadiness
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.HomeUiState
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography
import com.knoux.rec.visualcandidate.components.NavigationTab

@Composable
fun HomeCandidateScreen(
    modifier: Modifier = Modifier,
    state: HomeUiState,
    onAction: (CandidateAction) -> Unit
) {
    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = true,
        bottomNavTab = NavigationTab.Home,
        onBottomNavClick = { tab ->
            when (tab) {
                NavigationTab.Home -> {}
                NavigationTab.Library -> onAction(CandidateAction.NavigateTo(NavigationDestination.MediaLibrary))
                NavigationTab.Tools -> onAction(CandidateAction.NavigateTo(NavigationDestination.ToolsStudio))
                NavigationTab.Settings -> onAction(CandidateAction.NavigateTo(NavigationDestination.Settings))
                NavigationTab.Diagnostics -> onAction(CandidateAction.NavigateTo(NavigationDestination.Diagnostics))
            }
        },
        topBar = {
            KnouxBrandHeader(
                modifier = Modifier.fillMaxWidth(),
                showBadge = true,
                showSubtitle = true,
                compact = false
            )
        }
    ) { contentModifier, insets ->
        Box(
            modifier = contentModifier
                .fillMaxSize()
                .padding(top = 8.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                WelcomeBackHeader()

                RecordingHeroCard(
                    modifier = Modifier.fillMaxWidth(),
                    readiness = state.recordingReadiness,
                    currentResolution = state.currentResolution,
                    currentFrameRate = state.currentFrameRate,
                    onStartRecording = { onAction(CandidateAction.NavigateTo(NavigationDestination.CaptureSetup)) }
                )

                SectionHeader(
                    title = "YOUR WORKSPACE",
                    subtitle = "Quick access",
                    accentColor = CandidateColors.PrimaryGold
                )

                QuickAccessGrid(
                    modifier = Modifier.fillMaxWidth(),
                    onLibraryClick = { onAction(CandidateAction.NavigateTo(NavigationDestination.MediaLibrary)) },
                    onToolsClick = { onAction(CandidateAction.NavigateTo(NavigationDestination.ToolsStudio)) },
                    onSettingsClick = { onAction(CandidateAction.NavigateTo(NavigationDestination.Settings)) },
                    onDiagnosticsClick = { onAction(CandidateAction.NavigateTo(NavigationDestination.Diagnostics)) }
                )
            }
        }
    }
}

@Composable
fun RecordingHeroCard(
    modifier: Modifier = Modifier,
    readiness: RecordingReadiness,
    currentResolution: com.knoux.rec.visualcandidate.contract.CaptureResolution,
    currentFrameRate: com.knoux.rec.visualcandidate.contract.CaptureFrameRate,
    onStartRecording: () -> Unit
) {
    PremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .height(320.dp)
            .padding(vertical = 8.dp),
        variant = PremiumCardVariant.Hero
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            GoldRecordingOrb(
                modifier = Modifier.size(160.dp),
                showInnerRings = true,
                showPlayIcon = true,
                animated = true,
                readiness = readiness
            )
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 16.dp))

            CaptureReadinessChip(readiness = readiness)

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 20.dp))

            Text(
                text = "START RECORDING",
                style = CandidateTypography.HeadlineMedium.copy(fontSize = 22.sp),
                color = CandidateColors.PrimaryText,
                textAlign = TextAlign.Center
            )

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))

            Text(
                text = "Screen · Mic · Internal audio*",
                style = CandidateTypography.BodyMedium,
                color = CandidateColors.SecondaryText,
                textAlign = TextAlign.Center
            )

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 20.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ResolutionBadge(resolution = currentResolution)
                FrameRateBadge(frameRate = currentFrameRate)
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 24.dp))

            GoldenPrimaryAction(
                text = "CONFIGURE & START",
                onClick = onStartRecording,
                enabled = readiness != RecordingReadiness.Error && readiness != RecordingReadiness.Unavailable,
                height = 52.dp
            )
        }
    }
}

@Composable
fun ResolutionBadge(
    modifier: Modifier = Modifier,
    resolution: com.knoux.rec.visualcandidate.contract.CaptureResolution
) {
    Box(
        modifier = modifier
            .weight(1f, fill = true)
            .height(36.dp)
            .clip(CandidateShapes.Chip)
            .background(CandidateColors.SecondarySurface, CandidateShapes.Chip)
            .border(1.dp, CandidateColors.CardStroke.copy(alpha = 0.5f), CandidateShapes.Chip),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = resolution.displayName,
            style = CandidateTypography.LabelMedium.copy(fontSize = 11.sp),
            color = CandidateColors.PrimaryGold
        )
    }
}

@Composable
fun FrameRateBadge(
    modifier: Modifier = Modifier,
    frameRate: com.knoux.rec.visualcandidate.contract.CaptureFrameRate
) {
    Box(
        modifier = modifier
            .weight(1f, fill = true)
            .height(36.dp)
            .clip(CandidateShapes.Chip)
            .background(CandidateColors.SecondarySurface, CandidateShapes.Chip)
            .border(1.dp, CandidateColors.CardStroke.copy(alpha = 0.5f), CandidateShapes.Chip),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = frameRate.displayName,
            style = CandidateTypography.LabelMedium.copy(fontSize = 11.sp),
            color = CandidateColors.CyanAccent
        )
    }
}

@Composable
fun QuickAccessGrid(
    modifier: Modifier = Modifier,
    onLibraryClick: () -> Unit,
    onToolsClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onDiagnosticsClick: () -> Unit
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            WorkspaceActionCard(
                modifier = Modifier.weight(1f, fill = true),
                title = "My Library",
                subtitle = "Browse recordings",
                accentColor = CandidateColors.CyanAccent,
                icon = { LibraryIcon(it, CandidateColors.CyanAccent) },
                onClick = onLibraryClick
            )
            WorkspaceActionCard(
                modifier = Modifier.weight(1f, fill = true),
                title = "Creative Tools",
                subtitle = "Text & utilities",
                accentColor = CandidateColors.VioletAccent,
                icon = { ToolsIcon(it, CandidateColors.VioletAccent) },
                onClick = onToolsClick
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            WorkspaceActionCard(
                modifier = Modifier.weight(1f, fill = true),
                title = "Preferences",
                subtitle = "Customize experience",
                accentColor = CandidateColors.PrimaryGold,
                icon = { SettingsIcon(it, CandidateColors.PrimaryGold) },
                onClick = onSettingsClick
            )
            WorkspaceActionCard(
                modifier = Modifier.weight(1f, fill = true),
                title = "Device Check",
                subtitle = "Run diagnostics",
                accentColor = CandidateColors.SuccessGreen,
                icon = { DiagnosticsIcon(it, CandidateColors.SuccessGreen) },
                onClick = onDiagnosticsClick
            )
        }
    }
}

@Composable
fun WorkspaceActionCard(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    accentColor: Color,
    icon: @Composable (Modifier) -> Unit,
    onClick: () -> Unit
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)

    Box(
        modifier = modifier
            .height(120.dp)
            .clip(CandidateShapes.Card)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onPress = { pressed.value = true },
                    onRelease = { pressed.value = false },
                    onTap = onClick
                )
            }
            .graphicsLayer {
                scaleX = if (pressed.value) 0.98f else 1f
                scaleY = if (pressed.value) 0.98f else 1f
            }
            .background(CandidateColors.DeepElevatedSurface, CandidateShapes.Card)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CandidateShapes.Circle)
                    .background(accentColor.copy(alpha = 0.15f), CandidateShapes.Circle)
                    .border(1.5.dp, accentColor.copy(alpha = 0.5f), CandidateShapes.Circle),
                contentAlignment = Alignment.Center
            ) {
                icon(Modifier.size(24.dp))
            }
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 12.dp))
            Text(
                text = title,
                style = CandidateTypography.TitleMedium.copy(fontSize = 15.sp),
                color = CandidateColors.PrimaryText,
                textAlign = TextAlign.Center,
                maxLines = 1,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
            )
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
            Text(
                text = subtitle,
                style = CandidateTypography.BodySmall,
                color = CandidateColors.SecondaryText,
                textAlign = TextAlign.Center,
                maxLines = 1,
                overflow = androidx.compose.ui.text.TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
fun DiagnosticsIcon(modifier: Modifier = Modifier, color: Color = CandidateColors.PrimaryText) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val strokeWidth = s * 0.09f

        val outerRadius = s * 0.4f
        val innerRadius = s * 0.15f
        val toothCount = 6

        for (i in 0 until toothCount) {
            val angle = i * 360f / toothCount
            val startRad = (angle - 12f) * 3.14159f / 180f
            val endRad = (angle + 12f) * 3.14159f / 180f

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
            radius = innerRadius * 0.7f,
            style = androidx.compose.ui.graphics.Paint.Style.Stroke,
            strokeWidth = strokeWidth
        )
    })
}