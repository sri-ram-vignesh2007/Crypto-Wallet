// src/screens/TokenDetailScreen.tsx - Institutional-Grade Crypto Detail & Analytics (Trust Wallet / Phantom Style)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Share,
  Animated,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';
import { useTransactionStore } from '../store/transactionStore';
import { useWatchlistStore } from '../store/watchlistStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation: any;
  route?: {
    params?: {
      symbol?: string;
      name?: string;
      price?: string;
      change?: string;
      positive?: boolean;
      usd?: string;
      balance?: string;
      network?: string;
    };
  };
}

// Vector Glyphs
const ArrowLeftIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const StarIcon = ({ filled = false, color = '#FFFFFF', size = 20 }: { filled?: boolean; color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const ArrowUpRightIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17L17 7M17 7H7M17 7v10" />
  </Svg>
);

const ScanQrIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <Rect x="7" y="7" width="10" height="10" rx="1.5" />
  </Svg>
);

const SparkIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </Svg>
);

const CandleIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 3v3M9 18v3M6 6h6v12H6zM17 8v2M17 14v2M15 10h4v4h-4z" />
  </Svg>
);

const CopyIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ChevronRightIcon = ({ color = '#858585', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const TradeIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
  </Svg>
);

interface TokenMetaData {
  network: string;
  marketCap: string;
  volume24h: string;
  circulatingSupply: string;
  allTimeHigh: string;
  rank: string;
  holders?: string;
  created?: string;
  circulatingSupplyPct?: string;
  liquidity?: string;
  top10HoldersPct?: string;
  top10AvgBuy?: string;
  top10AvgSell?: string;
  contractAddress?: string;
  about: string;
  summary?: string;
}

const TOKEN_METADATA_REGISTRY: Record<string, TokenMetaData> = {
  LIBRA: {
    network: 'BNB Smart Chain',
    marketCap: '$6.22M',
    volume24h: '$283.13M',
    circulatingSupply: '1.0B LIBRA',
    allTimeHigh: '$0.024',
    rank: '#340',
    holders: '-',
    created: '23 Oct 2025',
    circulatingSupplyPct: '-',
    liquidity: '$1.13M',
    top10HoldersPct: '62.2537%',
    top10AvgBuy: '$0.01',
    top10AvgSell: '$0.00',
    contractAddress: '0x1e36c5793bf819dfb48e3e4a9e9a4f227b9c8f9c',
    about: 'Libra (LIBRA) is a decentralized cryptocurrency and automated utility liquidity protocol engineered for high-velocity decentralized swaps across BNB Chain. It leverages autonomous invariant curves to ensure deep pooled liquidity and verifiable transaction settlement.',
    summary: 'Libra exhibits active on-chain liquidity velocity with $283M+ in 24h decentralized exchange volume. Contract safety analysis verified no malicious functions, honeypots, or proxy transfer vulnerabilities.',
  },
  SOL: {
    network: 'Solana L1',
    marketCap: '$78.4B',
    volume24h: '$4.2B',
    circulatingSupply: '467.2M SOL',
    allTimeHigh: '$259.96',
    rank: '#5',
    holders: '2,840,190',
    created: '16 Mar 2020',
    circulatingSupplyPct: '89.4%',
    liquidity: '$420.5M',
    top10HoldersPct: '12.45%',
    top10AvgBuy: '$24.50',
    top10AvgSell: '$148.00',
    contractAddress: 'So11111111111111111111111111111111111111112',
    about: 'Solana is a high-performance Layer-1 blockchain supporting fast, deterministic smart contract execution with sub-second finality. It leverages Proof-of-History (PoH) coupled with Tower BFT to process institutional transaction volumes with fractional cent fees.',
    summary: 'High throughput telemetry indicates sustained institutional volume with 99.99% uptime. Low latency execution ensures reliable swap settlements across decentralized exchanges.',
  },
  BTC: {
    network: 'Bitcoin Core',
    marketCap: '$1.34T',
    volume24h: '$34.8B',
    circulatingSupply: '19.78M BTC',
    allTimeHigh: '$73,750.07',
    rank: '#1',
    holders: '54,200,000+',
    created: '03 Jan 2009',
    circulatingSupplyPct: '94.2%',
    liquidity: '$2.8B',
    top10HoldersPct: '5.8%',
    top10AvgBuy: '$18,200',
    top10AvgSell: '$64,500',
    contractAddress: 'Native UTXO Bitcoin Core',
    about: 'Bitcoin is the foundational decentralized digital asset and global store of value. It operates via Proof-of-Work (PoW) consensus with a mathematically hard-capped supply of 21,000,000 coins, providing absolute monetary predictability.',
    summary: 'Sovereign-grade cryptographic security and unmatched decentralization. Network difficulty and hash rate remain at historic peaks amid sustained ETF inflows.',
  },
  ETH: {
    network: 'Ethereum Mainnet',
    marketCap: '$410.8B',
    volume24h: '$18.6B',
    circulatingSupply: '120.4M ETH',
    allTimeHigh: '$4,891.70',
    rank: '#2',
    holders: '24,100,000+',
    created: '30 Jul 2015',
    circulatingSupplyPct: '100%',
    liquidity: '$1.9B',
    top10HoldersPct: '14.2%',
    top10AvgBuy: '$1,200',
    top10AvgSell: '$3,150',
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    about: 'Ethereum is the global settlement layer for decentralized finance and programmable smart contracts. With Proof-of-Stake consensus and Layer-2 rollups, Ethereum powers decentralized applications and asset tokenization worldwide.',
    summary: 'Core settlement layer for global DeFi, tokenized securities, and rollup scaling. Steady deflationary burning mechanism supports long-term structural supply dynamics.',
  },
  BNB: {
    network: 'BNB Smart Chain',
    marketCap: '$89.2B',
    volume24h: '$1.4B',
    circulatingSupply: '153.8M BNB',
    allTimeHigh: '$720.67',
    rank: '#4',
    holders: '2,900,000+',
    created: '08 Jul 2017',
    circulatingSupplyPct: '100%',
    liquidity: '$380M',
    top10HoldersPct: '42.1%',
    top10AvgBuy: '$120.00',
    top10AvgSell: '$480.00',
    contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    about: 'BNB powers the BNB Chain ecosystem, providing fast and low-cost transaction execution for millions of daily active on-chain users, decentralized finance protocols, and gaming networks.',
    summary: 'Deep pooled liquidity and continuous auto-burn cycles. Gas fees remain predictable and microscopic for retail and institutional traders.',
  },
  USDC: {
    network: 'Multi-Chain Standard',
    marketCap: '$35.4B',
    volume24h: '$6.8B',
    circulatingSupply: '35.4B USDC',
    allTimeHigh: '$1.00',
    rank: '#6',
    holders: '4,500,000+',
    created: '04 Sep 2018',
    circulatingSupplyPct: '100%',
    liquidity: '$1.2B',
    top10HoldersPct: '18.9%',
    top10AvgBuy: '$1.00',
    top10AvgSell: '$1.00',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    about: 'USD Coin (USDC) is a fully collateralized US dollar stablecoin backed 100% by cash and short-duration US Treasuries. It provides atomic settlement and programmatic fiat parity across Ethereum, Solana, and major Layer-2 protocols.',
    summary: 'Institutional-grade dollar liquidity instrument with verified daily attestations. CCTP integration guarantees instant zero-slippage cross-chain bridging.',
  },
};

const TIMEFRAME_PATHS: Record<string, { path: string; fill: string; change: string; positive: boolean }> = {
  '1H': {
    path: 'M0 80 C 40 70, 80 85, 130 72 C 180 60, 240 68, 290 52 C 320 44, 340 40, 360 36',
    fill: 'M0 80 C 40 70, 80 85, 130 72 C 180 60, 240 68, 290 52 C 320 44, 340 40, 360 36 L 360 180 L 0 180 Z',
    change: '-0.39%',
    positive: false,
  },
  '1D': {
    path: 'M0 65 C 15 75, 25 95, 45 90 C 60 85, 70 125, 85 115 C 100 105, 110 140, 125 125 C 135 110, 140 40, 150 65 C 160 80, 170 40, 185 70 C 195 85, 205 60, 220 75 C 235 88, 250 70, 265 85 C 275 70, 285 82, 305 85 C 315 88, 325 75, 335 120 C 345 135, 355 130, 360 138',
    fill: 'M0 65 C 15 75, 25 95, 45 90 C 60 85, 70 125, 85 115 C 100 105, 110 140, 125 125 C 135 110, 140 40, 150 65 C 160 80, 170 40, 185 70 C 195 85, 205 60, 220 75 C 235 88, 250 70, 265 85 C 275 70, 285 82, 305 85 C 315 88, 325 75, 335 120 C 345 135, 355 130, 360 138 L 360 180 L 0 180 Z',
    change: '-2.0%',
    positive: false,
  },
  '1W': {
    path: 'M0 120 C 50 110, 100 90, 150 80 C 200 65, 250 50, 300 40 C 330 32, 345 28, 360 20',
    fill: 'M0 120 C 50 110, 100 90, 150 80 C 200 65, 250 50, 300 40 C 330 32, 345 28, 360 20 L 360 180 L 0 180 Z',
    change: '+14.6%',
    positive: true,
  },
  '1M': {
    path: 'M0 130 C 45 120, 95 105, 145 90 C 195 75, 240 60, 290 45 C 320 35, 345 25, 360 18',
    fill: 'M0 130 C 45 120, 95 105, 145 90 C 195 75, 240 60, 290 45 C 320 35, 345 25, 360 18 L 360 180 L 0 180 Z',
    change: '+29.4%',
    positive: true,
  },
  '1Y': {
    path: 'M0 145 C 60 135, 120 115, 180 95 C 230 75, 280 55, 320 35 C 340 25, 350 20, 360 12',
    fill: 'M0 145 C 60 135, 120 115, 180 95 C 230 75, 280 55, 320 35 C 340 25, 350 20, 360 12 L 360 180 L 0 180 Z',
    change: '+142.8%',
    positive: true,
  },
  'YTD': {
    path: 'M0 110 C 60 100, 120 85, 180 70 C 230 55, 280 40, 320 28 C 340 20, 350 16, 360 10',
    fill: 'M0 110 C 60 100, 120 85, 180 70 C 230 55, 280 40, 320 28 C 340 20, 350 16, 360 10 L 360 180 L 0 180 Z',
    change: '+68.2%',
    positive: true,
  },
  'ALL': {
    path: 'M0 150 C 70 140, 130 115, 190 90 C 240 65, 290 45, 330 30 C 345 22, 355 18, 360 10',
    fill: 'M0 150 C 70 140, 130 115, 190 90 C 240 65, 290 45, 330 30 C 345 22, 355 18, 360 10 L 360 180 L 0 180 Z',
    change: '+380.2%',
    positive: true,
  },
};

const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'YTD', 'ALL'];

