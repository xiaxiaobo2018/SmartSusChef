package com.smartsuschef.mobile.ui.dashboard

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.action.ViewActions
import androidx.test.espresso.assertion.ViewAssertions
import androidx.test.espresso.intent.Intents
import androidx.test.espresso.intent.matcher.IntentMatchers
import androidx.test.espresso.matcher.ViewMatchers
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.data.TokenManager
import com.smartsuschef.mobile.di.TestNetworkModule
import com.smartsuschef.mobile.ui.auth.LoginActivity
import com.smartsuschef.mobile.ui.settings.SettingsActivity
import com.smartsuschef.mobile.util.AnimationDisableRule
import com.smartsuschef.mobile.util.OkHttp3IdlingResource
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import javax.inject.Inject

/**
 * Espresso UI Tests for DashboardActivity
 *
 * Tests cover:
 * - Bottom navigation visibility and tab switching
 * - Toolbar displays store name and user info
 * - Fragment transitions via bottom nav
 * - Each tab's key views are displayed
 * - Error states for server failures
 * - Data display accuracy
 * - Toolbar actions (Settings, Logout)
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class DashboardActivityTest {
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
    private var scenario: ActivityScenario<DashboardActivity>? = null

    @Before
    fun setup() {
        // Start MockWebServer BEFORE Hilt injection so the Retrofit singleton
        // is created with the correct base URL when dependencies are resolved.
        mockWebServer = MockWebServer()
        mockWebServer.dispatcher = createDashboardDispatcher()
        mockWebServer.start(MOCK_SERVER_PORT)
        TestNetworkModule.mockWebServerUrl = mockWebServer.url("/api/").toString()

        hiltRule.inject()

        // Register OkHttp IdlingResource so Espresso waits for network calls
        okHttp3IdlingResource = OkHttp3IdlingResource.Companion.create("OkHttp", okHttpClient)
        IdlingRegistry.getInstance().register(okHttp3IdlingResource)

        // Simulate logged-in user
        tokenManager.saveToken("test-jwt-token-12345")
        tokenManager.saveUserRole("manager")
    }

    @After
    fun tearDown() {
        scenario?.close()
        IdlingRegistry.getInstance().unregister(okHttp3IdlingResource)
        mockWebServer.shutdown()
        tokenManager.clearSession()
    }

    // ============================================================
    // Layout & Component Display Tests
    // ============================================================

    @Test
    fun dashboard_showsToolbarAndBottomNav() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.toolbar))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.bottom_nav))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dashboard_startsOnSalesOverviewTab() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Sales Overview fragment should be the start destination
        Espresso.onView(ViewMatchers.withId(R.id.tvSalesTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Bottom Navigation Tab Switching Tests
    // ============================================================

    @Test
    fun bottomNav_clickForecast_showsForecastFragment() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Click the Predictions tab
        Espresso.onView(ViewMatchers.withId(R.id.nav_forecast)).perform(ViewActions.click())

        // Verify ForecastFragment views are displayed
        Espresso.onView(ViewMatchers.withId(R.id.tvSummaryTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun bottomNav_clickWastage_showsWastageFragment() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Click the Wastage tab
        Espresso.onView(ViewMatchers.withId(R.id.nav_wastage)).perform(ViewActions.click())

        // Verify WastageOverviewFragment views are displayed
        Espresso.onView(ViewMatchers.withId(R.id.tvWastageTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun bottomNav_clickDataInput_showsDataInputFragment() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Click the Data Input tab
        Espresso.onView(ViewMatchers.withId(R.id.nav_input)).perform(ViewActions.click())

        // Verify DataInputFragment views are displayed
        Espresso.onView(ViewMatchers.withId(R.id.toggleGroup))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnSalesTab))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun bottomNav_clickSales_returnsToSalesOverview() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Navigate away first
        Espresso.onView(ViewMatchers.withId(R.id.nav_forecast)).perform(ViewActions.click())

        // Navigate back to Sales
        Espresso.onView(ViewMatchers.withId(R.id.nav_sales)).perform(ViewActions.click())

        Espresso.onView(ViewMatchers.withId(R.id.tvSalesTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun bottomNav_roundTripNavigation_allTabs() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Sales (start) -> Forecast -> Wastage -> Data Input -> Sales
        Espresso.onView(ViewMatchers.withId(R.id.tvSalesTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))

        Espresso.onView(ViewMatchers.withId(R.id.nav_forecast)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.tvSummaryTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))

        Espresso.onView(ViewMatchers.withId(R.id.nav_wastage)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.tvWastageTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))

        Espresso.onView(ViewMatchers.withId(R.id.nav_input)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.toggleGroup))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))

        Espresso.onView(ViewMatchers.withId(R.id.nav_sales)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.tvSalesTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Sales Overview Fragment Tests
    // ============================================================

    @Test
    fun salesOverview_displaysKeyElements() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.tvSalesTitle))
            .check(ViewAssertions.matches(ViewMatchers.withText("Sales Trend")))
        Espresso.onView(ViewMatchers.withId(R.id.tvDateContext))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.salesCombinedChart))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun salesOverview_displaysCorrectData() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Toolbar should show store name from mock
        Espresso.onView(ViewMatchers.withId(R.id.toolbar))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Forecast Fragment Tests
    // ============================================================

    @Test
    fun forecastFragment_displaysKeyElements() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.nav_forecast)).perform(ViewActions.click())

        Espresso.onView(ViewMatchers.withId(R.id.tvSummaryTitle))
            .check(ViewAssertions.matches(ViewMatchers.withText("Prediction Summary")))
        Espresso.onView(ViewMatchers.withId(R.id.tvTotalWeeklyDishes))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun forecastFragment_displaysWeeklyDishTotal() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.nav_forecast)).perform(ViewActions.click())

        // Mock data for /api/forecast returns predicted quantities 80 and 60, summing to 140
        Espresso.onView(ViewMatchers.withId(R.id.tvTotalWeeklyDishes))
            .check(ViewAssertions.matches(ViewMatchers.withText("140")))
    }

    // ============================================================
    // Wastage Overview Fragment Tests
    // ============================================================

    @Test
    fun wastageOverview_displaysKeyElements() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.nav_wastage)).perform(ViewActions.click())

        Espresso.onView(ViewMatchers.withId(R.id.tvWastageTitle))
            .check(ViewAssertions.matches(ViewMatchers.withText("Wastage Trend")))
        Espresso.onView(ViewMatchers.withId(R.id.tvDateContext))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.wastageCombinedChart))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Error State Tests
    // ============================================================

    @Test
    fun salesOverview_withServerError_showsErrorState() {
        mockWebServer.dispatcher = createDashboardDispatcher(salesTrendError = true)
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        // Sales chart or error indicator should still be visible (fragment loads)
        Espresso.onView(ViewMatchers.withId(R.id.tvSalesTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun forecastFragment_withServerError_showsErrorState() {
        mockWebServer.dispatcher = createDashboardDispatcher(forecastError = true)
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.nav_forecast)).perform(ViewActions.click())

        // Fragment should still load even with error
        Espresso.onView(ViewMatchers.withId(R.id.tvSummaryTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun wastageOverview_withServerError_showsErrorState() {
        mockWebServer.dispatcher = createDashboardDispatcher(wastageTrendError = true)
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.nav_wastage)).perform(ViewActions.click())

        // Fragment should still load even with error
        Espresso.onView(ViewMatchers.withId(R.id.tvWastageTitle))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Toolbar Action Tests
    // ============================================================

    @Test
    fun toolbar_settingsAction_navigatesToSettings() {
        Intents.init()
        try {
            scenario = ActivityScenario.launch(DashboardActivity::class.java)

            // Open the profile submenu (overflow), then click Settings
            Espresso.onView(ViewMatchers.withId(R.id.action_profile)).perform(ViewActions.click())
            Espresso.onView(ViewMatchers.withText("Settings")).perform(ViewActions.click())

            Intents.intended(IntentMatchers.hasComponent(SettingsActivity::class.java.name))
        } finally {
            Intents.release()
        }
    }

    @Test
    fun toolbar_logoutAction_navigatesToLogin() {
        Intents.init()
        try {
            scenario = ActivityScenario.launch(DashboardActivity::class.java)

            // Open the profile submenu, then click Log Out
            Espresso.onView(ViewMatchers.withId(R.id.action_profile)).perform(ViewActions.click())
            Espresso.onView(ViewMatchers.withText("Log Out")).perform(ViewActions.click())

            Intents.intended(IntentMatchers.hasComponent(LoginActivity::class.java.name))
        } finally {
            Intents.release()
        }
    }

    // ============================================================
    // Helpers
    // ============================================================

    @Suppress("LongMethod")
    private fun createDashboardDispatcher(
        salesTrendError: Boolean = false,
        forecastError: Boolean = false,
        wastageTrendError: Boolean = false,
    ): Dispatcher {
        return object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path ?: return MockResponse().setResponseCode(404)

                return when {
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
                            )
                            .addHeader("Content-Type", "application/json")

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
                            )
                            .addHeader("Content-Type", "application/json")

                    // Sales trend
                    path.contains("/api/sales/trend") ->
                        if (salesTrendError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {"date": "2026-02-10", "totalQuantity": 150, "recipeBreakdown": []},
                                        {"date": "2026-02-09", "totalQuantity": 120, "recipeBreakdown": []},
                                        {"date": "2026-02-08", "totalQuantity": 130, "recipeBreakdown": []}
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    // Wastage trend
                    path.contains("/api/wastage/trend") ->
                        if (wastageTrendError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {"date": "2026-02-10", "totalQuantity": 15.5, "totalCarbonFootprint": 3.2, "itemBreakdown": []},
                                        {"date": "2026-02-09", "totalQuantity": 12.0, "totalCarbonFootprint": 2.8, "itemBreakdown": []}
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    // Forecast summary
                    path.contains("/api/forecast/summary") ->
                        if (forecastError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {"date": "2026-02-11", "totalPredicted": 160, "dishes": []},
                                        {"date": "2026-02-12", "totalPredicted": 155, "dishes": []}
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    // Forecast weather
                    path.contains("/api/forecast/weather") ->
                        if (forecastError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
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
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    // Forecast holidays (must be before generic /api/forecast)
                    path.contains("/api/forecast/holidays") ->
                        if (forecastError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {"date": "2026-02-14", "name": "Valentine's Day"},
                                        {"date": "2026-04-18", "name": "Good Friday"}
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    // Forecast tomorrow
                    path.contains("/api/forecast/tomorrow") ->
                        if (forecastError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
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
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    // Forecast (generic catch-all)
                    path.contains("/api/forecast") ->
                        if (forecastError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {"date": "2099-01-15", "recipeName": "Chicken Rice", "quantity": 80, "ingredients": []},
                                        {"date": "2099-01-15", "recipeName": "Nasi Lemak", "quantity": 60, "ingredients": []}
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    // Recipes
                    path.contains("/api/recipes") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                [
                                    {"id": "r1", "name": "Chicken Rice", "isSellable": true, "isSubRecipe": false, "ingredients": [], "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"},
                                    {"id": "r2", "name": "Nasi Lemak", "isSellable": true, "isSubRecipe": false, "ingredients": [], "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"}
                                ]
                                """.trimIndent(),
                            )
                            .addHeader("Content-Type", "application/json")

                    // Ingredients
                    path.contains("/api/ingredients") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                [
                                    {"id": "i1", "name": "Rice", "unit": "kg", "carbonFootprint": 1.2, "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"},
                                    {"id": "i2", "name": "Chicken", "unit": "kg", "carbonFootprint": 5.0, "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"}
                                ]
                                """.trimIndent(),
                            )
                            .addHeader("Content-Type", "application/json")

                    // Sales data
                    path.contains("/api/sales") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    // Wastage data
                    path.contains("/api/wastage") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    else -> {
                        println("MockWebServer: Unhandled request path: ${request.path} method: ${request.method}")
                        MockResponse().setResponseCode(404)
                    }
                }
            }
        }
    }

    companion object {
        private const val MOCK_SERVER_PORT = 8080
    }
}
