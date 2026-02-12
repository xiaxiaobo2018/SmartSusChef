package com.smartsuschef.mobile.network.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ForecastDtosTest {
    private val gson = Gson()

    // ---- ForecastDto ----

    @Test
    fun `ForecastDto deserialization with ingredients`() {
        val json =
            """
            {
                "date": "2026-02-11",
                "recipeId": "r1",
                "recipeName": "Chicken Rice",
                "quantity": 80,
                "confidence": "High",
                "ingredients": [
                    {"ingredientId": "i1", "ingredientName": "Rice", "unit": "kg", "quantity": 8.0}
                ]
            }
            """.trimIndent()
        val dto = gson.fromJson(json, ForecastDto::class.java)
        assertEquals("2026-02-11", dto.date)
        assertEquals("r1", dto.recipeId)
        assertEquals("Chicken Rice", dto.recipeName)
        assertEquals(80, dto.quantity)
        assertEquals("High", dto.confidence)
        assertEquals(1, dto.ingredients.size)
        assertEquals("Rice", dto.ingredients[0].ingredientName)
    }

    @Test
    fun `ForecastDto deserialization with empty ingredients`() {
        val json =
            """
            {"date":"2026-02-11","recipeId":"r1","recipeName":"Pizza","quantity":10,"confidence":"Low","ingredients":[]}
            """.trimIndent()
        val dto = gson.fromJson(json, ForecastDto::class.java)
        assertTrue(dto.ingredients.isEmpty())
    }

    @Test
    fun `ForecastDto equality`() {
        val ingredients = listOf(ForecastIngredientDto("i1", "Rice", "kg", 5.0))
        val a = ForecastDto("2026-02-11", "r1", "Pizza", 10, "High", ingredients)
        val b = ForecastDto("2026-02-11", "r1", "Pizza", 10, "High", ingredients)
        assertEquals(a, b)
    }

    // ---- ForecastIngredientDto ----

    @Test
    fun `ForecastIngredientDto deserialization`() {
        val json = """{"ingredientId":"i1","ingredientName":"Rice","unit":"kg","quantity":8.5}"""
        val dto = gson.fromJson(json, ForecastIngredientDto::class.java)
        assertEquals("i1", dto.ingredientId)
        assertEquals("Rice", dto.ingredientName)
        assertEquals("kg", dto.unit)
        assertEquals(8.5, dto.quantity, 0.001)
    }

    // ---- ForecastSummaryDto ----

    @Test
    fun `ForecastSummaryDto deserialization`() {
        val json = """{"date":"2026-02-11","totalQuantity":160,"changePercentage":5.5}"""
        val dto = gson.fromJson(json, ForecastSummaryDto::class.java)
        assertEquals("2026-02-11", dto.date)
        assertEquals(160, dto.totalQuantity)
        assertEquals(5.5, dto.changePercentage, 0.001)
    }

    // ---- WeatherDto ----

    @Test
    fun `WeatherDto deserialization`() {
        val json = """{"temperature":30.5,"condition":"Partly Cloudy","humidity":75,"description":"Partly Cloudy"}"""
        val dto = gson.fromJson(json, WeatherDto::class.java)
        assertEquals(30.5, dto.temperature, 0.001)
        assertEquals("Partly Cloudy", dto.condition)
        assertEquals(75, dto.humidity)
        assertEquals("Partly Cloudy", dto.description)
    }

    @Test
    fun `WeatherDto serialization round-trip`() {
        val original = WeatherDto(28.0, "Clear", 60, "Clear sky")
        val json = gson.toJson(original)
        val restored = gson.fromJson(json, WeatherDto::class.java)
        assertEquals(original, restored)
    }

    // ---- HolidayDto ----

    @Test
    fun `HolidayDto deserialization`() {
        val json = """{"date":"2026-02-14","name":"Valentine's Day"}"""
        val dto = gson.fromJson(json, HolidayDto::class.java)
        assertEquals("2026-02-14", dto.date)
        assertEquals("Valentine's Day", dto.name)
    }

    // ---- WeatherForecastDto ----

    @Test
    fun `WeatherForecastDto deserialization with all fields`() {
        val json =
            """
            {"date":"2026-02-12","temperatureMax":28.0,"temperatureMin":22.0,"rainMm":5.0,"weatherCode":800,"weatherDescription":"Partly Cloudy"}
            """.trimIndent()
        val dto = gson.fromJson(json, WeatherForecastDto::class.java)
        assertEquals("2026-02-12", dto.date)
        assertEquals(28.0, dto.temperatureMax!!, 0.001)
        assertEquals(22.0, dto.temperatureMin!!, 0.001)
        assertEquals(5.0, dto.rainMm, 0.001)
        assertEquals(800, dto.weatherCode)
        assertEquals("Partly Cloudy", dto.weatherDescription)
    }

    @Test
    fun `WeatherForecastDto with null optional fields`() {
        val json = """{"date":"2026-02-12","rainMm":0.0,"weatherCode":800,"weatherDescription":"Clear"}"""
        val dto = gson.fromJson(json, WeatherForecastDto::class.java)
        assertNull(dto.temperatureMax)
        assertNull(dto.temperatureMin)
    }

    // ---- CalendarDayDto ----

    @Test
    fun `CalendarDayDto deserialization with weather`() {
        val json =
            """
            {
                "date": "2026-02-12",
                "isHoliday": true,
                "holidayName": "Test Holiday",
                "isSchoolHoliday": false,
                "isWeekend": false,
                "weather": {"date":"2026-02-12","rainMm":0.0,"weatherCode":800,"weatherDescription":"Clear"}
            }
            """.trimIndent()
        val dto = gson.fromJson(json, CalendarDayDto::class.java)
        assertEquals("2026-02-12", dto.date)
        assertTrue(dto.isHoliday)
        assertEquals("Test Holiday", dto.holidayName)
        assertFalse(dto.isSchoolHoliday)
        assertFalse(dto.isWeekend)
        assertEquals(800, dto.weather?.weatherCode)
    }

    @Test
    fun `CalendarDayDto with null optional fields`() {
        val json = """{"date":"2026-02-12","isHoliday":false,"isSchoolHoliday":false,"isWeekend":true}"""
        val dto = gson.fromJson(json, CalendarDayDto::class.java)
        assertNull(dto.holidayName)
        assertNull(dto.weather)
        assertTrue(dto.isWeekend)
    }

    // ---- TomorrowForecastDto ----

    @Test
    fun `TomorrowForecastDto deserialization`() {
        val json =
            """
            {
                "date": "2026-02-12",
                "calendar": {
                    "date": "2026-02-12",
                    "isHoliday": false,
                    "isSchoolHoliday": false,
                    "isWeekend": false
                },
                "weather": {"date":"2026-02-12","rainMm":1.0,"weatherCode":801,"weatherDescription":"Cloudy"}
            }
            """.trimIndent()
        val dto = gson.fromJson(json, TomorrowForecastDto::class.java)
        assertEquals("2026-02-12", dto.date)
        assertFalse(dto.calendar.isHoliday)
        assertEquals("Cloudy", dto.weather?.weatherDescription)
    }

    @Test
    fun `TomorrowForecastDto with null weather`() {
        val json =
            """
            {
                "date": "2026-02-12",
                "calendar": {"date":"2026-02-12","isHoliday":false,"isSchoolHoliday":false,"isWeekend":false}
            }
            """.trimIndent()
        val dto = gson.fromJson(json, TomorrowForecastDto::class.java)
        assertNull(dto.weather)
    }
}
