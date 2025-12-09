import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Launcher from '../modules/launcher';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { openApplication } from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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
        setSelectedPackageNames(parsed.map(a => a.packageName));
      }
    } catch (e) {
      console.error("Failed to load home apps", e);
    }
  };

  const handleSaveSelection = async () => {
    try {
      // Filter the full apps list to get the full AppItem objects for selected packages
      const selectedAppItems = apps.filter(app => selectedPackageNames.includes(app.packageName));
      await AsyncStorage.setItem('homeApps', JSON.stringify(selectedAppItems));
      router.back();
    } catch (e) {
      console.error("Failed to save selection", e);
    }
  };

  const loadApps = async () => {
    try {
      const installedApps = Launcher.getInstalledApps();
      setApps(installedApps);
    } catch (error) {
      console.error("Failed to load apps:", error);
    }
  };

  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;
    return apps.filter(app => 
      app.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apps, searchQuery]);

  const handleAppPress = (app: AppItem) => {
    if (isSelectMode) {
      setSelectedPackageNames(prev => {
        if (prev.includes(app.packageName)) {
          return prev.filter(p => p !== app.packageName);
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
                "Permission Required",
                "To track usage limits, please grant Usage Access permission.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => {
                        Launcher.openUsageAccessSettings();
                    }}
                ]
             );
             return;
        }

        const hasNotificationPermission = Launcher.checkNotificationPermission();
        if (!hasNotificationPermission) {
             Alert.alert(
                "Permission Required",
                "To show the usage monitor notification, please grant Notification permission.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => {
                        Launcher.openNotificationSettings();
                    }}
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
        console.error("Failed to launch app:", error);
      }
    }
  };

  const renderItem = ({ item }: { item: AppItem }) => {
    const formatUsageTime = (millis?: number) => {
        if (!millis) return "";
        const hours = Math.floor(millis / (1000 * 60 * 60));
        const minutes = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const usageText = formatUsageTime(item.usageTime);
    const isSelected = selectedPackageNames.includes(item.packageName);

    return (
    <TouchableOpacity 
      className={`flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50 ${isSelectMode && isSelected ? 'bg-blue-50' : ''}`}
      onPress={() => handleAppPress(item)}
    >
      {isSelectMode && (
        <View className="mr-3">
          <Ionicons 
            name={isSelected ? "checkbox" : "square-outline"} 
            size={24} 
            color={isSelected ? "#3B82F6" : "#9CA3AF"} 
          />
        </View>
      )}
      {item.icon ? (
        <Image 
          source={{ uri: `data:image/png;base64,${item.icon}` }} 
          className="w-12 h-12 rounded-full mr-4"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 items-center justify-center">
          <Text className="text-gray-500 text-xl font-bold">{item.label.charAt(0)}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{item.label}</Text>
        <Text className="text-sm text-gray-500" numberOfLines={1}>{item.packageName}</Text>
      </View>
      {usageText ? (
          <View className="ml-2 px-2 py-1 bg-gray-100 rounded">
              <Text className="text-xs text-gray-600 font-medium">{usageText}</Text>
          </View>
      ) : null}
    </TouchableOpacity>
  )};

  return (
    <View className="flex-1 bg-white pt-12">
      <View className="px-4 pb-4 border-b border-gray-200 flex-row items-center justify-between gap-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
             <Text className="text-blue-500 font-bold">Back</Text>
        </TouchableOpacity>
        <TextInput
          className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-base text-gray-900"
          placeholder="Search apps..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isSelectMode && (
          <TouchableOpacity onPress={handleSaveSelection} className="p-2">
             <Text className="text-blue-500 font-bold">Done</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={filteredApps}
        renderItem={renderItem}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={{ paddingBottom: 20 }}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white w-[85%] rounded-3xl p-6 shadow-xl">
            <View className="items-center mb-6">
                <Text className="text-xl font-bold text-center text-gray-900 mb-4">
                Open {selectedApp?.label}
                </Text>
                
                {selectedApp?.icon && (
                    <Image 
                    source={{ uri: `data:image/png;base64,${selectedApp.icon}` }} 
                    className="w-20 h-20 mb-6"
                    resizeMode="contain"
                    />
                )}
                
                <Text className="text-gray-800 text-center text-base font-medium">
                    Select estimated use time
                </Text>
            </View>

            <View className="flex-row flex-wrap justify-between mb-6">
                {[2, 5, 10, 20].map((mins) => (
                    <TouchableOpacity
                        key={mins}
                        className="w-[48%] bg-[#7EA6E0] py-3 rounded-full mb-3 items-center active:opacity-80"
                        onPress={() => handleLaunchApp(mins)}
                    >
                        <Text className="text-base font-medium text-white">{mins} min</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="border-t border-gray-200 pt-6 mt-2">
              <TouchableOpacity 
                className="w-full bg-[#4B7ABE] py-3 rounded-full items-center active:opacity-80"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white text-base font-medium">Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
