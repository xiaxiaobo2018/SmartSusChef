package com.smartsuschef.mobile.data.models

data class ForecastData(
    val id: String,
    val storeId: Int,
    val recipeId: String,
    val forecastDate: String,
    val predictedQuantity: Int,
    val createdAt: String,
    val updatedAt: String,
)
