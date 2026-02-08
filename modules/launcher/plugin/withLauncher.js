const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

const withLauncher = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Get the main activity
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(androidManifest);

    // Set launchMode to singleTask to avoid multiple instances
    mainActivity.$['android:launchMode'] = 'singleTask';
    
    // Define the intent filter we want to add
    const launcherIntentFilter = {
      action: [
        { $: { 'android:name': 'android.intent.action.MAIN' } },
      ],
      category: [
        { $: { 'android:name': 'android.intent.category.HOME' } },
        { $: { 'android:name': 'android.intent.category.DEFAULT' } },
      ],
    };

    // Ensure intent-filter array exists
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    // Check if it already exists to avoid duplicates
    const hasLauncherIntent = mainActivity['intent-filter'].some(filter => {
      const hasAction = filter.action?.some(a => a.$['android:name'] === 'android.intent.action.MAIN');
      const hasHome = filter.category?.some(c => c.$['android:name'] === 'android.intent.category.HOME');
      return hasAction && hasHome;
    });

    if (!hasLauncherIntent) {
      mainActivity['intent-filter'].push(launcherIntentFilter);
    }

    return config;
  });
};

module.exports = withLauncher;
