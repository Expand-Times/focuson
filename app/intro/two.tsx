import React from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');

export default function IntroTwo() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#E1EAF5]'}`}>
      <StatusBar
        backgroundColor={isDarkMode ? '#0D121A' : '#E1EAF5'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <View className="relative flex-1 items-center justify-between px-6 pt-8 pb-20">
        {/* Header Section */}
        <View className="mt-8 items-center">
          <Text
            allowFontScaling={false}
            className={`mb-6 text-[24px] font-medium ${
              isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'
            }`}>
            Welcome!
          </Text>
          <Text
            allowFontScaling={false}
            className={`px-4 text-center text-[14px] font-light leading-6 ${
              isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'
            }`}>
            You are one of the{' '}
            <Text
              allowFontScaling={false}
              className={`font-medium ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
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
              style={{
                width: width * 0.6, // screen এর 90%
                height: height * 0.6, // screen এর 60%
              }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Footer Text */}
        <View className="items-center px-4 bottom-16">
          <Text
            allowFontScaling={false}
            className={`mb-12 text-center text-[13px] font-light leading-5 ${
              isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'
            }`}>
            We are excited to help you to{' '}
            <Text
              allowFontScaling={false}
              className={`font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
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
        <View className="absolute bottom-6 left-6 right-6">
          <TouchableOpacity
            activeOpacity={1}
            className={`w-full flex-row items-center justify-center rounded-full ${isDarkMode ? 'border border-[#DADFE5]' : 'border border-[#2E3B4D] '} py-4`}
            onPress={() => router.push('/intro/three')}
          >
            <Text allowFontScaling={false} className={`mr-2 text-[16px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#2E3B4D]'}`}>Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={isDarkMode ? 'white' : '#2E3B4D'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
