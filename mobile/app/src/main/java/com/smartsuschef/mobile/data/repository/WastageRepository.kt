package com.smartsuschef.mobile.data.repository

import android.util.Log
import com.smartsuschef.mobile.network.api.WastageApiService
import com.smartsuschef.mobile.network.dto.CreateWastageDataRequest
import com.smartsuschef.mobile.network.dto.UpdateWastageDataRequest
import com.smartsuschef.mobile.network.dto.WastageDataDto
import com.smartsuschef.mobile.network.dto.WastageTrendDto
import com.smartsuschef.mobile.util.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class WastageRepository
    @Inject
    constructor(
        private val wastageApiService: WastageApiService,
    ) {
        companion object {
            private const val TAG = "WastageRepository"
        }

        suspend fun getAll(
            startDate: String?,
            endDate: String?,
        ): Resource<List<WastageDataDto>> =
            withContext(Dispatchers.IO) {
                try {
                    val response = wastageApiService.getAll(startDate, endDate)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch wastage data: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in repository: ${e.message}", e)
                    Resource.Error("An unexpected error occurred: ${e.message}")
                }
            }

        suspend fun getTrend(
            startDate: String,
            endDate: String,
        ): Resource<List<WastageTrendDto>> =
            withContext(Dispatchers.IO) {
                try {
                    val response = wastageApiService.getTrend(startDate, endDate)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch wastage trend: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in repository: ${e.message}", e)
                    Resource.Error("An unexpected error occurred: ${e.message}")
                }
            }

        suspend fun create(request: CreateWastageDataRequest): Resource<WastageDataDto> =
            withContext(Dispatchers.IO) {
                try {
                    val response = wastageApiService.create(request)
                    if (response.isSuccessful) {
                        Resource.Success(response.body()!!)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to add wastage: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in repository: ${e.message}", e)
                    Resource.Error("An unexpected error occurred: ${e.message}")
                }
            }

        suspend fun update(
            id: String,
            request: UpdateWastageDataRequest,
        ): Resource<WastageDataDto> =
            withContext(Dispatchers.IO) {
                try {
                    val response = wastageApiService.update(id, request)
                    if (response.isSuccessful) {
                        Resource.Success(response.body()!!)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to update wastage: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in repository: ${e.message}", e)
                    Resource.Error("An unexpected error occurred: ${e.message}")
                }
            }

        suspend fun delete(id: String): Resource<Unit> =
            withContext(Dispatchers.IO) {
                try {
                    val response = wastageApiService.delete(id)
                    if (response.isSuccessful) {
                        Resource.Success(Unit)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to delete wastage: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                } catch (e: Exception) {
                    Log.e(TAG, "Unexpected error in repository: ${e.message}", e)
                    Resource.Error("An unexpected error occurred: ${e.message}")
                }
            }
    }
