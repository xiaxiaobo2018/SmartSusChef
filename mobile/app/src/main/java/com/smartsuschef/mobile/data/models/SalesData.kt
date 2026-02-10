package com.smartsuschef.mobile.data.models

data class SalesData(
    val id: String,
    val storeId: Int,
    val date: String,
    val recipeId: String,
    val quantity: Int,
    val createdAt: String,
    val updatedAt: String,
)
