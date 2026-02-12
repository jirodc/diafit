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
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
});

type Category = 'all' | 'blood_sugar' | 'cholesterol' | 'kidney';

interface LabResult {
  id: string;
  name: string;
  category: string;
  normalRange: string;
  date: string;
  value: string;
  status: 'normal' | 'monitor';
}

function parseValueAndUnit(val: string): { num: number; unit: string } {
  const trimmed = val.trim();
  const match = trimmed.match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = (match[2] || '').trim() || '—';
    return { num: Number.isNaN(num) ? 0 : num, unit };
  }
  const num = parseFloat(trimmed);
  return { num: Number.isNaN(num) ? 0 : num, unit: '—' };
}

function parseDateInput(s: string): string {
  if (!s.trim()) return new Date().toISOString().slice(0, 10);
  const d = new Date(s.trim());
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: 'All Tests', icon: 'test-tube' },
  { key: 'blood_sugar', label: 'Blood Sugar', icon: 'waveform' },
  { key: 'cholesterol', label: 'Cholesterol', icon: 'trending-up' },
  { key: 'kidney', label: 'Kidney', icon: 'water' },
];

const LAB_TIPS = [
  'Get HbA1c tested every 3 months',
  'Check cholesterol levels annually',
  'Monitor kidney function regularly',
  'Always fast before glucose tests',
];

