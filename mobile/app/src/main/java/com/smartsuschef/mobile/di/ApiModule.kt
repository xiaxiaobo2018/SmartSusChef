package com.smartsuschef.mobile.di

import com.smartsuschef.mobile.network.api.AuthApiService
import com.smartsuschef.mobile.network.api.ForecastApiService
import com.smartsuschef.mobile.network.api.IngredientApiService
import com.smartsuschef.mobile.network.api.RecipeApiService
import com.smartsuschef.mobile.network.api.SalesApiService
import com.smartsuschef.mobile.network.api.StoreApiService
import com.smartsuschef.mobile.network.api.WastageApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ApiModule {
    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService =
        retrofit.create(AuthApiService::class.java)

    @Provides
    @Singleton
    fun provideSalesApiService(retrofit: Retrofit): SalesApiService =
        retrofit.create(SalesApiService::class.java)

    @Provides
    @Singleton
    fun provideWastageApiService(retrofit: Retrofit): WastageApiService =
        retrofit.create(WastageApiService::class.java)

    @Provides
    @Singleton
    fun provideForecastApiService(retrofit: Retrofit): ForecastApiService =
        retrofit.create(ForecastApiService::class.java)

    @Provides
    @Singleton
    fun provideRecipeApiService(retrofit: Retrofit): RecipeApiService =
        retrofit.create(RecipeApiService::class.java)

    @Provides
    @Singleton
    fun provideIngredientApiService(retrofit: Retrofit): IngredientApiService =
        retrofit.create(IngredientApiService::class.java)

    @Provides
    @Singleton
    fun provideStoreApiService(retrofit: Retrofit): StoreApiService =
        retrofit.create(StoreApiService::class.java)
}
