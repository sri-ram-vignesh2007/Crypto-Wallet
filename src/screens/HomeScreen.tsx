// src/screens/HomeScreen.tsx - Trust Wallet Minimalist Dashboard

import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl,
  SafeAreaView, StatusBar, Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS, Chain } from '../core/ChainConfig';

// Icons
const SendIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17L17 7M17 7H7M17 7V17" />
  </Svg>
);

const ReceiveIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 7L7 17M7 17H17M7 17V7" />
  </Svg>
);

const SwapIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
  </Svg>
);

const BuyIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="5" width="20" height="14" rx="2" />
    <Path d="M2 10h20M12 5v14" />
  </Svg>
);

const QrScanIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 5h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <Rect x="7" y="7" width="10" height="10" rx="1" />
  </Svg>
);

const CopyIcon = ({ color = '#94A3B8', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ChevronDownIcon = ({ color = '#94A3B8', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

// Token logos
const EthLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#627EEA" />
    <Path d="M12 4v6.2l5 2.3L12 4z" fill="#E5E7EB" />
    <Path d="M12 4L7 12.5l5-2.3V4z" fill="#FFFFFF" />
    <Path d="M12 13.5v6.5l5-7-5 .5z" fill="#E5E7EB" />
    <Path d="M12 13.5L7 13l5 7v-6.5z" fill="#FFFFFF" />
  </Svg>
);

const BtcLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F7931A" />
    <Path d="M14.5 10.5c.6-.4 1-.9 1-1.6 0-1.4-1.1-2-2.7-2.1V5h-1.3v1.7h-.9V5h-1.3v1.8H7.5v1.4h1.1c.3 0 .5.2.5.5v6.6c0 .3-.2.5-.5.5H7.5v1.4h1.8v1.8h1.3v-1.7h.9v1.7h1.3v-1.8c1.9-.1 3.2-.8 3.2-2.4 0-1.1-.6-1.9-1.5-2.3zm-3.2-2.1h1.4c.8 0 1.4.3 1.4 1s-.6 1-1.4 1h-1.4V8.4zm1.7 5.2h-1.7v-2.2h1.7c.9 0 1.6.4 1.6 1.1s-.7 1.1-1.6 1.1z" fill="#FFFFFF" />
  </Svg>
);

const BnbLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F3BA2F" />
    <Path d="M12 6.5l2.2 2.2-1 1-1.2-1.2-1.2 1.2-1-1L12 6.5zm-3.2 3.2l1 1-2.2 2.2-1-1 2.2-2.2zm6.4 0l2.2 2.2-1 1-2.2-2.2 1-1zm-4.3 1.1l1.1 1.1 1.1-1.1 1.1 1.1-1.1 1.1 1.1 1.1-1.1 1.1-1.1-1.1-1.1 1.1-1.1-1.1 1.1-1.1-1.1-1.1 1.1-1.1zm-2.1 3.2l1 1-1 1-1-1 1-1zm6.4 0l1 1-1 1-1-1 1-1zm-4.3 3.2l1.2 1.2 1-1 1 1-2.2 2.2-2.2-2.2 1-1 1.2-1.2z" fill="#FFFFFF" />
  </Svg>
);

const PolygonLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#8247E5" />
    <Path d="M12 4L6 7.5v9L12 20l6-3.5v-9L12 4zm0 2.3l4 2.3v4.6l-4 2.3-4-2.3V8.6l4-2.3z" fill="#FFFFFF" />
  </Svg>
);

const SolLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#14F195" />
    <Path d="M7 15.5l1.8-1.8h8.2l-1.8 1.8H7zm0-5l1.8-1.8h8.2l-1.8 1.8H7zm1.8-5h8.2l-1.8 1.8H7l1.8-1.8z" fill="#9945FF" />
  </Svg>
);

const UsdtLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#26A17B" />
    <Path d="M13.2 11.2v-1.4h3.6V7.5H7.2v2.3h3.6v1.4c-3.1.2-5.4.9-5.4 1.8 0 .8 2.3 1.6 5.4 1.8v3.7h2.4v-3.7c3.1-.2 5.4-.9 5.4-1.8 0-.9-2.3-1.6-5.4-1.8zm0 2.2c-2.3.1-4.2-.4-4.2-.9s1.9-1 4.2-.9v1.8z" fill="#FFFFFF" />
  </Svg>
);

const UsdcLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2775CA" />
    <Path d="M12 6.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm.7 8.8v.9h-1.4v-.9c-1.1-.1-1.9-.7-2-1.6h1.2c.1.5.5.8 1.2.8.7 0 1.1-.3 1.1-.7 0-.5-.4-.6-1.1-.8-1.3-.3-2.1-.7-2.1-1.7 0-.8.6-1.4 1.7-1.5v-.9h1.4v.9c.9.1 1.6.6 1.8 1.4h-1.2c-.1-.4-.4-.7-1-.7-.6 0-1 .3-1 .6s.4.6 1.1.8c1.3.3 2.1.7 2.1 1.7 0 .9-.7 1.5-1.8 1.6z" fill="#FFFFFF" />
  </Svg>
);

