package com.smartsuschef.mobile.util

import android.content.Context
import android.content.pm.PackageManager
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.rules.TestRule
import org.junit.runner.Description
import org.junit.runners.model.Statement
import java.io.IOException

class AnimationDisableRule : TestRule {
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private val context: Context = instrumentation.context
    private val permission = "android.permission.SET_ANIMATION_SCALE"

    override fun apply(
        base: Statement,
        description: Description,
    ): Statement {
        return object : Statement() {
            override fun evaluate() {
                val hasPermission = context.checkCallingOrSelfPermission(permission) == PackageManager.PERMISSION_GRANTED
                if (hasPermission) {
                    toggleAnimation(false)
                }
                try {
                    base.evaluate()
                } finally {
                    if (hasPermission) {
                        toggleAnimation(true)
                    }
                }
            }
        }
    }

    private fun toggleAnimation(enable: Boolean) {
        val scale = if (enable) "1" else "0"
        try {
            instrumentation.uiAutomation.executeShellCommand("settings put global window_animation_scale $scale")
            instrumentation.uiAutomation.executeShellCommand("settings put global transition_animation_scale $scale")
            instrumentation.uiAutomation.executeShellCommand("settings put global animator_duration_scale $scale")
        } catch (e: IOException) {
            // Handle exception if command fails
            e.printStackTrace()
        }
    }
}
