import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroSeven() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 items-center justify-between py-8 px-6">
        
        {/* Header Section */}
        <View className="items-center mt-4">
            <View className="flex-row items-start">
                <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">Notifications</Text>
                <View className="w-2 h-2 bg-red-500 rounded-full ml-1 mt-2" />
            </View>
          <Text className="text-base text-slate-500 text-center leading-6 px-2 mb-2">
            Notifications poke and disrupt your concentration.{'\n'}
            They prompt you to check your phone and make you{'\n'}
            feel something engaging is happening,
          </Text>
          <Text className="text-base text-slate-500 text-center leading-6 px-2">
            Which leads to spending excessive time on your{'\n'}
            device.
          </Text>
        </View>

        {/* Central Graphic - Notification Icon */}
        <View className="items-center justify-center my-4">
            {/* Main Icon Composition */}
            <View className="w-48 h-48 bg-[#FDFBF7] rounded-[40px] items-center justify-center shadow-sm relative">
                {/* The Document/Notification Shape */}
                <View className="w-24 h-24">
                     <MaterialCommunityIcons name="file-document" size={96} color="#FDFBF7" /> 
                     {/* Custom Drawing with Views for the "Notification Card" look */}
                     <View className="absolute top-0 left-0 w-full h-full bg-[#FEF3C7] rounded-xl opacity-30" />
                </View>

                {/* Since we need a specific look, let's build it with simple shapes */}
                <View className="absolute">
                     <View className="w-32 h-32 bg-[#FEF3C7] rounded-3xl opacity-50" />
                </View>
                <View className="absolute">
                     <View className="w-24 h-24 bg-[#FEF3C7] rounded-2xl items-center justify-center">
                        <View className="w-12 h-2 bg-blue-100 rounded mb-2" />
                        <View className="w-16 h-2 bg-blue-100 rounded" />
                     </View>
                </View>

                {/* Red Dot Notification Badge */}
                <View className="absolute -top-2 right-8 w-10 h-10 bg-red-600 rounded-full border-4 border-[#EEF2F6]" />
            </View>
        </View>

        {/* Footer Content */}
        <View className="items-center w-full">
            <Text className="text-slate-400 text-center text-sm mb-8 px-4 leading-5">
                Introducing <Text className="font-bold text-slate-500">Zuhd Minimal Launcher</Text> notification filter.{'\n'}
                You won't miss important notifications, block{'\n'}
                unnecessary, and stay focused.
            </Text>

            {/* Pagination Dots */}
            <View className="flex-row space-x-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <View 
                        key={i} 
                        className={`w-3 h-3 rounded-full border border-blue-400 ${i === 4 ? 'bg-blue-400' : 'bg-transparent'} ${i < 4 ? 'bg-blue-300 border-blue-300' : ''}`} 
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
