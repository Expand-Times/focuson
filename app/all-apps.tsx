import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  useColorScheme,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
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
import { useState, useEffect, useMemo, useRef } from 'react';
import Launcher from '../modules/launcher';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { openApplication } from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useColorContext } from './context/ColorContext';
import wallpaperFontConfig from './constants/wallpaperFontConfig';
const ITEM_HEIGHT = 20;

const SidebarItem = ({
  letter,
  index,
  touchY,
  isTouching,
  onSelect,
  isDarkMode,
  currentLetter,
  isImageWallpaper,
  alphaside,
}: {
  letter: string;
  index: number;
  touchY: SharedValue<number>;
  isTouching: SharedValue<boolean>;
  onSelect: (letter: string) => void;
  isDarkMode: boolean;
  isImageWallpaper?: boolean;
  currentLetter: string;
  alphaside?: any;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const itemY = index * ITEM_HEIGHT + ITEM_HEIGHT / 2;
    const dist = Math.abs(touchY.value - itemY);

    const translateX = interpolate(dist, [0, 60], [-40, 0], Extrapolation.CLAMP);

    const scale = interpolate(dist, [0, 60], [2, 1], Extrapolation.CLAMP);

    return {
      transform: [
        { translateX: withSpring(isTouching.value ? translateX : 0) },
        { scale: withSpring(isTouching.value ? scale : 1) },
      ],
      zIndex: isTouching.value && dist < 30 ? 100 : 1,
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
          style={alphaside}
          className={`text-[12px] font-medium ${
            currentLetter === letter
              ? isImageWallpaper
                ? 'text-[16px] font-bold text-white'
                : isDarkMode
                  ? 'text-[16px] font-bold text-[#738099]'
                  : 'text-[14px] font-extrabold text-[#405B80]'
              : isImageWallpaper
                ? 'text-white'
                : isDarkMode
                  ? 'text-[#738099]'
                  : 'text-[#405B80]'
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
  bubblebg,
}: {
  touchY: SharedValue<number>;
  isTouching: SharedValue<boolean>;
  letter: string;
  isDarkMode: boolean;
  bubblebg?: any;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: touchY.value - 25 }, // Center vertically (50/2)
        { scale: withSpring(isTouching.value ? 1 : 0) },
        { translateX: withSpring(isTouching.value ? -50 : 0) },
      ],
      opacity: withSpring(isTouching.value ? 1 : 0),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: 30, // Position to the left of the sidebar
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: isDarkMode ? '#212C40' : '#fff', // Green color like in screenshot
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        bubblebg,
        animatedStyle,
      ]}>
      <Text style={bubblebg} className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{letter}</Text>
    </Animated.View>
  );
};

export default function AllApps() {
  const { isDarkMode, wallpaper, wallpaperIndex, showStatusBar, showUsageInfo } = useColorContext();
  const isImageWallpaper = wallpaper && typeof wallpaper !== 'string';
  // wallpaper
  const fontConfig = wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null;
  const {
    searchbg,
    searchi,
    appdu,
    applist,
    alphaside,
    applistbg,
    header,
    select,
    numberbg,
    number,
    toggle,
    when,
    remind,
    quit,
    modalbg,
    quitbg,
    bordert,
    open,
    togglei,
    appC,
    applistCbg,
    allappt,
    tikbg,
    allappi,
    searchCt,
    searchCi,
    wallbg,
    bubblebg
  } = fontConfig || ({} as any);

  const colorScheme = useColorScheme();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Selection Mode State
  const [selectedPackageNames, setSelectedPackageNames] = useState<string[]>([]);

  // New State for Features
  const [pinnedPackageNames, setPinnedPackageNames] = useState<string[]>([]);
  const [blockedPackageNames, setBlockedPackageNames] = useState<string[]>([]);
  const [appRenames, setAppRenames] = useState<Record<string, string>>({});
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  // Time Over Settings State
  const [showTimeOverSettings, setShowTimeOverSettings] = useState(false);
  const [timeOverAction, setTimeOverAction] = useState<'mindful' | 'remind' | 'quit'>('remind');
  const [secondWarning, setSecondWarning] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const isSelectMode = params.mode === 'select';

  const sectionListRef = useRef<SectionList>(null);

  useEffect(() => {
    loadApps();
    loadSettings();
    if (isSelectMode) {
      loadSelectedApps();
    }
  }, [isSelectMode]);

  const loadSettings = async () => {
    try {
      const pinned = await AsyncStorage.getItem('pinnedApps');
      if (pinned) setPinnedPackageNames(JSON.parse(pinned));

      const blocked = await AsyncStorage.getItem('blockedApps');
      if (blocked) setBlockedPackageNames(JSON.parse(blocked));

      const renames = await AsyncStorage.getItem('appRenames');
      if (renames) setAppRenames(JSON.parse(renames));
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const loadSelectedApps = async () => {
    try {
      const stored = await AsyncStorage.getItem('homeApps');
      if (stored) {
        const parsed: AppItem[] = JSON.parse(stored);
        setSelectedPackageNames(parsed.map((a) => a.packageName));
      }
    } catch (e) {
      console.error('Failed to load home apps', e);
    }
  };

  const handleSaveSelection = async () => {
    try {
      // Filter the full apps list to get the full AppItem objects for selected packages
      const selectedAppItems = apps.filter((app) => selectedPackageNames.includes(app.packageName));
      await AsyncStorage.setItem('homeApps', JSON.stringify(selectedAppItems));
      router.back();
    } catch (e) {
      console.error('Failed to save selection', e);
    }
  };

  const loadApps = async () => {
    try {
      const installedApps = Launcher.getInstalledApps();
      // Sort alphabetically
      const sorted = installedApps.sort((a, b) => a.label.localeCompare(b.label));
      setApps(sorted);
    } catch (error) {
      console.error('Failed to load apps:', error);
    }
  };

  const sections = useMemo(() => {
    if (!apps.length) return [];

    // Filter blocked apps
    const visibleApps = apps.filter((app) => !blockedPackageNames.includes(app.packageName));

    // Separate pinned and unpinned, and apply renames
    const pinned: AppItem[] = [];
    const unpinned: AppItem[] = [];

    visibleApps.forEach((app) => {
      // Apply rename
      const rename = appRenames[app.packageName];
      const displayApp = rename ? { ...app, label: rename } : app;

      if (pinnedPackageNames.includes(app.packageName)) {
        pinned.push(displayApp);
      } else {
        unpinned.push(displayApp);
      }
    });

    // Sort pinned
    pinned.sort((a, b) => a.label.localeCompare(b.label));

    // Group unpinned
    const grouped = unpinned.reduce(
      (acc, app) => {
        const firstChar = app.label.charAt(0).toUpperCase();
        const key = /^[A-Z]/.test(firstChar) ? firstChar : '#';

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(app);
        return acc;
      },
      {} as Record<string, AppItem[]>
    );

    // Convert to SectionList format and sort keys
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });

    let result = sortedKeys.map((key) => ({
      title: key,
      data: grouped[key],
    }));

    // Add Pinned Section at top
    if (pinned.length > 0) {
      result.unshift({
        title: '*',
        data: pinned,
      });
    }

    if (searchQuery) {
      result = result
        .map((section) => ({
          ...section,
          data: section.data.filter((app) =>
            app.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section.data.length > 0);
    }

    return result;
  }, [apps, searchQuery, pinnedPackageNames, blockedPackageNames, appRenames]);

  const handleAppPress = (app: AppItem) => {
    if (isSelectMode) {
      if (selectedPackageNames.includes(app.packageName)) {
        // Deselect
        setSelectedPackageNames((prev) => prev.filter((p) => p !== app.packageName));
      } else {
        // Select
        if (selectedPackageNames.length >= 6) {
          Alert.alert('Limit Reached', 'You cannot add more than 6 apps.');
          return;
        }
        setSelectedPackageNames((prev) => [...prev, app.packageName]);
      }
    } else {
      setSelectedApp(app);
      setModalVisible(true);
    }
  };

  const handleAppLongPress = (app: AppItem) => {
    if (!isSelectMode) {
      setSelectedApp(app);
      setOptionsModalVisible(true);
    }
  };

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

  const handleAddToHome = async () => {
    if (!selectedApp) return;
    try {
      const stored = await AsyncStorage.getItem('homeApps');
      let currentHomeApps: AppItem[] = stored ? JSON.parse(stored) : [];

      if (currentHomeApps.length >= 6) {
        Alert.alert('Limit Reached', 'Home screen is full (max 6 apps).');
        return;
      }

      if (currentHomeApps.some((a) => a.packageName === selectedApp.packageName)) {
        Alert.alert('Already Added', 'This app is already on the home screen.');
        return;
      }

      currentHomeApps.push(selectedApp);
      await AsyncStorage.setItem('homeApps', JSON.stringify(currentHomeApps));
      setOptionsModalVisible(false);
      router.push('/home');
    } catch (e) {
      console.error(e);
    }
  };

  const handlePinToTop = async () => {
    if (!selectedApp) return;
    try {
      let newPinned = [...pinnedPackageNames];
      if (newPinned.includes(selectedApp.packageName)) {
        newPinned = newPinned.filter((p) => p !== selectedApp.packageName);
      } else {
        newPinned.push(selectedApp.packageName);
      }
      setPinnedPackageNames(newPinned);
      await AsyncStorage.setItem('pinnedApps', JSON.stringify(newPinned));
      setOptionsModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlock = async () => {
    if (!selectedApp) return;
    Alert.alert('Block App', `Are you sure you want to block ${selectedApp.label}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            const newBlocked = [...blockedPackageNames, selectedApp.packageName];
            setBlockedPackageNames(newBlocked);
            await AsyncStorage.setItem('blockedApps', JSON.stringify(newBlocked));
            setOptionsModalVisible(false);
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const handleRename = () => {
    if (!selectedApp) return;
    setNewName(selectedApp.label);
    setRenameModalVisible(true);
    setOptionsModalVisible(false);
  };

  const saveRename = async () => {
    if (!selectedApp) return;
    try {
      const newRenames = { ...appRenames, [selectedApp.packageName]: newName };
      setAppRenames(newRenames);
      await AsyncStorage.setItem('appRenames', JSON.stringify(newRenames));
      setRenameModalVisible(false);
      setOptionsModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAppInfo = async () => {
    if (!selectedApp) return;
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        {
          data: 'package:' + selectedApp.packageName,
        }
      );
      setOptionsModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUninstall = async () => {
    if (!selectedApp) return;
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.DELETE', {
        data: 'package:' + selectedApp.packageName,
      });
      setOptionsModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: AppItem }) => {
    const formatUsageTime = (millis?: number) => {
      if (!millis) return '0 min';
      const hours = Math.floor(millis / (1000 * 60 * 60));
      const minutes = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes} min`;
    };

    const usageText = formatUsageTime(item.usageTime);
    const isSelected = selectedPackageNames.includes(item.packageName);

    return (
      <TouchableOpacity
        style={applistbg}
        className={`mb-2  w-full flex-row items-center justify-between rounded-xl px-4 py-3  ${
          isImageWallpaper ? '' : isDarkMode ? 'bg-[#131B26]' : 'bg-[#CEDDF2]'
        } ${isSelectMode && isSelected ? '' : ''}`}
        onPress={() => handleAppPress(item)}
        onLongPress={() => handleAppLongPress(item)}
        delayLongPress={300}>
        <View className="flex-1 flex-row items-center">
          {isSelectMode && (
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={20}
              color={
                applist?.color || (isImageWallpaper ? 'white' : isDarkMode ? '#DADFE5' : '#142C4D')
              }
              style={[{ marginRight: 8 }, applist]}
            />
          )}
          {wallpaperIndex === 6 && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#132C4D',
                marginRight: 8,
                opacity: 0.8,
              }}
            />
          )}
          <Text
            allowFontScaling={false}
            style={applist}
            className={`font-regular text-[16px] ${
              isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#142C4D]'
            }`}
            numberOfLines={1}>
            {item.label.length > 15 ? `${item.label.slice(0, 15)}...` : item.label}
          </Text>
        </View>

        {showUsageInfo && (
          <View className="flex-row items-center">
            <Text
              allowFontScaling={false}
              style={appdu}
              className={`text-[10px] font-light ${
                isImageWallpaper ? 'text-slate-300' : isDarkMode ? 'text-[#728099]' : 'text-[#4D6D99]'
              } opacity-90`}>
              TO: {item.launchCount || 0} times || DU: {usageText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const sidebarChars = useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const hasNonAlpha = apps.some((app) => !/^[a-zA-Z]/.test(app.label));
    let result = [...chars];
    if (hasNonAlpha) {
      result.unshift('#');
    }
    if (pinnedPackageNames.length > 0) {
      result.unshift('*');
    }
    return result;
  }, [apps, pinnedPackageNames]);

  const [currentLetter, setCurrentLetter] = useState('');

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Find the first section header or item
      const firstItem = viewableItems[0];
      if (firstItem.item && firstItem.section) {
        // It's an item
        const sectionTitle = firstItem.section.title;
        setCurrentLetter(sectionTitle);
      } else if (firstItem.title) {
        // It's a header (though viewableItems usually returns items)
        // Actually SectionList viewableItems includes headers if they are items?
        // Typically it's safer to check item.section.title
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10,
  }).current;

  const scrollToLetter = (letter: string) => {
    setDragLetter(letter);
    // Optimistically update
    setCurrentLetter(letter);

    // Find section index
    const sectionIndex = sections.findIndex((s) => s.title === letter);

    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: false, // Smooth scrolling can be buggy with large lists during drag
        viewOffset: 0,
        viewPosition: 0,
      });
    }
  };

  const touchY = useSharedValue(0);
  const isTouching = useSharedValue(false);
  const lastScrolledLetter = useRef('');
  const [dragLetter, setDragLetter] = useState('');

  const handleGestureScroll = (letter: string) => {
    setDragLetter(letter);
    if (lastScrolledLetter.current !== letter) {
      lastScrolledLetter.current = letter;
      scrollToLetter(letter);
    }
  };

  const sidebarGesture = Gesture.Pan()
    .onBegin((e) => {
      isTouching.value = true;
      touchY.value = e.y;
      const index = Math.floor(e.y / ITEM_HEIGHT);
      if (index >= 0 && index < sidebarChars.length) {
        runOnJS(handleGestureScroll)(sidebarChars[index]);
      }
    })
    .onUpdate((e) => {
      touchY.value = e.y;
      const index = Math.floor(e.y / ITEM_HEIGHT);
      if (index >= 0 && index < sidebarChars.length) {
        runOnJS(handleGestureScroll)(sidebarChars[index]);
      }
    })
    .onFinalize(() => {
      isTouching.value = false;
      touchY.value = -100;
      runOnJS(handleGestureScroll)(''); // Reset last scrolled
    });

  const rightSwipeGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(router.back)();
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
        hidden={false}
      />
      {isImageWallpaper && (
        <Image source={wallpaper as any} className="absolute h-full w-full" resizeMode="cover" />
      )}
      <GestureDetector gesture={rightSwipeGesture}>
        <View
          className="flex-1 px-4 pt-12"
          style={[{
            backgroundColor: wallpaper
              ? typeof wallpaper === 'string'
                ? wallpaper
                : 'transparent'
              : isDarkMode
                ? '#0D121A'
                : '#EBF0F7',
          }, wallbg]}>
          {/* Search Bar */}
          <View className="mb-6 flex-row items-center ">
            {/* Back Button (small) */}
            {/* <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-white p-2 shadow-sm">
          <Ionicons name="arrow-back" size={20} color="#94A3B8" />
        </TouchableOpacity> */}

            <View
              style={searchbg}
              className={`flex-1 flex-row items-center rounded-xl border px-4 py-1 ${
                isImageWallpaper
                  ? 'border-white/20 '
                  : isDarkMode
                    ? 'border-[#212D41] bg-[#131B27]'
                    : 'border-slate-100 bg-white'
              }`}>
              <Ionicons
                name="search"
                size={20}
                color={
                  searchCi?.color ||
                  (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C59' : '#5C8BCC')
                }
                className="mr-2"
              />
              <TextInput
                style={searchCt}
                className={`ml-2 flex-1 text-[16px] ${
                  searchCt
                    ? ''
                    : isImageWallpaper
                      ? 'text-white'
                      : isDarkMode
                        ? 'text-[#fff]'
                        : 'text-[#A3B9D9]'
                }`}
                placeholder="Search app here"
                placeholderTextColor={
                  searchCt?.color ||
                  (isImageWallpaper ? '#94A3B8' : isDarkMode ? '#64748B' : '#A3B9D9')
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                cursorColor={
                  searchi?.color ||
                  (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C59' : '#A3B9D9')
                }
                autoCorrect={false}
                autoFocus={true}
                showSoftInputOnFocus={isKeyboardEnabled}
                onTouchStart={() => setIsKeyboardEnabled(true)}
              />
            </View>

            {isSelectMode && (
              <TouchableOpacity
                onPress={handleSaveSelection}
                style={tikbg}
                className={`ml-3 rounded-full p-3 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <MaterialCommunityIcons name="check" size={24} color="#4ADE80" />
              </TouchableOpacity>
            )}
          </View>

          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between px-1">
            <Text
              allowFontScaling={false}
              style={allappt}
              className={`text-[18px] ${allappt ? '' : 'font-bold'} underline decoration-2 underline-offset-4 ${
                isImageWallpaper
                  ? 'text-white decoration-white'
                  : isDarkMode
                    ? 'text-[#DADFE5] decoration-[#DADFE5]'
                    : 'text-[#858E9D] decoration-[#858E9D]'
              }`}>
              All Apps
            </Text>
            <Link href="/settingScreen" asChild>
              <TouchableOpacity>
                <View
                  style={[
                    {
                      borderColor:
                       allappi?.color ||
                        (isImageWallpaper ? '#ffffff80' : isDarkMode ? '#94a3b8' : '#858E9D'),
                    },
                    allappi,
                  ]}
                  className={`rounded-lg border-2 ${
                    allappi
                      ? ''
                      : isImageWallpaper
                        ? 'border-white/50'
                        : isDarkMode
                          ? 'border-slate-400'
                          : 'border-[#858E9D]'
                  }`}>
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={22}
                    color={
                      allappi?.color ||
                      (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#94A3B8' : '#858E9D')
                    }
                  />
                </View>
              </TouchableOpacity>
            </Link>
          </View>

          <View className="flex-1 flex-row">
            {/* Apps List */}
            <View className="flex-1 pr-2">
              <SectionList
                ref={sectionListRef}
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                  <Text
                    style={header}
                    className={` text-lg font-bold ${
                      isImageWallpaper
                        ? 'text-white'
                        : isDarkMode
                          ? 'text-[#728099]'
                          : 'text-[#142C4D]'
                    }`}>
                    {title}
                  </Text>
                )}
                keyExtractor={(item) => item.packageName}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={15}
                maxToRenderPerBatch={20}
                windowSize={10}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                stickySectionHeadersEnabled={false}
                onScrollToIndexFailed={(info) => {
                  // SectionList doesn't use onScrollToIndexFailed quite the same, but keeping basic handling
                  const wait = new Promise((resolve) => setTimeout(resolve, 500));
                  wait.then(() => {
                    // sectionListRef.current?.scrollToLocation(...) - difficult to retry without section info
                  });
                }}
              />
            </View>

            {/* Alphabet Sidebar */}
            <View className="z-50 items-center justify-center py-4">
              <GestureDetector gesture={sidebarGesture}>
                <View className="w-8 items-center bg-transparent" style={{ paddingVertical: 10 }}>
                  <BubbleCursor
                    touchY={touchY}
                    isTouching={isTouching}
                    letter={dragLetter}
                    isDarkMode={isDarkMode}
                    bubblebg={bubblebg}
                  />
                  {sidebarChars.map((letter, index) => (
                    <SidebarItem
                      key={letter}
                      letter={letter}
                      index={index}
                      touchY={touchY}
                      isTouching={isTouching}
                      onSelect={scrollToLetter}
                      isDarkMode={isDarkMode}
                      isImageWallpaper={!!isImageWallpaper}
                      currentLetter={currentLetter}
                      alphaside={alphaside}
                    />
                  ))}
                </View>
              </GestureDetector>
            </View>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View className="flex-1 items-center justify-center bg-black/70">
              <View
                style={modalbg}
                className={`w-[85%] rounded-3xl p-6 shadow-xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <View className="mb-6 items-center">
                  <Text
                    style={open}
                    allowFontScaling={false}
                    className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                    Open {selectedApp?.label}
                  </Text>

                  {/* Note: Icon removed from list but can still show in modal */}
                  {selectedApp?.icon && (
                    <Image
                      source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                      className="mb-6 h-16 w-16 rounded-xl"
                      resizeMode="contain"
                    />
                  )}

                  <Text
                    style={select}
                    allowFontScaling={false}
                    className={`text-center text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-800'}`}>
                    Select estimated use time
                  </Text>
                </View>

                <View className="mb-6 flex-row flex-wrap justify-between">
                  {[2, 5, 10, 20].map((mins) => (
                    <TouchableOpacity
                      style={numberbg}
                      key={mins}
                      className="mb-3 w-[48%] items-center rounded-2xl bg-[#7EA9E5] py-3 active:opacity-80"
                      onPress={() => handleLaunchApp(mins)}>
                      <Text style={number} className="text-base font-medium text-white">
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
                    style={toggle}
                    name={showTimeOverSettings ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={isDarkMode ? '#94A3B8' : '#64748B'}
                  />
                </TouchableOpacity>

                {showTimeOverSettings && (
                  <View className="mb-4 w-full">
                    <Text
                      allowFontScaling={false}
                      style={when}
                      className={`mb-4 text-center text-base font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-800'}`}>
                      When time is over
                    </Text>

                    {/* Mindful Delay */}
                    <TouchableOpacity
                      className="mb-3 flex-row items-center"
                      disabled={true}
                      style={{ opacity: 0.5 }}
                      onPress={() => setTimeOverAction('mindful')}>
                      <View
                        style={[
                          {
                            borderColor:
                              togglei?.color ||
                              (timeOverAction === 'mindful' ? '#5B8BDF' : '#9ca3af'),
                          },
                          togglei,
                        ]}
                        className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${togglei ? '' : timeOverAction === 'mindful' ? 'border-[#5B8BDF]' : 'border-gray-400'}`}>
                        {timeOverAction === 'mindful' && (
                          <View
                            style={{ backgroundColor: togglei?.color || '#5B8BDF' }}
                            className="h-3 w-3 rounded-full"
                          />
                        )}
                      </View>
                      <Text
                        allowFontScaling={false}
                        style={remind}
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
                          style={[
                            {
                              borderColor:
                                togglei?.color ||
                                (timeOverAction === 'remind' ? '#5B8BDF' : '#9ca3af'),
                            },
                            togglei,
                          ]}
                          className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${togglei ? '' : timeOverAction === 'remind' ? 'border-[#5B8BDF]' : 'border-gray-400'}`}>
                          {timeOverAction === 'remind' && (
                            <View
                              style={{ backgroundColor: togglei?.color || '#5B8BDF' }}
                              className="h-3 w-3 rounded-full"
                            />
                          )}
                        </View>
                        <Text
                          allowFontScaling={false}
                          style={remind}
                          className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                          Remind Me
                        </Text>
                      </TouchableOpacity>

                      {/* 2nd Warning Checkbox */}
                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setSecondWarning(!secondWarning)}
                        disabled={true}
                        style={{ opacity: timeOverAction === 'remind' ? 1 : 0.5 }}>
                        <View
                          style={[
                            {
                              borderColor:
                                togglei?.color || (secondWarning ? '#5B8BDF' : '#9ca3af'),
                              backgroundColor: secondWarning
                                ? togglei?.color || '#5B8BDF'
                                : 'transparent',
                            },
                            togglei,
                          ]}
                          className={`mr-2 h-4 w-4 items-center justify-center rounded border ${togglei ? '' : secondWarning ? 'border-[#5B8BDF] bg-[#5B8BDF]' : 'border-gray-400'}`}>
                          {secondWarning && <Ionicons name="checkmark" size={12} color="white" />}
                        </View>
                        <Text
                          allowFontScaling={false}
                          style={remind}
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
                        style={[
                          {
                            borderColor:
                              togglei?.color || (timeOverAction === 'quit' ? '#5B8BDF' : '#9ca3af'),
                          },
                          togglei,
                        ]}
                        className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${togglei ? '' : timeOverAction === 'quit' ? 'border-[#5B8BDF]' : 'border-gray-400'}`}>
                        {timeOverAction === 'quit' && (
                          <View
                            style={{ backgroundColor: togglei?.color || '#5B8BDF' }}
                            className="h-3 w-3 rounded-full"
                          />
                        )}
                      </View>
                      <Text
                        allowFontScaling={false}
                        style={remind}
                        className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                        Quit
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View
                  style={bordert}
                  className={`mt-2 border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <TouchableOpacity
                    style={quitbg}
                    className="w-full items-center rounded-2xl bg-[#A3B9D8] py-3 active:opacity-80"
                    onPress={() => setModalVisible(false)}>
                    <Text
                      style={quit}
                      allowFontScaling={false}
                      className="font-regular text-[16px] text-white">
                      Quit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={optionsModalVisible}
            onRequestClose={() => setOptionsModalVisible(false)}>
            <View className="flex-1 items-center justify-center bg-black/70">
              <View
                style={modalbg}
                className={`w-[85%] rounded-3xl p-6 shadow-xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <View className="mb-6 items-center">
                  <Text
                    style={open}
                    allowFontScaling={false}
                    className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                    {selectedApp?.label} Options
                  </Text>
                  {selectedApp?.icon && (
                    <Image
                      source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                      className="mb-6 h-16 w-16 rounded-xl"
                      resizeMode="contain"
                    />
                  )}
                </View>

                <View className="flex-row flex-wrap justify-between gap-y-4">
                  <TouchableOpacity
                    style={numberbg}
                    className={`w-[48%] items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'}`}
                    onPress={handleAddToHome}>
                    <Text style={number} className="font-medium text-white">
                      Add to Home
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={numberbg}
                    className={`w-[48%] items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'}`}
                    onPress={handlePinToTop}>
                    <Text style={number} className="font-medium text-white">
                      {pinnedPackageNames.includes(selectedApp?.packageName || '')
                        ? 'Unpin'
                        : 'Pin to top'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={numberbg}
                    className={`w-[48%] items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'}`}
                    onPress={handleBlock}>
                    <Text style={number} className="font-medium text-white">
                      Block
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={numberbg}
                    className={`w-[48%] items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'}`}
                    onPress={handleRename}>
                    <Text style={number} className="font-medium text-white">
                      Rename
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={numberbg}
                    className={`w-[48%] items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'}`}
                    onPress={handleAppInfo}>
                    <Text style={number} className="font-medium text-white">
                      App Info
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={numberbg}
                    className={`w-[48%] items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'}`}
                    onPress={handleUninstall}>
                    <Text style={number} className="font-medium text-white">
                      Uninstall
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={bordert}
                  className={`mt-6 border-t pt-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <TouchableOpacity
                    style={quitbg}
                    className={`w-full items-center rounded-xl py-3 active:opacity-80 ${
                      isDarkMode ? 'bg-[#212D41]' : 'bg-[#5B8BDF]'
                    }`}
                    onPress={() => setOptionsModalVisible(false)}>
                    <Text
                      style={quit}
                      className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={renameModalVisible}
            onRequestClose={() => setRenameModalVisible(false)}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={() => setRenameModalVisible(false)}>
                <View className="flex-1 items-center justify-center bg-black/50">
                  <TouchableWithoutFeedback>
                    <View
                      style={modalbg}
                      className={`w-[85%] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                      <Text
                        style={appC}
                        allowFontScaling={false}
                        className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        Rename App
                      </Text>

                      <TextInput
                        value={newName}
                        onChangeText={setNewName}
                        style={[appC, applistCbg]}
                        className={`mb-6 w-full rounded-lg border px-4 py-3 text-lg ${
                          isImageWallpaper
                            ? 'border-white/20 text-white'
                            : isDarkMode
                              ? 'border-slate-600 bg-slate-800 text-slate-300'
                              : 'border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                        selectTextOnFocus
                      />

                      <View className="w-full flex-row gap-3">
                        <TouchableOpacity
                          className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                          onPress={() => setRenameModalVisible(false)}>
                          <Text
                            allowFontScaling={false}
                            className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={saveRename}>
                          <Text allowFontScaling={false} className="font-medium text-white">
                            Save
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
