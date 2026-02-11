package com.smartsuschef.mobile.data.models

import org.junit.Assert.assertEquals
import org.junit.Test

class UserRoleTest {
    @Test
    fun `fromString with employee should return Employee`() {
        assertEquals(UserRole.Employee, UserRole.fromString("employee"))
    }

    @Test
    fun `fromString with manager should return Manager`() {
        assertEquals(UserRole.Manager, UserRole.fromString("manager"))
    }

    @Test
    fun `fromString with uppercase EMPLOYEE should return Employee`() {
        assertEquals(UserRole.Employee, UserRole.fromString("EMPLOYEE"))
    }

    @Test
    fun `fromString with mixed case Manager should return Manager`() {
        assertEquals(UserRole.Manager, UserRole.fromString("Manager"))
    }

    @Test(expected = IllegalArgumentException::class)
    fun `fromString with invalid role should throw IllegalArgumentException`() {
        UserRole.fromString("admin")
    }

    @Test(expected = IllegalArgumentException::class)
    fun `fromString with empty string should throw IllegalArgumentException`() {
        UserRole.fromString("")
    }
}
