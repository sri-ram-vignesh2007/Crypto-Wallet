// src/screens/TokenDetailScreen.tsx - Institutional-Grade Crypto Detail & Analytics (Trust Wallet / Phantom Style)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';
import { useTransactionStore } from '../store/transactionStore';

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

// Vector Navigation & Action Icons
const ArrowLeftIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const ShareIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </Svg>
);

const ArrowUpRightIcon = ({ color, size = 19 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17L17 7M17 7H7M17 7v10" />
  </Svg>
);

const ArrowDownLeftIcon = ({ color, size = 19 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 7L7 17M7 17h10M7 17V7" />
  </Svg>
);

const SwapIcon = ({ color, size = 19 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
  </Svg>
);

const PlusIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

const ChevronRightIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

interface TokenMetaData {
  network: string;
  marketCap: string;
  volume24h: string;
  circulatingSupply: string;
  allTimeHigh: string;
  rank: string;
  about: string;
  news: {
    id: string;
    source: string;
    title: string;
    timeAgo: string;
    snippet: string;
  }[];
}

const TOKEN_METADATA_REGISTRY: Record<string, TokenMetaData> = {
  SOL: {
    network: 'Solana L1',
    marketCap: '$78.4B',
    volume24h: '$4.2B',
    circulatingSupply: '467.2M SOL',
    allTimeHigh: '$259.96',
    rank: '#5',
    about: 'Solana is a high-performance Layer-1 blockchain supporting fast, deterministic smart contract execution with sub-second finality. It leverages Proof-of-History (PoH) coupled with Tower BFT to process institutional transaction volumes with fractional cent fees.',
    news: [
      {
        id: 'sol-news-1',
        source: 'CoinDesk',
        timeAgo: '18m ago',
        title: 'Solana Firedancer Validator Testnet Reaches 1,000,000 TPS Benchmark',
        snippet: 'Jump Crypto independent client architecture demonstrated flawless state synchronization under simulated global stress workloads.',
      },
      {
        id: 'sol-news-2',
        source: 'Bloomberg Crypto',
        timeAgo: '1h ago',
        title: 'Solana Daily Decentralized Exchange Volume Crosses $2.4B Milestone',
        snippet: 'High-speed automated market makers captured 48% of cross-chain active retail and institutional swap volume over the past 24 hours.',
      },
      {
        id: 'sol-news-3',
        source: 'The Block',
        timeAgo: '4h ago',
        title: 'Solana Liquid Staking Protocol TVL Expands Amid Institutional Custody Inflows',
        snippet: 'Jito and Marinade node participation increased 14% as enterprise treasuries allocate rewards directly into multi-sig vaults.',
      },
    ],
  },
  BTC: {
    network: 'Bitcoin Core',
    marketCap: '$1.34T',
    volume24h: '$34.8B',
    circulatingSupply: '19.78M BTC',
    allTimeHigh: '$73,750.07',
    rank: '#1',
    about: 'Bitcoin is the foundational decentralized digital asset and global store of value. It operates via Proof-of-Work (PoW) consensus with a mathematically hard-capped supply of 21,000,000 coins, providing absolute monetary predictability.',
    news: [
      {
        id: 'btc-news-1',
        source: 'Bloomberg Crypto',
        timeAgo: '12m ago',
        title: 'Spot Bitcoin ETFs Record $1.8B Weekly Inflow Led by BlackRock IBIT',
        snippet: 'Institutional wealth managers and family offices expanded exposure to multi-year reserve allocations.',
      },
      {
        id: 'btc-news-2',
        source: 'Reuters',
        timeAgo: '2h ago',
        title: 'Bitcoin Mining Difficulty Crosses 92T Record Ahead of Macro Easing Cycle',
        snippet: 'Global hash rate metrics confirm unprecedented energy infrastructure resilience and ASIC hardware efficiency.',
      },
    ],
  },
  ETH: {
    network: 'Ethereum',
    marketCap: '$410.8B',
    volume24h: '$18.6B',
    circulatingSupply: '120.4M ETH',
    allTimeHigh: '$4,891.70',
    rank: '#2',
    about: 'Ethereum is the global settlement layer for decentralized finance and programmable smart contracts. With Proof-of-Stake consensus and Layer-2 rollups, Ethereum powers decentralized applications and asset tokenization worldwide.',
    news: [
      {
        id: 'eth-news-1',
        source: 'CoinDesk',
        timeAgo: '25m ago',
        title: 'Ethereum Pectra Devnet Finalized With EOF Prover Upgrades',
        snippet: 'Core developers confirmed validator balance caps increasing up to 2,048 ETH, streamlining institutional node operation.',
      },
      {
        id: 'eth-news-2',
        source: 'The Block',
        timeAgo: '3h ago',
        title: 'Rollup Settlement Volume Reaches Record High Across Arbitrum and Base',
        snippet: 'Blob transaction gas fees remained sub-cent, accelerating commercial micro-payment adoption.',
      },
    ],
  },
  USDC: {
    network: 'Multi-Chain Standard',
    marketCap: '$35.4B',
    volume24h: '$6.8B',
    circulatingSupply: '35.4B USDC',
    allTimeHigh: '$1.00',
    rank: '#6',
    about: 'USD Coin (USDC) is a fully collateralized US dollar stablecoin backed 100% by cash and short-duration US Treasuries. It provides atomic settlement and programmatic fiat parity across Ethereum, Solana, and major Layer-2 protocols.',
    news: [
      {
        id: 'usdc-news-1',
        source: 'Reuters Fintech',
        timeAgo: '45m ago',
        title: 'Cross-Chain Transfer Protocol (CCTP) Volume Surpasses $14B Benchmark',
        snippet: 'Instant burn-and-mint settlement across rollups eliminates wrapped token bridge liquidity risk.',
      },
    ],
  },
  AVAX: {
    network: 'Avalanche C-Chain',
    marketCap: '$13.8B',
    volume24h: '$720M',
    circulatingSupply: '395M AVAX',
    allTimeHigh: '$146.22',
    rank: '#12',
    about: 'Avalanche is an asynchronous, high-throughput smart contract platform featuring sub-second finality. It enables custom sovereign enterprise blockchains and subnets with tailored compliance and validator configurations.',
    news: [
      {
        id: 'avax-news-1',
        source: 'Bloomberg Crypto',
        timeAgo: '1h ago',
        title: 'Avalanche Institutional Subnets Power $400M Tokenized Fund Inflows',
        snippet: 'Regulated custodians deployed compliant privacy subnets for high-frequency private equity settlements.',
      },
    ],
  },
  NEAR: {
    network: 'NEAR Protocol',
    marketCap: '$6.1B',
    volume24h: '$480M',
    circulatingSupply: '1.18B NEAR',
    allTimeHigh: '$20.42',
    rank: '#18',
    about: 'NEAR is a sharded, Proof-of-Stake Layer-1 blockchain built with Nightshade dynamic sharding and Chain Abstraction to deliver sub-second multi-chain account execution and decentralized AI model inference.',
    news: [
      {
        id: 'near-news-1',
        source: 'CoinDesk',
        timeAgo: '2h ago',
        title: 'NEAR Chain Abstraction Architecture Connects Cross-Chain User Accounts',
        snippet: 'Single-signature transaction routing enables instant liquidity transfer across EVM and Solana ecosystems.',
      },
    ],
  },
  RENDER: {
    network: 'Render DePIN Network',
    marketCap: '$3.9B',
    volume24h: '$340M',
    circulatingSupply: '518M RENDER',
    allTimeHigh: '$13.60',
    rank: '#24',
    about: 'Render Network is the premier decentralized GPU computing infrastructure provider. It connects node operators with creators and AI research laboratories requiring scalable distributed graphics and AI model inference compute.',
    news: [
      {
        id: 'render-news-1',
        source: 'The Block',
        timeAgo: '3h ago',
        title: 'Render Network GPU Compute Fleet Expands 35% For Decentralized AI Workloads',
        snippet: 'Commercial rendering nodes reported 99.98% uptime executing large-scale parameter model training.',
      },
    ],
  },
  ARB: {
    network: 'Arbitrum One L2',
    marketCap: '$2.8B',
    volume24h: '$380M',
    circulatingSupply: '3.4B ARB',
    allTimeHigh: '$2.40',
    rank: '#35',
    about: 'Arbitrum One is the leading Ethereum Optimistic Rollup, offering EVM equivalence with ultra-low fees and high throughput while inheriting Ethereum mainnet cryptographic security.',
    news: [
      {
        id: 'arb-news-1',
        source: 'CoinDesk',
        timeAgo: '2h ago',
        title: 'Arbitrum Stylus Multi-Language WASM Provers Deploy on Mainnet',
        snippet: 'Developers can now author high-frequency smart contracts in Rust and C++ with full EVM composability.',
      },
    ],
  },
  MATIC: {
    network: 'Polygon PoS / AggLayer',
    marketCap: '$4.2B',
    volume24h: '$290M',
    circulatingSupply: '8.0B MATIC',
    allTimeHigh: '$2.92',
    rank: '#28',
    about: 'Polygon is a decentralized multi-chain ecosystem powered by AggLayer zero-knowledge technology. It unifies shared liquidity and cross-chain execution with near-zero gas costs.',
    news: [
      {
        id: 'matic-news-1',
        source: 'The Block',
        timeAgo: '4h ago',
        title: 'Polygon AggLayer Unifies Unified Cross-Rollup Liquidity Pools',
        snippet: 'ZK-powered atomic transfers eliminate bridging slippage across connected gaming and payment chains.',
      },
    ],
  },
  OP: {
    network: 'Optimism Superchain',
    marketCap: '$2.3B',
    volume24h: '$240M',
    circulatingSupply: '1.2B OP',
    allTimeHigh: '$4.85',
    rank: '#38',
    about: 'Optimism is an Ethereum Layer-2 rollup that powers the Superchain network, standardizing horizontal scaling and open-source infrastructure across leading rollups like Base and OP Mainnet.',
    news: [
      {
        id: 'op-news-1',
        source: 'Bloomberg Crypto',
        timeAgo: '3h ago',
        title: 'Optimism Superchain Ecosystem Captures 45% of Ethereum L2 User Base',
        snippet: 'Standardized fault-proof architectures and interoperability protocols accelerate unified liquidity.',
      },
    ],
  },
  LINK: {
    network: 'Chainlink Oracle Network',
    marketCap: '$8.4B',
    volume24h: '$560M',
    circulatingSupply: '608M LINK',
    allTimeHigh: '$52.88',
    rank: '#14',
    about: 'Chainlink is the industry-standard decentralized computing platform and oracle network. It provides verified real-world market price feeds, verifiable randomness, and cross-chain interoperability (CCIP) across all major blockchains.',
    news: [
      {
        id: 'link-news-1',
        source: 'Reuters Fintech',
        timeAgo: '1h ago',
        title: 'Chainlink CCIP Powers Global Interbank Settlement Pilots With SWIFT',
        snippet: 'Tier-1 global financial institutions execute atomic cross-chain bond and CBDC transfers securely.',
      },
    ],
  },
};

const TIMEFRAME_PATHS: Record<string, { path: string; fill: string; change: string; positive: boolean }> = {
  '1H': {
    path: 'M0 50 C 40 46, 80 54, 130 46 C 180 38, 240 42, 290 32 C 320 26, 340 24, 360 20',
    fill: 'M0 50 C 40 46, 80 54, 130 46 C 180 38, 240 42, 290 32 C 320 26, 340 24, 360 20 L 360 85 L 0 85 Z',
    change: '+0.42%',
    positive: true,
  },
  '1D': {
    path: 'M0 56 C 45 52, 90 62, 140 42 C 190 24, 230 36, 280 22 C 310 14, 335 18, 360 8',
    fill: 'M0 56 C 45 52, 90 62, 140 42 C 190 24, 230 36, 280 22 C 310 14, 335 18, 360 8 L 360 85 L 0 85 Z',
    change: '+12.4%',
    positive: true,
  },
  '1W': {
    path: 'M0 64 C 50 68, 100 56, 150 48 C 200 40, 250 28, 300 20 C 330 16, 345 12, 360 6',
    fill: 'M0 64 C 50 68, 100 56, 150 48 C 200 40, 250 28, 300 20 C 330 16, 345 12, 360 6 L 360 85 L 0 85 Z',
    change: '+18.6%',
    positive: true,
  },
  '1M': {
    path: 'M0 48 C 45 56, 95 64, 145 52 C 195 40, 240 32, 290 22 C 320 16, 345 10, 360 4',
    fill: 'M0 48 C 45 56, 95 64, 145 52 C 195 40, 240 32, 290 22 C 320 16, 345 10, 360 4 L 360 85 L 0 85 Z',
    change: '+29.4%',
    positive: true,
  },
  '1Y': {
    path: 'M0 72 C 60 70, 120 54, 180 44 C 230 34, 280 22, 320 14 C 340 8, 350 6, 360 2',
    fill: 'M0 72 C 60 70, 120 54, 180 44 C 230 34, 280 22, 320 14 C 340 8, 350 6, 360 2 L 360 85 L 0 85 Z',
    change: '+142.8%',
    positive: true,
  },
  'ALL': {
    path: 'M0 78 C 70 76, 130 60, 190 46 C 240 32, 290 18, 330 10 C 345 6, 355 4, 360 2',
    fill: 'M0 78 C 70 76, 130 60, 190 46 C 240 32, 290 18, 330 10 C 345 6, 355 4, 360 2 L 360 85 L 0 85 Z',
    change: '+380.2%',
    positive: true,
  },
};

const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

export default function TokenDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const [selectedTimeRange, setSelectedTimeRange] = useState('1D');

  const { transactions, balances } = useTransactionStore();

  const params = route?.params || {};
  const symbol = (params.symbol || 'SOL').toUpperCase();
  const name = params.name || (symbol === 'SOL' ? 'Solana' : symbol === 'BTC' ? 'Bitcoin' : symbol === 'ETH' ? 'Ethereum' : symbol);
  const rawPrice = params.price || '$168.20';
  const price = rawPrice.startsWith('$') ? rawPrice : `$${rawPrice}`;
  const change = params.change || '+12.4%';
  const isPositive = params.positive !== undefined ? params.positive : !change.startsWith('-');

  const meta: TokenMetaData = TOKEN_METADATA_REGISTRY[symbol] || {
    network: params.network || `${symbol} Network`,
    marketCap: '$2.4B',
    volume24h: '$180M',
    circulatingSupply: `100M ${symbol}`,
    allTimeHigh: price,
    rank: '#20',
    about: `${name} (${symbol}) is a decentralized cryptocurrency and blockchain protocol engineered for institutional-grade reliability, cryptographic security, and scalable liquidity settlement.`,
    news: [
      {
        id: 'gen-news-1',
        source: 'Bloomberg Crypto',
        timeAgo: '42m ago',
        title: `${name} Ecosystem Liquidity Accelerates Across Verified Institutional Vaults`,
        snippet: `Protocol telemetry indicates sustained active address growth and low transaction settlement overhead.`,
      },
    ],
  };

  // Find relevant transactions for this symbol
  const relevantTxs = transactions.filter(tx =>
    tx.asset.toUpperCase().includes(symbol)
  );

  // Dynamic user holding
  const userBalance = balances[symbol as keyof typeof balances];
  const userHoldingFormatted = userBalance !== undefined ? userBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: userBalance < 1 ? 4 : 2,
  }) : null;

  // Monochrome Theme Tokens
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#2C2C2E' : '#E5E5E5';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoSurfaceElevated = isDark ? '#202020' : '#F4F4F4';
  const monoMutedSurface = isDark ? '#262626' : '#ECECEC';

  const chartInfo = TIMEFRAME_PATHS[selectedTimeRange] || TIMEFRAME_PATHS['1D'];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${name} (${symbol}): ${price} (${change}) on Cura Wallet`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP NAV BAR ────────────────────────────────────────── */}
      <View style={[styles.topNavRow, { paddingTop: 6, paddingBottom: 10 }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={[styles.navBtnCircle, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeftIcon color={colors.text.primary} size={20} />
        </TouchableOpacity>

        <View style={styles.navTitleCenter}>
          <Text style={[styles.navTitleText, { color: colors.text.primary }]}>{name}</Text>
          <Text style={styles.navNetworkSub}>{meta.network}</Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          style={[styles.navBtnCircle, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ShareIcon color={colors.text.primary} size={17} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO TOKEN PRICE & HEADER CARD ─────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.tokenLogoWrap}>
              <TokenLogo symbol={symbol} size={46} />
            </View>
            <View style={styles.heroTitleCol}>
              <View style={styles.nameRankRow}>
                <Text style={[styles.heroNameText, { color: colors.text.primary }]}>{name}</Text>
                <View style={[styles.rankBadge, { backgroundColor: monoMutedSurface }]}>
                  <Text style={[styles.rankBadgeText, { color: colors.text.secondary }]}>{meta.rank}</Text>
                </View>
              </View>
              <Text style={styles.heroSymbolText}>{symbol} • {meta.network}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.priceNumber, { color: colors.text.primary }]}>{price}</Text>
            <View style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.16)' : 'rgba(239, 68, 68, 0.16)' },
            ]}>
              <Text style={[
                styles.changeBadgeText,
                { color: isPositive ? '#22C55E' : '#EF4444' },
              ]}>
                {change} (24h)
              </Text>
            </View>
          </View>

          {/* User Holding Banner if wallet has funds */}
          {userHoldingFormatted && (
            <View style={[styles.holdingBanner, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}>
              <Text style={styles.holdingBannerLabel}>Your Balance</Text>
              <Text style={[styles.holdingBannerValue, { color: colors.text.primary }]}>
                {userHoldingFormatted} {symbol}
              </Text>
            </View>
          )}

          {/* High-Res Vector Price Trend Chart */}
          <View style={styles.chartWrapper}>
            <Svg width={SCREEN_WIDTH - 64} height={85} viewBox="0 0 360 85">
              <Defs>
                <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={isPositive ? '#22C55E' : '#EF4444'} stopOpacity="0.28" />
                  <Stop offset="1" stopColor={isPositive ? '#22C55E' : '#EF4444'} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>
              <Path d={chartInfo.fill} fill="url(#chartGradient)" />
              <Path
                d={chartInfo.path}
                fill="none"
                stroke={isPositive ? '#22C55E' : '#EF4444'}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
              <Circle cx="360" cy="8" r="3.5" fill={isPositive ? '#22C55E' : '#EF4444'} />
            </Svg>
          </View>

          {/* Timeframe Selector Pill Bar */}
          <View style={[styles.timeframeBar, { backgroundColor: monoSurfaceElevated }]}>
            {TIME_RANGES.map(range => {
              const active = selectedTimeRange === range;
              return (
                <TouchableOpacity
                  key={range}
                  onPress={() => setSelectedTimeRange(range)}
                  style={[
                    styles.timeframeBtn,
                    active && { backgroundColor: monoPrimary },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeframeBtnText,
                    active
                      ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                      : { color: colors.text.muted },
                  ]}>
                    {range}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── ACTION BUTTONS: BUY, SELL, SWAP, SEND, RECEIVE ────── */}
        <View style={styles.actionButtonsRow}>
          {/* Primary BUY Button (Always High-Contrast) */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Buy')}
            style={[styles.primaryActionBtn, { backgroundColor: monoPrimary }]}
            activeOpacity={0.8}
          >
            <PlusIcon color={isDark ? '#000000' : '#FFFFFF'} size={20} />
            <Text style={[styles.primaryActionText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              Buy
            </Text>
          </TouchableOpacity>

          {/* SWAP Button */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Swap')}
            style={[styles.secondaryActionBtn, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
            activeOpacity={0.8}
          >
            <SwapIcon color={colors.text.primary} size={19} />
            <Text style={[styles.secondaryActionText, { color: colors.text.primary }]}>
              Swap
            </Text>
          </TouchableOpacity>

          {/* SEND Button */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Send')}
            style={[styles.secondaryActionBtn, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
            activeOpacity={0.8}
          >
            <ArrowUpRightIcon color={colors.text.primary} size={19} />
            <Text style={[styles.secondaryActionText, { color: colors.text.primary }]}>
              Send
            </Text>
          </TouchableOpacity>

          {/* RECEIVE Button */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Receive')}
            style={[styles.secondaryActionBtn, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}
            activeOpacity={0.8}
          >
            <ArrowDownLeftIcon color={colors.text.primary} size={19} />
            <Text style={[styles.secondaryActionText, { color: colors.text.primary }]}>
              Receive
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── KEY MARKET STATISTICS ─────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>MARKET STATISTICS</Text>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Market Cap', value: meta.marketCap },
            { label: '24h Volume', value: meta.volume24h },
            { label: 'Circulating Supply', value: meta.circulatingSupply },
            { label: 'All-Time High', value: meta.allTimeHigh },
          ].map((stat, i) => (
            <View
              key={i}
              style={[styles.statBoxCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            >
              <Text style={styles.statBoxLabel}>{stat.label}</Text>
              <Text style={[styles.statBoxValue, { color: colors.text.primary }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* ── LATEST COIN NEWS WIRE ─────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>{symbol} NEWS & UPDATES</Text>
        </View>

        <View style={styles.newsListWrap}>
          {meta.news.map((item) => (
            <View
              key={item.id}
              style={[styles.newsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            >
              <View style={styles.newsMetaRow}>
                <Text style={styles.newsSourceTag}>{item.source}</Text>
                <Text style={styles.newsDotDivider}>•</Text>
                <Text style={styles.newsTimeText}>{item.timeAgo}</Text>
              </View>
              <Text style={[styles.newsTitleText, { color: colors.text.primary }]}>
                {item.title}
              </Text>
              <Text style={styles.newsSnippetText} numberOfLines={2}>
                {item.snippet}
              </Text>
            </View>
          ))}
        </View>

        {/* ── RECENT TRANSACTIONS FOR THIS COIN ─────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>TRANSACTION ACTIVITY</Text>
          <TouchableOpacity onPress={() => navigation?.navigate?.('Activity')}>
            <Text style={[styles.sectionActionText, { color: colors.text.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.txListContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {relevantTxs.length > 0 ? (
            relevantTxs.slice(0, 3).map((tx, idx, arr) => (
              <TouchableOpacity
                key={tx.id}
                onPress={() => navigation?.navigate?.('TransactionDetail', { tx })}
                style={[
                  styles.txRowItem,
                  idx < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: cardBorder },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.txLeftCol}>
                  <View style={[styles.txIconCircle, { backgroundColor: monoSurfaceElevated }]}>
                    <Text style={{ fontSize: 13, color: colors.text.primary }}>
                      {tx.type === 'swap' ? '⇄' : tx.type === 'received' ? '↙' : '↗'}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.txTitleText, { color: colors.text.primary }]}>
                      {tx.type === 'swap' ? 'Swap' : tx.type === 'received' ? 'Received' : 'Sent'}
                    </Text>
                    <Text style={styles.txSubText}>{tx.time}</Text>
                  </View>
                </View>

                <View style={styles.txRightCol}>
                  <Text style={[styles.txAmountText, { color: colors.text.primary }]}>
                    {tx.type === 'received' ? '+' : tx.type === 'swap' ? '' : '-'}{tx.amount} {symbol}
                  </Text>
                  <View style={styles.txMetaPillRow}>
                    <Text style={styles.txValueText}>{tx.value}</Text>
                    <View style={[styles.confirmedPill, { backgroundColor: monoSurfaceElevated }]}>
                      <Text style={[styles.confirmedPillText, { color: colors.text.secondary }]}>
                        {tx.status}
                      </Text>
                    </View>
                    <ChevronRightIcon color="#858585" size={12} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyTxBox}>
              <Text style={styles.emptyTxText}>No recent transactions for {symbol}</Text>
            </View>
          )}
        </View>

        {/* ── ABOUT & PROTOCOL DETAILS ─────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>ABOUT {name.toUpperCase()}</Text>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.aboutBodyText, { color: colors.text.secondary }]}>
            {meta.about}
          </Text>
          <View style={styles.tagChipsRow}>
            <View style={[styles.specTag, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}>
              <Text style={[styles.specTagText, { color: colors.text.primary }]}>Consensus: PoS</Text>
            </View>
            <View style={[styles.specTag, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}>
              <Text style={[styles.specTagText, { color: colors.text.primary }]}>Token Standard: Native</Text>
            </View>
            <View style={[styles.specTag, { backgroundColor: monoSurfaceElevated, borderColor: cardBorder }]}>
              <Text style={[styles.specTagText, { color: colors.text.primary }]}>Audit: Verified</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
  },
  navBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  navTitleCenter: {
    alignItems: 'center',
  },
  navTitleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  navNetworkSub: {
    fontSize: 11,
    color: '#858585',
    fontWeight: '600',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 18,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tokenLogoWrap: {
    marginRight: 12,
  },
  heroTitleCol: {
    flex: 1,
  },
  nameRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroNameText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroSymbolText: {
    fontSize: 12.5,
    color: '#858585',
    fontWeight: '500',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 10,
  },
  priceNumber: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  holdingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  holdingBannerLabel: {
    fontSize: 12,
    color: '#858585',
    fontWeight: '600',
  },
  holdingBannerValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeframeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 3,
    marginTop: 6,
  },
  timeframeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  timeframeBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  primaryActionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 14,
    gap: 6,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 0.5,
    gap: 5,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#858585',
    letterSpacing: 0.8,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBoxCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#858585',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  newsListWrap: {
    gap: 8,
    marginBottom: 16,
  },
  newsCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  newsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  newsSourceTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#858585',
  },
  newsDotDivider: {
    fontSize: 11,
    color: '#858585',
  },
  newsTimeText: {
    fontSize: 11,
    color: '#858585',
  },
  newsTitleText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 4,
  },
  newsSnippetText: {
    fontSize: 12,
    color: '#858585',
    lineHeight: 16,
  },
  txListContainer: {
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 16,
    overflow: 'hidden',
  },
  txRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  txLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  txSubText: {
    fontSize: 11,
    color: '#858585',
    marginTop: 2,
  },
  txRightCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  txAmountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  txMetaPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txValueText: {
    fontSize: 11,
    color: '#858585',
  },
  confirmedPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  confirmedPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  emptyTxBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTxText: {
    fontSize: 12,
    color: '#858585',
  },
  aboutCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
  },
  aboutBodyText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  specTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
