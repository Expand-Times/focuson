import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppItem } from '../../modules/launcher/src/Launcher.types';
import { useAppContext } from './AppContext';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  selectedApp: AppItem | null;
  onLaunch: (minutes: number) => void;
  isDarkMode: boolean;
  theme: any;
}

export default function AppModal({
  visible,
  onClose,
  selectedApp,
  onLaunch,
  isDarkMode,
  theme,
}: AppModalProps) {
  const { reminderOption, setReminderOptionState, appRenames } = useAppContext();
  const [showTimeOverSettings, setShowTimeOverSettings] = useState(false);
  const [secondWarning, setSecondWarning] = useState(true);

  const {
    modalbg,
    open,
    select,
    numberbg,
    number,
    toggle,
    togglei,
    when,
    remind,
    bordert,
    quitbg,
    quit,
  } = theme || {};

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/70">
        <View
          style={modalbg}
          className={`w-[85%] rounded-3xl p-6 shadow-xl ${
            isDarkMode ? 'bg-[#131B27]' : 'bg-white'
          }`}>
          <View className="mb-6 items-center">
            <Text
              allowFontScaling={false}
              style={open}
              className={`mb-4 mt-[4%] text-center text-xl font-bold ${
                isDarkMode ? 'text-[#DADFE5]' : 'text-gray-900'
              }`}>
              Open{' '}
              {selectedApp
                ? appRenames[selectedApp.packageName] || selectedApp.label
                : ''}
            </Text>

            {selectedApp?.icon && (
              <Image
                source={{ uri: `data:image/png;base64,${selectedApp.icon}` }}
                className="mb-6 h-16 w-16"
                resizeMode="contain"
              />
            )}

            <Text
              allowFontScaling={false}
              style={select}
              className={`text-center mt-[4%] text-[14px] font-medium ${
                isDarkMode ? 'text-[#728099]' : 'text-[#A3B8D9]'
              }`}>
              Select estimated use time
            </Text>
          </View>

          {/* Time Selection */}
          <View className="mb-4 flex-row flex-wrap justify-between">
            {[2, 5, 10, 20].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={numberbg}
                className={`mb-3 w-[48%] items-center rounded-xl ${
                  isDarkMode ? 'bg-[#212C40]' : 'bg-[#7EA9E5]'
                } py-3 active:opacity-80`}
                onPress={() => onLaunch(mins)}>
                <Text
                  allowFontScaling={false}
                  style={number}
                  className={`text-base font-medium ${
                    isDarkMode ? 'text-[#DADFE5]' : 'text-white'
                  }`}>
                  {mins} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Toggle Icon */}
          <TouchableOpacity
            onPress={() => setShowTimeOverSettings(!showTimeOverSettings)}
            className="mb-2 self-center p-2">
            <Ionicons
              style={toggle}
              name={showTimeOverSettings ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={isDarkMode ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>

          {showTimeOverSettings && (
            <View className="mb-4 w-full">
              <Text
                allowFontScaling={false}
                style={when}
                className={`mb-4 text-center text-base font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-800'
                }`}>
                When time is over
              </Text>

              {/* Mindful Delay (Disabled) */}
              <TouchableOpacity
                className="mb-3 flex-row items-center"
                disabled={true}
                style={{ opacity: 0.5 }}
                onPress={() => setReminderOptionState('mindful')}>
                <View
                  style={[
                    {
                      borderColor:
                        togglei?.color ||
                        (reminderOption === 'mindful' ? '#5B8BDF' : '#9CA3AF'),
                    },
                    togglei,
                  ]}
                  className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${
                    reminderOption === 'mindful'
                      ? togglei
                        ? ''
                        : 'border-[#5B8BDF]'
                      : togglei
                        ? ''
                        : 'border-gray-400'
                  }`}>
                  {reminderOption === 'mindful' && (
                    <View
                      style={{
                        backgroundColor: togglei?.color || '#5B8BDF',
                      }}
                      className={`h-3 w-3 rounded-full ${
                        togglei ? '' : 'bg-[#5B8BDF]'
                      }`}
                    />
                  )}
                </View>
                <Text
                  allowFontScaling={false}
                  className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                  Mindful Delay
                </Text>
              </TouchableOpacity>

              {/* Remind Me */}
              <View className="mb-3 flex-row items-center justify-between">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setReminderOptionState('remind')}>
                  <View
                    style={[
                      {
                        borderColor:
                          togglei?.color ||
                          (reminderOption === 'remind' ? '#5B8BDF' : '#9CA3AF'),
                      },
                      togglei,
                    ]}
                    className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${
                      reminderOption === 'remind'
                        ? togglei
                          ? ''
                          : 'border-[#5B8BDF]'
                        : togglei
                          ? ''
                          : 'border-gray-400'
                    }`}>
                    {reminderOption === 'remind' && (
                      <View
                        style={{
                          backgroundColor: togglei?.color || '#5B8BDF',
                        }}
                        className={`h-3 w-3 rounded-full ${
                          togglei ? '' : 'bg-[#5B8BDF]'
                        }`}
                      />
                    )}
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={remind}
                    className={
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }>
                    Remind Me
                  </Text>
                </TouchableOpacity>

                {/* 2nd Warning Checkbox */}
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setSecondWarning(!secondWarning)}
                  disabled={true}
                  style={{ opacity: 0.5 }}>
                  <View
                    style={[
                      {
                        borderColor:
                          togglei?.color ||
                          (secondWarning ? '#5B8BDF' : '#9CA3AF'),
                        backgroundColor: secondWarning
                          ? togglei?.color || '#5B8BDF'
                          : 'transparent',
                      },
                      togglei,
                    ]}
                    className={`mr-2 h-4 w-4 items-center justify-center rounded border ${
                      secondWarning
                        ? togglei
                          ? ''
                          : 'border-[#5B8BDF] bg-[#5B8BDF]'
                        : togglei
                          ? ''
                          : 'border-gray-400'
                    }`}>
                    {secondWarning && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text
                    allowFontScaling={false}
                    className={`text-sm ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                    2nd Warning
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quit */}
              <TouchableOpacity
                className="mb-3 flex-row items-center"
                onPress={() => setReminderOptionState('quit')}>
                <View
                  style={[
                    {
                      borderColor:
                        togglei?.color ||
                        (reminderOption === 'quit' ? '#5B8BDF' : '#9CA3AF'),
                    },
                    togglei,
                  ]}
                  className={`mr-3 h-5 w-5 items-center justify-center rounded-full border ${
                    reminderOption === 'quit'
                      ? togglei
                        ? ''
                        : 'border-[#5B8BDF]'
                      : togglei
                        ? ''
                        : 'border-gray-400'
                  }`}>
                  {reminderOption === 'quit' && (
                    <View
                      style={{
                        backgroundColor: togglei?.color || '#5B8BDF',
                      }}
                      className={`h-3 w-3 rounded-full ${
                        togglei ? '' : 'bg-[#5B8BDF]'
                      }`}
                    />
                  )}
                </View>
                <Text
                  allowFontScaling={false}
                  style={remind}
                  className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                  Quit
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={bordert}
            className={`mt-2 mb-[6%] border-t pt-6 ${
              isDarkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
            <TouchableOpacity
              style={quitbg}
              className={`w-full items-center rounded-xl py-3 active:opacity-80 ${
                isDarkMode ? 'bg-[#212D41]' : 'bg-[#6087BF]'
              }`}
              onPress={onClose}>
              <Text
                style={quit}
                allowFontScaling={false}
                className="text-base font-medium text-white">
                Quit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
