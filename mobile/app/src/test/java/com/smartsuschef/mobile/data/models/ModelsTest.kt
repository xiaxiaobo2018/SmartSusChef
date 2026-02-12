package com.smartsuschef.mobile.data.models

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ModelsTest {
    // ---- ForecastData ----

    @Test
    fun `ForecastData construction and field access`() {
        val data = ForecastData("f1", 1, "r1", "2026-02-11", 80, "2026-01-01", "2026-01-01")
        assertEquals("f1", data.id)
        assertEquals(1, data.storeId)
        assertEquals("r1", data.recipeId)
        assertEquals("2026-02-11", data.forecastDate)
        assertEquals(80, data.predictedQuantity)
    }

    @Test
    fun `ForecastData equality`() {
        val a = ForecastData("f1", 1, "r1", "2026-02-11", 80, "", "")
        val b = ForecastData("f1", 1, "r1", "2026-02-11", 80, "", "")
        assertEquals(a, b)
    }

    @Test
    fun `ForecastData copy with modified field`() {
        val original = ForecastData("f1", 1, "r1", "2026-02-11", 80, "", "")
        val copy = original.copy(predictedQuantity = 100)
        assertEquals(100, copy.predictedQuantity)
        assertEquals("f1", copy.id)
    }

    // ---- GlobalCalendarSignals ----

    @Test
    fun `GlobalCalendarSignals construction`() {
        val signals =
            GlobalCalendarSignals(
                date = "2026-02-14",
                isHoliday = true,
                holidayName = "Valentine's Day",
                isSchoolHoliday = false,
                rainMm = 0.0,
                weatherDesc = "Clear",
            )
        assertEquals("2026-02-14", signals.date)
        assertTrue(signals.isHoliday)
        assertEquals("Valentine's Day", signals.holidayName)
        assertFalse(signals.isSchoolHoliday)
        assertEquals(0.0, signals.rainMm, 0.001)
        assertEquals("Clear", signals.weatherDesc)
    }

    @Test
    fun `GlobalCalendarSignals equality`() {
        val a = GlobalCalendarSignals("2026-02-14", true, "V-Day", false, 0.0, "Clear")
        val b = GlobalCalendarSignals("2026-02-14", true, "V-Day", false, 0.0, "Clear")
        assertEquals(a, b)
    }

    // ---- Ingredient ----

    @Test
    fun `Ingredient construction and field access`() {
        val ingredient = Ingredient("i1", "Rice", 1, "kg", 1.2, "2026-01-01", "2026-01-01")
        assertEquals("i1", ingredient.id)
        assertEquals("Rice", ingredient.name)
        assertEquals(1, ingredient.storeId)
        assertEquals("kg", ingredient.unit)
        assertEquals(1.2, ingredient.carbonFootprint, 0.001)
    }

    @Test
    fun `Ingredient equality and inequality`() {
        val a = Ingredient("i1", "Rice", 1, "kg", 1.2, "", "")
        val b = Ingredient("i1", "Rice", 1, "kg", 1.2, "", "")
        val c = Ingredient("i2", "Chicken", 1, "kg", 5.0, "", "")
        assertEquals(a, b)
        assertNotEquals(a, c)
    }

    // ---- Recipe ----

    @Test
    fun `Recipe construction with default empty ingredients`() {
        val recipe = Recipe("r1", 1, "Chicken Rice", false, true, "2026-01-01", "2026-01-01")
        assertEquals("r1", recipe.id)
        assertEquals("Chicken Rice", recipe.name)
        assertFalse(recipe.isSubRecipe)
        assertTrue(recipe.isSellable)
        assertTrue(recipe.recipeIngredients.isEmpty())
    }

    @Test
    fun `Recipe construction with ingredients`() {
        val ingredients =
            listOf(
                RecipeIngredient("ri1", "r1", "i1", null, 0.5),
            )
        val recipe = Recipe("r1", 1, "Pizza", false, true, "", "", ingredients)
        assertEquals(1, recipe.recipeIngredients.size)
        assertEquals("ri1", recipe.recipeIngredients[0].id)
    }

    @Test
    fun `Recipe copy changes name but keeps ingredients`() {
        val ingredients = listOf(RecipeIngredient("ri1", "r1", "i1", null, 0.5))
        val original = Recipe("r1", 1, "Old Name", false, true, "", "", ingredients)
        val copy = original.copy(name = "New Name")
        assertEquals("New Name", copy.name)
        assertEquals(1, copy.recipeIngredients.size)
    }

    // ---- RecipeIngredient ----

    @Test
    fun `RecipeIngredient with ingredientId`() {
        val ri = RecipeIngredient("ri1", "r1", "i1", null, 0.5)
        assertEquals("ri1", ri.id)
        assertEquals("r1", ri.recipeId)
        assertEquals("i1", ri.ingredientId)
        assertNull(ri.childRecipeId)
        assertEquals(0.5, ri.quantity, 0.001)
        assertNull(ri.ingredient)
    }

    @Test
    fun `RecipeIngredient with childRecipeId`() {
        val ri = RecipeIngredient("ri2", "r1", null, "r2", 1.0)
        assertNull(ri.ingredientId)
        assertEquals("r2", ri.childRecipeId)
    }

    @Test
    fun `RecipeIngredient with nested ingredient`() {
        val ingredient = Ingredient("i1", "Rice", 1, "kg", 1.2, "", "")
        val ri = RecipeIngredient("ri1", "r1", "i1", null, 0.5, ingredient)
        assertEquals("Rice", ri.ingredient?.name)
    }

    // ---- SalesData ----

    @Test
    fun `SalesData construction`() {
        val data = SalesData("s1", 1, "2026-02-10", "r1", 50, "2026-02-10", "2026-02-10")
        assertEquals("s1", data.id)
        assertEquals(1, data.storeId)
        assertEquals("2026-02-10", data.date)
        assertEquals("r1", data.recipeId)
        assertEquals(50, data.quantity)
    }

    @Test
    fun `SalesData equality`() {
        val a = SalesData("s1", 1, "2026-02-10", "r1", 50, "", "")
        val b = SalesData("s1", 1, "2026-02-10", "r1", 50, "", "")
        assertEquals(a, b)
    }

    // ---- Store ----

    @Test
    fun `Store construction with nullable fields`() {
        val store =
            Store(
                id = 1,
                companyName = "Test Co",
                uen = "REG-001",
                storeName = "Test Store",
                outletLocation = "Singapore",
                openingDate = "2025-01-01",
                latitude = 1.3521,
                longitude = 103.8198,
                countryCode = "SG",
                address = "123 Test St",
                contactNumber = "+65-12345678",
                isActive = true,
                createdAt = "",
                updatedAt = "",
            )
        assertEquals(1, store.id)
        assertEquals("Test Co", store.companyName)
        assertEquals("SG", store.countryCode)
        assertEquals("123 Test St", store.address)
        assertTrue(store.isActive)
    }

    @Test
    fun `Store with null optional fields`() {
        val store = Store(1, "Co", "U", "S", "L", "2025-01-01", 0.0, 0.0, null, null, "", true, "", "")
        assertNull(store.countryCode)
        assertNull(store.address)
    }

    // ---- User ----

    @Test
    fun `User construction with UserRole`() {
        val user = User("u1", 1, "admin", "admin@test.com", "Admin", UserRole.Manager, "", "")
        assertEquals("u1", user.id)
        assertEquals("admin", user.username)
        assertEquals(UserRole.Manager, user.role)
    }

    @Test
    fun `User equality`() {
        val a = User("u1", 1, "admin", "a@t.com", "Admin", UserRole.Manager, "", "")
        val b = User("u1", 1, "admin", "a@t.com", "Admin", UserRole.Manager, "", "")
        assertEquals(a, b)
    }

    @Test
    fun `User inequality when role differs`() {
        val a = User("u1", 1, "admin", "a@t.com", "Admin", UserRole.Manager, "", "")
        val b = User("u1", 1, "admin", "a@t.com", "Admin", UserRole.Employee, "", "")
        assertNotEquals(a, b)
    }

    // ---- WastageData ----

    @Test
    fun `WastageData with ingredientId`() {
        val data = WastageData("w1", 1, "2026-02-10", "i1", null, 2.5, "", "")
        assertEquals("w1", data.id)
        assertEquals("i1", data.ingredientId)
        assertNull(data.recipeId)
        assertEquals(2.5, data.quantity, 0.001)
    }

    @Test
    fun `WastageData with recipeId`() {
        val data = WastageData("w2", 1, "2026-02-10", null, "r1", 3.0, "", "")
        assertNull(data.ingredientId)
        assertEquals("r1", data.recipeId)
    }

    @Test
    fun `WastageData equality`() {
        val a = WastageData("w1", 1, "2026-02-10", "i1", null, 2.5, "", "")
        val b = WastageData("w1", 1, "2026-02-10", "i1", null, 2.5, "", "")
        assertEquals(a, b)
    }
}
