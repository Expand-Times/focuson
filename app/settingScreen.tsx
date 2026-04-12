import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  BackHandler,
  Animated,
  ActivityIndicator,
  Platform,
  Share,
  FlatList,
} from 'react-native';
import { useAppContext } from './context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useColorContext, AVAILABLE_WALLPAPERS, ColorContext } from './context/ColorContext';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignInWithGoogle from './SignInWithGoogle';
import { openPlayStoreForRating } from './lib/rateApp';
import { Dimensions } from 'react-native';
import { StatusBar } from 'react-native';
import { openApplication } from 'expo-intent-launcher';
import { BlockedInfoModal } from './components/BlockModals';
import { PremiumModal } from './components/PremiumModal';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
// Custom Switch Component for better performance and custom design
const CustomSwitch = React.memo(({
  value,
  onValueChange,
  activeColor,
  inActiveColor,
  thumbColor = '#FFFFFF',
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
  activeColor: string;
  inActiveColor: string;
  thumbColor?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: localValue ? 20 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [localValue]);

  const handlePress = () => {
    const newValue = !localValue;
    setLocalValue(newValue);
    onValueChange(newValue);
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        style={{
          width: 45,
          height: 25,
          borderRadius: 15,
          backgroundColor: localValue ? activeColor : inActiveColor,
          padding: 2,
          justifyContent: 'center',
        }}>
        <Animated.View
          style={{
            width: 21,
            height: 21,
            borderRadius: 11,
            backgroundColor: thumbColor,
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
          }}
        />
      </View>
    </Pressable>
  );
});

const THEME_DATA = [
  { id: 0, img: require('../assets/Themes/1.jpg'), wallpaperIndex: 0, name: 'Midnight Focus', premium: false },
  { id: 1, img: require('../assets/Themes/2.jpg'), wallpaperIndex: 1, name: 'Cloud Clarity', premium: false },
  { id: 2, img: require('../assets/Themes/3.jpg'), wallpaperIndex: 2, name: 'Arctic Blue', premium: false },
  { id: 3, img: require('../assets/Themes/4.jpg'), wallpaperIndex: 3, name: 'Milky Star', premium: false },
  { id: 4, img: require('../assets/Themes/5.jpg'), wallpaperIndex: 4, name: 'Fluid Glow', premium: true },
  { id: 5, img: require('../assets/Themes/6.jpg'), wallpaperIndex: 5, name: 'Lone Sunset', premium: true },
  { id: 6, img: require('../assets/Themes/7.jpg'), wallpaperIndex: 6, name: 'Twilighty Path', premium: true },
  { id: 7, img: require('../assets/Themes/8.jpg'), wallpaperIndex: 7, name: 'Quiet Waters', premium: true },
  { id: 8, img: require('../assets/Themes/9.jpg'), wallpaperIndex: 8, name: 'Secret Heart', premium: true },
  { id: 9, img: require('../assets/Themes/10.jpg'), wallpaperIndex: 9, name: 'Inner Glow', premium: true },
  { id: 10, img: require('../assets/Themes/11.jpg'), wallpaperIndex: 10, name: 'Zenith Branch', premium: true },
  { id: 11, img: require('../assets/Themes/12.jpg'), wallpaperIndex: 11, name: 'The Alchemist', premium: true },
  { id: 12, img: require('../assets/Themes/13.jpg'), wallpaperIndex: 12, name: 'Sweet Dream', premium: true },
  { id: 13, img: require('../assets/Themes/14.jpg'), wallpaperIndex: 13, name: 'Lov Lovely Break', premium: true },
  { id: 14, img: require('../assets/Themes/15.jpg'), wallpaperIndex: 14, name: 'The Mastermind', premium: true },
  { id: 15, img: require('../assets/Themes/16.jpg'), wallpaperIndex: 15, name: 'Autumn Contrast', premium: true },
  { id: 16, img: require('../assets/Themes/17.jpg'), wallpaperIndex: 16, name: 'Contrast Black', premium: true },
  { id: 17, img: require('../assets/Themes/18.jpg'), wallpaperIndex: 17, name: 'True White', premium: true },
  { id: 18, img: require('../assets/Themes/19.jpg'), wallpaperIndex: 18, name: 'Shadow Mode', premium: true },
  { id: 19, img: require('../assets/Themes/20.png'), wallpaperIndex: 19, name: 'Flourish Firefly', premium: true },
];

