const { withAndroidManifest, withMainActivity, AndroidConfig } = require('@expo/config-plugins');

const withLauncherManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Get the main activity
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(androidManifest);

    // singleInstance — not singleTask — because singleTask allows Android to
    // spawn a *second* task when the task type changes (e.g. standard → home
    // during the default-launcher role transition). That second task gets its
    // own React surface, and the user sees two cards in recents with
    // inconsistent navigation state. singleInstance guarantees a single
    // activity instance in a single task; HOME intents come through
    // onNewIntent instead of creating a parallel task.
    mainActivity.$['android:launchMode'] = 'singleInstance';

    // Extend configChanges so common Android config changes don't recreate the
    // activity. When this app is the default launcher, an activity recreation
    // (with the React Native JS context surviving) orphans expo-router's
    // module state and leaves navigation half-dead until force-quit.
    const additionalConfigChanges = [
      'density', 'fontScale', 'locale', 'navigation',
      'smallestScreenSize', 'touchscreen', 'mcc', 'mnc',
    ];
    const existing = (mainActivity.$['android:configChanges'] || '').split('|').filter(Boolean);
    mainActivity.$['android:configChanges'] = Array.from(
      new Set([...existing, ...additionalConfigChanges])
    ).join('|');

    // Ensure intent-filter array exists
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    // Find the existing MAIN intent filter
    const mainIntentFilter = mainActivity['intent-filter'].find(filter => 
      filter.action?.some(a => a.$['android:name'] === 'android.intent.action.MAIN')
    );

    if (mainIntentFilter) {
      // Add HOME and DEFAULT categories if they don't exist
      const hasHome = mainIntentFilter.category?.some(c => c.$['android:name'] === 'android.intent.category.HOME');
      if (!hasHome) {
        if (!mainIntentFilter.category) mainIntentFilter.category = [];
        mainIntentFilter.category.push({ $: { 'android:name': 'android.intent.category.HOME' } });
        mainIntentFilter.category.push({ $: { 'android:name': 'android.intent.category.DEFAULT' } });
      }
    } else {
      // Fallback if no MAIN intent filter is found (unlikely in an Expo app)
      const launcherIntentFilter = {
        action: [
          { $: { 'android:name': 'android.intent.action.MAIN' } },
        ],
        category: [
          { $: { 'android:name': 'android.intent.category.HOME' } },
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        ],
      };
      mainActivity['intent-filter'].push(launcherIntentFilter);
    }

    return config;
  });
};

