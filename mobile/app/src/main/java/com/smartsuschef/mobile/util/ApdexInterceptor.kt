package com.smartsuschef.mobile.util

import android.util.Log
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException

class ApdexInterceptor : Interceptor {
    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val startTime = System.nanoTime()
        val request = chain.request()
        val response = chain.proceed(request)
        val durationMs = (System.nanoTime() - startTime) / 1_000_000.0

        Log.i(
            "ApdexMetrics",
            "Endpoint=${request.url.encodedPath}, Method=${request.method}, StatusCode=${response.code}, DurationMs=${String.format("%.2f", durationMs)}"
        )

        return response
    }
}
