// src/screens/HomeScreen.tsx - Institutional-Grade Bento Box Dashboard & Executive Web3 Interface

import React, { useEffect, useState, useRef } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl,
  SafeAreaView, StatusBar, Modal, Animated, Pressable, Platform, Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS } from '../core/ChainConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Reusable Spring Pressable Component
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
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// SF Symbols & Razor-Sharp Glyphs
const ChevronDownIcon = ({ color = '#8E8E93', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const CheckIcon = ({ color = '#00F5A0', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

const ShieldIcon = ({ color = '#00F0FF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" />
  </Svg>
);

const CopyIcon = ({ color = '#8E8E93', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

// High-Res Uniform Token Badges (Hyper-saturated Accents & True Brand Colors)
const EthLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(98, 126, 234, 0.2)" stroke="#627EEA" strokeWidth="0.5" />
    <Path d="M12 4v6.2l5 2.3L12 4z" fill="#E5E7EB" />
    <Path d="M12 4L7 12.5l5-2.3V4z" fill="#FFFFFF" />
    <Path d="M12 13.5v6.5l5-7-5 .5z" fill="#E5E7EB" />
    <Path d="M12 13.5L7 13l5 7v-6.5z" fill="#FFFFFF" />
  </Svg>
);

const BtcLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(247, 147, 26, 0.2)" stroke="#F7931A" strokeWidth="0.5" />
    <Path
      d="M14.5 10.5c.8-.4 1.2-1.1 1.2-2 0-1.6-1.3-2.5-3.2-2.5H9v9h3.8c2 0 3.4-1 3.4-2.7 0-1-.6-1.6-1.7-1.8zm-3.5-3h1.2c.9 0 1.5.4 1.5 1.2s-.6 1.2-1.5 1.2H11v-2.4zm1.5 6H11v-2.6h1.5c1 0 1.6.4 1.6 1.3 0 .8-.6 1.3-1.6 1.3z"
      fill="#FFFFFF"
    />
  </Svg>
);

const UsdcLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(39, 117, 202, 0.2)" stroke="#2775CA" strokeWidth="0.5" />
    <Path
      d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5S9.5 7.5 12 7.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z"
      fill="#FFFFFF"
    />
    <Path d="M11 9h2v6h-2z" fill="#FFFFFF" />
  </Svg>
);

const SolLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(175, 82, 222, 0.2)" stroke="#AF52DE" strokeWidth="0.5" />
    <Path d="M6.5 15.5l2-2h9l-2 2h-9zM6.5 12.5l2-2h9l-2 2h-9zM6.5 9.5l2-2h9l-2 2h-9z" fill="#FFFFFF" />
  </Svg>
);

const TOKEN_LOGOS: Record<string, () => React.ReactElement> = {
  ETH: EthLogo,
  BTC: BtcLogo,
  USDC: UsdcLogo,
  SOL: SolLogo,
};

// Default Institutional Assets
const DEFAULT_ASSETS = [
  { symbol: 'ETH', name: 'Ethereum', balance: '306.45', price: '$3,420.50', change: '+3.4%', positive: true, usd: '$1,048,220.00', share: '56%' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '7.70', price: '$67,540.00', change: '+1.9%', positive: true, usd: '$520,380.00', share: '28%' },
  { symbol: 'SOL', name: 'Solana', balance: '1,095.00', price: '$168.20', change: '-0.7%', positive: false, usd: '$184,200.00', share: '10%' },
  { symbol: 'USDC', name: 'USD Coin', balance: '89,790.00', price: '$1.00', change: '0.0%', positive: true, usd: '$89,790.00', share: '6%' },
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
  const [copiedToast, setCopiedToast] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showVaultActionModal, setShowVaultActionModal] = useState(false);
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);

  // Smooth Animations
  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(-60)).current;

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
        Animated.spring(toastAnim, { toValue: 12, useNativeDriver: true, damping: 16, stiffness: 220 }),
        Animated.delay(1800),
        Animated.timing(toastAnim, { toValue: -60, duration: 250, useNativeDriver: true }),
      ]).start(() => setCopiedToast(false));
    } catch {}
  };

  const triggerFaceId = () => {
    setShowFaceIdModal(true);
    setTimeout(() => {
      setShowFaceIdModal(false);
    }, 2200);
  };

  const currentChainObj = CHAINS[selectedChain] || CHAINS.ethereum;

  // Real or demo high-net-worth portfolio valuation
  const displayTotalUsd = totalValueUsd > 0
    ? totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '1,842,590.42';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: isDark ? '#0B0B0C' : '#F2F2F7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Dynamic Toast Pill (Dynamic Island Style) */}
      {copiedToast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <View style={[styles.toastPill, { backgroundColor: '#16171B', borderColor: 'rgba(0, 240, 255, 0.3)' }]}>
            <CheckIcon color="#00F5A0" size={14} />
            <Text style={styles.toastText}>Address copied to clipboard</Text>
          </View>
        </Animated.View>
      )}

      {/* ======================================================== */}
      {/* TOP NAVIGATION BAR */}
      {/* ======================================================== */}
      <View style={[styles.navBar, { paddingTop: insets.top + 6 }]}>
        {/* Unified Chain Selector Trigger */}
        <SpringButton
          onPress={() => setShowNetworkModal(true)}
          style={[styles.chainSelectorPill, { backgroundColor: isDark ? '#16171B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E5EA' }]}
        >
          <View style={[styles.chainStatusDot, { backgroundColor: '#627EEA' }]} />
          <Text style={[styles.chainSelectorText, { color: colors.text.primary }]}>
            {currentChainObj.name} Vault
          </Text>
          <ChevronDownIcon color={colors.text.muted} size={11} />
        </SpringButton>

        {/* Right Badges: Institutional Plus & Security Vault Shield */}
        <View style={styles.navRightRow}>
          <View style={styles.plusBadge}>
            <Text style={styles.plusBadgeStar}>★</Text>
            <Text style={styles.plusBadgeText}>PLUS</Text>
          </View>

          <SpringButton
            onPress={triggerFaceId}
            style={[styles.shieldButton, { backgroundColor: isDark ? '#16171B' : '#FFFFFF', borderColor: isDark ? 'rgba(0,240,255,0.3)' : '#E5E5EA' }]}
          >
            <ShieldIcon color="#00F0FF" size={16} />
          </SpringButton>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        style={{ opacity: screenFadeAnim }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#00F0FF' : '#007AFF'}
          />
        }
      >
        {/* ======================================================== */}
        {/* BENTO CELL 1: HERO NET LIQUID ASSETS & FLUID SPARKLINE   */}
        {/* ======================================================== */}
        <View style={[styles.bentoHeroCard, { backgroundColor: isDark ? '#121316' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E5EA' }]}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>Net Liquid Assets</Text>
              <Text style={[styles.heroBalanceText, { color: colors.text.primary }]}>
                ${displayTotalUsd}
              </Text>
            </View>

            <View style={styles.deltaPill}>
              <Text style={styles.deltaPillText}>+$48,190.20 (+2.68%)</Text>
            </View>
          </View>

          {/* Fluid Anti-Aliased Sparkline SVG with Underglow */}
          <View style={styles.sparklineContainer}>
            <Svg width="100%" height={68} viewBox="0 0 340 68" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="heroGlow" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#00F5A0" stopOpacity="0.28" />
                  <Stop offset="100%" stopColor="#00F5A0" stopOpacity="0.0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M0 55 Q 40 45, 80 50 T 160 30 T 240 38 T 300 15 T 340 8 L 340 68 L 0 68 Z"
                fill="url(#heroGlow)"
              />
              <Path
                d="M0 55 Q 40 45, 80 50 T 160 30 T 240 38 T 300 15 T 340 8"
                fill="none"
                stroke="#00F5A0"
                strokeWidth={2.4}
              />
            </Svg>
          </View>

          {/* Sub-Metric Row (Gas, Yield, Address) */}
          <View style={[styles.heroFooterRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F2F2F7' }]}>
            <View style={styles.heroFooterItem}>
              <View style={[styles.miniDot, { backgroundColor: '#00F0FF' }]} />
              <Text style={styles.heroFooterLabel}>Gas: <Text style={styles.heroFooterVal}>12 Gwei</Text></Text>
            </View>

            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterLabel}>Staked Yield: <Text style={[styles.heroFooterVal, { color: '#00F5A0' }]}>4.82%</Text></Text>
            </View>

            <SpringButton onPress={copyAddress} style={styles.heroAddrPill}>
              <Text style={styles.heroAddrText}>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x71C...389A'}
              </Text>
              <CopyIcon color="#8E8E93" size={11} />
            </SpringButton>
          </View>
        </View>

        {/* ======================================================== */}
        {/* BENTO CELL 2: RAPID HORIZONTAL ASSET CAROUSEL            */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>ALLOCATION VAULT</Text>
          <Text style={styles.sectionActionText}>Rebalance</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselTrack}>
          {DEFAULT_ASSETS.map((asset, index) => {
            const Logo = TOKEN_LOGOS[asset.symbol] || EthLogo;
            return (
              <SpringButton
                key={asset.symbol}
                onPress={() => navigation.navigate('Send')}
                style={[styles.carouselCard, { backgroundColor: isDark ? '#121316' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E5EA' }]}
              >
                <View style={styles.carouselCardTop}>
                  <Logo />
                  <Text style={[styles.assetChangeText, { color: asset.positive ? '#00F5A0' : '#FF453A' }]}>
                    {asset.change}
                  </Text>
                </View>

                <View style={styles.carouselCardBottom}>
                  <Text style={[styles.assetValText, { color: colors.text.primary }]}>{asset.usd}</Text>
                  <View style={styles.assetSubRow}>
                    <Text style={styles.assetBalText}>{asset.balance} {asset.symbol}</Text>
                    <Text style={styles.assetShareText}>{asset.share}</Text>
                  </View>
                </View>
              </SpringButton>
            );
          })}
        </ScrollView>

        {/* ======================================================== */}
        {/* BENTO CELL 3: MONTECH VALUE ENGINES (STAKING & MEV RELAY)*/}
        {/* ======================================================== */}
        <View style={styles.bentoGridRow}>
          {/* Staking Yield Engine (Revenue Engine 3) */}
          <SpringButton
            onPress={() => navigation.navigate('Swap')}
            style={[styles.bentoSubCard, { backgroundColor: isDark ? '#121316' : '#FFFFFF', borderColor: isDark ? 'rgba(0,245,160,0.2)' : '#E5E5EA' }]}
          >
            <View>
              <View style={styles.cardHeaderSmall}>
                <Text style={styles.cardSmallTitle}>STAKING SAAS</Text>
                <View style={[styles.statusDotSmall, { backgroundColor: '#00F5A0' }]} />
              </View>
              <Text style={[styles.cardStatLarge, { color: colors.text.primary }]}>+4.82% <Text style={styles.cardStatUnit}>APR</Text></Text>
              <Text style={styles.cardStatDesc}>Compound validator yields</Text>
            </View>
            <Text style={[styles.cardActionPill, { color: '#00F5A0' }]}>Earn Yield →</Text>
          </SpringButton>

          {/* MEV Shield Private Relay (Revenue Engine 4) */}
          <SpringButton
            onPress={triggerFaceId}
            style={[styles.bentoSubCard, { backgroundColor: isDark ? '#121316' : '#FFFFFF', borderColor: isDark ? 'rgba(0,240,255,0.2)' : '#E5E5EA' }]}
          >
            <View>
              <View style={styles.cardHeaderSmall}>
                <Text style={styles.cardSmallTitle}>MEV SHIELD</Text>
                <View style={[styles.statusDotSmall, { backgroundColor: '#00F0FF' }]} />
              </View>
              <Text style={[styles.cardStatLarge, { color: colors.text.primary }]}>$1,420 <Text style={styles.cardStatUnit}>Saved</Text></Text>
              <Text style={styles.cardStatDesc}>Front-running bot defense</Text>
            </View>
            <Text style={[styles.cardActionPill, { color: '#00F0FF' }]}>Relay Armed ✓</Text>
          </SpringButton>
        </View>

        {/* ======================================================== */}
        {/* BENTO CELL 4: INSTITUTIONAL ACTIVITY FEED               */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>INSTITUTIONAL ACTIVITY</Text>
          <Text style={styles.sectionActionText}>View Ledger</Text>
        </View>

        <View style={[styles.activityGroupCard, { backgroundColor: isDark ? '#121316' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E5EA' }]}>
          {/* Item 1 */}
          <View style={styles.activityItemRow}>
            <View style={[styles.activityIconWrap, { backgroundColor: 'rgba(0,240,255,0.1)' }]}>
              <Text style={{ color: '#00F0FF', fontSize: 13, fontWeight: '700' }}>⇄</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.activityTitle, { color: colors.text.primary }]}>Aggregator Swap</Text>
              <Text style={styles.activitySub}>12.5 ETH → 42,750 USDC • Saved $28</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.activityAmount, { color: '#00F5A0' }]}>+42,750 USDC</Text>
              <Text style={styles.activityTime}>12m ago</Text>
            </View>
          </View>

          <View style={[styles.hairlineDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#E5E5EA' }]} />

          {/* Item 2 */}
          <View style={styles.activityItemRow}>
            <View style={[styles.activityIconWrap, { backgroundColor: 'rgba(0,245,160,0.1)' }]}>
              <Text style={{ color: '#00F5A0', fontSize: 13, fontWeight: '700' }}>+</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.activityTitle, { color: colors.text.primary }]}>Staking Yield Payout</Text>
              <Text style={styles.activitySub}>Lido Validator Node #842</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.activityAmount, { color: '#00F5A0' }]}>+0.412 ETH</Text>
              <Text style={styles.activityTime}>3h ago</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ======================================================== */}
      {/* PERSISTENT FLOATING BOTTOM DOCK WITH CENTRAL VAULT SWITCH*/}
      {/* ======================================================== */}
      <View style={[styles.floatingDockOuter, { bottom: Math.max(16, insets.bottom + 4) }]}>
        <View style={[styles.floatingDock, { backgroundColor: isDark ? 'rgba(18, 19, 22, 0.92)' : 'rgba(255,255,255,0.92)', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E5EA' }]}>
          {/* Dock Node 1: Dashboard */}
          <TouchableOpacity activeOpacity={0.8} style={styles.dockNode}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth={2}>
              <Rect x="3" y="3" width="7" height="7" rx="1.5" />
              <Rect x="14" y="3" width="7" height="7" rx="1.5" />
              <Rect x="14" y="14" width="7" height="7" rx="1.5" />
              <Rect x="3" y="14" width="7" height="7" rx="1.5" />
            </Svg>
            <Text style={[styles.dockLabel, { color: '#00F0FF' }]}>Vault</Text>
          </TouchableOpacity>

          {/* Dock Node 2: Markets */}
          <TouchableOpacity onPress={() => navigation.navigate('Explore')} activeOpacity={0.8} style={styles.dockNode}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </Svg>
            <Text style={styles.dockLabel}>Markets</Text>
          </TouchableOpacity>

          {/* ===================================================== */}
          {/* CENTRALLY ANCHORED GLOBAL VAULT SWITCH TRIGGER        */}
          {/* ===================================================== */}
          <View style={styles.centralSwitchAnchor}>
            <SpringButton
              onPress={() => setShowVaultActionModal(true)}
              style={styles.vaultSwitchCircle}
            >
              <View style={styles.vaultSwitchInner}>
                <Text style={styles.vaultSwitchPlus}>+</Text>
              </View>
            </SpringButton>
          </View>

          {/* Dock Node 3: Activity */}
          <TouchableOpacity onPress={() => navigation.navigate('History')} activeOpacity={0.8} style={styles.dockNode}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Circle cx="12" cy="12" r="10" />
              <Path d="M12 6v6l4 2" />
            </Svg>
            <Text style={styles.dockLabel}>Ledger</Text>
          </TouchableOpacity>

          {/* Dock Node 4: Settings */}
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.8} style={styles.dockNode}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth={2}>
              <Circle cx="12" cy="12" r="3" />
              <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </Svg>
            <Text style={styles.dockLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ======================================================== */}
      {/* VAULT ACTION MODAL (Send, Receive, Swap, Buy)            */}
      {/* ======================================================== */}
      <Modal
        visible={showVaultActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVaultActionModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowVaultActionModal(false)} />
          <View style={[styles.modalSheetCard, { backgroundColor: isDark ? '#121316' : '#FFFFFF', borderColor: isDark ? 'rgba(0,240,255,0.3)' : '#E5E5EA' }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.modalSheetTitle, { color: colors.text.primary }]}>Institutional Execution</Text>
            <Text style={styles.modalSheetSubtitle}>Zero-mempool leakage • Direct private routing</Text>

            <View style={styles.actionGrid}>
              {/* Send */}
              <SpringButton
                onPress={() => {
                  setShowVaultActionModal(false);
                  navigation.navigate('Send');
                }}
                style={[styles.actionGridItem, { backgroundColor: isDark ? '#1A1C22' : '#F2F2F7' }]}
              >
                <Text style={[styles.actionGridIcon, { color: '#00F0FF' }]}>↑</Text>
                <Text style={[styles.actionGridText, { color: colors.text.primary }]}>Send Asset</Text>
                <Text style={styles.actionGridSub}>Predictive Gas</Text>
              </SpringButton>

              {/* Receive */}
              <SpringButton
                onPress={() => {
                  setShowVaultActionModal(false);
                  navigation.navigate('Receive');
                }}
                style={[styles.actionGridItem, { backgroundColor: isDark ? '#1A1C22' : '#F2F2F7' }]}
              >
                <Text style={[styles.actionGridIcon, { color: '#00F5A0' }]}>↓</Text>
                <Text style={[styles.actionGridText, { color: colors.text.primary }]}>Receive</Text>
                <Text style={styles.actionGridSub}>Hardware QR Pass</Text>
              </SpringButton>

              {/* Smart Swap */}
              <SpringButton
                onPress={() => {
                  setShowVaultActionModal(false);
                  navigation.navigate('Swap');
                }}
                style={[styles.actionGridItem, { backgroundColor: isDark ? '#1A1C22' : '#F2F2F7' }]}
              >
                <Text style={[styles.actionGridIcon, { color: '#F7931A' }]}>⇄</Text>
                <Text style={[styles.actionGridText, { color: colors.text.primary }]}>Smart Swap</Text>
                <Text style={styles.actionGridSub}>0.3% Optimized Route</Text>
              </SpringButton>

              {/* Fiat Ramp */}
              <SpringButton
                onPress={() => {
                  setShowVaultActionModal(false);
                  navigation.navigate('Buy');
                }}
                style={[styles.actionGridItem, { backgroundColor: isDark ? '#1A1C22' : '#F2F2F7' }]}
              >
                <Text style={[styles.actionGridIcon, { color: '#00F5A0' }]}>💳</Text>
                <Text style={[styles.actionGridText, { color: colors.text.primary }]}>Fiat Ramp</Text>
                <Text style={styles.actionGridSub}>Stripe & MoonPay</Text>
              </SpringButton>
            </View>

            <View style={styles.mevBanner}>
              <View style={[styles.statusDotSmall, { backgroundColor: '#00F0FF' }]} />
              <Text style={styles.mevBannerText}>Flashbots Private Relay Armed • 0 Front-runs</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* SMART BIOMETRIC SECURITY VAULT (FaceID Simulation Modal) */}
      {/* ======================================================== */}
      <Modal visible={showFaceIdModal} transparent animationType="fade">
        <View style={styles.faceIdBackdrop}>
          <View style={styles.faceIdReticle}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth={1.8}>
              <Path d="M7 3H5a2 2 0 00-2 2v2M17 3h2a2 2 0 012 2v2M7 21H5a2 2 0 01-2-2v-2M17 21h2a2 2 0 002-2v-2M9 9h.01M15 9h.01M10 13a2 2 0 004 0M10 17h4" />
            </Svg>
          </View>
          <Text style={styles.faceIdTitle}>Apple Secure Enclave</Text>
          <Text style={styles.faceIdSub}>FIPS 140-2 Level 3 Hardware Key Verification</Text>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MULTI-CHAIN UNIFIED NETWORK SELECTOR MODAL              */}
      {/* ======================================================== */}
      <Modal
        visible={showNetworkModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNetworkModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowNetworkModal(false)} />
          <View style={[styles.modalSheetCard, { backgroundColor: isDark ? '#121316' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E5EA' }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.modalSheetTitle, { color: colors.text.primary }]}>Select Native Blockchain</Text>
            <Text style={styles.modalSheetSubtitle}>Zero-latency multi-node failover</Text>

            <View style={{ marginTop: 12 }}>
              {Object.entries(CHAINS).map(([key, chain]) => {
                const isSelected = selectedChain === key;
                return (
                  <SpringButton
                    key={key}
                    onPress={() => {
                      setSelectedChain(key);
                      setShowNetworkModal(false);
                    }}
                    style={[styles.chainSelectRow, isSelected && { backgroundColor: isDark ? '#1A1C22' : '#F2F2F7' }]}
                  >
                    <View style={styles.chainRowLeft}>
                      <Text style={{ fontSize: 20 }}>{chain.logo}</Text>
                      <View>
                        <Text style={[styles.chainNameText, { color: colors.text.primary }]}>{chain.name}</Text>
                        <Text style={styles.chainRpcText}>{chain.rpcUrls[0].replace('https://', '')}</Text>
                      </View>
                    </View>
                    {isSelected && <CheckIcon color="#00F5A0" size={18} />}
                  </SpringButton>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chainSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    gap: 7,
  },
  chainStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  chainSelectorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 4,
  },
  plusBadgeStar: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  plusBadgeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  shieldButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // BENTO HERO CARD
  bentoHeroCard: {
    borderRadius: 26,
    borderWidth: 0.5,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroBalanceText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  deltaPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 245, 160, 0.25)',
  },
  deltaPillText: {
    color: '#00F5A0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sparklineContainer: {
    height: 68,
    marginVertical: 4,
  },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    paddingTop: 12,
    marginTop: 6,
  },
  heroFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  heroFooterLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  heroFooterVal: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroAddrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroAddrText: {
    color: '#8E8E93',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  // SECTION HEADERS
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionActionText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '600',
  },
  // ASSET CAROUSEL
  carouselTrack: {
    gap: 10,
    paddingBottom: 4,
    marginBottom: 18,
  },
  carouselCard: {
    width: 132,
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 12,
    justifyContent: 'space-between',
  },
  carouselCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  assetChangeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  carouselCardBottom: {},
  assetValText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  assetSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  assetBalText: {
    color: '#8E8E93',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  assetShareText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
  },
  // BENTO SUB-GRID
  bentoGridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  bentoSubCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 14,
    justifyContent: 'space-between',
    height: 124,
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSmallTitle: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardStatLarge: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardStatUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.4)',
  },
  cardStatDesc: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  cardActionPill: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  // ACTIVITY GROUP
  activityGroupCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  activitySub: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  activityTime: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 2,
  },
  hairlineDivider: {
    height: 0.5,
  },
  // FLOATING BOTTOM DOCK
  floatingDockOuter: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 40,
  },
  floatingDock: {
    height: 66,
    borderRadius: 33,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    borderWidth: 0.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  dockNode: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
  },
  dockLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    color: '#8E8E93',
  },
  centralSwitchAnchor: {
    position: 'relative',
    top: -14,
  },
  vaultSwitchCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1.5,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  vaultSwitchInner: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    backgroundColor: '#0B0B0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultSwitchPlus: {
    color: '#00F0FF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
  // MODALS
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSheetSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionGridItem: {
    width: (SCREEN_WIDTH - 50) / 2,
    padding: 14,
    borderRadius: 18,
    alignItems: 'flex-start',
  },
  actionGridIcon: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionGridText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionGridSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  mevBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  mevBannerText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '600',
  },
  chainSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  chainRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chainNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chainRpcText: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 1,
  },
  faceIdBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  faceIdReticle: {
    width: 90,
    height: 90,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    marginBottom: 20,
  },
  faceIdTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  faceIdSub: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
