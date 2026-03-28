import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Image,

} from 'react-native';
import Launcher from '../../modules/launcher';
import { LinearGradient } from 'expo-linear-gradient';

type ThemeLike = Record<string, any>;

type BlockDurationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (durationMs: number) => void | Promise<void>;
  isDarkMode: boolean;
  theme?: ThemeLike | null;
  appLabel?: string | null;
  appIconBase64?: string | null;
  packageName?: string | null;
};

export const BlockDurationModal = ({
  visible,
  onClose,
  onConfirm,
  isDarkMode,
  theme,
  appLabel,
  appIconBase64,
  packageName,
}: BlockDurationModalProps) => {
  const { block,blockcircle,blockgradient,blockText1,blockText2,blockText3,blockText4,blockText5,blockText6,blockText7,blockText8,blockbutton1,blockbutton2,blockbuttontext,weeklytext1,weeklytext2 ,blockbg} = theme || ({} as any);
  const [weeklyMs, setWeeklyMs] = useState<number | null>(null);
  const formatHM = (millis: number) => {
    const hours = Math.floor(millis / (1000 * 60 * 60));
    const minutes = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };
  const CHOICES = useMemo(
    () => [
      { label: '1h', ms: 1 * 60 * 60 * 1000 },
      { label: '2h', ms: 2 * 60 * 60 * 1000 },
      { label: '4h', ms: 4 * 60 * 60 * 1000 },
      { label: '6h', ms: 6 * 60 * 60 * 1000 },
      { label: '12h', ms: 12 * 60 * 60 * 1000 },
      { label: '1d', ms: 24 * 60 * 60 * 1000 },
      { label: '2d', ms: 2 * 24 * 60 * 60 * 1000 },
      { label: '3d', ms: 3 * 24 * 60 * 60 * 1000 },
      { label: '5d', ms: 5 * 24 * 60 * 60 * 1000 },
      { label: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
    ],
    []
  );
  const [selectedIdx, setSelectedIdx] = useState(3);
  const [step, setStep] = useState(0);
  const [sliderW, setSliderW] = useState(6);
  const SliderCmp = useMemo(() => {
    try {
      const mod = require('@react-native-community/slider');
      return mod?.default || mod?.Slider || null;
    } catch {
      return null;
    }
  }, []);
  const libDraggingRef = useRef(false);
  const THUMB_SIZE = 42;


  const selectedNumUnit = useMemo(() => {
    const lbl = CHOICES[selectedIdx]?.label || '6h';
    if (lbl.endsWith('h')) {
      const n = parseInt(lbl.replace('h', ''), 10);
      return { num: `${n}`, unit: n === 1 ? 'hour' : 'hours' };
    }
    if (lbl.endsWith('d')) {
      const n = parseInt(lbl.replace('d', ''), 10);
      return { num: `${n}`, unit: n === 1 ? 'day' : 'days' };
    }
    return { num: lbl, unit: '' };
  }, [selectedIdx]);



  useEffect(() => {
    let mounted = true;
    const loadWeekly = async () => {
      try {
        if (visible && packageName) {
          const total = Launcher.getPackageWeeklyUsage
            ? await Launcher.getPackageWeeklyUsage(packageName)
            : 0;
          if (mounted) setWeeklyMs(typeof total === 'number' ? total : 0);
        }
      } catch {
        if (mounted) setWeeklyMs(null);
      }
    };
    loadWeekly();
    return () => {
      mounted = false;
    };
  }, [visible, packageName]);

  const btnLabel =
    step === 0
      ? 'Block'
      : step === 1
        ? 'I am Sure!'
        : step === 2
          ? 'I’ve iron will'
          : 'Confirm Block!';

  const handlePrimary = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const ms = CHOICES[selectedIdx].ms;
      onConfirm(ms);
      setStep(0);
      setSelectedIdx(3);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 items-center justify-center bg-black/60">
            <TouchableWithoutFeedback>
              <View
                style={block}
                className={`w-[85%] rounded-3xl p-6 ${isDarkMode ? 'bg-[#131B27]' : 'bg-white'}`}>
                <Text
                  style={blockText1}
                  allowFontScaling={false}
                  className={`mb-1 text-center text-base font-regular ${isDarkMode ? 'text-[#DBDFE5]' : 'text-gray-900'}`}>
                  Block <Text  allowFontScaling={false} className="font-bold">{appLabel}</Text>
                </Text>
                {appIconBase64 ? (
                  <View className="my-6 items-center">
                    <Image
                      source={{ uri: `data:image/png;base64,${appIconBase64}` }}
                      className="h-16 w-16"
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
                {weeklyMs !== null && (
                  <Text
                    style={blockText2}
                    allowFontScaling={false}
                    className={`mb-2 text-center text-base font-regular ${isDarkMode ? 'text-[#728099]' : 'text-slate-700'}`}>
                    <Text allowFontScaling={false} className="font-bold">{formatHM(weeklyMs)}</Text> spent on <Text  allowFontScaling={false} className="font-bold">{appLabel}</Text> last 7 days
                  </Text>
                )}
                <Text
                  style={blockText3}
                  allowFontScaling={false}
                  className={`mb-4 text-center text-sm font-medium ${isDarkMode ? 'text-[#7FA8E5]' : 'text-slate-600'}`}>
                  You <Text  allowFontScaling={false} className="font-bold">can’t open</Text> this <Text  className="font-bold">app</Text> within selected time <Text  className="font-bold">period after blocking.</Text> Think twice before blocking!
                </Text>
                <Text
                  style={blockText4}
                  allowFontScaling={false}
                  className={`my-4 text-center text-base font-regular ${isDarkMode ? 'text-[#DBDFE5]' : 'text-gray-900'}`}>
                  Block <Text  allowFontScaling={false} className="font-bold">{appLabel}</Text> Completely for
                </Text>
                <Text
                  style={blockText5}
                  allowFontScaling={false}
                  className={`mb-4 text-center  ${isDarkMode ? 'text-[#DBDFE5]' : 'text-slate-700'}`}>
                  <Text allowFontScaling={false} className="font-extrabold text-2xl">
                    {selectedNumUnit.num}
                  </Text>
                  {selectedNumUnit.unit ? (
                    <Text allowFontScaling={false} className="font-regular text-base">
                      {' '}{selectedNumUnit.unit}
                    </Text>
                  ) : null}
                </Text>
                <View className="mb-4">
                  {SliderCmp ? (
                    <View className="w-full">
                      <View
                        style={blockbg}
                        className={`h-12 w-full rounded-full ${isDarkMode ? 'bg-[#213048]' : 'bg-[#ECF0FF]'} relative overflow-hidden`}
                        onLayout={(e) => setSliderW(e.nativeEvent.layout.width)}>
                        <LinearGradient
                          colors={
                            Array.isArray(blockgradient)
                              ? blockgradient
                              : (isDarkMode
                                  ? (blockgradient?.dark ?? ['#213048', '#7EA6E0'])
                                  : (blockgradient?.light ?? ['#ECF0FF', '#7EA6E0']))
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${(CHOICES.length > 1 ? (selectedIdx / (CHOICES.length - 1)) : 0) * 100}%`,
                          }}
                        />
                        <SliderCmp
                          value={selectedIdx}
                          minimumValue={0}
                          maximumValue={CHOICES.length - 1}
                          step={1}
                          onSlidingStart={() => { libDraggingRef.current = true; }}
                          onValueChange={(v: number) => {
                            if (libDraggingRef.current) setSelectedIdx(Math.round(v));
                          }}
                          onSlidingComplete={(v: number) => {
                            setSelectedIdx(Math.round(v));
                            libDraggingRef.current = false;
                          }}
                          minimumTrackTintColor="transparent"
                          maximumTrackTintColor="transparent"
                          thumbTintColor="transparent"
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            opacity: 0,
                          }}
                        />
                        <View
                          pointerEvents="none"
                          style={{
                            position: 'absolute',
                            width: THUMB_SIZE,
                            height: THUMB_SIZE,
                            borderRadius: THUMB_SIZE / 2,
                            backgroundColor: (blockcircle?.backgroundColor) || (isDarkMode ? '#64748B' : '#5D8BCC'),
                            top: (42 - THUMB_SIZE) / 2,
                            left:
                              sliderW && CHOICES.length > 1
                                ? Math.max(
                                    0,
                                    Math.min(
                                      sliderW - THUMB_SIZE,
                                      sliderW * (selectedIdx / (CHOICES.length - 1)) - THUMB_SIZE / 2
                                    )
                                  )
                                : 0,
                            shadowColor: '#000',
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 3,
                          }}
                        />
                      </View>
                    </View>
                  ) : null}
               
                 
                  <View className="mt-2 flex-row items-center justify-between px-1">
                    {CHOICES.map((_, i) => (
                      <View
                        key={i}
                        className={`${isDarkMode ? 'bg-[#64748B]' : 'bg-[#c9d7ee]'} h-1.5 w-1.5 rounded-full`}
                      />
                    ))}
                  </View>
                  <View className="mt-2 flex-row justify-between">
                    <Text
                      allowFontScaling={false}
                      className={`${isDarkMode ? 'text-[#728099]' : 'text-slate-600'} text-sm`}>
                      {CHOICES[0].label}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      className={`${isDarkMode ? 'text-[#728099]' : 'text-slate-600'} text-sm`}>
                      {CHOICES[CHOICES.length - 1].label}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={blockbutton1}
                  className={`mt-2 items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA6E0]' : 'bg-[#7EA6E0]'}`}
                  onPress={handlePrimary}>
                  <Text allowFontScaling={false} style={blockbuttontext} className="font-medium text-white">
                    {btnLabel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={blockbutton2}
                  className={`mt-3 items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#212C40]' : 'bg-slate-200'}`}
                  onPress={onClose}>
                  <Text
                    style={blockbuttontext}
                    allowFontScaling={false}
                    className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

type BlockedInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  theme?: ThemeLike | null;
  appLabel?: string | null;
  unblockAt?: number | null;
  appIconBase64?: string | null;
};

export const BlockedInfoModal = ({
  visible,
  onClose,
  isDarkMode,
  theme,
  appLabel,
  unblockAt,
  appIconBase64,
}: BlockedInfoModalProps) => {
  const { block,blockText6,blockText7,blockText8,blockbuttontext,blockbutton1,blockbutton2 } = theme || ({} as any);
  const remainingMs = unblockAt ? Math.max(unblockAt - Date.now(), 0) : 0;
  const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
  const remainingLabel =
    remainingHours >= 24
      ? `${Math.ceil(remainingHours / 24)} day${Math.ceil(remainingHours / 24) > 1 ? 's' : ''}`
      : `${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <TouchableWithoutFeedback>
              <View
                style={block}
                className={`h-full w-full p-6 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <View className="items-center mt-8">
                  <Text
                    style={blockText6}
                    allowFontScaling={false}
                    className={`text-center text-xl font-bold  ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                    {appLabel} <Text className='font-medium'>Blocked</Text>
                  </Text>
                </View>
                <View className="flex-1 items-center justify-center">
                  <Text
                    style={blockText7}
                    allowFontScaling={false}
                    className={`text-center text-xl font-regular  ${isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'}`}>
                    Can you remember?{'\n'} You <Text className='font-semibold'>blocked {appLabel}</Text> for {remainingLabel}
                  </Text>
                  {appIconBase64 ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${appIconBase64}` }}
                      className="mt-4 h-16 w-16"
                      resizeMode="contain"
                    />
                  ) : null}
                </View>
                <View className="items-center mb-8">
                  <Text
                    style={blockText8}
                    allowFontScaling={false}
                    className={`mb-4 text-center text-sm  ${isDarkMode ? 'text-[#728099]' : 'text-[#858E9D]'}`}>
                    You’ll be able to use {appLabel} after{' '}
                    {unblockAt ? new Date(unblockAt).toLocaleString() : ''}
                  </Text>
                 
                </View>
                 <TouchableOpacity
                    style={blockbutton2}
                    className={`mb-3 items-center rounded-xl  py-3 ${isDarkMode ? 'bg-[#7EA6E0]' : 'bg-[#7EA6E0]'}`}
                    onPress={onClose}>
                    <Text
                      style={blockbuttontext}
                      allowFontScaling={false} className="font-medium text-white">
                      Ok
                    </Text>
                  </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
