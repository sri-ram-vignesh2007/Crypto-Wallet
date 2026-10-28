// src/screens/SubScreens.tsx
// Secondary Navigation Screens for CryptoVaultAI

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Alert, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { CHAINS } from '../core/ChainConfig';

// ── CONNECTED APPS SCREEN ──
export function ConnectedAppsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Connected dApps</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>WalletConnect & dApp sessions</Text>
      </View>
      <View style={[styles.emptyBox, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
        <Text style={styles.emptyIcon}>🔗</Text>
        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Active Connections</Text>
        <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
          When you connect CryptoVaultAI to decentralized apps (Uniswap, OpenSea, Aave), they will appear here.
        </Text>
      </View>
    </View>
  );
}

// ── WALLETS MANAGEMENT SCREEN ──
export function WalletsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const { address } = useWalletStore();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Manage Wallets</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Your active multi-chain accounts</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Primary Vault Wallet</Text>
            <Text style={[styles.cardSub, { color: colors.text.secondary }]}>
              {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '0x71C...389A'}
            </Text>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary.DEFAULT }]}
        onPress={() => navigation?.navigate?.('CreateImportWallet', { mode: 'import' })}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>+ Import Another Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── PRIVACY SETTINGS SCREEN ──
export function PrivacySettingsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Privacy & Security</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Zero-knowledge & telemetry settings</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>100% Client-Side Encryption</Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
          CryptoVaultAI does not track IP addresses, log user queries, or store private keys on any server.
        </Text>
      </View>
    </View>
  );
}

// ── NETWORK SETTINGS SCREEN ──
export function NetworkSettingsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const { selectedChain, setSelectedChain } = useWalletStore();

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg.canvas }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Public RPC Networks</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>High-availability multi-endpoint failover</Text>
      </View>
      {Object.entries(CHAINS).map(([key, chain]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.networkItem,
            { backgroundColor: colors.bg.surface, borderColor: selectedChain === key ? colors.primary.DEFAULT : colors.border.subtle },
          ]}
          onPress={() => setSelectedChain(key)}
          activeOpacity={0.8}
        >
          <Text style={styles.chainLogo}>{chain.logo}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.chainName, { color: colors.text.primary }]}>{chain.name}</Text>
            <Text style={[styles.chainRpc, { color: colors.text.muted }]}>{chain.rpcUrls[0]}</Text>
          </View>
          {selectedChain === key && (
            <Text style={{ color: colors.primary.DEFAULT, fontWeight: '700' }}>Active</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ── HELP & FAQ SCREEN ──
export function HelpScreen() {
  const colors = useColors();
  const isDark = useIsDark();
  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg.canvas }]} contentContainerStyle={{ padding: 20, paddingTop: 30 }}>
      <Text style={[styles.title, { color: colors.text.primary, marginBottom: 8 }]}>Help & FAQ</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, marginBottom: 20 }]}>Common questions & guides</Text>
      <View style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle, marginBottom: 12 }]}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>How does CryptoVaultAI secure my funds?</Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary, marginTop: 4 }]}>
          Your private key and 12-word seed phrase are generated using standard BIP-39 and stored exclusively on your device.
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Are the RPC connectors really free?</Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary, marginTop: 4 }]}>
          Yes! CryptoVaultAI connects to public high-uptime RPC nodes from Cloudflare, LlamaNodes, Ankr, and Binance.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── FEEDBACK SCREEN ──
export function FeedbackScreen() {
  const colors = useColors();
  const [msg, setMsg] = useState('');
  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas, padding: 20, paddingTop: 30 }]}>
      <Text style={[styles.title, { color: colors.text.primary, marginBottom: 8 }]}>Send Feedback</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, marginBottom: 20 }]}>Help us improve CryptoVaultAI</Text>
      <TextInput
        style={[styles.feedbackInput, { backgroundColor: colors.bg.surface, color: colors.text.primary, borderColor: colors.border.subtle }]}
        placeholder="Describe your issue or suggestion…"
        placeholderTextColor={colors.text.muted}
        multiline
        numberOfLines={5}
        value={msg}
        onChangeText={setMsg}
      />
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary.DEFAULT, marginTop: 16 }]}
        onPress={() => {
          Alert.alert('Feedback Sent', 'Thank you for your feedback!');
          setMsg('');
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── ABOUT SCREEN ──
export function AboutScreen() {
  const colors = useColors();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas, padding: 20, paddingTop: 40, alignItems: 'center' }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>CryptoVault<Text style={{ color: colors.primary.DEFAULT }}>AI</Text></Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, marginTop: 4 }]}>Version 2.0.0 (Multi-Chain)</Text>
      <Text style={[styles.cardDesc, { color: colors.text.muted, textAlign: 'center', marginTop: 20, maxWidth: 300 }]}>
        Non-custodial, open-source Web3 intelligence wallet with multi-chain RPCs, AI streaming, and DEX swap aggregator.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyBox: {
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  chainLogo: {
    fontSize: 22,
  },
  chainName: {
    fontSize: 15,
    fontWeight: '700',
  },
  chainRpc: {
    fontSize: 11,
    marginTop: 2,
  },
  feedbackInput: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
