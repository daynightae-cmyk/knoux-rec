package com.knoux.rec.visualcandidate.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object CandidateTypography {

    val FontFamilyPrimary = FontFamily.Default
    val FontFamilyMono = FontFamily.Monospace
    val FontFamilyDisplay = FontFamily.Serif

    val DisplayLarge = TextStyle(
        fontFamily = FontFamilyDisplay,
        fontWeight = FontWeight.Bold,
        fontSize = 56.sp,
        letterSpacing = -1.5.sp,
        lineHeight = 64.sp
    )

    val DisplayMedium = TextStyle(
        fontFamily = FontFamilyDisplay,
        fontWeight = FontWeight.Bold,
        fontSize = 44.sp,
        letterSpacing = -1.sp,
        lineHeight = 52.sp
    )

    val DisplaySmall = TextStyle(
        fontFamily = FontFamilyDisplay,
        fontWeight = FontWeight.SemiBold,
        fontSize = 36.sp,
        letterSpacing = -0.5.sp,
        lineHeight = 44.sp
    )

    val HeadlineLarge = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        letterSpacing = 0.sp,
        lineHeight = 40.sp
    )

    val HeadlineMedium = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 28.sp,
        letterSpacing = 0.sp,
        lineHeight = 36.sp
    )

    val HeadlineSmall = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        letterSpacing = 0.sp,
        lineHeight = 32.sp
    )

    val TitleLarge = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Medium,
        fontSize = 22.sp,
        letterSpacing = 0.sp,
        lineHeight = 28.sp
    )

    val TitleMedium = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Medium,
        fontSize = 18.sp,
        letterSpacing = 0.1.sp,
        lineHeight = 24.sp
    )

    val TitleSmall = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        letterSpacing = 0.1.sp,
        lineHeight = 22.sp
    )

    val BodyLarge = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        letterSpacing = 0.2.sp,
        lineHeight = 24.sp
    )

    val BodyMedium = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        letterSpacing = 0.25.sp,
        lineHeight = 20.sp
    )

    val BodySmall = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        letterSpacing = 0.4.sp,
        lineHeight = 16.sp
    )

    val LabelLarge = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        letterSpacing = 0.5.sp,
        lineHeight = 20.sp
    )

    val LabelMedium = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        letterSpacing = 0.75.sp,
        lineHeight = 16.sp
    )

    val LabelSmall = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 10.sp,
        letterSpacing = 1.0.sp,
        lineHeight = 14.sp
    )

    val Caption = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Normal,
        fontSize = 11.sp,
        letterSpacing = 0.4.sp,
        lineHeight = 14.sp
    )

    val Overline = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Medium,
        fontSize = 10.sp,
        letterSpacing = 1.5.sp,
        lineHeight = 14.sp,
        textTransform = androidx.compose.ui.text.TextTransform.Uppercase
    )

    val MonospaceLarge = TextStyle(
        fontFamily = FontFamilyMono,
        fontWeight = FontWeight.Medium,
        fontSize = 18.sp,
        letterSpacing = 0.sp,
        lineHeight = 24.sp
    )

    val MonospaceMedium = TextStyle(
        fontFamily = FontFamilyMono,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        letterSpacing = 0.sp,
        lineHeight = 22.sp
    )

    val MonospaceSmall = TextStyle(
        fontFamily = FontFamilyMono,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        letterSpacing = 0.sp,
        lineHeight = 18.sp
    )

    val TimerDisplay = TextStyle(
        fontFamily = FontFamilyMono,
        fontWeight = FontWeight.Bold,
        fontSize = 72.sp,
        letterSpacing = 2.sp,
        lineHeight = 88.sp
    )

    val TimerDisplayCompact = TextStyle(
        fontFamily = FontFamilyMono,
        fontWeight = FontWeight.Bold,
        fontSize = 48.sp,
        letterSpacing = 1.5.sp,
        lineHeight = 60.sp
    )

    val BrandWordmark = TextStyle(
        fontFamily = FontFamilyDisplay,
        fontWeight = FontWeight.ExtraBold,
        fontSize = 28.sp,
        letterSpacing = 2.sp,
        lineHeight = 36.sp
    )

    val BrandTagline = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Medium,
        fontSize = 13.sp,
        letterSpacing = 2.5.sp,
        lineHeight = 18.sp,
        textTransform = androidx.compose.ui.text.TextTransform.Uppercase
    )

    val SectionLabel = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 11.sp,
        letterSpacing = 1.2.sp,
        lineHeight = 16.sp,
        textTransform = androidx.compose.ui.text.TextTransform.Uppercase
    )

    val ChipLabel = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 11.sp,
        letterSpacing = 0.5.sp,
        lineHeight = 16.sp
    )

    val ButtonLabel = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.SemiBold,
        fontSize = 15.sp,
        letterSpacing = 0.5.sp,
        lineHeight = 20.sp
    )

    val NavLabel = TextStyle(
        fontFamily = FontFamilyPrimary,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        letterSpacing = 0.5.sp,
        lineHeight = 14.sp
    )
}