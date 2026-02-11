package com.smartsuschef.mobile.util

import java.util.Date
import javax.inject.Inject

class DefaultDateProvider
    @Inject
    constructor() : DateProvider {
        override fun getCurrentDate(): Date = Date()
    }
