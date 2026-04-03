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
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { invokeDiabot, type DiabotMessage } from '../lib/diabot';

const TAB_BAR_HEIGHT = 80;

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function ChatBotFAB() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm DiaBot. Ask me anything about diabetes—glucose, food, activity, medications (general info), or using Diafit. I can't replace your doctor.",
      createdAt: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const bottomOffset = insets.bottom + TAB_BAR_HEIGHT;

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [messages, visible, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };
    const history: DiabotMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await invokeDiabot(history);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          createdAt: Date.now(),
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      Alert.alert('DiaBot', msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            "Sorry, I couldn't get a reply. Check your connection, or ask your team to deploy the DiaBot function and OpenAI key (see project docs).",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pressable
        style={[styles.bubble, { bottom: bottomOffset }]}
        onPress={() => setVisible(true)}
        accessibilityLabel="Open DiaBot chat"
      >
        <View className="relative">
          <View className="w-14 h-14 rounded-full bg-[#3B82F6] items-center justify-center">
            <MaterialCommunityIcons name="chat-processing" size={28} color="#FFFFFF" />
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
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-white">DiaBot</Text>
                    <Text className="text-sm text-white/90">Diabetes-focused assistant</Text>
                  </View>
                </View>
                <Pressable onPress={() => setVisible(false)} hitSlop={12} accessibilityLabel="Close chat">
                  <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
                </Pressable>
              </LinearGradient>

              <Text style={styles.disclaimer}>
                Education only—not medical advice. Follow your care team.
              </Text>

              <ScrollView
                ref={scrollRef}
                style={styles.chatContent}
                contentContainerStyle={styles.chatContentInner}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((m) => (
                  <View
                    key={m.id}
                    style={[
                      styles.row,
                      m.role === 'user' ? styles.rowUser : styles.rowAssistant,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubbleMessage,
                        m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                      ]}
                    >
                      <Text
                        className="text-base"
                        style={m.role === 'user' ? styles.textUser : styles.textAssistant}
                      >
                        {m.content}
                      </Text>
                      <Text
                        className="text-xs mt-1"
                        style={m.role === 'user' ? styles.timeUser : styles.timeAssistant}
                      >
                        {formatTime(m.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))}
                {loading && (
                  <View style={[styles.row, styles.rowAssistant]}>
                    <View style={[styles.bubbleMessage, styles.bubbleAssistant]}>
                      <ActivityIndicator size="small" color="#2563EB" />
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Ask about diabetes or Diafit…"
                  placeholderTextColor="#9CA3AF"
                  value={input}
                  onChangeText={setInput}
                  multiline
                  maxLength={2000}
                  editable={!loading}
                  onSubmitEditing={() => void send()}
                  blurOnSubmit={false}
                />
                <Pressable
                  style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                  onPress={() => void send()}
                  disabled={loading || !input.trim()}
                  accessibilityLabel="Send message"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <MaterialCommunityIcons name="send" size={22} color="#FFFFFF" />
                  )}
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
    maxHeight: '88%',
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
  disclaimer: {
    fontSize: 11,
    color: '#64748B',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    lineHeight: 15,
  },
  chatContent: {
    maxHeight: 360,
  },
  chatContentInner: {
    padding: 16,
    paddingBottom: 12,
  },
  row: {
    marginBottom: 12,
    width: '100%',
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignItems: 'flex-start',
  },
  bubbleMessage: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '92%',
  },
  bubbleUser: {
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textAssistant: {
    color: '#111827',
  },
  timeUser: {
    color: 'rgba(255,255,255,0.8)',
  },
  timeAssistant: {
    color: '#9CA3AF',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
