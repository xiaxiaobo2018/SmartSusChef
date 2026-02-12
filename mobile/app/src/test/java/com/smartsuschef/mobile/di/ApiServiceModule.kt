package com.smartsuschef.mobile.di

import com.smartsuschef.mobile.network.api.AuthApiService
import com.smartsuschef.mobile.network.api.ForecastApiService
import com.smartsuschef.mobile.network.api.IngredientApiService
import com.smartsuschef.mobile.network.api.MockAuthApiService
import com.smartsuschef.mobile.network.api.MockForecastApiService
import com.smartsuschef.mobile.network.api.MockIngredientApiService
import com.smartsuschef.mobile.network.api.MockRecipeApiService
import com.smartsuschef.mobile.network.api.MockSalesApiService
import com.smartsuschef.mobile.network.api.MockStoreApiService
import com.smartsuschef.mobile.network.api.MockWastageApiService
import com.smartsuschef.mobile.network.api.RecipeApiService
import com.smartsuschef.mobile.network.api.SalesApiService
import com.smartsuschef.mobile.network.api.StoreApiService
import com.smartsuschef.mobile.network.api.WastageApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn
import javax.inject.Singleton

/**
 * Hilt Module for providing MOCK ApiService implementations.
 * This module is only included in in test source sets.
 */
@Module
@TestInstallIn(
    components = [SingletonComponent::class],
    replaces = [ApiModule::class],
)
object ApiServiceModule {
    @Provides
    @Singleton
    fun provideAuthApiService(): AuthApiService = MockAuthApiService()

    @Provides
    @Singleton
    fun provideSalesApiService(): SalesApiService = MockSalesApiService()

    @Provides
    @Singleton
    fun provideWastageApiService(): WastageApiService = MockWastageApiService()

    @Provides
    @Singleton
    fun provideForecastApiService(): ForecastApiService = MockForecastApiService()

    @Provides
    @Singleton
    fun provideRecipeApiService(): RecipeApiService = MockRecipeApiService()

    @Provides
    @Singleton
    fun provideIngredientApiService(): IngredientApiService = MockIngredientApiService()

    @Provides
    @Singleton
    fun provideStoreApiService(): StoreApiService = MockStoreApiService()
}
