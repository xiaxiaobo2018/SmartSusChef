package com.smartsuschef.mobile.util

import androidx.test.espresso.IdlingResource
import okhttp3.Dispatcher
import okhttp3.OkHttpClient

/**
 * Wraps an OkHttpClient's [Dispatcher] as an Espresso [IdlingResource].
 *
 * The resource is idle when there are no running calls on the dispatcher.
 * This eliminates the need for Thread.sleep() when waiting for network responses.
 */
class OkHttp3IdlingResource(
    private val name: String,
    private val dispatcher: Dispatcher,
) : IdlingResource {
    @Volatile
    private var callback: IdlingResource.ResourceCallback? = null

    init {
        dispatcher.idleCallback =
            Runnable {
                callback?.onTransitionToIdle()
            }
    }

    override fun getName(): String = name

    override fun isIdleNow(): Boolean = dispatcher.runningCallsCount() == 0

    override fun registerIdleTransitionCallback(callback: IdlingResource.ResourceCallback?) {
        this.callback = callback
    }

    companion object {
        fun create(
            name: String,
            client: OkHttpClient,
        ): OkHttp3IdlingResource {
            return OkHttp3IdlingResource(name, client.dispatcher)
        }
    }
}
