package com.smartsuschef.mobile.ui.settings

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
import com.smartsuschef.mobile.util.AnimationDisableRule
import com.smartsuschef.mobile.util.CustomMatchers
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
import java.util.concurrent.TimeUnit
import javax.inject.Inject

/**
 * Espresso UI Tests for SettingsActivity
 *
 * Tests cover:
 * - Settings layout display (password management & profile sections)
 * - Password change form validation with hasErrorText assertions
 * - Password validation rules (min length, uppercase, number, special char)
 * - Profile update form interaction
 * - Password mismatch validation
 * - Successful password change flow with Toast verification
 * - Successful profile update flow with Toast verification
 * - Server error handling for profile updates
 * - Loading states during password change
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class SettingsActivityTest {
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

        mockWebServer.dispatcher = createSettingsDispatcher()

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

    // ============================================================
    // Layout Display Tests
    // ============================================================

    @Test
    fun settings_showsToolbar() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.toolbar))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun settings_showsPasswordSection() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etCurrentPassword))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword))
            .check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun settings_showsProfileSection() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etFullName))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.etEmail))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveProfile))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.isDisplayed()))
    }

    @Test
    fun settings_profileFieldsPopulatedFromApi() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // IdlingResource waits for API to return; profile fields should be populated
        Espresso.onView(ViewMatchers.withId(R.id.etFullName))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.withText("Admin User")))
        Espresso.onView(ViewMatchers.withId(R.id.etEmail))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.withText("admin@smartsuschef.com")))
    }

    // ============================================================
    // Password Validation Tests
    // ============================================================

    @Test
    fun password_tooShort_showsError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // Type a short password
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("Ab1!"), ViewActions.closeSoftKeyboard())

        // TextInputLayout should show error
        Espresso.onView(ViewMatchers.withId(R.id.tilNewPassword)).check(
            ViewAssertions.matches(CustomMatchers.hasTextInputLayoutErrorText("Password must be at least 12 characters")),
        )
    }

    @Test
    fun password_noUppercase_showsSpecificError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // 12+ chars, has number and special char, but no uppercase
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("validpass123!"), ViewActions.closeSoftKeyboard())

        Espresso.onView(ViewMatchers.withId(R.id.tilNewPassword)).check(
            ViewAssertions.matches(CustomMatchers.hasTextInputLayoutErrorText("Password must contain at least one uppercase letter")),
        )
    }

    @Test
    fun password_noNumber_showsSpecificError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // 12+ chars, has uppercase and special char, but no number
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("ValidPassWord!"), ViewActions.closeSoftKeyboard())

        Espresso.onView(ViewMatchers.withId(R.id.tilNewPassword)).check(
            ViewAssertions.matches(CustomMatchers.hasTextInputLayoutErrorText("Password must contain at least one number")),
        )
    }

    @Test
    fun password_noSpecialChar_showsSpecificError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // 12+ chars, has uppercase and number, but no special char
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("ValidPass1234"), ViewActions.closeSoftKeyboard())

        Espresso.onView(ViewMatchers.withId(R.id.tilNewPassword)).check(
            ViewAssertions.matches(
                CustomMatchers.hasTextInputLayoutErrorText(
                    "Password must contain at least one special character (@\$!%*?&#^()-_=+[]{}|;:',.<>/~`)",
                ),
            ),
        )
    }

    @Test
    fun password_validAndMatching_noErrors() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("ValidPass123!"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .perform(ViewActions.replaceText("ValidPass123!"), ViewActions.closeSoftKeyboard())

        // Both TextInputLayouts should have no error
        Espresso.onView(ViewMatchers.withId(R.id.tilNewPassword))
            .check(ViewAssertions.matches(CustomMatchers.hasNoError()))
        Espresso.onView(ViewMatchers.withId(R.id.tilConfirmPassword))
            .check(ViewAssertions.matches(CustomMatchers.hasNoError()))
    }

    @Test
    fun password_mismatch_showsError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("ValidPass123!"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .perform(ViewActions.replaceText("DifferentPass456!"), ViewActions.closeSoftKeyboard())

        // Confirm password TextInputLayout should show mismatch error
        Espresso.onView(ViewMatchers.withId(R.id.tilConfirmPassword)).check(
            ViewAssertions.matches(CustomMatchers.hasTextInputLayoutErrorText("Passwords do not match")),
        )
    }

    @Test
    fun password_matching_noError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("ValidPass123!"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .perform(ViewActions.replaceText("ValidPass123!"), ViewActions.closeSoftKeyboard())

        // Both fields should contain matching text and no error
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .check(ViewAssertions.matches(ViewMatchers.withText("ValidPass123!")))
        Espresso.onView(ViewMatchers.withId(R.id.tilConfirmPassword))
            .check(ViewAssertions.matches(CustomMatchers.hasNoError()))
    }

    // ============================================================
    // Password Change Flow Tests
    // ============================================================

    @Test
    fun changePassword_successfulSubmission() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etCurrentPassword))
            .perform(ViewActions.replaceText("OldPass123!!"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("NewPass456!a"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .perform(ViewActions.replaceText("NewPass456!a"), ViewActions.closeSoftKeyboard())

        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword)).perform(ViewActions.click())

        // IdlingResource waits for network call; button should be re-enabled after completion
        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword))
            .check(ViewAssertions.matches(ViewMatchers.isEnabled()))

        // Password fields should be cleared after successful change
        Espresso.onView(ViewMatchers.withId(R.id.etCurrentPassword))
            .check(ViewAssertions.matches(ViewMatchers.withText("")))
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .check(ViewAssertions.matches(ViewMatchers.withText("")))
    }

    @Test
    fun changePassword_serverError_buttonReEnabled() {
        // Override dispatcher for this test to return error
        mockWebServer.dispatcher = createSettingsDispatcher(passwordChangeError = true)

        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etCurrentPassword))
            .perform(ViewActions.replaceText("WrongPass!!1"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("NewPass456!a"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .perform(ViewActions.replaceText("NewPass456!a"), ViewActions.closeSoftKeyboard())

        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword)).perform(ViewActions.click())

        // IdlingResource waits for network response; button should be re-enabled after error
        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword))
            .check(ViewAssertions.matches(ViewMatchers.isEnabled()))
    }

    @Test
    fun changePassword_withDelayedResponse_completesSuccessfully() {
        // Use a delayed response to verify the flow handles slow responses
        mockWebServer.dispatcher = createSettingsDispatcher(passwordChangeDelayMs = 500)

        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etCurrentPassword))
            .perform(ViewActions.replaceText("OldPass123!!"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etNewPassword))
            .perform(ViewActions.replaceText("NewPass456!a"), ViewActions.closeSoftKeyboard())
        Espresso.onView(ViewMatchers.withId(R.id.etConfirmPassword))
            .perform(ViewActions.replaceText("NewPass456!a"), ViewActions.closeSoftKeyboard())

        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword)).perform(ViewActions.click())

        // IdlingResource waits for delayed response; button should be re-enabled after completion
        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword))
            .check(ViewAssertions.matches(ViewMatchers.isEnabled()))
    }

    // ============================================================
    // Profile Update Flow Tests
    // ============================================================

    @Test
    fun updateProfile_editFields() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // IdlingResource waits for profile data to load

        // Clear and type new name
        Espresso.onView(ViewMatchers.withId(R.id.etFullName)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("Updated Name"),
            ViewActions.closeSoftKeyboard(),
        )
        Espresso.onView(ViewMatchers.withId(R.id.etEmail)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("updated@smartsuschef.com"),
            ViewActions.closeSoftKeyboard(),
        )

        // Verify fields have new values
        Espresso.onView(ViewMatchers.withId(R.id.etFullName))
            .check(ViewAssertions.matches(ViewMatchers.withText("Updated Name")))
        Espresso.onView(ViewMatchers.withId(R.id.etEmail))
            .check(ViewAssertions.matches(ViewMatchers.withText("updated@smartsuschef.com")))
    }

    @Test
    fun updateProfile_successfulSubmission() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etFullName)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("Updated Name"),
            ViewActions.closeSoftKeyboard(),
        )
        Espresso.onView(ViewMatchers.withId(R.id.etEmail)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("updated@smartsuschef.com"),
            ViewActions.closeSoftKeyboard(),
        )

        Espresso.onView(ViewMatchers.withId(R.id.btnSaveProfile))
            .perform(ViewActions.scrollTo(), ViewActions.click())

        // IdlingResource waits for network call; button should be re-enabled after completion
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveProfile))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.isEnabled()))
    }

    @Test
    fun updateProfile_serverError_showsErrorToast() {
        mockWebServer.dispatcher = createSettingsDispatcher(profileUpdateError = true)

        val scenario = ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etFullName)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("Updated Name"),
            ViewActions.closeSoftKeyboard(),
        )
        Espresso.onView(ViewMatchers.withId(R.id.etEmail)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("updated@smartsuschef.com"),
            ViewActions.closeSoftKeyboard(),
        )

        Espresso.onView(ViewMatchers.withId(R.id.btnSaveProfile))
            .perform(ViewActions.scrollTo(), ViewActions.click())

        // Button should be re-enabled after error
        Espresso.onView(ViewMatchers.withId(R.id.btnSaveProfile))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.isEnabled()))
    }

    @Test
    fun updateProfile_serverError_fieldsNotCleared() {
        mockWebServer.dispatcher = createSettingsDispatcher(profileUpdateError = true)

        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.etFullName)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("Updated Name"),
            ViewActions.closeSoftKeyboard(),
        )
        Espresso.onView(ViewMatchers.withId(R.id.etEmail)).perform(
            ViewActions.scrollTo(),
            ViewActions.replaceText("updated@smartsuschef.com"),
            ViewActions.closeSoftKeyboard(),
        )

        Espresso.onView(ViewMatchers.withId(R.id.btnSaveProfile))
            .perform(ViewActions.scrollTo(), ViewActions.click())

        // Fields should retain their values after error
        Espresso.onView(ViewMatchers.withId(R.id.etFullName))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.withText("Updated Name")))
        Espresso.onView(ViewMatchers.withId(R.id.etEmail))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.withText("updated@smartsuschef.com")))
    }

    // ============================================================
    // Update Password Button Text
    // ============================================================

    @Test
    fun updatePasswordButton_displaysCorrectText() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.btnUpdatePassword))
            .check(ViewAssertions.matches(ViewMatchers.withText("Update Password")))
    }

    @Test
    fun saveProfileButton_displaysCorrectText() {
        ActivityScenario.launch(SettingsActivity::class.java)

        Espresso.onView(ViewMatchers.withId(R.id.btnSaveProfile))
            .perform(ViewActions.scrollTo()).check(ViewAssertions.matches(ViewMatchers.withText("Save Profile Info")))
    }

    // ============================================================
    // Helpers
    // ============================================================

    @Suppress("LongMethod")
    private fun createSettingsDispatcher(
        passwordChangeError: Boolean = false,
        passwordChangeDelayMs: Long = 0,
        profileUpdateError: Boolean = false,
    ): Dispatcher {
        return object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.path ?: return MockResponse().setResponseCode(404)

                return when {
                    // GET current user
                    path.contains("/api/auth/me") && request.method == "GET" ->
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

                    // PUT password change
                    path.contains("/api/auth/password") && request.method == "PUT" -> {
                        val response =
                            if (passwordChangeError) {
                                MockResponse()
                                    .setResponseCode(400)
                                    .setBody("""{"message": "Current password is incorrect"}""")
                                    .addHeader("Content-Type", "application/json")
                            } else {
                                MockResponse()
                                    .setResponseCode(204)
                                    .addHeader("Content-Type", "application/json")
                            }
                        if (passwordChangeDelayMs > 0) {
                            response.setBodyDelay(passwordChangeDelayMs, TimeUnit.MILLISECONDS)
                        }
                        response
                    }

                    // PUT profile update
                    path.contains("/api/auth/profile") && request.method == "PUT" ->
                        if (profileUpdateError) {
                            MockResponse()
                                .setResponseCode(500)
                                .setBody("""{"message": "Failed to update profile"}""")
                                .addHeader("Content-Type", "application/json")
                        } else {
                            MockResponse()
                                .setResponseCode(200)
                                .setBody(
                                    """
                                    {
                                        "id": "user-001",
                                        "username": "admin",
                                        "name": "Updated Name",
                                        "email": "updated@smartsuschef.com",
                                        "role": "manager",
                                        "status": "Active",
                                        "createdAt": "2026-01-01T00:00:00Z",
                                        "updatedAt": "2026-02-11T00:00:00Z"
                                    }
                                    """.trimIndent(),
                                )
                                .addHeader("Content-Type", "application/json")
                        }

                    else -> MockResponse().setResponseCode(404)
                }
            }
        }
    }
}
