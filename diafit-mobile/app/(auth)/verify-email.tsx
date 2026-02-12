import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = emailParam || 'ads@gmail.com';
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

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
          <Text className="text-sm text-gray-500 mb-4">
            Enter the 6-digit verification code sent to your email
          </Text>

          <View className="flex-row justify-between mb-6">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                className="w-12 h-14 rounded-xl border border-gray-200 text-center text-xl font-bold text-gray-900"
                value={digit}
                onChangeText={(v) => handleCodeChange(v, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6}
              />
            ))}
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/basic-info')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Verify Email</Text>
            </LinearGradient>
          </Pressable>

          <Text className="text-gray-500 text-sm text-center mb-1">
            Didn't receive the code?
          </Text>
          <Pressable className="mb-6">
            <Text className="text-[#3B82F6] text-base font-medium text-center">
              Resend Code
            </Text>
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
