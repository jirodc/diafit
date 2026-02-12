import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const PROFILE_KEY = '@diafit_profile_complete';

const cardShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [glucoseReminders, setGlucoseReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              const { data, error } = await supabase.functions.invoke('delete-user');
              if (error) throw error;
              if (data?.error) throw new Error(data.error);
              await AsyncStorage.removeItem(PROFILE_KEY);
              try {
                await supabase.auth.signOut();
              } catch {
                // Session may already be invalid after delete
              }
              router.replace('/(auth)/welcome');
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : 'Failed to delete account.';
              Alert.alert(
                'Error',
                message + ' If you have not deployed the delete-user Edge Function, see the README in supabase/functions.'
              );
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications */}
        <View style={[styles.card, cardShadow]}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#374151" />
              <Text style={styles.settingLabel}>Enable Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
          {notificationsEnabled && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <MaterialCommunityIcons name="water" size={22} color="#3B82F6" />
                  <Text style={styles.settingLabel}>Glucose Reminders</Text>
                </View>
                <Switch
                  value={glucoseReminders}
                  onValueChange={setGlucoseReminders}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#EA580C" />
                  <Text style={styles.settingLabel}>Meal Reminders</Text>
                </View>
                <Switch
                  value={mealReminders}
                  onValueChange={setMealReminders}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <MaterialCommunityIcons name="pill" size={22} color="#7C3AED" />
                  <Text style={styles.settingLabel}>Medication Reminders</Text>
                </View>
                <Switch
                  value={medicationReminders}
                  onValueChange={setMedicationReminders}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </>
          )}
        </View>

        {/* App Preferences */}
        <View style={[styles.card, cardShadow]}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <Pressable style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="theme-light-dark" size={22} color="#374151" />
              <Text style={styles.settingLabel}>Theme</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>Light</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
            </View>
          </Pressable>
          <Pressable style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="translate" size={22} color="#374151" />
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>English</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
            </View>
          </Pressable>
        </View>

        {/* Data & Privacy */}
        <View style={[styles.card, cardShadow]}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <Pressable style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="download" size={22} color="#374151" />
              <Text style={styles.settingLabel}>Export Data</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>
          <Pressable
            style={styles.settingRow}
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="delete-outline" size={22} color="#DC2626" />
              <Text style={[styles.settingLabel, { color: '#DC2626' }]}>Delete Account</Text>
            </View>
            {deletingAccount ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={22} color="#DC2626" />
            )}
          </Pressable>
        </View>

        {/* About */}
        <View style={[styles.card, cardShadow]}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>
          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: '#6B7280',
  },
});
