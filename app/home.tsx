import { View, Text, TouchableOpacity, Linking, Platform, Modal, Image, Alert } from 'react-native';
import { Stack, Link, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import * as IntentLauncher from 'expo-intent-launcher';
import { useEffect, useState, useCallback } from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Directions,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Launcher from '../modules/launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { openApplication } from 'expo-intent-launcher';

export default function Home() {
  const router = useRouter();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(
    Battery.BatteryState.UNKNOWN
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStats, setTodayStats] = useState({ totalUsageTime: 0, unlockCount: 0 });

  // Home Apps State
  const [homeApps, setHomeApps] = useState<AppItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = () => {
        try {
          const stats = Launcher.getTodayUsageStats();
          setTodayStats(stats);
        } catch (e) {
          console.error('Failed to fetch usage stats', e);
        }
      };

      const loadHomeApps = async () => {
        try {
          const stored = await AsyncStorage.getItem('homeApps');
          if (stored) {
            setHomeApps(JSON.parse(stored));
          }
        } catch (e) {
          console.error('Failed to load home apps', e);
        }
      };

      fetchStats();
      loadHomeApps();
      // Update stats every minute while focused
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }, [])
  );

  const formatUsageTime = (millis: number) => {
    const minutes = Math.floor(millis / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  useEffect(() => {
    async function getBatteryStatus() {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      setBatteryLevel(level);
      setBatteryState(state);
    }

    getBatteryStatus();

    const subscriptionLevel = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(batteryLevel);
    });
    const subscriptionState = Battery.addBatteryStateListener(({ batteryState }) => {
      setBatteryState(batteryState);
    });

    return () => {
      subscriptionLevel.remove();
      subscriptionState.remove();
    };
  }, []);

  const handleLaunchApp = (durationMinutes: number) => {
    if (selectedApp) {
      try {
        // Check permission
        const hasUsagePermission = Launcher.checkUsageStatsPermission();
        if (!hasUsagePermission) {
          Alert.alert(
            'Permission Required',
            'To track usage limits, please grant Usage Access permission.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  Launcher.openUsageAccessSettings();
                },
              },
            ]
          );
          return;
        }

        const hasNotificationPermission = Launcher.checkNotificationPermission();
        if (!hasNotificationPermission) {
          Alert.alert(
            'Permission Required',
            'To show the usage monitor notification, please grant Notification permission.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  Launcher.openNotificationSettings();
                },
              },
            ]
          );
          return;
        }

        // Start the overlay timer
        const durationMs = durationMinutes * 15 * 1000;
        Launcher.startTimerOverlay(durationMs, selectedApp.packageName);

        // Open the app
        openApplication(selectedApp.packageName);

        // Close modal
        setModalVisible(false);
        setSelectedApp(null);
      } catch (error) {
        console.error('Failed to launch app:', error);
      }
    }
  };

  const getBatteryIcon = () => {
    if (
      batteryState === Battery.BatteryState.CHARGING ||
      batteryState === Battery.BatteryState.FULL
    ) {
      return 'battery-charging';
    }
    if (batteryLevel === null) return 'battery-full';
    if (batteryLevel >= 0.9) return 'battery-full';
    if (batteryLevel >= 0.4) return 'battery-half';
    return 'battery-dead';
  };

  const openDialer = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('tel:');
    } else {
      Linking.openURL('tel:');
    }
  };

  const openCamera = () => {
    if (Platform.OS === 'android') {
      IntentLauncher.startActivityAsync('android.media.action.STILL_IMAGE_CAMERA');
    } else {
      // Fallback for iOS or other platforms if needed, though task specified Android
      Linking.openURL('camera:'); // Note: camera: scheme is not standard but often used as placeholder
    }
  };

  const navigateToAllApps = () => {
    router.push('/all-apps');
  };

  const navigateToCategoryApps = () => {
    router.push('/AllAppListByCategoryScreen');
  };

  const leftSwipeGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(navigateToAllApps)();
    });

  const rightSwipeGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(navigateToCategoryApps)();
    });

  const composedGestures = Gesture.Simultaneous(leftSwipeGesture, rightSwipeGesture);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composedGestures}>
        <View className="flex-1 justify-between bg-[#EFF6FC] px-6 py-12">
          <Stack.Screen options={{ headerShown: false }} />

          {/* Header: Time, Date, Battery */}
          <View className="mt-10 items-center">
            <View className="flex-row items-baseline">
              <Text allowFontScaling={false} className="font-regular text-[32px] text-[#2E3A4C]">
                {currentTime.getHours() % 12 || 12}:
                {currentTime.getMinutes().toString().padStart(2, '0')}
              </Text>
              <Text allowFontScaling={false} className="ml-1 text-[14px] text-[#2E3A4C]">
                {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
              </Text>
            </View>
            <Text allowFontScaling={false} className="font-regular mt-1 text-[14px] text-[#8698B2]">
              {currentTime.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <View className="mt-3 flex-row items-center gap-2">
              <Ionicons name={getBatteryIcon()} size={24} color="#5B8BDF" />
              {batteryLevel !== null && (
                <Text className="text-sm font-medium text-[#5B8BDF]">
                  {Math.round(batteryLevel * 100)}%
                </Text>
              )}
            </View>
          </View>

          {/* Main Actions */}
          <View className="w-full items-center px-4">
            {/* Render Home Apps */}
            {homeApps.map((app) => (
              <TouchableOpacity 
                key={app.packageName}
                className="w-full bg-[#E2EEF9] py-5 rounded-[30px] items-center border border-[#C2DEF240] border-b-[#C2DEF2] border-x-transparent shadow-sm mb-4"
                onPress={() => {
                    setSelectedApp(app);
                    setModalVisible(true);
                }}
              >
                <Text allowFontScaling={false} className="text-[#2E3A4C] text-[18px] tracking-wide font-regular">{app.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Add Icon */}
            <Link href="/all-apps?mode=select" asChild>
              <TouchableOpacity className="mt-4 items-center">
                 <View className="border border-2 border-[#A3B9D9] rounded-full p-1">
                    <MaterialCommunityIcons name="plus" size={24} color="#A3B9D9" />
                 </View>
                 <Text allowFontScaling={false} className="text-[#A3B9D9] font-regular text-[12px] mt-2">Don't add unnecessary addictive app!</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer Info */}
          <View className="w-full items-center">
            <View className="mb-2 flex-row items-center gap-4">
              <Text allowFontScaling={false} className="text-[14px] text-[#8698B2] font-regular">
                Today Unlock:{' '}
                <Text allowFontScaling={false} className="font-bold text-[#8698B2]">{todayStats.unlockCount}</Text>
              </Text>
              <Text allowFontScaling={false} className="text-[#8698B2] font-regular">||</Text>
              <Text allowFontScaling={false} className="text-[14px] text-[#8698B2] font-regular">
                Today Use:{' '}
                <Text allowFontScaling={false} className="font-bold text-[#8698B2]">
                  {formatUsageTime(todayStats.totalUsageTime)}
                </Text>
              </Text>
            </View>
            <Text allowFontScaling={false} className="mb-10 text-[12px] font-light text-[#A3B9D9]">
              Leave it! Do something mindful in real world.
            </Text>

            {/* Bottom Actions: Dialer & Camera */}
            <View className="w-full flex-row gap-1">
              <TouchableOpacity
                onPress={openDialer}
                className="flex-1 items-center rounded-l-[30px] border-r border-white bg-[#DAE4F2] py-5">
                <Text allowFontScaling={false} className="text-[18px] text-[#2E3A4C] font-regular">Dialer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openCamera}
                className="flex-1 items-center rounded-r-[30px] bg-[#DAE4F2] py-5">
                <Text allowFontScaling={false} className="text-[18px] text-[#2E3A4C] font-regular">Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View className="flex-1 items-center justify-center bg-black/70">
              <View className="w-[85%] rounded-3xl bg-white p-6 shadow-xl">
                <View className="mb-6 items-center">
                  <Text className="mb-4 text-center text-xl font-bold text-gray-900">
                    Open {selectedApp?.label}
                  </Text>

                  {selectedApp?.icon && (
                    <Image
                      source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                      className="mb-6 h-20 w-20"
                      resizeMode="contain"
                    />
                  )}

                  <Text className="text-center text-base font-medium text-gray-800">
                    Select estimated use time
                  </Text>
                </View>

                <View className="mb-6 flex-row flex-wrap justify-between">
                  {[2, 5, 10, 20].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      className="mb-3 w-[48%] items-center rounded-full bg-[#7EA6E0] py-3 active:opacity-80"
                      onPress={() => handleLaunchApp(mins)}>
                      <Text className="text-base font-medium text-white">{mins} min</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="mt-2 border-t border-gray-200 pt-6">
                  <TouchableOpacity
                    className="w-full items-center rounded-full bg-[#4B7ABE] py-3 active:opacity-80"
                    onPress={() => setModalVisible(false)}>
                    <Text className="text-base font-medium text-white">Quit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
