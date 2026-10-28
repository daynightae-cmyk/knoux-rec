package com.knoux.rec.visualcandidate.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.WindowInsets
import androidx.compose.ui.window.WindowInsetsType
import com.knoux.rec.visualcandidate.theme.CandidateColors
import com.knoux.rec.visualcandidate.theme.CandidateShapes

@Composable
fun AdaptiveScreenLayout(
    modifier: Modifier = Modifier,
    showBottomNav: Boolean = true,
    bottomNavTab: com.knoux.rec.visualcandidate.components.NavigationTab = com.knoux.rec.visualcandidate.components.NavigationTab.Home,
    onBottomNavClick: ((com.knoux.rec.visualcandidate.components.NavigationTab) -> Unit)? = null,
    topBar: (@Composable () -> Unit)? = null,
    content: @Composable (Modifier, WindowInsets) -> Unit
) {
    val systemBars = remember { mutableStateOf(WindowInsets(0, 0, 0, 0)) }
    val imeInsets = remember { mutableStateOf(WindowInsets(0, 0, 0, 0)) }

    Box(modifier = modifier.fillMaxSize()) {
        val insets = systemBars.value
        val ime = imeInsets.value
        val bottomInset = max(insets.bottom, ime.bottom)

        Scaffold(
            modifier = Modifier.fillMaxSize(),
            topBar = {
                topBar?.invoke()
            },
            bottomBar = {
                if (showBottomNav) {
                    com.knoux.rec.visualcandidate.components.KnouxBottomNavigation(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = bottomInset.dp),
                        currentTab = bottomNavTab,
                        onTabSelected = onBottomNavClick ?: {}
                    )
                }
            },
            content = { innerPadding ->
                val contentModifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(bottom = if (showBottomNav) 88.dp + bottomInset.dp else 0.dp)

                Box(modifier = contentModifier.fillMaxSize()) {
                    content(contentModifier, insets)
                }
            }
        )
    }
}

@Composable
fun FullScreenLayout(
    modifier: Modifier = Modifier,
    content: @Composable (Modifier, WindowInsets) -> Unit
) {
    val systemBars = remember { mutableStateOf(WindowInsets(0, 0, 0, 0)) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(CandidateColors.DarkBackground)
    ) {
        content(Modifier.fillMaxSize(), systemBars.value)
    }
}

@Composable
fun SafeAreaBox(
    modifier: Modifier = Modifier,
    content: @Composable (Modifier) -> Unit
) {
    val insets = remember { mutableStateOf(WindowInsets(0, 0, 0, 0)) }
    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(
                top = insets.value.top.dp,
                bottom = insets.value.bottom.dp,
                start = insets.value.left.dp,
                end = insets.value.right.dp
            )
    ) {
        content(Modifier.fillMaxSize())
    }
}

@Composable
fun ResponsivePadding(
    modifier: Modifier = Modifier,
    compact: Boolean = false,
    content: @Composable (Modifier) -> Unit
) {
    val density = LocalDensity.current
    val horizontalPadding = if (compact) 16.dp else 24.dp
    val verticalPadding = if (compact) 12.dp else 16.dp

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = horizontalPadding, vertical = verticalPadding)
    ) {
        content(Modifier.fillMaxWidth())
    }
}

@Composable
fun TwoColumnGrid(
    modifier: Modifier = Modifier,
    horizontalSpacing: androidx.compose.ui.unit.Dp = 16.dp,
    verticalSpacing: androidx.compose.ui.unit.Dp = 16.dp,
    content: @Composable (Modifier) -> Unit
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(horizontalSpacing)
        ) {
            content(Modifier.weight(1f, fill = true))
            content(Modifier.weight(1f, fill = true))
        }
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.padding(top = verticalSpacing))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(horizontalSpacing)
        ) {
            content(Modifier.weight(1f, fill = true))
            content(Modifier.weight(1f, fill = true))
        }
    }
}

@Composable
fun ScrollableScreen(
    modifier: Modifier = Modifier,
    content: @Composable (Modifier) -> Unit
) {
    androidx.compose.foundation.layout.Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(androidx.compose.foundation.layout.rememberScrollState()),
        verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(16.dp)
    ) {
        content(Modifier.fillMaxWidth())
    }
}

@Composable
fun ConstrainedWidthBox(
    modifier: Modifier = Modifier,
    maxWidthDp: androidx.compose.ui.unit.Dp = 600.dp,
    content: @Composable (Modifier) -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .widthIn(max = maxWidthDp)
            .align(Alignment.CenterHorizontal)
    ) {
        content(Modifier.fillMaxWidth())
    }
}