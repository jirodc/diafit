import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const PROFILE_KEY = '@diafit_profile_complete';

function parseSessionFromUrl(url: string): { access_token: string; refresh_token: string } | null {
  try {
    const hashIdx = url.indexOf('#');
    if (hashIdx === -1) return null;
    const fragment = url.substring(hashIdx + 1);
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) return { access_token, refresh_token };
    return null;
  } catch {
    return null;
  }
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle OAuth redirect when user returns from browser
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const sessionParams = parseSessionFromUrl(event.url);
      if (!sessionParams) return;
      try {
        const { error } = await supabase.auth.setSession(sessionParams);
        if (error) throw error;
        router.replace('/');
      } catch (e) {
        if (__DEV__) console.error('OAuth session error:', e);
      }
    };
    const sub = Linking.addEventListener('url', handleDeepLink);
    return () => sub.remove();
  }, [router]);

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setErrorMessage('');
    setOauthLoading(provider);
    try {
      // In Expo Go, custom scheme isn't registered → Safari can't open diafitmobile:// and shows "couldn't connect".
      // Use default redirect (tunnel URL when using expo start --tunnel) so Safari loads a real https page.
      const isExpoGo = Constants.appOwnership === 'expo';
      const redirectTo = isExpoGo
        ? makeRedirectUri({ path: 'auth/callback' })
        : makeRedirectUri({ scheme: 'diafitmobile', path: 'auth/callback' });
      if (__DEV__) console.log('OAuth redirect URL (add this in Supabase if needed):', redirectTo);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      const url = data?.url;
      if (!url) throw new Error('No OAuth URL returned');
      const res = await WebBrowser.openAuthSessionAsync(url, redirectTo);
      if (res.type === 'success' && res.url) {
        const sessionParams = parseSessionFromUrl(res.url);
        if (sessionParams) {
          const { error: sessionError } = await supabase.auth.setSession(sessionParams);
          if (sessionError) throw sessionError;
          router.replace('/');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `${provider} sign-in failed. Try again.`;
      setErrorMessage(msg);
      if (__DEV__) console.error('OAuth error:', err);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!trimmedPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (isSignUp) {
      if (trimmedPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (trimmedPassword !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: { full_name: '' },
          },
        });
        if (error) throw error;
        // Supabase may or may not require email confirmation depending on project settings
        if (data.user && !data.session) {
          // Email confirmation required – go to verify screen
          router.push({
            pathname: '/(auth)/verify-email',
            params: { email: trimmedEmail },
          });
        } else if (data.session) {
          router.replace('/');
        } else {
          router.push({
            pathname: '/(auth)/verify-email',
            params: { email: trimmedEmail },
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        if (error) throw error;
        if (data.session) {
          router.replace('/');
        }
      }
    } catch (err: unknown) {
      let message = 'Something went wrong. Please try again.';
      if (err instanceof Error) {
        console.error('Auth error:', err);
        // Handle specific Supabase errors
        if (err.message.includes('email') && err.message.includes('already')) {
          message = 'This email is already registered. Please sign in instead.';
        } else if (err.message.includes('password')) {
          message = 'Invalid password. Please check and try again.';
        } else if (err.message.includes('rate limit') || err.message.includes('too many') || err.message.includes('Email rate limit')) {
          message = 'Email rate limit exceeded. Supabase allows only a few sign-up emails per hour. Wait about 1 hour and try again, or use a different email address.';
        } else {
          message = err.message;
        }
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
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
              {errorMessage ? (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
                  <MaterialCommunityIcons name="alert-circle" size={22} color="#DC2626" />
                  <Text className="flex-1 ml-2 text-sm text-red-700">{errorMessage}</Text>
                </View>
              ) : null}
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
                disabled={loading}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, loading && styles.primaryButtonDisabled]}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.primaryButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              <View className="flex-row items-center gap-3 mb-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-500 text-sm font-normal">OR</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <Pressable
                onPress={() => handleOAuthSignIn('google')}
                disabled={!!oauthLoading}
                className="flex-row items-center border border-gray-200 rounded-xl py-4 mb-3 px-4 active:opacity-90"
              >
                {oauthLoading === 'google' ? (
                  <ActivityIndicator size="small" color="#EA4335" style={{ marginRight: 12 }} />
                ) : (
                  <MaterialCommunityIcons name="google" size={22} color="#EA4335" />
                )}
                <Text className="ml-3 text-base font-medium text-gray-800">
                  {oauthLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleOAuthSignIn('facebook')}
                disabled={!!oauthLoading}
                className="flex-row items-center border border-gray-200 rounded-xl py-4 px-4 active:opacity-90"
              >
                {oauthLoading === 'facebook' ? (
                  <ActivityIndicator size="small" color="#1877F2" style={{ marginRight: 12 }} />
                ) : (
                  <MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />
                )}
                <Text className="ml-3 text-base font-medium text-gray-800">
                  {oauthLoading === 'facebook' ? 'Signing in...' : 'Continue with Facebook'}
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
  primaryButtonDisabled: {
    opacity: 0.7,
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
