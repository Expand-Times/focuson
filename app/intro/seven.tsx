import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroSeven() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EBF1F7]">
      <View className="flex-1 px-6 ">
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-start pt-8">
          {/* Header Section */}
          <View className=" items-center">
            <View className="flex-row items-start">
              <Text
                allowFontScaling={false}
                className="mb-4 text-center text-[18px] font-bold text-[#2E3B4D]">
                Notifications
              </Text>
              <View className="ml-1 mt-2 h-2 w-2 rounded-full bg-red-500" />
            </View>
            <Text
              allowFontScaling={false}
              className="mb-4 px-2 text-center text-[12px] font-light leading-6 text-[#8698B2]">
              Notifications poke and disrupt your concentration.{'\n'}
              They prompt you to check your phone and make you{'\n'}
              feel something engaging is happening,
            </Text>
            <Text
              allowFontScaling={false}
              className="px-2 text-center text-[12px] font-light leading-6 text-[#8698B2]">
              Which leads to spending excessive time on your{'\n'}
              device.
            </Text>
          </View>

          {/* Central Graphic - Notification Icon */}
          <View className="flex-1 items-center justify-center">
            {/* Composition for "Figure with Rays" */}
            <View className="relative items-center justify-center">
              <Image source={require('@/assets/images/55.png')} className="w-[100px] h-[100px]" />
            </View>
          </View>
        </View>

        {/* Fixed Footer Content */}
        <View className="w-full items-center pb-8 pt-4">
          {/* Description Text - Moved here */}
          <Text
            allowFontScaling={false}
            className="mb-8 px-4 text-center text-[12px] font-light leading-5 text-[#8698B2]">
            Introducing <Text className="font-medium text-[#8698B2]">Zuhd Minimal Launcher</Text>{' '}
            notification filter.{'\n'}
            You won't miss important notifications, block{'\n'}
            unnecessary, and stay focused.
          </Text>
          {/* Pagination Dots */}
          <View className="mb-8 flex-row space-x-3">
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                className={`mx-1 h-[18px] w-[18px] rounded-full border border-blue-400 ${i <= 4 ? 'bg-blue-400' : 'bg-transparent'}`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className="mb-4 w-full flex-row items-center justify-center rounded-full bg-[#7EA9E5] py-4"
            onPress={() => router.push('/intro/eight')}>
            <Text allowFontScaling={false} className="mr-2 text-[16px] font-semibold text-white">
              Next
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
