import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, PanResponder, Dimensions, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IntroNine() {
  const router = useRouter();
  const [hours, setHours] = useState(3.5);
  const [unlocks, setUnlocks] = useState(25);
  
  // Slider state
  const [sliderWidth, setSliderWidth] = useState(0);
  
  const incrementHours = () => setHours(prev => Math.min(prev + 0.5, 24));
  const decrementHours = () => setHours(prev => Math.max(prev - 0.5, 0));

  // Handle slider interaction
  const handleSlide = (evt: GestureResponderEvent) => {
    if (sliderWidth === 0) return;
    const locationX = evt.nativeEvent.locationX;
    const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
    // Map percentage to 0-100 unlocks
    const newUnlocks = Math.round(percentage * 100);
    setUnlocks(newUnlocks);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        // Handle touch start
        // We need the location relative to the view, which we can get if we use the View's onTouch/Responder props directly
        // But PanResponder gives global coordinates usually unless we do some math.
        // Simpler approach for this specific case: use onTouchMove/Start on the View directly.
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // This is tricky without knowing the view's absolute position.
        // Let's stick to the View's onTouch events for simplicity in this constrained environment.
      },
    })
  ).current;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12">
        
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-start">
            {/* Top Section */}
            <View className="w-full items-center ">
                <Text allowFontScaling={false} className="text-[16px] font-regular text-[#2E3B4D]  text-center mb-8 px-4">
                    How much time do you spend your {'\n'} Phone?
                </Text>

                <View className="flex-row items-center space-x-4 mb-16">
                    <TouchableOpacity onPress={decrementHours}>
                        <MaterialCommunityIcons className="" name="minus-thick" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    
                    <View className="bg-[#E1EAF5] border border-[#7EA9E5] rounded-lg px-6 py-2">
                        <Text allowFontScaling={false} className="text-[24px] font-bold text-[#2E3B4D]">{hours.toFixed(1)}<Text className="text-[24px] font-regular text-[#858E9D]">|</Text></Text>
                    </View>

                    <TouchableOpacity onPress={incrementHours}>
                        <MaterialCommunityIcons name="plus-thick" size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 w-full items-center justify-center">
                <Text allowFontScaling={false} className="text-[16px] font-regular text-[#2E3B4D] text-center mb-8 px-4">
                    How many time daily unlock your {'\n'} phone?
                </Text>

                <Text className="text-[24px] font-bold text-[#2E3B4D] mb-8">{unlocks}x</Text>

                {/* Custom Slider Visual & Interaction */}
                <View className="w-full px-4 mb-2">
                    <View 
                        className="h-12 bg-[#ECF0FF] rounded-full flex-row items-center relative overflow-hidden"
                        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                        onTouchStart={(e: GestureResponderEvent) => handleSlide(e)}
                        onTouchMove={(e: GestureResponderEvent) => handleSlide(e)}
                    >
                        {/* Progress Bar */}
                        <LinearGradient
                            colors={['#ECF0FF', '#7EA6E0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-full rounded-full" 
                            style={{ width: `${(unlocks / 100) * 100}%` }} 
                        />
                        {/* Thumb - positioned based on percentage */}
                        {/* We subtract thumb width/2 to center it, but clamping is needed */}
                        <View 
                            className="absolute w-12 h-12 bg-[#5D8BCC] rounded-full shadow-sm"
                            pointerEvents="none"
                            style={{ 
                                left: `${Math.min(Math.max((unlocks / 100) * 100 - 5, 0), 90)}%` // Approximate centering adjustment
                            }} 
                        />
                    </View>
                    <View className="flex-row justify-between mt-2 px-1">
                        <Text className="text-slate-400 text-xs">0</Text>
                        <Text className="text-slate-400 text-xs">100+</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Fixed Footer Section */}
        <View className="w-full items-center pb-8 pt-4">
            <TouchableOpacity 
                className="w-full bg-[#7EA6E0] py-4 rounded-full items-center justify-center mb-4 shadow-sm"
                onPress={() => router.push({
                    pathname: '/intro/ten',
                    params: { 
                        hours: hours.toString(), 
                        unlocks: unlocks.toString() 
                    }
                })}
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
