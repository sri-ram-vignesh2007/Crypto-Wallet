// src/screens/HomeScreen.tsx - Apple iPhone Native Minimalist Dashboard

import React, { useEffect, useState, useRef } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl,
  SafeAreaView, StatusBar, Modal, Animated, Pressable, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS } from '../core/ChainConfig';

// Reusable Apple Spring Scale Button
interface SpringButtonProps {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  activeScale?: number;
}

const SpringButton: React.FC<SpringButtonProps> = ({
  onPress,
  style,
  children,
  activeScale = 0.94,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: activeScale,
      useNativeDriver: true,
      damping: 18,
      stiffness: 260,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 260,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// SF Symbols Inspired Icons (Apple Stroke Weight 2.2)
const SendIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17L17 7M17 7H7M17 7V17" />
  </Svg>
);

const ReceiveIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 7L7 17M7 17H17M7 17V7" />
  </Svg>
);

const SwapIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 10h14l-4-4M17 14H3l4 4" />
  </Svg>
);

const BuyIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="5" width="20" height="14" rx="3" />
    <Path d="M2 10h20M12 13v4M10 15h4" />
  </Svg>
);

const QrScanIcon = ({ color = '#8E8E93', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <Rect x="7" y="7" width="10" height="10" rx="2" />
  </Svg>
);

const CopyIcon = ({ color = '#8E8E93', size = 13 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ChevronDownIcon = ({ color = '#8E8E93', size = 13 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const CheckIcon = ({ color = '#34C759', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

// Apple Style Clean Token Logos
const EthLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#627EEA" />
    <Path d="M12 4v6.2l5 2.3L12 4z" fill="#E5E7EB" />
    <Path d="M12 4L7 12.5l5-2.3V4z" fill="#FFFFFF" />
    <Path d="M12 13.5v6.5l5-7-5 .5z" fill="#E5E7EB" />
    <Path d="M12 13.5L7 13l5 7v-6.5z" fill="#FFFFFF" />
  </Svg>
);

const BtcLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F7931A" />
    <Path d="M14.5 10.5c.6-.4 1-.9 1-1.6 0-1.4-1.1-2-2.7-2.1V5h-1.3v1.7h-.9V5h-1.3v1.8H7.5v1.4h1.1c.3 0 .5.2.5.5v6.6c0 .3-.2.5-.5.5H7.5v1.4h1.8v1.8h1.3v-1.7h.9v1.7h1.3v-1.8c1.9-.1 3.2-.8 3.2-2.4 0-1.1-.6-1.9-1.5-2.3zm-3.2-2.1h1.4c.8 0 1.4.3 1.4 1s-.6 1-1.4 1h-1.4V8.4zm1.7 5.2h-1.7v-2.2h1.7c.9 0 1.6.4 1.6 1.1s-.7 1.1-1.6 1.1z" fill="#FFFFFF" />
  </Svg>
);

const BnbLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F0B90B" />
    <Path d="M12 6.5l2.2 2.2-1 1-1.2-1.2-1.2 1.2-1-1L12 6.5zm-3.2 3.2l1 1-2.2 2.2-1-1 2.2-2.2zm6.4 0l2.2 2.2-1 1-2.2-2.2 1-1zm-4.3 1.1l1.1 1.1 1.1-1.1 1.1 1.1-1.1 1.1 1.1 1.1-1.1 1.1-1.1-1.1-1.1 1.1-1.1-1.1 1.1-1.1-1.1-1.1 1.1-1.1zm-2.1 3.2l1 1-1 1-1-1 1-1zm6.4 0l1 1-1 1-1-1 1-1zm-4.3 3.2l1.2 1.2 1-1 1 1-2.2 2.2-2.2-2.2 1-1 1.2-1.2z" fill="#FFFFFF" />
  </Svg>
);

const PolygonLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#8247E5" />
    <Path d="M12 4L6 7.5v9L12 20l6-3.5v-9L12 4zm0 2.3l4 2.3v4.6l-4 2.3-4-2.3V8.6l4-2.3z" fill="#FFFFFF" />
  </Svg>
);

const SolLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#805AD5" />
    <Path d="M7 15.5l1.8-1.8h8.2l-1.8 1.8H7zm0-5l1.8-1.8h8.2l-1.8 1.8H7zm1.8-5h8.2l-1.8 1.8H7l1.8-1.8z" fill="#FFFFFF" />
  </Svg>
);

const UsdtLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#26A17B" />
    <Path d="M13.2 11.2v-1.4h3.6V7.5H7.2v2.3h3.6v1.4c-3.1.2-5.4.9-5.4 1.8 0 .8 2.3 1.6 5.4 1.8v3.7h2.4v-3.7c3.1-.2 5.4-.9 5.4-1.8 0-.9-2.3-1.6-5.4-1.8zm0 2.2c-2.3.1-4.2-.4-4.2-.9s1.9-1 4.2-.9v1.8z" fill="#FFFFFF" />
  </Svg>
);

const UsdcLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
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

  // Animations
  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(-60)).current;
  const tabSliderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [screenFadeAnim]);

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
      Animated.sequence([
        Animated.spring(toastAnim, { toValue: 10, useNativeDriver: true, damping: 16, stiffness: 220 }),
        Animated.delay(1800),
        Animated.timing(toastAnim, { toValue: -60, duration: 250, useNativeDriver: true }),
      ]).start(() => setCopiedToast(false));
    } catch {}
  };

  const switchTab = (tab: 'crypto' | 'nfts') => {
    setActiveTab(tab);
    Animated.spring(tabSliderAnim, {
      toValue: tab === 'crypto' ? 0 : 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 220,
    }).start();
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Dynamic Toast Pill (Apple Island Style) */}
      {copiedToast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <View style={[styles.toastPill, { backgroundColor: isDark ? '#2C2C2E' : '#1C1C1E', borderColor: colors.border.subtle }]}>
            <CheckIcon color="#34C759" size={14} />
            <Text style={styles.toastText}>Address copied to clipboard</Text>
          </View>
        </Animated.View>
      )}

      {/* Apple Navigation Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        {/* Address Pill */}
        <SpringButton onPress={copyAddress} style={[styles.addressPill, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <Text style={[styles.addressText, { color: colors.text.primary }]}>
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
          </Text>
          <CopyIcon color={colors.text.muted} size={12} />
        </SpringButton>

        {/* Network Selector Pill */}
        <SpringButton onPress={() => setShowNetworkModal(true)} style={[styles.networkPill, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <View style={[styles.networkDot, { backgroundColor: colors.primary.DEFAULT }]} />
          <Text style={[styles.networkName, { color: colors.text.primary }]}>{currentChainObj.name}</Text>
          <ChevronDownIcon color={colors.text.muted} size={12} />
        </SpringButton>

        {/* QR Scan Button */}
        <SpringButton onPress={() => navigation.navigate('Receive')} style={[styles.iconButton, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <QrScanIcon color={colors.text.primary} size={18} />
        </SpringButton>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: screenFadeAnim }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Apple Balance Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.balanceSub, { color: colors.text.secondary }]}>Total Balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.text.primary }]}>
            ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={[styles.changeBadge, { backgroundColor: isDark ? 'rgba(48, 209, 88, 0.12)' : 'rgba(52, 199, 89, 0.12)' }]}>
            <Text style={[styles.changeBadgeText, { color: isDark ? '#30D158' : '#34C759' }]}>+0.00% past 24h</Text>
          </View>
        </View>

        {/* 4 Apple Action Circles (Send, Receive, Buy, Swap) */}
        <View style={styles.actionsRow}>
          <View style={styles.actionItem}>
            <SpringButton
              onPress={() => navigation.navigate('Send')}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <SendIcon color="#FFFFFF" size={22} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Send</Text>
          </View>

          <View style={styles.actionItem}>
            <SpringButton
              onPress={() => navigation.navigate('Receive')}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <ReceiveIcon color="#FFFFFF" size={22} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Receive</Text>
          </View>

          <View style={styles.actionItem}>
            <SpringButton
              onPress={() => navigation.navigate('Buy')}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <BuyIcon color="#FFFFFF" size={20} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Buy</Text>
          </View>

          <View style={styles.actionItem}>
            <SpringButton
              onPress={() => navigation.navigate('Swap')}
              style={[styles.actionCircle, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <SwapIcon color="#FFFFFF" size={22} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Swap</Text>
          </View>
        </View>

        {/* Apple iOS Segmented Control */}
        <View style={styles.segmentedContainer}>
          <View style={[styles.segmentedTrack, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]}>
            <Animated.View
              style={[
                styles.segmentedSlider,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                  transform: [
                    {
                      translateX: tabSliderAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 166],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => switchTab('crypto')}
              activeOpacity={0.8}
              style={styles.segmentedButton}
            >
              <Text style={[styles.segmentedLabel, { color: colors.text.primary, fontWeight: activeTab === 'crypto' ? '600' : '400' }]}>
                Tokens
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => switchTab('nfts')}
              activeOpacity={0.8}
              style={styles.segmentedButton}
            >
              <Text style={[styles.segmentedLabel, { color: colors.text.primary, fontWeight: activeTab === 'nfts' ? '600' : '400' }]}>
                NFTs
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Apple Inset Grouped Table (Tokens List) */}
        {activeTab === 'crypto' ? (
          <View style={styles.insetGroupContainer}>
            <View style={[styles.insetGroupCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              {tokenList.map((token, index) => {
                const Logo = TOKEN_LOGOS[token.symbol] || EthLogo;
                const isLast = index === tokenList.length - 1;
                return (
                  <SpringButton
                    key={`${token.symbol}-${index}`}
                    onPress={() => navigation.navigate('Send')}
                    activeScale={0.98}
                    style={styles.tokenRow}
                  >
                    <Logo />
                    <View style={styles.tokenContent}>
                      <View style={styles.tokenMeta}>
                        <Text style={[styles.tokenSymbol, { color: colors.text.primary }]}>{token.name}</Text>
                        <Text style={[styles.tokenSubtext, { color: colors.text.muted }]}>
                          {token.price} • <Text style={{ color: token.positive ? (isDark ? '#30D158' : '#34C759') : (isDark ? '#FF453A' : '#FF3B30'), fontWeight: '600' }}>{token.change}</Text>
                        </Text>
                      </View>
                      <View style={styles.tokenBalanceCol}>
                        <Text style={[styles.tokenAmount, { color: colors.text.primary }]}>{token.balance} {token.symbol}</Text>
                        <Text style={[styles.tokenUsd, { color: colors.text.muted }]}>{token.usd}</Text>
                      </View>
                    </View>
                    {!isLast && <View style={[styles.hairlineDivider, { backgroundColor: colors.border.subtle }]} />}
                  </SpringButton>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.insetGroupContainer}>
            <View style={[styles.emptyNftBox, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
              <Text style={[styles.emptyNftTitle, { color: colors.text.primary }]}>No Collectibles</Text>
              <Text style={[styles.emptyNftSub, { color: colors.text.muted }]}>
                NFTs you purchase or receive on {currentChainObj.name} will appear here.
              </Text>
            </View>
          </View>
        )}

        {/* Inset Action: Manage Tokens */}
        <SpringButton
          onPress={() => navigation.navigate('CustomToken')}
          style={[styles.manageTokensBtn, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
        >
          <Text style={[styles.manageTokensText, { color: colors.primary.DEFAULT }]}>+ Manage Tokens</Text>
        </SpringButton>
      </Animated.ScrollView>

      {/* Network Switcher Modal Sheet */}
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
          <View style={[styles.modalSheet, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#38383A' : '#D1D1D6' }]} />
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Select Network</Text>
            <Text style={[styles.modalSubtitle, { color: colors.text.secondary }]}>Free Public RPC Endpoints</Text>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={[styles.modalGroupCard, { backgroundColor: colors.bg.canvas, borderColor: colors.border.subtle }]}>
                {Object.entries(CHAINS).map(([key, chain], idx, arr) => {
                  const isSelected = selectedChain === key;
                  const isLast = idx === arr.length - 1;
                  return (
                    <SpringButton
                      key={key}
                      onPress={() => {
                        setSelectedChain(key);
                        setShowNetworkModal(false);
                      }}
                      activeScale={0.98}
                      style={[styles.chainItem, isSelected && { backgroundColor: isDark ? '#2C2C2E' : '#E5F1FF' }]}
                    >
                      <View style={styles.chainItemLeft}>
                        <View style={[styles.chainLogoCircle, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
                          <Text style={[styles.chainLogoText, { color: colors.text.primary }]}>{chain.logo}</Text>
                        </View>
                        <View>
                          <Text style={[styles.chainItemName, { color: colors.text.primary }]}>{chain.name}</Text>
                          <Text style={[styles.chainItemRpc, { color: colors.text.muted }]} numberOfLines={1}>
                            {chain.rpcUrls[0].replace('https://', '')}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <CheckIcon color={colors.primary.DEFAULT} size={20} />}
                      {!isLast && <View style={[styles.chainDivider, { backgroundColor: colors.border.subtle }]} />}
                    </SpringButton>
                  );
                })}
              </View>
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
    paddingBottom: 8,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  addressText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
    letterSpacing: -0.2,
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  networkName: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 5,
    letterSpacing: -0.2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 22,
  },
  balanceSub: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  changeBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
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
    marginBottom: 7,
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  segmentedContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentedTrack: {
    width: 338,
    height: 36,
    borderRadius: 10,
    flexDirection: 'row',
    position: 'relative',
    padding: 2,
  },
  segmentedSlider: {
    position: 'absolute',
    top: 2,
    left: 0,
    width: 166,
    height: 32,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentedButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  segmentedLabel: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  insetGroupContainer: {
    paddingHorizontal: 16,
  },
  insetGroupCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    position: 'relative',
  },
  tokenContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 14,
  },
  tokenMeta: {
    justifyContent: 'center',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  tokenSubtext: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  tokenBalanceCol: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  tokenUsd: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  hairlineDivider: {
    position: 'absolute',
    bottom: 0,
    left: 68,
    right: 0,
    height: 0.5,
  },
  emptyNftBox: {
    padding: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  emptyNftTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyNftSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  manageTokensBtn: {
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageTokensText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 34,
    borderTopWidth: 0.5,
  },
  modalHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
    paddingHorizontal: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 14,
    marginTop: 2,
    paddingHorizontal: 4,
  },
  modalGroupCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  chainItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.5,
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
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  chainItemRpc: {
    fontSize: 12,
    marginTop: 1,
  },
  chainDivider: {
    position: 'absolute',
    bottom: 0,
    left: 64,
    right: 0,
    height: 0.5,
  },
});
