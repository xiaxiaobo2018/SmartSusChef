package com.smartsuschef.mobile.network.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SalesDtosTest {
    private val gson = Gson()

    // ---- SalesDataDto ----

    @Test
    fun `SalesDataDto deserialization maps all fields`() {
        val json =
            """
            {
                "id": "s1",
                "date": "2026-02-10",
                "recipeId": "r1",
                "recipeName": "Chicken Rice",
                "quantity": 50,
                "createdAt": "2026-02-10T10:00:00Z",
                "updatedAt": "2026-02-10T10:00:00Z"
            }
            """.trimIndent()
        val dto = gson.fromJson(json, SalesDataDto::class.java)
        assertEquals("s1", dto.id)
        assertEquals("2026-02-10", dto.date)
        assertEquals("r1", dto.recipeId)
        assertEquals("Chicken Rice", dto.recipeName)
        assertEquals(50, dto.quantity)
    }

    @Test
    fun `SalesDataDto serialization round-trip`() {
        val original = SalesDataDto("s1", "2026-02-10", "r1", "Pizza", 30, "", "")
        val json = gson.toJson(original)
        val restored = gson.fromJson(json, SalesDataDto::class.java)
        assertEquals(original, restored)
    }

    // ---- CreateSalesDataRequest ----

    @Test
    fun `CreateSalesDataRequest serialization`() {
        val request = CreateSalesDataRequest(date = "2026-02-10", recipeId = "r1", quantity = 25)
        val json = gson.toJson(request)
        assertTrue(json.contains("\"date\":\"2026-02-10\""))
        assertTrue(json.contains("\"recipeId\":\"r1\""))
        assertTrue(json.contains("\"quantity\":25"))
    }

    @Test
    fun `CreateSalesDataRequest deserialization`() {
        val json = """{"date":"2026-02-10","recipeId":"r1","quantity":25}"""
        val request = gson.fromJson(json, CreateSalesDataRequest::class.java)
        assertEquals("2026-02-10", request.date)
        assertEquals("r1", request.recipeId)
        assertEquals(25, request.quantity)
    }

    // ---- UpdateSalesDataRequest ----

    @Test
    fun `UpdateSalesDataRequest serialization`() {
        val request = UpdateSalesDataRequest(quantity = 42)
        val json = gson.toJson(request)
        assertTrue(json.contains("\"quantity\":42"))
    }

    // ---- SalesTrendDto ----

    @Test
    fun `SalesTrendDto deserialization with recipe breakdown`() {
        val json =
            """
            {
                "date": "2026-02-10",
                "totalQuantity": 150,
                "recipeBreakdown": [
                    {"recipeId": "r1", "recipeName": "Chicken Rice", "quantity": 80},
                    {"recipeId": "r2", "recipeName": "Nasi Lemak", "quantity": 70}
                ]
            }
            """.trimIndent()
        val dto = gson.fromJson(json, SalesTrendDto::class.java)
        assertEquals("2026-02-10", dto.date)
        assertEquals(150, dto.totalQuantity)
        assertEquals(2, dto.recipeBreakdown.size)
        assertEquals("Chicken Rice", dto.recipeBreakdown[0].recipeName)
    }

    @Test
    fun `SalesTrendDto with empty breakdown`() {
        val json = """{"date":"2026-02-10","totalQuantity":0,"recipeBreakdown":[]}"""
        val dto = gson.fromJson(json, SalesTrendDto::class.java)
        assertEquals(0, dto.totalQuantity)
        assertTrue(dto.recipeBreakdown.isEmpty())
    }

    // ---- RecipeSalesDto ----

    @Test
    fun `RecipeSalesDto deserialization`() {
        val json = """{"recipeId":"r1","recipeName":"Pizza","quantity":30}"""
        val dto = gson.fromJson(json, RecipeSalesDto::class.java)
        assertEquals("r1", dto.recipeId)
        assertEquals("Pizza", dto.recipeName)
        assertEquals(30, dto.quantity)
    }

    // ---- IngredientUsageDto ----

    @Test
    fun `IngredientUsageDto deserialization`() {
        val json = """{"ingredientId":"i1","ingredientName":"Rice","unit":"kg","quantity":10.5}"""
        val dto = gson.fromJson(json, IngredientUsageDto::class.java)
        assertEquals("i1", dto.ingredientId)
        assertEquals("Rice", dto.ingredientName)
        assertEquals("kg", dto.unit)
        assertEquals(10.5, dto.quantity, 0.001)
    }

    // ---- ImportSalesDataRequest ----

    @Test
    fun `ImportSalesDataRequest serialization with multiple items`() {
        val items =
            listOf(
                CreateSalesDataRequest("2026-02-10", "r1", 50),
                CreateSalesDataRequest("2026-02-10", "r2", 30),
            )
        val request = ImportSalesDataRequest(salesData = items)
        val json = gson.toJson(request)
        assertTrue(json.contains("\"salesData\""))
        assertTrue(json.contains("\"r1\""))
        assertTrue(json.contains("\"r2\""))
    }

    @Test
    fun `ImportSalesDataRequest with empty list`() {
        val request = ImportSalesDataRequest(salesData = emptyList())
        val json = gson.toJson(request)
        assertTrue(json.contains("\"salesData\":[]"))
    }

    // ---- SalesWithSignalsDto ----

    @Test
    fun `SalesWithSignalsDto deserialization`() {
        val json =
            """
            {
                "date": "2026-02-10",
                "totalQuantity": 100,
                "isHoliday": true,
                "holidayName": "National Day",
                "rainMm": 5.0,
                "weatherDesc": "Rainy",
                "recipes": [{"recipeId":"r1","recipeName":"Rice","quantity":100}]
            }
            """.trimIndent()
        val dto = gson.fromJson(json, SalesWithSignalsDto::class.java)
        assertEquals("2026-02-10", dto.date)
        assertEquals(100, dto.totalQuantity)
        assertTrue(dto.isHoliday)
        assertEquals("National Day", dto.holidayName)
        assertEquals(5.0, dto.rainMm, 0.001)
        assertEquals("Rainy", dto.weatherDesc)
        assertEquals(1, dto.recipes.size)
    }

    @Test
    fun `SalesWithSignalsDto with no holiday`() {
        val json =
            """
            {"date":"2026-02-10","totalQuantity":50,"isHoliday":false,"holidayName":"","rainMm":0.0,"weatherDesc":"Clear","recipes":[]}
            """.trimIndent()
        val dto = gson.fromJson(json, SalesWithSignalsDto::class.java)
        assertFalse(dto.isHoliday)
        assertTrue(dto.recipes.isEmpty())
    }
}
