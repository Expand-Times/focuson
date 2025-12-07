import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function IntroNine() {
  const router = useRouter();
  const [hours, setHours] = useState(3.5);
  const [unlocks, setUnlocks] = useState(25);

  const incrementHours = () => setHours(prev => Math.min(prev + 0.5, 24));
  const decrementHours = () => setHours(prev => Math.max(prev - 0.5, 0));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-between py-12 px-6">
        
        {/* Top Section */}
        <View className="w-full items-center mt-8">
            <Text className="text-xl font-medium text-slate-800 text-center mb-8 px-4">
                How much time do you spend your Phone?
            </Text>

            <View className="flex-row items-center space-x-4 mb-16">
                <TouchableOpacity onPress={decrementHours}>
                    <MaterialCommunityIcons name="minus" size={24} color="#1E293B" />
                </TouchableOpacity>
                
                <View className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-2">
                    <Text className="text-3xl font-bold text-slate-800">{hours.toFixed(1)}</Text>
                </View>

                <TouchableOpacity onPress={incrementHours}>
                    <MaterialCommunityIcons name="plus" size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <Text className="text-xl font-medium text-slate-800 text-center mb-8 px-4">
                How many time daily unlock your phone?
            </Text>

            <Text className="text-4xl font-bold text-slate-800 mb-8">{unlocks}x</Text>

            {/* Custom Slider Visual */}
            <View className="w-full px-4 mb-2">
                <View className="h-12 bg-slate-100 rounded-full flex-row items-center relative overflow-hidden">
                    {/* Progress Bar */}
                    <View className="h-full bg-blue-200 rounded-full" style={{ width: '30%' }} />
                    {/* Thumb */}
                    <View className="absolute left-[25%] w-10 h-10 bg-[#7EA6E0] rounded-full shadow-sm" />
                </View>
                <View className="flex-row justify-between mt-2 px-1">
                    <Text className="text-slate-400 text-xs">0</Text>
                    <Text className="text-slate-400 text-xs">100+</Text>
                </View>
            </View>
        </View>

        {/* Footer Section */}
        <View className="w-full items-center">
            <TouchableOpacity 
                className="w-full bg-[#7EA6E0] py-4 rounded-full items-center justify-center mb-4 shadow-sm"
                onPress={() => router.push('/permissions')}
            >
                <Text className="text-white text-lg font-semibold">Submit</Text>
            </TouchableOpacity>
            
            <Text className="text-slate-400 text-xs text-center">
                Ready to be amazed by actual data!
            </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}
