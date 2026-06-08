package com.expandtimes.focuson.launcher
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.content.Intent
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactApplication
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    // If launched via HOME intent (as default launcher), strip the intent
    // so React Native's linking system doesn't process it as a deep link.
    val isHomeIntent = intent?.hasCategory(Intent.CATEGORY_HOME) == true
    if (isHomeIntent) {
      intent = Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
        setPackage(packageName)
      }
    }
    // Detect activity recreation with surviving JS context. This happens when
    // Android recreates the launcher activity (most notably during the
    // default-launcher role transition) but the React instance in the
    // Application's ReactHost survives. The old React tree's module state
    // (expo-router navigationRef, linking handlers, routingQueue) orphans
    // against the new tree, leaving navigation half-dead until force-quit.
    // We force a clean JS reload so the new activity gets fresh module state.
    val jsAlreadyAlive = (application as? ReactApplication)?.reactHost?.currentReactContext != null
    super.onCreate(null)

    // Collapse duplicate task cards. When the user picks this app as the
    // default launcher, Android creates a second task (type=home) alongside
    // the original (type=standard) — even with launchMode=singleInstance.
    // The old card stays in recents and, if tapped, presents a half-stale
    // React surface. Finish every other task of ours so the user only ever
    // sees one card.
    try {
      val am = getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager
      val myTaskId = taskId
      am.appTasks.forEach { task ->
        try {
          if (task.taskInfo.taskId != myTaskId) {
            task.finishAndRemoveTask()
          }
        } catch (e: Exception) {
          android.util.Log.w("MainActivity", "Failed to finish stale task", e)
        }
      }
    } catch (e: Exception) {
      android.util.Log.w("MainActivity", "Task consolidation failed", e)
    }

    // Only auto-reload on the launcher-role transition itself (HOME intent on
    // an activity recreation with surviving JS context). Reloading on *every*
    // recreation also reloads after a back-gesture-induced recreation, which
    // bounces the user back to a freshly-mounted home screen.
    if (jsAlreadyAlive && isHomeIntent) {
      android.os.Handler(android.os.Looper.getMainLooper()).post {
        (application as? ReactApplication)?.reactHost?.reload(
          "Launcher-role transition — refreshing JS to clear orphaned module state"
        )
      }
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
   * Never finish the launcher activity on back.
   *
   * As the default home app there's nothing meaningful for back to do at the
   * root: the launcher is already at the bottom of the stack. The Expo
   * template falls through to `super.invokeDefaultOnBackPressed()` when
   * `moveTaskToBack` returns false — but for a default launcher it always
   * returns false (you can't move the home app "below" itself), so the super
   * call finishes the activity, Android instantly relaunches it via HOME
   * intent, and the user sees the app appear to restart on every back press.
   *
   * Best-effort move-to-back, then swallow the event. Never call super.
   */
  override fun invokeDefaultOnBackPressed() {
    moveTaskToBack(false)
  }

  override fun onNewIntent(intent: Intent?) {
    // Filter out HOME intents to prevent expo-router linking conflicts.
    // When this app is the default launcher, pressing the home button sends a
    // HOME category intent. If forwarded to React Native, it triggers
    // "configured linking in multiple places" error in expo-router.
    if (intent != null && intent.hasCategory(Intent.CATEGORY_HOME)) {
      // Just bring the existing task to the front, don't forward to RN linking
      return
    }
    super.onNewIntent(intent)
  }
}
