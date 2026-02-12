package com.smartsuschef.mobile.ui.sales

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.smartsuschef.mobile.data.repository.ForecastRepository
import com.smartsuschef.mobile.data.repository.SalesRepository
import com.smartsuschef.mobile.network.dto.HolidayDto
import com.smartsuschef.mobile.network.dto.IngredientUsageDto
import com.smartsuschef.mobile.network.dto.RecipeSalesDto
import com.smartsuschef.mobile.network.dto.SalesTrendDto
import com.smartsuschef.mobile.network.dto.WeatherDto
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
import org.junit.Assert.assertNotNull
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
class SalesViewModelTest {
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var salesRepository: SalesRepository

    @Mock
    private lateinit var forecastRepository: ForecastRepository

    private lateinit var viewModel: SalesViewModel

    private val testDispatcher: TestDispatcher = UnconfinedTestDispatcher()

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        viewModel = SalesViewModel(salesRepository, forecastRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `fetchOverviewData with LAST_7_DAYS filter should return success`() =
        runTest {
            val calendar = Calendar.getInstance()
            val endDate = dateFormat.format(calendar.time)
            calendar.add(Calendar.DAY_OF_YEAR, -6)
            val startDate = dateFormat.format(calendar.time)

            val mockSalesTrend = listOf(SalesTrendDto(endDate, 100, emptyList()))
            val expectedResult = Resource.Success(mockSalesTrend)

            whenever(salesRepository.getTrend(startDate, endDate)).thenReturn(expectedResult)

            viewModel.fetchOverviewData(SalesFilter.LAST_7_DAYS)

            val actualResult = viewModel.salesTrend.value
            assertTrue(actualResult is Resource.Success)
            assertEquals(1, (actualResult as Resource.Success).data?.size)
            assertEquals(endDate, actualResult.data?.get(0)?.date)
        }

    @Test
    fun `fetchOverviewData with TODAY filter should return success`() =
        runTest {
            val today = dateFormat.format(Calendar.getInstance().time)
            val mockSalesTrend = listOf(SalesTrendDto(today, 50, emptyList()))
            val expectedResult = Resource.Success(mockSalesTrend)

            whenever(salesRepository.getTrend(today, today)).thenReturn(expectedResult)

            viewModel.setFilter(SalesFilter.TODAY)

            val actualResult = viewModel.salesTrend.value
            assertTrue(actualResult is Resource.Success)
            assertEquals(1, (actualResult as Resource.Success).data?.size)
            assertEquals(today, actualResult.data?.get(0)?.date)
        }

    @Test
    fun `fetchOverviewData should return error`() =
        runTest {
            val errorMessage = "Test error"
            val expectedResult = Resource.Error<List<SalesTrendDto>>(errorMessage)
            whenever(salesRepository.getTrend(any(), any())).thenReturn(expectedResult)

            viewModel.fetchOverviewData()

            val actualResult = viewModel.salesTrend.value
            assertTrue(actualResult is Resource.Error)
            assertEquals(errorMessage, (actualResult as Resource.Error).message)
        }

    @Test
    fun `fetchIngredientsForDate should return success`() =
        runTest {
            val date = "2026-02-10"
            val mockIngredients = listOf(IngredientUsageDto("ing-1", "Tomato", "kg", 10.0))
            val expectedResult = Resource.Success(mockIngredients)

            whenever(salesRepository.getIngredientUsageByDate(date)).thenReturn(expectedResult)

            viewModel.fetchIngredientsForDate(date)

            val actualResult = viewModel.ingredientBreakdown.value
            assertTrue(actualResult is Resource.Success)
            assertEquals(1, (actualResult as Resource.Success).data?.size)
            assertEquals("Tomato", actualResult.data?.get(0)?.name)
        }

    @Test
    fun `fetchIngredientsForDate should return error`() =
        runTest {
            val date = "2026-02-10"
            val errorMessage = "Error fetching ingredients"
            val expectedResult = Resource.Error<List<IngredientUsageDto>>(errorMessage)

            whenever(salesRepository.getIngredientUsageByDate(date)).thenReturn(expectedResult)

            viewModel.fetchIngredientsForDate(date)

            val actualResult = viewModel.ingredientBreakdown.value
            assertTrue(actualResult is Resource.Error)
            assertEquals(errorMessage, (actualResult as Resource.Error).message)
        }

    @Test
    fun `fetchRecipeSalesForDate should return success`() =
        runTest {
            val date = "2026-02-10"
            val mockRecipeSales = listOf(RecipeSalesDto("rec-1", "Pizza", 20))
            val expectedResult = Resource.Success(mockRecipeSales)

            whenever(salesRepository.getRecipeSalesByDate(date)).thenReturn(expectedResult)

            viewModel.fetchRecipeSalesForDate(date)

            val actualResult = viewModel.recipeSales.value
            assertTrue(actualResult is Resource.Success)
            assertEquals(1, (actualResult as Resource.Success).data?.size)
            assertEquals("Pizza", actualResult.data?.get(0)?.name)
        }

    @Test
    fun `fetchRecipeSalesForDate should return error`() =
        runTest {
            val date = "2026-02-10"
            val errorMessage = "Error fetching recipe sales"
            val expectedResult = Resource.Error<List<RecipeSalesDto>>(errorMessage)

            whenever(salesRepository.getRecipeSalesByDate(date)).thenReturn(expectedResult)

            viewModel.fetchRecipeSalesForDate(date)

            val actualResult = viewModel.recipeSales.value
            assertTrue(actualResult is Resource.Error)
            assertEquals(errorMessage, (actualResult as Resource.Error).message)
        }

    @Test
    fun `setFilter should update currentFilter LiveData`() {
        // Default is LAST_7_DAYS
        assertEquals(SalesFilter.LAST_7_DAYS, viewModel.currentFilter.value)

        viewModel.setFilter(SalesFilter.TODAY)
        assertEquals(SalesFilter.TODAY, viewModel.currentFilter.value)
    }

    @Test
    fun `fetchOverviewData with empty trend list should return success with empty list`() =
        runTest {
            val today = dateFormat.format(Calendar.getInstance().time)
            whenever(salesRepository.getTrend(any(), any()))
                .thenReturn(Resource.Success(emptyList()))

            viewModel.fetchOverviewData(SalesFilter.TODAY)

            val actualResult = viewModel.salesTrend.value
            assertTrue(actualResult is Resource.Success)
            assertTrue((actualResult as Resource.Success).data?.isEmpty() == true)
        }

    @Test
    fun `weather LiveData should be populated from init`() {
        // Weather is fetched during init, so it should have a value
        // It will be in Loading or Error state since the mock isn't stubbed for weather
        assertNotNull(viewModel.weather.value)
    }

    @Test
    fun `holidays LiveData should be populated from init`() {
        // Holidays are fetched during init, so it should have a value
        assertNotNull(viewModel.holidays.value)
    }

    @Test
    fun `fetchIngredientsForDate with empty data should return success with empty list`() =
        runTest {
            val date = "2026-02-10"
            whenever(salesRepository.getIngredientUsageByDate(date))
                .thenReturn(Resource.Success(emptyList()))

            viewModel.fetchIngredientsForDate(date)

            val actualResult = viewModel.ingredientBreakdown.value
            assertTrue(actualResult is Resource.Success)
            assertTrue((actualResult as Resource.Success).data?.isEmpty() == true)
        }

    @Test
    fun `fetchRecipeSalesForDate with empty data should return success with empty list`() =
        runTest {
            val date = "2026-02-10"
            whenever(salesRepository.getRecipeSalesByDate(date))
                .thenReturn(Resource.Success(emptyList()))

            viewModel.fetchRecipeSalesForDate(date)

            val actualResult = viewModel.recipeSales.value
            assertTrue(actualResult is Resource.Success)
            assertTrue((actualResult as Resource.Success).data?.isEmpty() == true)
        }

    @Test
    fun `fetchWeather success should populate weather with data`() =
        runTest {
            val weatherDto = WeatherDto(28.5, "Sunny", 65, "Clear sky")
            whenever(forecastRepository.getWeather()).thenReturn(Resource.Success(weatherDto))

            val vm = SalesViewModel(salesRepository, forecastRepository)

            val result = vm.weather.value
            assertTrue(result is Resource.Success)
            assertEquals("Sunny", (result as Resource.Success).data?.condition)
            assertEquals(28.5, result.data?.temperature ?: 0.0, 0.0)
            assertEquals(65, result.data?.humidity)
        }

    @Test
    fun `fetchWeather error should populate weather with error message`() =
        runTest {
            whenever(forecastRepository.getWeather())
                .thenReturn(Resource.Error("Weather unavailable"))

            val vm = SalesViewModel(salesRepository, forecastRepository)

            val result = vm.weather.value
            assertTrue(result is Resource.Error)
            assertEquals("Weather unavailable", (result as Resource.Error).message)
        }

    @Test
    fun `fetchHolidays success should populate holidays with data`() =
        runTest {
            val holidays =
                listOf(
                    HolidayDto("2026-02-14", "Valentine's Day"),
                    HolidayDto("2026-12-25", "Christmas Day"),
                )
            whenever(forecastRepository.getHolidays(any())).thenReturn(Resource.Success(holidays))

            val vm = SalesViewModel(salesRepository, forecastRepository)

            val result = vm.holidays.value
            assertTrue(result is Resource.Success)
            assertEquals(2, (result as Resource.Success).data?.size)
            assertEquals("Valentine's Day", result.data?.get(0)?.name)
            assertEquals("Christmas Day", result.data?.get(1)?.name)
        }

    @Test
    fun `fetchHolidays error should populate holidays with error message`() =
        runTest {
            whenever(forecastRepository.getHolidays(any()))
                .thenReturn(Resource.Error("Holidays unavailable"))

            val vm = SalesViewModel(salesRepository, forecastRepository)

            val result = vm.holidays.value
            assertTrue(result is Resource.Error)
            assertEquals("Holidays unavailable", (result as Resource.Error).message)
        }
}
