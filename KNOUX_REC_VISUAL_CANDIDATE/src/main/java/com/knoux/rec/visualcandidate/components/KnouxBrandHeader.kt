package com.knoux.rec.visualcandidate.components

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextAlign
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextTransform
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun KnouxBrandMark(
    modifier: Modifier = Modifier,
    size: androidx.compose.ui.unit.Dp = 40.dp,
    showPlayTriangle: Boolean = true,
    animated: Boolean = false
) {
    val transition = androidx.compose.animation.core.rememberInfiniteTransition(label = "brandMark")
    val rotation by transition.animateFloat(
        initialValue = 0f,
        androidx.compose.animation.core.infiniteRepeatable(
            animation = androidx.compose.animation.core.tween(durationMillis = 20000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "brandRotation"
    )

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val width = size.width.toFloat()
            val height = size.height.toFloat()
            val centerX = width / 2f
            val centerY = height / 2f
            val radius = min(width, height) / 2f * 0.85f

            val brush = Brush.radialGradient(
                colors = listOf(
                    CandidateColors.BrightGold,
                    CandidateColors.PrimaryGold,
                    CandidateColors.GoldenShadow,
                    CandidateColors.PrimaryGold.copy(alpha = 0.3f)
                ),
                center = Offset(centerX - radius * 0.2f, centerY - radius * 0.2f),
                radius = radius * 1.5f
            )

            drawCircle(
                brush = brush,
                center = Offset(centerX, centerY),
                radius = radius
            )

            drawCircle(
                color = CandidateColors.GoldenHighlight.copy(alpha = 0.3f),
                center = Offset(centerX - radius * 0.15f, centerY - radius * 0.15f),
                radius = radius * 0.6f
            )

            drawCircle(
                color = CandidateColors.DarkBackground.copy(alpha = 0.4f),
                center = Offset(centerX + radius * 0.1f, centerY + radius * 0.1f),
                radius = radius * 0.3f
            )

            val strokeWidth = max(width, height) * 0.025f
            drawCircle(
                color = CandidateColors.PrimaryGold,
                center = Offset(centerX, centerY),
                radius = radius,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = strokeWidth
            )

            val innerRadius = radius * 0.7f
            drawCircle(
                color = CandidateColors.GoldenShadow.copy(alpha = 0.6f),
                center = Offset(centerX, centerY),
                radius = innerRadius,
                style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                strokeWidth = strokeWidth * 0.5f
            )
        }

        if (showPlayTriangle) {
            Canvas(
                modifier = Modifier
                    .size(size)
                    .graphicsLayer {
                        if (animated) {
                            rotationZ = rotation
                        }
                    }
            ) {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val centerX = width / 2f
                val centerY = height / 2f
                val triSize = min(width, height) * 0.22f

                val path = androidx.compose.ui.graphics.Path().apply {
                    moveTo(
                        centerX + triSize * 0.6f,
                        centerY
                    )
                    lineTo(
                        centerX - triSize * 0.4f,
                        centerY - triSize * 0.7f
                    )
                    lineTo(
                        centerX - triSize * 0.4f,
                        centerY + triSize * 0.7f
                    )
                    close()
                }

                val brush = Brush.linearGradient(
                    colors = listOf(
                        CandidateColors.BrightGold,
                        CandidateColors.PrimaryGold,
                        CandidateColors.GoldenShadow
                    ),
                    start = Offset(centerX - triSize, centerY - triSize),
                    end = Offset(centerX + triSize, centerY + triSize)
                )

                drawPath(
                    path = path,
                    brush = brush
                )

                val highlightPath = androidx.compose.ui.graphics.Path().apply {
                    moveTo(
                        centerX + triSize * 0.5f,
                        centerY
                    )
                    lineTo(
                        centerX - triSize * 0.3f,
                        centerY - triSize * 0.5f
                    )
                    lineTo(
                        centerX - triSize * 0.3f,
                        centerY + triSize * 0.1f
                    )
                    close()
                }
                drawPath(
                    path = highlightPath,
                    color = CandidateColors.GoldenHighlight.copy(alpha = 0.5f)
                )
            }
        }
    }
}

