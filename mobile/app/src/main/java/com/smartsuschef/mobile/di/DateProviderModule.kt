package com.smartsuschef.mobile.di

import com.smartsuschef.mobile.util.DateProvider
import com.smartsuschef.mobile.util.DefaultDateProvider
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DateProviderModule {
    @Provides
    @Singleton
    fun provideDateProvider(): DateProvider = DefaultDateProvider()
}
