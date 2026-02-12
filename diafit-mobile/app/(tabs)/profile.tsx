import { View, Text, ScrollView, Pressable, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

const PROFILE_KEY = '@diafit_profile_complete';

const cardShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchProfile();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchProfile]);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.avatarLetter}>{(profile?.full_name?.[0] || profile?.email?.[0] || '?').toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{loading ? '…' : (profile?.full_name?.trim() || 'User')}</Text>
            <Text style={styles.userEmail}>{loading ? '…' : (profile?.email || '')}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValueBlue}>127</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValueGreen}>89%</Text>
              <Text style={styles.statLabel}>In Range</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValueOrange}>342</Text>
              <Text style={styles.statLabel}>Readings</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Pressable style={styles.menuRow} onPress={() => router.push('/personal-info')}>
            <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="account-outline" size={22} color="#2563EB" />
            </View>
            <Text style={styles.menuLabel}>Personal Information</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
          <Pressable style={[styles.menuRow, styles.menuRowBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
              <MaterialCommunityIcons name="heart-outline" size={22} color="#DC2626" />
            </View>
            <Text style={styles.menuLabel}>Health Profile</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
          <Pressable style={[styles.menuRow, styles.menuRowBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: '#EDE9FE' }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <Pressable style={styles.menuRow} onPress={() => router.push('/settings')}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
              <MaterialCommunityIcons name="cog-outline" size={22} color="#6B7280" />
            </View>
            <Text style={styles.menuLabel}>App Settings</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
          <Pressable style={[styles.menuRow, styles.menuRowBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color="#16A34A" />
            </View>
            <Text style={styles.menuLabel}>Privacy & Security</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <Pressable style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="help-circle-outline" size={22} color="#EA580C" />
            </View>
            <Text style={styles.menuLabel}>Help Center</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
          <Pressable style={[styles.menuRow, styles.menuRowBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={22} color="#2563EB" />
            </View>
            <Text style={styles.menuLabel}>Terms & Privacy</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={async () => {
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
          }}
        >
          <Text style={styles.logoutText}>→ Log Out</Text>
        </Pressable>

        <Text style={styles.footer}>Diafit v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarLetter: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
    ...cardShadow,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14, paddingHorizontal: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValueBlue: { fontSize: 24, fontWeight: '800', color: '#2563EB' },
  statValueGreen: { fontSize: 24, fontWeight: '800', color: '#16A34A' },
  statValueOrange: { fontSize: 24, fontWeight: '800', color: '#EA580C' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginTop: 16, marginBottom: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
  logoutBtn: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    ...cardShadow,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
  footer: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 24 },
});
