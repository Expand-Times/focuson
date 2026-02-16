package com.expandtimes.modules.launcher

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.os.Build
import java.lang.ref.WeakReference

class LauncherAccessibilityService : AccessibilityService() {
    
    companion object {
        var instance: WeakReference<LauncherAccessibilityService>? = null
            private set
            
        var currentForegroundPackage: String? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = WeakReference(this)
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
    
    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    fun lockScreen(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
        } else {
            false
        }
    }
}
