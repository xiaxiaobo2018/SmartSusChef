package com.smartsuschef.mobile.ui.wastage

import androidx.navigation.Navigation
import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.data.TokenManager
import com.smartsuschef.mobile.di.TestNetworkModule
import com.smartsuschef.mobile.network.dto.ItemWastageDto
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
class WastageDetailFragmentTest {
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var tokenManager: TokenManager

    @Inject
    lateinit var okHttpClient: OkHttpClient

    private lateinit var mockWebServer: MockWebServer
    private lateinit var okHttp3IdlingResource: OkHttp3IdlingResource
    private var scenario: ActivityScenario<DashboardActivity>? = null

    private val sampleBreakdown =
        arrayOf(
            ItemWastageDto(
                ingredientId = "i1",
                displayName = "Rice",
                unit = "kg",
                quantity = 2.0,
                carbonFootprint = 1.5,
            ),
            ItemWastageDto(
                ingredientId = "i2",
                displayName = "Chicken",
                unit = "kg",
                quantity = 1.0,
                carbonFootprint = 3.0,
            ),
        )

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

        mockWebServer.dispatcher = createDispatcher()
    }

    @After
    fun tearDown() {
        scenario?.close()
        IdlingRegistry.getInstance().unregister(okHttp3IdlingResource)
        mockWebServer.shutdown()
        tokenManager.clearSession()
    }

    private fun navigateToWastageDetail(
        date: String = TEST_DATE,
        breakdown: Array<ItemWastageDto> = sampleBreakdown,
    ) {
        scenario = ActivityScenario.launch(DashboardActivity::class.java)
        // Navigate to wastage tab first so the nav graph recognizes the path
        onView(withId(R.id.nav_wastage)).perform(click())
        scenario?.onActivity { activity ->
            val navController = Navigation.findNavController(activity, R.id.nav_host_fragment)
            val args =
                WastageDetailFragmentArgs(
                    date = date,
                    itemBreakdown = breakdown,
                ).toBundle()
            navController.navigate(R.id.wastageDetailFragment, args)
        }
    }

    @Test
    fun wastageDetail_displaysTitle() {
        navigateToWastageDetail()

        onView(withId(R.id.tvDetailTitle)).check(matches(isDisplayed()))
        onView(withId(R.id.tvDetailTitle)).check(
            matches(withText(containsString(TEST_DATE))),
        )
    }

    @Test
    fun wastageDetail_displaysPieChart() {
        navigateToWastageDetail()

        onView(withId(R.id.pieChartWastageBreakdown)).check(matches(isDisplayed()))
    }

    @Test
    fun wastageDetail_displaysWastageItemsList() {
        navigateToWastageDetail()

        onView(withId(R.id.rvWastedItems)).check(matches(isDisplayed()))
    }

    @Test
    fun wastageDetail_displaysSubtitle() {
        navigateToWastageDetail()

        onView(withId(R.id.tvWastageSubtitle)).check(matches(isDisplayed()))
        onView(withId(R.id.tvWastageSubtitle)).check(
            matches(withText(containsString("Carbon Footprint"))),
        )
    }

    @Test
    fun wastageDetail_withEmptyBreakdown_fragmentStillLoads() {
        navigateToWastageDetail(breakdown = emptyArray())

        onView(withId(R.id.tvDetailTitle)).check(matches(isDisplayed()))
        onView(withId(R.id.pieChartWastageBreakdown)).check(matches(isDisplayed()))
    }

    @Suppress("LongMethod")
    private fun createDispatcher(): Dispatcher {
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

                    path.contains("/api/wastage/trend") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                [
                                    {"date": "2026-02-10", "totalQuantity": 15.5, "totalCarbonFootprint": 3.2, "itemBreakdown": []}
                                ]
                                """.trimIndent(),
                            )
                            .addHeader("Content-Type", "application/json")

                    path.contains("/api/sales/trend") ->
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
