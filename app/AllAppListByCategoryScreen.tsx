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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Launcher from '../modules/launcher';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import * as IntentLauncher from 'expo-intent-launcher';
import { StatusBar } from 'react-native';

type Category = {
  title: string;
  data: AppItem[];
};

export default function AllAppListByCategoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
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
      <View className="flex-1 items-center justify-center bg-[#EEF2F6]">
        <ActivityIndicator size="large" color="#7EA6E0" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 px-4 pt-2">
        {/* Search Bar */}
        <View className="mb-6 flex-row items-center rounded-full border border-slate-100 bg-white px-4 py-1 shadow-sm">
          <MaterialCommunityIcons name="magnify" size={20} color="#5C8BCC" />
          <TextInput
            className="ml-3 flex-1 text-[16px] text-slate-600"
            placeholder="Search app here|"
            placeholderTextColor="#A3B9D9"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text
            allowFontScaling={false}
            className="text-[18px] font-bold text-[#858E9D] underline decoration-[#858E9D] decoration-2 underline-offset-4">
            App Category
          </Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => setCreateCategoryModalVisible(true)}>
              <View className="rounded-lg border border-2 border-[#858E9D] ">
                <MaterialCommunityIcons name="plus" size={24} color="#858E9D" />
              </View>
            </TouchableOpacity>
            <Link href="/settingScreen" asChild>
              <TouchableOpacity>
                <View className="rounded-lg border border-2 border-[#858E9D] ">
                  <MaterialCommunityIcons name="tune-variant" size={24} color="#858E9D" />
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}>
            <StatusBar backgroundColor="#EEF2F6" barStyle="dark-content" />
          {filteredCategories.map((category, index) => {
            const displayTitle = renamedCategories[category.title] || category.title;
            const isEditing = editingCategory === category.title;

            return (
              <View key={index} className="mb-6">
                {/* Category Header */}
                {isEditing ? (
                  <View className="mb-2 flex-row items-center justify-end">
                    <TextInput
                      value={tempCategoryName}
                      onChangeText={setTempCategoryName}
                      className="mr-2 min-w-[100px] border-b border-slate-400 px-1 text-right text-base text-slate-600"
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
                    <Text allowFontScaling={false} className="mr-2 text-[16px] text-[#858E9D]">{displayTitle}</Text>
                    <TouchableOpacity 
                      className="border-b border-[#858E9D]"
                      onPress={() => handleStartEditing(category.title, displayTitle)}>
                      <MaterialCommunityIcons name="pencil-outline" size={16} color="#858E9D" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* App List */}
                <View className="space-y-2">
                  {category.data.map((app) => (
                    <TouchableOpacity
                      key={app.packageName}
                      className="mb-2 w-full flex-row items-center justify-between rounded-xl bg-[#7FA8E5] px-4 py-3 shadow-sm"
                      onPress={() => handleLaunchApp(app.packageName)}
                      onLongPress={() => handleLongPress(app)}>
                      <Text allowFontScaling={false}
                        className="text-[16px] font-regular text-white"
                        numberOfLines={1}
                        style={{ maxWidth: '60%' }}>
                        {app.label}
                      </Text>
                      <View className="flex-row items-center">
                        <Text allowFontScaling={false} className="text-[12px] text-white font-regular opacity-90">
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
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="w-[85%] items-center rounded-2xl bg-white p-6 shadow-lg">
                {selectedApp && (
                  <>
                    <Text className="mb-6 text-xl font-semibold text-slate-800">
                      {selectedApp.label} Options
                    </Text>

                    {/* App Icon */}
                    <View className="mb-8 rounded-full bg-[#5B8BDF] p-4">
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
                          className="w-[48%] items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={() => setShowCategorySelector(true)}>
                          <Text className="text-base font-medium text-white">Move to</Text>
                        </TouchableOpacity>

                        {/* Copy to */}
                        <TouchableOpacity
                          className="w-[48%] items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={() => console.log('Copy to')}>
                          <Text className="text-base font-medium text-white">Copy to</Text>
                        </TouchableOpacity>

                        {/* Block */}
                        <TouchableOpacity
                          className="w-[48%] items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={() => console.log('Block')}>
                          <Text className="text-base font-medium text-white">Block</Text>
                        </TouchableOpacity>

                        {/* Rename */}
                        <TouchableOpacity
                          className="w-[48%] items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={startAppRenaming}>
                          <Text className="text-base font-medium text-white">Rename</Text>
                        </TouchableOpacity>

                        {/* App Info */}
                        <TouchableOpacity
                          className="w-[48%] items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={handleAppInfo}>
                          <Text className="text-base font-medium text-white">App Info</Text>
                        </TouchableOpacity>

                        {/* Uninstall */}
                        <TouchableOpacity
                          className="w-[48%] items-center rounded-lg bg-[#7EA6E0] py-3"
                          onPress={handleUninstall}>
                          <Text className="text-base font-medium text-white">Uninstall</Text>
                        </TouchableOpacity>
                      </View>
                    ) : showAppRenamer ? (
                      <View className="w-full">
                        <Text className="mb-2 font-medium text-slate-600">Rename App:</Text>
                        <TextInput
                          value={tempAppName}
                          onChangeText={setTempAppName}
                          className="mb-4 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-lg text-slate-700"
                          autoFocus
                          selectTextOnFocus
                        />
                        <View className="flex-row gap-3">
                          <TouchableOpacity
                            className="flex-1 items-center rounded-lg bg-slate-200 py-3"
                            onPress={() => setShowAppRenamer(false)}>
                            <Text className="font-medium text-slate-600">Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                            onPress={saveAppRename}>
                            <Text className="font-medium text-white">Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View className="h-64 w-full">
                        <Text className="mb-2 font-medium text-slate-600">Select Category:</Text>
                        <ScrollView className="w-full flex-1">
                          {categories.map((cat, idx) => (
                            <TouchableOpacity
                              key={idx}
                              className="border-b border-slate-100 py-3"
                              onPress={() => handleMoveApp(cat.title)}>
                              <Text className="text-lg text-slate-700">
                                {renamedCategories[cat.title] || cat.title}
                              </Text>
                            </TouchableOpacity>
                          ))}
                          {/* Always add 'Other' as an option if not present */}
                          {!categories.find((c) => c.title === 'Other') && (
                            <TouchableOpacity
                              className="border-b border-slate-100 py-3"
                              onPress={() => handleMoveApp('Other')}>
                              <Text className="text-lg text-slate-700">Other</Text>
                            </TouchableOpacity>
                          )}
                        </ScrollView>
                        <TouchableOpacity
                          className="mt-4 items-center rounded-lg bg-slate-200 py-2"
                          onPress={() => setShowCategorySelector(false)}>
                          <Text className="text-slate-600">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={createCategoryModalVisible}
        onRequestClose={() => setCreateCategoryModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setCreateCategoryModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="w-[85%] items-center rounded-2xl bg-white p-6 shadow-lg">
                <Text className="mb-4 text-xl font-semibold text-slate-800">
                  Create New Category
                </Text>

                <TextInput
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Category Name"
                  className="mb-6 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-lg text-slate-700"
                  autoFocus
                />

                <View className="w-full flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 items-center rounded-lg bg-slate-200 py-3"
                    onPress={() => setCreateCategoryModalVisible(false)}>
                    <Text className="font-medium text-slate-600">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                    onPress={handleCreateCategory}>
                    <Text className="font-medium text-white">Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
