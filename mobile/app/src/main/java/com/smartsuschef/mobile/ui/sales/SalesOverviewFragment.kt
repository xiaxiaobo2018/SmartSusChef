package com.smartsuschef.mobile.ui.sales

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.TextView
import androidx.appcompat.widget.PopupMenu
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.github.mikephil.charting.charts.CombinedChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.data.CombinedData
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.github.mikephil.charting.highlight.Highlight
import com.github.mikephil.charting.listener.OnChartValueSelectedListener
import com.smartsuschef.mobile.R
import com.smartsuschef.mobile.databinding.FragmentSalesOverviewBinding
import com.smartsuschef.mobile.network.dto.HolidayDto
import com.smartsuschef.mobile.util.Resource
import com.smartsuschef.mobile.util.gone
import com.smartsuschef.mobile.util.showToast
import com.smartsuschef.mobile.util.visible
import dagger.hilt.android.AndroidEntryPoint
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@AndroidEntryPoint
class SalesOverviewFragment : Fragment(R.layout.fragment_sales_overview) {
    private var _binding: FragmentSalesOverviewBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SalesViewModel by viewModels()

    override fun onViewCreated(
        view: View,
        savedInstanceState: Bundle?,
    ) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentSalesOverviewBinding.bind(view)

        setupCombinedChart()
        observeViewModel()
        observeWeather()
        observeHolidays()
        observeFilter()
        binding.tvDateContext.setOnClickListener { v -> showFilterMenu(v) }
    }

    @Suppress("MagicNumber")
    private fun setupCombinedChart() {
        binding.salesCombinedChart.apply {
            description.isEnabled = false
            setDrawGridBackground(false)
            setExtraOffsets(10f, 10f, 10f, 20f)

            // Ensures the line is drawn on top of the bars
            setDrawOrder(arrayOf(CombinedChart.DrawOrder.BAR, CombinedChart.DrawOrder.LINE))

            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                setDrawGridLines(false)
                granularity = 1f // Ensures only whole numbers are displayed for entries
                isGranularityEnabled = true
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
                axisLineColor = Color.TRANSPARENT
                labelRotationAngle = -45f
                textSize = 8f
                // Allow MPAndroidChart to handle spacing naturally without facing labels inward
                setAvoidFirstLastClipping(false)
            }

            axisLeft.apply {
                setDrawGridLines(true)
                gridColor = ContextCompat.getColor(requireContext(), R.color.border_grey)
                textColor = ContextCompat.getColor(requireContext(), R.color.muted_text)
                axisLineColor = Color.TRANSPARENT
                // Ensure min value starts at 0, max is dynamic based on data
                axisMinimum = 0f
                setSpaceBottom(15f)
            }
            axisRight.isEnabled = false // Disable right y-axis
            legend.isEnabled = true

            setOnChartValueSelectedListener(
                object : OnChartValueSelectedListener {
                    override fun onValueSelected(
                        e: Entry?,
                        h: Highlight?,
                    ) {
                        // Get the actual date label from the X-axis (e.g. "31 Jan")
                        val selectedDateIndex = e?.x?.toInt() ?: return

                        // Find the original full date string from the ViewModel's salesTrend
                        val salesTrendData =
                            (viewModel.salesTrend.value as? Resource.Success)?.data
                        val fullDate = salesTrendData?.getOrNull(selectedDateIndex)?.date

                        if (fullDate != null) {
                            val action =
                                SalesOverviewFragmentDirections
                                    .actionNavSalesToSalesDetailFragment(date = fullDate)
                            findNavController().navigate(action)
                        } else {
                            requireContext().showToast("Could not retrieve full date for selected entry.")
                        }
                    }

                    override fun onNothingSelected() {
                        // This is intentionally left empty because no action is needed when nothing is selected.
                    }
                },
            )
        }
    }

    private fun observeViewModel() {
        viewModel.salesTrend.observe(viewLifecycleOwner) { result ->
            when (result) {
                is Resource.Loading -> binding.progressBar.visible()
                is Resource.Success -> {
                    binding.progressBar.gone()
                    val salesData = result.data ?: emptyList()

                    if (salesData.isNotEmpty()) {
                        updateChart(salesData)
                    } else {
                        binding.salesCombinedChart.clear()
                        requireContext().showToast("No sales data available")
                    }
                }
                is Resource.Error -> {
                    binding.progressBar.gone()
                    binding.salesCombinedChart.clear()
                    requireContext().showToast(result.message ?: "Error loading sales data")
                }
            }
        }
    }

    @Suppress("MagicNumber")
    private fun updateChart(salesData: List<SalesTrendItem>) {
        // Calculate average for subtitle
        val avgSales = salesData.map { it.sales }.average().toInt()
        binding.tvSalesSubtitle.text = "Total dishes sold · Average: $avgSales per day"

        val barEntries = mutableListOf<BarEntry>()
        val lineEntries = mutableListOf<Entry>()
        val labels = mutableListOf<String>()

        val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val outputFormat = SimpleDateFormat("d MMM", Locale.getDefault())

        // Populate data
        salesData.forEachIndexed { index, item ->
            barEntries.add(BarEntry(index.toFloat(), item.sales.toFloat()))
            lineEntries.add(Entry(index.toFloat(), item.sales.toFloat()))

            // Format date label
            val formattedLabel =
                try {
                    inputFormat.parse(item.date)?.let { outputFormat.format(it) } ?: item.date
                } catch (e: Exception) {
                    e.printStackTrace()
                    item.date
                }
            labels.add(formattedLabel)
        }

        // Configure X-axis based on data size
        binding.salesCombinedChart.xAxis.apply {
            valueFormatter = IndexAxisValueFormatter(labels)

            // Dynamic axis range based on number of data points
            axisMinimum = -0.5f
            axisMaximum = (salesData.size - 1).toFloat() + 0.5f
            setLabelCount(salesData.size, false)
        }

        // Create combined data
        val combinedData = CombinedData()

        // Add bar chart data
        val barDataSet =
            BarDataSet(barEntries, "Daily Sales").apply {
                color = ContextCompat.getColor(requireContext(), R.color.primary)
                setDrawValues(false)
            }

        val barData = BarData(barDataSet)

        // Adjust bar width based on number of data points
        if (salesData.size == 1) {
            // Make bar wider for single day view (takes up more space)
            barData.barWidth = 0.5f
        } else {
            // Default bar width for multi-day view
            barData.barWidth = 0.8f
        }

        combinedData.setData(barData)

        // Add line chart data (only if more than 1 data point)
        if (salesData.size > 1) {
            val lineDataSet =
                LineDataSet(lineEntries, "Trend").apply {
                    color = ContextCompat.getColor(requireContext(), R.color.destructive)
                    setCircleColor(Color.RED)
                    lineWidth = 2.5f
                    circleRadius = 4f
                    setDrawCircleHole(false)
                    mode = LineDataSet.Mode.CUBIC_BEZIER
                    setDrawValues(false)
                }
            combinedData.setData(LineData(lineDataSet))
        }

        // Update chart
        binding.salesCombinedChart.data = combinedData
        binding.salesCombinedChart.notifyDataSetChanged()
        binding.salesCombinedChart.invalidate()
    }

    private fun showFilterMenu(view: View) {
        val popup = PopupMenu(requireContext(), view)
        popup.menuInflater.inflate(R.menu.date_filter_menu, popup.menu)

        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.filter_today -> {
                    viewModel.setFilter(SalesFilter.TODAY)
                    true
                }
                R.id.filter_7_days -> {
                    viewModel.setFilter(SalesFilter.LAST_7_DAYS)
                    true
                }
                else -> false
            }
        }
        popup.show()
    }

    private fun observeFilter() {
        viewModel.currentFilter.observe(viewLifecycleOwner) { filter ->
            binding.tvDateContext.text = if (filter == SalesFilter.TODAY) "Today" else "Last 7 Days"
        }
    }

    private fun observeWeather() {
        viewModel.weather.observe(viewLifecycleOwner) { result ->
            when (result) {
                is Resource.Success -> {
                    val weather = result.data
                    if (weather != null) {
                        binding.tvWeatherCondition.text = weather.condition
                        binding.tvWeatherDescription.text =
                            "${weather.temperature.toInt()}°C | ${weather.description}"
                        binding.tvWeatherHumidity.text = "${weather.humidity}%"
                        setWeatherIcon(weather.condition)
                    } else {
                        binding.tvWeatherCondition.text = "Unavailable"
                        binding.tvWeatherDescription.text = "Weather data not available"
                        binding.tvWeatherHumidity.text = "--"
                    }
                }
                is Resource.Error -> {
                    binding.tvWeatherCondition.text = "Unavailable"
                    binding.tvWeatherDescription.text = "Could not load weather"
                    binding.tvWeatherHumidity.text = "--"
                }
                is Resource.Loading -> {
                    binding.tvWeatherCondition.text = "Loading..."
                    binding.tvWeatherDescription.text = ""
                    binding.tvWeatherHumidity.text = "--"
                }
            }
        }
    }

    @Suppress("MagicNumber")
    private fun observeHolidays() {
        viewModel.holidays.observe(viewLifecycleOwner) { result ->
            when (result) {
                is Resource.Success -> {
                    val holidays = result.data ?: emptyList()
                    val upcoming = getUpcomingHolidays(holidays)
                    binding.llHolidaysList.removeAllViews()

                    if (upcoming.isNotEmpty()) {
                        binding.llHolidaysList.visible()
                        binding.tvNoHolidays.gone()
                        upcoming.forEach { holiday ->
                            val formattedDate = formatHolidayDate(holiday.date)
                            val tv =
                                TextView(requireContext()).apply {
                                    text = "\u2022 $formattedDate: ${holiday.name}"
                                    setPadding(0, 4, 0, 4)
                                }
                            binding.llHolidaysList.addView(tv)
                        }
                    } else {
                        binding.llHolidaysList.gone()
                        binding.tvNoHolidays.visible()
                    }
                }
                is Resource.Error -> {
                    binding.llHolidaysList.gone()
                    binding.tvNoHolidays.text = "Could not load events"
                    binding.tvNoHolidays.visible()
                }
                is Resource.Loading -> {
                    binding.llHolidaysList.gone()
                    binding.tvNoHolidays.text = "Loading events..."
                    binding.tvNoHolidays.visible()
                }
            }
        }
    }

    @Suppress("MagicNumber")
    private fun getUpcomingHolidays(holidays: List<HolidayDto>): List<HolidayDto> {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val today = dateFormat.format(Date())
        return holidays
            .filter { it.date >= today }
            .take(3)
    }

    private fun formatHolidayDate(dateStr: String): String {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val outputFormat = SimpleDateFormat("MMM d", Locale.getDefault())
        return try {
            inputFormat.parse(dateStr)?.let { outputFormat.format(it) } ?: dateStr
        } catch (e: Exception) {
            Log.e(TAG, "Error formatting holiday date: ${e.message}", e)
            dateStr
        }
    }

    private fun setWeatherIcon(condition: String?) {
        val drawableRes =
            when (condition?.lowercase()) {
                "clear" -> R.drawable.sun
                "partly cloudy" -> R.drawable.cloud
                "drizzle", "rainy", "rain showers" -> R.drawable.cloud_rain
                "thunderstorm" -> R.drawable.cloud_hail
                else -> R.drawable.cloud
            }
        binding.ivWeatherIcon.setImageResource(drawableRes)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val TAG = "SalesOverviewFragment"
    }
}
