import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function IntroThree() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EBF1F7]">
      <View className="flex-1 px-6 pt-8">
        {/* Main Content Area */}
        <View className="mt-[10%] flex-1 items-center justify-center">
          {/* Header Section */}
          <View className="items-center ">
            <Text
              allowFontScaling={false}
              className="mb-4 text-center text-[18px] font-bold text-[#2E3B4D]">
              Why Icons are so colorful?
            </Text>
            <Text
              allowFontScaling={false}
              className="px-2 text-center text-[14px] font-light leading-6 text-[#8698B2]">
              The app icons are colorful. They{'\n'}
              designed{' '}
              <Text allowFontScaling={false} className="font-medium text-[#8698B2]">
                to grab your attention
              </Text>{' '}
              so that{'\n'}
              you open the app.
            </Text>
          </View>

          {/* Central Graphic - Phone Mockup */}
          <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="relative items-center justify-center">
              <Image source={require('@/assets/images/11.png')} style={{
                  width: width * 0.9, // screen এর 90%
                  height: height * 0.6, // screen এর 60%
                }}
                resizeMode="contain"/>

              {/* Description Text - Overlay on Image */}
              <View className=" absolute bottom-[15%] items-center justify-center">
                <Text
                  allowFontScaling={false}
                  className="text-center text-[12px] font-light leading-5 text-[#8698B2]">
                  Consequently, your brain learns that opening{'\n'}
                  colorful icons leads to "interesting" (stimulating){'\n'}
                  content
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fixed Footer Content */}
        <View className="w-full items-center pb-8 pt-4">
          {/* Pagination Dots */}
          <View className="mb-8 flex-row space-x-3">
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                className={`h-[18px] w-[18px] rounded-full border border-[#7EA9E5] mx-1 ${i <= 0 ? 'bg-[#7EA9E5]' : 'bg-transparent'}`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className="mb-4 w-full flex-row items-center justify-center rounded-full bg-[#7EA9E5] py-4"
            onPress={() => router.push('/intro/four')}>
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
