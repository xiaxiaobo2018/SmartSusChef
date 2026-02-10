package com.smartsuschef.mobile.data.models

data class Ingredient(
    val id: String,
    val name: String,
    val storeId: Int,
    val unit: String,
    val carbonFootprint: Double,
    val createdAt: String,
    val updatedAt: String,
)
