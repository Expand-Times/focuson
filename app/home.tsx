import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  Modal,
  Image,
  Alert,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { Stack, Link, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Battery from 'expo-battery';
import * as IntentLauncher from 'expo-intent-launcher';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Directions,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import Launcher from '../modules/launcher';
import wallpaperFontConfig from './constants/wallpaperFontConfig';

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = (height * 0.65) / 28;
const CURSOR_SIZE = ITEM_HEIGHT * 2.5;

const SidebarItem = ({
  letter,
  index,
  touchY,
  isTouching,
  onSelect,
  isDarkMode,
  currentLetter,
}: {
  letter: string;
  index: number;
  touchY: SharedValue<number>;
  isTouching: SharedValue<boolean>;
  onSelect: (letter: string) => void;
  isDarkMode: boolean;
  currentLetter: string;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const itemY = index * ITEM_HEIGHT + ITEM_HEIGHT / 2;
    const diff = itemY - touchY.value;
    const dist = Math.abs(diff);
    const direction = diff > 0 ? 1 : -1;

    const RANGE = ITEM_HEIGHT * 5;
    const MAX_SCALE = 2;

    let spreadY = 0;
    if (isTouching.value) {
      if (dist < RANGE) {
        spreadY = (MAX_SCALE - 1) * dist * (1 - dist / (2 * RANGE));
      } else {
        spreadY = ((MAX_SCALE - 1) * RANGE) / 2;
      }
    }

    const finalTranslateY = direction * spreadY;

    const translateX = interpolate(
      dist,
      [0, ITEM_HEIGHT * 5],
      [-ITEM_HEIGHT * 6, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(dist, [0, ITEM_HEIGHT * 5], [MAX_SCALE, 1], Extrapolation.CLAMP);

    return {
      transform: [
        { translateX: withSpring(isTouching.value ? translateX : 0) },
        { translateY: withSpring(isTouching.value ? finalTranslateY : 0) },
        { scale: withSpring(isTouching.value ? scale : 1) },
      ],
      zIndex: isTouching.value && dist < ITEM_HEIGHT * 1.5 ? 100 : 1,
    };
  });

  return (
    <Animated.View
      style={[
        { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: 24 },
        animatedStyle,
      ]}>
      <TouchableOpacity onPress={() => onSelect(letter)} activeOpacity={0.7}>
        <Text
          allowFontScaling={false}
          style={{ fontSize: currentLetter === letter ? ITEM_HEIGHT * 0.8 : ITEM_HEIGHT * 0.6 }}
          className={`font-medium ${
            currentLetter === letter
              ? isDarkMode
                ? 'font-bold text-white'
                : 'font-extrabold text-[#5C8BCC]'
              : isDarkMode
                ? 'text-[#738099]'
                : 'text-[#5B8BDF]'
          }`}>
          {letter}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BubbleCursor = ({
  touchY,
  isTouching,
  letter,
  isDarkMode,
}: {
  touchY: SharedValue<number>;
  isTouching: SharedValue<boolean>;
  letter: string;
  isDarkMode: boolean;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: touchY.value - CURSOR_SIZE / 2 },
        { scale: withSpring(isTouching.value ? 1 : 0) },
        { translateX: withSpring(isTouching.value ? -ITEM_HEIGHT * 6 : 0) },
      ],
      opacity: withSpring(isTouching.value ? 1 : 0),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: ITEM_HEIGHT * 1.5,
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          borderRadius: CURSOR_SIZE / 2,
          backgroundColor: isDarkMode ? '#4ADE80' : '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        animatedStyle,
      ]}>
      <Text style={{ fontSize: CURSOR_SIZE * 0.4 }} className="font-bold text-black">
        {letter}
      </Text>
    </Animated.View>
  );
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { openApplication } from 'expo-intent-launcher';
import { useColorContext } from './context/ColorContext';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    wallpaper,
    wallpaperIndex,
    showPhoneDialer,
    showCameraIcon,
    timeFormat,
    dateFormat,
    timeOffset,
    isDarkMode,
  } = useColorContext();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(
    Battery.BatteryState.UNKNOWN
  );
  const [currentTime, setCurrentTime] = useState(new Date(Date.now() + (timeOffset || 0)));
  const [todayStats, setTodayStats] = useState({ totalUsageTime: 0, unlockCount: 0 });

  // Sidebar Logic
  const sidebarChars = useMemo(() => ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')], []);
  const touchY = useSharedValue(0);
  const isTouching = useSharedValue(false);
  const [dragLetter, setDragLetter] = useState('');

  const navigateToAllAppsWithLetter = (letter: string) => {
    setDragLetter(letter);
    router.push({ pathname: '/all-apps', params: { initialLetter: letter } });
  };

  const updateDragLetterState = (index: number) => {
    if (index >= 0 && index < sidebarChars.length) {
      setDragLetter(sidebarChars[index]);
    }
  };

  const performNavigation = (index: number) => {
    if (index >= 0 && index < sidebarChars.length) {
      const letter = sidebarChars[index];
      // Reset drag letter before navigating to avoid stuck state
      setDragLetter('');
      router.push({ pathname: '/all-apps', params: { initialLetter: letter } });
    }
  };

  const clearDragLetterState = () => {
    setDragLetter('');
  };

  const sidebarGesture = Gesture.Pan()
    .onBegin((e) => {
      isTouching.value = true;
      touchY.value = e.y;
      const index = Math.floor(e.y / ITEM_HEIGHT);
      runOnJS(updateDragLetterState)(index);
    })
    .onUpdate((e) => {
      touchY.value = e.y;
      const index = Math.floor(e.y / ITEM_HEIGHT);
      runOnJS(updateDragLetterState)(index);
    })
    .onEnd(() => {
      const index = Math.floor(touchY.value / ITEM_HEIGHT);
      runOnJS(performNavigation)(index);
    })
    .onFinalize(() => {
      isTouching.value = false;
      runOnJS(clearDragLetterState)();
    });

  // Home Apps State
  const [homeApps, setHomeApps] = useState<AppItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [appRenames, setAppRenames] = useState<Record<string, string>>({});

  // Time Over Settings State
  const [showTimeOverSettings, setShowTimeOverSettings] = useState(false);
  const [timeOverAction, setTimeOverAction] = useState<'mindful' | 'remind' | 'quit'>('remind');
  const [secondWarning, setSecondWarning] = useState(true);

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

      const loadRenamedApps = async () => {
        try {
          const stored = await AsyncStorage.getItem('appRenames');
          if (stored) {
            setAppRenames(JSON.parse(stored));
          }
        } catch (e) {
          console.error('Failed to load app renames', e);
        }
      };

      const loadTimeOverSettings = async () => {
        try {
          const stored = await AsyncStorage.getItem('reminderOption');
          if (stored) {
            setTimeOverAction(stored as any);
          }
        } catch (e) {
          console.error('Failed to load time over settings', e);
        }
      };

      fetchStats();
      loadHomeApps();
      loadRenamedApps();
      loadTimeOverSettings();
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
        const durationMs = durationMinutes * 60 * 1000;
        Launcher.startTimerOverlay(durationMs, selectedApp.packageName, timeOverAction);

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

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const mon = monthNames[date.getMonth()];

    const weekdayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayName = weekdayNames[date.getDay()];

    const z = (n: number) => n.toString().padStart(2, '0');

    if (dateFormat === 'weekday, day month year') {
      return `${dayName}, ${d} ${mon} ${y}`;
    }

    let datePart = '';
    switch (dateFormat) {
      case 'DD:MM:YYYY':
        datePart = `${z(d)}:${z(m)}:${y}`;
        break;
      case 'DD:MM:YY':
        datePart = `${z(d)}:${z(m)}:${yy}`;
        break;
      case 'MM:DD:YYYY':
        datePart = `${z(m)}:${z(d)}:${y}`;
        break;
      case 'MM:DD:YY':
        datePart = `${z(m)}:${z(d)}:${yy}`;
        break;
      case 'DD:Mon:YYYY':
        datePart = `${z(d)} ${mon} ${y}`;
        break;
      case 'Mon:DD:YYYY':
        datePart = `${mon} ${z(d)}, ${y}`;
        break;

      case 'day month year':
        datePart = `${d} ${mon} ${y}`;
        break;
      case 'day/month/year':
        datePart = `${z(d)}/${z(m)}/${y}`;
        break;
      case 'month/day/year':
        datePart = `${z(m)}/${z(d)}/${y}`;
        break;
      case 'year-month-day':
        datePart = `${y}-${z(m)}-${z(d)}`;
        break;
      default:
        return dateFormat;
    }

    return `${dayName}, ${datePart}`;
  };

  const timeDisplay = getFormattedTime(currentTime);

  const fontConfig = wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null;
  const { clock, date, info, color, fontSize, } = fontConfig || ({} as any);
  

  return (
    <GestureHandlerRootView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#E1EAF5]'}`}>
      <StatusBar
        backgroundColor={isDarkMode ? '#0D121A' : '#E1EAF5'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      {wallpaper && typeof wallpaper !== 'string' && (
        <Image source={wallpaper} className="absolute h-full w-full" resizeMode="cover" />
      )}

      <GestureDetector gesture={composedGestures}>
        <View
          className="flex-1 justify-between px-6"
          style={{
            paddingTop: 48,
            paddingBottom: 48 + insets.bottom,
            backgroundColor: wallpaper
              ? typeof wallpaper === 'string'
                ? wallpaper
                : 'transparent'
              : isDarkMode
                ? '#0D121A'
                : '#E1EAF5',
          }}>
          <Stack.Screen options={{ headerShown: false }} />

          {/* Header: Time, Date, Battery */}
          <View className="mt-10 items-center">
            <View className="flex-row items-baseline">
              <Text
                allowFontScaling={false}
                style={clock ? { fontFamily: clock, color, fontSize } : undefined}
                className={`font-regular text-[32px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
                {timeDisplay.main}
              </Text>
              {timeDisplay.suffix && (
                <Text
                  allowFontScaling={false}
                  style={clock ? { fontFamily: clock, color, fontSize } : undefined}
                  className={`ml-1 text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                  {timeDisplay.suffix}
                </Text>
              )}
            </View>
            <Text
              allowFontScaling={false}
             
              className={`font-regular mt-1 text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#FFFFFF]' : isDarkMode ? 'text-[#728099]' : 'text-[#8698B2]'}`}>
              {getFormattedDate(currentTime)}
            </Text>
            <View className="mt-3 flex-row items-center gap-2">
              <Ionicons
                name={getBatteryIcon()}
                size={24}
                color={
                  wallpaper && typeof wallpaper !== 'string'
                    ? '#E6EBF2'
                    : isDarkMode
                      ? '#7FA8E5'
                      : '#5B8BDF'
                }
              />
              {batteryLevel !== null && (
                <Text
                  allowFontScaling={false}
                 
                  className={`text-sm font-medium ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-slate-400' : 'text-[#5B8BDF]'}`}>
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
                className={`mb-4 w-full items-center py-2 `}
                onPress={() => {
                  setSelectedApp(app);
                  setModalVisible(true);
                }}>
                <Text
                  allowFontScaling={false}
                  className={`font-regular text-[16px] tracking-wide ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
                  {appRenames[app.packageName] || app.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Add Icon */}
            <Link href="/all-apps?mode=select" asChild>
              <TouchableOpacity className="mt-4 items-center">
                <View
                  className={`rounded-full border border-2 p-1 ${wallpaper && typeof wallpaper !== 'string' ? 'border-[#A3B9D9]' : isDarkMode ? 'border-[#738099]' : 'border-[#A3B9D9]'}`}>
                  <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color={
                      wallpaper && typeof wallpaper !== 'string'
                        ? '#A3B9D9'
                        : isDarkMode
                          ? '#738099'
                          : '#A3B9D9'
                    }
                  />
                </View>
                <Text
                  allowFontScaling={false}
                  className={`mt-2 text-[12px] font-light ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#405B7F]' : isDarkMode ? 'text-[#434C59]' : 'text-[#A4B5CC]'}`}>
                  Don't add unnecessary addictive app!
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer Info */}
          <View className="w-full items-center">
            <View className="mb-2 flex-row items-center gap-4">
              <Text
                allowFontScaling={false}
                className={`font-regular text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Today Unlock:{' '}
                <Text
                  allowFontScaling={false}
                  className={`font-bold ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                  {todayStats.unlockCount}
                </Text>
              </Text>
              <Text
                allowFontScaling={false}
                className={`font-regular ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                ||
              </Text>
              <Text
                allowFontScaling={false}
                className={`font-regular text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Today Use:{' '}
                <Text
                  allowFontScaling={false}
                  className={`font-bold ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                  {formatUsageTime(todayStats.totalUsageTime)}
                </Text>
              </Text>
            </View>
            <Text
              allowFontScaling={false}
              className={`mb-10 text-[12px] font-light ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#A3B9D9]' : isDarkMode ? 'text-[#738099]' : 'text-[#A3B9D9]'}`}>
              Leave it! Do something mindful in real world.
            </Text>

            {/* Bottom Actions: Dialer & Camera */}
            <View className="w-full flex-row gap-1">
              <TouchableOpacity
                onPress={openDialer}
                className={`flex-1 items-center justify-center rounded-full rounded-r-[30px] py-3 ${wallpaper && typeof wallpaper !== 'string' ? 'border border-[#C2DEF2] bg-[#7EA9E51A]' : isDarkMode ? 'border-[#131B26] bg-[#131B26]' : 'border-white bg-[#DAE4F2]'}`}>
                {showPhoneDialer ? (
                  <Ionicons
                    name="call-outline"
                    size={24}
                    color={
                      wallpaper && typeof wallpaper !== 'string'
                        ? '#E6EBF2'
                        : isDarkMode
                          ? '#CBD5E1'
                          : '#2E3A4C'
                    }
                  />
                ) : (
                  <Text
                    allowFontScaling={false}
                    className={`font-regular text-[18px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
                    Dialer
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openCamera}
                className={`flex-1 items-center justify-center rounded-r-[30px] py-3 ${wallpaper && typeof wallpaper !== 'string' ? 'border border-[#C2DEF2] bg-[#7EA9E51A]' : isDarkMode ? 'bg-[#131B26]' : 'bg-[#DAE4F2]'}`}>
                {showCameraIcon ? (
                  <Ionicons
                    name="camera-outline"
                    size={24}
                    color={
                      wallpaper && typeof wallpaper !== 'string'
                        ? '#E6EBF2'
                        : isDarkMode
                          ? '#CBD5E1'
                          : '#2E3A4C'
                    }
                  />
                ) : (
                  <Text
                    allowFontScaling={false}
                    className={`font-regular text-[18px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
                    Camera
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sidebar Overlay */}
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              zIndex: 100,
            }}>
            <GestureDetector gesture={sidebarGesture}>
              <Animated.View style={{ paddingHorizontal: 4 }}>
                {sidebarChars.map((letter, index) => (
                  <SidebarItem
                    key={index}
                    letter={letter}
                    index={index}
                    touchY={touchY}
                    isTouching={isTouching}
                    onSelect={(l) => navigateToAllAppsWithLetter(l)}
                    isDarkMode={isDarkMode}
                    currentLetter={dragLetter}
                  />
                ))}
                <BubbleCursor
                  touchY={touchY}
                  isTouching={isTouching}
                  letter={dragLetter}
                  isDarkMode={isDarkMode}
                />
              </Animated.View>
            </GestureDetector>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View className="flex-1 items-center justify-center bg-black/70">
              <View
                className={`w-[85%] rounded-3xl p-6 shadow-xl ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
                <View className="mb-6 items-center">
                  <Text
                    allowFontScaling={false}
                    className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-gray-900'}`}>
                    Open{' '}
                    {selectedApp ? appRenames[selectedApp.packageName] || selectedApp.label : ''}
                  </Text>

                  {selectedApp?.icon && (
                    <Image
                      source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                      className="mb-6 h-16 w-16"
                      resizeMode="contain"
                    />
                  )}

                  <Text
                    allowFontScaling={false}
                    className={`text-center text-base font-medium ${isDarkMode ? 'text-[#728099]' : 'text-gray-800'}`}>
                    Select estimated use time
                  </Text>
                </View>

                <View className="mb-6 flex-row flex-wrap justify-between">
                  {[2, 5, 10, 20].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      className={`mb-3 w-[48%] items-center rounded-xl ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#5B8BDF]'} py-3 active:opacity-80`}
                      onPress={() => handleLaunchApp(mins)}>
                      <Text
                        allowFontScaling={false}
                        className={`text-base font-medium ${isDarkMode ? 'text-[#DADFE5]' : 'text-white'}`}>
                        {mins} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Toggle Icon */}
                <TouchableOpacity
                  onPress={() => setShowTimeOverSettings(!showTimeOverSettings)}
                  className="mb-2 self-center p-2">
                  <Ionicons
                    name={showTimeOverSettings ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={isDarkMode ? '#94A3B8' : '#64748B'}
                  />
                </TouchableOpacity>

                {showTimeOverSettings && (
                  <View className="mb-4 w-full">
                    <Text
                      allowFontScaling={false}
                      className={`mb-4 text-center text-base font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-800'}`}>
                      When time is over
                    </Text>

                    {/* Mindful Delay */}
                    <TouchableOpacity
                      className="mb-3 flex-row items-center"
                      onPress={() => setTimeOverAction('mindful')}>
                      <View
                        className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${timeOverAction === 'mindful' ? 'border-[#5B8BDF]' : 'border-gray-400'}`}>
                        {timeOverAction === 'mindful' && (
                          <View className="h-3 w-3 rounded-full bg-[#5B8BDF]" />
                        )}
                      </View>
                      <Text
                        allowFontScaling={false}
                        className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                        Mindful Delay
                      </Text>
                    </TouchableOpacity>

                    {/* Remind Me */}
                    <View className="mb-3 flex-row items-center justify-between">
                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setTimeOverAction('remind')}>
                        <View
                          className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${timeOverAction === 'remind' ? 'border-[#5B8BDF]' : 'border-gray-400'}`}>
                          {timeOverAction === 'remind' && (
                            <View className="h-3 w-3 rounded-full bg-[#5B8BDF]" />
                          )}
                        </View>
                        <Text
                          allowFontScaling={false}
                          className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                          Remind Me
                        </Text>
                      </TouchableOpacity>

                      {/* 2nd Warning Checkbox */}
                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setSecondWarning(!secondWarning)}
                        disabled={timeOverAction !== 'remind'}
                        style={{ opacity: timeOverAction === 'remind' ? 1 : 0.5 }}>
                        <View
                          className={`mr-2 h-4 w-4 items-center justify-center rounded border ${secondWarning ? 'border-[#5B8BDF] bg-[#5B8BDF]' : 'border-gray-400'}`}>
                          {secondWarning && <Ionicons name="checkmark" size={12} color="white" />}
                        </View>
                        <Text
                          allowFontScaling={false}
                          className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          2nd Warning
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Quit */}
                    <TouchableOpacity
                      className="mb-3 flex-row items-center"
                      onPress={() => setTimeOverAction('quit')}>
                      <View
                        className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${timeOverAction === 'quit' ? 'border-[#5B8BDF]' : 'border-gray-400'}`}>
                        {timeOverAction === 'quit' && (
                          <View className="h-3 w-3 rounded-full bg-[#5B8BDF]" />
                        )}
                      </View>
                      <Text
                        allowFontScaling={false}
                        className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                        Quit
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View
                  className={`mt-2 border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <TouchableOpacity
                    className={`w-full items-center rounded-xl py-3 active:opacity-80 ${
                      isDarkMode ? 'bg-[#212D41]' : 'bg-[#5B8BDF]'
                    }`}
                    onPress={() => setModalVisible(false)}>
                    <Text allowFontScaling={false} className="text-base font-medium text-white">
                      Quit
                    </Text>
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
