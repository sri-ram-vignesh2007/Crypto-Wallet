// src/screens/HomeScreen.tsx - Institutional-Grade Fintech Dashboard for CryptoVaultAI

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
  activeScale = 0.96,
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

// Fintech Vector Glyphs
const ChevronDownIcon = ({ color = '#858585', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const CheckIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

const SparkIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </Svg>
);

const ShieldIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" />
  </Svg>
);

const EyeIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Path d="M1 1l22 22" />
  </Svg>
);

const CopyIcon = ({ color = '#858585', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

// High-Res Uniform Token Badges
const EthLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(98, 126, 234, 0.15)" stroke="#627EEA" strokeWidth="0.8" />
    <Path d="M12 4v6.2l5 2.3L12 4z" fill="#94A3B8" />
    <Path d="M12 4L7 12.5l5-2.3V4z" fill="#FFFFFF" />
    <Path d="M12 13.5v6.5l5-7-5 .5z" fill="#94A3B8" />
    <Path d="M12 13.5L7 13l5 7v-6.5z" fill="#FFFFFF" />
  </Svg>
);

const BtcLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(247, 147, 26, 0.15)" stroke="#F7931A" strokeWidth="0.8" />
    <Path
      d="M14.5 10.5c.8-.4 1.2-1.1 1.2-2 0-1.6-1.3-2.5-3.2-2.5H9v9h3.8c2 0 3.4-1 3.4-2.7 0-1-.6-1.6-1.7-1.8zm-3.5-3h1.2c.9 0 1.5.4 1.5 1.2s-.6 1.2-1.5 1.2H11v-2.4zm1.5 6H11v-2.6h1.5c1 0 1.6.4 1.6 1.3 0 .8-.6 1.3-1.6 1.3z"
      fill="#FFFFFF"
    />
  </Svg>
);

const UsdcLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(39, 117, 202, 0.15)" stroke="#2775CA" strokeWidth="0.8" />
    <Path
      d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5S9.5 7.5 12 7.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z"
      fill="#FFFFFF"
    />
    <Path d="M11 9h2v6h-2z" fill="#FFFFFF" />
  </Svg>
);

const SolLogo = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(20, 241, 149, 0.15)" stroke="#14F195" strokeWidth="0.8" />
    <Path d="M6.5 15.5l2-2h9l-2 2h-9zM6.5 12.5l2-2h9l-2 2h-9zM6.5 9.5l2-2h9l-2 2h-9z" fill="#FFFFFF" />
  </Svg>
);

const TOKEN_LOGOS: Record<string, () => React.ReactElement> = {
  ETH: EthLogo,
  BTC: BtcLogo,
  USDC: UsdcLogo,
  SOL: SolLogo,
};

const DEFAULT_ASSETS = [
  { symbol: 'ETH', name: 'Ethereum', balance: '306.45', price: '$3,420.50', change: '+3.4%', positive: true, usd: '$1,048,220.00', network: 'Ethereum' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '7.70', price: '$67,540.00', change: '+1.9%', positive: true, usd: '$520,380.00', network: 'Bitcoin' },
  { symbol: 'SOL', name: 'Solana', balance: '1,095.00', price: '$168.20', change: '-0.7%', positive: false, usd: '$184,200.00', network: 'Solana' },
  { symbol: 'USDC', name: 'USD Coin', balance: '89,790.00', price: '$1.00', change: '0.0%', positive: true, usd: '$89,790.00', network: 'ERC-20' },
];

