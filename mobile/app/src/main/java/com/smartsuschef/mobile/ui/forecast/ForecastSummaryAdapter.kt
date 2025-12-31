package com.smartsuschef.mobile.ui.forecast

import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import com.smartsuschef.mobile.databinding.ItemIngredientForecastRowBinding
import com.smartsuschef.mobile.databinding.ItemIngredientHeaderBinding
import java.text.SimpleDateFormat
import java.util.Locale

class ForecastSummaryAdapter(
    private var items: List<IngredientForecast>,
    private var dates: List<String>,
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    companion object {
        private const val TAG = "ForecastSummaryAdapter"
        private const val VIEW_TYPE_HEADER = 0
        private const val VIEW_TYPE_ITEM = 1
        private const val DAYS_COUNT = 7
    }

    // Header ViewHolder
    class HeaderViewHolder(
        val binding: ItemIngredientHeaderBinding,
    ) : RecyclerView.ViewHolder(binding.root)

    // Data ViewHolder
    class DataViewHolder(
        val binding: ItemIngredientForecastRowBinding,
    ) : RecyclerView.ViewHolder(binding.root)

    override fun getItemViewType(position: Int): Int = if (position == 0) VIEW_TYPE_HEADER else VIEW_TYPE_ITEM

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int,
    ): RecyclerView.ViewHolder =
        if (viewType == VIEW_TYPE_HEADER) {
            val binding =
                ItemIngredientHeaderBinding.inflate(
                    LayoutInflater.from(parent.context),
                    parent,
                    false,
                )
            HeaderViewHolder(binding)
        } else {
            val binding =
                ItemIngredientForecastRowBinding.inflate(
                    LayoutInflater.from(parent.context),
                    parent,
                    false,
                )
            DataViewHolder(binding)
        }

    override fun onBindViewHolder(
        holder: RecyclerView.ViewHolder,
        position: Int,
    ) {
        if (holder is HeaderViewHolder) {
            bindHeader(holder)
        } else if (holder is DataViewHolder) {
            bindData(holder, position - 1) // Adjust for header offset
        }
    }

    private fun bindHeader(holder: HeaderViewHolder) {
        holder.binding.apply {
            // Set date headers (formatted to "d MMM")
            val headerViews = listOf(day1Header, day2Header, day3Header, day4Header, day5Header, day6Header, day7Header)
            dates.take(DAYS_COUNT).forEachIndexed { index, date ->
                if (index < headerViews.size) {
                    headerViews[index].text = formatDate(date)
                }
            }
        }
    }

    private fun bindData(
        holder: DataViewHolder,
        position: Int,
    ) {
        val item = items[position]
        holder.binding.apply {
            tvIngredientName.text = "${item.name} (${item.unit})"

            // Map the 7 quantities to the 7 textviews
            val quantityViews = listOf(day1, day2, day3, day4, day5, day6, day7)
            item.totalQuantity.forEachIndexed { index, qty ->
                if (index < quantityViews.size) {
                    quantityViews[index].text = if (qty > 0) String.format(Locale.US, "%.1f", qty) else "-"
                }
            }
        }
    }

    override fun getItemCount() = items.size + 1 // +1 for header

    fun updateData(
        newItems: List<IngredientForecast>,
        newDates: List<String>,
    ) {
        val oldItems = items
        val oldDates = dates
        val diffResult =
            DiffUtil.calculateDiff(
                object : DiffUtil.Callback() {
                    override fun getOldListSize() = oldItems.size + 1

                    override fun getNewListSize() = newItems.size + 1

                    override fun areItemsTheSame(
                        oldPos: Int,
                        newPos: Int,
                    ): Boolean {
                        if (oldPos == 0 && newPos == 0) return true
                        if (oldPos == 0 || newPos == 0) return false
                        return oldItems[oldPos - 1].name == newItems[newPos - 1].name
                    }

                    override fun areContentsTheSame(
                        oldPos: Int,
                        newPos: Int,
                    ): Boolean {
                        if (oldPos == 0 && newPos == 0) return oldDates == newDates
                        if (oldPos == 0 || newPos == 0) return false
                        return oldItems[oldPos - 1] == newItems[newPos - 1]
                    }
                },
            )
        items = newItems
        dates = newDates
        diffResult.dispatchUpdatesTo(this)
    }

    private fun formatDate(dateStr: String): String =
        try {
            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val formatter = SimpleDateFormat("d MMM", Locale.getDefault())
            parser.parse(dateStr)?.let { formatter.format(it) } ?: dateStr
        } catch (e: Exception) {
            Log.e(TAG, "Error formatting date: $dateStr", e)
            dateStr
        }
}
