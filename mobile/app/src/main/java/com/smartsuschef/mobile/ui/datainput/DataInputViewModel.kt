package com.smartsuschef.mobile.ui.datainput

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartsuschef.mobile.data.repository.IngredientsRepository
import com.smartsuschef.mobile.data.repository.RecipesRepository
import com.smartsuschef.mobile.data.repository.SalesRepository
import com.smartsuschef.mobile.data.repository.WastageRepository
import com.smartsuschef.mobile.network.dto.CreateSalesDataRequest
import com.smartsuschef.mobile.network.dto.CreateWastageDataRequest
import com.smartsuschef.mobile.network.dto.IngredientDto
import com.smartsuschef.mobile.network.dto.RecipeDto
import com.smartsuschef.mobile.network.dto.SalesDataDto
import com.smartsuschef.mobile.network.dto.UpdateSalesDataRequest
import com.smartsuschef.mobile.network.dto.UpdateWastageDataRequest
import com.smartsuschef.mobile.network.dto.WastageDataDto
import com.smartsuschef.mobile.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject

enum class WastageType {
    MAIN_DISH,
    SUB_RECIPE,
    INGREDIENT,
}

@HiltViewModel
class DataInputViewModel
    @Inject
    constructor(
        private val salesRepository: SalesRepository,
        private val wastageRepository: WastageRepository,
        private val ingredientsRepository: IngredientsRepository,
        private val recipesRepository: RecipesRepository,
    ) : ViewModel() {
        companion object {
            private const val TAG = "DataInputViewModel"
        }

        // Tracks whether we are in "Sales" or "Wastage" mode
        private val _isSalesMode = MutableLiveData(true)
        val isSalesMode: LiveData<Boolean> = _isSalesMode

        // Tracks the selected wastage type
        private val _wastageType = MutableLiveData(WastageType.INGREDIENT)
        val wastageType: LiveData<WastageType> = _wastageType

        // Data for dropdowns
        private val _ingredients = MutableLiveData<Resource<List<IngredientDto>>>()
        val ingredients: LiveData<Resource<List<IngredientDto>>> = _ingredients

        private val _mainRecipes = MutableLiveData<Resource<List<RecipeDto>>>()
        val mainRecipes: LiveData<Resource<List<RecipeDto>>> = _mainRecipes

        private val _subRecipes = MutableLiveData<Resource<List<RecipeDto>>>()
        val subRecipes: LiveData<Resource<List<RecipeDto>>> = _subRecipes

        // Currently selected item in the spinner
        private val _selectedItemId = MutableLiveData<String?>()
        val selectedItemId: LiveData<String?> = _selectedItemId

        private val _selectedItemName = MutableLiveData<String?>()
        val selectedItemName: LiveData<String?> = _selectedItemName

        // Recent entries to display in the list below the form
        private val _recentEntries = MutableLiveData<List<RecentEntry>>()
        val recentEntries: LiveData<List<RecentEntry>> = _recentEntries

        private val _submitStatus = MutableLiveData<Resource<Unit>>()
        val submitStatus: LiveData<Resource<Unit>> = _submitStatus

        // In-memory list to hold entries for the session
        private val submittedEntries = mutableListOf<RecentEntry>()

        init {
            fetchIngredients()
            fetchRecipes()
            loadTodayEntries()
        }

        fun setMode(isSales: Boolean) {
            _isSalesMode.value = isSales
            _selectedItemId.value = null // Clear selection when mode changes
            _selectedItemName.value = null
            // In a real app, you might want to clear or separate the list based on mode
            loadRecentEntries() // Refresh list based on mode
        }

        fun setWastageType(type: WastageType) {
            _wastageType.value = type
            _selectedItemId.value = null // Clear selection when type changes
            _selectedItemName.value = null
        }

        fun onItemSelected(
            itemId: String,
            itemName: String,
        ) {
            _selectedItemId.value = itemId
            _selectedItemName.value = itemName
        }

        fun findExistingEntry(itemName: String): RecentEntry? {
            val currentMode = _isSalesMode.value ?: true
            return submittedEntries.find { it.name == itemName && it.isSales == currentMode }
        }

        fun submitData(
            quantity: Double,
            existingEntryId: String? = null,
        ) {
            viewModelScope.launch {
                _submitStatus.value = Resource.Loading()
                val id = _selectedItemId.value
                val name = _selectedItemName.value

                if (id == null || name == null) {
                    _submitStatus.value = Resource.Error("No item selected.")
                    return@launch
                }

                val result =
                    if (_isSalesMode.value == true) {
                        submitSalesData(id, quantity.toInt(), existingEntryId)
                    } else {
                        submitWastageData(id, quantity, existingEntryId)
                    }

                handleSubmissionResult(result, name, quantity, existingEntryId)
            }
        }

        private suspend fun submitSalesData(
            recipeId: String,
            quantity: Int,
            existingEntryId: String?,
        ): Resource<out Any> {
            val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            return if (existingEntryId != null) {
                salesRepository.update(existingEntryId, UpdateSalesDataRequest(quantity = quantity))
            } else {
                salesRepository.create(
                    CreateSalesDataRequest(
                        date = todayStr,
                        recipeId = recipeId,
                        quantity = quantity,
                    ),
                )
            }
        }

        private suspend fun submitWastageData(
            itemId: String,
            quantity: Double,
            existingEntryId: String?,
        ): Resource<out Any> {
            val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            return if (existingEntryId != null) {
                val isIngredient = _wastageType.value == WastageType.INGREDIENT
                wastageRepository.update(
                    existingEntryId,
                    UpdateWastageDataRequest(
                        date = todayStr,
                        ingredientId = if (isIngredient) itemId else null,
                        recipeId = if (!isIngredient) itemId else null,
                        quantity = quantity,
                    ),
                )
            } else {
                val wastageRequest =
                    when (_wastageType.value) {
                        WastageType.MAIN_DISH, WastageType.SUB_RECIPE ->
                            CreateWastageDataRequest(
                                date = todayStr,
                                recipeId = itemId,
                                quantity = quantity,
                            )
                        WastageType.INGREDIENT ->
                            CreateWastageDataRequest(
                                date = todayStr,
                                ingredientId = itemId,
                                quantity = quantity,
                            )
                        else -> null
                    }
                wastageRequest?.let { wastageRepository.create(it) } ?: Resource.Error("Invalid wastage type.")
            }
        }

        private fun handleSubmissionResult(
            result: Resource<out Any>,
            name: String,
            quantity: Double,
            existingEntryId: String?,
        ) {
            when (result) {
                is Resource.Success -> {
                    val isSalesMode = _isSalesMode.value ?: true
                    val unit =
                        when (val data = result.data) {
                            is WastageDataDto -> data.unit
                            else -> "plates"
                        }
                    val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                    val currentTimeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())

                    val newEntryId =
                        when (val data = result.data) {
                            is SalesDataDto -> data.id
                            is WastageDataDto -> data.id
                            else -> existingEntryId
                        } ?: return // Should not be null on success

                    val newEntry = RecentEntry(newEntryId, name, quantity, unit, todayStr, currentTimeStr, isSalesMode)

                    val existingIndex = submittedEntries.indexOfFirst { it.id == newEntry.id }
                    if (existingIndex != -1) {
                        submittedEntries[existingIndex] = newEntry
                    } else {
                        submittedEntries.add(0, newEntry)
                    }

                    _submitStatus.value = Resource.Success(Unit, "Entry saved successfully!")
                    loadRecentEntries()
                }
                is Resource.Error -> {
                    _submitStatus.value = Resource.Error(result.message ?: "Unknown error occurred.")
                }
                is Resource.Loading -> { /* No-op */ }
            }
        }

        fun deleteEntry(entry: RecentEntry) {
            viewModelScope.launch {
                _submitStatus.value = Resource.Loading<Unit>()
                val result =
                    if (entry.isSales) {
                        salesRepository.delete(entry.id)
                    } else {
                        wastageRepository.delete(entry.id)
                    }

                when (result) {
                    is Resource.Success -> {
                        submittedEntries.remove(entry)
                        _submitStatus.value = Resource.Success<Unit>(Unit, "Entry deleted successfully!")
                        loadRecentEntries()
                    }
                    is Resource.Error -> {
                        _submitStatus.value = Resource.Error<Unit>(result.message ?: "Failed to delete entry.")
                    }
                    is Resource.Loading -> { /* Do nothing */ }
                }
            }
        }

        // Existing functions...

        private fun fetchIngredients() {
            viewModelScope.launch {
                _ingredients.value = Resource.Loading<List<IngredientDto>>()
                _ingredients.value = ingredientsRepository.getAll()
            }
        }

        private fun fetchRecipes() {
            viewModelScope.launch {
                _mainRecipes.value = Resource.Loading<List<RecipeDto>>()
                _subRecipes.value = Resource.Loading<List<RecipeDto>>()
                when (val result = recipesRepository.getAll()) {
                    is Resource.Success -> {
                        val allRecipes = result.data ?: emptyList()
                        _mainRecipes.value = Resource.Success(allRecipes.filter { !it.isSubRecipe })
                        _subRecipes.value = Resource.Success(allRecipes.filter { it.isSubRecipe })
                    }
                    is Resource.Error -> {
                        val error = Resource.Error<List<RecipeDto>>(result.message ?: "Failed to load recipes")
                        _mainRecipes.value = error
                        _subRecipes.value = error
                    }
                    is Resource.Loading -> { /* Loading */ }
                }
            }
        }

        private fun loadTodayEntries() {
            viewModelScope.launch {
                val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                val entries = mutableListOf<RecentEntry>()

                when (val salesResult = salesRepository.getAll(todayStr, todayStr)) {
                    is Resource.Success -> {
                        salesResult.data?.forEach { sale ->
                            entries.add(
                                RecentEntry(
                                    id = sale.id,
                                    name = sale.recipeName,
                                    quantity = sale.quantity.toDouble(),
                                    unit = "plates",
                                    date = sale.date,
                                    time = extractTime(sale.updatedAt),
                                    isSales = true,
                                ),
                            )
                        }
                    }
                    else -> { /* Silently skip if fetch fails */ }
                }

                when (val wastageResult = wastageRepository.getAll(todayStr, todayStr)) {
                    is Resource.Success -> {
                        wastageResult.data?.forEach { wastage ->
                            entries.add(
                                RecentEntry(
                                    id = wastage.id,
                                    name = wastage.displayName,
                                    quantity = wastage.quantity,
                                    unit = wastage.unit,
                                    date = wastage.date,
                                    time = extractTime(wastage.updatedAt),
                                    isSales = false,
                                ),
                            )
                        }
                    }
                    else -> { /* Silently skip if fetch fails */ }
                }

                submittedEntries.clear()
                submittedEntries.addAll(entries)
                loadRecentEntries()
            }
        }

        private fun extractTime(timestamp: String): String {
            return try {
                val apiFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                val date = apiFormat.parse(timestamp)
                date?.let { timeFormat.format(it) } ?: "00:00"
            } catch (e: java.text.ParseException) {
                Log.w(TAG, "Failed to parse timestamp: $timestamp", e)
                "00:00"
            }
        }

        private fun loadRecentEntries() {
            val currentMode = _isSalesMode.value ?: true
            _recentEntries.value = submittedEntries.filter { it.isSales == currentMode }.toList()
        }
    }
