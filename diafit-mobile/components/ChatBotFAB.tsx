import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TAB_BAR_HEIGHT = 80;

export default function ChatBotFAB() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const bottomOffset = insets.bottom + TAB_BAR_HEIGHT;

  return (
    <>
      <Pressable
        style={[styles.bubble, { bottom: bottomOffset }]}
        onPress={() => setVisible(true)}
      >
        <View className="relative">
          <View className="w-14 h-14 rounded-full bg-[#3B82F6] items-center justify-center">
            <MaterialCommunityIcons name="chat-processing" size={28} color="#FFFFFF" />
          </View>
          <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
            <Text className="text-xs font-bold text-white">0</Text>
          </View>
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <Pressable style={styles.chatCard} onPress={(e) => e.stopPropagation()}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.chatHeader}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-[#93C5FD] items-center justify-center mr-3">
                    <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-white">DiaBot</Text>
                    <Text className="text-sm text-white/90">Your AI Assistant</Text>
                  </View>
                </View>
                <Pressable onPress={() => setVisible(false)} hitSlop={12}>
                  <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
                </Pressable>
              </LinearGradient>

              <ScrollView
                style={styles.chatContent}
                contentContainerStyle={styles.chatContentInner}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.bubbleWrap}>
                  <View style={styles.bubbleMessage}>
                    <Text className="text-gray-800 text-base">
                      Hi! I'm DiaBot, your diabetes assistant. How can I help you today?
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">Just now</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type your message..."
                  placeholderTextColor="#9CA3AF"
                  value={message}
                  onChangeText={setMessage}
                  multiline={false}
                />
                <Pressable style={styles.sendButton} onPress={() => setMessage('')}>
                  <MaterialCommunityIcons name="send" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalKeyboard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  chatCard: {
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
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chatContent: {
    maxHeight: 340,
  },
  chatContentInner: {
    padding: 20,
    paddingBottom: 16,
  },
  bubbleWrap: {
    alignItems: 'flex-start',
  },
  bubbleMessage: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: '90%',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    maxHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
