import { useAppLauncher } from './hooks/useAppLauncher';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
  Pressable,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Directions,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import * as IntentLauncher from 'expo-intent-launcher';
import { openApplication } from 'expo-intent-launcher';
import { useColorContext } from './context/ColorContext';
import { useAppContext } from './context/AppContext';
import wallpaperFontConfig from './constants/wallpaperFontConfig';

import AppModal from './context/Modal';
import { BlockDurationModal, BlockedInfoModal } from './components/BlockModals';
import Screenmodal from './components/Screenmodal';
import { PremiumModal } from './components/PremiumModal';

type Category = {
  title: string;
  data: AppItem[];
};

export default function AllAppListByCategoryScreen({
  enableGestures = true,
  autoFocus = true,
}: {
  enableGestures?: boolean;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const { isDarkMode, wallpaper, wallpaperIndex, showStatusBar, isPremium } = useColorContext();
  const {
    apps,
    loading: appsLoading,
    renamedCategories,
    renameCategory,
    categoryOverrides,
    setCategoryOverride,
    hiddenApps,
    toggleHideApp,
    appRenames,
    renameApp,
    customCategories,
    addCustomCategory,
    isExcludedFromTimer,
    setTimedBlock,
    isTemporarilyBlocked,
    timedBlocks,
  } = useAppContext();
  const isImageWallpaper = wallpaper && typeof wallpaper !== 'string';
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');

  const RootContainer = enableGestures ? GestureHandlerRootView : View;

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [launchModalVisible, setLaunchModalVisible] = useState(false);
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const [renameCategoryModalVisible, setRenameCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showAppRenamer, setShowAppRenamer] = useState(false);
  const [softInputEnabled, setSoftInputEnabled] = useState(false);
  const [tempAppName, setTempAppName] = useState('');
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [hideAppModalVisible, setHideAppModalVisible] = useState(false);
  const [blockedInfoVisible, setBlockedInfoVisible] = useState(false);
  const [screenTimeVisible, setScreenTimeVisible] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [premiumModalConfig, setPremiumModalConfig] = useState({ title: '', description: '' });

  // wallpaperFontConfig
  const fontConfig = wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null;
  const {
    searchCbg,
    searchCi,
    appC,
    appCn,
    appCi,
    applistC,
    applistCbg,
    applistCdu,
    modalbg,
    open,
    numberbg,
    number,
    appi,
    searchCt,
    wallbg,
    quit,
    quitbg,
    bordert,
  } = fontConfig || ({} as any);

  // Removed load... functions and initial useEffect

  useEffect(() => {
    // Re-categorize when overrides or renames change
    if (!appsLoading) {
      const categorized = categorizeApps(
        apps.filter((app) => !hiddenApps.includes(app.packageName))
      );
      setCategories(categorized);
    }
  }, [apps, appsLoading, categoryOverrides, appRenames, customCategories, hiddenApps]);

  const ensurePremium = () => {
    if (!isPremium) {
      setPremiumModalConfig({
        title: 'Premium Feature',
        description: 'This feature is available for premium users only.'
      });
      setPremiumModalVisible(true);
      return false;
    }
    return true;
  };

  const handleStartEditing = (originalTitle: string, currentDisplayTitle: string) => {
    if (!ensurePremium()) return;
    setEditingCategory(originalTitle);
    setTempCategoryName(currentDisplayTitle);
    setRenameCategoryModalVisible(true);
  };

  const isCategoryNameDuplicate = (name: string, excludeOriginalTitle?: string) => {
    const normalizedName = name.trim().toLowerCase();

    // Check against all visible categories (custom + standard)
    return categories.some((cat) => {
      // If we are renaming, skip the category currently being edited
      if (excludeOriginalTitle && cat.title === excludeOriginalTitle) return false;

      const displayTitle = renamedCategories[cat.title] || cat.title;
      return displayTitle.toLowerCase() === normalizedName;
    });
  };

  const isAppNameDuplicate = (name: string, excludePackageName?: string) => {
    const normalizedName = name.trim().toLowerCase();

    // Check against all apps
    return apps.some((app) => {
      if (excludePackageName && app.packageName === excludePackageName) return false;
      const appName = appRenames[app.packageName] || app.label;
      return appName.toLowerCase() === normalizedName;
    });
  };

  const handleSaveCategoryName = async () => {
    if (!editingCategory) return;

    const trimmedName = tempCategoryName.trim();
    if (!trimmedName) {
      // Don't save empty names, just cancel or do nothing
      // Alternatively, revert to original name if user clears it?
      // For now, let's just do nothing as per existing logic (implicit)
      return;
    }

    // Check for duplicate name
    if (isCategoryNameDuplicate(trimmedName, editingCategory)) {
      Alert.alert('Error', `The category name "${trimmedName}" is already in use.`);
      return;
    }

    try {
      await renameCategory(editingCategory, trimmedName);
      setEditingCategory(null);
      setRenameCategoryModalVisible(false);
    } catch (e) {
      console.error('Failed to save category name', e);
    }
  };

  const handleCancelEditing = () => {
    setEditingCategory(null);
    setTempCategoryName('');
    setRenameCategoryModalVisible(false);
  };

  // loadAndCategorizeApps removed, logic moved to useEffect

  const categorizeApps = (apps: AppItem[]): Category[] => {
    const groups: { [key: string]: AppItem[] } = {};

    // Initialize with custom categories
    customCategories.forEach((cat) => {
      groups[cat] = [];
    });

    apps.forEach((app) => {
      // Apply app rename if exists
      if (appRenames[app.packageName]) {
        app.label = appRenames[app.packageName];
      }

      // Check overrides first, then native category, then fallback
      let category = categoryOverrides[app.packageName] || app.category || 'Other';

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(app);
    });

    // Convert grouped object to array of Category objects, filter out empty categories
    // (except for custom categories so they remain visible when created),
    // and sort apps within each category alphabetically
    const result = Object.keys(groups)
      .filter((title) => groups[title].length > 0 || customCategories.includes(title))
      .map((title) => ({
        title,
        data: groups[title].sort((a, b) =>
          (appRenames[a.packageName] || a.label).localeCompare(appRenames[b.packageName] || b.label)
        ),
      }));

    // Sort categories: "Other" goes to the bottom, rest alphabetical
    return result.sort((a, b) => {
      if (a.title === 'Other') return 1;
      if (b.title === 'Other') return -1;
      return a.title.localeCompare(b.title);
    });
  };

  const handleCreateCategory = async () => {
    if (!isPremium && customCategories.length >= 2) {
      setCreateCategoryModalVisible(false);
      setNewCategoryName('');
      setPremiumModalConfig({
        title: 'Premium Feature',
        description: 'Free users can only create up to 2 custom categories. Please upgrade to Premium to create more.'
      });
      setPremiumModalVisible(true);
      return;
    }

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    if (isCategoryNameDuplicate(trimmedName)) {
      Alert.alert('Error', `The category name "${trimmedName}" is already in use.`);
      return;
    }

    try {
      await addCustomCategory(trimmedName);
      setCreateCategoryModalVisible(false);
      setNewCategoryName('');
    } catch (e) {
      console.error('Failed to save custom category', e);
    }
  };

  const { launchAppWithTimer } = useAppLauncher();

  const handleLaunchWithTimer = (durationMinutes: number) => {
    if (selectedApp) {
      const success = launchAppWithTimer(selectedApp, durationMinutes);
      if (success) {
        setLaunchModalVisible(false);
        setSelectedApp(null);
      }
    }
  };

  const onAppPress = (app: AppItem) => {
    Keyboard.dismiss();
    if (isTemporarilyBlocked(app.packageName)) {
      setSelectedApp(app);
      setBlockedUntil(timedBlocks[app.packageName] || null);
      setBlockedInfoVisible(true);
    } else if (isExcludedFromTimer(app.packageName)) {
      openApplication(app.packageName);
    } else {
      setSelectedApp(app);
      setLaunchModalVisible(true);
    }
  };

  const handleAppInfo = () => {
    if (!selectedApp) return;
    IntentLauncher.startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
      data: 'package:' + selectedApp.packageName,
    });
    closeModal();
  };

  const handleUninstall = async () => {
    if (!selectedApp) return;
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        {
          data: 'package:' + selectedApp.packageName,
        }
      );
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const startAppRenaming = () => {
    Keyboard.dismiss();
    if (!ensurePremium()) return;
    if (!selectedApp) return;
    setTempAppName(appRenames[selectedApp.packageName] || selectedApp.label);
    setShowAppRenamer(true);
    setSoftInputEnabled(false);
  };

  const saveAppRename = async () => {
    if (!selectedApp) return;

    const trimmedName = tempAppName.trim();
    if (!trimmedName) return;

    if (isAppNameDuplicate(trimmedName, selectedApp.packageName)) {
      Alert.alert('Error', `The app name "${trimmedName}" is already in use.`);
      return;
    }

    try {
      await renameApp(selectedApp.packageName, trimmedName);
    } catch (e) {
      console.error('Failed to save app rename', e);
    }
    closeModal();
  };

  const handleHideApp = async () => {
    if (!selectedApp) return;
    setHideAppModalVisible(true);
  };

  const confirmHideApp = async (dontShowAgain: boolean) => {
    if (!selectedApp) return;
    try {
      await toggleHideApp(selectedApp.packageName);
      setHideAppModalVisible(false);
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmBlock = async (durationMs: number) => {
    if (!selectedApp) return;
    try {
      const until = Date.now() + durationMs;
      await setTimedBlock(selectedApp.packageName, until);
      setBlockModalVisible(false);
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    return categories
      .map((cat) => ({
        ...cat,
        data: (cat?.data || []).filter((app) =>
          app.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((cat) => cat?.data?.length > 0);
  }, [categories, searchQuery]);

  const formatUsageTime = (millis?: number) => {
    if (!millis) return '0 min';
    const minutes = Math.floor(millis / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  const handleLongPress = useCallback((app: AppItem) => {
    Keyboard.dismiss();
    setModalVisible(true);
    setSelectedApp(app);
  }, []);

  const handlePress = useCallback((app: AppItem) => {
    onAppPress(app);
  }, []);

  const closeModal = () => {
    setModalVisible(false);
    setSelectedApp(null);
    setShowCategorySelector(false);
    setShowAppRenamer(false);
  };

  const handleMoveApp = async (targetCategory: string) => {
    if (!selectedApp) return;

    try {
      await setCategoryOverride(selectedApp.packageName, targetCategory);
    } catch (e) {
      console.error('Failed to save category override', e);
    }
    closeModal();
  };

  if (appsLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: wallpaper
            ? typeof wallpaper === 'string'
              ? wallpaper
              : 'transparent'
            : isDarkMode
              ? '#0F172A'
              : '#EEF2F6',
        }}>
        {isImageWallpaper && (
          <Image source={wallpaper as any} className="absolute h-full w-full" resizeMode="cover" />
        )}
        <ActivityIndicator size="large" color="#7EA6E0" />
      </View>
    );
  }

  const leftSwipeGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .enabled(enableGestures)
    .onEnd(() => {
      runOnJS(router.back)();
    });

  return (
    <RootContainer
      style={{
        flex: 1,
        backgroundColor: wallpaper
          ? typeof wallpaper === 'string'
            ? wallpaper
            : 'transparent'
          : isDarkMode
            ? '#0D121A'
            : '#EBF1F7',
      }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
        hidden={!showStatusBar}
      />
      {isImageWallpaper && (
        <Image
          source={wallpaper as any}
          className="absolute w-full"
          style={{ height: Dimensions.get('screen').height }}
          resizeMode="cover"
        />
      )}
      <GestureDetector gesture={leftSwipeGesture}>
        <View
          className="flex-1 pt-12"
          style={[
            {
              backgroundColor: wallpaper
                ? typeof wallpaper === 'string'
                  ? wallpaper
                  : 'transparent'
                : isDarkMode
                  ? '#0D121A'
                  : '#EBF1F7',
            },
            wallbg,
          ]}>
          <View className="flex-1 px-4">
            {/* Search Bar */}
            <View
              style={searchCbg}
              className={`mb-6 flex-row items-center rounded-xl border px-4 py-1  ${
                isImageWallpaper
                  ? 'border-white/20 bg-black/30'
                  : isDarkMode
                    ? 'border-[#212D41] bg-[]'
                    : 'border-slate-100 bg-white'
              }`}>
              <MaterialCommunityIcons
                style={searchCi}
                name="magnify"
                size={20}
                color={isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C5980' : '#5C8BCC'}
              />
              <TextInput
                style={searchCt}
                className={`ml-3 flex-1 text-[16px] ${
                  isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#fff]' : 'text-[#A3B9D9]'
                }`}
                placeholder="Search app here"
                placeholderTextColor={
                  searchCt?.color ||
                  (isImageWallpaper ? '#94A3B8' : isDarkMode ? '#434C5980' : '#A3B9D9')
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                cursorColor={
                  searchCt?.color ||
                  (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C59' : '#A3B9D9')
                }
                autoFocus={autoFocus}
                showSoftInputOnFocus={isKeyboardEnabled}
                onTouchStart={() => setIsKeyboardEnabled(true)}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Header */}
              <View className="mb-[6%] flex-row items-center justify-between">
                <Text
                  allowFontScaling={false}
                  style={appC}
                  className={`text-[18px] ${appC ? '' : 'font-bold'} underline-offset-4 ${
                    isImageWallpaper
                      ? 'text-white decoration-white'
                      : isDarkMode
                        ? 'text-[#DBDFE4] decoration-slate-400'
                        : 'text-[#142C4D] decoration-[#142C4D]'
                  }`}>
                  App Category
                </Text>
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity
                    onPress={() => {
                      if (ensurePremium()) {
                        setCreateCategoryModalVisible(true);
                      }
                    }}>
                    <View
                      style={[
                        appi,
                        {
                          borderColor:
                            appi?.color ||
                            (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D'),
                        },
                      ]}
                      className={`rounded-lg border border-2 ${
                        isImageWallpaper
                          ? 'border-white/50'
                          : isDarkMode
                            ? 'border-[#728099]'
                            : 'border-[#858E9D]'
                      }`}>
                      <MaterialCommunityIcons
                        name="plus"
                        size={25}
                        color={
                          appi?.color ||
                          (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')
                        }
                      />
                    </View>
                  </TouchableOpacity>
                  <Link href="/settingScreen" asChild>
                    <TouchableOpacity>
                      <View style={appi}>
                        <Image
                          source={require('../assets/images/SettingIcon.png')}
                          style={{
                            width: 30,
                            height: 30,
                            tintColor:
                              appi?.color ||
                              (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D'),
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>

              {filteredCategories.map((category, index) => {
                const displayTitle = renamedCategories[category.title] || category.title;

                return (
                  <View key={index} className="">
                    {/* Category Header */}
                    <View className="mb-2 flex-row items-center justify-end">
                      <Text
                        allowFontScaling={false}
                        style={appCn}
                        className={`mr-2 text-[16px] ${
                          isImageWallpaper
                            ? 'text-white'
                            : isDarkMode
                              ? 'text-[#728099]'
                              : 'text-[#142C4D]'
                        }`}>
                        {displayTitle} ({category.data.length})
                      </Text>
                      <TouchableOpacity
                        style={[
                          appCi,
                          {
                            borderColor:
                              appCi?.color ||
                              (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D'),
                          },
                        ]}
                        className={`border-b ${
                          isImageWallpaper
                            ? 'border-white/50'
                            : isDarkMode
                              ? 'border-slate-400'
                              : 'border-[#858E9D]'
                        }`}
                        onPress={() => handleStartEditing(category.title, displayTitle)}>
                        <MaterialCommunityIcons
                          name="pencil-outline"
                          size={16}
                          color={
                            appCi?.color ||
                            (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    {/* App List */}
                    <View className="mb-[6%]">
                      {category.data.map((app) => (
                        <Pressable
                          key={app.packageName}
                          style={applistCbg}
                          className={`mb-[2%] w-full flex-row items-center justify-between rounded-xl px-4 py-3  ${
                            isImageWallpaper
                              ? 'bg-black/40'
                              : isDarkMode
                                ? 'bg-[#131B27]'
                                : 'bg-[#CEDDF2]'
                          }`}
                          onPress={() => handlePress(app)}
                          onLongPress={() => handleLongPress(app)}
                          delayLongPress={300} // ⚡ ultra fast
                          android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
                          <View className="mr-2 flex-1 flex-row items-center">
                            {wallpaperIndex === 6 && (
                              <View
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 5,
                                  backgroundColor: '#132C4D',
                                  marginRight: 8,
                                  opacity: 0.8,
                                }}
                              />
                            )}
                            <Text
                              allowFontScaling={false}
                              style={[applistC, { maxWidth: '90%' }]}
                              className={`font-regular text-[17px] ${
                                isImageWallpaper
                                  ? 'text-white'
                                  : isDarkMode
                                    ? 'text-[#DBDFE5]'
                                    : 'text-[#142C4D]'
                              }`}
                              numberOfLines={1}>
                              {(appRenames[app.packageName] || app.label).length > 15
                                ? (appRenames[app.packageName] || app.label).slice(0, 15) + '...'
                                : appRenames[app.packageName] || app.label}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })}

              {filteredCategories.length === 0 && (
                <View className="mt-10 items-center">
                  <Text className="text-slate-400">No apps found</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Launch App Modal */}
          <AppModal
            visible={launchModalVisible}
            onClose={() => setLaunchModalVisible(false)}
            selectedApp={selectedApp}
            onLaunch={handleLaunchWithTimer}
            isDarkMode={isDarkMode}
            theme={fontConfig}
          />

          {/* App Options Modal */}
          {modalVisible && selectedApp && (
            <View className="absolute inset-0 z-50 items-center justify-center">
              <Pressable className="absolute inset-0 bg-black/70" onPress={closeModal} />
              <View
                style={modalbg}
                className={`w-[85%] items-center rounded-2xl p-6 shadow-lg ${
                  isDarkMode ? 'bg-[#131B27]' : 'bg-white'
                }`}>
                <View className="w-full max-w-[520px] items-center">
                  <Text
                    allowFontScaling={false}
                    style={open}
                    className={`mb-6 text-[16px] font-medium ${
                      isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'
                    }`}>
                    {selectedApp.label} Options
                  </Text>
                  <View className="mb-8 h-16 w-16 rounded-full">
                    <Image
                      source={{
                        uri: `data:image/png;base64,${selectedApp.icon}`,
                      }}
                      className="h-full w-full rounded-full"
                    />
                  </View>
                  <View className="flex-row flex-wrap justify-between gap-y-4">
                    <TouchableOpacity
                      style={numberbg}
                      className={`w-[48%] items-center rounded-lg py-3 ${
                        isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'
                      }`}
                      onPress={() => {
                        if (!isPremium) {
                          setModalVisible(false);
                          setPremiumModalConfig({
                            title: 'Premium Feature',
                            description: 'Moving apps between categories is a premium feature.'
                          });
                          setPremiumModalVisible(true);
                          return;
                        }
                        setShowCategorySelector(true);
                      }}>
                      <Text
                        style={number}
                        className={`text-base font-medium ${
                          isDarkMode ? 'text-[#DBDFE5]' : 'text-white'
                        }`}>
                        Move to category
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={numberbg}
                      className={`w-[48%] items-center rounded-lg py-3 ${
                        isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'
                      }`}
                      onPress={() => setScreenTimeVisible(true)}>
                      <Text
                        style={number}
                        className={`text-base font-medium ${
                          isDarkMode ? 'text-[#DBDFE5]' : 'text-white'
                        }`}>
                        Screen times
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={numberbg}
                      className={`w-[48%] items-center rounded-lg py-3 ${
                        isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'
                      }`}
                      onPress={() => setBlockModalVisible(true)}>
                      <Text
                        style={number}
                        className={`text-base font-medium ${
                          isDarkMode ? 'text-[#DBDFE5]' : 'text-white'
                        }`}>
                        Block
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={numberbg}
                      className={`w-[48%] items-center rounded-lg py-3 ${
                        isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'
                      }`}
                      onPress={startAppRenaming}>
                      <Text
                        style={number}
                        className={`text-base font-medium ${
                          isDarkMode ? 'text-[#DBDFE5]' : 'text-white'
                        }`}>
                        Rename
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={numberbg}
                      className={`w-[48%] items-center rounded-lg py-3 ${
                        isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'
                      }`}
                      onPress={handleAppInfo}>
                      <Text
                        style={number}
                        className={`text-base font-medium ${
                          isDarkMode ? 'text-[#DBDFE5]' : 'text-white'
                        }`}>
                        App Info
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={numberbg}
                      className={`w-[48%] items-center rounded-lg py-3 ${
                        isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'
                      }`}
                      onPress={handleUninstall}>
                      <Text
                        style={number}
                        className={`text-base font-medium ${
                          isDarkMode ? 'text-[#DBDFE5]' : 'text-white'
                        }`}>
                        Uninstall
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={bordert}
                    className={`mt-6 w-full border-t pt-4 ${
                      isDarkMode ? 'border-slate-700' : 'border-gray-200'
                    }`}>
                    <TouchableOpacity
                      style={quitbg}
                      className={`w-full items-center rounded-xl py-3 ${
                        isDarkMode ? 'bg-[#212D41]' : 'bg-[#5B8BDF]'
                      }`}
                      onPress={closeModal}>
                      <Text
                        style={quit}
                        className={`text-lg font-medium ${
                          isDarkMode ? 'text-slate-400' : 'text-white'
                        }`}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          <BlockDurationModal
            visible={blockModalVisible}
            onClose={() => setBlockModalVisible(false)}
            onConfirm={handleConfirmBlock}
            isDarkMode={isDarkMode}
            theme={fontConfig}
            appLabel={selectedApp?.label}
            appIconBase64={selectedApp?.icon}
            packageName={selectedApp?.packageName}
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
          <Screenmodal
            visible={screenTimeVisible}
            onClose={() => setScreenTimeVisible(false)}
            isDarkMode={isDarkMode}
            theme={fontConfig}
            appLabel={selectedApp?.label}
            packageName={selectedApp?.packageName}
          />

          {/* Rename App Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showAppRenamer}
            onRequestClose={() => setShowAppRenamer(false)}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={() => setShowAppRenamer(false)}>
                <View className="flex-1 items-center justify-center bg-black/50">
                  <TouchableWithoutFeedback>
                    <View
                      style={modalbg}
                      className={`w-[320px] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                      <Text
                        style={appC}
                        allowFontScaling={false}
                        className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        Rename App
                      </Text>

                      <TextInput
                        value={tempAppName}
                        onChangeText={setTempAppName}
                        style={[appC, applistCbg]}
                        className={`mb-6 w-full rounded-lg border px-4 py-3 text-lg ${
                          isImageWallpaper
                            ? 'border-white/20 text-white'
                            : isDarkMode
                              ? 'border-slate-600 bg-slate-800 text-slate-300'
                              : 'border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                        autoFocus
                        showSoftInputOnFocus={softInputEnabled}
                        onTouchEnd={() => setSoftInputEnabled(true)}
                      />

                      <View className="w-full flex-row gap-3">
                        <TouchableOpacity
                          className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                          onPress={() => setShowAppRenamer(false)}>
                          <Text
                            allowFontScaling={false}
                            className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={saveAppRename}>
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

          {/* Category Selector Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showCategorySelector}
            onRequestClose={() => setShowCategorySelector(false)}>
            <View className="flex-1 items-center justify-center bg-black/50">
              <View
                style={modalbg}
                className={`max-h-[50%] w-[85%]  rounded-2xl p-6 shadow-lg ${
                  isDarkMode ? 'bg-[#1E293B]' : 'bg-white'
                }`}>
                <Text
                  style={appC}
                  allowFontScaling={false}
                  className={`mb-4 text-xl font-bold ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-800'
                  }`}>
                  Select Category
                </Text>
                <ScrollView showsVerticalScrollIndicator={false} className="w-full">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.title}
                      style={applistCbg}
                      className={`mb-2 w-full flex-row items-center rounded-xl p-4 ${
                        isImageWallpaper
                          ? 'bg-white/10'
                          : isDarkMode
                            ? 'bg-slate-800/50'
                            : 'bg-slate-50'
                      }`}
                      onPress={() => handleMoveApp(category.title)}>
                      <Text
                        style={appC}
                        allowFontScaling={false}
                        className={`text-[16px] font-medium ${
                          isImageWallpaper
                            ? 'text-white'
                            : isDarkMode
                              ? 'text-slate-300'
                              : 'text-slate-700'
                        }`}>
                        {renamedCategories[category.title] || category.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={quitbg}
                  className={`mt-4 w-full items-center rounded-xl py-3 ${
                    isDarkMode ? 'bg-[#212D41]' : 'bg-[#5B8BDF]'
                  }`}
                  onPress={() => setShowCategorySelector(false)}>
                  <Text
                    style={quit}
                    allowFontScaling={false}
                    className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-white'}`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Rename Category Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={renameCategoryModalVisible}
            onRequestClose={() => setRenameCategoryModalVisible(false)}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={() => setRenameCategoryModalVisible(false)}>
                <View className="flex-1 items-center justify-center bg-black/50">
                  <TouchableWithoutFeedback>
                    <View
                      style={modalbg}
                      className={`w-[320px] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                      <Text
                        style={appC}
                        allowFontScaling={false}
                        className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        Rename Category
                      </Text>

                      <TextInput
                        value={tempCategoryName}
                        onChangeText={setTempCategoryName}
                        placeholder="Category Name"
                        placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                        style={[appC, applistCbg]}
                        className={`mb-6 w-full rounded-lg border px-4 py-3 text-lg ${
                          isImageWallpaper
                            ? 'border-white/20 text-white'
                            : isDarkMode
                              ? 'border-slate-600 bg-slate-800 text-slate-300'
                              : 'border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                        autoFocus
                      />

                      <View className="w-full flex-row gap-3">
                        <TouchableOpacity
                          className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                          onPress={() => setRenameCategoryModalVisible(false)}>
                          <Text
                            allowFontScaling={false}
                            className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={handleSaveCategoryName}>
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

          {/* Create Category Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={createCategoryModalVisible}
            onRequestClose={() => setCreateCategoryModalVisible(false)}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={() => setCreateCategoryModalVisible(false)}>
                <View className="flex-1 items-center justify-center bg-black/50">
                  <TouchableWithoutFeedback>
                    <View
                      style={modalbg}
                      className={`w-[320px] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                      <Text
                        style={appC}
                        allowFontScaling={false}
                        className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                        Create New Category
                      </Text>

                      <TextInput
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        placeholder="Category Name"
                        placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                       style={[appC, applistCbg]}
                        className={`mb-6 w-full rounded-lg border px-4 py-3 text-lg ${
                          isImageWallpaper
                            ? 'border-white/20 text-white'
                            : isDarkMode
                              ? 'border-slate-600 bg-slate-800 text-slate-300'
                              : 'border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                        autoFocus
                      />

                      <View className="w-full flex-row gap-3">
                        <TouchableOpacity
                          className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                          onPress={() => setCreateCategoryModalVisible(false)}>
                          <Text
                            allowFontScaling={false}
                            className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={handleCreateCategory}>
                          <Text allowFontScaling={false} className="font-medium text-white">
                            Create
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </Modal>

          <PremiumModal
            visible={premiumModalVisible}
            onClose={() => setPremiumModalVisible(false)}
            title={premiumModalConfig.title}
            description={premiumModalConfig.description}
          />
        </View>
      </GestureDetector>
    </RootContainer>
  );
}
