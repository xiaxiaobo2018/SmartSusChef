import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("com.google.dagger.hilt.android")
    alias(libs.plugins.ksp)
    id("androidx.navigation.safeargs.kotlin")
    id("kotlin-parcelize")
    alias(libs.plugins.detekt)
    alias(libs.plugins.ktlint)
    id("jacoco")
}

// Load properties from local.properties file, if it exists
val localProperties = Properties()
val localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localProperties.load(FileInputStream(localPropertiesFile))
}

android {
    namespace = "com.smartsuschef.mobile"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.smartsuschef.mobile"
        minSdk = 29
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "com.smartsuschef.mobile.HiltTestRunner"
        multiDexEnabled = true
    }

    flavorDimensions += "environment"
    productFlavors {
        create("local") {
            dimension = "environment"
            applicationIdSuffix = ".local"
            versionNameSuffix = "-local"
            // Emulator localhost / internal network
            val baseUrl = localProperties.getProperty("local.base.url", "http://10.0.2.2:5001/api/")
            buildConfigField("String", "BASE_URL", "\"$baseUrl\"")
        }
        create("uat") {
            dimension = "environment"
            applicationIdSuffix = ".uat"
            versionNameSuffix = "-uat"
            buildConfigField("String", "BASE_URL", "\"http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/\"")
        }
        create("production") {
            dimension = "environment"
            versionNameSuffix = "-prod"
            buildConfigField("String", "BASE_URL", "\"http://smartsuschef-uat-alb-374711244.ap-southeast-1.elb.amazonaws.com/api/\"")
        }
    }

    buildTypes {
        debug {
            enableUnitTestCoverage = true
            enableAndroidTestCoverage = true
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    ksp {
        arg("dagger.hilt.internal.useAggregatingRootProcessor", "false")
    }

    testOptions {
        unitTests {
            isIncludeAndroidResources = true
            isReturnDefaultValues = true
        }
        animationsDisabled = true
        // execution = "ANDROIDX_TEST_ORCHESTRATOR"
    }

    lint {
        abortOnError = true
        checkTestSources = false
        disable += "NullSafeMutableLiveData"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.legacy.support.v4)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.fragment.ktx)
    testImplementation(libs.junit)
    testImplementation(libs.mockito.core)
    testImplementation(libs.mockito.kotlin)
    testImplementation(libs.coroutines.test)
    testImplementation(libs.core.testing)
    testImplementation(libs.datastore.preferences)
    testImplementation(libs.datastore.preferences.core)
    testImplementation(libs.mockk)
    testImplementation(libs.truth)
    testImplementation(libs.robolectric)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.espresso.contrib)
    androidTestImplementation(libs.androidx.espresso.idling.resource)
    androidTestImplementation(libs.androidx.espresso.intents)
    androidTestImplementation(libs.coroutines.test)
    androidTestImplementation(libs.mockwebserver)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestUtil(libs.androidx.test.orchestrator)
    detektPlugins(libs.detekt.formatting)
    // Networking (For .NET Backend & Python ML)
    implementation(libs.retrofit.core)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp.logging)
    // Navigation (For fragments)
    implementation(libs.navigation.fragment)
    implementation(libs.navigation.ui)
    // Hilt (Dependency Injection)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    // Add Hilt testing dependencies
    testImplementation(libs.hilt.android.testing)
    androidTestImplementation(libs.hilt.android.testing)
    // Use kspTest and kspAndroidTest for the Hilt compiler for test sources
    kspTest(libs.hilt.compiler)
    kspAndroidTest(libs.hilt.compiler)
    // Storage (For TokenManager)
    implementation(libs.datastore.preferences)
    implementation(libs.androidx.security.crypto)
    // UI Components (For charts)
    implementation(libs.mp.android.chart)
    // MultiDex
    implementation(libs.androidx.multidex)
    coreLibraryDesugaring(libs.desugar.jdk.libs)
}

detekt {
    buildUponDefaultConfig = true
    allRules = false
    config.setFrom("${rootProject.projectDir}/config/detekt/detekt.yml")
    reports {
        html.required.set(true)
        xml.required.set(true)
        txt.required.set(false)
    }
}

ktlint {
    android.set(true)
    debug.set(true)
    outputToConsole.set(true)
    reporters {
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.PLAIN)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.CHECKSTYLE)
    }
}

jacoco {
    toolVersion = "0.8.12"
}

// Disable lint analysis on test sources — AGP bug crashes on Hilt/FIR resolution
tasks.configureEach {
    if (name.startsWith("lintAnalyze") && (name.contains("UnitTest") || name.contains("AndroidTest"))) {
        enabled = false
    }
}

