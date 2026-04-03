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
import React, { useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { getPasswordResetRedirectUrl } from '../../lib/authDeepLink';
import { describeAuthEmailError } from '../../lib/authEmailErrors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendReset = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert('Email required', 'Enter the email address for your account.');
      return;
    }

    const redirectTo = getPasswordResetRedirectUrl();
    if (__DEV__) {
      console.log('[Forgot password] redirectTo (add in Supabase Redirect URLs):', redirectTo);
    }

    setLoading(true);
    try {
      // Supabase resetPasswordForEmail always succeeds for unknown emails (anti-enumeration).
      // We check auth.users via RPC so the user gets a clear "no account" message.
      const { data: registered, error: rpcError } = await supabase.rpc(
        'is_auth_email_registered',
        { check_email: trimmed }
      );
      if (rpcError) throw rpcError;
      if (!registered) {
        Alert.alert(
          'No account found',
          'There is no Diafit account for this email. Try the address you used to sign up, or create a new account.'
        );
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      if (error) throw error;
      router.push({
        pathname: '/(auth)/reset-password-otp',
        params: { email: trimmed },
      } as Href);
    } catch (e: unknown) {
      const { title, message } = describeAuthEmailError(e);
      Alert.alert(title, message);
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
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View className="items-center px-6">
          <MaterialCommunityIcons name="lock-reset" size={40} color="#FFFFFF" />
          <Text className="text-2xl font-bold text-white text-center mt-4">Forgot password</Text>
          <Text className="text-base text-white/90 mt-2 text-center">
            We&apos;ll email you a code to enter in the app, then you can choose a new password.
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 -mt-10 px-6"
      >
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-sm font-medium text-gray-800 mb-2">Email</Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3.5 mb-6">
            <MaterialCommunityIcons name="email-outline" size={22} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={() => void sendReset()}
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
                <Text style={styles.primaryBtnText}>Send reset code</Text>
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
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 4,
  },
  primaryBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryBtnInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
