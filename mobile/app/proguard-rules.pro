# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Retrofit + Gson ──────────────────────────────────────────
-keepattributes Signature
-keepattributes *Annotation*

# Retain generic signatures of TypeToken and its subclasses (Gson)
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken

# Keep Retrofit service interfaces
-keep,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn retrofit2.**
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep API model / DTO classes used with Gson
-keep class com.smartsuschef.mobile.data.model.** { *; }

# ── Hilt / Dagger ───────────────────────────────────────────
-dontwarn dagger.hilt.**

# ── OkHttp ───────────────────────────────────────────────────
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ── Navigation SafeArgs ─────────────────────────────────────
-keep class * extends androidx.navigation.NavArgs { *; }

# ── MPAndroidChart ───────────────────────────────────────────
-keep class com.github.mikephil.charting.** { *; }