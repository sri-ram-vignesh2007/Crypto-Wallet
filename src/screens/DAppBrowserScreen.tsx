// src/screens/DAppBrowserScreen.tsx - Institutional Web3 DApp Browser & DeFi Staking Hub (Coinbase / Trust Wallet Style)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  StatusBar, Modal, Dimensions, Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vector Glyphs
const ArrowLeftIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const GlobeIcon = ({ color = '#858585', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

const SearchIcon = ({ color = '#858585', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const ExternalLinkIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
  </Svg>
);

export type DAppCategory = 'All' | 'DEXs' | 'DeFi & Staking' | 'Perps & Futures' | 'NFTs' | 'Bridges';

interface DAppItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: DAppCategory;
  chain: string;
  badge: string;
  iconBg: string;
  emoji: string;
}

const FEATURED_DAPPS: DAppItem[] = [
  {
    id: 'uniswap',
    name: 'Uniswap v3',
    url: 'https://app.uniswap.org',
    description: 'Leading multi-chain decentralized exchange with automated liquidity.',
    category: 'DEXs',
    chain: 'Ethereum, Base, Arbitrum',
    badge: 'Popular',
    iconBg: '#FF007A',
    emoji: '🦄',
  },
  {
    id: 'lido',
    name: 'Lido Staking',
    url: 'https://stake.lido.fi',
    description: 'Stake ETH and receive stETH while earning 3.2% APR staking rewards.',
    category: 'DeFi & Staking',
    chain: 'Ethereum',
    badge: '3.2% APR',
    iconBg: '#00A3FF',
    emoji: '💧',
  },
  {
    id: 'aave',
    name: 'Aave v3',
    url: 'https://app.aave.com',
    description: 'Non-custodial liquidity protocol to earn interest on deposits and borrow assets.',
    category: 'DeFi & Staking',
    chain: 'Multi-Chain',
    badge: 'Audited',
    iconBg: '#2EBAC6',
    emoji: '👻',
  },
  {
    id: 'gmx',
    name: 'GMX Perpetuals',
    url: 'https://app.gmx.io',
    description: 'Decentralized perpetual exchange with up to 50x leverage & low fees.',
    category: 'Perps & Futures',
    chain: 'Arbitrum, Avalanche',
    badge: 'Perps',
    iconBg: '#303F9F',
    emoji: '🫐',
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap',
    url: 'https://pancakeswap.finance',
    description: 'Premier DEX on BNB Chain, Ethereum, and Aptos with low transaction fees.',
    category: 'DEXs',
    chain: 'BNB Chain',
    badge: 'DeFi',
    iconBg: '#D1884F',
    emoji: '🥞',
  },
  {
    id: 'opensea',
    name: 'OpenSea',
    url: 'https://opensea.io',
    description: 'World’s first and largest Web3 marketplace for NFTs and crypto collectibles.',
    category: 'NFTs',
    chain: 'Multi-Chain',
    badge: 'NFTs',
    iconBg: '#2081E2',
    emoji: '⛵',
  },
  {
    id: 'curve',
    name: 'Curve Finance',
    url: 'https://curve.fi',
    description: 'Deep liquidity AMM specialized in pegged assets and stablecoins.',
    category: 'DEXs',
    chain: 'Multi-Chain',
    badge: 'Stablecoins',
    iconBg: '#455A64',
    emoji: '🌈',
  },
  {
    id: 'stargate',
    name: 'Stargate Finance',
    url: 'https://stargate.finance',
    description: 'Fully composable cross-chain liquidity transport powered by LayerZero.',
    category: 'Bridges',
    chain: 'Omnichain',
    badge: 'Bridge',
    iconBg: '#1A237E',
    emoji: '🌉',
  },
  {
    id: 'aerodrome',
    name: 'Aerodrome Finance',
    url: 'https://aerodrome.finance',
    description: 'The central trading and liquidity marketplace on the Base network.',
    category: 'DEXs',
    chain: 'Base',
    badge: 'Base Hub',
    iconBg: '#0052FF',
    emoji: '✈️',
  },
];

export default function DAppBrowserScreen({ navigation }: { navigation?: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { address } = useWalletStore();

  const [searchUrl, setSearchUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DAppCategory>('All');
  const [activeDApp, setActiveDApp] = useState<DAppItem | null>(null);
  const [webUrl, setWebUrl] = useState<string | null>(null);

  // Active WalletConnect sessions
  const [connectedSessions, setConnectedSessions] = useState([
    {
      id: 'wc-1',
      name: 'Uniswap Web Interface',
      url: 'https://app.uniswap.org',
      icon: '🦄',
      connectedAt: '12m ago',
    },
  ]);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const CATEGORIES: DAppCategory[] = ['All', 'DEXs', 'DeFi & Staking', 'Perps & Futures', 'NFTs', 'Bridges'];

  const filteredDApps = FEATURED_DAPPS.filter(dapp => {
    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
    const matchesSearch = searchUrl
      ? dapp.name.toLowerCase().includes(searchUrl.toLowerCase()) ||
        dapp.description.toLowerCase().includes(searchUrl.toLowerCase()) ||
        dapp.url.toLowerCase().includes(searchUrl.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const handleLaunchUrl = (url: string) => {
    const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    setWebUrl(validUrl);
  };

  const handleDisconnectSession = (id: string) => {
    setConnectedSessions(connectedSessions.filter(s => s.id !== id));
  };

  if (webUrl) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.webviewHeader, { paddingTop: insets.top + 6, backgroundColor: cardBg, borderBottomColor: cardBorder }]}>
          <TouchableOpacity onPress={() => setWebUrl(null)} style={styles.webCloseBtn}>
            <Text style={[styles.webCloseText, { color: isDark ? '#FFFFFF' : '#111111' }]}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={[styles.webviewTitle, { color: isDark ? '#FFFFFF' : '#111111' }]} numberOfLines={1}>
            {webUrl.replace('https://', '').replace('http://', '')}
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(webUrl).catch(() => {})}>
            <ExternalLinkIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
          </TouchableOpacity>
        </View>

        <WebView
          source={{ uri: webUrl }}
          style={{ flex: 1 }}
          injectedJavaScript={`
            window.ethereum = {
              isMetaMask: true,
              isCoinbaseWallet: true,
              isTrust: true,
              selectedAddress: "${address}",
              request: function(args) {
                console.log("Web3 request:", args);
                return Promise.resolve();
              }
            };
          `}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP NAV & WEB3 SEARCH BAR ───────────────────────── */}
      <View style={[styles.headerBar, { borderBottomColor: cardBorder }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.() || navigation?.navigate?.('Home')}
          style={[styles.backBtnCircle, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
        </TouchableOpacity>

        {/* Web3 Address / Search Bar */}
        <View style={[styles.searchBarBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <GlobeIcon color="#858585" size={16} />
          <TextInput
            value={searchUrl}
            onChangeText={setSearchUrl}
            onSubmitEditing={() => searchUrl && handleLaunchUrl(searchUrl)}
            placeholder="Search DApps or enter Web3 URL..."
            placeholderTextColor="#858585"
            returnKeyType="go"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
          />
          {searchUrl.length > 0 && (
            <TouchableOpacity onPress={() => handleLaunchUrl(searchUrl)}>
              <Text style={{ color: colors.primary.DEFAULT, fontWeight: '700', fontSize: 13 }}>Go</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── WALLETCONNECT ACTIVE SESSIONS ────────────────────── */}
        {connectedSessions.length > 0 && (
          <View style={[styles.sessionsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sessionsHeader}>
              <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>Active dApp Sessions</Text>
              <View style={styles.sessionDotRow}>
                <View style={styles.greenPulseDot} />
                <Text style={styles.sessionCountText}>{connectedSessions.length} Connected</Text>
              </View>
            </View>

            {connectedSessions.map(session => (
              <View key={session.id} style={[styles.sessionItemRow, { borderTopColor: cardBorder }]}>
                <Text style={{ fontSize: 24 }}>{session.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.sessionName, { color: isDark ? '#FFFFFF' : '#111111' }]}>{session.name}</Text>
                  <Text style={styles.sessionTime}>Connected {session.connectedAt}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDisconnectSession(session.id)}
                  style={[styles.disconnectBtn, { backgroundColor: monoMutedSurface }]}
                >
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── CATEGORY PILLS ─────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: active ? monoPrimary : monoMutedSurface,
                    borderColor: active ? monoPrimary : cardBorder,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.categoryPillText,
                  { color: active ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#CCCCCC' : '#444444'), fontWeight: active ? '800' : '600' }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── FEATURED DAPPS GRID / LIST ─────────────────────── */}
        <View style={styles.dappSectionHeader}>
          <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>
            {selectedCategory === 'All' ? 'Verified Web3 Ecosystem' : selectedCategory}
          </Text>
          <Text style={styles.dappCountSub}>{filteredDApps.length} protocols</Text>
        </View>

        {filteredDApps.map(dapp => (
          <TouchableOpacity
            key={dapp.id}
            onPress={() => handleLaunchUrl(dapp.url)}
            style={[styles.dappCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            activeOpacity={0.85}
          >
            <View style={[styles.dappEmojiBox, { backgroundColor: dapp.iconBg }]}>
              <Text style={styles.dappEmojiText}>{dapp.emoji}</Text>
            </View>

            <View style={styles.dappContentCol}>
              <View style={styles.dappTitleRow}>
                <Text style={[styles.dappName, { color: isDark ? '#FFFFFF' : '#111111' }]}>{dapp.name}</Text>
                <View style={[styles.badgePill, { backgroundColor: monoMutedSurface }]}>
                  <Text style={[styles.badgeText, { color: isDark ? '#FFFFFF' : '#111111' }]}>{dapp.badge}</Text>
                </View>
              </View>

              <Text style={styles.dappDesc}>{dapp.description}</Text>
              <Text style={styles.dappChainText}>Chains: {dapp.chain}</Text>
            </View>

            <View style={styles.launchIconBox}>
              <ExternalLinkIcon color="#858585" size={16} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sessionsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  sessionCountText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '700',
  },
  sessionTime: {
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
  categoryScroll: {
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryPillText: {
    fontSize: 13,
  },
  dappSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  dappCountSub: {
    color: '#858585',
    fontSize: 12,
    fontWeight: '600',
  },
  dappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  dappEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dappEmojiText: {
    fontSize: 22,
  },
  dappContentCol: {
    flex: 1,
    marginLeft: 12,
  },
  dappTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  dappName: {
    fontSize: 15,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dappDesc: {
    color: '#858585',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  dappChainText: {
    color: '#707070',
    fontSize: 10.5,
    fontWeight: '600',
  },
  launchIconBox: {
    marginLeft: 8,
  },
  webviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
  },
  webCloseBtn: {
    paddingVertical: 4,
  },
  webCloseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  webviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: SCREEN_WIDTH * 0.6,
  },
});
