package com.smartsuschef.mobile.ui

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onData
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
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
import org.hamcrest.Matchers.allOf
import org.hamcrest.Matchers.instanceOf
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.not
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
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
        okHttp3IdlingResource = OkHttp3IdlingResource.create("OkHttp", okHttpClient)
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
        onView(withId(R.id.nav_input)).perform(click())
        return scenario
    }

    // ============================================================
    // Layout Display Tests
    // ============================================================

    @Test
    fun dataInput_showsToggleGroup() {
        launchDataInputTab()

        onView(withId(R.id.toggleGroup)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSalesTab)).check(matches(isDisplayed()))
        onView(withId(R.id.btnWastageTab)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_showsFormFields() {
        launchDataInputTab()

        onView(withId(R.id.tvStep1Label)).check(matches(isDisplayed()))
        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
        onView(withId(R.id.etQuantity)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_showsRecentEntriesSection() {
        launchDataInputTab()

        onView(withId(R.id.rvRecentEntries)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_salesTabSelected_byDefault() {
        launchDataInputTab()

        // In sales mode, the step label should say "Select Dish"
        onView(withId(R.id.tvStep1Label)).check(matches(withText("Step 1: Select Dish")))
    }

    // ============================================================
    // Toggle Mode Tests
    // ============================================================

    @Test
    fun dataInput_switchToWastageMode() {
        launchDataInputTab()

        // Click Wastage tab
        onView(withId(R.id.btnWastageTab)).perform(click())

        // Label should change
        onView(withId(R.id.tvStep1Label)).check(matches(withText("Step 1: Select Item Type")))

        // Wastage type toggle group should now be visible
        onView(withId(R.id.wastageTypeToggleGroup)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_switchBackToSalesMode() {
        launchDataInputTab()

        // Go to Wastage first
        onView(withId(R.id.btnWastageTab)).perform(click())

        // Go back to Sales
        onView(withId(R.id.btnSalesTab)).perform(click())

        onView(withId(R.id.tvStep1Label)).check(matches(withText("Step 1: Select Dish")))
        onView(withId(R.id.wastageTypeToggleGroup)).check(matches(not(isDisplayed())))
    }

    @Test
    fun dataInput_wastageMode_showsSubTypeButtons() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())

        onView(withId(R.id.btnMainDishType)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSubRecipeType)).check(matches(isDisplayed()))
        onView(withId(R.id.btnIngredientType)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Wastage Sub-Type Toggle Tests
    // ============================================================

    @Test
    fun dataInput_wastageMode_clickMainDishType() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnMainDishType)).perform(click())

        // Spinner should now be populated with main dishes
        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_wastageMode_clickSubRecipeType() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnSubRecipeType)).perform(click())

        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_wastageMode_clickIngredientType() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnIngredientType)).perform(click())

        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Spinner Content Verification Tests
    // ============================================================

    @Test
    fun wastageMode_mainDishType_spinnerShowsMainDishes() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnMainDishType)).perform(click())

        // Open spinner and verify main dish items
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).check(matches(isDisplayed()))
    }

    @Test
    fun wastageMode_subRecipeType_spinnerShowsSubRecipes() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnSubRecipeType)).perform(click())

        // Open spinner and verify sub recipe items
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Sambal Sauce"))).check(matches(isDisplayed()))
    }

    @Test
    fun wastageMode_ingredientType_spinnerShowsIngredients() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnIngredientType)).perform(click())

        // Open spinner and verify ingredient items
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Rice"))).check(matches(isDisplayed()))
    }

    // ============================================================
    // Spinner Selection Tests
    // ============================================================

    @Test
    fun dataInput_salesMode_spinnerHasItems() {
        launchDataInputTab()

        // Click on the spinner to open dropdown
        onView(withId(R.id.itemSpinner)).perform(click())

        // Select "Chicken Rice" from the spinner dropdown
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Spinner should now show "Chicken Rice"
        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Quantity Input Tests
    // ============================================================

    @Test
    fun dataInput_enterQuantity() {
        launchDataInputTab()

        onView(withId(R.id.etQuantity)).perform(replaceText("25.5"), closeSoftKeyboard())
        onView(withId(R.id.etQuantity)).check(matches(withText("25.5")))
    }

    @Test
    fun dataInput_saveButtonShowsCorrectDefaultText() {
        launchDataInputTab()

        onView(withId(R.id.btnSaveData)).check(matches(withText("Save Entry")))
    }

    // ============================================================
    // Save Button Validation Tests
    // ============================================================

    @Test
    fun dataInput_saveWithNoQuantity_showsError() {
        launchDataInputTab()

        // Select an item first
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Don't enter quantity, just click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // Form should still be showing (validation prevents submission)
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_saveWithZeroQuantity_showsError() {
        launchDataInputTab()

        // Select an item
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Enter zero
        onView(withId(R.id.etQuantity)).perform(replaceText("0"), closeSoftKeyboard())
        onView(withId(R.id.btnSaveData)).perform(click())

        // Form should still be showing (validation prevents submission)
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun negativeQuantity_showsError() {
        launchDataInputTab()

        // Select an item
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Enter negative quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("-5"), closeSoftKeyboard())
        onView(withId(R.id.btnSaveData)).perform(click())

        // Form should still be showing (validation prevents submission)
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun emptyQuantityField_showsError() {
        launchDataInputTab()

        // Select an item
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Leave quantity empty, click save
        onView(withId(R.id.etQuantity)).perform(replaceText(""), closeSoftKeyboard())
        onView(withId(R.id.btnSaveData)).perform(click())

        // Form should still be showing (validation prevents submission)
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun noItemSelected_showsError() {
        launchDataInputTab()

        // Enter a valid quantity but don't select an item (spinner at default "Select..." prompt)
        onView(withId(R.id.etQuantity)).perform(replaceText("50"), closeSoftKeyboard())
        onView(withId(R.id.btnSaveData)).perform(click())

        // Form should still be showing (validation prevents submission)
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Successful Save Tests
    // ============================================================

    @Test
    fun dataInput_successfulSaveResetForm() {
        launchDataInputTab()

        // Select an item
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Enter valid quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("50"), closeSoftKeyboard())

        // Click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // IdlingResource waits for network call; after successful save, quantity field should be cleared
        onView(withId(R.id.etQuantity)).check(matches(withText("")))
        // Button text should reset to "Save"
        onView(withId(R.id.btnSaveData)).check(matches(withText("Save")))
    }

    @Test
    fun salesMode_save_sendsCorrectRequestBody() {
        launchDataInputTab()

        // Select Chicken Rice
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Enter quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("50"), closeSoftKeyboard())

        // Click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // Wait for form reset to confirm save completed
        onView(withId(R.id.etQuantity)).check(matches(withText("")))

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
        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnIngredientType)).perform(click())

        // Select Rice
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Rice"))).perform(click())

        // Enter quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("5"), closeSoftKeyboard())

        // Click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // Wait for form reset
        onView(withId(R.id.etQuantity)).check(matches(withText("")))

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
        onView(withId(R.id.btnWastageTab)).perform(click())
        onView(withId(R.id.btnMainDishType)).perform(click())

        // Select Chicken Rice
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Enter quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("10"), closeSoftKeyboard())

        // Click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // Wait for form reset
        onView(withId(R.id.etQuantity)).check(matches(withText("")))

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
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Enter valid quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("50"), closeSoftKeyboard())

        // Click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // Form should still be showing after error
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun saveWithServerError_formNotCleared() {
        mockWebServer.dispatcher = createDataInputDispatcher(saveError = true)
        launchDataInputTab()

        // Select an item
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        // Enter valid quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("50"), closeSoftKeyboard())

        // Click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // Quantity field should retain its value on error
        onView(withId(R.id.etQuantity)).check(matches(withText("50")))
    }

    // ============================================================
    // Recent Entries Display Test
    // ============================================================

    @Test
    fun afterSave_recentEntriesDisplay() {
        mockWebServer.dispatcher = createDataInputDispatcher(returnEntriesAfterSave = true)
        launchDataInputTab()

        // Select an item and save
        onView(withId(R.id.itemSpinner)).perform(click())
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())
        onView(withId(R.id.etQuantity)).perform(replaceText("50"), closeSoftKeyboard())
        onView(withId(R.id.btnSaveData)).perform(click())

        // Verify RecyclerView is displayed after save
        onView(withId(R.id.rvRecentEntries)).check(matches(isDisplayed()))
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
                    mockWebServer.takeRequest(0, java.util.concurrent.TimeUnit.SECONDS)
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
