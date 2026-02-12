package com.smartsuschef.mobile.util

import android.util.Log
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.MockedStatic
import org.mockito.Mockito
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

class ApdexInterceptorTest {
    private val interceptor = ApdexInterceptor()
    private lateinit var logMock: MockedStatic<Log>

    @Before
    fun setUp() {
        logMock = Mockito.mockStatic(Log::class.java)
    }

    @After
    fun tearDown() {
        logMock.close()
    }

    private fun createChain(
        request: Request,
        responseCode: Int = 200,
    ): Interceptor.Chain {
        val chain = mock<Interceptor.Chain>()
        whenever(chain.request()).thenReturn(request)
        val response =
            Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(responseCode)
                .message("OK")
                .build()
        whenever(chain.proceed(any())).thenReturn(response)
        return chain
    }

    @Test
    fun `intercept returns response from chain`() {
        val request = Request.Builder().url("http://localhost/api/test").build()
        val chain = createChain(request, 200)

        val response = interceptor.intercept(chain)

        assertEquals(200, response.code)
    }

    @Test
    fun `intercept passes original request to chain`() {
        val request =
            Request.Builder()
                .url("http://localhost/api/sales/trend")
                .addHeader("Authorization", "Bearer token")
                .build()
        val chain = createChain(request, 200)

        interceptor.intercept(chain)

        val captor = argumentCaptor<Request>()
        verify(chain).proceed(captor.capture())
        assertEquals("/api/sales/trend", captor.firstValue.url.encodedPath)
        assertEquals("Bearer token", captor.firstValue.header("Authorization"))
    }

    @Test
    fun `intercept preserves error response code`() {
        val request = Request.Builder().url("http://localhost/api/test").build()
        val chain = createChain(request, 500)

        val response = interceptor.intercept(chain)

        assertEquals(500, response.code)
    }

    @Test
    fun `intercept works with POST request`() {
        val body = """{"test": true}""".toRequestBody("application/json".toMediaType())
        val request =
            Request.Builder()
                .url("http://localhost/api/data")
                .post(body)
                .build()
        val chain = createChain(request, 201)

        val response = interceptor.intercept(chain)

        assertEquals(201, response.code)
    }
}
