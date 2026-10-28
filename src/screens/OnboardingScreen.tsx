// src/screens/OnboardingScreen.tsx
// Wallet creation WITH seed phrase backup — like Trust Wallet

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Text, TextInput, Card } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import * as bip39 from 'bip39';
import { useWalletStore } from '../store/walletStore';
import { useProfileStore } from '../store/profileStore';
import { theme } from '../theme/Theme';

export default function OnboardingScreen() {
  const [mode, setMode] = useState<'home' | 'backup' | 'import'>('home');
  const [mnemonic, setMnemonic] = useState('');
  const [importInput, setImportInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { importWallet } = useWalletStore();
  const { setOnboardingComplete } = useProfileStore();

  // STEP 1: User taps Create → generate words
  const handleCreate = () => {
    const newMnemonic = bip39.generateMnemonic(256); // 24 words
    setMnemonic(newMnemonic);
    setMode('backup');
  };

  // STEP 2: User confirms they saved the words → encrypt and store
  const handleBackupComplete = async () => {
    setIsLoading(true);
    setLocalError('');
    try {
      await importWallet(mnemonic);
      setMnemonic(''); // wipe from memory
      // Mark onboarding as complete - App.tsx will auto-switch to Main
      setOnboardingComplete(true);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to secure wallet');
      setIsLoading(false);
    }
  };

  // Import existing wallet
  const handleImport = async () => {
    if (!importInput.trim()) return;
    setIsLoading(true);
    setLocalError('');
    try {
      await importWallet(importInput.trim());
      // Mark onboarding as complete - App.tsx will auto-switch to Main
      setOnboardingComplete(true);
    } catch (err: any) {
      setLocalError(err.message || 'Invalid seed phrase');
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setStringAsync(mnemonic);
    Alert.alert('Copied', 'Seed phrase copied to clipboard. Paste it somewhere safe immediately, then clear your clipboard.');
  };

  // SPLIT words for grid display
  const words = mnemonic ? mnemonic.split(' ') : [];

  // ==================== MODE: HOME ====================
  if (mode === 'home') {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>🔐</Text>
        <Text style={styles.title}>Your Crypto Vault</Text>
        <Text style={styles.subtitle}>
          Create a new wallet or restore an existing one with your seed phrase.
        </Text>

        <Button
          mode="contained"
          onPress={handleCreate}
          style={styles.primaryBtn}
          buttonColor={theme.colors.primary}
          textColor="#FFFFFF"
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          Create New Wallet
        </Button>

        <Button
          mode="outlined"
          onPress={() => setMode('import')}
          style={styles.secondaryBtn}
          textColor={theme.colors.primary}
        >
          I Already Have a Wallet
        </Button>

        {localError ? <Text style={styles.error}>{localError}</Text> : null}
      </View>
    );
  }

  // ==================== MODE: BACKUP (show 24 words) ====================
  if (mode === 'backup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.warningTitle}>⚠️ Write These Down</Text>
        <Text style={styles.warningText}>
          This is your seed phrase. It is the ONLY way to recover your wallet.
          {'\n\n'}
          If you lose these words, your crypto is gone forever. No one can help you recover it.
        </Text>

        <Card style={styles.wordsCard}>
          <Card.Content>
            <View style={styles.wordsGrid}>
              {words.map((word, index) => (
                <View key={index} style={styles.wordBox}>
                  <Text style={styles.wordNumber}>{index + 1}</Text>
                  <Text style={styles.wordText}>{word}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={copyToClipboard}
          style={styles.copyBtn}
          textColor={theme.colors.warning}
          icon="content-copy"
        >
          Copy to Clipboard (Unsafe)
        </Button>

        <Text style={styles.paperHint}>
          ✓ Write on paper{'\\n'}
          ✓ Store in a safe place{'\\n'}
          ✗ Never screenshot{'\\n'}
          ✗ Never email or message
        </Text>

        <Button
          mode="contained"
          onPress={handleBackupComplete}
          loading={isLoading}
          disabled={isLoading}
          style={styles.primaryBtn}
          buttonColor={theme.colors.success}
          textColor="#FFFFFF"
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          I Have Written It Down
        </Button>
      </ScrollView>
    );
  }

  // ==================== MODE: IMPORT ====================
  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
      keyboardVerticalOffset={24}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Restore Wallet</Text>
          <Text style={styles.subtitle}>Enter your 12 or 24 word seed phrase</Text>

          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={importInput}
            onChangeText={setImportInput}
            placeholder="word1 word2 word3 ..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            autoCapitalize="none"
          />

          <Button
            mode="contained"
            onPress={handleImport}
            loading={isLoading}
            disabled={!importInput.trim() || isLoading}
            style={styles.primaryBtn}
            buttonColor={theme.colors.primary}
            textColor="#FFFFFF"
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
          >
            Restore Wallet
          </Button>

          {localError ? <Text style={styles.error}>{localError}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
    paddingTop: 60,
  },
  logo: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
    lineHeight: 22,
  },
  primaryBtn: {
    marginVertical: 8,
    borderRadius: 14,
    paddingVertical: 4,
  },
  secondaryBtn: {
    marginVertical: 8,
    borderRadius: 14,
    borderColor: theme.colors.primary,
    paddingVertical: 4,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginTop: 16,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.warning,
    textAlign: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  wordsCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordBox: {
    width: '30%',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  wordNumber: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  wordText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  copyBtn: {
    marginBottom: 16,
    borderRadius: 10,
    borderColor: theme.colors.warning,
  },
  paperHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    marginBottom: 20,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});