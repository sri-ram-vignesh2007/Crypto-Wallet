// src/screens/AIAssistantScreen.tsx
// Vault System — AI Assistant Full-Screen Conversational Sheet
// Context-aware conversation with starter prompts, source/context disclosure,
// readable streamed reply, quick follow-up chips, and privacy notice

import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform,
  Keyboard, Modal, Pressable, ActivityIndicator, TextInput, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import {
  useTheme, useColors, useSpacing, useBorderRadius, useShadows, useTypography, useIsDark,
  spacing, borderRadius, colors, shadows, typography, theme,
} from '../theme/ThemeContext';
import { Card } from '../components/Card';

interface Props {
  navigation?: any;
  route?: { params?: { initialContext?: string } };
}

export default function AIAssistantScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();
  const isDark = useIsDark();

  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; text: string; loading?: boolean }[]
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  // Initial context from navigation
  const initialContext = route?.params?.initialContext || 'portfolio overview';

  // Starter prompts based on context
  const starterPrompts = useCallback(() => {
    const prompts: string[] = [];
    if (initialContext.includes('portfolio')) {
      prompts.push('Show my portfolio analysis');
      prompts.push('What is my risk level?');
    }
    if (initialContext.includes('transaction')) {
      prompts.push('Explain this transaction');
      prompts.push('Is this safe?');
    }
    prompts.push('Ask anything about crypto');
    return prompts;
  }, [initialContext]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = getAIResponse(userMessage, initialContext);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: aiResponse }]);
    setIsLoading(false);
  }, [initialContext]);

  const getAIResponse = (message: string, context: string) => {
    const lower = message.toLowerCase();

    if (lower.includes('price') || lower.includes('value')) {
      return `Based on your ${context}, your portfolio has shown recent activity. For specific prices, check the market screen.`;
    }

    if (lower.includes('risk') || lower.includes('safe')) {
      return `For transactions, always verify the recipient address and network. I can help explain any transaction details if you provide the hash.`;
    }

    if (lower.includes('send') || lower.includes('receive')) {
      return `You can use the Send or Receive functions in the bottom navigation. Would you like me to guide you through that process?`;
    }

    if (lower.includes('portfolio') || lower.includes('balance')) {
      return `Your portfolio overview shows your total balance and asset allocation. Would you like a detailed breakdown?`;
    }

    return `That's an interesting question about ${context}. I'm here to help with crypto education, transaction explanations, risk assessment, and portfolio insights.`;
  };

  // Privacy notice toggle
  const handlePrivacyToggle = () => {
    setShowPrivacyNotice(!showPrivacyNotice);
  };

  const XIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={18} y1={6} x2={6} y2={18} />
      <Line x1={6} y1={6} x2={18} y2={18} />
    </Svg>
  );

  const UserAvatar = ({ size = 24 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <Path d="M18 20h-5a4 4 0 0 1-4-4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h5" />
      <Circle cx="8" cy="8" r="5" />
    </Svg>
  );

  const AIAvatar = ({ size = 24 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <Path d="M6 8l4 4 4-4M6 12l4 4 4-4M6 16l4 4 4-4" />
      <Circle cx="18" cy="18" r="5" />
    </Svg>
  );

  const SendIcon = ({ size = 24 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={() => navigation?.goBack()}
    >
      <View style={[
        styles.modalOverlay,
        { backgroundColor: colors.overlay },
      ]}
        onStartShouldSetResponder={() => true}
      >
        <View style={[
          styles.modalSheet,
          {
            backgroundColor: colors.bg.surface,
            borderRadius: borderRadius.modal,
            ...shadows.xl,
          },
        ]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>AI Assistant</Text>
            <TouchableOpacity
              onPress={() => setShowPrivacyNotice(true)}
              activeOpacity={0.8}
              style={styles.modalPrivacyButton}
            >
              <Text style={styles.modalPrivacyText}>Privacy</Text>
            </TouchableOpacity>
          </View>

          {/* Starter Prompts */}
          <View style={styles.starterPrompts}>
            {starterPrompts().map((prompt, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setInput(prompt);
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: prompt }]);
                  setTimeout(() => handleSend(), 100);
                }}
                activeOpacity={0.8}
                style={styles.starterPrompt}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chat Area */}
          <ScrollView
            style={[
              styles.chatArea,
              { height: isDark ? 400 : 450 },
            ]}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  { alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View style={styles.avatarWrapper}>
                  {msg.role === 'user' ? (
                    <UserAvatar size={24} />
                  ) : (
                    <AIAvatar size={24} />
                  )}
                </View>
                <Text style={[
                  styles.messageText,
                  { color: msg.role === 'user' ? colors.bg.canvas : colors.text.primary },
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}

            {isLoading && (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputArea}>
            <View style={[
              styles.inputContainer,
              { backgroundColor: colors.bg.surface, borderRadius: borderRadius.input },
            ]}
            >
              <TextInput
                placeholder="Send a message..."
                placeholderTextColor={colors.text.muted}
                style={styles.inputText}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyLabel="send"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.8}
                style={styles.sendButton}
              >
                <SendIcon size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Notice */}
          {showPrivacyNotice && (
            <View style={styles.privacyNotice}>
              <View style={styles.privacyCard}>
                <Text style={styles.privacyTitle}>Privacy Notice</Text>
                <Text style={styles.privacyText}>
                  Conversations are not stored permanently. No personal data is collected.
                  AI responses are generated in real-time and may include general information.
                  For sensitive financial decisions, please consult a qualified professional.
                </Text>
                <TouchableOpacity onPress={handlePrivacyToggle} activeOpacity={0.8} style={styles.privacyClose}>
                  <XIcon color={colors.text.muted} size={20} /> Close
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0B1220',
  },
  modalPrivacyButton: {
    padding: 8,
  },
  modalPrivacyText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  starterPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  starterPrompt: {
    backgroundColor: '#F0F4F8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promptText: {
    fontSize: 13,
    color: '#1E3A5F',
  },
  chatArea: {
    maxHeight: 450,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  avatarWrapper: {
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
  },
  inputArea: {
    marginTop: 16,
    paddingBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#0B1220',
  },
  sendButton: {
    padding: 4,
  },
  privacyNotice: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  privacyCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 12,
  },
  privacyClose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    color: '#92400E',
  },
});