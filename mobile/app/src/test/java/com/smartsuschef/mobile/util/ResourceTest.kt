package com.smartsuschef.mobile.util

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ResourceTest {
    @Test
    fun `Success contains data and null message by default`() {
        val resource = Resource.Success(data = "hello")
        assertEquals("hello", resource.data)
        assertNull(resource.message)
    }

    @Test
    fun `Success can carry optional message`() {
        val resource = Resource.Success(data = 42, message = "info")
        assertEquals(42, resource.data)
        assertEquals("info", resource.message)
    }

    @Test
    fun `Error contains message and null data by default`() {
        val resource = Resource.Error<String>(message = "Network error")
        assertEquals("Network error", resource.message)
        assertNull(resource.data)
    }

    @Test
    fun `Error can carry optional data`() {
        val resource = Resource.Error(message = "Stale", data = "cached")
        assertEquals("Stale", resource.message)
        assertEquals("cached", resource.data)
    }

    @Test
    fun `Loading has null data and null message`() {
        val resource = Resource.Loading<String>()
        assertNull(resource.data)
        assertNull(resource.message)
    }

    @Test
    fun `Success is instance of Resource`() {
        val resource: Resource<Int> = Resource.Success(1)
        assertTrue(resource is Resource.Success)
    }

    @Test
    fun `Error is instance of Resource`() {
        val resource: Resource<Int> = Resource.Error("fail")
        assertTrue(resource is Resource.Error)
    }

    @Test
    fun `Loading is instance of Resource`() {
        val resource: Resource<Int> = Resource.Loading()
        assertTrue(resource is Resource.Loading)
    }

    @Test
    fun `Success with list data`() {
        val resource = Resource.Success(data = listOf(1, 2, 3))
        assertEquals(3, resource.data?.size)
    }

    @Test
    fun `Success with empty list`() {
        val resource = Resource.Success(data = emptyList<String>())
        assertTrue(resource.data?.isEmpty() == true)
    }
}
