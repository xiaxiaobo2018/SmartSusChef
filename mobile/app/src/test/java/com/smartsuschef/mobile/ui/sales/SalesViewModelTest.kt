package com.smartsuschef.mobile.ui.sales

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.smartsuschef.mobile.data.repository.SalesRepository
import com.smartsuschef.mobile.network.dto.IngredientUsageDto
import com.smartsuschef.mobile.network.dto.RecipeSalesDto
import com.smartsuschef.mobile.network.dto.SalesTrendDto
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

    private lateinit var viewModel: SalesViewModel

    private val testDispatcher: TestDispatcher = UnconfinedTestDispatcher()

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        viewModel = SalesViewModel(salesRepository)
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
}
