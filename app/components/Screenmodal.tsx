import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Launcher from '../../modules/launcher';

type ThemeLike = Record<string, any>;

type Props = {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  theme?: ThemeLike | null;
  appLabel?: string | null;
  packageName?: string | null;
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { width } = Dimensions.get('window');

const msToHours = (ms: number) => ms / 3600000;
const formatHM = (millis: number) => {
  const h = Math.floor(millis / (1000 * 60 * 60));
  const m = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function Screenmodal({
  visible,
  onClose,
  isDarkMode,
  theme,
  appLabel,
  packageName,
}: Props) {
  const { modalbg, open } = theme || ({} as any);
  const [dailyMs, setDailyMs] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);

  const labels = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const start = new Date(t.getTime() - 7 * 24 * 60 * 60 * 1000);
    const arr: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      arr.push(dayNames[d.getDay()]);
    }
    return arr;
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!visible || !packageName) return;
        setLoading(true);
        const weekly = Launcher.getPackageDailyUsage7d
          ? await Launcher.getPackageDailyUsage7d(packageName)
          : [];
        if (mounted) {
          if (Array.isArray(weekly) && weekly.length === 7) {
            setDailyMs(weekly.map((v) => (typeof v === 'number' ? v : 0)));
          } else {
            setDailyMs(Array(7).fill(0));
          }
        }
      } catch {
        if (mounted) setDailyMs(Array(7).fill(0));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [visible, packageName]);

  const totalMs = useMemo(
    () => (dailyMs ? dailyMs.reduce((a, b) => a + b, 0) : 0),
    [dailyMs]
  );

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: dailyMs ? dailyMs.map(msToHours) : Array(7).fill(0),
          color: (opacity = 1) => (isDarkMode ? `rgba(126,166,224,${opacity})` : `rgba(82,121,184,${opacity})`),
          strokeWidth: 3,
        },
      ],
    }),
    [labels, dailyMs, isDarkMode]
  );

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: isDarkMode ? '#1E293B' : '#FFFFFF',
      backgroundGradientTo: isDarkMode ? '#1E293B' : '#FFFFFF',
      decimalPlaces: 1,
      color: (opacity = 1) => (isDarkMode ? `rgba(203,213,225,${opacity})` : `rgba(71,85,105,${opacity})`),
      labelColor: (opacity = 1) => (isDarkMode ? `rgba(203,213,225,${opacity})` : `rgba(71,85,105,${opacity})`),
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: isDarkMode ? '#7EA6E0' : '#5279B8',
      },
    }),
    [isDarkMode]
  );

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 items-center justify-center bg-black/60">
            <TouchableWithoutFeedback>
              <View
                style={modalbg}
                className={`w-[90%] rounded-3xl p-6 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                <Text
                  style={open}
                  allowFontScaling={false}
                  className={`mb-2 text-center text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
                  {appLabel ? `Last 7 Days: ${appLabel}` : 'Last 7 Days'}
                </Text>
                <Text
                  allowFontScaling={false}
                  className={`mb-4 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {loading ? 'Loading...' : `Total: ${formatHM(totalMs)} (hours shown)`}
                </Text>
                <View className="items-center">
                  <LineChart
                    data={chartData}
                    width={Math.min(width * 0.85, 360)}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    yAxisSuffix="h"
                    fromZero
                    style={{ borderRadius: 16 }}
                  />
                </View>
                <TouchableOpacity
                  className={`mt-4 items-center rounded-xl py-3 ${isDarkMode ? 'bg-[#7EA6E0]' : 'bg-[#7EA6E0]'}`}
                  onPress={onClose}>
                  <Text allowFontScaling={false} className="font-medium text-white">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
