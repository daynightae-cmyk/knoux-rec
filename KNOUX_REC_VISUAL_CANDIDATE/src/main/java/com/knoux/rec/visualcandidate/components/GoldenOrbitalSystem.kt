package com.knoux.rec.visualcandidate.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.px
import com.knoux.rec.visualcandidate.theme.CandidateColors
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

@Composable
fun GoldenOrbitalSystem(
    modifier: Modifier = Modifier,
    ringCount: Int = 6,
    animate: Boolean = true,
    centerX: Float = 0.5f,
    centerY: Float = 0.5f,
    baseRadius: Float = 0.25f,
    ringSpacing: Float = 0.08f,
    rotationSpeeds: List<Float> = listOf(0.02f, -0.015f, 0.01f, -0.025f, 0.018f, -0.012f),
    gapAngles: List<Float> = listOf(90f, 210f, 30f, 150f, 270f, 60f),
    gapSizes: List<Float> = listOf(60f, 45f, 75f, 50f, 40f, 55f)
) {
    val transition = rememberInfiniteTransition(label = "orbitalSystem")
    val time by transition.animateFloat(
        initialValue = 0f,
        infiniteRepeatable(
            animation = tween(durationMillis = 60000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "orbitalTime"
    )

    val effectiveRingCount = min(ringCount, rotationSpeeds.size)
    val effectiveRingCount2 = min(effectiveRingCount, gapAngles.size)
    val effectiveRingCount3 = min(effectiveRingCount2, gapSizes.size)

    Box(modifier = modifier.fillMaxSize()) {
        Canvas(modifier = Modifier.fillMaxSize(), onDraw = {
            val width = size.width
            val height = size.height
            val cx = width * centerX
            val cy = height * centerY
            val maxDim = min(width, height)
            val baseR = maxDim * baseRadius

            val t = if (animate) time * 0.001f else 0f

            for (i in 0 until effectiveRingCount3) {
                val ringRadius = baseR * (1f + i * ringSpacing)
                val speed = rotationSpeeds[i % rotationSpeeds.size]
                val gapAngle = gapAngles[i % gapAngles.size]
                val gapSize = gapSizes[i % gapSizes.size]

                val rotation = t * speed * 360f
                val startAngle = rotation + gapAngle
                val sweepAngle = 360f - gapSize

                val progress = (i.toFloat() / effectiveRingCount3)
                val alpha = (0.3f + 0.5f * (1f - progress)).coerceIn(0.15f, 0.8f)
                val strokeWidth = maxDim * (0.0015f + 0.001f * (1f - progress))

                val colors = CandidateColors.orbitalGoldStops().mapIndexed { idx, c ->
                    c.copy(alpha = c.alpha * alpha)
                }

                val brush = Brush.sweepGradient(
                    colors = colors,
                    center = Offset(cx, cy),
                    startAngle = startAngle,
                    endAngle = startAngle + sweepAngle
                )

                val path = Path().apply {
                    addArc(
                        Rect(
                            Offset(cx - ringRadius, cy - ringRadius),
                            Offset(cx + ringRadius, cy + ringRadius)
                        ),
                        startAngle,
                        sweepAngle
                    )
                }

                drawPath(
                    path = path,
                    color = colors[0],
                    style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                    strokeWidth = strokeWidth,
                    pathEffect = PathEffect.makeDashPathEffect(
                        intervals = floatArrayOf(sweepAngle / 360f * 2f * PI * ringRadius, gapSize / 360f * 2f * PI * ringRadius),
                        phase = 0f
                    )
                ) {
                    this@drawPath.strokeCap = StrokeCap.Round
                }

                val glowPath = Path().apply {
                    addArc(
                        Rect(
                            Offset(cx - ringRadius, cy - ringRadius),
                            Offset(cx + ringRadius, cy + ringRadius)
                        ),
                        startAngle,
                        sweepAngle
                    )
                }
                drawPath(
                    path = glowPath,
                    color = CandidateColors.GoldenHighlight.copy(alpha = alpha * 0.08f),
                    style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                    strokeWidth = strokeWidth * 4f
                )
            }

            for (i in 0 until effectiveRingCount3) {
                val ringRadius = baseR * (1f + i * ringSpacing)
                val speed = rotationSpeeds[i % rotationSpeeds.size]
                val gapAngle = gapAngles[i % gapAngles.size]
                val gapSize = gapSizes[i % gapSizes.size]

                val rotation = t * speed * 360f
                val gapStart = rotation + gapAngle
                val gapEnd = gapStart + gapSize

                val midGap = (gapStart + gapEnd) / 2f
                val midRad = midGap * PI / 180f
                val px = cx + cos(midRad) * ringRadius
                val py = cy + sin(midRad) * ringRadius

                val sparkleAlpha = (sin(t * 5f + i * 1.5f) * 0.3f + 0.7f) * 0.6f
                drawCircle(
                    color = CandidateColors.GoldenHighlight.copy(alpha = sparkleAlpha),
                    center = Offset(px, py),
                    radius = maxDim * 0.003f
                )

                drawCircle(
                    color = CandidateColors.PrimaryGold.copy(alpha = sparkleAlpha * 0.5f),
                    center = Offset(px, py),
                    radius = maxDim * 0.008f
                )
            }
        })
    }
}

@Composable
fun GoldenPulseRing(
    modifier: Modifier = Modifier,
    animate: Boolean = true,
    centerX: Float = 0.5f,
    centerY: Float = 0.5f,
    minRadius: Float = 0.15f,
    maxRadius: Float = 0.35f,
    durationMillis: Int = 3000,
    ringCount: Int = 3,
    color: Color = CandidateColors.PrimaryGold
) {
    val transition = rememberInfiniteTransition(label = "pulseRing")
    val time by transition.animateFloat(
        initialValue = 0f,
        infiniteRepeatable(
            animation = tween(durationMillis = durationMillis, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "pulseTime"
    )

    Canvas(
        modifier = modifier.fillMaxSize(),
        onDraw = {
            val width = size.width
            val height = size.height
            val cx = width * centerX
            val cy = height * centerY
            val maxDim = min(width, height)

            val t = if (animate) time * 0.001f else 0f

            for (i in 0 until ringCount) {
                val phaseOffset = i.toFloat() / ringCount
                val progress = ((t * 1000f / durationMillis) + phaseOffset) % 1f
                val currentRadius = maxDim * (minRadius + (maxRadius - minRadius) * progress)
                val alpha = (1f - progress) * 0.4f

                drawCircle(
                    color = color.copy(alpha = alpha),
                    center = Offset(cx, cy),
                    radius = currentRadius,
                    style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                    strokeWidth = maxDim * 0.002f
                )
            }
        }
    )
}

@Composable
fun OrbitalArcSystem(
    modifier: Modifier = Modifier,
    arcCount: Int = 8,
    animate: Boolean = true,
    centerX: Float = 0.5f,
    centerY: Float = 0.5f,
    minRadius: Float = 0.2f,
    maxRadius: Float = 0.45f
) {
    val transition = rememberInfiniteTransition(label = "orbitalArcs")
    val time by transition.animateFloat(
        initialValue = 0f,
        infiniteRepeatable(
            animation = tween(durationMillis = 40000, delayMillis = 0),
            repeatMode = androidx.compose.animation.core.RepeatMode.Restart
        ),
        label = "arcTime"
    )

    val arcs = remember(arcCount) {
        val random = java.util.Random(0xORBITAL_ARCS)
        List(arcCount) { i ->
            val radius = minRadius + random.nextFloat() * (maxRadius - minRadius)
            val startAngle = random.nextFloat() * 360f
            val sweepAngle = random.nextFloat() * 120f + 40f
            val speed = (random.nextFloat() * 0.02f + 0.005f) * (if (random.nextBoolean()) 1f else -1f)
            val thickness = random.nextFloat() * 1.5f + 0.5f
            val colorType = random.nextInt(3)
            val phase = random.nextFloat() * 2f * PI
            OrbitalArc(radius, startAngle, sweepAngle, speed, thickness, colorType, phase)
        }
    }

    Canvas(
        modifier = modifier.fillMaxSize(),
        onDraw = {
            val width = size.width
            val height = size.height
            val cx = width * centerX
            val cy = height * centerY
            val maxDim = min(width, height)

            val t = if (animate) time * 0.001f else 0f

            for (arc in arcs) {
                val currentStart = arc.startAngle + arc.speed * t * 360f
                val radius = maxDim * arc.radius
                val strokeWidth = maxDim * arc.thickness * 0.0015f

                val baseColor = when (arc.colorType) {
                    0 -> CandidateColors.PrimaryGold
                    1 -> CandidateColors.VioletAccent
                    else -> CandidateColors.CyanAccent
                }

                val alpha = (0.15f + 0.2f * sin(t * 2f + arc.phase)).coerceIn(0.05f, 0.35f)

                val path = Path().apply {
                    addArc(
                        Rect(
                            Offset(cx - radius, cy - radius),
                            Offset(cx + radius, cy + radius)
                        ),
                        currentStart,
                        arc.sweepAngle
                    )
                }

                drawPath(
                    path = path,
                    color = baseColor.copy(alpha = alpha),
                    style = androidx.compose.ui.graphics.Paint.Style.Stroke,
                    strokeWidth = strokeWidth
                ) {
                    this@drawPath.strokeCap = StrokeCap.Round
                }
            }
        }
    )
}

data class OrbitalArc(
    val radius: Float,
    val startAngle: Float,
    val sweepAngle: Float,
    val speed: Float,
    val thickness: Float,
    val colorType: Int,
    val phase: Float
)