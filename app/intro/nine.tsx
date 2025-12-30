import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, PanResponder, Dimensions, GestureResponderEvent, PanResponderGestureState, TextInput, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IntroNine() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [hours, setHours] = useState(3.5);
  const [inputValue, setInputValue] = useState('3.5');
  const [unlocks, setUnlocks] = useState(25);
  const [showKeyboard, setShowKeyboard] = useState(false);
  
  // Slider state
  const [sliderWidth, setSliderWidth] = useState(0);
  
  const updateHours = (val: number) => {
      const clamped = Math.min(Math.max(val, 0), 24);
      setHours(clamped);
      setInputValue(clamped.toFixed(1));
  };

  const incrementHours = () => updateHours(hours + 0.5);
  const decrementHours = () => updateHours(hours - 0.5);

  const handleTextChange = (text: string) => {
      setInputValue(text);
      const parsed = parseFloat(text);
      if (!isNaN(parsed)) {
          setHours(Math.min(Math.max(parsed, 0), 24));
      }
  };

  const handleEndEditing = () => {
      let parsed = parseFloat(inputValue);
      if (isNaN(parsed)) {
          parsed = 0;
      }
      updateHours(parsed);
  };

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
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-white'}`}>
      <StatusBar backgroundColor={isDarkMode ? '#0D121A' : '#ffffff'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View className="flex-1 px-6 pt-12">
        
        {/* Main Content Area */}
        <View className="flex-1 items-center justify-start">
            {/* Top Section */}
            <View className="w-full items-center ">
                <Text allowFontScaling={false} className={`text-[16px] font-regular text-center mb-8 px-4 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                    How much time do you spend your {'\n'} Phone?
                </Text>

                <View className="flex-row items-center space-x-4 mb-16">
                    <TouchableOpacity onPress={decrementHours}>
                        <MaterialCommunityIcons className="" name="minus-thick" size={24} color={isDarkMode ? '#DADFE5' : '#1E293B'} />
                    </TouchableOpacity>
                    
                    <TextInput 
                        className={`border rounded-lg px-6 py-2 text-[24px] font-bold text-center min-w-[100px] ${isDarkMode ? 'bg-[#131B26] border-[#DADFE5] text-[#DADFE5]' : 'bg-[#E1EAF5] border-[#7EA9E5] text-[#2E3B4D]'}`}
                        keyboardType="numeric"
                        value={inputValue}
                        onChangeText={handleTextChange}
                        onEndEditing={handleEndEditing}
                        maxLength={4}
                        cursorColor="#858E9D"
                        selectionColor="#858E9D"
                        autoFocus={true}
                        showSoftInputOnFocus={showKeyboard}
                        onPressIn={() => setShowKeyboard(true)}
                    />

                    <TouchableOpacity onPress={incrementHours}>
                        <MaterialCommunityIcons name="plus-thick" size={24} color={isDarkMode ? '#DADFE5' : '#1E293B'} />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 w-full items-center justify-center">
                <Text allowFontScaling={false} className={`text-[16px] font-regular text-center mb-8 px-4 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                    How many time daily unlock your {'\n'} phone?
                </Text>

                <Text allowFontScaling={false} className={`text-[24px] font-bold mb-8 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>{unlocks}x</Text>

                {/* Custom Slider Visual & Interaction */}
                <View className="w-full px-4 mb-2">
                    <View 
                        className={`h-12 rounded-full flex-row items-center relative overflow-hidden ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#ECF0FF]'}`}
                        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                        onTouchStart={(e: GestureResponderEvent) => handleSlide(e)}
                        onTouchMove={(e: GestureResponderEvent) => handleSlide(e)}
                    >
                        {/* Progress Bar */}
                        <LinearGradient
                            colors={isDarkMode ? ['#131B26', '#7EA6E0'] : ['#ECF0FF', '#7EA6E0']}
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
                        <Text allowFontScaling={false} className="text-[#89A2CA] font-bold text-[14px]">0</Text>
                        <Text allowFontScaling={false} className="text-[#89A2CA] font-bold text-[14px]">100+</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* Fixed Footer Section */}
        <View className="w-full items-center pb-8 pt-4">
            <TouchableOpacity 
                className={`w-full py-4 rounded-full items-center justify-center mb-4 shadow-sm ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA6E0]'}`}
                onPress={() => router.push({
                    pathname: '/intro/ten',
                    params: { 
                        hours: hours.toString(), 
                        unlocks: unlocks.toString() 
                    }
                })}
            >
                <Text allowFontScaling={false} className="text-white text-[16px] font-regular">Submit</Text>
            </TouchableOpacity>
            
            <Text allowFontScaling={false} className={`text-[10px] font-light text-center ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Ready to be amazed by actual data!
            </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}
