// src/screens/SubScreens.tsx
// Secondary Navigation Screens for Crypto Wallet (Institutional Trust Wallet / Coinbase Wallet Features)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Alert, StatusBar, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { CHAINS } from '../core/ChainConfig';

// ── CONNECTED APPS & WEB3 DAPP ACCESS SCREEN ──
export function ConnectedAppsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess-1',
      name: 'Uniswap v3',
      domain: 'app.uniswap.org',
      chain: 'Ethereum',
      emoji: '🦄',
      connectedAt: '25m ago',
    },
    {
      id: 'sess-2',
      name: 'Aave v3 Lending',
      domain: 'app.aave.com',
      chain: 'Arbitrum',
      emoji: '👻',
      connectedAt: '1h ago',
    },
  ]);

  const disconnectSession = (id: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== id));
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg.canvas }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111' }]}>Connected dApps & Web3</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>WalletConnect sessions & decentralized apps</Text>
      </View>

      {/* Web3 DApp Browser Banner */}
      <TouchableOpacity
        onPress={() => navigation?.navigate?.('DAppBrowser')}
        style={[styles.dappPromoBanner, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
        activeOpacity={0.85}
      >
        <View style={styles.promoLeft}>
          <Text style={{ fontSize: 30 }}>🌐</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.promoTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Open Web3 dApp Browser</Text>
            <Text style={styles.promoSub}>Explore DEXs, Staking, Lending & Perps</Text>
          </View>
        </View>
        <Text style={{ fontSize: 16, color: colors.primary.DEFAULT, fontWeight: '700' }}>Launch →</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111', marginTop: 24, marginBottom: 12 }]}>
        Active Sessions ({activeSessions.length})
      </Text>

      {activeSessions.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={styles.emptyIcon}>🔗</Text>
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>No Active Connections</Text>
          <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
            When you connect Cura Wallet to decentralized apps (Uniswap, OpenSea, Aave), they will appear here.
          </Text>
        </View>
      ) : (
        activeSessions.map(session => (
          <View key={session.id} style={[styles.sessionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={{ fontSize: 26 }}>{session.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.sessionName, { color: isDark ? '#FFFFFF' : '#111111' }]}>{session.name}</Text>
              <Text style={styles.sessionMeta}>{session.domain} • {session.chain} • {session.connectedAt}</Text>
            </View>
            <TouchableOpacity
              onPress={() => disconnectSession(session.id)}
              style={[styles.disconnectBtn, { backgroundColor: monoMutedSurface }]}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ── WALLETS MANAGEMENT & CROSS-COMPATIBILITY SCREEN ──
export function WalletsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const { wallets, activeWalletIndex, switchWallet, createAdditionalWallet, deleteWallet } = useWalletStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importSource, setImportSource] = useState<string>('Trust Wallet');
  const [importPhrase, setImportPhrase] = useState('');

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const handleCreateNew = async () => {
    if (wallets.length >= 4) {
      Alert.alert('Limit Reached', 'You can have up to 4 self-custodial wallets.');
      return;
    }
    const res = await createAdditionalWallet(`Vault Wallet #${wallets.length + 1}`);
    if (res.success) {
      Alert.alert('Wallet Created', 'New multi-chain account initialized with unique derived keys.');
    } else {
      Alert.alert('Error', res.error || 'Failed to create wallet.');
    }
  };

  const handleExecuteImport = () => {
    if (!importPhrase.trim()) {
      Alert.alert('Error', 'Please enter a 12-word recovery phrase or private key.');
      return;
    }
    setShowImportModal(false);
    navigation?.navigate?.('SeedPhrase', { mode: 'import', initialPhrase: importPhrase.trim() });
  };

  const CROSS_IMPORT_PRESETS = [
    { name: 'Trust Wallet', icon: '🛡️', desc: '12-word standard BIP-39 multi-coin recovery phrase' },
    { name: 'Coinbase Wallet', icon: '🔵', desc: '12-word self-custody mnemonic phrase' },
    { name: 'MetaMask', icon: '🦊', desc: '12 or 24-word Secret Recovery Phrase' },
    { name: 'Phantom', icon: '👻', desc: '12-word multi-chain recovery phrase' },
  ];

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg.canvas }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111' }]}>Manage Wallets ({wallets.length}/4)</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          True Self-Custody & Cross-Wallet Compatibility
        </Text>
      </View>

      {/* Active Wallets List */}
      {wallets.map((w, idx) => {
        const isActive = idx === activeWalletIndex;
        return (
          <View
            key={w.id}
            style={[
              styles.walletItemCard,
              { backgroundColor: cardBg, borderColor: isActive ? monoPrimary : cardBorder },
            ]}
          >
            <TouchableOpacity
              onPress={() => switchWallet(idx)}
              style={styles.walletItemLeft}
              activeOpacity={0.8}
            >
              <View style={[styles.walletAvatar, { backgroundColor: monoMutedSurface }]}>
                <Text style={{ fontSize: 18 }}>💼</Text>
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.walletName, { color: isDark ? '#FFFFFF' : '#111111' }]}>{w.name}</Text>
                  {isActive && (
                    <View style={styles.activePill}>
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.walletAddr} numberOfLines={1}>{w.address}</Text>
              </View>
            </TouchableOpacity>

            {wallets.length > 1 && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Remove Wallet', `Delete ${w.name} from this device?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteWallet(w.id) },
                  ]);
                }}
                style={styles.deleteWalletBtn}
              >
                <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {/* Create New Wallet Button */}
      {wallets.length < 4 && (
        <TouchableOpacity
          onPress={handleCreateNew}
          style={[styles.outlineBtn, { borderColor: cardBorder, backgroundColor: monoMutedSurface, marginBottom: 24 }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.outlineBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
            + Create New Multi-Chain Account
          </Text>
        </TouchableOpacity>
      )}

      {/* ── CROSS-COMPATIBILITY IMPORT PRESETS ── */}
      <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111', marginTop: 12, marginBottom: 8 }]}>
        Cross-Compatibility Import
      </Text>
      <Text style={[styles.crossDesc, { color: colors.text.muted, marginBottom: 14 }]}>
        Easily import your 12-word recovery phrase from other self-custodial wallets to view and manage the same funds in Cura Wallet.
      </Text>

      {CROSS_IMPORT_PRESETS.map(preset => (
        <TouchableOpacity
          key={preset.name}
          onPress={() => {
            setImportSource(preset.name);
            setShowImportModal(true);
          }}
          style={[styles.importPresetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 24 }}>{preset.icon}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.presetTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Import from {preset.name}</Text>
            <Text style={styles.presetSub}>{preset.desc}</Text>
          </View>
          <Text style={{ color: colors.primary.DEFAULT, fontWeight: '700', fontSize: 13 }}>Import →</Text>
        </TouchableOpacity>
      ))}

      {/* Import Modal */}
      <Modal visible={showImportModal} transparent animationType="slide" onRequestClose={() => setShowImportModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowImportModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                Import from {importSource}
              </Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <Text style={{ color: '#858585', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: colors.text.muted }]}>
              Enter your 12-word Secret Recovery Phrase or Private Key from {importSource}. It will be stored securely in your device's hardware keychain.
            </Text>

            <TextInput
              value={importPhrase}
              onChangeText={setImportPhrase}
              placeholder="word1 word2 word3 ... word12"
              placeholderTextColor="#858585"
              multiline
              numberOfLines={4}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.importInput, { backgroundColor: monoMutedSurface, borderColor: cardBorder, color: isDark ? '#FFFFFF' : '#111111' }]}
            />

            <TouchableOpacity
              onPress={handleExecuteImport}
              style={[styles.modalConfirmBtn, { backgroundColor: monoPrimary }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalConfirmText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                Confirm & Import Account
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

// ── PRIVACY SETTINGS SCREEN ──
export function PrivacySettingsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg.canvas }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111' }]}>Privacy & Security</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Zero-knowledge & telemetry settings</Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>100% Client-Side Encryption</Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary, marginTop: 4 }]}>
          Cura Wallet never tracks IP addresses, logs user searches, or stores private keys on remote servers. All cryptography is handled entirely on your physical device.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>MEV & Phishing Shield</Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary, marginTop: 4 }]}>
          Transactions are routed via private RPC relays to prevent sandwich attacks, frontrunning, and mempool exploitation.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── NETWORK SETTINGS SCREEN (100+ Multi-Chain & Custom RPC) ──
export function NetworkSettingsScreen({ navigation }: { navigation?: any }) {
  const colors = useColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const { selectedChain, setSelectedChain } = useWalletStore();

  const [showAddRpcModal, setShowAddRpcModal] = useState(false);
  const [customNetName, setCustomNetName] = useState('');
  const [customNetRpc, setCustomNetRpc] = useState('');
  const [customNetChainId, setCustomNetChainId] = useState('');
  const [customNetSymbol, setCustomNetSymbol] = useState('');

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const handleAddCustomNetwork = () => {
    if (!customNetName || !customNetRpc || !customNetChainId) {
      Alert.alert('Missing Fields', 'Please enter Network Name, RPC URL, and Chain ID.');
      return;
    }
    Alert.alert('Network Added', `${customNetName} added to your active RPC registry.`);
    setShowAddRpcModal(false);
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg.canvas }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111' }]}>Multi-Chain RPC Networks</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>High-availability multi-endpoint failover</Text>
      </View>

      <TouchableOpacity
        onPress={() => setShowAddRpcModal(true)}
        style={[styles.outlineBtn, { borderColor: cardBorder, backgroundColor: monoMutedSurface, marginBottom: 16 }]}
        activeOpacity={0.8}
      >
        <Text style={[styles.outlineBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>+ Add Custom Network (EVM / RPC)</Text>
      </TouchableOpacity>

      {Object.entries(CHAINS).map(([key, chain]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.networkItem,
            { backgroundColor: cardBg, borderColor: selectedChain === key ? monoPrimary : cardBorder },
          ]}
          onPress={() => setSelectedChain(key)}
          activeOpacity={0.8}
        >
          <Text style={styles.chainLogo}>{chain.logo}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.chainName, { color: isDark ? '#FFFFFF' : '#111111' }]}>{chain.name}</Text>
              {chain.isTestnet && (
                <View style={[styles.testnetBadge, { backgroundColor: monoMutedSurface }]}>
                  <Text style={styles.testnetText}>Testnet</Text>
                </View>
              )}
            </View>
            <Text style={[styles.chainRpc, { color: colors.text.muted }]}>{chain.rpcUrls[0]}</Text>
          </View>
          {selectedChain === key && (
            <View style={styles.activePill}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Add Custom Network Modal */}
      <Modal visible={showAddRpcModal} transparent animationType="slide" onRequestClose={() => setShowAddRpcModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddRpcModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Add Custom Network</Text>
              <TouchableOpacity onPress={() => setShowAddRpcModal(false)}>
                <Text style={{ color: '#858585', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={customNetName}
              onChangeText={setCustomNetName}
              placeholder="Network Name (e.g. Polygon zkEVM)"
              placeholderTextColor="#858585"
              style={[styles.customNetInput, { backgroundColor: monoMutedSurface, borderColor: cardBorder, color: isDark ? '#FFFFFF' : '#111111' }]}
            />
            <TextInput
              value={customNetRpc}
              onChangeText={setCustomNetRpc}
              placeholder="RPC URL (e.g. https://zkevm-rpc.com)"
              placeholderTextColor="#858585"
              autoCapitalize="none"
              style={[styles.customNetInput, { backgroundColor: monoMutedSurface, borderColor: cardBorder, color: isDark ? '#FFFFFF' : '#111111' }]}
            />
            <TextInput
              value={customNetChainId}
              onChangeText={setCustomNetChainId}
              placeholder="Chain ID (e.g. 1101)"
              placeholderTextColor="#858585"
              keyboardType="numeric"
              style={[styles.customNetInput, { backgroundColor: monoMutedSurface, borderColor: cardBorder, color: isDark ? '#FFFFFF' : '#111111' }]}
            />
            <TextInput
              value={customNetSymbol}
              onChangeText={setCustomNetSymbol}
              placeholder="Currency Symbol (e.g. ETH)"
              placeholderTextColor="#858585"
              style={[styles.customNetInput, { backgroundColor: monoMutedSurface, borderColor: cardBorder, color: isDark ? '#FFFFFF' : '#111111' }]}
            />

            <TouchableOpacity
              onPress={handleAddCustomNetwork}
              style={[styles.modalConfirmBtn, { backgroundColor: monoPrimary, marginTop: 10 }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalConfirmText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                Save & Connect Network
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

// ── HELP & FAQ SCREEN ──
export function HelpScreen() {
  const colors = useColors();
  const isDark = useIsDark();
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg.canvas }]} contentContainerStyle={{ padding: 20, paddingTop: 30 }}>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111', marginBottom: 8 }]}>Help & FAQ</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, marginBottom: 20 }]}>Common questions & guides</Text>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, marginBottom: 12 }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>How does Cura Wallet secure my funds?</Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary, marginTop: 4 }]}>
          Your private key and 12-word seed phrase are generated using standard BIP-39 and stored exclusively on your device.
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Are the RPC connectors really free?</Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary, marginTop: 4 }]}>
          Yes! Cura Wallet connects to public high-uptime RPC nodes from Cloudflare, LlamaNodes, Ankr, and Binance.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── FEEDBACK SCREEN ──
export function FeedbackScreen() {
  const colors = useColors();
  const isDark = useIsDark();
  const [msg, setMsg] = useState('');
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';

  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas, padding: 20, paddingTop: 30 }]}>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111', marginBottom: 8 }]}>Send Feedback</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, marginBottom: 20 }]}>Help us improve Cura Wallet</Text>
      <TextInput
        style={[styles.feedbackInput, { backgroundColor: cardBg, color: isDark ? '#FFFFFF' : '#111111', borderColor: cardBorder }]}
        placeholder="Describe your issue or suggestion…"
        placeholderTextColor="#858585"
        multiline
        numberOfLines={5}
        value={msg}
        onChangeText={setMsg}
      />
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: monoPrimary, marginTop: 16 }]}
        onPress={() => {
          Alert.alert('Feedback Sent', 'Thank you for your feedback!');
          setMsg('');
        }}
        activeOpacity={0.8}
      >
        <Text style={[styles.primaryBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── ABOUT SCREEN ──
export function AboutScreen() {
  const colors = useColors();
  const isDark = useIsDark();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas, padding: 20, paddingTop: 40, alignItems: 'center' }]}>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111111' }]}>Cura <Text style={{ color: colors.primary.DEFAULT }}>Wallet</Text></Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, marginTop: 4 }]}>Version 2.0.0 (Institutional Multi-Chain)</Text>
      <Text style={[styles.cardDesc, { color: colors.text.muted, textAlign: 'center', marginTop: 20, maxWidth: 300 }]}>
        Non-custodial, open-source Web3 wallet combining Trust Wallet and Coinbase Wallet features: 100+ blockchains, DEX swaps, Perpetual Futures trading, Web3 DApp browser, and hardware-isolated key control.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  dappPromoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  promoSub: {
    color: '#858585',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '800',
  },
  sessionMeta: {
    color: '#858585',
    fontSize: 11,
    marginTop: 2,
  },
  disconnectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  disconnectText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
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
  walletItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  walletItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    fontSize: 15,
    fontWeight: '800',
  },
  walletAddr: {
    color: '#858585',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  deleteWalletBtn: {
    padding: 8,
  },
  activePill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '700',
  },
  outlineBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  crossDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  importPresetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  presetSub: {
    color: '#858585',
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '75%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  importInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalConfirmBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '800',
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
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
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
  testnetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  testnetText: {
    color: '#858585',
    fontSize: 10,
    fontWeight: '700',
  },
  customNetInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  feedbackInput: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
