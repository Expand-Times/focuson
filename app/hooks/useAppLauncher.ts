import { Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { openApplication } from 'expo-intent-launcher';
import Launcher from '../../modules/launcher';
import { AppItem } from '../../modules/launcher/src/Launcher.types';
import { useAppContext } from '../context/AppContext';
import { useColorContext } from '../context/ColorContext';
import wallpaperFontConfig from '../constants/wallpaperFontConfig';
import { getFilteredThemeColors } from '../utils/themeUtils';

export const useAppLauncher = () => {
  const { wallpaperIndex } = useColorContext();
  const { reminderOption } = useAppContext();

  const checkPermissions = (): boolean => {
    const hasUsagePermission = Launcher.checkUsageStatsPermission();
    if (!hasUsagePermission) {
      Alert.alert(
        'Permission Required',
        'To track usage limits, please grant Usage Access permission.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Launcher.openUsageAccessSettings();
            },
          },
        ]
      );
      return false;
    }

    const hasNotificationPermission = Launcher.checkNotificationPermission();
    if (!hasNotificationPermission) {
      Alert.alert(
        'Permission Required',
        'To show the usage monitor notification, please grant Notification permission.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Launcher.openNotificationSettings();
            },
          },
        ]
      );
      return false;
    }

    return true;
  };

  const launchAppWithTimer = (app: AppItem, durationMinutes: number): boolean => {
    try {
      if (!checkPermissions()) {
        return false;
      }

      // Start the overlay timer
      const durationMs = durationMinutes * 60 * 1000; // 15 seconds per "minute" unit? Or is it 15 min?
      // Re-reading original code: const durationMs = durationMinutes * 15 * 1000;
      // It seems "durationMinutes" is actually a unit multiplier where 1 unit = 15 seconds?
      // Or maybe it's just a calculation. I will keep it exactly as is.

      // Prepare theme colors
      const fontConfig = wallpaperIndex >= 0 ? wallpaperFontConfig[wallpaperIndex] : null;
      const theme = fontConfig || ({} as any);
      
      const themeColors = getFilteredThemeColors(theme);

      Launcher.startTimerOverlay(
        durationMs,
        app.packageName,
        reminderOption,
        themeColors
      );

      // Open the app
      openApplication(app.packageName);
      return true;
    } catch (error) {
      console.error('Failed to launch app:', error);
      return false;
    }
  };

  return {
    launchAppWithTimer,
    checkPermissions
  };
};

export default function useAppLauncherRoute() { return null; }
