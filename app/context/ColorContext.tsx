import React, {createContext, useState, ReactNode, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageSourcePropType, useColorScheme } from 'react-native';

// Define the wallpaper types
export type WallpaperItem = string | ImageSourcePropType;

// Define the available wallpapers
export const AVAILABLE_WALLPAPERS: WallpaperItem[] = [
  '#0D121A',
  '#EBF0F7',
  require('../../assets/Wallpaper/3.jpg'),
  require('../../assets/Wallpaper/4.jpg'),
  require('../../assets/Wallpaper/5.jpg'),
  require('../../assets/Wallpaper/6.jpg'),
  require('../../assets/Wallpaper/7.jpg'),
  require('../../assets/Wallpaper/8.jpg'),
  require('../../assets/Wallpaper/9.jpg'),
  require('../../assets/Wallpaper/10.jpg'),
 
];

// Define the context type
interface ColorContextType {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  isPremium: boolean;
  unlockPremium: () => void;
  isDarkMode: boolean;
  isLoading: boolean;
  wallpaper: WallpaperItem | null;
  wallpaperIndex: number;
  setWallpaper: (wallpaper: WallpaperItem) => void;
  showPhoneDialer: boolean;
  setShowPhoneDialer: (show: boolean) => void;
  showCameraIcon: boolean;
  setShowCameraIcon: (show: boolean) => void;
  timeFormat: string;
  setTimeFormat: (format: string) => void;
  toggleTimeFormat: () => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
  timeOffset: number;
  setTimeOffset: (offset: number) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

interface ColorProviderProps {
  children: ReactNode;
}

// Default color constants
const DEFAULT_COLOR = '#7EA9E5';
const DEFAULT_DARK_MODE = false;
const DEFAULT_PREMIUM = false;

const ColorProvider = ({children}: ColorProviderProps) => {
  const [selectedColor, setSelectedColorState] = useState<string>(DEFAULT_COLOR);
  const [isPremium, setIsPremium] = useState<boolean>(DEFAULT_PREMIUM);
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wallpaper, setWallpaperState] = useState<WallpaperItem | null>(null);
  const [wallpaperIndex, setWallpaperIndex] = useState<number>(-1);
  const [showPhoneDialer, setShowPhoneDialerState] = useState<boolean>(false);
  const [showCameraIcon, setShowCameraIconState] = useState<boolean>(false);
  const [timeFormat, setTimeFormatState] = useState<string>('HH:MM PM');
  const [dateFormat, setDateFormatState] = useState<string>('weekday, day month year');
  const [timeOffset, setTimeOffsetState] = useState<number>(0);

