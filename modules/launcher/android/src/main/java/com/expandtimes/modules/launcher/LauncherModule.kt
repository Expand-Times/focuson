package com.expandtimes.modules.launcher

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.app.AppOpsManager
import android.os.Process
import android.os.Build
import android.os.PowerManager
import android.text.TextUtils
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.util.Collections
import java.util.Calendar
import android.app.usage.UsageStatsManager
import android.app.usage.UsageEvents

import android.content.pm.ApplicationInfo

class LauncherModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React Context is null")
    
  private fun isSystemApp(packageName: String): Boolean {
     return try {
         val pm = context.packageManager
         val appInfo = pm.getApplicationInfo(packageName, 0)
         // Consider it a system app only if it is a system app AND hasn't been updated by user
         // This allows counting usage for pre-installed apps like YouTube/Chrome if they've been updated
         val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
         val isUpdated = (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0
         
         isSystem && !isUpdated
     } catch (e: Exception) {
         false
     }
   }

  private val broadSystemPackages = listOf(
    "com.android.systemui",
    "com.android.settings",
    "com.android.vending", // Google Play Store
    "com.google.android.gms", // Google Play Services
    "com.google.android.googlequicksearchbox", // Google App
    "android",
    "com.android.phone",
    "com.android.providers",
    "com.android.permissioncontroller"
  )

  private fun isBroadSystemApp(packageName: String): Boolean {
    if (broadSystemPackages.any { packageName.startsWith(it) }) return true
    return packageName.contains(".overlay") || packageName.contains(".service")
  }

  private val launcherPackages = listOf(
    "com.expandtimes.minimallife", // This app
    "com.sec.android.app.launcher", // Samsung
    "com.google.android.apps.nexuslauncher", // Pixel
    "com.miui.home", // Xiaomi
    "com.huawei.android.launcher", // Huawei
    "com.oppo.launcher", // Oppo
    "com.bbk.launcher2", // Vivo
    "com.oneplus.launcher", // OnePlus
    "com.teslacoilsw.launcher", // Nova Launcher
    "com.android.launcher", // Generic
    "com.android.launcher3", // AOSP
    "com.microsoft.launcher", // Microsoft Launcher
    "com.actionlauncher.playstore" // Action Launcher
  )

  private fun isLauncherPackage(packageName: String): Boolean {
    val lowerPkg = packageName.lowercase()
    if (launcherPackages.any { lowerPkg == it.lowercase() }) return true
    return lowerPkg.contains("launcher") || lowerPkg.endsWith(".home")
  }

  private fun getIconBase64(drawable: Drawable): String {
      val bitmap = if (drawable is BitmapDrawable) {
          drawable.bitmap
      } else {
          val bitmap = Bitmap.createBitmap(drawable.intrinsicWidth, drawable.intrinsicHeight, Bitmap.Config.ARGB_8888)
          val canvas = Canvas(bitmap)
          drawable.setBounds(0, 0, canvas.width, canvas.height)
          drawable.draw(canvas)
          bitmap
      }
      val outputStream = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
      return Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)
  }

  private fun getUsageStatsMap(): Map<String, Long> {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP_MR1) return emptyMap()
      
      try {
          val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
          val calendar = Calendar.getInstance()
          calendar.set(Calendar.HOUR_OF_DAY, 0)
          calendar.set(Calendar.MINUTE, 0)
          calendar.set(Calendar.SECOND, 0)
          calendar.set(Calendar.MILLISECOND, 0)
          val startTime = calendar.timeInMillis
          val endTime = System.currentTimeMillis()

          val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
          val result = mutableMapOf<String, Long>()
          
          for ((packageName, usageStats) in usageStatsMap) {
              result[packageName] = usageStats.totalTimeInForeground
          }
          return result
      } catch (e: Exception) {
          e.printStackTrace()
          return emptyMap()
      }
  }

  private fun getAppLaunchCounts(): Map<String, Int> {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return emptyMap()

      try {
          val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
          val calendar = Calendar.getInstance()
          calendar.set(Calendar.HOUR_OF_DAY, 0)
          calendar.set(Calendar.MINUTE, 0)
          calendar.set(Calendar.SECOND, 0)
          calendar.set(Calendar.MILLISECOND, 0)
          val startTime = calendar.timeInMillis
          val endTime = System.currentTimeMillis()

          val events = usageStatsManager.queryEvents(startTime, endTime)
          val counts = mutableMapOf<String, Int>()
          val event = UsageEvents.Event()

          while (events.hasNextEvent()) {
              events.getNextEvent(event)
              if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                  val pkg = event.packageName
                  counts[pkg] = (counts[pkg] ?: 0) + 1
              }
          }
          return counts
      } catch (e: Exception) {
          e.printStackTrace()
          return emptyMap()
      }
  }

  private fun getCategoryLabel(category: Int): String {
      return when (category) {
          0 -> "Game" // ApplicationInfo.CATEGORY_GAME
          1 -> "Audio" // ApplicationInfo.CATEGORY_AUDIO
          2 -> "Video" // ApplicationInfo.CATEGORY_VIDEO
          3 -> "Image" // ApplicationInfo.CATEGORY_IMAGE
          4 -> "Social" // ApplicationInfo.CATEGORY_SOCIAL
          5 -> "News" // ApplicationInfo.CATEGORY_NEWS
          6 -> "Maps" // ApplicationInfo.CATEGORY_MAPS
          7 -> "Productivity" // ApplicationInfo.CATEGORY_PRODUCTIVITY
          8 -> "Accessibility" // ApplicationInfo.CATEGORY_ACCESSIBILITY (API 31+)
          else -> "Other"
      }
  }

  override fun definition() = ModuleDefinition {
    Name("Launcher")

    Function("checkUsageStatsPermission") {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
        return@Function mode == AppOpsManager.MODE_ALLOWED
    }

    Function("openUsageAccessSettings") {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    Function("checkOverlayPermission") {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return@Function Settings.canDrawOverlays(context)
        }
        return@Function true
    }

    Function("isAccessibilityServiceEnabled") {
        val expectedComponentName = context.packageName + "/" + LauncherAccessibilityService::class.java.canonicalName
        val enabledServicesSetting = Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: return@Function false
        val colonSplitter = TextUtils.SimpleStringSplitter(':')
        colonSplitter.setString(enabledServicesSetting)
        while (colonSplitter.hasNext()) {
            val componentName = colonSplitter.next()
            if (componentName.equals(expectedComponentName, ignoreCase = true)) {
                return@Function true
            }
        }
        return@Function false
    }

    Function("checkNotificationPermission") {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return@Function context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        }
        return@Function true
    }

    Function("openNotificationSettings") {
        val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
        intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    Function("isIgnoringBatteryOptimizations") {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            return@Function powerManager.isIgnoringBatteryOptimizations(context.packageName)
        }
        return@Function true
    }

    Function("getInstalledApps") {
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null)
        intent.addCategory(Intent.CATEGORY_LAUNCHER)
        val apps = pm.queryIntentActivities(intent, 0)
        val appList = mutableListOf<Map<String, Any>>()
        val currentPackageName = context.packageName
        
        val usageMap = getUsageStatsMap()
        val launchCountMap = getAppLaunchCounts()

        for (app in apps) {
            try {
                val packageName = app.activityInfo.packageName
                // Skip the launcher itself
                if (packageName == currentPackageName) continue

                val label = app.loadLabel(pm).toString()
                val iconDrawable = app.loadIcon(pm)
                val iconBase64 = getIconBase64(iconDrawable)
                val usageTime = usageMap[packageName] ?: 0L
                val launchCount = launchCountMap[packageName] ?: 0
                
                val category = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    getCategoryLabel(app.activityInfo.applicationInfo.category)
                } else {
                    "Other"
                }

                appList.add(mapOf(
                    "packageName" to packageName,
                    "label" to label,
                    "icon" to iconBase64,
                    "usageTime" to usageTime,
                    "launchCount" to launchCount,
                    "category" to category
                ))
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        
        // Sort by label
        appList.sortBy { (it["label"] as String).lowercase() }
        
        return@Function appList
    }

    Function("launchApp") { packageName: String ->
        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
            return@Function true
        }
        return@Function false
    }

    Function("startTimerOverlay") { durationMs: Double, targetPackageName: String? ->
        val intent = Intent(context, TimerOverlayService::class.java)
        intent.putExtra("DURATION_MS", durationMs.toLong())
        intent.putExtra("TARGET_PACKAGE", targetPackageName)
        context.startService(intent)
    }

    Function("getWeeklyUsageStats") {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - (7 * 24 * 60 * 60 * 1000)
        
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val currentPackageName = context.packageName
        
        // Average Screen Time
        val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
        var totalTime = 0L
        for ((packageName, usageStats) in usageStatsMap) {
            if (packageName != currentPackageName) {
                totalTime += usageStats.totalTimeInForeground
            }
        }
        val averageDailyUsage = totalTime / 7
        
        // Average Unlocks
        var unlockCount = 0
        val events = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()
        
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            // Event.KEYGUARD_HIDDEN = 18 (API 28+)
            if (event.eventType == 18) {
                unlockCount++
            }
        }
        
        val averageDailyUnlocks = if (unlockCount > 0) unlockCount / 7 else 0
        
        return@Function mapOf(
            "averageDailyUsage" to averageDailyUsage,
            "averageDailyUnlocks" to averageDailyUnlocks
        )
    }

    Function("getTodayUsageStats") {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val startTime = calendar.timeInMillis

        val endCalendar = Calendar.getInstance()
        endCalendar.set(Calendar.HOUR_OF_DAY, 23)
        endCalendar.set(Calendar.MINUTE, 59)
        endCalendar.set(Calendar.SECOND, 59)
        endCalendar.set(Calendar.MILLISECOND, 999)
        val endTime = endCalendar.timeInMillis
        
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val currentPackageName = context.packageName
        
        // Get installed apps (launcher activities) to filter usage
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null)
        intent.addCategory(Intent.CATEGORY_LAUNCHER)
        val resolveInfos = pm.queryIntentActivities(intent, 0)
        val installedPackages = resolveInfos.map { it.activityInfo.packageName }.toSet()

        // Get home apps (launchers) to exclude
        val homeIntent = Intent(Intent.ACTION_MAIN)
        homeIntent.addCategory(Intent.CATEGORY_HOME)
        val homeResolveInfos = pm.queryIntentActivities(homeIntent, 0)
        val homePackages = homeResolveInfos.map { it.activityInfo.packageName }.toSet()
        
        // Total Screen Time
        val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
        var totalTime = 0L
        val packageUsage = mutableMapOf<String, Long>()

        for ((packageName, usageStats) in usageStatsMap) {
            val time = usageStats.totalTimeInForeground
            if (time > 0) {
                // Apply strict filtering based on user request
                // We use installedPackages to ensure it has a launcher icon (user-facing)
                // And then filter out broad system apps, launchers, and the current app itself
                if (installedPackages.contains(packageName) && 
                    packageName != currentPackageName && 
                    !homePackages.contains(packageName) &&
                    !isLauncherPackage(packageName) && 
                    !isBroadSystemApp(packageName) &&
                    !isSystemApp(packageName)) {
                    totalTime += time
                }
                packageUsage[packageName] = time
            }
        }
        
        // Unlocks
        var unlockCount = 0
        val events = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()
        
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            // Event.KEYGUARD_HIDDEN = 18 (API 28+)
            if (event.eventType == 18) {
                unlockCount++
            }
        }
        
        return@Function mapOf(
            "totalUsageTime" to totalTime,
            "unlockCount" to unlockCount,
            "packageUsage" to packageUsage
        )
    }

    View(LauncherView::class) {
      Prop("url") { view: LauncherView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      Events("onLoad")
    }
  }
}
