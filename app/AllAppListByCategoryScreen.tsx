import React, { useState, useEffect, useMemo } from 'react';
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
  Platform,
  useColorScheme,
  Keyboard,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Launcher from '../modules/launcher';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import * as IntentLauncher from 'expo-intent-launcher';
import { useColorContext } from './context/ColorContext';
import wallpaperFontConfig from './constants/wallpaperFontConfig';


type Category = {
  title: string;
  data: AppItem[];
};

export default function AllAppListByCategoryScreen() {
  const router = useRouter();
  const { isDarkMode, wallpaper, wallpaperIndex } = useColorContext();
  const isImageWallpaper = wallpaper && typeof wallpaper !== 'string';
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [renamedCategories, setRenamedCategories] = useState<{ [key: string]: string }>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [categoryOverrides, setCategoryOverrides] = useState<{ [packageName: string]: string }>({});
  const [appRenames, setAppRenames] = useState<{ [packageName: string]: string }>({});
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [createCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showAppRenamer, setShowAppRenamer] = useState(false);
  const [tempAppName, setTempAppName] = useState('');
  // wallpaperFontConfig
 const fontConfig = wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null;
  const { searchCbg, searchCi, appC, applistC, applistCbg, applistCdu,modalbg,open,numberbg,number } = fontConfig || ({} as any);

  useEffect(() => {
    loadRenamedCategories();
    loadCategoryOverrides();
    loadAppRenames();
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem('customCategories');
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load custom categories', e);
    }
  };

  const loadAppRenames = async () => {
    try {
      const stored = await AsyncStorage.getItem('appRenames');
      if (stored) {
        setAppRenames(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load app renames', e);
    }
  };

  const loadCategoryOverrides = async () => {
    try {
      const stored = await AsyncStorage.getItem('categoryOverrides');
      if (stored) {
        setCategoryOverrides(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load category overrides', e);
    }
  };

  useEffect(() => {
    // Re-categorize when overrides or renames change
    loadAndCategorizeApps();
  }, [categoryOverrides, appRenames, customCategories]);

  const loadRenamedCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem('renamedCategories');
      if (stored) {
        setRenamedCategories(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load renamed categories', e);
    }
  };

  const handleStartEditing = (originalTitle: string, currentDisplayTitle: string) => {
    setEditingCategory(originalTitle);
    setTempCategoryName(currentDisplayTitle);
  };

  const handleSaveCategoryName = async () => {
    if (!editingCategory) return;

    const newRenamed = {
      ...renamedCategories,
      [editingCategory]: tempCategoryName,
    };

    setRenamedCategories(newRenamed);
    setEditingCategory(null);
    try {
      await AsyncStorage.setItem('renamedCategories', JSON.stringify(newRenamed));
    } catch (e) {
      console.error('Failed to save category name', e);
    }
  };

  const handleCancelEditing = () => {
    setEditingCategory(null);
    setTempCategoryName('');
  };

  const loadAndCategorizeApps = async () => {
    try {
      const installedApps = Launcher.getInstalledApps();
      const categorized = categorizeApps(installedApps);
      setCategories(categorized);
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

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

    // Convert grouped object to array of Category objects
    const result = Object.keys(groups).map((title) => ({
      title,
      data: groups[title],
    }));

    // Sort categories: "Other" goes to the bottom, rest alphabetical
    return result.sort((a, b) => {
      if (a.title === 'Other') return 1;
      if (b.title === 'Other') return -1;
      return a.title.localeCompare(b.title);
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const updatedCustomCategories = [...customCategories, newCategoryName.trim()];
    setCustomCategories(updatedCustomCategories);
    setCreateCategoryModalVisible(false);
    setNewCategoryName('');

    try {
      await AsyncStorage.setItem('customCategories', JSON.stringify(updatedCustomCategories));
    } catch (e) {
      console.error('Failed to save custom category', e);
    }
  };

  const handleLaunchApp = (packageName: string) => {
    try {
      const success = Launcher.launchApp(packageName);
      if (!success) {
        console.log('Could not launch app:', packageName);
      }
    } catch (e) {
      console.error('Error opening app:', e);
    }
  };

  const handleAppInfo = () => {
    if (!selectedApp) return;
    IntentLauncher.startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
      data: 'package:' + selectedApp.packageName,
    });
    closeModal();
  };

  const handleUninstall = () => {
    if (!selectedApp) return;
    IntentLauncher.startActivityAsync('android.intent.action.DELETE', {
      data: 'package:' + selectedApp.packageName,
    });
    closeModal();
  };

  const startAppRenaming = () => {
    if (!selectedApp) return;
    setTempAppName(selectedApp.label);
    setShowAppRenamer(true);
  };

  const saveAppRename = async () => {
    if (!selectedApp) return;
    const newRenames = {
      ...appRenames,
      [selectedApp.packageName]: tempAppName,
    };
    setAppRenames(newRenames);
    try {
      await AsyncStorage.setItem('appRenames', JSON.stringify(newRenames));
    } catch (e) {
      console.error('Failed to save app rename', e);
    }
    closeModal();
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    return categories
      .map((cat) => ({
        ...cat,
        data: cat.data.filter((app) => app.label.toLowerCase().includes(searchQuery.toLowerCase())),
      }))
      .filter((cat) => cat.data.length > 0);
  }, [categories, searchQuery]);

  const formatUsageTime = (millis?: number) => {
    if (!millis) return '0 min';
    const minutes = Math.floor(millis / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  const handleLongPress = (app: AppItem) => {
    setSelectedApp(app);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedApp(null);
    setShowCategorySelector(false);
    setShowAppRenamer(false);
  };

  const handleMoveApp = async (targetCategory: string) => {
    if (!selectedApp) return;

    const newOverrides = {
      ...categoryOverrides,
      [selectedApp.packageName]: targetCategory,
    };

    setCategoryOverrides(newOverrides);
    try {
      await AsyncStorage.setItem('categoryOverrides', JSON.stringify(newOverrides));
    } catch (e) {
      console.error('Failed to save category override', e);
    }
    closeModal();
  };

  if (loading) {
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
    .onEnd(() => {
      runOnJS(router.back)();
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isImageWallpaper && (
        <Image source={wallpaper as any} className="absolute h-full w-full" resizeMode="cover" />
      )}
      <GestureDetector gesture={leftSwipeGesture}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View
          className="flex-1 pt-12"
          style={{
            backgroundColor: wallpaper
              ? typeof wallpaper === 'string'
                ? wallpaper
                : 'transparent'
              : isDarkMode
                ? '#0D121A'
                : '#EBF1F7',
          }}>
          <View className="flex-1 px-4">
        {/* Search Bar */}
        <View
        style={searchCbg}
          className={`mb-6 flex-row items-center rounded-xl border px-4 py-1  ${
            isImageWallpaper
              ? 'border-white/20 bg-black/30'
              : isDarkMode
                ? 'bg-[#131B27] border-[#212D41]'
                : 'bg-white border-slate-100'
          }`}>
          <MaterialCommunityIcons
            style={searchCi}
            name="magnify"
            size={20}
            color={isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C59' : '#5C8BCC'}
          />
          <TextInput
            style={searchCi}
            className={`ml-3 flex-1 text-[16px] ${
              isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#fff]' : 'text-[#A3B9D9]'
            }`}
            placeholder="Search app here"
            placeholderTextColor={
             searchCi?.color || (isImageWallpaper ? '#94A3B8' : isDarkMode ? '#64748B' : '#A3B9D9')
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            cursorColor={searchCi?.color || (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C59' : '#A3B9D9')}
            autoFocus={true}
            showSoftInputOnFocus={isKeyboardEnabled}
            onTouchStart={() => setIsKeyboardEnabled(true)}
          />
        </View>

        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text
            allowFontScaling={false}
            style={appC}
            className={`text-[18px] font-bold underline decoration-2 underline-offset-4 ${
              isImageWallpaper
                ? 'text-white decoration-white'
                : isDarkMode
                  ? 'text-[#DBDFE4] decoration-slate-400'
                  : 'text-[#142C4D] decoration-[#142C4D]'
            }`}>
            App Category
          </Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => setCreateCategoryModalVisible(true)}>
              <View
                style={[appC, {borderColor: appC?.color || (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')}]}
                className={`rounded-lg border border-2 ${
                  isImageWallpaper
                    ? 'border-white/50'
                    : isDarkMode
                      ? 'border-[#728099]'
                      : 'border-[#858E9D]'
                }`}>
                <MaterialCommunityIcons
                  name="plus"
                  size={22}
                  color={appC?.color || (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')}
                />
              </View>
            </TouchableOpacity>
            <Link href="/settingScreen" asChild>
              <TouchableOpacity>
                <View
                  style={[appC, {borderColor: appC?.color || (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')}]}
                  className={`rounded-lg border border-2 ${
                    isImageWallpaper
                      ? 'border-white/50'
                      : isDarkMode
                        ? 'border-[#858E9D]'
                        : 'border-[#858E9D]'
                  }`}>
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={22}
                    color={appC?.color || (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')}
                  />
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}>
    
          {filteredCategories.map((category, index) => {
            const displayTitle = renamedCategories[category.title] || category.title;
            const isEditing = editingCategory === category.title;

            return (
              <View key={index} className="">
                {/* Category Header */}
                {isEditing ? (
                  <View className="mb-2 flex-row items-center justify-end">
                    <TextInput
                      value={tempCategoryName}
                      onChangeText={setTempCategoryName}
                      className={`mr-2 min-w-[100px] border-b px-1 text-right text-base ${
                        isImageWallpaper
                          ? 'text-white border-white/50'
                          : isDarkMode
                            ? 'text-slate-300 border-slate-500'
                            : 'text-slate-600 border-slate-400'
                      }`}
                      autoFocus
                      onSubmitEditing={handleSaveCategoryName}
                    />
                    <TouchableOpacity onPress={handleSaveCategoryName} className="mr-2">
                      <MaterialCommunityIcons name="check" size={20} color="#4ADE80" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelEditing}>
                      <MaterialCommunityIcons name="close" size={20} color="#F87171" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="mb-2 flex-row items-center justify-end">
                    <Text
                      allowFontScaling={false}
                      style={appC}
                      className={`mr-2 text-[16px] ${
                        isImageWallpaper
                          ? 'text-white'
                          : isDarkMode
                            ? 'text-[#728099]'
                            : 'text-[#142C4D]'
                      }`}>
                      {displayTitle}
                    </Text>
                    <TouchableOpacity
                      style={[appC, {borderColor: appC?.color || (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')}]}
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
                        color={appC?.color || (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D')}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* App List */}
                <View className="space-y-2">
                  {category.data.map((app) => (
                    <TouchableOpacity
                      key={app.packageName}
                      style={applistCbg}
                      className={`mb-2 w-full flex-row items-center justify-between rounded-xl px-4 py-3  ${
                        isImageWallpaper
                          ? 'bg-black/40'
                          : isDarkMode
                            ? 'bg-[#131B27]'
                            : 'bg-[#CEDDF2]'
                      }`}
                      onPress={() => handleLaunchApp(app.packageName)}
                      onLongPress={() => handleLongPress(app)}>
                      <Text
                        allowFontScaling={false}
                        style={[applistC, { maxWidth: '60%' }]}
                        className={`text-[16px] font-regular ${
                          isImageWallpaper
                            ? 'text-white'
                            : isDarkMode
                              ? 'text-[#DBDFE5]'
                              : 'text-[#142C4D]'
                        }`}
                        numberOfLines={1}>
                        {app.label}
                      </Text>
                      <View className="flex-row items-center">
                        <Text
                          allowFontScaling={false}
                          style={applistCdu}
                          className={`text-[12px] font-regular opacity-90 ${
                            isImageWallpaper
                              ? 'text-slate-300'
                              : isDarkMode
                                ? 'text-[#728099]'
                                : 'text-[#4D6D99]'
                          }`}>
                          TO: {app.launchCount || 0} Times || DU: {formatUsageTime(app.usageTime)}
                        </Text>
                      </View>
                    </TouchableOpacity>
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

      {/* App Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <TouchableWithoutFeedback>
              <View style={modalbg} className={`w-[85%] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
                {selectedApp && (
                  <>
                    <Text allowFontScaling={false} style={open} className={`mb-6 text-[16px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                      {selectedApp.label} Options
                    </Text>

                    {/* App Icon */}
                    <View className="mb-8 rounded-full p-4">
                      <Image
                        source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                        className="h-16 w-16"
                      />
                    </View>

                    {/* Options Grid */}
                    {!showCategorySelector && !showAppRenamer ? (
                      <View className="w-full flex-row flex-wrap justify-between gap-y-4">
                        {/* Move to */}
                        <TouchableOpacity
                          style={numberbg}
                          className={`w-[48%] items-center rounded-lg ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'} py-3`}
                          onPress={() => setShowCategorySelector(true)}>
                          <Text style={number} allowFontScaling={false} className={`text-base font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>Move to</Text>
                        </TouchableOpacity>

                        {/* Copy to */}
                        <TouchableOpacity
                          style={numberbg}
                          className={`w-[48%] items-center rounded-lg ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'} py-3`}
                          onPress={() => console.log('Copy to')}>
                          <Text style={number} allowFontScaling={false} className={`text-base font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>Copy to</Text>
                        </TouchableOpacity>

                        {/* Block */}
                        <TouchableOpacity
                          style={numberbg}
                          className={`w-[48%] items-center rounded-lg ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'} py-3`}
                          onPress={() => console.log('Block')}>
                          <Text style={number} allowFontScaling={false} className={`text-base font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>Block</Text>
                        </TouchableOpacity>

                        {/* Rename */}
                        <TouchableOpacity
                          style={numberbg}
                          className={`w-[48%] items-center rounded-lg ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'} py-3`}
                          onPress={startAppRenaming}>
                          <Text style={number} allowFontScaling={false} className={`text-base font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>Rename</Text>
                        </TouchableOpacity>

                        {/* App Info */}
                        <TouchableOpacity
                          style={numberbg}
                          className={`w-[48%] items-center rounded-lg ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'} py-3`}
                          onPress={handleAppInfo}>
                          <Text style={number} allowFontScaling={false} className={`text-base font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>App Info</Text>
                        </TouchableOpacity>

                        {/* Uninstall */}
                        <TouchableOpacity
                          style={numberbg}
                          className={`w-[48%] items-center rounded-lg ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA6E0]'} py-3`}
                          onPress={handleUninstall}>
                          <Text style={number} allowFontScaling={false} className={`text-base font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>Uninstall</Text>
                        </TouchableOpacity>
                      </View>
                    ) : showAppRenamer ? (
                      <View className="w-full">
                        <Text style={appC} allowFontScaling={false} className={`mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rename App:</Text>
                        <TextInput
                          value={tempAppName}
                          onChangeText={setTempAppName}
                          style={[appC, applistCbg]}
                          className={`mb-4 rounded-lg border px-4 py-3 text-lg ${
                            isImageWallpaper
                              ? 'border-white/20 text-white'
                              : isDarkMode
                                ? 'bg-slate-800 border-slate-600 text-slate-300'
                                : 'bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                          selectTextOnFocus
                        />
                        <View className="flex-row gap-3">
                          <TouchableOpacity
                            className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                            onPress={() => setShowAppRenamer(false)}>
                            <Text allowFontScaling={false} className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                            onPress={saveAppRename}>
                            <Text allowFontScaling={false} className="font-medium text-white">Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View className="h-64 w-full">
                        <Text style={applistC} allowFontScaling={false} className={`mb-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Select Category:</Text>
                        <ScrollView className="w-full flex-1">
                          {categories.map((cat, idx) => (
                            <TouchableOpacity
                              key={idx}
                              style={applistC}
                              className={`border-b py-3 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}
                              onPress={() => handleMoveApp(cat.title)}>
                              <Text style={applistC} allowFontScaling={false} className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {renamedCategories[cat.title] || cat.title}
                              </Text>
                            </TouchableOpacity>
                          ))}
                          {/* Always add 'Other' as an option if not present */}
                          {!categories.find((c) => c.title === 'Other') && (
                            <TouchableOpacity
                              className={`border-b py-3 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}
                              onPress={() => handleMoveApp('Other')}>
                              <Text allowFontScaling={false} className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Other</Text>
                            </TouchableOpacity>
                          )}
                        </ScrollView>
                        <TouchableOpacity
                          style={numberbg}
                          className={`mt-4 items-center rounded-lg py-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                          onPress={() => setShowCategorySelector(false)}>
                          <Text style={number} allowFontScaling={false} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={() => setCreateCategoryModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className={`w-[85%] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <Text allowFontScaling={false} className={`mb-4 text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  Create New Category
                </Text>

                <TextInput
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Category Name"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  className={`mb-6 w-full rounded-lg border px-4 py-3 text-lg ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'}`}
                  autoFocus
                />

                <View className="w-full flex-row gap-3">
                  <TouchableOpacity
                    className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                    onPress={() => setCreateCategoryModalVisible(false)}>
                    <Text allowFontScaling={false} className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                    onPress={handleCreateCategory}>
                    <Text allowFontScaling={false} className="font-medium text-white">Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
        </View>
        </KeyboardAvoidingView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
