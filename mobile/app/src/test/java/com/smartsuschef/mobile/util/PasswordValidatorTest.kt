package com.smartsuschef.mobile.util

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PasswordValidatorTest {
    @Test
    fun testValidate_ValidPassword_ReturnsTrue() {
        val result = PasswordValidator.validate("ValidPass123!@#")
        assertTrue(result.isValid)
        assertNull(result.errorMessage)
    }

    @Test
    fun testValidate_PasswordTooShort_ReturnsFalse() {
        val result = PasswordValidator.validate("Short1!")
        assertFalse(result.isValid)
        assertEquals("Password must be at least 12 characters", result.errorMessage)
    }

    @Test
    fun testValidate_PasswordTooLong_ReturnsFalse() {
        val longPassword = "ThisIsAVeryLongPasswordThatExceedsThe36CharacterLimit1!"
        val result = PasswordValidator.validate(longPassword)
        assertFalse(result.isValid)
        assertEquals("Password must not exceed 36 characters", result.errorMessage)
    }

    @Test
    fun testValidate_MissingUppercase_ReturnsFalse() {
        val result = PasswordValidator.validate("nouppercase123!")
        assertFalse(result.isValid)
        assertEquals("Password must contain at least one uppercase letter", result.errorMessage)
    }

    @Test
    fun testValidate_MissingLowercase_ReturnsFalse() {
        val result = PasswordValidator.validate("NOLOWERCASE123!")
        assertFalse(result.isValid)
        assertEquals("Password must contain at least one lowercase letter", result.errorMessage)
    }

    @Test
    fun testValidate_MissingNumber_ReturnsFalse() {
        val result = PasswordValidator.validate("NoNumberPassword!")
        assertFalse(result.isValid)
        assertEquals("Password must contain at least one number", result.errorMessage)
    }

    @Test
    fun testValidate_MissingSpecialChar_ReturnsFalse() {
        val result = PasswordValidator.validate("NoSpecialChar123")
        assertFalse(result.isValid)
        assertTrue(result.errorMessage?.startsWith("Password must contain at least one special character") ?: false)
    }

    @Test
    fun testValidate_EmptyPassword_ReturnsFalse() {
        val result = PasswordValidator.validate("")
        assertFalse(result.isValid)
        assertEquals("Password must be at least 12 characters", result.errorMessage)
    }

    @Test
    fun testValidate_MinLengthPassword_ReturnsTrue() {
        val result = PasswordValidator.validate("ValidMin123!")
        assertTrue(result.isValid)
    }

    @Test
    fun testValidate_MaxLengthPassword_ReturnsTrue() {
        val result = PasswordValidator.validate("ThisIsAValidPasswordThatIs36Chars1!")
        assertTrue(result.isValid)
    }

    // --- isValid() shorthand Tests ---

    @Test
    fun testIsValid_ValidPassword_ReturnsTrue() {
        assertTrue(PasswordValidator.isValid("ValidPass123!"))
    }

    @Test
    fun testIsValid_InvalidPassword_ReturnsFalse() {
        assertFalse(PasswordValidator.isValid("short"))
    }

    // --- getErrorMessage() Tests ---

    @Test
    fun testGetErrorMessage_ValidPassword_ReturnsNull() {
        assertNull(PasswordValidator.getErrorMessage("ValidPass123!"))
    }

    @Test
    fun testGetErrorMessage_InvalidPassword_ReturnsMessage() {
        val message = PasswordValidator.getErrorMessage("short")
        assertEquals("Password must be at least 12 characters", message)
    }

    // --- getRequirements() Tests ---

    @Test
    fun testGetRequirements_ReturnsFiveItems() {
        val requirements = PasswordValidator.getRequirements()
        assertEquals(5, requirements.size)
    }

    // --- getRequirementsWithStatus() Tests ---

    @Test
    fun testGetRequirementsWithStatus_ValidPassword_AllMet() {
        val statuses = PasswordValidator.getRequirementsWithStatus("ValidPass123!")
        assertEquals(5, statuses.size)
        assertTrue(statuses.all { it.second })
    }

    @Test
    fun testGetRequirementsWithStatus_ShortPassword_LengthNotMet() {
        val statuses = PasswordValidator.getRequirementsWithStatus("a")
        val lengthStatus = statuses.first()
        assertFalse(lengthStatus.second)
    }

    @Test
    fun testGetRequirementsWithStatus_NoUppercase_UppercaseNotMet() {
        val statuses = PasswordValidator.getRequirementsWithStatus("nouppercase1!")
        val uppercaseStatus = statuses[1]
        assertFalse(uppercaseStatus.second)
    }

    // --- ValidationResult field Tests ---

    @Test
    fun testValidate_ValidPassword_AllFieldsTrue() {
        val result = PasswordValidator.validate("ValidPass123!")
        assertTrue(result.hasMinLength)
        assertTrue(result.hasMaxLength)
        assertTrue(result.hasUpperCase)
        assertTrue(result.hasLowerCase)
        assertTrue(result.hasNumber)
        assertTrue(result.hasSpecialChar)
    }

    @Test
    fun testValidate_VariousSpecialChars_AtSign() {
        assertTrue(PasswordValidator.validate("ValidPass123@").hasSpecialChar)
    }

    @Test
    fun testValidate_VariousSpecialChars_Hash() {
        assertTrue(PasswordValidator.validate("ValidPass123#").hasSpecialChar)
    }

    @Test
    fun testValidate_VariousSpecialChars_Parenthesis() {
        assertTrue(PasswordValidator.validate("ValidPass123(").hasSpecialChar)
    }
}
