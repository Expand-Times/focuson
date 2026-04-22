const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

const withLauncher = (config) => {
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

module.exports = withLauncher;
