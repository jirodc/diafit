import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { parseAuthFragment } from '../../lib/authDeepLink';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // If the app opened straight to this route, tokens may still be only in the URL.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || cancelled) return;
      const url = await Linking.getInitialURL();
      if (!url || cancelled) return;
      const parsed = parseAuthFragment(url);
      if (parsed?.type !== 'recovery') return;
      await supabase.auth.setSession({
        access_token: parsed.access_token,
        refresh_token: parsed.refresh_token,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    const p = password.trim();
    if (p.length < 6) {
      Alert.alert('Password', 'Use at least 6 characters.');
      return;
    }
    if (p !== confirm.trim()) {
      Alert.alert('Password', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: p });
      if (error) throw error;
      Alert.alert('Password updated', 'You can continue with your new password.', [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not update password.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={[styles.header, { paddingTop: insets.top + 24 }]}
      >
        <Text className="text-2xl font-bold text-white text-center px-6">New password</Text>
        <Text className="text-base text-white/90 mt-2 text-center px-6">
          Choose a new password for your account.
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 -mt-10 px-6"
      >
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-sm font-medium text-gray-800 mb-2">New password</Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3.5 mb-4">
            <MaterialCommunityIcons name="lock-outline" size={22} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="At least 6 characters"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
            />
            <Pressable onPress={() => setShow(!show)} hitSlop={12}>
              <MaterialCommunityIcons
                name={show ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#6B7280"
              />
            </Pressable>
          </View>

          <Text className="text-sm font-medium text-gray-800 mb-2">Confirm password</Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3.5 mb-6">
            <MaterialCommunityIcons name="lock-check-outline" size={22} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Re-enter password"
              placeholderTextColor="#9CA3AF"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!show}
            />
          </View>

          <Pressable
            onPress={() => void submit()}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9 },
              loading && { opacity: 0.7 },
            ]}
          >
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.primaryBtnInner}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Update password</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingBottom: 56,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  primaryBtn: { borderRadius: 12, overflow: 'hidden' },
  primaryBtnInner: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
