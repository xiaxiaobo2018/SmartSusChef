package com.smartsuschef.mobile.util

import android.util.Log
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import java.util.Locale

class ApdexInterceptor : Interceptor {
    companion object {
        private const val NANOS_PER_MILLISECOND = 1_000_000.0
    }

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val startTime = System.nanoTime()
        val request = chain.request()
        val response = chain.proceed(request)
        val durationMs = (System.nanoTime() - startTime) / NANOS_PER_MILLISECOND

        Log.i(
            "ApdexMetrics",
            "Endpoint=${request.url.encodedPath}, Method=${request.method}, StatusCode=${response.code}, DurationMs=${String.format(
                Locale.US,
                "%.2f",
                durationMs,
            )}",
        )

        return response
    }
}
