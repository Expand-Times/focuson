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

  private val iconCache = mutableMapOf<String, String>()
    
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
    "com.expandtimes.focuson.launcher", // This app
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
      val TARGET_SIZE = 96
      val srcBitmap = if (drawable is BitmapDrawable) {
          drawable.bitmap
      } else {
          val w = drawable.intrinsicWidth.coerceAtLeast(1)
          val h = drawable.intrinsicHeight.coerceAtLeast(1)
          val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
          val canvas = Canvas(bitmap)
          drawable.setBounds(0, 0, canvas.width, canvas.height)
          drawable.draw(canvas)
          bitmap
      }
      val scaled = if (srcBitmap.width > TARGET_SIZE || srcBitmap.height > TARGET_SIZE) {
          Bitmap.createScaledBitmap(srcBitmap, TARGET_SIZE, TARGET_SIZE, true)
      } else {
          srcBitmap
      }
      val outputStream = ByteArrayOutputStream()
      scaled.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
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
          0 -> "Game"
          1 -> "Audio"
          2 -> "Video"
          3 -> "Image"
          4 -> "Social"
          5 -> "News"
          6 -> "Maps"
          7 -> "Productivity"
          8 -> "Accessibility"
          9 -> "Art & Design"
          10 -> "Auto & Vehicles"
          11 -> "Android Wear"
          12 -> "Beauty"
          13 -> "Books & Reference"
          14 -> "Business"
          15 -> "Comics"
          16 -> "Communication"
          17 -> "Dating"
          18 -> "Education"
          19 -> "Entertainment"
          20 -> "Events"
          21 -> "Finance"
          22 -> "Food & Drink"
          23 -> "Health & Fitness"
          24 -> "House & Home"
          25 -> "Libraries & Demo"
          26 -> "Lifestyle"
          27 -> "Medical"
          28 -> "Parenting"
          29 -> "Personalization"
          30 -> "Shopping"
          31 -> "Sports"
          32 -> "Travel & Local"
          33 -> "Watch Face"
          34 -> "Weather"
          35 -> "Family"
          else -> "Other"
      }
  }

  // Infer category from package name keywords when Android category is unavailable
  private fun inferCategoryFromPackage(packageName: String, label: String): String {
      val pkg = packageName.lowercase()
      val lbl = label.lowercase()

      return when {
          // Communication
          pkg.contains("whatsapp") || pkg.contains("telegram") || pkg.contains("messenger") ||
          pkg.contains("chat") || pkg.contains("viber") || pkg.contains("signal") ||
          pkg.contains("discord") || pkg.contains("skype") || pkg.contains("wechat") ||
          pkg.contains("line.android") || pkg.contains("imo.android") ||
          pkg.contains("mail") || pkg.contains("email") || pkg.contains("gmail") ||
          pkg.contains("outlook") -> "Communication"

          // Social
          pkg.contains("facebook") || pkg.contains("instagram") || pkg.contains("twitter") ||
          pkg.contains("tiktok") || pkg.contains("snapchat") || pkg.contains("pinterest") ||
          pkg.contains("reddit") || pkg.contains("linkedin") || pkg.contains("threads") ||
          pkg.contains("tumblr") || pkg.contains("social") -> "Social"

          // Video
          pkg.contains("youtube") || pkg.contains("netflix") || pkg.contains("tiktok") ||
          pkg.contains("video") || pkg.contains("player") || pkg.contains("vlc") ||
          pkg.contains("primevideo") || pkg.contains("hotstar") || pkg.contains("hulu") ||
          pkg.contains("disneyplus") || pkg.contains("hbo") -> "Video"

          // Audio / Music
          pkg.contains("spotify") || pkg.contains("music") || pkg.contains("podcast") ||
          pkg.contains("radio") || pkg.contains("audible") || pkg.contains("soundcloud") ||
          pkg.contains("shazam") || pkg.contains("deezer") -> "Audio"

          // Game
          pkg.contains("game") || pkg.contains("play.games") ||
          lbl.contains("game") -> "Game"

          // Finance
          pkg.contains("bank") || pkg.contains("pay") || pkg.contains("wallet") ||
          pkg.contains("finance") || pkg.contains("money") || pkg.contains("trading") ||
          pkg.contains("crypto") || pkg.contains("stock") || pkg.contains("invest") ||
          pkg.contains("bkash") || pkg.contains("nagad") || pkg.contains("gpay") -> "Finance"

          // Shopping
          pkg.contains("shop") || pkg.contains("store") || pkg.contains("market") ||
          pkg.contains("amazon") || pkg.contains("ebay") || pkg.contains("alibaba") ||
          pkg.contains("flipkart") || pkg.contains("daraz") || pkg.contains("wish") -> "Shopping"

          // Maps & Navigation
          pkg.contains("map") || pkg.contains("navigation") || pkg.contains("uber") ||
          pkg.contains("grab") || pkg.contains("lyft") || pkg.contains("waze") ||
          pkg.contains("pathao") || pkg.contains("ride") -> "Maps"

          // Food & Drink
          pkg.contains("food") || pkg.contains("delivery") || pkg.contains("eat") ||
          pkg.contains("restaurant") || pkg.contains("zomato") || pkg.contains("swiggy") ||
          pkg.contains("doordash") || pkg.contains("ubereats") || pkg.contains("grubhub") ||
          pkg.contains("recipe") || pkg.contains("cook") -> "Food & Drink"

          // Health & Fitness
          pkg.contains("health") || pkg.contains("fitness") || pkg.contains("workout") ||
          pkg.contains("exercise") || pkg.contains("step") || pkg.contains("medical") ||
          pkg.contains("doctor") || pkg.contains("pharmacy") -> "Health & Fitness"

          // Education
          pkg.contains("learn") || pkg.contains("edu") || pkg.contains("school") ||
          pkg.contains("course") || pkg.contains("duolingo") || pkg.contains("study") ||
          pkg.contains("quiz") || pkg.contains("dictionary") || pkg.contains("translate") -> "Education"

          // News
          pkg.contains("news") || pkg.contains("feed") || pkg.contains("reader") ||
          pkg.contains("times") || pkg.contains("bbc") || pkg.contains("cnn") -> "News"

          // Image / Photography
          pkg.contains("camera") || pkg.contains("gallery") || pkg.contains("photo") ||
          pkg.contains("editor") || pkg.contains("snapseed") || pkg.contains("lightroom") -> "Image"

          // Travel
          pkg.contains("travel") || pkg.contains("booking") || pkg.contains("flight") ||
          pkg.contains("hotel") || pkg.contains("airbnb") || pkg.contains("trip") -> "Travel & Local"

          // Weather
          pkg.contains("weather") || pkg.contains("climate") -> "Weather"

          // Productivity
          pkg.contains("browser") || pkg.contains("chrome") || pkg.contains("firefox") ||
          pkg.contains("opera") || pkg.contains("file") || pkg.contains("manager") ||
          pkg.contains("explorer") || pkg.contains("calendar") || pkg.contains("clock") ||
          pkg.contains("alarm") || pkg.contains("note") || pkg.contains("office") ||
          pkg.contains("docs") || pkg.contains("sheets") || pkg.contains("drive") ||
          pkg.contains("calculator") || pkg.contains("scanner") || pkg.contains("pdf") -> "Productivity"

          // Personalization
          pkg.contains("wallpaper") || pkg.contains("theme") || pkg.contains("launcher") ||
          pkg.contains("keyboard") || pkg.contains("ringtone") || pkg.contains("icon") -> "Personalization"

          // Entertainment
          pkg.contains("entertain") || pkg.contains("comic") || pkg.contains("manga") ||
          pkg.contains("anime") || pkg.contains("movie") || pkg.contains("tv") ||
          pkg.contains("stream") -> "Entertainment"

          // Business
          pkg.contains("business") || pkg.contains("enterprise") || pkg.contains("crm") ||
          pkg.contains("slack") || pkg.contains("teams") || pkg.contains("zoom") ||
          pkg.contains("meet") -> "Business"

          // Lifestyle
          pkg.contains("lifestyle") || pkg.contains("home") || pkg.contains("smart") ||
          pkg.contains("iot") -> "Lifestyle"

          else -> "Other"
      }
  }

  override fun definition() = ModuleDefinition {
    Name("Launcher")

    Function("lockScreen") {
        val service = LauncherAccessibilityService.instance?.get()
        if (service != null) {
            return@Function service.lockScreen()
        }
        return@Function false
    }

    Function("openNotifications") {
        val service = LauncherAccessibilityService.instance?.get()
        if (service != null) {
            return@Function service.openNotifications()
        }
        return@Function false
    }

    Function("openQuickSettings") {
        val service = LauncherAccessibilityService.instance?.get()
        if (service != null) {
            return@Function service.openQuickSettings()
        }
        return@Function false
    }

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

    Function("watchPermissionAndReturn") { permissionType: String ->
        val service = LauncherAccessibilityService.instance?.get()
        if (service != null) {
            service.startWatchingPermission(permissionType)
            return@Function true
        }
        return@Function false
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

    Function("openAccessibilitySettings") {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    Function("openHomeSettings") {
        val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Intent(Settings.ACTION_HOME_SETTINGS)
        } else {
            Intent(Settings.ACTION_SETTINGS)
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    Function("prepareToReturnFromAccessibility") {
        val prefs = context.getSharedPreferences("LauncherPrefs", Context.MODE_PRIVATE)
        prefs.edit().putLong("awaiting_accessibility_ts", System.currentTimeMillis()).apply()
    }

    Function("isIgnoringBatteryOptimizations") {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            return@Function powerManager.isIgnoringBatteryOptimizations(context.packageName)
        }
        return@Function true
    }

    Function("isDefaultLauncher") {
        val intent = Intent(Intent.ACTION_MAIN)
        intent.addCategory(Intent.CATEGORY_HOME)
        val resolveInfo = context.packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
        return@Function resolveInfo?.activityInfo?.packageName == context.packageName
    }

    // JS-side safety-net for the launcher-role corruption: when the app
    // returns from the Android home-picker as the new default launcher, the
    // JS code calls this to wipe module-level state (orphaned navigationRef,
    // linking handlers, etc.) by triggering a clean React Native reload.
    //
    // Uses reflection because this Gradle module deliberately doesn't depend
    // on react-android — calling reactHost.reload(...) directly would require
    // adding RN as a direct compile dependency. The reflective call resolves
    // to: (application as ReactApplication).reactHost.reload(reason).
    Function("reloadApp") {
        val app = context.applicationContext
        android.os.Handler(android.os.Looper.getMainLooper()).post {
            try {
                val getReactHost = app.javaClass.getMethod("getReactHost")
                val reactHost = getReactHost.invoke(app) ?: return@post
                val reloadMethod = reactHost.javaClass.getMethod("reload", String::class.java)
                reloadMethod.invoke(reactHost, "JS-triggered reload (default launcher transition)")
            } catch (e: Exception) {
                android.util.Log.w("LauncherModule", "reloadApp failed", e)
            }
        }
    }

    AsyncFunction("getInstalledApps") {
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
                if (packageName == currentPackageName) continue

                val label = app.loadLabel(pm).toString()
                val iconBase64 = iconCache.getOrPut(packageName) {
                    getIconBase64(app.loadIcon(pm))
                }
                val usageTime = usageMap[packageName] ?: 0L
                val launchCount = launchCountMap[packageName] ?: 0

                var category = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    getCategoryLabel(app.activityInfo.applicationInfo.category)
                } else {
                    "Other"
                }

                if (category == "Other") {
                    category = inferCategoryFromPackage(packageName, label)
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

        appList.sortBy { (it["label"] as String).lowercase() }

        return@AsyncFunction appList
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

    Function("uninstallApp") { packageName: String ->
        val intent = Intent(Intent.ACTION_DELETE)
        intent.data = Uri.parse("package:$packageName")
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    Function("startTimerOverlay") { durationMs: Double, targetPackageName: String?, mode: String?, themeColors: Map<String, String>? ->
        val intent = Intent(context, TimerOverlayService::class.java)
        intent.putExtra("DURATION_MS", durationMs.toLong())
        intent.putExtra("TARGET_PACKAGE", targetPackageName)
        intent.putExtra("MODE", mode ?: "remind")
        
        if (themeColors != null) {
            for ((key, value) in themeColors) {
                intent.putExtra("THEME_" + key, value)
            }
        }
        
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

    AsyncFunction("getTodayUsageStats") {
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

        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null)
        intent.addCategory(Intent.CATEGORY_LAUNCHER)
        val resolveInfos = pm.queryIntentActivities(intent, 0)
        val installedPackages = resolveInfos.map { it.activityInfo.packageName }.toSet()

        val homeIntent = Intent(Intent.ACTION_MAIN)
        homeIntent.addCategory(Intent.CATEGORY_HOME)
        val homeResolveInfos = pm.queryIntentActivities(homeIntent, 0)
        val homePackages = homeResolveInfos.map { it.activityInfo.packageName }.toSet()

        val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
        var totalTime = 0L
        val packageUsage = mutableMapOf<String, Long>()

        for ((packageName, usageStats) in usageStatsMap) {
            val time = usageStats.totalTimeInForeground
            if (time > 0) {
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

        var unlockCount = 0
        val events = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()

        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == 18) {
                unlockCount++
            }
        }

        return@AsyncFunction mapOf(
            "totalUsageTime" to totalTime,
            "unlockCount" to unlockCount,
            "packageUsage" to packageUsage
        )
    }

    Function("getPackageWeeklyUsage") { targetPackage: String ->
        try {
            val endTime = System.currentTimeMillis()
            val startTime = endTime - (7 * 24 * 60 * 60 * 1000)
            val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val usageStatsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
            val stats = usageStatsMap[targetPackage]
            val total = stats?.totalTimeInForeground ?: 0L
            return@Function total
        } catch (e: Exception) {
            e.printStackTrace()
            return@Function 0L
        }
    }

    Function("getPackageDailyUsage7d") { targetPackage: String ->
        try {
            val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val today = Calendar.getInstance()
            today.set(Calendar.HOUR_OF_DAY, 0)
            today.set(Calendar.MINUTE, 0)
            today.set(Calendar.SECOND, 0)
            today.set(Calendar.MILLISECOND, 0)
            val windowEnd = today.timeInMillis
            val dayMillis = 24L * 60 * 60 * 1000
            val windowStart = windowEnd - 7L * dayMillis

            val results = MutableList(7) { 0L }

            // Determine foreground state at windowStart by scanning a bit earlier
            val preEvents = usageStatsManager.queryEvents(windowStart - dayMillis, windowStart)
            val preEvent = android.app.usage.UsageEvents.Event()
            var inForeground = false
            while (preEvents.hasNextEvent()) {
                preEvents.getNextEvent(preEvent)
                if (preEvent.packageName == targetPackage) {
                    if (preEvent.eventType == android.app.usage.UsageEvents.Event.MOVE_TO_FOREGROUND) {
                        inForeground = true
                    } else if (preEvent.eventType == android.app.usage.UsageEvents.Event.MOVE_TO_BACKGROUND) {
                        inForeground = false
                    }
                }
            }

            var currentStart = if (inForeground) windowStart else 0L

            fun addToBuckets(s: Long, e: Long) {
                if (e <= s) return
                for (i in 0..6) {
                    val bucketStart = windowStart + i * dayMillis
                    val bucketEnd = bucketStart + dayMillis
                    val os = if (s > bucketStart) s else bucketStart
                    val oe = if (e < bucketEnd) e else bucketEnd
                    if (oe > os) {
                        results[i] += (oe - os)
                    }
                }
            }

            val events = usageStatsManager.queryEvents(windowStart, windowEnd)
            val ev = android.app.usage.UsageEvents.Event()
            while (events.hasNextEvent()) {
                events.getNextEvent(ev)
                if (ev.packageName != targetPackage) continue
                if (ev.eventType == android.app.usage.UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    currentStart = if (ev.timeStamp > windowStart) ev.timeStamp else windowStart
                    inForeground = true
                } else if (ev.eventType == android.app.usage.UsageEvents.Event.MOVE_TO_BACKGROUND) {
                    if (inForeground && currentStart > 0L) {
                        val endTs = if (ev.timeStamp < windowEnd) ev.timeStamp else windowEnd
                        addToBuckets(currentStart, endTs)
                        inForeground = false
                        currentStart = 0L
                    }
                }
            }
            if (inForeground && currentStart > 0L) {
                addToBuckets(currentStart, windowEnd)
            }

            return@Function results
        } catch (e: Exception) {
            e.printStackTrace()
            return@Function emptyList<Long>()
        }
    }

    Function("getPackageDailyUsageLastCompletedWeek") { targetPackage: String ->
        try {
            val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val today = Calendar.getInstance()
            today.set(Calendar.HOUR_OF_DAY, 0)
            today.set(Calendar.MINUTE, 0)
            today.set(Calendar.SECOND, 0)
            today.set(Calendar.MILLISECOND, 0)
            val dow = today.get(Calendar.DAY_OF_WEEK)
            val daysSinceMonday = (dow + 5) % 7
            val startCal = today.clone() as Calendar
            startCal.add(Calendar.DAY_OF_YEAR, -(daysSinceMonday + 7))
            startCal.set(Calendar.HOUR_OF_DAY, 0)
            startCal.set(Calendar.MINUTE, 0)
            startCal.set(Calendar.SECOND, 0)
            startCal.set(Calendar.MILLISECOND, 0)
            val start = startCal.timeInMillis

            val endCal = startCal.clone() as Calendar
            endCal.add(Calendar.DAY_OF_YEAR, 7)
            val end = endCal.timeInMillis

            val buckets = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end)
            val dayMillis = 24L * 60 * 60 * 1000
            val results = MutableList(7) { 0L }
            for (us in buckets) {
                if (us.packageName != targetPackage) continue
                val idx = (((us.firstTimeStamp - start) / dayMillis).toInt()).coerceIn(0, 6)
                results[idx] += us.totalTimeInForeground
            }
            return@Function results
        } catch (e: Exception) {
            e.printStackTrace()
            return@Function emptyList<Long>()
        }
    }

    View(LauncherView::class) {
      Prop("url") { view: LauncherView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      Events("onLoad")
    }
  }
}