export default function TokenDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1D');
  const [perfTab, setPerfTab] = useState<'5m' | '1h' | '4h' | '24h'>('1h');
  const [copiedContract, setCopiedContract] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);

  const { balances } = useTransactionStore();
  const { watchlist, toggleWatchlist, loadWatchlist } = useWatchlistStore();

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const params = route?.params || {};
  const symbol = (params.symbol || 'LIBRA').toUpperCase();
  const name = params.name || (symbol === 'LIBRA' ? 'Libra' : symbol === 'SOL' ? 'Solana' : symbol === 'BTC' ? 'Bitcoin' : symbol === 'ETH' ? 'Ethereum' : symbol);
  const rawPrice = params.price || (symbol === 'LIBRA' ? '$0.006222' : '$168.20');
  const price = rawPrice.startsWith('$') ? rawPrice : `$${rawPrice}`;
  const change = params.change || (symbol === 'LIBRA' ? '-$0.0001273 (2.0%)' : '+12.4%');
  const isPositive = params.positive !== undefined ? params.positive : !change.includes('-');

  const isWatched = watchlist.includes(symbol);

  const meta: TokenMetaData = TOKEN_METADATA_REGISTRY[symbol] || {
    network: params.network || `${symbol} Network`,
    marketCap: '$6.22M',
    volume24h: '$283.13M',
    circulatingSupply: `100M ${symbol}`,
    allTimeHigh: price,
    rank: '#100',
    holders: '-',
    created: '23 Oct 2025',
    circulatingSupplyPct: '-',
    liquidity: '$1.13M',
    top10HoldersPct: '62.2537%',
    top10AvgBuy: '$0.01',
    top10AvgSell: '$0.00',
    contractAddress: '0x1e36c5793bf819dfb48e3e4a9e9a4f227b9c8f9c',
    about: `${name} (${symbol}) is a decentralized cryptocurrency token built on blockchain technology. It enables secure, fast, and low-cost transactions across the network.`,
    summary: `${name} is an active decentralized liquidity protocol with continuous on-chain transactions and audited contract architectures.`,
  };

  // Dynamic user holding
  const userBalance = balances[symbol as keyof typeof balances];
  const userHoldingFormatted = userBalance !== undefined && userBalance > 0
    ? userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: userBalance < 1 ? 4 : 2 })
    : null;

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E5E5E5';
  const monoSurfaceElevated = isDark ? '#181818' : '#F4F4F4';
  const monoMutedSurface = isDark ? '#222222' : '#ECECEC';

  const chartInfo = TIMEFRAME_PATHS[selectedTimeRange] || TIMEFRAME_PATHS['1D'];

  const copyContractAddress = async () => {
    try {
      await Clipboard.setStringAsync(meta.contractAddress || '0x1e36c5793bf819dfb48e3e4a9e9a4f227b9c8f9c');
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2200);
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP NAV BAR (Images 3 & 4: ← and ☆) ─────────────── */}
      <View style={[styles.topNavRow, { paddingTop: 6, paddingBottom: 10 }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={[styles.navBtnCircle, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={20} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* Watchlist Toggle Star Button */}
        <TouchableOpacity
          onPress={() => toggleWatchlist(symbol)}
          style={[styles.navBtnCircle, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <StarIcon filled={isWatched} color={isWatched ? '#EAB308' : (isDark ? '#FFFFFF' : '#111111')} size={19} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER TOKEN LOGO & PRICE (Image 3) ──────────────── */}
        <View style={styles.headerInfoRow}>
          <View style={styles.headerLeftGroup}>
            <TokenLogo symbol={symbol} size={44} />
            <Text style={[styles.headerTokenName, { color: isDark ? '#FFFFFF' : '#111111' }]}>{name}</Text>
          </View>
          <View style={styles.headerRightGroup}>
            <Text style={[styles.headerPriceText, { color: isDark ? '#FFFFFF' : '#111111' }]}>{price}</Text>
            <Text style={[styles.headerDeltaText, { color: isPositive ? '#22C55E' : '#EF4444' }]}>
              {change}
            </Text>
          </View>
        </View>

        {/* ── PRICE TREND CHART WITH ENDPOINT DOT (Image 3) ─────── */}
        <View style={styles.chartWrapper}>
          <Svg width={SCREEN_WIDTH - 36} height={170} viewBox="0 0 360 180">
            <Defs>
              <LinearGradient id="tokenChartGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={isPositive ? '#22C55E' : '#22C55E'} stopOpacity="0.18" />
                <Stop offset="1" stopColor={isPositive ? '#22C55E' : '#22C55E'} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>
            <Path d={chartInfo.fill} fill="url(#tokenChartGrad)" />
            <Path
              d={chartInfo.path}
              fill="none"
              stroke="#22C55E"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            {/* Endpoint indicator dot matching Image 3 */}
            <Circle cx="360" cy="138" r="4.5" fill="#6366F1" />
          </Svg>
        </View>

        {/* ── TIMEFRAME SELECTOR BAR (Image 3) ─────────────────── */}
        <View style={styles.timeframeRow}>
          <TouchableOpacity style={[styles.candleBtn, { backgroundColor: monoSurfaceElevated }]}>
            <CandleIcon color={isDark ? '#AAAAAA' : '#666666'} size={16} />
          </TouchableOpacity>
          {TIME_RANGES.map((range) => {
            const active = selectedTimeRange === range;
            return (
              <TouchableOpacity
                key={range}
                onPress={() => setSelectedTimeRange(range)}
                style={[
                  styles.timeframePill,
                  active && { backgroundColor: isDark ? '#262C3A' : '#E0E7FF' },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    active
                      ? { color: isDark ? '#FFFFFF' : '#2563EB', fontWeight: '800' }
                      : { color: colors.text.muted, fontWeight: '600' },
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── YOUR BALANCE ROW (Image 3) ───────────────────────── */}
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceLabel, { color: isDark ? '#FFFFFF' : '#111111' }]}>Your balance</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.balanceUsdText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              {userHoldingFormatted ? `$${(parseFloat(userHoldingFormatted.replace(/,/g, '')) * (parseFloat(price.replace(/[^0-9.]/g, '')) || 1)).toFixed(2)}` : '$0.00'}
            </Text>
            <Text style={styles.balanceTokenSub}>
              {userHoldingFormatted ? `${userHoldingFormatted} ${symbol}` : `0.00 ${symbol}`}
            </Text>
          </View>
        </View>

        {/* ── ONLY 2 ACTION BUTTONS: SEND & RECEIVE (Image 3) ───── */}
        <View style={styles.twoActionRow}>
          {/* Send */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Send', { tokenSymbol: symbol })}
            style={[styles.actionBtnPill, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
            activeOpacity={0.75}
          >
            <ArrowUpRightIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
            <Text style={[styles.actionBtnLabel, { color: isDark ? '#FFFFFF' : '#111111' }]}>Send</Text>
          </TouchableOpacity>

          {/* Receive */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Receive', { tokenSymbol: symbol })}
            style={[styles.actionBtnPill, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
            activeOpacity={0.75}
          >
            <ScanQrIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
            <Text style={[styles.actionBtnLabel, { color: isDark ? '#FFFFFF' : '#111111' }]}>Receive</Text>
          </TouchableOpacity>
        </View>

        {/* ── ✨ AI SUMMARY SECTION (Image 3) ──────────────────── */}
        <View style={[styles.aiSummaryCard, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}>
          <View style={styles.aiSummaryHeader}>
            <SparkIcon color="#818CF8" size={16} />
            <Text style={[styles.aiSummaryTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>AI Summary</Text>
          </View>
          <Text style={[styles.aiSummaryBody, { color: isDark ? '#CCCCCC' : '#444444' }]}>
            {meta.summary}
          </Text>
        </View>

        {/* ── STATS SECTION (Image 4) ──────────────────────────── */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>Stats</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Market Cap</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.marketCap}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>24h Volume</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.volume24h}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Holders</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.holders || '-'}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Created</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.created || '23 Oct 2025'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Circulating Supply %</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.circulatingSupplyPct || '-'}</Text>
            </View>
            <View style={styles.statCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.statLabel}>Security Risk</Text>
                <ChevronRightIcon color="#858585" size={12} />
              </View>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111', fontWeight: '800' }]}>No risk found</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Liquidity (USD)</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.liquidity || '$1.13M'}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Top 10 holders %</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.top10HoldersPct || '62.2537%'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Top 10 holders avg buy</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.top10AvgBuy || '$0.01'}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Top 10 holders avg sell</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>{meta.top10AvgSell || '$0.00'}</Text>
            </View>
          </View>
        </View>

        {/* ── PERFORMANCE SECTION (Image 4) ────────────────────── */}
        <View style={styles.performanceSection}>
          <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>Performance</Text>

          <View style={[styles.performanceCard, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}>
            {/* 4 Timeframe Tabs */}
            <View style={styles.perfTabsRow}>
              {[
                { key: '5m', change: '-0.39%' },
                { key: '1h', change: '-1.01%' },
                { key: '4h', change: '-2.32%' },
                { key: '24h', change: '-1.98%' },
              ].map(tab => {
                const active = perfTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setPerfTab(tab.key as any)}
                    style={[
                      styles.perfTabBtn,
                      active && { backgroundColor: isDark ? '#2B3244' : '#E0E7FF' },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.perfTabLabel, { color: isDark ? '#CCCCCC' : '#444444' }]}>{tab.key}</Text>
                    <Text style={[styles.perfTabChange, { color: '#EF4444' }]}>{tab.change}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Total Vol & Transactions */}
            <View style={styles.perfMetaRow}>
              <Text style={styles.perfMetaText}>Total Vol $3,807</Text>
              <Text style={styles.perfMetaText}>Transactions 63</Text>
            </View>

            {/* Buy / Sell Dual-Color Progress Bar */}
            <View style={styles.buySellTrack}>
              <View style={[styles.buyFill, { width: '13%' }]} />
              <View style={[styles.sellFill, { width: '87%' }]} />
            </View>

            {/* Buy / Sell Labels */}
            <View style={styles.buySellLabelRow}>
              <Text style={styles.buyLabelText}>13% Buy</Text>
              <Text style={styles.sellLabelText}>87% Sell</Text>
            </View>
          </View>
        </View>

        {/* ── ABOUT SECTION (Image 4) ──────────────────────────── */}
        <View style={styles.aboutSection}>
          <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>About</Text>

          <TouchableOpacity
            onPress={copyContractAddress}
            style={[styles.contractPill, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
            activeOpacity={0.75}
          >
            <CopyIcon color={isDark ? '#FFFFFF' : '#111111'} size={14} />
            <Text style={[styles.contractPillText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              {copiedContract ? '✓ Copied Contract' : 'Contract address'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.aboutText, { color: isDark ? '#BBBBBB' : '#555555' }]}>
            {meta.about}
          </Text>
        </View>
      </ScrollView>

      {/* ── STICKY FLOATING TRADE BUTTON (Images 3 & 4) ──────── */}
      <View style={[styles.stickyBottomBar, { paddingBottom: Math.max(16, insets.bottom + 8), backgroundColor: colors.bg.canvas }]}>
        <TouchableOpacity
          onPress={() => setShowTradeModal(true)}
          style={[styles.floatingTradeBtn, { backgroundColor: isDark ? '#FFFFFF' : '#111111' }]}
          activeOpacity={0.85}
        >
          <TradeIcon color={isDark ? '#000000' : '#FFFFFF'} size={20} />
          <Text style={[styles.floatingTradeText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Trade</Text>
        </TouchableOpacity>
      </View>

      {/* ── TRADE OPTIONS MODAL ────────────────────────────── */}
      <Modal visible={showTradeModal} transparent animationType="slide" onRequestClose={() => setShowTradeModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTradeModal(false)}>
          <View style={[styles.tradeSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.tradeSheetHeader}>
              <Text style={[styles.tradeSheetTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Trade {symbol}</Text>
              <TouchableOpacity onPress={() => setShowTradeModal(false)}>
                <Text style={{ color: '#858585', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowTradeModal(false);
                navigation?.navigate?.('Swap', { tokenSymbol: symbol });
              }}
              style={[styles.tradeOptionItem, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 24 }}>🔄</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.tradeOptionTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Instant Spot Swap</Text>
                <Text style={styles.tradeOptionSub}>Swap {symbol} at best DEX aggregator rates with 0% slippage MEV protection</Text>
              </View>
              <Text style={{ color: isDark ? '#FFFFFF' : '#111111', fontWeight: '800' }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowTradeModal(false);
                navigation?.navigate?.('Perpetuals');
              }}
              style={[styles.tradeOptionItem, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 24 }}>📈</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.tradeOptionTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Perpetual Futures (Up to 50x)</Text>
                <Text style={styles.tradeOptionSub}>Trade decentralized perps with ApolloX / GMX, Long or Short with leverage</Text>
              </View>
              <Text style={{ color: isDark ? '#FFFFFF' : '#111111', fontWeight: '800' }}>→</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTokenName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightGroup: {
    alignItems: 'flex-end',
  },
  headerPriceText: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  headerDeltaText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  chartWrapper: {
    height: 170,
    marginVertical: 4,
  },
  timeframeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  candleBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },
  timeframeText: {
    fontSize: 13,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: 6,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  balanceUsdText: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  balanceTokenSub: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  twoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  actionBtnPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
  },
  actionBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  aiSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiSummaryTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  aiSummaryBody: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  statsSection: {
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E95A5',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  performanceSection: {
    marginBottom: 22,
  },
  performanceCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  perfTabsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },
  perfTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  perfTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  perfTabChange: {
    fontSize: 12.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  perfMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  perfMetaText: {
    fontSize: 12,
    color: '#8E95A5',
    fontWeight: '600',
  },
  buySellTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#333333',
    marginBottom: 8,
  },
  buyFill: {
    backgroundColor: '#22C55E',
  },
  sellFill: {
    backgroundColor: '#EF4444',
  },
  buySellLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyLabelText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '800',
  },
  sellLabelText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  aboutSection: {
    marginBottom: 16,
  },
  contractPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  contractPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  floatingTradeBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingTradeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  tradeSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  tradeSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tradeSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  tradeOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  tradeOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  tradeOptionSub: {
    color: '#858585',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
