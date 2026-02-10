package com.smartsuschef.mobile.network.dto

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

/**
 * Wastage Data DTO
 * Maps to: WastageDataDto in WastageDtos.cs
 */
@Parcelize
data class WastageDataDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("date")
    val date: String,
    @SerializedName("ingredientId")
    val ingredientId: String? = null,
    @SerializedName("recipeId")
    val recipeId: String? = null,
    @SerializedName("displayName")
    val displayName: String,
    @SerializedName("unit")
    val unit: String,
    @SerializedName("quantity")
    val quantity: Double,
    @SerializedName("carbonFootprint")
    val carbonFootprint: Double,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("updatedAt")
    val updatedAt: String,
) : Parcelable

/**
 * Create Wastage Data Request
 * Maps to: CreateWastageDataRequest in WastageDtos.cs
 */
data class CreateWastageDataRequest(
    @SerializedName("date")
    val date: String,
    @SerializedName("ingredientId")
    val ingredientId: String? = null,
    @SerializedName("recipeId")
    val recipeId: String? = null,
    @SerializedName("quantity")
    val quantity: Double,
)

/**
 * Update Wastage Data Request
 * Maps to: UpdateWastageDataRequest in WastageDtos.cs
 */
data class UpdateWastageDataRequest(
    @SerializedName("date")
    val date: String,
    @SerializedName("ingredientId")
    val ingredientId: String? = null,
    @SerializedName("recipeId")
    val recipeId: String? = null,
    @SerializedName("quantity")
    val quantity: Double,
)

/**
 * Wastage Trend DTO (for charts/dashboard)
 * Maps to: WastageTrendDto in WastageDtos.cs
 */
@Parcelize
data class WastageTrendDto(
    @SerializedName("date")
    val date: String,
    @SerializedName("totalQuantity")
    val totalQuantity: Double,
    @SerializedName("totalCarbonFootprint")
    val totalCarbonFootprint: Double,
    @SerializedName("itemBreakdown")
    val itemBreakdown: List<ItemWastageDto>,
) : Parcelable

/**
 * Item Wastage DTO (nested in WastageTrendDto)
 * Maps to: ItemWastageDto in WastageDtos.cs
 */
@Parcelize
data class ItemWastageDto(
    @SerializedName("ingredientId")
    val ingredientId: String? = null,
    @SerializedName("recipeId")
    val recipeId: String? = null,
    @SerializedName("displayName")
    val displayName: String,
    @SerializedName("unit")
    val unit: String,
    @SerializedName("quantity")
    val quantity: Double,
    @SerializedName("carbonFootprint")
    val carbonFootprint: Double,
) : Parcelable
