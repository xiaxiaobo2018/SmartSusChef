package com.smartsuschef.mobile.network.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class IngredientDtosTest {
    private val gson = Gson()

    // ---- IngredientDto ----

    @Test
    fun `IngredientDto deserialization maps all fields`() {
        val json =
            """
            {
                "id": "i1",
                "name": "Rice",
                "unit": "kg",
                "carbonFootprint": 1.2,
                "createdAt": "2026-01-01T00:00:00Z",
                "updatedAt": "2026-02-01T00:00:00Z"
            }
            """.trimIndent()
        val dto = gson.fromJson(json, IngredientDto::class.java)
        assertEquals("i1", dto.id)
        assertEquals("Rice", dto.name)
        assertEquals("kg", dto.unit)
        assertEquals(1.2, dto.carbonFootprint, 0.001)
        assertEquals("2026-01-01T00:00:00Z", dto.createdAt)
        assertEquals("2026-02-01T00:00:00Z", dto.updatedAt)
    }

    @Test
    fun `IngredientDto serialization round-trip`() {
        val original = IngredientDto("i1", "Rice", "kg", 1.2, "2026-01-01", "2026-01-01")
        val json = gson.toJson(original)
        val restored = gson.fromJson(json, IngredientDto::class.java)
        assertEquals(original, restored)
    }

    @Test
    fun `IngredientDto equality`() {
        val a = IngredientDto("i1", "Rice", "kg", 1.2, "", "")
        val b = IngredientDto("i1", "Rice", "kg", 1.2, "", "")
        assertEquals(a, b)
    }

    // ---- CreateIngredientRequest ----

    @Test
    fun `CreateIngredientRequest serialization`() {
        val request = CreateIngredientRequest(name = "Chicken", unit = "kg", carbonFootprint = 5.0)
        val json = gson.toJson(request)
        assertTrue(json.contains("\"name\":\"Chicken\""))
        assertTrue(json.contains("\"unit\":\"kg\""))
        assertTrue(json.contains("\"carbonFootprint\":5.0"))
    }

    @Test
    fun `CreateIngredientRequest deserialization`() {
        val json = """{"name":"Chicken","unit":"kg","carbonFootprint":5.0}"""
        val request = gson.fromJson(json, CreateIngredientRequest::class.java)
        assertEquals("Chicken", request.name)
        assertEquals("kg", request.unit)
        assertEquals(5.0, request.carbonFootprint, 0.001)
    }

    // ---- UpdateIngredientRequest ----

    @Test
    fun `UpdateIngredientRequest serialization`() {
        val request = UpdateIngredientRequest(name = "Updated Rice", unit = "g", carbonFootprint = 0.8)
        val json = gson.toJson(request)
        assertTrue(json.contains("\"name\":\"Updated Rice\""))
        assertTrue(json.contains("\"unit\":\"g\""))
        assertTrue(json.contains("\"carbonFootprint\":0.8"))
    }

    @Test
    fun `UpdateIngredientRequest deserialization`() {
        val json = """{"name":"Rice","unit":"kg","carbonFootprint":1.5}"""
        val request = gson.fromJson(json, UpdateIngredientRequest::class.java)
        assertEquals("Rice", request.name)
        assertEquals("kg", request.unit)
        assertEquals(1.5, request.carbonFootprint, 0.001)
    }
}
