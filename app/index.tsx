import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { View, ActivityIndicator, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const hasNavigated = useRef(false);

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

  useEffect(() => {
    if (hasNavigated.current) return;
    if (isLoading) return;
    // Wait until the root navigator is mounted and not stale
    if (!rootNavigationState?.key) return;

    hasNavigated.current = true;

    // Use InteractionManager to wait until all pending interactions
    // (including child navigator mounting) have completed
    const task = InteractionManager.runAfterInteractions(() => {
      router.replace(hasSeenIntro ? "/home" : "/intro/one");
    });

    return () => task.cancel();
  }, [isLoading, hasSeenIntro, rootNavigationState?.key]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#5C8BCC" />
    </View>
  );
}
