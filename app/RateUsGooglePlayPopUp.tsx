import React from 'react';
import {View, Text, TouchableOpacity, Dimensions} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { openPlayStoreForRating } from './lib/rateApp';

const {width} = Dimensions.get('window');

const RateUsGooglePlayPopUp = () => {
  const {height: screenHeight, width: screenWidth} = Dimensions.get('window');
  return (
    <View className="flex-1 items-center justify-center">
      <View
        className="self-center rounded-xl bg-white shadow-md"
        style={{
          width: screenWidth * 0.8,
          height: screenHeight * 0.4,
        }}>
        {/* Header */}
        <View
          className="w-full items-center justify-center rounded-xl bg-[#E3E8F1]"
          style={{
            height: screenHeight * 0.05,
          }}>
          <Text
            allowFontScaling={false}
            className="text-lg font-semibold text-gray-800">
            Do you like ProDaily?
          </Text>
        </View>

        {/* Message */}
        <View className="mb-6 mt-4 items-center px-3">
          <Text
            allowFontScaling={false}
            className="text-center text-sm leading-relaxed text-gray-600">
            To make you productive and proactive, our{'\n'}developers working hard.
          </Text>
          <Text
            allowFontScaling={false}
            className="mt-2 text-center text-sm leading-relaxed text-gray-600">
            Your rating may inspire them to make the app{'\n'}even better.
          </Text>
        </View>

        {/* Stars */}
        <View className="mb-1 flex-row items-center justify-center">
          {Array.from({length: 5}).map((_, index) => (
            <Ionicons
              key={index}
              name="star"
              size={24}
              color="#007AFF"
              className="mx-1"
            />
          ))}
        </View>

        {/* Expectation Text */}
        <Text
          allowFontScaling={false}
          className="mb-4 mt-4 text-center text-xs font-normal text-[#2B2D42]">
          Our expectation{' '}
          <Text className="text-sm font-bold text-[#2B2D42]">
            5/
          </Text>
          <Text className="text-[10px] font-normal text-[#2B2D42]">
            5
          </Text>
        </Text>

        {/* Button */}
        <TouchableOpacity
          className="mt-2 items-center justify-center self-center rounded-full bg-[#148FCC] py-3"
          style={{
            width: screenWidth * 0.6,
            height: screenHeight * 0.05,
          }}
          onPress={openPlayStoreForRating}>
          <Text
            allowFontScaling={false}
            className="text-xs font-medium text-white"
            style={{lineHeight: 18}}>
            Rate on Google Play
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RateUsGooglePlayPopUp;