import { View, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const ONBOARDING_KEY = '@diafit_onboarding_complete';
const PROFILE_KEY = '@diafit_profile_complete';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // To see onboarding again: set forceOnboardingInDev = true (and reload), and ensure you're signed out.
        const forceOnboardingInDev = true;
        if (__DEV__ && forceOnboardingInDev) {
          await AsyncStorage.multiRemove([ONBOARDING_KEY, PROFILE_KEY]);
        }

        const { data: { session } } = await supabase.auth.getSession();
        // Only go to home if user is actually signed in with Supabase
        if (session?.user) {
          await AsyncStorage.setItem(PROFILE_KEY, 'true');
          router.replace('/(tabs)/home');
          return;
        }

        // No session: show onboarding or sign-in (never go to home without auth)
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (onboardingDone !== 'true') {
          router.replace('/onboarding');
        } else {
          router.replace('/(auth)/welcome');
        }
      } catch {
        router.replace('/onboarding');
      }
    };

    checkAuthAndOnboarding();
  }, []);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
