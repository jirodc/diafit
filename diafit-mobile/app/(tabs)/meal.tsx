import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type FoodItem = {
  id: string;
  name: string;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

type LoggedMeal = {
  id: string;
  name: string;
  time: string;
  category: string;
  kcal: number;
  carbs?: number;
  protein?: number;
};

const ALL_FOODS: FoodItem[] = [
  { id: '1', name: 'Grilled Chicken Salad', kcal: 350, carbs: 12, protein: 45, fat: 14 },
  { id: '2', name: 'Oatmeal with Berries', kcal: 280, carbs: 45, protein: 8, fat: 6 },
  { id: '3', name: 'Greek Yogurt', kcal: 150, carbs: 18, protein: 15, fat: 5 },
  { id: '4', name: 'Whole Wheat Toast', kcal: 120, carbs: 20, protein: 4, fat: 2 },
  { id: '5', name: 'Salmon with Quinoa', kcal: 420, carbs: 35, protein: 38, fat: 16 },
];

const RECENT_MEALS = ALL_FOODS.slice(0, 4);

const SMART_TIPS = [
  { icon: 'leaf' as const, title: 'Vegetable Power', tip: 'Add 2 cups of non-starchy vegetables to dinner. This adds 6-8g fiber and helps reduce glucose spikes by 30%.', color: '#16A34A' },
  { icon: 'food-apple-outline' as const, title: 'Healthy Fats', tip: 'Include avocado, nuts, or olive oil. Healthy fats slow carb absorption and improve insulin sensitivity.', color: '#16A34A' },
  { icon: 'clock-outline' as const, title: 'Dinner Timing', tip: 'Aim to eat dinner by 7 PM, at least 3 hours before bedtime for better overnight glucose control.', color: '#7C3AED' },
];

const cardShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

export default function MealScreen() {
  const insets = useSafeAreaInsets();
  const [addFoodVisible, setAddFoodVisible] = useState(false);
  const [customizeVisible, setCustomizeVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [mealCategory, setMealCategory] = useState<MealCategory>('breakfast');
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMealLogs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const { data, error } = await supabase
      .from('meal_logs')
      .select('id, custom_food_name, category, meal_time, total_calories, total_carbs, total_protein')
      .eq('user_id', user.id)
      .gte('meal_time', start.toISOString())
      .lt('meal_time', end.toISOString())
      .order('meal_time', { ascending: false });
    if (error) {
      if (__DEV__) console.error('meal_logs fetch error:', error);
      return;
    }
    setLoggedMeals(
      (data || []).map((m) => ({
        id: m.id,
        name: m.custom_food_name || 'Meal',
        time: new Date(m.meal_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        category: (m.category as string).charAt(0).toUpperCase() + (m.category as string).slice(1),
        kcal: m.total_calories ?? 0,
        carbs: m.total_carbs != null ? Number(m.total_carbs) : undefined,
        protein: m.total_protein != null ? Number(m.total_protein) : undefined,
      }))
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchMealLogs();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchMealLogs]);

  const todayCal = loggedMeals.reduce((s, m) => s + m.kcal, 0);
  const todayCarbs = loggedMeals.reduce((s, m) => s + (m.carbs ?? 0), 0);
  const todayProtein = loggedMeals.reduce((s, m) => s + (m.protein ?? 0), 0);

  const openAddFood = () => setAddFoodVisible(true);
  const closeAddFood = () => {
    setAddFoodVisible(false);
    setSearch('');
  };

  const openCustomize = (food: FoodItem) => {
    setSelectedFood(food);
    setServings(1);
    setMealCategory('breakfast');
    setAddFoodVisible(false);
    setCustomizeVisible(true);
  };

  const closeCustomize = () => {
    setCustomizeVisible(false);
    setSelectedFood(null);
  };

  const handleLogServing = async () => {
    if (!selectedFood) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be signed in to log meals.');
      return;
    }
    setSaving(true);
    const mealTime = new Date();
    const totalCal = selectedFood.kcal * servings;
    const totalCarbs = selectedFood.carbs * servings;
    const totalProtein = selectedFood.protein * servings;
    const totalFat = selectedFood.fat * servings;
    const { error } = await supabase.from('meal_logs').insert({
      user_id: user.id,
      custom_food_name: selectedFood.name,
      category: mealCategory,
      servings: Number(servings),
      total_calories: totalCal,
      total_carbs: totalCarbs,
      total_protein: totalProtein,
      total_fat: totalFat,
      total_fiber: 0,
      meal_time: mealTime.toISOString(),
    });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to log meal.');
      return;
    }
    await fetchMealLogs();
    closeCustomize();
  };

  const filteredFoods = search.trim()
    ? ALL_FOODS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : ALL_FOODS;

  const categoryLabel = mealCategory.charAt(0).toUpperCase() + mealCategory.slice(1);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerSubtitle} numberOfLines={1}>Nutrition Tracking</Text>
        <View style={[styles.headerRow, { flexWrap: 'wrap' }]}>
          <Text style={[styles.headerTitle, { flex: 1, minWidth: 0 }]} numberOfLines={1}>Meal Log</Text>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#FFFFFF" />
          </View>
        </View>
        <Pressable style={styles.logMealBtn} onPress={openAddFood}>
          <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
          <Text style={styles.logMealBtnText}>Log Meal</Text>
        </Pressable>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's Nutrition */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today&apos;s Nutrition</Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.caloriesBig}>{todayCal}</Text>
            <Text style={styles.caloriesLabel}>Calories</Text>
          </View>
          <View style={styles.macroRow}>
            <Text style={[styles.macroValue, { color: '#2563EB' }]}>{todayCarbs}g Carbs</Text>
            <Text style={[styles.macroValue, { color: '#EA580C' }]}>{todayProtein}g Protein</Text>
          </View>
        </View>

        {/* Today's Meals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today&apos;s Meals</Text>
          {loading ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          ) : (
          loggedMeals.map((meal) => (
            <View key={meal.id} style={styles.mealRow}>
              <View style={styles.mealIcon}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#FFFFFF" />
              </View>
              <View style={[styles.mealInfo, { flex: 1, minWidth: 0 }]}>
                <Text style={styles.mealName} numberOfLines={1}>{meal.name}</Text>
                <Text style={styles.mealMeta} numberOfLines={1}>{meal.time} · {meal.category}</Text>
              </View>
              <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
            </View>
          ))
          )}
        </View>

        {/* AI Nutrition Alert */}
        <View style={styles.alertCard}>
          <LinearGradient colors={['#6366F1', '#4F46E5']} style={StyleSheet.absoluteFill} />
          <View style={styles.alertContent}>
            <MaterialCommunityIcons name="waveform" size={28} color="#FFFFFF" />
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>AI Nutrition Alert</Text>
              <Text style={styles.alertBody}>
                Your fiber intake is critically low at 8g (target: 25-30g daily). Fiber is essential for glucose control and slows sugar absorption.
              </Text>
              <Text style={styles.alertSub}>Add These High-Fiber Foods:</Text>
              <Text style={styles.alertBullet}>• Broccoli or spinach with dinner (+6g fiber)</Text>
              <Text style={styles.alertBullet}>• Chia seeds in your oatmeal (+10g fiber)</Text>
              <Text style={styles.alertBullet}>• Lentils or beans as protein source (+8g fiber)</Text>
            </View>
          </View>
        </View>

        {/* Nutrient Gaps */}
        <View style={[styles.card, styles.gapsCard]}>
          <View style={styles.gapsHeader}>
            <View style={styles.gapsIcon}>
              <MaterialCommunityIcons name="alert" size={22} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>Nutrient Gaps Detected</Text>
          </View>
          <Text style={styles.gapsDesc}>You&apos;re missing key nutrients for optimal glucose management:</Text>
          <View style={styles.gapRow}>
            <Text style={styles.gapLabel}>Fiber</Text>
            <Text style={styles.gapValue}>8/25g</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '32%' }]} />
          </View>
          <View style={styles.gapRow}>
            <Text style={styles.gapLabel}>Healthy Fats</Text>
            <Text style={styles.gapValue}>21/50g</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '42%' }]} />
          </View>
        </View>

        {/* Today's Smart Tips */}
        <View style={styles.card}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={22} color="#6B7280" />
            <Text style={styles.cardTitle}>Today&apos;s Smart Tips</Text>
          </View>
          {SMART_TIPS.map((t, i) => (
            <View key={i} style={styles.tipCard}>
              <MaterialCommunityIcons name={t.icon} size={24} color={t.color} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle} numberOfLines={1}>{t.title}</Text>
                <Text style={styles.tipBody} numberOfLines={4}>{t.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* This Week's Insights */}
        <View style={styles.insightsCard}>
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={StyleSheet.absoluteFill} />
          <View style={styles.insightsContent}>
            <MaterialCommunityIcons name="trending-up" size={28} color="#FFFFFF" />
            <View style={styles.insightsText}>
              <Text style={styles.insightsTitle}>This Week&apos;s Insights</Text>
              <View style={styles.insightRow}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#86EFAC" />
                <Text style={styles.insightBody}>Wednesday lunch - Salmon with quinoa & broccoli (Perfect fiber + protein balance!)</Text>
              </View>
              <View style={styles.insightRow}>
                <MaterialCommunityIcons name="alert" size={20} color="#FDE047" />
                <Text style={styles.insightBody}>Your fiber avg is 12g/day - Add vegetables to every meal to reach 25-30g target</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Food Modal */}
      <Modal visible={addFoodVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.addFoodSheet, { paddingTop: insets.top + 16 }]}>
            <View style={styles.addFoodHeader}>
              <View>
                <Text style={styles.addFoodTitle}>Add Food</Text>
                <Text style={styles.addFoodSubtitle}>Search or select recent meals</Text>
              </View>
              <Pressable onPress={closeAddFood} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={28} color="#374151" />
              </Pressable>
            </View>
            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={22} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for food..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <ScrollView style={styles.addFoodScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>RECENT MEALS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
                {RECENT_MEALS.map((food) => (
                  <Pressable key={food.id} style={styles.recentCard} onPress={() => openCustomize(food)}>
                    <Text style={styles.recentEmoji}>🥗</Text>
                    <Text style={styles.recentName} numberOfLines={1}>{food.name}</Text>
                    <Text style={styles.recentKcal}>{food.kcal} kcal</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ALL FOODS</Text>
              {filteredFoods.map((food) => (
                <Pressable key={food.id} style={styles.foodRow} onPress={() => openCustomize(food)}>
                  <Text style={styles.foodEmoji}>🥗</Text>
                  <View style={[styles.foodInfo, { flex: 1, minWidth: 0 }]}>
                    <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
                    <Text style={styles.foodMacros} numberOfLines={1}>{food.kcal} kcal • C: {food.carbs}g • P: {food.protein}g • F: {food.fat}g</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Customize Serving Modal */}
      <Modal visible={customizeVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.customizeSheetWrap}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.customizeHeader, { paddingTop: insets.top + 16 }]}>
              <View>
                <Text style={styles.customizeTitleWhite}>Customize Serving</Text>
                {selectedFood && <Text style={styles.customizeSubtitleWhite}>{selectedFood.name}</Text>}
              </View>
              <Pressable onPress={closeCustomize} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
              </Pressable>
            </LinearGradient>
            <View style={styles.customizeBody}>
            {selectedFood && (
              <>
                <View style={styles.foodDetailCard}>
                  <View style={styles.foodDetailIcon}>🥗</View>
                  <Text style={styles.foodDetailName}>{selectedFood.name}</Text>
                  <Text style={styles.foodDetailMacros}>
                    {selectedFood.kcal} kcal · C: {selectedFood.carbs}g · P: {selectedFood.protein}g
                  </Text>
                </View>
                <Text style={styles.label}>Number of Servings</Text>
                <View style={styles.servingsRow}>
                  <Pressable style={styles.servingsBtn} onPress={() => setServings((s) => Math.max(1, s - 1))}>
                    <MaterialCommunityIcons name="minus" size={24} color="#374151" />
                  </Pressable>
                  <Text style={styles.servingsValue}>{servings}</Text>
                  <Pressable style={styles.servingsBtn} onPress={() => setServings((s) => s + 1)}>
                    <MaterialCommunityIcons name="plus" size={24} color="#374151" />
                  </Pressable>
                </View>
                <Text style={styles.label}>Meal Category</Text>
                <View style={styles.categoryGrid}>
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((cat) => (
                    <Pressable
                      key={cat}
                      style={[styles.categoryBtn, mealCategory === cat && styles.categoryBtnActive]}
                      onPress={() => setMealCategory(cat)}
                    >
                      <MaterialCommunityIcons
                        name={cat === 'breakfast' ? 'coffee' : cat === 'lunch' ? 'white-balance-sunny' : cat === 'dinner' ? 'silverware-fork-knife' : 'weather-night'}
                        size={28}
                        color={mealCategory === cat ? '#2563EB' : '#6B7280'}
                      />
                      <Text style={[styles.categoryLabel, mealCategory === cat && styles.categoryLabelActive]}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={styles.logServingBtn} onPress={handleLogServing} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
                      <Text style={styles.logServingBtnText}>Log {servings} serving{servings > 1 ? 's' : ''} to {categoryLabel}</Text>
                    </>
                  )}
                </Pressable>
                <Pressable style={styles.cancelBtn} onPress={closeCustomize}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              </>
            )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  logMealBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...cardShadow,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  nutritionRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  caloriesBig: { fontSize: 32, fontWeight: '800', color: '#111827' },
  caloriesLabel: { fontSize: 16, color: '#6B7280' },
  macroRow: { flexDirection: 'row', gap: 24, marginTop: 8 },
  macroValue: { fontSize: 15, fontWeight: '600' },
  mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  mealIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  mealInfo: { flex: 1, minWidth: 0 },
  mealName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  mealMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  mealKcal: { fontSize: 14, fontWeight: '600', color: '#60A5FA' },
  alertCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, minHeight: 140 },
  alertContent: { flexDirection: 'row', padding: 16, gap: 12 },
  alertText: { flex: 1, minWidth: 0 },
  alertTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  alertBody: { fontSize: 13, color: 'rgba(255,255,255,0.95)', marginBottom: 8 },
  alertSub: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginTop: 4 },
  alertBullet: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  gapsCard: { borderWidth: 1, borderColor: '#FED7AA' },
  gapsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  gapsIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  gapsDesc: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  gapRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  gapLabel: { fontSize: 14, color: '#374151' },
  gapValue: { fontSize: 14, fontWeight: '600', color: '#374151' },
  progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#EA580C', borderRadius: 4 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  tipContent: { flex: 1, minWidth: 0 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  tipBody: { fontSize: 13, color: '#4B5563' },
  insightsCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24, minHeight: 120 },
  insightsContent: { flexDirection: 'row', padding: 16, gap: 12 },
  insightsText: { flex: 1 },
  insightsTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 10 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  insightBody: { fontSize: 13, color: 'rgba(255,255,255,0.95)', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  addFoodSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingHorizontal: 20, paddingBottom: 24 },
  addFoodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addFoodTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  addFoodSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827', padding: 0 },
  addFoodScroll: { maxHeight: 400 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5 },
  recentScroll: { marginTop: 8, marginBottom: 8 },
  recentCard: { width: 140, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginRight: 12 },
  recentEmoji: { fontSize: 28, marginBottom: 6 },
  recentName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  recentKcal: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  foodEmoji: { fontSize: 24 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  foodMacros: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  customizeSheetWrap: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  customizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  customizeTitleWhite: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  customizeSubtitleWhite: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  customizeBody: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  foodDetailCard: { backgroundColor: '#FFF7ED', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24 },
  foodDetailIcon: { fontSize: 48, marginBottom: 8 },
  foodDetailName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  foodDetailMacros: { fontSize: 14, color: '#6B7280', marginTop: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  servingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 },
  servingsBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  servingsValue: { fontSize: 24, fontWeight: '700', color: '#111827', minWidth: 40, textAlign: 'center' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  categoryBtn: { width: '47%', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  categoryBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginTop: 8 },
  categoryLabelActive: { color: '#2563EB' },
  logServingBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, gap: 10 },
  logServingBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  cancelBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 12 },
  cancelBtnText: { fontSize: 16, color: '#6B7280' },
});
