import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Launcher from '../../modules/launcher';

const { width } = Dimensions.get('window');

export default function IntroTen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse params with defaults
  const assumedHours = parseFloat(params.hours as string) || 3.5;
  const assumedUnlocks = parseInt(params.unlocks as string) || 25;

  // State for actual usage (defaults to benchmark values)
  const [actualHours, setActualHours] = useState(5.0);
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
  const MAX_SCALE_HOURS = 6; // Chart max Y value
  
  const getHeight = (h: number) => Math.min((h / MAX_SCALE_HOURS) * MAX_HEIGHT, MAX_HEIGHT);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Bar */}
      <View className="w-full bg-[#5D8CD6] py-6 items-center justify-center">
        <Text className="text-white text-xl font-bold">Your Screen Time</Text>
      </View>

      <View className="flex-1 items-center justify-between py-8 px-4">
        
        {/* Chart Section */}
        <View className="w-full mt-4">
            {/* Chart Container */}
            <View className="h-64 flex-row items-end justify-between px-2 pb-8 relative">
                {/* Horizontal Grid Lines */}
                <View className="absolute top-0 left-0 right-0 bottom-8 justify-between z-0">
                    {[...Array(4)].map((_, i) => (
                        <View key={i} className="h-[1px] bg-slate-100 w-full" />
                    ))}
                </View>

                {/* Bar 1: Your assumption */}
                <View className="items-center z-10 w-1/4">
                    <View className="bg-[#5D8CD6] rounded-t-sm px-2 py-1 mb-1">
                        <Text className="text-white text-[10px]">{assumedHours.toFixed(1)}h</Text>
                    </View>
                    <View 
                        className="w-12 bg-[#9FB7E3] rounded-t-sm" 
                        style={{ height: getHeight(assumedHours) }}
                    />
                    <Text className="text-[10px] text-slate-500 text-center mt-2 h-8">Your{'\n'}assumption</Text>
                </View>

                {/* Bar 2: Actual usage (Static/Benchmark) */}
                <View className="items-center z-10 w-1/4">
                    <View className="absolute -top-6">
                        <View className="bg-[#7EA6E0] rounded-t-sm px-2 py-1 mb-1">
                            <Text className="text-white text-[10px]">{actualHours.toFixed(1)}h</Text>
                        </View>
                    </View>
                    <View 
                        className="w-12 bg-[#D99694] rounded-t-sm" 
                        style={{ height: getHeight(actualHours) }}
                    />
                    <Text className="text-[10px] text-slate-500 text-center mt-2 h-8">Actual{'\n'}usage</Text>
                </View>

                {/* Bar 3: with Zuhd */}
                <View className="items-center z-10 w-1/4">
                    <View className="bg-[#7EA6E0] rounded-t-sm px-2 py-1 mb-1">
                        <Text className="text-white text-[10px]">2.5h</Text>
                    </View>
                    <View 
                        className="w-12 bg-[#8CD6C3] rounded-t-sm" 
                        style={{ height: getHeight(2.5) }}
                    />
                    <Text className="text-[10px] text-slate-500 text-center mt-2 h-8">with{'\n'}Zuhd</Text>
                </View>

                {/* Bar 4: Zuhd + Iron will */}
                <View className="items-center z-10 w-1/4">
                    <View className="bg-[#7EA6E0] rounded-t-sm px-2 py-1 mb-1">
                        <Text className="text-white text-[10px]">1.5h</Text>
                    </View>
                    <View 
                        className="w-12 bg-[#93D093] rounded-t-sm" 
                        style={{ height: getHeight(1.5) }}
                    />
                    <Text className="text-[10px] text-slate-500 text-center mt-2 h-8">Zuhd +{'\n'}Iron will</Text>
                </View>
            </View>
        </View>

        {/* Stats Card */}
        <View className="w-full px-4 mb-8">
            <View className="bg-white rounded-3xl p-8 items-center shadow-sm border border-slate-50">
                <Text className="text-lg font-bold text-slate-800 mb-4">You unlock your phone daily</Text>
                <Text className="text-5xl font-bold text-[#F4BE37] mb-4">{actualUnlocks}x</Text>
                <Text className="text-slate-400 text-base">Assumption was {assumedUnlocks} times</Text>
            </View>
        </View>

        {/* Button */}
        <TouchableOpacity 
            className="w-full bg-[#7EA6E0] py-4 rounded-full items-center justify-center mb-8 shadow-sm"
            onPress={() => router.push('/permissions')}
        >
            <Text className="text-white text-lg font-bold">Got It!</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
