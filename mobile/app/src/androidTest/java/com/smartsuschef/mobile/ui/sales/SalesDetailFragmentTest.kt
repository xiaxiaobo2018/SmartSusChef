package com.smartsuschef.mobile.ui.sales

import androidx.core.os.bundleOf
import androidx.navigation.Navigation
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
import com.smartsuschef.mobile.util.AnimationDisableRule
import com.smartsuschef.mobile.util.CustomMatchers.hasItemCount
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
class SalesDetailFragmentTest {
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

    private fun navigateToSalesDetail(date: String = TEST_DATE) {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)
        scenario?.onActivity { activity ->
            val navController = Navigation.findNavController(activity, R.id.nav_host_fragment)
            navController.navigate(
                R.id.salesDetailFragment,
                bundleOf("date" to date),
            )
        }
    }

    @Test
    fun salesDetail_displaysTitle() {
        mockWebServer.dispatcher = createDispatcher()
        navigateToSalesDetail()

        onView(withId(R.id.tvDetailTitle)).check(matches(isDisplayed()))
        onView(withId(R.id.tvDetailTitle)).check(
            matches(withText(containsString(TEST_DATE))),
        )
    }

    @Test
    fun salesDetail_displaysPieChart() {
        mockWebServer.dispatcher = createDispatcher()
        navigateToSalesDetail()

        onView(withId(R.id.pieChartDishBreakdown)).check(matches(isDisplayed()))
    }

    @Test
    fun salesDetail_displaysIngredientList() {
        mockWebServer.dispatcher = createDispatcher()
        navigateToSalesDetail()

        onView(withId(R.id.rvIngredients)).check(matches(isDisplayed()))
    }

    @Test
    fun salesDetail_displaysSubtitle() {
        mockWebServer.dispatcher = createDispatcher()
        navigateToSalesDetail()

        onView(withId(R.id.tvSalesSubtitle)).check(matches(isDisplayed()))
        onView(withId(R.id.tvSalesSubtitle)).check(
            matches(withText(containsString("Total dishes sold"))),
        )
    }

    @Test
    fun salesDetail_ingredientListHasCorrectCount() {
        mockWebServer.dispatcher = createDispatcher()
        navigateToSalesDetail()

        onView(withId(R.id.rvIngredients)).check(matches(hasItemCount(2)))
    }

    @Test
    fun salesDetail_withEmptyRecipeSales_showsEmptyMessage() {
        mockWebServer.dispatcher = createDispatcher(emptyRecipeSales = true)
        navigateToSalesDetail()

        onView(withId(R.id.tvSalesSubtitle)).check(
            matches(withText("No dishes sold on this date")),
        )
    }

    @Test
    fun salesDetail_withServerError_fragmentStillLoads() {
        mockWebServer.dispatcher = createDispatcher(serverError = true)
        navigateToSalesDetail()

        onView(withId(R.id.tvDetailTitle)).check(matches(isDisplayed()))
    }

    @Suppress("LongMethod")
    private fun createDispatcher(
        emptyRecipeSales: Boolean = false,
        serverError: Boolean = false,
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

                    path.contains("/api/sales/ingredients") ->
                        if (serverError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {"ingredientId": "i1", "ingredientName": "Rice", "unit": "kg", "quantity": 10.0},
                                        {"ingredientId": "i2", "ingredientName": "Chicken", "unit": "kg", "quantity": 5.0}
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    path.contains("/api/sales/recipes") ->
                        if (serverError) {
                            MockResponse().setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else if (emptyRecipeSales) {
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
                                        {"recipeId": "r1", "recipeName": "Chicken Rice", "quantity": 80},
                                        {"recipeId": "r2", "recipeName": "Nasi Lemak", "quantity": 60}
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    path.contains("/api/sales/trend") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    path.contains("/api/forecast/weather") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                {
                                    "temperature": 28.5,
                                    "condition": "Sunny",
                                    "description": "Clear skies",
                                    "humidity": 65
                                }
                                """.trimIndent(),
                            )
                            .addHeader("Content-Type", "application/json")

                    path.contains("/api/forecast/holidays") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

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
        private const val TEST_DATE = "2026-02-10"
    }
}
