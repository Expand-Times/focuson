import { View, Text, TouchableOpacity, ScrollView, Platform, useColorScheme } from 'react-native';
import { useRouter , useFocusEffect } from 'expo-router';
import Launcher from '../modules/launcher';
import { useState, useCallback } from 'react';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import Constants from 'expo-constants';

export default function Permissions() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [permissions, setPermissions] = useState({
    usageStats: false,
    overlay: false,
    notification: false,
    accessibility: false,
    battery: false,
  });

  const packageName = Constants.expoConfig?.android?.package || "com.expandtimes.minimallife";

  const checkPermissions = useCallback(() => {
      try {
        setPermissions({
          usageStats: Launcher.checkUsageStatsPermission(),
          overlay: Launcher.checkOverlayPermission(),
          notification: Launcher.checkNotificationPermission(),
          accessibility: Launcher.isAccessibilityServiceEnabled(),
          battery: Launcher.isIgnoringBatteryOptimizations(),
        });
      } catch (e) {
        console.error("Error checking permissions:", e);
      }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  const requestUsageStats = async () => {
    try {
      if (permissions.accessibility) {
        Launcher.watchPermissionAndReturn('usageStats');
      }
      await startActivityAsync(ActivityAction.USAGE_ACCESS_SETTINGS);
    } catch (e) {
      console.error("Error opening usage settings:", e);
    }
  };

  const requestOverlay = async () => {
    try {
      if (permissions.accessibility) {
        Launcher.watchPermissionAndReturn('overlay');
      }
      await startActivityAsync(ActivityAction.MANAGE_OVERLAY_PERMISSION, {
        data: `package:${packageName}`
      });
    } catch (e) {
      console.error("Error opening overlay settings:", e);
    }
  };

  const requestNotification = async () => {
    try {
      if (permissions.accessibility) {
        Launcher.watchPermissionAndReturn('notification');
      }

      if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
          // Android 13+ requires explicit request
          Launcher.openNotificationSettings();
      } else {
          // For older versions, it's usually granted by default, but we can open settings
          Launcher.openNotificationSettings();
      }
    } catch (e) {
      console.error("Error opening notification settings:", e);
    }
  };

  const openAccessibility = async () => {
    try {
      Launcher.prepareToReturnFromAccessibility();
      await startActivityAsync(ActivityAction.ACCESSIBILITY_SETTINGS);
    } catch (e) {
      console.error("Error opening accessibility settings:", e);
    }
  };

  const requestBattery = async () => {
    try {
      if (permissions.accessibility) {
        Launcher.watchPermissionAndReturn('battery');
      }
      await startActivityAsync(ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, {
        data: `package:${packageName}`
      });
    } catch (e) {
      console.error("Error opening battery settings:", e);
    }
  };

  const PermissionItem = ({ title, description, hasPermission, onPress }: { title: string, description: string, hasPermission: boolean, onPress: () => void }) => (
    <View className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-[#131B26] border-[#2E3B4D]' : 'bg-gray-100 border-gray-200'}`}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`text-lg font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-gray-800'}`}>{title}</Text>
        <View className={`px-3 py-1 rounded-full ${hasPermission ? (isDarkMode ? 'bg-green-900' : 'bg-green-100') : (isDarkMode ? 'bg-red-900' : 'bg-red-100')}`}>
          <Text className={`${hasPermission ? (isDarkMode ? 'text-green-300' : 'text-green-700') : (isDarkMode ? 'text-red-300' : 'text-red-700')} font-medium`}>
            {hasPermission ? 'Granted' : 'Required'}
          </Text>
        </View>
      </View>
      <Text className={`mb-4 ${isDarkMode ? 'text-[#738099]' : 'text-gray-600'}`}>{description}</Text>
      {!hasPermission && (
        <TouchableOpacity 
          onPress={onPress}
          className={`${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-blue-500'} py-3 rounded-lg items-center active:opacity-80`}
        >
          <Text className={`${isDarkMode ? 'text-[#0D121A]' : 'text-white'} font-semibold`}>Grant Permission</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-white'}`}>
      <View className="p-6">
        <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-[#DADFE5]' : 'text-gray-900'}`}>App Permissions</Text>
        <Text className={`mb-8 ${isDarkMode ? 'text-[#738099]' : 'text-gray-500'}`}>
          To provide the full launcher experience, MinimalLife requires several special permissions.
        </Text>

        <PermissionItem 
          title="Accessibility Service"  
          description="Enable 'MinimalLife Accessibility' to support gestures and global actions."
          hasPermission={permissions.accessibility}
          onPress={openAccessibility}
        />

        <PermissionItem 
          title="App Usage Data" 
          description="Required to show your app usage statistics and time spent."
          hasPermission={permissions.usageStats}
          onPress={requestUsageStats}
        />

        <PermissionItem 
          title="Display Over Other Apps" 
          description="Allows the launcher to display widgets and tools over other apps."
          hasPermission={permissions.overlay}
          onPress={requestOverlay}
        />

        <PermissionItem 
          title="Notifications" 
          description="Required for the usage monitor service to run in the background."
          hasPermission={permissions.notification}
          onPress={requestNotification}
        />

        <PermissionItem 
          title="Ignore Battery Optimization" 
          description="Ensures the launcher stays active and reliable in the background."
          hasPermission={permissions.battery}
          onPress={requestBattery}
        />
        
        <TouchableOpacity 
          onPress={() => router.replace('/home')}
          className="mt-4 py-4 items-center"
        >
          <Text className={`${isDarkMode ? 'text-[#7EA9E5]' : 'text-blue-500'} font-medium`}>Continue to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
