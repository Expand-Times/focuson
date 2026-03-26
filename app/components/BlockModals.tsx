import React, { useEffect, useMemo, useState } from 'react';
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
  const { modalbg, numberbg, number, open } = theme || ({} as any);
  const [weeklyMs, setWeeklyMs] = useState<number | null>(null);
  const formatHM = (millis: number) => {
    const hours = Math.floor(millis / (1000 * 60 * 60));
    const minutes = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
  const [sliderW, setSliderW] = useState(0);
  const [lastIdxChangeAt, setLastIdxChangeAt] = useState(0);

  const selectedLabelText = useMemo(() => {
    const lbl = CHOICES[selectedIdx]?.label || '6h';
    if (lbl.endsWith('h')) {
      const n = parseInt(lbl.replace('h', ''), 10);
      return `${n} ${n === 1 ? 'hour' : 'hours'}`;
    }
    if (lbl.endsWith('d')) {
      const n = parseInt(lbl.replace('d', ''), 10);
      return `${n} ${n === 1 ? 'day' : 'days'}`;
    }
    return lbl;
  }, [selectedIdx]);

  const handleBarTouch = (x: number) => {
    if (!sliderW) return;
    const count = CHOICES.length;
    const seg = sliderW / (count - 1);
    const target = Math.min(count - 1, Math.max(0, Math.round(x / seg)));
    const now = Date.now();
    if (target === selectedIdx) return;
    if (now - lastIdxChangeAt < 90) return;
    const step = Math.sign(target - selectedIdx);
    setSelectedIdx(selectedIdx + step);
    setLastIdxChangeAt(now);
  };

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
    step === 0 ? 'Block' : step === 1 ? 'I am Sure!' : step === 2 ? 'I’ve iron will' : 'Confirm Block!';

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 items-center justify-center bg-black/60">
            <TouchableWithoutFeedback>
              <View style={modalbg} className={`w-[85%] rounded-3xl p-6 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <Text
                  style={open}
                  allowFontScaling={false}
                  className={`mb-1 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                  Block {appLabel}
                </Text>
                {appIconBase64 ? (
                  <View className="my-3 items-center">
                    <Image
                      source={{ uri: `data:image/png;base64,${appIconBase64}` }}
                      className="h-16 w-16"
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
                {weeklyMs !== null && (
                  <Text
                    allowFontScaling={false}
                    className={`mb-2 text-center text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {formatHM(weeklyMs)} spent on {appLabel} last 7 days
                  </Text>
                )}
                <Text
                  allowFontScaling={false}
                  className={`mb-4 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  You can’t open this app within selected time period after blocking.
                </Text>
                <Text
                  allowFontScaling={false}
                  className={`mb-2 text-center text-base font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {selectedLabelText}
                </Text>
                <View className="mb-4">
                  <View
                    className={`h-12 w-full rounded-full ${isDarkMode ? 'bg-[#213048]' : 'bg-[#E6EEF9]'} relative overflow-hidden`}
                    onLayout={(e) => setSliderW(e.nativeEvent.layout.width)}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={(e) => handleBarTouch(e.nativeEvent.locationX)}
                    onResponderMove={(e) => handleBarTouch(e.nativeEvent.locationX)}>
                    <View
                      className={`${isDarkMode ? 'bg-[#7EA6E0]/40' : 'bg-[#7EA6E0]/30'} absolute left-0 top-0 h-full rounded`}
                      style={{
                        width:
                          sliderW && CHOICES.length > 1
                            ? (sliderW * (selectedIdx / (CHOICES.length - 1))) || 0
                            : 0,
                      }}
                    />
                    <View
                      className="absolute  h-12 w-12 rounded-full bg-[#5279B8]"
                      style={{
                        left:
                          sliderW && CHOICES.length > 1
                            ? Math.max(
                                0,
                                Math.min(
                                  sliderW - 20,
                                  sliderW * (selectedIdx / (CHOICES.length - 1)) - 20
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
                  <View className="mt-2 flex-row items-center justify-between px-1">
                    {CHOICES.map((_, i) => (
                      <View
                        key={i}
                        className={`${isDarkMode ? 'bg-[#64748B]' : 'bg-[#c9d7ee]'} h-1.5 w-1.5 rounded-full`}
                      />
                    ))}
                  </View>
                  <View className="mt-2 flex-row justify-between">
                    <Text allowFontScaling={false} className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {CHOICES[0].label}
                    </Text>
                    <Text allowFontScaling={false} className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {CHOICES[CHOICES.length - 1].label}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={numberbg}
                  className={`mt-2 items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA6E0]' : 'bg-[#7EA6E0]'}`}
                  onPress={handlePrimary}>
                  <Text allowFontScaling={false} style={number} className="font-medium text-white">
                    {btnLabel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`mt-3 items-center rounded-xl py-2 ${isDarkMode ? 'bg-[#212D41]' : 'bg-slate-200'}`}
                  onPress={onClose}>
                  <Text allowFontScaling={false} className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
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
};

export const BlockedInfoModal = ({
  visible,
  onClose,
  isDarkMode,
  theme,
  appLabel,
  unblockAt,
}: BlockedInfoModalProps) => {
  const { modalbg } = theme || ({} as any);
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <TouchableWithoutFeedback>
              <View style={modalbg} className={`w-[320px] rounded-3xl p-6 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <Text
                  allowFontScaling={false}
                  className={`mb-1 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                  {appLabel} Blocked
                </Text>
                <Text
                  allowFontScaling={false}
                  className={`mb-4 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  You’ll be able to use {appLabel} after {unblockAt ? new Date(unblockAt).toLocaleString() : ''}
                </Text>
                <TouchableOpacity
                  className={`mb-3 items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA6E0]' : 'bg-[#7EA6E0]'}`}
                  onPress={onClose}>
                  <Text allowFontScaling={false} className="font-medium text-white">
                    Ok
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#212D41]' : 'bg-slate-200'}`}
                  onPress={onClose}>
                  <Text allowFontScaling={false} className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Help me!
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
