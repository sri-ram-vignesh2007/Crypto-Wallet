// src/screens/SettingsScreen.tsx - Trust Wallet Style Settings & Key Management

import React, { useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, Switch,
  SafeAreaView, StatusBar, Alert, Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { useAppLock } from '../hooks/useAppLock';
import { SecureKeyManager } from '../core/SecureKeyManager';
import { CHAINS } from '../core/ChainConfig';

const ChevronRightIcon = ({ color = '#94A3B8', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const KeyIcon = ({ color = '#0500FF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="7.5" cy="15.5" r="4.5" />
    <Path d="M10.5 12.5L20 3M16 7l2 2M18 5l2 2" />
  </Svg>
);

const ShieldIcon = ({ color = '#10B981', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const GlobeIcon = ({ color = '#3B82F6', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
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
      'Security Warning',
      'Never share your secret recovery phrase. Anyone with these 12 words has full control of your assets.',
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
      'Extreme Caution',
      'Your private key gives direct access to all funds on-chain. Never enter it on any website or send to anyone.',
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
      'Reset Wallet',
      'Are you sure you want to delete this wallet from this device? Make sure you have your secret recovery phrase backed up.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Wallet',
          style: 'destructive',
          onPress: async () => {
            await resetWallet();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Overview Card */}
        <View style={[styles.walletCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={[styles.walletName, { color: colors.text.primary }]}>Main Wallet 1</Text>
              <Text style={[styles.walletAddr, { color: colors.text.muted }]}>
                {displayAddress.slice(0, 10)}...{displayAddress.slice(-8)}
              </Text>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>

          {/* Quick Key Action Pills */}
          <View style={styles.keyActionsRow}>
            <TouchableOpacity
              onPress={viewPublicAddress}
              style={[styles.keyActionBtn, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyActionText, { color: colors.text.primary }]}>Public Address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={viewSecretPhrase}
              style={[styles.keyActionBtn, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyActionText, { color: colors.text.primary }]}>Secret Phrase</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={viewPrivateKey}
              style={[styles.keyActionBtn, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyActionText, { color: '#EF4444' }]}>Private Key</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Section */}
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Security</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <ShieldIcon color="#10B981" size={18} />
              <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.border.DEFAULT, true: colors.primary.DEFAULT }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Networks Section */}
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Networks</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NetworkSettings')}
            style={styles.settingRowClickable}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <GlobeIcon color={colors.primary.DEFAULT} size={18} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.text.primary }]}>Public RPC Networks</Text>
                <Text style={[styles.settingSub, { color: colors.text.muted }]}>
                  {Object.keys(CHAINS).length} Free High-Speed Blockchains
                </Text>
              </View>
            </View>
            <ChevronRightIcon color={colors.text.muted} size={18} />
          </TouchableOpacity>
        </View>

        {/* App Info & Reset */}
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>App & Account</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('About')}
            style={styles.settingRowClickable}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>About Crypto Wallet</Text>
            <Text style={[styles.settingValue, { color: colors.text.muted }]}>v1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResetWallet}
            style={[styles.settingRowClickable, { borderTopWidth: 0.5, borderTopColor: colors.border.subtle }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Reset / Delete Wallet</Text>
            <ChevronRightIcon color="#EF4444" size={18} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Secret / Key Viewer Modal */}
      <Modal
        visible={!!revealedSecret}
        transparent
        animationType="slide"
        onRequestClose={() => setRevealedSecret(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.secretSheet, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Text style={[styles.secretTitle, { color: colors.text.primary }]}>
              {revealedSecret?.type === 'address' && 'Public Address'}
              {revealedSecret?.type === 'phrase' && 'Secret Recovery Phrase'}
              {revealedSecret?.type === 'key' && 'Private Key'}
            </Text>

            <Text style={[styles.secretWarning, { color: revealedSecret?.type === 'key' ? '#EF4444' : colors.text.secondary }]}>
              {revealedSecret?.type === 'address' && 'Safe to share with anyone to receive coins.'}
              {revealedSecret?.type === 'phrase' && 'Never share these 12 words with anyone. Store them offline.'}
              {revealedSecret?.type === 'key' && 'CRITICAL: Anyone with this private key can take your funds permanently.'}
            </Text>

            {revealedSecret?.type === 'phrase' ? (
              <View style={[styles.wordsGrid, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}>
                {revealedSecret.value.split(' ').map((w, idx) => (
                  <View key={idx} style={[styles.wordItem, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
                    <Text style={[styles.wordNum, { color: colors.text.muted }]}>{idx + 1}.</Text>
                    <Text style={[styles.wordText, { color: colors.text.primary }]}>{w}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.keyBox, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}>
                <Text style={[styles.keyText, { color: colors.text.primary }]} selectable>
                  {revealedSecret?.value}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={copySecret}
              style={[styles.modalCopyBtn, { backgroundColor: colors.primary.DEFAULT }]}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCopyBtnText}>
                {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRevealedSecret(null)}
              style={[styles.modalCloseBtn, { borderColor: colors.border.subtle }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCloseBtnText, { color: colors.text.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  walletCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  walletName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  walletAddr: {
    fontSize: 13,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  keyActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  keyActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingRowClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  settingSub: {
    fontSize: 12,
    marginLeft: 12,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  secretSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
  },
  secretTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  secretWarning: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  wordItem: {
    width: '48%',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  wordNum: {
    width: 24,
    fontSize: 12,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '700',
  },
  keyBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  keyText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  modalCopyBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCopyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
