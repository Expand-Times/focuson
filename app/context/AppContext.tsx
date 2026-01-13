import React, { createContext, useState, useEffect, useContext } from 'react';
import Launcher from '../../modules/launcher';
import { AppItem } from '../../modules/launcher/src/Launcher.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppContextType = {
  apps: AppItem[];
  loading: boolean;
  refreshApps: () => Promise<void>;

  // Home Apps
  homeApps: AppItem[];
  updateHomeApps: (apps: AppItem[]) => Promise<void>;

  // Settings
  pinnedPackageNames: string[];
  togglePinApp: (packageName: string) => Promise<void>;

  blockedPackageNames: string[];
  toggleBlockApp: (packageName: string) => Promise<void>;

  appRenames: Record<string, string>;
  renameApp: (packageName: string, newName: string) => Promise<void>;

  // Categories
  customCategories: string[];
  addCustomCategory: (category: string) => Promise<void>;
  
  categoryOverrides: Record<string, string>;
  setCategoryOverride: (packageName: string, category: string) => Promise<void>;

  renamedCategories: Record<string, string>;
  renameCategory: (originalName: string, newName: string) => Promise<void>;

  // Time Over Settings
  reminderOption: 'mindful' | 'remind' | 'quit';
  setReminderOptionState: (option: 'mindful' | 'remind' | 'quit') => Promise<void>;
};

const AppContext = createContext<AppContextType>({
  apps: [],
  loading: true,
  refreshApps: async () => {},
  
  homeApps: [],
  updateHomeApps: async () => {},

  pinnedPackageNames: [],
  togglePinApp: async () => {},

  blockedPackageNames: [],
  toggleBlockApp: async () => {},

  appRenames: {},
  renameApp: async () => {},

  customCategories: [],
  addCustomCategory: async () => {},

  categoryOverrides: {},
  setCategoryOverride: async () => {},

  renamedCategories: {},
  renameCategory: async () => {},

  reminderOption: 'remind',
  setReminderOptionState: async () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [homeApps, setHomeApps] = useState<AppItem[]>([]);
  const [pinnedPackageNames, setPinnedPackageNames] = useState<string[]>([]);
  const [blockedPackageNames, setBlockedPackageNames] = useState<string[]>([]);
  const [appRenames, setAppRenames] = useState<Record<string, string>>({});
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const [renamedCategories, setRenamedCategories] = useState<Record<string, string>>({});
  const [reminderOption, setReminderOption] = useState<'mindful' | 'remind' | 'quit'>('remind');

  const fetchApps = async () => {
    try {
      const installedApps = Launcher.getInstalledApps();
      setApps(installedApps);
    } catch (error) {
      console.error('Failed to fetch apps:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchApps();
      
      const [
        storedHomeApps,
        storedPinned,
        storedBlocked,
        storedRenames,
        storedCustomCats,
        storedCatOverrides,
        storedCatRenames,
        storedReminder
      ] = await Promise.all([
        AsyncStorage.getItem('homeApps'),
        AsyncStorage.getItem('pinnedApps'),
        AsyncStorage.getItem('blockedApps'),
        AsyncStorage.getItem('appRenames'),
        AsyncStorage.getItem('customCategories'),
        AsyncStorage.getItem('categoryOverrides'),
        AsyncStorage.getItem('renamedCategories'),
        AsyncStorage.getItem('reminderOption')
      ]);

      if (storedHomeApps) setHomeApps(JSON.parse(storedHomeApps));
      if (storedPinned) setPinnedPackageNames(JSON.parse(storedPinned));
      if (storedBlocked) setBlockedPackageNames(JSON.parse(storedBlocked));
      if (storedRenames) setAppRenames(JSON.parse(storedRenames));
      if (storedCustomCats) setCustomCategories(JSON.parse(storedCustomCats));
      if (storedCatOverrides) setCategoryOverrides(JSON.parse(storedCatOverrides));
      if (storedCatRenames) setRenamedCategories(JSON.parse(storedCatRenames));
      if (storedReminder) setReminderOption(storedReminder as any);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshApps = async () => {
    setLoading(true);
    await fetchApps();
    setLoading(false);
  };

  const updateHomeApps = async (newApps: AppItem[]) => {
    setHomeApps(newApps);
    await AsyncStorage.setItem('homeApps', JSON.stringify(newApps));
  };

  const togglePinApp = async (packageName: string) => {
    const newPinned = pinnedPackageNames.includes(packageName)
      ? pinnedPackageNames.filter(p => p !== packageName)
      : [...pinnedPackageNames, packageName];
    setPinnedPackageNames(newPinned);
    await AsyncStorage.setItem('pinnedApps', JSON.stringify(newPinned));
  };

  const toggleBlockApp = async (packageName: string) => {
    const newBlocked = blockedPackageNames.includes(packageName)
      ? blockedPackageNames.filter(p => p !== packageName)
      : [...blockedPackageNames, packageName];
    setBlockedPackageNames(newBlocked);
    await AsyncStorage.setItem('blockedApps', JSON.stringify(newBlocked));
  };

  const renameApp = async (packageName: string, newName: string) => {
    const newRenames = { ...appRenames, [packageName]: newName };
    setAppRenames(newRenames);
    await AsyncStorage.setItem('appRenames', JSON.stringify(newRenames));
  };

  const addCustomCategory = async (category: string) => {
    const newCategories = [...customCategories, category];
    setCustomCategories(newCategories);
    await AsyncStorage.setItem('customCategories', JSON.stringify(newCategories));
  };

  const setCategoryOverride = async (packageName: string, category: string) => {
    const newOverrides = { ...categoryOverrides, [packageName]: category };
    setCategoryOverrides(newOverrides);
    await AsyncStorage.setItem('categoryOverrides', JSON.stringify(newOverrides));
  };

  const renameCategory = async (originalName: string, newName: string) => {
    const newRenames = { ...renamedCategories, [originalName]: newName };
    setRenamedCategories(newRenames);
    await AsyncStorage.setItem('renamedCategories', JSON.stringify(newRenames));
  };

  const setReminderOptionState = async (option: 'mindful' | 'remind' | 'quit') => {
    setReminderOption(option);
    await AsyncStorage.setItem('reminderOption', option);
  };

  return (
    <AppContext.Provider value={{
      apps,
      loading,
      refreshApps,
      homeApps,
      updateHomeApps,
      pinnedPackageNames,
      togglePinApp,
      blockedPackageNames,
      toggleBlockApp,
      appRenames,
      renameApp,
      customCategories,
      addCustomCategory,
      categoryOverrides,
      setCategoryOverride,
      renamedCategories,
      renameCategory,
      reminderOption,
      setReminderOptionState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
