import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BasicInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' |  null>(null);
  const [height, setHeight] = useState('170');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weight, setWeight] = useState('70');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={[styles.header, { paddingTop: insets.top + 48 }]}
      >
        <View className="items-center">
          <View className="w-16 h-16 rounded-2xl bg-white/30 items-center justify-center mb-4">
            <MaterialCommunityIcons
              name="account-outline"
              size={32}
              color="#FFFFFF"
            />
          </View>
          <Text className="text-2xl font-bold text-white">Basic Information</Text>
          <Text className="text-base text-white/90 mt-1">
            Tell us about yourself
          </Text>
          <View className="flex-row gap-2 mt-4">
            <View className="w-6 h-2 rounded-full bg-white" />
            <View className="w-2 h-2 rounded-full bg-white/50" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-8 mx-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl rounded-b-2xl px-6 pt-8 pb-6 shadow-lg">
          <Text className="text-sm font-medium text-gray-600 mb-2">Age</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900 mb-5"
            placeholder="Enter your age"
            placeholderTextColor="#9CA3AF"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />

          <Text className="text-sm font-medium text-gray-600 mb-2">Gender</Text>
          <View className="flex-row gap-3 mb-5">
            {[
              { value: 'male' as const, label: 'Male' },
              { value: 'female' as const, label: 'Female' },
        
            ].map(({ value, label }) => (
              <Pressable
                key={value}
                onPress={() => setGender(value)}
                className={`flex-1 py-4 rounded-xl border ${
                  gender === value
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    gender === value ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-sm font-medium text-gray-600 mb-2">Height</Text>
          <View className="flex-row gap-2 mb-5">
            <TextInput
              className="flex-1 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
            />
            <View className="flex-row rounded-xl overflow-hidden border border-gray-200">
              <Pressable
                onPress={() => setHeightUnit('cm')}
                className={`px-4 py-4 ${heightUnit === 'cm' ? 'bg-[#3B82F6]' : 'bg-white'}`}
              >
                <Text
                  className={`font-medium ${heightUnit === 'cm' ? 'text-white' : 'text-gray-500'}`}
                >
                  cm
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setHeightUnit('ft')}
                className={`px-4 py-4 border-l border-gray-200 ${heightUnit === 'ft' ? 'bg-[#3B82F6]' : 'bg-white'}`}
              >
                <Text
                  className={`font-medium ${heightUnit === 'ft' ? 'text-white' : 'text-gray-500'}`}
                >
                  ft
                </Text>
              </Pressable>
            </View>
          </View>

          <Text className="text-sm font-medium text-gray-600 mb-2">Weight</Text>
          <View className="flex-row gap-2 mb-8">
            <TextInput
              className="flex-1 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
            <View className="flex-row rounded-xl overflow-hidden border border-gray-200">
              <Pressable
                onPress={() => setWeightUnit('kg')}
                className={`px-4 py-4 ${weightUnit === 'kg' ? 'bg-[#3B82F6]' : 'bg-white'}`}
              >
                <Text
                  className={`font-medium ${weightUnit === 'kg' ? 'text-white' : 'text-gray-500'}`}
                >
                  kg
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setWeightUnit('lbs')}
                className={`px-4 py-4 border-l border-gray-200 ${weightUnit === 'lbs' ? 'bg-[#3B82F6]' : 'bg-white'}`}
              >
                <Text
                  className={`font-medium ${weightUnit === 'lbs' ? 'text-white' : 'text-gray-500'}`}
                >
                  lbs
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/diabetes-profile')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Text style={styles.primaryButtonText}></Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingBottom: 64,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
