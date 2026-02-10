package com.smartsuschef.mobile.data.models

data class Recipe(
    val id: String,
    val storeId: Int,
    val name: String,
    val isSubRecipe: Boolean,
    val isSellable: Boolean,
    val createdAt: String,
    val updatedAt: String,
    // To connect the two models - Recipe and Ingredient
    val recipeIngredients: List<RecipeIngredient> = emptyList(),
)
