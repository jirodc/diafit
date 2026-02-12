import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const cardShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [glucoseReminders, setGlucoseReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [glucoseUnit, setGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = () => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      router.replace('/(auth)/welcome');
    }, 1500);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Pressable style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="account-outline" size={22} color="#2563EB" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Personal Information</Text>
              <Text style={styles.rowSub}>Name, email, phone number</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
          <Pressable style={[styles.row, styles.rowBorder]}>
            <View style={[styles.rowIcon, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="water-outline" size={22} color="#16A34A" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Health Profile</Text>
              <Text style={styles.rowSub}>Age, weight, diabetes type</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#EDE9FE' }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#7C3AED" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Push Notifications</Text>
              <Text style={styles.rowSub}>Enable all notifications</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: '#3B82F6' }} thumbColor="#FFFFFF" />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={[styles.rowIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="water-outline" size={22} color="#2563EB" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Glucose Reminders</Text>
              <Text style={styles.rowSub}>Remind to check glucose</Text>
            </View>
            <Switch value={glucoseReminders} onValueChange={setGlucoseReminders} trackColor={{ true: '#3B82F6' }} thumbColor="#FFFFFF" />
          </View>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#EA580C" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Meal Reminders</Text>
              <Text style={styles.rowSub}>Remind to log meals</Text>
            </View>
            <Switch value={mealReminders} onValueChange={setMealReminders} trackColor={{ true: '#3B82F6' }} thumbColor="#FFFFFF" />
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#EDE9FE' }]}>
              <MaterialCommunityIcons name="weather-night" size={22} color="#5B21B6" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Dark Mode</Text>
              <Text style={styles.rowSub}>Coming soon</Text>
            </View>
            <Switch value={false} disabled trackColor={{ false: '#E5E7EB' }} thumbColor="#9CA3AF" />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={[styles.rowIcon, { backgroundColor: '#FCE7F3' }]}>
              <MaterialCommunityIcons name="water-outline" size={22} color="#DB2777" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Glucose Units</Text>
              <Text style={styles.rowSub}>Choose your preferred unit</Text>
            </View>
          </View>
          <View style={styles.unitRow}>
            <Pressable
              style={[styles.unitBtn, glucoseUnit === 'mg/dL' && styles.unitBtnActive]}
              onPress={() => setGlucoseUnit('mg/dL')}
            >
              <Text style={[styles.unitBtnText, glucoseUnit === 'mg/dL' && styles.unitBtnTextActive]}>mg/dL</Text>
            </Pressable>
            <Pressable
              style={[styles.unitBtn, glucoseUnit === 'mmol/L' && styles.unitBtnActive]}
              onPress={() => setGlucoseUnit('mmol/L')}
            >
              <Text style={[styles.unitBtnText, glucoseUnit === 'mmol/L' && styles.unitBtnTextActive]}>mmol/L</Text>
            </Pressable>
          </View>
          <Pressable style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="earth" size={22} color="#16A34A" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Language</Text>
              <Text style={styles.rowSub}>English (US)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Privacy & Security */}
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.card}>
          <Pressable style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color="#16A34A" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Privacy Policy</Text>
              <Text style={styles.rowSub}>Read our privacy policy</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
          <Pressable style={[styles.row, styles.rowBorder]}>
            <View style={[styles.rowIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="download-outline" size={22} color="#2563EB" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Export Data</Text>
              <Text style={styles.rowSub}>Download your health data</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>
        <View style={[styles.card, styles.dangerCard]}>
          <Pressable style={styles.row} onPress={() => setDeleteModalVisible(true)}>
            <View style={[styles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
              <MaterialCommunityIcons name="delete-outline" size={22} color="#DC2626" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: '#DC2626' }]}>Delete Account</Text>
              <Text style={styles.rowSub}>Permanently delete your account</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        <Text style={styles.footer}>Diafit v1.0.0</Text>
        <Text style={styles.footerSub}>© 2026 Diafit. All rights reserved.</Text>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => !deleteLoading && setDeleteModalVisible(false)}>
          <Pressable style={styles.deleteModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteIconWrap}>
              <MaterialCommunityIcons name="alert" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.deleteTitle}>Delete Account?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete your account? All your health data, workout history, and personal information will be permanently deleted. This action cannot be undone.
            </Text>
            <View style={styles.deleteActions}>
              <Pressable
                style={styles.deleteCancelBtn}
                onPress={() => !deleteLoading && setDeleteModalVisible(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteConfirmBtn}
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.deleteConfirmText}>Loading...</Text>
                  </>
                ) : (
                  <Text style={styles.deleteConfirmText}>Delete Account</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 10, marginTop: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    ...cardShadow,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  rowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  rowSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  unitRow: { flexDirection: 'row', gap: 12, padding: 14, paddingTop: 0 },
  unitBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
  unitBtnActive: { backgroundColor: '#2563EB' },
  unitBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  unitBtnTextActive: { color: '#FFFFFF' },
  dangerCard: { borderWidth: 1, borderColor: '#FECACA' },
  footer: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 24 },
  footerSub: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  deleteModalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 },
  deleteIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  deleteTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 12 },
  deleteMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  deleteActions: { flexDirection: 'row', gap: 12 },
  deleteCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  deleteCancelText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  deleteConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  deleteConfirmText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
