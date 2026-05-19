import { useAppLauncher } from './hooks/useAppLauncher';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  StatusBar,
  SectionList,
  Pressable,
} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Directions,
} from 'react-native-gesture-handler';
import { useState, useMemo, useCallback, memo } from 'react';
import { AppItem } from '../modules/launcher/src/Launcher.types';
import { useRouter, Link } from 'expo-router';
import { openApplication } from 'expo-intent-launcher';
import { Ionicons } from '@expo/vector-icons';
import { useColorContext } from './context/ColorContext';
import { useAppContext } from './context/AppContext';
import AppModal from './context/Modal';
import wallpaperFontConfig from './constants/wallpaperFontConfig';
import { BlockDurationModal, BlockedInfoModal } from './components/BlockModals';
import { PremiumModal } from './components/PremiumModal';




export type AllAppsProps = {
  enableGestures?: boolean;
  initialLetter?: string;
  showSidebar?: boolean;
  autoFocus?: boolean;
};

const AllApps = memo(({ enableGestures = true, autoFocus = false }: AllAppsProps = {}) => {
  const { isDarkMode, wallpaper, wallpaperIndex, showStatusBar, isPremium } = useColorContext();
  const isImageWallpaper = wallpaper && typeof wallpaper !== 'string';
  // wallpaper
  const fontConfig = useMemo(
    () => (wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null),
    [wallpaperIndex]
  );
  const {
    searchbg,
    searchi,
    header,
    numberbg,
    number,
    quit,
    modalbg,
    quitbg,
    bordert,
    open,
    appC,
    applistCbg,
    allappt,
    allappi,
    searchCt,
    searchCi,
    wallbg,
  } = fontConfig || ({} as any);

  const {
    apps: rawApps,
    homeApps,
    updateHomeApps,
    pinnedPackageNames,
    togglePinApp,
    blockedPackageNames,
    appRenames,
    renameApp,
    hiddenApps,
    toggleHideApp,
    isExcludedFromTimer,
    setTimedBlock,
    isTemporarilyBlocked,
    timedBlocks,
  } = useAppContext();

  const apps = useMemo(() => {
    return [...rawApps].sort((a, b) => a.label.localeCompare(b.label));
  }, [rawApps]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // New State for Features
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [softInputEnabled, setSoftInputEnabled] = useState(false);
  const [newName, setNewName] = useState('');
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [hideAppModalVisible, setHideAppModalVisible] = useState(false);
  const [blockedInfoVisible, setBlockedInfoVisible] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [premiumModalConfig, setPremiumModalConfig] = useState({ title: '', description: '' });

  const router = useRouter();



  const sections = useMemo(() => {
    if (!apps.length) return [];

    const blockedSet = new Set(blockedPackageNames);
    const hiddenSet = new Set(hiddenApps);
    const pinnedSet = new Set(pinnedPackageNames);

    // Filter blocked and hidden apps
    const visibleApps = apps.filter(
      (app) => !blockedSet.has(app.packageName) && !hiddenSet.has(app.packageName)
    );

    // Separate pinned and unpinned, and apply renames
    const pinned: AppItem[] = [];
    const unpinned: AppItem[] = [];

    visibleApps.forEach((app) => {
      // Apply rename
      const rename = appRenames[app.packageName];
      const displayApp = rename ? { ...app, label: rename } : app;

      if (pinnedSet.has(app.packageName)) {
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
          data: (section?.data || []).filter((app) =>
            app.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section?.data?.length > 0);
    }

    return result;
  }, [apps, searchQuery, pinnedPackageNames, blockedPackageNames, hiddenApps, appRenames]);



  const handleAppPress = useCallback(
    (app: AppItem) => {
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
    },
    [
      isExcludedFromTimer,
      isTemporarilyBlocked,
      timedBlocks,
    ]
  );

  const handleAppLongPress = useCallback(
    (app: AppItem) => {
      setSelectedApp(app);
      setOptionsModalVisible(true);
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: AppItem }) => (
      <AppListItem
        item={item}
        onPress={handleAppPress}
        onLongPress={handleAppLongPress}
        isImageWallpaper={isImageWallpaper}
        isDarkMode={isDarkMode}
        theme={fontConfig}
        wallpaperIndex={wallpaperIndex}
      />
    ),
    [handleAppPress, handleAppLongPress, isImageWallpaper, isDarkMode, fontConfig, wallpaperIndex]
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

  const handleAddToHome = async () => {
    if (!selectedApp) return;
    try {
      const currentHomeApps = [...homeApps];

      const max = isPremium ? 6 : 3;
      if (currentHomeApps.length >= max) {
        if (!isPremium) {
          setOptionsModalVisible(false);
          setPremiumModalConfig({
            title: 'Limit Reached',
            description: 'Free users can add up to 3 favorite apps. Upgrade to add up to 6.'
          });
          setPremiumModalVisible(true);
        } else {
          Alert.alert('Limit Reached', 'Home screen is full (max 6 apps).');
        }
        return;
      }

      if (currentHomeApps.some((a) => a.packageName === selectedApp.packageName)) {
        Alert.alert('Already Added', 'This app is already on the home screen.');
        return;
      }

      currentHomeApps.push(selectedApp);
      await updateHomeApps(currentHomeApps);
      setOptionsModalVisible(false);
      router.push('/home');
    } catch (e) {
      console.error(e);
    }
  };

  const handlePinToTop = async () => {
    if (!selectedApp) return;
    try {
      await togglePinApp(selectedApp.packageName);
      setOptionsModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlock = () => {
    if (!selectedApp) return;
    setBlockModalVisible(true);
  };

  const handleConfirmBlock = async (durationMs: number) => {
    if (!selectedApp) return;
    try {
      const until = Date.now() + durationMs;
      await setTimedBlock(selectedApp.packageName, until);
      setBlockModalVisible(false);
      setOptionsModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRename = () => {
    if (!selectedApp) return;
    if (!isPremium) {
      setOptionsModalVisible(false);
      setPremiumModalConfig({
        title: 'Premium Feature',
        description: 'Renaming apps is available for premium users only.'
      });
      setPremiumModalVisible(true);
      return;
    }
    setNewName(appRenames[selectedApp.packageName] || selectedApp.label);
    setRenameModalVisible(true);
    setSoftInputEnabled(false);
  };

  const saveRename = async () => {
    if (!selectedApp) return;

    const trimmedName = newName.trim();
    if (!trimmedName) return;

    // Check for duplicate app name
    const normalizedName = trimmedName.toLowerCase();
    const isDuplicate = apps.some((app) => {
      if (app.packageName === selectedApp.packageName) return false;
      const appName = appRenames[app.packageName] || app.label;
      return appName.toLowerCase() === normalizedName;
    });

    if (isDuplicate) {
      Alert.alert('Error', `The app name "${trimmedName}" is already in use.`);
      return;
    }

    try {
      await renameApp(selectedApp.packageName, trimmedName);
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

  const handleHideApp = async () => {
    if (!selectedApp) return;
    setHideAppModalVisible(true);
  };

  const confirmHideApp = async (dontShowAgain: boolean) => {
    if (!selectedApp) return;
    try {
      await toggleHideApp(selectedApp.packageName);
      setHideAppModalVisible(false);
      setOptionsModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  // removed renderItem and getItemLayout

  const rightSwipeGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .enabled(enableGestures)
    .onEnd(() => {
      router.back();
    });

  const RootContainer = enableGestures ? GestureHandlerRootView : View;

  return (
    <RootContainer style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
        hidden={!showStatusBar}
      />
      {isImageWallpaper && (
        <Image source={wallpaper as any} className="absolute h-full w-full" resizeMode="cover" />
      )}
      <GestureDetector gesture={rightSwipeGesture}>
        <View
          className="flex-1 px-4 pt-12 "
          style={[
            {
              backgroundColor: wallpaper
                ? typeof wallpaper === 'string'
                  ? wallpaper
                  : 'transparent'
                : isDarkMode
                  ? '#0D121A'
                  : '#f7ebecff',
            },
            wallbg,
          ]}>
          {/* Search Bar */}
          <View className="mb-6 flex-row items-center ">
            <View
              style={searchbg}
              className={`flex-1 flex-row items-center rounded-xl border px-4 py-1 ${
                isImageWallpaper
                  ? 'border-white/20 '
                  : isDarkMode
                    ? 'border-[#212D41] bg-[]'
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
                autoFocus={autoFocus}
              />
            </View>
          </View>

          {/* Apps List */}
          <View className="flex-1 flex-row">
            <View className="flex-1 px-3">
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.packageName}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                  <Text
                    style={header}
                    className={`mt-4 text-lg ${header ? '' : 'font-bold'} ${
                      isImageWallpaper ? 'text-white' : isDarkMode ? 'text-[#728099]' : 'text-[#142C4D]'
                    }`}>
                    {title}
                  </Text>
                )}
                ListHeaderComponent={
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
                      All Apps
                    </Text>
                    <Link href="/settingScreen" asChild>
                      <TouchableOpacity
                        className="p-2"
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                        <View style={allappi}>
                          <Image
                            source={require('../assets/images/SettingIcon.png')}
                            style={{
                              width: 30,
                              height: 30,
                              tintColor:
                                allappi?.color ||
                                (isImageWallpaper ? '#E2E8F0' : isDarkMode ? '#728099' : '#858E9D'),
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    </Link>
                  </View>
                }
                ListEmptyComponent={
                  <View className="mt-10 items-center">
                    <Text className="text-slate-400">No apps found</Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
                initialNumToRender={12}
                maxToRenderPerBatch={8}
                windowSize={3}
                removeClippedSubviews={true}
              />
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
          {/* Options Modal */}
          {optionsModalVisible && (
            <View className="absolute inset-0 z-50 items-center justify-center">
              <Pressable
                className="absolute inset-0 bg-black/70"
                onPress={() => setOptionsModalVisible(false)}
              />
              <View
                style={modalbg}
                className={`w-[85%] items-center rounded-2xl p-6 shadow-lg ${
                  isDarkMode ? 'bg-[#131B27]' : 'bg-white'
                }`}>
                <View className="mb-6 items-center">
                  <Text
                    style={open}
                    allowFontScaling={false}
                    className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                    {selectedApp?.label} Options
                  </Text>
                  {selectedApp?.icon && (
                    <View className="mb-8 h-16 w-16 rounded-full">
                      <Image
                        source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                        className="h-full w-full rounded-full"
                      />
                    </View>
                  )}
                </View>
                <View className="w-full max-w-[520px]">
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
                        {isPremium ? 'Rename' : 'Rename'}
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
                      onPress={handleHideApp}>
                      <Text style={number} className="font-medium text-white">
                        Hide
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={bordert}
                    className={`mt-6 border-t pt-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <TouchableOpacity
                      style={quitbg}
                      className={`w-full items-center rounded-xl py-3 active:opacity-80 ${isDarkMode ? 'bg-[#212D41]' : 'bg-[#5B8BDF]'}`}
                      onPress={() => setOptionsModalVisible(false)}>
                      <Text
                        style={quit}
                        className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-white'}`}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

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
                      className={`w-[320px] items-center rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
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
                        autoFocus
                        showSoftInputOnFocus={softInputEnabled}
                        onTouchEnd={() => setSoftInputEnabled(true)}
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

          {/* Hide App Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={hideAppModalVisible}
            onRequestClose={() => setHideAppModalVisible(false)}>
            <View className="flex-1 items-center justify-center bg-black/50 px-4">
              <View
                style={modalbg}
                className={`w-full max-w-[320px] rounded-2xl p-6 shadow-lg ${
                  isDarkMode ? 'bg-[#1E293B]' : 'bg-white'
                }`}>
                <Text
                  style={appC}
                  allowFontScaling={false}
                  className={`mb-4 text-xl font-bold ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-800'
                  }`}>
                  Hidden apps
                </Text>
                <Text
                  allowFontScaling={false}
                  className={`mb-2 text-[16px] ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                  You can find all your hidden apps in
                </Text>
                <Text
                  allowFontScaling={false}
                  className={`mb-6 text-[16px] font-medium ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                  ⚙️ -&gt; Hide Away App
                </Text>

                <View className="w-full flex-row gap-3">
                  <TouchableOpacity className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} onPress={() => setHideAppModalVisible(false)}>
                    <Text
                      allowFontScaling={false}
                      className={`font-medium ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                      CANCEL
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3" onPress={() => confirmHideApp(false)}>
                    <Text
                      allowFontScaling={false}
                      className={`font-medium ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                      OK
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </View>
      </GestureDetector>
      <BlockDurationModal
        visible={blockModalVisible}
        onClose={() => {
          setBlockModalVisible(false);
        }}
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

      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        title={premiumModalConfig.title}
        description={premiumModalConfig.description}
      />
    </RootContainer>
  );
});

export default AllApps;


const RIPPLE = { color: 'rgba(0,0,0,0.08)' };

const AppListItem = memo(
  ({
    item,
    onPress,
    onLongPress,
    isImageWallpaper,
    isDarkMode,
    theme,
    wallpaperIndex,
  }: any) => {
    const { applist, applistbg } = theme || {};

    const handlePress = useCallback(() => onPress(item), [onPress, item]);
    const handleLongPress = useCallback(() => onLongPress(item), [onLongPress, item]);

    return (
      <Pressable
        style={applistbg}
        className={`mb-2 w-full flex-row items-center justify-between rounded-xl px-4 py-3  ${
          isImageWallpaper ? '' : isDarkMode ? 'bg-[#131B26]' : 'bg-[#CEDDF2]'
        }`}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={300}
        android_ripple={RIPPLE}>
        <View className="flex-1 flex-row items-center">
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
            {item.label.length > 15 ? `${item.label.slice(0, 15)}...` : item.label}
          </Text>
        </View>
      </Pressable>
    );
  }
);