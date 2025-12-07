import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroEight() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 items-center justify-between py-8 px-6">
        
        {/* Header Section */}
        <View className="items-center mt-4">
          <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">Don't panic Uninstall.</Text>
          <Text className="text-base text-slate-500 text-center leading-6 px-2">
            Use at least <Text className="font-bold">7 days</Text>, You're going to Love This App
          </Text>
        </View>

        {/* Central Graphic - Two Phone Mockups */}
        <View className="items-center justify-center my-4 flex-row relative">
             {/* Left Phone (Minimal) */}
            <View className="bg-white rounded-[24px] border-4 border-white shadow-md overflow-hidden z-10 transform -rotate-3 -translate-x-2" style={{ width: width * 0.4, height: width * 0.75 }}>
                 <View className="flex-1 bg-slate-50 items-center pt-8 px-2 relative">
                    <Text className="text-xs font-bold text-slate-800">20:54</Text>
                    <Text className="text-[8px] text-slate-400 mb-6">Tuesday, 10th June</Text>
                    
                    {/* App Buttons */}
                    <View className="w-full space-y-2 mb-4">
                        <View className="w-full border border-slate-300 rounded-full py-1 items-center"><Text className="text-[8px]">Calender</Text></View>
                        <View className="w-full border border-slate-300 rounded-full py-1 items-center"><Text className="text-[8px]">Whatsapp</Text></View>
                    </View>
                    
                    {/* Plus Icon */}
                    <View className="items-center mb-4">
                        <MaterialCommunityIcons name="plus-circle-outline" size={16} color="#94A3B8" />
                        <Text className="text-[6px] text-slate-400 mt-1 text-center">Don't add unnecessary addictive app!</Text>
                    </View>

                    {/* Bottom Apps */}
                    <View className="absolute bottom-4 flex-row w-full justify-between px-1">
                        <View className="bg-[#7EA6E0] rounded-full px-3 py-1"><Text className="text-[6px] text-white">Dialer</Text></View>
                        <View className="bg-[#7EA6E0] rounded-full px-3 py-1"><Text className="text-[6px] text-white">Camera</Text></View>
                    </View>
                 </View>
            </View>

            {/* Right Phone (List) */}
            <View className="bg-white rounded-[24px] border-4 border-white shadow-md overflow-hidden z-0 transform rotate-3 translate-x-2" style={{ width: width * 0.4, height: width * 0.75 }}>
                 <View className="flex-1 bg-slate-50 items-center pt-4 px-2">
                     {/* Search Bar */}
                    <View className="w-full bg-slate-100 rounded-full h-4 mb-2 flex-row items-center px-2">
                        <MaterialCommunityIcons name="magnify" size={8} color="#94A3B8" />
                        <Text className="text-[6px] text-slate-400 ml-1">Search app here</Text>
                    </View>
                    
                    {/* App List */}
                    <View className="w-full space-y-1">
                        {['My Airtel', 'Contact', 'Al hadith', 'Bkash', 'Assistant', 'Firefox', 'Al Quran', 'Facebook'].map((app, i) => (
                            <View key={i} className="w-full bg-[#7EA6E0] rounded-full py-1 px-2 flex-row justify-between items-center">
                                <Text className="text-[6px] text-white">{app}</Text>
                                <Text className="text-[4px] text-white opacity-70">1h ago</Text>
                            </View>
                        ))}
                    </View>
                 </View>
            </View>
        </View>

        {/* Footer Content */}
        <View className="items-center w-full">
            <Text className="text-slate-400 text-center text-sm mb-4 px-4 leading-5">
                Give it only a week, and you'll discover why this is{'\n'}
                your must-have app.
            </Text>
            
            <Text className="text-slate-400 text-center text-xs mb-8 px-8 leading-4">
                Next: we need a few permissions to make <Text className="font-bold text-slate-500">Zuhd</Text> Minimal{'\n'}
                Launcher work the way it's meant to
            </Text>

            {/* Pagination Dots */}
            <View className="flex-row space-x-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <View 
                        key={i} 
                        className={`w-3 h-3 rounded-full border border-blue-400 ${i === 5 ? 'bg-blue-400' : 'bg-transparent'} ${i < 5 ? 'bg-blue-300 border-blue-300' : ''}`} 
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
