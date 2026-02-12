import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PROFILE_KEY = '@diafit_profile_complete';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (isSignUp) {
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email || 'your@email.com' },
      });
    } else {
      await AsyncStorage.setItem(PROFILE_KEY, 'true');
      router.replace('/(tabs)/home');
    }
  };

  const iconColor = '#6B7280';

  return (
    <View style={styles.screen}>
      <View className="flex-1">
        {/* Blue gradient header – extends to top so status bar (time) sits on blue */}
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#60A5FA']}
          style={[styles.header, { paddingTop: insets.top + 24 }]}
        >
          <View className="items-center">
            <View className="w-16 h-16 rounded-2xl bg-[#93C5FD] items-center justify-center mb-4">
              <MaterialCommunityIcons
                name="heart-pulse"
                size={32}
                color="#FFFFFF"
              />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              Welcome to Diafit
            </Text>
            <Text className="text-base text-white/95 mt-1 text-center">
              {isSignUp
                ? 'Create your account to get started'
                : 'Sign in to continue your journey'}
            </Text>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 -mt-14"
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* White form card */}
            <View className="bg-white rounded-t-[28px] rounded-b-2xl px-6 pt-8 pb-6 shadow-lg min-h-[320px]">
              <Text className="text-sm font-medium text-gray-800 mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-4">
                <MaterialCommunityIcons
                  name="email-outline"
                  size={22}
                  color={iconColor}
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="your.email@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text className="text-sm font-medium text-gray-800 mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-2">
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={22}
                  color={iconColor}
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={iconColor}
                  />
                </Pressable>
              </View>

              {!isSignUp && (
                <Pressable className="self-end mb-4" hitSlop={8}>
                  <Text className="text-sm text-[#3B82F6] font-medium">
                    Forgot Password?
                  </Text>
                </Pressable>
              )}

              {isSignUp && (
                <>
                  <Text className="text-sm font-medium text-gray-800 mb-2">
                    Confirm Password
                  </Text>
                  <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-4">
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={22}
                      color={iconColor}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder="Re-enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color={iconColor}
                      />
                    </Pressable>
                  </View>
                </>
              )}

              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View className="flex-row items-center gap-3 mb-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-500 text-sm font-normal">OR</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <Pressable className="flex-row items-center border border-gray-200 rounded-xl py-4 mb-3 px-4 active:opacity-90">
                <MaterialCommunityIcons name="google" size={22} color="#EA4335" />
                <Text className="ml-3 text-base font-medium text-gray-800">
                  Continue with Google
                </Text>
              </Pressable>
              <Pressable className="flex-row items-center border border-gray-200 rounded-xl py-4 px-4 active:opacity-90">
                <MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />
                <Text className="ml-3 text-base font-medium text-gray-800">
                  Continue with Facebook
                </Text>
              </Pressable>
            </View>

            {/* Footer links */}
            <View className="items-center mt-8">
              <Text className="text-gray-600 text-sm">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text
                  onPress={() => setIsSignUp(!isSignUp)}
                  className="text-[#3B82F6] font-semibold"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
              <Text className="text-gray-500 text-xs mt-5 text-center">
                By continuing, you agree to our
              </Text>
              <Text className="text-center mt-1">
                <Text className="text-[#3B82F6] text-xs font-medium">
                  Terms of Service
                </Text>
                <Text className="text-gray-500 text-xs"> and </Text>
                <Text className="text-[#3B82F6] text-xs font-medium">
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    marginBottom: 24,
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
  },
});
