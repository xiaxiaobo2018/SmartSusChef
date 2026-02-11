package com.smartsuschef.mobile.ui.auth

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.typeText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.intent.Intents
import androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.isEnabled
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.data.repository.AuthRepository
import com.smartsuschef.mobile.di.TestNetworkModule
import com.smartsuschef.mobile.ui.dashboard.DashboardActivity
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import javax.inject.Inject

@RunWith(AndroidJUnit4::class)
@HiltAndroidTest
class LoginActivityTest {
    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Inject
    lateinit var authRepository: AuthRepository

    private val mockWebServer = MockWebServer()

    @Before
    fun setUp() {
        mockWebServer.start()
        TestNetworkModule.mockWebServerUrl = mockWebServer.url("/").toString()
        hiltRule.inject()
        authRepository.logout()
    }

    @After
    fun tearDown() {
        mockWebServer.shutdown()
    }

    @Test
    fun loginScreen_isDisplayed_onAppLaunch() {
        ActivityScenario.launch(LoginActivity::class.java).use {
            onView(withId(R.id.etUsername)).check(matches(isDisplayed()))
            onView(withId(R.id.etPassword)).check(matches(isDisplayed()))
            onView(withId(R.id.btnSignIn)).check(matches(isDisplayed()))
        }
    }

    @Test
    fun login_withInvalidCredentials_showsError() {
        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(401)
                .setBody("{\"message\":\"Invalid credentials\"}"),
        )

        ActivityScenario.launch(LoginActivity::class.java).use {
            onView(withId(R.id.etUsername)).perform(typeText("wrong"))
            onView(withId(R.id.etPassword)).perform(typeText("user"), closeSoftKeyboard())
            onView(withId(R.id.btnSignIn)).perform(click())

            Thread.sleep(ASYNC_WAIT_MS)

            // After error response, sign-in button should be re-enabled
            onView(withId(R.id.btnSignIn)).check(matches(isEnabled()))
        }
    }

    @Test
    fun login_withValidCredentials_navigatesToDashboard() {
        mockWebServer.enqueue(
            MockResponse()
                .setResponseCode(200)
                .setBody(
                    """
                    {
                      "token": "fake-token",
                      "user": {
                        "id": "id",
                        "username": "test",
                        "name": "Test User",
                        "email": "email",
                        "role": "employee",
                        "status": "Active",
                        "createdAt": "2026-02-08T00:00:00",
                        "updatedAt": "2026-02-08T00:00:00"
                      },
                      "storeSetupRequired": false
                    }
                    """.trimIndent(),
                ),
        )

        Intents.init()
        try {
            ActivityScenario.launch(LoginActivity::class.java)

            onView(withId(R.id.etUsername)).perform(typeText("test"))
            onView(withId(R.id.etPassword)).perform(typeText("password"), closeSoftKeyboard())
            onView(withId(R.id.btnSignIn)).perform(click())

            Thread.sleep(ASYNC_WAIT_MS)

            Intents.intended(hasComponent(DashboardActivity::class.java.name))
        } finally {
            Intents.release()
        }
    }

    companion object {
        private const val ASYNC_WAIT_MS = 2000L
    }
}
