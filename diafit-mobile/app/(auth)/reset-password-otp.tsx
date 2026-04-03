import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { getPasswordResetRedirectUrl } from '../../lib/authDeepLink';
import { describeAuthEmailError } from '../../lib/authEmailErrors';

/** Match verify-email: Supabase Cloud commonly sends 8-digit OTPs. */
const CODE_LENGTH = 8;
/** Longer cooldown reduces accidental hits on Supabase’s hourly auth-email cap. */
const RESEND_COOLDOWN_SECONDS = 120;

export default function ResetPasswordOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = typeof emailParam === 'string' ? emailParam.trim().toLowerCase() : '';
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < CODE_LENGTH) newCode[index + i] = d;
      });
      setCode(newCode);
      const next = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[next]?.focus();
      return;
    }
    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, '');
    setCode(newCode);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const token = code.join('');
  const canVerify = token.length === CODE_LENGTH;

  const handleVerify = async () => {
    if (!canVerify || !email) return;
    setErrorMessage('');
    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      if (error) throw error;
      if (data.session) {
        router.replace('/(auth)/reset-password' as Href);
      } else {
        setErrorMessage('Could not start password reset. Try again or request a new code.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired code.';
      setErrorMessage(msg);
      if (__DEV__) console.error('Recovery OTP verify error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setErrorMessage('');
    setResending(true);
    try {
      const redirectTo = getPasswordResetRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert('Code sent', 'Check your email for a new reset code.', [{ text: 'OK' }]);
    } catch (err: unknown) {
      const { title, message } = describeAuthEmailError(err);
      setErrorMessage(message);
      Alert.alert(title, message);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <View style={styles.screen}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 text-center">No email provided.</Text>
          <Pressable
            onPress={() => router.replace('/(auth)/forgot-password' as Href)}
            className="mt-4 px-6 py-3 bg-[#3B82F6] rounded-xl"
          >
            <Text className="text-white font-semibold">Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View className="flex-1">
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#60A5FA']}
          style={[styles.header, { paddingTop: insets.top + 24 }]}
        >
          <View className="items-center px-4">
            <View className="w-20 h-20 rounded-full bg-[#93C5FD] items-center justify-center mb-4 border-2 border-white">
              <MaterialCommunityIcons name="lock-reset" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-2xl font-bold text-white text-center">Enter reset code</Text>
            <Text className="text-base text-white/90 mt-2 text-center">
              We sent a code to
            </Text>
            <Text className="text-lg font-bold text-white mt-1">{email}</Text>
          </View>
        </LinearGradient>

        <ScrollView
          className="flex-1 -mt-12 mx-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white rounded-t-3xl rounded-b-2xl px-6 pt-8 pb-6 shadow-lg">
            {errorMessage ? (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
                <MaterialCommunityIcons name="alert-circle" size={22} color="#DC2626" />
                <Text className="flex-1 ml-2 text-sm text-red-700">{errorMessage}</Text>
              </View>
            ) : null}
            <Text className="text-sm text-gray-500 mb-4">
              Enter the {CODE_LENGTH}-digit code from your email, then set a new password on the next
              screen.
            </Text>

            <View className="flex-row justify-between mb-6 gap-1">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className="flex-1 min-w-0 h-14 rounded-xl border border-gray-200 text-center text-lg font-bold text-gray-900"
                  value={digit}
                  onChangeText={(v) => handleCodeChange(v, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={CODE_LENGTH}
                />
              ))}
            </View>

            <Pressable
              onPress={() => void handleVerify()}
              disabled={!canVerify || verifying}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                (!canVerify || verifying) && styles.primaryButtonDisabled,
              ]}
            >
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.primaryButtonGradient}>
                {verifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Continue</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Text className="text-gray-500 text-sm text-center mb-1 mt-2">Didn&apos;t get a code?</Text>
            <Pressable
              onPress={() => void handleResend()}
              disabled={resending || resendCooldown > 0}
              className="mb-6"
            >
              {resending ? (
                <ActivityIndicator size="small" color="#3B82F6" style={{ alignSelf: 'center' }} />
              ) : resendCooldown > 0 ? (
                <Text className="text-gray-500 text-base font-medium text-center">
                  Resend in {resendCooldown}s
                </Text>
              ) : (
                <Text className="text-[#3B82F6] text-base font-medium text-center">Resend code</Text>
              )}
            </Pressable>

            <View className="bg-amber-50 rounded-2xl p-4 flex-row items-start border border-amber-100">
              <MaterialCommunityIcons name="information-outline" size={22} color="#D97706" />
              <Text className="flex-1 ml-3 text-sm text-amber-900">
                Add the reset code to your Supabase &quot;Reset password&quot; email template (Authentication →
                Emails), e.g. Your code: {'{{ .Token }}'} — so you can type it here without opening the link.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center justify-center mt-6"
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="#9CA3AF" />
            <Text className="ml-2 text-gray-500 text-base">Back</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingBottom: 80,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
