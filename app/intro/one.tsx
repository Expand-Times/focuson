import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function IntroOne() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-blue-100">
      <View className="flex-1 items-center justify-center px-6">
        {/* Central White Circle */}
        <View className="">
            {/* Composition for "Figure with Rays" */}
            <View className="items-center justify-center relative">
                <Image source={require('@/assets/images/black.png')} className="w-32 h-52" />
            </View>
        </View>

        {/* Bottom Action */}
        <TouchableOpacity 
          className="absolute bottom-12 right-8 flex-row items-center space-x-2"
          onPress={() => router.push('/intro/two')}
        >
          <Text className="text-lg font-semibold text-gray-900">Next</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