export default function SettingScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  // State for toggles
  const [alarmClock, setAlarmClock] = useState(true);
  const [showMore, setShowMore] = useState(true);
  const [showAbout, setShowAbout] = useState(true);
  const [timeFormatModalVisible, setTimeFormatModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'goal'>('privacy');
  const [modalVisible, setModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [hideAppModalVisible, setHideAppModalVisible] = useState(false);

  const [reminderOption, setReminderOption] = useState('quit'); // mindful, remind, quit
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
        setReminderOption('quit');
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

  const handleRecommend = async () => {
    try {
      await Share.share({
        message:
          "I'm using MinimalLife. Really helps reducing screen time and mobile addiction. I'll say It's one of the must have app. Check out: https://play.google.com/store/apps/developer?id=Expand+Times+IT&hl=en",
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
    apps,
    appRenames,
    hiddenApps,
    toggleHideApp,
    isTemporarilyBlocked,
    timedBlocks,
  } = useAppContext();

  const {
    isDarkMode,
    isPremium,
    setWallpaper,
    selectedColor,
    showPhoneDialer,
    setShowPhoneDialer,
    showCameraIcon,
    setShowCameraIcon,
    timeFormat,
    setTimeFormat,
    dateFormat,
    setDateFormat,
    timeOffset,
    showStatusBar,
    setShowStatusBar,
  } = useColorContext();

  const [blockedInfoVisible, setBlockedInfoVisible] = useState(false);
  const [selectedBlockedApp, setSelectedBlockedApp] = useState<{
    label: string;
    icon: string;
    packageName: string;
  } | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  const handleOpenHiddenApp = (pkg: string, app: any) => {
    if (isTemporarilyBlocked(pkg)) {
      setSelectedBlockedApp(app ? {
        label: appRenames[pkg] || app.label,
        icon: app.icon,
        packageName: pkg
      } : {
        label: pkg,
        icon: '',
        packageName: pkg
      });
      setBlockedUntil(timedBlocks[pkg] || null);
      setBlockedInfoVisible(true);
    } else {
      openApplication(pkg);
    }
  };

  const handleApplyTheme = () => {
    const selectedTheme = THEME_DATA[currentThemeIndex];
    const isLocked = !isPremium && selectedTheme?.premium;
    if (isLocked) {
      setModalVisible(true);
      return;
    }
    setIsProcessing(true);

    // Apply logic here
    if (selectedTheme) {
      setWallpaper(AVAILABLE_WALLPAPERS[selectedTheme.wallpaperIndex]);
    }

    setTimeout(() => {
      setIsProcessing(false);
      router.push('/home');
      setThemeModalVisible(false);
    }, 10000);
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
      if (userDetails?.user?.user_metadata?.email) {
        setShowSignOut(true);
      }
    } catch {
      setUserAuthInfo({});
    }
  };

  useEffect(() => {
    userData();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
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

  // app issue
  const [selectedOption] = useState<'App Issue' | 'Suggestion'>('App Issue');
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

  const cycleTimeFormat = () => {
    const formats = ['12h PM', '24h'];
    // Normalize current format if it's legacy
    let current = timeFormat;
    if (timeFormat === 'HH:MM PM' || timeFormat === 'HH:MM:SS PM' || timeFormat === '12h') current = '12h PM';
    if (timeFormat === 'HH:MM' || timeFormat === 'HH:MM:SS') current = '24h';

    const currentIndex = formats.indexOf(current);
    const nextIndex = (currentIndex + 1) % formats.length;
    setTimeFormat(formats[nextIndex]);
  };

  const is12HourFormat = (format: string) => {
    return format.includes('PM');
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

  const getCurrentDisplayTime = () => {
    const now = new Date(Date.now() + (timeOffset || 0));
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const z = (n: number) => n.toString().padStart(2, '0');

    // Normalize legacy formats
    let currentFormat = timeFormat;
    if (timeFormat === 'HH:MM PM' || timeFormat === 'HH:MM:SS PM') currentFormat = '12h PM';
    if (timeFormat === 'HH:MM' || timeFormat === 'HH:MM:SS') currentFormat = '24h';

    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;

    if (currentFormat === '12h' || currentFormat === '12h PM') {
      return `${h12}:${z(m)}${ampm}`;
    }
    if (currentFormat === '24h' || currentFormat === '24h PM') {
      return `${z(h)}:${z(m)}`;
    }

    // Fallback to 24h
    return `${z(h)}:${z(m)}`;
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-[#0C121B]' : 'bg-[#EBF1F7]'} pt-12`}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
        animated={true}
        hidden={!showStatusBar}
      />
      {/* Header */}
      <View
        className={`flex-row items-center px-4 py-3 ${isDarkMode ? 'bg-[]' : 'bg-[#EBF1F7]'}`}>
        <TouchableOpacity onPress={() => router.push('/home')} className="absolute left-4 z-10">
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={isDarkMode ? '#E2E8F0' : '#8698B2'}
          />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text
            allowFontScaling={false}
            className={`text-[18px] font-bold ${isDarkMode ? 'text-white' : 'text-[#2E3B4D]'}`}>
            Settings
          </Text>
        </View>
      </View>
      <View className="border-b border-[#A3B9D940]"></View>
      <ScrollView
        className="flex-"
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
                {infoModalType === 'privacy' ? 'Data Safety' : 'Our Goal'}
              </Text>

              <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
                <Text
                  allowFontScaling={false}
                  className={`text-base leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {infoModalType === 'privacy' ? (
                    <>
                      Focus On: Minimalist Launcher does not collect, share or sell any data. All
                      data is stored only on your device.
                      {'\n\n'}
                      Your privacy is our promise; Your info is sacred. We’ve no action, no
                      intention to collect/share/sell ever.
                      {'\n\n'}
                      Use with 100% confident: your data will always be safe on your device.
                      {'\n\n'}
                      Thank you 💖
                      {'\n\n'}
                     
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
        <PremiumModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          selectedColor={selectedColor}
        />
        
        {/* Profile Section */}
         <View className="mt-4 px-4">
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => !isPremium && router.push('/premium')}>
            <LinearGradient
              colors={
                isPremium
                  ? ['#FFDD33', '#7FDCE5', ] // Gradient for Premium (Yellow to Greenish Teal)
                  : ['#7FDCE5', '#FFFFFF'] // Gradient for Free (Teal to White)
              }
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className="w-full rounded-xl overflow-hidden h-[64px] flex-row items-center justify-between pl-8">
              <Text
                allowFontScaling={false}
                style={isPremium ? { fontFamily: 'Galada_400Regular',color:'#E53834',fontSize:20} : {fontWeight:600}}
                className="text-[18px] text-[#2E3B4D]">
                {isPremium ? 'Premium User' : 'Free Version'}
              </Text>
              <Image
                source={
                  isPremium
                    ? require('../assets/images/Premium_User.png')
                    : require('../assets/images/Free_Version.png')
                }
                className="h-[48px]"
                resizeMode="contain"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Home Screen Section */}
        <View className="mt-4 px-4">
          <Text
            allowFontScaling={false}
            className={`mb-[5%] mt-[5%] text-[18px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
            Home Screen
          </Text>
          {/* phone */}
          <View
            className={`rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-[#FFFFFF]'}`}>
            {/* Phone Dialer */}
            <View className="mb-4 mt-[6%] flex-row items-center justify-between">
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Phone dialer icon
              </Text>
              <CustomSwitch
                value={showPhoneDialer}
                onValueChange={setShowPhoneDialer}
                activeColor={selectedColor || '#4CAF50'}
                inActiveColor={isDarkMode ? '#4B5563' : '#A3B9D9'}
              />
            </View>

            {/* Camera Icon */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Camera icon
              </Text>
              <CustomSwitch
                value={showCameraIcon}
                onValueChange={setShowCameraIcon}
                activeColor={selectedColor || '#4CAF50'}
                inActiveColor={isDarkMode ? '#4B5563' : '#A3B9D9'}
              />
            </View>

            {/* Alarm Clock */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Alarm Clock icon
              </Text>
              <CustomSwitch
                value={alarmClock}
                onValueChange={setAlarmClock}
                activeColor={selectedColor || '#4CAF50'}
                inActiveColor={isDarkMode ? '#4B5563' : '#A3B9D9'}
              />
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
            <View className="mb-[6%] flex-row items-center justify-between">
              <Text
                allowFontScaling={false}
                className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Date Format
              </Text>
              <TouchableOpacity
                className={`rounded-xl ${isDarkMode ? 'bg-[#7EA9E5]' : 'bg-[#7EA9E5]'} px-3 py-2`}
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
              <CustomSwitch
                value={showStatusBar}
                onValueChange={setShowStatusBar}
                activeColor={selectedColor || '#4CAF50'}
                inActiveColor={isDarkMode ? '#4B5563' : '#A3B9D9'}
              />
            </View>
            {/* Hide Away App */}
            <TouchableOpacity 
              className="mb-[4%] mt-[4%] flex-row items-center justify-between px-4"
              onPress={() => setHideAppModalVisible(true)}>
              <Text
                allowFontScaling={false}
                className={`text-[16px] font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                Hide Away App
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={isDarkMode ? '#4B5563' : '#A3B9D9'}
              />
            </TouchableOpacity>
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
                  color={isDarkMode ? '#DBDFE5' : '#5C8BCC'}
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
                  color={isDarkMode ? '#DBDFE5' : '#5C8BCC'}
                />
                <Text
                  allowFontScaling={false}
                  className={`font-regular ml-2 text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Remind Me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mb-[6%] flex-row items-center"
                onPress={() => handleSetReminderOption('quit')}>
                <MaterialCommunityIcons
                  name={reminderOption === 'quit' ? 'radiobox-marked' : 'radiobox-blank'}
                  size={25}
                  color={isDarkMode ? '#DBDFE5' : '#5C8BCC'}
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
                color={isDarkMode ? '#728099' : '#89A2CA'}
              />
            </TouchableOpacity>
          </View>

          {showMore && (
            <View
              className={`mb-[4%] mt-[4%] rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
              {/* signout */}
              <View className="mb-2 rounded-xl ">
                {/* Header Row with Chevron */}
                <TouchableOpacity
                  className="mt-[6%] flex-row items-center justify-between"
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
                <TouchableOpacity
                  onPress={() => router.push('/premium')}
                  className={`rounded-xl ${isDarkMode ? 'bg-[#7FA8E5]' : 'bg-[#7EA9E5]'} px-4 py-2`}>
                  <Text
                    allowFontScaling={false}
                    className={`font-regular text-[12px] ${isDarkMode ? 'text-[#0C121B]' : 'text-white'}`}>
                    Check Premium
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity className="mb-[6%] py-2" onPress={handleRecommend}>
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
                color={isDarkMode ? '#728099' : '#7EA6E0'}
              />
            </TouchableOpacity>
          </View>

          {showAbout && (
            <View
              className={`flex-row items-center justify-center rounded-2xl py-8  shadow-sm ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
              <TouchableOpacity
                className="mb-[6%] mt-[6%] flex-1 items-center border-r border-[#728099]"
                onPress={() => {
                  Linking.openURL('https://focuson.expandtimes.com/privacy-policy.html');
                }}>
                <Text
                  allowFontScaling={false}
                  className={`font-regular text-[16px] ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="mb-[6%] mt-[6%] flex-1 items-center"
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
                    color={isDarkMode ? '#738099' : '#5C8BCC'}
                  />
                  <Text
                    allowFontScaling={false}
                    className={`ml-2 text-[15px] ${isSelected ? 'font-bold text-[#2E3B4D]' : ''} ${isDarkMode ? 'text-[#9CA3AF]' : 'text-[#2E3B4D]'}`}>
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
            className={`mx-[20%] mt-[5%] items-center justify-center rounded-full py-5 shadow-lg ${isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA9E5]'}`}>
            <Text
              allowFontScaling={false}
              className={`text-sm font-medium ${isDarkMode ? 'text-[#DBDFE5]' : 'text-white'}`}>
              Contact Us
            </Text>
          </TouchableOpacity>

          <Text
            allowFontScaling={false}
            className={`font-regular mb-[10%] mt-[5%] justify-center text-center text-[12px] ${isDarkMode ? 'text-[#8698B2]' : 'text-[#8D99AE]'}`}>
            Please let us know any issue or suggestion.
            {'\n'}Our dedicated developers are ready to fix your issue ASAP.
          </Text>
        </View>

        {/* Rate on Google Play */}
        <TouchableOpacity
          onPress={openPlayStoreForRating}
          className={`mx-[10%] mb-[10%] mt-[10%] items-center rounded-full ${isDarkMode ? 'bg-[#6087BF]' : 'bg-[#6087BF]'} py-4 shadow-sm`}>
          <Text
            allowFontScaling={false}
            className={`font-regular text-[14px] ${isDarkMode ? 'text-[#131B27]' : 'text-[#FFF]'}`}>
            Rate on Google Play
          </Text>
        </TouchableOpacity>
        {/* Footer Actions */}
        <View className="mb-8 flex-row items-center justify-center">
          {/* Privacy Policy */}
          <TouchableOpacity
            onPress={() => {
              setInfoModalType('privacy');
              setInfoModalVisible(true);
            }}
            className="flex-row items-center px-4">
            <Text
              allowFontScaling={false}
              className={`mr-2 text-[14px] font-regular ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
              Data Safety
            </Text>
          </TouchableOpacity>

          <View className={`h-4 w-[1px] ${isDarkMode ? 'bg-[#434C59]' : 'bg-[#DBDFE5]'}`} />

          {/* Device Setting*/}
          <TouchableOpacity
            className="flex-row items-center px-4"
            onPress={() => Linking.openSettings()}>
            <Text
              allowFontScaling={false}
              className={`mr-2 text-[14px] font-light ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
              Device Setting
            </Text>
          </TouchableOpacity>
        </View>
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
              scrollEventThrottle={16}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={false}
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
                      {item.premium && !isPremium && (
                        <Image
                          source={require('../assets/Animation/premium.png')}
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 20,
                            width: 24,
                            height: 24,
                          }}
                          resizeMode="contain"
                        />
                      )}
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
                
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50,
              }}>
              <View className="items-center justify-center bg-black/50 rounded-2xl p-6 ">
               <LottieView
                  source={require('../assets/Animation/fo.json')}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text
                  allowFontScaling={false}
                  className="mt-2 text-[18px] font-medium text-[#fff]">
                  Processing...
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Hidden Apps Modal */}
      <Modal
        visible={hideAppModalVisible}
        animationType="slide"
        onRequestClose={() => setHideAppModalVisible(false)}>
        <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#E1EAF5]'}`}>
          <View className="flex-row items-center justify-between px-4 py-4">
            <TouchableOpacity onPress={() => setHideAppModalVisible(false)}>
              <Ionicons name="close" size={28} color={isDarkMode ? '#DBDFE5' : '#2E3B4D'} />
            </TouchableOpacity>
            <Text
              allowFontScaling={false}
              className={`text-xl font-bold ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
              Hidden Apps
            </Text>
            <View className="w-7" />
          </View>

          <FlatList
              data={hiddenApps}
              keyExtractor={(pkg) => pkg}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              renderItem={({ item: pkg }) => {
                // If app is not found in apps list, we can at least show the package name
                // so the user can still unhide it
                const app = apps.find((a) => a.packageName === pkg);

                return (
                  <View
                    className={`mb-3 flex-row items-center justify-between rounded-xl p-4 shadow-sm ${
                      isDarkMode ? 'bg-[#131B27]' : 'bg-white'
                    }`}>
                    <View className="flex-1 flex-row items-center">
                      {app?.icon && (
                        <Image
                          source={{ uri: `data:image/png;base64,${app.icon}` }}
                          className="mr-3 h-10 w-10 rounded-full"
                        />
                      )}
                      <Text
                        allowFontScaling={false}
                        className={`text-[16px] font-medium ${
                          isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'
                        }`}>
                        {app ? (appRenames[app.packageName] || app.label) : pkg}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        className="rounded-lg bg-[#5B8BDF] px-4 py-2"
                        onPress={() => handleOpenHiddenApp(pkg, app)}>
                        <Text allowFontScaling={false} className="font-medium text-white">
                          Open
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded-lg bg-[#7EA9E5] px-4 py-2"
                        onPress={async () => {
                          await toggleHideApp(pkg);
                        }}>
                        <Text allowFontScaling={false} className="font-medium text-white">
                          Unhide
                        </Text>
                      </TouchableOpacity>
                    </View>
                   
                  </View>
                );
              }}
            ListEmptyComponent={
              <View className="mt-10 items-center justify-center">
                <Text
                  allowFontScaling={false}
                  className={`text-[16px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No hidden apps.
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Blocked Info Modal */}
      <BlockedInfoModal
        visible={blockedInfoVisible}
        onClose={() => setBlockedInfoVisible(false)}
        isDarkMode={isDarkMode}
        appLabel={selectedBlockedApp?.label}
        unblockAt={blockedUntil}
        appIconBase64={selectedBlockedApp?.icon}
      />
    </View>
  );
}
