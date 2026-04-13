import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  useColorScheme,
  StatusBar,
  TextInput,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Launcher from '../../modules/launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PermissionAccessScreen from './PermissionAccessScreen';
import PrivacyScreen from './PrivacyScreen';

const { width, height } = Dimensions.get('window');

export default function IntroUnified() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [step, setStep] = useState(0);

  // State for Step 9 (Inputs)
  const [hours, setHours] = useState(1.5);
  const [inputValue, setInputValue] = useState('1.5');
  const [unlocks, setUnlocks] = useState(15);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  // State for Step 10 (Results)
  const [actualHours, setActualHours] = useState(8.1);
  const [actualUnlocks, setActualUnlocks] = useState(52);

  // Step 9 Logic
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
    if (!isNaN(parsed)) setHours(Math.min(Math.max(parsed, 0), 24));
  };
  const handleEndEditing = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) parsed = 0;
    updateHours(parsed);
  };
  const handleSlide = (evt: GestureResponderEvent) => {
    if (sliderWidth === 0) return;
    const locationX = evt.nativeEvent.locationX;
    const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
    setUnlocks(Math.round(percentage * 100));
  };

  // Step 10 Logic
  useEffect(() => {
    if (step === 9) { // Index 9 is IntroTen
      const fetchStats = async () => {
        try {
          if (Launcher?.checkUsageStatsPermission?.()) {
            const stats = Launcher.getWeeklyUsageStats();
            if (stats) {
              const h = stats.averageDailyUsage / (1000 * 60 * 60);
              if (h > 0) setActualHours(h);
              if (stats.averageDailyUnlocks > 0) setActualUnlocks(stats.averageDailyUnlocks);
            }
          }
        } catch (e) {
          console.log('Failed to fetch usage stats', e);
        }
      };
      fetchStats();
    }
  }, [step]);

  // Chart Helper for Step 10
  const MAX_HEIGHT = 192;
  const MAX_SCALE_HOURS = 10;
  const getHeight = (h: number) => Math.min((h / MAX_SCALE_HOURS) * MAX_HEIGHT, MAX_HEIGHT);

  const renderContent = () => {
    switch (step) {
      case 0: // IntroThree
        return (
          <View className="flex-1 items-center justify-center">
            <View className="items-center">
              <Text allowFontScaling={false} className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                Why Icons are so colorful?
              </Text>
              <Text allowFontScaling={false} className={`px-2 text-center text-[14px] font-light leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                They designed <Text allowFontScaling={false} className={`font-medium ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>to grab your attention</Text> so that{'\n'}you open the app.
              </Text>
            </View>
            <View className="relative items-center justify-center">
              <Image source={isDarkMode ? require('@/assets/images/1.png') : require('@/assets/images/11.png')} style={{ width: width * 0.9, height: height * 0.6 }} resizeMode="contain" />
              <View className="absolute bottom-[15%] items-center justify-center">
                <Text allowFontScaling={false} className={`text-center text-[13px] font-light leading-5 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                  Consequently, your brain learns that opening{'\n'}colorful icons leads to stimulating content
                </Text>
              </View>
            </View>
          </View>
        );
      case 1: // IntroFour
        return (
          <View className="flex-1 items-center justify-center">
            <View className="mt-[10%] items-center">
              <Text allowFontScaling={false} className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                No icons in FocusOn
              </Text>
              <Text allowFontScaling={false} className={`px-2 text-center font-light text-[12px] leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Apps are shown by name with your{'\n'}usage data
              </Text>
            </View>
            <View className="relative items-center justify-center">
              <Image source={isDarkMode ? require('@/assets/images/2.png') : require('@/assets/images/22.png')} style={{ width: width * 0.9, height: height * 0.6 }} resizeMode="contain" />
            </View>
            <View className="absolute bottom-[5%] items-center justify-center">
              <Text allowFontScaling={false} className={`px-4 text-center font-light text-[13px] leading-5 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                The usage data push to think before you intend to{'\n'}open an addictive apps/games.
              </Text>
            </View>
          </View>
        );
      case 2: // IntroFive
        return (
          <View className="flex-1 items-center justify-center">
            <View className="mt-4 items-center">
              <Text allowFontScaling={false} className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                Infinite feeds
              </Text>
            </View>
            <View className="relative items-center justify-center">
              <Image source={isDarkMode ? require('@/assets/images/3.png') : require('@/assets/images/33.png')} style={{ width: width * 0.9, height: height * 0.6 }} resizeMode="contain" />
            </View>
            <View className="absolute bottom-[10%] items-center justify-center">
              <Text allowFontScaling={false} className={`px-4 text-center font-light text-[13px] leading-5 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Social media apps are designed to scroll infinitely,{'\n'}keeping you hooked for hours.
              </Text>
            </View>
          </View>
        );
      case 3: // IntroSix
        return (
          <View className="flex-1 items-center justify-center">
            <View className="mt-[10%] items-center">
              <Text allowFontScaling={false} className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                In-app reminder
              </Text>
              <Text allowFontScaling={false} className={`px-2 text-center font-light text-[12px] leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Avoid getting lost in endless scrolling. Before using an{'\n'}addictive app, set an estimate time limit.
              </Text>
            </View>
            <View className="relative items-center justify-center">
              <Image source={isDarkMode ? require('@/assets/images/4.png') : require('@/assets/images/44.png')} style={{ width: width * 0.9, height: height * 0.6 }} resizeMode="contain" />
            </View>
          </View>
        );
      case 4: // IntroSeven
        return (
          <View className="flex-1 items-center justify-start pt-8">
            <View className="items-center">
              <View className="flex-row items-start">
                <Text allowFontScaling={false} className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                  Notifications
                </Text>
                <View className="ml-1 mt-2 h-2 w-2 rounded-full bg-red-500" />
              </View>
              <Text allowFontScaling={false} className={`mb-4 px-2 text-center text-[12px] font-light leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Notifications poke and disrupt your concentration.{'\n'}They prompt you to check your phone and make you{'\n'}feel something engaging is happening,
              </Text>
              <Text allowFontScaling={false} className={`px-2 text-center text-[12px] font-light leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                Which leads to spending excessive time on your{'\n'}device.
              </Text>
            </View>
            <View className="flex-1 items-center justify-center">
              <View className="relative items-center justify-center">
                <Image source={require('@/assets/images/55.png')} className="w-[100px] h-[100px]" />
              </View>
            </View>
          </View>
        );
      case 5: // IntroEight
        return (
          <View className="flex-1 items-center justify-center">
            <View className="mt-[15%] items-center">
              <Text allowFontScaling={false} className={`mb-4 text-center text-[18px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                Don't panic Uninstall.
              </Text>
              <Text allowFontScaling={false} className="font-regular px-2 text-center text-[12px] leading-6 text-[#8698B2]">
                Use at least <Text allowFontScaling={false} className="font-medium text-[#8698B2]">7 days</Text>, You're going to Love This App
              </Text>
            </View>
            <View className="items-center justify-center">
              <Image source={isDarkMode ? require('@/assets/images/6.png') : require('@/assets/images/66.png')} style={{ width: width * 0.9, height: height * 0.6 }} resizeMode="contain" />
            </View>
            <View className="mb-[25%]">
              <Text allowFontScaling={false} className={`px-8 text-center mb-[5%] text-[14px] font-bold leading-6 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
                FocusOn will always remain free, No ads, No data breach. {' '}
              </Text>
              <Text allowFontScaling={false} className={`px-4 text-center text-[12px] font-light leading-5 ${isDarkMode ? 'text-[#8698B2]' : 'text-[#8698B2]'}`}>
                Give it only a week, and you'll discover why this is{'\n'}your must-have app.
              </Text>         
            </View>
          </View>
        );
      case 6: // Privacy
        return <PrivacyScreen onContinue={() => setStep(7)} />;
      case 7: // Permissions
        return <PermissionAccessScreen onContinue={() => setStep(8)} />;
      case 8: // IntroNine
        return (
          <View className="flex-1 items-center justify-start pt-12">
            <View className="w-full items-center">
              <Text allowFontScaling={false} className={`text-[16px] font-regular text-center mb-8 px-4 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>
                Let's guess! How much time do you spend your {'\n'} Phone?
              </Text>
              <View className="flex-row items-center space-x-4 mb-16">
                <TouchableOpacity onPress={decrementHours}>
                  <MaterialCommunityIcons name="minus-thick" size={24} color={isDarkMode ? '#DADFE5' : '#1E293B'} />
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
              <View className="w-full px-4 mb-2">
                <View 
                  className={`h-12 rounded-full flex-row items-center relative overflow-hidden ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#ECF0FF]'}`}
                  onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                  onTouchStart={(e) => handleSlide(e)}
                  onTouchMove={(e) => handleSlide(e)}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#131B26', '#7EA6E0'] : ['#ECF0FF', '#7EA6E0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full rounded-full" 
                    style={{ width: `${(unlocks / 100) * 100}%` }} 
                  />
                  <View 
                    className="absolute w-12 h-12 bg-[#5D8BCC] rounded-full shadow-sm"
                    pointerEvents="none"
                    style={{ left: `${Math.min(Math.max((unlocks / 100) * 100 - 5, 0), 90)}%` }} 
                  />
                </View>
                <View className="flex-row justify-between mt-2 px-1">
                  <Text allowFontScaling={false} className="text-[#89A2CA] font-bold text-[14px]">0</Text>
                  <Text allowFontScaling={false} className="text-[#89A2CA] font-bold text-[14px]">100+</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 9: // IntroTen
        return (
          <View className="flex-1 items-center justify-center">
             <View className="mt-4 w-full">
              <View className="relative flex-row items-end justify-between px-2">
                <View className="absolute bottom-0 left-0 right-0 top-0 z-0">
                  {[0, hours, actualHours, 2.5, 1.5].map((h, i) => (
                    <View key={i} className={`absolute left-0 right-0 h-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} style={{ bottom: 32 + getHeight(h) }} />
                  ))}
                </View>
                <View className="z-10 w-1/4 items-center">
                  <View className={`${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'} mb-1 rounded px-2 py-1`}>
                    <Text allowFontScaling={false} className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>{hours.toFixed(1)}h</Text>
                  </View>
                  <View className="top-0.5 w-12 rounded-t-sm bg-[#9FB7E3]" style={{ height: getHeight(hours) }} />
                  <Text allowFontScaling={false} className={`font-regular mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>Your assumption</Text>
                </View>
                <View className="z-10 w-1/4 items-center">
                  <View className="absolute -top-7">
                    <View className={`${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'} mb-1 rounded px-2 py-1`}>
                      <Text allowFontScaling={false} className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>{actualHours.toFixed(1)}h</Text>
                    </View>
                  </View>
                  <View className="top-0.5 w-12 rounded-t-sm bg-[#D99694]" style={{ height: getHeight(actualHours) }} />
                  <Text allowFontScaling={false} className={`font-regular mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>Actual usage</Text>
                </View>
                <View className="z-10 w-1/4 items-center">
                  <View className={`${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'} mb-1 rounded px-2 py-1`}>
                    <Text allowFontScaling={false} className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>2.5h</Text>
                  </View>
                  <View className="top-0.5 w-12 rounded-t-sm bg-[#8CD6C3]" style={{ height: getHeight(2.5) }} />
                  <Text allowFontScaling={false} className={`font-regular mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>with <Text className="font-bold">FocusOn</Text></Text>
                </View>
                <View className="z-10 w-1/4 items-center">
                  <View className={`${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#9FB7E3]'} mb-1 rounded px-2 py-1`}>
                    <Text allowFontScaling={false} className={`text-[10px] ${isDarkMode ? 'text-[#132C4D]' : 'text-[#2E3B4D]'}`}>1.5h</Text>
                  </View>
                  <View className="top-0.5 w-12 rounded-t-sm bg-[#93D093]" style={{ height: getHeight(1.5) }} />
                  <Text allowFontScaling={false} className={`mt-2 h-8 text-center text-[7px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}><Text className="font-bold">FocusOn</Text>{'\n'}<Text className="font-regular">+Iron will</Text></Text>
                </View>
              </View>
            </View>
            <View className="mt-12  w-full">
              <View className={`items-center p-6 rounded-3xl ${isDarkMode ? ' bg-[#0D121A]' : 'border-slate-50 bg-white'}`}>
                <Text allowFontScaling={false} className={`mb-4 text-[16px] font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3B4D]'}`}>You unlock your phone daily</Text>
                <Text allowFontScaling={false} className="mb-4 text-[32px] font-bold text-[#F4BE37]">{actualUnlocks}x</Text>
                <Text allowFontScaling={false} className={`text-[12px] ${isDarkMode ? 'text-[#738099]' : 'text-[#2E3B4D]'}`}>Assumption was {unlocks} times</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderFooter = () => {
    // IntroSeven (Step 4) has extra text in footer
    if (step === 4) {
      return (
        <View className="w-full items-center pb-8 pt-4">
          <Text allowFontScaling={false} className={`mb-8 px-4 text-center text-[13px] font-light leading-5 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
            Introducing <Text className={`font-medium ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>FocusOn</Text> notification filter.{'\n'}You won't miss important notifications, block{'\n'}unnecessary, and stay focused.
          </Text>
          <View className="mb-8 flex-row space-x-3">
            {[...Array(6)].map((_, i) => (
              <View key={i} className={`mx-1 h-[18px] w-[18px] rounded-full border ${isDarkMode ? 'border-[#DADFE5]' : 'border-blue-400'} ${i <= 4 ? (isDarkMode ? 'bg-[#DADFE5]' : 'bg-blue-400') : 'bg-transparent'}`} />
            ))}
          </View>
          <TouchableOpacity activeOpacity={1} className={`mb-4 w-full flex-row items-center justify-center rounded-full ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA9E5]'} py-4`} onPress={() => setStep(step + 1)}>
            <Text allowFontScaling={false} className="mr-2 text-[16px] font-semibold text-white">Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }
    
    // Steps 0-5 (IntroThree to IntroEight) have dots and Next button
    if (step < 6) {
      return (
        <View className="w-full items-center pb-8 pt-4">
          <View className="mb-8 flex-row space-x-3">
            {[...Array(6)].map((_, i) => (
              <View key={i} className={`mx-1 h-[18px] w-[18px] rounded-full border ${isDarkMode ? 'border-[#DADFE5]' : 'border-[#7EA9E5]'} ${i <= step ? (isDarkMode ? 'bg-[#DADFE5]' : 'bg-[#7EA9E5]') : 'bg-transparent'}`} />
            ))}
          </View>
          <TouchableOpacity activeOpacity={1} className={`mb-4 w-full flex-row items-center justify-center rounded-full ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA9E5]'} py-4`} onPress={() => setStep(step + 1)}>
            <Text allowFontScaling={false} className="mr-2 text-[16px] font-semibold text-white">Next</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    // Step 6 and 7 (Privacy and Permissions) - handled by component itself
    if (step === 6 || step === 7) return null;

    // Step 8 (IntroNine) has Submit button
    if (step === 8) {
      return (
        <View className="w-full items-center pb-8 pt-4">
          <TouchableOpacity activeOpacity={1} className={`w-full py-4 rounded-full items-center justify-center mb-4 shadow-sm ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA6E0]'}`} onPress={() => setStep(step + 1)}>
            <Text allowFontScaling={false} className="text-white text-[16px] font-regular">Submit</Text>
          </TouchableOpacity>
          <Text allowFontScaling={false} className={`text-[10px] font-light text-center ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
            Ready to be amazed by actual data!
          </Text>
        </View>
      );
    }

    // Step 9 (IntroTen) has Got It button
    if (step === 9) {
      return (
        <View className="w-full items-center px-4 pb-8 pt-4">
          <TouchableOpacity activeOpacity={1} className={`mb-8 w-full items-center justify-center rounded-full py-4 shadow-sm ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#7EA6E0]'}`} onPress={async () => {
              try { await AsyncStorage.setItem('hasSeenIntro', 'true'); } catch (e) { console.error('Failed to set intro flag', e); }
              router.replace('/home');
            }}>
            <Text allowFontScaling={false} className="font-regular text-[16px] text-white">Got It!</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Steps 10+
    if (step >= 10) return null;

    return null;
  };

  // if (step === 9) {
  //   return <PermissionAccessScreen />;
  // }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0D121A]' : 'bg-[#EBF1F7]'}`}>
      <StatusBar backgroundColor={isDarkMode ? '#0D121A' : step === 9 ? '#5C8BCC' : '#EBF1F7'} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {step === 9 && (
        <View className={`w-full items-center justify-center py-6 ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#5C8BCC]'}`}>
          <Text allowFontScaling={false} className="text-[16px] font-bold text-white">Your Screen Time</Text>
        </View>
      )}
      <View className={`flex-1 ${step === 6 || step === 7 ? '' : 'px-6 pt-8'}`}>
        {renderContent()}
        {renderFooter()}
      </View>
    </SafeAreaView>
  );
}
