import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Dimensions, Image, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Launcher from '../../modules/launcher';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

export default function PermissionAccessScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState({
    usageStats: false,
    overlay: false,
    accessibility: false,
    battery: false,
  });

  const packageName = Constants.expoConfig?.android?.package || "com.expandtimes.minimallife";

  const checkPermissions = useCallback(() => {
    if (Platform.OS === 'android') {
      try {
        const newPermissions = {
          usageStats: Launcher.checkUsageStatsPermission(),
          overlay: Launcher.checkOverlayPermission(),
          accessibility: Launcher.isAccessibilityServiceEnabled(),
          battery: Launcher.isIgnoringBatteryOptimizations(),
        };
        setPermissions(newPermissions);
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermissions]);

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

  const PermissionCard = ({ 
    icon, 
    title, 
    description, 
    hasPermission, 
    onPress,
    color = "#7EA6E0"
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    hasPermission: boolean, 
    onPress: () => void,
    color?: string
}) => {
    if (hasPermission) return null;

    return (
    <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-slate-50">
      <View className="flex-row items-start space-x-4 mb-4">
        <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center">
            {icon}
        </View>
        <View className="flex-1">
            <Text className="text-lg font-bold text-slate-800 mb-1">{title}</Text>
            <Text className="text-slate-500 text-sm leading-5">{description}</Text>
        </View>
      </View>
      
      {hasPermission ? (
        <View className="w-full bg-green-100 py-3 rounded-full items-center justify-center">
             <Text className="text-green-600 font-semibold">Allowed</Text>
        </View>
      ) : (
        <TouchableOpacity 
            className="w-full bg-[#7EA6E0] py-3 rounded-full items-center justify-center"
            onPress={onPress}
            style={{ backgroundColor: color }}
        >
            <Text className="text-white font-semibold">
                {title === "Accessibility Service" ? "Allow" : "Grant Permission"}
            </Text>
        </TouchableOpacity>
      )}
    </View>
    );
  };

  // Calculate missing permissions count
  const missingCount = Object.values(permissions).filter(p => !p).length;

  useEffect(() => {
    if (missingCount === 0) {
      router.replace('/home');
    }
  }, [missingCount]);

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Section with Illustration */}
        <View className="items-center py-8 px-6">
            <View className="w-48 h-48 bg-slate-200 rounded-full mb-6 items-center justify-center relative overflow-hidden">
                 {/* Placeholder for the illustration - Using icons to compose something similar */}
                 <View className="absolute inset-0 bg-[#E0E7FF] items-center justify-center">
                    <MaterialCommunityIcons name="clock-outline" size={120} color="#9FB7E3" />
                    <View className="absolute bottom-4 right-8">
                        <MaterialCommunityIcons name="account" size={60} color="#5D8CD6" />
                    </View>
                    <View className="absolute bottom-4 left-8">
                         <MaterialCommunityIcons name="account-hard-hat" size={60} color="#5D8CD6" />
                    </View>
                 </View>
            </View>

            <Text className="text-2xl font-bold text-slate-800 mb-2">
                {missingCount > 0 ? `${missingCount} Permission Missing` : "All Set!"}
            </Text>
            
            <Text className="text-center text-slate-500 text-xs leading-4 px-2">
                <Text className="font-bold">Minimal Life</Text> requires permission to track your screen time and distraction blocking features.{'\n\n'}
                We don't collect or share your personal data. Your <Text className="font-bold">data store</Text> on your <Text className="font-bold">device; not</Text> in our <Text className="font-bold">server</Text>. Feel free to give permission.
            </Text>
        </View>

        {/* Permissions List */}
        <View className="px-4">
            
            <PermissionCard 
                icon={<MaterialCommunityIcons name="chart-bar" size={24} color="#5D8CD6" />}
                title="Access App Usage Data"
                description="Required to block distracting app. Also use to track screen time."
                hasPermission={permissions.usageStats}
                onPress={requestUsageStats}
            />

            <PermissionCard 
                icon={<MaterialCommunityIcons name="layers-outline" size={24} color="#5D8CD6" />}
                title="Display Over Other Apps"
                description="Required to display an overlay over blocked distracting apps."
                hasPermission={permissions.overlay}
                onPress={requestOverlay}
            />

            <PermissionCard 
                icon={<MaterialCommunityIcons name="human-wheelchair" size={24} color="#5D8CD6" />}
                title="Accessibility Service"
                description="Required to access web distraction usage and block harmful surfing."
                hasPermission={permissions.accessibility}
                onPress={openAccessibility}
            />

            <PermissionCard 
                icon={<MaterialCommunityIcons name="battery-off-outline" size={24} color="#5D8CD6" />}
                title="Ignore Battery Optimization"
                description="Required to keep you safe without being disabled."
                hasPermission={permissions.battery}
                onPress={requestBattery}
            />

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
