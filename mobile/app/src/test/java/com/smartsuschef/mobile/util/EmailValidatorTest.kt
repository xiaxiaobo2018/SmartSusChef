package com.smartsuschef.mobile.util

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class EmailValidatorTest {
    private val validator = EmailValidator()

    @Test
    fun testIsValid_StandardEmail_ReturnsTrue() {
        assertTrue(validator.isValid("name@domain.com"))
    }

    @Test
    fun testIsValid_EmailWithSubdomain_ReturnsTrue() {
        assertTrue(validator.isValid("name@sub.domain.com"))
    }

    @Test
    fun testIsValid_EmailWithPlusAlias_ReturnsTrue() {
        assertTrue(validator.isValid("name+alias@domain.com"))
    }

    @Test
    fun testIsValid_EmailWithDotInLocalPart_ReturnsTrue() {
        assertTrue(validator.isValid("first.last@domain.com"))
    }

    @Test
    fun testIsValid_EmailWithNumbers_ReturnsTrue() {
        assertTrue(validator.isValid("name123@domain.com"))
    }

    @Test
    fun testIsValid_MissingAtSymbol_ReturnsFalse() {
        assertFalse(validator.isValid("namedomain.com"))
    }

    @Test
    fun testIsValid_MissingDomain_ReturnsFalse() {
        assertFalse(validator.isValid("name@.com"))
    }

    @Test
    fun testIsValid_MissingTopLevelDomain_ReturnsFalse() {
        assertFalse(validator.isValid("name@domain"))
    }

    @Test
    fun testIsValid_InvalidCharacters_ReturnsFalse() {
        assertFalse(validator.isValid("invalid char@domain.com"))
    }

    @Test
    fun testIsValid_EmptyString_ReturnsFalse() {
        assertFalse(validator.isValid(""))
    }

    @Test
    fun testIsValid_MultipleAtSymbols_ReturnsFalse() {
        assertFalse(validator.isValid("name@@domain.com"))
    }

    @Test
    fun testIsValid_StartsWithDot_ReturnsFalse() {
        assertFalse(validator.isValid(".name@domain.com"))
    }
}
