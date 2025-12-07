import { NativeModule, requireNativeModule } from 'expo';

import { LauncherModuleEvents, AppItem } from './Launcher.types';

declare class LauncherModule extends NativeModule<LauncherModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;

  checkUsageStatsPermission(): boolean;
  openUsageAccessSettings(): void;
  checkOverlayPermission(): boolean;
  checkNotificationPermission(): boolean;
  openNotificationSettings(): void;
  isAccessibilityServiceEnabled(): boolean;
  isIgnoringBatteryOptimizations(): boolean;

  getInstalledApps(): AppItem[];
  launchApp(packageName: string): boolean;
  startTimerOverlay(durationMs: number, targetPackageName?: string): void;
  getWeeklyUsageStats(): { averageDailyUsage: number, averageDailyUnlocks: number };
  getTodayUsageStats(): { totalUsageTime: number, unlockCount: number };
}

// This call loads the native module object from the JSI.
export default requireNativeModule<LauncherModule>('Launcher');
