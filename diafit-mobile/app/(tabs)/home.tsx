import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, Dimensions, Modal, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
<<<<<<< HEAD

const PROFILE_KEY = '@diafit_profile_complete';
=======
>>>>>>> layouts/ui

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = Math.max(16, SCREEN_WIDTH * 0.04);
const TAB_BAR_HEIGHT = 70;
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
  { id: 'profile', label: 'My Profile', icon: 'account-outline' as const, path: '/(tabs)/profile' as const },
  { id: 'settings', label: 'Settings', icon: 'cog-outline' as const, path: '/settings' as const },
  { id: 'notifications', label: 'Notifications', icon: 'bell-outline' as const, path: null },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' as const, path: null },
  { id: 'logout', label: 'Log Out', icon: 'logout' as const, path: null, isLogout: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const [tipIndex, setTipIndex] = useState(0);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null } | null>(null);
  const [latestGlucose, setLatestGlucose] = useState<number | null>(null);
  const [todayMealsCount, setTodayMealsCount] = useState(0);
  const [glucoseTrendData, setGlucoseTrendData] = useState<Array<{ day: string; dayIndex: number; avgValue: number }>>([]);
  const [glucoseAvg, setGlucoseAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT;
  const scrollY = useRef(new Animated.Value(0)).current;

  const profilePopupAnim = useRef(new Animated.Value(0)).current;

  const fetchHomeData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const [profileRes, glucoseRes, glucoseTrendRes, mealsRes] = await Promise.all([
      supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
      supabase.from('glucose_readings').select('value').eq('user_id', user.id).order('reading_time', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('glucose_readings').select('value, reading_time').eq('user_id', user.id).gte('reading_time', start.toISOString()).lte('reading_time', end.toISOString()).order('reading_time', { ascending: true }),
      (() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        return supabase.from('meal_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('meal_time', todayStart.toISOString()).lt('meal_time', todayEnd.toISOString());
      })(),
    ]);
    if (profileRes.data) setProfile({ full_name: profileRes.data.full_name, email: profileRes.data.email });
    if (glucoseRes.data?.value != null) setLatestGlucose(glucoseRes.data.value);
    if (mealsRes.count != null) setTodayMealsCount(mealsRes.count);
    if (glucoseTrendRes.data && glucoseTrendRes.data.length > 0) {
      const dayMap = new Map<number, number[]>();
      glucoseTrendRes.data.forEach((r) => {
        const d = new Date(r.reading_time);
        const dayOfWeek = d.getDay();
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        if (!dayMap.has(dayIndex)) dayMap.set(dayIndex, []);
        dayMap.get(dayIndex)!.push(r.value);
      });
      const trend: Array<{ day: string; dayIndex: number; avgValue: number }> = [];
      dayMap.forEach((values, dayIndex) => {
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        trend.push({ day: WEEK_DAYS[dayIndex], dayIndex, avgValue: Math.round(avg) });
      });
      trend.sort((a, b) => a.dayIndex - b.dayIndex);
      setGlucoseTrendData(trend);
      const allValues = glucoseTrendRes.data.map((r) => r.value);
      const overallAvg = allValues.reduce((s, v) => s + v, 0) / allValues.length;
      setGlucoseAvg(Math.round(overallAvg));
    } else {
      setGlucoseTrendData([]);
      setGlucoseAvg(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchHomeData();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchHomeData]);

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
<<<<<<< HEAD
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: async () => {
              await supabase.auth.signOut();
              await AsyncStorage.removeItem(PROFILE_KEY);
              router.replace('/(auth)/welcome');
            },
          },
        ]
      );
=======
      try {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('@diafit_profile_complete');
        router.replace('/(auth)/welcome');
      } catch {
        router.replace('/(auth)/welcome');
      }
