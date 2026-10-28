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
import androidx.compose.foundation.lazy.items
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
import com.knoux.rec.visualcandidate.components.MediaLibraryItem
import com.knoux.rec.visualcandidate.components.MediaTypeFilter
import com.knoux.rec.visualcandidate.components.MediaTypeFilterRow
import com.knoux.rec.visualcandidate.components.MetricCard
import com.knoux.rec.visualcandidate.components.NavigationTab
import com.knoux.rec.visualcandidate.components.PremiumCard
import com.knoux.rec.visualcandidate.components.PremiumCardVariant
import com.knoux.rec.visualcandidate.components.SearchBar
import com.knoux.rec.visualcandidate.components.SectionHeader
import com.knoux.rec.visualcandidate.contract.CandidateAction
import com.knoux.rec.visualcandidate.contract.MediaLibraryUiState
import com.knoux.rec.visualcandidate.contract.NavigationDestination
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes
import com.knoux.rec.visualcandidate.theme.CandidateTypography

@Composable
fun MediaLibraryCandidateScreen(
    modifier: Modifier = Modifier,
    state: MediaLibraryUiState,
    onAction: (CandidateAction) -> Unit
) {
    AdaptiveScreenLayout(
        modifier = modifier,
        showBottomNav = true,
        bottomNavTab = NavigationTab.Library,
        onBottomNavClick = { tab ->
            when (tab) {
                NavigationTab.Home -> onAction(CandidateAction.NavigateTo(NavigationDestination.Home))
                NavigationTab.Library -> {}
                NavigationTab.Tools -> onAction(CandidateAction.NavigateTo(NavigationDestination.ToolsStudio))
                NavigationTab.Settings -> onAction(CandidateAction.NavigateTo(NavigationDestination.Settings))
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
                            text = "ON YOUR DEVICE",
                            style = CandidateTypography.HeadlineSmall.copy(fontSize = 16.sp),
                            color = CandidateColors.PrimaryText
                        )
                        Text(
                            text = "Media library",
                            style = CandidateTypography.TitleMedium.copy(fontSize = 18.sp),
                            color = CandidateColors.PrimaryGold
                        )
                        Text(
                            text = "Everything you create, beautifully organized.",
                            style = CandidateTypography.BodyMedium,
                            color = CandidateColors.SecondaryText
                        )
                    }

                    SearchBar(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                        query = state.searchQuery,
                        onQueryChange = { onAction(CandidateAction.SearchMedia(it)) },
                        placeholder = "Search your captures..."
                    )

                    MediaTypeFilterRow(
                        modifier = Modifier.fillMaxWidth(),
                        filters = listOf(MediaTypeFilter.All, MediaTypeFilter.Videos, MediaTypeFilter.Images, MediaTypeFilter.Audio),
                        selectedFilter = state.selectedFilter,
                        onFilterSelected = { onAction(CandidateAction.SelectMediaFilter(it)) }
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        MetricCard(
                            modifier = Modifier.weight(1f),
                            label = "FILES",
                            value = "${state.totalItems} items",
                            accentColor = CandidateColors.CyanAccent,
                            icon = { FilesIcon(it, CandidateColors.CyanAccent) }
                        )
                        MetricCard(
                            modifier = Modifier.weight(1f),
                            label = "STORAGE",
                            value = state.formattedTotalStorage,
                            accentColor = CandidateColors.VioletAccent,
                            icon = { StorageIcon(it, CandidateColors.VioletAccent) }
                        )
                    }

                    SectionHeader(
                        title = "RECENT CREATIONS",
                        subtitle = "Your captures",
                        accentColor = CandidateColors.PrimaryGold
                    )

                    if (state.filteredItems.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxWidth().height(200.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Text(
                                    text = "No media found",
                                    style = CandidateTypography.TitleMedium,
                                    color = CandidateColors.SecondaryText
                                )
                                Text(
                                    text = "Try adjusting your search or filters",
                                    style = CandidateTypography.BodyMedium,
                                    color = CandidateColors.TertiaryText
                                )
                            }
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 32.dp)
                        ) {
                            items(state.filteredItems) { mediaItem ->
                                MediaLibraryItem(
                                    modifier = Modifier.fillMaxWidth(),
                                    title = mediaItem.title,
                                    subtitle = mediaItem.subtitle,
                                    mediaType = mediaItem.type,
                                    duration = mediaItem.duration,
                                    date = mediaItem.date,
                                    thumbnailColor = Color(mediaItem.thumbnailColor),
                                    onClick = { onAction(CandidateAction.OpenMediaDetails(mediaItem.id)) },
                                    onLongClick = { onAction(CandidateAction.DeleteMediaRequested(mediaItem.id)) }
                                )
                            }
                        }
                    }
                }
            }
        }
    )
}

