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
import com.smartsuschef.mobile.util.Resource
import com.smartsuschef.mobile.util.showToast
import dagger.hilt.android.AndroidEntryPoint
import java.text.SimpleDateFormat
import java.util.Locale
import kotlin.math.abs

@AndroidEntryPoint
class ForecastFragment : Fragment(R.layout.fragment_forecast) {
    companion object {
        private const val TAG = "ForecastFragment"
        private const val HUNDRED_PERCENT = 100.0
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
    private fun setupSummaryChart(summaryData: List<DailySummary>) {
        val (barEntries, lineEntries, labels) = prepareSummaryChartData(summaryData)

        val barSet = createBarDataSet(barEntries)
        val lineSet = createLineDataSet(lineEntries)

        val combinedData =
            CombinedData().apply {
                setData(BarData(barSet))
                setData(LineData(lineSet))
            }

        styleSummaryChart(labels, combinedData)
    }

    @Suppress("MaxLineLength")
    private fun prepareSummaryChartData(summaryData: List<DailySummary>): Triple<List<BarEntry>, List<Entry>, List<String>> {
        val barEntries = mutableListOf<BarEntry>()
        val lineEntries = mutableListOf<Entry>()
        val labels = mutableListOf<String>()
        var totalDishes = 0

        summaryData.forEachIndexed { index, summary ->
            barEntries.add(BarEntry(index.toFloat(), summary.totalQuantity.toFloat()))
            lineEntries.add(Entry(index.toFloat(), summary.totalQuantity.toFloat()))
            labels.add(formatDate(summary.date))
            totalDishes += summary.totalQuantity
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

    @Suppress("MagicNumber")
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

    @Suppress("MagicNumber")
    private fun styleSummaryChart(
        labels: List<String>,
        data: CombinedData,
    ) {
        binding.summaryCombinedChart.apply {
            this.data = data
            description.isEnabled = false
            setDrawGridBackground(false)
            setExtraOffsets(10f, 10f, 10f, 20f)

            val markerView = ForecastMarkerView(requireContext(), R.layout.marker_view)
            markerView.chartView = this
            markerView.chartType = ForecastMarkerView.ChartType.SIMPLE
            markerView.labels = labels
            marker = markerView

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
    @Suppress("MagicNumber")
    private fun setupStackedBarChart(forecastData: List<DailyDishForecast>) {
        val (entries, labels, dishNames) = prepareStackedBarChartData(forecastData)

        val dataSet = createStackedBarDataSet(entries, dishNames)
        val barData = BarData(dataSet).apply { barWidth = 0.8f }

        styleStackedBarChart(labels, dishNames, barData)
    }

    @Suppress("MaxLineLength")
    private fun prepareStackedBarChartData(forecastData: List<DailyDishForecast>): Triple<List<BarEntry>, List<String>, Array<String>> {
        val labels = mutableListOf<String>()
        val totalDishes = forecastData.sumOf { it.dishes.sumOf { d -> d.predictedSales } }
        val avg = if (forecastData.isNotEmpty()) totalDishes / forecastData.size else 0

        binding.tvDishesSubtitle.text =
            "AI-predicted main dishes breakdown for next 7 days · Avg: $avg dishes/day"

        // Collect all unique dish names across all days
        val allDishNames =
            forecastData
                .flatMap { it.dishes }
                .map { it.name }
                .distinct()

        val entries =
            forecastData.mapIndexed { index, daily ->
                val values =
                    allDishNames.map { dishName ->
                        daily.dishes.find { it.name == dishName }?.predictedSales?.toFloat() ?: 0f
                    }.toFloatArray()
                labels.add(formatDate(daily.date))
                BarEntry(index.toFloat(), values)
            }

        return Triple(entries, labels, allDishNames.toTypedArray())
    }

    private fun createStackedBarDataSet(
        entries: List<BarEntry>,
        dishNames: Array<String>,
    ): BarDataSet {
        return BarDataSet(entries, "").apply {
            colors = getChartColors()
            stackLabels = dishNames
            setDrawValues(false)
            highLightAlpha = 0
        }
    }

    private fun getChartColors(): List<Int> {
        val colorIds =
            listOf(
                R.color.chart_1,
                R.color.chart_2,
                R.color.chart_3,
                R.color.chart_4,
                R.color.chart_5,
                R.color.chart_6,
                R.color.chart_7,
                R.color.chart_8,
                R.color.chart_9,
                R.color.chart_10,
            )
        return colorIds.map { ContextCompat.getColor(requireContext(), it) }
    }

    @Suppress("MagicNumber")
    private fun styleStackedBarChart(
        labels: List<String>,
        dishNames: Array<String>,
        data: BarData,
    ) {
        binding.dishForecastStackedChart.apply {
            this.data = data
            description.isEnabled = false
            setDrawGridBackground(false)
            setExtraOffsets(5f, 10f, 10f, 20f)

            val markerView = ForecastMarkerView(requireContext(), R.layout.marker_view)
            markerView.chartView = this
            markerView.chartType = ForecastMarkerView.ChartType.STACKED
            markerView.dishNames = dishNames
            markerView.labels = labels
            marker = markerView

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
                textSize = 8f
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
    @Suppress("MagicNumber")
    private fun setupComparisonChart(comparisonData: List<ComparisonDay>) {
        if (comparisonData.isEmpty()) {
            binding.comparisonBarChart.clear()
            binding.comparisonBarChart.invalidate()
            binding.tvAccuracy.text = "—"
            binding.tvAccuracyDiff.text = "No prediction data available"
            return
        }

        updateAccuracyDisplay(comparisonData)

        val labels = comparisonData.map { formatDate(it.date) }
        val predictedEntries = mutableListOf<BarEntry>()
        val actualEntries = mutableListOf<BarEntry>()

        comparisonData.forEachIndexed { index, day ->
            val compData =
                ForecastMarkerView.ComparisonData(day.predicted, day.actual)
            predictedEntries.add(
                BarEntry(index.toFloat(), day.predicted.toFloat()).apply { data = compData },
            )
            actualEntries.add(
                BarEntry(index.toFloat(), day.actual.toFloat()).apply { data = compData },
            )
        }

        val predictedSet =
            BarDataSet(predictedEntries, "Predicted").apply {
                color = ContextCompat.getColor(requireContext(), R.color.forecast_gold)
                setDrawValues(false)
            }
        val actualSet =
            BarDataSet(actualEntries, "Actual Sales").apply {
                color = ContextCompat.getColor(requireContext(), R.color.primary)
                setDrawValues(false)
            }

        val groupSpace = 0.3f
        val barSpace = 0.05f
        val barWidth = 0.3f

        val barData =
            BarData(predictedSet, actualSet).apply {
                this.barWidth = barWidth
            }

        styleComparisonChart(labels, barData, groupSpace, barSpace)
    }

    private fun updateAccuracyDisplay(comparisonData: List<ComparisonDay>) {
        val totalPredicted = comparisonData.sumOf { it.predicted }
        val totalActual = comparisonData.sumOf { it.actual }
        val accuracy =
            if (totalPredicted > 0) {
                (1 - abs(totalActual - totalPredicted).toDouble() / totalPredicted) * HUNDRED_PERCENT
            } else {
                0.0
            }
        val difference = totalActual - totalPredicted

        binding.tvAccuracy.text = String.format(Locale.getDefault(), "%.1f%%", accuracy)

        val diffText = "${abs(difference)} dishes ${if (difference >= 0) "above" else "below"} prediction"
        binding.tvAccuracyDiff.text = diffText
        val diffColor =
            if (difference >= 0) R.color.success_green else R.color.destructive
        binding.tvAccuracyDiff.setTextColor(ContextCompat.getColor(requireContext(), diffColor))
    }

    @Suppress("MagicNumber")
    private fun styleComparisonChart(
        labels: List<String>,
        data: BarData,
        groupSpace: Float,
        barSpace: Float,
    ) {
        val chart = binding.comparisonBarChart
        chart.apply {
            this.data = data
            description.isEnabled = false
            setDrawGridBackground(false)
            setExtraOffsets(10f, 10f, 10f, 20f)

            val markerView = ForecastMarkerView(requireContext(), R.layout.marker_view)
            markerView.chartView = this
            markerView.chartType = ForecastMarkerView.ChartType.COMPARISON
            markerView.labels = labels
            marker = markerView

            isHighlightPerTapEnabled = true
            isHighlightPerDragEnabled = false

            val groupWidth = data.getGroupWidth(groupSpace, barSpace)

            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                valueFormatter = IndexAxisValueFormatter(labels)
                labelRotationAngle = -45f
                textSize = 8f
                granularity = 1f
                setDrawGridLines(false)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
                axisLineColor = Color.TRANSPARENT
                setCenterAxisLabels(true)
                axisMinimum = 0f
                axisMaximum = groupWidth * labels.size
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

            groupBars(0f, groupSpace, barSpace)
            invalidate()
        }
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
