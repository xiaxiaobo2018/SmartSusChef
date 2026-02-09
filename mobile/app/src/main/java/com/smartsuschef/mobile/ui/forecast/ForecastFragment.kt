package com.smartsuschef.mobile.ui.forecast

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.github.mikephil.charting.components.Legend
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.data.CombinedData
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.databinding.FragmentForecastBinding
import com.smartsuschef.mobile.network.dto.ForecastDto
import com.smartsuschef.mobile.util.Resource
import com.smartsuschef.mobile.util.showToast
import dagger.hilt.android.AndroidEntryPoint
import java.text.SimpleDateFormat
import java.util.Locale

@AndroidEntryPoint
class ForecastFragment : Fragment(R.layout.fragment_forecast) {
    companion object {
        private const val TAG = "ForecastFragment"
    }
    private var _binding: FragmentForecastBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ForecastViewModel by viewModels()
    private lateinit var forecastSummaryAdapter: ForecastSummaryAdapter

    override fun onViewCreated(
        view: View,
        savedInstanceState: Bundle?,
    ) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentForecastBinding.bind(view)

        setupRecyclerView()
        observeViewModel()
    }

    private fun setupRecyclerView() {
        forecastSummaryAdapter = ForecastSummaryAdapter(emptyList(), emptyList())
        binding.rvIngredientForecast.apply {
            adapter = forecastSummaryAdapter
            layoutManager = LinearLayoutManager(requireContext())
            setHasFixedSize(true)
        }
    }

    private fun observeViewModel() {
        observeSummaryTrend()
        observeDishForecasts()
        observeIngredientForecast()
        observeComparisonData()
    }

    private fun observeSummaryTrend() {
        viewModel.summaryTrend.observe(viewLifecycleOwner) { result ->
            when (result) {
                is Resource.Success -> {
                    binding.progressBar.isVisible = false
                    result.data?.let { setupSummaryChart(it) }
                }
                is Resource.Loading -> binding.progressBar.isVisible = true
                is Resource.Error -> {
                    binding.progressBar.isVisible = false
                    requireContext().showToast(result.message ?: "Error loading forecast")
                }
            }
        }
    }

    private fun observeDishForecasts() {
        viewModel.dishForecasts.observe(viewLifecycleOwner) { result ->
            when (result) {
                is Resource.Success -> result.data?.let { setupStackedBarChart(it) }
                is Resource.Error -> requireContext().showToast(result.message ?: "Error")
                else -> {}
            }
        }
    }

    private fun observeIngredientForecast() {
        viewModel.ingredientForecast.observe(viewLifecycleOwner) { result ->
            when (result) {
                is Resource.Success -> {
                    result.data?.let { ingredientData ->
                        val dates = viewModel.dateHeaders.value ?: emptyList()
                        forecastSummaryAdapter.updateData(ingredientData, dates)
                    }
                }
                is Resource.Error -> requireContext().showToast(result.message ?: "Error")
                else -> {}
            }
        }
    }

    private fun observeComparisonData() {
        viewModel.comparisonData.observe(viewLifecycleOwner) { result ->
            when (result) {
                is Resource.Success -> result.data?.let { setupComparisonChart(it) }
                is Resource.Error -> requireContext().showToast(result.message ?: "Error")
                else -> {}
            }
        }
    }

    /**
     * CHART 1: Prediction Summary (Combined Bar + Line)
     */
    private fun setupSummaryChart(trendData: List<ForecastDto>) {
        val (barEntries, lineEntries, labels) = prepareSummaryChartData(trendData)

        val barSet = createBarDataSet(barEntries)
        val lineSet = createLineDataSet(lineEntries)

        val combinedData = CombinedData().apply {
            setData(BarData(barSet))
            setData(LineData(lineSet))
        }

        styleSummaryChart(labels, combinedData)
    }

    private fun prepareSummaryChartData(trendData: List<ForecastDto>): Triple<List<BarEntry>, List<Entry>, List<String>> {
        val barEntries = mutableListOf<BarEntry>()
        val lineEntries = mutableListOf<Entry>()
        val labels = mutableListOf<String>()
        var totalDishes = 0

        trendData.forEachIndexed { index, dto ->
            barEntries.add(BarEntry(index.toFloat(), dto.quantity.toFloat()))
            lineEntries.add(Entry(index.toFloat(), dto.quantity.toFloat()))
            labels.add(formatDate(dto.date))
            totalDishes += dto.quantity
        }

        binding.tvTotalWeeklyDishes.text = totalDishes.toString()
        return Triple(barEntries, lineEntries, labels)
    }

    private fun createBarDataSet(barEntries: List<BarEntry>): BarDataSet {
        return BarDataSet(barEntries, "Predicted Sales").apply {
            color = ContextCompat.getColor(requireContext(), R.color.forecast_gold)
            setDrawValues(false)
        }
    }

    private fun createLineDataSet(lineEntries: List<Entry>): LineDataSet {
        return LineDataSet(lineEntries, "Trend").apply {
            color = ContextCompat.getColor(requireContext(), R.color.forecast_trend)
            lineWidth = 2.5f
            circleRadius = 4f
            setCircleColor(ContextCompat.getColor(requireContext(), R.color.forecast_trend))
            mode = LineDataSet.Mode.CUBIC_BEZIER
            setDrawValues(false)
            setDrawCircleHole(false)
        }
    }

    private fun styleSummaryChart(labels: List<String>, data: CombinedData) {
        binding.summaryCombinedChart.apply {
            this.data = data
            description.isEnabled = false
            setDrawGridBackground(false)
            setExtraOffsets(10f, 10f, 10f, 20f)

            // Add marker for interactivity
            val markerView = ForecastMarkerView(requireContext(), R.layout.marker_view)
            markerView.chartView = this
            markerView.chartType = ForecastMarkerView.ChartType.SIMPLE
            markerView.labels = labels // Pass date labels
            marker = markerView

            // Disable highlight color change
            isHighlightPerTapEnabled = true
            isHighlightPerDragEnabled = false

            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                valueFormatter = IndexAxisValueFormatter(labels)
                labelRotationAngle = -45f
                textSize = 8f
                granularity = 1f
                setDrawGridLines(false)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
                axisLineColor = Color.TRANSPARENT
                setAvoidFirstLastClipping(false)
                axisMinimum = -0.5f
                axisMaximum = (labels.size - 1).toFloat() + 0.5f
                setLabelCount(labels.size, false)
            }

            axisLeft.apply {
                setDrawGridLines(true)
                gridColor = ContextCompat.getColor(requireContext(), R.color.border_grey)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
                axisLineColor = Color.TRANSPARENT
                axisMinimum = 0f
            }

            axisRight.isEnabled = false

            legend.apply {
                verticalAlignment = Legend.LegendVerticalAlignment.BOTTOM
                horizontalAlignment = Legend.LegendHorizontalAlignment.CENTER
                orientation = Legend.LegendOrientation.HORIZONTAL
                setDrawInside(false)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
            }

            invalidate()
        }
    }

    /**
     * CHART 2: Dishes Forecast (Stacked Bar Chart)
     */
    private fun setupStackedBarChart(forecastData: List<DailyDishForecast>) {
        val (entries, labels, dishNames) = prepareStackedBarChartData(forecastData)

        val dataSet = createStackedBarDataSet(entries, dishNames)
        val barData = BarData(dataSet).apply { barWidth = 0.8f }

        styleStackedBarChart(labels, dishNames, barData)
    }

    private fun prepareStackedBarChartData(forecastData: List<DailyDishForecast>): Triple<List<BarEntry>, List<String>, Array<String>> {
        val entries = mutableListOf<BarEntry>()
        val labels = mutableListOf<String>()
        val totalDishes = forecastData.sumOf { it.dishes.sumOf { d -> d.predictedSales } }
        val avg = if (forecastData.isNotEmpty()) totalDishes / forecastData.size else 0

        binding.tvDishesSubtitle.text = "AI-predicted main dishes breakdown for next 7 days · Avg: $avg dishes/day"

        forecastData.forEachIndexed { index, daily ->
            val values = daily.dishes.map { it.predictedSales.toFloat() }.toFloatArray()
            entries.add(BarEntry(index.toFloat(), values))
            labels.add(formatDate(daily.date))
        }

        val dishNames = if (forecastData.isNotEmpty()) {
            forecastData[0].dishes.map { it.name }.toTypedArray()
        } else {
            arrayOf()
        }
        return Triple(entries, labels, dishNames)
    }

    private fun createStackedBarDataSet(entries: List<BarEntry>, dishNames: Array<String>): BarDataSet {
        return BarDataSet(entries, "").apply {
            colors = listOf(
                ContextCompat.getColor(requireContext(), R.color.primary),
                ContextCompat.getColor(requireContext(), R.color.wastage_primary),
                ContextCompat.getColor(requireContext(), R.color.forecast_gold),
            )
            stackLabels = dishNames
            setDrawValues(false)
            highLightAlpha = 0 // Disable highlight color change
        }
    }

    private fun styleStackedBarChart(labels: List<String>, dishNames: Array<String>, data: BarData) {
        binding.dishForecastStackedChart.apply {
            this.data = data
            description.isEnabled = false
            setDrawGridBackground(false)
            setExtraOffsets(5f, 10f, 10f, 20f) // Reduced left offset from 10f to 5f

            // Add marker
            val markerView = ForecastMarkerView(requireContext(), R.layout.marker_view)
            markerView.chartView = this
            markerView.chartType = ForecastMarkerView.ChartType.STACKED
            markerView.dishNames = dishNames // Pass dish names for breakdown
            markerView.labels = labels // Pass date labels
            marker = markerView

            // Enable tap but disable drag
            isHighlightPerTapEnabled = true
            isHighlightPerDragEnabled = false

            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                valueFormatter = IndexAxisValueFormatter(labels)
                labelRotationAngle = -45f
                textSize = 8f
                granularity = 1f
                setDrawGridLines(false)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
                axisLineColor = Color.TRANSPARENT
                setAvoidFirstLastClipping(false)
                axisMinimum = -0.5f
                axisMaximum = (labels.size - 1).toFloat() + 0.5f
                setLabelCount(labels.size, false)
            }

            axisLeft.apply {
                setDrawGridLines(true)
                gridColor = ContextCompat.getColor(requireContext(), R.color.border_grey)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
                axisLineColor = Color.TRANSPARENT
                axisMinimum = 0f
                textSize = 8f // Reduce Y-axis label size
            }

            axisRight.isEnabled = false

            legend.apply {
                verticalAlignment = Legend.LegendVerticalAlignment.BOTTOM
                horizontalAlignment = Legend.LegendHorizontalAlignment.CENTER
                orientation = Legend.LegendOrientation.HORIZONTAL
                setDrawInside(false)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
            }

            invalidate()
        }
    }

    /**
     * CHART 4: Comparison (Grouped Bar - Predicted vs Actual)
     */
    private fun setupComparisonChart(comparisonData: List<ForecastDto>) {
        // TODO: This chart is disabled until SalesData is fetched and merged with ForecastData.
        // The logic below is broken because `actualQuantity` was removed from ForecastDto.
        // The ViewModel now provides an empty list here.
        binding.comparisonBarChart.clear()
        binding.comparisonBarChart.invalidate()
    }

    private fun formatDate(dateStr: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val formatter = SimpleDateFormat("d MMM", Locale.getDefault())
            parser.parse(dateStr)?.let { formatter.format(it) } ?: dateStr
        } catch (e: Exception) {
            Log.e(TAG, "Error formatting date: $dateStr", e)
            dateStr
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
