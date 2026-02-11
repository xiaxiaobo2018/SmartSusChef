package com.smartsuschef.mobile.data.repository

import android.util.Log
import com.smartsuschef.mobile.network.api.ForecastApiService
import com.smartsuschef.mobile.network.dto.ForecastDto
import com.smartsuschef.mobile.network.dto.HolidayDto
import com.smartsuschef.mobile.network.dto.WeatherDto
import com.smartsuschef.mobile.util.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class ForecastRepository
    @Inject
    constructor(
        private val forecastApiService: ForecastApiService,
    ) {
        companion object {
            private const val TAG = "ForecastRepository"
        }

        suspend fun getForecast(
            days: Int,
            includePastDays: Int = 0,
        ): Resource<List<ForecastDto>> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = forecastApiService.getForecast(days, includePastDays)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch forecast: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in getForecast: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in getForecast: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                }
            }
        }

        suspend fun getWeather(): Resource<WeatherDto?> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = forecastApiService.getWeather()
                    if (response.isSuccessful) {
                        Resource.Success(response.body())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch weather: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in getWeather: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in getWeather: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                }
            }
        }

        suspend fun getHolidays(year: Int): Resource<List<HolidayDto>> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = forecastApiService.getHolidays(year)
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch holidays: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in getHolidays: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in getHolidays: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                }
            }
        }
    }
