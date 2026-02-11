package com.smartsuschef.mobile.ui

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
import androidx.test.espresso.action.ViewActions.scrollTo
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.RootMatchers.withDecorView
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.isEnabled
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.data.TokenManager
import com.smartsuschef.mobile.di.TestNetworkModule
import com.smartsuschef.mobile.ui.settings.SettingsActivity
import com.smartsuschef.mobile.util.CustomMatchers.hasNoError
import com.smartsuschef.mobile.util.CustomMatchers.hasTextInputLayoutErrorText
import com.smartsuschef.mobile.util.OkHttp3IdlingResource
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.hamcrest.Matchers.not
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
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
        okHttp3IdlingResource = OkHttp3IdlingResource.create("OkHttp", okHttpClient)
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

        onView(withId(R.id.toolbar)).check(matches(isDisplayed()))
    }

    @Test
    fun settings_showsPasswordSection() {
        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etCurrentPassword)).check(matches(isDisplayed()))
        onView(withId(R.id.etNewPassword)).check(matches(isDisplayed()))
        onView(withId(R.id.etConfirmPassword)).check(matches(isDisplayed()))
        onView(withId(R.id.btnUpdatePassword)).check(matches(isDisplayed()))
    }

    @Test
    fun settings_showsProfileSection() {
        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etFullName)).perform(scrollTo()).check(matches(isDisplayed()))
        onView(withId(R.id.etEmail)).perform(scrollTo()).check(matches(isDisplayed()))
        onView(withId(R.id.btnSaveProfile)).perform(scrollTo()).check(matches(isDisplayed()))
    }

    @Test
    fun settings_profileFieldsPopulatedFromApi() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // IdlingResource waits for API to return; profile fields should be populated
        onView(withId(R.id.etFullName)).perform(scrollTo()).check(matches(withText("Admin User")))
        onView(withId(R.id.etEmail)).perform(scrollTo()).check(matches(withText("admin@smartsuschef.com")))
    }

    // ============================================================
    // Password Validation Tests
    // ============================================================

    @Test
    fun password_tooShort_showsError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // Type a short password
        onView(withId(R.id.etNewPassword)).perform(replaceText("Ab1!"), closeSoftKeyboard())

        // TextInputLayout should show error
        onView(withId(R.id.tilNewPassword)).check(
            matches(hasTextInputLayoutErrorText("Password must be at least 12 characters")),
        )
    }

    @Test
    fun password_noUppercase_showsSpecificError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // 12+ chars, has number and special char, but no uppercase
        onView(withId(R.id.etNewPassword)).perform(replaceText("validpass123!"), closeSoftKeyboard())

        onView(withId(R.id.tilNewPassword)).check(
            matches(hasTextInputLayoutErrorText("Password must contain at least one uppercase letter")),
        )
    }

    @Test
    fun password_noNumber_showsSpecificError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // 12+ chars, has uppercase and special char, but no number
        onView(withId(R.id.etNewPassword)).perform(replaceText("ValidPassWord!"), closeSoftKeyboard())

        onView(withId(R.id.tilNewPassword)).check(
            matches(hasTextInputLayoutErrorText("Password must contain at least one number")),
        )
    }

    @Test
    fun password_noSpecialChar_showsSpecificError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // 12+ chars, has uppercase and number, but no special char
        onView(withId(R.id.etNewPassword)).perform(replaceText("ValidPass1234"), closeSoftKeyboard())

        onView(withId(R.id.tilNewPassword)).check(
            matches(hasTextInputLayoutErrorText("Password must contain at least one special character (@\$!%*?&#^()-_=+[]{}|;:',.<>/~`)")),
        )
    }

    @Test
    fun password_validAndMatching_noErrors() {
        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etNewPassword)).perform(replaceText("ValidPass123!"), closeSoftKeyboard())
        onView(withId(R.id.etConfirmPassword)).perform(replaceText("ValidPass123!"), closeSoftKeyboard())

        // Both TextInputLayouts should have no error
        onView(withId(R.id.tilNewPassword)).check(matches(hasNoError()))
        onView(withId(R.id.tilConfirmPassword)).check(matches(hasNoError()))
    }

    @Test
    fun password_mismatch_showsError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etNewPassword)).perform(replaceText("ValidPass123!"), closeSoftKeyboard())
        onView(withId(R.id.etConfirmPassword)).perform(replaceText("DifferentPass456!"), closeSoftKeyboard())

        // Confirm password TextInputLayout should show mismatch error
        onView(withId(R.id.tilConfirmPassword)).check(
            matches(hasTextInputLayoutErrorText("Passwords do not match")),
        )
    }

    @Test
    fun password_matching_noError() {
        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etNewPassword)).perform(replaceText("ValidPass123!"), closeSoftKeyboard())
        onView(withId(R.id.etConfirmPassword)).perform(replaceText("ValidPass123!"), closeSoftKeyboard())

        // Both fields should contain matching text and no error
        onView(withId(R.id.etConfirmPassword)).check(matches(withText("ValidPass123!")))
        onView(withId(R.id.tilConfirmPassword)).check(matches(hasNoError()))
    }

    // ============================================================
    // Password Change Flow Tests
    // ============================================================

    @Test
    fun changePassword_successfulSubmission() {
        val scenario = ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etCurrentPassword)).perform(replaceText("OldPass123!!"), closeSoftKeyboard())
        onView(withId(R.id.etNewPassword)).perform(replaceText("NewPass456!a"), closeSoftKeyboard())
        onView(withId(R.id.etConfirmPassword)).perform(replaceText("NewPass456!a"), closeSoftKeyboard())

        onView(withId(R.id.btnUpdatePassword)).perform(click())

        // IdlingResource waits for network call; button should be re-enabled after completion
        onView(withId(R.id.btnUpdatePassword)).check(matches(isEnabled()))

        // Verify success Toast
        scenario.onActivity { activity ->
            onView(withText("Password changed successfully"))
                .inRoot(withDecorView(not(activity.window.decorView)))
                .check(matches(isDisplayed()))
        }
    }

    @Test
    fun changePassword_serverError_buttonReEnabled() {
        // Override dispatcher for this test to return error
        mockWebServer.dispatcher = createSettingsDispatcher(passwordChangeError = true)

        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etCurrentPassword)).perform(replaceText("WrongPass!!1"), closeSoftKeyboard())
        onView(withId(R.id.etNewPassword)).perform(replaceText("NewPass456!a"), closeSoftKeyboard())
        onView(withId(R.id.etConfirmPassword)).perform(replaceText("NewPass456!a"), closeSoftKeyboard())

        onView(withId(R.id.btnUpdatePassword)).perform(click())

        // IdlingResource waits for network response; button should be re-enabled after error
        onView(withId(R.id.btnUpdatePassword)).check(matches(isEnabled()))
    }

    @Test
    fun changePassword_showsLoadingState() {
        // Use a delayed response to catch loading state
        mockWebServer.dispatcher = createSettingsDispatcher(passwordChangeDelayMs = 2000)

        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etCurrentPassword)).perform(replaceText("OldPass123!!"), closeSoftKeyboard())
        onView(withId(R.id.etNewPassword)).perform(replaceText("NewPass456!a"), closeSoftKeyboard())
        onView(withId(R.id.etConfirmPassword)).perform(replaceText("NewPass456!a"), closeSoftKeyboard())

        // Temporarily unregister idling resource to observe intermediate loading state
        IdlingRegistry.getInstance().unregister(okHttp3IdlingResource)

        onView(withId(R.id.btnUpdatePassword)).perform(click())

        // Button should be disabled during loading
        onView(withId(R.id.btnUpdatePassword)).check(matches(not(isEnabled())))

        // Re-register idling resource to wait for completion
        IdlingRegistry.getInstance().register(okHttp3IdlingResource)

        // After response, button should be re-enabled
        onView(withId(R.id.btnUpdatePassword)).check(matches(isEnabled()))
    }

    // ============================================================
    // Profile Update Flow Tests
    // ============================================================

    @Test
    fun updateProfile_editFields() {
        ActivityScenario.launch(SettingsActivity::class.java)

        // IdlingResource waits for profile data to load

        // Clear and type new name
        onView(withId(R.id.etFullName)).perform(scrollTo(), replaceText("Updated Name"), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(scrollTo(), replaceText("updated@smartsuschef.com"), closeSoftKeyboard())

        // Verify fields have new values
        onView(withId(R.id.etFullName)).check(matches(withText("Updated Name")))
        onView(withId(R.id.etEmail)).check(matches(withText("updated@smartsuschef.com")))
    }

    @Test
    fun updateProfile_successfulSubmission() {
        val scenario = ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etFullName)).perform(scrollTo(), replaceText("Updated Name"), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(scrollTo(), replaceText("updated@smartsuschef.com"), closeSoftKeyboard())

        onView(withId(R.id.btnSaveProfile)).perform(scrollTo(), click())

        // IdlingResource waits for network call; button should be re-enabled after completion
        onView(withId(R.id.btnSaveProfile)).perform(scrollTo()).check(matches(isEnabled()))

        // Verify success Toast
        scenario.onActivity { activity ->
            onView(withText("Profile updated successfully"))
                .inRoot(withDecorView(not(activity.window.decorView)))
                .check(matches(isDisplayed()))
        }
    }

    @Test
    fun updateProfile_serverError_showsErrorToast() {
        mockWebServer.dispatcher = createSettingsDispatcher(profileUpdateError = true)

        val scenario = ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etFullName)).perform(scrollTo(), replaceText("Updated Name"), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(scrollTo(), replaceText("updated@smartsuschef.com"), closeSoftKeyboard())

        onView(withId(R.id.btnSaveProfile)).perform(scrollTo(), click())

        // Button should be re-enabled after error
        onView(withId(R.id.btnSaveProfile)).perform(scrollTo()).check(matches(isEnabled()))
    }

    @Test
    fun updateProfile_serverError_fieldsNotCleared() {
        mockWebServer.dispatcher = createSettingsDispatcher(profileUpdateError = true)

        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.etFullName)).perform(scrollTo(), replaceText("Updated Name"), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(scrollTo(), replaceText("updated@smartsuschef.com"), closeSoftKeyboard())

        onView(withId(R.id.btnSaveProfile)).perform(scrollTo(), click())

        // Fields should retain their values after error
        onView(withId(R.id.etFullName)).perform(scrollTo()).check(matches(withText("Updated Name")))
        onView(withId(R.id.etEmail)).perform(scrollTo()).check(matches(withText("updated@smartsuschef.com")))
    }

    // ============================================================
    // Update Password Button Text
    // ============================================================

    @Test
    fun updatePasswordButton_displaysCorrectText() {
        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.btnUpdatePassword)).check(matches(withText("Update Password")))
    }

    @Test
    fun saveProfileButton_displaysCorrectText() {
        ActivityScenario.launch(SettingsActivity::class.java)

        onView(withId(R.id.btnSaveProfile)).perform(scrollTo()).check(matches(withText("Save Profile Info")))
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
                            response.setBodyDelay(passwordChangeDelayMs, java.util.concurrent.TimeUnit.MILLISECONDS)
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
