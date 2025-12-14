import React, { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');


export default function IntroOne() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/intro/two');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#E1EAF5]">
      <StatusBar backgroundColor="#7EA9E5" barStyle="dark-content" />
      <View className="flex-1 items-center justify-center px-6">
        {/* Central White Circle */}
        <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="items-center justify-center relative">
                <Image source={require('@/assets/images/Logo.png')} style={{
                    width: width * 0.5, // screen এর 90%
                    height: height * 0.5, // screen এর 60%
                  }}
                  resizeMode="contain" />
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
