import '../global.css';

import { Stack } from 'expo-router';
import { ColorProvider } from './context/ColorContext';
import { AppProvider } from './context/AppContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

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
    'NovaFlat-Regular': require('../assets/fonts/NovaFlat-Regular.ttf'),
    'Codystar-Regular': require('../assets/fonts/Codystar-Regular.ttf'),
    'LeagueGothic-Regular': require('../assets/fonts/LeagueGothic-Regular.ttf'),
    'GreatVibes-Regular': require('../assets/fonts/GreatVibes-Regular.ttf'),
    'FingerPaint-Regular': require('../assets/fonts/FingerPaint-Regular.ttf'),
    'GajrajOne-Regular': require('../assets/fonts/GajrajOne-Regular.ttf'),
    'NovaRound-Regular': require('../assets/fonts/NovaRound-Regular.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Light': require('../assets/fonts/Nunito-Light.ttf'),
    'FredokaOne-Regular': require('../assets/fonts/FredokaOne-Regular.ttf'),
    'Comfortaa-Regular': require('../assets/fonts/Comfortaa-Regular.ttf'),
    'Comfortaa-Bold': require('../assets/fonts/Comfortaa-Bold.ttf'),
    'Comfortaa-Light': require('../assets/fonts/Comfortaa-Light.ttf'),
    'RubikBurned-Regular': require('../assets/fonts/RubikBurned-Regular.ttf'),
    'RubikScribble-Regular': require('../assets/fonts/RubikScribble-Regular.ttf'),
    'Caprasimo-Regular': require('../assets/fonts/Caprasimo-Regular.ttf'),
    'Oxanium-Regular': require('../assets/fonts/Oxanium-Regular.ttf'),
    'Gugi-Regular': require('../assets/fonts/Gugi-Regular.ttf'),
    'PlaywriteUSModern-Regular': require('../assets/fonts/PlaywriteUSModern-Regular.ttf'),
    'Shizuru-Regular': require('../assets/fonts/Shizuru-Regular.ttf'),
    'MontserratAlternates-Regular': require('../assets/fonts/MontserratAlternates-Regular.ttf'),
    'UnicaOne-Regular': require('../assets/fonts/UnicaOne-Regular.ttf'),
    'Goldman-Regular': require('../assets/fonts/Goldman-Regular.ttf'),
    'Goldman-Bold': require('../assets/fonts/Goldman-Bold.ttf'),
    'LobsterTwo-Regular': require('../assets/fonts/LobsterTwo-Regular.ttf'),
    'LobsterTwo-Bold': require('../assets/fonts/LobsterTwo-Bold.ttf'),
    'Sacramento-Regular': require('../assets/fonts/Sacramento-Regular.ttf'),
    'RobotoSlab-Regular': require('../assets/fonts/RobotoSlab-Regular.ttf'),
    'CourierPrime-Regular': require('../assets/fonts/CourierPrime-Regular.ttf'),
    'CourierPrime-Bold': require('../assets/fonts/CourierPrime-Bold.ttf'),
    'Dangrek-Regular': require('../assets/fonts/Dangrek-Regular.ttf'),
    'DynaPuff-Regular': require('../assets/fonts/DynaPuff-Regular.ttf'),
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
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: {
              backgroundColor: isDarkMode ? '#0D121A' : '#EBF1F7',
            },
          }}
        />
      </AppProvider>
    </ColorProvider>
  );
}
