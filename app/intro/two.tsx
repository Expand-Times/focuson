import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function IntroTwo() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 items-center justify-between py-12 px-6">
        
        {/* Header Section */}
        <View className="items-center mt-8">
          <Text className="text-3xl font-bold text-slate-800 mb-6">Welcome!</Text>
          <Text className="text-base text-slate-600 text-center leading-6 px-4">
            You are one of the <Text className="font-bold text-slate-900">aware 0.08%</Text> of the
            {'\n'}Smart Phone user!
          </Text>
        </View>

        {/* Central Illustration Placeholder */}
        {/* Since we don't have the exact SVG, we'll create a representative composition */}
        <View className="w-72 h-72 bg-white rounded-[40px] items-center justify-center shadow-sm relative overflow-hidden">
            {/* Abstract shapes to mimic the illustration style */}
            <View className="absolute top-0 left-0 w-full h-full opacity-10 bg-blue-100" />
            
            {/* Main Icon representing "Trapped by Phone" */}
            <View className="items-center">
                <View className="flex-row items-center mb-2">
                    <MaterialCommunityIcons name="cellphone" size={80} color="#1E293B" />
                </View>
                <View className="absolute top-8 w-32 h-16 border-4 border-slate-400 rounded-full opacity-30 rotate-12" />
                <View className="absolute top-12 w-32 h-16 border-4 border-slate-400 rounded-full opacity-30 -rotate-12" />
                <MaterialCommunityIcons name="power-plug-off" size={40} color="#475569" className="mt-2" />
            </View>
        </View>

        {/* Footer Text */}
        <View className="items-center px-4">
          <Text className="text-slate-500 text-center mb-12 leading-5">
            We are excited to help you <Text className="font-bold text-slate-600">be free</Text> from
            {'\n'}digital distraction.
          </Text>

          {/* Logo Section */}
          <View className="flex-row items-center space-x-2">
            <View className="bg-blue-500 rounded-full p-1">
                <MaterialCommunityIcons name="check" size={20} color="white" />
            </View>
            <View>
                <Text className="text-xl font-bold text-blue-600 italic">Expand</Text>
                <Text className="text-sm font-bold text-blue-600 -mt-1 ml-4">Times</Text>
            </View>
          </View>
        </View>

        {/* Navigation Arrow (Consistent with Screen 1) */}
        <TouchableOpacity 
          className="absolute bottom-12 right-8"
          onPress={() => router.push('/intro/three')}
        >
          <MaterialCommunityIcons name="arrow-right" size={32} color="#334155" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
