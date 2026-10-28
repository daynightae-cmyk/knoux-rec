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
import com.knoux.rec.visualcandidate.components.SettingsCategory
import com.knoux.rec.visualcandidate.components.SettingsCategoryTabs
import com.knoux.rec.visualcandidate.contract.AppLanguage
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.CaptureFrameRate
import com.knoux.rec.visualcandidate.contract.CaptureQuality
import com.knoux.rec.visualcandidate.contract.MicrophonePreference
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.contract.SettingsUiState
import com.knoux.rec.visualcandidate.contract.ThemeMode
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun SettingsCandidateScreen(
    modifier: Modifier = Modifier,
    state: SettingsUiState,
    onAction: (CandidateAction) -> Unit
) {
    val categories = listOf(SettingsCategory.General, SettingsCategory.Capture, SettingsCategory.Appearance)
    var selectedCategory by remember { mutableStateOf(SettingsCategory.General) }

    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = true,
        bottomNavTab = NavigationTab.Settings,
        onBottomNavClick = { tab ->
            when (tab) {
                NavigationTab.Home -> onAction(CandidateAction.NavigateTo(NavigationDestination.Home))
                NavigationTab.Library -> onAction(CandidateAction.NavigateTo(NavigationDestination.MediaLibrary))
                NavigationTab.Tools -> onAction(CandidateAction.NavigateTo(NavigationDestination.ToolsStudio))
                NavigationTab.Settings -> {}
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
                            text = "CUSTOMIZE YOUR STUDIO",
                            style = CandidateTypography.HeadlineSmall.copy(fontSize = 16.sp),
                            color = CandidateColors.PrimaryText
                        )
                        Text(
                            text = "Settings",
                            style = CandidateTypography.TitleMedium.copy(fontSize = 18.sp),
                            color = CandidateColors.PrimaryGold
                        )
                        Text(
                            text = "Make KNOUX REC work your way.",
                            style = CandidateTypography.BodyMedium,
                            color = CandidateColors.SecondaryText
                        )
                    }

                    SettingsCategoryTabs(
                        modifier = Modifier.fillMaxWidth(),
                        categories = categories,
                        selectedCategory = selectedCategory,
                        onCategorySelected = { selectedCategory = it }
                    )

                    when (selectedCategory) {
                        SettingsCategory.General -> GeneralSettingsSection(state, onAction)
                        SettingsCategory.Capture -> CaptureSettingsSection(state, onAction)
                        SettingsCategory.Appearance -> AppearanceSettingsSection(state, onAction)
                    }
                }
            }
        }
    )
}

@Composable
fun GeneralSettingsSection(state: SettingsUiState, onAction: (CandidateAction) -> Unit) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 32.dp)
    ) {
        item {
            SettingsGroupCard(title = "APP EXPERIENCE") {
                SettingsToggleRow(
                    label = "Language",
                    subtitle = "Select app language",
                    value = if (state.language == AppLanguage.English) "English" else "العربية",
                    onClick = { 
                        val newLang = if (state.language == AppLanguage.English) AppLanguage.Arabic else AppLanguage.English
                        onAction(CandidateAction.SetLanguage(newLang))
                    }
                )
                SettingsToggleRow(
                    label = "Theme",
                    subtitle = "Color scheme",
                    value = state.theme.displayName,
                    onClick = { 
                        val newTheme = when (state.theme) {
                            ThemeMode.System -> ThemeMode.Dark
                            ThemeMode.Dark -> ThemeMode.Light
                            ThemeMode.Light -> ThemeMode.System
                        }
                        onAction(CandidateAction.SetTheme(newTheme))
                    }
                )
                SettingsToggleRow(
                    label = "Reduce motion",
                    subtitle = "Limit animations",
                    value = if (state.reducedMotion) "On" else "Off",
                    onClick = { onAction(CandidateAction.SetReducedMotion(!state.reducedMotion)) }
                )
            }
        }
        item {
            SettingsGroupCard(title = "CAPTURE DEFAULTS") {
                SettingsToggleRow(
                    label = "Recording quality",
                    subtitle = "Default resolution",
                    value = state.captureQuality.displayName,
                    onClick = { }
                )
                SettingsToggleRow(
                    label = "Frame rate",
                    subtitle = "Default FPS",
                    value = state.captureFrameRate.displayName,
                    onClick = { }
                )
                SettingsToggleRow(
                    label = "Microphone",
                    subtitle = "Permission behavior",
                    value = state.microphonePreference.displayName,
                    onClick = { }
                )
            }
        }
        item {
            SettingsGroupCard(title = "DATA & PRIVACY") {
                SettingsToggleRow(
                    label = "Storage",
                    subtitle = "Storage location",
                    value = state.storageLocation,
                    onClick = { onAction(CandidateAction.OpenStorageSettings) }
                )
                SettingsToggleRow(
                    label = "Privacy",
                    subtitle = "Privacy information",
                    value = "View policy",
                    onClick = { onAction(CandidateAction.OpenPrivacyInformation) }
                )
            }
        }
    }
}

