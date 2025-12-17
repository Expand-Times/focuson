import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorContext } from './context/ColorContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default function PremiumPackageScreen() {
  const router = useRouter();
  const { isDarkMode } = useColorContext();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('lifetime');

  const features = [
    'Up to 6 Favorite Apps',
    'Up to 6 Color Scheme',
    'Unlimited App/Category Rename',
    'Unlimited Hide Privacy App',
    'Set Home Background Image',
    'Upcoming premium features',
  ];

  return (
    <ImageBackground
      source={require('../assets/images/Premium-Background.png')}
      className="flex-1"
      resizeMode="cover">
      <SafeAreaView
        className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]/90' : 'bg-white/90'}`}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 + insets.bottom }}>
          
          {/* Header Icon & Title */}
          <View className="items-center">
            <View className="">
              <Image
                source={require('../assets/images/premium-account.png')}
                style={{
                  width: width * 0.35,
                  height: width * 0.35,
                }}
                resizeMode="contain"
              />
            </View>
            <Text allowFontScaling={false} className={`text-[16px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#2E3A4C]'}`}>
              Become a Premium User
            </Text>
          </View>

          {/* Features List */}
          <View className="px-10 mt-[5%]">
            {features.map((feature, index) => (
              <View key={index} className="mb-3 flex-row items-center">
                <MaterialCommunityIcons
                  name="thumb-up-outline"
                  size={20}
                  color="#5C8BCC"
                  style={{ marginRight: 12 }}
                />
                <Text allowFontScaling={false} className={`text-[14px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-[#8698B2]'}`}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Trial Info */}
          <View className="mt-[10%] mb-[5%] items-center px-4">
            <Text className={`text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              * Easy Refund policy * Start with 7 days trial
            </Text>
          </View>

          {/* Pricing Cards */}
          <View className="mb-8 flex-row justify-between px-4">
            {/* Monthly */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPlan('monthly')}
              className={`w-[31%] items-center justify-center rounded-2xl border-2 p-3 ${
                selectedPlan === 'monthly'
                  ? 'border-[#5B8BDF] bg-white'
                  : 'border-transparent bg-white/50 border-[#5B8BDF] shadow-xl'
              } ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}
              style={{
                ...(selectedPlan === 'monthly'
                  ? {
                      shadowColor: '#5B8BDF',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 8,
                    }
                  : {}),
                ...(isDarkMode && selectedPlan !== 'monthly'
                  ? { backgroundColor: '#1E293B', opacity: 0.6 }
                  : {}),
              }}>
              <Text
                className={`mb-1 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Monthly
              </Text>
              <View className="mb-1 flex-row items-baseline">
                <Text
                  className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  1
                </Text>
                <Text
                  className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {' '}
                  USD
                </Text>
              </View>
              <Text className="text-center text-[10px] text-slate-400">Billed monthly</Text>
            </TouchableOpacity>

            {/* Yearly */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPlan('yearly')}
              className={`w-[31%] items-center justify-center rounded-2xl border-2 p-3 ${
                selectedPlan === 'yearly'
                  ? 'border-[#5B8BDF] bg-white'
                  : 'border-transparent bg-white/50'
              } ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}
              style={{
                ...(selectedPlan === 'yearly'
                  ? {
                      shadowColor: '#5B8BDF',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 8,
                    }
                  : {}),
                ...(isDarkMode && selectedPlan !== 'yearly'
                  ? { backgroundColor: '#1E293B', opacity: 0.6 }
                  : {}),
              }}>
              <Text
                className={`mb-1 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Yearly
              </Text>
              <View className="mb-1 flex-row items-baseline">
                <Text
                  className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  10
                </Text>
                <Text
                  className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {' '}
                  USD
                </Text>
              </View>
              <Text className="text-center text-[10px] text-slate-400">Billed yearly</Text>
            </TouchableOpacity>

            {/* Lifetime */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPlan('lifetime')}
              className={`relative w-[31%] items-center justify-center rounded-2xl p-3 ${
                selectedPlan === 'lifetime'
                  ? 'bg-[#5B8BDF]'
                  : isDarkMode
                    ? 'bg-[#1E293B]'
                    : 'bg-white'
              }`}
              style={{
                shadowColor: '#5B8BDF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }}>
              {/* Best Deal Badge */}
              <View className="absolute -top-3 z-10 rounded-full bg-white px-2 py-0.5 shadow-sm">
                <Text className="text-[10px] font-bold text-[#5B8BDF]">Best Deal</Text>
              </View>

              <Text
                className={`mb-1 font-bold ${selectedPlan === 'lifetime' ? 'text-white' : isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Lifetime
              </Text>
              <View className="mb-1 flex-row items-baseline">
                <Text
                  className={`text-2xl font-bold ${selectedPlan === 'lifetime' ? 'text-white' : isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  20
                </Text>
                <Text
                  className={`text-xs font-medium ${selectedPlan === 'lifetime' ? 'text-slate-100' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {' '}
                  USD
                </Text>
              </View>
              <Text
                className={`text-center text-[10px] ${selectedPlan === 'lifetime' ? 'text-slate-100' : 'text-slate-400'}`}>
                Billed once
              </Text>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <View className="mb-6 px-6">
            <TouchableOpacity
              className="w-full items-center rounded-xl bg-[#5B8BDF] py-4 shadow-md"
              activeOpacity={0.9}>
              <Text className="text-lg font-semibold text-white">Continue</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View className="mb-6 px-8">
            <Text
              className={`text-center text-xs leading-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No worry! You can still use for free. We'll continue our digital distraction free
              journey together. We're happy to be part of your journey.
            </Text>
          </View>

          {/* Continue Free Button */}
          <View className="px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className={`w-full items-center rounded-xl py-4 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-[#9FBFE0]'}`}
              activeOpacity={0.9}>
              <Text
                className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Continue Using Free
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
