package com.smartsuschef.mobile.network.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class WastageDtosTest {
    private val gson = Gson()

    // ---- WastageDataDto ----

    @Test
    fun `WastageDataDto deserialization with ingredientId`() {
        val json =
            """
            {
                "id": "w1",
                "date": "2026-02-10",
                "ingredientId": "i1",
                "displayName": "Rice",
                "unit": "kg",
                "quantity": 2.5,
                "carbonFootprint": 1.8,
                "createdAt": "2026-02-10T10:00:00Z",
                "updatedAt": "2026-02-10T10:00:00Z"
            }
            """.trimIndent()
        val dto = gson.fromJson(json, WastageDataDto::class.java)
        assertEquals("w1", dto.id)
        assertEquals("2026-02-10", dto.date)
        assertEquals("i1", dto.ingredientId)
        assertNull(dto.recipeId)
        assertEquals("Rice", dto.displayName)
        assertEquals("kg", dto.unit)
        assertEquals(2.5, dto.quantity, 0.001)
        assertEquals(1.8, dto.carbonFootprint, 0.001)
    }

    @Test
    fun `WastageDataDto deserialization with recipeId`() {
        val json =
            """
            {
                "id": "w2",
                "date": "2026-02-10",
                "recipeId": "r1",
                "displayName": "Chicken Rice",
                "unit": "portion",
                "quantity": 3.0,
                "carbonFootprint": 5.0,
                "createdAt": "",
                "updatedAt": ""
            }
            """.trimIndent()
        val dto = gson.fromJson(json, WastageDataDto::class.java)
        assertNull(dto.ingredientId)
        assertEquals("r1", dto.recipeId)
        assertEquals("Chicken Rice", dto.displayName)
    }

    @Test
    fun `WastageDataDto serialization round-trip`() {
        val original = WastageDataDto("w1", "2026-02-10", "i1", null, "Rice", "kg", 2.0, 1.5, "", "")
        val json = gson.toJson(original)
        val restored = gson.fromJson(json, WastageDataDto::class.java)
        assertEquals(original, restored)
    }

    // ---- CreateWastageDataRequest ----

    @Test
    fun `CreateWastageDataRequest serialization with ingredientId`() {
        val request =
            CreateWastageDataRequest(
                date = "2026-02-10",
                ingredientId = "i1",
                quantity = 2.0,
            )
        val json = gson.toJson(request)
        assertTrue(json.contains("\"date\":\"2026-02-10\""))
        assertTrue(json.contains("\"ingredientId\":\"i1\""))
        assertTrue(json.contains("\"quantity\":2.0"))
    }

    @Test
    fun `CreateWastageDataRequest serialization with recipeId`() {
        val request =
            CreateWastageDataRequest(
                date = "2026-02-10",
                recipeId = "r1",
                quantity = 3.0,
            )
        val json = gson.toJson(request)
        assertTrue(json.contains("\"recipeId\":\"r1\""))
    }

    @Test
    fun `CreateWastageDataRequest defaults to null ids`() {
        val request = CreateWastageDataRequest(date = "2026-02-10", quantity = 1.0)
        assertNull(request.ingredientId)
        assertNull(request.recipeId)
    }

    // ---- UpdateWastageDataRequest ----

    @Test
    fun `UpdateWastageDataRequest serialization`() {
        val request =
            UpdateWastageDataRequest(
                date = "2026-02-10",
                ingredientId = "i1",
                quantity = 5.0,
            )
        val json = gson.toJson(request)
        assertTrue(json.contains("\"date\":\"2026-02-10\""))
        assertTrue(json.contains("\"ingredientId\":\"i1\""))
        assertTrue(json.contains("\"quantity\":5.0"))
    }

    @Test
    fun `UpdateWastageDataRequest defaults to null ids`() {
        val request = UpdateWastageDataRequest(date = "2026-02-10", quantity = 1.0)
        assertNull(request.ingredientId)
        assertNull(request.recipeId)
    }

    // ---- WastageTrendDto ----

    @Test
    fun `WastageTrendDto deserialization with item breakdown`() {
        val json =
            """
            {
                "date": "2026-02-10",
                "totalQuantity": 15.5,
                "totalCarbonFootprint": 3.2,
                "itemBreakdown": [
                    {"ingredientId":"i1","displayName":"Rice","unit":"kg","quantity":2.0,"carbonFootprint":1.5}
                ]
            }
            """.trimIndent()
        val dto = gson.fromJson(json, WastageTrendDto::class.java)
        assertEquals("2026-02-10", dto.date)
        assertEquals(15.5, dto.totalQuantity, 0.001)
        assertEquals(3.2, dto.totalCarbonFootprint, 0.001)
        assertEquals(1, dto.itemBreakdown.size)
        assertEquals("Rice", dto.itemBreakdown[0].displayName)
    }

    @Test
    fun `WastageTrendDto with empty breakdown`() {
        val json = """{"date":"2026-02-10","totalQuantity":0.0,"totalCarbonFootprint":0.0,"itemBreakdown":[]}"""
        val dto = gson.fromJson(json, WastageTrendDto::class.java)
        assertEquals(0.0, dto.totalQuantity, 0.001)
        assertTrue(dto.itemBreakdown.isEmpty())
    }

    // ---- ItemWastageDto ----

    @Test
    fun `ItemWastageDto deserialization with ingredientId`() {
        val json =
            """
            {"ingredientId":"i1","displayName":"Rice","unit":"kg","quantity":2.0,"carbonFootprint":1.5}
            """.trimIndent()
        val dto = gson.fromJson(json, ItemWastageDto::class.java)
        assertEquals("i1", dto.ingredientId)
        assertNull(dto.recipeId)
        assertEquals("Rice", dto.displayName)
        assertEquals("kg", dto.unit)
        assertEquals(2.0, dto.quantity, 0.001)
        assertEquals(1.5, dto.carbonFootprint, 0.001)
    }

    @Test
    fun `ItemWastageDto deserialization with recipeId`() {
        val json =
            """
            {"recipeId":"r1","displayName":"Chicken Rice","unit":"portion","quantity":1.0,"carbonFootprint":3.0}
            """.trimIndent()
        val dto = gson.fromJson(json, ItemWastageDto::class.java)
        assertNull(dto.ingredientId)
        assertEquals("r1", dto.recipeId)
    }

    @Test
    fun `ItemWastageDto equality`() {
        val a = ItemWastageDto("i1", null, "Rice", "kg", 2.0, 1.5)
        val b = ItemWastageDto("i1", null, "Rice", "kg", 2.0, 1.5)
        assertEquals(a, b)
    }
}
