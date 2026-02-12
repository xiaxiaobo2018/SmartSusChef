# SmartSusChef Android - Testing & Code Quality Guide

## 1. Overview

The SmartSusChef Android app uses a two-tier testing strategy to achieve comprehensive code coverage across all architectural layers.

### Why Two Types of Tests?

Android applications have code that can run on a standard JVM (business logic, ViewModels, repositories) and code that **requires the Android framework** (Activities, Fragments, UI interactions, encrypted storage). These fundamentally different environments require different testing approaches:

| | Unit Tests | Instrumented Tests |
|---|---|---|
| **Runs on** | Local JVM (no device needed) | Physical device or emulator |
| **Speed** | Fast (~30 seconds) | Slower (~3-5 minutes) |
| **What it tests** | ViewModels, Repositories, DTOs, Utilities, Models | Activities, Fragments, UI interactions, TokenManager |
| **Why separate?** | Business logic doesn't need Android framework | UI components, navigation, and encrypted storage **require** the Android runtime |

### Test Counts

| Type | Test Files | Test Cases |
|---|---|---|
| Unit Tests | 30 | 347 |
| Instrumented (UI) Tests | 9 | 126 |
| **Total** | **39** | **473** |

### Frameworks & Libraries

| Framework | Purpose |
|---|---|
| **JUnit 4** | Test runner and assertions |
| **Mockito / MockK** | Mocking dependencies for unit tests |
| **Google Truth** | Fluent assertion library |
| **Kotlin Coroutines Test** | Testing coroutine-based async code |
| **AndroidX Arch Core Testing** | `InstantTaskExecutorRule` for LiveData |
| **Robolectric** | Android framework simulation for unit tests |
| **Espresso** | UI interaction testing (click, type, scroll, assert) |
| **MockWebServer (OkHttp)** | Mock HTTP backend for instrumented tests |
| **Hilt Testing** | Dependency injection in test environment |
| **JaCoCo** | Code coverage measurement and reporting |

### Test Architecture

```
src/test/java/                          # Unit Tests (JVM)
├── data/models/                        # Data model validation
├── data/repository/                    # Repository logic (mocked API)
├── network/dto/                        # DTO serialization/deserialization
├── ui/auth/LoginViewModelTest          # ViewModel business logic
├── ui/dashboard/DashboardViewModelTest
├── ui/datainput/DataInputViewModelTest
├── ui/forecast/ForecastViewModelTest
├── ui/sales/SalesViewModelTest
├── ui/settings/SettingsViewModelTest
├── ui/wastage/WastageViewModelTest
└── util/                               # Utility function tests

src/androidTest/java/                   # Instrumented Tests (Device)
├── data/TokenManagerTest               # Encrypted SharedPreferences
├── ui/auth/LoginActivityTest           # Login screen UI flow
├── ui/dashboard/DashboardActivityTest  # Navigation, toolbar, tab switching
├── ui/datainput/DataInputFragmentTest  # Sales/wastage data entry forms
├── ui/forecast/ForecastFragmentTest    # Prediction charts and data display
├── ui/sales/SalesOverviewFragmentTest  # Sales trend charts
├── ui/sales/SalesDetailFragmentTest    # Daily sales breakdown
├── ui/settings/SettingsActivityTest    # Password change, profile update
├── ui/wastage/WastageOverviewFragmentTest  # Wastage trend charts
└── ui/wastage/WastageDetailFragmentTest    # Daily wastage breakdown
```

---

## 2. How to Run the Tests

### Prerequisites

- **Java 17** (required by AGP 8.7)
- **Android SDK** with compile SDK 35
- For instrumented tests: a physical Android device (USB debugging enabled) or an Android emulator

### Running Unit Tests

```bash
cd mobile
./gradlew testLocalDebugUnitTest
```

**Test results report (pass/fail):**
```
app/build/reports/tests/testLocalDebugUnitTest/index.html
```

### Running Instrumented Tests

Connect a physical device or start an emulator, then:

```bash
cd mobile
./gradlew connectedLocalDebugAndroidTest
```

**Test results report (pass/fail):**
```
app/build/reports/androidTests/connected/localDebug/index.html
```

### Running Both Together

```bash
cd mobile
./gradlew testLocalDebugUnitTest connectedLocalDebugAndroidTest
```

---

## 3. Code Coverage Reports

The project uses **JaCoCo** (v0.8.12) for code coverage measurement. Two coverage reports are available, each serving a different purpose.

### Report A: Unit Test Coverage (`jacocoTestReportDebug`)

```bash
cd mobile
./gradlew jacocoTestReportDebug
```

**Report location:**
```
app/build/reports/jacoco/jacocoTestReportDebug/html/index.html
```

