import { useState, useCallback } from 'react';
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
  Pressable,
} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { openApplication } from 'expo-intent-launcher';
import { useRouter } from 'expo-router';
import { AppItem } from '../../modules/launcher/src/Launcher.types';
import { useColorContext } from '../context/ColorContext';
import { useAppContext } from '../context/AppContext';
import { useAppLauncher } from '../hooks/useAppLauncher';
import AppModal from '../context/Modal';
import { BlockDurationModal, BlockedInfoModal } from './BlockModals';
import { PremiumModal } from './PremiumModal';

type SelectionModeProps = {
  fontConfig: any;
  isDarkMode: boolean;
  isImageWallpaper: boolean;
};

export function useSelectionMode() {
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

  const { isPremium } = useColorContext();
  const router = useRouter();
  const { launchAppWithTimer } = useAppLauncher();

  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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
    [isExcludedFromTimer, isTemporarilyBlocked, timedBlocks]
  );

  const handleAppLongPress = useCallback((app: AppItem) => {
    setSelectedApp(app);
    setOptionsModalVisible(true);
  }, []);

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
            description: 'Free users can add up to 3 favorite apps. Upgrade to add up to 6.',
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
        description: 'Renaming apps is available for premium users only.',
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
    const isDuplicate = rawApps.some((app) => {
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

  return {
    selectedApp,
    modalVisible,
    setModalVisible,
    optionsModalVisible,
    setOptionsModalVisible,
    renameModalVisible,
    setRenameModalVisible,
    softInputEnabled,
    setSoftInputEnabled,
    newName,
    setNewName,
    blockModalVisible,
    setBlockModalVisible,
    hideAppModalVisible,
    setHideAppModalVisible,
    blockedInfoVisible,
    setBlockedInfoVisible,
    blockedUntil,
    premiumModalVisible,
    setPremiumModalVisible,
    premiumModalConfig,
    pinnedPackageNames,
    isPremium,
    handleAppPress,
    handleAppLongPress,
    handleLaunchApp,
    handleAddToHome,
    handlePinToTop,
    handleBlock,
    handleConfirmBlock,
    handleRename,
    saveRename,
    handleAppInfo,
    handleHideApp,
    confirmHideApp,
  };
}

export const SelectionModeModals = ({
  fontConfig,
  isDarkMode,
  isImageWallpaper,
}: SelectionModeProps & {
  selection: ReturnType<typeof useSelectionMode>;
} & { selection: ReturnType<typeof useSelectionMode> }) => {
  // This component receives selection from parent
  return null;
};

/**
 * Renders all the modals related to selection mode (options, rename, hide, block, premium).
 */
export function SelectionModals({
  selection,
  fontConfig,
  isDarkMode,
  isImageWallpaper,
}: SelectionModeProps & { selection: ReturnType<typeof useSelectionMode> }) {
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
    selectedApp,
    modalVisible,
    setModalVisible,
    optionsModalVisible,
    setOptionsModalVisible,
    renameModalVisible,
    setRenameModalVisible,
    softInputEnabled,
    setSoftInputEnabled,
    newName,
    setNewName,
    blockModalVisible,
    setBlockModalVisible,
    hideAppModalVisible,
    setHideAppModalVisible,
    blockedInfoVisible,
    setBlockedInfoVisible,
    blockedUntil,
    premiumModalVisible,
    setPremiumModalVisible,
    premiumModalConfig,
    pinnedPackageNames,
    isPremium,
    handleLaunchApp,
    handleAddToHome,
    handlePinToTop,
    handleBlock,
    handleConfirmBlock,
    handleRename,
    saveRename,
    handleAppInfo,
    handleHideApp,
    confirmHideApp,
  } = selection;

  return (
    <>
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

      {/* Rename Modal */}
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
              <TouchableOpacity
                className={`flex-1 items-center rounded-lg py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                onPress={() => setHideAppModalVisible(false)}>
                <Text
                  allowFontScaling={false}
                  className={`font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                  CANCEL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-lg bg-[#7EA6E0] py-3"
                onPress={() => confirmHideApp(false)}>
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
    </>
  );
}

export default function SelectionMode() { return null; }