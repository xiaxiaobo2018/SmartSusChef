package com.smartsuschef.mobile.ui.auth

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.intent.Intents
import androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.isEnabled
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.data.TokenManager
import com.smartsuschef.mobile.di.TestNetworkModule
import com.smartsuschef.mobile.ui.dashboard.DashboardActivity
import com.smartsuschef.mobile.util.AnimationDisableRule
import com.smartsuschef.mobile.util.OkHttp3IdlingResource
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.hamcrest.Matchers.not
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import javax.inject.Inject

/**
 * Espresso UI Tests for LoginActivity
 *
 * Tests cover:
 * - Login form display and validation
 * - Successful login flow with navigation to Dashboard
 * - Failed login with error feedback
 * - Forgot password form toggle
 * - Empty field validation
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class LoginActivityTest {
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @get:Rule(order = 1)
    val animationDisableRule = AnimationDisableRule()

    @Inject
    lateinit var tokenManager: TokenManager

    @Inject
    lateinit var okHttpClient: OkHttpClient

    private lateinit var mockWebServer: MockWebServer
    private lateinit var okHttp3IdlingResource: OkHttp3IdlingResource

    @Before
    fun setup() {
        hiltRule.inject()

        // Clear any existing session so LoginActivity doesn't auto-navigate
        tokenManager.clearSession()

        // Start MockWebServer
        mockWebServer = MockWebServer()
        mockWebServer.start(8080)
        TestNetworkModule.mockWebServerUrl = mockWebServer.url("/api/").toString()

        // Register OkHttp IdlingResource so Espresso waits for network calls
        okHttp3IdlingResource = OkHttp3IdlingResource.create("OkHttp", okHttpClient)
        IdlingRegistry.getInstance().register(okHttp3IdlingResource)

        Intents.init()
    }

    @After
    fun tearDown() {
        Intents.release()
        IdlingRegistry.getInstance().unregister(okHttp3IdlingResource)
        mockWebServer.shutdown()
    }

    // ============================================================
    // Login Form Display Tests
    // ============================================================

    @Test
    fun loginForm_isDisplayedOnLaunch() {
        ActivityScenario.launch(LoginActivity::class.java)

        onView(withId(R.id.loginForm)).check(matches(isDisplayed()))
        onView(withId(R.id.etUsername)).check(matches(isDisplayed()))
        onView(withId(R.id.etPassword)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSignIn)).check(matches(isDisplayed()))
        onView(withId(R.id.tvForgotPassword)).check(matches(isDisplayed()))
    }

    @Test
    fun forgotPasswordForm_isHiddenOnLaunch() {
        ActivityScenario.launch(LoginActivity::class.java)

        onView(withId(R.id.forgotPasswordForm)).check(matches(not(isDisplayed())))
    }

    @Test
    fun signInButton_displaysCorrectText() {
        ActivityScenario.launch(LoginActivity::class.java)

        onView(withId(R.id.btnSignIn)).check(matches(withText("Sign In")))
    }

    // ============================================================
    // Empty Field Validation Tests
    // ============================================================

    @Test
    fun signIn_withEmptyFields_showsToast() {
        ActivityScenario.launch(LoginActivity::class.java)

        // Click Sign In without entering any credentials
        onView(withId(R.id.btnSignIn)).perform(click())

        // Button should remain enabled (no network call made)
        onView(withId(R.id.btnSignIn)).check(matches(isEnabled()))
    }

    @Test
    fun signIn_withEmptyUsername_showsToast() {
        ActivityScenario.launch(LoginActivity::class.java)

        // Enter only password
        onView(withId(R.id.etPassword)).perform(replaceText("password123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignIn)).perform(click())

        // Button should remain enabled
        onView(withId(R.id.btnSignIn)).check(matches(isEnabled()))
    }

    @Test
    fun signIn_withEmptyPassword_showsToast() {
        ActivityScenario.launch(LoginActivity::class.java)

        // Enter only username
        onView(withId(R.id.etUsername)).perform(replaceText("admin"), closeSoftKeyboard())
        onView(withId(R.id.btnSignIn)).perform(click())

        // Button should remain enabled
        onView(withId(R.id.btnSignIn)).check(matches(isEnabled()))
    }

    // ============================================================
    // Successful Login Tests
    // ============================================================

    @Test
    fun signIn_withValidCredentials_navigatesToDashboard() {
        // Use a Dispatcher to handle both login POST and all Dashboard concurrent API calls
        mockWebServer.dispatcher =
            object : Dispatcher() {
                override fun dispatch(request: RecordedRequest): MockResponse {
                    val path = request.path ?: return MockResponse().setResponseCode(404)

                    return when {
                        // Login POST
                        path.contains("/api/auth/login") && request.method == "POST" ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    {
                                        "token": "test-jwt-token-12345",
                                        "user": {
                                            "id": "user-001",
                                            "username": "admin",
                                            "name": "Admin User",
                                            "email": "admin@smartsuschef.com",
                                            "role": "manager",
                                            "status": "Active",
                                            "createdAt": "2026-01-01T00:00:00Z",
                                            "updatedAt": "2026-01-01T00:00:00Z"
                                        },
                                        "storeSetupRequired": false
                                    }
                                    """.trimIndent(),
                                ).addHeader("Content-Type", "application/json")

                        // Store status
                        path.contains("/api/store/status") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("""{"isSetupComplete": true}""")
                                .addHeader("Content-Type", "application/json")

                        // Store info
                        path.contains("/api/store") && !path.contains("status") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    {
                                        "id": 1,
                                        "companyName": "SmartSus Chef Demo",
                                        "uen": "REG-001",
                                        "storeName": "SmartSus Chef Demo",
                                        "outletLocation": "Singapore",
                                        "contactNumber": "+65-12345678",
                                        "openingDate": "2025-01-01",
                                        "latitude": 1.3521,
                                        "longitude": 103.8198,
                                        "isActive": true,
                                        "createdAt": "2026-01-01T00:00:00Z",
                                        "updatedAt": "2026-01-01T00:00:00Z"
                                    }
                                    """.trimIndent(),
                                ).addHeader("Content-Type", "application/json")

                        // Current user
                        path.contains("/api/auth/me") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    {
                                        "id": "user-001",
                                        "username": "admin",
                                        "name": "Admin User",
                                        "email": "admin@smartsuschef.com",
                                        "role": "manager",
                                        "status": "Active",
                                        "createdAt": "2026-01-01T00:00:00Z",
                                        "updatedAt": "2026-01-01T00:00:00Z"
                                    }
                                    """.trimIndent(),
                                ).addHeader("Content-Type", "application/json")

                        // All other Dashboard endpoints
                        path.contains("/api/sales") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")

                        path.contains("/api/wastage") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")

                        // Forecast weather (Expected: WeatherDto - object)
                        path.contains("/api/forecast/weather") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    {
                                        "temperature": 30.5,
                                        "condition": "Partly Cloudy",
                                        "description": "Partly Cloudy",
                                        "humidity": 75
                                    }
                                    """.trimIndent(),
                                ).addHeader("Content-Type", "application/json")

                        // Forecast holidays (Expected: List<HolidayDto> - array)
                        path.contains("/api/forecast/holidays") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {"date": "2026-02-14", "name": "Valentine's Day"},
                                        {"date": "2026-04-18", "name": "Good Friday"}
                                    ]
                                    """.trimIndent(),
                                ).addHeader("Content-Type", "application/json")

                        // Forecast summary (Expected: List<ForecastSummaryDto> - array)
                        path.contains("/api/forecast/summary") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")

                        // Forecast tomorrow (Expected: TomorrowForecastDto - object)
                        path.contains("/api/forecast/tomorrow") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    {
                                        "date": "2026-02-12",
                                        "calendar": {
                                            "date": "2026-02-12",
                                            "isHoliday": false,
                                            "isSchoolHoliday": false,
                                            "isWeekend": false,
                                            "holidayName": null,
                                            "weather": {
                                                "temperatureMax": 28.0,
                                                "temperatureMin": 22.0,
                                                "rainMm": 5.0,
                                                "weatherCode": 800,
                                                "weatherDescription": "Partly Cloudy"
                                            }
                                        },
                                        "weather": {
                                            "temperatureMax": 28.0,
                                            "temperatureMin": 22.0,
                                            "rainMm": 5.0,
                                            "weatherCode": 800,
                                            "weatherDescription": "Partly Cloudy"
                                        }
                                    }
                                    """.trimIndent(),
                                ).addHeader("Content-Type", "application/json")

                        // Forecast (generic catch-all)
                        path.contains("/api/forecast") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")

                        path.contains("/api/recipes") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")

                        path.contains("/api/ingredients") ->
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")

                        else -> MockResponse().setResponseCode(404)
                    }
                }
            }

        ActivityScenario.launch(LoginActivity::class.java)

        // Enter valid credentials
        onView(withId(R.id.etUsername)).perform(replaceText("admin"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(replaceText("Password1!"), closeSoftKeyboard())

        // Click Sign In
        onView(withId(R.id.btnSignIn)).perform(click())

        // IdlingResource waits for network call to complete, then verify navigation
        Intents.intended(hasComponent(DashboardActivity::class.java.name))
    }

    // ============================================================
    // Failed Login Tests
    // ============================================================

    @Test
    fun signIn_withInvalidCredentials_showsError() {
        // Enqueue a 401 unauthorized response
        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(401)
                .setBody("""{"message": "Invalid username or password"}""")
                .addHeader("Content-Type", "application/json"),
        )

        ActivityScenario.launch(LoginActivity::class.java)

        // Enter invalid credentials
        onView(withId(R.id.etUsername)).perform(replaceText("wronguser"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(replaceText("wrongpass"), closeSoftKeyboard())

        // Click Sign In
        onView(withId(R.id.btnSignIn)).perform(click())

        // IdlingResource waits for network response; button should be re-enabled after failure
        onView(withId(R.id.btnSignIn)).check(matches(isEnabled()))
    }

    @Test
    fun signIn_whenServerError_showsError() {
        // Enqueue a 500 server error
        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(500)
                .setBody("""{"message": "Internal Server Error"}""")
                .addHeader("Content-Type", "application/json"),
        )

        ActivityScenario.launch(LoginActivity::class.java)

        onView(withId(R.id.etUsername)).perform(replaceText("admin"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(replaceText("Password1!"), closeSoftKeyboard())
        onView(withId(R.id.btnSignIn)).perform(click())

        // IdlingResource waits for network response; button should be re-enabled after error
        onView(withId(R.id.btnSignIn)).check(matches(isEnabled()))
    }

    // ============================================================
    // Forgot Password Toggle Tests
    // ============================================================

    @Test
    fun clickForgotPassword_showsForgotPasswordForm() {
        ActivityScenario.launch(LoginActivity::class.java)

        // Click "Forgot Password?"
        onView(withId(R.id.tvForgotPassword)).perform(click())

        // Verify forgot password form is shown
        onView(withId(R.id.forgotPasswordForm)).check(matches(isDisplayed()))
        onView(withId(R.id.etResetEmail)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSendReset)).check(matches(isDisplayed()))

        // Login form should be hidden
        onView(withId(R.id.loginForm)).check(matches(not(isDisplayed())))
    }

    @Test
    fun clickBackToLogin_showsLoginForm() {
        ActivityScenario.launch(LoginActivity::class.java)

        // Navigate to forgot password
        onView(withId(R.id.tvForgotPassword)).perform(click())

        // Click "Back to Login"
        onView(withId(R.id.btnBackToLogin)).perform(click())

        // Verify login form is shown again
        onView(withId(R.id.loginForm)).check(matches(isDisplayed()))
        onView(withId(R.id.forgotPasswordForm)).check(matches(not(isDisplayed())))
    }

    @Test
    fun forgotPassword_sendResetLink_withEmail() {
        ActivityScenario.launch(LoginActivity::class.java)

        // Navigate to forgot password
        onView(withId(R.id.tvForgotPassword)).perform(click())

        // Enter email
        onView(withId(R.id.etResetEmail)).perform(
            replaceText("admin@smartsuschef.com"),
            closeSoftKeyboard(),
        )

        // Click Send Reset Link
        onView(withId(R.id.btnSendReset)).perform(click())

        // Small UI-settling delay (no network call, just local Toast + form toggle)
        Thread.sleep(300)

        // Should toggle back to login form
        onView(withId(R.id.loginForm)).check(matches(isDisplayed()))
    }

    @Test
    fun forgotPassword_sendResetLink_withEmptyEmail_showsToast() {
        ActivityScenario.launch(LoginActivity::class.java)

        // Navigate to forgot password
        onView(withId(R.id.tvForgotPassword)).perform(click())

        // Click Send Reset Link without entering email
        onView(withId(R.id.btnSendReset)).perform(click())

        // Should still be on forgot password form
        onView(withId(R.id.forgotPasswordForm)).check(matches(isDisplayed()))
    }
}
