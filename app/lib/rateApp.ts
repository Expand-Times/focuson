import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const PACKAGE_NAME = 'com.expandtimes.minimallife';
const HAS_RATED_KEY = 'hasRatedOnGooglePlay';

export async function openPlayStoreForRating(): Promise<void> {
  const marketUrl = `market://details?id=${PACKAGE_NAME}`;
  const webUrl = `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`;

  // Try native in-app review first
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      StoreReview.requestReview();
      await markUserRated();
      return;
    }
  } catch {}

  // Fallback: open store page
  if (Platform.OS === 'android') {
    try {
      const canOpenMarket = await Linking.canOpenURL(marketUrl);
      if (canOpenMarket) {
        await Linking.openURL(marketUrl);
        await markUserRated();
        return;
      }
    } catch {
      // ignore and fallback
    }
    try {
      await Linking.openURL(webUrl);
      await markUserRated();
    } catch {}
  } else {
    // Non-Android fallback to web Play Store page
    try {
      await Linking.openURL(webUrl);
      await markUserRated();
    } catch {}
  }
}

export async function markUserRated(): Promise<void> {
  try {
    await AsyncStorage.setItem(HAS_RATED_KEY, 'true');
  } catch {}
}

export async function hasUserRated(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(HAS_RATED_KEY);
    return v === 'true';
  } catch {
    return false;
  }
}

export default function rateAppRoute() { return null; }