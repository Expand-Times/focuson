import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Platform } from 'react-native';
import Launcher from '../../modules/launcher';

type ThemeLike = Record<string, any>;

type ScreenModalProps = {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  theme?: ThemeLike | null;
  appLabel?: string | null;
  packageName?: string | null;
  onMoreInfo?: () => void;
};

const formatHM = (millis: number) => {
  const hours = Math.floor(millis / (1000 * 60 * 60));
  const minutes = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatShortHM = (millis: number) => {
  const minutes = Math.round(millis / 60000);
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h`;
  return `${minutes}m`;
};

export default function Screenmodal({
  visible,
  onClose,
  isDarkMode,
  theme,
  appLabel,
  packageName,
  onMoreInfo,
}: ScreenModalProps) {
  const { modalbg, numberbg, number, open } = theme || ({} as any);
  const [daily, setDaily] = useState<number[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!visible) return;
        if (packageName && (Launcher as any).getPackageDailyUsage7d) {
          const arr = await (Launcher as any).getPackageDailyUsage7d(packageName);
          if (mounted) setDaily(Array.isArray(arr) ? arr : null);
        } else if (packageName && (Launcher as any).getPackageWeeklyUsage) {
          const total = await (Launcher as any).getPackageWeeklyUsage(packageName);
          const perDay = Math.floor((typeof total === 'number' ? total : 0) / 7);
          if (mounted) setDaily(new Array(7).fill(perDay));
        } else {
          if (mounted) setDaily(null);
        }
      } catch {
        if (mounted) setDaily(null);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [visible, packageName]);

  const maxVal = useMemo(() => (daily && daily.length ? Math.max(...daily) : 1), [daily]);
  const total = useMemo(() => (daily ? daily.reduce((a, b) => a + b, 0) : 0), [daily]);
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const axisMaxHours = useMemo(() => {
    const mh = Math.ceil(maxVal / (60 * 60 * 1000));
    const base = Math.max(1, mh);
    return Math.ceil(base / 4) * 4;
  }, [maxVal]);
  const yTicks = useMemo(
    () => Array.from({ length: 5 }, (_, i) => `${Math.round((axisMaxHours * (4 - i)) / 4)}h`),
    [axisMaxHours]
  );

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 items-center justify-center bg-black/60">
            <TouchableWithoutFeedback>
              <View style={modalbg} className={`w-[340px] rounded-3xl ${isDarkMode ? 'bg-[#E8EEF7]' : 'bg-[#E8EEF7]'}`}>
                <View className="rounded-t-3xl bg-[#E4ECF7] px-6 py-4">
                  <Text allowFontScaling={false} className="text-center text-xl font-bold text-[#1b2b44]">
                    <Text className="font-extrabold">{appLabel}</Text> Screen Time
                  </Text>
                </View>

                <View className="px-6 py-6">
                  <View className="h-48 w-full flex-row">
                    <View className="mr-2 h-full w-8 items-end justify-between py-1">
                      {yTicks.map((t) => (
                        <Text key={t} allowFontScaling={false} className="text-[10px] text-[#6077a3]">
                          {t}
                        </Text>
                      ))}
                    </View>
                    <View className="h-full flex-1 justify-end">
                      <View className="absolute left-0 right-0 top-0 h-full justify-between">
                        <View className="h-px w-full bg-[#c9d7ee]" />
                        <View className="h-px w-full bg-[#c9d7ee]" />
                        <View className="h-px w-full bg-[#c9d7ee]" />
                        <View className="h-px w-full bg-[#c9d7ee]" />
                        <View className="h-px w-full bg-[#c9d7ee]" />
                      </View>
                      <View className="flex-row items-end justify-between">
                        {(daily ?? new Array(7).fill(0)).map((v, idx) => {
                          const hPct =
                            axisMaxHours > 0 ? Math.max(6, Math.round((v / (axisMaxHours * 60 * 60 * 1000)) * 100)) : 0;
                          return (
                            <View key={idx} className="items-center">
                              <Text allowFontScaling={false} className="mb-1 text-[10px] text-[#6077a3]">
                                {formatShortHM(v)}
                              </Text>
                              <View className="w-7 rounded bg-[#86A8DB]" style={{ height: `${hPct}%` }} />
                              <Text allowFontScaling={false} className="mt-1 text-xs text-[#6077a3]">
                                {labels[idx]}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  <Text allowFontScaling={false} className="mt-4 text-center text-sm text-[#354764]">
                    Last 7 days total: {formatHM(total)}
                  </Text>
                </View>

                <View className="px-6 pb-6">
                  <TouchableOpacity
                    className="mb-3 items-center rounded-full bg-[#7EA6E0] py-3"
                    onPress={onClose}>
                    <Text allowFontScaling={false} className="text-base font-semibold text-white">
                      Got It!
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="items-center rounded-full bg-[#5279B8] py-3"
                    onPress={onMoreInfo ?? onClose}>
                    <Text allowFontScaling={false} className="text-base font-semibold text-white">
                      More Info
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
