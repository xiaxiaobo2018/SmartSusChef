package com.smartsuschef.mobile

import com.smartsuschef.mobile.util.DateUtils
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class DateUtilsTest {
    private val apiDateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    @Test
    fun testFormatDateForDisplaySuccess() {
        val apiDate = "2026-02-02"
        val result = DateUtils.formatDateForDisplay(apiDate)
        assertEquals("02 Feb 2026", result)
    }

    @Test
    fun testFormatDateForDisplayInvalidHandle() {
        val badDate = "not-a-date"
        val result = DateUtils.formatDateForDisplay(badDate)
        assertEquals("not-a-date", result)
    }

    @Test
    fun testIsTodayCorrect() {
        val todayApiString = DateUtils.getTodayFormatted()
        val isToday = DateUtils.isToday(todayApiString)
        assertTrue("Should return true for today", isToday)
    }

    @Test
    fun testIsTodayReturnsFalseForPastDate() {
        assertFalse(DateUtils.isToday("2020-01-01"))
    }

    @Test
    fun testGetTodayFormattedMatchesExpectedFormat() {
        val expected = apiDateFormat.format(Date())
        assertEquals(expected, DateUtils.getTodayFormatted())
    }

    @Test
    fun testGetDaysAgoFormatted() {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR, -7)
        val expected = apiDateFormat.format(calendar.time)
        assertEquals(expected, DateUtils.getDaysAgoFormatted(7))
    }

    @Test
    fun testGetDaysAgoFormattedWithZero() {
        val expected = apiDateFormat.format(Date())
        assertEquals(expected, DateUtils.getDaysAgoFormatted(0))
    }

    @Test
    fun testGetDaysFromNowFormatted() {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR, 3)
        val expected = apiDateFormat.format(calendar.time)
        assertEquals(expected, DateUtils.getDaysFromNowFormatted(3))
    }

    @Test
    fun testGetDaysFromNowFormattedWithZero() {
        val expected = apiDateFormat.format(Date())
        assertEquals(expected, DateUtils.getDaysFromNowFormatted(0))
    }

    @Test
    fun testFormatDateForApi() {
        val calendar = Calendar.getInstance()
        calendar.set(2026, Calendar.MARCH, 15)
        val result = DateUtils.formatDateForApi(calendar.time)
        assertEquals("2026-03-15", result)
    }

    @Test
    fun testGetStartDateByRoleEmployee() {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR, -7)
        val expected = apiDateFormat.format(calendar.time)
        assertEquals(expected, DateUtils.getStartDateByRole(isEmployee = true))
    }

    @Test
    fun testGetStartDateByRoleManager() {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR, -30)
        val expected = apiDateFormat.format(calendar.time)
        assertEquals(expected, DateUtils.getStartDateByRole(isEmployee = false))
    }

    @Test
    fun testGetCurrentTimestampMatchesFormat() {
        val result = DateUtils.getCurrentTimestamp()
        val datetimeFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val parsed = datetimeFormat.parse(result)
        assertTrue("Should be parseable as datetime", parsed != null)
    }

    @Test
    fun testFormatDateForDisplayEmptyString() {
        val result = DateUtils.formatDateForDisplay("")
        assertEquals("", result)
    }
}
