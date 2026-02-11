package com.smartsuschef.mobile.util

import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.textfield.TextInputLayout
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.TypeSafeMatcher

/**
 * Custom Espresso matchers for common test assertions.
 */
object CustomMatchers {
    /**
     * Matches a [TextInputLayout] that has no error set (error == null).
     */
    fun hasNoError(): Matcher<View> {
        return object : TypeSafeMatcher<View>() {
            override fun describeTo(description: Description) {
                description.appendText("TextInputLayout with no error")
            }

            override fun matchesSafely(item: View): Boolean {
                if (item !is TextInputLayout) return false
                return item.error == null
            }
        }
    }

    /**
     * Matches a [TextInputLayout] whose error text equals [expectedError].
     * Unlike Espresso's built-in `hasErrorText()` which only works on EditText,
     * this matcher works with TextInputLayout's error display.
     */
    fun hasTextInputLayoutErrorText(expectedError: String): Matcher<View> {
        return object : TypeSafeMatcher<View>() {
            override fun describeTo(description: Description) {
                description.appendText("TextInputLayout with error: $expectedError")
            }

            override fun matchesSafely(item: View): Boolean {
                if (item !is TextInputLayout) return false
                return item.error?.toString() == expectedError
            }
        }
    }

    /**
     * Matches a [RecyclerView] whose adapter has exactly [count] items.
     */
    fun hasItemCount(count: Int): Matcher<View> {
        return object : TypeSafeMatcher<View>() {
            override fun describeTo(description: Description) {
                description.appendText("RecyclerView with item count: $count")
            }

            override fun matchesSafely(item: View): Boolean {
                if (item !is RecyclerView) return false
                return item.adapter?.itemCount == count
            }
        }
    }

    /**
     * Matches the item at a specific [position] in a [RecyclerView] against the given [itemMatcher].
     */
    fun atPosition(
        position: Int,
        itemMatcher: Matcher<View>,
    ): Matcher<View> {
        return object : TypeSafeMatcher<View>() {
            override fun describeTo(description: Description) {
                description.appendText("item at position $position: ")
                itemMatcher.describeTo(description)
            }

            override fun matchesSafely(view: View): Boolean {
                if (view !is RecyclerView) return false
                val viewHolder = view.findViewHolderForAdapterPosition(position) ?: return false
                return itemMatcher.matches(viewHolder.itemView)
            }
        }
    }
}
