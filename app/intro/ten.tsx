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
        if (
          Launcher &&
          Launcher.checkUsageStatsPermission &&
          Launcher.checkUsageStatsPermission()
        ) {
          const stats = Launcher.getWeeklyUsageStats();
          if (stats) {
            const hours = stats.averageDailyUsage / (1000 * 60 * 60);
            // If we have valid data (greater than 0), use it. Otherwise keep benchmark.
            if (hours > 0) setActualHours(hours);
            if (stats.averageDailyUnlocks > 0) setActualUnlocks(stats.averageDailyUnlocks);
          }
        }
      } catch (e) {
        console.log('Failed to fetch usage stats', e);
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
      <View
        className={`w-full items-center justify-center py-6 ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#5C8BCC]'}`}>
        <Text allowFontScaling={false} className="text-[16px] font-bold text-white">
          Your Screen Time
        </Text>
      </View>

      <View className="flex-1 pt-8">
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-center">
          {/* Chart Section */}
          <View className="mt-4 w-full">
            {/* Chart Container */}
            <View className=" relative flex-row items-end justify-between  px-2">
              {/* Horizontal Grid Lines */}
              <View className="absolute bottom-0 left-0 right-0 top-0 z-0">
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
              <View className="z-10 w-1/4 items-center">
                <View
                  className={`${
                    isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'
                  } mb-1 rounded px-2 py-1`}>
                  <Text
                    allowFontScaling={false}
                    className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>
                    {assumedHours.toFixed(1)}h
                  </Text>
                </View>
                <View
                  className="top-0.5 w-12 rounded-t-sm bg-[#9FB7E3]"
                  style={{ height: getHeight(assumedHours) }}
                />
                <Text
                  allowFontScaling={false}
                  className={`font-regular mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>
                  Your assumption
                </Text>
              </View>

              {/* Bar 2: Actual usage (Static/Benchmark) */}
              <View className="z-10 w-1/4 items-center">
                <View className="absolute -top-7">
                  <View
                    className={`${
                      isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'
                    } mb-1 rounded px-2 py-1`}>
                    <Text
                      allowFontScaling={false}
                      className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>
                      {actualHours.toFixed(1)}h
                    </Text>
                  </View>
                </View>
                <View
                  className="top-0.5 w-12 rounded-t-sm bg-[#D99694]"
                  style={{ height: getHeight(actualHours) }}
                />
                <Text
                  allowFontScaling={false}
                  className={`font-regular mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>
                  Actual usage
                </Text>
              </View>

              {/* Bar 3: with Zuhd */}
              <View className="z-10 w-1/4 items-center">
                  <View
                  className={`${
                    isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'
                  } mb-1 rounded px-2 py-1`}>
                  <Text allowFontScaling={false} className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>
                    2.5h
                  </Text>
                </View>
                <View
                  className="top-0.5 w-12 rounded-t-sm bg-[#8CD6C3]"
                  style={{ height: getHeight(2.5) }}
                />
                <Text
                  allowFontScaling={false}
                  className={`font-regular mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>
                  with <Text className="font-bold">Minimal Life</Text>
                </Text>
              </View>

              {/* Bar 4: Zuhd + Iron will */}
              <View className="z-10 w-1/4 items-center">
                  <View
                  className={`${
                    isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'
                  } mb-1 rounded px-2 py-1`}>
                  <Text allowFontScaling={false} className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>
                    1.5h
                  </Text>
                </View>
                <View
                  className="top-0.5 w-12 rounded-t-sm bg-[#93D093]"
                  style={{ height: getHeight(1.5) }}
                />
                <Text
                  allowFontScaling={false}
                  className={`mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>
                  <Text className="font-bold">Minimal Life</Text>
                  {'\n'}
                  <Text className="font-regular">+Iron will</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View className="mt-12  w-full">
            <View
              className={`items-center rounded-3xl ${isDarkMode ? ' bg-[#0D121A]' : 'border-slate-50 bg-white'}`}>
              <Text
                allowFontScaling={false}
                className={`mb-4 text-[16px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                You unlock your phone daily
              </Text>
              <Text allowFontScaling={false} className="mb-4 text-[32px] font-bold text-[#F4BE37]">
                {actualUnlocks}x
              </Text>
              <Text allowFontScaling={false} className={`text-[12px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>
                Assumption was {assumedUnlocks} times
              </Text>
            </View>
          </View>
        </View>

        {/* Fixed Footer Section */}
        <View className="w-full items-center px-4 pb-8 pt-4">
          <TouchableOpacity
            className={`mb-8 w-full items-center justify-center rounded-full py-4 shadow-sm ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA6E0]'}`}
            onPress={async () => {
              try {
                await AsyncStorage.setItem('hasSeenIntro', 'true');
              } catch (e) {
                console.error('Failed to set intro flag', e);
              }
              router.push('/intro/PermissionAccessScreen');
            }}>
            <Text allowFontScaling={false} className="font-regular text-[16px] text-white">
              Got It!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
