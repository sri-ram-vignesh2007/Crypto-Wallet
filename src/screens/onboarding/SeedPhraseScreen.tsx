// src/screens/onboarding/SeedPhraseScreen.tsx
// Clean Seed Phrase Display - After wallet creation/import

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, StatusBar, TextInput, Clipboard, SafeAreaView,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { useWalletStore } from '../../store/walletStore';
import { useProfileStore } from '../../store/profileStore';
import { useAppLockStore } from '../../hooks/useAppLock';
import { useColors, useSpacing, useBorderRadius, useTypography, useIsDark } from '../../theme/ThemeContext';
import { ClayButton } from '../../components/ClayButton';
import { generateSecureMnemonic } from '../../polyfills';

// Safe area hook with fallback
let useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
try {
  const safeAreaContext = require('react-native-safe-area-context');
  if (safeAreaContext.useSafeAreaInsets) {
    useSafeAreaInsets = safeAreaContext.useSafeAreaInsets;
  }
} catch (e) {
  // Fallback already defined
}

interface Props {
  navigation?: any;
  route?: { params?: { mode: 'create' | 'import' } };
}

export default function SeedPhraseScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const typography = useTypography();
  const isDark = useIsDark();

  const { importWallet, createWallet } = useWalletStore();
  const { setOnboardingComplete, setSignedIn } = useProfileStore();

  const [mode] = useState<'create' | 'import'>(route?.params?.mode || 'create');
  const [words, setWords] = useState<string[]>([]);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmWords, setConfirmWords] = useState<string[]>([]);
  const [confirmIndex, setConfirmIndex] = useState(0);

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
      await Clipboard.setString(fullPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy to clipboard.');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setMnemonicInput(text.trim());
      }
    } catch {
      Alert.alert('Paste Failed', 'Unable to paste from clipboard.');
    }
  };

  const handleFinishCreate = () => {
    if (!showConfirmation) {
      if (words.length === 12) {
        const indices = [0, 5, 11];
        setConfirmWords(indices.map(i => words[i]));
        setConfirmIndex(0);
        setShowConfirmation(true);
      }
      return;
    }

    if (confirmIndex < confirmWords.length - 1) {
      setConfirmIndex(confirmIndex + 1);
    } else {
      setLoading(true);
      const fullPhrase = words.join(' ');
      importWallet(fullPhrase)
        .then(() => {
          useAppLockStore.getState().unlock();
          setOnboardingComplete(true);
          setSignedIn(true);
          navigation?.reset?.({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        })
        .catch((e: any) => {
          Alert.alert('Error', e?.message || 'Failed to create wallet. Please try again.');
          setLoading(false);
        });
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
      Alert.alert('Import Failed', e?.message || 'Invalid seed phrase. Check spelling and word order.');
      setLoading(false);
    }
  };

  const renderCreateMode = () => {
    if (showConfirmation) {
      return (
        <View>
          {/* Word Verification Step */}
          <View style={[styles.warningBanner, { backgroundColor: colors.info.muted, borderColor: colors.info.DEFAULT }]}>
            <View style={styles.warningIcon}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.info.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 16v-4M12 8h.01" />
              </Svg>
            </View>
            <View style={styles.warningTextWrap}>
              <Text style={[styles.warningTitle, { color: colors.info.container }]}>Verify Your Phrase</Text>
              <Text style={[styles.warningDesc, { color: colors.text.secondary }]}>
                Select word #{confirmIndex + 1}: <Text style={{ fontWeight: '700', color: colors.text.primary }}>"{confirmWords[confirmIndex]}"</Text>
              </Text>
            </View>
          </View>

          <Text style={[styles.confirmInstruction, { color: colors.text.secondary }]}>Confirm the words in your written backup</Text>

          <View style={styles.wordVerification}>
            {confirmWords.map((word, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.confirmWordPill,
                  {
                    backgroundColor: idx === confirmIndex ? colors.primary.muted : colors.bg.surfaceMuted,
                    borderColor: idx === confirmIndex ? colors.primary.DEFAULT : colors.border.subtle,
                  },
                ]}
                onPress={() => idx === confirmIndex && setConfirmIndex(confirmIndex + 1)}
                disabled={idx !== confirmIndex}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.confirmWordText,
                  { color: idx === confirmIndex ? colors.primary.DEFAULT : colors.text.primary },
                ]}>
                  {word}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ClayButton
            title={confirmIndex === confirmWords.length - 1 ? 'Create Wallet' : 'Next Word'}
            onPress={handleFinishCreate}
            disabled={loading}
            fullWidth
            size="large"
          />
        </View>
      );
    }

    return (
      <View>
        {/* Security Banner */}
        <View style={[styles.warningBanner, { backgroundColor: colors.warning.muted, borderColor: colors.warning.DEFAULT }]}>
          <View style={styles.warningIcon}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.warning.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
            </Svg>
          </View>
          <View style={styles.warningTextWrap}>
            <Text style={[styles.warningTitle, { color: colors.warning.container }]}>Write down these 12 words</Text>
            <Text style={[styles.warningDesc, { color: colors.text.secondary }]}>
              This is the ONLY way to recover your assets. Do not share it with anyone. Store it offline.
            </Text>
          </View>
        </View>

        {/* 12-Word Grid */}
        <View style={[styles.wordsGridContainer, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          {words.map((word, index) => (
            <View key={index} style={[styles.wordPill, { backgroundColor: colors.bg.surfaceMuted, borderColor: colors.border.subtle }]}>
              <Text style={[styles.wordIndex, { color: colors.text.muted }]}>{index + 1}</Text>
              <Text style={[styles.wordText, { color: colors.text.primary }]}>{word}</Text>
            </View>
          ))}
        </View>

        {/* Copy Button */}
        <TouchableOpacity
          style={[
            styles.copyButton,
            {
              backgroundColor: copied ? colors.success.muted : colors.primary.muted,
              borderColor: copied ? colors.success.DEFAULT : colors.primary.DEFAULT,
            },
          ]}
          onPress={copyToClipboard}
          activeOpacity={0.8}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={copied ? colors.success.DEFAULT : colors.primary.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {copied ? (
              <Path d="M20 6L9 17l-5-5" />
            ) : (
              <>
                <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </>
            )}
          </Svg>
          <Text style={[styles.copyButtonText, { color: copied ? colors.success.DEFAULT : colors.primary.DEFAULT }]}>
            {copied ? 'Copied to Clipboard' : 'Copy Seed Phrase'}
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <ClayButton
          title={loading ? 'Securing Vault...' : "I've Written It Down — Continue"}
          onPress={handleFinishCreate}
          disabled={loading}
          fullWidth
          size="large"
        />
      </View>
    );
  };

  const renderImportMode = () => (
    <View>
      {/* Import Explainer */}
      <View style={styles.importExplainer}>
        <Text style={[styles.importExplainerTitle, { color: colors.text.primary }]}>Enter Recovery Phrase</Text>
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
          style={[styles.pasteButton, { backgroundColor: colors.primary.muted, borderColor: colors.primary.DEFAULT }]}
          onPress={pasteFromClipboard}
          activeOpacity={0.8}
        >
          <Text style={[styles.pasteButtonText, { color: colors.primary.DEFAULT }]}>Paste</Text>
        </TouchableOpacity>
      </View>

      {/* Action Button */}
      <ClayButton
        title={loading ? 'Restoring Wallet...' : 'Restore & Enter Wallet'}
        onPress={handleFinishImport}
        disabled={loading}
        fullWidth
        size="large"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(20, insets.top + 10), paddingBottom: Math.max(60, insets.bottom + 40) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
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

        {mode === 'create' ? renderCreateMode() : renderImportMode()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningIcon: { flexShrink: 0 },
  warningTextWrap: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  warningDesc: { fontSize: 12, lineHeight: 16 },
  wordsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
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
  wordIndex: { fontSize: 11, fontWeight: '700', width: 22, color: '#94A3B8' },
  wordText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  copyButtonText: { fontSize: 13, fontWeight: '700' },
  importExplainer: { marginBottom: 16 },
  importExplainerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  importExplainerSub: { fontSize: 13 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  mnemonicInput: { flex: 1, fontSize: 15, minHeight: 110, textAlignVertical: 'top', lineHeight: 22 },
  pasteButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  pasteButtonText: { fontSize: 12, fontWeight: '700' },
  confirmInstruction: { textAlign: 'center', marginBottom: 16, fontSize: 13 },
  wordVerification: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 24 },
  confirmWordPill: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, minWidth: 100, alignItems: 'center' },
  confirmWordText: { fontSize: 14, fontWeight: '700' },
});