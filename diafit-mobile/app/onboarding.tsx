import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ONBOARDING_KEY = '@diafit_onboarding_complete';

const slides = [
  {
    id: '1',
    cardBg: '#FFFFFF',
    iconBg: '#3B82F6',
    iconName: 'heart-pulse' as const,
    iconColor: '#FFFFFF',
    title: 'Track Your Glucose',
    description:
      'Monitor your blood sugar levels with ease. Log readings before and after meals, and visualize trends over time.',
    showBranding: true,
  },
  {
    id: '2',
    cardBg: '#FFF8F0',
    iconBg: '#EA580C',
    image: require('../assets/images/LogMeal.jpg'),
    title: 'Log Your Meals',
    description:
      'Keep track of your nutrition with our comprehensive food database. Monitor calories, carbs, protein, and more.',
    showBranding: false,
  },
  {
    id: '3',
    cardBg: '#FFFFFF',
    iconBg: '#7C3AED',
    image: require('../assets/images/SmartScheduling.jpg'),
    title: 'Smart Scheduling',
    description:
      'Never miss a dose with medication reminders and meal planning. Set custom tasks and stay on track.',
    showBranding: false,
  },
  {
    id: '4',
    cardBg: '#F0FFF4',
    iconBg: '#16A34A',
    image: require('../assets/images/WorkOuts.jpg'),
    title: 'Personalized Workouts',
    description:
      'Stay active with workout plans tailored to your fitness level. From beginner to advanced exercises.',
    showBranding: false,
  },
  {
    id: '5',
    cardBg: '#EFF6FF',
    iconBg: '#3B82F6',
    image: require('../assets/images/DiaBot.jpg'),
    title: 'AI Assistant - DiaBot',
    description:
      'Get instant answers and personalized advice from DiaBot, your 24/7 diabetes management companion.',
    showBranding: false,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/welcome');
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

  const renderCardContent = (item: (typeof slides)[0], index: number) => {
    const cardStyle = [styles.card, { backgroundColor: item.cardBg }];

    if (index === 0) {
      return (
        <View style={styles.card3dWrapper}>
          {/* Back shadow layer for depth */}
          <View style={styles.card3dShadow} />
          <View style={[cardStyle, styles.card3d]}>
            {/* 3D icon box with depth */}
            <View style={styles.icon3dWrapper}>
              <View style={styles.icon3dShadow} />
              <View
                className="w-20 h-20 rounded-2xl items-center justify-center"
                style={[styles.icon3dFace, { backgroundColor: item.iconBg }]}
              >
                <MaterialCommunityIcons
                  name={item.iconName}
                  size={40}
                  color={item.iconColor}
                />
              </View>
            </View>
            <View className="mt-4 items-center">
              <Text className="text-2xl font-bold text-gray-900">Diafit</Text>
              <Text className="text-sm text-gray-500 mt-1 text-center">
                Your AI-Powered Diabetes Companion
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Slides 2–5: image as full-bleed background (no container)
    return (
      <View style={styles.slideWithBackground}>
        <Image
          source={item.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View style={styles.imageOverlay} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F8F8]" edges={['top', 'bottom']}>
      {/* Header - Skip only, top right */}
      <View className="flex-row justify-end items-center px-6 pt-4 pb-2">
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text className="text-base font-normal text-gray-700">Skip</Text>
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
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item, index }) => (
          <View style={{ width }} className="flex-1 justify-center">
            {/* Top area: card for slide 1, or background image for slides 2–5 */}
            <View className="flex-1 px-6">
              {renderCardContent(item, index)}
            </View>

            {/* Feature title and description - centered */}
            <View className="px-6 mt-6 items-center">
              <Text className="text-xl font-bold text-gray-900 text-center">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-500 mt-2 text-center leading-6 px-1">
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom: Pagination, Button, Page counter */}
      <View className="px-6 pb-6 pt-6">
        {/* Pagination dots - active: blue pill; inactive: hollow grey circles */}
        <View className="flex-row justify-center items-center gap-2 mb-6">
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex
                  ? {
                      width: 24,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#3B82F6',
                    }
                  : {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'transparent',
                      borderWidth: 1.5,
                      borderColor: '#D1D5DB',
                    },
              ]}
            />
          ))}
        </View>

        {/* Next / Continue to Login button - gradient lighter left to darker right */}
        <Pressable
          onPress={handleNext}
          className="rounded-xl overflow-hidden active:opacity-90"
          style={styles.nextButton}
        >
          <LinearGradient
            colors={['#60A5FA', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Continue to Login' : 'Next'}
            </Text>
          </LinearGradient>
        </Pressable>

      

        {/* Page counter */}
        <Text className="text-center text-sm text-gray-700 mt-3">
          {currentIndex + 1} of {slides.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  card3dWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card3dShadow: {
    position: 'absolute',
    width: '94%',
    top: 8,
    bottom: -8,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderRadius: 20,
    ...Platform.select({
      ios: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18 },
      android: { elevation: 14 },
    }),
  },
  card3d: {
    transform: [{ perspective: 800 }, { rotateY: '-6deg' }, { rotateX: '4deg' }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 20 },
    }),
  },
  icon3dWrapper: {
    position: 'relative',
  },
  icon3dShadow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 64, 175, 0.45)',
    top: 5,
    left: '50%',
    marginLeft: -40,
  },
  icon3dFace: {
    ...Platform.select({
      ios: {
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  slideWithBackground: {
    flex: 1,
    marginHorizontal: -24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  dot: {
    alignSelf: 'center',
  },
  nextButton: {
    alignSelf: 'stretch',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  nextButtonGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
