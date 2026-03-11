import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, Dimensions, Modal } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = Math.max(16, SCREEN_WIDTH * 0.04);
const TAB_BAR_HEIGHT = 80;
const HEADER_HEIGHT = 88;
const COLLAPSE_SCROLL = 100;

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
});

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BAR_HEIGHTS = [85, 92, 78, 95, 88, 90, 82]; // relative heights for chart

const QUICK_ACTIONS = [
  'Log glucose reading',
  'Meal suggestions',
  'Workout tips',
  'Set medication reminder',
];

const DAILY_TIPS = [
  {
    title: 'Regular Exercise',
    description: 'Aim for 30 minutes of moderate activity most days to improve insulin sensitivity.',
    icon: 'run' as const,
    iconColor: '#16A34A',
    bgColor: '#DCFCE7',
    borderColor: '#A7F3D0',
  },
  {
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily to help manage blood sugar levels.',
    icon: 'water' as const,
    iconColor: '#0EA5E9',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    title: 'Sleep Well',
    description: 'Get 7–8 hours of sleep to support blood sugar control and energy levels.',
    icon: 'sleep' as const,
    iconColor: '#6366F1',
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  {
    title: 'Balanced Meals',
    description: 'Include protein, fiber, and healthy fats at each meal for stable glucose.',
    icon: 'food-apple-outline' as const,
    iconColor: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  {
    title: 'Stress Less',
    description: 'Practice deep breathing or short walks to help keep stress and blood sugar in check.',
    icon: 'meditation' as const,
    iconColor: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
];

const PROFILE_MENU_ITEMS = [
  { id: 'profile', label: 'My Profile', icon: 'account-outline' as const, path: '/(tabs)/profile' },
  { id: 'settings', label: 'Settings', icon: 'cog-outline' as const, path: null },
  { id: 'notifications', label: 'Notifications', icon: 'bell-outline' as const, path: null },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' as const, path: null },
  { id: 'logout', label: 'Log Out', icon: 'logout' as const, path: null, isLogout: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const [tipIndex, setTipIndex] = useState(0);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT;
  const scrollY = useRef(new Animated.Value(0)).current;

  const profilePopupAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (profileMenuVisible) {
      Animated.spring(profilePopupAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      profilePopupAnim.setValue(0);
    }
  }, [profileMenuVisible]);

  const handleProfileMenuItem = async (item: (typeof PROFILE_MENU_ITEMS)[0]) => {
    setProfileMenuVisible(false);
    if (item.isLogout) {
      try {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('@diafit_profile_complete');
        router.replace('/(auth)/welcome');
      } catch {
        router.replace('/(auth)/welcome');
      }
      return;
    }
    if (item.path) router.push(item.path as any);
  };

  const fullHeaderHeight = insets.top + HEADER_HEIGHT;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL],
    outputRange: [fullHeaderHeight, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const topSpacerHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL],
    outputRange: [0, insets.top],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.screen}>
      {/* Blue header extends to very top – status bar (time, etc.) sits on top of blue */}
      <Animated.View style={[styles.headerWrap, { height: headerHeight }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View>
              <Text className="text-base text-white/100">Good morning,</Text>
              <Text className="text-2xl font-bold text-white">Bryan!</Text>
            </View>
            <Pressable onPress={() => setProfileMenuVisible(true)} style={styles.profileCircle}>
              <Text className="text-lg font-bold text-white">B</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: bottomPadding,
          flexGrow: 1,
        }}
      >
        <Animated.View style={{ height: topSpacerHeight }} />
        {/* Today's Summary card */}
        <View style={[styles.card, cardShadow, { marginHorizontal: HORIZONTAL_MARGIN, marginTop: 16, marginBottom: 16 }]}>
          <Text className="text-lg font-bold text-gray-900 mb-4">Today's Summary</Text>
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <View className="w-10 h-10 rounded-full bg-[#E0F2FE] items-center justify-center mb-2">
                <MaterialCommunityIcons name="water" size={22} color="#0EA5E9" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">120</Text>
              <Text className="text-xs text-gray-500">mg/dL</Text>
            </View>
            <View className="flex-1 items-center border-l border-r border-gray-100">
              <View className="w-10 h-10 rounded-full bg-[#DCFCE7] items-center justify-center mb-2">
                <MaterialCommunityIcons name="chart-line" size={22} color="#16A34A" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">4.2k</Text>
              <Text className="text-xs text-gray-500">steps</Text>
            </View>
            <View className="flex-1 items-center">
              <View className="w-10 h-10 rounded-full bg-[#FFF4E6] items-center justify-center mb-2">
                <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#EA580C" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">2/3</Text>
              <Text className="text-xs text-gray-500">meals</Text>
            </View>
          </View>
        </View>

        {/* Daily Health Tip card */}
        <View style={[styles.card, cardShadow, { marginHorizontal: HORIZONTAL_MARGIN, marginBottom: 16 }]}>
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialCommunityIcons name="lightbulb-outline" size={22} color="#EAB308" />
            <Text className="text-lg font-bold text-gray-900">Daily Health Tip</Text>
          </View>
          {(() => {
            const tip = DAILY_TIPS[tipIndex];
            return (
              <View
                style={[
                  styles.tipBox,
                  { backgroundColor: tip.bgColor, borderColor: tip.borderColor },
                ]}
              >
                <View style={styles.tipIconWrap}>
                  <MaterialCommunityIcons name={tip.icon} size={36} color={tip.iconColor} />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-base font-bold text-gray-900">{tip.title}</Text>
                  <Text className="text-sm text-gray-600 mt-1">{tip.description}</Text>
                </View>
              </View>
            );
          })()}
          <View className="flex-row items-center justify-center gap-4 mt-4">
            <Pressable
              onPress={() => setTipIndex((i) => Math.max(0, i - 1))}
              style={styles.tipNavButton}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color="#6B7280" />
            </Pressable>
            <View className="flex-row gap-1.5">
              {DAILY_TIPS.map((_, i) => (
                <View
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: i === tipIndex ? '#3B82F6' : '#D1D5DB' }}
                />
              ))}
            </View>
            <Pressable
              onPress={() => setTipIndex((i) => Math.min(DAILY_TIPS.length - 1, i + 1))}
              style={styles.tipNavButton}
            >
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* 7-Day Glucose Trend card */}
        <View
          className="bg-white rounded-2xl p-5 mb-4"
          style={[cardShadow, { marginHorizontal: HORIZONTAL_MARGIN, marginBottom: 16 }]}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-bold text-gray-900">7-Day Glucose Trend</Text>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#374151" />
            </View>
            <Pressable>
              <Text className="text-sm font-medium text-blue-600">View all</Text>
            </Pressable>
          </View>
          <Text className="text-3xl font-bold text-gray-900">115</Text>
          <Text className="text-sm text-gray-500 mb-4">Average mg/dL</Text>
          <View className="flex-row items-end justify-between h-24 gap-1">
            {WEEK_DAYS.map((day, i) => (
              <View key={i} className="flex-1 items-center">
                <View
                  className="w-full rounded-t bg-blue-300 min-h-2"
                  style={{ height: BAR_HEIGHTS[i] + 24 }}
                />
                <Text className="text-xs text-gray-500 mt-2">{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Time in Range & Daily Carbs - two cards side by side */}
        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: HORIZONTAL_MARGIN, marginBottom: 24 }}>
          <View className="flex-1" style={[styles.card, cardShadow]}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-base font-bold text-gray-900">Time in Range</Text>
              <MaterialCommunityIcons name="trending-up" size={18} color="#16A34A" />
            </View>
            <Text className="text-2xl font-bold text-green-600">89%</Text>
            <Text className="text-sm text-green-600 mt-0.5">Excellent control</Text>
          </View>
          <View className="flex-1" style={[styles.card, cardShadow]}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-base font-bold text-gray-900">Daily Carbs</Text>
              <MaterialCommunityIcons name="apple" size={18} color="#EA580C" />
            </View>
            <Text className="text-2xl font-bold text-orange-600">145g</Text>
            <Text className="text-sm text-gray-500 mt-0.5">Target: 150g</Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Profile popup menu - drops down beside B (top-right) */}
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <Pressable style={styles.profileModalOverlay} onPress={() => setProfileMenuVisible(false)}>
          <View style={[styles.profilePopupContainer, { paddingTop: insets.top + HEADER_HEIGHT + 8 }]}>
            <Animated.View
              style={[
                styles.profilePopupCardWrap,
                {
                  opacity: profilePopupAnim,
                  transform: [
                    {
                      translateY: profilePopupAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-80, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable style={styles.profilePopupCard} onPress={(e) => e.stopPropagation()}>
            {/* Header - light blue */}
            <View style={styles.profilePopupHeader}>
              <View style={styles.profilePopupAvatar}>
                <Text className="text-xl font-bold text-white">B</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-900">Bryan</Text>
                <Text className="text-sm text-gray-500 mt-0.5">bryan@example.com</Text>
              </View>
            </View>
            {/* Menu items */}
            <View style={styles.profileMenuList}>
              {PROFILE_MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.profileMenuItem}
                  onPress={() => handleProfileMenuItem(item)}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={item.isLogout ? '#DC2626' : '#374151'}
                  />
                  <Text
                    style={[
                      styles.profileMenuItemText,
                      item.isLogout && styles.profileMenuItemTextLogout,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color={item.isLogout ? '#DC2626' : '#9CA3AF'}
                  />
                </Pressable>
              ))}
            </View>
              </Pressable>
            </Animated.View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 100,
    height: 100,
  },
  tipIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrap: {
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  profilePopupContainer: {
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  profilePopupCardWrap: {
    width: 320,
  },
  profilePopupCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  profilePopupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EFF6FF',
  },
  profilePopupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuList: {
    paddingVertical: 8,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  profileMenuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  profileMenuItemTextLogout: {
    color: '#DC2626',
  },
});
