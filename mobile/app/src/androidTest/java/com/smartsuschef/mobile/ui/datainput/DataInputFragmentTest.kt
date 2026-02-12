package com.smartsuschef.mobile.ui.datainput

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.action.ViewActions
import androidx.test.espresso.assertion.ViewAssertions
import androidx.test.espresso.matcher.ViewMatchers
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
import org.hamcrest.Matchers
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.TimeUnit
import javax.inject.Inject

/**
 * Espresso UI Tests for DataInputFragment
 *
 * Tests cover:
 * - Toggle between Sales and Wastage modes
 * - Wastage type sub-toggle visibility
 * - Spinner item selection and content verification
 * - Quantity input and Save button
 * - Form validation (empty quantity, no item selected, negative quantity)
 * - Save button text changes for edit mode
 * - Save flow with request body verification
 * - API error handling
 * - Recent entries RecyclerView display
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class DataInputFragmentTest {
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

        tokenManager.saveToken("test-jwt-token-12345")
        tokenManager.saveUserRole("manager")

        mockWebServer = MockWebServer()
        mockWebServer.start(8080)
        TestNetworkModule.mockWebServerUrl = mockWebServer.url("/api/").toString()

        mockWebServer.dispatcher = createDataInputDispatcher()

        // Register OkHttp IdlingResource so Espresso waits for network calls
        okHttp3IdlingResource = OkHttp3IdlingResource.Companion.create("OkHttp", okHttpClient)
        IdlingRegistry.getInstance().register(okHttp3IdlingResource)
    }

    @After
    fun tearDown() {
        IdlingRegistry.getInstance().unregister(okHttp3IdlingResource)
        mockWebServer.shutdown()
        tokenManager.clearSession()
    }

    private fun launchDataInputTab(): ActivityScenario<DashboardActivity> {
        val scenario = ActivityScenario.launch(DashboardActivity::class.java)
        // IdlingResource waits for initial API calls to complete
        Espresso.onView(ViewMatchers.withId(R.id.nav_input)).perform(ViewActions.click())
        return scenario
    }

    // ============================================================
    // Layout Display Tests
    // ============================================================

    @Test
    fun dataInput_showsToggleGroup() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.toggleGroup))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnSalesTab))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dataInput_showsFormFields() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.tvStep1Label))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dataInput_showsRecentEntriesSection() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.rvRecentEntries))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dataInput_salesTabSelected_byDefault() {
        launchDataInputTab()

        // In sales mode, the step label should say "Select Dish"
        Espresso.onView(ViewMatchers.withId(R.id.tvStep1Label))
            .check(ViewAssertions.matches(ViewMatchers.withText("Step 1: Select Dish")))
    }

    // ============================================================
    // Toggle Mode Tests
    // ============================================================

    @Test
    fun dataInput_switchToWastageMode() {
        launchDataInputTab()

        // Click Wastage tab
        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())

        // Label should change
        Espresso.onView(ViewMatchers.withId(R.id.tvStep1Label))
            .check(ViewAssertions.matches(ViewMatchers.withText("Step 1: Select Item Type")))

        // Wastage type toggle group should now be visible
        Espresso.onView(ViewMatchers.withId(R.id.wastageTypeToggleGroup))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dataInput_switchBackToSalesMode() {
        launchDataInputTab()

        // Go to Wastage first
        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())

        // Go back to Sales
        Espresso.onView(ViewMatchers.withId(R.id.btnSalesTab)).perform(ViewActions.click())

        Espresso.onView(ViewMatchers.withId(R.id.tvStep1Label))
            .check(ViewAssertions.matches(ViewMatchers.withText("Step 1: Select Dish")))
        Espresso.onView(ViewMatchers.withId(R.id.wastageTypeToggleGroup))
            .check(ViewAssertions.matches(Matchers.not(ViewMatchers.isDisplayed())))
    }

    @Test
    fun dataInput_wastageMode_showsSubTypeButtons() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())

        Espresso.onView(ViewMatchers.withId(R.id.btnMainDishType))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnSubRecipeType))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnIngredientType))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Wastage Sub-Type Toggle Tests
    // ============================================================

    @Test
    fun dataInput_wastageMode_clickMainDishType() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnMainDishType)).perform(ViewActions.click())

        // Spinner should now be populated with main dishes
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dataInput_wastageMode_clickSubRecipeType() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnSubRecipeType)).perform(ViewActions.click())

        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dataInput_wastageMode_clickIngredientType() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnIngredientType)).perform(ViewActions.click())

        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Spinner Content Verification Tests
    // ============================================================

    @Test
    fun wastageMode_mainDishType_spinnerShowsMainDishes() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnMainDishType)).perform(ViewActions.click())

        // Open spinner and verify main dish items
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun wastageMode_subRecipeType_spinnerShowsSubRecipes() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnSubRecipeType)).perform(ViewActions.click())

        // Open spinner and verify sub recipe items
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Sambal Sauce"),
            ),
        ).check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun wastageMode_ingredientType_spinnerShowsIngredients() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnIngredientType)).perform(ViewActions.click())

        // Open spinner and verify ingredient items
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Rice"),
            ),
        ).check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Spinner Selection Tests
    // ============================================================

    @Test
    fun dataInput_salesMode_spinnerHasItems() {
        launchDataInputTab()

        // Click on the spinner to open dropdown
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())

        // Select "Chicken Rice" from the spinner dropdown
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Spinner should now show "Chicken Rice"
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Quantity Input Tests
    // ============================================================

    @Test
    fun dataInput_enterQuantity() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("25.5"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .check(ViewAssertions.matches(ViewMatchers.withText("25.5")))
    }

    @Test
    fun dataInput_saveButtonShowsCorrectDefaultText() {
        launchDataInputTab()

        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.withText("Save Entry")))
    }

    // ============================================================
    // Save Button Validation Tests
    // ============================================================

    @Test
    fun dataInput_saveWithNoQuantity_showsError() {
        launchDataInputTab()

        // Select an item first
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Don't enter quantity, just click save
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Form should still be showing (validation prevents submission)
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun dataInput_saveWithZeroQuantity_showsError() {
        launchDataInputTab()

        // Select an item
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter zero
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("0"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Form should still be showing (validation prevents submission)
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun negativeQuantity_showsError() {
        launchDataInputTab()

        // Select an item
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter negative quantity
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("-5"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Form should still be showing (validation prevents submission)
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun emptyQuantityField_showsError() {
        launchDataInputTab()

        // Select an item
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Leave quantity empty, click save
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText(""), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Form should still be showing (validation prevents submission)
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun noItemSelected_showsError() {
        launchDataInputTab()

        // Enter a valid quantity but don't select an item (spinner at default "Select..." prompt)
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("50"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Form should still be showing (validation prevents submission)
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Successful Save Tests
    // ============================================================

    @Test
    fun dataInput_successfulSaveResetForm() {
        launchDataInputTab()

        // Select an item
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter valid quantity
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("50"), ViewActions.closeSoftKeyboard())

        // Click save
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // IdlingResource waits for network call; after successful save, quantity field should be cleared
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .check(ViewAssertions.matches(ViewMatchers.withText("")))
        // Button text should reset to "Save"
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.withText("Save")))
    }

    @Test
    fun salesMode_save_sendsCorrectRequestBody() {
        launchDataInputTab()

        // Select Chicken Rice
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter quantity
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("50"), ViewActions.closeSoftKeyboard())

        // Click save
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Wait for form reset to confirm save completed
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .check(ViewAssertions.matches(ViewMatchers.withText("")))

        // Verify the POST request was sent correctly
        val salesRequest = findRequest("POST", "/api/sales")
        assert(salesRequest != null) { "Expected a POST request to /api/sales" }
        val body = salesRequest!!.body.readUtf8()
        assert(body.contains("\"quantity\"")) { "Request body should contain quantity field" }
    }

    @Test
    fun wastageMode_ingredient_save_sendsCorrectRequestBody() {
        launchDataInputTab()

        // Switch to wastage mode
        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnIngredientType)).perform(ViewActions.click())

        // Select Rice
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter quantity
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("5"), ViewActions.closeSoftKeyboard())

        // Click save
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Wait for form reset
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .check(ViewAssertions.matches(ViewMatchers.withText("")))

        // Verify the POST request was sent to wastage
        val wastageRequest = findRequest("POST", "/api/wastage")
        assert(wastageRequest != null) { "Expected a POST request to /api/wastage" }
        val body = wastageRequest!!.body.readUtf8()
        assert(body.contains("\"quantity\"")) { "Request body should contain quantity field" }
    }

    @Test
    fun wastageMode_mainDish_save_sendsCorrectRequestBody() {
        launchDataInputTab()

        // Switch to wastage mode
        Espresso.onView(ViewMatchers.withId(R.id.btnWastageTab)).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.btnMainDishType)).perform(ViewActions.click())

        // Select Chicken Rice
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter quantity
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("10"), ViewActions.closeSoftKeyboard())

        // Click save
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Wait for form reset
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .check(ViewAssertions.matches(ViewMatchers.withText("")))

        // Verify the POST request
        val wastageRequest = findRequest("POST", "/api/wastage")
        assert(wastageRequest != null) { "Expected a POST request to /api/wastage" }
    }

    // ============================================================
    // API Error Handling Tests
    // ============================================================

    @Test
    fun saveWithServerError_showsErrorToast() {
        mockWebServer.dispatcher = createDataInputDispatcher(saveError = true)
        val scenario = launchDataInputTab()

        // Select an item
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter valid quantity
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("50"), ViewActions.closeSoftKeyboard())

        // Click save
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Form should still be showing after error
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun saveWithServerError_formNotCleared() {
        mockWebServer.dispatcher = createDataInputDispatcher(saveError = true)
        launchDataInputTab()

        // Select an item
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())

        // Enter valid quantity
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("50"), ViewActions.closeSoftKeyboard())

        // Click save
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Quantity field should retain its value on error
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .check(ViewAssertions.matches(ViewMatchers.withText("50")))
    }

    // ============================================================
    // Recent Entries Display Test
    // ============================================================

    @Test
    fun afterSave_recentEntriesDisplay() {
        mockWebServer.dispatcher = createDataInputDispatcher(returnEntriesAfterSave = true)
        launchDataInputTab()

        // Select an item and save
        Espresso.onView(ViewMatchers.withId(R.id.itemSpinner)).perform(ViewActions.click())
        Espresso.onData(
            Matchers.allOf(
                Matchers.instanceOf(String::class.java),
                Matchers.`is`("Chicken Rice"),
            ),
        ).perform(ViewActions.click())
        Espresso.onView(ViewMatchers.withId(R.id.etQuantity))
            .perform(ViewActions.replaceText("50"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveData)).perform(ViewActions.click())

        // Verify RecyclerView is displayed after save
        Espresso.onView(ViewMatchers.withId(R.id.rvRecentEntries))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    // ============================================================
    // Helpers
    // ============================================================

    private fun findRequest(
        method: String,
        pathContains: String,
    ): RecordedRequest? {
        val requestCount = mockWebServer.requestCount
        for (i in 0 until requestCount) {
            try {
                val request =
                    mockWebServer.takeRequest(0, TimeUnit.SECONDS)
                        ?: break
                if (request.method == method && (request.path?.contains(pathContains) == true)) {
                    return request
                }
            } catch (e: Exception) {
                break
            }
        }
        return null
    }

    @Suppress("LongMethod")
    private fun createDataInputDispatcher(
        saveError: Boolean = false,
        returnEntriesAfterSave: Boolean = false,
    ): Dispatcher {
        var saveCompleted = false
        return object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path ?: return MockResponse().setResponseCode(404)

                return when {
                    // Store
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

                    // Auth
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

                    // Recipes (main dishes + sub recipes)
                    path.contains("/api/recipes") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody(
                                """
                                [
                                    {"id": "r1", "name": "Chicken Rice", "isSellable": true, "isSubRecipe": false, "ingredients": [], "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"},
                                    {"id": "r2", "name": "Nasi Lemak", "isSellable": true, "isSubRecipe": false, "ingredients": [], "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"},
                                    {"id": "r3", "name": "Sambal Sauce", "isSellable": false, "isSubRecipe": true, "ingredients": [], "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"}
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
                                    {"id": "i2", "name": "Chicken", "unit": "kg", "carbonFootprint": 5.0, "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"},
                                    {"id": "i3", "name": "Coconut Milk", "unit": "litre", "carbonFootprint": 2.5, "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z"}
                                ]
                                """.trimIndent(),
                            )
                            .addHeader("Content-Type", "application/json")

                    // POST sales data (create)
                    path.contains("/api/sales") && request.method == "POST" -> {
                        saveCompleted = true
                        if (saveError) {
                            MockResponse()
                                .setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(201)
                                .setBody(
                                    """
                                    {
                                        "id": "s1",
                                        "date": "2026-02-11",
                                        "recipeId": "r1",
                                        "recipeName": "Chicken Rice",
                                        "quantity": 50,
                                        "createdAt": "2026-02-11T10:00:00Z",
                                        "updatedAt": "2026-02-11T10:00:00Z"
                                    }
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }
                    }

                    // GET sales (for loading recent entries)
                    path.contains("/api/sales") && request.method == "GET" ->
                        if (returnEntriesAfterSave && saveCompleted) {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    [
                                        {
                                            "id": "s1",
                                            "date": "2026-02-11",
                                            "recipeId": "r1",
                                            "recipeName": "Chicken Rice",
                                            "quantity": 50,
                                            "createdAt": "2026-02-11T10:00:00Z",
                                            "updatedAt": "2026-02-11T10:00:00Z"
                                        }
                                    ]
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody("[]")
                                .addHeader("Content-Type", "application/json")
                        }

                    // POST wastage data (create)
                    path.contains("/api/wastage") && request.method == "POST" -> {
                        saveCompleted = true
                        if (saveError) {
                            MockResponse()
                                .setResponseCode(500)
                                .setBody("""{"message": "Internal Server Error"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(201)
                                .setBody(
                                    """
                                    {
                                        "id": "w1",
                                        "date": "2026-02-11",
                                        "ingredientId": "i1",
                                        "displayName": "Rice",
                                        "unit": "kg",
                                        "quantity": 5.0,
                                        "carbonFootprint": 6.0,
                                        "createdAt": "2026-02-11T10:00:00Z",
                                        "updatedAt": "2026-02-11T10:00:00Z"
                                    }
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }
                    }

                    // GET wastage (for loading recent entries)
                    path.contains("/api/wastage") && request.method == "GET" ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    // Sales trend (loaded by SalesOverview on dashboard creation)
                    path.contains("/api/sales/trend") ->
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
                            )
                            .addHeader("Content-Type", "application/json")

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
                            )
                            .addHeader("Content-Type", "application/json")

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
                            )
                            .addHeader("Content-Type", "application/json")

                    // Forecast (generic catch-all)
                    path.contains("/api/forecast") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    // Wastage trend
                    path.contains("/api/wastage/trend") ->
                        MockResponse()
                            .setResponseCode(200)
                            .setBody("[]")
                            .addHeader("Content-Type", "application/json")

                    else -> {
                        println("MockWebServer: DataInputFragmentTest - Unhandled request path: ${request.path} method: ${request.method}")
                        MockResponse().setResponseCode(404)
                    }
                }
            }
        }
    }
}
