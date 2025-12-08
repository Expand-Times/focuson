import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function IntroFour() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 px-6 pt-8">
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-center">
          {/* Header Section */}
          <View className="mt-4 items-center">
            <Text allowFontScaling={false} className="mb-4 text-center text-[18px] font-bold text-[#2E3B4D]">
            No icons in Minimal Life
            </Text>
            <Text allowFontScaling={false} className="px-2 text-center font-light text-[12px] leading-6 text-[#8698B2]">
              Apps are shown by name with your{'\n'}
              usage data
            </Text>
          </View>

          {/* Central Graphic - Phone Mockup */}
          <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="relative items-center justify-center">
              <Image source={require('@/assets/images/22.png')} className="" />
            </View>
          </View>

          {/* Description Text - Moved here */}
          <View className=" absolute bottom-8 items-center justify-center">
            <Text allowFontScaling={false} className="px-4 text-center font-light text-[12px] leading-5 text-[#8698B2]">
              The usage data push to think before you intend to{'\n'}
              open an addictive apps/games.
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
                className={`h-[18px] w-[18px] rounded-full border border-blue-400 mx-1 ${i <= 1 ? 'bg-blue-400' : 'bg-transparent'}`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className="mb-4 w-full flex-row items-center justify-center rounded-full bg-[#7EA9E5] py-4"
            onPress={() => router.push('/intro/five')}>
              <Text allowFontScaling={false} className="mr-2 text-[16px] font-semibold text-white">Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
