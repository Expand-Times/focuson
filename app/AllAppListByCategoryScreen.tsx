import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Launcher from '../modules/launcher';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import * as IntentLauncher from 'expo-intent-launcher';

type Category = {
  title: string;
  data: AppItem[];
};

export default function AllAppListByCategoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [renamedCategories, setRenamedCategories] = useState<{[key: string]: string}>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [categoryOverrides, setCategoryOverrides] = useState<{[packageName: string]: string}>({});
  const [appRenames, setAppRenames] = useState<{[packageName: string]: string}>({});
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
          console.error("Failed to load custom categories", e);
      }
  };

  const loadAppRenames = async () => {
    try {
        const stored = await AsyncStorage.getItem('appRenames');
        if (stored) {
            setAppRenames(JSON.parse(stored));
        }
    } catch (e) {
        console.error("Failed to load app renames", e);
    }
  };

  const loadCategoryOverrides = async () => {
    try {
        const stored = await AsyncStorage.getItem('categoryOverrides');
        if (stored) {
            setCategoryOverrides(JSON.parse(stored));
        }
    } catch (e) {
        console.error("Failed to load category overrides", e);
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
      console.error("Failed to load renamed categories", e);
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
      [editingCategory]: tempCategoryName
    };
    
    setRenamedCategories(newRenamed);
    setEditingCategory(null);
    try {
      await AsyncStorage.setItem('renamedCategories', JSON.stringify(newRenamed));
    } catch (e) {
      console.error("Failed to save category name", e);
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
      console.error("Failed to load apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const categorizeApps = (apps: AppItem[]): Category[] => {
    const groups: { [key: string]: AppItem[] } = {};

    // Initialize with custom categories
    customCategories.forEach(cat => {
        groups[cat] = [];
    });

    apps.forEach(app => {
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
    const result = Object.keys(groups).map(title => ({
      title,
      data: groups[title]
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
          console.error("Failed to save custom category", e);
      }
  };

  const handleLaunchApp = (packageName: string) => {
      try {
          const success = Launcher.launchApp(packageName);
          if (!success) {
             console.log("Could not launch app:", packageName);
          }
      } catch (e) {
          console.error("Error opening app:", e);
      }
  };

  const handleAppInfo = () => {
    if (!selectedApp) return;
    IntentLauncher.startActivityAsync("android.settings.APPLICATION_DETAILS_SETTINGS", {
        data: 'package:' + selectedApp.packageName
    });
    closeModal();
  };

  const handleUninstall = () => {
    if (!selectedApp) return;
    IntentLauncher.startActivityAsync("android.intent.action.DELETE", {
        data: 'package:' + selectedApp.packageName
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
        [selectedApp.packageName]: tempAppName
    };
    setAppRenames(newRenames);
    try {
        await AsyncStorage.setItem('appRenames', JSON.stringify(newRenames));
    } catch (e) {
        console.error("Failed to save app rename", e);
    }
    closeModal();
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    return categories.map(cat => ({
      ...cat,
      data: cat.data.filter(app => 
        app.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.data.length > 0);
  }, [categories, searchQuery]);

  const formatUsageTime = (millis?: number) => {
    if (!millis) return "0 min";
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
          [selectedApp.packageName]: targetCategory
      };

      setCategoryOverrides(newOverrides);
      try {
          await AsyncStorage.setItem('categoryOverrides', JSON.stringify(newOverrides));
      } catch (e) {
          console.error("Failed to save category override", e);
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
        <View className="bg-white rounded-full flex-row items-center px-4 py-3 mb-6 shadow-sm border border-slate-100">
          <MaterialCommunityIcons name="magnify" size={24} color="#94A3B8" />
          <TextInput 
            className="flex-1 ml-3 text-slate-600 text-base"
            placeholder="Search app here"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-slate-500 underline decoration-slate-400 decoration-2 underline-offset-4">All Apps</Text>
          <TouchableOpacity onPress={() => setCreateCategoryModalVisible(true)}>
             <MaterialCommunityIcons name="filter-variant" size={24} color="#94A3B8" />
          </TouchableOpacity>
          <Link href="/settingScreen" asChild>
            <TouchableOpacity>
               <MaterialCommunityIcons name="tune-variant" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {filteredCategories.map((category, index) => {
            const displayTitle = renamedCategories[category.title] || category.title;
            const isEditing = editingCategory === category.title;

            return (
            <View key={index} className="mb-6">
              {/* Category Header */}
              {isEditing ? (
                <View className="flex-row justify-end items-center mb-2">
                   <TextInput 
                     value={tempCategoryName}
                     onChangeText={setTempCategoryName}
                     className="border-b border-slate-400 text-slate-600 text-base mr-2 px-1 min-w-[100px] text-right"
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
                <View className="flex-row justify-end items-center mb-2">
                  <Text className="text-slate-500 text-base mr-2">{displayTitle}</Text>
                  <TouchableOpacity onPress={() => handleStartEditing(category.title, displayTitle)}>
                      <MaterialCommunityIcons name="pencil-outline" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              )}

              {/* App List */}
              <View className="space-y-2">
                {category.data.map((app) => (
                  <TouchableOpacity 
                    key={app.packageName}
                    className="w-full bg-[#7EA6E0] rounded-xl py-3 px-4 mb-2 flex-row justify-between items-center shadow-sm"
                    onPress={() => handleLaunchApp(app.packageName)}
                    onLongPress={() => handleLongPress(app)}
                  >
                    <Text className="text-white text-lg font-medium" numberOfLines={1} style={{maxWidth: '60%'}}>
                        {app.label}
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-white text-xs opacity-90">
                            TO: {app.launchCount || 0} Times  ||  DU: {formatUsageTime(app.usageTime)}
                        </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ); })}
          
          {filteredCategories.length === 0 && (
              <View className="items-center mt-10">
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
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl w-[85%] p-6 items-center shadow-lg">
                {selectedApp && (
                  <>
                    <Text className="text-xl font-semibold text-slate-800 mb-6">
                      {selectedApp.label} Options
                    </Text>
                    
                    {/* App Icon */}
                    <View className="bg-[#5B8BDF] p-4 rounded-full mb-8">
                       <Image 
                         source={{ uri: `data:image/png;base64,${selectedApp.icon}` }} 
                         className="w-16 h-16"
                       />
                    </View>

                    {/* Options Grid */}
                    {!showCategorySelector && !showAppRenamer ? (
                    <View className="flex-row flex-wrap justify-between w-full gap-y-4">
                        {/* Move to */}
                        <TouchableOpacity className="w-[48%] bg-[#7EA6E0] py-3 rounded-lg items-center" onPress={() => setShowCategorySelector(true)}>
                           <Text className="text-white font-medium text-base">Move to</Text>
                        </TouchableOpacity>

                        {/* Copy to */}
                        <TouchableOpacity className="w-[48%] bg-[#7EA6E0] py-3 rounded-lg items-center" onPress={() => console.log('Copy to')}>
                           <Text className="text-white font-medium text-base">Copy to</Text>
                        </TouchableOpacity>

                        {/* Block */}
                        <TouchableOpacity className="w-[48%] bg-[#7EA6E0] py-3 rounded-lg items-center" onPress={() => console.log('Block')}>
                           <Text className="text-white font-medium text-base">Block</Text>
                        </TouchableOpacity>

                        {/* Rename */}
                        <TouchableOpacity className="w-[48%] bg-[#7EA6E0] py-3 rounded-lg items-center" onPress={startAppRenaming}>
                           <Text className="text-white font-medium text-base">Rename</Text>
                        </TouchableOpacity>

                        {/* App Info */}
                        <TouchableOpacity className="w-[48%] bg-[#7EA6E0] py-3 rounded-lg items-center" onPress={handleAppInfo}>
                           <Text className="text-white font-medium text-base">App Info</Text>
                        </TouchableOpacity>

                        {/* Uninstall */}
                        <TouchableOpacity className="w-[48%] bg-[#7EA6E0] py-3 rounded-lg items-center" onPress={handleUninstall}>
                           <Text className="text-white font-medium text-base">Uninstall</Text>
                        </TouchableOpacity>
                    </View>
                    ) : showAppRenamer ? (
                        <View className="w-full">
                            <Text className="text-slate-600 mb-2 font-medium">Rename App:</Text>
                            <TextInput 
                                value={tempAppName}
                                onChangeText={setTempAppName}
                                className="border border-slate-300 rounded-lg px-4 py-3 text-slate-700 text-lg mb-4 bg-slate-50"
                                autoFocus
                                selectTextOnFocus
                            />
                            <View className="flex-row gap-3">
                                <TouchableOpacity className="flex-1 py-3 bg-slate-200 rounded-lg items-center" onPress={() => setShowAppRenamer(false)}>
                                    <Text className="text-slate-600 font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 py-3 bg-[#7EA6E0] rounded-lg items-center" onPress={saveAppRename}>
                                    <Text className="text-white font-medium">Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View className="w-full h-64">
                            <Text className="text-slate-600 mb-2 font-medium">Select Category:</Text>
                            <ScrollView className="flex-1 w-full">
                                {categories.map((cat, idx) => (
                                    <TouchableOpacity 
                                        key={idx} 
                                        className="py-3 border-b border-slate-100"
                                        onPress={() => handleMoveApp(cat.title)}
                                    >
                                        <Text className="text-slate-700 text-lg">
                                            {renamedCategories[cat.title] || cat.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {/* Always add 'Other' as an option if not present */}
                                {!categories.find(c => c.title === 'Other') && (
                                     <TouchableOpacity 
                                        className="py-3 border-b border-slate-100"
                                        onPress={() => handleMoveApp('Other')}
                                     >
                                        <Text className="text-slate-700 text-lg">Other</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                            <TouchableOpacity className="mt-4 py-2 bg-slate-200 rounded-lg items-center" onPress={() => setShowCategorySelector(false)}>
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
        onRequestClose={() => setCreateCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCreateCategoryModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl w-[85%] p-6 items-center shadow-lg">
                <Text className="text-xl font-semibold text-slate-800 mb-4">Create New Category</Text>
                
                <TextInput 
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Category Name"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-700 text-lg mb-6 bg-slate-50"
                    autoFocus
                />

                <View className="flex-row gap-3 w-full">
                    <TouchableOpacity 
                        className="flex-1 py-3 bg-slate-200 rounded-lg items-center" 
                        onPress={() => setCreateCategoryModalVisible(false)}
                    >
                        <Text className="text-slate-600 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className="flex-1 py-3 bg-[#7EA6E0] rounded-lg items-center" 
                        onPress={handleCreateCategory}
                    >
                        <Text className="text-white font-medium">Create</Text>
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
