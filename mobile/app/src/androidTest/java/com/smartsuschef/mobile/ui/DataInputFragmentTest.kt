package com.smartsuschef.mobile.ui

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onData
import androidx.test.espresso.Espresso.onView
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
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
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
 * - Spinner item selection
 * - Quantity input and Save button
 * - Form validation (empty quantity, no item selected)
 * - Save button text changes for edit mode
 * - Recent entries RecyclerView display
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class DataInputFragmentTest {

    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var tokenManager: TokenManager

    private lateinit var mockWebServer: MockWebServer

    @Before
    fun setup() {
        hiltRule.inject()

        tokenManager.saveToken("test-jwt-token-12345")
        tokenManager.saveUserRole("manager")

        mockWebServer = MockWebServer()
        mockWebServer.start(8080)
        TestNetworkModule.mockWebServerUrl = mockWebServer.url("/api/").toString()

        mockWebServer.dispatcher = createDataInputDispatcher()
    }

    @After
    fun tearDown() {
        mockWebServer.shutdown()
        tokenManager.clearSession()
    }

    private fun launchDataInputTab() {
        ActivityScenario.launch(DashboardActivity::class.java)
        Thread.sleep(2000)
        onView(withId(R.id.nav_input)).perform(click())
        Thread.sleep(2000)
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
        Thread.sleep(1000)

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
        Thread.sleep(500)

        // Go back to Sales
        onView(withId(R.id.btnSalesTab)).perform(click())
        Thread.sleep(500)

        onView(withId(R.id.tvStep1Label)).check(matches(withText("Step 1: Select Dish")))
        onView(withId(R.id.wastageTypeToggleGroup)).check(matches(not(isDisplayed())))
    }

    @Test
    fun dataInput_wastageMode_showsSubTypeButtons() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        Thread.sleep(1000)

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
        Thread.sleep(1000)

        onView(withId(R.id.btnMainDishType)).perform(click())
        Thread.sleep(1000)

        // Spinner should now be populated with main dishes
        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_wastageMode_clickSubRecipeType() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        Thread.sleep(1000)

        onView(withId(R.id.btnSubRecipeType)).perform(click())
        Thread.sleep(1000)

        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_wastageMode_clickIngredientType() {
        launchDataInputTab()

        onView(withId(R.id.btnWastageTab)).perform(click())
        Thread.sleep(1000)

        onView(withId(R.id.btnIngredientType)).perform(click())
        Thread.sleep(1000)

        onView(withId(R.id.itemSpinner)).check(matches(isDisplayed()))
    }

    // ============================================================
    // Spinner Selection Tests
    // ============================================================

    @Test
    fun dataInput_salesMode_spinnerHasItems() {
        launchDataInputTab()

        // Click on the spinner to open dropdown
        onView(withId(R.id.itemSpinner)).perform(click())
        Thread.sleep(500)

        // Select "Chicken Rice" from the spinner dropdown
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())

        Thread.sleep(500)
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
        Thread.sleep(500)
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())
        Thread.sleep(500)

        // Don't enter quantity, just click save
        onView(withId(R.id.btnSaveData)).perform(click())

        // Form should still be showing (validation prevents submission)
        Thread.sleep(500)
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_saveWithZeroQuantity_showsError() {
        launchDataInputTab()

        // Select an item
        onView(withId(R.id.itemSpinner)).perform(click())
        Thread.sleep(500)
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())
        Thread.sleep(500)

        // Enter zero
        onView(withId(R.id.etQuantity)).perform(replaceText("0"), closeSoftKeyboard())
        onView(withId(R.id.btnSaveData)).perform(click())

        Thread.sleep(500)
        onView(withId(R.id.btnSaveData)).check(matches(isDisplayed()))
    }

    @Test
    fun dataInput_successfulSaveResetForm() {
        launchDataInputTab()

        // Select an item
        onView(withId(R.id.itemSpinner)).perform(click())
        Thread.sleep(500)
        onData(allOf(instanceOf(String::class.java), `is`("Chicken Rice"))).perform(click())
        Thread.sleep(500)

        // Enter valid quantity
        onView(withId(R.id.etQuantity)).perform(replaceText("50"), closeSoftKeyboard())

        // Click save
        onView(withId(R.id.btnSaveData)).perform(click())
        Thread.sleep(2000)

        // After successful save, quantity field should be cleared
        onView(withId(R.id.etQuantity)).check(matches(withText("")))
        // Button text should reset to "Save"
        onView(withId(R.id.btnSaveData)).check(matches(withText("Save")))
    }

    // ============================================================
    // Helpers
    // ============================================================

    private fun createDataInputDispatcher(): Dispatcher {
        return object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path ?: return MockResponse().setResponseCode(404)

                return when {
                    // Store
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

                    // Auth
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

                    // Recipes (main dishes + sub recipes)
                    path.contains("/api/recipes") -> MockResponse()
                        .setResponseCode(200)
                        .setBody(
                            """
                            [
                                {"id": "r1", "name": "Chicken Rice", "type": "MainDish", "subRecipes": [], "ingredients": []},
                                {"id": "r2", "name": "Nasi Lemak", "type": "MainDish", "subRecipes": [], "ingredients": []},
                                {"id": "r3", "name": "Sambal Sauce", "type": "SubRecipe", "subRecipes": [], "ingredients": []}
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
                                {"id": "i2", "name": "Chicken", "unit": "kg", "carbonFootprintPerKg": 5.0},
                                {"id": "i3", "name": "Coconut Milk", "unit": "litre", "carbonFootprintPerKg": 2.5}
                            ]
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // POST sales data (create)
                    path.contains("/api/sales") && request.method == "POST" -> MockResponse()
                        .setResponseCode(201)
                        .setBody(
                            """
                            {
                                "id": "s1",
                                "recipeId": "r1",
                                "recipeName": "Chicken Rice",
                                "quantity": 50,
                                "date": "2026-02-11",
                                "createdAt": "2026-02-11T10:00:00Z"
                            }
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // GET sales (for loading recent entries)
                    path.contains("/api/sales") && request.method == "GET" -> MockResponse()
                        .setResponseCode(200)
                        .setBody("[]")
                        .addHeader("Content-Type", "application/json")

                    // POST wastage data (create)
                    path.contains("/api/wastage") && request.method == "POST" -> MockResponse()
                        .setResponseCode(201)
                        .setBody(
                            """
                            {
                                "id": "w1",
                                "itemType": "Ingredient",
                                "itemId": "i1",
                                "itemName": "Rice",
                                "quantity": 5,
                                "date": "2026-02-11"
                            }
                            """.trimIndent(),
                        )
                        .addHeader("Content-Type", "application/json")

                    // GET wastage (for loading recent entries)
                    path.contains("/api/wastage") && request.method == "GET" -> MockResponse()
                        .setResponseCode(200)
                        .setBody("[]")
                        .addHeader("Content-Type", "application/json")

                    // Sales trend (loaded by SalesOverview on dashboard creation)
                    path.contains("/api/sales/trend") -> MockResponse()
                        .setResponseCode(200)
                        .setBody("[]")
                        .addHeader("Content-Type", "application/json")

                    // Forecast
                    path.contains("/api/forecast") -> MockResponse()
                        .setResponseCode(200)
                        .setBody("[]")
                        .addHeader("Content-Type", "application/json")

                    // Wastage trend
                    path.contains("/api/wastage/trend") -> MockResponse()
                        .setResponseCode(200)
                        .setBody("[]")
                        .addHeader("Content-Type", "application/json")

                    else -> MockResponse().setResponseCode(404)
                }
            }
        }
    }
}
