import React, { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Image,
  Alert,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useColorContext } from '../context/ColorContext';
import wallpaperFontConfig from '../constants/wallpaperFontConfig';
import { AppItem } from '../../modules/launcher/src/Launcher.types';

type SelectAppModalProps = {
  visible: boolean;
  onClose: () => void;
};

type FlatListHeader = { type: 'header'; title: string };
type FlatListItem = { type: 'item'; data: AppItem; sectionTitle: string };
type FlatListDataItem = FlatListHeader | FlatListItem;

const AppListItem = memo(({ 
  item, 
  isSelected, 
  onPress, 
  isImageWallpaper, 
  isDarkMode, 
  applist, 
  applistbg, 
  wallpaperIndex 
}: any) => {
  return (
    <TouchableOpacity
      style={applistbg}
      className={`mb-2 w-full flex-row items-center justify-between rounded-xl px-4 py-3 ${
        isImageWallpaper ? '' : isDarkMode ? 'bg-[#131B26]' : 'bg-[#CEDDF2]'
      }`}
      onPress={() => onPress(item.data)}>
      <View className="flex-1 flex-row items-center">
        <Ionicons
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={20}
          color={
            applist?.color || (isImageWallpaper ? 'white' : isDarkMode ? '#DADFE5' : '#142C4D')
          }
          style={[{ marginRight: 8 }, applist]}
        />
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
          style={applist}
          className={`font-regular text-[17px] ${
            isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#142C4D]'
          }`}
          numberOfLines={1}>
          {item.data.label.length > 15 ? `${item.data.label.slice(0, 15)}...` : item.data.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export const SelectAppModal = ({ visible, onClose }: SelectAppModalProps) => {
  const {
    apps: rawApps,
    homeApps,
    updateHomeApps,
    pinnedPackageNames,
    blockedPackageNames,
    hiddenApps,
    appRenames,
  } = useAppContext();

  const { isDarkMode, wallpaper, wallpaperIndex, isPremium } = useColorContext();
  const isImageWallpaper = wallpaper && typeof wallpaper !== 'string';
  const fontConfig = useMemo(
    () => (wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null),
    [wallpaperIndex]
  );
  
  const { searchbg, searchCt, searchi, searchCi, allappt, header, applist, applistbg, modalbg,open } = fontConfig || ({} as any);

  const apps = useMemo(() => {
    return [...rawApps].sort((a, b) => a.label.localeCompare(b.label));
  }, [rawApps]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackageNames, setSelectedPackageNames] = useState<string[]>([]);
  const selectedPackageNamesRef = useRef<string[]>([]);
  
  // State to defer rendering of the heavy list until after the modal is visible
  const [renderList, setRenderList] = useState(false);

  // Modal states
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [lastAction, setLastAction] = useState<'added' | 'removed' | null>(null);
  const selectModalTimerRef = useRef<any>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (selectModalTimerRef.current) clearTimeout(selectModalTimerRef.current);
    };
  }, []);

  useEffect(() => {
    selectedPackageNamesRef.current = selectedPackageNames;
  }, [selectedPackageNames]);

  useEffect(() => {
    if (visible) {
      setSelectedPackageNames(homeApps.map((a) => a.packageName));
      setSearchQuery('');
      // Delay list render slightly to allow modal to appear instantly
      setTimeout(() => {
        setRenderList(true);
      }, 50);
    } else {
      setRenderList(false);
    }
  }, [visible, homeApps]);

  const selectedSet = useMemo(() => new Set(selectedPackageNames), [selectedPackageNames]);

  const handleSaveSelection = async () => {
    try {
      const currentSelected = selectedPackageNamesRef.current;
      const max = isPremium ? 6 : 3;
      if (currentSelected.length > max) {
        Alert.alert('Limit Reached', `You can only add up to ${max} apps to the home screen.`);
        return;
      }
      const selectedAppItems = apps.filter((app) => currentSelected.includes(app.packageName));
      await updateHomeApps(selectedAppItems);
      onClose();
    } catch (e) {
      console.error('Failed to save selection', e);
    }
  };

  const sections = useMemo(() => {
    if (!apps.length) return [];

    const visibleApps = apps.filter(
      (app) => !blockedPackageNames.includes(app.packageName) && !hiddenApps.includes(app.packageName)
    );

    const pinned: AppItem[] = [];
    const unpinned: AppItem[] = [];

    visibleApps.forEach((app) => {
      const rename = appRenames[app.packageName];
      const displayApp = rename ? { ...app, label: rename } : app;

      if (pinnedPackageNames.includes(app.packageName)) {
        pinned.push(displayApp);
      } else {
        unpinned.push(displayApp);
      }
    });

    pinned.sort((a, b) => a.label.localeCompare(b.label));

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

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });

    let result = sortedKeys.map((key) => ({
      title: key,
      data: grouped[key],
    }));

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
          data: (section?.data || []).filter((app) =>
            app.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section?.data?.length > 0);
    }

    return result;
  }, [apps, searchQuery, pinnedPackageNames, blockedPackageNames, hiddenApps, appRenames]);

  // Removed FlatListData logic

  const handleAppPress = useCallback((app: AppItem) => {
    const currentSelected = selectedPackageNamesRef.current;
    const isAlreadySelected = currentSelected.includes(app.packageName);

    if (isAlreadySelected) {
      setSelectedPackageNames((prev) => prev.filter((p) => p !== app.packageName));
      setLastAction('removed');
    } else {
      const max = isPremium ? 6 : 3;
      if (currentSelected.length >= max) {
        Alert.alert('Limit Reached', `You can only add up to ${max} apps to the home screen.`);
        return;
      }
      setSelectedPackageNames((prev) => [...prev, app.packageName]);
      setLastAction('added');
    }

    setSelectedApp(app);
    setSelectModalVisible(true);

    if (selectModalTimerRef.current) clearTimeout(selectModalTimerRef.current);
    selectModalTimerRef.current = setTimeout(() => {
      setSelectModalVisible(false);
    }, 1000);
  }, [isPremium]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isImageWallpaper ? 'bg-black/60' : isDarkMode ? 'bg-[#0D121A]' : 'bg-[#f7ebecff]'}`}>
        {isImageWallpaper && (
          <Image source={wallpaper as any} className="absolute h-full w-full" resizeMode="cover" />
        )}
        <View className="flex-1 px-4 pt-12">
        

          {/* Search Bar */}
          <View className="mb-6 flex-row items-center">
            <View
              style={searchbg}
              className={`flex-1 flex-row items-center rounded-xl border px-4 py-1 ${
                isImageWallpaper
                  ? 'border-white/20'
                  : isDarkMode
                    ? 'border-[#212D41]'
                    : 'border-slate-100 bg-white'
              }`}>
              <Ionicons
                name="search"
                size={20}
                color={
                  searchCi?.color ||
                  (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C5980' : '#5C8BCC')
                }
                className="mr-2"
              />
              <TextInput
                style={searchCt}
                className={`ml-2 flex-1 text-[16px] ${
                  searchCt ? '' : isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#fff]' : 'text-[#A3B9D9]'
                }`}
                placeholder="Search app here"
                placeholderTextColor={
                  searchCt?.color ||
                  (isImageWallpaper ? '#94A3B8' : isDarkMode ? '#434C5980' : '#A3B9D9')
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                cursorColor={
                  searchi?.color ||
                  (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#434C59' : '#A3B9D9')
                }
                autoCorrect={false}
              />
            </View>
          </View>
            {/* Header */}
          <View className="mb-4 w-full flex-row items-center justify-between">
            <Text
              allowFontScaling={false}
              style={allappt}
              className={`text-[18px] ${allappt ? '' : 'font-bold'} underline-offset-4 ${
                isImageWallpaper
                  ? 'text-white decoration-white'
                  : isDarkMode
                    ? 'text-[#DADFE5] decoration-[#DADFE5]'
                    : 'text-[#858E9D] decoration-[#858E9D]'
              }`}>
              Select Apps
            </Text>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                className={`rounded-lg px-4 py-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                onPress={onClose}>
                <Text
                  allowFontScaling={false}
                  className={`text-[14px] font-medium ${
                    isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#858E9D]'
                  }`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center rounded-lg bg-[#7EA6E0] px-6 py-2"
                onPress={handleSaveSelection}>
                <Text
                  allowFontScaling={false}
                  className={`text-[14px] font-bold ${
                    isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#DADFE5]' : 'text-[#FFFFFF]'
                  }`}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* App List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {renderList ? (
              <>
                {sections.map((section, index) => (
                  <View key={index}>
                    <Text
                      style={header}
                      className={`mt-4 text-lg ${header ? '' : 'font-bold'} ${
                        isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#728099]' : 'text-[#142C4D]'
                      }`}>
                      {section.title}
                    </Text>
                    {section.data.map((app) => (
                      <AppListItem
                        key={app.packageName}
                        item={{ data: app }}
                        isSelected={selectedSet.has(app.packageName)}
                        onPress={handleAppPress}
                        isImageWallpaper={isImageWallpaper}
                        isDarkMode={isDarkMode}
                        applist={applist}
                        applistbg={applistbg}
                        wallpaperIndex={wallpaperIndex}
                      />
                    ))}
                  </View>
                ))}
                {sections.length === 0 && (
                  <View className="mt-10 items-center">
                    <Text className="text-slate-400">No apps found</Text>
                  </View>
                )}
              </>
            ) : (
              <View className="mt-10 items-center justify-center">
                <Text className="text-slate-400">Loading apps...</Text>
              </View>
            )}
          </ScrollView>

          {/* Select Mode App Options Modal */}
        
          <Modal
            animationType="fade"
            transparent={true}
            visible={selectModalVisible && selectedApp !== null}
            onRequestClose={() => setSelectModalVisible(false)}>
            <View className="absolute inset-0 z-50 items-center justify-center">
              <Pressable className="absolute inset-0 bg-black/70" onPress={() => setSelectModalVisible(false)} />
              <View
                style={modalbg}
                className={`w-[85%] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
                <View className="w-full max-w-[520px] items-center">
                  <Text
                  style={open}
                    allowFontScaling={false}
                    className={`mb-6 text-center text-[16px] font-bold ${isDarkMode ? 'text-white' : 'text-[#2E3B4D]'}`}>
                    {lastAction === 'added' ? 'Added Successfully!' : 'Removed Successfully!'}
                  </Text>
                  <View className="mb-4 h-20 w-20 rounded-full">
                    {selectedApp?.icon && (
                      <Image
                        source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                        className="h-full w-full rounded-full"
                      />
                    )}
                  </View>
                  <Text
                  style={open}
                    allowFontScaling={false}
                    className={`mb-6 text-center text-[14px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Text className="font-bold">{selectedApp?.label}</Text> has been {lastAction === 'added' ? 'added to' : 'removed from'} your home screen.
                  </Text>
                </View>
              </View>
            </View>
          </Modal>

        </View>
      </View>
    </Modal>
  );
};