  useEffect(() => {
    if (wallpaper === '#0D121A') {
      setIsDarkMode(true);
    } else if (wallpaper === '#EBF0F7') {
      setIsDarkMode(false);
    } else if (systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, wallpaper]);

  // ✅ Load saved data when app starts
  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [savedColor, savedPremium, savedWallpaperIndex, savedPhoneDialer, savedCameraIcon, savedTimeFormat, savedDateFormat, savedTimeOffset] = await Promise.all([
        AsyncStorage.getItem('selectedColor'),
        AsyncStorage.getItem('isPremium'),
        AsyncStorage.getItem('selectedWallpaperIndex'),
        AsyncStorage.getItem('showPhoneDialer'),
        AsyncStorage.getItem('showCameraIcon'),
        AsyncStorage.getItem('timeFormat'),
        AsyncStorage.getItem('dateFormat'),
        AsyncStorage.getItem('timeOffset'),
      ]);

      if (savedColor) setSelectedColorState(savedColor);
      if (savedPremium) setIsPremium(savedPremium === 'true');
      if (savedPhoneDialer) setShowPhoneDialerState(savedPhoneDialer === 'true');
      if (savedCameraIcon) setShowCameraIconState(savedCameraIcon === 'true');
      if (savedTimeFormat) setTimeFormatState(savedTimeFormat);
      if (savedDateFormat) setDateFormatState(savedDateFormat);
      if (savedTimeOffset) setTimeOffsetState(parseInt(savedTimeOffset, 10));
      if (savedWallpaperIndex !== null) {
        const index = parseInt(savedWallpaperIndex, 10);
        if (index >= 0 && index < AVAILABLE_WALLPAPERS.length) {
          setWallpaperState(AVAILABLE_WALLPAPERS[index]);
          setWallpaperIndex(index);
          // Ensure correct dark mode state for restored wallpaper
          if (AVAILABLE_WALLPAPERS[index] === '#0D121A') {
            setIsDarkMode(true);
          } else if (AVAILABLE_WALLPAPERS[index] === '#EBF0F7') {
            setIsDarkMode(false);
          }
        }
      } else {
        // No saved wallpaper, set based on system theme
        const defaultIndex = systemColorScheme === 'dark' ? 0 : 1;
        setWallpaperState(AVAILABLE_WALLPAPERS[defaultIndex]);
        setWallpaperIndex(defaultIndex);
        setIsDarkMode(systemColorScheme === 'dark');
        // We don't persist here automatically to allow user to "cancel" by not choosing? 
        // User said "initial app run... shows this".
        // But if we don't persist, next time it checks system again.
        // User request: "tarpore jodi amar app ... acolor set dake" (then if my app has color set).
        // It implies if they DON'T change it, it should behave like it's set?
        // Let's persist it to be safe, as if the app "chose" for them.
        AsyncStorage.setItem('selectedWallpaperIndex', defaultIndex.toString());
      }
    } catch (err) {
      console.error("Failed to load persisted data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Save color when it changes
  const setSelectedColor = async (color: string) => {
    try {
      setSelectedColorState(color);
      await AsyncStorage.setItem('selectedColor', color);
    } catch (err) {
      console.error("Failed to save selectedColor:", err);
      setSelectedColorState(selectedColor);
    }
  };

  // ✅ Save wallpaper when it changes
  const setWallpaper = async (newWallpaper: WallpaperItem) => {
    try {
      setWallpaperState(newWallpaper);
      if (newWallpaper === '#0D121A') {
        setIsDarkMode(true);
      } else if (newWallpaper === '#EBF0F7') {
        setIsDarkMode(false);
      }
      const index = AVAILABLE_WALLPAPERS.indexOf(newWallpaper);
      if (index !== -1) {
        setWallpaperIndex(index);
        await AsyncStorage.setItem('selectedWallpaperIndex', index.toString());
      } else {
         // If for some reason it's not in the list (shouldn't happen with current UI), maybe clear it or store differently
         // For now, assume it's always from the list
      }
    } catch (err) {
      console.error("Failed to save wallpaper:", err);
    }
  };

  const unlockPremium = async () => {
    try {
      setIsPremium(true);
      await AsyncStorage.setItem('isPremium', 'true');
    } catch (err) {
      console.error("Failed to save premium status:", err);
      setIsPremium(false);
    }
  };

  const setShowPhoneDialer = async (show: boolean) => {
    try {
      setShowPhoneDialerState(show);
      await AsyncStorage.setItem('showPhoneDialer', show.toString());
    } catch (err) {
      console.error("Failed to save showPhoneDialer:", err);
    }
  };

  const setShowCameraIcon = async (show: boolean) => {
    try {
      setShowCameraIconState(show);
      await AsyncStorage.setItem('showCameraIcon', show.toString());
    } catch (err) {
      console.error("Failed to save showCameraIcon:", err);
    }
  };

  const toggleTimeFormat = async () => {
    try {
      const newFormat = timeFormat === '12h' ? '24h' : '12h';
      setTimeFormatState(newFormat);
      await AsyncStorage.setItem('timeFormat', newFormat);
    } catch (err) {
      console.error("Failed to save timeFormat:", err);
    }
  };

  const setTimeFormat = async (format: string) => {
    try {
      setTimeFormatState(format);
      await AsyncStorage.setItem('timeFormat', format);
    } catch (err) {
      console.error("Failed to save timeFormat:", err);
    }
  };

  const setDateFormat = async (format: string) => {
    try {
      setDateFormatState(format);
      await AsyncStorage.setItem('dateFormat', format);
    } catch (err) {
      console.error("Failed to save dateFormat:", err);
    }
  };

  const setTimeOffset = async (offset: number) => {
    try {
      setTimeOffsetState(offset);
      await AsyncStorage.setItem('timeOffset', offset.toString());
    } catch (err) {
      console.error("Failed to save timeOffset:", err);
    }
  };

  return (
    <ColorContext.Provider
      value={{
        selectedColor,
        setSelectedColor,
        isPremium,
        unlockPremium,
        isDarkMode,
        isLoading,
    wallpaper,
    wallpaperIndex,
    setWallpaper,
    showPhoneDialer,
        setShowPhoneDialer,
        showCameraIcon,
        setShowCameraIcon,
        timeFormat,
        setTimeFormat,
        toggleTimeFormat,
        dateFormat,
        setDateFormat,
        timeOffset,
        setTimeOffset,
      }}>
      {children}
    </ColorContext.Provider>
  );
};

// Custom hook
const useColorContext = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColorContext must be used within a ColorProvider');
  }
  return context;
};

export {ColorContext, ColorProvider, useColorContext};