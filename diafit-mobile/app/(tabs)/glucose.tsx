import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const HEADER_HEIGHT = 140;
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

const CHART_DAYS = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
const BEFORE_HEIGHTS = [95, 88, 102, 92, 98, 90, 94];
const AFTER_HEIGHTS = [128, 142, 135, 138, 132, 145, 140];

const MEASURE_OPTIONS = [
  { id: 'before' as const, label: 'Before Meal', icon: 'silverware-fork-knife' as const },
  { id: 'after' as const, label: 'After Meal', icon: 'check' as const },
  { id: 'fasting' as const, label: 'Fasting', icon: 'white-balance-sunny' as const },
  { id: 'bedtime' as const, label: 'Bedtime', icon: 'weather-night' as const },
];

type HistoryEntry = {
  id: string;
  value: number;
  time: string;
  day: string;
  context: string;
};

const weeklyTips = [
  {
    id: '1',
    title: 'Meal Timing',
    icon: 'silverware-fork-knife' as const,
    color: '#16A34A',
    bg: '#DCFCE7',
    tip: "Your post-meal glucose is high at dinner. Try eating dinner earlier (before 7pm) and wait 2-3 hrs before bedtime.",
  },
  {
    id: '2',
    title: 'Post-Meal Activity',
    icon: 'run' as const,
    color: '#16A34A',
    bg: '#DCFCE7',
    tip: "A 10-15 min walk after meals can lower glucose by 20-30 mg/dL. Don't sit right after you eat, try a brisk walk.",
  },
  {
    id: '3',
    title: 'Hydration',
    icon: 'water' as const,
    color: '#7C3AED',
    bg: '#EDE9FE',
    tip: "Staying hydrated helps regulate blood sugar. Aim for 8 glasses of water daily, especially before meals.",
  },
];

const contextToLabel: Record<string, string> = {
  before: 'Before',
  after: 'After',
  fasting: 'Fasting',
  bedtime: 'Bedtime',
  random: 'Random',
};

function parseTimeToDate(timeStr: string): Date {
  const d = new Date();
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const pm = (match[3] || '').toLowerCase() === 'pm';
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
    d.setHours(h, m, 0, 0);
  }
  return d;
}

