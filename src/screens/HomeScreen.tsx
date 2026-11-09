// src/screens/HomeScreen.tsx - Apple Pay / Apple Wallet Executive Dashboard

import React, { useEffect, useState, useRef } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl,
  SafeAreaView, StatusBar, Modal, Animated, Pressable, Platform, Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS } from '../core/ChainConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  activeScale = 0.95,
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

const QrScanIcon = ({ color = '#8E8E93', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <Rect x="7" y="7" width="10" height="10" rx="2" />
  </Svg>
);

const CopyIcon = ({ color = '#8E8E93', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ChevronDownIcon = ({ color = '#8E8E93', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const CheckIcon = ({ color = '#34C759', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

// Apple Contactless Wave Symbol
const ContactlessIcon = ({ color = '#8E8E93', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8.5 16.5a5 5 0 0 1 0-7M12 19a8.5 8.5 0 0 0 0-14M15.5 21.5a12 12 0 0 0 0-19" />
  </Svg>
);

// Apple Style Clean Token Logos (Solid True Colors, No Neon)
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
    <Path
      d="M14.5 10.5c.8-.4 1.2-1.1 1.2-2 0-1.6-1.3-2.5-3.2-2.5H9v9h3.8c2 0 3.4-1 3.4-2.7 0-1-.6-1.6-1.7-1.8zm-3.5-3h1.2c.9 0 1.5.4 1.5 1.2s-.6 1.2-1.5 1.2H11v-2.4zm1.5 6H11v-2.6h1.5c1 0 1.6.4 1.6 1.3 0 .8-.6 1.3-1.6 1.3z"
      fill="#FFFFFF"
    />
  </Svg>
);

const UsdcLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#2775CA" />
    <Path
      d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5S9.5 7.5 12 7.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z"
      fill="#FFFFFF"
    />
    <Path d="M11 9h2v6h-2z" fill="#FFFFFF" />
  </Svg>
);

const SolLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#AF52DE" />
    <Path d="M6.5 15.5l2-2h9l-2 2h-9zM6.5 12.5l2-2h9l-2 2h-9zM6.5 9.5l2-2h9l-2 2h-9z" fill="#FFFFFF" />
  </Svg>
);

const PolygonLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#8247E5" />
    <Path d="M12 6L7 9v6l5 3 5-3V9l-5-3zm0 2.2l3 1.8v3.6l-3 1.8-3-1.8v-3.6l3-1.8z" fill="#FFFFFF" />
  </Svg>
);

const ArbLogo = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#28A0F0" />
    <Path d="M12 6l-6 10h3l3-5 3 5h3l-6-10z" fill="#FFFFFF" />
  </Svg>
);

const TOKEN_LOGOS: Record<string, () => React.ReactElement> = {
  ETH: EthLogo,
  BTC: BtcLogo,
  USDC: UsdcLogo,
  SOL: SolLogo,
  POL: PolygonLogo,
  MATIC: PolygonLogo,
  ARB: ArbLogo,
};

// Default tokens with solid market metrics
const DEFAULT_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', balance: '0.00', price: '$3,420.50', change: '+2.4%', positive: true, usd: '$0.00' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.00', price: '$67,540.00', change: '+3.1%', positive: true, usd: '$0.00' },
  { symbol: 'USDC', name: 'USD Coin', balance: '0.00', price: '$1.00', change: '0.0%', positive: true, usd: '$0.00' },
  { symbol: 'SOL', name: 'Solana', balance: '0.00', price: '$168.20', change: '-0.8%', positive: false, usd: '$0.00' },
  { symbol: 'POL', name: 'Polygon', balance: '0.00', price: '$0.85', change: '+1.5%', positive: true, usd: '$0.00' },
  { symbol: 'ARB', name: 'Arbitrum', balance: '0.00', price: '$1.24', change: '+4.2%', positive: true, usd: '$0.00' },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const {
    address,
    selectedChain,
    balances,
    totalValueUsd,
    refreshBalances,
    setSelectedChain,
  } = useWalletStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'crypto' | 'nfts' | 'activity'>('crypto');
  const [copiedToast, setCopiedToast] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  // Smooth Animations
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

  const switchTab = (tab: 'crypto' | 'nfts' | 'activity') => {
    setActiveTab(tab);
    const target = tab === 'crypto' ? 0 : tab === 'nfts' ? 1 : 2;
    Animated.spring(tabSliderAnim, {
      toValue: target,
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

  const cardWidth = SCREEN_WIDTH - 32;
  const sliderWidth = (cardWidth - 8) / 3;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Dynamic Toast Pill (Apple Island Style) */}
      {copiedToast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <View style={[styles.toastPill, { backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.1)' }]}>
            <CheckIcon color="#30D158" size={14} />
            <Text style={styles.toastText}>Address copied to clipboard</Text>
          </View>
        </Animated.View>
      )}

      {/* Apple Navigation Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Wallet</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Network Selector Capsule */}
          <SpringButton
            onPress={() => setShowNetworkModal(true)}
            style={[styles.networkCapsule, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
          >
            <View style={[styles.networkDot, { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }]} />
            <Text style={[styles.networkName, { color: colors.text.primary }]}>{currentChainObj.name}</Text>
            <ChevronDownIcon color={colors.text.muted} size={11} />
          </SpringButton>

          {/* QR Scan Button */}
          <SpringButton
            onPress={() => navigation.navigate('Receive')}
            style={[styles.iconButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
          >
            <QrScanIcon color={colors.text.primary} size={17} />
          </SpringButton>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        style={{ opacity: screenFadeAnim }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#FFFFFF' : '#007AFF'}
          />
        }
      >
        {/* ======================================================== */}
        {/* TITANIUM OBSIDIAN APPLE CARD HERO (Apple Pay Card Aesthetic) */}
        {/* ======================================================== */}
        <View style={styles.appleCardOuter}>
          <View style={[styles.appleCard, { backgroundColor: isDark ? '#161618' : '#1C1C1E' }]}>
            {/* Specular Ambient Edge */}
            <View style={styles.cardSpecularEdge} />

            {/* Top Row: Spaced Brand & Contactless Icon */}
            <View style={styles.cardTopRow}>
              <View style={styles.cardBrandBadge}>
                <Text style={styles.cardBrandText}>CRYPTO VAULT</Text>
              </View>
              <View style={styles.cardTopRight}>
                <Text style={styles.cardPassText}>{currentChainObj.name.toUpperCase()}</Text>
                <ContactlessIcon color="rgba(255,255,255,0.4)" size={18} />
              </View>
            </View>

            {/* Middle: Bold Balance */}
            <View style={styles.cardMiddle}>
              <Text style={styles.cardBalanceLabel}>Total Balance</Text>
              <Text style={styles.cardBalanceValue}>
                ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>

              <View style={styles.gainPill}>
                <Text style={styles.gainPillText}>+2.45% 24h</Text>
              </View>
            </View>

            {/* Bottom Row: Address Capsule & Chip */}
            <View style={styles.cardBottomRow}>
              <SpringButton onPress={copyAddress} style={styles.cardAddressCapsule}>
                <Text style={styles.cardAddressText}>
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
                </Text>
                <CopyIcon color="rgba(255,255,255,0.7)" size={11} />
              </SpringButton>

              <Text style={styles.cardSecuredText}>BIP-39 SECURED</Text>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 4 SOLID APPLE PAY CIRCLE ACTION BUTTONS                    */}
        {/* ======================================================== */}
        <View style={styles.actionsRow}>
          <View style={styles.actionCol}>
            <SpringButton
              onPress={() => navigation.navigate('Send')}
              style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            >
              <SendIcon color={isDark ? '#FFFFFF' : '#000000'} size={21} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Send</Text>
          </View>

          <View style={styles.actionCol}>
            <SpringButton
              onPress={() => navigation.navigate('Receive')}
              style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            >
              <ReceiveIcon color={isDark ? '#FFFFFF' : '#000000'} size={21} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Receive</Text>
          </View>

          <View style={styles.actionCol}>
            <SpringButton
              onPress={() => navigation.navigate('Buy')}
              style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            >
              <BuyIcon color={isDark ? '#FFFFFF' : '#000000'} size={19} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Buy</Text>
          </View>

          <View style={styles.actionCol}>
            <SpringButton
              onPress={() => navigation.navigate('Swap')}
              style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            >
              <SwapIcon color={isDark ? '#FFFFFF' : '#000000'} size={21} />
            </SpringButton>
            <Text style={[styles.actionLabel, { color: colors.text.primary }]}>Swap</Text>
          </View>
        </View>

        {/* ======================================================== */}
        {/* APPLE SEGMENTED CONTROL (Tokens | NFTs | Activity)        */}
        {/* ======================================================== */}
        <View style={styles.segmentedContainer}>
          <View style={[styles.segmentedTrack, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]}>
            <Animated.View
              style={[
                styles.segmentedSlider,
                {
                  width: sliderWidth,
                  backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                  transform: [
                    {
                      translateX: tabSliderAnim.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [2, sliderWidth + 2, sliderWidth * 2 + 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity onPress={() => switchTab('crypto')} activeOpacity={0.8} style={styles.segmentedBtn}>
              <Text style={[styles.segmentedLabel, { color: colors.text.primary, fontWeight: activeTab === 'crypto' ? '600' : '400' }]}>
                Tokens
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => switchTab('nfts')} activeOpacity={0.8} style={styles.segmentedBtn}>
              <Text style={[styles.segmentedLabel, { color: colors.text.primary, fontWeight: activeTab === 'nfts' ? '600' : '400' }]}>
                NFTs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => switchTab('activity')} activeOpacity={0.8} style={styles.segmentedBtn}>
              <Text style={[styles.segmentedLabel, { color: colors.text.primary, fontWeight: activeTab === 'activity' ? '600' : '400' }]}>
                Activity
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* INSET GROUPED TABLE VIEW                                  */}
        {/* ======================================================== */}
        {activeTab === 'crypto' && (
          <View style={styles.insetGroupContainer}>
            <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>ASSETS</Text>
            <View style={[styles.insetGroupCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
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
                    {!isLast && <View style={[styles.hairlineDivider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />}
                  </SpringButton>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'nfts' && (
          <View style={styles.insetGroupContainer}>
            <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>COLLECTIBLES</Text>
            <View style={[styles.emptyBox, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
              <Text style={[styles.emptyBoxTitle, { color: colors.text.primary }]}>No Collectibles</Text>
              <Text style={[styles.emptyBoxSub, { color: colors.text.muted }]}>
                NFTs minted or held on {currentChainObj.name} will appear here.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.insetGroupContainer}>
            <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>RECENT ACTIVITY</Text>
            <View style={[styles.insetGroupCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
              <View style={styles.activityItemRow}>
                <View style={[styles.activityIconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                  <SendIcon color={colors.text.primary} size={15} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.activityTitle, { color: colors.text.primary }]}>Sent ETH</Text>
                  <Text style={[styles.activitySub, { color: colors.text.muted }]}>To 0x8a3f...1c9d • Confirmed</Text>
                </View>
                <Text style={[styles.activityAmount, { color: colors.text.primary }]}>-0.05 ETH</Text>
              </View>

              <View style={[styles.hairlineDivider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />

              <View style={styles.activityItemRow}>
                <View style={[styles.activityIconCircle, { backgroundColor: isDark ? 'rgba(48,209,88,0.15)' : '#E8F8EE' }]}>
                  <ReceiveIcon color={isDark ? '#30D158' : '#34C759'} size={15} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.activityTitle, { color: colors.text.primary }]}>Received USDC</Text>
                  <Text style={[styles.activitySub, { color: colors.text.muted }]}>From 0x742d...8f32 • Confirmed</Text>
                </View>
                <Text style={[styles.activityAmount, { color: isDark ? '#30D158' : '#34C759' }]}>+250.00 USDC</Text>
              </View>
            </View>
          </View>
        )}

        {/* Manage Tokens Link */}
        <SpringButton
          onPress={() => navigation.navigate('CustomToken')}
          style={[styles.manageTokensBtn, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
        >
          <Text style={[styles.manageTokensText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>+ Import Token</Text>
        </SpringButton>
      </Animated.ScrollView>

      {/* Network Switcher Bottom Sheet */}
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
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#38383A' : '#D1D1D6' }]} />
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Select Network</Text>
            <Text style={[styles.modalSubtitle, { color: colors.text.secondary }]}>Free Public RPC Endpoints</Text>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={[styles.modalGroupCard, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderColor: isDark ? '#38383A' : '#E5E5EA' }]}>
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
                      style={[styles.chainItem, isSelected && { backgroundColor: isDark ? '#3A3A3C' : '#E5F1FF' }]}
                    >
                      <View style={styles.chainItemLeft}>
                        <View style={[styles.chainLogoCircle, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#38383A' : '#E5E5EA' }]}>
                          <Text style={[styles.chainLogoText, { color: colors.text.primary }]}>{chain.logo}</Text>
                        </View>
                        <View>
                          <Text style={[styles.chainItemName, { color: colors.text.primary }]}>{chain.name}</Text>
                          <Text style={[styles.chainItemRpc, { color: colors.text.muted }]} numberOfLines={1}>
                            {chain.rpcUrls[0].replace('https://', '')}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <CheckIcon color={isDark ? '#0A84FF' : '#007AFF'} size={20} />}
                      {!isLast && <View style={[styles.chainDivider, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    gap: 6,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkName: {
    fontSize: 13,
    fontWeight: '600',
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  // Apple Titanium Card Style
  appleCardOuter: {
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  appleCard: {
    width: '100%',
    height: 204,
    borderRadius: 22,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  cardSpecularEdge: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardBrandText: {
    color: '#D1D1D6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardPassText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  cardMiddle: {
    alignItems: 'center',
    marginVertical: 4,
  },
  cardBalanceLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  cardBalanceValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  gainPill: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(48, 209, 88, 0.16)',
  },
  gainPillText: {
    color: '#30D158',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAddressCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  cardAddressText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  cardSecuredText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  actionCol: {
    alignItems: 'center',
  },
  actionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    marginBottom: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  // Segmented Control
  segmentedContainer: {
    marginBottom: 16,
  },
  segmentedTrack: {
    height: 36,
    borderRadius: 10,
    flexDirection: 'row',
    position: 'relative',
    padding: 2,
  },
  segmentedSlider: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentedBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentedLabel: {
    fontSize: 13,
  },
  // Inset Grouped Table
  insetGroupContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 12,
  },
  insetGroupCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    position: 'relative',
  },
  tokenContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 14,
  },
  tokenMeta: {
    justifyContent: 'center',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  tokenSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  tokenBalanceCol: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  tokenUsd: {
    fontSize: 12,
    marginTop: 2,
  },
  hairlineDivider: {
    position: 'absolute',
    bottom: 0,
    left: 68,
    right: 0,
    height: 0.5,
  },
  emptyBox: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 32,
    alignItems: 'center',
  },
  emptyBoxTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyBoxSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  activitySub: {
    fontSize: 12,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  manageTokensBtn: {
    borderRadius: 14,
    borderWidth: 0.5,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  manageTokensText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Toast
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 0.5,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
  },
  chainItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  chainLogoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  chainLogoText: {
    fontSize: 18,
  },
  chainItemName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  chainItemRpc: {
    fontSize: 11,
    marginTop: 1,
    maxWidth: 200,
  },
  chainDivider: {
    position: 'absolute',
    bottom: 0,
    left: 64,
    right: 0,
    height: 0.5,
  },
});
