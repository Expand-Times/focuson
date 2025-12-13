import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroFive() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EBF1F7]">
      <View className="flex-1 px-6 pt-8">
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-center">
          {/* Header Section */}
          <View className="mt-4 items-center">
            <Text allowFontScaling={false} className="mb-4 text-center text-[18px] font-bold text-[#2E3B4D]">
              Infinite feeds
            </Text>
          </View>

          {/* Central Graphic - Phone Mockup with Infinite Scroll */}
          <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="relative items-center justify-center">
              <Image source={require('@/assets/images/33.png')} className="" />
            </View>
          </View>

          {/* Description Text - Moved here */}
          <View className=" absolute bottom-8 items-center justify-center">
            <Text allowFontScaling={false} className="px-4 text-center font-light text-[12px] leading-5 text-[#8698B2]">
            Social media platforms use AI to customize content{'\n'}
            based on your interests, with the goal of increasing the{'\n'}
            time you spend using the app.
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
                className={`h-[18px] w-[18px] rounded-full border border-blue-400 mx-1 ${i <= 2 ? 'bg-[#7EA9E5]' : 'bg-transparent'}`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className="mb-4 w-full flex-row items-center justify-center rounded-full bg-[#7EA9E5] py-4"
            onPress={() => router.push('/intro/six')}>
            <Text allowFontScaling={false} className="mr-2 text-[16px] font-semibold text-white">Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
