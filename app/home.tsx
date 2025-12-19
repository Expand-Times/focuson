import { View, Text, TouchableOpacity, Linking, Platform, Modal, Image, Alert, StatusBar } from 'react-native';
import { Stack, Link, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useColorContext } from './context/ColorContext';

const isBroadSystemApp = (pkg: string) => { 
  const systemPackages = [
    'com.android.systemui',
    'com.android.settings',
    'com.android.vending', // Google Play Store
    'com.google.android.gms', // Google Play Services
    'com.google.android.googlequicksearchbox', // Google App
    'android',
    'com.android.phone',
    'com.android.providers',
    'com.android.permissioncontroller',
  ];
  return systemPackages.some(sys => pkg.startsWith(sys)) || pkg.includes('.overlay') || pkg.includes('.service');
}; 

const isLauncherPackage = (pkg: string) => { 
  const launchers = [
    'com.expandtimes.minimallife', // This app
    'com.sec.android.app.launcher', // Samsung
    'com.google.android.apps.nexuslauncher', // Pixel
    'com.miui.home', // Xiaomi
    'com.huawei.android.launcher', // Huawei
    'com.oppo.launcher', // Oppo
    'com.bbk.launcher2', // Vivo
    'com.oneplus.launcher', // OnePlus
    'com.teslacoilsw.launcher', // Nova Launcher
    'com.android.launcher', // Generic
    'com.android.launcher3', // AOSP
    'com.microsoft.launcher', // Microsoft Launcher
    'com.actionlauncher.playstore', // Action Launcher
  ];
  const lowerPkg = pkg.toLowerCase();
  return launchers.some(l => lowerPkg === l.toLowerCase()) || lowerPkg.includes('launcher') || lowerPkg.endsWith('.home');
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, wallpaper, showPhoneDialer, showCameraIcon, timeFormat, dateFormat, timeOffset } = useColorContext();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(
    Battery.BatteryState.UNKNOWN
  );
  const [currentTime, setCurrentTime] = useState(new Date(Date.now() + (timeOffset || 0)));
  const [todayStats, setTodayStats] = useState({ totalUsageTime: 0, unlockCount: 0 });

  // Home Apps State
  const [homeApps, setHomeApps] = useState<AppItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Update time immediately when timeOffset changes
    setCurrentTime(new Date(Date.now() + (timeOffset || 0)));
    const timer = setInterval(() => setCurrentTime(new Date(Date.now() + (timeOffset || 0))), 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

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

  const getFormattedTime = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const z = (n: number) => n.toString().padStart(2, '0');
    
    let format = timeFormat;
    if (format === '12h') format = 'HH:MM PM';
    if (format === '24h') format = 'HH:MM';

    if (format === 'HH:MM') return { main: `${z(h)}:${z(m)}` };
    if (format === 'HH:MM PM') {
      const h12 = h % 12 || 12;
      return { main: `${h12}:${z(m)}`, suffix: h >= 12 ? 'PM' : 'AM' };
    }
    if (format === 'HH:MM:SS') return { main: `${z(h)}:${z(m)}:${z(s)}` };
    if (format === 'HH:MM:SS PM') {
      const h12 = h % 12 || 12;
      return { main: `${h12}:${z(m)}:${z(s)}`, suffix: h >= 12 ? 'PM' : 'AM' };
    }
    return { main: `${z(h)}:${z(m)}` };
  };

  const getFormattedDate = (date: Date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const yy = y.toString().slice(-2);
    const mon = date.toLocaleString('en-US', { month: 'short' });
    const z = (n: number) => n.toString().padStart(2, '0');

    switch (dateFormat) {
      case 'DD:MM:YYYY': return `${z(d)}:${z(m)}:${y}`;
      case 'DD:MM:YY': return `${z(d)}:${z(m)}:${yy}`;
      case 'MM:DD:YYYY': return `${z(m)}:${z(d)}:${y}`;
      case 'MM:DD:YY': return `${z(m)}:${z(d)}:${yy}`;
      case 'DD:Mon:YYYY': return `${z(d)} ${mon} ${y}`;
      case 'Mon:DD:YYYY': return `${mon} ${z(d)}, ${y}`;
      // Legacy
      case 'weekday, day month year':
        return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
      case 'day month year':
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      case 'day/month/year':
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'month/day/year':
        return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'year-month-day':
        return date.toISOString().split('T')[0];
      default: return dateFormat;
    }
  };

  const timeDisplay = getFormattedTime(currentTime);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar 
        backgroundColor={wallpaper ? 'transparent' : (isDarkMode ? '#0F172A' : '#EBF0F7')} 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        translucent={!!wallpaper}
      />
      
      {wallpaper && typeof wallpaper !== 'string' && (
        <Image source={wallpaper} className="absolute w-full h-full" resizeMode="cover" />
      )}

      <GestureDetector gesture={composedGestures}>
        <View 
          className="flex-1 justify-between px-6"
          style={{
            paddingTop: 48,
            paddingBottom: 48 + insets.bottom,
            backgroundColor: wallpaper 
              ? (typeof wallpaper === 'string' ? wallpaper : 'transparent')
              : (isDarkMode ? '#0F172A' : '#EFF6FC')
          }}
        >
          <Stack.Screen options={{ headerShown: false }} />

          {/* Header: Time, Date, Battery */}
          <View className="mt-10 items-center">
            <View className="flex-row items-baseline">
                <Text allowFontScaling={false} className={`font-regular text-[32px] ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-300' : 'text-[#2E3A4C]')}`}>
                  {timeDisplay.main}
                </Text>
                {timeDisplay.suffix && (
                  <Text allowFontScaling={false} className={`ml-1 text-[14px] ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-400' : 'text-[#8698B2]')}`}>
                    {timeDisplay.suffix}
                  </Text>
                )}
            </View>
            <Text allowFontScaling={false} className={`font-regular mt-1 text-[14px] ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#FFFFFF]' : (isDarkMode ? 'text-slate-500' : 'text-[#8698B2]')}`}>
              {getFormattedDate(currentTime)}
            </Text>
            <View className="mt-3 flex-row items-center gap-2">
              <Ionicons name={getBatteryIcon()} size={24} color={(wallpaper && typeof wallpaper !== 'string') ? '#E6EBF2' : (isDarkMode ? "#64748B" : "#5B8BDF")} />
              {batteryLevel !== null && (
                <Text allowFontScaling={false} className={`text-sm font-medium ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-400' : 'text-[#5B8BDF]')}`}>
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
                className={`w-full py-3 rounded-full items-center border  mb-4 ${(wallpaper && typeof wallpaper !== 'string') ? 'bg-[#7EA9E51A] backdrop-blur-2xl border border-t-[#C2DEF20D] border-b-[#C2DEF2] border-l-[#EADADA] border-r-[#EADADA]' : (isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-[#DAE4F280] border-[#C2DEF240] border-[#C2DEF2]')}`}
                onPress={() => {
                    setSelectedApp(app);
                    setModalVisible(true);
                }}
              >
                <Text allowFontScaling={false} className={`text-[18px] tracking-wide font-regular ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-300' : 'text-[#2E3A4C]')}`}>{app.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Add Icon */}
            <Link href="/all-apps?mode=select" asChild>
              <TouchableOpacity className="mt-4 items-center">
                 <View className={`border border-2 rounded-full p-1 ${(wallpaper && typeof wallpaper !== 'string') ? 'border-[#A3B9D9]' : (isDarkMode ? 'border-slate-600' : 'border-[#A3B9D9]')}`}>
                    <MaterialCommunityIcons name="plus" size={24} color={(wallpaper && typeof wallpaper !== 'string') ? '#A3B9D9' : (isDarkMode ? "#64748B" : "#A3B9D9")} />
                 </View>
                 <Text allowFontScaling={false} className={`font-light text-[12px] mt-2 ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#A3B9D9]' : (isDarkMode ? 'text-slate-500' : 'text-[#A3B9D9]')}`}>Don't add unnecessary addictive app!</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer Info */}
          <View className="w-full items-center">
            <View className="mb-2 flex-row items-center gap-4">
              <Text allowFontScaling={false} className={`text-[14px] font-regular ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-500' : 'text-[#8698B2]')}`}>
                Today Unlock:{' '}
                <Text allowFontScaling={false} className={`font-bold ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-400' : 'text-[#8698B2]')}`}>{todayStats.unlockCount}</Text>
              </Text>
              <Text allowFontScaling={false} className={`font-regular ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-500' : 'text-[#8698B2]')}`}>||</Text>
              <Text allowFontScaling={false} className={`text-[14px] font-regular ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-500' : 'text-[#8698B2]')}`}>
                Today Use:{' '}
                <Text allowFontScaling={false} className={`font-bold ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-400' : 'text-[#8698B2]')}`}>
                  {formatUsageTime(todayStats.totalUsageTime)}
                </Text>
              </Text>
            </View>
            <Text allowFontScaling={false} className={`mb-10 text-[12px] font-light ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#A3B9D9]' : (isDarkMode ? 'text-slate-600' : 'text-[#A3B9D9]')}`}>
              Leave it! Do something mindful in real world.
            </Text>

            {/* Bottom Actions: Dialer & Camera */}
            <View className="w-full flex-row gap-1">
              <TouchableOpacity
                onPress={openDialer}
                className={`flex-1 items-center justify-center rounded-r-[30px] rounded-full py-3 ${(wallpaper && typeof wallpaper !== 'string') ? 'bg-[#7EA9E51A] border border-[#C2DEF2]' : (isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-[#DAE4F2] border-white')}`}>
                {showPhoneDialer ? (
                   <Ionicons name="call-outline" size={24} color={(wallpaper && typeof wallpaper !== 'string') ? '#E6EBF2' : (isDarkMode ? "#CBD5E1" : "#2E3A4C")} />
                ) : (
                  <Text allowFontScaling={false} className={`text-[18px] font-regular ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-300' : 'text-[#2E3A4C]')}`}>Dialer</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openCamera}
                className={`flex-1 items-center justify-center rounded-r-[30px] py-3 ${(wallpaper && typeof wallpaper !== 'string') ? 'bg-[#7EA9E51A] border border-[#C2DEF2]' : (isDarkMode ? 'bg-[#1E293B]' : 'bg-[#DAE4F2]')}`}>
                {showCameraIcon ? (
                  <Ionicons name="camera-outline" size={24} color={(wallpaper && typeof wallpaper !== 'string') ? '#E6EBF2' : (isDarkMode ? "#CBD5E1" : "#2E3A4C")} />  
                ) : (
                  <Text allowFontScaling={false} className={`text-[18px] font-regular ${(wallpaper && typeof wallpaper !== 'string') ? 'text-[#E6EBF2]' : (isDarkMode ? 'text-slate-300' : 'text-[#2E3A4C]')}`}>Camera</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View className="flex-1 items-center justify-center bg-black/70">
              <View className={`w-[85%] rounded-3xl p-6 shadow-xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <View className="mb-6 items-center">
                  <Text allowFontScaling={false} className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                    Open {selectedApp?.label}
                  </Text>

                  {selectedApp?.icon && (
                    <Image
                      source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                      className="mb-6 h-20 w-20"
                      resizeMode="contain"
                    />
                  )}

                  <Text allowFontScaling={false} className={`text-center text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-800'}`}>
                    Select estimated use time
                  </Text>
                </View>

                <View className="mb-6 flex-row flex-wrap justify-between">
                  {[2, 5, 10, 20].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      className="mb-3 w-[48%] items-center rounded-full bg-[#7EA6E0] py-3 active:opacity-80"
                      onPress={() => handleLaunchApp(mins)}>
                      <Text allowFontScaling={false} className="text-base font-medium text-white">{mins} min</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className={`mt-2 border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <TouchableOpacity
                    className="w-full items-center rounded-full bg-[#4B7ABE] py-3 active:opacity-80"
                    onPress={() => setModalVisible(false)}>
                    <Text allowFontScaling={false} className="text-base font-medium text-white">Quit</Text>
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
