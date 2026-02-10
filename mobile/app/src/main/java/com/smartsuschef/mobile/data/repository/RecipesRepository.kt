package com.smartsuschef.mobile.data.repository

import android.util.Log
import com.smartsuschef.mobile.network.api.RecipeApiService
import com.smartsuschef.mobile.network.dto.CreateRecipeRequest
import com.smartsuschef.mobile.network.dto.RecipeDto
import com.smartsuschef.mobile.util.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class RecipesRepository
    @Inject
    constructor(
        private val recipeApiService: RecipeApiService,
    ) {
        companion object {
            private const val TAG = "RecipesRepository"
        }

        suspend fun getAll(): Resource<List<RecipeDto>> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = recipeApiService.getAll()
                    if (response.isSuccessful) {
                        Resource.Success(response.body() ?: emptyList())
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to fetch recipes: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                }
            }
        }

        suspend fun create(request: CreateRecipeRequest): Resource<RecipeDto> {
            return withContext(Dispatchers.IO) {
                try {
                    val response = recipeApiService.create(request)
                    if (response.isSuccessful) {
                        Resource.Success(response.body()!!)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        Resource.Error("Failed to add recipe: ${errorBody ?: response.message()}")
                    }
                } catch (e: HttpException) {
                    Log.e(TAG, "HTTP error in repository: ${e.message()}", e)
                    Resource.Error("An unexpected error occurred: ${e.message()}")
                } catch (e: IOException) {
                    Log.e(TAG, "Network error in repository: ${e.message}", e)
                    Resource.Error("Couldn't reach the server. Check your internet connection.")
                }
            }
        }
    }
