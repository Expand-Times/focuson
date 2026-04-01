import '../global.css';

import { Stack } from 'expo-router';
import { ColorProvider } from './context/ColorContext';
import { AppProvider } from './context/AppContext';
import { useFonts } from 'expo-font';
import { Poppins_700Bold, Poppins_400Regular, Poppins_300Light } from '@expo-google-fonts/poppins';
import { Imprima_400Regular } from '@expo-google-fonts/imprima';
import { RobotoMono_700Bold, RobotoMono_400Regular, RobotoMono_300Light } from '@expo-google-fonts/roboto-mono';
import { Monoton_400Regular } from '@expo-google-fonts/monoton';
import { RampartOne_400Regular } from '@expo-google-fonts/rampart-one';
import { RubikMoonrocks_400Regular } from '@expo-google-fonts/rubik-moonrocks';
import { NovaFlat_400Regular } from '@expo-google-fonts/nova-flat';
import { Codystar_400Regular } from '@expo-google-fonts/codystar';
import { LeagueGothic_400Regular } from '@expo-google-fonts/league-gothic';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { FingerPaint_400Regular } from '@expo-google-fonts/finger-paint';
import { GajrajOne_400Regular } from '@expo-google-fonts/gajraj-one';
import { NovaRound_400Regular } from '@expo-google-fonts/nova-round';
import { Nunito_700Bold, Nunito_400Regular, Nunito_300Light } from '@expo-google-fonts/nunito';
import { FredokaOne_400Regular } from '@expo-google-fonts/fredoka-one';
import { Comfortaa_400Regular, Comfortaa_700Bold, Comfortaa_300Light } from '@expo-google-fonts/comfortaa';
import { RubikBurned_400Regular } from '@expo-google-fonts/rubik-burned';
import { RubikScribble_400Regular } from '@expo-google-fonts/rubik-scribble';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import { Oxanium_400Regular } from '@expo-google-fonts/oxanium';
import { Gugi_400Regular } from '@expo-google-fonts/gugi';
import { PlaywriteUSModern_400Regular } from '@expo-google-fonts/playwrite-us-modern';
import { Shizuru_400Regular } from '@expo-google-fonts/shizuru';
import { MontserratAlternates_400Regular } from '@expo-google-fonts/montserrat-alternates';
import { UnicaOne_400Regular } from '@expo-google-fonts/unica-one';
import { Goldman_400Regular, Goldman_700Bold } from '@expo-google-fonts/goldman';
import { LobsterTwo_400Regular, LobsterTwo_700Bold } from '@expo-google-fonts/lobster-two';
import { Sacramento_400Regular } from '@expo-google-fonts/sacramento';
import { RobotoSlab_400Regular } from '@expo-google-fonts/roboto-slab';
import { CourierPrime_400Regular, CourierPrime_700Bold } from '@expo-google-fonts/courier-prime';
import { Dangrek_400Regular } from '@expo-google-fonts/dangrek';
import { DynaPuff_400Regular } from '@expo-google-fonts/dynapuff';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [loaded, error] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_300Light,
    Imprima_400Regular,
    RobotoMono_700Bold,
    RobotoMono_400Regular,
    RobotoMono_300Light,
    Monoton_400Regular,
    RampartOne_400Regular,
    RubikMoonrocks_400Regular,
    NovaFlat_400Regular,
    Codystar_400Regular,
    LeagueGothic_400Regular,
    GreatVibes_400Regular,
    FingerPaint_400Regular,
    GajrajOne_400Regular,
    NovaRound_400Regular,
    Nunito_700Bold,
    Nunito_400Regular,
    Nunito_300Light,
    FredokaOne_400Regular,
    Comfortaa_400Regular,
    Comfortaa_700Bold,
    Comfortaa_300Light,
    RubikBurned_400Regular,
    RubikScribble_400Regular,
    Caprasimo_400Regular,
    Oxanium_400Regular,
    Gugi_400Regular,
    PlaywriteUSModern_400Regular,
    Shizuru_400Regular,
    MontserratAlternates_400Regular,
    UnicaOne_400Regular,
    Goldman_400Regular,
    Goldman_700Bold,
    LobsterTwo_400Regular,
    LobsterTwo_700Bold,
    Sacramento_400Regular,
    RobotoSlab_400Regular,
    CourierPrime_400Regular,
    CourierPrime_700Bold,
    Dangrek_400Regular,
    DynaPuff_400Regular,
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
