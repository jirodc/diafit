import { View, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@diafit_onboarding_complete';
const PROFILE_KEY = '@diafit_profile_complete';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // In development, always start with onboarding so each run shows the full flow
        if (__DEV__) {
          await AsyncStorage.multiRemove([ONBOARDING_KEY, PROFILE_KEY]);
        }

        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        const profileDone = await AsyncStorage.getItem(PROFILE_KEY);
        if (onboardingDone !== 'true') {
          router.replace('/onboarding');
        } else if (profileDone !== 'true') {
          router.replace('/(auth)/welcome');
        } else {
          router.replace('/(tabs)/home');
        }
      } catch {
        router.replace('/onboarding');
      }
    };

    checkOnboarding();
  }, []);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
