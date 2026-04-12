import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type PremiumModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  selectedColor?: string;
};

export function PremiumModal({
  visible,
  onClose,
  title = 'Premium Feature!',
  description = 'Only premium user can use this feature',
  selectedColor = '#5C8BCC',
}: PremiumModalProps) {
  const router = useRouter();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View
        className="h-full items-center justify-center"
        style={[{ backgroundColor: 'rgba(32, 41, 56, 0.85)' }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            onClose();
            router.push('/premium');
          }}>
          <View
            className="rounded-full py-6 shadow-md"
            style={{
              backgroundColor: selectedColor,
              width: screenWidth * 0.8,
              height: screenHeight * 0.1,
              alignSelf: 'center',
            }}>
            <View className="flex-row items-center justify-center px-4">
              <View>
                <Image
                  source={require('../../assets/images/PremiumFeature.png')}
                  className="h-[40px] w-[40px]"
                  resizeMode="contain"
                />
              </View>
              <View className="ml-2 flex-1">
                <Text
                  allowFontScaling={false}
                  className="text-[18px] font-medium tracking-[1px] text-white"
                  numberOfLines={1}>
                  {title}
                </Text>
                <Text
                  allowFontScaling={false}
                  className="text-[10px] font-normal tracking-[1px] text-[#C6CEDD]"
                  numberOfLines={2}>
                  {description}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                onClose();
                router.push('/premium');
              }}
              className="absolute -bottom-3 self-center rounded-md bg-white px-6 py-1.5 shadow-sm">
              <Text
                allowFontScaling={false}
                className="text-[12px] font-medium tracking-[1px]"
                style={{ color: selectedColor }}>
                Discover
              </Text>
            </Pressable>
          </View>
        </TouchableOpacity>
        
        {/* Close Button to just dismiss the modal */}
        <TouchableOpacity 
          className="absolute bottom-20 rounded-full bg-white/20 px-6 py-2"
          onPress={onClose}>
          <Text className="text-white font-medium text-[14px]">Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
