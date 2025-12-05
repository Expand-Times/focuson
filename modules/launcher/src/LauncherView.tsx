import { requireNativeView } from 'expo';
import * as React from 'react';

import { LauncherViewProps } from './Launcher.types';

const NativeView: React.ComponentType<LauncherViewProps> =
  requireNativeView('Launcher');

export default function LauncherView(props: LauncherViewProps) {
  return <NativeView {...props} />;
}
