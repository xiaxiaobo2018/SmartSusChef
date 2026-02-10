package com.smartsuschef.mobile.data.repository

import android.util.Log
import com.smartsuschef.mobile.network.api.SalesApiService
import com.smartsuschef.mobile.network.dto.CreateSalesDataRequest
import com.smartsuschef.mobile.network.dto.IngredientUsageDto
import com.smartsuschef.mobile.network.dto.RecipeSalesDto
import com.smartsuschef.mobile.network.dto.SalesDataDto
import com.smartsuschef.mobile.network.dto.SalesTrendDto
import com.smartsuschef.mobile.network.dto.UpdateSalesDataRequest
import com.smartsuschef.mobile.util.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class SalesRepository
    @Inject
    constructor(
        private val salesApiService: SalesApiService,
    ) {
        companion object {
            private const val TAG = "SalesRepository"
        }

        suspend fun getAll(
            startDate: String?,
            endDate: String?,
        ): Resource<List<SalesDataDto>> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = salesApiService.getAll(startDate, endDate)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch sales history: ${errorBody ?: response.message()}")
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

        suspend fun getTrend(
            startDate: String,
            endDate: String,
        ): Resource<List<SalesTrendDto>> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = salesApiService.getTrend(startDate, endDate)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch sales trend: ${errorBody ?: response.message()}")
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

        suspend fun getIngredientUsageByDate(date: String): Resource<List<IngredientUsageDto>> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = salesApiService.getIngredientUsageByDate(date)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch ingredient usage: ${errorBody ?: response.message()}")
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

        suspend fun getRecipeSalesByDate(date: String): Resource<List<RecipeSalesDto>> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = salesApiService.getRecipeSalesByDate(date)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch recipe sales: ${errorBody ?: response.message()}")
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

        suspend fun create(request: CreateSalesDataRequest): Resource<SalesDataDto> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = salesApiService.create(request)
                    if (response.isSuccessful) {
                        Resource.Success(response.body()!!)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to add sale: ${errorBody ?: response.message()}")
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

        suspend fun update(
            id: String,
            request: UpdateSalesDataRequest,
        ): Resource<SalesDataDto> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = salesApiService.update(id, request)
                    if (response.isSuccessful) {
                        Resource.Success(response.body()!!)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to update sale: ${errorBody ?: response.message()}")
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

        suspend fun delete(id: String): Resource<Unit> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = salesApiService.delete(id)
                    if (response.isSuccessful) {
                        Resource.Success(Unit)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to delete sale: ${errorBody ?: response.message()}")
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
