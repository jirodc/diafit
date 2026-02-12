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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

const PROFILE_KEY = '@diafit_profile_complete';
const CODE_LENGTH = 8; // Supabase Cloud sends an 8-digit OTP
const RESEND_COOLDOWN_SECONDS = 60; // Supabase rate limit: wait before allowing resend again

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = emailParam || '';
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Count down resend cooldown every second
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
        type: 'signup',
      });
      if (error) throw error;
      if (data.session) {
        await AsyncStorage.setItem(PROFILE_KEY, 'true');
        router.replace('/(auth)/basic-info');
      } else {
        router.replace('/(auth)/basic-info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired code. Try again or resend.';
      setErrorMessage(msg);
      if (__DEV__) console.error('Verify OTP error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setErrorMessage('');
    setResending(true);
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        console.error('Resend error:', error);
        throw error;
      }
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert(
        'Code sent',
        'A new verification code has been sent to your email. Please check your inbox and spam folder.',
        [{ text: 'OK' }]
      );
    } catch (err: unknown) {
      let msg = 'Could not resend code. ';
      if (err instanceof Error) {
        console.error('Resend error details:', err);
        if (err.message.includes('rate limit') || err.message.includes('too many') || err.message.includes('Email rate limit')) {
          msg += 'Supabase allows only a few emails per hour. Wait at least 1 hour before requesting another code, or try signing up with a different email.';
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } else if (err.message.includes('email')) {
          msg += 'Please check your email address and try again.';
        } else {
          msg += err.message;
        }
      } else {
        msg += 'Try again later.';
      }
      setErrorMessage(msg);
      Alert.alert('Error', msg);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <View style={styles.screen}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 text-center">No email provided. Please sign up again.</Text>
          <Pressable onPress={() => router.replace('/(auth)/welcome')} className="mt-4 px-6 py-3 bg-[#3B82F6] rounded-xl">
            <Text className="text-white font-semibold">Back to Sign Up</Text>
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
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-[#93C5FD] items-center justify-center mb-4 border-2 border-white">
            <MaterialCommunityIcons
              name="email-outline"
              size={40}
              color="#FFFFFF"
            />
          </View>
          <Text className="text-2xl font-bold text-white">Verify Your Email</Text>
          <Text className="text-base text-white/90 mt-2 text-center">
            We've sent a code to
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
            Enter the 8-digit verification code sent to your email
          </Text>

          <View className="flex-row justify-between mb-6 gap-1">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
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
            onPress={handleVerify}
            disabled={!canVerify || verifying}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, (!canVerify || verifying) && styles.primaryButtonDisabled]}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.primaryButtonGradient}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify Email</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Text className="text-gray-500 text-sm text-center mb-1">
            Didn't receive the code?
          </Text>
          <Pressable
            onPress={handleResend}
            disabled={resending || resendCooldown > 0}
            className="mb-6"
          >
            {resending ? (
              <ActivityIndicator size="small" color="#3B82F6" style={{ alignSelf: 'center' }} />
            ) : resendCooldown > 0 ? (
              <Text className="text-gray-500 text-base font-medium text-center">
                Resend code in {resendCooldown}s
              </Text>
            ) : (
              <Text className="text-[#3B82F6] text-base font-medium text-center">Resend Code</Text>
            )}
          </Pressable>

          <View className="bg-blue-50 rounded-2xl p-4 flex-row items-center border border-blue-100">
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={22}
              color="#F59E0B"
            />
            <Text className="flex-1 ml-3 text-sm text-[#2563EB]">
              Check your spam folder if you don't see the email
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center justify-center mt-6"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color="#9CA3AF"
          />
          <Text className="ml-2 text-gray-500 text-base">Back to Sign In</Text>
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
