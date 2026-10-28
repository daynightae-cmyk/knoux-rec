package com.knoux.rec.visualcandidate.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkScheme = darkColorScheme(
    primary = CandidateColors.PrimaryGold,
    onPrimary = CandidateColors.InverseText,
    primaryContainer = CandidateColors.GoldenShadow,
    onPrimaryContainer = CandidateColors.InverseText,
    secondary = CandidateColors.VioletAccent,
    onSecondary = CandidateColors.InverseText,
    secondaryContainer = CandidateColors.VioletMuted.copy(alpha = 0.2f),
    onSecondaryContainer = CandidateColors.VioletBright,
    tertiary = CandidateColors.CyanAccent,
    onTertiary = CandidateColors.InverseText,
    tertiaryContainer = CandidateColors.CyanMuted.copy(alpha = 0.2f),
    onTertiaryContainer = CandidateColors.CyanBright,
    error = CandidateColors.RecordingRed,
    onError = CandidateColors.PrimaryText,
    errorContainer = CandidateColors.RecordingRedTransparent,
    onErrorContainer = CandidateColors.RecordingRedBright,
    background = CandidateColors.DarkBackground,
    onBackground = CandidateColors.PrimaryText,
    surface = CandidateColors.DeepElevatedSurface,
    onSurface = CandidateColors.PrimaryText,
    surfaceVariant = CandidateColors.SecondarySurface,
    onSurfaceVariant = CandidateColors.SecondaryText,
    outline = CandidateColors.CardStroke,
    outlineVariant = CandidateColors.CardStroke.copy(alpha = 0.2f),
    shadow = Color.Black,
    scrim = CandidateColors.OverlayScrim,
    inverseSurface = CandidateColors.PrimaryText,
    inverseOnSurface = CandidateColors.DarkBackground,
    inversePrimary = CandidateColors.GoldenShadow
)

private val LightScheme = lightColorScheme(
    primary = CandidateColors.GoldenShadow,
    onPrimary = CandidateColors.InverseText,
    primaryContainer = CandidateColors.PrimaryGold,
    onPrimaryContainer = CandidateColors.InverseText,
    secondary = CandidateColors.VioletAccent,
    onSecondary = CandidateColors.PrimaryText,
    secondaryContainer = CandidateColors.VioletTransparent,
    onSecondaryContainer = CandidateColors.VioletAccent,
    tertiary = CandidateColors.CyanAccent,
    onTertiary = CandidateColors.PrimaryText,
    tertiaryContainer = CandidateColors.CyanTransparent,
    onTertiaryContainer = CandidateColors.CyanAccent,
    error = CandidateColors.RecordingRed,
    onError = CandidateColors.PrimaryText,
    errorContainer = CandidateColors.RecordingRedTransparent,
    onErrorContainer = CandidateColors.RecordingRed,
    background = Color(0xFFF8F8FA),
    onBackground = Color(0xFF1C1C1E),
    surface = Color.White,
    onSurface = Color(0xFF1C1C1E),
    surfaceVariant = Color(0xFFE8E8ED),
    onSurfaceVariant = Color(0xFF4A4A54),
    outline = Color(0xFFD0D0D8),
    outlineVariant = Color(0xFFE0E0E8),
    shadow = Color.Black,
    scrim = CandidateColors.OverlayScrim,
    inverseSurface = Color(0xFF1C1C1E),
    inverseOnSurface = Color.White,
    inversePrimary = CandidateColors.PrimaryGold
)

@Composable
fun CandidateTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkScheme else LightScheme
    MaterialTheme(
        colorScheme = colorScheme,
        typography = CandidateTypography.typography,
        shapes = CandidateShapes.shapes,
        content = content
    )
}

@Composable
fun CandidateDarkTheme(content: @Composable () -> Unit) {
    CandidateTheme(darkTheme = true, content)
}

@Composable
fun CandidateLightTheme(content: @Composable () -> Unit) {
    CandidateTheme(darkTheme = false, content)
}