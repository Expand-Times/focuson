import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingScreen() {
  const router = useRouter();

  // State for toggles
  const [phoneDialer, setPhoneDialer] = useState(false);
  const [cameraIcon, setCameraIcon] = useState(true);
  const [alarmClock, setAlarmClock] = useState(true);
  
  const [darkMood, setDarkMood] = useState(false); // "Dark Mood" as per design
  const [homeWallpaper, setHomeWallpaper] = useState(true);
  
  const [reminderOption, setReminderOption] = useState('mindful'); // mindful, remind, quit
  const [contactOption, setContactOption] = useState('issue'); // issue, suggestion

  // Color scheme mock data
  const colors = ['#7EA6E0', '#1E293B', '#A78BFA', '#FDE047', '#F87171', '#FB923C', '#22D3EE'];
  
  // Wallpaper mock data (just using colors for now)
  const wallpapers = ['#1E3A8A', '#172554', '#334155', '#15803D', '#E2E8F0', '#CBD5E1'];

  return (
    <SafeAreaView className="flex-1 bg-[#EEF2F6]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#EEF2F6]">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-700">Settings</Text>
        <TouchableOpacity>
           <MaterialCommunityIcons name="magnify" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Home Screen Section */}
        <View className="mt-4">
            <Text className="text-slate-700 font-semibold text-lg mb-2">Home Screen</Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm">
                
                {/* Phone Dialer */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-600 text-base">Phone dialer icon</Text>
                    <Switch 
                        value={phoneDialer} 
                        onValueChange={setPhoneDialer}
                        trackColor={{ false: "#E2E8F0", true: "#7EA6E0" }}
                        thumbColor={"white"}
                    />
                </View>

                {/* Camera Icon */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-600 text-base">Camera icon</Text>
                    <Switch 
                        value={cameraIcon} 
                        onValueChange={setCameraIcon}
                        trackColor={{ false: "#E2E8F0", true: "#7EA6E0" }}
                        thumbColor={"white"}
                    />
                </View>

                {/* Alarm Clock */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-600 text-base">Alarm Clock icon</Text>
                    <Switch 
                        value={alarmClock} 
                        onValueChange={setAlarmClock}
                        trackColor={{ false: "#E2E8F0", true: "#7EA6E0" }}
                        thumbColor={"white"}
                    />
                </View>

                {/* Time Format */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-600 text-base">Time Format</Text>
                    <TouchableOpacity className="bg-[#7EA6E0] px-3 py-1 rounded-full">
                        <Text className="text-white text-sm">11:47 PM</Text>
                    </TouchableOpacity>
                </View>

                {/* Date Format */}
                <View className="flex-row justify-between items-center">
                    <Text className="text-slate-600 text-base">Date Format</Text>
                    <TouchableOpacity className="bg-[#7EA6E0] px-3 py-1 rounded-full">
                        <Text className="text-white text-sm">Tuesday, 24 Oct 2025</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>

        {/* Display Section */}
        <View className="mt-6">
            <Text className="text-slate-700 font-semibold text-lg mb-2">Display</Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm">
                
                {/* Dark Mood */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-600 text-base">Dark Mood</Text>
                    <View className="flex-row items-center gap-2">
                         <MaterialCommunityIcons name="theme-light-dark" size={20} color="#64748B" />
                    </View>
                </View>

                {/* Home Wallpaper */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-600 text-base">Home Wallpaper</Text>
                    <Switch 
                        value={homeWallpaper} 
                        onValueChange={setHomeWallpaper}
                        trackColor={{ false: "#E2E8F0", true: "#7EA6E0" }}
                        thumbColor={"white"}
                    />
                </View>

                {/* Select Wallpaper */}
                <Text className="text-slate-600 text-base mb-2">Select</Text>
                <View className="flex-row gap-2 mb-4">
                    {wallpapers.map((color, idx) => (
                        <TouchableOpacity key={idx} className="w-10 h-10 rounded-md border border-slate-200" style={{backgroundColor: color}} />
                    ))}
                </View>

                {/* Color Scheme */}
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-600 text-base">Color Scheme</Text>
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#94A3B8" />
                </View>
                <View className="flex-row gap-3">
                    {colors.map((color, idx) => (
                        <TouchableOpacity key={idx} className="w-8 h-8 rounded-full" style={{backgroundColor: color}} />
                    ))}
                </View>

            </View>
        </View>

        {/* In-app time reminder */}
        <View className="mt-6">
            <Text className="text-slate-700 font-semibold text-lg mb-2">In-app time reminder</Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="text-slate-700 font-medium text-base mb-3">When time is over (Set Default)</Text>
                
                <TouchableOpacity className="flex-row items-center mb-2" disabled>
                    <MaterialCommunityIcons name="radiobox-marked" size={20} color="#94A3B8" />
                    <Text className="text-slate-400 ml-2 text-base">Mindful delay <Text className="text-xs">(coming soon)</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center mb-2" onPress={() => setReminderOption('remind')}>
                    <MaterialCommunityIcons name={reminderOption === 'remind' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#7EA6E0" />
                    <Text className="text-slate-600 ml-2 text-base">Remind Me</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center" onPress={() => setReminderOption('quit')}>
                    <MaterialCommunityIcons name={reminderOption === 'quit' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#7EA6E0" />
                    <Text className="text-slate-600 ml-2 text-base">Quit</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* More */}
        <View className="mt-6">
             <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-700 font-semibold text-lg">More</Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#7EA6E0" />
             </View>
             
             <View className="bg-white rounded-2xl p-4 shadow-sm">
                 <TouchableOpacity className="py-2">
                     <Text className="text-slate-600 text-base">Log in</Text>
                 </TouchableOpacity>
                 
                 <View className="flex-row justify-between items-center py-2">
                     <Text className="text-slate-600 text-base">Free Version</Text>
                     <TouchableOpacity className="bg-[#7EA6E0] px-4 py-1.5 rounded-lg">
                         <Text className="text-white text-sm font-medium">Check Premium</Text>
                     </TouchableOpacity>
                 </View>

                 <TouchableOpacity className="py-2">
                     <Text className="text-slate-600 text-base">Recommend to F&F</Text>
                 </TouchableOpacity>
             </View>
        </View>

        {/* About Minimal Life */}
        <View className="mt-6">
             <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-700 font-semibold text-lg">About Minimal Life</Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#7EA6E0" />
             </View>
             
             <View className="bg-white rounded-2xl p-4 shadow-sm flex-row justify-center items-center">
                 <TouchableOpacity className="flex-1 items-center border-r border-slate-200">
                     <Text className="text-slate-600 text-base">Privacy Policy</Text>
                 </TouchableOpacity>
                 <TouchableOpacity className="flex-1 items-center">
                     <Text className="text-slate-600 text-base">Our Goal</Text>
                 </TouchableOpacity>
             </View>
        </View>

        {/* Contact/Feedback Card */}
        <View className="mt-6 bg-white rounded-2xl p-4 shadow-sm items-center">
            <View className="flex-row gap-8 mb-4">
                <TouchableOpacity className="flex-row items-center" onPress={() => setContactOption('issue')}>
                    <MaterialCommunityIcons name={contactOption === 'issue' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#7EA6E0" />
                    <Text className="text-slate-700 ml-2 font-medium">Issue</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center" onPress={() => setContactOption('suggestion')}>
                    <MaterialCommunityIcons name={contactOption === 'suggestion' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#7EA6E0" />
                    <Text className="text-slate-700 ml-2 font-medium">Suggestion</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity className="w-1/2 bg-[#7EA6E0] py-2.5 rounded-lg items-center mb-3">
                <Text className="text-white font-medium text-base">Contact Us</Text>
            </TouchableOpacity>

            <Text className="text-slate-400 text-xs text-center px-4 leading-5">
                Please let us know any issue or suggestion.{'\n'}
                Our dedicated developers are ready to fix your issue ASAP.
            </Text>
        </View>

        {/* Rate on Google Play */}
        <TouchableOpacity className="mt-6 w-full bg-[#7EA6E0] py-3.5 rounded-xl items-center shadow-sm mb-6">
            <Text className="text-white font-semibold text-lg">Rate on Google Play</Text>
        </TouchableOpacity>

        {/* Device Setting */}
        <TouchableOpacity className="flex-row justify-center items-center mb-8">
            <Text className="text-slate-700 font-bold text-lg mr-2">Device Setting</Text>
            <MaterialCommunityIcons name="cog-outline" size={24} color="#334155" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}