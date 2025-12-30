import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function IntroSix() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#EBF1F7]'}`}>
      <StatusBar backgroundColor={isDarkMode ? '#0D121A' : '#EBF1F7'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View className="flex-1 px-6 pt-8">
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-center">
          {/* Header Section */}
          <View className="mt-[10%] items-center">
            <Text allowFontScaling={false} className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
              In-app reminder
            </Text>
            <Text allowFontScaling={false} className={`px-2 text-center font-light text-[12px] leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
              Avoid getting lost in endless scrolling. Before using an{'\n'}
              addictive app, set an estimate time limit.
            </Text>
          </View>

          {/* Central Graphic - Phone Mockup with Person Running on Feed Wheel */}
          <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="relative items-center justify-center">
              <Image source={require('@/assets/images/44.png')} style={{
                  width: width * 0.9, // screen এর 90%
                  height: height * 0.6, // screen এর 60%
                }}
                resizeMode="contain"/>
            </View>
          </View>

          {/* Description Text - Moved here */}
          <View className=" absolute bottom-8 items-center justify-center">
            <Text allowFontScaling={false} className={`px-4 text-center font-light text-[13px] leading-5 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
              Enable Reminder for games, social media, and{'\n'}
              addictive apps. And choose Remind, Delay or Quit{'\n'}
              option.
            </Text>
          </View>
        </View>

        {/* Fixed Footer Content */}
        <View className="w-full items-center pb-8 pt-4">
          {/* Pagination Dots */}
          <View className="mb-8 flex-row space-x-3">
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                className={`h-[18px] w-[18px] rounded-full border mx-1 ${isDarkMode ? 'border-[#DADFE5]' : 'border-blue-400'} ${i <= 3 ? (isDarkMode ? 'bg-[#DADFE5]' : 'bg-blue-400') : 'bg-transparent'}`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className={`mb-4 w-full flex-row items-center justify-center rounded-full ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA9E5]'} py-4`}
            onPress={() => router.push('/intro/seven')}>
            <Text allowFontScaling={false} className="mr-2 text-[16px] font-semibold text-white">Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
