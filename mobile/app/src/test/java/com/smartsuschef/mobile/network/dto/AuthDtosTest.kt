package com.smartsuschef.mobile.network.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AuthDtosTest {
    private val gson = Gson()

    // ---- LoginRequest ----

    @Test
    fun `LoginRequest serialization produces correct JSON`() {
        val request = LoginRequest(username = "admin", password = "secret123")
        val json = gson.toJson(request)
        assertTrue(json.contains("\"username\":\"admin\""))
        assertTrue(json.contains("\"password\":\"secret123\""))
    }

    @Test
    fun `LoginRequest deserialization from JSON`() {
        val json = """{"username":"admin","password":"secret123"}"""
        val request = gson.fromJson(json, LoginRequest::class.java)
        assertEquals("admin", request.username)
        assertEquals("secret123", request.password)
    }

    @Test
    fun `LoginRequest equality`() {
        val a = LoginRequest("admin", "pass")
        val b = LoginRequest("admin", "pass")
        assertEquals(a, b)
    }

    @Test
    fun `LoginRequest copy`() {
        val original = LoginRequest("admin", "pass")
        val copy = original.copy(password = "newpass")
        assertEquals("admin", copy.username)
        assertEquals("newpass", copy.password)
    }

    // ---- LoginResponse ----

    @Test
    fun `LoginResponse deserialization from JSON`() {
        val json =
            """
            {
                "token": "jwt-token",
                "user": {
                    "id": "u1",
                    "username": "admin",
                    "name": "Admin",
                    "email": "admin@test.com",
                    "role": "manager",
                    "status": "Active",
                    "createdAt": "2026-01-01",
                    "updatedAt": "2026-01-01"
                },
                "storeSetupRequired": false
            }
            """.trimIndent()
        val response = gson.fromJson(json, LoginResponse::class.java)
        assertEquals("jwt-token", response.token)
        assertEquals("admin", response.user.username)
        assertEquals("manager", response.user.role)
        assertFalse(response.storeSetupRequired)
    }

    @Test
    fun `LoginResponse with storeSetupRequired true`() {
        val json =
            """
            {
                "token": "t",
                "user": {"id":"u1","username":"u","name":"n","email":"e","role":"employee","status":"Active","createdAt":"","updatedAt":""},
                "storeSetupRequired": true
            }
            """.trimIndent()
        val response = gson.fromJson(json, LoginResponse::class.java)
        assertTrue(response.storeSetupRequired)
    }

    // ---- UserDto ----

    @Test
    fun `UserDto deserialization maps all fields`() {
        val json =
            """
            {
                "id": "u1",
                "username": "john",
                "name": "John Doe",
                "email": "john@example.com",
                "role": "employee",
                "status": "Active",
                "createdAt": "2026-01-01T00:00:00Z",
                "updatedAt": "2026-02-01T00:00:00Z"
            }
            """.trimIndent()
        val user = gson.fromJson(json, UserDto::class.java)
        assertEquals("u1", user.id)
        assertEquals("john", user.username)
        assertEquals("John Doe", user.name)
        assertEquals("john@example.com", user.email)
        assertEquals("employee", user.role)
        assertEquals("Active", user.status)
        assertEquals("2026-01-01T00:00:00Z", user.createdAt)
        assertEquals("2026-02-01T00:00:00Z", user.updatedAt)
    }

    @Test
    fun `UserDto equality and inequality`() {
        val a = UserDto("u1", "john", "John", "j@t.com", "employee", "Active", "", "")
        val b = UserDto("u1", "john", "John", "j@t.com", "employee", "Active", "", "")
        val c = UserDto("u2", "john", "John", "j@t.com", "employee", "Active", "", "")
        assertEquals(a, b)
        assertNotEquals(a, c)
    }

    // ---- UpdateProfileRequest ----

    @Test
    fun `UpdateProfileRequest serialization`() {
        val request = UpdateProfileRequest(name = "New Name", email = "new@email.com")
        val json = gson.toJson(request)
        assertTrue(json.contains("\"name\":\"New Name\""))
        assertTrue(json.contains("\"email\":\"new@email.com\""))
    }

    // ---- ChangePasswordRequest ----

    @Test
    fun `ChangePasswordRequest serialization`() {
        val request = ChangePasswordRequest(currentPassword = "old", newPassword = "new")
        val json = gson.toJson(request)
        assertTrue(json.contains("\"currentPassword\":\"old\""))
        assertTrue(json.contains("\"newPassword\":\"new\""))
    }

    // ---- ForgotPasswordRequest ----

    @Test
    fun `ForgotPasswordRequest serialization`() {
        val request = ForgotPasswordRequest(emailOrUsername = "admin@test.com")
        val json = gson.toJson(request)
        assertTrue(json.contains("\"emailOrUsername\":\"admin@test.com\""))
    }

    @Test
    fun `ForgotPasswordRequest deserialization`() {
        val json = """{"emailOrUsername":"admin"}"""
        val request = gson.fromJson(json, ForgotPasswordRequest::class.java)
        assertEquals("admin", request.emailOrUsername)
    }
}
