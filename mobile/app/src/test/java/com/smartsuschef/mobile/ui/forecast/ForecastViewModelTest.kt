package com.smartsuschef.mobile.ui.forecast

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.smartsuschef.mobile.data.repository.ForecastRepository
import com.smartsuschef.mobile.data.repository.SalesRepository
import com.smartsuschef.mobile.network.dto.ForecastDto
import com.smartsuschef.mobile.network.dto.ForecastIngredientDto
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
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.junit.MockitoJUnitRunner
import org.mockito.kotlin.any
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

@ExperimentalCoroutinesApi
@RunWith(MockitoJUnitRunner::class)
class ForecastViewModelTest {
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var mockForecastRepository: ForecastRepository

    @Mock
    private lateinit var mockSalesRepository: SalesRepository

    private val testDispatcher: TestDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `init when repository call succeeds should process and update all LiveData`() =
        runTest {
            // ARRANGE
            // 1. Create mock data — dates must be >= today since the ViewModel
            //    filters future forecasts with `it.date >= today`.
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val calendar = Calendar.getInstance()
            val today = dateFormat.format(calendar.time)
            calendar.add(Calendar.DAY_OF_YEAR, 1)
            val tomorrow = dateFormat.format(calendar.time)

            val mockForecastData =
                listOf(
                    ForecastDto(
                        date = today,
                        recipeId = "rec-1",
                        recipeName = "Pizza",
                        quantity = 10,
                        confidence = "Medium",
                        ingredients =
                            listOf(
                                ForecastIngredientDto("ing-1", "Dough", "kg", 2.0),
                                ForecastIngredientDto("ing-2", "Cheese", "kg", 1.0),
                            ),
                    ),
                    ForecastDto(
                        date = tomorrow,
                        recipeId = "rec-2",
                        recipeName = "Pasta",
                        quantity = 5,
                        confidence = "High",
                        ingredients =
                            listOf(
                                ForecastIngredientDto("ing-3", "Pasta", "kg", 1.0),
                                ForecastIngredientDto("ing-2", "Cheese", "kg", 0.5),
                            ),
                    ),
                )

            // 2. Program the mock repository to return success for the getForecast call
            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Success(mockForecastData))

            // ACT
            // 3. Initialize the ViewModel
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ASSERT
            // 4. Verify all LiveData states based on the ViewModel's internal processing

            // Summary Trend (should contain the forecast data)
            val summaryResult = viewModel.summaryTrend.value
            assertTrue(summaryResult is Resource.Success)
            assertEquals(2, (summaryResult as Resource.Success).data?.size)
            assertEquals(10, summaryResult.data?.find { it.date == today }?.totalQuantity)

            // Dish Forecasts (processed from the forecast data)
            val dishResult = viewModel.dishForecasts.value
            assertTrue(dishResult is Resource.Success)
            assertEquals(2, (dishResult as Resource.Success).data?.size)
            assertEquals("Pizza", dishResult.data?.find { it.date == today }?.dishes?.first()?.name)

            // Comparison Data (is now stubbed in the ViewModel, should be empty)
            val comparisonResult = viewModel.comparisonData.value
            assertTrue(comparisonResult is Resource.Success)
            assertTrue((comparisonResult as Resource.Success).data?.isEmpty() == true)

            // Ingredient Forecast (processed from the forecast data)
            val ingredientResult = viewModel.ingredientForecast.value
            assertTrue(ingredientResult is Resource.Success)
            val ingredients = (ingredientResult as Resource.Success).data
            assertEquals(3, ingredients?.size) // Dough, Cheese, Pasta

