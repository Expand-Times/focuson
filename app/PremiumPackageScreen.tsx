import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorContext } from './context/ColorContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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

  const renderPlanCard = (type: 'monthly' | 'yearly' | 'lifetime', price: string, label: string) => {
    const isSelected = selectedPlan === type;
    const isLifetime = type === 'lifetime';

    // Styles based on the attached image and selection state
    // We keep the "Image" styling but dim the non-selected ones to show state
    
    let bgStyle = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
    let borderStyle = 'border-2 border-transparent';
    let shadowColor = '#000';
    let textsColor = isDarkMode ? 'text-slate-200' : 'text-[#2B2D42]';
    let textColor = isDarkMode ? 'text-slate-200' : 'text-[#8D99AE]';
    let subTextColor = isDarkMode ? 'text-slate-400' : 'text-[#8D99AE]';

    if (type === 'monthly') {
        borderStyle = isDarkMode ? 'border-2 border-slate-700' : 'border-2 border-slate-100';
        shadowColor = '#5B8BDF'; // Blue shadow for monthly
    } else if (type === 'yearly') {
        borderStyle = isDarkMode ? 'border-2 border-slate-700' : 'border-2 border-slate-100';
        shadowColor = '#5B8BDF'; // Standard shadow
    } else if (type === 'lifetime') {
        bgStyle = 'bg-[#5B8BDF]';
        borderStyle = 'border-2 border-[#5B8BDF]';
        shadowColor = '#5B8BDF';
        textColor = 'text-white';
        subTextColor = 'text-slate-100';
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedPlan(type)}
        className={`w-[31%] items-center justify-center rounded-2xl p-3 ${bgStyle} ${borderStyle}`}
        style={{
          shadowColor: shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: type === 'yearly' ? 0.1 : 0.3,
          shadowRadius: 8,
          elevation: 8,
          opacity: isSelected ? 1 : 0.5, // Dim non-selected items
          transform: [{ scale: isSelected ? 1.05 : 1 }] // Slight scale for selected
        }}>
        
        {isLifetime && (
          <View className="absolute -top-3 z-10 rounded-full bg-blue-50 px-3 py-1 shadow-sm">
            <Text className="text-[10px] font-bold text-[#5B8BDF]">Best Deal</Text>
          </View>
        )}

        <Text allowFontScaling={false} className={`mb-2 font-medium ${textsColor} text-[16px]`}>
          {label}
        </Text>
        
        <View className="mb-2 flex-row items-baseline">
          <Text allowFontScaling={false} className={`text-[20px] font-extrabold ${textColor}`}>
            {price}
          </Text>
          <Text allowFontScaling={false} className={`text-[10px] font-medium ${subTextColor} ml-1`}>
            USD
          </Text>
        </View>
        
        <Text allowFontScaling={false} className={`text-center font-light text-[9px] ${subTextColor}`}>
          {type === 'monthly' ? 'Billed monthly' : type === 'yearly' ? 'Billed yearly' : 'Billed once'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/images/Premium-Background.png')}
      className="flex-1"
      resizeMode="cover">
      <SafeAreaView
        className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]/90' : ''}`}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 + insets.bottom }}>
          
          {/* Header Icon & Title */}
          <View className="items-center mb-[5%]">
            <View className="mb-4">
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
          <View className="mb-6 flex-row items-center justify-center px-4 gap-4">
            <Text className={`text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              * Easy Refund policy 
            </Text>
            <Text className={`text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              * Start with 7 days trial
            </Text>
          </View>

          {/* Pricing Cards */}
          <View className="mb-8 flex-row justify-between px-4 items-center">
            {renderPlanCard('monthly', '1', 'Monthly')}
            {renderPlanCard('yearly', '10', 'Yearly')}
            {renderPlanCard('lifetime', '20', 'Lifetime')}
          </View>

          {/* Continue Button */}
          <View className="mb-6 px-6">
            <TouchableOpacity
              className="w-full items-center rounded-2xl bg-[#5C8BCC] py-4 shadow-md"
              activeOpacity={0.9}>
              <Text allowFontScaling={false} className="text-[16px] font-medium text-white">Continue</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View className="mb-6 px-8">
            <Text allowFontScaling={false}
              className={`text-center text-[12px] font-light leading-5 ${isDarkMode ? 'text-slate-400' : 'text-[#8698B2]'}`}>
              No worry! You can still use for free. We'll continue our digital distraction free
              journey together. We're happy to be part of your journey.
            </Text>
          </View>

          {/* Continue Free Button */}
          <View className="px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className={`w-full items-center rounded-2xl py-4 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-[#A3B9D9]'}`}
              activeOpacity={0.9}>
              <Text allowFontScaling={false}
                className={`text-[16px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-[#2E3A4C]'}`}>
                Continue Using Free
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
