import * as React from 'react';

import { LauncherViewProps } from './Launcher.types';

export default function LauncherView(props: LauncherViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
