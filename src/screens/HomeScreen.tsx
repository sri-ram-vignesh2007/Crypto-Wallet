// src/screens/HomeScreen.tsx - Institutional-Grade Fintech Dashboard for Cura Wallet

import React, { useEffect, useState, useRef } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl,
  SafeAreaView, StatusBar, Modal, Animated, Pressable, Platform, Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useProfileStore } from '../store/profileStore';
import { useTransactionStore } from '../store/transactionStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS } from '../core/ChainConfig';
import { TokenLogo } from '../components/TokenLogo';

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

const SendActionIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17L17 7M17 7H7M17 7v10" />
  </Svg>
);

const ReceiveActionIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 7L7 17M7 17h10M7 17V7" />
  </Svg>
);

const SwapActionIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
  </Svg>
);

const BuyActionIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

const WalletHeaderIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <Path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
    <Path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </Svg>
);

const ScanReticleIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 8V5a1 1 0 0 1 1-1h3" />
    <Path d="M16 4h3a1 1 0 0 1 1 1v3" />
    <Path d="M20 16v3a1 1 0 0 1-1 1h-3" />
    <Path d="M8 20H5a1 1 0 0 1-1-1v-3" />
  </Svg>
);

const ArrowLeftIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const ChevronRightIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
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

const TOP_GAINERS = [
  { symbol: 'SOL', name: 'Solana', price: '$168.20', change: '+12.4%', positive: true },
  { symbol: 'AVAX', name: 'Avalanche', price: '$34.80', change: '+8.6%', positive: true },
  { symbol: 'NEAR', name: 'NEAR Protocol', price: '$5.12', change: '+6.1%', positive: true },
  { symbol: 'RENDER', name: 'Render', price: '$7.45', change: '+5.8%', positive: true },
];

const TOP_LOSERS = [
  { symbol: 'ARB', name: 'Arbitrum', price: '$0.82', change: '-6.4%', positive: false },
  { symbol: 'MATIC', name: 'Polygon', price: '$0.54', change: '-4.8%', positive: false },
  { symbol: 'OP', name: 'Optimism', price: '$1.95', change: '-4.2%', positive: false },
  { symbol: 'LINK', name: 'Chainlink', price: '$14.10', change: '-3.1%', positive: false },
];

const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

interface TimeframeData {
  delta: string;
  period: string;
  path: string;
  fillPath: string;
  endPoint: { x: number; y: number };
}

