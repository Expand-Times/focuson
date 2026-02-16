import { useAppLauncher } from './hooks/useAppLauncher';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { Stack, Link,  useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {  useSafeAreaInsets } from 'react-native-safe-area-context';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Haptics from 'expo-haptics';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import Launcher from '../modules/launcher';
import wallpaperFontConfig from './constants/wallpaperFontConfig';
import AllAppListByCategoryScreen from './AllAppListByCategoryScreen';
import AllApps from './all-apps';
import { SidebarItem, BubbleCursor } from './context/Sidebar';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { openApplication } from 'expo-intent-launcher';
import { useColorContext } from './context/ColorContext';
import { useAppContext } from './context/AppContext';
import AppModal from './context/Modal';
const { height, width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = (height * 0.65) / 28;
const CURSOR_SIZE = ITEM_HEIGHT * 2.5;
export default function Home() {
  
  const insets = useSafeAreaInsets();
  const {
    apps: allApps,
    homeApps,
    appRenames,
    pinnedPackageNames,
    blockedPackageNames,
    isExcludedFromTimer,
  } = useAppContext();
  const {
    wallpaper,
    wallpaperIndex,
    showPhoneDialer,
    showCameraIcon,
    timeFormat,
    dateFormat,
    timeOffset,
    isDarkMode,
    showStatusBar,
  } = useColorContext();

  const [currentTime, setCurrentTime] = useState(new Date(Date.now() + (timeOffset || 0)));
  const [todayStats, setTodayStats] = useState({ totalUsageTime: 0, unlockCount: 0 });

  // Sidebar Logic
  const sidebarChars = useMemo(() => {
    const visibleApps = allApps.filter((app) => !blockedPackageNames.includes(app.packageName));
    const presentLetters = new Set<string>();
    let hasNonAlpha = false;

    visibleApps.forEach((app) => {
      const name = appRenames[app.packageName] || app.label;
      const firstChar = name.charAt(0).toUpperCase();
      if (/^[A-Z]/.test(firstChar)) {
        presentLetters.add(firstChar);
      } else {
        hasNonAlpha = true;
      }
    });

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(char => presentLetters.has(char));

    let result = [...chars];
    if (hasNonAlpha) {
      result.unshift('#');
    }
    if (pinnedPackageNames.length > 0) {
      result.unshift('*');
    }
    return result;
  }, [allApps, pinnedPackageNames, blockedPackageNames, appRenames]);
  const touchY = useSharedValue(0);
  const isTouching = useSharedValue(false);
  const isSidebarActive = useSharedValue(false);
  const [dragLetter, setDragLetter] = useState('');
  const [allAppsLetter, setAllAppsLetter] = useState('');
  const lastLetterRef = useRef('');
  const translateX = useSharedValue(-SCREEN_WIDTH);
  const context = useSharedValue({ startX: 0 });

 const navigateToAllAppsWithLetter = (letter: string) => {
    setDragLetter(letter);
    setAllAppsLetter(letter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    translateX.value = withSpring(-SCREEN_WIDTH * 2, {
      damping: 40,
      stiffness: 1500,
      overshootClamping: true,
      mass: 0.3,
    });
  };

  const clearDragLetterState = useCallback(() => {
    setDragLetter('');
    lastLetterRef.current = '';
  }, []);

  const handleSidebarInteraction = useCallback(
    (index: number) => {
      if (index >= 0 && index < sidebarChars.length) {
        const letter = sidebarChars[index];

        // Only update if the letter has changed to prevent excessive re-renders
        if (letter !== lastLetterRef.current) {
          lastLetterRef.current = letter;
          setDragLetter(letter);
          setAllAppsLetter(letter);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          // Ensure we are on AllApps screen
          if (translateX.value > -SCREEN_WIDTH * 1.5) {
            translateX.value = withSpring(-SCREEN_WIDTH * 2, {
              damping: 40,
              stiffness: 1500,
              overshootClamping: true,
              mass: 0.3,
            });
          }
        }
      }
    },
    [sidebarChars, translateX]
  );

  const sidebarGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          isSidebarActive.value = true;
          isTouching.value = true;
          touchY.value = e.y;

          // Start navigation animation immediately on UI thread
          if (translateX.value > -SCREEN_WIDTH * 1.5) {
            translateX.value = withSpring(-SCREEN_WIDTH * 2, {
              damping: 40,
              stiffness: 1500,
              overshootClamping: true,
              mass: 0.3,
            });
          }

          const index = Math.floor(e.y / ITEM_HEIGHT);
          runOnJS(handleSidebarInteraction)(index);
        })
        .onUpdate((e) => {
          touchY.value = e.y;
          const index = Math.floor(e.y / ITEM_HEIGHT);
          runOnJS(handleSidebarInteraction)(index);
        })
        .onEnd(() => {
          // Logic handled in update
        })
        .onFinalize(() => {
          isSidebarActive.value = false;
          isTouching.value = false;
          runOnJS(clearDragLetterState)();
          translateX.value = withSpring(-SCREEN_WIDTH * 2, {
            damping: 40,
            stiffness: 1500,
            overshootClamping: true,
            mass: 0.3,
          });
        }),
    [
      handleSidebarInteraction,
      clearDragLetterState,
      isSidebarActive,
      isTouching,
      touchY,
      translateX,
    ]
  );

  // Home Apps State
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

      fetchStats();
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



  const { launchAppWithTimer } = useAppLauncher();

  const handleLaunchApp = (durationMinutes: number) => {
    if (selectedApp) {
      const success = launchAppWithTimer(selectedApp, durationMinutes);
      if (success) {
        setModalVisible(false);
        setSelectedApp(null);
      }
    }
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

  const handleLockScreen = useCallback(() => {
    const success = Launcher.lockScreen();
    if (!success) {
      Alert.alert(
        'Permission Required',
        'To use double-tap to lock, please enable the Accessibility Service for Minimal Life Launcher.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Launcher.openAccessibilitySettings();
            },
          },
        ]
      );
    }
  }, []);

  // Double Tap Gesture
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .maxDistance(10)
    .runOnJS(true)
    .onEnd(() => {
      const isHome = Math.abs(translateX.value - (-SCREEN_WIDTH)) < 10;
      if (isHome) {
        handleLockScreen();
      }
    });

  // Main Navigation Pan Gesture
  const mainPanGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onStart(() => {
      if (isSidebarActive.value) return;
      context.value = { startX: translateX.value };
    })
    .onUpdate((e) => {
      if (isSidebarActive.value) return;
      const nextPos = context.value.startX + e.translationX;
      // Clamp between -SCREEN_WIDTH * 2 (All Apps) and 0 (Category)
      translateX.value = Math.max(-SCREEN_WIDTH * 2, Math.min(0, nextPos));
    })
    .onEnd((e) => {
      if (isSidebarActive.value) return;
      const currentPos = translateX.value;

      // Determine target position based on velocity and position
      let targetPos = -SCREEN_WIDTH; // Default to Home

      if (currentPos > -SCREEN_WIDTH * 0.5) {
        // Closer to Category (0)
        if (e.velocityX < -500) {
          targetPos = -SCREEN_WIDTH; // Fling left -> Home
        } else {
          targetPos = 0; // Category
        }
      } else if (currentPos < -SCREEN_WIDTH * 1.5) {
        // Closer to AllApps (-2 * width)
        if (e.velocityX > 500) {
          targetPos = -SCREEN_WIDTH; // Fling right -> Home
        } else {
          targetPos = -SCREEN_WIDTH * 2; // AllApps
        }
      } else {
        // Middle zone (Home)
        if (e.velocityX > 500) {
          targetPos = 0; // Fling right -> Category
        } else if (e.velocityX < -500) {
          targetPos = -SCREEN_WIDTH * 2; // Fling left -> AllApps
        } else {
          targetPos = -SCREEN_WIDTH; // Stay Home
        }
      }

      translateX.value = withSpring(targetPos, {
        damping: 50,
        stiffness: 1000,
        overshootClamping: true,
        mass: 0.8,
      });
    });

  const composedGesture = Gesture.Race(mainPanGesture, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
  const {
    time,
    pm,
    home,
    icon,
    don,
    footer,
    leave,
    bottom,
    dialer,
    alpha,
    date,
    dot,
    camera,
    bubblebg,
  } = fontConfig || ({} as any);

  const sidebarContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, -SCREEN_WIDTH * 0.8],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      zIndex: translateX.value > -SCREEN_WIDTH * 0.9 ? -1 : 100,
    };
  });

  return (
    <GestureHandlerRootView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#E1EAF5]'}`}>
      <StatusBar
        backgroundColor={isDarkMode ? '#0D121A' : '#E1EAF5'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        hidden={!showStatusBar}
      />

      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            { flexDirection: 'row', width: SCREEN_WIDTH * 3, height: '100%' },
            animatedStyle,
          ]}>
          <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
            <AllAppListByCategoryScreen enableGestures={false} autoFocus={false} />
          </View>
          <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
            {wallpaper && typeof wallpaper !== 'string' && (
              <Image source={wallpaper} className="absolute h-full w-full" resizeMode="cover" />
            )}
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

              {/* Header: Time, Date */}
              <View
                className={`mt-10 ${wallpaperIndex === 3 || wallpaperIndex === 10 || wallpaperIndex === 15 ? 'items-start' : 'items-center'}`}>
                <View className="flex-row items-baseline">
                  <Text
                    allowFontScaling={false}
                    style={time}
                    className={`font-regular text-[32px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#132C4D]'}`}>
                    {timeDisplay.main}
                  </Text>
                  {timeDisplay.suffix && (
                    <Text
                      allowFontScaling={false}
                      style={pm}
                      className={`font-regular ml-1 text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#132C4D]'}`}>
                      {timeDisplay.suffix}
                    </Text>
                  )}
                </View>
                <Text
                  allowFontScaling={false}
                  style={date}
                  className={`font-regular mt-1 text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#FFFFFF]' : isDarkMode ? 'text-[#728099]' : 'text-[#A4B5CC]'}`}>
                  {getFormattedDate(currentTime)}
                </Text>

              </View>

              {/* Main Actions */}
              <View className="w-full ">
                {/* Render Home Apps */}
                {wallpaperIndex === 6 ? (
                  <View className="relative w-full ">
                    {/* Vertical Line */}
                    <View
                      style={[
                        {
                          position: 'absolute',
                          left: '50%',
                          marginLeft: -0.75,
                          top: 8,
                          bottom: 8,
                          width: 1.5,
                          backgroundColor: '#4C6C99',
                          opacity: 0.8,
                        },
                        dot,
                      ]}
                    />

                    {homeApps.map((app) => (
                      <View
                        key={app.packageName}
                        className="relative mb-4 w-full flex-row items-center py-2">
                        {/* Dot container (Gutter) */}
                        <View
                          style={{
                            position: 'absolute',
                            left: '50%',
                            marginLeft: -4.5,
                            zIndex: 10,
                          }}>
                          <View
                            style={[
                              {
                                width: 10,
                                height: 10,
                                borderRadius: 4.5,
                                backgroundColor: '#4C6C99',
                                zIndex: 10,
                              },
                              dot,
                            ]}
                          />
                        </View>

                        <TouchableOpacity
                          className="ml-auto w-[40%] items-start pl-6"
                          onPress={() => {
                            if (isExcludedFromTimer(appRenames[app.packageName] || app.label)) {
                              openApplication(app.packageName);
                            } else {
                              setSelectedApp(app);
                              setModalVisible(true);
                            }
                          }}>
                          <Text
                            allowFontScaling={false}
                            style={home}
                            className={`font-regular text-[16px] tracking-wide ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#132C4D]'}`}>
                            {(appRenames[app.packageName] || app.label).length > 15
                              ? (appRenames[app.packageName] || app.label).slice(0, 15) + '...'
                              : appRenames[app.packageName] || app.label}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  homeApps.map((app) => (
                    <TouchableOpacity
                      key={app.packageName}
                      className={`w-fulL mb-4  ${wallpaperIndex === 11 || wallpaperIndex === 15 ? 'items-start ' : 'items-center'} py-2 `}
                      onPress={() => {
                        if (isExcludedFromTimer(appRenames[app.packageName] || app.label)) {
                          openApplication(app.packageName);
                        } else {
                          setSelectedApp(app);
                          setModalVisible(true);
                        }
                      }}>
                      <Text
                        allowFontScaling={false}
                        style={home}
                        className={`font-regular text-[16px] tracking-wide ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#132C4D]'}`}>
                        {(appRenames[app.packageName] || app.label).length > 15
                          ? (appRenames[app.packageName] || app.label).slice(0, 15) + '...'
                          : appRenames[app.packageName] || app.label}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}

                {/* Add Icon */}
                <Link href="/all-apps?mode=select" asChild>
                  <TouchableOpacity
                    className={`mt-4 w-full ${wallpaperIndex === 11 || wallpaperIndex === 15 ? 'items-start' : 'items-center'}`}>
                    <MaterialCommunityIcons
                      name="plus-circle-outline"
                      style={icon}
                      size={30}
                      color={
                        wallpaper && typeof wallpaper !== 'string'
                          ? '#A3B9D9'
                          : isDarkMode
                            ? '#738099'
                            : '#B8CBE5'
                      }
                    />

                    {/* do */}
                    <Text
                      allowFontScaling={false}
                      style={don}
                      className={`mt-2 text-[12px] font-light ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#405B7F]' : isDarkMode ? 'text-[#434C59]' : 'text-[#A4B5CC]'}`}>
                      Don't add unnecessary{' '}
                      {wallpaperIndex === 11 || wallpaperIndex === 15 ? '\n' : ''}addictive app!
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Footer Info */}
              <View className={`w-full ${wallpaperIndex === 15 ? 'items-start' : 'items-center'}`}>
                <View
                  className={`mb-2 gap-4 ${wallpaperIndex === 15 ? 'flex-col items-start' : 'flex-row items-center'}`}>
                  <Text
                    allowFontScaling={false}
                    style={footer}
                    className={`font-regular text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                    Today Unlock:{' '}
                    <Text
                      allowFontScaling={false}
                      style={footer}
                      className={`font-bold ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                      {todayStats.unlockCount}
                    </Text>
                  </Text>
                  {wallpaperIndex !== 15 && (
                    <Text
                      allowFontScaling={false}
                      style={footer}
                      className={`font-regular ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                      ||
                    </Text>
                  )}
                  <Text
                    allowFontScaling={false}
                    style={footer}
                    className={`font-regular text-[14px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                    Today Use:{' '}
                    <Text
                      allowFontScaling={false}
                      style={footer}
                      className={`font-bold ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                      {formatUsageTime(todayStats.totalUsageTime)}
                    </Text>
                  </Text>
                </View>
                <Text
                  allowFontScaling={false}
                  style={leave}
                  className={`mb-10 text-[12px] font-light  ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#A3B9D9]' : isDarkMode ? 'text-[#738099]' : 'text-[#405B80]'}`}>
                  Leave it! Do something{' '}
                  {wallpaperIndex === 11 || wallpaperIndex === 15 ? '\n' : ''}mindful in real world.
                </Text>

                {/* Bottom Actions: Dialer & Camera */}
                <View className="w-full flex-row gap-1">
                  <TouchableOpacity
                    onPress={openDialer}
                    style={bottom}
                    className={`flex-1 items-center justify-center rounded-full rounded-r-[30px] py-3 ${wallpaper && typeof wallpaper !== 'string' ? '' : isDarkMode ? 'border-[#131B26] bg-[#131B26]' : 'border-white bg-[#CEDDF2]'}`}>
                    {showPhoneDialer ? (
                      <Ionicons
                        name="call-outline"
                        size={24}
                        color={
                          wallpaper && typeof wallpaper !== 'string'
                            ? dialer?.color || '#E6EBF2'
                            : isDarkMode
                              ? '#CBD5E1'
                              : '#2E3A4C'
                        }
                      />
                    ) : (
                      <Text
                        allowFontScaling={false}
                        style={dialer}
                        className={`font-regula text-[18px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
                        Dialer
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={openCamera}
                    style={bottom}
                    className={`flex-1 items-center justify-center rounded-r-[30px] py-3 ${wallpaper && typeof wallpaper !== 'string' ? '' : isDarkMode ? 'bg-[#131B26]' : 'bg-[#CEDDF2]'}`}>
                    {showCameraIcon ? (
                      <Ionicons
                        name="camera-outline"
                        size={24}
                        color={
                          wallpaper && typeof wallpaper !== 'string'
                            ? dialer?.color || '#E6EBF2'
                            : isDarkMode
                              ? '#CBD5E1'
                              : '#2E3A4C'
                        }
                      />
                    ) : (
                      <Text
                        allowFontScaling={false}
                        style={wallpaperIndex === 15 ? camera : dialer}
                        className={`font-regular text-[18px] ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
                        Camera
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <AppModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedApp={selectedApp}
                onLaunch={handleLaunchApp}
                isDarkMode={isDarkMode}
                theme={fontConfig}
              />
            </View>
          </View>
          <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
            <AllApps enableGestures={false} initialLetter={allAppsLetter} showSidebar={false} />
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Sidebar Overlay - Moved to Root */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            zIndex: 100,
          },
          sidebarContainerStyle,
        ]}>
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
                style={alpha}
                itemHeight={ITEM_HEIGHT}
                enableLiquidEffect={true}
              />
            ))}
            <BubbleCursor
              touchY={touchY}
              isTouching={isTouching}
              alphabet={sidebarChars}
              isDarkMode={isDarkMode}
              style={bubblebg}
              itemHeight={ITEM_HEIGHT}
              cursorSize={CURSOR_SIZE}
              enableLiquidEffect={true}
            />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </GestureHandlerRootView>
  );
}