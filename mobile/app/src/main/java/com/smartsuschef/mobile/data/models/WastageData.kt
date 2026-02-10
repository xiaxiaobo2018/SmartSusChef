package com.smartsuschef.mobile.data.models

data class WastageData(
    val id: String,
    val storeId: Int,
    val date: String,
    // Nullable (can be null if recipeId is set)
    val ingredientId: String?,
    // Nullable (can be null if ingredientId is set)
    val recipeId: String?,
    val quantity: Double,
    val createdAt: String,
    val updatedAt: String,
)
