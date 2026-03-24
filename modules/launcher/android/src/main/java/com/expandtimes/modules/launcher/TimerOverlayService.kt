package com.expandtimes.modules.launcher

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import java.util.Calendar
import java.util.concurrent.TimeUnit

class TimerOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    
    private var limitMs: Long = 0
    private var targetPackageName: String? = null
    private var mode: String = "remind"
    private var startUsageToday: Long = 0
    private var usageStatsManager: UsageStatsManager? = null
    private var themeColors: Map<String, String> = emptyMap()
    
    private val handler = Handler(Looper.getMainLooper())
    private val checkUsageRunnable = object : Runnable {
        override fun run() {
            checkUsage()
            handler.postDelayed(this, 5000) // Check every 5 seconds
        }
    }

    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "usage_monitor_channel_v2"
            val channel = NotificationChannel(
                channelId,
                "Usage Monitor",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "STOP_SERVICE") {
            stopSelf()
            return START_NOT_STICKY
        }

        limitMs = intent?.getLongExtra("DURATION_MS", 0L) ?: 0L
        targetPackageName = intent?.getStringExtra("TARGET_PACKAGE")
        mode = intent?.getStringExtra("MODE") ?: "remind"
        
        val bundle = intent?.extras
        if (bundle != null) {
            val map = mutableMapOf<String, String>()
            for (key in bundle.keySet()) {
                if (key.startsWith("THEME_")) {
                    val value = bundle.getString(key)
                    if (value != null) {
                        map[key.removePrefix("THEME_")] = value
                    }
                }
            }
            themeColors = map
        }
        
        if (targetPackageName != null) {
            startUsageToday = getUsageStatsToday(targetPackageName!!).first
            handler.post(checkUsageRunnable)
        } else {
            stopSelf()
        }
        
        return START_STICKY
    }

    private fun checkUsage() {
        if (targetPackageName == null) return
        
        val stats = getUsageStatsToday(targetPackageName!!)
        val currentUsage = stats.first
        val openCount = stats.second
        val usageDelta = currentUsage - startUsageToday
        
        // If usage since start exceeds limit
        if (usageDelta >= limitMs) {
            if (overlayView == null) {
                if (mode == "quit") {
                    val homeIntent = Intent(Intent.ACTION_MAIN)
                    homeIntent.addCategory(Intent.CATEGORY_HOME)
                    homeIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    startActivity(homeIntent)
                    stopSelf()
                } else {
                    showTimesUpOverlay(currentUsage, openCount)
                }
            }
        }
    }

    private fun getUsageStatsToday(packageName: String): Pair<Long, Int> {
        try {
            val calendar = Calendar.getInstance()
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val events = usageStatsManager?.queryEvents(startTime, endTime) ?: return Pair(0L, 0)
            val event = UsageEvents.Event()
            
            var totalTime = 0L
            var lastStartTime = 0L
            var openCount = 0
            
            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                if (event.packageName == packageName) {
                    if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                        lastStartTime = event.timeStamp
                        openCount++
                    } else if (event.eventType == UsageEvents.Event.MOVE_TO_BACKGROUND) {
                        if (lastStartTime != 0L) {
                            totalTime += (event.timeStamp - lastStartTime)
                            lastStartTime = 0L
                        }
                    }
                }
            }
            
            if (lastStartTime != 0L) {
                totalTime += (System.currentTimeMillis() - lastStartTime)
            }
            
            return Pair(totalTime, openCount)
        } catch (e: Exception) {
            e.printStackTrace()
            return Pair(0L, 0)
        }
    }

    private fun getThemeColor(key: String, defaultColor: String): Int {
        val colorStr = themeColors[key]
        return if (colorStr != null) {
            try {
                Color.parseColor(colorStr)
            } catch (e: Exception) {
                Color.parseColor(defaultColor)
            }
        } else {
            Color.parseColor(defaultColor)
        }
    }

    private fun showTimesUpOverlay(totalUsageToday: Long, openCount: Int) {
        val currentNightMode = resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK
        val isDarkMode = currentNightMode == android.content.res.Configuration.UI_MODE_NIGHT_YES
        val defaultBg = if (isDarkMode) "#000000" else "#FFFFFF"
        val defaultText = if (isDarkMode) "#FFFFFF" else "#111827"
        val defaultSubtitle = if (isDarkMode) "#9CA3AF" else "#6B7280"
        val defaultDivider = if (isDarkMode) "#374151" else "#E5E7EB"

        // Use a ContextThemeWrapper to ensure widgets (like Button) have a theme that respects dark mode
        val themeResId = if (isDarkMode) android.R.style.Theme_DeviceDefault else android.R.style.Theme_DeviceDefault_Light
        val context = android.view.ContextThemeWrapper(this, themeResId)
        
        // Root container (Dimmed Background)
        val rootLayout = android.widget.FrameLayout(context).apply {
            setBackgroundColor(Color.parseColor("#B3000000")) // ~70% opacity black
            isClickable = true // Intercept clicks
            isFocusable = true
        }

        // Card Container
        val cardLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            
            val shape = android.graphics.drawable.GradientDrawable()
            shape.setColor(getThemeColor("modalBg", defaultBg))
            shape.cornerRadius = 48f // Rounded corners
            background = shape
            
            setPadding(64, 64, 64, 64)
            gravity = Gravity.CENTER_HORIZONTAL
        }

        // Title "Time Up!"
        val title = TextView(context).apply {
            text = "Time Up!"
            textSize = 24f
            setTextColor(getThemeColor("textColor", defaultText)) // Gray-900 or White
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
        }
        cardLayout.addView(title)
        
        // Subtitle with orange highlight
        val h = TimeUnit.MILLISECONDS.toHours(totalUsageToday)
        val m = TimeUnit.MILLISECONDS.toMinutes(totalUsageToday) % 60
        val timeStr = if (h > 0) String.format("%dh %02dm", h, m) else String.format("%d minutes", m)
        val openStr = "$openCount times"
        
        val fullText = "TO: $openStr  ||  TU: $timeStr"
        val spannable = android.text.SpannableString(fullText)
        
        val grayColor = getThemeColor("subtitleColor", defaultSubtitle)
        val orangeColor = getThemeColor("highlightColor", "#F59E0B")
        
        // Base color gray for the whole text
        spannable.setSpan(
            android.text.style.ForegroundColorSpan(grayColor),
            0, fullText.length,
            android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        // Make "TO:" bold
        val toStart = fullText.indexOf("TO:")
        if (toStart >= 0) {
            spannable.setSpan(
                android.text.style.StyleSpan(android.graphics.Typeface.BOLD),
                toStart, toStart + 3,
                android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }

        // Color "$openCount times" orange and bold
        val openStart = fullText.indexOf(openStr)
        if (openStart >= 0) {
            spannable.setSpan(
                android.text.style.ForegroundColorSpan(orangeColor),
                openStart, openStart + openStr.length,
                android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            spannable.setSpan(
                android.text.style.StyleSpan(android.graphics.Typeface.BOLD),
                openStart, openStart + openStr.length,
                android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }

        // Make "TU:" bold
        val tuStart = fullText.indexOf("TU:")
        if (tuStart >= 0) {
            spannable.setSpan(
                android.text.style.StyleSpan(android.graphics.Typeface.BOLD),
                tuStart, tuStart + 3,
                android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }

        // Color "$timeStr" orange and bold
        val timeStart = fullText.indexOf(timeStr, tuStart) // Start searching after "TU:"
        if (timeStart >= 0) {
            spannable.setSpan(
                android.text.style.ForegroundColorSpan(orangeColor),
                timeStart, timeStart + timeStr.length,
                android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            spannable.setSpan(
                android.text.style.StyleSpan(android.graphics.Typeface.BOLD),
                timeStart, timeStart + timeStr.length,
                android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
        
        val subtitle = TextView(context).apply {
            text = spannable
            textSize = 15f
            setTextColor(getThemeColor("subtitleColor", defaultSubtitle))
            gravity = Gravity.CENTER
            setPadding(0, 16, 0, 64)
        }
        cardLayout.addView(subtitle)
        
        // App Icon
        val iconView = android.widget.ImageView(context).apply {
            try {
                val pm = packageManager
                setImageDrawable(pm.getApplicationIcon(targetPackageName!!))
            } catch (e: Exception) {
                setImageResource(android.R.drawable.sym_def_app_icon)
            }
        }
        val iconParams = LinearLayout.LayoutParams(160, 160)
        iconParams.setMargins(0, 0, 0, 48)
        cardLayout.addView(iconView, iconParams)
        
        // "Let me use another"
        val label = TextView(context).apply {
            text = "Let me use another"
            textSize = 16f
            setTextColor(getThemeColor("subtitleColor", defaultText)) // Changed to defaultText for better visibility
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 24)
        }
        cardLayout.addView(label)
        
        // Buttons Helper
        fun createButton(label: String, minutes: Int): Button {
            return Button(context).apply {
                text = label
                textSize = 14f
                setTextColor(getThemeColor("buttonTextColor", "#FFFFFF"))
                isAllCaps = false
                
                val btnBg = android.graphics.drawable.GradientDrawable()
                btnBg.setColor(getThemeColor("buttonBg", "#7EA6E0")) // Soft Blue
                btnBg.cornerRadius = 16f // Pill shape
                background = btnBg
                
                setOnClickListener {
                    try {
                        val extraTime = minutes * 60 * 1000L
                        val currentUsage = getUsageStatsToday(targetPackageName!!).first
                        val currentDelta = currentUsage - startUsageToday
                        limitMs = currentDelta + extraTime
                        
                        if (overlayView != null) {
                            windowManager?.removeView(overlayView)
                            overlayView = null
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }
        
        // Grid Row 1
        val row1 = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            weightSum = 2f
        }
        val btn2 = createButton("2 min", 2)
        val btn2Params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        btn2Params.setMargins(0, 0, 16, 16)
        row1.addView(btn2, btn2Params)
        
        val btn5 = createButton("5 min", 5)
        val btn5Params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        btn5Params.setMargins(16, 0, 0, 16)
        row1.addView(btn5, btn5Params)
        
        cardLayout.addView(row1)
        
        // Grid Row 2
        val row2 = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            weightSum = 2f
        }
        val btn10 = createButton("10 min", 10)
        val btn10Params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        btn10Params.setMargins(0, 0, 16, 32)
        row2.addView(btn10, btn10Params)
        
        val btn20 = createButton("20 min", 20)
        val btn20Params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        btn20Params.setMargins(16, 0, 0, 32)
        row2.addView(btn20, btn20Params)
        
        cardLayout.addView(row2)
         // Toggle
        val toggleBtn = android.widget.ImageView(context).apply {
            val downResId = resources.getIdentifier("ic_chevron_down", "drawable", packageName)
            if (downResId != 0) {
                setImageResource(downResId)
            }
            setColorFilter(getThemeColor("toggleColor", defaultSubtitle))
            
            val padding = (8 * resources.displayMetrics.density).toInt()
            setPadding(padding, padding, padding, padding)
            
            val size = (40 * resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                gravity = Gravity.CENTER
            }
        }
        
        val settingsContainer = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            visibility = View.GONE
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = 32
            }
        }

        toggleBtn.setOnClickListener {
            if (settingsContainer.visibility == View.VISIBLE) {
                settingsContainer.visibility = View.GONE
                val downResId = resources.getIdentifier("ic_chevron_down", "drawable", packageName)
                if (downResId != 0) toggleBtn.setImageResource(downResId)
            } else {
                settingsContainer.visibility = View.VISIBLE
                val upResId = resources.getIdentifier("ic_chevron_up", "drawable", packageName)
                if (upResId != 0) toggleBtn.setImageResource(upResId)
            }
        }
        cardLayout.addView(toggleBtn)

        // "When time is over" Text
        val whenText = TextView(context).apply {
            text = "When time is over"
            textSize = 16f
            setTextColor(getThemeColor("whenTextColor", defaultText))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 32)
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }
        settingsContainer.addView(whenText)

        // Helper to update radio state
        val radioViews = mutableMapOf<String, View>()
        val radioBgs = mutableMapOf<String, android.graphics.drawable.GradientDrawable>()
        
        fun updateRadioSelection(selectedMode: String) {
            mode = selectedMode
            for ((key, bg) in radioBgs) {
                if (key == selectedMode) {
                    bg.setColor(getThemeColor("toggleIconColor", "#5B8BDF"))
                } else {
                    bg.setColor(Color.TRANSPARENT)
                }
            }
        }

        // Helper to create radio option
        fun createRadioOption(label: String, value: String, isDisabled: Boolean = false): View {
            val container = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, 16, 0, 16)
                alpha = if (isDisabled) 0.5f else 1.0f
            }

            val radioCircle = View(context).apply {
                val size = (20 * resources.displayMetrics.density).toInt()
                layoutParams = LinearLayout.LayoutParams(size, size).apply {
                    rightMargin = (12 * resources.displayMetrics.density).toInt()
                }
                
                val bg = android.graphics.drawable.GradientDrawable()
                bg.shape = android.graphics.drawable.GradientDrawable.OVAL
                bg.setStroke((2 * resources.displayMetrics.density).toInt(), getThemeColor("toggleIconColor", "#9CA3AF"))
                bg.setColor(if (mode == value) getThemeColor("toggleIconColor", "#5B8BDF") else Color.TRANSPARENT)
                
                background = bg
                radioBgs[value] = bg
            }
            container.addView(radioCircle)

            val text = TextView(context).apply {
                text = label
                textSize = 16f
                setTextColor(getThemeColor("remindTextColor", defaultText))
            }
            container.addView(text)
            
            radioViews[value] = container

            container.setOnClickListener {
                if (!isDisabled) {
                    updateRadioSelection(value)
                }
            }

            return container
        }

        // Mindful Delay (Disabled)
        settingsContainer.addView(createRadioOption("Mindful Delay", "mindful", true))

        // Remind Me Row (with 2nd Warning)
        val remindRow = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }
        
        // Remind Me Option
        val remindContainer = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 16, 0, 16)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        
        val remindRadio = View(context).apply {
            val size = (20 * resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                rightMargin = (12 * resources.displayMetrics.density).toInt()
            }
            
            val bg = android.graphics.drawable.GradientDrawable()
            bg.shape = android.graphics.drawable.GradientDrawable.OVAL
            bg.setStroke((2 * resources.displayMetrics.density).toInt(), getThemeColor("toggleIconColor", "#9CA3AF"))
            bg.setColor(if (mode == "remind") getThemeColor("toggleIconColor", "#5B8BDF") else Color.TRANSPARENT)
            
            background = bg
            radioBgs["remind"] = bg
        }
        remindContainer.addView(remindRadio)
        
        val remindText = TextView(context).apply {
            text = "Remind Me"
            textSize = 16f
            setTextColor(getThemeColor("remindTextColor", defaultText))
        }
        remindContainer.addView(remindText)
        
        remindContainer.setOnClickListener {
            updateRadioSelection("remind")
        }
        remindRow.addView(remindContainer)
        
        // 2nd Warning (Static/Disabled look)
        val warningContainer = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            alpha = 0.5f
        }
        
        val checkIcon = TextView(context).apply {
            text = "✓" // Simple checkmark
            textSize = 12f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            
            val size = (16 * resources.displayMetrics.density).toInt()
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                rightMargin = (8 * resources.displayMetrics.density).toInt()
            }
            
            val bg = android.graphics.drawable.GradientDrawable()
            bg.cornerRadius = (4 * resources.displayMetrics.density)
            bg.setColor(getThemeColor("toggleIconColor", "#5B8BDF"))
            background = bg
        }
        warningContainer.addView(checkIcon)
        
        val warningText = TextView(context).apply {
            text = "2nd Warning"
            textSize = 16f
            setTextColor(getThemeColor("remindTextColor", defaultSubtitle)) // Using remind color or fallback gray
        }
        warningContainer.addView(warningText)
        
        remindRow.addView(warningContainer)
        
        settingsContainer.addView(remindRow)

        // Quit
        settingsContainer.addView(createRadioOption("Quit", "quit"))

        cardLayout.addView(settingsContainer)

        
        // Divider
        val divider = View(context).apply {
            setBackgroundColor(getThemeColor("dividerColor", defaultDivider)) // Default gray or dark gray
        }
        val dividerParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 2)
        dividerParams.setMargins(0, 0, 0, 32)
        cardLayout.addView(divider, dividerParams)
        
        // Quit Button
        val quitBtn = Button(context).apply {
            text = "Quit"
            textSize = 16f
            setTextColor(getThemeColor("quitButtonTextColor", "#FFFFFF"))
            isAllCaps = false
            
            val btnBg = android.graphics.drawable.GradientDrawable()
            btnBg.setColor(getThemeColor("quitButtonBg", "#A3B9D8")) // Stronger Blue
            btnBg.cornerRadius = 16f
            background = btnBg
            
            setOnClickListener {
                val homeIntent = Intent(Intent.ACTION_MAIN)
                homeIntent.addCategory(Intent.CATEGORY_HOME)
                homeIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                startActivity(homeIntent)
                stopSelf()
            }
        }
        cardLayout.addView(quitBtn)

        // Add card to root
        val cardParams = android.widget.FrameLayout.LayoutParams(
            android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
            android.widget.FrameLayout.LayoutParams.WRAP_CONTENT
        )
        cardParams.gravity = Gravity.CENTER
        cardParams.leftMargin = 64
        cardParams.rightMargin = 64
        rootLayout.addView(cardLayout, cardParams)
        
        overlayView = rootLayout
        
        val layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or 
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or 
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        )
        
        try {
            windowManager?.addView(overlayView, layoutParams)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(checkUsageRunnable)
        if (overlayView != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            overlayView = null
        }
    }
}