const TOKEN_LOGOS: Record<string, () => React.ReactElement> = {
  ETH: EthLogo,
  BTC: BtcLogo,
  BNB: BnbLogo,
  MATIC: PolygonLogo,
  POL: PolygonLogo,
  SOL: SolLogo,
  USDT: UsdtLogo,
  USDC: UsdcLogo,
};

const DEFAULT_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', price: '$3,485.20', change: '+2.4%', positive: true, balance: '0.00', usd: '$0.00' },
  { symbol: 'BTC', name: 'Bitcoin', price: '$68,240.00', change: '+1.8%', positive: true, balance: '0.00', usd: '$0.00' },
  { symbol: 'BNB', name: 'BNB Chain', price: '$718.50', change: '+0.5%', positive: true, balance: '0.00', usd: '$0.00' },
  { symbol: 'POL', name: 'Polygon', price: '$0.82', change: '-1.1%', positive: false, balance: '0.00', usd: '$0.00' },
  { symbol: 'SOL', name: 'Solana', price: '$184.30', change: '+3.9%', positive: true, balance: '0.00', usd: '$0.00' },
  { symbol: 'USDT', name: 'Tether USD', price: '$1.00', change: '0.0%', positive: true, balance: '0.00', usd: '$0.00' },
  { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '0.0%', positive: true, balance: '0.00', usd: '$0.00' },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { address, totalValueUsd, balances, selectedChain, setSelectedChain, refreshBalances } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'crypto' | 'nfts'>('crypto');
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances, selectedChain]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
  };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await Clipboard.setStringAsync(address);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {}
  };

  const currentChainObj = CHAINS[selectedChain] || CHAINS.ethereum;

  // Merge live balances with token display
  const tokenList = DEFAULT_TOKENS.map(dt => {
    const live = balances.find(b => b.token.symbol.toUpperCase() === dt.symbol.toUpperCase());
    if (live) {
      const balNum = parseFloat(live.balance);
      return {
        ...dt,
        balance: isNaN(balNum) ? '0.00' : balNum.toFixed(4),
        usd: `$${live.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      };
    }
    return dt;
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        {/* Address Pill */}
        <TouchableOpacity
          onPress={copyAddress}
          activeOpacity={0.75}
          style={[styles.addressPill, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
        >
          <Text style={[styles.addressText, { color: colors.text.primary }]}>
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
          </Text>
          <CopyIcon color={copiedToast ? '#10B981' : colors.text.muted} size={13} />
        </TouchableOpacity>

        {/* Network Selector Pill */}
        <TouchableOpacity
          onPress={() => setShowNetworkModal(true)}
          activeOpacity={0.75}
          style={[styles.networkPill, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
        >
          <View style={[styles.networkDot, { backgroundColor: colors.primary.DEFAULT }]} />
          <Text style={[styles.networkName, { color: colors.text.primary }]}>{currentChainObj.name}</Text>
          <ChevronDownIcon color={colors.text.muted} size={13} />
        </TouchableOpacity>

        {/* QR Scan / Search */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Receive')}
          activeOpacity={0.7}
          style={[styles.iconButton, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
        >
          <QrScanIcon color={colors.text.primary} size={18} />
        </TouchableOpacity>
      </View>

      {/* Toast Notification */}
      {copiedToast && (
        <View style={styles.toastContainer}>
          <View style={[styles.toast, { backgroundColor: isDark ? '#1F2937' : '#0F172A' }]}>
            <Text style={styles.toastText}>Address copied to clipboard</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Hero Balance Section (Clean Trust Wallet Style) */}
        <View style={styles.heroSection}>
          <Text style={[styles.balanceAmount, { color: colors.text.primary }]}>
            ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.changeRow}>
            <View style={[styles.changeBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
              <Text style={styles.changeBadgeText}>+0.00%</Text>
            </View>
          </View>
        </View>

        {/* 4 Circular Action Buttons (Send, Receive, Buy, Swap) */}
        <View style={styles.actionsRow}>
          <View style={styles.actionItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Send')}
              activeOpacity={0.82}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <SendIcon color="#FFFFFF" size={22} />
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Send</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Receive')}
              activeOpacity={0.82}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <ReceiveIcon color="#FFFFFF" size={22} />
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Receive</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Buy')}
              activeOpacity={0.82}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <BuyIcon color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Buy</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Swap')}
              activeOpacity={0.82}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <SwapIcon color="#FFFFFF" size={22} />
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Swap</Text>
          </View>
        </View>

        {/* Tabs: Crypto / NFTs */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border.subtle }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('crypto')}
            style={[styles.tabItem, activeTab === 'crypto' && { borderBottomColor: colors.primary.DEFAULT, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'crypto' ? colors.text.primary : colors.text.muted, fontWeight: activeTab === 'crypto' ? '700' : '500' }]}>
              Crypto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('nfts')}
            style={[styles.tabItem, activeTab === 'nfts' && { borderBottomColor: colors.primary.DEFAULT, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'nfts' ? colors.text.primary : colors.text.muted, fontWeight: activeTab === 'nfts' ? '700' : '500' }]}>
              NFTs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Token List */}
        {activeTab === 'crypto' ? (
          <View style={styles.tokenList}>
            {tokenList.map((token, index) => {
              const Logo = TOKEN_LOGOS[token.symbol] || EthLogo;
              return (
                <TouchableOpacity
                  key={`${token.symbol}-${index}`}
                  onPress={() => navigation.navigate('Send')}
                  activeOpacity={0.7}
                  style={[styles.tokenRow, { borderBottomColor: colors.border.subtle }]}
                >
                  <Logo />
                  <View style={styles.tokenMeta}>
                    <Text style={[styles.tokenSymbol, { color: colors.text.primary }]}>{token.name}</Text>
                    <View style={styles.tokenPriceRow}>
                      <Text style={[styles.tokenPrice, { color: colors.text.muted }]}>{token.price}</Text>
                      <Text style={[styles.tokenChange, { color: token.positive ? '#10B981' : '#EF4444' }]}>
                        {token.change}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tokenBalanceCol}>
                    <Text style={[styles.tokenAmount, { color: colors.text.primary }]}>{token.balance} {token.symbol}</Text>
                    <Text style={[styles.tokenUsd, { color: colors.text.muted }]}>{token.usd}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyNftContainer}>
            <Text style={[styles.emptyNftText, { color: colors.text.muted }]}>No NFTs yet in this wallet</Text>
          </View>
        )}

        {/* Manage Crypto Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CustomToken')}
          activeOpacity={0.75}
          style={[styles.manageCryptoBtn, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
        >
          <Text style={[styles.manageCryptoText, { color: colors.primary.DEFAULT }]}>+ Manage Crypto</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Network Switcher Modal */}
      <Modal
        visible={showNetworkModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNetworkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setShowNetworkModal(false)}
          />
          <View style={[styles.modalSheet, { backgroundColor: colors.bg.surface, borderTopColor: colors.border.subtle }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Select Network</Text>
            <Text style={[styles.modalSubtitle, { color: colors.text.secondary }]}>Free High-Speed Public RPC Connectors</Text>

            <ScrollView style={{ maxHeight: 340 }}>
              {Object.entries(CHAINS).map(([key, chain]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    setSelectedChain(key);
                    setShowNetworkModal(false);
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.chainItem,
                    { borderBottomColor: colors.border.subtle },
                    selectedChain === key && { backgroundColor: colors.primary.muted }
                  ]}
                >
                  <View style={styles.chainItemLeft}>
                    <View style={[styles.chainLogoCircle, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}>
                      <Text style={[styles.chainLogoText, { color: colors.text.primary }]}>{chain.logo}</Text>
                    </View>
                    <View>
                      <Text style={[styles.chainItemName, { color: colors.text.primary }]}>{chain.name}</Text>
                      <Text style={[styles.chainItemRpc, { color: colors.text.muted }]} numberOfLines={1}>
                        {chain.rpcUrls[0].replace('https://', '')}
                      </Text>
                    </View>
                  </View>
                  {selectedChain === key && (
                    <View style={[styles.activeDot, { backgroundColor: colors.primary.DEFAULT }]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  addressText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  networkDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  networkName: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  changeRow: {
    marginTop: 8,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tabItem: {
    paddingVertical: 10,
    marginRight: 24,
  },
  tabText: {
    fontSize: 15,
  },
  tokenList: {
    paddingHorizontal: 16,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  tokenMeta: {
    flex: 1,
    marginLeft: 14,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  tokenPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenPrice: {
    fontSize: 13,
    marginRight: 6,
  },
  tokenChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  tokenBalanceCol: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  tokenUsd: {
    fontSize: 13,
  },
  emptyNftContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyNftText: {
    fontSize: 14,
  },
  manageCryptoBtn: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageCryptoText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: 14,
    marginTop: 2,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderBottomWidth: 0.5,
  },
  chainItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainLogoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chainLogoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  chainItemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  chainItemRpc: {
    fontSize: 11,
    marginTop: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