@Composable
fun KnouxBrandHeader(
    modifier: Modifier = Modifier,
    showBadge: Boolean = true,
    showSubtitle: Boolean = true,
    compact: Boolean = false
) {
    val horizontalPadding = if (compact) 16.dp else 24.dp
    val verticalPadding = if (compact) 12.dp else 16.dp
    val badgeSize = if (compact) 32.dp else 40.dp
    val brandSize = if (compact) 22.sp else 28.sp
    val taglineSize = if (compact) 10.sp else 13.sp
    val subtitleSize = if (compact) 12.sp else 14.sp

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = horizontalPadding, vertical = verticalPadding),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Start
    ) {
        if (showBadge) {
            KnouxBrandMark(
                size = badgeSize,
                showPlayTriangle = true
            )
            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(end = 12.dp))
        }

        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "KNOUX",
                    style = CandidateTypography.BrandWordmark.copy(
                        fontSize = brandSize
                    ),
                    color = CandidateColors.PrimaryGold
                )
                androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(start = 4.dp))
                Text(
                    text = "REC",
                    style = CandidateTypography.BrandWordmark.copy(
                        fontSize = brandSize,
                        fontWeight = FontWeight.Bold
                    ),
                    color = CandidateColors.PrimaryText
                )
            }

            if (showSubtitle) {
                Text(
                    text = "YOUR CREATIVE COMMAND CENTER",
                    style = CandidateTypography.SectionLabel.copy(
                        fontSize = taglineSize
                    ),
                    color = CandidateColors.PrimaryGold.copy(alpha = 0.8f)
                )
            }
        }
    }
}

@Composable
fun KnouxSplashBranding(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 32.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center
    ) {
        KnouxBrandMark(
            size = 96.dp,
            showPlayTriangle = true,
            animated = true
        )
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 24.dp))

        Text(
            text = "KNOUX",
            style = CandidateTypography.BrandWordmark.copy(fontSize = 42.sp),
            color = CandidateColors.PrimaryGold,
            textAlign = TextAlign.Center
        )
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
        Text(
            text = "REC",
            style = CandidateTypography.BrandWordmark.copy(fontSize = 42.sp, fontWeight = FontWeight.Bold),
            color = CandidateColors.PrimaryText,
            textAlign = TextAlign.Center
        )
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 16.dp))

        Text(
            text = "YOUR CREATIVE UNIVERSE",
            style = CandidateTypography.BrandTagline.copy(fontSize = 15.sp),
            color = CandidateColors.PrimaryGold.copy(alpha = 0.9f),
            textAlign = TextAlign.Center
        )
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 8.dp))

        Text(
            text = "Native recording. Real creative control.",
            style = CandidateTypography.BodyMedium.copy(fontSize = 14.sp),
            color = CandidateColors.SecondaryText,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun KnouxSplashTagline(
    modifier: Modifier = Modifier
) {
    Text(
        text = "CAPTURE / CREATE / ORGANIZE",
        style = CandidateTypography.BrandTagline.copy(fontSize = 12.sp, letterSpacing = 3.sp),
        color = CandidateColors.PrimaryGold.copy(alpha = 0.7f),
        textAlign = TextAlign.Center,
        modifier = modifier.fillMaxWidth().padding(horizontal = 24.dp)
    )
}

@Composable
fun WelcomeBackHeader(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "WELCOME BACK",
            style = CandidateTypography.HeadlineSmall.copy(fontSize = 22.sp, letterSpacing = 1.sp),
            color = CandidateColors.PrimaryText,
            textAlign = TextAlign.Center
        )
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 4.dp))
        Text(
            text = "The creative hub",
            style = CandidateTypography.TitleMedium.copy(fontSize = 16.sp),
            color = CandidateColors.PrimaryGold,
            textAlign = TextAlign.Center
        )
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = 2.dp))
        Text(
            text = "Everything starts with one capture.",
            style = CandidateTypography.BodyMedium,
            color = CandidateColors.SecondaryText,
            textAlign = TextAlign.Center
        )
    }
}