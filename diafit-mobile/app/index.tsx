import { View, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const PROFILE_KEY = '@diafit_profile_complete';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
<<<<<<< HEAD
=======
        // To see onboarding again: set forceOnboardingInDev = true (and reload), and ensure you're signed out.
        const forceOnboardingInDev = true;
        if (__DEV__ && forceOnboardingInDev) {
          await AsyncStorage.multiRemove([ONBOARDING_KEY, PROFILE_KEY]);
        }

>>>>>>> layouts/ui
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Signed in: require username (full_name) before home
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          const hasUsername = profile?.full_name != null && String(profile.full_name).trim().length > 0;
          if (!hasUsername) {
            router.replace('/set-username');
            return;
          }
          await AsyncStorage.setItem(PROFILE_KEY, 'true');
          router.replace('/(tabs)/home');
          return;
        }

        // No session: always show onboarding first, then they go to login (welcome)
        router.replace('/onboarding');
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
