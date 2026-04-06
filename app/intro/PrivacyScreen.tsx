import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyScreen({ onContinue }: { onContinue?: () => void }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [isChecked, setChecked] = useState(false);

  const handleContinue = () => {
    if (isChecked) {
      if (onContinue) {
        onContinue();
      } else {
        router.push('/intro/PermissionAccessScreen');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#0D121A' : '#E6EDF7' }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#0D121A' : '#E6EDF7'} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mt-8 mb-6">
          <Text
            allowFontScaling={false}
            className={`text-[12px] font-medium tracking-[2px] mb-2 uppercase ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
            MANIFESTO
          </Text>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: 'RobotoSlab_400Regular' }}
            className={`text-[48px] font-light leading-tight ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
            Privacy{'\n'}Focus
          </Text>
        </View>

        {/* Intro Text */}
        <Text
          allowFontScaling={false}
          className={`text-[16px] font-light leading-relaxed mb-12 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
          We respect your privacy. Our app stores data on your device. We{' '}
          <Text className={`font-medium ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>do not collect, share, or sell your info</Text>{' '}
          to any third party.
        </Text>

        {/* Cards */}
        <View className="mb-8 gap-y-4">
          {/* Card 1 */}
          <View className={`rounded-2xl p-5 mb-6 ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#FFFFFF]'}`}>
            <View className={`w-12 h-12 rounded-xl items-center justify-center mb-4 ${isDarkMode ? 'bg-[#FFFFFF0D]' : 'bg-[#EBF1F7]'}`}>
              <MaterialCommunityIcons name="cellphone-link" size={24} color={isDarkMode ? '#DADFE5' : '#5C8BCC'} />
            </View>
            <Text
              allowFontScaling={false}
              className={`font-semibold text-[18px] mb-2 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
              Local Data Storage
            </Text>
            <Text
              allowFontScaling={false}
              className={`text-[16px] font-regular leading-snug ${isDarkMode ? 'text-[#C6C6C6]' : 'text-[#8698B2]'}`}>
              Even when you sign in, your  name and email address are stored only on your device.
            </Text>
          </View>

          {/* Card 2 */}
          <View className={`rounded-2xl p-5 mb-6 ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#FFFFFF]'}`}>              
            <View className={`w-12 h-12 rounded-xl items-center justify-center mb-4 ${isDarkMode ? 'bg-[#FFFFFF0D]' : 'bg-[#EBF1F7]'}`}>
              <Ionicons name="cloud-offline-outline" size={24} color={isDarkMode ? '#DADFE5' : '#5C8BCC'} />
            </View>
            <Text
              allowFontScaling={false}
              className={`font-semibold text-[18px] mb-2 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
              No Server Sync
            </Text>
            <Text
              allowFontScaling={false}
              className={`text-[16px] font-regular leading-snug ${isDarkMode ? 'text-[#C6C6C6]' : 'text-[#8698B2]'}`}>
              Your data stays with you. We don't sync databases with our servers.
            </Text>
          </View>

          {/* Card 3 */}
          <View className={`rounded-2xl p-5 mb-6 ${isDarkMode ? 'bg-[#131B26]' : 'bg-[#FFFFFF]'}`}>
            <View className={`w-12 h-12 rounded-xl items-center justify-center mb-4 ${isDarkMode ? 'bg-[#FFFFFF0D]' : 'bg-[#EBF1F7]'}`}>
              <MaterialCommunityIcons name="cancel" size={24} color={isDarkMode ? '#DADFE5' : '#5C8BCC'} />
            </View>
            <Text
              allowFontScaling={false}
              className={`font-semibold text-[18px] mb-2 ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
              No Ads-No Data Selling
            </Text>
            <Text
              allowFontScaling={false}
              className={`text-[16px] font-regular leading-snug ${isDarkMode ? 'text-[#C6C6C6]' : 'text-[#8698B2]'}`}>
              Your privacy isn't for sale. We do not share or sale your personal information with any third-party marketing or analytics firms.
            </Text>
          </View>
        </View>

        {/* Purpose of permission */}
        <View className="items-center mb-20 px-2">
          <Text
            allowFontScaling={false}
            className={`font-semibold text-[18px] mb-4 text-center ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
            Purpose Of Having Permission
          </Text>
          <Text
            allowFontScaling={false}
            className={`text-[16px] font-light leading-snug ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
            Android Launcher must required a few permission to show some important information and Limit addictive app.
          </Text>
        </View>

        {/* Thank you */}
        <View className="items-center mb-20">
          <Text
            allowFontScaling={false}
            className={`text-[20px] font-light text-center ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
            Feel free to use <Text className={`font-bold ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#42C4D]'}`}>Focus On</Text>
            {'\n'}Thank you! ❤️
          </Text>
        </View>

        {/* Digital Sanctuary Card */}
        <LinearGradient
          colors={isDarkMode ? ['#1F2C4E', '#13131300'] : ['#C8D6E8', '#E0E8F2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`rounded-2xl p-6 mb-20 overflow-hidden relative border ${isDarkMode ? 'border-[#2A364D]' : 'border-[#C8D6E8]'}`}>
          <View className="items-center justify-center z-10">
            <Text
              allowFontScaling={false}
              className={`text-[18px] tracking-[3px] mb-2 font-light ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
              DIGITAL SANCTUARY
            </Text>
            <Text
              allowFontScaling={false}
              className={`text-[10px] tracking-[1px] font-light ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#8698B2]'}`}>
              FOCUS ON LAUNCHER
            </Text>
          </View>
          <MaterialCommunityIcons 
            name="lock" 
            size={100} 
            color={isDarkMode ? '#2A364D' : '#C8D6E8'} 
            style={{ position: 'absolute', right: -15, bottom: -20, opacity: 0.5 }} 
          />
        </LinearGradient>

        {/* Checkbox and Continue */}
        <View className="mb-6 flex-row items-start ">
          <Checkbox
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? '#5C8BCC' : undefined}
            className={`rounded-sm w-5 h-5 mr-3  ${isDarkMode ? 'border-gray-500' : 'border-slate-400'}`}
          />
          <Text
            allowFontScaling={false}
            className={`text-[16px] font-regular leading-snug  ${isDarkMode ? 'text-[#DADFE5]' : 'text-[#2E3A4C]'}`}>
            I've read the privacy manifest{'\n'} and I'm convinced
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isChecked}
          className={`w-full rounded-xl py-4 items-center justify-center ${
            isChecked 
              ? (isDarkMode ? 'bg-[#5C8BCC]' : 'bg-[#5C8BCC]') 
              : (isDarkMode ? 'bg-[#2A364D]' : 'bg-[#C8D6E8]')
          }`}>
          <Text
            allowFontScaling={false}
            className={`font-regular text-[16px] ${
              isChecked 
                ? 'text-white' 
                : (isDarkMode ? 'text-[#DADFE5]' : 'text-slate-500')
            }`}>
            Continue
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