This report measures coverage from **unit tests only**. It intentionally **excludes UI-layer classes** (Activities, Fragments, Adapters) because these classes require the Android framework and cannot be meaningfully tested with JVM-only unit tests. Testing them in unit tests would require excessive mocking of Android internals, producing brittle tests that verify mock behavior rather than real functionality.

**Excluded from this report (in addition to generated code):**
- `*Activity`, `*Fragment`, `*Adapter`, `*MarkerView`, `*Application`
- `TokenManager` (requires Android EncryptedSharedPreferences)
- Network API interfaces (Retrofit interface definitions with no logic)

**Current coverage: 77.8% instruction coverage**

### Report B: Full Coverage — Unit + Instrumented (`jacocoFullCoverageReport`)

```bash
cd mobile
./gradlew jacocoFullCoverageReport
```

**Report location:**
```
app/build/reports/jacoco/jacocoFullCoverageReport/html/index.html
```

This report **combines coverage data from both unit tests and instrumented tests**, providing a complete picture across all architectural layers. UI-layer classes are included because instrumented tests exercise them on a real Android device.

**Current coverage: 81.2% instruction coverage**

### Why Unit Test Coverage (77.8%) Is Lower Than Full Coverage (81.2%)

Unit tests deliberately exclude UI-layer classes because:

1. **Activities and Fragments** depend heavily on the Android lifecycle, view binding, and navigation — these cannot run on a standard JVM
2. **TokenManager** uses Android's `EncryptedSharedPreferences`, which requires the Android Keystore system
3. **UI interactions** (button clicks, form validation, scrolling, toast messages) can only be verified through Espresso on a real device

The full coverage report includes these classes because **instrumented tests provide the real Android runtime** needed to test them properly. This is the standard Android testing practice recommended by Google's testing guidelines.

### Coverage Breakdown by Layer

| Package | Unit Tests | Full (Unit + Instrumented) |
|---|---|---|
| data (TokenManager) | excluded | 98.3% |
| ui/dashboard | 91.7% | 88.8% |
| ui/forecast | 97.3% | 86.1% |
| ui/settings | 90.7% | 85.2% |
| ui/sales | 81.3% | 83.8% |
| ui/auth | 97.8% | 83.2% |
| ui/datainput | 91.4% | 82.8% |
| ui/wastage | 54.9% | 80.0% |
| data/models | 87.6% | 87.6% |
| data/repository | 68.7% | 73.8% |
| network/dto | 73.4% | 75.2% |
| util | 63.4% | 67.2% |

> Note: The unit test column only reflects ViewModel coverage for UI packages (Activities/Fragments are excluded). The full report column includes both ViewModel and UI component coverage.

### Generating Both Reports

> **Important:** The full coverage report must be generated in **sequential steps**, not a single command. The `jacocoFullCoverageReport` task does not depend on instrumented tests — if instrumented tests fail or are skipped, it will silently generate a report with only unit test data, producing misleadingly low coverage numbers.

**Step 1: Clean and run unit tests**
```bash
cd mobile
./gradlew clean testLocalDebugUnitTest
```

**Step 2: Run instrumented tests (requires a connected device or emulator)**
```bash
./gradlew connectedLocalDebugAndroidTest
```
> Verify this step completes successfully before proceeding. If it fails, the full coverage report will be inaccurate.

**Step 3: Generate both coverage reports**
```bash
./gradlew jacocoTestReportDebug jacocoFullCoverageReport
```

> Always start with `clean` (Step 1) when generating the full coverage report to ensure class files match between unit test and instrumented test runs.

### What Is Excluded from Coverage (Both Reports)

The following are **auto-generated code** with no hand-written logic, excluded from all coverage reports:

- `R.class`, `BuildConfig`, `Manifest` — Android build-generated
- `*_Factory`, `*_MembersInjector`, `Hilt_*`, `Dagger*` — Hilt/Dagger dependency injection generated
- `*_HiltModules`, `*_GeneratedInjector`, `*_ComponentTreeDeps` — Hilt component wiring
- `databinding/*` — ViewBinding generated classes
- `*Application` — Application bootstrap class
- `network/api/*` — Retrofit interface definitions (no implementation logic)

---

## 4. Code Quality Checks

Three static analysis tools are configured to enforce code quality and style consistency.

### 4.1 ktlint — Kotlin Code Style

Enforces the official Kotlin coding conventions and Android Kotlin style guide.

```bash
cd mobile
./gradlew ktlintCheck
```

Auto-fix formatting issues:
```bash
./gradlew ktlintFormat
```

### 4.2 Android Lint — Bug & Performance Detection