tasks.withType<Test> {
    testLogging {
        showStandardStreams = true
        events("PASSED", "SKIPPED", "FAILED")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    configure<JacocoTaskExtension> {
        isIncludeNoLocationClasses = true
        excludes =
            listOf(
                "jdk.internal.*",
                "**/R.class",
                "**/R\$*.class",
                "**/BuildConfig.*",
                "**/Manifest*.*",
                "**/*Test*.*",
                "android/**/*.*",
                "**/di/**",
                "dagger/**",
                "hilt_aggregated_deps/**",
                "**/*_HiltModules*.*",
                "**/*_Factory.*",
                "**/*_MembersInjector.*",
                "**/*_GeneratedInjector.*",
                "**/Hilt_*.*",
                "**/*_ComponentTreeDeps.*",
            )
    }
}

// Unit-test-only coverage report
tasks.register<JacocoReport>("jacocoTestReportDebug") {
    dependsOn("testLocalDebugUnitTest")
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
    val fileFilter =
        listOf(
            // Android generated
            "**/R.class",
            "**/R\$*.class",
            "**/BuildConfig.*",
            "**/Manifest*.*",
            "**/*Test*.*",
            "android/**/*.*",
            // DI & Hilt generated
            "**/di/**",
            "dagger/**",
            "hilt_aggregated_deps/**",
            "**/*_HiltModules*.*",
            "**/*_Factory.*",
            "**/*_MembersInjector.*",
            "**/*_GeneratedInjector.*",
            "**/Hilt_*.*",
            "**/*_ComponentTreeDeps.*",
            // UI layer (covered by instrumented tests, not unit tests)
            "**/*Fragment.*",
            "**/*Fragment\$*.*",
            "**/*Activity.*",
            "**/*Activity\$*.*",
            "**/*Adapter.*",
            "**/*Adapter\$*.*",
            "**/*MarkerView.*",
            "**/*MarkerView\$*.*",
            "**/*Application.*",
            // Network interfaces (no logic to test)
            "**/network/api/**",
            // Android-framework-dependent classes (tested via instrumented tests)
            "**/data/TokenManager.*",
            "**/data/TokenManager\$*.*",
        )
    val debugTree =
        fileTree("${layout.buildDirectory.get().asFile}/tmp/kotlin-classes/localDebug") {
            exclude(fileFilter)
        }
    val mainSrc = "${project.projectDir}/src/main/java"
    sourceDirectories.setFrom(files(mainSrc))
    classDirectories.setFrom(files(debugTree))
    executionData.setFrom(
        fileTree(layout.buildDirectory.get().asFile) {
            include("outputs/unit_test_code_coverage/localDebugUnitTest/testLocalDebugUnitTest.exec")
        },
    )
}

// Consolidated coverage report combining Unit Tests + Instrumented Tests
tasks.register<JacocoReport>("jacocoFullCoverageReport") {
    dependsOn("testLocalDebugUnitTest")
    // Run instrumented tests separately first: ./gradlew connectedLocalDebugAndroidTest

    reports {
        xml.required.set(true)
        html.required.set(true)
    }
    val fileFilter =
        listOf(
            // Android generated
            "**/R.class",
            "**/R\$*.class",
            "**/BuildConfig.*",
            "**/Manifest*.*",
            "**/*Test*.*",
            "android/**/*.*",
            // DI & Hilt generated
            "**/di/**",
            "dagger/**",
            "hilt_aggregated_deps/**",
            "**/*_HiltModules*.*",
            "**/*_Factory.*",
            "**/*_MembersInjector.*",
            "**/*_GeneratedInjector.*",
            "**/Hilt_*.*",
            "**/*_ComponentTreeDeps.*",
            "**/Dagger*.*",
            "**/*_HiltComponents*.*",
            // Generated ViewBinding classes
            "**/databinding/**",
            // Application class (no testable logic)
            "**/*Application.*",
            "**/*Application\$*.*",
            // Network interfaces (no logic to test)
            "**/network/api/**",
        )
    // Use Hilt ASM-transformed classes so class IDs match instrumented test .ec files
    val debugTree =
        fileTree(
            "${layout.buildDirectory.get().asFile}/intermediates/classes/localDebug/transformLocalDebugClassesWithAsm/dirs",
        ) {
            exclude(fileFilter)
        }
    val mainSrc = "${project.projectDir}/src/main/java"
    sourceDirectories.setFrom(files(mainSrc))
    classDirectories.setFrom(files(debugTree))
    executionData.setFrom(
        fileTree(layout.buildDirectory.get().asFile) {
            include(
                // Unit test coverage data (.exec)
                "outputs/unit_test_code_coverage/localDebugUnitTest/testLocalDebugUnitTest.exec",
                // Instrumented test coverage data (.ec)
                "outputs/code_coverage/localDebugAndroidTest/connected/**/*.ec",
            )
        },
    )
}
