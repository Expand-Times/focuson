import '../global.css';

import { Stack } from 'expo-router';
import { ColorProvider } from './context/ColorContext';
import { AppProvider } from './context/AppContext';
import { useFonts } from 'expo-font';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { Imprima_400Regular } from '@expo-google-fonts/imprima';
import { RobotoMono_400Regular } from '@expo-google-fonts/roboto-mono';
import { Monoton_400Regular } from '@expo-google-fonts/monoton';
import { RampartOne_400Regular } from '@expo-google-fonts/rampart-one';
import { RubikMoonrocks_400Regular } from '@expo-google-fonts/rubik-moonrocks';
import { Codystar_400Regular } from '@expo-google-fonts/codystar';
import { LeagueGothic_400Regular } from '@expo-google-fonts/league-gothic';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { NovaRound_400Regular } from '@expo-google-fonts/nova-round';
import { Comfortaa_400Regular } from '@expo-google-fonts/comfortaa';
import { RubikBurned_400Regular } from '@expo-google-fonts/rubik-burned';
import { RubikScribble_400Regular } from '@expo-google-fonts/rubik-scribble';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import { Gugi_400Regular } from '@expo-google-fonts/gugi';
import { PlaywriteUSModern_400Regular } from '@expo-google-fonts/playwrite-us-modern';
import { Shizuru_400Regular } from '@expo-google-fonts/shizuru';
import { MontserratAlternates_400Regular } from '@expo-google-fonts/montserrat-alternates';
import { UnicaOne_400Regular } from '@expo-google-fonts/unica-one';
import { Goldman_400Regular } from '@expo-google-fonts/goldman';
import { LobsterTwo_400Regular } from '@expo-google-fonts/lobster-two';
import { RobotoSlab_400Regular } from '@expo-google-fonts/roboto-slab';
import { CourierPrime_400Regular, CourierPrime_700Bold } from '@expo-google-fonts/courier-prime';
import { Dangrek_400Regular } from '@expo-google-fonts/dangrek';
import { DynaPuff_400Regular } from '@expo-google-fonts/dynapuff';
import { RammettoOne_400Regular } from '@expo-google-fonts/rammetto-one';
import { Frijole_400Regular } from '@expo-google-fonts/frijole';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Galada_400Regular } from '@expo-google-fonts/galada';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

// Swallow the transient "Attempted to navigate before mounting the Root Layout
// component" error thrown by expo-router's assertIsReady. It fires when a press
// handler dispatches router.push/replace/back/navigate during the brief window
// when the NavigationContainer is between unmount and remount — most commonly
// during the launcher-role JS reload. In dev this just shows a redbox, but in
// release it's an uncaught JS exception that crashes the app via the native
// ExceptionsManager. The press itself is harmless to drop on the floor;
// whatever the user wanted to do, they can tap again once the new tree is
// ready. Every other error still bubbles to the original handler.
{
  const globalAny = global as unknown as {
    ErrorUtils?: {
      getGlobalHandler: () => (e: Error, isFatal?: boolean) => void;
      setGlobalHandler: (cb: (e: Error, isFatal?: boolean) => void) => void;
    };
  };
  const eu = globalAny.ErrorUtils;
  if (eu) {
    const previous = eu.getGlobalHandler();
    eu.setGlobalHandler((error, isFatal) => {
      const msg = (error && (error as Error).message) || '';
      if (msg.includes('Attempted to navigate before mounting')) {
        console.warn('[focuson] swallowed transient nav-not-ready:', msg);
        return;
      }
      previous(error, isFatal);
    });
  }
}

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Imprima_400Regular,
    RobotoMono_400Regular,
    Monoton_400Regular,
    RampartOne_400Regular,
    RubikMoonrocks_400Regular,
    Codystar_400Regular,
    LeagueGothic_400Regular,
    GreatVibes_400Regular,
    NovaRound_400Regular,
    Comfortaa_400Regular,
    RubikBurned_400Regular,
    RubikScribble_400Regular,
    Caprasimo_400Regular,
    Gugi_400Regular,
    PlaywriteUSModern_400Regular,
    Shizuru_400Regular,
    MontserratAlternates_400Regular,
    UnicaOne_400Regular,
    Goldman_400Regular,
    LobsterTwo_400Regular,
    RobotoSlab_400Regular,
    CourierPrime_400Regular,
    CourierPrime_700Bold,
    Dangrek_400Regular,
    DynaPuff_400Regular,
    RammettoOne_400Regular,
    Frijole_400Regular,
    Pacifico_400Regular,
    Galada_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Don't let font loading block the launcher — hide splash after 600 ms max
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 600);
    return () => clearTimeout(timer);
  }, []);

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
