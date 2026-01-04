import '../global.css';

import { Stack } from 'expo-router';
import { ColorProvider } from './context/ColorContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Imprima-Regular': require('../assets/fonts/Imprima-Regular.ttf'),
    'RobotoMono-Bold': require('../assets/fonts/RobotoMono-Bold.ttf'),
    'RobotoMono-Regular': require('../assets/fonts/RobotoMono-Regular.ttf'),
    'RobotoMono-Light': require('../assets/fonts/RobotoMono-Light.ttf'),
    'Monoton-Regular': require('../assets/fonts/Monoton-Regular.ttf'),
    'RampartOne-Regular': require('../assets/fonts/RampartOne-Regular.ttf'),
    'RubikMoonrocks-Regular': require('../assets/fonts/RubikMoonrocks-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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
