import React, { useEffect } from 'react';
import { View, Image, StatusBar,useColorScheme  , Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window');


export default function IntroOne() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/intro/two');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#E1EAF5]'}`}>
      <StatusBar backgroundColor={isDarkMode ? '#0D121A' : '#E1EAF5'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View className="flex-1 items-center justify-center px-6">
        {/* Central White Circle */}
        <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="items-center justify-center relative">
                <Image source={require('@/assets/images/icon.png')} style={{
                    width: width * 0.35, // screen এর 90%
                    height: height * 0.35, 
                  }}
                  resizeMode="contain" />
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
