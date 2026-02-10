package com.smartsuschef.mobile.data.repository

import android.util.Log
import com.smartsuschef.mobile.network.api.AuthApiService
import com.smartsuschef.mobile.network.dto.UpdateProfileRequest
import com.smartsuschef.mobile.network.dto.UserDto
import com.smartsuschef.mobile.util.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class UsersRepository
    @Inject
    constructor(
        private val authApiService: AuthApiService,
    ) {
        companion object {
            private const val TAG = "UsersRepository"
        }

        suspend fun getCurrentUser(): Resource<UserDto> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = authApiService.getCurrentUser()
                    if (response.isSuccessful) {
                        Resource.Success(response.body()!!)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch user profile: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                }
            }
        }

        suspend fun updateUser(request: UpdateProfileRequest): Resource<UserDto> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = authApiService.updateOwnProfile(request)
                    if (response.isSuccessful) {
                        Resource.Success(response.body()!!)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to update user: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                }
            }
        }
    }
