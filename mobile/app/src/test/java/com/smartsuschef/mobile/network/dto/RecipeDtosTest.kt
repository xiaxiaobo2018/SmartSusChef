package com.smartsuschef.mobile.network.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class RecipeDtosTest {
    private val gson = Gson()

    // ---- RecipeDto ----

    @Test
    fun `RecipeDto deserialization with ingredients`() {
        val json =
            """
            {
                "id": "r1",
                "name": "Chicken Rice",
                "isSellable": true,
                "isSubRecipe": false,
                "ingredients": [
                    {"ingredientId": "i1", "displayName": "Rice", "unit": "kg", "quantity": 0.2}
                ],
                "createdAt": "2026-01-01",
                "updatedAt": "2026-01-01"
            }
            """.trimIndent()
        val dto = gson.fromJson(json, RecipeDto::class.java)
        assertEquals("r1", dto.id)
        assertEquals("Chicken Rice", dto.name)
        assertTrue(dto.isSellable)
        assertFalse(dto.isSubRecipe)
        assertEquals(1, dto.ingredients.size)
        assertEquals("Rice", dto.ingredients[0].displayName)
    }

    @Test
    fun `RecipeDto deserialization with empty ingredients`() {
        val json =
            """
            {"id":"r1","name":"Test","isSellable":false,"isSubRecipe":true,"ingredients":[],"createdAt":"","updatedAt":""}
            """.trimIndent()
        val dto = gson.fromJson(json, RecipeDto::class.java)
        assertFalse(dto.isSellable)
        assertTrue(dto.isSubRecipe)
        assertTrue(dto.ingredients.isEmpty())
    }

    // ---- RecipeIngredientDto ----

    @Test
    fun `RecipeIngredientDto with ingredientId`() {
        val json = """{"ingredientId":"i1","displayName":"Rice","unit":"kg","quantity":0.5}"""
        val dto = gson.fromJson(json, RecipeIngredientDto::class.java)
        assertEquals("i1", dto.ingredientId)
        assertNull(dto.childRecipeId)
        assertEquals("Rice", dto.displayName)
        assertEquals("kg", dto.unit)
        assertEquals(0.5, dto.quantity, 0.001)
    }

    @Test
    fun `RecipeIngredientDto with childRecipeId`() {
        val json = """{"childRecipeId":"r2","displayName":"Sauce Base","unit":"portion","quantity":1.0}"""
        val dto = gson.fromJson(json, RecipeIngredientDto::class.java)
        assertNull(dto.ingredientId)
        assertEquals("r2", dto.childRecipeId)
        assertEquals("Sauce Base", dto.displayName)
    }

    // ---- CreateRecipeRequest ----

    @Test
    fun `CreateRecipeRequest serialization`() {
        val ingredients =
            listOf(
                CreateRecipeIngredientRequest(ingredientId = "i1", quantity = 0.5),
            )
        val request =
            CreateRecipeRequest(
                name = "New Recipe",
                isSellable = true,
                isSubRecipe = false,
                ingredients = ingredients,
            )
        val json = gson.toJson(request)
        assertTrue(json.contains("\"name\":\"New Recipe\""))
        assertTrue(json.contains("\"isSellable\":true"))
        assertTrue(json.contains("\"isSubRecipe\":false"))
        assertTrue(json.contains("\"ingredientId\":\"i1\""))
    }

    // ---- CreateRecipeIngredientRequest ----

    @Test
    fun `CreateRecipeIngredientRequest with ingredientId`() {
        val request = CreateRecipeIngredientRequest(ingredientId = "i1", quantity = 2.0)
        val json = gson.toJson(request)
        assertTrue(json.contains("\"ingredientId\":\"i1\""))
        assertTrue(json.contains("\"quantity\":2.0"))
    }

    @Test
    fun `CreateRecipeIngredientRequest with childRecipeId`() {
        val request = CreateRecipeIngredientRequest(childRecipeId = "r2", quantity = 1.0)
        val json = gson.toJson(request)
        assertTrue(json.contains("\"childRecipeId\":\"r2\""))
    }

    @Test
    fun `CreateRecipeIngredientRequest defaults to null ids`() {
        val request = CreateRecipeIngredientRequest(quantity = 1.0)
        assertNull(request.ingredientId)
        assertNull(request.childRecipeId)
    }

    // ---- UpdateRecipeRequest ----

    @Test
    fun `UpdateRecipeRequest serialization`() {
        val request =
            UpdateRecipeRequest(
                name = "Updated Recipe",
                isSellable = false,
                isSubRecipe = true,
                ingredients = emptyList(),
            )
        val json = gson.toJson(request)
        assertTrue(json.contains("\"name\":\"Updated Recipe\""))
        assertTrue(json.contains("\"isSellable\":false"))
        assertTrue(json.contains("\"isSubRecipe\":true"))
    }

    @Test
    fun `UpdateRecipeRequest deserialization`() {
        val json =
            """
            {"name":"R","isSellable":true,"isSubRecipe":false,"ingredients":[]}
            """.trimIndent()
        val dto = gson.fromJson(json, UpdateRecipeRequest::class.java)
        assertEquals("R", dto.name)
        assertTrue(dto.isSellable)
        assertFalse(dto.isSubRecipe)
        assertTrue(dto.ingredients.isEmpty())
    }
}
