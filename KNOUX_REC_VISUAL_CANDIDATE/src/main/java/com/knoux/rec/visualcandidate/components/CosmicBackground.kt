package com.knoux.rec.visualcandidate.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.px
import com.knoux.rec.visualcandidate.theme.CandidateColors
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.random
import kotlin.math.sin
import kotlin.math.sqrt

@Composable
fun CosmicStarfield(
    modifier: Modifier = Modifier,
    starCount: Int = 180,
    animate: Boolean = true,
    seed: Long = 0xKNOUX_REC_STARFIELD
) {
    val transition = rememberInfiniteTransition(label = "starfield")
    val time by transition.animateFloat(
        initialValue = 0f,
        infiniteRepeatable(
            animation = tween(durationMillis = 20000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "starfieldTime"
    )

    val stars = remember(starCount, seed) {
        val random = java.util.Random(seed)
        List(starCount) { index ->
            val baseX = random.nextFloat() * 1f
            val baseY = random.nextFloat() * 1f
            val size = (random.nextFloat() * 1.5f + 0.3f) * 1.5f
            val brightness = random.nextFloat() * 0.6f + 0.2f
            val twinkleSpeed = random.nextFloat() * 0.5f + 0.2f
            val twinklePhase = random.nextFloat() * 2f * PI
            val colorType = random.nextInt(4)
            val driftX = (random.nextFloat() - 0.5f) * 0.00005f
            val driftY = (random.nextFloat() - 0.5f) * 0.00005f
            Star(baseX, baseY, size, brightness, twinkleSpeed, twinklePhase, colorType, driftX, driftY)
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(CandidateColors.DarkBackground)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            if (animate) {
                val t = time * 0.001f
                for (star in stars) {
                    val x = (star.baseX + star.driftX * t * 1000f) % 1f
                    val y = (star.baseY + star.driftY * t * 1000f) % 1f
                    val wrappedX = if (x < 0) x + 1f else x
                    val wrappedY = if (y < 0) y + 1f else y

                    val twinkle = sin(t * star.twinkleSpeed * 6f + star.twinklePhase) * 0.4f + 0.6f
                    val alpha = (star.brightness * twinkle).coerceIn(0.1f, 1f)

                    val color = when (star.colorType) {
                        0 -> CandidateColors.StarWhite.copy(alpha = alpha)
                        1 -> CandidateColors.StarGold.copy(alpha = alpha * 0.8f)
                        2 -> CandidateColors.CyanAccent.copy(alpha = alpha * 0.4f)
                        else -> CandidateColors.VioletAccent.copy(alpha = alpha * 0.3f)
                    }

                    val drawX = wrappedX * width
                    val drawY = wrappedY * height
                    val drawSize = star.size * max(0.5f, twinkle)

                    drawCircle(
                        color = color,
                        center = Offset(drawX, drawY),
                        radius = drawSize
                    )

                    if (star.brightness > 0.7f && twinkle > 0.85f) {
                        val glowRadius = drawSize * 3f
                        drawCircle(
                            color = color.copy(alpha = alpha * 0.15f),
                            center = Offset(drawX, drawY),
                            radius = glowRadius
                        )
                    }
                }
            } else {
                for (star in stars) {
                    val color = when (star.colorType) {
                        0 -> CandidateColors.StarWhite.copy(alpha = star.brightness)
                        1 -> CandidateColors.StarGold.copy(alpha = star.brightness * 0.8f)
                        2 -> CandidateColors.CyanAccent.copy(alpha = star.brightness * 0.4f)
                        else -> CandidateColors.VioletAccent.copy(alpha = star.brightness * 0.3f)
                    }
                    drawCircle(
                        color = color,
                        center = Offset(star.baseX * width, star.baseY * height),
                        radius = star.size
                    )
                }
            }
        }
    }
}

data class Star(
    val baseX: Float,
    val baseY: Float,
    val size: Float,
    val brightness: Float,
    val twinkleSpeed: Float,
    val twinklePhase: Float,
    val colorType: Int,
    val driftX: Float,
    val driftY: Float
)

@Composable
fun CosmicNebulaLayer(
    modifier: Modifier = Modifier,
    animate: Boolean = true
) {
    val transition = rememberInfiniteTransition(label = "nebula")
    val time by transition.animateFloat(
        initialValue = 0f,
        infiniteRepeatable(
            animation = tween(durationMillis = 30000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Reverse
        ),
        label = "nebulaTime"
    )

    Canvas(
        modifier = modifier.fillMaxSize(),
        onDraw = {
            val width = size.width
            val height = size.height
            val centerX = width / 2f
            val centerY = height / 2f
            val maxRadius = max(width, height) * 0.7f

            val t = if (animate) time * 0.001f else 0f

            val nebulaCount = 5
            for (i in 0 until nebulaCount) {
                val angle = (i * 2f * PI / nebulaCount) + t * 0.05f
                val radius = maxRadius * (0.3f + 0.4f * sin(t * 0.1f + i * 1.3f))
                val x = centerX + cos(angle) * radius * 0.3f
                val y = centerY + sin(angle) * radius * 0.3f
                val nebulaRadius = maxRadius * (0.4f + 0.2f * sin(t * 0.08f + i * 0.7f))

                val colors = when (i % 3) {
                    0 -> listOf(
                        CandidateColors.VioletAccent.copy(alpha = 0.04f),
                        CandidateColors.VioletAccent.copy(alpha = 0.01f),
                        Color.Transparent
                    )
                    1 -> listOf(
                        CandidateColors.CyanAccent.copy(alpha = 0.03f),
                        CandidateColors.CyanAccent.copy(alpha = 0.005f),
                        Color.Transparent
                    )
                    else -> listOf(
                        CandidateColors.PrimaryGold.copy(alpha = 0.02f),
                        CandidateColors.PrimaryGold.copy(alpha = 0.003f),
                        Color.Transparent
                    )
                }

                val brush = Brush.radialGradient(
                    colors = colors,
                    center = Offset(x, y),
                    radius = nebulaRadius
                )
                drawRect(brush, Rect(Offset.Zero, Size(width, height)))
            }
        }
    )
}

@Composable
fun CosmicBackground(
    modifier: Modifier = Modifier,
    showStars: Boolean = true,
    showNebula: Boolean = true,
    animate: Boolean = true
) {
    Box(modifier = modifier.fillMaxSize()) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val brush = Brush.verticalGradient(
                colors = CandidateColors.cosmicBackgroundStops()
            )
            drawRect(brush, Rect(Offset.Zero, Size(size.width, size.height)))
        }

        if (showNebula) {
            CosmicNebulaLayer(Modifier.fillMaxSize(), animate)
        }

        if (showStars) {
            CosmicStarfield(Modifier.fillMaxSize(), animate = animate)
        }
    }
}

@Composable
fun GoldenParticlesLayer(
    modifier: Modifier = Modifier,
    particleCount: Int = 40,
    centerX: Float = 0.5f,
    centerY: Float = 0.5f,
    radius: Float = 0.4f,
    animate: Boolean = true
) {
    val transition = rememberInfiniteTransition(label = "goldParticles")
    val time by transition.animateFloat(
        initialValue = 0f,
        infiniteRepeatable(
            animation = tween(durationMillis = 8000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "particlesTime"
    )

    val particles = remember(particleCount) {
        val random = java.util.Random(0xGOLD_PARTICLES)
        List(particleCount) { i ->
            val angle = random.nextFloat() * 2f * PI
            val dist = random.nextFloat() * radius
            val size = (random.nextFloat() * 2f + 0.5f) * 2f
            val speed = random.nextFloat() * 0.3f + 0.1f
            val phase = random.nextFloat() * 2f * PI
            val brightness = random.nextFloat() * 0.5f + 0.5f
            val orbitDirection = if (random.nextBoolean()) 1f else -1f
            GoldParticle(angle, dist, size, speed, phase, brightness, orbitDirection)
        }
    }

    Canvas(
        modifier = modifier.fillMaxSize(),
        onDraw = {
            val width = size.width
            val height = size.height
            val cx = width * centerX
            val cy = height * centerY
            val maxR = min(width, height) * radius

            val t = if (animate) time * 0.001f else 0f

            for (p in particles) {
                val currentAngle = p.baseAngle + p.orbitDirection * p.speed * t
                val currentDist = p.baseDist * (0.8f + 0.2f * sin(t * 0.5f + p.phase))
                val x = cx + cos(currentAngle) * currentDist * maxR
                val y = cy + sin(currentAngle) * currentDist * maxR
                val twinkle = sin(t * 3f + p.phase) * 0.3f + 0.7f
                val alpha = (p.brightness * twinkle).coerceIn(0.2f, 1f)
                val drawSize = p.size * twinkle

                val color = CandidateColors.PrimaryGold.copy(alpha = alpha)

                drawCircle(
                    color = color,
                    center = Offset(x, y),
                    radius = drawSize
                )

                if (twinkle > 0.9f) {
                    drawCircle(
                        color = CandidateColors.GoldenHighlight.copy(alpha = alpha * 0.2f),
                        center = Offset(x, y),
                        radius = drawSize * 4f
                    )
                }
            }
        }
    )
}

data class GoldParticle(
    val baseAngle: Float,
    val baseDist: Float,
    val size: Float,
    val speed: Float,
    val phase: Float,
    val brightness: Float,
    val orbitDirection: Float
)

@Composable
fun SubtleVignette(modifier: Modifier = Modifier, intensity: Float = 0.4f) {
    Canvas(
        modifier = modifier.fillMaxSize(),
        onDraw = {
            val width = size.width
            val height = size.height
            val centerX = width / 2f
            val centerY = height / 2f
            val maxRadius = sqrt((width * width + height * height) / 4f)

            val brush = Brush.radialGradient(
                colors = listOf(
                    Color.Transparent,
                    Color.Transparent,
                    CandidateColors.DarkBackground.copy(alpha = intensity * 0.3f),
                    CandidateColors.DarkBackground.copy(alpha = intensity * 0.7f),
                    CandidateColors.DarkBackground
                ),
                center = Offset(centerX, centerY),
                radius = maxRadius
            )
            drawRect(brush, Rect(Offset.Zero, Size(width, height)))
        }
    )
}