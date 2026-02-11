package com.smartsuschef.mobile.ui.forecast

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartsuschef.mobile.data.repository.ForecastRepository
import com.smartsuschef.mobile.data.repository.SalesRepository
import com.smartsuschef.mobile.network.dto.ForecastDto
import com.smartsuschef.mobile.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject

@HiltViewModel
class ForecastViewModel
    @Inject
    constructor(
        private val forecastRepository: ForecastRepository,
        private val salesRepository: SalesRepository,
    ) : ViewModel() {
        // Prediction Summary (Next 7 days aggregated by date)
        private val _summaryTrend = MutableLiveData<Resource<List<DailySummary>>>()
        val summaryTrend: LiveData<Resource<List<DailySummary>>> = _summaryTrend

        // Daily dish breakdown for stacked bar chart
        private val _dishForecasts = MutableLiveData<Resource<List<DailyDishForecast>>>()
        val dishForecasts: LiveData<Resource<List<DailyDishForecast>>> = _dishForecasts

        // Ingredient forecast table (7 days)
        private val _ingredientForecast = MutableLiveData<Resource<List<IngredientForecast>>>()
        val ingredientForecast: LiveData<Resource<List<IngredientForecast>>> = _ingredientForecast

        // Date headers for ingredient table
        private val _dateHeaders = MutableLiveData<List<String>>()
        val dateHeaders: LiveData<List<String>> = _dateHeaders

        // Comparison data (Past 7 days: Predicted vs Actual)
        private val _comparisonData = MutableLiveData<Resource<List<ComparisonDay>>>()
        val comparisonData: LiveData<Resource<List<ComparisonDay>>> = _comparisonData

        companion object {
            private const val FORECAST_DAYS = 7
            private const val MAX_CHART_CATEGORIES = 9
        }

        private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

        init {
            loadPredictions()
        }

        fun loadPredictions() {
            viewModelScope.launch {
                _summaryTrend.value = Resource.Loading()
                _dishForecasts.value = Resource.Loading()
                _ingredientForecast.value = Resource.Loading()
                _comparisonData.value = Resource.Loading()

                val today = dateFormat.format(Date())

                when (
                    val result =
                        forecastRepository.getForecast(FORECAST_DAYS, FORECAST_DAYS)
                ) {
                    is Resource.Success -> {
                        val allForecastData = result.data.orEmpty()

                        // Split into future (>= today) and past (< today) predictions
                        val futureForecastData =
                            allForecastData
                                .filter { it.date >= today }
                                .sortedBy { it.date }
                        val pastForecastData =
                            allForecastData
                                .filter { it.date < today }
                                .sortedBy { it.date }

                        processFutureData(futureForecastData)
                        loadComparisonData(pastForecastData)
                    }

                    is Resource.Error -> {
                        val errorMessage = result.message ?: "Failed to load forecast"
                        _summaryTrend.value = Resource.Error(errorMessage)
                        _ingredientForecast.value = Resource.Error(errorMessage)
                        _dishForecasts.value = Resource.Error(errorMessage)
                        _comparisonData.value = Resource.Error(errorMessage)
                    }

                    is Resource.Loading -> {}
                }
            }
        }

        private fun processFutureData(futureData: List<ForecastDto>) {
            // 1. Summary trend — aggregate by date
            val dailySummaries =
                futureData
                    .groupBy { it.date }
                    .map { (date, forecasts) ->
                        DailySummary(
                            date = date,
                            totalQuantity = forecasts.sumOf { it.quantity },
                        )
                    }
                    .sortedBy { it.date }
            _summaryTrend.value = Resource.Success(dailySummaries)

            // 2. Date headers for ingredient table
            val dates = futureData.map { it.date }.distinct().sorted()
            _dateHeaders.value = dates

            // 3. Ingredient forecast table
            processIngredientTable(futureData)

            // 4. Daily dish breakdown with top 9 + Others grouping
            val totalByDish =
                futureData
                    .groupBy { it.recipeName }
                    .mapValues { (_, forecasts) -> forecasts.sumOf { it.quantity } }

            val topDishNames =
                totalByDish.entries
                    .sortedByDescending { it.value }
                    .take(MAX_CHART_CATEGORIES)
                    .map { it.key }
                    .toSet()

            val dailyDishForecasts =
                futureData
                    .groupBy { it.date }
                    .map { (date, dailyForecasts) ->
                        val topDishes =
                            dailyForecasts
                                .filter { it.recipeName in topDishNames }
                                .map {
                                    DishForecast(
                                        name = it.recipeName,
                                        predictedSales = it.quantity,
                                    )
                                }
                        val othersTotal =
                            dailyForecasts
                                .filter { it.recipeName !in topDishNames }
                                .sumOf { it.quantity }
                        val dishes =
                            if (othersTotal > 0) {
                                topDishes + DishForecast("Others", othersTotal)
                            } else {
                                topDishes
                            }
                        DailyDishForecast(date = date, dishes = dishes)
                    }
                    .sortedBy { it.date }

            _dishForecasts.value = Resource.Success(dailyDishForecasts)
        }

        private fun loadComparisonData(pastPredictions: List<ForecastDto>) {
            if (pastPredictions.isEmpty()) {
                _comparisonData.value = Resource.Success(emptyList())
                return
            }

            viewModelScope.launch {
                val pastDates = pastPredictions.map { it.date }.distinct().sorted()
                val startDate = pastDates.first()
                val endDate = pastDates.last()

                when (val salesResult = salesRepository.getTrend(startDate, endDate)) {
                    is Resource.Success -> {
                        val salesByDate =
                            salesResult.data
                                .orEmpty()
                                .associateBy { it.date }

                        // Aggregate predictions by date
                        val predictionsByDate =
                            pastPredictions
                                .groupBy { it.date }
                                .mapValues { (_, forecasts) ->
                                    forecasts.sumOf { it.quantity }
                                }

                        val comparisonDays =
                            pastDates.map { date ->
                                ComparisonDay(
                                    date = date,
                                    predicted = predictionsByDate[date] ?: 0,
                                    actual = salesByDate[date]?.totalQuantity ?: 0,
                                )
                            }

                        _comparisonData.value = Resource.Success(comparisonDays)
                    }

                    is Resource.Error -> {
                        _comparisonData.value =
                            Resource.Error(
                                salesResult.message ?: "Failed to load sales data",
                            )
                    }

                    is Resource.Loading -> {}
                }
            }
        }

        private fun processIngredientTable(forecastData: List<ForecastDto>) {
            val dates = forecastData.map { it.date }.distinct().sorted()

            val ingredientMap = mutableMapOf<String, MutableMap<String, Double>>()

            forecastData.forEach { forecast ->
                forecast.ingredients.forEach { ingredient ->
                    val key = "${ingredient.ingredientName} (${ingredient.unit})"
                    val dateMap = ingredientMap.getOrPut(key) { mutableMapOf() }
                    dateMap[forecast.date] =
                        (dateMap[forecast.date] ?: 0.0) + ingredient.quantity
                }
            }

            val ingredientList =
                ingredientMap.map { (nameWithUnit, dateMap) ->
                    val parts = nameWithUnit.split(" (")
                    val name = parts[0]
                    val unit = parts.getOrNull(1)?.removeSuffix(")") ?: ""

                    val quantities =
                        dates.map { date ->
                            dateMap[date] ?: 0.0
                        }

                    IngredientForecast(
                        name = name,
                        unit = unit,
                        totalQuantity = quantities,
                    )
                }

            _ingredientForecast.value = Resource.Success(ingredientList)
        }
    }

// Aggregated daily summary for the summary chart
data class DailySummary(
    val date: String,
    val totalQuantity: Int,
)

// Represents forecast for a single day with dish breakdown
data class DailyDishForecast(
    val date: String,
    val dishes: List<DishForecast>,
)

// Represents a single dish prediction
data class DishForecast(
    val name: String,
    val predictedSales: Int,
)

// Represents ingredient requirements over 7 days
data class IngredientForecast(
    val name: String,
    val unit: String,
    val totalQuantity: List<Double>,
)

// Comparison of predicted vs actual sales for a day
data class ComparisonDay(
    val date: String,
    val predicted: Int,
    val actual: Int,
)
