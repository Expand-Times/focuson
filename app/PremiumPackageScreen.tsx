import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorContext } from './context/ColorContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumPackageScreen() {
  const router = useRouter();
  const { isDarkMode } = useColorContext();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('lifetime');

  const features = [
    "Up to 6 Favorite Apps",
    "Up to 6 Color Scheme",
    "Unlimited App/Category Rename",
    "Unlimited Hide Privacy App",
    "Set Home Background Image",
    "Upcoming premium features"
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F0F4F8]'}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Icon & Title */}
        <View className="items-center mt-10 mb-6">
          <View className="mb-4">
             {/* Using a combination of icons to mimic the crown user icon */}
             <MaterialCommunityIcons name="crown-outline" size={60} color="#F472B6" style={{ position: 'absolute', top: -25, left: 10, zIndex: 10 }} />
             <MaterialCommunityIcons name="account-circle-outline" size={80} color="#60A5FA" />
          </View>
          <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
            Become a Premium User
          </Text>
        </View>

        {/* Features List */}
        <View className="px-8 mb-8">
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="thumb-up-outline" size={20} color="#60A5FA" style={{ marginRight: 12 }} />
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Trial Info */}
        <View className="items-center mb-6">
          <Text className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            * Easy Refund policy  * Start with 7 days trial
          </Text>
        </View>

        {/* Pricing Cards */}
        <View className="flex-row justify-between px-4 mb-8">
          
          {/* Monthly */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('monthly')}
            className={`w-[31%] rounded-2xl p-3 items-center justify-center border-2 ${
              selectedPlan === 'monthly' 
                ? 'border-[#5B8BDF] bg-white' 
                : 'border-transparent bg-white/50'
            } ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}
            style={isDarkMode && selectedPlan !== 'monthly' ? { backgroundColor: '#1E293B', opacity: 0.6 } : {}}
          >
            <Text className={`font-bold mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Monthly</Text>
            <View className="flex-row items-baseline mb-1">
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>1</Text>
              <Text className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}> USD</Text>
            </View>
            <Text className="text-[10px] text-slate-400 text-center">Billed monthly</Text>
          </TouchableOpacity>

          {/* Yearly */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('yearly')}
            className={`w-[31%] rounded-2xl p-3 items-center justify-center border-2 ${
              selectedPlan === 'yearly' 
                ? 'border-[#5B8BDF] bg-white' 
                : 'border-transparent bg-white/50'
            } ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}
            style={isDarkMode && selectedPlan !== 'yearly' ? { backgroundColor: '#1E293B', opacity: 0.6 } : {}}
          >
            <Text className={`font-bold mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Yearly</Text>
            <View className="flex-row items-baseline mb-1">
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>10</Text>
              <Text className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}> USD</Text>
            </View>
            <Text className="text-[10px] text-slate-400 text-center">Billed yearly</Text>
          </TouchableOpacity>

          {/* Lifetime */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('lifetime')}
            className={`w-[31%] rounded-2xl p-3 items-center justify-center relative ${
              selectedPlan === 'lifetime' 
                ? 'bg-[#5B8BDF]' 
                : (isDarkMode ? 'bg-[#1E293B]' : 'bg-white')
            }`}
            style={{ 
              shadowColor: "#5B8BDF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            {/* Best Deal Badge */}
            <View className="absolute -top-3 bg-white px-2 py-0.5 rounded-full shadow-sm z-10">
               <Text className="text-[10px] font-bold text-[#5B8BDF]">Best Deal</Text>
            </View>

            <Text className={`font-bold mb-1 ${selectedPlan === 'lifetime' ? 'text-white' : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>Lifetime</Text>
            <View className="flex-row items-baseline mb-1">
              <Text className={`text-2xl font-bold ${selectedPlan === 'lifetime' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-slate-800')}`}>20</Text>
              <Text className={`text-xs font-medium ${selectedPlan === 'lifetime' ? 'text-slate-100' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}> USD</Text>
            </View>
            <Text className={`text-[10px] text-center ${selectedPlan === 'lifetime' ? 'text-slate-100' : 'text-slate-400'}`}>Billed once</Text>
          </TouchableOpacity>

        </View>

        {/* Continue Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity 
            className="w-full bg-[#5B8BDF] py-4 rounded-xl items-center shadow-md"
            activeOpacity={0.9}
          >
            <Text className="text-white font-semibold text-lg">Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View className="px-8 mb-6">
          <Text className={`text-center text-xs leading-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            No worry! You can still use for free. We'll continue our digital distraction free journey together. We're happy to be part of your journey.
          </Text>
        </View>

        {/* Continue Free Button */}
        <View className="px-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className={`w-full py-4 rounded-xl items-center ${isDarkMode ? 'bg-[#1E293B]' : 'bg-[#9FBFE0]'}`}
            activeOpacity={0.9}
          >
            <Text className={`font-semibold text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Continue Using Free</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
