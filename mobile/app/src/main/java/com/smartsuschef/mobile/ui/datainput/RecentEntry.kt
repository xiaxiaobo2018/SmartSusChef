package com.smartsuschef.mobile.ui.datainput

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class RecentEntry(
    val id: String,
    val name: String,
    val quantity: Double,
    val unit: String,
    // format "yyyy-MM-dd"
    val date: String,
    // format "HH:mm"
    val time: String,
    val isSales: Boolean,
    // Added for UI state management in adapter
    val isEditing: Boolean = false,
) : Parcelable
