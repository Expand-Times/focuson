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
} from 'react-native';
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

const ITEM_HEIGHT = 20;

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
    const dist = Math.abs(touchY.value - itemY);

    const translateX = interpolate(
      dist,
      [0, 60],
      [-40, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      dist,
      [0, 60],
      [2, 1],
      Extrapolation.CLAMP
    );

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
      style={[{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: 24 }, animatedStyle]}>
      <TouchableOpacity onPress={() => onSelect(letter)} activeOpacity={0.7}>
        <Text
          allowFontScaling={false}
          className={`text-[12px] font-medium ${
            currentLetter === letter
              ? isDarkMode
                ? 'font-bold text-white'
                : 'font-extrabold text-[14px] text-[#5C8BCC]'
              : isDarkMode
              ? 'text-blue-400'
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
          backgroundColor: isDarkMode ? '#4ADE80' : '#fff', // Green color like in screenshot
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
      <Text className="text-xl font-bold text-black">{letter}</Text>
    </Animated.View>
  );
};

export default function AllApps() {
  const { isDarkMode } = useColorContext();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Selection Mode State
  const [selectedPackageNames, setSelectedPackageNames] = useState<string[]>([]);

  const router = useRouter();
  const params = useLocalSearchParams();
  const isSelectMode = params.mode === 'select';

  const sectionListRef = useRef<SectionList>(null);

  useEffect(() => {
    loadApps();
    if (isSelectMode) {
      loadSelectedApps();
    }
  }, [isSelectMode]);

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
    
    // Group apps by first letter
    const grouped = apps.reduce((acc, app) => {
      const firstChar = app.label.charAt(0).toUpperCase();
      const key = /^[A-Z]/.test(firstChar) ? firstChar : '#';
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(app);
      return acc;
    }, {} as Record<string, AppItem[]>);

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

    if (searchQuery) {
       result = result.map(section => ({
         ...section,
         data: section.data.filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase()))
       })).filter(section => section.data.length > 0);
    }
    
    return result;
  }, [apps, searchQuery]);

  const handleAppPress = (app: AppItem) => {
    if (isSelectMode) {
      if (selectedPackageNames.includes(app.packageName)) {
        // Deselect
        setSelectedPackageNames((prev) => prev.filter((p) => p !== app.packageName));
      } else {
        // Select
        if (selectedPackageNames.length >= 6) {
          Alert.alert("Limit Reached", "You cannot add more than 6 apps.");
          return;
        }
        setSelectedPackageNames((prev) => [...prev, app.packageName]);
      }
    } else {
      setSelectedApp(app);
      setModalVisible(true);
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
        className={`mb-2 w-full flex-row items-center justify-between rounded-xl px-4 py-3 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-[#7EA9E5]'} ${isSelectMode && isSelected ? 'border-2 border-white' : ''}`}
        onPress={() => handleAppPress(item)}>
        <View className="flex-1 flex-row items-center">
          {isSelectMode && (
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
          )}
          <Text allowFontScaling={false} className={`text-[16px] font-regular ${isDarkMode ? 'text-slate-300' : 'text-white'}`} numberOfLines={1}>
            {item.label}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text allowFontScaling={false} className={`text-[10px] font-light ${isDarkMode ? 'text-slate-400' : 'text-white'} opacity-90`}>
            TO: {item.launchCount || 0} times || DU: {usageText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const sidebarChars = useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const hasNonAlpha = apps.some((app) => !/^[a-zA-Z]/.test(app.label));
    if (hasNonAlpha) {
      return ['#', ...chars];
    }
    return chars;
  }, [apps]);

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
    const sectionIndex = sections.findIndex(s => s.title === letter);

    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: false, // Smooth scrolling can be buggy with large lists during drag
        viewOffset: 0,
        viewPosition: 0
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
      <GestureDetector gesture={rightSwipeGesture}>
        <View className={`flex-1 px-4 pt-12 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#EFF6FC]'}`}>
          {/* Search Bar */}
          <View className="mb-6 flex-row items-center gap-3">
        {/* Back Button (small) */}
        {/* <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-white p-2 shadow-sm">
          <Ionicons name="arrow-back" size={20} color="#94A3B8" />
        </TouchableOpacity> */}

        <View className={`flex-1 flex-row items-center rounded-full px-4 py-1 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
          <Ionicons name="search" size={20} color={isDarkMode ? "#94A3B8" : "#5C8BCC"} className="mr-2" />
          <TextInput
            className={`ml-2 flex-1 text-[16px] ${isDarkMode ? 'text-slate-300' : 'text-[#A3B9D9]'}`}
            placeholder="Search app here|"
            placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {isSelectMode && (
          <TouchableOpacity
            onPress={handleSaveSelection}
            className={`rounded-full p-2 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <MaterialCommunityIcons name="check" size={24} color="#4ADE80" />
          </TouchableOpacity>
        )}
      </View>

      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between px-1">
        <Text
          allowFontScaling={false}
          className={`text-[18px] font-bold underline decoration-2 underline-offset-4 ${isDarkMode ? 'text-slate-400 decoration-slate-400' : 'text-[#858E9D] decoration-[#858E9D]'}`}>
          All Apps
        </Text>
        <Link href="/settingScreen" asChild>
          <TouchableOpacity>
            <View className={`rounded-lg border border-2 ${isDarkMode ? 'border-slate-400' : 'border-[#858E9D]'}`}>
              <MaterialCommunityIcons name="tune-variant" size={22} color={isDarkMode ? "#94A3B8" : "#858E9D"} />
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
              <Text className={` text-lg font-bold ${isDarkMode ? 'text-slate-400' : 'text-[#5C8BCC]'}`}>
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
        <View className="items-center justify-center py-4 z-50">
          <GestureDetector gesture={sidebarGesture}>
            <View className="items-center w-8 bg-transparent" style={{ paddingVertical: 10 }}>
              <BubbleCursor
                touchY={touchY}
                isTouching={isTouching}
                letter={dragLetter}
                isDarkMode={isDarkMode}
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
                  currentLetter={currentLetter}
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
          <View className={`w-[85%] rounded-3xl p-6 shadow-xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <View className="mb-6 items-center">
              <Text allowFontScaling={false} className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
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

              <Text allowFontScaling={false} className={`text-center text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-800'}`}>
                Select estimated use time
              </Text>
            </View>

            <View className="mb-6 flex-row flex-wrap justify-between">
              {[2, 5, 10, 20].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  className="mb-3 w-[48%] items-center rounded-2xl bg-[#7EA9E5] py-3 active:opacity-80"
                  onPress={() => handleLaunchApp(mins)}>
                  <Text className="text-base font-medium text-white">{mins} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className={`mt-2 border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <TouchableOpacity
                className="w-full items-center rounded-2xl bg-[#A3B9D8] py-3 active:opacity-80"
                onPress={() => setModalVisible(false)}>
                <Text allowFontScaling={false} className="text-[16px] font-regular text-white">Quit</Text>
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