>>>>>>> layouts/ui
      return;
    }
    if (item.path) {
      router.push(item.path as any);
      return;
    }
    if (item.id === 'notifications' || item.id === 'help') {
      Alert.alert('Coming soon', 'This feature is not available yet.');
    }
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
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text className="text-base text-white/100" numberOfLines={1}>Good morning,</Text>
              <Text className="text-2xl font-bold text-white" numberOfLines={1} ellipsizeMode="tail">
                {loading ? '…' : (profile?.full_name?.trim() || profile?.email?.split('@')[0] || 'User')}!
              </Text>
            </View>
            <Pressable onPress={() => setProfileMenuVisible(true)} style={styles.profileCircle}>
              <Text className="text-lg font-bold text-white">
                {(profile?.full_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
              </Text>
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
          <View className="flex-row justify-between" style={{ flexWrap: 'wrap' }}>
            <View className="flex-1 items-center" style={{ minWidth: 80 }}>
              <View className="w-10 h-10 rounded-full bg-[#E0F2FE] items-center justify-center mb-2">
                <MaterialCommunityIcons name="water" size={22} color="#0EA5E9" />
              </View>
              <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>{latestGlucose ?? '—'}</Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>mg/dL</Text>
            </View>
            <View className="flex-1 items-center border-l border-r border-gray-100" style={{ minWidth: 80 }}>
              <View className="w-10 h-10 rounded-full bg-[#DCFCE7] items-center justify-center mb-2">
                <MaterialCommunityIcons name="chart-line" size={22} color="#16A34A" />
              </View>
              <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>—</Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>steps</Text>
            </View>
            <View className="flex-1 items-center" style={{ minWidth: 80 }}>
              <View className="w-10 h-10 rounded-full bg-[#FFF4E6] items-center justify-center mb-2">
                <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#EA580C" />
              </View>
              <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>{todayMealsCount}/3</Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>meals</Text>
            </View>
          </View>
        </View>

        {/* Daily Health Tip card */}
        <View style={[styles.card, cardShadow, { marginHorizontal: HORIZONTAL_MARGIN, marginBottom: 16 }]}>
          <View className="flex-row items-center gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
            <MaterialCommunityIcons name="lightbulb-outline" size={22} color="#EAB308" />
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>Daily Health Tip</Text>
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
                <View className="flex-1 ml-4" style={{ minWidth: 0 }}>
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{tip.title}</Text>
                  <Text className="text-sm text-gray-600 mt-1" numberOfLines={3}>{tip.description}</Text>
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

<<<<<<< HEAD
        {/* 7-Day Glucose Trend card - only show if data exists */}
        {glucoseTrendData.length > 0 && (
          <View style={[styles.card, cardShadow, { marginHorizontal: HORIZONTAL_MARGIN, marginBottom: 16 }]}>
            <View className="flex-row items-center justify-between mb-2" style={{ flexWrap: 'wrap' }}>
              <View className="flex-row items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>7-Day Glucose Trend</Text>
                <MaterialCommunityIcons name="chart-bar" size={20} color="#374151" />
=======
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
>>>>>>> layouts/ui
              </View>
              <Pressable onPress={() => router.push('/(tabs)/glucose')}>
                <Text className="text-sm font-medium text-[#3B82F6]">View all</Text>
              </Pressable>
            </View>
            {glucoseAvg != null && (
              <>
                <Text className="text-3xl font-bold text-gray-900">{glucoseAvg}</Text>
                <Text className="text-sm text-gray-500 mb-4">Average mg/dL</Text>
              </>
            )}
            <View className="flex-row items-end justify-between h-24 gap-2" style={{ minHeight: 80 }}>
              {glucoseTrendData.map((item) => {
                const values = glucoseTrendData.map((d) => d.avgValue);
                const maxValue = Math.max(...values);
                const minValue = Math.min(...values);
                const range = maxValue - minValue || 1;
                const normalizedHeight = range > 0 ? ((item.avgValue - minValue) / range) * 60 + 20 : 40;
                return (
                  <View key={item.dayIndex} className="flex-1 items-center" style={{ minWidth: 0 }}>
                    <View
                      className="w-full rounded-t-md bg-[#93C5FD] min-h-[8px]"
                      style={{ height: Math.max(normalizedHeight, 8) }}
                    />
                    <Text className="text-xs text-gray-500 mt-2" numberOfLines={1}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Time in Range & Daily Carbs - two cards side by side */}
        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: HORIZONTAL_MARGIN, marginBottom: 24, flexWrap: 'wrap' }}>
          <View className="flex-1" style={[styles.card, cardShadow, { minWidth: 140 }]}>
            <View className="flex-row items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <Text className="text-base font-bold text-gray-900" numberOfLines={1}>Time in Range</Text>
              <MaterialCommunityIcons name="trending-up" size={18} color="#16A34A" />
            </View>
            <Text className="text-2xl font-bold text-green-600">89%</Text>
            <Text className="text-sm text-green-600 mt-0.5" numberOfLines={1}>Excellent control</Text>
          </View>
          <View className="flex-1" style={[styles.card, cardShadow, { minWidth: 140 }]}>
            <View className="flex-row items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <Text className="text-base font-bold text-gray-900" numberOfLines={1}>Daily Carbs</Text>
              <MaterialCommunityIcons name="apple" size={18} color="#EA580C" />
            </View>
            <Text className="text-2xl font-bold text-orange-600">145g</Text>
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>Target: 150g</Text>
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
                <Text className="text-xl font-bold text-white">
                  {(profile?.full_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-900">{profile?.full_name?.trim() || 'User'}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">{profile?.email || ''}</Text>
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
                    numberOfLines={1}
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
