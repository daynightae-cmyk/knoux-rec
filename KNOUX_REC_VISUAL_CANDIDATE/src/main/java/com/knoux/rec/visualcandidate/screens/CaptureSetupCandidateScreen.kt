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
import com.knoux.rec.visualcandidate.components.BackArrow
import com.knoux.rec.visualcandidate.components.CaptureSettingsHeader
import com.knoux.rec.visualcandidate.components.GoldenPrimaryAction
import com.knoux.rec.visualcandidate.components.PremiumCard
import com.knoux.rec.visualcandidate.components.PremiumCardVariant
import com.knoux.rec.visualcandidate.components.SectionHeader
import com.knoux.rec.visualcandidate.components.ThreeOptionSelector
import com.knoux.rec.visualcandidate.components.ToggleSwitch
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.CaptureFrameRate
import com.knoux.rec.visualcandidate.contract.CaptureResolution
import com.knoux.rec.visualcandidate.contract.CaptureSetupUiState
import com.knoux.rec.visualcandidate.contract.InternalAudioCapability
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.contract.PermissionStatus
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun CaptureSetupCandidateScreen(
    modifier: Modifier = Modifier,
    state: CaptureSetupUiState,
    onAction: (CandidateAction) -> Unit
) {
    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = false,
        topBar = {
            CaptureSettingsHeader(
                modifier = Modifier.fillMaxWidth(),
                onBackClick = { onAction(CandidateAction.NavigateBack) }
            )
        }
    ) { contentModifier, _ ->
        Column(
            modifier = contentModifier
                .fillMaxSize()
                .padding(top = 8.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "SCREEN RECORDER",
                    style = CandidateTypography.HeadlineMedium.copy(fontSize = 22.sp),
                    color = CandidateColors.PrimaryText
                )
                Text(
                    text = "Make it yours",
                    style = CandidateTypography.TitleMedium.copy(fontSize = 16.sp),
                    color = CandidateColors.PrimaryGold
                )
                Text(
                    text = "Choose quality, audio and capture options.",
                    style = CandidateTypography.BodyMedium,
                    color = CandidateColors.SecondaryText
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ConfigurationPanel(
                    title = "RESOLUTION",
                    subtitle = "Output video resolution",
                    accentColor = CandidateColors.CyanAccent
                ) {
                    ThreeOptionSelector(
                        modifier = Modifier.fillMaxWidth(),
                        option1 = CaptureResolution.HD720.displayName,
                        option2 = CaptureResolution.FHD1080.displayName,
                        option3 = CaptureResolution.Device.displayName,
                        selectedIndex = state.availableResolutions.indexOf(state.selectedResolution),
                        onSelected = { index ->
                            if (index < state.availableResolutions.size) {
                                onAction(CandidateAction.SetCaptureResolution(state.availableResolutions[index]))
                            }
                        },
                        enabled = true,
                        accentColor = CandidateColors.CyanAccent
                    )
                }

                ConfigurationPanel(
                    title = "FRAME RATE",
                    subtitle = "Recording frame rate",
                    accentColor = CandidateColors.VioletAccent
                ) {
                    ThreeOptionSelector(
                        modifier = Modifier.fillMaxWidth(),
                        option1 = CaptureFrameRate.FPS24.displayName,
                        option2 = CaptureFrameRate.FPS30.displayName,
                        option3 = CaptureFrameRate.FPS60.displayName,
                        selectedIndex = state.availableFrameRates.indexOf(state.selectedFrameRate),
                        onSelected = { index ->
                            if (index < state.availableFrameRates.size) {
                                onAction(CandidateAction.SetCaptureFrameRate(state.availableFrameRates[index]))
                            }
                        },
                        enabled = true,
                        accentColor = CandidateColors.VioletAccent
                    )
                }

                ConfigurationPanel(
                    title = "AUDIO SOURCES",
                    subtitle = "Select audio inputs",
                    accentColor = CandidateColors.PrimaryGold
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        ToggleSwitch(
                            modifier = Modifier.fillMaxWidth(),
                            checked = state.microphoneEnabled,
                            onCheckedChange = { onAction(CandidateAction.SetMicrophoneEnabled(it)) },
                            enabled = state.microphonePermissionStatus == PermissionStatus.Granted,
                            label = "Microphone",
                            subtitle = when (state.microphonePermissionStatus) {
                                PermissionStatus.Granted -> "Enabled"
                                PermissionStatus.Denied -> "Permission denied"
                                PermissionStatus.PermanentlyDenied -> "Permission permanently denied"
                                else -> "Permission needed"
                            },
                            accentColor = CandidateColors.CyanAccent
                        )

                        ToggleSwitch(
                            modifier = Modifier.fillMaxWidth(),
                            checked = state.internalAudioEnabled,
                            onCheckedChange = { onAction(CandidateAction.SetInternalAudioEnabled(it)) },
                            enabled = state.internalAudioCapability == InternalAudioCapability.Supported,
                            label = "Internal audio",
                            subtitle = when (state.internalAudioCapability) {
                                InternalAudioCapability.Supported -> "Available"
                                InternalAudioCapability.RequiresApi29 -> "Android 10+ only"
                                InternalAudioCapability.RequiresPermission -> "Permission required"
                                else -> "Not supported on this device"
                            },
                            accentColor = CandidateColors.VioletAccent
                        )
                    }
                }
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 8.dp))

            PremiumCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                variant = PremiumCardVariant.Panel
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CandidateShapes.Circle)
                                .background(CandidateColors.PrimaryGold.copy(alpha = 0.15f), CandidateShapes.Circle)
                                .border(1.dp, CandidateColors.GoldBorder, CandidateShapes.Circle),
                            contentAlignment = Alignment.Center
                        ) {
                            androidx.compose.ui.graphics.Canvas(modifier = Modifier.size(20.dp)) {
                                val width = size.width.toFloat()
                                val height = size.height.toFloat()
                                val cx = width / 2f
                                val cy = height / 2f
                                val s = min(width, height)
                                val strokeWidth = s * 0.1f

                                val path = androidx.compose.ui.graphics.Path().apply {
                                    moveTo(cx, cy - s * 0.35f)
                                    lineTo(cx + s * 0.3f, cy + s * 0.1f)
                                    lineTo(cx - s * 0.1f, cy + s * 0.1f)
                                    lineTo(cx - s * 0.1f, cy + s * 0.35f)
                                    lineTo(cx + s * 0.1f, cy + s * 0.35f)
                                    lineTo(cx + s * 0.1f, cy + s * 0.1f)
                                    lineTo(cx - s * 0.3f, cy + s * 0.1f)
                                    close()
                                }
                                drawPath(path, CandidateColors.PrimaryGold, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = strokeWidth) {
                                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                                    this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
                                }
                            }
                        }
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            Text(
                                text = "CAPTURE CONSENT",
                                style = CandidateTypography.SectionLabel.copy(fontSize = 11.sp),
                                color = CandidateColors.PrimaryGold
                            )
                            Text(
                                text = "Android will request screen-sharing permission. Recording never starts without consent.",
                                style = CandidateTypography.BodySmall,
                                color = CandidateColors.SecondaryText
                            )
                        }
                    }
                }
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.weight(1f))

            GoldenPrimaryAction(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, bottom = 24.dp),
                text = "CONTINUE TO SYSTEM CONSENT",
                onClick = {
                    onAction(CandidateAction.RequestCaptureConsent { granted ->
                        if (granted) {
                            onAction(CandidateAction.NavigateTo(NavigationDestination.LiveRecording))
                        }
                    })
                },
                enabled = state.consentAvailable && state.initializationError == null,
                height = 56.dp
            )

            state.initializationError?.let {
                Text(
                    text = it,
                    style = CandidateTypography.BodySmall,
                    color = CandidateColors.RecordingRedBright,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, bottom = 16.dp)
                )
            }
        }
    }
}

@Composable
fun ConfigurationPanel(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    accentColor: Color,
    content: @Composable () -> Unit
) {
    PremiumCard(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        variant = PremiumCardVariant.Panel
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = title,
                    style = CandidateTypography.SectionLabel.copy(fontSize = 11.sp),
                    color = accentColor
                )
                Text(
                    text = subtitle,
                    style = CandidateTypography.BodySmall,
                    color = CandidateColors.TertiaryText
                )
            }
            content()
        }
    }
}

@Composable
fun CaptureSettingsHeader(
    modifier: Modifier = Modifier,
    onBackClick: () -> Unit
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(64.dp)
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        BackArrow(
            modifier = Modifier.padding(end = 8.dp),
            onClick = onBackClick
        )
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Capture settings",
                style = CandidateTypography.HeadlineSmall.copy(fontSize = 20.sp),
                color = CandidateColors.PrimaryText
            )
            Text(
                text = "CHOOSE YOUR RECORDING PROFILE",
                style = CandidateTypography.SectionLabel.copy(fontSize = 10.sp),
                color = CandidateColors.PrimaryGold
            )
        }
        androidx.compose.foundation.layout.Spacer(modifier = Modifier.size(48.dp))
    }
}