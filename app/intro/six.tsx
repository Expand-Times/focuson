import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroSix() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 items-center justify-between py-8 px-6">
        
        {/* Header Section */}
        <View className="items-center mt-4">
          <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">In-app reminder</Text>
          <Text className="text-base text-slate-500 text-center leading-6 px-2">
            Avoid getting lost in endless scrolling. Before using an{'\n'}
            addictive app, set an estimate time limit.
          </Text>
        </View>

        {/* Central Graphic - Phone Mockup with Person Running on Feed Wheel */}
        <View className="items-center justify-center my-4">
            {/* Phone Frame */}
            <View className="bg-white rounded-[30px] border-4 border-white shadow-sm overflow-hidden" style={{ width: width * 0.6, height: width * 1.0 }}>
                {/* Screen Content */}
                <View className="flex-1 bg-slate-100 relative items-center justify-center p-4">
                    
                    {/* The "Hamster Wheel" of Social Media */}
                    <View className="items-center justify-center relative">
                        {/* Curved Feed Background (The Wheel) */}
                        <View className="w-48 h-48 border-r-8 border-b-8 border-blue-200 rounded-full absolute -right-4 rotate-45 opacity-50" />
                        
                        {/* Feed Items on the Wheel (Abstract) */}
                        <View className="absolute top-0 right-0 transform rotate-12 bg-white p-1 rounded shadow-sm w-16 h-12 border border-slate-100">
                             <View className="h-1 w-8 bg-red-200 mb-1" />
                             <View className="h-6 w-full bg-blue-100" />
                        </View>
                        <View className="absolute bottom-4 right-4 transform -rotate-12 bg-white p-1 rounded shadow-sm w-16 h-12 border border-slate-100">
                             <View className="h-1 w-8 bg-red-200 mb-1" />
                             <View className="h-6 w-full bg-blue-100" />
                        </View>

                        {/* Person Running (Icon Composition) */}
                        <View className="items-center z-10 mr-8">
                             <MaterialCommunityIcons name="run-fast" size={80} color="#EF4444" />
                        </View>
                    </View>

                    {/* Warning Sign */}
                    <View className="mt-8">
                        <MaterialCommunityIcons name="alert-outline" size={48} color="#EAB308" />
                    </View>

                </View>
            </View>
        </View>

        {/* Footer Content */}
        <View className="items-center w-full">
            <Text className="text-slate-400 text-center text-sm mb-8 px-4 leading-5">
                Enable Reminder for games, social media, and{'\n'}
                addictive apps. And choose Remind, Delay or Quit{'\n'}
                option.
            </Text>

            {/* Pagination Dots */}
            <View className="flex-row space-x-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <View 
                        key={i} 
                        className={`w-3 h-3 rounded-full border border-blue-400 ${i === 3 ? 'bg-blue-400' : 'bg-transparent'} ${i < 3 ? 'bg-blue-300 border-blue-300' : ''}`} 
                    />
                ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity 
                className="w-full bg-[#7EA6E0] py-4 rounded-full flex-row items-center justify-center mb-4"
                onPress={() => router.push('/intro/seven')}
            >
                <Text className="text-white text-lg font-semibold mr-2">Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
