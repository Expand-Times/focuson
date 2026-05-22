import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [destination, setDestination] = useState<'/home' | '/intro/one' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenIntro')
      .then((v) => setDestination(v === 'true' ? '/home' : '/intro/one'))
      .catch(() => setDestination('/intro/one'));
  }, []);

  useEffect(() => {
    if (!destination) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    // Redirect to the real entry screen. On a cold start — which is what
    // happens when this app is the default launcher and Android relaunches it
    // via the HOME intent — the navigator may not be ready on the first try,
    // so we keep retrying. A successful redirect unmounts this screen, which
    // runs the cleanup below and stops the loop.
    const go = () => {
      if (cancelled) return;
      try {
        router.replace(destination);
      } catch {
        // Navigator not mounted yet — retry on the next tick.
      }
      timer = setTimeout(go, 150);
    };

    go();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [destination]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#5C8BCC" />
    </View>
  );
}
