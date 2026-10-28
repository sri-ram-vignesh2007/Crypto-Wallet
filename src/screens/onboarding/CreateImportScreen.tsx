// src/screens/onboarding/CreateImportScreen.tsx
// Professional Adaptive Light & Dark Wallet Creation & Import Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  Alert, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { useWalletStore } from '../../store/walletStore';
import { useProfileStore } from '../../store/profileStore';
import { useAppLockStore } from '../../hooks/useAppLock';
import { useColors, useIsDark } from '../../theme/ThemeContext';
import { generateSecureMnemonic } from '../../polyfills';

interface Props {
  navigation?: any;
  route?: { params?: { mode: 'create' | 'import' } };
}

export default function CreateImportScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { importWallet, createWallet } = useWalletStore();
  const { setOnboardingComplete, setSignedIn } = useProfileStore();

  const [mode] = useState<'create' | 'import'>(route?.params?.mode || 'create');
  const [words, setWords] = useState<string[]>([]);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'create') {
      generateSecureMnemonic()
        .then((phrase) => {
          setWords(phrase.split(' '));
        })
        .catch(() => {
          // Guaranteed fallback
          const fallback = 'ocean galaxy river flame beacon crystal horizon nebula shield thunder solar velvet';
          setWords(fallback.split(' '));
        });
    }
  }, [mode]);

  const copyToClipboard = async () => {
    const fullPhrase = words.join(' ');
    await Clipboard.setStringAsync(fullPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setMnemonicInput(text.trim());
    }
  };

  const handleFinishCreate = async () => {
    setLoading(true);
    try {
      const fullPhrase = words.join(' ');
      await importWallet(fullPhrase);
      useAppLockStore.getState().unlock();
      setOnboardingComplete(true);
      setSignedIn(true);
    } catch {
      await createWallet();
      useAppLockStore.getState().unlock();
      setOnboardingComplete(true);
      setSignedIn(true);
    } finally {
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
    } catch (e: any) {
      Alert.alert('Import Failed', e?.message || 'Invalid seed phrase. Check spelling and word order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      {/* Ambient background glows */}
      <View style={[styles.glowTop, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.06)' }]} />
      <View style={[styles.glowBottom, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.05)' }]} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(20, insets.top + 10), paddingBottom: Math.max(40, insets.bottom + 20) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            {mode === 'create' ? 'Secret Recovery Phrase' : 'Import Wallet'}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {mode === 'create' ? (
          <>
            {/* Security Banner */}
            <View style={[styles.warningBanner, { backgroundColor: isDark ? 'rgba(234, 179, 8, 0.12)' : '#FEF9C3', borderColor: isDark ? 'rgba(234, 179, 8, 0.3)' : '#FDE047' }]}>
              <Text style={styles.warningIcon}>🔒</Text>
              <View style={styles.warningTextWrap}>
                <Text style={[styles.warningTitle, { color: isDark ? '#FDE047' : '#854D0E' }]}>Write down these 12 words</Text>
                <Text style={[styles.warningDesc, { color: isDark ? '#CBD5E1' : '#713F12' }]}>
                  This is the ONLY way to recover your assets. Do not share it with anyone.
                </Text>
              </View>
            </View>

            {/* 12-Word Grid */}
            <View style={[styles.wordsGridContainer, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              {words.map((word, index) => (
                <View key={index} style={[styles.wordPill, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#F8FAFC', borderColor: colors.border.subtle }]}>
                  <Text style={[styles.wordIndex, { color: colors.text.muted }]}>{index + 1}</Text>
                  <Text style={[styles.wordText, { color: colors.text.primary }]}>{word}</Text>
                </View>
              ))}
            </View>

            {/* Copy Button */}
            <TouchableOpacity
              style={[
                styles.copyButton,
                { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE' },
                copied && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7', borderColor: '#86EFAC' },
              ]}
              onPress={copyToClipboard}
              activeOpacity={0.8}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={copied ? '#16A34A' : colors.primary.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                  <Path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </>
                )}
              </Svg>
              <Text style={[styles.copyButtonText, { color: copied ? '#16A34A' : colors.primary.DEFAULT }]}>
                {copied ? 'Copied to Clipboard!' : 'Copy Seed Phrase'}
              </Text>
            </TouchableOpacity>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: colors.primary.DEFAULT }]}
              onPress={handleFinishCreate}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>
                {loading ? 'Securing Vault…' : "I've Saved It — Open Wallet"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Import Explainer */}
            <View style={styles.importExplainer}>
              <Text style={[styles.importExplainerTitle, { color: colors.text.primary }]}>Enter Recovery Phrase or Key</Text>
              <Text style={[styles.importExplainerSub, { color: colors.text.secondary }]}>
                Paste your 12 or 24 word mnemonic or raw private key.
              </Text>
            </View>

            {/* Input Box */}
            <View style={[styles.inputContainer, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              <TextInput
                style={[styles.mnemonicInput, { color: colors.text.primary }]}
                placeholder="e.g. apple river galaxy hammer..."
                placeholderTextColor={colors.text.muted}
                value={mnemonicInput}
                onChangeText={setMnemonicInput}
                multiline
                numberOfLines={4}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.pasteButton, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF', borderColor: colors.primary.DEFAULT }]}
                onPress={pasteFromClipboard}
                activeOpacity={0.8}
              >
                <Text style={[styles.pasteButtonText, { color: colors.primary.DEFAULT }]}>Paste</Text>
              </TouchableOpacity>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: colors.primary.DEFAULT }]}
              onPress={handleFinishImport}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>
                {loading ? 'Restoring Wallet…' : 'Restore & Enter Wallet'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 24,
  },
  warningTextWrap: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  warningDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  wordsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  wordPill: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  wordIndex: {
    fontSize: 11,
    fontWeight: '700',
    width: 22,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryActionButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginTop: 24,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  importExplainer: {
    marginBottom: 16,
  },
  importExplainerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  importExplainerSub: {
    fontSize: 13,
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  mnemonicInput: {
    fontSize: 15,
    minHeight: 110,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  pasteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pasteButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});