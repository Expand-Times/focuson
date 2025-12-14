import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  TextInput,
  Modal,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorContext, AVAILABLE_WALLPAPERS, ColorContext } from './context/ColorContext';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignInWithGoogle from './SignInWithGoogle';
import { openPlayStoreForRating } from './lib/rateApp';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const ITEM_SIZE = width * 0.1
const SIZE = width * 0.08;
type ColorOptionProps = {
  color: string;
  onPress: () => void;
  isPremium?: boolean;
  isSelected?: boolean;
  isDarkMode?: boolean;
};
// Define type for user metadata
type UserMetadata = {
  picture?: string;
  full_name?: string;
  email?: string;
};
// Define type for user object
type UserObject = {
  user?: {
    user_metadata?: UserMetadata;
  };
};
export default function SettingScreen() {
  const router = useRouter();
  // State for toggles
  const [alarmClock, setAlarmClock] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [homeWallpaper, setHomeWallpaper] = useState(true);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'goal'>('privacy');
  const [modalVisible, setModalVisible] = useState(false);

  const [reminderOption, setReminderOption] = useState('mindful'); // mindful, remind, quit
  const [contactOption, setContactOption] = useState('issue'); // issue, suggestion
  const context = useContext(ColorContext);

  if (!context) {
    throw new Error('ColorContext is not available');
  }
  const {
    isDarkMode,
    toggleDarkMode,
    wallpaper,
    setWallpaper,
    selectedColor,
    setSelectedColor,
    isPremium,
    showPhoneDialer,
    setShowPhoneDialer,
    showCameraIcon,
    setShowCameraIcon,
    timeFormat,
    setTimeFormat,
    toggleTimeFormat,
    dateFormat,
    setDateFormat,
    timeOffset,
    setTimeOffset,
  } = useColorContext();
  // Update state initialization
  const [showSignOut, setShowSignOut] = useState(false);
  const [userAuthInfo, setUserAuthInfo] = useState<UserObject>({});
  const userData = async () => {
    try {
      const data = await AsyncStorage.getItem('userAuthInfo');
      const userDetails = data && data.trim().length ? JSON.parse(data) : {};
      setUserAuthInfo(userDetails);
    } catch {
      setUserAuthInfo({});
    }
  };

  useEffect(() => {
    userData();

    if (userAuthInfo?.user?.user_metadata?.email) {
      setShowSignOut(true);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('userAuthInfo');
      setShowSignOut(false);
      // navigation.navigate('SignInWithGoogle');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

      if (is12HourFormat(timeFormat)) {
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

    if (is12HourFormat(timeFormat)) {
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
  // app issue
  const [selectedOption, setSelectedOption] = useState<'App Issue' | 'Suggestion'>('App Issue');
  // Mailto handler function
  const handleEmailPress = () => {
    const email = 'info@expandtimes.com';
    const subject = 'MinimalLife: ' + selectedOption;
    const body = 'Hello, I wanted to discuss...';

    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url).catch((err) => console.error('Failed to open email client:', err));
  };

  const ITEM_HEIGHT = 50;

  const WheelPicker = ({
    data,
    selectedValue,
    onValueChange,
  }: {
    data: (string | number)[];
    selectedValue: string | number;
    onValueChange: (val: any) => void;
  }) => {
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
          className={`absolute top-[50px] h-[50px] w-full border-b border-t ${isDarkMode ? 'border-slate-600' : 'border-slate-200'} bg-slate-500/10`}
        />
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
              <Text
                className={`text-2xl font-bold ${item === selectedValue ? (isDarkMode ? 'text-white' : 'text-slate-800') : isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
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
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          initialScrollIndex={data.indexOf(selectedValue) !== -1 ? data.indexOf(selectedValue) : 0}
        />
      </View>
    );
  };

  const CalendarPicker = ({
    selectedDate,
    onDateChange,
  }: {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
  }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));

    useEffect(() => {
      setViewDate(new Date(selectedDate));
    }, []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
        <View className="mb-6 flex-row items-center justify-between px-2">
          <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={isDarkMode ? '#E2E8F0' : '#475569'}
            />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {monthNames[month]} {year}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
              color={isDarkMode ? '#E2E8F0' : '#475569'}
            />
          </TouchableOpacity>
        </View>

        <View className="mb-4 flex-row justify-between">
          {weekDays.map((day) => (
            <Text
              key={day}
              className={`w-[14%] text-center text-xs font-bold tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {day}
            </Text>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} className="aspect-square w-[14%]" />;
            }

            const isSelected =
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === month &&
              selectedDate.getFullYear() === year;
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <TouchableOpacity
                key={day}
                className="mb-2 aspect-square w-[14%] items-center justify-center"
                onPress={() => {
                  const newDate = new Date(year, month, day);
                  onDateChange(newDate);
                }}>
                <View
                  className={`h-9 w-9 items-center justify-center rounded-full ${isSelected ? 'bg-[#7EA6E0]' : isToday ? 'border border-[#7EA6E0]' : ''}`}>
                  <Text
                    className={`text-base font-medium ${isSelected ? 'text-white' : isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
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

  const cycleTimeFormat = () => {
    const formats = ['HH:MM', 'HH:MM PM', 'HH:MM:SS', 'HH:MM:SS PM'];
    // Normalize current format if it's legacy
    let current = timeFormat;
    if (timeFormat === '12h') current = 'HH:MM PM';
    if (timeFormat === '24h') current = 'HH:MM';

    const currentIndex = formats.indexOf(current);
    const nextIndex = (currentIndex + 1) % formats.length;
    setTimeFormat(formats[nextIndex]);
  };

  const is12HourFormat = (format: string) => {
    return format === '12h' || format.includes('PM');
  };

  const cycleDateFormat = () => {
    const formats = [
      'DD:MM:YYYY',
      'DD:MM:YY',
      'MM:DD:YYYY',
      'MM:DD:YY',
      'DD:Mon:YYYY',
      'Mon:DD:YYYY',
    ];
    const currentIndex = formats.indexOf(dateFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    setDateFormat(formats[nextIndex]);
  };

  const getDateFormatPreview = (format: string, date?: Date) => {
    const now = date || new Date(Date.now() + (timeOffset || 0));
    const d = now.getDate();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const yy = y.toString().slice(-2);
    const mon = now.toLocaleString('en-US', { month: 'short' });

    const z = (n: number) => n.toString().padStart(2, '0');

    switch (format) {
      case 'DD:MM:YYYY':
        return `${z(d)}:${z(m)}:${y}`;
      case 'DD:MM:YY':
        return `${z(d)}:${z(m)}:${yy}`;
      case 'MM:DD:YYYY':
        return `${z(m)}:${z(d)}:${y}`;
      case 'MM:DD:YY':
        return `${z(m)}:${z(d)}:${yy}`;
      case 'DD:Mon:YYYY':
        return `${z(d)} ${mon} ${y}`;
      case 'Mon:DD:YYYY':
        return `${mon} ${z(d)}, ${y}`;
      // Legacy support
      case 'weekday, day month year':
        return now.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      case 'day month year':
        return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      case 'day/month/year':
        return now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      case 'month/day/year':
        return now.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      case 'year-month-day':
        return now.toISOString().split('T')[0];
      default:
        return format;
    }
  };

  // Define theme colors
  const freeColors = ['#3580FF', '#27282A', '#20BAD9'];
  const premiumColors = ['#F2247A', '#29CC5F', '#F2C66D', '#7441D9', '#E58439'];
  const handleThemeSelect = (color: string) => {
    if (freeColors.includes(color) || isPremium) {
      setSelectedColor(color);
    } else {
      setModalVisible(true);
    }
  };

  const getCurrentDisplayTime = () => {
    const now = new Date(Date.now() + (timeOffset || 0));
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const z = (n: number) => n.toString().padStart(2, '0');

    // Normalize legacy formats
    let currentFormat = timeFormat;
    if (timeFormat === '12h') currentFormat = 'HH:MM PM';
    if (timeFormat === '24h') currentFormat = 'HH:MM';

    if (currentFormat === 'HH:MM') {
      return `${z(h)}:${z(m)}`;
    }
    if (currentFormat === 'HH:MM PM') {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${z(h12)}:${z(m)} ${ampm}`;
    }
    if (currentFormat === 'HH:MM:SS') {
      return `${z(h)}:${z(m)}:${z(s)}`;
    }
    if (currentFormat === 'HH:MM:SS PM') {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${z(h12)}:${z(m)}:${z(s)} ${ampm}`;
    }

    // Fallback
    if (timeFormat === '12h')
      return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#EBF1F7]'}`}>
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
          onRequestClose={() => setTimeFormatModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/80">
            <View
              className={`relative w-[90%] rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
              <Text
                className={`mb-6 text-center text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Set Time
              </Text>

              {/* Format Selector */}
              <View className="mb-8 w-full flex-row items-center justify-between rounded-xl bg-slate-500/10 p-3">
                <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Format
                </Text>
                <TouchableOpacity onPress={cycleTimeFormat}>
                  <Text
                    className={`font-medium ${isDarkMode ? 'text-[#7EA6E0]' : 'text-[#7EA6E0]'}`}>
                    {timeFormat === '12h'
                      ? 'HH:MM PM'
                      : timeFormat === '24h'
                        ? 'HH:MM'
                        : timeFormat}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time Picker */}
              <View className="mb-8 h-[150px] flex-row items-center justify-center gap-4">
                <WheelPicker
                  data={
                    is12HourFormat(timeFormat)
                      ? Array.from({ length: 12 }, (_, i) => i + 1)
                      : Array.from({ length: 24 }, (_, i) => i)
                  }
                  selectedValue={tempHour}
                  onValueChange={setTempHour}
                />
                <Text
                  className={`text-3xl font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                  :
                </Text>
                <WheelPicker
                  data={Array.from({ length: 60 }, (_, i) => i)}
                  selectedValue={tempMinute}
                  onValueChange={setTempMinute}
                />
                {is12HourFormat(timeFormat) && (
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
                  className={`flex-1 items-center rounded-xl py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                  onPress={() => setTimeFormatModalVisible(false)}>
                  <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl bg-[#7EA6E0] py-3"
                  onPress={handleTimeSave}>
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
          onRequestClose={() => setDateModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/80">
            <View
              className={`relative w-[90%] rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
              <CalendarPicker selectedDate={tempDate} onDateChange={setTempDate} />

              {/* Format Selector */}
              <View className="mt-6 flex-row items-center justify-between rounded-xl bg-slate-500/10 p-3">
                <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Format
                </Text>
                <TouchableOpacity onPress={cycleDateFormat}>
                  <Text
                    className={`font-medium ${isDarkMode ? 'text-[#7EA6E0]' : 'text-[#7EA6E0]'}`}>
                    {getDateFormatPreview(dateFormat, tempDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer Actions */}
              <View className="mt-6 flex-row gap-4">
                <TouchableOpacity
                  className={`flex-1 items-center rounded-xl py-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                  onPress={() => setDateModalVisible(false)}>
                  <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl bg-[#7EA6E0] py-3"
                  onPress={handleDateSave}>
                  <Text className="font-semibold text-white">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Info Modal (Privacy / Goal) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={infoModalVisible}
          onRequestClose={() => setInfoModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/80">
            <View
              className={`relative max-h-[80%] w-[90%] rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
              <Text
                className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {infoModalType === 'privacy' ? 'Privacy Policy' : 'Our Goal'}
              </Text>

              <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
                <Text
                  className={`text-base leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {infoModalType === 'privacy' ? (
                    <>
                      Your privacy is important to us. It is Minimal Life's policy to respect your
                      privacy regarding any information we may collect from you across our
                      application.
                      {'\n\n'}
                      We only ask for personal information when we truly need it to provide a
                      service to you. We collect it by fair and lawful means, with your knowledge
                      and consent.
                      {'\n\n'}
                      We don't share any personally identifying information publicly or with
                      third-parties, except when required to by law.
                      {'\n\n'}
                      Our app may link to external sites that are not operated by us. Please be
                      aware that we have no control over the content and practices of these sites,
                      and cannot accept responsibility or liability for their respective privacy
                      policies.
                    </>
                  ) : (
                    <>
                      Our goal is to help you reduce digital distractions and focus on what truly
                      matters in your life.
                      {'\n\n'}
                      We believe that technology should serve us, not the other way around. By
                      providing a clean, minimal interface, we hope to encourage mindfulness and
                      intentionality in your daily smartphone usage.
                      {'\n\n'}
                      Thank you for being a part of our journey towards a simpler, more focused
                      life.
                    </>
                  )}
                </Text>
              </ScrollView>

              <TouchableOpacity
                className="w-full items-center rounded-xl bg-[#7EA6E0] py-3"
                onPress={() => setInfoModalVisible(false)}>
                <Text className="font-semibold text-white">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Premium Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="relative w-[85%] items-center overflow-hidden rounded-3xl bg-[#0EA5E9] p-6 shadow-lg">
              {/* Badge Icon */}
              <View className="mb-2 items-center">
                <MaterialCommunityIcons name="certificate-outline" size={50} color="white" />
              </View>

              {/* Title */}
              <Text className="mb-1 text-2xl font-bold text-white">Premium Feature!</Text>

              {/* Subtitle */}
              <Text className="mb-6 text-sm font-medium text-white/90">
                Only premium user can use this feature
              </Text>

              {/* Discover Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setModalVisible(false);
                  router.push('/PremiumPackageScreen');
                }}
                className="rounded-xl bg-white px-8 py-3 shadow-sm">
                <Text className="text-base font-bold text-[#0EA5E9]">Discover</Text>
              </TouchableOpacity>

              {/* Close Button (Optional UX improvement) */}
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setModalVisible(false)}>
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowPhoneDialer(!showPhoneDialer)}
                className="justify-center rounded-full px-[2px]"
                style={{
                  width: 45,
                  height: 25,
                  backgroundColor: showPhoneDialer
                    ? selectedColor || '#4CAF50'
                    : isDarkMode
                      ? '#4B5563'
                      : '#E2E8F0',
                }}>
                <View
                  className="h-[21px] w-[21px] rounded-full bg-white shadow-sm"
                  style={{
                    alignSelf: showPhoneDialer ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Camera Icon */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Camera icon
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowCameraIcon(!showCameraIcon)}
                className="justify-center rounded-full px-[2px]"
                style={{
                  width: 45,
                  height: 25,
                  backgroundColor: showCameraIcon
                    ? selectedColor || '#4CAF50'
                    : isDarkMode
                      ? '#4B5563'
                      : '#E2E8F0',
                }}>
                <View
                  className="h-[21px] w-[21px] rounded-full bg-white shadow-sm"
                  style={{
                    alignSelf: showCameraIcon ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Alarm Clock */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Alarm Clock icon
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAlarmClock(!alarmClock)}
                className="justify-center rounded-full px-[2px]"
                style={{
                  width: 45,
                  height: 25,
                  backgroundColor: alarmClock
                    ? selectedColor || '#4CAF50'
                    : isDarkMode
                      ? '#4B5563'
                      : '#E2E8F0',
                }}>
                <View
                  className="h-[21px] w-[21px] rounded-full bg-white shadow-sm"
                  style={{
                    alignSelf: alarmClock ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Time Format */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Time Format
              </Text>
              <TouchableOpacity
                className="rounded-full bg-[#7EA6E0] px-3 py-1"
                onPress={() => setTimeFormatModalVisible(true)}>
                <Text className="text-sm text-white">{getCurrentDisplayTime()}</Text>
              </TouchableOpacity>
            </View>

            {/* Date Format */}
            <View className="flex-row items-center justify-between">
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Date Format
              </Text>
              <TouchableOpacity
                className="rounded-full bg-[#7EA6E0] px-3 py-1"
                onPress={() => setDateModalVisible(true)}>
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setHomeWallpaper(!homeWallpaper)}
                className="justify-center rounded-full px-[2px]"
                style={{
                  width: 45,
                  height: 25,
                  backgroundColor: homeWallpaper
                    ? selectedColor || '#4CAF50'
                    : isDarkMode
                      ? '#4B5563'
                      : '#E2E8F0',
                }}>
                <View
                  className="h-[21px] w-[21px] rounded-full bg-white shadow-sm"
                  style={{
                    alignSelf: homeWallpaper ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Select Wallpaper */}
            {homeWallpaper && (
              <>
                <Text
                  className={`mb-2 text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Select
                </Text>
                <View className="mb-4 flex-row gap-1">
                  {AVAILABLE_WALLPAPERS.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setWallpaper(item)}
                      style={{
                        width: ITEM_SIZE,
                        height: ITEM_SIZE,
                        borderRadius: 8,
                        borderWidth: wallpaper === item ? 2 : 1,
                        borderColor: wallpaper === item ? '#7EA6E0' : '#E2E8F0',
                        overflow: 'hidden',
                      }}>
                      {typeof item === 'string' ? (
                        <View style={{ backgroundColor: item, width: '100%', height: '100%' }} />
                      ) : (
                        <Image
                          source={item}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

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
              <View className="flex-row gap-2 items-center justify-center">
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
            {/* signout */}
            <View className="mb-2 rounded-xl shadow">
              {/* Header Row with Chevron */}
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-xl p-4"
                onPress={() => setShowSignOut(!showSignOut)} // Toggle show/hide
              >
                <View className="flex-row items-center">
                  <View
                    className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${isDarkMode ? 'bg-[#1F1F1F]' : 'bg-[#F1F5FF]'}`}>
                    <Image
                      source={require('../assets/images/11.png')}
                      className="h-6 w-6 rounded-sm"
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    allowFontScaling={false}
                    className={`text-base ${isDarkMode ? 'text-[#EBF2F0]' : 'text-[#2B2D42]'}`}>
                    Sign Out
                  </Text>
                </View>

                <Ionicons
                  name={showSignOut ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isDarkMode ? '#AAB2B0' : '#DFDFDF'}
                />
              </TouchableOpacity>

              {/* Conditional Section: Sign Out or Sign In */}
              {showSignOut &&
                (userAuthInfo?.user?.user_metadata?.email ? (
                  // User is logged in → show Sign Out button
                  <TouchableOpacity
                    onPress={handleSignOut}
                    className={`mx-8 mt-4 items-center justify-center rounded-full py-3 shadow-lg ${isDarkMode ? 'bg-[#637E99]' : 'bg-white'}`}
                    style={{
                      shadowColor: '#4A90E2',
                      shadowOffset: { width: 0, height: 5 },
                      shadowOpacity: 0.15,
                      shadowRadius: 20,
                      elevation: 10,
                    }}>
                    <Text
                      allowFontScaling={false}
                      className="text-base font-medium text-gray-700"
                      style={{ lineHeight: 20 }}>
                      Sign Out
                    </Text>
                  </TouchableOpacity>
                ) : (
                  // User is not logged in → show Sign In with Google
                  <SignInWithGoogle />
                ))}
            </View>

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
            <TouchableOpacity
              className="flex-1 items-center border-r border-slate-200"
              onPress={() => {
                setInfoModalType('privacy');
                setInfoModalVisible(true);
              }}>
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center"
              onPress={() => {
                setInfoModalType('goal');
                setInfoModalVisible(true);
              }}>
              <Text className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Our Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View
          className={`mt-4 rounded-lg p-4 shadow-md ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-[#E3E8F1]'}`}>
          <View
            className={`flex-row justify-around border-b pb-3 ${isDarkMode ? 'border-[#121212]' : 'border-[#FFFFFF]'}`}>
            {['App Issue', 'Suggestion'].map((option) => {
              const value = option === 'App Issue' ? 'issue' : 'suggestion';
              const isSelected = contactOption === value;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setContactOption(value)}
                  className="flex-row items-center">
                  <MaterialCommunityIcons
                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                    size={18}
                    color={isSelected ? (isDarkMode ? '#637E99' : selectedColor) : '#8D99AE'}
                  />
                  <Text
                    className={`ml-2 text-sm ${isDarkMode ? 'text-[#9CA3AF]' : 'text-[#2B2D42]'}`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Contact Us button centered */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEmailPress}
            className={`mx-8 mt-12 items-center justify-center rounded-full py-3 shadow-lg ${isDarkMode ? 'bg-[#637E99]' : ''}`}
            style={!isDarkMode ? { backgroundColor: selectedColor } : {}}>
            <Text className={`text-sm font-medium ${isDarkMode ? 'text-black' : 'text-white'}`}>
              Contact Us
            </Text>
          </TouchableOpacity>

          <Text
            className={`mt-3 text-center text-xs ${isDarkMode ? 'text-[#9CA3AF]' : 'text-[#8D99AE]'}`}>
            Please let us know any issue or suggestion.
            {'\n'}Our dedicated developers are ready to fix your issue ASAP.
          </Text>
        </View>

        {/* Rate on Google Play */}
        <TouchableOpacity
          onPress={openPlayStoreForRating}
          className="mb-6 mt-6 w-full items-center rounded-xl bg-[#7EA6E0] py-3.5 shadow-sm">
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
const ColorOption = ({
  color,
  onPress,
  isPremium = false,
  isSelected = false,
  isDarkMode = false,
}: ColorOptionProps) => (
  <TouchableOpacity onPress={onPress} className="items-center justify-center">
    <View
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: color,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected
          ? isDarkMode
            ? 'gray'
            : '#3B82F6'
          : isDarkMode
          ? '#FFFFFF'
          : '#3B82F6',
        position: 'relative',
      }}
    >
      {isPremium && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: SIZE * 0.4,
            height: SIZE * 0.4,
            borderRadius: (SIZE * 0.4) / 2,
            backgroundColor: '#F59E0B',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="lock-closed" size={SIZE * 0.22} color="white" />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

