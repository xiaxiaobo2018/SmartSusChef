package com.smartsuschef.mobile.util

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ConstantsTest {
    @Test
    fun `network timeout values are positive`() {
        assertTrue(Constants.CONNECT_TIMEOUT > 0)
        assertTrue(Constants.READ_TIMEOUT > 0)
        assertTrue(Constants.WRITE_TIMEOUT > 0)
    }

    @Test
    fun `date format API is yyyy-MM-dd`() {
        assertEquals("yyyy-MM-dd", Constants.DATE_FORMAT_API)
    }

    @Test
    fun `date format display is dd MMM yyyy`() {
        assertEquals("dd MMM yyyy", Constants.DATE_FORMAT_DISPLAY)
    }

    @Test
    fun `datetime format API includes time`() {
        assertEquals("yyyy-MM-dd'T'HH:mm:ss", Constants.DATETIME_FORMAT_API)
    }

    @Test
    fun `employee data days is 7`() {
        assertEquals(7, Constants.EMPLOYEE_DATA_DAYS)
    }

    @Test
    fun `manager data days is 30`() {
        assertEquals(30, Constants.MANAGER_DATA_DAYS)
    }

    @Test
    fun `manager has more data days than employee`() {
        assertTrue(Constants.MANAGER_DATA_DAYS > Constants.EMPLOYEE_DATA_DAYS)
    }

    @Test
    fun `session timeout is positive`() {
        assertTrue(Constants.SESSION_TIMEOUT_MINUTES > 0)
    }

    @Test
    fun `role constants are correct`() {
        assertEquals("Employee", Constants.ROLE_EMPLOYEE)
        assertEquals("Manager", Constants.ROLE_MANAGER)
    }

    @Test
    fun `shared prefs file name is not empty`() {
        assertTrue(Constants.SHARED_PREFS_FILE_NAME.isNotEmpty())
    }

    @Test
    fun `datastore keys are not empty`() {
        assertTrue(Constants.KEY_AUTH_TOKEN.isNotEmpty())
        assertTrue(Constants.KEY_USERNAME.isNotEmpty())
        assertTrue(Constants.KEY_USER_ROLE.isNotEmpty())
        assertTrue(Constants.KEY_TOKEN_EXPIRY.isNotEmpty())
    }
}