export default function GlucoseScreen() {
  const insets = useSafeAreaInsets();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [glucoseModalVisible, setGlucoseModalVisible] = useState(false);
  const [glucoseValue, setGlucoseValue] = useState('');
  const [glucoseContext, setGlucoseContext] = useState<'before' | 'after' | 'fasting' | 'bedtime'>('before');
  const [glucoseNotes, setGlucoseNotes] = useState('');
  const [measurementTime, setMeasurementTime] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchReadings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('glucose_readings')
      .select('id, value, context, reading_time, notes')
      .eq('user_id', user.id)
      .order('reading_time', { ascending: false })
      .limit(50);
    if (error) {
      if (__DEV__) console.error('glucose fetch error:', error);
      return;
    }
    setHistory(
      (data || []).map((r) => ({
        id: r.id,
        value: r.value,
        time: new Date(r.reading_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        day: new Date(r.reading_time).toLocaleDateString('en-US', { weekday: 'long' }),
        context: contextToLabel[r.context] || r.context,
      }))
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchReadings();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchReadings]);;

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

  const getDefaultTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleOpenGlucoseModal = () => {
    setGlucoseModalVisible(true);
    setGlucoseValue('');
    setGlucoseContext('before');
    setGlucoseNotes('');
    setMeasurementTime(getDefaultTime());
  };

  const handleGlucoseSave = async () => {
    const valueNum = parseInt(glucoseValue.trim(), 10);
    if (Number.isNaN(valueNum) || valueNum <= 0 || valueNum >= 1000) {
      Alert.alert('Invalid value', 'Enter a glucose value between 1 and 999 mg/dL.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be signed in to save.');
      return;
    }
    setSaving(true);
    const readingTime = parseTimeToDate(measurementTime || getDefaultTime());
    const { error } = await supabase.from('glucose_readings').insert({
      user_id: user.id,
      value: valueNum,
      context: glucoseContext,
      reading_time: readingTime.toISOString(),
      notes: glucoseNotes.trim() || null,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to save reading.');
      return;
    }
    await fetchReadings();
    setGlucoseModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      {/* Blue header – collapses/fades on scroll up, reappears on scroll down */}
      <Animated.View style={[styles.headerWrap, { height: headerHeight }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={[styles.header, { paddingTop: insets.top + 20 }]}
          >
            <View className="flex-row items-center justify-between mb-4" style={{ flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text className="text-sm text-white/90" numberOfLines={1}>Glucose Tracking</Text>
                <Text className="text-2xl font-bold text-white mt-1" numberOfLines={1}>Blood Glucose</Text>
              </View>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="water" size={24} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.segmentedControl}>
              <Pressable
                onPress={() => setTimeframe('week')}
                style={[
                  styles.segment,
                  timeframe === 'week' && styles.segmentActive,
                ]}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color={timeframe === 'week' ? '#3B82F6' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    timeframe === 'week' && styles.segmentTextActive,
                  ]}
                >
                  Week
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTimeframe('month')}
                style={[
                  styles.segment,
                  timeframe === 'month' && styles.segmentActive,
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color={timeframe === 'month' ? '#3B82F6' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    timeframe === 'month' && styles.segmentTextActive,
                  ]}
                >
                  Month
                </Text>
              </Pressable>
            </View>

            <Pressable style={styles.addButton} onPress={handleOpenGlucoseModal}>
              <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
              <Text className="text-white font-semibold text-base ml-5">Add glucose reading</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ height: topSpacerHeight }} />
        {/* Add glucose reading – below Week/Month, always visible in content */}
        <View style={styles.addButtonWrap}>
          <Pressable style={styles.addButtonContent} onPress={handleOpenGlucoseModal}>
            <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonLabel}>Add glucose reading</Text>
          </Pressable>
        </View>
        {/* Four stat cards */}
        <View style={[styles.statGrid, { paddingHorizontal: 20 }]}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <View style={[styles.statCardIcon, { backgroundColor: '#3B82F6' }]}>
              <MaterialCommunityIcons name="water" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statCardLabelBlue}>Avg Glucose</Text>
            <Text style={styles.statCardValueBlue}>124</Text>
            <Text style={styles.statCardUnitBlue}>mg/dL</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
            <View style={[styles.statCardIcon, { backgroundColor: '#16A34A' }]}>
              <MaterialCommunityIcons name="trending-down" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statCardLabelGreen}>Trend</Text>
            <Text style={styles.statCardValueGreen}>2.5%</Text>
            <Text style={styles.statCardUnitGreen}>improvement</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EDE9FE' }]}>
            <View style={[styles.statCardIcon, { backgroundColor: '#7C3AED' }]}>
              <MaterialCommunityIcons name="chart-line" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statCardLabelPurple}>In Range</Text>
            <Text style={styles.statCardValuePurple}>68%</Text>
            <Text style={styles.statCardUnitPurple}>of readings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
            <View style={[styles.statCardIcon, { backgroundColor: '#EA580C' }]}>
              <MaterialCommunityIcons name="trending-up" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statCardLabelOrange}>High/Low</Text>
            <Text style={styles.statCardValueOrange}>8</Text>
            <Text style={styles.statCardUnitOrange}>high readings</Text>
          </View>
        </View>

        {/* 7-Day Glucose Trend */}
        <View style={[styles.card, cardShadow, styles.chartCard, { marginHorizontal: 20 }]}>
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-lg font-bold text-gray-900">7-Day Glucose Trend</Text>
              <Text className="text-sm text-gray-500">Before & after meals</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="trending-down" size={16} color="#16A34A" />
              <Text className="text-sm font-semibold text-green-600">2.5%</Text>
            </View>
          </View>
          <View style={styles.chartRow}>
            {CHART_DAYS.map((day, i) => (
              <View key={day} style={styles.chartDay}>
                <View style={styles.chartBars}>
                  <View
                    style={[
                      styles.chartBar,
                      styles.chartBarBefore,
                      { height: BEFORE_HEIGHTS[i] },
                    ]}
                  />
                  <View
                    style={[
                      styles.chartBar,
                      styles.chartBarAfter,
                      { height: AFTER_HEIGHTS[i] },
                    ]}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-2">{day}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row items-center justify-center gap-4 mt-4">
            <View className="flex-row items-center gap-2">
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text className="text-xs text-gray-600">before meal</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text className="text-xs text-gray-600">after meal</Text>
            </View>
          </View>
          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-green-600">Target Range 80 - 130 mg/dL</Text>
              <Text className="text-lg font-bold text-gray-900">68%</Text>
            </View>
            <Text className="text-xs text-gray-500 mb-1">in target</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '68%' }]} />
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={[styles.insightsCard, { marginHorizontal: 20 }]}>
          <View className="flex-row items-center gap-2 mb-3">
            <View style={styles.insightsIcon}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color="#FFFFFF" />
            </View>
            <Text className="text-lg font-bold text-white">AI Insights</Text>
          </View>
          <Text className="text-sm text-white/95 leading-5 mb-3">
            We noticed your glucose spikes after breakfast (142 mg/dL) and dinner (156 mg/dL).
            Based on your meal logs, you're consuming high-carb foods like white bread and pasta.
          </Text>
          <Text className="text-sm font-semibold text-white mb-2">Recommendations:</Text>
          <Text className="text-sm text-white/90 mb-1">• Switch to whole grain alternatives.</Text>
          <Text className="text-sm text-white/90 mb-1">• Increase protein & fiber in meals.</Text>
          <Text className="text-sm text-white/90">• Eat smaller portions of carbs.</Text>
        </View>

        {/* Weekly Tips */}
        <Text className="text-base font-semibold text-gray-900 mb-3 mt-2" style={{ paddingHorizontal: 20 }}>Weekly Tips</Text>
        {weeklyTips.map((item) => (
          <View
            key={item.id}
            style={[styles.tipCard, { backgroundColor: item.bg }, cardShadow, { marginHorizontal: 20 }]}
          >
            <View style={[styles.tipIcon, { backgroundColor: item.color }]}>
              <MaterialCommunityIcons name={item.icon} size={22} color="#FFFFFF" />
            </View>
            <View className="flex-1 ml-3" style={{ minWidth: 0 }}>
              <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{item.title}</Text>
              <Text className="text-sm text-gray-600 mt-1" numberOfLines={3}>{item.tip}</Text>
            </View>
          </View>
        ))}

        {/* Input History */}
        <View className="flex-row items-center justify-between mt-6 mb-3" style={{ paddingHorizontal: 20 }}>
          <Text className="text-base font-semibold text-gray-900">Input History</Text>
          <Pressable>
            <Text className="text-sm font-semibold text-blue-600">View all</Text>
          </Pressable>
        </View>
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : (
        history.map((entry) => (
          <View key={entry.id} style={[styles.card, cardShadow, styles.historyRow, { marginHorizontal: 20 }]}>
            <View style={styles.historyValue}>
              <Text className="text-lg font-bold text-gray-900">{entry.value}</Text>
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm text-gray-500">{entry.time}, {entry.day}</Text>
              <View style={styles.contextPill}>
                <Text className="text-xs font-medium text-blue-600">{entry.context}</Text>
              </View>
            </View>
          </View>
        ))
        )}
      </Animated.ScrollView>

      {/* Log Glucose modal – Quick entry */}
      <Modal
        visible={glucoseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGlucoseModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.glucoseModalOverlay}
        >
          <Pressable style={styles.glucoseModalOverlay} onPress={() => setGlucoseModalVisible(false)}>
            <Pressable style={styles.glucoseModalCard} onPress={(e) => e.stopPropagation()}>
              <LinearGradient
                colors={['#2563EB', '#3B82F6']}
                style={styles.glucoseModalHeader}
              >
                <View style={styles.glucoseHeaderLeft}>
                  <View style={styles.glucoseHeaderIcon}>
                    <MaterialCommunityIcons name="water" size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.glucoseHeaderTitle}>Log Glucose</Text>
                    <Text style={styles.glucoseHeaderSubtitle}>Quick entry</Text>
                  </View>
                </View>
                <Pressable onPress={() => setGlucoseModalVisible(false)} hitSlop={12} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                </Pressable>
              </LinearGradient>
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.glucoseModalBody}>
                <Text style={[styles.glucoseLabel, { marginTop: 0 }]}>Glucose Level *</Text>
                <View style={styles.glucoseInputRow}>
                  <TextInput
                    style={styles.glucoseInput}
                    placeholder="Enter value"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={glucoseValue}
                    onChangeText={setGlucoseValue}
                  />
                  <Text style={styles.glucoseUnit}>mg/dL</Text>
                </View>

                <Text style={styles.glucoseLabel}>When did you measure?</Text>
                <View style={styles.contextGrid}>
                  {MEASURE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.id}
                      onPress={() => setGlucoseContext(opt.id)}
                      style={[
                        styles.contextCard,
                        glucoseContext === opt.id && styles.contextCardActive,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={opt.icon}
                        size={22}
                        color={glucoseContext === opt.id ? '#3B82F6' : '#6B7280'}
                      />
                      <Text
                        style={[
                          styles.contextCardText,
                          glucoseContext === opt.id && styles.contextCardTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.glucoseLabel}>Time of reading</Text>
                <TextInput
                  style={styles.glucoseInput}
                  placeholder="e.g. 10:30 AM"
                  placeholderTextColor="#9CA3AF"
                  value={measurementTime}
                  onChangeText={setMeasurementTime}
                />

                <Text style={styles.glucoseLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.glucoseInput, styles.notesInput]}
                  placeholder="How are you feeling?"
                  placeholderTextColor="#9CA3AF"
                  value={glucoseNotes}
                  onChangeText={setGlucoseNotes}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.glucoseModalActions}>
                  <Pressable onPress={() => setGlucoseModalVisible(false)} style={styles.glucoseCancelBtn} disabled={saving}>
                    <Text style={styles.glucoseCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleGlucoseSave} style={styles.glucoseSaveBtn} disabled={saving}>
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
                        <Text style={styles.glucoseSaveText}>Save Reading</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerWrap: {
    overflow: 'hidden',
  },
  header: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#3B82F6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    minHeight: 110,
    borderRadius: 16,
    padding: 14,
  },
  statCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardLabelBlue: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 8,
    fontWeight: '600',
  },
  statCardValueBlue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginTop: 4,
  },
  statCardUnitBlue: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  statCardLabelGreen: {
    fontSize: 12,
    color: '#16A34A',
    marginTop: 8,
    fontWeight: '600',
  },
  statCardValueGreen: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 4,
  },
  statCardUnitGreen: {
    fontSize: 12,
    color: '#16A34A',
    marginTop: 2,
  },
  statCardLabelPurple: {
    fontSize: 12,
    color: '#7C3AED',
    marginTop: 8,
    fontWeight: '600',
  },
  statCardValuePurple: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 4,
  },
  statCardUnitPurple: {
    fontSize: 12,
    color: '#7C3AED',
    marginTop: 2,
  },
  statCardLabelOrange: {
    fontSize: 12,
    color: '#EA580C',
    marginTop: 8,
    fontWeight: '600',
  },
  statCardValueOrange: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 4,
  },
  statCardUnitOrange: {
    fontSize: 12,
    color: '#EA580C',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  chartDay: {
    flex: 1,
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 100,
  },
  chartBar: {
    width: 12,
    borderRadius: 4,
    minHeight: 8,
  },
  chartBarBefore: {
    backgroundColor: '#3B82F6',
  },
  chartBarAfter: {
    backgroundColor: '#EF4444',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  insightsCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  insightsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyValue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contextPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  // Glucose Log Modal styles
  glucoseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  glucoseModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  glucoseModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  glucoseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glucoseHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glucoseHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  glucoseHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glucoseModalBody: {
    padding: 20,
    paddingBottom: 32,
  },
  glucoseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  glucoseInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingRight: 12,
  },
  glucoseInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  glucoseUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contextCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  contextCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  contextCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  contextCardTextActive: {
    color: '#2563EB',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  glucoseModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  glucoseCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  glucoseCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  glucoseSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  glucoseSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
