plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22"
}

android {
    namespace = "com.knoux.rec.visualcandidate"
    compileSdk = 34

    defaultConfig {
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
        freeCompilerArgs += listOf("-Xopt-in=kotlin.RequiresOptIn")
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }

    packagingOptions {
        resources {
            excludes += listOf("META-INF/*.kotlin_module")
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
    val material3 = "androidx.compose.material3:material3"
    val material3Adaptive = "androidx.compose.material3:material3-adaptive"
    val composeUi = "androidx.compose.ui:ui"
    val composeGraphics = "androidx.compose.ui:ui-graphics"
    val composeAnimation = "androidx.compose.animation:animation"
    val composeRuntime = "androidx.compose.runtime:runtime"
    val activityCompose = "androidx.activity:activity-compose"
    val lifecycleRuntime = "androidx.lifecycle:lifecycle-runtime-compose"
    val viewModelCompose = "androidx.lifecycle:lifecycle-viewmodel-compose"
    val navigationCompose = "androidx.navigation:navigation-compose"
    val constraintLayout = "androidx.constraintlayout:constraintlayout-compose"
    val coreKtx = "androidx.core:core-ktx"
    val kotlinxCoroutines = "org.jetbrains.kotlinx:kotlinx-coroutines-android"
    val kotlinxSerialization = "org.jetbrains.kotlinx:kotlinx-serialization-json"
    val coil = "io.coil-kt:coil-compose"
    val accompanistInsets = "com.google.accompanist:accompanist-systemuicontroller"
    val accompanistPermissions = "com.google.accompanist:accompanist-permissions"
    val junit = "junit:junit"
    val androidxJunit = "androidx.test.ext:junit"
    val espressoCore = "androidx.test.espresso:espresso-core"
    val composeUiTest = "androidx.compose.ui:ui-test-junit4"
    val composeUiTestManifest = "androidx.compose.ui:ui-test-manifest"
    val robolectric = "org.robolectric:robolectric"

    implementation(composeBom)
    implementation(material3)
    implementation(material3Adaptive)
    implementation(composeUi)
    implementation(composeGraphics)
    implementation(composeAnimation)
    implementation(composeRuntime)
    implementation(activityCompose)
    implementation(lifecycleRuntime)
    implementation(viewModelCompose)
    implementation(navigationCompose)
    implementation(constraintLayout)
    implementation(coreKtx)
    implementation(kotlinxCoroutines)
    implementation(kotlinxSerialization)
    implementation(coil)
    implementation(accompanistInsets)
    implementation(accompanistPermissions)

    testImplementation(junit)
    testImplementation(robolectric)
    androidTestImplementation(androidxJunit)
    androidTestImplementation(espressoCore)
    androidTestImplementation(composeUiTest)
    androidTestImplementation(composeUiTestManifest)
}