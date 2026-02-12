package com.smartsuschef.mobile.ui.wastage

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.smartsuschef.mobile.data.repository.WastageRepository
import com.smartsuschef.mobile.network.dto.ItemWastageDto
import com.smartsuschef.mobile.network.dto.WastageTrendDto
import com.smartsuschef.mobile.util.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestDispatcher
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.junit.MockitoJUnitRunner
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

@ExperimentalCoroutinesApi
@RunWith(MockitoJUnitRunner::class)
class WastageViewModelTest {
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var wastageRepository: WastageRepository

    private lateinit var viewModel: WastageViewModel

    private val testDispatcher: TestDispatcher = UnconfinedTestDispatcher()

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        viewModel = WastageViewModel(wastageRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `fetchWastageTrend with LAST_7_DAYS filter should return success`() =
        runTest {
            val calendar = Calendar.getInstance()
            val endDate = dateFormat.format(calendar.time)
            calendar.add(Calendar.DAY_OF_YEAR, -6)
            val startDate = dateFormat.format(calendar.time)

            val mockWastageTrend = listOf(WastageTrendDto(endDate, 10.0, 1.0, emptyList()))
            val expectedResult = Resource.Success(mockWastageTrend)

            whenever(wastageRepository.getTrend(startDate, endDate)).thenReturn(expectedResult)

            viewModel.setFilter(WastageFilter.LAST_7_DAYS)

            val actualResult = viewModel.wastageTrend.value
            assertTrue(actualResult is Resource.Success)
            assertEquals(1, (actualResult as Resource.Success).data?.size)
            assertEquals(endDate, actualResult.data?.get(0)?.date)
        }

    @Test
    fun `fetchWastageTrend with TODAY filter should return success`() =
        runTest {
            val today = dateFormat.format(Calendar.getInstance().time)
            val mockWastageTrend = listOf(WastageTrendDto(today, 5.0, 0.5, emptyList()))
            val expectedResult = Resource.Success(mockWastageTrend)

            whenever(wastageRepository.getTrend(today, today)).thenReturn(expectedResult)

            viewModel.setFilter(WastageFilter.TODAY)

            val actualResult = viewModel.wastageTrend.value
            assertTrue(actualResult is Resource.Success)
            assertEquals(1, (actualResult as Resource.Success).data?.size)
            assertEquals(today, actualResult.data?.get(0)?.date)
        }

    @Test
    fun `fetchWastageTrend should return error`() =
        runTest {
            val errorMessage = "Test error"
            val expectedResult = Resource.Error<List<WastageTrendDto>>(errorMessage)
            whenever(wastageRepository.getTrend(any(), any())).thenReturn(expectedResult)

            viewModel.setFilter(WastageFilter.LAST_7_DAYS)

            val actualResult = viewModel.wastageTrend.value
            assertTrue(actualResult is Resource.Error)
            assertEquals(errorMessage, (actualResult as Resource.Error).message)
        }

    @Test
    fun `setWastageBreakdown should correctly transform and set data`() {
        val itemWastageDtos =
            listOf(
                ItemWastageDto(
                    ingredientId = "ing-1",
                    displayName = "Tomato",
                    quantity = 1.0,
                    unit = "kg",
                    carbonFootprint = 0.5,
                    recipeId = null,
                ),
                ItemWastageDto(
                    displayName = "Soup",
                    quantity = 2.0,
                    unit = "l",
                    carbonFootprint = 1.5,
                    recipeId = "recipe-123",
                ),
                ItemWastageDto(
                    displayName = "Sauce",
                    quantity = 0.5,
                    unit = "kg",
                    carbonFootprint = 0.8,
                    recipeId = "sub-recipe-456",
                ),
            )

        viewModel.setWastageBreakdown(itemWastageDtos)

        val actualResult = viewModel.wastageBreakdown.value
        assertTrue(actualResult is Resource.Success)
        val breakdownItems = (actualResult as Resource.Success).data
        assertEquals(3, breakdownItems?.size)

        assertEquals("Tomato", breakdownItems?.get(0)?.name)
        assertEquals("Raw Ingredient", breakdownItems?.get(0)?.type)

        assertEquals("Soup", breakdownItems?.get(1)?.name)
        assertEquals("Main Dish", breakdownItems?.get(1)?.type)

        assertEquals("Sauce", breakdownItems?.get(2)?.name)
        assertEquals("Sub-Recipe", breakdownItems?.get(2)?.type)
    }

    @Test
    fun `setFilter should update currentFilter LiveData`() {
        // The default is LAST_7_DAYS from init
        assertEquals(WastageFilter.LAST_7_DAYS, viewModel.currentFilter.value)
    }

    @Test
    fun `setWastageBreakdown with empty list should return empty success`() {
        viewModel.setWastageBreakdown(emptyList())

        val actualResult = viewModel.wastageBreakdown.value
        assertTrue(actualResult is Resource.Success)
        assertTrue((actualResult as Resource.Success).data?.isEmpty() == true)
    }

    @Test
    fun `setWastageBreakdown should correctly map quantity and carbonFootprint`() {
        val itemWastageDtos =
            listOf(
                ItemWastageDto(
                    ingredientId = "ing-1",
                    displayName = "Tomato",
                    quantity = 3.5,
                    unit = "kg",
                    carbonFootprint = 2.1,
                    recipeId = null,
                ),
            )

        viewModel.setWastageBreakdown(itemWastageDtos)

        val breakdownItems = (viewModel.wastageBreakdown.value as Resource.Success).data
        assertEquals(3.5, breakdownItems?.get(0)?.quantity ?: 0.0, 0.0)
        assertEquals(2.1, breakdownItems?.get(0)?.carbonFootprint ?: 0.0, 0.0)
        assertEquals("kg", breakdownItems?.get(0)?.unit)
    }

    @Test
    fun `wastageBreakdown should be null before setWastageBreakdown is called`() {
        // The ViewModel is created in setUp, wastageBreakdown is never set
        assertNull(viewModel.wastageBreakdown.value)
    }

    @Test
    fun `setFilter with TODAY should update currentFilter to TODAY`() =
        runTest {
            whenever(wastageRepository.getTrend(any(), any()))
                .thenReturn(Resource.Success(emptyList()))

            viewModel.setFilter(WastageFilter.TODAY)

            assertEquals(WastageFilter.TODAY, viewModel.currentFilter.value)
        }
}
