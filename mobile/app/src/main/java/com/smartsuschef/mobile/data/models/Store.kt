package com.smartsuschef.mobile.data.models

data class Store(
    val id: Int,
    val companyName: String,
    val uen: String,
    val storeName: String,
    val outletLocation: String,
    // Store Details
    val openingDate: String,
    val latitude: Double,
    val longitude: Double,
    val countryCode: String?,
    val address: String?,
    val contactNumber: String,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String,
)
