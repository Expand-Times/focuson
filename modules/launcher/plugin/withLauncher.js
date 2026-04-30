const { withAndroidManifest, withMainActivity, AndroidConfig } = require('@expo/config-plugins');

const withLauncherManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Get the main activity
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(androidManifest);

    // Set launchMode to singleTask to avoid multiple instances and handle linking correctly
    mainActivity.$['android:launchMode'] = 'singleTask';
    
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
    super.onCreate(null)`
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
