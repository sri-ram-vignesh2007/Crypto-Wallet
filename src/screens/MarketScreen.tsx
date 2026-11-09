// src/screens/MarketScreen.tsx - Institutional-Grade Multi-Chain Crypto Markets Hub (Trust Wallet & Coinbase Scale)

import React, { useState, useMemo } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vector Glyphs
const SearchIcon = ({ color = '#858585', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const SwapIcon = ({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
  </Svg>
);

const MiniSparkline = ({ points, positive }: { points: string; positive: boolean }) => (
  <Svg width={64} height={28} viewBox="0 0 64 28" fill="none">
    <Polyline
      fill="none"
      stroke={positive ? '#22C55E' : '#EF4444'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      points={points}
    />
  </Svg>
);

export type MarketCategory =
  | 'Trending'
  | 'Top Gainers'
  | 'Top Losers'
  | 'New'
  | 'Majors'
  | 'RWA & Stocks'
  | 'DeFi'
  | 'Layer 2';

export interface MarketToken {
  symbol: string;
  name: string;
  price: string;
  numericPrice: number;
  change24h: string;
  numericChange: number;
  positive: boolean;
  volume24h: string;
  marketCap: string;
  numericMarketCap: number;
  chain: string;
  category: MarketCategory[];
  sparkline: string;
}

const ALL_MARKET_TOKENS: MarketToken[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '$67,540.00',
    numericPrice: 67540,
    change24h: '+3.42%',
    numericChange: 3.42,
    positive: true,
    volume24h: '$34.2B',
    marketCap: '$1.33T',
    numericMarketCap: 1330000000000,
    chain: 'Bitcoin',
    category: ['Majors', 'Trending'],
    sparkline: '0,20 12,18 24,14 36,16 48,8 64,4',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: '$2,700.00',
    numericPrice: 2700,
    change24h: '+5.40%',
    numericChange: 5.40,
    positive: true,
    volume24h: '$18.6B',
    marketCap: '$324.8B',
    numericMarketCap: 324800000000,
    chain: 'Ethereum',
    category: ['Majors', 'Trending', 'DeFi'],
    sparkline: '0,22 14,19 26,16 38,12 50,7 64,3',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: '$168.20',
    numericPrice: 168.2,
    change24h: '+12.40%',
    numericChange: 12.40,
    positive: true,
    volume24h: '$6.8B',
    marketCap: '$78.4B',
    numericMarketCap: 78400000000,
    chain: 'Solana',
    category: ['Majors', 'Trending', 'Top Gainers'],
    sparkline: '0,26 12,22 24,15 36,11 48,5 64,2',
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    price: '$592.40',
    numericPrice: 592.4,
    change24h: '+2.15%',
    numericChange: 2.15,
    positive: true,
    volume24h: '$1.4B',
    marketCap: '$89.2B',
    numericMarketCap: 89200000000,
    chain: 'BNB Chain',
    category: ['Majors'],
    sparkline: '0,18 14,16 28,15 42,12 56,10 64,8',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: '$1.00',
    numericPrice: 1.0,
    change24h: '+0.01%',
    numericChange: 0.01,
    positive: true,
    volume24h: '$7.8B',
    marketCap: '$35.2B',
    numericMarketCap: 35200000000,
    chain: 'Ethereum',
    category: ['Majors', 'RWA & Stocks'],
    sparkline: '0,14 16,14 32,14 48,14 64,14',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    price: '$1.00',
    numericPrice: 1.0,
    change24h: '+0.02%',
    numericChange: 0.02,
    positive: true,
    volume24h: '$48.1B',
    marketCap: '$118.0B',
    numericMarketCap: 118000000000,
    chain: 'Ethereum',
    category: ['Majors'],
    sparkline: '0,14 16,14 32,14 48,14 64,14',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: '$0.158',
    numericPrice: 0.158,
    change24h: '+8.90%',
    numericChange: 8.90,
    positive: true,
    volume24h: '$2.1B',
    marketCap: '$23.1B',
    numericMarketCap: 23100000000,
    chain: 'Bitcoin',
    category: ['Trending', 'Top Gainers'],
    sparkline: '0,24 14,20 28,14 42,8 56,5 64,3',
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    price: '$0.428',
    numericPrice: 0.428,
    change24h: '-1.85%',
    numericChange: -1.85,
    positive: false,
    volume24h: '$450M',
    marketCap: '$15.4B',
    numericMarketCap: 15400000000,
    chain: 'Ethereum',
    category: ['Majors', 'Top Losers'],
    sparkline: '0,6 14,10 28,15 42,19 56,22 64,24',
  },
  {
    symbol: 'XRP',
    name: 'XRP Ledger',
    price: '$0.584',
    numericPrice: 0.584,
    change24h: '+4.12%',
    numericChange: 4.12,
    positive: true,
    volume24h: '$1.8B',
    marketCap: '$32.8B',
    numericMarketCap: 32800000000,
    chain: 'Ethereum',
    category: ['Majors', 'Trending'],
    sparkline: '0,20 16,18 32,14 48,10 64,6',
  },
  {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    price: '$5.15',
    numericPrice: 5.15,
    change24h: '+8.20%',
    numericChange: 8.20,
    positive: true,
    volume24h: '$610M',
    marketCap: '$6.1B',
    numericMarketCap: 6100000000,
    chain: 'NEAR',
    category: ['Trending', 'Top Gainers'],
    sparkline: '0,22 14,18 28,12 42,8 56,5 64,3',
  },
  {
    symbol: 'RENDER',
    name: 'Render Network',
    price: '$6.20',
    numericPrice: 6.20,
    change24h: '+4.10%',
    numericChange: 4.10,
    positive: true,
    volume24h: '$340M',
    marketCap: '$3.9B',
    numericMarketCap: 3900000000,
    chain: 'Solana',
    category: ['Trending', 'Top Gainers'],
    sparkline: '0,21 15,17 30,12 45,9 64,5',
  },
  {
    symbol: 'ARB',
    name: 'Arbitrum One',
    price: '$0.58',
    numericPrice: 0.58,
    change24h: '-2.10%',
    numericChange: -2.10,
    positive: false,
    volume24h: '$380M',
    marketCap: '$2.8B',
    numericMarketCap: 2800000000,
    chain: 'Arbitrum',
    category: ['Layer 2', 'Top Losers'],
    sparkline: '0,5 14,9 28,14 42,18 56,21 64,23',
  },
  {
    symbol: 'POL',
    name: 'Polygon PoS',
    price: '$0.38',
    numericPrice: 0.38,
    change24h: '+3.50%',
    numericChange: 3.50,
    positive: true,
    volume24h: '$290M',
    marketCap: '$4.2B',
    numericMarketCap: 4200000000,
    chain: 'Polygon',
    category: ['Layer 2', 'Top Gainers'],
    sparkline: '0,20 14,16 28,13 42,10 56,8 64,5',
  },
  {
    symbol: 'OP',
    name: 'Optimism Mainnet',
    price: '$1.65',
    numericPrice: 1.65,
    change24h: '+6.20%',
    numericChange: 6.20,
    positive: true,
    volume24h: '$210M',
    marketCap: '$2.1B',
    numericMarketCap: 2100000000,
    chain: 'Optimism',
    category: ['Layer 2', 'Top Gainers'],
    sparkline: '0,22 14,18 28,13 42,9 56,6 64,4',
  },
  {
    symbol: 'LINK',
    name: 'Chainlink Oracle',
    price: '$11.80',
    numericPrice: 11.80,
    change24h: '+1.90%',
    numericChange: 1.90,
    positive: true,
    volume24h: '$260M',
    marketCap: '$7.2B',
    numericMarketCap: 7200000000,
    chain: 'Ethereum',
    category: ['DeFi'],
    sparkline: '0,18 14,16 28,14 42,11 56,9 64,7',
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche C-Chain',
    price: '$27.80',
    numericPrice: 27.80,
    change24h: '-1.40%',
    numericChange: -1.40,
    positive: false,
    volume24h: '$310M',
    marketCap: '$11.2B',
    numericMarketCap: 11200000000,
    chain: 'Avalanche',
    category: ['Majors', 'Top Losers'],
    sparkline: '0,6 14,10 28,14 42,18 56,21 64,23',
  },
  // RWA & STOCKS CATEGORY
  {
    symbol: 'USDC',
    name: 'BlackRock BUIDL Fund',
    price: '$1.00',
    numericPrice: 1.0,
    change24h: '+0.01%',
    numericChange: 0.01,
    positive: true,
    volume24h: '$42M',
    marketCap: '$520M',
    numericMarketCap: 520000000,
    chain: 'Ethereum',
    category: ['RWA & Stocks', 'New'],
    sparkline: '0,14 16,14 32,14 48,14 64,14',
  },
  {
    symbol: 'USDC',
    name: 'Ondo US Short-Term Govt (OUSG)',
    price: '$105.40',
    numericPrice: 105.4,
    change24h: '+0.03%',
    numericChange: 0.03,
    positive: true,
    volume24h: '$15M',
    marketCap: '$240M',
    numericMarketCap: 240000000,
    chain: 'Ethereum',
    category: ['RWA & Stocks'],
    sparkline: '0,18 16,16 32,14 48,12 64,10',
  },
  {
    symbol: 'SOL',
    name: 'Tokenized Apple Inc. (AAPLx)',
    price: '$224.20',
    numericPrice: 224.2,
    change24h: '+1.85%',
    numericChange: 1.85,
    positive: true,
    volume24h: '$65M',
    marketCap: '$3.4T Eq.',
    numericMarketCap: 3400000000000,
    chain: 'Solana',
    category: ['RWA & Stocks'],
    sparkline: '0,19 14,16 28,13 42,10 56,7 64,4',
  },
  {
    symbol: 'SOL',
    name: 'Tokenized Tesla Inc. (TSLAx)',
    price: '$218.40',
    numericPrice: 218.4,
    change24h: '+4.20%',
    numericChange: 4.20,
    positive: true,
    volume24h: '$84M',
    marketCap: '$690B Eq.',
    numericMarketCap: 690000000000,
    chain: 'Solana',
    category: ['RWA & Stocks', 'Trending'],
    sparkline: '0,22 14,18 28,13 42,8 56,5 64,3',
  },
];

const CATEGORIES: MarketCategory[] = [
  'Trending',
  'Top Gainers',
  'Top Losers',
  'New',
  'Majors',
  'RWA & Stocks',
  'DeFi',
  'Layer 2',
];

const NETWORKS = ['All Chains', 'Ethereum', 'Solana', 'BNB Chain', 'Bitcoin', 'Polygon', 'Arbitrum', 'Avalanche'];
const TIMEFRAMES = ['1H', '24H', '7D', '1M', '1Y'];
const SORT_OPTIONS = ['Market Cap', '24h Volume', 'Price: High-Low', 'Top Gainers'];

export default function MarketScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('Trending');
  const [selectedNetwork, setSelectedNetwork] = useState('All Chains');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24H');
  const [selectedSort, setSelectedSort] = useState('Market Cap');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#2B2B2B' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const filteredTokens = useMemo(() => {
    let list = ALL_MARKET_TOKENS.filter((t) => {
      // Category filter
      if (selectedCategory === 'Top Gainers') {
        if (!t.positive || t.numericChange <= 2) return false;
      } else if (selectedCategory === 'Top Losers') {
        if (t.positive) return false;
      } else {
        if (!t.category.includes(selectedCategory)) return false;
      }

      // Network filter
      if (selectedNetwork !== 'All Chains' && t.chain !== selectedNetwork) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          t.chain.toLowerCase().includes(q)
        );
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (selectedSort === 'Market Cap') {
        return b.numericMarketCap - a.numericMarketCap;
      }
      if (selectedSort === 'Price: High-Low') {
        return b.numericPrice - a.numericPrice;
      }
      if (selectedSort === 'Top Gainers') {
        return b.numericChange - a.numericChange;
      }
      return 0;
    });

    return list;
  }, [selectedCategory, selectedNetwork, selectedSort, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── HEADER (Coinbase / Trust Wallet Scale) ─────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitleText, { color: colors.text.primary }]}>Markets</Text>
          <View style={[styles.liveIndicatorPill, { backgroundColor: monoMutedSurface }]}>
            <View style={styles.livePulseDot} />
            <Text style={[styles.liveIndicatorText, { color: colors.text.primary }]}>Live Feeds</Text>
          </View>
        </View>

        {/* Big Search Input */}
        <View style={[styles.searchBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <SearchIcon color={colors.text.muted} size={18} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search 500+ cryptos, stocks, contracts..."
            placeholderTextColor={colors.text.muted}
            style={[styles.searchInput, { color: colors.text.primary }]}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── CATEGORY PILLS (Horizontal Scroll) ─────────────── */}
      <View style={styles.categoriesWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  { backgroundColor: active ? monoPrimary : monoMutedSurface, borderColor: cardBorder },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: active ? (isDark ? '#000000' : '#FFFFFF') : colors.text.muted, fontWeight: active ? '800' : '600' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── SECONDARY CONTROLS (Chains, Timeframes, Sort) ──── */}
      <View style={styles.filterBarRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarContent}>
          {/* Network chips */}
          {NETWORKS.slice(0, 5).map((net) => {
            const active = selectedNetwork === net;
            return (
              <TouchableOpacity
                key={net}
                onPress={() => setSelectedNetwork(net)}
                style={[
                  styles.filterSmallChip,
                  { backgroundColor: active ? (isDark ? '#2F2F2F' : '#E8E8E8') : 'transparent', borderColor: cardBorder },
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? colors.text.primary : colors.text.muted }]}>
                  {net}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.filterDivider} />

          {/* Timeframes */}
          {TIMEFRAMES.slice(0, 3).map((tf) => {
            const active = selectedTimeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                onPress={() => setSelectedTimeframe(tf)}
                style={[
                  styles.filterSmallChip,
                  { backgroundColor: active ? (isDark ? '#2F2F2F' : '#E8E8E8') : 'transparent', borderColor: cardBorder },
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? colors.text.primary : colors.text.muted }]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── TOKEN LIST (Large Trust Wallet Scale) ──────────── */}
      <ScrollView
        contentContainerStyle={[styles.tokenListContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={monoPrimary} />}
      >
        <View style={[styles.tokenCardContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {filteredTokens.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Assets Found</Text>
              <Text style={[styles.emptySub, { color: colors.text.muted }]}>
                Try selecting "All Chains" or clearing your search query.
              </Text>
            </View>
          ) : (
            filteredTokens.map((token, index) => {
              const isLast = index === filteredTokens.length - 1;
              return (
                <TouchableOpacity
                  key={`${token.symbol}-${token.name}-${index}`}
                  onPress={() =>
                    navigation.navigate('TokenDetail', {
                      symbol: token.symbol,
                      name: token.name,
                      price: token.price,
                      change: token.change24h,
                      positive: token.positive,
                      network: token.chain,
                    })
                  }
                  style={[
                    styles.tokenRowItem,
                    !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder },
                  ]}
                  activeOpacity={0.75}
                >
                  {/* Left: Token Logo & Names */}
                  <View style={styles.tokenLeftGroup}>
                    <TokenLogo symbol={token.symbol} size={42} />
                    <View style={styles.tokenTitleColumn}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.tokenSymbolMain, { color: colors.text.primary }]}>{token.symbol}</Text>
                        <View style={[styles.chainTagPill, { backgroundColor: monoMutedSurface }]}>
                          <Text style={[styles.chainTagText, { color: colors.text.muted }]}>{token.chain}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tokenFullName, { color: colors.text.muted }]} numberOfLines={1}>
                        {token.name}
                      </Text>
                    </View>
                  </View>

                  {/* Center: Sparkline */}
                  <View style={styles.tokenSparkWrap}>
                    <MiniSparkline points={token.sparkline} positive={token.positive} />
                  </View>

                  {/* Right: Price & Quick Swap Action */}
                  <View style={styles.tokenRightGroup}>
                    <Text style={[styles.tokenPriceText, { color: colors.text.primary }]}>{token.price}</Text>

                    <View style={styles.tokenActionRow}>
                      <View
                        style={[
                          styles.deltaPill,
                          {
                            backgroundColor: token.positive
                              ? isDark
                                ? 'rgba(34, 197, 94, 0.16)'
                                : '#DCFCE7'
                              : isDark
                              ? 'rgba(239, 68, 68, 0.16)'
                              : '#FEE2E2',
                          },
                        ]}
                      >
                        <Text style={[styles.deltaText, { color: token.positive ? '#22C55E' : '#EF4444' }]}>
                          {token.change24h}
                        </Text>
                      </View>

                      {/* 1-Tap Quick Swap */}
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Swap')}
                        style={[styles.quickSwapBtn, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
                        activeOpacity={0.7}
                      >
                        <SwapIcon color={monoPrimary} size={12} />
                        <Text style={[styles.quickSwapText, { color: colors.text.primary }]}>Swap</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  liveIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  categoriesWrap: {
    paddingVertical: 8,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  filterBarRow: {
    paddingVertical: 4,
    marginBottom: 8,
  },
  filterBarContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  filterSmallChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#383838',
    marginHorizontal: 4,
  },
  tokenListContent: {
    paddingHorizontal: 18,
  },
  tokenCardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tokenRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tokenLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.2,
  },
  tokenTitleColumn: {
    marginLeft: 14,
    flex: 1,
  },
  tokenSymbolMain: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  chainTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chainTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tokenFullName: {
    fontSize: 13,
    marginTop: 2,
  },
  tokenSparkWrap: {
    paddingHorizontal: 4,
  },
  tokenRightGroup: {
    alignItems: 'flex-end',
    flex: 1,
  },
  tokenPriceText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tokenActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  deltaPill: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  quickSwapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  quickSwapText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyWrap: {
    padding: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
});
