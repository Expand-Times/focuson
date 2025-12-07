import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroFour() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 items-center justify-between py-8 px-6">
        
        {/* Header Section */}
        <View className="items-center mt-4">
          <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">No icons in Zuhd</Text>
          <Text className="text-base text-slate-500 text-center leading-6 px-2">
            Apps are shown by name with your{'\n'}
            usage data
          </Text>
        </View>

        {/* Central Graphic - Phone Mockup */}
        <View className="items-center justify-center my-4">
            {/* Phone Frame */}
            <View className="bg-white rounded-[30px] border-4 border-white shadow-sm overflow-hidden" style={{ width: width * 0.6, height: width * 1.0 }}>
                {/* Screen Content */}
                <View className="flex-1 bg-slate-50 relative">
                    {/* Top Bar */}
                    <View className="items-center mt-2 mb-1">
                        <View className="w-16 h-1 bg-gray-200 rounded-full" />
                    </View>

                    {/* App UI Mockup */}
                    <View className="flex-1 px-3 pt-2">
                        {/* Search Bar */}
                        <View className="bg-white rounded-full px-3 py-1.5 mb-2 flex-row items-center border border-slate-100 shadow-sm">
                            <MaterialCommunityIcons name="magnify" size={14} color="#94A3B8" />
                            <Text className="text-[10px] text-slate-400 ml-2">Search app here</Text>
                        </View>

                        {/* List Header */}
                        <View className="flex-row justify-between items-center mb-2 px-1">
                            <Text className="text-[10px] font-bold text-blue-600 underline">All Apps</Text>
                            <MaterialCommunityIcons name="cog" size={12} color="#3B82F6" />
                        </View>

                        {/* App List */}
                        <View className="space-y-1.5">
                             {[
                                { name: 'My Airtel', color: 'bg-blue-300' },
                                { name: 'Contact', color: 'bg-blue-300' },
                                { name: 'Al hadith', color: 'bg-blue-700', text: 'text-white' },
                                { name: 'Bkash', color: 'bg-blue-200' },
                                { name: 'Assistant', color: 'bg-blue-200' },
                                { name: 'Firefox', color: 'bg-blue-100' },
                                { name: 'Al Quran', color: 'bg-blue-200' },
                                { name: 'Sim Toolkit', color: 'bg-blue-100' },
                                { name: 'Facebook', color: 'bg-blue-100' },
                                { name: 'Messenger', color: 'bg-blue-100' },
                             ].map((app, index) => (
                                <View key={index} className={`flex-row justify-between items-center px-2 py-1.5 rounded-md ${app.color}`}>
                                    <Text className={`text-[9px] font-medium ${app.text || 'text-slate-700'}`}>{app.name}</Text>
                                    <Text className={`text-[6px] ${app.text || 'text-slate-500'}`}>LO: 5 h ago || DU: 10 min</Text>
                                </View>
                             ))}
                        </View>
                    </View>
                </View>
            </View>
        </View>

        {/* Footer Content */}
        <View className="items-center w-full">
            <Text className="text-slate-400 text-center text-sm mb-8 px-4 leading-5">
                The usage data push to think before you intend to{'\n'}
                open an addictive apps/games.
            </Text>

            {/* Pagination Dots */}
            <View className="flex-row space-x-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <View 
                        key={i} 
                        className={`w-3 h-3 rounded-full border border-blue-400 ${i === 1 ? 'bg-blue-400' : 'bg-transparent'} ${i === 0 ? 'bg-blue-300 border-blue-300' : ''}`} 
                    />
                ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity 
                className="w-full bg-[#7EA6E0] py-4 rounded-full flex-row items-center justify-center mb-4"
                onPress={() => router.push('/permissions')}
            >
                <Text className="text-white text-lg font-semibold mr-2">Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