            val cheese = ingredients?.find { it.name == "Cheese" }
            assertEquals("kg", cheese?.unit)
            assertEquals(2, cheese?.totalQuantity?.size)
            assertEquals(1.0, cheese?.totalQuantity?.get(0)) // Qty for today
            assertEquals(0.5, cheese?.totalQuantity?.get(1)) // Qty for tomorrow
        }

    @Test
    fun `init when getForecast fails should update all dependent LiveData to Error`() =
        runTest {
            // ARRANGE
            // 1. Program the main forecast repository call to fail
            val errorMessage = "Network Error"
            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Error(errorMessage))

            // ACT
            // 2. Initialize the ViewModel
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ASSERT
            // 3. Verify that all dependent LiveData objects are in an Error state
            val summaryResult = viewModel.summaryTrend.value
            assertTrue(summaryResult is Resource.Error && summaryResult.message == errorMessage)

            val ingredientResult = viewModel.ingredientForecast.value
            assertTrue(ingredientResult is Resource.Error && ingredientResult.message == errorMessage)

            val dishResult = viewModel.dishForecasts.value
            assertTrue(dishResult is Resource.Error && dishResult.message == errorMessage)

            val comparisonResult = viewModel.comparisonData.value
            assertTrue(comparisonResult is Resource.Error && comparisonResult.message == errorMessage)
        }

    @Test
    fun `init with empty forecast data should produce empty LiveData`() =
        runTest {
            // ARRANGE
            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Success(emptyList()))

            // ACT
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ASSERT
            val summaryResult = viewModel.summaryTrend.value
            assertTrue(summaryResult is Resource.Success)
            assertTrue((summaryResult as Resource.Success).data?.isEmpty() == true)

            val dishResult = viewModel.dishForecasts.value
            assertTrue(dishResult is Resource.Success)
            assertTrue((dishResult as Resource.Success).data?.isEmpty() == true)

            val ingredientResult = viewModel.ingredientForecast.value
            assertTrue(ingredientResult is Resource.Success)
            assertTrue((ingredientResult as Resource.Success).data?.isEmpty() == true)

            val comparisonResult = viewModel.comparisonData.value
            assertTrue(comparisonResult is Resource.Success)
            assertTrue((comparisonResult as Resource.Success).data?.isEmpty() == true)
        }

    @Test
    fun `loadPredictions can be called to reload data`() =
        runTest {
            // ARRANGE
            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Success(emptyList()))
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ACT — call loadPredictions again
            viewModel.loadPredictions()

            // ASSERT — getForecast should be called twice (once in init, once manually)
            verify(mockForecastRepository, times(2)).getForecast(7, 7)
        }

    @Test
    fun `init with more than 9 dishes should group extras into Others`() =
        runTest {
            // ARRANGE
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val today = dateFormat.format(Calendar.getInstance().time)

            // Create 11 dishes for the same date — top 9 should remain, 2 should be "Others"
            val forecasts =
                (1..11).map { i ->
                    ForecastDto(
                        date = today,
                        recipeId = "rec-$i",
                        recipeName = "Dish $i",
                        // Dish 1 has most, Dish 11 has least
                        quantity = 100 - i,
                        confidence = "High",
                        ingredients = emptyList(),
                    )
                }

            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Success(forecasts))

            // ACT
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ASSERT
            val dishResult = viewModel.dishForecasts.value
            assertTrue(dishResult is Resource.Success)
            val dayForecasts = (dishResult as Resource.Success).data
            assertEquals(1, dayForecasts?.size) // Only one date
            val dishes = dayForecasts?.first()?.dishes
            assertNotNull(dishes)
            // Should be 9 top dishes + 1 "Others" = 10
            assertEquals(10, dishes?.size)

            val othersDish = dishes?.find { it.name == "Others" }
            assertNotNull(othersDish)
            // Quantity should be the sum of the two smallest forecasts: (100-10) + (100-11) = 90 + 89 = 179
            assertEquals(179, othersDish?.predictedSales)
            assertEquals("Dish 9", dishes?.get(8)?.name)
        }

    @Test
    fun `init with past data should load comparison data from sales repository`() =
        runTest {
            // ARRANGE
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val calendar = Calendar.getInstance()
            calendar.add(Calendar.DAY_OF_YEAR, -2)
            val twoDaysAgo = dateFormat.format(calendar.time)
            calendar.add(Calendar.DAY_OF_YEAR, 1)
            val yesterday = dateFormat.format(calendar.time)

            val pastForecasts =
                listOf(
                    ForecastDto(
                        date = twoDaysAgo,
                        recipeId = "rec-1",
                        recipeName = "Pizza",
                        quantity = 10,
                        confidence = "High",
                        ingredients = emptyList(),
                    ),
                    ForecastDto(
                        date = yesterday,
                        recipeId = "rec-1",
                        recipeName = "Pizza",
                        quantity = 15,
                        confidence = "Medium",
                        ingredients = emptyList(),
                    ),
                )

            val salesTrend =
                listOf(
                    SalesTrendDto(twoDaysAgo, 8, emptyList()),
                    SalesTrendDto(yesterday, 12, emptyList()),
                )

            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Success(pastForecasts))
            whenever(mockSalesRepository.getTrend(twoDaysAgo, yesterday)).thenReturn(Resource.Success(salesTrend))

            // ACT
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ASSERT
            val comparisonResult = viewModel.comparisonData.value
            assertTrue(comparisonResult is Resource.Success)
            val comparisonDays = (comparisonResult as Resource.Success).data
            assertEquals(2, comparisonDays?.size)

            val day1 = comparisonDays?.find { it.date == twoDaysAgo }
            assertEquals(10, day1?.predicted)
            assertEquals(8, day1?.actual)

            val day2 = comparisonDays?.find { it.date == yesterday }
            assertEquals(15, day2?.predicted)
            assertEquals(12, day2?.actual)
        }

    @Test
    fun `init when sales trend fails for comparison should set comparisonData to Error`() =
        runTest {
            // ARRANGE
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val calendar = Calendar.getInstance()
            calendar.add(Calendar.DAY_OF_YEAR, -1)
            val yesterday = dateFormat.format(calendar.time)

            val pastForecasts =
                listOf(
                    ForecastDto(
                        date = yesterday,
                        recipeId = "rec-1",
                        recipeName = "Pizza",
                        quantity = 10,
                        confidence = "High",
                        ingredients = emptyList(),
                    ),
                )

            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Success(pastForecasts))
            whenever(mockSalesRepository.getTrend(any(), any())).thenReturn(Resource.Error("Sales fetch failed"))

            // ACT
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ASSERT
            val comparisonResult = viewModel.comparisonData.value
            assertTrue(comparisonResult is Resource.Error)
            assertEquals("Sales fetch failed", (comparisonResult as Resource.Error).message)
        }

    @Test
    fun `dateHeaders should contain distinct sorted dates from future data`() =
        runTest {
            // ARRANGE
            val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val calendar = Calendar.getInstance()
            val today = dateFormat.format(calendar.time)
            calendar.add(Calendar.DAY_OF_YEAR, 1)
            val tomorrow = dateFormat.format(calendar.time)

            val forecasts =
                listOf(
                    ForecastDto(today, "rec-1", "Pizza", 5, "High", emptyList()),
                    ForecastDto(today, "rec-2", "Pasta", 3, "High", emptyList()),
                    ForecastDto(tomorrow, "rec-1", "Pizza", 7, "High", emptyList()),
                )

            whenever(mockForecastRepository.getForecast(7, 7)).thenReturn(Resource.Success(forecasts))

            // ACT
            val viewModel = ForecastViewModel(mockForecastRepository, mockSalesRepository)

            // ASSERT
            val headers = viewModel.dateHeaders.value
            assertEquals(2, headers?.size)
            assertEquals(today, headers?.get(0))
            assertEquals(tomorrow, headers?.get(1))
        }
}