Android's built-in static analysis that detects potential bugs, security issues, performance problems, and accessibility concerns.

```bash
cd mobile
./gradlew lintLocalDebug
```

**Report location:**
```
app/build/reports/lint-results-localDebug.html
```

#### Android Lint Results Summary

The latest lint scan reports **0 errors and 177 warnings**. Lint analysis on test sources is disabled due to a known AGP bug with Hilt/FIR resolution. All warnings have been reviewed and are acceptable for the current project scope. Below is the breakdown and justification for each category:

| Warning | Count | Justification |
|---|---|---|
| **HardcodedText** | 85 | UI strings are hardcoded directly in XML layouts instead of using `strings.xml`. This is acceptable because SmartSusChef is a B2B application targeting the Singapore market with no internationalization (i18n) requirement in the current scope. Extracting strings would add overhead with no user-facing benefit. |
| **SetTextI18n** | 51 | Dynamic text is set programmatically using string concatenation (e.g., `"$value kg"`). Same justification as HardcodedText — no i18n requirement for this B2B tool. |
| **SmallSp** | 18 | Font size of `10sp` is used in the 7-day ingredient forecast grid table where column width is constrained. The small font is a deliberate design choice to fit daily quantities across 7 columns on screen. |
| **GradleDependency** | 13 | Some dependencies are not on the latest available version. Dependencies are intentionally pinned to tested, stable versions to avoid breaking changes during active development. Upgrades are done deliberately in dedicated dependency update cycles. |
| **UseCompoundDrawables** | 3 | Lint suggests replacing an `ImageView` + `TextView` pair with a compound drawable. The current layout structure is preferred for readability and flexibility. |
| **NestedWeights** | 2 | Nested `layout_weight` in LinearLayouts. The nesting is minimal (one level deep) and does not cause measurable performance impact for the affected screens. |
| **OldTargetApi** | 1 | `targetSdkVersion` is set to 35, which is current. This warning is informational and resolves when the next SDK level is released. |
| **AndroidGradlePluginVersion** | 1 | The Android Gradle Plugin is not the latest version. Pinned for build stability — same rationale as GradleDependency. |
| **InsecureBaseConfiguration** | 1 | The app allows cleartext (HTTP) traffic in its network security configuration. This is required for local development (`http://10.0.2.2:5001`) and the UAT environment which runs behind an AWS Application Load Balancer over HTTP. Production traffic uses the same ALB endpoint. |
| **Overdraw** | 1 | A root layout has a background that is also set by the theme. Minor rendering optimization that does not affect functionality or performance. |
| **AlwaysShowAction** | 1 | A menu item uses `app:showAsAction="always"`. This is intentional for the specific toolbar action. |

> **Note:** The build is configured with `abortOnError = true` in the lint block, meaning **any lint errors will fail the build**. Only warnings (non-blocking) are present, and all have been reviewed as documented above.

### 4.3 Detekt — Kotlin Static Analysis

Detects code smells, complexity issues, and potential bugs in Kotlin code.

```bash
cd mobile
./gradlew detekt
```

**Report location:**
```
app/build/reports/detekt/detekt.html
```

### Running All Code Quality Checks Together

```bash
cd mobile
./gradlew ktlintCheck lintLocalDebug detekt
```

---

## 5. Complete Verification

> **Do NOT run all tasks in a single command.** The full coverage report (`jacocoFullCoverageReport`) does not depend on instrumented tests. If instrumented tests fail or are skipped mid-command, the report will silently generate with only unit test data, producing misleadingly low coverage.

**Step 1: Clean, run unit tests, and code quality checks**
```bash
cd mobile
./gradlew clean testLocalDebugUnitTest jacocoTestReportDebug ktlintCheck lintLocalDebug detekt
```

**Step 2: Run instrumented tests (requires connected device or emulator)**
```bash
./gradlew connectedLocalDebugAndroidTest
```
> Verify this step completes successfully before proceeding.

**Step 3: Generate the full coverage report**
```bash
./gradlew jacocoFullCoverageReport
```

### Summary of All Report Locations

| Report | Location |
|---|---|
| Unit test results (pass/fail) | `app/build/reports/tests/testLocalDebugUnitTest/index.html` |
| Instrumented test results (pass/fail) | `app/build/reports/androidTests/connected/localDebug/index.html` |
| Unit test coverage (JaCoCo) | `app/build/reports/jacoco/jacocoTestReportDebug/html/index.html` |
| Full coverage (JaCoCo) | `app/build/reports/jacoco/jacocoFullCoverageReport/html/index.html` |
| Android Lint | `app/build/reports/lint-results-localDebug.html` |
| Detekt | `app/build/reports/detekt/detekt.html` |
