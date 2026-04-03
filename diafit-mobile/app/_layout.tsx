import 'react-native-gesture-handler';
import { Stack, useRouter, type Href } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import './global.css';
import { supabase } from '../lib/supabase';
import { completeOAuthRedirect } from '../lib/oauthSession';

/** Warm-start: OAuth return (PKCE) or recovery link while app is running. */
function AuthDeepLinkListener() {
  const router = useRouter();
  useEffect(() => {
    const sub = Linking.addEventListener('url', (event) => {
      void (async () => {
        try {
          const result = await completeOAuthRedirect(supabase, event.url);
          if (result === null) return;
          if (!result.ok) {
            if (__DEV__) console.warn('Auth deep link:', result.message);
            return;
          }
          if (result.navigate === 'reset-password') {
            router.replace('/(auth)/reset-password' as Href);
          } else {
            router.replace('/');
          }
        } catch (e) {
          if (__DEV__) console.error('Auth deep link:', e);
        }
      })();
    });
    return () => sub.remove();
  }, [router]);
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AuthDeepLinkListener />
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
    </GestureHandlerRootView>
  );
}
