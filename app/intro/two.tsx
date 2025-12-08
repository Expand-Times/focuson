import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function IntroTwo() {
  const router = useRouter();
  useEffect(() => {
      const timer = setTimeout(() => {
        router.push('/intro/three');
      }, 5000);
  
      return () => clearTimeout(timer);
    }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#EBF1F7]">
      <StatusBar />
      <View className="flex-1 items-center justify-between px-6 py-12">
        {/* Header Section */}
        <View className="mt-8 items-center">
          <Text allowFontScaling={false} className="mb-6 text-[24px] font-medium text-[#2E3B4D]">
            Welcome!
          </Text>
          <Text
            allowFontScaling={false}
            className="px-4 text-center text-[14px] font-light leading-6 text-[#2E3B4D]">
            You are one of the{' '}
            <Text allowFontScaling={false} className="font-medium text-[#2E3B4D]">
              aware 0.08%
            </Text>{' '}
            of the
            {'\n'}Smart Phone user!
          </Text>
        </View>

        {/* Central Illustration Placeholder */}
        {/* Since we don't have the exact SVG, we'll create a representative composition */}
        <View className="">
          {/* Composition for "Figure with Rays" */}
          <View className="relative items-center justify-center">
            <Image
              source={require('@/assets/images/InfinityScrollBind.png')}
              className="h-[248px] w-[248px]"
            />
          </View>
        </View>

        {/* Footer Text */}
        <View className="items-center px-4">
          <Text
            allowFontScaling={false}
            className="mb-12 text-center text-[12px] font-light leading-5 text-[#8698B2]">
            We are excited to help you{' '}
            <Text allowFontScaling={false} className="font-bold text-[#8698B2]">
              be free
            </Text>{' '}
            from
            {'\n'}digital distraction.
          </Text>

          {/* Logo Section */}
          <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="relative items-center justify-center">
              <Image
                source={require('@/assets/images/LogoSPS1.png')}
                className="h-[38px] w-[118px] "
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
