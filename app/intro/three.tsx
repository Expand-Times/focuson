import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function IntroThree() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#EBF1F7]'}`}>
      <StatusBar
        backgroundColor={isDarkMode ? '#0D121A' : '#EBF1F7'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <View className="flex-1 px-6 pt-8">
        {/* Main Content Area */}
        <View className="mt-[10%] flex-1 items-center justify-center">
          {/* Header Section */}
          <View className="items-center ">
            <Text
              allowFontScaling={false}
              className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
              Why Icons are so colorful?
            </Text>
            <Text
              allowFontScaling={false}
              className={`px-2 text-center text-[14px] font-light leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
              The app icons are colorful. They{'\n'}
              designed{' '}
              <Text
                allowFontScaling={false}
                className={`font-medium ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
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
              <Image
                source={require('@/assets/images/11.png')}
                style={{
                  width: width * 0.9, // screen এর 90%
                  height: height * 0.6, // screen এর 60%
                }}
                resizeMode="contain"
              />

              {/* Description Text - Overlay on Image */}
              <View className=" absolute bottom-[15%] items-center justify-center">
                <Text
                  allowFontScaling={false}
                  className={`text-center text-[13px] font-light leading-5 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
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
                className={`mx-1 h-[18px] w-[18px] rounded-full border ${
                  isDarkMode ? 'border-[#DADFE5]' : 'border-[#7EA9E5]'
                } ${i <= 0 ? (isDarkMode ? 'bg-[#DADFE5]' : 'bg-[#7EA9E5]') : 'bg-transparent'}`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className={`mb-4 w-full flex-row items-center justify-center rounded-full ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#2E3B4D]'} py-4`}
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
