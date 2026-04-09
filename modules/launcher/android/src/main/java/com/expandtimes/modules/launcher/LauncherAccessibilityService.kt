package com.expandtimes.modules.launcher

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.content.Context
import android.content.Intent
import java.lang.ref.WeakReference

class LauncherAccessibilityService : AccessibilityService() {
    
    companion object {
        var instance: WeakReference<LauncherAccessibilityService>? = null
            private set
            
        var currentForegroundPackage: String? = null
            private set
    }

    private var watchingPermission: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private val checkPermissionRunnable = object : Runnable {
        override fun run() {
            watchingPermission?.let { permission ->
                if (checkPermission(permission)) {
                    watchingPermission = null
                    bringAppToForeground()
                } else {
                    handler.postDelayed(this, 500)
                }
            }
        }
    }

    fun startWatchingPermission(permission: String) {
        watchingPermission = permission
        handler.removeCallbacks(checkPermissionRunnable)
        handler.post(checkPermissionRunnable)
    }

    private fun checkPermission(permission: String): Boolean {
        return when (permission) {
            "usageStats" -> {
                val appOps = getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
                val mode = appOps.checkOpNoThrow(android.app.AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName)
                mode == android.app.AppOpsManager.MODE_ALLOWED
            }
            "overlay" -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    android.provider.Settings.canDrawOverlays(this)
                } else true
            }
            "battery" -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    val powerManager = getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
                    powerManager.isIgnoringBatteryOptimizations(packageName)
                } else true
            }
            "notification" -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED
                } else true
            }
            else -> false
        }
    }

    private fun bringAppToForeground() {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = WeakReference(this)

        val prefs = getSharedPreferences("LauncherPrefs", Context.MODE_PRIVATE)
        val awaitingTs = prefs.getLong("awaiting_accessibility_ts", 0L)
        val now = System.currentTimeMillis()
        
        // If the request was made within the last 5 minutes (300000 ms)
        if (now - awaitingTs < 300000) {
            prefs.edit().remove("awaiting_accessibility_ts").apply()
            bringAppToForeground()
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            event.packageName?.let {
                currentForegroundPackage = it.toString()
                
                // If our app comes to the foreground, stop watching for permissions
                // to prevent infinite polling if the user returns without granting
                if (currentForegroundPackage == packageName) {
                    watchingPermission = null
                    handler.removeCallbacks(checkPermissionRunnable)
                }
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

    fun openNotifications(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
    }

    fun openQuickSettings(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS)
    }
}
