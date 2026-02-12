package com.smartsuschef.mobile.ui.forecast

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.scrollTo
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
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
import org.hamcrest.Matchers.containsString
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import javax.inject.Inject

@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class ForecastFragmentTest {
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

    private fun launchAndNavigateToForecast() {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)
        onView(withId(R.id.nav_forecast)).perform(click())
    }

    @Test
    fun forecast_displaysPredictionSummaryCard() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.tvSummaryTitle)).check(matches(withText("Prediction Summary")))
        onView(withId(R.id.tvTotalWeeklyDishes)).check(matches(isDisplayed()))
    }

    @Test
    fun forecast_displaysWeeklyDishTotal() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.tvTotalWeeklyDishes)).check(matches(withText("140")))
    }

    @Test
    fun forecast_displaysSummaryChart() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.summaryCombinedChart)).check(matches(isDisplayed()))
    }

    @Test
    fun forecast_displaysDishForecastChart() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.dishForecastStackedChart)).perform(scrollTo()).check(matches(isDisplayed()))
    }

    @Test
    fun forecast_displaysDishesSubtitle() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.tvDishesSubtitle)).check(matches(isDisplayed()))
        onView(withId(R.id.tvDishesSubtitle)).check(
            matches(withText(containsString("dishes/day"))),
        )
    }

    @Test
    fun forecast_displaysIngredientForecastList() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.rvIngredientForecast)).perform(scrollTo()).check(matches(isDisplayed()))
    }

    @Test
    fun forecast_displaysAccuracyCard() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.tvAccuracy)).perform(scrollTo()).check(matches(isDisplayed()))
        onView(withId(R.id.tvAccuracyDiff)).perform(scrollTo()).check(matches(isDisplayed()))
    }

    @Test
    fun forecast_displaysComparisonChart() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.comparisonBarChart)).perform(scrollTo()).check(matches(isDisplayed()))
    }

    @Test
    fun forecast_withServerError_fragmentStillLoads() {
        mockWebServer.dispatcher = createDispatcher(forecastError = true)
        launchAndNavigateToForecast()

        onView(withId(R.id.tvSummaryTitle)).check(matches(isDisplayed()))
    }

    @Test
    fun forecast_emptyForecast_showsDashForAccuracy() {
        mockWebServer.dispatcher = createDispatcher(emptyForecast = true)
        launchAndNavigateToForecast()

        onView(withId(R.id.tvAccuracy)).check(matches(withText("\u2014")))
    }

    @Test
    fun forecast_accuracyShowsPercentage() {
        mockWebServer.dispatcher = createDispatcher()
        launchAndNavigateToForecast()

        onView(withId(R.id.tvAccuracy)).check(matches(withText(containsString("%"))))
    }

    @Suppress("LongMethod")
    private fun createDispatcher(
        forecastError: Boolean = false,
        emptyForecast: Boolean = false,
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
                            ).addHeader("Content-Type", "application/json")

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
                            ).addHeader("Content-Type", "application/json")

                    path.contains("/api/sales/trend") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                [
                                    {"date": "2026-02-09", "totalQuantity": 70, "recipeBreakdown": []},
                                    {"date": "2026-02-10", "totalQuantity": 65, "recipeBreakdown": []}
                                ]
                                """.trimIndent(),
                            ).addHeader("Content-Type", "application/json")

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

                    path.contains("/api/forecast/holidays") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    path.contains("/api/forecast/summary") ->
                        if (forecastError) {
                            MockResponse()
                                .setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")
                        }

                    path.contains("/api/forecast/tomorrow") ->
                        if (forecastError) {
                            MockResponse()
                                .setResponseCode(500)
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
                                ).addHeader("Content-Type", "application/json")
                        }

                    path.contains("/api/forecast") ->
                        if (forecastError) {
                            MockResponse()
                                .setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else if (emptyForecast) {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {
                                            "date": "2099-01-15",
                                            "recipeName": "Chicken Rice",
                                            "quantity": 80,
                                            "ingredients": [
                                                {"ingredientId": "i1", "name": "Rice", "unit": "kg", "quantity": 8.0},
                                                {"ingredientId": "i2", "name": "Chicken", "unit": "kg", "quantity": 16.0}
                                            ]
                                        },
                                        {
                                            "date": "2099-01-15",
                                            "recipeName": "Nasi Lemak",
                                            "quantity": 60,
                                            "ingredients": [
                                                {"ingredientId": "i1", "name": "Rice", "unit": "kg", "quantity": 6.0}
                                            ]
                                        },
                                        {
                                            "date": "2026-02-09",
                                            "recipeName": "Chicken Rice",
                                            "quantity": 75,
                                            "ingredients": []
                                        },
                                        {
                                            "date": "2026-02-10",
                                            "recipeName": "Chicken Rice",
                                            "quantity": 70,
                                            "ingredients": []
                                        }
                                    ]
                                    """.trimIndent(),
                                ).addHeader("Content-Type", "application/json")
                        }

                    path.contains("/api/wastage/trend") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    else ->
                        MockResponse()
                            .setResponseCode(200)
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
