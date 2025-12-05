// Reexport the native module. On web, it will be resolved to LauncherModule.web.ts
// and on native platforms to LauncherModule.ts
export { default } from './src/LauncherModule';
export { default as LauncherView } from './src/LauncherView';
export * from  './src/Launcher.types';
