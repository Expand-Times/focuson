import { useNavigation } from 'expo-router';
import { StackActions } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const navigation = useNavigation();
  const [destination, setDestination] = useState<'home' | 'intro' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenIntro')
      .then((v) => setDestination(v === 'true' ? 'home' : 'intro'))
      .catch(() => setDestination('intro'));
  }, []);

  useEffect(() => {
    if (!destination) return;

    // Dispatch via the live navigation prop using StackActions — these actions
    // carry no `target` navigator key, so they bubble up the live tree instead
    // of being silently dropped when the navigator gets rebuilt during
    // launcher cold-start churn. We keep retrying until this screen unmounts
    // (which only happens when the redirect actually lands).
    const action =
      destination === 'home'
        ? StackActions.replace('home')
        : StackActions.replace('intro', { screen: 'one' });

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const go = () => {
      if (cancelled) return;
      try {
        navigation.dispatch(action);
      } catch {
        // navigator not mounted yet — retry on the next tick
      }
      timer = setTimeout(go, 150);
    };

    go();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [destination, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#5C8BCC" />
    </View>
  );
}
