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
  openAccessibilitySettings(): void;
  isIgnoringBatteryOptimizations(): boolean;
  isDefaultLauncher(): boolean;
  lockScreen(): boolean;

  getInstalledApps(): AppItem[];
  launchApp(packageName: string): boolean;
  uninstallApp(packageName: string): void;
  startTimerOverlay(durationMs: number, targetPackageName?: string, mode?: string, themeColors?: Record<string, string>): void;
  getWeeklyUsageStats(): { averageDailyUsage: number, averageDailyUnlocks: number };
  getTodayUsageStats(): { totalUsageTime: number, unlockCount: number, packageUsage: Record<string, number> };
  getPackageWeeklyUsage(packageName: string): number;
  getPackageDailyUsage7d(packageName: string): number[];
}

// This call loads the native module object from the JSI.
export default requireNativeModule<LauncherModule>('Launcher');
