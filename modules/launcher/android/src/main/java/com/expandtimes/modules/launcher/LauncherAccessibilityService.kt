package com.expandtimes.modules.launcher

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class LauncherAccessibilityService : AccessibilityService() {
    
    companion object {
        var currentForegroundPackage: String? = null
            private set
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            event.packageName?.let {
                currentForegroundPackage = it.toString()
            }
        }
    }

    override fun onInterrupt() {
        // Handle interruption
    }
}
