import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  useEffect(() => {
    checkIntro();
  }, []);

  const checkIntro = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenIntro');
      if (value === 'true') {
        setHasSeenIntro(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#5C8BCC" />
      </View>
    );
  }

  return <Redirect href={hasSeenIntro ? "/home" : "/intro/one"} />;
}