const TIMEFRAME_CHART_DATA: Record<string, TimeframeData> = {
  '1H': {
    delta: '+$4,210.15 (+0.23%)',
    period: 'Past 1 hour',
    path: 'M0 50 C 40 46, 80 56, 130 48 C 180 40, 220 44, 270 32 C 300 26, 320 28, 340 20',
    fillPath: 'M0 50 C 40 46, 80 56, 130 48 C 180 40, 220 44, 270 32 C 300 26, 320 28, 340 20 L 340 76 L 0 76 Z',
    endPoint: { x: 340, y: 20 },
  },
  '1D': {
    delta: '+$48,190.20 (+2.68%)',
    period: 'Past 24 hours',
    path: 'M0 58 C 45 54, 90 64, 135 44 C 175 26, 215 38, 260 26 C 295 16, 320 20, 340 8',
    fillPath: 'M0 58 C 45 54, 90 64, 135 44 C 175 26, 215 38, 260 26 C 295 16, 320 20, 340 8 L 340 76 L 0 76 Z',
    endPoint: { x: 340, y: 8 },
  },
  '1W': {
    delta: '+$112,450.00 (+6.51%)',
    period: 'Past 7 days',
    path: 'M0 64 C 50 60, 95 48, 145 52 C 185 56, 225 32, 270 20 C 300 10, 320 16, 340 6',
    fillPath: 'M0 64 C 50 60, 95 48, 145 52 C 185 56, 225 32, 270 20 C 300 10, 320 16, 340 6 L 340 76 L 0 76 Z',
    endPoint: { x: 340, y: 6 },
  },
  '1M': {
    delta: '+$245,800.00 (+15.42%)',
    period: 'Past 30 days',
    path: 'M0 68 C 40 60, 85 64, 135 46 C 175 28, 215 38, 265 22 C 295 12, 320 14, 340 4',
    fillPath: 'M0 68 C 40 60, 85 64, 135 46 C 175 28, 215 38, 265 22 C 295 12, 320 14, 340 4 L 340 76 L 0 76 Z',
    endPoint: { x: 340, y: 4 },
  },
  '1Y': {
    delta: '+$890,120.00 (+93.58%)',
    period: 'Past 1 year',
    path: 'M0 70 C 60 68, 105 52, 155 46 C 205 40, 245 26, 285 14 C 310 8, 325 8, 340 2',
    fillPath: 'M0 70 C 60 68, 105 52, 155 46 C 205 40, 245 26, 285 14 C 310 8, 325 8, 340 2 L 340 76 L 0 76 Z',
    endPoint: { x: 340, y: 2 },
  },
  'ALL': {
    delta: '+$1,420,500.00 (+338.20%)',
    period: 'All time',
    path: 'M0 72 C 80 72, 130 58, 180 48 C 220 38, 260 22, 300 10 C 320 4, 330 3, 340 2',
    fillPath: 'M0 72 C 80 72, 130 58, 180 48 C 220 38, 260 22, 300 10 C 320 4, 330 3, 340 2 L 340 76 L 0 76 Z',
    endPoint: { x: 340, y: 2 },
  },
};

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
    wallets,
    activeWalletIndex,
    activeWallet,
    switchWallet,
    createAdditionalWallet,
  } = useWalletStore();

  const [refreshing, setRefreshing] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAssetsDrawer, setShowAssetsDrawer] = useState(false);
  const { showPortfolioBalance, setShowPortfolioBalance } = useProfileStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1D');
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers'>('gainers');

  const { balances, transactions, loadTransactions } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const ethTotal = balances.ETH * 3420.50;
  const btcTotal = balances.BTC * 67540.00;
  const solTotal = balances.SOL * 168.20;
  const usdcTotal = balances.USDC;
  const dynamicTotalPortfolio = ethTotal + btcTotal + solTotal + usdcTotal;

  const displayTotalUsd = dynamicTotalPortfolio.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const dynamicAssets = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: balances.ETH.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: balances.ETH < 1 ? 4 : 2 }),
      price: '$3,420.50',
      change: '+3.4%',
      positive: true,
      usd: `$${ethTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      network: 'Ethereum',
      networkColor: '#627EEA',
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: balances.BTC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: balances.BTC < 1 ? 4 : 2 }),
      price: '$67,540.00',
      change: '+1.9%',
      positive: true,
      usd: `$${btcTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      network: 'Bitcoin',
      networkColor: '#F7931A',
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: balances.SOL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: balances.SOL < 1 ? 4 : 2 }),
      price: '$168.20',
      change: '-0.7%',
      positive: false,
      usd: `$${solTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      network: 'Solana',
      networkColor: '#14F195',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: balances.USDC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      price: '$1.00',
      change: '0.0%',
      positive: true,
      usd: `$${usdcTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      network: 'ERC-20',
      networkColor: '#2775CA',
    },
  ];

  const activeChart = TIMEFRAME_CHART_DATA[selectedTimeRange] || TIMEFRAME_CHART_DATA['1D'];

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

  const triggerFaceId = async () => {
    try {
      setShowFaceIdModal(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setTimeout(() => setShowFaceIdModal(false), 1200);
        return;
      }

      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Fingerprint / Face ID',
        fallbackLabel: 'Use Device PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      setShowFaceIdModal(false);
      if (res.success) {
        setCopiedToast(true);
        Animated.sequence([
          Animated.spring(toastAnim, { toValue: 14, useNativeDriver: true, damping: 16, stiffness: 220 }),
          Animated.delay(1600),
          Animated.timing(toastAnim, { toValue: -60, duration: 250, useNativeDriver: true }),
        ]).start(() => setCopiedToast(false));
      }
    } catch {
      setShowFaceIdModal(false);
    }
  };

  const currentChainObj = CHAINS[selectedChain] || CHAINS.ethereum;

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
      {/* TOP HEADER: WALLET CHOOSER, SCANNER & AI ASSISTANT        */}
      {/* ======================================================== */}
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        {/* Wallet Chooser Trigger (Icon + Wallet Name + Chevron) */}
        <SpringButton
          onPress={() => setShowWalletModal(true)}
          style={[styles.walletSelectorPill, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
          <WalletHeaderIcon color={monoPrimary} size={18} />
          <Text
            style={[styles.walletSelectorName, { color: colors.text.primary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {activeWallet?.name || 'Main Wallet'}
          </Text>
          <ChevronDownIcon color={colors.text.muted} size={12} />
        </SpringButton>

        {/* Right Action Block: Scan Reticle, AI */}
        <View style={styles.navRightRow}>
          {/* Camera Scan Reticle (Opens QR Code Camera Scanner Directly) */}
          <SpringButton
            onPress={() => navigation.navigate('Send', { openScanner: true })}
            style={[styles.headerIconBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <ScanReticleIcon color={monoPrimary} size={20} />
          </SpringButton>

          {/* AI Assistant Quick Trigger */}
          <SpringButton
            onPress={() => navigation.navigate('AIChatbot')}
            style={[styles.aiButtonPill, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <SparkIcon color={monoPrimary} size={14} />
            <Text style={[styles.aiButtonText, { color: colors.text.primary }]}>AI</Text>
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
          <View style={styles.heroBalanceRow}>
            <Text
              style={[styles.heroBalanceText, { color: colors.text.primary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {showPortfolioBalance ? `$${displayTotalUsd}` : '••••••••••••'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowPortfolioBalance(!showPortfolioBalance)}
              style={styles.eyeBtnBesideBalance}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              activeOpacity={0.7}
              accessibilityLabel="Toggle balance visibility"
            >
              {showPortfolioBalance ? (
                <EyeIcon size={22} color={colors.text.secondary || '#94A3B8'} />
              ) : (
                <EyeOffIcon size={22} color={colors.text.secondary || '#94A3B8'} />
              )}
            </TouchableOpacity>
          </View>

          {/* Dynamic P&L Delta Row */}
          <View style={styles.deltaRow}>
            <View style={[styles.deltaPill, { backgroundColor: monoMutedSurface }]}>
              <Text style={[styles.deltaPillText, { color: colors.text.primary }]}>
                {activeChart.delta}
              </Text>
            </View>
            <Text style={[styles.deltaPeriodText, { color: colors.text.muted }]}>{activeChart.period}</Text>
          </View>

          {/* Interactive Responsive Line Chart with Subtle Baseline & Pulse Dot */}
          <View style={styles.sparklineContainer}>
            <Svg width="100%" height={74} viewBox="0 0 340 74" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={monoPrimary} stopOpacity={0.12} />
                  <Stop offset="100%" stopColor={monoPrimary} stopOpacity={0.0} />
                </LinearGradient>
              </Defs>
              <Path d="M0 62 L 340 62" stroke={cardBorder} strokeWidth={0.6} strokeDasharray="4 4" />
              <Path d={activeChart.fillPath} fill="url(#heroGradient)" />
              <Path
                d={activeChart.path}
                fill="none"
                stroke={monoPrimary}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={activeChart.endPoint.x} cy={activeChart.endPoint.y} r={4.5} fill={monoPrimary} />
              <Circle cx={activeChart.endPoint.x} cy={activeChart.endPoint.y} r={8} fill={monoPrimary} opacity={0.2} />
            </Svg>
          </View>

          {/* Time Range Selector Segmented Row */}
          <View style={[styles.timeRangeTrack, { backgroundColor: monoMutedSurface }]}>
            {TIME_RANGES.map((range) => {
              const active = selectedTimeRange === range;
              return (
                <TouchableOpacity
                  key={range}
                  onPress={() => setSelectedTimeRange(range)}
                  style={[
                    styles.timeRangeBtn,
                    active && { backgroundColor: monoPrimary },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeRangeText,
                    active
                      ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                      : { color: colors.text.muted },
                  ]}>
                    {range}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Clean Address Copy Row (Gas & Yield Removed) */}
          <View style={[styles.heroFooterRow, { borderTopColor: cardBorder, justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.miniDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.heroFooterLabel}>
                {currentChainObj.name} Mainnet Active
              </Text>
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
              <SendActionIcon color={isDark ? '#000000' : '#FFFFFF'} size={24} />
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Send</Text>
          </SpringButton>

          {/* Receive */}
          <SpringButton onPress={() => navigation.navigate('Receive')} style={styles.actionBtnItem}>
            <View style={[styles.actionIconCircle, { backgroundColor: monoMutedSurface }]}>
              <ReceiveActionIcon color={monoPrimary} size={24} />
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Receive</Text>
          </SpringButton>

          {/* Swap */}
          <SpringButton onPress={() => navigation.navigate('Swap')} style={styles.actionBtnItem}>
            <View style={[styles.actionIconCircle, { backgroundColor: monoMutedSurface }]}>
              <SwapActionIcon color={monoPrimary} size={24} />
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Swap</Text>
          </SpringButton>

          {/* Buy */}
          <SpringButton onPress={() => navigation.navigate('Buy')} style={styles.actionBtnItem}>
            <View style={[styles.actionIconCircle, { backgroundColor: monoMutedSurface }]}>
              <BuyActionIcon color={monoPrimary} size={24} />
            </View>
            <Text style={[styles.actionBtnLabel, { color: colors.text.primary }]}>Buy</Text>
          </SpringButton>
        </View>

        {/* ======================================================== */}
        {/* ASSET OVERVIEW SECTION (ASSETS UP)                       */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Assets</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Portfolio', { initialTab: 'assets' })}
            style={[styles.viewAllBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAllBoxText, { color: colors.text.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.assetListCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {dynamicAssets.map((asset, index) => {
            const isLast = index === dynamicAssets.length - 1;
            return (
              <SpringButton
                key={asset.symbol}
                onPress={() => navigation.navigate('TokenDetail', { ...asset, price: asset.price, usd: asset.usd })}
                style={[styles.assetRowItem, !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder }]}
              >
                <View style={styles.assetLeftCol}>
                  <TokenLogo symbol={asset.symbol} size={36} />
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
        {/* MARKET MOVERS: TOP GAINERS & TOP LOSERS (MOVERS DOWN)    */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>MARKET MOVERS</Text>
          <View style={[styles.moversSegmentPill, { backgroundColor: monoMutedSurface }]}>
            <TouchableOpacity
              onPress={() => setMoversTab('gainers')}
              style={[
                styles.moversTabBtn,
                moversTab === 'gainers' && { backgroundColor: monoPrimary },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.moversTabText,
                moversTab === 'gainers'
                  ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                  : { color: colors.text.muted }
              ]}>
                Gainers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMoversTab('losers')}
              style={[
                styles.moversTabBtn,
                moversTab === 'losers' && { backgroundColor: monoPrimary },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.moversTabText,
                moversTab === 'losers'
                  ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                  : { color: colors.text.muted }
              ]}>
                Losers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.assetListCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {(moversTab === 'gainers' ? TOP_GAINERS : TOP_LOSERS).map((token, index, arr) => {
            const isLast = index === arr.length - 1;
            return (
              <SpringButton
                key={token.symbol}
                onPress={() => navigation.navigate('TokenDetail', { ...token, usd: token.price })}
                style={[styles.assetRowItem, !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder }]}
              >
                <View style={styles.assetLeftCol}>
                  <TokenLogo symbol={token.symbol} size={36} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.assetTitleText, { color: colors.text.primary }]}>{token.name}</Text>
                    <Text style={styles.assetSubtitleText}>{token.symbol}</Text>
                  </View>
                </View>

                <View style={styles.assetRightCol}>
                  <Text style={[styles.assetValueText, { color: colors.text.primary }]}>{token.price}</Text>
                  <View style={[
                    styles.moverBadge,
                    { backgroundColor: token.positive ? (isDark ? 'rgba(34, 197, 94, 0.16)' : '#DCFCE7') : (isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEE2E2') }
                  ]}>
                    <Text style={[
                      styles.moverChangeText,
                      { color: token.positive ? '#22C55E' : '#EF4444', fontWeight: '700' }
                    ]}>
                      {token.change}
                    </Text>
                  </View>
                </View>
              </SpringButton>
            );
          })}
        </View>

        {/* ======================================================== */}
        {/* CURA COMMUNITY: OFFICIAL BROADCASTS & NEWS             */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>COMMUNITY & NEWS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Community')}>
            <Text style={[styles.sectionActionText, { color: colors.text.primary }]}>Community →</Text>
          </TouchableOpacity>
        </View>

        <SpringButton
          onPress={() => navigation.navigate('Community')}
          style={[styles.pulseNewsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
          <View style={styles.pulseCardTop}>
            <View style={[styles.sourceBadge, { backgroundColor: monoMutedSurface }]}>
              <Text style={[styles.sourceBadgeText, { color: colors.text.primary }]}>Bloomberg Crypto</Text>
            </View>
            <Text style={styles.pulseTimeText}>8m ago</Text>
          </View>
          <Text style={[styles.pulseTitleText, { color: colors.text.primary }]}>
            Bitcoin ETF Net Inflows Cross $1.2B As Global Asset Allocators Rotate Into Digital Assets
          </Text>
          <View style={styles.pulseCardFooter}>
            <Text style={styles.pulseMetaText}>Institutional Market Flow • 48 comments</Text>
            <Text style={[styles.pulseReadMore, { color: colors.text.primary }]}>Join Discussion</Text>
          </View>
        </SpringButton>

        {/* ======================================================== */}
        {/* RECENT ACTIVITY SECTION                                  */}
        {/* ======================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>RECENT ACTIVITY</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Portfolio', { initialTab: 'transactions' })}>
            <Text style={[styles.sectionActionText, { color: colors.text.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.assetListCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {(transactions && transactions.length > 0 ? transactions.slice(0, 3) : [
            {
              id: 'tx-fallback-1',
              type: 'swap',
              asset: 'ETH → USDC',
              amount: '12.5',
              receivedAmount: '42750.00',
              value: '$42,750.00',
              time: '12m ago',
              status: 'confirmed',
              hash: '0xabc1234567890abcdef1234567890abcdef1234',
              timestamp: Date.now() - 720000,
            },
            {
              id: 'tx-fallback-2',
              type: 'received',
              asset: 'ETH',
              amount: '0.412',
              value: '$1,409.25',
              time: '3h ago',
              status: 'confirmed',
              hash: '0xdef4567890abcdef1234567890abcdef12345678',
              timestamp: Date.now() - 10800000,
            },
          ]).map((txItem: any, index: number, arr: any[]) => {
            const isLast = index === arr.length - 1;
            const isSent = txItem.type === 'sent';
            const isSwap = txItem.type === 'swap';

            return (
              <SpringButton
                key={txItem.id || `home-tx-${index}`}
                onPress={() => navigation.navigate('TransactionDetail', { tx: txItem })}
                style={[
                  styles.activityItemRow,
                  !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder }
                ]}
              >
                <View style={[styles.activityIconCircle, { backgroundColor: monoMutedSurface }]}>
                  {isSwap ? (
                    <SwapActionIcon color={monoPrimary} size={15} />
                  ) : isSent ? (
                    <SendActionIcon color={monoPrimary} size={15} />
                  ) : (
                    <ReceiveActionIcon color={monoPrimary} size={15} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.activityTitle, { color: colors.text.primary }]}>
                    {isSwap ? 'Smart Aggregator Swap' : isSent ? 'Transfer Sent' : 'Transfer Received'}
                  </Text>
                  <Text style={styles.activitySub}>
                    {txItem.asset} • {txItem.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.activityAmount, { color: colors.text.primary }]}>
                    {isSent ? `-${txItem.amount}` : isSwap ? `+${txItem.receivedAmount || txItem.amount}` : `+${txItem.amount}`} {txItem.asset.includes('→') ? 'USDC' : txItem.asset}
                  </Text>
                  <Text style={styles.activityTime}>{txItem.time}</Text>
                </View>
              </SpringButton>
            );
          })}
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
            <Text style={[styles.modalSheetTitle, { color: colors.text.primary }]}>Select Blockchain</Text>

            <View style={{ marginTop: 14 }}>
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
                      <TokenLogo symbol={chain.symbol} size={28} />
                      <Text style={[styles.chainNameText, { color: colors.text.primary, marginLeft: 12, fontSize: 16, fontWeight: '600' }]}>
                        {chain.name}
                      </Text>
                    </View>
                    {isSelected && <CheckIcon color={monoPrimary} size={18} />}
                  </SpringButton>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* ALL AVAILABLE ASSETS DRAWER (POPPING FROM DOWN)          */}
      {/* ======================================================== */}
      <Modal
        visible={showAssetsDrawer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssetsDrawer(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowAssetsDrawer(false)} />
          <View style={[styles.drawerSheetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.drawerHeaderRow}>
              <TouchableOpacity
                onPress={() => setShowAssetsDrawer(false)}
                style={[styles.drawerBackBtn, { backgroundColor: monoMutedSurface }]}
                activeOpacity={0.7}
              >
                <ArrowLeftIcon color={colors.text.primary} size={20} />
              </TouchableOpacity>
              <Text style={[styles.drawerHeaderTitle, { color: colors.text.primary }]}>All Available Assets</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {dynamicAssets.map((asset, index, arr) => {
                const isLast = index === arr.length - 1;
                return (
                  <SpringButton
                    key={`drawer-${asset.symbol}`}
                    onPress={() => {
                      setShowAssetsDrawer(false);
                      navigation.navigate('TokenDetail', { ...asset, price: asset.price, usd: asset.usd });
                    }}
                    style={[styles.assetRowItem, !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder }]}
                  >
                    <View style={styles.assetLeftCol}>
                      <TokenLogo symbol={asset.symbol} size={40} />
                      <View style={{ marginLeft: 14 }}>
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* WALLET SWITCHER & CREATION MODAL (LIMIT 4 WALLETS)       */}
      {/* ======================================================== */}
      <Modal
        visible={showWalletModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowWalletModal(false)} />
          <View style={[styles.drawerSheetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.drawerHeaderRow}>
              <TouchableOpacity
                onPress={() => setShowWalletModal(false)}
                style={[styles.drawerBackBtn, { backgroundColor: monoMutedSurface }]}
                activeOpacity={0.7}
              >
                <ArrowLeftIcon color={colors.text.primary} size={20} />
              </TouchableOpacity>
              <Text style={[styles.drawerHeaderTitle, { color: colors.text.primary }]}>
                Choose Wallet ({wallets.length}/4)
              </Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {wallets.map((w, idx) => {
                const isActive = idx === activeWalletIndex;
                return (
                  <TouchableOpacity
                    key={w.id}
                    onPress={async () => {
                      await switchWallet(idx);
                      setShowWalletModal(false);
                    }}
                    style={[
                      styles.walletItemCard,
                      { backgroundColor: monoMutedSurface, borderColor: isActive ? monoPrimary : cardBorder },
                    ]}
                    activeOpacity={0.75}
                  >
                    <View style={styles.walletItemLeft}>
                      <View style={[styles.walletItemIconWrap, { backgroundColor: cardBg }]}>
                        <WalletHeaderIcon color={monoPrimary} size={18} />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.walletItemName, { color: colors.text.primary }]}>{w.name}</Text>
                        <Text style={styles.walletItemAddr}>
                          {w.address ? `${w.address.slice(0, 8)}...${w.address.slice(-6)}` : '0x...'}
                        </Text>
                      </View>
                    </View>

                    {isActive && (
                      <View style={[styles.activeCheckBadge, { backgroundColor: monoPrimary }]}>
                        <CheckIcon color={isDark ? '#000000' : '#FFFFFF'} size={14} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Create New Wallet Button */}
            <TouchableOpacity
              onPress={async () => {
                if (wallets.length >= 4) return;
                const res = await createAdditionalWallet();
                if (res.success) {
                  setShowWalletModal(false);
                }
              }}
              disabled={wallets.length >= 4}
              style={[
                styles.createWalletBtn,
                { backgroundColor: monoPrimary },
                wallets.length >= 4 && { opacity: 0.4 },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.createWalletBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                {wallets.length >= 4 ? 'Wallet Limit Reached (4/4)' : '＋ Create New Wallet'}
              </Text>
            </TouchableOpacity>
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
    paddingBottom: 12,
  },
  walletSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 160,
  },
  walletSelectorName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingHorizontal: 13,
    borderRadius: 21,
    borderWidth: 1,
    gap: 6,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '800',
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
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
    maxWidth: 130,
  },
  chainStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  chainSelectorText: {
    fontSize: 12.5,
    fontWeight: '700',
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
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 15,
    marginBottom: 14,
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
  heroBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  eyeBtnBesideBalance: {
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 2,
  },
  deltaPeriodText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deltaPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  deltaPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sparklineContainer: {
    height: 74,
    marginVertical: 4,
  },
  timeRangeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 2.5,
    marginTop: 4,
    marginBottom: 2,
  },
  timeRangeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 8,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    includeFontPadding: false,
  },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    paddingTop: 10,
    marginTop: 8,
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
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  actionBtnItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62,
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
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconGlyph: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionBtnLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    includeFontPadding: false,
    marginTop: 6,
    textAlign: 'center',
  },
  // MARKET MOVERS (GAINERS & LOSERS)
  moversSegmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 2.5,
    gap: 2,
  },
  moversTabBtn: {
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moversTabText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    includeFontPadding: false,
  },
  moverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moverAvatarText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  moverBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  moverChangeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  // SECTION HEADERS
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headingArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  viewAllBox: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  viewAllBoxText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // ASSET LIST CARD
  assetListCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  assetRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  assetLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  assetSubtitleText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  assetRightCol: {
    alignItems: 'flex-end',
  },
  assetValueText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  assetChangeText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  // CURA PULSE
  pulseNewsCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 20,
  },
  pulseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pulseTimeText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  pulseTitleText: {
    fontSize: 15.5,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  pulseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseMetaText: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '500',
  },
  pulseReadMore: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  // RECENT ACTIVITY
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
    fontWeight: '700',
  },
  activitySub: {
    color: '#64748B',
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  activityTime: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
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
  drawerSheetCard: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    padding: 22,
    paddingBottom: 40,
    width: '100%',
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  walletItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  walletItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletItemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletItemName: {
    fontSize: 15,
    fontWeight: '800',
  },
  walletItemAddr: {
    color: '#858585',
    fontSize: 11.5,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  activeCheckBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createWalletBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  createWalletBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
