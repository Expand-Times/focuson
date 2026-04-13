import React from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function PremiumUnlockedScreen() {
  const router = useRouter();
 

  return (
    <ImageBackground
      source={require('../../assets/Animation/Premium-Background.png')}
      className="flex-1"
      resizeMode="cover">
      <SafeAreaView className="flex-1 bg-black/80">
        <View className="flex-1 items-center justify-between px-8 py-14">
          {/* Top Section */}
          <View className="mt-12 items-center">
            <Text
              allowFontScaling={false}
              className="text-[55px] font-light text-[#DADFE5] text-white/95">
              Welcome
            </Text>
            <Text
              allowFontScaling={false}
              className="mt-2 text-[18px] font-light text-[#DADFE5] text-white/90">
              <Text className="font-medium">Premium</Text> Feature Unlocked
            </Text>
          </View>

          {/* Central Illustration */}
          <View className="items-center justify-center relative">
            <LottieView
              source={require('../../assets/Animation/Congrats.json')}
              autoPlay
              loop
              style={{
                width: width * 0.8,
                height: width * 0.8,
                position: 'absolute',
                zIndex: 10,
              }}
            />
            <Image
              source={require('../../assets/Animation/premium-account.png')}
              style={{
                width: width * 0.65,
                height: width * 0.65,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Bottom Section */}
          <View className="mb-10 w-full items-center">
            <Text
              allowFontScaling={false}
              className="mb-10 text-center text-[16px] font-light text-[#738099]">
              Thanks for having premium Subscription
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              className="w-full"
              onPress={() => router.replace('/home')}>
              <LinearGradient
                colors={['#FFDD33', '#7FDCE5']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="h-[50px] w-full items-center justify-center overflow-hidden rounded-full">
                <Text
                  allowFontScaling={false}
                  className="text-[16px] font-regular text-[#4C1980]">
                  Enjoy!
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
