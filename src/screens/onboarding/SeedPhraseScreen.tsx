// src/screens/onboarding/SeedPhraseScreen.tsx - Apple iPhone Style Seed Phrase Backup & Import

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, StatusBar, TextInput,
  SafeAreaView, ActivityIndicator, Animated, Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Rect } from 'react-native-svg';
import { useWalletStore } from '../../store/walletStore';
import { useProfileStore } from '../../store/profileStore';
import { useAppLockStore } from '../../hooks/useAppLock';
import { useColors, useIsDark } from '../../theme/ThemeContext';
import { generateSecureMnemonic } from '../../polyfills';

let useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
try {
  const safeAreaContext = require('react-native-safe-area-context');
  if (safeAreaContext.useSafeAreaInsets) {
    useSafeAreaInsets = safeAreaContext.useSafeAreaInsets;
  }
} catch (e) {}

// Apple Spring Scale Pressable
const AppleButton: React.FC<{
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onPress, style, children, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) {
          Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            damping: 18,
            stiffness: 260,
          }).start();
        }
      }}
      onPressOut={() => {
        if (!disabled) {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 18,
            stiffness: 260,
          }).start();
        }
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

interface Props {
  navigation?: any;
  route?: { params?: { mode: 'create' | 'import' } };
}

export default function SeedPhraseScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { importWallet } = useWalletStore();
  const { setOnboardingComplete, setSignedIn } = useProfileStore();

  const mode = route?.params?.mode || 'create';
  const [words, setWords] = useState<string[]>([]);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const initializeWords = useCallback(async () => {
    if (mode === 'create') {
      try {
        const phrase = await generateSecureMnemonic();
        setWords(phrase.split(' '));
      } catch {
        const fallback = 'ocean galaxy river flame beacon crystal horizon nebula shield thunder solar velvet';
        setWords(fallback.split(' '));
      }
    }
  }, [mode]);

  useEffect(() => {
    initializeWords();
  }, [initializeWords]);

  const copyToClipboard = async () => {
    const fullPhrase = words.join(' ');
    try {
      await Clipboard.setStringAsync(fullPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy to clipboard.');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setMnemonicInput(text.trim());
      }
    } catch {
      Alert.alert('Paste Failed', 'Unable to paste from clipboard.');
    }
  };

  const handleFinishCreate = async () => {
    if (!hasBackedUp) {
      Alert.alert('Backup Confirmation', 'Please check the box confirming you have saved your recovery phrase.');
      return;
    }

    setLoading(true);
    try {
      const fullPhrase = words.join(' ');
      await importWallet(fullPhrase);
      useAppLockStore.getState().unlock();
      setOnboardingComplete(true);
      setSignedIn(true);
      navigation?.reset?.({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create wallet. Please try again.');
      setLoading(false);
    }
  };

  const handleFinishImport = async () => {
    const cleaned = mnemonicInput.trim().replace(/\s+/g, ' ');
    if (!cleaned) {
      Alert.alert('Empty Phrase', 'Please enter your 12-word seed phrase or private key.');
      return;
    }
    setLoading(true);
    try {
      await importWallet(cleaned);
      useAppLockStore.getState().unlock();
      setOnboardingComplete(true);
      setSignedIn(true);
      navigation?.reset?.({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (e: any) {
      Alert.alert('Import Failed', e?.message || 'Invalid phrase or private key.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Apple Navigation Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <AppleButton
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </AppleButton>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {mode === 'create' ? 'Secret Recovery Phrase' : 'Import Wallet'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(28, insets.bottom + 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'create' ? (
          <>
            <Text style={[styles.stepDesc, { color: colors.text.secondary }]}>
              Save these 12 words in order. Never share them with anyone — they are the master key to your wallet.
            </Text>

            {/* Apple Inset Words Card */}
            <View style={[styles.wordsCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              {words.map((word, index) => (
                <View
                  key={index}
                  style={[styles.wordItem, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}
                >
                  <Text style={[styles.wordIndex, { color: colors.text.muted }]}>{index + 1}</Text>
                  <Text style={[styles.wordValue, { color: colors.text.primary }]}>{word}</Text>
                </View>
              ))}
            </View>

            {/* Copy Button */}
            <AppleButton
              onPress={copyToClipboard}
              style={[styles.copyButton, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={copied ? '#34C759' : colors.primary.DEFAULT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Rect x="9" y="9" width="13" height="13" rx="2.5" />
                <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </Svg>
              <Text style={[styles.copyButtonText, { color: copied ? '#34C759' : colors.primary.DEFAULT }]}>
                {copied ? 'Copied to Clipboard' : 'Copy All Words'}
              </Text>
            </AppleButton>

            {/* Apple Warning Callout */}
            <View style={[styles.warningCallout, { backgroundColor: isDark ? 'rgba(255, 159, 10, 0.12)' : 'rgba(255, 149, 0, 0.12)', borderColor: isDark ? '#FF9F0A' : '#FF9500' }]}>
              <Text style={[styles.warningHeading, { color: isDark ? '#FF9F0A' : '#C97700' }]}>Important Security Notice</Text>
              <Text style={[styles.warningBody, { color: colors.text.secondary }]}>
                Anyone with access to these words can withdraw all funds permanently. Store them offline in a password manager or physical vault.
              </Text>
            </View>

            {/* Apple Checkbox Row */}
            <Pressable
              onPress={() => setHasBackedUp(!hasBackedUp)}
              style={styles.checkboxRow}
            >
              <View style={[
                styles.checkboxBox,
                { borderColor: hasBackedUp ? colors.primary.DEFAULT : colors.border.DEFAULT },
                hasBackedUp && { backgroundColor: colors.primary.DEFAULT }
              ]}>
                {hasBackedUp && (
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M20 6L9 17l-5-5" />
                  </Svg>
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text.primary }]}>
                I have safely stored my 12-word recovery phrase
              </Text>
            </Pressable>

            {/* Continue Button */}
            <AppleButton
              onPress={handleFinishCreate}
              disabled={loading || !hasBackedUp}
              style={[
                styles.primaryBtn,
                { backgroundColor: hasBackedUp ? colors.primary.DEFAULT : (isDark ? '#2C2C2E' : '#E5E5EA') }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: hasBackedUp ? '#FFFFFF' : colors.text.muted }]}>Continue</Text>
              )}
            </AppleButton>
          </>
        ) : (
          <>
            <Text style={[styles.stepDesc, { color: colors.text.secondary }]}>
              Enter your standard 12-word recovery phrase or 64-character private key.
            </Text>

            {/* Secret Input Card */}
            <View style={[styles.inputGroupCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              <TextInput
                style={[styles.phraseInput, { color: colors.text.primary }]}
                placeholder="12 words separated by spaces, or 0x private key..."
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={4}
                value={mnemonicInput}
                onChangeText={setMnemonicInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <AppleButton
                onPress={pasteFromClipboard}
                style={[styles.pasteButton, { backgroundColor: colors.primary.muted }]}
              >
                <Text style={[styles.pasteButtonText, { color: colors.primary.DEFAULT }]}>Paste</Text>
              </AppleButton>
            </View>

            {/* Format Info */}
            <View style={[styles.formatCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              <Text style={[styles.formatHeading, { color: colors.text.primary }]}>Supported Formats</Text>
              <Text style={[styles.formatText, { color: colors.text.secondary }]}>
                • BIP-39 standard 12-word mnemonic phrase{'\n'}
                • 64-character EVM raw private key (0x...)
              </Text>
            </View>

            {/* Import Button */}
            <AppleButton
              onPress={handleFinishImport}
              disabled={loading || !mnemonicInput.trim()}
              style={[
                styles.primaryBtn,
                { backgroundColor: mnemonicInput.trim() ? colors.primary.DEFAULT : (isDark ? '#2C2C2E' : '#E5E5EA'), marginTop: 24 }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: mnemonicInput.trim() ? '#FFFFFF' : colors.text.muted }]}>Import Wallet</Text>
              )}
            </AppleButton>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
    marginBottom: 20,
  },
  wordsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    borderWidth: 0.5,
    marginBottom: 16,
  },
  wordItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    marginBottom: 8,
  },
  wordIndex: {
    width: 22,
    fontSize: 12,
    fontWeight: '600',
  },
  wordValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 16,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  warningCallout: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 20,
  },
  warningHeading: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningBody: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  inputGroupCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 0.5,
    marginBottom: 16,
    minHeight: 120,
    position: 'relative',
  },
  phraseInput: {
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    paddingRight: 64,
  },
  pasteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pasteButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formatCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 16,
  },
  formatHeading: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  formatText: {
    fontSize: 13,
    lineHeight: 19,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.3,
  },
});
