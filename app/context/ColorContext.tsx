import React, {createContext, useState, ReactNode, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageSourcePropType } from 'react-native';

// Define the wallpaper types
export type WallpaperItem = string | ImageSourcePropType;

// Define the available wallpapers
export const AVAILABLE_WALLPAPERS: WallpaperItem[] = [
  require('../../assets/images/AbstractGradient.png'),
  require('../../assets/images/NightSky.png'),
  require('../../assets/images/MosqueSilhouette.png'),
  require('../../assets/images/AbstractPattern.png'),
  require('../../assets/images/CloudSky.png'),
  require('../../assets/images/RoundPattern.png'),
  require('../../assets/images/SunFlower.png'),
  '#EBF0F7',
];

// Define the context type
interface ColorContextType {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  isPremium: boolean;
  unlockPremium: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLoading: boolean;
  wallpaper: WallpaperItem | null;
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
const DEFAULT_COLOR = '#148FCC';
const DEFAULT_DARK_MODE = false;
const DEFAULT_PREMIUM = false;

const ColorProvider = ({children}: ColorProviderProps) => {
  const [selectedColor, setSelectedColorState] = useState<string>(DEFAULT_COLOR);
  const [isPremium, setIsPremium] = useState<boolean>(DEFAULT_PREMIUM);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(DEFAULT_DARK_MODE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wallpaper, setWallpaperState] = useState<WallpaperItem | null>('#EBF0F7');
  const [showPhoneDialer, setShowPhoneDialerState] = useState<boolean>(false);
  const [showCameraIcon, setShowCameraIconState] = useState<boolean>(false);
  const [timeFormat, setTimeFormatState] = useState<string>('HH:MM PM');
  const [dateFormat, setDateFormatState] = useState<string>('weekday, day month year');
  const [timeOffset, setTimeOffsetState] = useState<number>(0);

  // ✅ Load saved data when app starts
  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [savedColor, savedDarkMode, savedPremium, savedWallpaperIndex, savedPhoneDialer, savedCameraIcon, savedTimeFormat, savedDateFormat, savedTimeOffset] = await Promise.all([
        AsyncStorage.getItem('selectedColor'),
        AsyncStorage.getItem('isDarkMode'),
        AsyncStorage.getItem('isPremium'),
        AsyncStorage.getItem('selectedWallpaperIndex'),
        AsyncStorage.getItem('showPhoneDialer'),
        AsyncStorage.getItem('showCameraIcon'),
        AsyncStorage.getItem('timeFormat'),
        AsyncStorage.getItem('dateFormat'),
        AsyncStorage.getItem('timeOffset'),
      ]);

      if (savedColor) setSelectedColorState(savedColor);
      if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
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
        }
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
      const index = AVAILABLE_WALLPAPERS.indexOf(newWallpaper);
      if (index !== -1) {
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

  const toggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('isDarkMode', newValue.toString());
    } catch (err) {
      console.error("Failed to save dark mode:", err);
      setIsDarkMode(isDarkMode);
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
        toggleDarkMode,
        isLoading,
        wallpaper,
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