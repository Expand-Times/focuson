import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Launcher from '../modules/launcher';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import Constants from 'expo-constants';

export default function Permissions() {
  const router = useRouter();
  const [permissions, setPermissions] = useState({
    usageStats: false,
    overlay: false,
    notification: false,
    accessibility: false,
    battery: false,
  });

  const packageName = Constants.expoConfig?.android?.package || "com.expandtimes.minimallife";

  const checkPermissions = useCallback(() => {
    if (Platform.OS === 'android') {
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
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  const requestUsageStats = async () => {
    try {
      await startActivityAsync(ActivityAction.USAGE_ACCESS_SETTINGS);
    } catch (e) {
      console.error("Error opening usage settings:", e);
    }
  };

  const requestOverlay = async () => {
    try {
      await startActivityAsync(ActivityAction.MANAGE_OVERLAY_PERMISSION, {
        data: `package:${packageName}`
      });
    } catch (e) {
      console.error("Error opening overlay settings:", e);
    }
  };

  const requestNotification = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
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
      await startActivityAsync(ActivityAction.ACCESSIBILITY_SETTINGS);
    } catch (e) {
      console.error("Error opening accessibility settings:", e);
    }
  };

  const requestBattery = async () => {
    try {
      await startActivityAsync(ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, {
        data: `package:${packageName}`
      });
    } catch (e) {
      console.error("Error opening battery settings:", e);
    }
  };

  const openHomeSettings = async () => {
    try {
      await startActivityAsync(ActivityAction.HOME_SETTINGS);
    } catch (e) {
      console.error("Error opening home settings:", e);
    }
  };

  const PermissionItem = ({ title, description, hasPermission, onPress }: { title: string, description: string, hasPermission: boolean, onPress: () => void }) => (
    <View className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800">{title}</Text>
        <View className={`px-3 py-1 rounded-full ${hasPermission ? 'bg-green-100' : 'bg-red-100'}`}>
          <Text className={`${hasPermission ? 'text-green-700' : 'text-red-700'} font-medium`}>
            {hasPermission ? 'Granted' : 'Required'}
          </Text>
        </View>
      </View>
      <Text className="text-gray-600 mb-4">{description}</Text>
      {!hasPermission && (
        <TouchableOpacity 
          onPress={onPress}
          className="bg-blue-500 py-3 rounded-lg items-center active:bg-blue-600"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">App Permissions</Text>
        <Text className="text-gray-500 mb-8">
          To provide the full launcher experience, MinimalLife requires several special permissions.
        </Text>

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
          title="Accessibility Service"  
          description="Enable 'MinimalLife Accessibility' to support gestures and global actions."
          hasPermission={permissions.accessibility}
          onPress={openAccessibility}
        />

        <PermissionItem 
          title="Ignore Battery Optimization" 
          description="Ensures the launcher stays active and reliable in the background."
          hasPermission={permissions.battery}
          onPress={requestBattery}
        />

        <View className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <View className="mb-2">
                <Text className="text-lg font-bold text-gray-800">Default Home App</Text>
            </View>
             <Text className="text-gray-600 mb-4">Set MinimalLife as your default home launcher.</Text>
             <TouchableOpacity 
              onPress={openHomeSettings}
              className="bg-indigo-500 py-3 rounded-lg items-center active:bg-indigo-600"
            >
              <Text className="text-white font-semibold">Open Home Settings</Text>
            </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          onPress={() => router.replace('/home')}
          className="mt-4 py-4 items-center"
        >
          <Text className="text-blue-500 font-medium">Continue to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
