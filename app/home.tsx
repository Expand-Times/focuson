import { useAppLauncher } from './hooks/useAppLauncher';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Linking,
  Platform,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  AppState,
  BackHandler,
 Dimensions } from 'react-native';
import { Stack, useFocusEffect, useRouter, useNavigation } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as IntentLauncher from 'expo-intent-launcher';
import { useEffect, useState, useCallback, lazy, Suspense, useMemo, memo, useRef } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
} from 'react-native-reanimated';
import Launcher from '../modules/launcher';
import wallpaperFontConfig from './constants/wallpaperFontConfig';
import AllAppsByCategoryScreen from './all-apps-by-category';
import AllApps from './all-apps';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { openApplication } from 'expo-intent-launcher';
import { useColorContext } from './context/ColorContext';
import { useAppContext } from './context/AppContext';
import AppModal from './context/Modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { BlockedInfoModal } from './components/BlockModals';

const SelectAppModal = lazy(() =>
  import('./components/SelectAppModal').then((m) => ({ default: m.SelectAppModal }))
);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatUsageTime = (millis: number) => {
  const minutes = Math.floor(millis / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const getFormattedTime = (date: Date, timeFormat: string) => {
  const h = date.getHours();
  const m = date.getMinutes();
  const z = (n: number) => n.toString().padStart(2, '0');
  let format = timeFormat;
  if (format === 'HH:MM PM' || format === 'HH:MM:SS PM') format = '12h PM';
  if (format === 'HH:MM' || format === 'HH:MM:SS') format = '24h';
  const h12 = h % 12 || 12;
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (format === '12h' || format === '12h PM') return { main: `${h12}:${z(m)}`, suffix: ` ${suffix}` };
  if (format === '24h' || format === '24h PM') return { main: `${z(h)}:${z(m)}`, suffix: '' };
  return { main: `${z(h)}:${z(m)}`, suffix: '' };
};

const getFormattedDate = (date: Date, dateFormat: string) => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  const yy = y.toString().slice(-2);
  const mon = MONTH_NAMES[date.getMonth()];
  const dayName = WEEKDAY_NAMES[date.getDay()];
  const z = (n: number) => n.toString().padStart(2, '0');
  if (dateFormat === 'weekday, day month year') return `${dayName}, ${d} ${mon} ${y}`;
  let datePart = '';
  switch (dateFormat) {
    case 'DD:MM:YYYY': datePart = `${z(d)}:${z(m)}:${y}`; break;
    case 'DD:MM:YY': datePart = `${z(d)}:${z(m)}:${yy}`; break;
    case 'MM:DD:YYYY': datePart = `${z(m)}:${z(d)}:${y}`; break;
    case 'MM:DD:YY': datePart = `${z(m)}:${z(d)}:${yy}`; break;
    case 'DD:Mon:YYYY': datePart = `${z(d)} ${mon} ${y}`; break;
    case 'Mon:DD:YYYY': datePart = `${mon} ${z(d)}, ${y}`; break;
    case 'day month year': datePart = `${d} ${mon} ${y}`; break;
    case 'day/month/year': datePart = `${z(d)}/${z(m)}/${y}`; break;
    case 'month/day/year': datePart = `${z(m)}/${z(d)}/${y}`; break;
    case 'year-month-day': datePart = `${y}-${z(m)}-${z(d)}`; break;
    default: return dateFormat;
  }
  return `${dayName}, ${datePart}`;
};

const ClockWidget = memo(({
  timeOffset, timeFormat, dateFormat, isDarkMode, wallpaper, wallpaperIndex, time, pm, date,
}: any) => {
  const [currentTime, setCurrentTime] = useState(new Date(Date.now() + (timeOffset || 0)));

  useEffect(() => {
    setCurrentTime(new Date(Date.now() + (timeOffset || 0)));
    const timer = setInterval(() => setCurrentTime(new Date(Date.now() + (timeOffset || 0))), 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

  const isImageWallpaper = wallpaper && typeof wallpaper !== 'string';
  const timeDisplay = getFormattedTime(currentTime, timeFormat);

  return (
    <View
      className={`mt-10 ${wallpaperIndex === 3 || wallpaperIndex === 10 || wallpaperIndex === 15 || wallpaperIndex === 19 ? 'items-start' : 'items-center'}`}>
      <View className="flex-row  items-baseline">
        <Text
          allowFontScaling={false}
          style={time}
          className={`font-regular  text-[36px] ${isImageWallpaper ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#132C4D]'}`}>
          {timeDisplay.main}
        </Text>
        {timeDisplay.suffix ? (
          <Text
            allowFontScaling={false}
            style={pm}
            className={`font-regular ml-1 text-[14px] ${isImageWallpaper ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#132C4D]'}`}>
            {timeDisplay.suffix}
          </Text>
        ) : null}
      </View>
      <Text
        allowFontScaling={false}
        style={date}
        className={`font-regular mt-1 text-[14px] ${isImageWallpaper ? 'text-[#FFFFFF]' : isDarkMode ? 'text-[#728099]' : 'text-[#A4B5CC]'}`}>
        {getFormattedDate(currentTime, dateFormat)}
      </Text>
    </View>
  );
});

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    homeApps,
    updateHomeApps,
    appRenames,
    hiddenApps,
    isExcludedFromTimer,
    isTemporarilyBlocked,
    timedBlocks,
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

  const [todayStats, setTodayStats] = useState({ totalUsageTime: 0, unlockCount: 0 });

  // Tutorial State
  // 0: Swipe Left (Home -> All Apps)
  // 1: Wait for return to Home (All Apps -> Home)
  // 2: Swipe Right (Home -> Category)
  // 3: Wait for return to Home (Category -> Home)
  // 4: Swipe Down (Quick Settings)
  // 5: Tap and Hold (Settings Screen)
  // 6: Double Tap (Lock Screen)
  // 7: Done
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const hasShown = await AsyncStorage.getItem('hasShownTutorial_v5');
      if (!hasShown) {
        // Load saved step if exists
        const savedStep = await AsyncStorage.getItem('tutorialStep_v5');
        if (savedStep) {
          setTutorialStep(parseInt(savedStep));
        }
        setShowTutorial(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateTutorialStep = (step: number) => {
    // Only allow moving forward
    if (step > tutorialStep) {
      setTutorialStep(step);
      AsyncStorage.setItem('tutorialStep_v5', step.toString());
      if (step === 7) {
        handleTutorialComplete();
      }
    }
  };

  const handleTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem('hasShownTutorial_v5', 'true');
      setShowTutorial(false);
    } catch (e) {
      console.error(e);
    }
  };

  const translateX = useSharedValue(-SCREEN_WIDTH);
  const context = useSharedValue({ startX: 0 });
  const showTutorialSV = useSharedValue(false);
  const tutorialStepSV = useSharedValue(0);

  // Sync tutorial state to shared values
  useEffect(() => {
    showTutorialSV.value = showTutorial;
    tutorialStepSV.value = tutorialStep;
  }, [showTutorial, tutorialStep]);

  // Track Tutorial Progress
  useAnimatedReaction(
    () => translateX.value,
    (currentX) => {
      if (!showTutorial) return;

      // Step 0: Swipe Left (Home -> All Apps)
      // Target: translateX approaches -2 * SCREEN_WIDTH
      if (tutorialStep === 0 && currentX < -SCREEN_WIDTH * 1.5) {
        runOnJS(updateTutorialStep)(1);
      }

      // Step 1: Wait for return to Home (All Apps -> Home)
      // Target: translateX approaches -SCREEN_WIDTH
      if (tutorialStep === 1 && currentX > -SCREEN_WIDTH * 1.1) {
        runOnJS(updateTutorialStep)(2);
      }

      // Step 2: Swipe Right (Home -> Category)
      // Target: translateX approaches 0
      if (tutorialStep === 2 && currentX > -SCREEN_WIDTH * 0.5) {
        runOnJS(updateTutorialStep)(3);
      }

      // Step 3: Wait for return to Home (Category -> Home)
      // Target: translateX approaches -SCREEN_WIDTH
      if (tutorialStep === 3 && currentX < -SCREEN_WIDTH * 0.9) {
        runOnJS(updateTutorialStep)(5);
      }
    },
    [showTutorial, tutorialStep]
  );

  // Home Apps State
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectAppModalVisible, setSelectAppModalVisible] = useState(false);
  const [isSelectAppLoading, setIsSelectAppLoading] = useState(false);
  const [blockedInfoVisible, setBlockedInfoVisible] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [isDefaultLauncher, setIsDefaultLauncher] = useState(true);
  const [sidesReady, setSidesReady] = useState(false);

  // Defer mounting of side panels so the home screen renders fast on startup
  useEffect(() => {
    const t = setTimeout(() => setSidesReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  // JS-side safety net for the launcher-role transition: when the user picks
  // FocusOn in the Android home-picker and returns, the activity can be
  // recreated while the JS context survives, orphaning expo-router's module
  // state. If we observe the default-launcher flag flipping false → true on
  // resume, we trigger a clean native reload so the new tree starts fresh.
  // (The native MainActivity.onCreate also catches this on most devices; this
  // is a belt-and-suspenders safety net for cases where the recreation
  // doesn't actually trigger a fresh onCreate.)
  const wasDefaultRef = useRef<boolean | null>(null);
  useEffect(() => {
    try { wasDefaultRef.current = Launcher.isDefaultLauncher(); } catch { /* ignore */ }
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return;
      try {
        const isNow = Launcher.isDefaultLauncher();
        if (wasDefaultRef.current === false && isNow === true) {
          Launcher.reloadApp();
          return;
        }
        wasDefaultRef.current = isNow;
      } catch { /* ignore */ }
    });
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      translateX.value = -SCREEN_WIDTH;
    }, [])
  );

  // Swallow the hardware/gesture back on the home screen. The launcher IS the
  // root — back has nowhere to go. Returning true here stops the event before
  // it reaches React Navigation's container handler or the native activity,
  // so Android (especially MIUI/Xiaomi, which is aggressive about killing the
  // launcher activity on back) never gets a chance to finish-and-relaunch us.
  // Registered via useFocusEffect so it only fires while home is focused;
  // other screens keep their normal back behavior.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          const [stats, isDefault] = await Promise.all([
            Promise.resolve(Launcher.getTodayUsageStats()),
            Promise.resolve(Launcher.isDefaultLauncher()),
          ]);
          setTodayStats(stats as any);
          setIsDefaultLauncher(isDefault as boolean);
        } catch (e) {
          console.error('Failed to fetch stats or check default launcher', e);
        }
      };

      fetchStats();
      // Update stats every minute while focused
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }, [])
  );


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
      const isHome = Math.abs(translateX.value - -SCREEN_WIDTH) < 10;
      if (isHome) {
        if (showTutorial && tutorialStep === 6) {
          updateTutorialStep(7);
        }
        handleLockScreen();
      }
    });

  // Main Navigation Pan Gesture (Horizontal and Vertical)
  const homePanGesture = Gesture.Pan()
    .minDistance(30)
    .onStart(() => {
      context.value = { startX: translateX.value };
    })
    .onUpdate((e) => {
      // Horizontal page swipe (only if horizontal movement is dominant)
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        let nextPos = context.value.startX + e.translationX;

        // Tutorial Constraints
        if (showTutorialSV.value) {
          if (tutorialStepSV.value <= 1) {
            // Step 0 & 1: All Apps <-> Home
            nextPos = Math.max(-SCREEN_WIDTH * 2, Math.min(-SCREEN_WIDTH, nextPos));
          } else if (tutorialStepSV.value === 2 || tutorialStepSV.value === 3) {
            // Step 2 & 3: Home <-> Category
            nextPos = Math.max(-SCREEN_WIDTH, Math.min(0, nextPos));
          } else if (tutorialStepSV.value >= 4 && tutorialStepSV.value <= 6) {
            // Step 4, 5, 6: Lock to Home Screen
            nextPos = -SCREEN_WIDTH;
          }
        }

        // Clamp between -SCREEN_WIDTH * 2 (All Apps) and 0 (Category)
        translateX.value = Math.max(-SCREEN_WIDTH * 2, Math.min(0, nextPos));
      }
    })
    .onEnd((e) => {
      // Handle Horizontal Page Swipe Snap
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        const currentPos = translateX.value;
        let targetPos = -SCREEN_WIDTH;

        if (currentPos > -SCREEN_WIDTH * 0.5) {
          targetPos = e.velocityX < -500 ? -SCREEN_WIDTH : 0;
        } else if (currentPos < -SCREEN_WIDTH * 1.5) {
          targetPos = e.velocityX > 500 ? -SCREEN_WIDTH : -SCREEN_WIDTH * 2;
        } else {
          if (e.velocityX > 500) targetPos = 0;
          else if (e.velocityX < -500) targetPos = -SCREEN_WIDTH * 2;
          else targetPos = -SCREEN_WIDTH;
        }

        // Tutorial Constraints
        if (showTutorialSV.value) {
          if (tutorialStepSV.value <= 1) {
            // Step 0 & 1: All Apps <-> Home
            targetPos = Math.max(-SCREEN_WIDTH * 2, Math.min(-SCREEN_WIDTH, targetPos));
          } else if (tutorialStepSV.value === 2 || tutorialStepSV.value === 3) {
            // Step 2 & 3: Home <-> Category
            targetPos = Math.max(-SCREEN_WIDTH, Math.min(0, targetPos));
          } else if (tutorialStepSV.value >= 4 && tutorialStepSV.value <= 6) {
            // Step 4, 5, 6: Lock to Home Screen
            targetPos = -SCREEN_WIDTH;
          }
        }

        translateX.value = withSpring(targetPos, {
          damping: 50,
          stiffness: 1000,
          overshootClamping: true,
          mass: 0.8,
        });
      } else {
        // Reset to Home if it wasn't a horizontal swipe
        translateX.value = withSpring(-SCREEN_WIDTH);
      }
    });

  // Long Press Gesture
  const longPress = Gesture.LongPress()
    .minDuration(500)
    .runOnJS(true)
    .onStart(() => {
      const isHome = Math.abs(translateX.value - -SCREEN_WIDTH) < 10;
      if (isHome) {
        if (showTutorial && tutorialStep === 5) {
          updateTutorialStep(6);
        }
        // Use navigation.navigate (target-less) instead of router.push so the
        // PUSH action doesn't carry a navigator-key target that can go stale
        // during launcher lifecycle churn — which caused:
        //   "The action 'PUSH' ... was not handled by any navigator".
        navigation.navigate('settingScreen' as never);
      }
    });

  const composedGesture = Gesture.Race(doubleTap, longPress, homePanGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fontConfig = useMemo(
    () => (wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null),
    [wallpaperIndex]
  );
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
    date,
    dot,
    camera,
  } = fontConfig || ({} as any);

  const visibleHomeApps = useMemo(
    () => homeApps.filter((app) => !hiddenApps.includes(app.packageName)),
    [homeApps, hiddenApps]
  );

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
            {sidesReady && <AllAppsByCategoryScreen enableGestures={false} autoFocus={false} />}
          </View>
          <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
            {wallpaper && typeof wallpaper !== 'string' && (
              <Image source={wallpaper} className="absolute h-full w-full" resizeMode="cover" />
            )}
            <View
              pointerEvents={showTutorial ? 'box-only' : 'auto'}
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
              <ClockWidget
                timeOffset={timeOffset}
                timeFormat={timeFormat}
                dateFormat={dateFormat}
                isDarkMode={isDarkMode}
                wallpaper={wallpaper}
                wallpaperIndex={wallpaperIndex}
                time={time}
                pm={pm}
                date={date}
              />

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

                    {visibleHomeApps.map((app) => (
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
                            if (isTemporarilyBlocked(app.packageName)) {
                              setSelectedApp(app);
                              setBlockedUntil(timedBlocks[app.packageName] || null);
                              setBlockedInfoVisible(true);
                            } else if (isExcludedFromTimer(app.packageName)) {
                              openApplication(app.packageName);
                            } else {
                              setSelectedApp(app);
                              setModalVisible(true);
                            }
                          }}
                          onLongPress={() => {
                            Alert.alert(
                              'Remove Shortcut',
                              `Do you want to remove ${appRenames[app.packageName] || app.label} from home screen?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Remove',
                                  style: 'destructive',
                                  onPress: async () => {
                                    const updated = homeApps.filter(a => a.packageName !== app.packageName);
                                    await updateHomeApps(updated);
                                  }
                                }
                              ]
                            );
                          }}
                        >
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
                  visibleHomeApps.map((app) => (
                    <TouchableOpacity
                      key={app.packageName}
                      className={`w-fulL mb-4  ${wallpaperIndex === 11 || wallpaperIndex === 15 ? 'items-start ' : 'items-center'} py-2 `}
                      onPress={() => {
                        if (isTemporarilyBlocked(app.packageName)) {
                          setSelectedApp(app);
                          setBlockedUntil(timedBlocks[app.packageName] || null);
                          setBlockedInfoVisible(true);
                        } else if (isExcludedFromTimer(app.packageName)) {
                          openApplication(app.packageName);
                        } else {
                          setSelectedApp(app);
                          setModalVisible(true);
                        }
                      }}
                      onLongPress={() => {
                        Alert.alert(
                          'Remove Shortcut',
                          `Do you want to remove ${appRenames[app.packageName] || app.label} from home screen?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: async () => {
                                const updated = homeApps.filter(a => a.packageName !== app.packageName);
                                await updateHomeApps(updated);
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={home}
                        className={`font-regular text-[17px] tracking-wide ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#E6EBF2]' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#132C4D]'}`}>
                        {(appRenames[app.packageName] || app.label).length > 15
                          ? (appRenames[app.packageName] || app.label).slice(0, 15) + '...'
                          : appRenames[app.packageName] || app.label}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}

                {/* Add Icon */}
                <Pressable
                  className={`mt-4 w-full ${wallpaperIndex === 11 || wallpaperIndex === 15 ? 'items-start' : 'items-center'}`}
                  onPress={() => {
                    setIsSelectAppLoading(true);
                    setSelectAppModalVisible(true);
                  }}
                  disabled={isSelectAppLoading}
                  style={({ pressed }) => ({
                    opacity: pressed || isSelectAppLoading ? 0.5 : 1,
                    transform: [{ scale: pressed ? 0.93 : 1 }],
                  })}>
                  {isSelectAppLoading ? (
                    <ActivityIndicator
                      size={30}
                      color={
                        wallpaper && typeof wallpaper !== 'string'
                          ? '#A3B9D9'
                          : isDarkMode
                            ? '#738099'
                            : '#B8CBE5'
                      }
                    />
                  ) : (
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
                  )}

                  <Text
                    allowFontScaling={false}
                    style={don}
                    className={`mt-2 text-[12px] font-light ${wallpaper && typeof wallpaper !== 'string' ? 'text-[#405B7F]' : isDarkMode ? 'text-[#434C59]' : 'text-[#A4B5CC]'}`}>
                    {isSelectAppLoading ? 'Loading...' : "Don't add unnecessary"}
                    {wallpaperIndex === 11 || wallpaperIndex === 15 ? '\n' : ' '}
                    {isSelectAppLoading ? '' : 'addictive app!'}
                  </Text>
                </Pressable>
              </View>

              {/* Set as Default Launcher */}
              

              {/* Footer Info */}
              <View className={`w-full ${wallpaperIndex === 15 ? 'items-start' : 'items-center'}`}>
                {!isDefaultLauncher && (
                <View
                  className={`mt-6 mb-2 w-full ${wallpaperIndex === 11 || wallpaperIndex === 15 ? 'items-start' : 'items-center'}`}>
                  <TouchableOpacity
                    className={`rounded-full border px-4 py-2 ${
                      wallpaper && typeof wallpaper !== 'string'
                        ? 'border-[#E6EBF2] bg-[#E6EBF2]/10'
                        : isDarkMode
                          ? 'border-[#738099] bg-[#738099]/10'
                          : 'border-[#405B80] bg-[#405B80]/10'
                    }`}
                    onPress={() => {
                      try {
                        Launcher.openHomeSettings();
                      } catch (e) {
                        console.error('Failed to open home settings', e);
                      }
                    }}>
                    <Text
                      allowFontScaling={false}
                      className={`text-[13px] font-medium ${
                        wallpaper && typeof wallpaper !== 'string'
                          ? 'text-[#E6EBF2]'
                          : isDarkMode
                            ? 'text-[#DADFE5]'
                            : 'text-[#405B80]'
                      }`}>
                      Set as Default Launcher
                    </Text>
                  </TouchableOpacity>
                </View>
                )}
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
              <BlockedInfoModal
                visible={blockedInfoVisible}
                onClose={() => setBlockedInfoVisible(false)}
                isDarkMode={isDarkMode}
                theme={fontConfig}
                appLabel={selectedApp?.label}
                unblockAt={blockedUntil}
                appIconBase64={selectedApp?.icon}
              />

              {selectAppModalVisible && (
                <Suspense fallback={null}>
                  <SelectAppModal
                    visible={selectAppModalVisible}
                    onClose={() => {
                      setSelectAppModalVisible(false);
                      setIsSelectAppLoading(false);
                    }}
                    onLoaded={() => setIsSelectAppLoading(false)}
                  />
                </Suspense>
              )}

              {/* Tutorial Overlay inside Home Screen View */}
              {showTutorial && (
                <View
                  pointerEvents="none"
                  className="absolute inset-0 z-[200] items-center justify-center bg-transparent">
                  {/* Step 0: Swipe Left (Show on Home) */}
                  {tutorialStep === 0 && (
                    <View className="items-center rounded-3xl bg-transparent p-6">
                      <LottieView
                        autoPlay
                        loop
                        source={require('../assets/Animation/dragleft.json')}
                        style={{ width: 96, height: 96 }}
                      />
                      <Text
                        className={`mt-4 text-2xl font-bold italic ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        Swipe Left
                      </Text>
                      <Text
                        className={`font-regular mt-2 justify-center text-center text-base ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        To see All Apps list
                      </Text>
                    </View>
                  )}

                  {/* Step 2: Swipe Right (Show on Home) */}
                  {tutorialStep === 2 && (
                    <View className="items-center rounded-3xl bg-transparent p-6">
                      <LottieView
                        autoPlay
                        loop
                        source={require('../assets/Animation/dragright.json')}
                        style={{ width: 96, height: 96 }}
                      />
                      <Text
                        className={`mt-4 text-2xl font-bold italic ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        Swipe Right
                      </Text>
                      <Text
                        className={`font-regular mt-2 justify-center text-center text-base ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        To see Apps list by Category
                      </Text>
                    </View>
                  )}

                  {/* Step 3: Wait for return to Home */}
                  {tutorialStep === 3 && (
                    <View className="items-center rounded-3xl bg-transparent p-6">
                      <LottieView
                        autoPlay
                        loop
                        source={require('../assets/Animation/dragleft.json')}
                        style={{ width: 96, height: 96 }}
                      />
                      <Text
                        className={`mt-4 text-2xl font-bold italic ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        Swipe Left
                      </Text>
                      <Text
                        className={`font-regular mt-2 justify-center text-center text-base ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        To return to Home Screen
                      </Text>
                    </View>
                  )}

                  {/* Step 5: Tap and Hold (Show on Home) */}
                  {tutorialStep === 5 && (
                    <View className="items-center rounded-3xl bg-transparent p-6">
                      <LottieView
                        autoPlay
                        loop
                        source={require('../assets/Animation/TapHold.json')}
                        style={{ width: 96, height: 96 }}
                      />
                      <Text
                        className={`mt-4 text-2xl font-bold italic ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        Tap and Hold
                      </Text>
                      <Text
                        className={`font-regular mt-2 justify-center text-center text-base ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        To open Settings Screen
                      </Text>
                    </View>
                  )}

                  {/* Step 6: Double Tap (Show on Home) */}
                  {tutorialStep === 6 && (
                    <View className="items-center rounded-3xl bg-transparent p-6">
                      <LottieView
                        autoPlay
                        loop
                        source={require('../assets/Animation/doubletapE.json')}
                        style={{ width: 96, height: 96 }}
                      />
                      <Text
                        className={`mt-4 text-2xl font-bold italic ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        Double Tap
                      </Text>
                      <Text
                        className={`font-regular mt-2 justify-center text-center text-base ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}
                        allowFontScaling={false}>
                        To Lock or Unlock Screen
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
          <View style={{ width: SCREEN_WIDTH, height: '100%' }}>
            {sidesReady && <AllApps enableGestures={false} />}
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}