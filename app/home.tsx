import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Stack, Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import * as IntentLauncher from 'expo-intent-launcher';
import { useEffect, useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export default function Home() {
  const router = useRouter();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(Battery.BatteryState.UNKNOWN);

  useEffect(() => {
    async function getBatteryStatus() {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      setBatteryLevel(level);
      setBatteryState(state);
    }

    getBatteryStatus();

    const subscriptionLevel = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(batteryLevel);
    });
    const subscriptionState = Battery.addBatteryStateListener(({ batteryState }) => {
      setBatteryState(batteryState);
    });

    return () => {
      subscriptionLevel.remove();
      subscriptionState.remove();
    };
  }, []);

  const getBatteryIcon = () => {
    if (batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL) {
      return 'battery-charging';
    }
    if (batteryLevel === null) return 'battery-full';
    if (batteryLevel >= 0.9) return 'battery-full';
    if (batteryLevel >= 0.4) return 'battery-half';
    return 'battery-dead';
  };

  const openDialer = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('tel:');
    } else {
      Linking.openURL('tel:');
    }
  };

  const openCamera = () => {
    if (Platform.OS === 'android') {
      IntentLauncher.startActivityAsync('android.media.action.STILL_IMAGE_CAMERA');
    } else {
      // Fallback for iOS or other platforms if needed, though task specified Android
      Linking.openURL('camera:'); // Note: camera: scheme is not standard but often used as placeholder
    }
  };

  const navigateToAllApps = () => {
    router.push('/all-apps');
  };

  const navigateToCategoryApps = () => {
    router.push('/AllAppListByCategoryScreen');
  };

  const leftSwipeGesture = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(navigateToAllApps)();
    });

  const rightSwipeGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(navigateToCategoryApps)();
    });

  const composedGestures = Gesture.Simultaneous(leftSwipeGesture, rightSwipeGesture);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composedGestures}>
        <View className="flex-1 bg-[#EFF6FC] px-6 justify-between py-12">
          <Stack.Screen options={{ headerShown: false }} />
       
          {/* Header: Time, Date, Battery */}
       <View className="items-center mt-10">
         <View className="flex-row items-baseline">
            <Text className="text-6xl font-normal text-slate-700">10:47</Text>
            <Text className="text-xl text-slate-500 ml-1">PM</Text>
         </View>
         <Text className="text-slate-500 text-lg mt-1">Tuesday, 24 Oct 2025</Text>
         <View className="mt-3 flex-row items-center gap-2">
           <Ionicons name={getBatteryIcon()} size={24} color="#5B8BDF" />
           {batteryLevel !== null && (
             <Text className="text-[#5B8BDF] text-sm font-medium">
               {Math.round(batteryLevel * 100)}%
             </Text>
           )}
         </View>
       </View>

       {/* Main Actions */}
       <View className="w-full items-center">
          {/* Calendar Button */}
          <TouchableOpacity className="w-full bg-[#E2EEF9] py-5 rounded-[30px] items-center border border-white shadow-sm">
             <Text className="text-slate-700 text-xl tracking-wide">Calender</Text>
          </TouchableOpacity>

          {/* Whatsapp Button */}
          <TouchableOpacity className="w-full bg-[#E2EEF9] py-5 rounded-[30px] items-center border border-white shadow-sm mt-4">
             <Text className="text-slate-700 text-xl tracking-wide">Whatsapp</Text>
          </TouchableOpacity>

          {/* Add Icon */}
          <Link href="/all-apps" asChild>
            <TouchableOpacity className="mt-8 items-center">
               <View className="border border-[#A0C4E8] rounded-full p-1">
                  <Ionicons name="add" size={24} color="#A0C4E8" />
               </View>
               <Text className="text-[#A0C4E8] text-sm mt-2">Don't add unnecessary addictive app!</Text>
            </TouchableOpacity>
          </Link>
       </View>

       {/* Footer Info */}
       <View className="w-full items-center">
          <View className="flex-row items-center mb-2 gap-4">
             <Text className="text-slate-500 text-base">Today Unlock: <Text className="font-bold text-slate-600">5</Text></Text>
             <Text className="text-slate-300">||</Text>
             <Text className="text-slate-500 text-base">Today Use: <Text className="font-bold text-slate-600">120 M</Text></Text>
          </View>
          <Text className="text-[#A0C4E8] text-sm mb-10">Leave it! Do something mindful in real world.</Text>

          {/* Bottom Actions: Dialer & Camera */}
          <View className="flex-row w-full gap-1">
             <TouchableOpacity 
                onPress={openDialer}
                className="flex-1 bg-[#DDEAF6] py-5 rounded-l-[30px] items-center border-r border-white">
                <Text className="text-slate-700 text-xl">Dialer</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                onPress={openCamera}
                className="flex-1 bg-[#DDEAF6] py-5 rounded-r-[30px] items-center">
                <Text className="text-slate-700 text-xl">Camera</Text>
             </TouchableOpacity>
          </View>
       </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
