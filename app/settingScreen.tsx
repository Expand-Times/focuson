import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorContext, AVAILABLE_WALLPAPERS, ColorContext } from './context/ColorContext';
type ColorOptionProps = {
  color: string;
  onPress: () => void;
  isPremium?: boolean;
  isSelected?: boolean;
  isDarkMode?: boolean;
};
export default function SettingScreen() {
  const router = useRouter();
  // State for toggles
  const [phoneDialer, setPhoneDialer] = useState(false);
  const [cameraIcon, setCameraIcon] = useState(true);
  const [alarmClock, setAlarmClock] = useState(true);
  const [showThemes, setShowThemes] = useState(false);
  const [homeWallpaper, setHomeWallpaper] = useState(true);
   const [modalVisibles, setModalVisibles] = useState(false);
  const [reminderOption, setReminderOption] = useState('mindful'); // mindful, remind, quit
  const [contactOption, setContactOption] = useState('issue'); // issue, suggestion
   const context = useContext(ColorContext);

  if (!context) {
    throw new Error("ColorContext is not available");
  }
  const { isDarkMode, toggleDarkMode, wallpaper, setWallpaper ,selectedColor, setSelectedColor, isPremium} = useColorContext();

  // Color scheme mock data
   // Define theme colors
  const freeColors = ["#3580FF", "#27282A", "#20BAD9"];
  const premiumColors = ["#F2247A", "#29CC5F", "#F2C66D", "#7441D9", "#E58439"];
  const handleThemeSelect = (color: string) => {
    if (freeColors.includes(color) || isPremium) {
      setSelectedColor(color);
    } else {
      setModalVisibles(true);
    }
  };


  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#EEF2F6]'}`}>
      {/* Header */}
      <View
        className={`flex-row items-center justify-between px-4 py-3 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#EEF2F6]'}`}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={isDarkMode ? '#E2E8F0' : '#64748B'}
          />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
          Settings
        </Text>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={isDarkMode ? '#94A3B8' : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Home Screen Section */}
        <View className="mt-4">
          <Text
            className={`mb-2 text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Home Screen
          </Text>
          <View className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            {/* Phone Dialer */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Phone dialer icon
              </Text>
              <Switch
                value={phoneDialer}
                onValueChange={setPhoneDialer}
                trackColor={{ false: '#E2E8F0', true: '#7EA6E0' }}
                thumbColor={'white'}
              />
            </View>

            {/* Camera Icon */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Camera icon
              </Text>
              <Switch
                value={cameraIcon}
                onValueChange={setCameraIcon}
                trackColor={{ false: '#E2E8F0', true: '#7EA6E0' }}
                thumbColor={'white'}
              />
            </View>

            {/* Alarm Clock */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Alarm Clock icon
              </Text>
              <Switch
                value={alarmClock}
                onValueChange={setAlarmClock}
                trackColor={{ false: '#E2E8F0', true: '#7EA6E0' }}
                thumbColor={'white'}
              />
            </View>

            {/* Time Format */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Time Format
              </Text>
              <TouchableOpacity className="rounded-full bg-[#7EA6E0] px-3 py-1">
                <Text className="text-sm text-white">11:47 PM</Text>
              </TouchableOpacity>
            </View>

            {/* Date Format */}
            <View className="flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Date Format
              </Text>
              <TouchableOpacity className="rounded-full bg-[#7EA6E0] px-3 py-1">
                <Text className="text-sm text-white">Tuesday, 24 Oct 2025</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Display Section */}
        <View className="mt-6">
          <Text
            className={`mb-2 text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Display
          </Text>
          <View className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            {/* Dark Mood */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Dark Mood
              </Text>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={toggleDarkMode}>
                  <MaterialCommunityIcons
                    name={isDarkMode ? 'weather-night' : 'theme-light-dark'}
                    size={20}
                    color={isDarkMode ? '#E2E8F0' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Home Wallpaper */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Home Wallpaper
              </Text>
              <Switch
                value={homeWallpaper}
                onValueChange={setHomeWallpaper}
                trackColor={{ false: '#E2E8F0', true: '#7EA6E0' }}
                thumbColor={'white'}
              />
            </View>

            {/* Select Wallpaper */}
            <Text className={`mb-2 text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Select
            </Text>
            <View className="mb-4 flex-row gap-2">
              {AVAILABLE_WALLPAPERS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  className={`h-10 w-10 overflow-hidden rounded-md border ${wallpaper === item ? 'border-2 border-[#7EA6E0]' : 'border-slate-200'}`}
                  onPress={() => setWallpaper(item)}>
                  {typeof item === 'string' ? (
                    <View style={{ backgroundColor: item, width: '100%', height: '100%' }} />
                  ) : (
                    <Image source={item} className="h-full w-full" resizeMode="cover" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Scheme */}
            <View className="mb-2 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Color Scheme
              </Text>
              <MaterialCommunityIcons
                onPress={() => setShowThemes(!showThemes)}
                name="chevron-down"
                size={24}
                color="#94A3B8"
              />
            </View>
            {showThemes && (
              <View className="flex-row gap-3">
                {[
                  ...freeColors.map((color) => ({
                    color,
                    isPremium: false,
                  })),
                  ...premiumColors.map((color) => ({
                    color,
                    isPremium: true,
                  })),
                ].map(({ color, isPremium }) => (
                  <ColorOption
                    key={color}
                    color={color}
                    onPress={() => handleThemeSelect(color)}
                    isPremium={isPremium}
                    isSelected={selectedColor === color}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* In-app time reminder */}
        <View className="mt-6">
          <Text
            className={`mb-2 text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            In-app time reminder
          </Text>
          <View className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <Text
              className={`mb-3 text-base font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              When time is over (Set Default)
            </Text>

            <TouchableOpacity className="mb-2 flex-row items-center" disabled>
              <MaterialCommunityIcons name="radiobox-marked" size={20} color="#94A3B8" />
              <Text className="ml-2 text-base text-slate-400">
                Mindful delay <Text className="text-xs">(coming soon)</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mb-2 flex-row items-center"
              onPress={() => setReminderOption('remind')}>
              <MaterialCommunityIcons
                name={reminderOption === 'remind' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color="#7EA6E0"
              />
              <Text
                className={`ml-2 text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Remind Me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setReminderOption('quit')}>
              <MaterialCommunityIcons
                name={reminderOption === 'quit' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color="#7EA6E0"
              />
              <Text
                className={`ml-2 text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Quit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* More */}
        <View className="mt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text
              className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              More
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#7EA6E0" />
          </View>

          <View className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <TouchableOpacity className="py-2">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Log in
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-between py-2">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Free Version
              </Text>
              <TouchableOpacity className="rounded-lg bg-[#7EA6E0] px-4 py-1.5">
                <Text className="text-sm font-medium text-white">Check Premium</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="py-2">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Recommend to F&F
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Minimal Life */}
        <View className="mt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text
              className={`text-lg font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              About Minimal Life
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#7EA6E0" />
          </View>

          <View
            className={`flex-row items-center justify-center rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <TouchableOpacity className="flex-1 items-center border-r border-slate-200">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Our Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact/Feedback Card */}
        <View
          className={`mt-6 items-center rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
          <View className="mb-4 flex-row gap-8">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setContactOption('issue')}>
              <MaterialCommunityIcons
                name={contactOption === 'issue' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color="#7EA6E0"
              />
              <Text
                className={`ml-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Issue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setContactOption('suggestion')}>
              <MaterialCommunityIcons
                name={contactOption === 'suggestion' ? 'radiobox-marked' : 'radiobox-blank'}
                size={20}
                color="#7EA6E0"
              />
              <Text
                className={`ml-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Suggestion
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mb-3 w-1/2 items-center rounded-lg bg-[#7EA6E0] py-2.5">
            <Text className="text-base font-medium text-white">Contact Us</Text>
          </TouchableOpacity>

          <Text className="px-4 text-center text-xs leading-5 text-slate-400">
            Please let us know any issue or suggestion.{'\n'}
            Our dedicated developers are ready to fix your issue ASAP.
          </Text>
        </View>

        {/* Rate on Google Play */}
        <TouchableOpacity className="mb-6 mt-6 w-full items-center rounded-xl bg-[#7EA6E0] py-3.5 shadow-sm">
          <Text className="text-lg font-semibold text-white">Rate on Google Play</Text>
        </TouchableOpacity>

        {/* Device Setting */}
        <TouchableOpacity className="mb-8 flex-row items-center justify-center">
          <Text
            className={`mr-2 text-lg font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Device Setting
          </Text>
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={isDarkMode ? '#CBD5E1' : '#334155'}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
// Update the ColorOption component with proper typing
const ColorOption = ({
  color,
  onPress,
  isPremium = false,
  isSelected = false,
  isDarkMode = false,
}: ColorOptionProps) => (
  <TouchableOpacity onPress={onPress} className="m-0.5">
    <View
      className={`rounded-full border-2 relative w-[30px] h-[30px]`}
      style={{ 
        backgroundColor: color, 
        borderColor: isSelected 
          ? (isDarkMode ? "gray" : "#3B82F6") 
          : (isDarkMode ? "#FFFFFF" : "#3B82F6")
      }}
    >
      {isPremium && (
        <View
          className="absolute -top-1 -right-1 bg-amber-500 rounded-full w-4 h-4 items-center justify-center"
        >
          <Ionicons name="lock-closed" size={10} color="white" />
        </View>
      )}
    </View>
  </TouchableOpacity>
);