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
              <View style={modalbg} className={`w-[320px] rounded-3xl p-6 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
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
                  Select duration
                </Text>
                <View className="mb-4 flex-row flex-wrap justify-between">
                  {CHOICES.map((d, idx) => (
                    <TouchableOpacity
                      key={d.label}
                      className={`mb-2 w-[30%] items-center rounded-lg px-3 py-2 ${
                        selectedIdx === idx ? 'bg-[#7EA6E0]' : isDarkMode ? 'bg-[#213048]' : 'bg-[#E6EEF9]'
                      }`}
                      onPress={() => setSelectedIdx(idx)}>
                      <Text
                        allowFontScaling={false}
                        className={`${
                          selectedIdx === idx ? 'text-white' : isDarkMode ? 'text-[#DBDFE5]' : 'text-[#2E3B4D]'
                        }`}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