const withLauncherMainActivity = (config) => {
  return withMainActivity(config, async (config) => {
    let contents = config.modResults.contents;

    // Add the Intent import if not already present
    if (!contents.includes('import android.content.Intent')) {
      contents = contents.replace(
        'import android.os.Bundle',
        'import android.content.Intent\nimport android.os.Bundle'
      );
    }

    // Add the ReactApplication import (for reactHost access during recreation)
    if (!contents.includes('import com.facebook.react.ReactApplication')) {
      contents = contents.replace(
        'import com.facebook.react.ReactActivity',
        'import com.facebook.react.ReactActivity\nimport com.facebook.react.ReactApplication'
      );
    }

    // Override the default-back behavior to send the task to the background
    // instead of finishing the activity. As the default launcher, finishing on
    // back triggers an Android relaunch via HOME intent, which would fire our
    // onCreate auto-reload and bounce the user back to a freshly-mounted home.
    if (!contents.includes('// FocusOn: launcher back override')) {
      contents = contents.replace(
        /override fun invokeDefaultOnBackPressed\(\)[\s\S]*?\n  \}\n/,
        `override fun invokeDefaultOnBackPressed() {\n    // FocusOn: launcher back override — never finish the activity on back.\n    // moveTaskToBack returns false for the default launcher (already at the\n    // bottom of the stack); if we fell through to super, the activity would\n    // be finished, Android would relaunch us via HOME intent, and the user\n    // would see the app restart on every back press.\n    moveTaskToBack(false)\n  }\n`
      );
    }

    // Modify onCreate to strip HOME intent data BEFORE React Native processes it.
    // When this app is the default launcher, Android launches the activity with an intent
    // that has CATEGORY_HOME. React Native's Linking.getInitialURL() reads this intent
    // and expo-router tries to process it as a deep link URL. By clearing the intent data
    // and resetting the action to ACTION_MAIN before calling super.onCreate(), we prevent
    // the intent from being treated as a deep link.
    if (!contents.includes('isHomeIntent')) {
      contents = contents.replace(
        'super.onCreate(null)',
        `// If launched via HOME intent (as default launcher), strip the intent
    // so React Native's linking system doesn't process it as a deep link.
    val isHomeIntent = intent?.hasCategory(Intent.CATEGORY_HOME) == true
    if (isHomeIntent) {
      intent = Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
        setPackage(packageName)
      }
    }
    // Detect launcher-role transition: HOME intent + surviving JS context.
    // Only THIS combination causes the orphaned-tree corruption we need to
    // recover from. Reloading on every recreation (e.g. back-gesture-induced)
    // would bounce the user back to a fresh home on every back press.
    val jsAlreadyAlive = (application as? ReactApplication)?.reactHost?.currentReactContext != null
    super.onCreate(null)
    if (jsAlreadyAlive && isHomeIntent) {
      android.os.Handler(android.os.Looper.getMainLooper()).post {
        (application as? ReactApplication)?.reactHost?.reload(
          "Launcher-role transition — refreshing JS to clear orphaned module state"
        )
      }
    }`
      );
    }
    // Idempotent retro-fit: if the file was generated by an older version of
    // this plugin (no jsAlreadyAlive logic), inject the reload block.
    if (contents.includes('isHomeIntent') && !contents.includes('jsAlreadyAlive')) {
      contents = contents.replace(
        /(\s*)super\.onCreate\(null\)(\s*\}\s*\n)/,
        `$1val jsAlreadyAlive = (application as? ReactApplication)?.reactHost?.currentReactContext != null\n    super.onCreate(null)\n    if (jsAlreadyAlive) {\n      android.os.Handler(android.os.Looper.getMainLooper()).post {\n        (application as? ReactApplication)?.reactHost?.reload(\n          "Activity recreated — refreshing JS to clear orphaned module state"\n        )\n      }\n    }$2`
      );
    }

    // Idempotent retro-fit: inject task-card consolidation. Android creates a
    // separate task (type=home) when the activity is launched via CATEGORY_HOME
    // even with singleInstance, leaving a stale card in recents alongside the
    // live one. Finish every other task of ours so only the current one survives.
    if (!contents.includes('Collapse duplicate task cards')) {
      contents = contents.replace(
        /(super\.onCreate\(null\)\n)/,
        `$1\n    // Collapse duplicate task cards. When the user picks this app as the\n    // default launcher, Android creates a second task (type=home) alongside\n    // the original (type=standard) — even with launchMode=singleInstance.\n    // The old card stays in recents and, if tapped, presents a half-stale\n    // React surface. Finish every other task of ours so the user only ever\n    // sees one card.\n    try {\n      val am = getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager\n      val myTaskId = taskId\n      am.appTasks.forEach { task ->\n        try {\n          if (task.taskInfo.taskId != myTaskId) {\n            task.finishAndRemoveTask()\n          }\n        } catch (e: Exception) {\n          android.util.Log.w("MainActivity", "Failed to finish stale task", e)\n        }\n      }\n    } catch (e: Exception) {\n      android.util.Log.w("MainActivity", "Task consolidation failed", e)\n    }\n`
      );
    }

    // Add onNewIntent override to filter out HOME intents.
    // When the app is the default launcher and the user presses the home button,
    // Android sends a HOME intent via onNewIntent. If this reaches React Native's
    // linking system, expo-router sees it as a duplicate linking configuration and crashes.
    if (!contents.includes('override fun onNewIntent')) {
      const onNewIntentMethod = `
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
`;
      // Insert before the closing brace of the class
      const lastBraceIndex = contents.lastIndexOf('}');
      contents = contents.slice(0, lastBraceIndex) + onNewIntentMethod + contents.slice(lastBraceIndex);
    }

    config.modResults.contents = contents;
    return config;
  });
};

const withLauncher = (config) => {
  config = withLauncherManifest(config);
  config = withLauncherMainActivity(config);
  return config;
};

module.exports = withLauncher;
