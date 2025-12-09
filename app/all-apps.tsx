import {
  View,
  Text,
  FlatList,
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
import { runOnJS } from 'react-native-reanimated';
import { useState, useEffect, useMemo, useRef } from 'react';
import Launcher from '../modules/launcher';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { openApplication } from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function AllApps() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Selection Mode State
  const [selectedPackageNames, setSelectedPackageNames] = useState<string[]>([]);

  const router = useRouter();
  const params = useLocalSearchParams();
  const isSelectMode = params.mode === 'select';

  const flatListRef = useRef<FlatList>(null);

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

  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;
    return apps.filter((app) => app.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [apps, searchQuery]);

  const handleAppPress = (app: AppItem) => {
    if (isSelectMode) {
      setSelectedPackageNames((prev) => {
        if (prev.includes(app.packageName)) {
          return prev.filter((p) => p !== app.packageName);
        } else {
          return [...prev, app.packageName];
        }
      });
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
        className={`mb-2 w-full flex-row items-center justify-between rounded-xl bg-[#7EA9E5] px-4 py-3 shadow-sm ${isSelectMode && isSelected ? 'border-2 border-white' : ''}`}
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
          <Text allowFontScaling={false} className="text-[16px] font-regular text-white" numberOfLines={1}>
            {item.label}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text allowFontScaling={false} className="text-[10px] font-light text-white opacity-90">
            TO: {item.launchCount || 0} times || DU: {usageText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

  const scrollToLetter = (letter: string) => {
    const index = apps.findIndex((app) => app.label.toUpperCase().startsWith(letter));
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const rightSwipeGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(router.back)();
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={rightSwipeGesture}>
        <View className="flex-1 bg-[#EFF6FC] px-4 pt-12">
          {/* Search Bar */}
          <View className="mb-6 flex-row items-center gap-3">
        {/* Back Button (small) */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-white p-2 shadow-sm">
          <Ionicons name="arrow-back" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center rounded-full bg-white px-4 py-1 shadow-sm">
          <Ionicons name="search" size={20} color="#5C8BCC" className="mr-2" />
          <TextInput
            className="ml-2 flex-1 text-[16px] text-[#A3B9D9]"
            placeholder="Search app here|"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {isSelectMode && (
          <TouchableOpacity
            onPress={handleSaveSelection}
            className="rounded-full bg-white p-2 shadow-sm">
            <MaterialCommunityIcons name="check" size={24} color="#4ADE80" />
          </TouchableOpacity>
        )}
      </View>

      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between px-1">
        <Text
          allowFontScaling={false}
          className="text-[18px] font-bold text-[#858E9D] underline decoration-[#858E9D] decoration-2 underline-offset-4">
          All Apps
        </Text>
        <Link href="/settingScreen" asChild>
          <TouchableOpacity>
            <View className="rounded-lg border border-2 border-[#858E9D] ">
              <MaterialCommunityIcons name="tune-variant" size={24} color="#858E9D" />
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-1 flex-row">
        {/* Apps List */}
        <View className="flex-1 pr-2">
          <FlatList
            ref={flatListRef}
            data={filteredApps}
            renderItem={renderItem}
            keyExtractor={(item) => item.packageName}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={10}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise((resolve) => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />
        </View>

        {/* Alphabet Sidebar */}
        <View className="w-6 items-center justify-center py-4">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', gap: 4 }}>
            {alphabet.map((letter) => (
              <TouchableOpacity key={letter} onPress={() => scrollToLetter(letter)}>
                <Text className="py-0.5 text-[10px] font-medium text-[#5B8BDF]">{letter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

              {/* Note: Icon removed from list but can still show in modal */}
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
