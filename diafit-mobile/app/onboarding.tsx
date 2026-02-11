import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ONBOARDING_KEY = '@diafit_onboarding_complete';

const slides = [
  {
    id: '1',
    iconBg: '#E6F4FE',
    iconName: 'chart-line' as const,
    iconColor: '#2563EB',
    title: 'Track Your Glucose',
    description:
      'Monitor your blood sugar levels with ease. Log readings before and after meals, and visualize trends over time.',
  },
  {
    id: '2',
    iconBg: '#FFF4E6',
    iconName: 'silverware-fork-knife' as const,
    iconColor: '#EA580C',
    title: 'Log Your Meals',
    description:
      'Keep track of your nutrition with our comprehensive food database. Monitor calories, carbs, protein, and more.',
  },
  {
    id: '3',
    iconBg: '#F3E8FF',
    iconName: 'alarm' as const,
    iconColor: '#7C3AED',
    title: 'Smart Scheduling',
    description:
      'Never miss a dose with medication reminders and meal planning. Set custom tasks and stay on track.',
  },
  {
    id: '4',
    iconBg: '#DCFCE7',
    iconName: 'dumbbell' as const,
    iconColor: '#16A34A',
    title: 'Personalized Workouts',
    description:
      'Stay active with workout plans tailored to your fitness level. From beginner to advanced exercises.',
  },
  {
    id: '5',
    iconBg: '#E6F4FE',
    iconName: 'robot-outline' as const,
    iconColor: '#2563EB',
    title: 'AI Assistant - DiaBot',
    description:
      'Get instant answers and personalized advice from DiaBot, your 24/7 diabetes management companion.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)/home');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-4">
        <View className="flex-1" />
        <Text className="text-base font-semibold text-gray-800">
          Diafit UI Design
        </Text>
        <Pressable
          onPress={handleSkip}
          className="flex-1 items-end"
          hitSlop={12}
        >
          <Text className="text-base font-medium text-[#2563EB]">Skip</Text>
        </Pressable>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={{ width }} className="flex-1 px-6">
            {/* Icon container */}
            <View className="items-center mb-6">
              <View
                className="w-24 h-24 rounded-2xl items-center justify-center"
                style={{ backgroundColor: item.iconBg }}
              >
                <MaterialCommunityIcons
                  name={item.iconName}
                  size={48}
                  color={item.iconColor}
                />
              </View>
              {index === 0 && (
                <View className="mt-6 items-center">
                  <Text className="text-2xl font-bold text-gray-900">Diafit</Text>
                  <Text className="text-base text-gray-500 mt-1">
                    Your AI-Powered Diabetes Companion
                  </Text>
                </View>
              )}
            </View>

            {/* Title & Description */}
            <View className="items-center mb-4">
              <Text className="text-2xl font-bold text-gray-900 text-center">
                {item.title}
              </Text>
            </View>
            <Text className="text-base text-gray-600 text-center leading-6">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Bottom: Pagination & Button */}
      <View className="px-6 pb-10 pt-6">
        {/* Pagination dots */}
        <View className="flex-row justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full"
              style={[
                styles.dot,
                {
                  width: index === currentIndex ? 24 : 8,
                  backgroundColor:
                    index === currentIndex ? '#2563EB' : '#E5E7EB',
                },
              ]}
            />
          ))}
        </View>

        {/* Next / Continue button */}
        <Pressable
          onPress={handleNext}
          className="bg-[#2563EB] py-4 rounded-xl active:opacity-90"
        >
          <Text className="text-white text-center font-semibold text-base">
            {isLastSlide ? 'Continue to Login' : 'Next >'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dot: {
    alignSelf: 'center',
  },
});
