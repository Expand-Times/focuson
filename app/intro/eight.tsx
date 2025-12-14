import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function IntroEight() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EBF1F7]">
      <View className="flex-1 px-6 pt-8">
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-center">
          {/* Header Section */}
          <View className="mt-[15%] items-center">
            <Text
              allowFontScaling={false}
              className="mb-4 text-center text-[18px] font-bold text-[#2E3B4D]">
              Don't panic Uninstall.
            </Text>
            <Text
              allowFontScaling={false}
              className="font-regular px-2 text-center text-[12px] leading-6 text-[#8698B2]">
              Use at least <Text className="font-medium text-[#8698B2]">7 days</Text>, You're going
              to Love This App
            </Text>
          </View>

          {/* Central Graphic - Two Phone Mockups */}
          <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className=" items-center justify-center">
              <Image
                source={require('@/assets/images/66.png')}
                style={{
                  width: width * 0.9, // screen এর 90%
                  height: height * 0.6, // screen এর 60%
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Description Text - Moved here */}
          <View className="mb-[25%]">
            <Text
              allowFontScaling={false}
              className=" px-4 text-center text-[12px] font-light leading-5 text-[#8698B2]">
              Give it only a week, and you'll discover why this is{'\n'}
              your must-have app.
            </Text>

            <Text
              allowFontScaling={false}
              className="px-8 text-center text-[12px] font-light leading-4 text-[#8698B2]">
              Next: we need a few permissions to make{' '}
              <Text className="font-bold text-[#8698B2]">Zuhd</Text> Minimal{'\n'}
              Launcher work the way it's meant to
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
                className={`mx-1 h-[18px] w-[18px] rounded-full border border-blue-400 ${i <= 5 ? 'bg-blue-400' : 'bg-transparent'}`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className="mb-4 w-full flex-row items-center justify-center rounded-full bg-[#7EA9E5] py-4"
            onPress={() => router.push('/intro/nine')}>
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
