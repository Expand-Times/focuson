import { Stack, Link } from 'expo-router';

import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';

export default function Home() {
  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Home"></ScreenContent>
        <Link href={{ pathname: '/all-apps' }} asChild>
          <Button title="Show All Installed Apps" />
        </Link>
        <Link href={{ pathname: '/permissions', params: { name: 'Dan' } }} asChild>
          <Button title="Show Permissions" />
        </Link>
        <Link href={{ pathname: '/home' }} asChild>
          <Button title="Go to New Home Screen" />
        </Link>
        <Link href={{ pathname: '/intro/one' }} asChild>
          <Button title="Go to Intro One Screen" />
        </Link>
      </Container>
      {/* create new screen using attachment in this file */}
    </View>
  );
}

const styles = {
  container: 'flex flex-1 bg-white',
};

