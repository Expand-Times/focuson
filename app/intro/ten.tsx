import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Launcher from '../../modules/launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function IntroTen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Parse params with defaults
  const assumedHours = parseFloat(params.hours as string) || 3.5;
  const assumedUnlocks = parseInt(params.unlocks as string) || 25;

  // State for actual usage (defaults to benchmark values)
  const [actualHours, setActualHours] = useState(8.1);
  const [actualUnlocks, setActualUnlocks] = useState(52);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            if (Launcher && Launcher.checkUsageStatsPermission && Launcher.checkUsageStatsPermission()) {
                 const stats = Launcher.getWeeklyUsageStats();
                 if (stats) {
                     const hours = stats.averageDailyUsage / (1000 * 60 * 60);
                     // If we have valid data (greater than 0), use it. Otherwise keep benchmark.
                     if (hours > 0) setActualHours(hours);
                     if (stats.averageDailyUnlocks > 0) setActualUnlocks(stats.averageDailyUnlocks);
                 }
            }
        } catch (e) {
            console.log("Failed to fetch usage stats", e);
        }
    };
    fetchStats();
  }, []);

  // Chart constants
  const MAX_HEIGHT = 192; // h-48 equivalent in pixels approx
  const MAX_SCALE_HOURS = 10; // Chart max Y value
  
  const getHeight = (h: number) => Math.min((h / MAX_SCALE_HOURS) * MAX_HEIGHT, MAX_HEIGHT);

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-white'}`}>
      <StatusBar backgroundColor={isDarkMode ? '#0D121A' : '#5C8BCC'} barStyle="light-content" />
      {/* Header Bar */}
      <View className={`w-full py-6 items-center justify-center ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#5C8BCC]'}`}>
        <Text allowFontScaling={false} className="text-white text-[16px] font-bold">Your Screen Time</Text>
      </View>

      <View className="flex-1 pt-8">
        
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-center">
            {/* Chart Section */}
            <View className="w-full mt-4">
                {/* Chart Container */}
                <View className=" flex-row items-end justify-between px-2  relative">
                    {/* Horizontal Grid Lines */}
                    <View className="absolute top-0 left-0 right-0 bottom-0 z-0">
                        {[0, assumedHours, actualHours, 2.5, 1.5].map((h, i) => {
                            return (
                                <View 
                                    key={i} 
                                    className={`absolute left-0 right-0 h-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} 
                                    style={{ bottom: 32 + getHeight(h) }} 
                                />
                            );
                        })}
                    </View>

                    {/* Bar 1: Your assumption */}
                    <View className="items-center z-10 w-1/4">
                        <View className="bg-[#8BACDF] rounded px-2 py-1 mb-1">
                            <Text allowFontScaling={false} className="text-white text-[10px]">{assumedHours.toFixed(1)}h</Text>
                        </View>
                        <View 
                            className="w-12 bg-[#9FB7E3] rounded-t-sm top-0.5" 
                            style={{ height: getHeight(assumedHours) }}
                        />
                        <Text allowFontScaling={false} className={`text-[7px] font-regular text-center mt-2 h-8 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>Your assumption</Text>
                    </View>

                    {/* Bar 2: Actual usage (Static/Benchmark) */}
                    <View className="items-center z-10 w-1/4">
                        <View className="absolute -top-7">
                            <View className="bg-[#8BACDF] rounded px-2 py-1 mb-1">
                                <Text allowFontScaling={false} className="text-white text-[10px]">{actualHours.toFixed(1)}h</Text>
                            </View>
                        </View>
                        <View 
                            className="w-12 bg-[#D99694] rounded-t-sm top-0.5" 
                            style={{ height: getHeight(actualHours) }}
                        />
                        <Text allowFontScaling={false} className={`text-[7px] font-regular text-center mt-2 h-8 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>Actual usage</Text>
                    </View>

                    {/* Bar 3: with Zuhd */}
                    <View className="items-center z-10 w-1/4">
                        <View className="bg-[#8BACDF] rounded px-2 py-1 mb-1">
                            <Text allowFontScaling={false} className="text-white text-[10px]">2.5h</Text>
                        </View>
                        <View 
                            className="w-12 bg-[#8CD6C3] rounded-t-sm top-0.5" 
                            style={{ height: getHeight(2.5) }}
                        />
                        <Text allowFontScaling={false} className={`text-[7px] font-regular text-center mt-2 h-8 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>with <Text className="font-bold">Minimal Life</Text></Text>
                    </View>

                    {/* Bar 4: Zuhd + Iron will */}
                    <View className="items-center z-10 w-1/4">
                        <View className="bg-[#8BACDF] rounded px-2 py-1 mb-1">
                            <Text allowFontScaling={false} className="text-white text-[10px]">1.5h</Text>
                        </View>
                        <View 
                            className="w-12 bg-[#93D093] rounded-t-sm top-0.5" 
                            style={{ height: getHeight(1.5) }}                        />
                        <Text allowFontScaling={false} className={`text-[7px] text-center mt-2 h-8 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}><Text className="font-bold">Minimal Life</Text>{'\n'}<Text className="font-regular">+Iron will</Text></Text>
                    </View>
                </View>
            </View>

            {/* Stats Card */}
            <View className="w-full  mt-12">
                <View className={`rounded-3xl items-center border-b ${isDarkMode ? 'bg-[#131B26] border-slate-800' : 'bg-white border-slate-50'}`}>
                    <Text allowFontScaling={false} className={`text-[16px] font-bold mb-4 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>You unlock your phone daily</Text>
                    <Text allowFontScaling={false} className="text-[32px] font-bold text-[#F4BE37] mb-4">{actualUnlocks}x</Text>
                    <Text allowFontScaling={false} className="text-[#89A2CA] text-[12px]">Assumption was {assumedUnlocks} times</Text>
                </View>
            </View>
        </View>

        {/* Fixed Footer Section */}
        <View className="w-full items-center pb-8 pt-4 px-4">
            <TouchableOpacity 
                className={`w-full py-4 rounded-full items-center justify-center mb-8 shadow-sm ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA6E0]'}`}
                onPress={async () => {
                    try {
                        await AsyncStorage.setItem('hasSeenIntro', 'true');
                    } catch (e) {
                        console.error('Failed to set intro flag', e);
                    }
                    router.push('/intro/PermissionAccessScreen');
                }}
            >
                <Text allowFontScaling={false} className="text-white text-[16px] font-regular">Got It!</Text>
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