@Composable
fun CaptureSettingsSection(state: SettingsUiState, onAction: (CandidateAction) -> Unit) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 32.dp)
    ) {
        item {
            SettingsGroupCard(title = "CAPTURE PREFERENCES") {
                SettingsToggleRow(
                    label = "Default resolution",
                    subtitle = "Recording quality",
                    value = state.captureQuality.displayName,
                    onClick = { }
                )
                SettingsToggleRow(
                    label = "Default frame rate",
                    subtitle = "Recording FPS",
                    value = state.captureFrameRate.displayName,
                    onClick = { }
                )
                SettingsToggleRow(
                    label = "Microphone behavior",
                    subtitle = "Permission handling",
                    value = state.microphonePreference.displayName,
                    onClick = { }
                )
            }
        }
    }
}

@Composable
fun AppearanceSettingsSection(state: SettingsUiState, onAction: (CandidateAction) -> Unit) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 32.dp)
    ) {
        item {
            SettingsGroupCard(title = "VISUAL APPEARANCE") {
                SettingsToggleRow(
                    label = "Theme",
                    subtitle = "Color scheme selection",
                    value = state.theme.displayName,
                    onClick = { }
                )
                SettingsToggleRow(
                    label = "Reduce motion",
                    subtitle = "Limit animations",
                    value = if (state.reducedMotion) "Enabled" else "Disabled",
                    onClick = { onAction(CandidateAction.SetReducedMotion(!state.reducedMotion)) }
                )
            }
        }
    }
}

@Composable
fun SettingsGroupCard(
    title: String,
    content: @Composable () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = title,
            style = CandidateTypography.SectionLabel.copy(fontSize = 11.sp),
            color = CandidateColors.PrimaryGold
        )
        PremiumCard(
            modifier = Modifier.fillMaxWidth(),
            variant = PremiumCardVariant.Panel
        ) {
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                content()
            }
        }
    }
}

@Composable
fun SettingsToggleRow(
    label: String,
    subtitle: String,
    value: String,
    onClick: () -> Unit
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp)
            .pointerInput(Unit) {
                androidx.compose.foundation.gestures.detectTapGestures(
                    onPress = { pressed.value = true },
                    onRelease = { pressed.value = false },
                    onTap = onClick
                )
            }
            .background(
                if (pressed.value) CandidateColors.SecondarySurface else Color.Transparent
            ),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(
            modifier = Modifier.weight(1f).padding(end = 16.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = label,
                style = CandidateTypography.BodyMedium.copy(fontSize = 15.sp),
                color = CandidateColors.PrimaryText
            )
            Text(
                text = subtitle,
                style = CandidateTypography.BodySmall,
                color = CandidateColors.SecondaryText
            )
        }
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = value,
                style = CandidateTypography.BodySmall,
                color = CandidateColors.PrimaryGold
            )
            Canvas(modifier = Modifier.size(16.dp), onDraw = {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val cx = width / 2f
                val cy = height / 2f
                val s = min(width, height)
                val sw = s * 0.12f

                val path = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx - s * 0.2f, cy - s * 0.25f)
                    lineTo(cx + s * 0.1f, cy)
                    lineTo(cx - s * 0.2f, cy + s * 0.25f)
                }
                drawPath(path, CandidateColors.TertiaryText, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                    this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
                }
            })
        }
    }
}