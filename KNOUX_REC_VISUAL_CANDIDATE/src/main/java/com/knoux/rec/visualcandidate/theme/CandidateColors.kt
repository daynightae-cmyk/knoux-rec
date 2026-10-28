package com.knoux.rec.visualcandidate.theme

import androidx.compose.ui.graphics.Color

object CandidateColors {

    val DarkBackground = Color(0xFF07070A)
    val DeepElevatedSurface = Color(0xFF101016)
    val SecondarySurface = Color(0xFF16161E)
    val TertiarySurface = Color(0xFF1C1C24)

    val PrimaryGold = Color(0xFFFFDE00)
    val BrightGold = Color(0xFFFFE74D)
    val GoldenHighlight = Color(0xFFFFE866)
    val GoldenShadow = Color(0xFFFFC400)
    val GoldMuted = Color(0xCCFFDE00)
    val GoldTransparent = Color(0x33FFDE00)
    val GoldBorder = Color(0x88FFDE00)

    val VioletAccent = Color(0xFF8B5CF6)
    val VioletBright = Color(0xFFA78BFA)
    val VioletMuted = Color(0x888B5CF6)
    val VioletTransparent = Color(0x338B5CF6)

    val CyanAccent = Color(0xFF00D9FF)
    val CyanBright = Color(0xFF67E8F9)
    val CyanMuted = Color(0x8800D9FF)
    val CyanTransparent = Color(0x3300D9FF)

    val SuccessGreen = Color(0xFF2BD9A0)
    val SuccessGreenBright = Color(0xFF5EEAD4)
    val SuccessGreenMuted = Color(0x882BD9A0)
    val SuccessGreenTransparent = Color(0x332BD9A0)

    val RecordingRed = Color(0xFFFF4D5E)
    val RecordingRedBright = Color(0xFFF87171)
    val RecordingRedMuted = Color(0x88FF4D5E)
    val RecordingRedTransparent = Color(0x33FF4D5E)

    val AmberWarning = Color(0xFFFBBF24)
    val AmberBright = Color(0xFFFCD34D)

    val PrimaryText = Color(0xFFF4F4F6)
    val SecondaryText = Color(0xFFB0B0B8)
    val TertiaryText = Color(0xFF888894)
    val InverseText = Color(0xFF07070A)
    val GoldText = Color(0xFFFFE040)

    val StarWhite = Color(0xFFFFFFFF)
    val StarGold = Color(0xFFFFF0A0)
    val StarDim = Color(0x66FFFFFF)

    val CardStroke = Color(0x33FFFFFF)
    val CardStrokeGold = Color(0x66FFDE00)
    val CardStrokeViolet = Color(0x668B5CF6)
    val CardStrokeCyan = Color(0x6600D9FF)
    val CardStrokeRed = Color(0x66FF4D5E)
    val CardStrokeGreen = Color(0x662BD9A0)

    val OverlayScrim = Color(0xCC000000)
    val OverlayLight = Color(0x44FFFFFF)

    val ErrorRed = Color(0xFFEF4444)
    val WarningAmber = Color(0xFFF59E0B)
    val InfoBlue = Color(0xFF3B82F6)

    val DisabledSurface = Color(0xFF1E1E28)
    val DisabledText = Color(0xFF5A5A68)
    val DisabledStroke = Color(0x33FFFFFF)

    fun goldGradientStops() = listOf(
        PrimaryGold,
        BrightGold,
        GoldenHighlight,
        PrimaryGold,
        GoldenShadow
    )

    fun violetGradientStops() = listOf(
        VioletAccent,
        VioletBright,
        Color(0xFFC084FC),
        VioletAccent
    )

    fun cyanGradientStops() = listOf(
        CyanAccent,
        CyanBright,
        Color(0xFF22D3EE),
        CyanAccent
    )

    fun cosmicBackgroundStops() = listOf(
        DarkBackground,
        Color(0xFF0A0A12),
        Color(0xFF0D0D18),
        Color(0xFF0F0F1A),
        DarkBackground
    )

    fun heroCardGradientStops() = listOf(
        DeepElevatedSurface,
        Color(0xFF14141E),
        Color(0xFF181824),
        SecondarySurface
    )

    fun mediaPreviewGradientStops() = listOf(
        Color(0xFF0A0812),
        Color(0xFF120A1A),
        Color(0xFF1A0E1E),
        Color(0xFF0F0814)
    )

    fun orbitalGoldStops() = listOf(
        Color(0x00FFDE00),
        Color(0x44FFDE00),
        Color(0xCCFFDE00),
        Color(0xFFFFDE00),
        Color(0xCCFFDE00),
        Color(0x44FFDE00),
        Color(0x00FFDE00)
    )
}