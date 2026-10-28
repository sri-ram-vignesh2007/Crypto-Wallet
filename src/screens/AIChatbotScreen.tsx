// src/screens/AIChatbotScreen.tsx
// Professional Adaptive Light & Dark Web3 AI Assistant

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { AIService } from '../services/AIService';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
}

const SUGGESTIONS = [
  'What is Ethereum?',
  'Explain gas fees in Gwei.',
  'How do I keep my wallet safe?',
  'What is a stablecoin?',
  'Should I diversify my portfolio?',
  'How do on-chain swaps work?',
];

let msgIdCounter = 0;
const nextId = () => ++msgIdCounter;

export default function AIChatbotScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: 'assistant',
      content: "Hello! I am your CryptoVault AI Assistant. Ask me anything about your tokens, gas prices, wallet security, or DeFi strategies.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput('');
    Keyboard.dismiss();

    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: trimmed };
    const assistantMsg: ChatMessage = { id: nextId(), role: 'assistant', content: '', pending: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setBusy(true);
    cancelRef.current = false;

    const history = [...messages, userMsg]
      .filter(m => m.content.trim().length > 0 && !m.pending)
      .map(m => ({
        role: m.role,
        content: m.content,
      })) as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;

    try {
      await AIService.chatStream(
        history,
        (delta) => {
          if (cancelRef.current) return;
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsg.id
                ? { ...m, content: m.content + delta }
                : m
            )
          );
        },
        undefined,
      );
    } catch {
      // Handled
    } finally {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id ? { ...m, pending: false } : m
        )
      );
      setBusy(false);
    }
  }, [messages, busy]);

  const stop = () => {
    cancelRef.current = true;
    setBusy(false);
    setMessages(prev =>
      prev.map(m =>
        m.pending ? { ...m, pending: false, content: m.content + ' [stopped]' } : m
      )
    );
  };

  const clearChat = () => {
    setMessages([
      {
        id: nextId(),
        role: 'assistant',
        content: 'Chat cleared. What crypto topic would you like to explore?',
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border.subtle, paddingTop: Math.max(16, insets.top + 6) }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: colors.primary.DEFAULT }]}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text.primary }]}>CryptoVault AI</Text>
              <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
                {busy ? 'Analyzing...' : 'Online · Web3 Assistant'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearChat} style={[styles.clearBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: colors.border.subtle }]}>
            <Text style={[styles.clearText, { color: colors.text.secondary }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.msgList}
          contentContainerStyle={{ paddingVertical: 16 }}
          keyboardDismissMode="interactive"
        >
          {messages.map(m => {
            const isUser = m.role === 'user';
            return (
              <View key={m.id} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
                {!isUser && (
                  <View style={[styles.msgAvatar, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE' }]}>
                    <Text style={[styles.msgAvatarText, { color: colors.primary.DEFAULT }]}>AI</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser
                      ? [styles.userBubble, { backgroundColor: colors.primary.DEFAULT }]
                      : [styles.aiBubble, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }],
                  ]}
                >
                  <Text style={[isUser ? styles.userBubbleText : [styles.aiBubbleText, { color: colors.text.primary }]]}>
                    {m.content}
                    {m.pending && !m.content && (
                      <ActivityIndicator size="small" color={colors.primary.DEFAULT} style={{ marginTop: 4 }} />
                    )}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Suggestions */}
        {messages.length <= 2 && !busy && (
          <View style={[styles.suggestionsRow, { borderTopColor: colors.border.subtle }]}>
            {SUGGESTIONS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.suggestionPill, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
                onPress={() => send(s)}
              >
                <Text style={[styles.suggestionText, { color: colors.text.primary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.bg.surface, borderTopColor: colors.border.subtle }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about gas, tokens, wallet security…"
            placeholderTextColor={colors.text.muted}
            style={[styles.input, { backgroundColor: isDark ? '#0B0F19' : '#F1F5F9', color: colors.text.primary, borderColor: colors.border.subtle }]}
            multiline
            editable={!busy}
          />
          {busy ? (
            <TouchableOpacity onPress={stop} style={[styles.sendBtn, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.sendText}>■</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => send(input)}
              disabled={!input.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: colors.primary.DEFAULT },
                !input.trim() && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.sendText}>↑</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  msgList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAI: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  msgAvatarText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  aiBubbleText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  suggestionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    fontWeight: '500',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
});
