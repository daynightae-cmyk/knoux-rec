# KNOUX REC - VISUAL CANDIDATE PACKAGE

This package contains a complete, pixel-accurate visual implementation of 10 Android screens for the KNOUX REC application using Kotlin and Jetpack Compose.

## Features

- **10 Complete Screens**: Splash, Home, Capture Setup, Live Recording, Pause/Resume, Recording Result, Media Library, Tools Studio, Settings, Diagnostics
- **Premium Design System**: Cosmic theme with gold/violet/cyan accents, starfields, orbital animations
- **State-Driven Architecture**: All screens use immutable UI state and typed actions
- **Fully Responsive**: Works on compact phones, standard devices, and handles RTL
- **Accessibility Ready**: Proper labels and contrast considerations
- **Integration-Ready**: Clean contracts for integration with existing KNOUX REC app

## Architecture

The package follows a clean architecture pattern:
- `theme/` - Colors, typography, shapes, and theme
- `components/` - Reusable UI components
- `contract/` - UI state models and action interfaces  
- `screens/` - Individual screen implementations
- `preview/` - Preview data and Compose previews
- `integration/` - Integration examples and adapters

## Integration

This package is designed to be integrated into the existing KNOUX REC app without modifying the actual application. See `INTEGRATION_GUIDE.md` for details.

## Usage

```kotlin
// Use in your app
@Composable
fun MyApp() {
    CandidateTheme {
        val gateway = PreviewFeatureGateway()
        CandidateAppIntegration(gateway = gateway)
    }
}
```

## Requirements

- Android API 26+
- Kotlin 1.9.22+
- Jetpack Compose with BOM 2024.02.00
- Material 3

## Note

This is a visual candidate package for evaluation. It includes preview/demo implementations and is not a complete replacement for the production app. All business logic is abstracted through interfaces.