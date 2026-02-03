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
  Pressable,
  BackHandler,
  useColorScheme,
  Animated,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as IntentLauncher from 'expo-intent-launcher';
import { useColorContext, AVAILABLE_WALLPAPERS, ColorContext } from './context/ColorContext';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignInWithGoogle from './SignInWithGoogle';
import { openPlayStoreForRating } from './lib/rateApp';
import { Dimensions } from 'react-native';
import { StatusBar } from 'react-native';
const { width } = Dimensions.get('window');
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ITEM_SIZE = width * 0.047;
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
  const scrollX = useRef(new Animated.Value(0)).current;
  // State for toggles
  const [alarmClock, setAlarmClock] = useState(false);
  const [showMore, setShowMore] = useState(true);
  const [showAbout, setShowAbout] = useState(true);
  const [showThemes, setShowThemes] = useState(false);
  const [homeWallpaper, setHomeWallpaper] = useState(true);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'goal'>('privacy');
  const [modalVisible, setModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

  const [reminderOption, setReminderOption] = useState('mindful'); // mindful, remind, quit
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadReminderOption();
  }, []);

  const loadReminderOption = async () => {
    try {
      const stored = await AsyncStorage.getItem('reminderOption');
      if (stored) {
        setReminderOption(stored);
      } else {
        setReminderOption('remind');
      }
    } catch (e) {
      console.error('Failed to load reminder option', e);
    }
  };

  const handleSetReminderOption = async (option: string) => {
    setReminderOption(option);
    try {
      await AsyncStorage.setItem('reminderOption', option);
    } catch (e) {
      console.error('Failed to save reminder option', e);
    }
  };

  const openDeviceSettings = () => {
    if (Platform.OS === 'android') {
      IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SETTINGS);
    } else {
      Linking.openSettings();
    }
  };

  const handleRecommend = async () => {
    try {
      await Share.share({
        message: 'I\'m using MinimalLife. Really helps reducing screen time and mobile addiction. I\'ll say It\'s one of the must have app. Check out: https://play.google.com/store/apps/developer?id=Expand+Times+IT&hl=en',
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const [contactOption, setContactOption] = useState('issue'); // issue, suggestion
  const context = useContext(ColorContext);

  if (!context) {
    throw new Error('ColorContext is not available');
  }
  const {
    isDarkMode,
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
    showStatusBar,
    setShowStatusBar,
    showUsageInfo,
    setShowUsageInfo,
  } = useColorContext();

  const THEME_DATA = [
    { id: 0, img: require('../assets/Themes/1.jpg'), wallpaperIndex: 0, name: 'Pitch Black' },
    { id: 1, img: require('../assets/Themes/2.jpg'), wallpaperIndex: 1, name: 'Clean White' },
    { id: 2, img: require('../assets/Themes/3.jpg'), wallpaperIndex: 2, name: 'Desert Dusk' },
    { id: 3, img: require('../assets/Themes/4.jpg'), wallpaperIndex: 3, name: 'Desert Dusk' },
    { id: 4, img: require('../assets/Themes/5.jpg'), wallpaperIndex: 4, name: 'Neon City' },
    { id: 5, img: require('../assets/Themes/6.jpg'), wallpaperIndex: 5, name: 'Midnight Purple' },
    { id: 6, img: require('../assets/Themes/7.jpg'), wallpaperIndex: 6, name: 'Forest Green' },
    { id: 7, img: require('../assets/Themes/8.jpg'), wallpaperIndex: 7, name: 'Ocean Blue' },
    { id: 8, img: require('../assets/Themes/9.jpg'), wallpaperIndex: 8, name: 'Sunset Vibes' },
    { id: 9, img: require('../assets/Themes/10.jpg'), wallpaperIndex: 9, name: 'Minimal Grey' },
    { id: 10, img: require('../assets/Themes/11.jpg'), wallpaperIndex: 10, name: 'Deep Space' },
    { id: 11, img: require('../assets/Themes/12.jpg'), wallpaperIndex: 11, name: 'Mountain Peak' },
    { id: 12, img: require('../assets/Themes/13.jpg'), wallpaperIndex: 12, name: 'Abstract Waves' },
    { id: 13, img: require('../assets/Themes/14.jpg'), wallpaperIndex: 13, name: 'Urban Jungle' },
    { id: 14, img: require('../assets/Themes/15.jpg'), wallpaperIndex: 14, name: 'Calm Water' },
    { id: 15, img: require('../assets/Themes/16.jpg'), wallpaperIndex: 15, name: 'Retro Vibe' },
    { id: 16, img: require('../assets/Themes/17.jpg'), wallpaperIndex: 16, name: 'Dark Matter' },
    { id: 17, img: require('../assets/Themes/18.jpg'), wallpaperIndex: 17, name: 'Golden Hour' },
    { id: 18, img: require('../assets/Themes/19.jpg'), wallpaperIndex: 18, name: 'Golden Hour' },
    { id: 19, img: require('../assets/Themes/20.jpg'), wallpaperIndex: 19, name: 'Golden Hour' },
  ];

  const handleApplyTheme = () => {
    setIsProcessing(true);

    // Apply logic here
    const selectedTheme = THEME_DATA[currentThemeIndex];
    if (selectedTheme) {
      setWallpaper(AVAILABLE_WALLPAPERS[selectedTheme.wallpaperIndex]);
    }

    setTimeout(() => {
      setIsProcessing(false);
      router.push('/home');
      setThemeModalVisible(false);
    }, );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentThemeIndex(viewableItems[0].index);
    }
  }).current;

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

  useEffect(() => {
    const backAction = () => {
      router.replace('/home');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
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
                allowFontScaling={false}
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
          <Text
            allowFontScaling={false}
            className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
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
              allowFontScaling={false}
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
                    allowFontScaling={false}
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

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const mon = monthNames[now.getMonth()];

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
  const freeColors = ['#7EA9E5', '#27282A', '#20BAD9'];
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
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0C121B]' : 'bg-[#EBF1F7]'}`}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
        hidden={!showStatusBar}
      />
      {/* Header */}
      <View
        className={`flex-row items-center justify-between px-4 py-3 ${isDarkMode ? 'bg-[]' : 'bg-[#EBF1F7]'}`}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={isDarkMode ? '#E2E8F0' : '#8698B2'}
          />
        </TouchableOpacity>
        <Text
          allowFontScaling={false}
          className={`text-[18px] font-bold ${isDarkMode ? 'text-white' : '#2E3B4D'}`}>
          Settings
        </Text>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="magnify"
            size={26}
            color={isDarkMode ? '#94A3B8' : '#8698B2'}
          />
        </TouchableOpacity>
      </View>
      <View className="border-b border-[#A3B9D940]"></View>
      <ScrollView
        className="flex-1"
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
                allowFontScaling={false}
                className={`mb-6 text-center text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Time Format
              </Text>

              {/* Format Selector */}
              <View className="mb-8 w-full flex-row items-center justify-between rounded-xl bg-slate-500/10 p-3">
                <Text
                  allowFontScaling={false}
                  className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Format
                </Text>
                <TouchableOpacity onPress={cycleTimeFormat}>
                  <Text
                    allowFontScaling={false}
                    className={`font-medium ${isDarkMode ? 'text-[#7EA6E0]' : 'text-[#7EA6E0]'}`}>
                    {getCurrentDisplayTime()}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer Actions */}
              <View className="flex-row gap-4">
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl bg-[#7EA6E0] py-3"
                  onPress={() => setTimeFormatModalVisible(false)}>
                  <Text allowFontScaling={false} className="font-semibold text-white">
                    Done
                  </Text>
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
              <Text
                allowFontScaling={false}
                className={`mb-6 text-center text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Date Format
              </Text>

              {/* Format Selector */}
              <View className="mb-8 w-full flex-row items-center justify-between rounded-xl bg-slate-500/10 p-3">
                <Text
                  allowFontScaling={false}
                  className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Format
                </Text>
                <TouchableOpacity onPress={cycleDateFormat}>
                  <Text
                    allowFontScaling={false}
                    className={`font-medium ${isDarkMode ? 'text-[#7EA6E0]' : 'text-[#7EA6E0]'}`}>
                    {getDateFormatPreview(dateFormat)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer Actions */}
              <View className="flex-row gap-4">
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl bg-[#7EA6E0] py-3"
                  onPress={() => setDateModalVisible(false)}>
                  <Text allowFontScaling={false} className="font-semibold text-white">
                    Done
                  </Text>
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
                allowFontScaling={false}
                className={`mb-4 text-center text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {infoModalType === 'privacy' ? 'Privacy Policy' : 'Our Goal'}
              </Text>

              <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
                <Text
                  allowFontScaling={false}
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
                <Text allowFontScaling={false} className="font-semibold text-white">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Premium Feature Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View
            className="h-full items-center justify-center "
            style={[{ backgroundColor: 'rgba(32, 41, 56, 0.85)' }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setModalVisible(false);
                router.push('/PremiumPackageScreen');
              }}>
              <View
                className=" rounded-full  py-6 shadow-md"
                style={{
                  backgroundColor: selectedColor,
                  width: screenWidth * 0.8,
                  height: screenHeight * 0.1,
                  alignSelf: 'center',
                }}>
                <View className="flex-row items-center justify-center">
                  <View>
                    <Image
                      source={require('../assets/images/PremiumFeature.png')}
                      className="h-[40px] w-[40px]"
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text
                      allowFontScaling={false}
                      className="bottom-3 text-center text-[20px] font-medium tracking-[1px] text-white">
                      Premium Feature!
                    </Text>
                    <Text
                      allowFontScaling={false}
                      className="bottom-2 text-center text-[10px] font-normal tracking-[1px] text-[#C6CEDD]">
                      Only premium user can use this feature
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/PremiumPackageScreen');
                  }}
                  className="bottom-3 mt-4 h-8 self-center rounded-md bg-white px-4">
                  <Text
                    allowFontScaling={false}
                    className="top-2 text-[12px] font-medium tracking-[1px]"
                    style={{ color: selectedColor }}>
                    Discover
                  </Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/* Home Screen Section */}
        <View className="mt-4 px-4">
          <Text
            allowFontScaling={false}
            className={`mb-[5%] mt-[5%] text-[18px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : '#2E3B4D'}`}>
            Home Screen
          </Text>
          {/* phone */}
          <View
            className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-[#FFFFFF]'}`}>
            {/* Phone Dialer */}
            <View className="mb-4 flex-row items-center justify-between mt-[6%]">
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
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
                      : '#A3B9D9',
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
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
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
                      : '#A3B9D9',
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
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
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
                      : '#A3B9D9',
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
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Time Format
              </Text>
              <TouchableOpacity
                className={`rounded-xl px-3 py-2 ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'}`}
                onPress={() => setTimeFormatModalVisible(true)}>
                <Text allowFontScaling={false} className="text-sm text-white">
                  {getCurrentDisplayTime()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Format */}
            <View className="flex-row items-center justify-between mb-[6%]">
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Date Format
              </Text>
              <TouchableOpacity
                className={`rounded-xl ${isDarkMode?'bg-[#7EA9E5]':'bg-[#7EA9E5]'} px-3 py-2`}
                onPress={() => setDateModalVisible(true)}>
                <Text allowFontScaling={false} className="text-sm text-white">
                  {getDateFormatPreview(dateFormat)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Display Section */}
        <View className="mt-6 px-4">
          <Text
            allowFontScaling={false}
            className={`mb-[5%] mt-[5%] text-[18px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
            Display
          </Text>
          <View
            className={`rounded-2xl py-4 shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
            {/* Select Theme Section */}
            <View className="mb-4">
              <Text
                allowFontScaling={false}
                className={`mb-[5%] mt-[6%] px-4 text-[18px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Select Theme
              </Text>
              <TouchableOpacity onPress={() => setThemeModalVisible(true)} className="pl-4">
                <Image
                  source={require('../assets/Themes/group.png')}
                  style={{
                    width: '100%',
                    height: 100,
                   
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>

            {/* Show Status Bar */}
            <View className="mb-[4%] mt-[4%] flex-row items-center justify-between px-4">
              <Text
                allowFontScaling={false}
                className={`text-[16px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Show Status Bar
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowStatusBar(!showStatusBar)}
                className="justify-center rounded-full px-[2px]"
                style={{
                  width: 45,
                  height: 25,
                  backgroundColor: showStatusBar
                    ? selectedColor || '#4CAF50'
                    : isDarkMode
                      ? '#4B5563'
                      : '#A3B9D9',
                }}>
                <View
                  className="h-[21px] w-[21px] rounded-full bg-white shadow-sm"
                  style={{
                    alignSelf: showStatusBar ? 'flex-end' : 'flex-start',
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Show Usage Info */}
            <View className="mb-[6%] flex-row items-center justify-between px-4">
              <Text
                allowFontScaling={false}
                className={`text-[16px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Show Usage Info
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowUsageInfo(!showUsageInfo)}
                className="justify-center rounded-full px-[2px]"
                style={{
                  width: 45,
                  height: 25,
                  backgroundColor: showUsageInfo // Replace with actual state
                    ? selectedColor || '#4CAF50'
                    : isDarkMode
                      ? '#4B5563'
                      : '#A3B9D9',
                }}>
                <View
                  className="h-[21px] w-[21px] rounded-full bg-white shadow-sm"
                  style={{
                    alignSelf: showUsageInfo ? 'flex-end' : 'flex-start', // Replace with actual state
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* In-app time reminder */}
        <View className="mt-6 px-4">
          <Text
            allowFontScaling={false}
            className={`mb-[5%] mt-[5%] text-[18px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
            In-app time reminder
          </Text>
          <View className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
            <Text
              allowFontScaling={false}
              className={`mb-[2%] mt-[6%] px-2 text-[16px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
              When time is over (Set Default)
            </Text>

            <View className=" ml-[5%]">
              <TouchableOpacity
                className="mb-[4%] flex-row items-center"
                onPress={() => handleSetReminderOption('mindful')}>
                <MaterialCommunityIcons
                  name={reminderOption === 'mindful' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={25}
                  color={isDarkMode ? "#DBDFE5":"#5C8BCC"}
                />
                <Text
                  allowFontScaling={false}
                  className={`font-regular ml-2 text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#858E9D]'}`}>
                  Mindful delay{' '}
                  <Text allowFontScaling={false} className="text-[12px]">
                    (coming soon)
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-[4%] flex-row items-center"
                onPress={() => handleSetReminderOption('remind')}>
                <MaterialCommunityIcons
                  name={reminderOption === 'remind' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={25}
                  color={isDarkMode ? "#DBDFE5":"#5C8BCC"}
                />
                <Text
                  allowFontScaling={false}
                  className={`font-regular ml-2 text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Remind Me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center mb-[6%]"
                onPress={() => handleSetReminderOption('quit')}>
                <MaterialCommunityIcons
                  name={reminderOption === 'quit' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={25}
                  color={isDarkMode ? "#DBDFE5":"#5C8BCC"}
                />
                <Text
                  allowFontScaling={false}
                  className={`font-regular ml-2 text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Quit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* More */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center justify-between">
            <Text
              allowFontScaling={false}
              className={`mb-[5%] mt-[5%] text-[18px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-slate-700'}`}>
              More
            </Text>
            <TouchableOpacity onPress={() => setShowMore(!showMore)}>
              <MaterialCommunityIcons
                name={showMore ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={isDarkMode ? "#728099" :"#89A2CA"}
              />
            </TouchableOpacity>
          </View>

          {showMore && (
            <View
              className={`rounded-2xl mb-[4%] mt-[4%] p-4 shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
              {/* signout */}
              <View className="mb-2 rounded-xl ">
                {/* Header Row with Chevron */}
                <TouchableOpacity
                  className="flex-row items-center justify-between mt-[6%]"
                  onPress={() => setShowSignOut(!showSignOut)} // Toggle show/hide
                >
                  <View className="flex-row items-center">
                    {/* <View
                      className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${isDarkMode ? 'bg-[#1F1F1F]' : 'bg-[#F1F5FF]'}`}>
                      <Ionicons
                        name="log-out-outline"
                        size={24}
                        color={isDarkMode ? '#EBF2F0' : '#2B2D42'}
                      />
                    </View> */}
                    <Text
                      allowFontScaling={false}
                      className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2B2D42]'}`}>
                      Sign Out
                    </Text>
                  </View>

                  <Ionicons
                    name={showSignOut ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isDarkMode ? '#728099' : '#DFDFDF'}
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
                <Text
                  allowFontScaling={false}
                  className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Free Version
                </Text>
                <TouchableOpacity className={`rounded-xl ${isDarkMode ? 'bg-[#7FA8E5]' : 'bg-[#7EA9E5]'} px-4 py-2`}>
                  <Text
                    allowFontScaling={false}
                    className={`font-regular text-[12px] ${isDarkMode ? 'text-[#0C121B]' : 'text-white'}`}>
                    Check Premium
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="py-2 mb-[6%]"
                onPress={handleRecommend}>
                <Text
                  allowFontScaling={false}
                  className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Recommend to F&F
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* About Minimal Life */}
        <View className="mt-6 px-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text
              allowFontScaling={false}
              className={`mb-[5%] mt-[5%] text-[18px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
              About{' '}
              <Text allowFontScaling={false} className="text-[18px] font-semibold ">
                Minimal Life
              </Text>
            </Text>
            <TouchableOpacity onPress={() => setShowAbout(!showAbout)}>
              <MaterialCommunityIcons
                name={showAbout ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={isDarkMode ? "#728099" : "#7EA6E0"}
              />
            </TouchableOpacity>
          </View>

          {showAbout && (
            <View
              className={`flex-row items-center justify-center rounded-2xl py-8  shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
              <TouchableOpacity
                className="flex-1 items-center border-r border-[#728099] mt-[6%] mb-[6%]"
                onPress={() => {
                  setInfoModalType('privacy');
                  setInfoModalVisible(true);
                }}>
                <Text
                  allowFontScaling={false}
                  className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center mt-[6%] mb-[6%]"
                onPress={() => {
                  setInfoModalType('goal');
                  setInfoModalVisible(true);
                }}>
                <Text
                  allowFontScaling={false}
                  className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Our Goal
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Support Section */}
        <View
          className={`mx-4 mb-[5%] mt-[10%] rounded-2xl shadow-md ${isDarkMode ? 'bg-[#131B27]' : 'bg-[#FFFFFF]'}`}>
          <View
            className={`mb-[5%] mt-[10%] flex-row justify-around ${isDarkMode ? 'border-[#434C59]' : 'border-[#FFFFFF]'}`}>
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
                    size={24}
                    color={isDarkMode ? '#738099'  : '#5C8BCC'}
                  />
                  <Text
                    allowFontScaling={false}
                    className={`ml-2 text-[15px] ${isSelected ? 'font-bold text-[#DBDFE5]' : ''} ${isDarkMode ? 'text-[#9CA3AF]' : 'text-[#2E3B4D]'}`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {/* border */}
          <View className="border-b border-[#A3B9D940]"></View>

          {/* Contact Us button centered */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEmailPress}
            className={`mx-[20%] mt-[5%] items-center justify-center rounded-full py-5 shadow-lg ${isDarkMode ? 'bg-[#212C40]' : '#7EA9E5'}`}
         >
            <Text
              allowFontScaling={false}
              className={`text-sm font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>
              Contact Us
            </Text>
          </TouchableOpacity>

          <Text
            allowFontScaling={false}
            className={`font-regular mb-[10%] mt-[5%] text-center text-[12px] ${isDarkMode ? 'text-[#8698B2]' : 'text-[#8D99AE]'}`}>
            Please let us know any issue or suggestion.
            {'\n'}Our dedicated developers are ready to fix your issue ASAP.
          </Text>
        </View>

        {/* Rate on Google Play */}
        <TouchableOpacity
          onPress={openPlayStoreForRating}
          className={`mx-[10%] mb-[10%] mt-[10%] items-center rounded-full ${isDarkMode ? 'bg-[#6087BF]':'bg-[#6087BF]'} py-4 shadow-sm`}>
          <Text allowFontScaling={false} className={`font-regular text-[14px] ${isDarkMode ? 'text-[#131B27]':'text-[#FFF]'}`}>
            Rate on Google Play
          </Text>
        </TouchableOpacity>

        {/* Device Setting */}
        <TouchableOpacity
          className="mb-8 flex-row items-center justify-center"
          onPress={openDeviceSettings}>
          <Text
            allowFontScaling={false}
            className={`mr-2 text-[16px] font-semibold ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
            Device Setting
          </Text>
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={isDarkMode ? '#728099' : '#2E3B4D'}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setThemeModalVisible(false)}>
        <SafeAreaView className={`flex-1 bg-white`}>
          {/* Header */}
          <View className="relative mt-4 items-center justify-center">
            <TouchableOpacity
              style={{ position: 'absolute', left: 20, zIndex: 10 }}
              onPress={() => setThemeModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#132C4D" />
            </TouchableOpacity>
            <Text allowFontScaling={false} className={`text-xl font-medium text-[#132C4D]`}>
              {THEME_DATA[currentThemeIndex]?.name || 'Theme'}
            </Text>
          </View>

          {/* Carousel */}
          <View className="flex-1 items-center justify-center">
            <Animated.FlatList
              data={THEME_DATA}
              horizontal
              pagingEnabled={false}
              snapToInterval={width * 0.8} // ITEM_WIDTH + 2 * SPACING
              decelerationRate="fast"
              snapToAlignment="start"
              contentContainerStyle={{
                paddingHorizontal: (width - width * 0.8) / 2,
              }}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
              })}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
              renderItem={({ item, index }) => {
                const ITEM_WIDTH = width * 0.8;
                const SPACING = 0;
                const FULL_SIZE = ITEM_WIDTH + SPACING * 2;

                const inputRange = [
                  (index - 1) * FULL_SIZE,
                  index * FULL_SIZE,
                  (index + 1) * FULL_SIZE,
                ];

                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.9, 1, 0.9],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    style={{
                      width: ITEM_WIDTH,
                      marginHorizontal: SPACING,
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: [{ scale }],
                    }}>
                    <View
                      className={`elevation-10 h-[95%] w-full overflow-hidden rounded-[20px] shadow-2xl ${
                        isDarkMode ? 'bg-[#1E293B]' : 'bg-white'
                      }`}>
                      <Image source={item.img} className="h-full w-full" resizeMode="cover" />
                    </View>
                  </Animated.View>
                );
              }}
            />
          </View>

          {/* Footer Button */}
          <View className="mb-10 w-full items-center px-8">
            <TouchableOpacity
              onPress={handleApplyTheme}
              disabled={isProcessing}
              className={`w-full items-center rounded-2xl bg-[#7EA9E5] py-4 shadow-lg active:opacity-90 ${
                isProcessing ? 'opacity-70' : ''
              }`}>
              <Text allowFontScaling={false} className="font-regular text-[16px] text-white">
                {isProcessing ? 'Processing...' : 'Apply this theme'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Processing Overlay */}
          {isProcessing && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50,
              }}>
              <View className="items-center justify-center rounded-2xl bg-white p-6 shadow-xl">
                <Image
                  source={require('../assets/images/Logo.png')}
                  style={{ width: 80, height: 80, marginBottom: 20 }}
                  resizeMode="contain"
                />
                <ActivityIndicator size="large" color="#7EA9E5" />
                <Text
                  allowFontScaling={false}
                  className="mt-4 text-[16px] font-medium text-[#2E3B4D]">
                  Processing...
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}