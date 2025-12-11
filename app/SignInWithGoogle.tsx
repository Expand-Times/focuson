import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import { useColorContext } from './context/ColorContext';
import { supabase } from './lib/supabase';




type RootStackParamList = {
  TodaysTaskToDoScreen: undefined;
};

type SignInNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TodaysTaskToDoScreen'
>;

export default function SignInWithGoogle() {
  const [showModal, setShowModal] = useState(false);
  const {isDarkMode, selectedColor} = useColorContext();
  const navigation = useNavigation<SignInNavigationProp>();

  GoogleSignin.configure({
    webClientId: '350173649156-upg946fmamu4bpk7gicdk53rcrag5jfd.apps.googleusercontent.com',
  });

  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo?.data?.idToken) {
        const {data, error} = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) throw error;

        await AsyncStorage.setItem('userAuthInfo', JSON.stringify(data));
        setShowModal(true); // Show modal after successful sign-ins
      } else {
        throw new Error('No ID token present!');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Sign In is Cancelled', 'Please try again.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign In is in Progress', 'Please wait and try again.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Not Available', 'Please update your Play Services.');
      } else {
        Alert.alert('Sign In Error', error.message || 'An unknown error occurred during sign in.');
      }
    }
  };

  const handleContinue = () => {
    setShowModal(false);
    navigation.navigate('TodaysTaskToDoScreen');
  };

  return (
    <>
      <View className="overflow-hidden self-center">
        <TouchableOpacity
          onPress={handleSignIn}
          className={`mt-12 items-center justify-center rounded-full border border-white px-[120px] py-3 shadow-lg ${isDarkMode ? 'border-[#637E99] bg-[#637E99]' : ''}`}
          style={!isDarkMode ? {
            shadowColor: 'rgba(74, 144, 226, .5)',
            shadowOffset: {width: 0, height: 5},
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
            backgroundColor: selectedColor,
          } : {
            shadowColor: 'rgba(74, 144, 226, .5)',
            shadowOffset: {width: 0, height: 5},
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}>
          {/* Button Text */}
          <Text
            allowFontScaling={false}
            className="text-sm font-semibold text-white"
            style={{lineHeight: 20}}>
            Sign in
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}>
        <View className="flex-1 items-center justify-center bg-[#3580FF]/50">
          <View className="h-[92px] w-[300px] rounded-full bg-[#317CF9] px-10 py-6 shadow-md">
            <Text
              allowFontScaling={false}
              className="bottom-3 text-center text-[22px] font-medium text-white"
              style={{letterSpacing: 1}}>
              Welcome!
            </Text>
            <Text
              allowFontScaling={false}
              className="bottom-2 text-center text-xs text-[#C6CEDD]"
              style={{letterSpacing: 1}}>
              Successfully Signed In
            </Text>

            <TouchableOpacity
              onPress={handleContinue}
              className="bottom-3 mt-4 h-8 self-center rounded-md bg-white px-4">
              <Text
                allowFontScaling={false}
                className="top-2 text-xs font-medium text-[#3580FF]"
                style={{letterSpacing: 1}}>
                Continue..
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}