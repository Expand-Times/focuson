import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
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

  hiddenApps: string[];
  toggleHideApp: (packageName: string) => Promise<void>;

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

  // Excluded Apps from Timer
  isExcludedFromTimer: (packageName: string) => boolean;

  // Timed Blocking
  timedBlocks: Record<string, number>;
  setTimedBlock: (packageName: string, unblockAt: number) => Promise<void>;
  clearTimedBlock: (packageName: string) => Promise<void>;
  isTemporarilyBlocked: (packageName: string) => boolean;
};

const ALLOWED_CATEGORIES = [
  // User provided names
  'Comics', 'Entertainment', 'Social Media', 'Dating', 'Music & Audio', 'Photography', 'Games', 
  'Shopping', 'News & Magazines', 'Video Players & Editors', 'Auto & Vehicles', 'Art & Design', 
  'Sports', 'Messaging', 'Browsing', 'Beauty', 'Lifestyle', 'Food & Drink', 'House & Home', 
  'Events', 'Libraries & Demo',
  // Internal mapping names (from LauncherModule.kt)
  'Social', 'Audio', 'Image', 'Game', 'News', 'Video', 'Communication'
];

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

  hiddenApps: [],
  toggleHideApp: async () => {},

  appRenames: {},
  renameApp: async () => {},

  customCategories: [],
  addCustomCategory: async () => {},

  categoryOverrides: {},
  setCategoryOverride: async () => {},

  renamedCategories: {},
  renameCategory: async () => {},

  reminderOption: 'quit',
  setReminderOptionState: async () => {},

  isExcludedFromTimer: () => true,
  timedBlocks: {},
  setTimedBlock: async () => {},
  clearTimedBlock: async () => {},
  isTemporarilyBlocked: () => false,
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [homeApps, setHomeApps] = useState<AppItem[]>([]);
  const [pinnedPackageNames, setPinnedPackageNames] = useState<string[]>([]);
  const [blockedPackageNames, setBlockedPackageNames] = useState<string[]>([]);
  const [hiddenApps, setHiddenApps] = useState<string[]>([]);
  const [appRenames, setAppRenames] = useState<Record<string, string>>({});
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const [renamedCategories, setRenamedCategories] = useState<Record<string, string>>({});
  const [reminderOption, setReminderOption] = useState<'mindful' | 'remind' | 'quit'>('quit');
  const [timedBlocks, setTimedBlocks] = useState<Record<string, number>>({});

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
        storedHidden,
        storedRenames,
        storedCustomCats,
        storedCatOverrides,
        storedCatRenames,
        storedReminder,
        storedTimedBlocks
      ] = await Promise.all([
        AsyncStorage.getItem('homeApps'),
        AsyncStorage.getItem('pinnedApps'),
        AsyncStorage.getItem('blockedApps'),
        AsyncStorage.getItem('hiddenApps'),
        AsyncStorage.getItem('appRenames'),
        AsyncStorage.getItem('customCategories'),
        AsyncStorage.getItem('categoryOverrides'),
        AsyncStorage.getItem('renamedCategories'),
        AsyncStorage.getItem('reminderOption'),
        AsyncStorage.getItem('timedBlocks')
      ]);

      if (storedHomeApps) setHomeApps(JSON.parse(storedHomeApps));
      if (storedPinned) setPinnedPackageNames(JSON.parse(storedPinned));
      if (storedBlocked) setBlockedPackageNames(JSON.parse(storedBlocked));
      if (storedHidden) setHiddenApps(JSON.parse(storedHidden));
      if (storedRenames) setAppRenames(JSON.parse(storedRenames));
      if (storedCustomCats) setCustomCategories(JSON.parse(storedCustomCats));
      if (storedCatOverrides) setCategoryOverrides(JSON.parse(storedCatOverrides));
      if (storedCatRenames) setRenamedCategories(JSON.parse(storedCatRenames));
      if (storedReminder) setReminderOption(storedReminder as any);
      if (storedTimedBlocks) {
        try {
          const parsed = JSON.parse(storedTimedBlocks);
          // Purge expired blocks
          const now = Date.now();
          const filtered: Record<string, number> = {};
          Object.keys(parsed || {}).forEach((k) => {
            if (typeof parsed[k] === 'number' && parsed[k] > now) {
              filtered[k] = parsed[k];
            }
          });
          setTimedBlocks(filtered);
          await AsyncStorage.setItem('timedBlocks', JSON.stringify(filtered));
        } catch {
          setTimedBlocks({});
        }
      }

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

  const toggleHideApp = async (packageName: string) => {
    const newHidden = hiddenApps.includes(packageName)
      ? hiddenApps.filter(p => p !== packageName)
      : [...hiddenApps, packageName];
    setHiddenApps(newHidden);
    await AsyncStorage.setItem('hiddenApps', JSON.stringify(newHidden));
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

  const setTimedBlock = async (packageName: string, unblockAt: number) => {
    const updated = { ...timedBlocks, [packageName]: unblockAt };
    setTimedBlocks(updated);
    await AsyncStorage.setItem('timedBlocks', JSON.stringify(updated));
  };

  const clearTimedBlock = async (packageName: string) => {
    const updated = { ...timedBlocks };
    delete updated[packageName];
    setTimedBlocks(updated);
    await AsyncStorage.setItem('timedBlocks', JSON.stringify(updated));
  };

  const isTemporarilyBlocked = useCallback(
    (packageName: string) => {
      const until = timedBlocks[packageName];
      return typeof until === 'number' && until > Date.now();
    },
    [timedBlocks]
  );

  const isExcludedFromTimer = useCallback((packageName: string) => {
    // 1. Find the app
    const app = apps.find(a => a.packageName === packageName);
    if (!app) return true; // If app not found, exclude it (safe default)

    // 2. Determine category
    // ALWAYS use the original category for timer logic, ignoring user overrides.
    // This ensures that even if a user moves a social app to "Productivity", 
    // it still triggers the timer because its intrinsic nature hasn't changed.
    let category = app.category || 'Other';
    
    // 3. Check if category is in allowed list
    // We check if the category name contains any of the allowed keywords or matches exactly
    // The user provided list has specific names, but internal names might differ slightly.
    // Let's try exact match or simple inclusion for robustness.
    
    // Normalize for comparison
    const catLower = category.toLowerCase();
    
    return !ALLOWED_CATEGORIES.some(allowed => 
      catLower === allowed.toLowerCase() || 
      catLower.includes(allowed.toLowerCase())
    );
  }, [apps]); // removed categoryOverrides dependency as we don't use it anymore here

  const contextValue = useMemo(() => ({
    apps,
    loading,
    refreshApps,
    homeApps,
    updateHomeApps,
    pinnedPackageNames,
    togglePinApp,
    blockedPackageNames,
    toggleBlockApp,
    hiddenApps,
    toggleHideApp,
    appRenames,
    renameApp,
    customCategories,
    addCustomCategory,
    categoryOverrides,
    setCategoryOverride,
    renamedCategories,
    renameCategory,
    reminderOption,
    setReminderOptionState,
    isExcludedFromTimer,
    timedBlocks,
    setTimedBlock,
    clearTimedBlock,
    isTemporarilyBlocked
  }), [
    apps,
    loading,
    homeApps,
    pinnedPackageNames,
    blockedPackageNames,
    hiddenApps,
    appRenames,
    customCategories,
    categoryOverrides,
    renamedCategories,
    reminderOption,
    timedBlocks
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