const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const {
    address,
    selectedChain,
    totalValueUsd,
    refreshBalances,
    setSelectedChain,
  } = useWalletStore();

  const [refreshing, setRefreshing] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1D');

  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(screenFadeAnim, {
      toValue: 1,
      duration: 300,
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
        Animated.spring(toastAnim, { toValue: 14, useNativeDriver: true, damping: 16, stiffness: 220 }),
        Animated.delay(1800),
        Animated.timing(toastAnim, { toValue: -60, duration: 250, useNativeDriver: true }),
      ]).start(() => setCopiedToast(false));
    } catch {}
  };

  const triggerFaceId = () => {
    setShowFaceIdModal(true);
    setTimeout(() => {
      setShowFaceIdModal(false);
    }, 2000);
  };

  const currentChainObj = CHAINS[selectedChain] || CHAINS.ethereum;

  const displayTotalUsd = totalValueUsd > 0
    ? totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '1,842,590.42';

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#303030' : '#E5E5E5';
  const canvasBg = isDark ? '#000000' : '#FFFFFF';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoSurfaceElevated = isDark ? '#202020' : '#F7F7F7';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: canvasBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Dynamic Toast Pill */}
      {copiedToast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <View style={[styles.toastPill, { backgroundColor: isDark ? '#202020' : '#111111', borderColor: cardBorder }]}>
            <CheckIcon color="#FFFFFF" size={14} />
            <Text style={styles.toastText}>Address copied to clipboard</Text>
          </View>
        </Animated.View>
      )}

      {/* ======================================================== */}
      {/* TOP HEADER: BRAND IDENTITY & UNIFIED SELECTORS           */}
      {/* ======================================================== */}
      <View style={[styles.navBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.brandRow}>
          <Text style={[styles.brandTitle, { color: colors.text.primary }]}>CryptoVault</Text>
          <View style={[styles.securityStatusDot, { backgroundColor: monoPrimary }]} />
        </View>

        <View style={styles.navRightRow}>
          {/* Chain Selector Trigger */}
          <SpringButton
            onPress={() => setShowNetworkModal(true)}
            style={[styles.chainSelectorPill, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <View style={[styles.chainStatusDot, { backgroundColor: monoPrimary }]} />
            <Text style={[styles.chainSelectorText, { color: colors.text.primary }]}>
              {currentChainObj.name}
            </Text>
            <ChevronDownIcon color={colors.text.muted} size={11} />
          </SpringButton>

          {/* AI Assistant Quick Trigger */}
          <SpringButton
            onPress={() => navigation.navigate('AIChatbot')}
            style={[styles.iconButton, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <SparkIcon color={monoPrimary} size={17} />
          </SpringButton>

          {/* Security Vault Trigger */}
          <SpringButton
            onPress={triggerFaceId}
            style={[styles.iconButton, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <ShieldIcon color={monoPrimary} size={16} />
          </SpringButton>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        style={{ opacity: screenFadeAnim }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={monoPrimary}
          />
        }
      >
        {/* ======================================================== */}
        {/* PORTFOLIO HERO BENTO CARD                                */}
        {/* ======================================================== */}
        <View style={[styles.bentoHeroCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.heroTopRow}>
            <View>
              <View style={styles.balanceHeaderRow}>
                <Text style={styles.heroLabel}>Total Balance</Text>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeBtn}>
                  {showBalance ? <EyeIcon size={14} color="#858585" /> : <EyeOffIcon size={14} color="#858585" />}
                </TouchableOpacity>
              </View>

              <Text style={[styles.heroBalanceText, { color: colors.text.primary }]}>
                {showBalance ? `$${displayTotalUsd}` : '••••••••••••'}
              </Text>
            </View>

            <View style={[styles.deltaPill, { backgroundColor: monoMutedSurface }]}>
              <Text style={[styles.deltaPillText, { color: colors.text.primary }]}>+$48,190.20 (+2.68%)</Text>
            </View>
          </View>

          {/* Solid Anti-Aliased Portfolio Line Chart (Strict Monochrome) */}
          <View style={styles.sparklineContainer}>
            <Svg width="100%" height={64} viewBox="0 0 340 64" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={monoPrimary} stopOpacity={0.06} />
                  <Stop offset="100%" stopColor={monoPrimary} stopOpacity={0.0} />
                </LinearGradient>
              </Defs>
              <Path
                d="M0 52 Q 40 44, 80 48 T 160 28 T 240 34 T 300 14 T 340 6 L 340 64 L 0 64 Z"
                fill="url(#heroGradient)"
              />
              <Path
                d="M0 52 Q 40 44, 80 48 T 160 28 T 240 34 T 300 14 T 340 6"
                fill="none"
                stroke={monoPrimary}
                strokeWidth={2}
              />
            </Svg>
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeRow}>
            {TIME_RANGES.map((range) => {
              const active = selectedTimeRange === range;
              return (
                <TouchableOpacity
                  key={range}
                  onPress={() => setSelectedTimeRange(range)}
                  style={[
                    styles.timeRangePill,
                    active && { backgroundColor: monoPrimary },
                  ]}
                >
                  <Text style={[
                    styles.timeRangeText,
                    active
                      ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                      : { color: isDark ? '#858585' : '#666666' },
                  ]}>
                    {range}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sub-Metric Row (Gas, Yield, Address) */}
          <View style={[styles.heroFooterRow, { borderTopColor: cardBorder }]}>
            <View style={styles.heroFooterItem}>
              <View style={[styles.miniDot, { backgroundColor: monoPrimary }]} />
              <Text style={styles.heroFooterLabel}>Gas: <Text style={[styles.heroFooterVal, { color: colors.text.primary }]}>12 Gwei</Text></Text>
            </View>

            <View style={styles.heroFooterItem}>
              <Text style={styles.heroFooterLabel}>Yield: <Text style={[styles.heroFooterVal, { color: colors.text.primary }]}>+4.82% APR</Text></Text>
            </View>

            <SpringButton onPress={copyAddress} style={[styles.heroAddrPill, { backgroundColor: monoMutedSurface }]}>
              <Text style={styles.heroAddrText}>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x71C...389A'}
              </Text>
              <CopyIcon color="#858585" size={11} />
            </SpringButton>
          </View>
        </View>

        {/* ======================================================== */}
        {/* PRIMARY ACTIONS: SEND, RECEIVE, SWAP, BUY                 */}
        {/* ======================================================== */}
        <View style={styles.actionsBarRow}>
          {/* Send */}
          <SpringButton onPress={() => navigation.navigate('Send')} style={styles.actionBtnItem}>
            <View style={[styles.actionIconCircle, { backgroundColor: monoPrimary }]}>
              <Text style={[styles.actionIconGlyph, { color: isDark ? '#000000' : '#FFFFFF' }]}>↗</Text>
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Send</Text>
          </SpringButton>

          {/* Receive */}
          <SpringButton onPress={() => navigation.navigate('Receive')} style={styles.actionBtnItem}>
            <View style={[styles.actionIconCircle, { backgroundColor: monoMutedSurface }]}>
              <Text style={[styles.actionIconGlyph, { color: monoPrimary }]}>↙</Text>
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Receive</Text>
          </SpringButton>

          {/* Swap */}
          <SpringButton onPress={() => navigation.navigate('Swap')} style={styles.actionBtnItem}>
            <View style={[styles.actionIconCircle, { backgroundColor: monoMutedSurface }]}>
              <Text style={[styles.actionIconGlyph, { color: monoPrimary }]}>⇄</Text>
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Swap</Text>
          </SpringButton>

          {/* Buy */}
          <SpringButton onPress={() => navigation.navigate('Buy')} style={styles.actionBtnItem}>
            <View style={[styles.actionIconCircle, { backgroundColor: monoMutedSurface }]}>
              <Text style={[styles.actionIconGlyph, { color: monoPrimary }]}>+</Text>
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Buy</Text>
          </SpringButton>
        </View>

        {/* ======================================================== */}
        {/* VALUE ENGINES: STAKING SAAS & MEV SHIELD                 */}
        {/* ======================================================== */}
        <View style={styles.valueEnginesRow}>
          <SpringButton
            onPress={() => navigation.navigate('Swap')}
            style={[styles.valueEngineCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <View style={styles.cardHeaderSmall}>
              <Text style={styles.cardSmallTitle}>STAKING SAAS</Text>
              <View style={[styles.statusDotSmall, { backgroundColor: monoPrimary }]} />
            </View>
            <Text style={[styles.cardStatLarge, { color: colors.text.primary }]}>
              +4.82% <Text style={styles.cardStatUnit}>APR</Text>
            </Text>
            <Text style={styles.cardStatDesc}>Lido & RocketPool Node</Text>
          </SpringButton>

          <SpringButton
            onPress={triggerFaceId}
            style={[styles.valueEngineCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <View style={styles.cardHeaderSmall}>
              <Text style={styles.cardSmallTitle}>MEV SHIELD</Text>
              <View style={[styles.statusDotSmall, { backgroundColor: monoPrimary }]} />
            </View>
            <Text style={[styles.cardStatLarge, { color: colors.text.primary }]}>
              Protected <Text style={styles.cardStatUnit}>✓</Text>
            </Text>
            <Text style={styles.cardStatDesc}>Flashbots Private Relay</Text>
          </SpringButton>
        </View>

        {/* ======================================================== */}
        {/* ASSET OVERVIEW SECTION                                   */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>ASSETS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Assets')}>
            <Text style={[styles.sectionActionText, { color: colors.text.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.assetListCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {DEFAULT_ASSETS.map((asset, index) => {
            const Logo = TOKEN_LOGOS[asset.symbol] || EthLogo;
            const isLast = index === DEFAULT_ASSETS.length - 1;
            return (
              <SpringButton
                key={asset.symbol}
                onPress={() => navigation.navigate('AssetDetail', { asset })}
                style={[styles.assetRowItem, !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder }]}
              >
                <View style={styles.assetLeftCol}>
                  <Logo />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.assetTitleText, { color: colors.text.primary }]}>{asset.name}</Text>
                    <Text style={styles.assetSubtitleText}>{asset.balance} {asset.symbol} • {asset.network}</Text>
                  </View>
                </View>

                <View style={styles.assetRightCol}>
                  <Text style={[styles.assetValueText, { color: colors.text.primary }]}>{asset.usd}</Text>
                  <Text style={[styles.assetChangeText, { color: asset.positive ? colors.text.primary : '#EF4444' }]}>
                    {asset.change}
                  </Text>
                </View>
              </SpringButton>
            );
          })}
        </View>

        {/* ======================================================== */}
        {/* RECENT ACTIVITY SECTION                                  */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>RECENT ACTIVITY</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
            <Text style={[styles.sectionActionText, { color: colors.text.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.assetListCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={[styles.activityItemRow, { borderBottomWidth: 0.5, borderBottomColor: cardBorder }]}>
            <View style={[styles.activityIconCircle, { backgroundColor: monoMutedSurface }]}>
              <Text style={{ color: monoPrimary, fontSize: 13, fontWeight: '700' }}>⇄</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.activityTitle, { color: colors.text.primary }]}>Smart Aggregator Swap</Text>
              <Text style={styles.activitySub}>12.5 ETH → 42,750 USDC • Saved $28</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.activityAmount, { color: colors.text.primary }]}>+42,750 USDC</Text>
              <Text style={styles.activityTime}>12m ago</Text>
            </View>
          </View>

          <View style={styles.activityItemRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: monoMutedSurface }]}>
              <Text style={{ color: monoPrimary, fontSize: 13, fontWeight: '700' }}>+</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.activityTitle, { color: colors.text.primary }]}>Staking Yield Payout</Text>
              <Text style={styles.activitySub}>Lido Validator Node #842</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.activityAmount, { color: colors.text.primary }]}>+0.412 ETH</Text>
              <Text style={styles.activityTime}>3h ago</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ======================================================== */}
      {/* BIOMETRIC SECURITY VAULT (FaceID / Passkey Overlay)      */}
      {/* ======================================================== */}
      <Modal visible={showFaceIdModal} transparent animationType="fade">
        <View style={styles.faceIdBackdrop}>
          <View style={[styles.faceIdReticle, { borderColor: monoPrimary, backgroundColor: cardBg }]}>
            <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={monoPrimary} strokeWidth={1.8}>
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
          <View style={[styles.modalSheetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
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
                    style={[styles.chainSelectRow, isSelected && { backgroundColor: monoMutedSurface }]}
                  >
                    <View style={styles.chainRowLeft}>
                      <Text style={{ fontSize: 20 }}>{chain.logo}</Text>
                      <View>
                        <Text style={[styles.chainNameText, { color: colors.text.primary }]}>{chain.name}</Text>
                        <Text style={styles.chainRpcText}>{chain.rpcUrls[0].replace('https://', '')}</Text>
                      </View>
                    </View>
                    {isSelected && <CheckIcon color={monoPrimary} size={18} />}
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
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
    paddingBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  securityStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chainSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    gap: 6,
  },
  chainStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  chainSelectorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
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
    borderRadius: 22,
    borderWidth: 0.5,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  eyeBtn: {
    padding: 2,
  },
  heroBalanceText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  deltaPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  deltaPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sparklineContainer: {
    height: 64,
    marginVertical: 4,
  },
  timeRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  timeRangePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeRangeText: {
    fontSize: 11,
    fontWeight: '600',
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroFooterLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  heroFooterVal: {
    fontWeight: '700',
  },
  heroAddrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroAddrText: {
    color: '#64748B',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  // PRIMARY ACTIONS BAR
  actionsBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  actionBtnItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconGlyph: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  // VALUE ENGINES
  valueEnginesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  valueEngineCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSmallTitle: {
    color: '#64748B',
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
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  cardStatUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#64748B',
  },
  cardStatDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  // SECTION HEADERS
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // ASSET LIST CARD
  assetListCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  assetRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  assetLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  assetSubtitleText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  assetRightCol: {
    alignItems: 'flex-end',
  },
  assetValueText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  assetChangeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  // RECENT ACTIVITY
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  activitySub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  activityTime: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  // MODALS
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    opacity: 0.4,
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
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
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
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  faceIdBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  faceIdReticle: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  faceIdTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  faceIdSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
