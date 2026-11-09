// src/screens/SettingsScreen.tsx - Apple iPhone iOS Settings Style & Key Management

import React, { useState, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, Switch,
  SafeAreaView, StatusBar, Alert, Modal, Animated, Pressable, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark, useTheme } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { SecureKeyManager } from '../core/SecureKeyManager';
import { CHAINS } from '../core/ChainConfig';

// Smooth iOS Spring Button Component
function SpringButton({
  children,
  onPress,
  disabled = false,
  style,
  activeScale = 0.97,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  activeScale?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: activeScale,
      damping: 18,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 18,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const ChevronRightIcon = ({ color = '#8E8E93', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const KeyIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="7.5" cy="15.5" r="4.5" />
    <Path d="M10.5 12.5L20 3M16 7l2 2M18 5l2 2" />
  </Svg>
);

const ShieldIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const GlobeIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
  </Svg>
);

const InfoIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 16v-4M12 8h.01" />
  </Svg>
);

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { address, selectedChain, resetWallet } = useWalletStore();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const [revealedSecret, setRevealedSecret] = useState<{ type: 'phrase' | 'key' | 'address'; value: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const displayAddress = address || '0x0000000000000000000000000000000000000000';

  const viewPublicAddress = () => {
    setRevealedSecret({
      type: 'address',
      value: displayAddress,
    });
  };

  const viewSecretPhrase = async () => {
    Alert.alert(
      'Secret Recovery Phrase',
      'Never share your secret recovery phrase. Anyone with these 12 words has complete access to your funds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reveal Phrase',
          style: 'destructive',
          onPress: async () => {
            try {
              const phrase = await SecureKeyManager.getMnemonic();
              if (phrase) {
                setRevealedSecret({ type: 'phrase', value: phrase });
              } else {
                Alert.alert('Not Found', 'Seed phrase not stored on this device.');
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Authentication failed');
            }
          },
        },
      ]
    );
  };

  const viewPrivateKey = async () => {
    Alert.alert(
      'Export Private Key',
      'Your private key gives direct and irreversible control over this address on-chain. Keep it strictly private.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reveal Key',
          style: 'destructive',
          onPress: async () => {
            try {
              const pk = await SecureKeyManager.getPrivateKey();
              if (pk) {
                setRevealedSecret({ type: 'key', value: pk });
              } else {
                Alert.alert('Not Found', 'Private key not accessible.');
              }
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Authentication failed');
            }
          },
        },
      ]
    );
  };

  const copySecret = async () => {
    if (!revealedSecret) return;
    try {
      await Clipboard.setStringAsync(revealedSecret.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleResetWallet = () => {
    Alert.alert(
      'Remove Wallet',
      'Are you sure you want to remove this wallet from this device? Ensure you have your recovery phrase backed up securely.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Wallet',
          style: 'destructive',
          onPress: async () => {
            await resetWallet();
          },
        },
      ]
    );
  };

  const { toggleTheme } = useTheme();
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const hairline = isDark ? '#303030' : '#E5E5E5';
  const canvasBg = isDark ? '#000000' : '#FFFFFF';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMuted = isDark ? '#202020' : '#F2F2F2';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: canvasBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Large Title Navigation Header */}
      <View style={[styles.largeHeader, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.largeTitle, { color: colors.text.primary }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(34, insets.bottom + 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Profile Card */}
        <View style={[styles.insetGroupCard, { backgroundColor: cardBg, borderColor: hairline }]}>
          <View style={styles.walletProfileRow}>
            <View style={[styles.walletAvatar, { backgroundColor: monoPrimary }]}>
              <Text style={{ fontSize: 16 }}>💎</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.walletTitle, { color: colors.text.primary }]}>CryptoVault</Text>
              <Text style={[styles.walletSubtitle, { color: colors.text.muted }]}>
                {displayAddress.slice(0, 8)}...{displayAddress.slice(-6)}
              </Text>
            </View>
            <View style={[styles.activeCapsule, { backgroundColor: monoMuted }]}>
              <Text style={[styles.activeCapsuleText, { color: colors.text.primary }]}>Active</Text>
            </View>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: hairline, marginLeft: 0 }]} />

          {/* Quick Key Export Buttons */}
          <View style={styles.keyActionsContainer}>
            <SpringButton
              onPress={viewPublicAddress}
              style={[styles.keyPillBtn, { backgroundColor: monoMuted }]}
            >
              <Text style={[styles.keyPillBtnText, { color: colors.text.primary }]}>Public Address</Text>
            </SpringButton>

            <SpringButton
              onPress={viewSecretPhrase}
              style={[styles.keyPillBtn, { backgroundColor: monoMuted }]}
            >
              <Text style={[styles.keyPillBtnText, { color: colors.text.primary }]}>Seed Phrase</Text>
            </SpringButton>

            <SpringButton
              onPress={viewPrivateKey}
              style={[styles.keyPillBtn, { backgroundColor: monoMuted }]}
            >
              <Text style={[styles.keyPillBtnText, { color: isDark ? '#EF4444' : '#DC2626' }]}>Private Key</Text>
            </SpringButton>
          </View>
        </View>

        {/* Section: Appearance */}
        <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>APPEARANCE</Text>
        <View style={[styles.insetGroupCard, { backgroundColor: cardBg, borderColor: hairline }]}>
          <View style={styles.settingsRow}>
            <View style={[styles.iconCapsule, { backgroundColor: monoMuted }]}>
              <Text style={{ fontSize: 13 }}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <Text style={[styles.settingsLabel, { color: colors.text.primary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: isDark ? '#303030' : '#E5E5E5', true: monoPrimary }}
              thumbColor={isDark ? '#000000' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Section: Security */}
        <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>SECURITY</Text>
        <View style={[styles.insetGroupCard, { backgroundColor: cardBg, borderColor: hairline }]}>
          <View style={styles.settingsRow}>
            <View style={[styles.iconCapsule, { backgroundColor: monoMuted }]}>
              <ShieldIcon color={colors.text.primary} size={17} />
            </View>
            <Text style={[styles.settingsLabel, { color: colors.text.primary }]}>Face ID / Biometrics</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: isDark ? '#303030' : '#E5E5E5', true: monoPrimary }}
              thumbColor={isDark ? '#000000' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Section: Network & Nodes */}
        <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>NETWORK CONNECTIONS</Text>
        <View style={[styles.insetGroupCard, { backgroundColor: cardBg, borderColor: hairline }]}>
          <SpringButton
            onPress={() => navigation.navigate('NetworkSettings')}
            style={styles.settingsRow}
          >
            <View style={[styles.iconCapsule, { backgroundColor: monoMuted }]}>
              <GlobeIcon color={colors.text.primary} size={17} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.settingsLabel, { color: colors.text.primary, marginLeft: 0 }]}>
                RPC Blockchains
              </Text>
              <Text style={[styles.settingsSubtext, { color: colors.text.muted }]}>
                {Object.keys(CHAINS).length} Free Public Endpoints
              </Text>
            </View>
            <ChevronRightIcon color={colors.text.muted} size={15} />
          </SpringButton>
        </View>

        {/* Section: General */}
        <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>GENERAL</Text>
        <View style={[styles.insetGroupCard, { backgroundColor: cardBg, borderColor: hairline }]}>
          <SpringButton
            onPress={() => navigation.navigate('About')}
            style={styles.settingsRow}
          >
            <View style={[styles.iconCapsule, { backgroundColor: monoMuted }]}>
              <InfoIcon color={colors.text.primary} size={17} />
            </View>
            <Text style={[styles.settingsLabel, { color: colors.text.primary }]}>About Crypto Wallet</Text>
            <Text style={[styles.settingsValue, { color: colors.text.muted }]}>v1.0.0</Text>
            <ChevronRightIcon color={colors.text.muted} size={15} />
          </SpringButton>

          <View style={[styles.rowDivider, { backgroundColor: hairline }]} />

          <SpringButton
            onPress={handleResetWallet}
            style={styles.settingsRow}
          >
            <Text style={[styles.settingsLabel, { color: isDark ? '#FF453A' : '#FF3B30', marginLeft: 4 }]}>
              Remove Wallet
            </Text>
            <ChevronRightIcon color={isDark ? '#FF453A' : '#FF3B30'} size={15} />
          </SpringButton>
        </View>
      </ScrollView>

      {/* Secret / Key Viewer Sheet Modal */}
      <Modal
        visible={!!revealedSecret}
        transparent
        animationType="slide"
        onRequestClose={() => setRevealedSecret(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg, borderColor: hairline }]}>
            <View style={[styles.sheetGrabber, { backgroundColor: isDark ? '#3A3A3C' : '#D1D1D6' }]} />

            <Text style={[styles.modalSheetTitle, { color: colors.text.primary }]}>
              {revealedSecret?.type === 'address' && 'Public Address'}
              {revealedSecret?.type === 'phrase' && 'Secret Recovery Phrase'}
              {revealedSecret?.type === 'key' && 'Private Key'}
            </Text>

            <Text style={[styles.modalSheetSubtitle, { color: revealedSecret?.type === 'key' ? (isDark ? '#FF453A' : '#FF3B30') : colors.text.secondary }]}>
              {revealedSecret?.type === 'address' && 'Share this public address with anyone to receive coins.'}
              {revealedSecret?.type === 'phrase' && 'Never share these 12 words with anyone. Keep them offline in a safe place.'}
              {revealedSecret?.type === 'key' && 'WARNING: Anyone with your private key can immediately steal all funds on-chain.'}
            </Text>

            {revealedSecret?.type === 'phrase' ? (
              <View style={[styles.wordsGridCard, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                {revealedSecret.value.split(' ').map((w, idx) => (
                  <View key={idx} style={[styles.wordChip, { backgroundColor: cardBg, borderColor: hairline }]}>
                    <Text style={[styles.wordNumber, { color: colors.text.muted }]}>{idx + 1}</Text>
                    <Text style={[styles.wordText, { color: colors.text.primary }]}>{w}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.secretBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <Text style={[styles.secretBoxText, { color: colors.text.primary }]} selectable>
                  {revealedSecret?.value}
                </Text>
              </View>
            )}

            <SpringButton
              onPress={copySecret}
              style={[styles.primarySheetBtn, { backgroundColor: monoPrimary }]}
            >
              <Text style={[styles.primarySheetBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                {copied ? '✓ Copied to Clipboard' : 'Copy to Clipboard'}
              </Text>
            </SpringButton>

            <SpringButton
              onPress={() => setRevealedSecret(null)}
              style={[styles.secondarySheetBtn, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            >
              <Text style={[styles.secondarySheetBtnText, { color: colors.text.primary }]}>Done</Text>
            </SpringButton>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  largeHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 14,
    marginTop: 18,
  },
  insetGroupCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  walletProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  walletAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletAvatarEmoji: {
    fontSize: 22,
  },
  walletTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  walletSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  activeCapsule: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeCapsuleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  keyActionsContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  keyPillBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPillBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  iconCapsule: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  settingsSubtext: {
    fontSize: 12,
    marginTop: 1,
  },
  settingsValue: {
    fontSize: 15,
    marginRight: 6,
  },
  rowDivider: {
    height: 0.5,
    marginLeft: 56,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sheetGrabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  modalSheetSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  wordsGridCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 18,
  },
  wordChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    marginBottom: 8,
  },
  wordNumber: {
    width: 22,
    fontSize: 12,
    fontWeight: '500',
  },
  wordText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secretBox: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
  },
  secretBoxText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  primarySheetBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primarySheetBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondarySheetBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondarySheetBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
