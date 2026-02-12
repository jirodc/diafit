import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const diabetesTypes = [
  { id: 'type1', title: 'Type 1 Diabetes', desc: "Body doesn't produce insulin" },
  { id: 'type2', title: 'Type 2 Diabetes', desc: "Body doesn't use insulin properly" },
  { id: 'prediabetes', title: 'Prediabetes', desc: 'Higher than normal blood sugar' },
  { id: 'gestational', title: 'Gestational', desc: 'During pregnancy' },
];

export default function DiabetesProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);
  const [yearDiagnosed, setYearDiagnosed] = useState('');
  const [targetGlucose, setTargetGlucose] = useState('100');
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be signed in.');
      return;
    }
    setSaving(true);
    const target = parseInt(targetGlucose.trim(), 10) || 100;
    const targetMin = Math.max(70, target - 25);
    const targetMax = Math.min(180, target + 25);
    const { error } = await supabase.from('diabetes_profiles').upsert(
      {
        user_id: user.id,
        diabetes_type: selected || 'other',
        year_diagnosed: yearDiagnosed.trim() ? parseInt(yearDiagnosed.trim(), 10) : null,
        target_glucose_min: targetMin,
        target_glucose_max: targetMax,
      },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to save diabetes profile.');
      return;
    }
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={[styles.header, { paddingTop: insets.top + 48 }]}
      >
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-[#93C5FD] items-center justify-center mb-4 border-2 border-white">
            <MaterialCommunityIcons
              name="water-outline"
              size={36}
              color="#FFFFFF"
            />
          </View>
          <Text className="text-2xl font-bold text-white">Diabetes Profile</Text>
          <Text className="text-base text-white/95 mt-1">
            Help us personalize your care
          </Text>
          <View className="flex-row gap-2 mt-4">
            <View className="w-2 h-2 rounded-full bg-white/50" />
            <View className="w-6 h-2 rounded-full bg-white" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-8 mx-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl rounded-b-2xl px-6 pt-8 pb-6 shadow-lg">
          <Text className="text-base font-semibold text-gray-800 mb-3">
            Diabetes Type
          </Text>
          {diabetesTypes.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setSelected(type.id)}
              className={`p-4 rounded-xl mb-3 flex-row items-center justify-between border-2 ${
                selected === type.id
                  ? 'border-[#3B82F6] bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View>
                <Text
                  className={`font-semibold text-base ${
                    selected === type.id ? 'text-[#2563EB]' : 'text-gray-900'
                  }`}
                >
                  {type.title}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">{type.desc}</Text>
              </View>
              {selected === type.id && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#3B82F6"
                />
              )}
            </Pressable>
          ))}

          <Text className="text-base font-semibold text-gray-800 mt-6 mb-2">
            Year Diagnosed
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900 mb-5"
            placeholder="e.g., 2020"
            placeholderTextColor="#9CA3AF"
            value={yearDiagnosed}
            onChangeText={setYearDiagnosed}
            keyboardType="number-pad"
          />

          <Text className="text-base font-semibold text-gray-800 mb-2">
            Target Glucose Level
          </Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 mb-2">
            <TextInput
              className="flex-1 text-base text-gray-900 py-2"
              value={targetGlucose}
              onChangeText={setTargetGlucose}
              keyboardType="decimal-pad"
            />
            <Text className="text-gray-500 text-base">mg/dL</Text>
          </View>
          <View className="flex-row items-center mb-6">
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={18}
              color="#9CA3AF"
            />
            <Text className="text-gray-500 text-xs ml-2">
              Normal fasting range: 80-130 mg/dL
            </Text>
          </View>

          <View className="bg-blue-50 rounded-2xl p-4 flex-row items-center border border-blue-100 mb-6">
            <MaterialCommunityIcons
              name="check-circle"
              size={28}
              color="#3B82F6"
            />
            <View className="flex-1 ml-3">
              <Text className="font-bold text-[#2563EB] text-sm">
                Privacy Protected
              </Text>
              <Text className="text-[#3B82F6] text-xs mt-0.5">
                Your health data is encrypted and secure. We never share your
                information without permission.
              </Text>
            </View>
          </View>

          <View style={styles.buttonColumn}>
            <Pressable
              onPress={handleComplete}
              disabled={saving}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.primaryButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Complete</Text>
                    <MaterialCommunityIcons
                      name="check"
                      size={22}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          </View>
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
  buttonColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
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
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  buttonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
