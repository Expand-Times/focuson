import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './Launcher.types';

type LauncherModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class LauncherModule extends NativeModule<LauncherModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }

  checkUsageStatsPermission() { return true; }
  checkOverlayPermission() { return true; }
  isAccessibilityServiceEnabled() { return true; }
  isIgnoringBatteryOptimizations() { return true; }
  getInstalledApps() { return []; }
  launchApp(packageName: string) { return false; }
  uninstallApp(packageName: string) { console.log("Uninstalling " + packageName); }
  startTimerOverlay(durationMs: number, targetPackageName?: string, mode?: string) { console.log("Starting timer overlay for " + durationMs + "ms mode: " + mode); }
};

export default registerWebModule(LauncherModule, 'LauncherModule');
