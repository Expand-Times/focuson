import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroThree() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      <View className="flex-1 items-center justify-between py-8 px-6">
        
        {/* Header Section */}
        <View className="items-center mt-4">
          <Text className="text-2xl font-bold text-slate-800 mb-4 text-center">Why Icons are so colorful?</Text>
          <Text className="text-base text-slate-500 text-center leading-6 px-2">
            The app icons are colorful. They{'\n'}
            designed <Text className="font-bold text-slate-600">to grab your attention</Text> so that{'\n'}
            you open the app.
          </Text>
        </View>

        {/* Central Graphic - Phone Mockup */}
        <View className="items-center justify-center my-4">
            {/* Phone Frame */}
            <View className="bg-white rounded-[30px] border-4 border-white shadow-sm overflow-hidden" style={{ width: width * 0.6, height: width * 1.0 }}>
                {/* Screen Content */}
                <View className="flex-1 bg-blue-50 relative items-center justify-center p-4">
                    {/* Top Bar (Camera/Speaker) */}
                    <View className="absolute top-4 w-16 h-1 bg-gray-200 rounded-full" />
                    <View className="absolute top-4 right-8 w-2 h-2 bg-gray-200 rounded-full" />

                    {/* Central Figure (Stressed Person) */}
                    <View className="items-center z-10">
                        <MaterialCommunityIcons name="face-man" size={60} color="#334155" />
                        <View className="absolute -top-2 -right-2">
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#EF4444" />
                        </View>
                        <View className="absolute -top-2 -left-2">
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#EF4444" />
                        </View>
                    </View>

                    {/* Surrounding Icons */}
                    {/* Circle 1 */}
                    <View className="absolute top-16 left-8">
                        <FontAwesome5 name="twitter" size={24} color="#1DA1F2" />
                    </View>
                    <View className="absolute top-16 right-8">
                        <FontAwesome5 name="facebook" size={24} color="#1877F2" />
                    </View>
                    
                    {/* Circle 2 */}
                    <View className="absolute top-28 left-4">
                        <FontAwesome5 name="instagram" size={24} color="#E1306C" />
                    </View>
                    <View className="absolute top-28 right-4">
                        <FontAwesome5 name="youtube" size={24} color="#FF0000" />
                    </View>

                    {/* Circle 3 */}
                    <View className="absolute bottom-28 left-4">
                        <FontAwesome5 name="pinterest" size={24} color="#BD081C" />
                    </View>
                    <View className="absolute bottom-28 right-4">
                        <FontAwesome5 name="tiktok" size={24} color="#000000" />
                    </View>

                    {/* Circle 4 */}
                    <View className="absolute bottom-16 left-8">
                        <FontAwesome5 name="telegram" size={24} color="#0088CC" />
                    </View>
                    <View className="absolute bottom-16 right-8">
                        <FontAwesome5 name="snapchat" size={24} color="#FFFC00" />
                    </View>

                </View>
            </View>
        </View>

        {/* Footer Content */}
        <View className="items-center w-full">
            <Text className="text-slate-400 text-center text-sm mb-8 px-4 leading-5">
                Consequently, your brain learns that opening{'\n'}
                colorful icons leads to "interesting" (stimulating){'\n'}
                content
            </Text>

            {/* Pagination Dots */}
            <View className="flex-row space-x-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <View 
                        key={i} 
                        className={`w-3 h-3 rounded-full border border-blue-400 ${i === 0 ? 'bg-blue-400' : 'bg-transparent'}`} 
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