@Composable
private fun FilesIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val sw = s * 0.08f

        val rect1 = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(Rect(Offset(cx - s * 0.3f, cy - s * 0.25f), Size(s * 0.5f, s * 0.35f)), s * 0.05f)
        }
        drawPath(rect1, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val rect2 = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(Rect(Offset(cx - s * 0.2f, cy - s * 0.15f), Size(s * 0.5f, s * 0.35f)), s * 0.05f)
        }
        drawPath(rect2, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }

        val rect3 = androidx.compose.ui.graphics.Path().apply {
            addRoundedRect(Rect(Offset(cx - s * 0.1f, cy - s * 0.05f), Size(s * 0.5f, s * 0.35f)), s * 0.05f)
        }
        drawPath(rect3, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
        }
    })
}

@Composable
private fun StorageIcon(modifier: Modifier, color: Color) {
    Canvas(modifier = modifier, onDraw = {
        val width = size.width.toFloat()
        val height = size.height.toFloat()
        val s = min(width, height)
        val cx = width / 2f
        val cy = height / 2f
        val sw = s * 0.08f

        val base = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.35f, cy)
            lineTo(cx + s * 0.35f, cy)
            lineTo(cx + s * 0.25f, cy + s * 0.25f)
            lineTo(cx - s * 0.25f, cy + s * 0.25f)
            close()
        }
        drawPath(base, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }

        val top = androidx.compose.ui.graphics.Path().apply {
            moveTo(cx - s * 0.25f, cy)
            lineTo(cx - s * 0.15f, cy - s * 0.2f)
            lineTo(cx + s * 0.15f, cy - s * 0.2f)
            lineTo(cx + s * 0.25f, cy)
        }
        drawPath(top, color, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
            this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            this@drawPath.strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
        }
    })
}

@Composable
fun SearchBar(
    modifier: Modifier = Modifier,
    query: String,
    onQueryChange: (String) -> Unit,
    placeholder: String
) {
    val pressed = androidx.compose.runtime.mutableStateOf(false)
    Box(
        modifier = modifier
            .height(52.dp)
            .clip(CandidateShapes.Pill)
            .background(CandidateColors.SecondarySurface, CandidateShapes.Pill)
            .border(1.dp, CandidateColors.CardStroke.copy(alpha = 0.5f), CandidateShapes.Pill),
        contentAlignment = Alignment.CenterStart
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Canvas(modifier = Modifier.size(20.dp), onDraw = {
                val width = size.width.toFloat()
                val height = size.height.toFloat()
                val cx = width / 2f
                val cy = height / 2f
                val s = min(width, height)
                val sw = s * 0.08f

                val circle = androidx.compose.ui.graphics.Path().apply {
                    addOval(Rect(Offset(cx - s * 0.35f, cy - s * 0.35f), Size(s * 0.7f, s * 0.7f)))
                }
                drawPath(circle, CandidateColors.TertiaryText, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                }

                val line = androidx.compose.ui.graphics.Path().apply {
                    moveTo(cx + s * 0.25f, cy + s * 0.25f)
                    lineTo(cx + s * 0.45f, cy + s * 0.45f)
                }
                drawPath(line, CandidateColors.TertiaryText, style = androidx.compose.ui.graphics.Paint.Style.Stroke, strokeWidth = sw) {
                    this@drawPath.strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                }
            })
            androidx.compose.material3.TextField(
                value = query,
                onValueChange = onQueryChange,
                placeholder = { Text(placeholder, color = CandidateColors.TertiaryText) },
                colors = androidx.compose.material3.TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    focusedTextColor = CandidateColors.PrimaryText,
                    unfocusedTextColor = CandidateColors.PrimaryText
                ),
                singleLine = true,
                modifier = Modifier.weight(1f)
            )
        }
    }
}