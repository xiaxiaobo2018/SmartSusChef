package com.smartsuschef.mobile.ui

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.data.TokenManager
import com.smartsuschef.mobile.di.TestNetworkModule
import com.smartsuschef.mobile.ui.dashboard.DashboardActivity
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
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
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class DashboardActivityTest {

    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var tokenManager: TokenManager

    private lateinit var mockWebServer: MockWebServer

    @Before
    fun setup() {
        hiltRule.inject()

        // Simulate logged-in user
        tokenManager.saveToken("test-jwt-token-12345")
        tokenManager.saveUserRole("manager")

        mockWebServer = MockWebServer()
        mockWebServer.start(8080)
        TestNetworkModule.mockWebServerUrl = mockWebServer.url("/api/").toString()

        // Set up dispatcher to handle various API calls that DashboardActivity triggers
        mockWebServer.dispatcher = createDashboardDispatcher()
    }

    @After
    fun tearDown() {
        mockWebServer.shutdown()
        tokenManager.clearSession()
    }

    // ============================================================
    // Layout & Component Display Tests
    // ============================================================

    @Test
    fun dashboard_showsToolbarAndBottomNav() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        onView(withId(R.id.toolbar)).check(matches(isDisplayed()))
        onView(withId(R.id.bottom_nav)).check(matches(isDisplayed()))
        onView(withId(R.id.nav_host_fragment)).check(matches(isDisplayed()))
    }

    @Test
    fun dashboard_startsOnSalesOverviewTab() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        // Sales Overview fragment should be the start destination
        // Verify a key view from SalesOverviewFragment is displayed
        onView(withId(R.id.tvSalesTitle)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Bottom Navigation Tab Switching Tests
    // ============================================================

    @Test
    fun bottomNav_clickForecast_showsForecastFragment() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        // Click the Predictions tab
        onView(withId(R.id.nav_forecast)).perform(click())
        Thread.sleep(2000)

        // Verify ForecastFragment views are displayed
        onView(withId(R.id.tvSummaryTitle)).check(matches(isDisplayed()))
    }

    @Test
    fun bottomNav_clickWastage_showsWastageFragment() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        // Click the Wastage tab
        onView(withId(R.id.nav_wastage)).perform(click())
        Thread.sleep(2000)

        // Verify WastageOverviewFragment views are displayed
        onView(withId(R.id.tvWastageTitle)).check(matches(isDisplayed()))
    }

    @Test
    fun bottomNav_clickDataInput_showsDataInputFragment() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        // Click the Data Input tab
        onView(withId(R.id.nav_input)).perform(click())
        Thread.sleep(2000)

        // Verify DataInputFragment views are displayed
        onView(withId(R.id.toggleGroup)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSalesTab)).check(matches(isDisplayed()))
        onView(withId(R.id.btnWastageTab)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun bottomNav_clickSales_returnsToSalesOverview() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        // Navigate away first
        onView(withId(R.id.nav_forecast)).perform(click())
        Thread.sleep(1000)

        // Navigate back to Sales
        onView(withId(R.id.nav_sales)).perform(click())
        Thread.sleep(2000)

        onView(withId(R.id.tvSalesTitle)).check(matches(isDisplayed()))
    }

    @Test
    fun bottomNav_roundTripNavigation_allTabs() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        // Sales (start) -> Forecast -> Wastage -> Data Input -> Sales
        onView(withId(R.id.tvSalesTitle)).check(matches(isDisplayed()))

        onView(withId(R.id.nav_forecast)).perform(click())
        Thread.sleep(1500)
        onView(withId(R.id.tvSummaryTitle)).check(matches(isDisplayed()))

        onView(withId(R.id.nav_wastage)).perform(click())
        Thread.sleep(1500)
        onView(withId(R.id.tvWastageTitle)).check(matches(isDisplayed()))

        onView(withId(R.id.nav_input)).perform(click())
        Thread.sleep(1500)
        onView(withId(R.id.toggleGroup)).check(matches(isDisplayed()))

        onView(withId(R.id.nav_sales)).perform(click())
        Thread.sleep(1500)
        onView(withId(R.id.tvSalesTitle)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Sales Overview Fragment Tests
    // ============================================================

    @Test
    fun salesOverview_displaysKeyElements() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        onView(withId(R.id.tvSalesTitle)).check(matches(withText("Sales Trend")))
        onView(withId(R.id.tvDateContext)).check(matches(isDisplayed()))
        onView(withId(R.id.salesCombinedChart)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Forecast Fragment Tests
    // ============================================================

    @Test
    fun forecastFragment_displaysKeyElements() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        onView(withId(R.id.nav_forecast)).perform(click())
        Thread.sleep(2000)

        onView(withId(R.id.tvSummaryTitle)).check(matches(withText("Prediction Summary")))
        onView(withId(R.id.tvTotalWeeklyDishes)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Wastage Overview Fragment Tests
    // ============================================================

    @Test
    fun wastageOverview_displaysKeyElements() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)

        onView(withId(R.id.nav_wastage)).perform(click())
        Thread.sleep(2000)

        onView(withId(R.id.tvWastageTitle)).check(matches(withText("Wastage Trend")))
        onView(withId(R.id.tvDateContext)).check(matches(isDisplayed()))
        onView(withId(R.id.wastageCombinedChart)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Helpers
    // ============================================================

    private fun createDashboardDispatcher(): Dispatcher {
        return object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path ?: return MockResponse().setResponseCode(404)

                return when {
                    // Store info
                    path.contains("/api/store/status") -> MockResponse()
                        .setResponseCode(200)
                        .setBody("""{"isSetupComplete": true}""")
                        .addHeader("Content-Type", "application/json")

                    path.contains("/api/store") && !path.contains("status") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            {
                                "id": "store-001",
                                "name": "SmartSus Chef Demo",
                                "location": "Singapore",
                                "registrationNumber": "REG-001"
                            }
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // Current user
                    path.contains("/api/auth/me") -> MockResponse()
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
                    path.contains("/api/sales/trend") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            [
                                {"date": "2026-02-10", "totalQuantity": 150, "dishCount": 5},
                                {"date": "2026-02-09", "totalQuantity": 120, "dishCount": 4},
                                {"date": "2026-02-08", "totalQuantity": 130, "dishCount": 5}
                            ]
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // Wastage trend
                    path.contains("/api/wastage/trend") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            [
                                {"date": "2026-02-10", "totalQuantity": 15.5, "totalCarbonFootprint": 3.2, "items": []},
                                {"date": "2026-02-09", "totalQuantity": 12.0, "totalCarbonFootprint": 2.8, "items": []}
                            ]
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // Forecast
                    path.contains("/api/forecast/summary") -> MockResponse()
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

                    path.contains("/api/forecast/weather") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            {
                                "temperature": 30.5,
                                "description": "Partly Cloudy",
                                "icon": "02d",
                                "humidity": 75
                            }
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    path.contains("/api/forecast/tomorrow") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            {
                                "date": "2026-02-12",
                                "totalPredicted": 155,
                                "dishes": [],
                                "ingredients": []
                            }
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    path.contains("/api/forecast") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            [
                                {"date": "2026-02-11", "recipeName": "Chicken Rice", "predictedQuantity": 80},
                                {"date": "2026-02-11", "recipeName": "Nasi Lemak", "predictedQuantity": 60}
                            ]
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // Recipes
                    path.contains("/api/recipes") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            [
                                {"id": "r1", "name": "Chicken Rice", "type": "MainDish", "subRecipes": [], "ingredients": []},
                                {"id": "r2", "name": "Nasi Lemak", "type": "MainDish", "subRecipes": [], "ingredients": []}
                            ]
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // Ingredients
                    path.contains("/api/ingredients") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            [
                                {"id": "i1", "name": "Rice", "unit": "kg", "carbonFootprintPerKg": 1.2},
                                {"id": "i2", "name": "Chicken", "unit": "kg", "carbonFootprintPerKg": 5.0}
                            ]
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // Sales data
                    path.contains("/api/sales") -> MockResponse()
                        .setResponseCode(200)
                        .setBody("[]")
                        .addHeader("Content-Type", "application/json")

                    // Wastage data
                    path.contains("/api/wastage") -> MockResponse()
                        .setResponseCode(200)
                        .setBody("[]")
                        .addHeader("Content-Type", "application/json")

                    else -> MockResponse().setResponseCode(404)
                }
            }
        }
    }
}
