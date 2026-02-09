package com.smartsuschef.mobile.util

import android.os.Build

/**
 * Detects whether the app is running on an Android emulator or a real device.
 * Used to automatically switch between local and AWS backend URLs.
 */
object EmulatorDetector {

    fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.BOARD == "QC_Reference_Phone"
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.HOST.startsWith("Build")
                || Build.BRAND.startsWith("generic")
                || Build.DEVICE.startsWith("generic")
                || Build.PRODUCT == "google_sdk"
                || Build.PRODUCT == "sdk_gphone64_arm64"
                || Build.PRODUCT == "sdk_gphone_x86_64"
                || Build.PRODUCT.startsWith("sdk")
                || Build.HARDWARE.contains("goldfish")
                || Build.HARDWARE.contains("ranchu"))
    }
}
