package com.smartsuschef.mobile.data.models

data class RecipeIngredient(
    val id: String,
    val recipeId: String,
    // Nullable if it is a sub-recipe
    val ingredientId: String?,
    // Nullable if it might be a raw ingredient
    val childRecipeId: String?,
    val quantity: Double,
    val ingredient: Ingredient? = null,
    /* Not including this for now
    val childRecipe: Recipe? = null
     */
)
