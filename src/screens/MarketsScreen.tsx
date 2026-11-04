// src/screens/MarketsScreen.tsx
// Flat card-based Markets — Material/HIG-compliant design.
// Search bar, segmented categories, card-style coin rows with sparklines.

import React, { useEffect, useState, useMemo } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Dimensions, RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { PriceService, CoinMarket } from '../services/PriceService';
import { theme } from '../theme/Theme';

const SCREEN_W = Dimensions.get('window').width;

interface Props {
  navigation?: any;
  activeTab?: string;
  setActiveTab?: (t: any) => void;
}

const CATEGORIES = [
  { key: 'trending',    label: 'Trending' },
  { key: 'topgainers',  label: 'Top Gainers' },
  { key: 'toplosers',   label: 'Top Losers' },
  { key: 'volume',      label: 'Volume' },
  { key: 'defi',        label: 'DeFi' },
  { key: 'stable',      label: 'Stablecoins' },
];

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={theme.colors.text.muted} strokeWidth={1.8} />
    <Path d="M16.5 16.5L21 21" stroke={theme.colors.text.muted} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const RobotIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v3M4 11a8 8 0 0 1 16 0v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7z" stroke={theme.colors.primary.DEFAULT} strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx="9" cy="11" r="1" fill={theme.colors.primary.DEFAULT} />
    <Circle cx="15" cy="11" r="1" fill={theme.colors.primary.DEFAULT} />
    <Path d="M9 16h6" stroke={theme.colors.primary.DEFAULT} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export default function MarketsScreen({ navigation }: Props) {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState('trending');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await PriceService.getMarketData('usd');
    setCoins(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const sparklinePath = (coin: CoinMarket, width = 72, height = 24): string => {
    let pts: number[];
    if (coin.sparkline_in_7d?.price && coin.sparkline_in_7d.price.length > 2) {
      pts = coin.sparkline_in_7d.price;
    } else {
      pts = [];
      let v = 50;
      const drift = (coin.price_change_percentage_24h || 0) / 100;
      for (let i = 0; i < 20; i++) {
        v = Math.max(2, Math.min(98, v + drift * (Math.random() - 0.4) * 4));
        pts.push(v);
      }
    }
    const max = Math.max(...pts);
    const min = Math.min(...pts);
    const range = (max - min) || 1;
    return pts.map((p, i) => {
      const x = (i / (pts.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
  };

  const filteredCoins = useMemo(() => {
    let list = coins.slice();
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    if (selectedCat === 'topgainers') {
      list.sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
    } else if (selectedCat === 'toplosers') {
      list.sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0));
    } else if (selectedCat === 'volume') {
      list.sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0));
    } else if (selectedCat === 'defi') {
      list = list.filter(c => ['UNI', 'AAVE', 'LDO', 'MKR', 'CRV', 'SUSHI', 'COMP', 'SNX', '1INCH', 'YFI'].includes(c.symbol.toUpperCase()));
    } else if (selectedCat === 'stable') {
      list = list.filter(c => ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX', 'USDD', 'USDP', 'GUSD'].includes(c.symbol.toUpperCase()));
    }
    return list.slice(0, 30);
  }, [coins, search, selectedCat]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.DEFAULT} />}
      >
        {/* HEADER */}
        <Text style={styles.pageTitle}>Markets</Text>
        <Text style={styles.pageSubtitle}>Live crypto assets by market capitalization</Text>

        {/* SEARCH BAR */}
        <View style={styles.searchWrap}>
          <SearchIcon />
          <TextInput
            placeholder="Search coins or symbols"
            placeholderTextColor={theme.colors.text.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORY CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: 6, paddingRight: 16 }}>
          {CATEGORIES.map(c => {
            const active = selectedCat === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCat(c.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* COIN LIST CARD */}
        {loading && coins.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
            <Text style={styles.loaderText}>Fetching market data…</Text>
          </View>
        ) : filteredCoins.length === 0 ? (
          <View style={styles.loaderWrap}>
            <Text style={styles.emptyText}>No matching assets found</Text>
          </View>
        ) : (
          <View style={styles.coinCardContainer}>
            {filteredCoins.map((coin, index) => {
              const positive = (coin.price_change_percentage_24h ?? 0) >= 0;
              const chartColor = positive ? theme.colors.success.DEFAULT : theme.colors.danger.DEFAULT;
              const isLast = index === filteredCoins.length - 1;
              return (
                <TouchableOpacity
                  key={coin.id}
                  style={[styles.coinRow, !isLast && styles.coinRowDivider]}
                  activeOpacity={0.6}
                  onPress={() => navigation?.navigate?.('CoinDetail', { coin })}
                >
                  <View style={styles.coinIconCircle}>
                    <Text style={styles.coinIconText}>{coin.symbol.slice(0, 1).toUpperCase()}</Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.coinName}>{coin.name}</Text>
                    <Text style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</Text>
                  </View>

                  <View style={styles.sparkWrap}>
                    <Svg width={72} height={24} viewBox="0 0 72 24">
                      <Path d={sparklinePath(coin)} stroke={chartColor} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>

                  <View style={styles.coinRight}>
                    <Text style={styles.coinPrice}>
                      ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.coinChange, { color: positive ? theme.colors.success.DEFAULT : theme.colors.danger.DEFAULT }]}>
                      {positive ? '+' : ''}{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* AI ASSISTANT CARD */}
        <TouchableOpacity
          style={styles.aiCard}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate?.('AIChatbot')}
        >
          <View style={styles.aiIconWrap}>
            <RobotIcon />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>Ask CryptoVault AI</Text>
            <Text style={styles.aiSub}>Analyze market trends, token risks, or portfolio strategy</Text>
          </View>
          <Text style={styles.aiArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: theme.colors.text.muted,
    marginTop: 2,
    marginBottom: 16,
    fontWeight: '500',
  },

  // SEARCH
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: theme.colors.borderHighlight,
    borderLeftColor: theme.colors.borderHighlight,
    borderBottomColor: theme.colors.borderShadow,
    borderRightColor: theme.colors.borderShadow,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
    shadowColor: theme.colors.shadowColor,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 4 },
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.text.primary, paddingVertical: 12, fontWeight: '600' },
  searchClear: { width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  searchClearText: { fontSize: 11, color: theme.colors.text.muted, fontWeight: '800' },

  // CHIPS
  chipRow: { flexGrow: 0, marginBottom: 18 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.pill,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopColor: theme.colors.borderHighlight,
    borderLeftColor: theme.colors.borderHighlight,
    borderBottomColor: theme.colors.borderShadow,
    borderRightColor: theme.colors.borderShadow,
    shadowColor: theme.colors.shadowColor,
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 4 },
    elevation: 3,
  },
  chipActive: {
    backgroundColor: theme.colors.primary.DEFAULT,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderLeftColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomColor: 'rgba(49, 42, 142, 0.6)',
    borderRightColor: 'rgba(49, 42, 142, 0.6)',
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 3, height: 6 },
    elevation: 5,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: theme.colors.text.secondary },
  chipTextActive: { color: theme.colors.text.onPrimary, fontWeight: '800' },

  // LOADER
  loaderWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  loaderText: { fontSize: 13, color: theme.colors.text.muted, fontWeight: '600' },
  emptyText: { fontSize: 13, color: theme.colors.text.muted, fontWeight: '600' },

  // COIN CARD CONTAINER
  coinCardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.clay,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopColor: theme.colors.borderHighlight,
    borderLeftColor: theme.colors.borderHighlight,
    borderBottomColor: theme.colors.borderShadow,
    borderRightColor: theme.colors.borderShadow,
    shadowColor: theme.colors.shadowColor,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 4, height: 8 },
    elevation: 6,
    overflow: 'hidden',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  coinRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  coinIconCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.tokenIcon,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.7)',
    borderLeftColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    borderRightColor: 'rgba(0, 0, 0, 0.06)',
  },
  coinIconText: { fontSize: 15, fontWeight: '800', color: theme.colors.primary.DEFAULT },
  coinName: { fontSize: 14, fontWeight: '700', color: theme.colors.text.primary },
  coinSymbol: { fontSize: 11, color: theme.colors.text.muted, marginTop: 1, textTransform: 'uppercase', fontWeight: '600' },
  sparkWrap: { marginRight: 8, marginLeft: 4 },
  coinRight: { alignItems: 'flex-end', minWidth: 80 },
  coinPrice: { fontSize: 14, fontWeight: '800', color: theme.colors.text.primary, fontVariant: ['tabular-nums'] as any },
  coinChange: { fontSize: 11, fontWeight: '700', marginTop: 1, fontVariant: ['tabular-nums'] as any },

  // AI CARD
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.clay,
    padding: 18,
    marginTop: 18,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopColor: theme.colors.borderHighlight,
    borderLeftColor: theme.colors.borderHighlight,
    borderBottomColor: theme.colors.borderShadow,
    borderRightColor: theme.colors.borderShadow,
    shadowColor: theme.colors.shadowColor,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 7 },
    elevation: 5,
  },
  aiIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.7)',
    borderLeftColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomColor: 'rgba(0,0,0,0.06)',
    borderRightColor: 'rgba(0,0,0,0.06)',
  },
  aiTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.text.primary },
  aiSub: { fontSize: 12, color: theme.colors.text.muted, marginTop: 2, fontWeight: '500' },
  aiArrow: { fontSize: 18, color: theme.colors.primary.DEFAULT, fontWeight: '800' },
});
