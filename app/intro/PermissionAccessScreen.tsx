import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  AppState,
  useColorScheme,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Launcher from '../../modules/launcher';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

export default function PermissionAccessScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [permissions, setPermissions] = useState({
    usageStats: false,
    overlay: false,
    accessibility: false,
    battery: false,
  });

  const packageName = Constants.expoConfig?.android?.package || 'com.expandtimes.minimallife';

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
        console.error('Error checking permissions:', e);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
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
      console.error('Error opening usage settings:', e);
    }
  };

  const requestOverlay = async () => {
    try {
      await startActivityAsync(ActivityAction.MANAGE_OVERLAY_PERMISSION, {
        data: `package:${packageName}`,
      });
    } catch (e) {
      console.error('Error opening overlay settings:', e);
    }
  };

  const openAccessibility = async () => {
    try {
      await startActivityAsync(ActivityAction.ACCESSIBILITY_SETTINGS);
    } catch (e) {
      console.error('Error opening accessibility settings:', e);
    }
  };

  const requestBattery = async () => {
    try {
      await startActivityAsync(ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, {
        data: `package:${packageName}`,
      });
    } catch (e) {
      console.error('Error opening battery settings:', e);
    }
  };

  const PermissionCard = ({
    icon,
    title,
    description,
    hasPermission,
    onPress,
    color = '#7EA9E5',
  }: {
    icon: any;
    title: string;
    description: string;
    hasPermission: boolean;
    onPress: () => void;
    color?: string;
  }) => {
    if (hasPermission) return null;

    return (
      <View className={`mb-4 rounded-2xl border p-6 shadow-sm ${isDarkMode ? 'bg-[#131B26] ' : 'bg-white border-slate-50'}`}>
        <View className="mb-4 flex-row items-start ">
          <View className={`h-12 w-12 items-center justify-center rounded-xl ${isDarkMode ? 'bg-[#1F2630]' : 'bg-[#EBF1F7]'}`}>
            {icon}
          </View>
          <View className="flex-1 ml-4">
            <Text allowFontScaling={false} className={`mb-1 text-[18px] font-semibold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>{title}</Text>
            <Text allowFontScaling={false} className={`text-[12px] font-regular leading-5 ${isDarkMode ? 'text-[#738099]' : 'text-[#8698B2]'}`}>{description}</Text>
          </View>
        </View>

        {hasPermission ? (
          <View className="w-full items-center justify-center rounded-full bg-green-100 py-3">
            <Text allowFontScaling={false} className="font-semibold text-green-600">Allowed</Text>
          </View>
        ) : (
          <TouchableOpacity
            className={`w-full items-center justify-center rounded-full py-3 ${isDarkMode ? 'bg-[#202D40]' : 'bg-[#7EA9E5]'}`}
            onPress={onPress}
            style={{ backgroundColor: isDarkMode ? '#202D40' : '#7EA9E5' }}>
            <Text allowFontScaling={false} className={`font-bold text-[14px] ${isDarkMode ? 'text-[#DADFE5]' : 'text-white'}`}>
              {title === 'Accessibility Service' ? 'Allow' : 'Grant Permission'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Calculate missing permissions count
  const missingCount = Object.values(permissions).filter((p) => !p).length;

  useEffect(() => {
    if (missingCount === 0) {
      router.replace('/home');
    }
  }, [missingCount]);

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#EEF2F6]'}`}>
      <StatusBar backgroundColor={isDarkMode ? '#0D121A' : '#EEF2F6'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section with Illustration */}
        <View className="items-center px-6 py-8">
          <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="relative items-center justify-center mb-4">
              <Image
                source={require('@/assets/images/clock.png')}
                className="h-[155px] w-[256px]"
              />
            </View>
          </View>

          <Text allowFontScaling={false} className={`mb-2 text-[20px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
            {missingCount > 0 ? `${missingCount} Permission Missing` : 'All Set!'}
          </Text>

          <Text allowFontScaling={false} className={`px-2 text-center text-[10px] font-regular leading-4 ${isDarkMode ? 'text-[#738099]' : 'text-[#8698B2]'}`}>
            <Text allowFontScaling={false} className={`font-semibold ${isDarkMode ? 'text-[#738099]' : 'text-[#8698B2]'}`}>Minimal Life</Text> requires permission to track your screen
            time and distraction blocking features.{'\n\n'}
            We don't collect or share your personal data. Your{' '}
            <Text allowFontScaling={false} className={`font-semibold ${isDarkMode ? 'text-[#738099]' : 'text-[#8698B2]'}`}>data store</Text> on your{' '}
            <Text allowFontScaling={false} className={`font-semibold ${isDarkMode ? 'text-[#738099]' : 'text-[#8698B2]'}`}>device; not</Text> in our{' '}
            <Text allowFontScaling={false} className={`font-semibold ${isDarkMode ? 'text-[#738099]' : 'text-[#8698B2]'}`}>server</Text>. Feel free to give permission.
          </Text>
        </View>

        {/* Permissions List */}
        <View className="px-4">
          <PermissionCard
            icon={<Image source={require('@/assets/images/AppUsage.png')} style={{ width: 24, height: 26, tintColor: isDarkMode ? '#DADFE5' : '#7EA9E5' }} />}
            title="Access App Usage Data"
            description="Required to block distracting app. Also use to track screen time."
            hasPermission={permissions.usageStats}
            onPress={requestUsageStats}
          />

          <PermissionCard
            icon={<Image source={require('@/assets/images/OverApp.png')} style={{ width: 24, height: 24, tintColor: isDarkMode ? '#DADFE5' : '#7EA9E5' }} />}
            title="Display Over Other Apps"
            description="Required to display an overlay over blocked distracting apps."
            hasPermission={permissions.overlay}
            onPress={requestOverlay}
          />

          <PermissionCard
            icon={<Image source={require('@/assets/images/Accessibility.png')} style={{ width: 24, height: 28, tintColor: isDarkMode ? '#DADFE5' : '#7EA9E5' }} />}
            title="Accessibility Service"
            description="Required to access web distraction usage and block harmful surfing."
            hasPermission={permissions.accessibility}
            onPress={openAccessibility}
          />

          <PermissionCard
            icon={<Image source={require('@/assets/images/BatteryOpt.png')} style={{ width: 32, height: 24, tintColor: isDarkMode ? '#DADFE5' : '#7EA9E5' }} />}
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
