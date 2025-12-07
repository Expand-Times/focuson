import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroFive() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 items-center justify-between py-8 px-6">
        
        {/* Header Section */}
        <View className="items-center mt-4">
          <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">Infinite feeds</Text>
        </View>

        {/* Central Graphic - Phone Mockup with Infinite Scroll */}
        <View className="items-center justify-center my-4">
            {/* Phone Frame */}
            <View className="bg-white rounded-[30px] border-4 border-white shadow-sm overflow-hidden" style={{ width: width * 0.6, height: width * 1.0 }}>
                {/* Screen Content */}
                <View className="flex-1 bg-slate-100 relative items-center justify-center overflow-hidden">
                    {/* Background Feed (Blurred/Faded) */}
                    <View className="absolute w-full h-full opacity-30">
                         {[...Array(6)].map((_, i) => (
                            <View key={i} className="mb-4 px-4">
                                <View className="h-2 w-3/4 bg-blue-300 rounded mb-2" />
                                <View className="h-2 w-full bg-slate-300 rounded mb-1" />
                                <View className="h-2 w-5/6 bg-slate-300 rounded mb-1" />
                                <View className="h-20 w-full bg-slate-200 rounded mt-2" />
                            </View>
                         ))}
                    </View>

                    {/* Foreground Phone showing Content */}
                    <View className="w-32 h-56 bg-white rounded-2xl border-2 border-slate-700 shadow-xl items-center p-2 z-10">
                         {/* Notch */}
                         <View className="w-12 h-3 bg-slate-800 rounded-b-lg mb-2" />
                         
                         {/* Feed Item */}
                         <View className="w-full">
                            <View className="h-1.5 w-3/4 bg-slate-400 rounded mb-1.5" />
                            <View className="h-1.5 w-full bg-slate-200 rounded mb-1" />
                            <View className="h-1.5 w-5/6 bg-slate-200 rounded mb-1" />
                            <View className="h-12 w-full bg-slate-300 rounded mt-2 flex-row space-x-1 p-1">
                                <View className="flex-1 bg-slate-400 rounded" />
                                <View className="flex-1 bg-slate-400 rounded" />
                                <View className="flex-1 bg-slate-400 rounded" />
                            </View>
                            <View className="h-1.5 w-full bg-slate-200 rounded mt-2" />
                            <View className="h-1.5 w-2/3 bg-slate-200 rounded mt-1" />
                         </View>
                    </View>

                    {/* Hand/Finger Interaction (Abstract) */}
                    <View className="absolute -bottom-12 -right-4">
                         {/* Simple shapes to suggest a hand holding and scrolling */}
                         <View className="w-24 h-48 bg-red-100 rounded-full rotate-12 opacity-80" />
                    </View>
                </View>
            </View>
        </View>

        {/* Footer Content */}
        <View className="items-center w-full">
            <Text className="text-slate-400 text-center text-sm mb-8 px-4 leading-5">
                Social media platforms use AI to customize content{'\n'}
                based on your interests, with the goal of increasing the{'\n'}
                time you spend using the app.
            </Text>

            {/* Pagination Dots */}
            <View className="flex-row space-x-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <View 
                        key={i} 
                        className={`w-3 h-3 rounded-full border border-blue-400 ${i === 2 ? 'bg-blue-400' : 'bg-transparent'} ${i < 2 ? 'bg-blue-300 border-blue-300' : ''}`} 
                    />
                ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity 
                className="w-full bg-[#7EA6E0] py-4 rounded-full flex-row items-center justify-center mb-4"
                onPress={() => router.push('/intro/six')}
            >
                <Text className="text-white text-lg font-semibold mr-2">Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
