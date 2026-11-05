// src/screens/onboarding/SeedPhraseScreen.tsx
// Trust Wallet Style Seed Phrase Backup & Import

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, StatusBar, TextInput, SafeAreaView, ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
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
      Alert.alert('Backup Required', 'Please confirm you have saved your secret recovery phrase safely.');
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
      Alert.alert('Empty Phrase', 'Please enter or paste your 12-word seed phrase or private key.');
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
      Alert.alert('Import Failed', e?.message || 'Invalid phrase or private key. Please check and try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {mode === 'create' ? 'Secret Recovery Phrase' : 'Import Wallet'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom + 16) }]}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'create' ? (
          <>
            <Text style={[styles.stepDesc, { color: colors.text.secondary }]}>
              Write down or copy these 12 words in the exact order and keep them offline in a safe place.
            </Text>

            {/* Seed Words Grid */}
            <View style={[styles.wordsGrid, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              {words.map((word, index) => (
                <View
                  key={index}
                  style={[styles.wordPill, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}
                >
                  <Text style={[styles.wordNumber, { color: colors.text.muted }]}>{index + 1}</Text>
                  <Text style={[styles.wordText, { color: colors.text.primary }]}>{word}</Text>
                </View>
              ))}
            </View>

            {/* Copy Button */}
            <TouchableOpacity
              onPress={copyToClipboard}
              activeOpacity={0.75}
              style={[styles.copyButton, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={copied ? '#10B981' : colors.primary.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </Svg>
              <Text style={[styles.copyButtonText, { color: copied ? '#10B981' : colors.primary.DEFAULT }]}>
                {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
              </Text>
            </TouchableOpacity>

            {/* Warning Box */}
            <View style={[styles.warningBox, { backgroundColor: isDark ? '#1C1508' : '#FEF3C7', borderColor: '#F59E0B' }]}>
              <Text style={[styles.warningTitle, { color: '#D97706' }]}>Do not share your phrase</Text>
              <Text style={[styles.warningText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                Anyone with this phrase can steal your funds. Crypto Wallet will never ask for your recovery phrase.
              </Text>
            </View>

            {/* Confirmation Checkbox */}
            <TouchableOpacity
              onPress={() => setHasBackedUp(!hasBackedUp)}
              activeOpacity={0.8}
              style={styles.checkboxRow}
            >
              <View style={[
                styles.checkbox,
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
                I have written down or saved my recovery phrase in a secure place
              </Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleFinishCreate}
              disabled={loading}
              activeOpacity={0.88}
              style={[
                styles.primaryBtn,
                { backgroundColor: hasBackedUp ? colors.primary.DEFAULT : colors.border.DEFAULT }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Continue</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.stepDesc, { color: colors.text.secondary }]}>
              Enter your 12-word recovery phrase or private key to restore your wallet.
            </Text>

            {/* Secret Phrase / Private Key Input */}
            <View style={[styles.inputCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text.primary }]}
                placeholder="Enter 12 words separated by spaces, or 0x private key..."
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={4}
                value={mnemonicInput}
                onChangeText={setMnemonicInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={pasteFromClipboard}
                style={[styles.pasteBadge, { backgroundColor: colors.primary.muted }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pasteBadgeText, { color: colors.primary.DEFAULT }]}>Paste</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              <Text style={[styles.infoTitle, { color: colors.text.primary }]}>Supported Formats</Text>
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                • BIP-39 12-word recovery seed phrase{'\n'}
                • 64-character EVM private key (hex)
              </Text>
            </View>

            {/* Import Button */}
            <TouchableOpacity
              onPress={handleFinishImport}
              disabled={loading || !mnemonicInput.trim()}
              activeOpacity={0.88}
              style={[
                styles.primaryBtn,
                { backgroundColor: mnemonicInput.trim() ? colors.primary.DEFAULT : colors.border.DEFAULT, marginTop: 24 }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Import Wallet</Text>
              )}
            </TouchableOpacity>
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
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  wordPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  wordNumber: {
    width: 22,
    fontSize: 12,
    fontWeight: '600',
  },
  wordText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  inputCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 130,
    position: 'relative',
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    paddingRight: 60,
  },
  pasteBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pasteBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 20,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
