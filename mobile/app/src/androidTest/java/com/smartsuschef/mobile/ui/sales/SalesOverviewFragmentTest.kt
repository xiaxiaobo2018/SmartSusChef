package com.smartsuschef.mobile.ui.sales

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.data.TokenManager
import com.smartsuschef.mobile.di.TestNetworkModule
import com.smartsuschef.mobile.ui.dashboard.DashboardActivity
import com.smartsuschef.mobile.util.OkHttp3IdlingResource
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.hamcrest.Matchers.containsString
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import javax.inject.Inject

@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class SalesOverviewFragmentTest {
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var tokenManager: TokenManager

    @Inject
    lateinit var okHttpClient: OkHttpClient

    private lateinit var mockWebServer: MockWebServer
    private lateinit var okHttp3IdlingResource: OkHttp3IdlingResource
    private var scenario: ActivityScenario<DashboardActivity>? = null

    @Before
    fun setup() {
        mockWebServer = MockWebServer()
        mockWebServer.start(MOCK_SERVER_PORT)
        TestNetworkModule.mockWebServerUrl = mockWebServer.url("/api/").toString()

        hiltRule.inject()

        okHttp3IdlingResource = OkHttp3IdlingResource.create("OkHttp", okHttpClient)
        IdlingRegistry.getInstance().register(okHttp3IdlingResource)

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

    @Test
    fun salesOverview_displaysWeatherCard() {
        mockWebServer.dispatcher = createDispatcher()
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvWeatherCondition)).check(matches(isDisplayed()))
        onView(withId(R.id.tvWeatherDescription)).check(matches(isDisplayed()))
        onView(withId(R.id.tvWeatherHumidity)).check(matches(isDisplayed()))
        onView(withId(R.id.ivWeatherIcon)).check(matches(isDisplayed()))
    }

    @Test
    fun salesOverview_displaysWeatherData() {
        mockWebServer.dispatcher = createDispatcher()
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvWeatherCondition)).check(matches(withText("Partly Cloudy")))
        onView(withId(R.id.tvWeatherHumidity)).check(matches(withText("75%")))
    }

    @Test
    fun salesOverview_displaysHolidays() {
        mockWebServer.dispatcher = createDispatcher()
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.llHolidaysList)).check(matches(isDisplayed()))
    }

    @Test
    fun salesOverview_displaysChart() {
        mockWebServer.dispatcher = createDispatcher()
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.salesCombinedChart)).check(matches(isDisplayed()))
    }

    @Test
    fun salesOverview_displaysSubtitle() {
        mockWebServer.dispatcher = createDispatcher()
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvSalesSubtitle)).check(matches(isDisplayed()))
        onView(withId(R.id.tvSalesSubtitle)).check(matches(withText(containsString("Average"))))
    }

    @Test
    fun salesOverview_displaysFilterDropdown() {
        mockWebServer.dispatcher = createDispatcher()
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvDateContext)).check(matches(isDisplayed()))
        onView(withId(R.id.tvDateContext)).check(matches(withText("Last 7 Days")))
    }

    @Test
    fun salesOverview_displaysClickHint() {
        mockWebServer.dispatcher = createDispatcher()
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvClickHint)).check(matches(isDisplayed()))
    }

    @Test
    fun salesOverview_weatherError_showsUnavailable() {
        mockWebServer.dispatcher = createDispatcher(weatherError = true)
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvWeatherCondition)).check(matches(withText("Unavailable")))
    }

    @Test
    fun salesOverview_withSalesError_fragmentStillLoads() {
        mockWebServer.dispatcher = createDispatcher(salesTrendError = true)
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvSalesTitle)).check(matches(isDisplayed()))
        onView(withId(R.id.tvWeatherCondition)).check(matches(isDisplayed()))
    }

    @Test
    fun salesOverview_holidaysError_showsFallbackText() {
        mockWebServer.dispatcher = createDispatcher(holidaysError = true)
        scenario = ActivityScenario.launch(DashboardActivity::class.java)

        onView(withId(R.id.tvNoHolidays)).check(matches(isDisplayed()))
        onView(withId(R.id.tvNoHolidays)).check(matches(withText("Could not load events")))
    }

    @Suppress("LongMethod")
    private fun createDispatcher(
        salesTrendError: Boolean = false,
        weatherError: Boolean = false,
        holidaysError: Boolean = false,
    ): Dispatcher {
        return object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path ?: return MockResponse().setResponseCode(404)

                return when {
                    path.contains("/api/store/status") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("""{"isSetupComplete": true}""")
                            .addHeader("Content-Type", "application/json")

                    path.contains("/api/store") && !path.contains("status") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                {
                                    "id": 1,
                                    "companyName": "Test Store",
                                    "uen": "REG-001",
                                    "storeName": "Test Store",
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

                    path.contains("/api/auth/me") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                {
                                    "id": "user-001",
                                    "username": "admin",
                                    "name": "Admin User",
                                    "email": "admin@test.com",
                                    "role": "manager",
                                    "status": "Active",
                                    "createdAt": "2026-01-01T00:00:00Z",
                                    "updatedAt": "2026-01-01T00:00:00Z"
                                }
                                """.trimIndent(),
                            )
                            .addHeader("Content-Type", "application/json")

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

                    path.contains("/api/forecast/weather") ->
                        if (weatherError) {
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

                    path.contains("/api/forecast/holidays") ->
                        if (holidaysError) {
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

                    path.contains("/api/forecast") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    else ->
                        MockResponse().setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")
                }
            }
        }
    }

    companion object {
        private const val MOCK_SERVER_PORT = 8080
    }
}