export default function LabResultsScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category>('all');
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newCategory, setNewCategory] = useState('Blood Sugar');
  const [newValue, setNewValue] = useState('');
  const [newRange, setNewRange] = useState('');
  const [newDate, setNewDate] = useState('');

  const fetchResults = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('lab_results')
      .select('id, test_name, test_value, unit, reference_range, test_date, notes')
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });
    if (error) {
      if (__DEV__) console.error('lab_results fetch error:', error);
      return;
    }
    setResults(
      (data || []).map((r) => ({
        id: r.id,
        name: r.test_name,
        category: 'Blood Sugar',
        normalRange: r.reference_range || '—',
        date: new Date(r.test_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        value: `${r.test_value}${r.unit ? ` ${r.unit}` : ''}`,
        status: 'normal' as const,
      }))
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchResults();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchResults]);

  const totalTests = results.length;
  const normalCount = results.filter((r) => r.status === 'normal').length;
  const attentionCount = results.filter((r) => r.status === 'monitor').length;

  const filteredResults =
    category === 'all'
      ? results
      : results.filter((r) => {
          if (category === 'blood_sugar') return r.category === 'Blood Sugar';
          if (category === 'cholesterol') return r.category === 'Cholesterol';
          if (category === 'kidney') return r.category === 'Kidney';
          return true;
        });

  const handleSaveResult = async () => {
    if (!newTestName.trim() || !newValue.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be signed in to save.');
      return;
    }
    setSaving(true);
    const { num: testValue, unit } = parseValueAndUnit(newValue);
    const testDate = parseDateInput(newDate);
    const { error } = await supabase.from('lab_results').insert({
      user_id: user.id,
      test_name: newTestName.trim(),
      test_value: testValue,
      unit: unit,
      reference_range: newRange.trim() || null,
      test_date: testDate,
      notes: null,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to save result.');
      return;
    }
    await fetchResults();
    setShowAddModal(false);
    setNewTestName('');
    setNewCategory('Blood Sugar');
    setNewValue('');
    setNewRange('');
    setNewDate('');
  };

  return (
    <View style={styles.screen}>
      {/* Blue gradient header - extends to top, status bar visible on top */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View className="flex-row items-start justify-between mb-4" style={{ flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text className="text-sm text-white/90" numberOfLines={1}>Track Your Health</Text>
            <Text className="text-2xl font-bold text-white mt-1" numberOfLines={1}>Lab Results</Text>
            <Text className="text-sm text-white/90 mt-1" numberOfLines={2}>
              Keep all your test results in one place
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="test-tube" size={24} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Summary card */}
        <View style={[styles.summaryCard, cardShadow, { marginTop: -20, marginHorizontal: 20 }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconBlue}>
                <MaterialCommunityIcons name="test-tube" size={20} color="#FFFFFF" />
              </View>
              <Text className="text-sm font-semibold text-gray-900">{totalTests} Total Tests</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconGreen}>
                <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
              </View>
              <Text className="text-sm font-semibold text-gray-900">{normalCount} Normal</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconOrange}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#FFFFFF" />
              </View>
              <Text className="text-sm font-semibold text-gray-900">{attentionCount} Needs Attention</Text>
            </View>
          </View>
        </View>

        {/* Add New Lab Result button */}
        <Pressable
          style={[styles.addButton, { marginHorizontal: 20 }]}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base ml-2">Add New Lab Result</Text>
        </Pressable>

        {/* Categories */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text className="text-base font-semibold text-gray-900 mt-6 mb-3">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-3">
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={[
                    styles.categoryPill,
                    category === cat.key && styles.categoryPillActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={18}
                    color={category === cat.key ? '#FFFFFF' : '#3B82F6'}
                  />
                  <Text
                    style={[
                      styles.categoryPillText,
                      category === cat.key && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recent Results */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text className="text-base font-semibold text-gray-900 mb-3">Recent Results</Text>
        </View>
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : (
        filteredResults.map((result) => (
          <View key={result.id} style={[styles.resultCard, cardShadow, { marginHorizontal: 20, marginBottom: 12 }]}>
            <View className="flex-row items-start justify-between">
              <View
                style={[
                  styles.resultStatusIcon,
                  result.status === 'normal' ? styles.resultStatusNormal : styles.resultStatusMonitor,
                ]}
              >
                <MaterialCommunityIcons
                  name={result.status === 'normal' ? 'check' : 'clock-outline'}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View className="flex-1 ml-4" style={{ minWidth: 0 }}>
                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{result.name}</Text>
                <Text className="text-sm text-gray-500" numberOfLines={1}>{result.category}</Text>
                <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>Normal Range: {result.normalRange}</Text>
                <Text className="text-xs text-gray-400" numberOfLines={1}>{result.date}</Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-gray-900">{result.value}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    result.status === 'normal' ? styles.statusBadgeNormal : styles.statusBadgeMonitor,
                    { marginTop: 4 },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      result.status === 'normal' ? styles.statusBadgeTextNormal : styles.statusBadgeTextMonitor,
                    ]}
                  >
                    {result.status === 'normal' ? 'Normal' : 'Monitor'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))
        )}

        {/* Lab Test Tips */}
        <View style={[styles.tipsCard, cardShadow, { marginHorizontal: 20 }]}>
          <View className="flex-row items-center gap-2 mb-3">
            <View style={styles.tipsIcon}>
              <MaterialCommunityIcons name="information" size={22} color="#3B82F6" />
            </View>
            <Text className="text-base font-bold text-blue-600">Lab Test Tips</Text>
          </View>
          {LAB_TIPS.map((tip, i) => (
            <View key={i} className="flex-row items-start gap-2 mb-2">
              <Text className="text-blue-600">•</Text>
              <Text className="text-sm text-blue-600 flex-1">{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add New Lab Result Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <View className="flex-row items-center gap-3">
                  <View style={styles.modalHeaderIcon}>
                    <MaterialCommunityIcons name="test-tube" size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-gray-900">Add Lab Result</Text>
                    <Text className="text-sm text-gray-500">Enter your test details</Text>
                  </View>
                </View>
                <Pressable onPress={() => setShowAddModal(false)} hitSlop={12}>
                  <MaterialCommunityIcons name="close" size={28} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <Text className="text-sm font-semibold text-gray-900 mb-2">Test Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., HbA1c"
                  placeholderTextColor="#9CA3AF"
                  value={newTestName}
                  onChangeText={setNewTestName}
                />

                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-4">Category</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Blood Sugar', 'Cholesterol', 'Kidney', 'Other'].map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      style={[
                        styles.categoryChip,
                        newCategory === cat && styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newCategory === cat && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-4">Result Value *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 6.2% or 118 mg/dL"
                  placeholderTextColor="#9CA3AF"
                  value={newValue}
                  onChangeText={setNewValue}
                  keyboardType="decimal-pad"
                />

                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-4">Normal Range (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., < 5.7% or 70-100 mg/dL"
                  placeholderTextColor="#9CA3AF"
                  value={newRange}
                  onChangeText={setNewRange}
                />

                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-4">Date (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Feb 5, 2026"
                  placeholderTextColor="#9CA3AF"
                  value={newDate}
                  onChangeText={setNewDate}
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                  <Text className="text-base font-semibold text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSaveResult} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
                      <Text className="text-base font-semibold text-white ml-2">Save Result</Text>
                    </>
                  )}
                </Pressable>
              </View>
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
  header: {
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIconBlue: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconGreen: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconOrange: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  resultStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultStatusNormal: {
    backgroundColor: '#22C55E',
  },
  resultStatusMonitor: {
    backgroundColor: '#F59E0B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeNormal: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeMonitor: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextNormal: {
    color: '#16A34A',
  },
  statusBadgeTextMonitor: {
    color: '#EA580C',
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  tipsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: 360,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#2563EB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
});
