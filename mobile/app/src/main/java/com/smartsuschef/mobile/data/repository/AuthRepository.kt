package com.smartsuschef.mobile.data.repository

import android.util.Log
import com.smartsuschef.mobile.data.TokenManager
import com.smartsuschef.mobile.network.api.AuthApiService
import com.smartsuschef.mobile.network.dto.ChangePasswordRequest
import com.smartsuschef.mobile.network.dto.ForgotPasswordRequest
import com.smartsuschef.mobile.network.dto.LoginRequest
import com.smartsuschef.mobile.network.dto.LoginResponse
import com.smartsuschef.mobile.util.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository
    @Inject
    constructor(
        private val authApi: AuthApiService,
        private val tokenManager: TokenManager,
    ) {
        companion object {
            private const val TAG = "AuthRepository"
            private const val HTTP_UNAUTHORIZED = 401
            private const val HTTP_BAD_REQUEST = 400
        }

        /**
         * Executes login and saves the token if successful.
         * Maps to .NET AuthController.Login
         */
        suspend fun login(request: LoginRequest): Resource<LoginResponse> =
            withContext(Dispatchers.IO) {
                try {
                    val response = authApi.login(request)
                    if (response.isSuccessful && response.body() != null) {
                        val loginResponse = response.body()!!

                        // Persist the token and user role locally
                        tokenManager.saveToken(loginResponse.token)
                        tokenManager.saveUserRole(loginResponse.user.role)

                        Resource.Success(loginResponse)
                    } else {
                        Resource.Error("Invalid username or password")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Login failed: ${e.localizedMessage}", e)
                    Resource.Error(e.localizedMessage ?: "An unexpected error occurred")
                }
            }

        /**
         * Sends a password reset request.
         */
        suspend fun forgotPassword(request: ForgotPasswordRequest): Resource<Unit> =
            withContext(Dispatchers.IO) {
                try {
                    val response = authApi.forgotPassword(request)
                    if (response.isSuccessful) {
                        Resource.Success(Unit)
                    } else {
                        Log.e(TAG, "Failed to send password reset request: ${response.message()}", null)
                        Resource.Error("Failed to send password reset request: ${response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in forgotPassword: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in forgotPassword: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in forgotPassword: ${e.message}", e)
                    Resource.Error("An unexpected error occurred: ${e.message}")
                }
            }

        /**
         * Change user password
         * Requires current password for verification
         * Maps to .NET AuthController.ChangePassword
         */
        suspend fun changePassword(request: ChangePasswordRequest): Resource<Unit> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = authApi.changePassword(request)
                    if (response.isSuccessful) {
                        Resource.Success(Unit)
                    } else {
                        // Handle session expiry by logging out
                        if (response.code() == HTTP_UNAUTHORIZED) {
                            logout()
                            Log.e(TAG, "Session expired, user logged out.", null)
                            return@withContext Resource.Error("Session expired. Please log in again.")
                        }

                        // Parse other error messages from response
                        val errorBody = response.errorBody()?.string()
                        val errorMessage =
                            when {
                                errorBody?.contains("incorrect", ignoreCase = true) == true ->
                                    "Current password is incorrect"
                                errorBody?.contains("invalid", ignoreCase = true) == true ->
                                    "Invalid password format"
                                response.code() == HTTP_BAD_REQUEST ->
                                    "Password does not meet requirements"
                                else ->
                                    "Failed to change password: ${response.message()}"
                            }
                        Log.e(TAG, "Failed to change password: $errorMessage", null)
                        Resource.Error(errorMessage)
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in changePassword: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in changePassword: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in changePassword: ${e.message}", e)
                    Resource.Error("An unexpected error occurred: ${e.message}")
                }
            }
        }

        /**
         * Clears local session data.
         * Essential for your security requirement to log out after inactivity.
         */
        fun logout() {
            tokenManager.clearSession()
        }

        /**
         * Checks if a user is currently authenticated.
         */
        fun isUserLoggedIn(): Boolean = !tokenManager.getToken().isNullOrEmpty()
    }
