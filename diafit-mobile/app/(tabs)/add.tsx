import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setVisible(true);
      return () => setVisible(false);
    }, [])
  );

  const handleClose = () => {
    setVisible(false);
    router.replace('/(tabs)/home');
  };

  const handleGlucoseLog = () => {
    setVisible(false);
    router.replace('/(tabs)/glucose');
  };

  const handleLabResultLog = () => {
    setVisible(false);
    router.replace('/(tabs)/lab-results');
  };

  return (
    <View style={styles.screen}>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              style={styles.header}
            >
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">What would you like to log?</Text>
                <Text className="text-sm text-white/90 mt-1">Choose a log type</Text>
              </View>
              <Pressable onPress={handleClose} hitSlop={12} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </LinearGradient>

            {/* Options */}
            <View style={styles.options}>
              <Pressable
                style={styles.optionCard}
                onPress={handleGlucoseLog}
              >
                <View style={styles.optionIconBlue}>
                  <MaterialCommunityIcons name="heart-pulse" size={28} color="#FFFFFF" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-base font-bold text-gray-900">Glucose Log</Text>
                  <Text className="text-sm text-gray-600 mt-0.5">Track your blood sugar</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.optionCardPurple}
                onPress={handleLabResultLog}
              >
                <View style={styles.optionIconPurple}>
                  <MaterialCommunityIcons name="flask" size={28} color="#FFFFFF" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-base font-bold text-gray-900">Lab Result Log</Text>
                  <Text className="text-sm text-gray-600 mt-0.5">Record test results</Text>
                </View>
              </Pressable>
            </View>

            {/* Cancel */}
            <Pressable onPress={handleClose} style={styles.cancelButton}>
              <Text className="text-base font-semibold text-gray-900">Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    padding: 20,
  },
  optionCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 16,
  },
  optionCardPurple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
  },
  optionIconBlue: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconPurple: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
