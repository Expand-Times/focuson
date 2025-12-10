import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Image, TextInput, Modal, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
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
  const [alarmClock, setAlarmClock] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [homeWallpaper, setHomeWallpaper] = useState(true);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [reminderOption, setReminderOption] = useState('mindful'); // mindful, remind, quit
  const [contactOption, setContactOption] = useState('issue'); // issue, suggestion
   const context = useContext(ColorContext);

  if (!context) {
    throw new Error("ColorContext is not available");
  }
  const { isDarkMode, toggleDarkMode, wallpaper, setWallpaper ,selectedColor, setSelectedColor, isPremium, showPhoneDialer, setShowPhoneDialer, showCameraIcon, setShowCameraIcon, timeFormat, setTimeFormat, toggleTimeFormat, dateFormat, setDateFormat, timeOffset, setTimeOffset } = useColorContext();

  // Time Picker State
  const [tempHour, setTempHour] = useState(0);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAmPm, setTempAmPm] = useState<'AM' | 'PM'>('AM');
  const [tempDate, setTempDate] = useState(new Date());

  // Initialize picker when modal opens
  useEffect(() => {
    if (timeFormatModalVisible) {
      const now = new Date(Date.now() + (timeOffset || 0));
      let h = now.getHours();
      const m = now.getMinutes();
      
      if (timeFormat === '12h') {
        setTempAmPm(h >= 12 ? 'PM' : 'AM');
        h = h % 12;
        h = h ? h : 12; // 0 should be 12
      }
      setTempHour(h);
      setTempMinute(m);
    }
  }, [timeFormatModalVisible, timeOffset, timeFormat]);

  // Initialize date picker
  useEffect(() => {
    if (dateModalVisible) {
      setTempDate(new Date(Date.now() + (timeOffset || 0)));
    }
  }, [dateModalVisible, timeOffset]);

  const handleTimeSave = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let targetHour = tempHour;
    
    if (timeFormat === '12h') {
       if (tempAmPm === 'PM' && targetHour < 12) targetHour += 12;
       if (tempAmPm === 'AM' && targetHour === 12) targetHour = 0;
    }
    
    const targetTime = new Date(currentYear, currentMonth, currentDay, targetHour, tempMinute);
    const offset = targetTime.getTime() - now.getTime();
    
    setTimeOffset(offset);
    setTimeFormatModalVisible(false);
  };

  const handleDateSave = () => {
    const now = new Date();
    const currentVirtualTime = new Date(now.getTime() + (timeOffset || 0));
    
    const targetDate = new Date(
      tempDate.getFullYear(),
      tempDate.getMonth(),
      tempDate.getDate(),
      currentVirtualTime.getHours(),
      currentVirtualTime.getMinutes(),
      currentVirtualTime.getSeconds()
    );
    
    const newOffset = targetDate.getTime() - now.getTime();
    setTimeOffset(newOffset);
    setDateModalVisible(false);
  };

  const ITEM_HEIGHT = 50;
  
  const WheelPicker = ({ data, selectedValue, onValueChange }: { data: (string | number)[], selectedValue: string | number, onValueChange: (val: any) => void }) => {
    const flatListRef = useRef<FlatList>(null);

    // Scroll to selection when modal becomes visible or value changes externally (though value changes mostly come from scroll)
    useEffect(() => {
      if (timeFormatModalVisible && flatListRef.current) {
        const index = data.indexOf(selectedValue);
        if (index !== -1) {
           // Small delay to ensure layout
           setTimeout(() => {
             flatListRef.current?.scrollToIndex({ index, animated: false });
           }, 100);
        }
      }
    }, [timeFormatModalVisible]);

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      if (index >= 0 && index < data.length) {
        onValueChange(data[index]);
      }
    };

    return (
      <View style={{ height: ITEM_HEIGHT * 3, width: 80, overflow: 'hidden' }}>
        {/* Selection Highlight */}
        <View 
          pointerEvents="none" 
          className={`absolute top-[50px] w-full h-[50px] border-t border-b ${isDarkMode ? 'border-slate-600' : 'border-slate-200'} bg-slate-500/10`} 
        />
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
              <Text className={`text-2xl font-bold ${item === selectedValue ? (isDarkMode ? 'text-white' : 'text-slate-800') : (isDarkMode ? 'text-slate-600' : 'text-slate-300')}`}>
                {typeof item === 'number' ? item.toString().padStart(2, '0') : item}
              </Text>
            </View>
          )}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          initialScrollIndex={data.indexOf(selectedValue) !== -1 ? data.indexOf(selectedValue) : 0}
        />
      </View>
    );
  };

  const CalendarPicker = ({ selectedDate, onDateChange }: { selectedDate: Date, onDateChange: (date: Date) => void }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    
    useEffect(() => {
        setViewDate(new Date(selectedDate));
    }, []); 
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    
    const days: (number | null)[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    const changeMonth = (increment: number) => {
      const newDate = new Date(year, month + increment, 1);
      setViewDate(newDate);
    };

    return (
      <View className="w-full">
        <View className="flex-row justify-between items-center mb-6 px-2">
           <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
             <MaterialCommunityIcons name="chevron-left" size={28} color={isDarkMode ? '#E2E8F0' : '#475569'} />
           </TouchableOpacity>
           <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
             {monthNames[month]} {year}
           </Text>
           <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
             <MaterialCommunityIcons name="chevron-right" size={28} color={isDarkMode ? '#E2E8F0' : '#475569'} />
           </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-between mb-4">
          {weekDays.map(day => (
            <Text key={day} className={`w-[14%] text-center text-xs font-bold tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {day}
            </Text>
          ))}
        </View>
        
        <View className="flex-row flex-wrap">
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} className="w-[14%] aspect-square" />;
            }
            
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <TouchableOpacity 
                key={day} 
                className="w-[14%] aspect-square justify-center items-center mb-2"
                onPress={() => {
                  const newDate = new Date(year, month, day);
                  onDateChange(newDate);
                }}
              >
                <View className={`w-9 h-9 justify-center items-center rounded-full ${isSelected ? 'bg-[#7EA6E0]' : (isToday ? 'border border-[#7EA6E0]' : '')}`}>
                  <Text className={`text-base font-medium ${isSelected ? 'text-white' : (isDarkMode ? 'text-slate-200' : 'text-slate-700')}`}>
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };


  const cycleDateFormat = () => {
    const formats = [
      'weekday, day month year',
      'day month year',
      'day/month/year',
      'month/day/year',
      'year-month-day'
    ];
    const currentIndex = formats.indexOf(dateFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    setDateFormat(formats[nextIndex]);
  };

  const getDateFormatPreview = (format: string, date?: Date) => {
    const now = date || new Date(Date.now() + (timeOffset || 0));
    switch (format) {
      case 'weekday, day month year':
        return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
      case 'day month year':
        return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      case 'day/month/year':
        return now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'month/day/year':
        return now.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'year-month-day':
        return now.toISOString().split('T')[0];
      default:
        return format;
    }
  };

   // Define theme colors
  const freeColors = ["#3580FF", "#27282A", "#20BAD9"];
  const premiumColors = ["#F2247A", "#29CC5F", "#F2C66D", "#7441D9", "#E58439"];
  const handleThemeSelect = (color: string) => {
    if (freeColors.includes(color) || isPremium) {
      setSelectedColor(color);
    } else {
      setModalVisible(true);
    }
  };

  const getCurrentDisplayTime = () => {
    const now = new Date(Date.now() + (timeOffset || 0));
    if (timeFormat === '12h') {
      return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
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
        
        {/* Time Settings Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={timeFormatModalVisible}
          onRequestClose={() => setTimeFormatModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/80">
            <View className={`w-[90%] rounded-3xl p-6 shadow-2xl relative ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
              <Text className={`text-xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Set Time
              </Text>
              
              {/* Format Toggle */}
              <View className="flex-row justify-center mb-8 bg-slate-200/20 rounded-full p-1 self-center">
                 <TouchableOpacity 
                   onPress={() => setTimeFormat('12h')}
                   className={`px-6 py-2 rounded-full ${timeFormat === '12h' ? 'bg-[#7EA6E0]' : 'bg-transparent'}`}
                 >
                   <Text className={`font-medium ${timeFormat === '12h' ? 'text-white' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>12h</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   onPress={() => setTimeFormat('24h')}
                   className={`px-6 py-2 rounded-full ${timeFormat === '24h' ? 'bg-[#7EA6E0]' : 'bg-transparent'}`}
                 >
                   <Text className={`font-medium ${timeFormat === '24h' ? 'text-white' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>24h</Text>
                 </TouchableOpacity>
              </View>

              {/* Time Picker */}
              <View className="flex-row justify-center items-center gap-4 mb-8 h-[150px]">
                 <WheelPicker 
                   data={timeFormat === '12h' ? Array.from({length: 12}, (_, i) => i + 1) : Array.from({length: 24}, (_, i) => i)} 
                   selectedValue={tempHour} 
                   onValueChange={setTempHour}
                 />
                 <Text className={`text-3xl font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>:</Text>
                 <WheelPicker 
                   data={Array.from({length: 60}, (_, i) => i)} 
                   selectedValue={tempMinute} 
                   onValueChange={setTempMinute}
                 />
                 {timeFormat === '12h' && (
                   <>
                     <View className="w-2" />
                     <WheelPicker 
                       data={['AM', 'PM']} 
                       selectedValue={tempAmPm} 
                       onValueChange={setTempAmPm} 
                     />
                   </>
                 )}
              </View>

              {/* Footer Actions */}
              <View className="flex-row gap-4">
                 <TouchableOpacity 
                    className={`flex-1 py-3 rounded-xl items-center ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                    onPress={() => setTimeFormatModalVisible(false)}
                 >
                    <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                    className="flex-1 py-3 rounded-xl items-center bg-[#7EA6E0]"
                    onPress={handleTimeSave}
                 >
                    <Text className="font-semibold text-white">Done</Text>
                 </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* Date Settings Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={dateModalVisible}
          onRequestClose={() => setDateModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/80">
            <View className={`w-[90%] rounded-3xl p-6 shadow-2xl relative ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
              
              <CalendarPicker 
                selectedDate={tempDate} 
                onDateChange={setTempDate}
              />

              {/* Format Selector */}
               <View className="mt-6 flex-row items-center justify-between bg-slate-500/10 p-3 rounded-xl">
                 <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Format</Text>
                 <TouchableOpacity onPress={cycleDateFormat}>
                    <Text className={`font-medium ${isDarkMode ? 'text-[#7EA6E0]' : 'text-[#7EA6E0]'}`}>
                      {getDateFormatPreview(dateFormat, tempDate)}
                    </Text>
                  </TouchableOpacity>
               </View>

              {/* Footer Actions */}
              <View className="flex-row gap-4 mt-6">
                 <TouchableOpacity 
                    className={`flex-1 py-3 rounded-xl items-center ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                    onPress={() => setDateModalVisible(false)}
                 >
                    <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                    className="flex-1 py-3 rounded-xl items-center bg-[#7EA6E0]"
                    onPress={handleDateSave}
                 >
                    <Text className="font-semibold text-white">Done</Text>
                 </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

        {/* Premium Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-[85%] bg-[#0EA5E9] rounded-3xl p-6 items-center shadow-lg relative overflow-hidden">
              
              {/* Badge Icon */}
              <View className="items-center mb-2">
                 <MaterialCommunityIcons name="certificate-outline" size={50} color="white" />
              </View>

              {/* Title */}
              <Text className="text-white text-2xl font-bold mb-1">
                Premium Feature!
              </Text>

              {/* Subtitle */}
              <Text className="text-white/90 text-sm mb-6 font-medium">
                Only premium user can use this feature
              </Text>

              {/* Discover Button */}
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => {
                  setModalVisible(false);
                  router.push('/PremiumPackageScreen');
                }}
                className="bg-white px-8 py-3 rounded-xl shadow-sm"
              >
                <Text className="text-[#0EA5E9] font-bold text-base">
                  Discover
                </Text>
              </TouchableOpacity>
              
              {/* Close Button (Optional UX improvement) */}
               <TouchableOpacity 
                className="absolute top-4 right-4"
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

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
                value={showPhoneDialer}
                onValueChange={setShowPhoneDialer}
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
                value={showCameraIcon}
                onValueChange={setShowCameraIcon}
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
              <TouchableOpacity 
                className="rounded-full bg-[#7EA6E0] px-3 py-1"
                onPress={() => setTimeFormatModalVisible(true)}
              >
                <Text className="text-sm text-white">
                  {timeFormat === '12h' ? `12h (${getCurrentDisplayTime()})` : `24h (${getCurrentDisplayTime()})`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Format */}
            <View className="flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Date Format
              </Text>
              <TouchableOpacity 
                className="rounded-full bg-[#7EA6E0] px-3 py-1"
                onPress={() => setDateModalVisible(true)}
              >
                <Text className="text-sm text-white">{getDateFormatPreview(dateFormat)}</Text>
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