import '../global.css';

import { Stack } from 'expo-router';
import { ColorProvider } from './context/ColorContext';

export default function Layout() {
  return (
    <ColorProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ColorProvider>
  );
}
