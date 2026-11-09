// src/screens/PortfolioScreen.tsx - Unified Assets & Transactions Hub for Cura Wallet

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';
import { useTransactionStore } from '../store/transactionStore';
import { useWalletStore } from '../store/walletStore';

const SearchIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const ChevronRightIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const TX_ICONS: Record<string, ({ color, size }: { color?: string; size?: number }) => React.ReactElement> = {
  sent: ({ color, size = 16 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 17l10-10M17 7H7v10" />
    </Svg>
  ),
  received: ({ color, size = 16 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 7l-10 10M7 17h10v-10" />
    </Svg>
  ),
  swap: ({ color, size = 16 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
    </Svg>
  ),
};

const FILTERS = ['All', 'Sent', 'Received', 'Swaps'];

const ALL_PORTFOLIO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.0452', price: '$67,540.00', change: '+2.8%', positive: true, network: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', balance: '2.54', price: '$2,700.00', change: '+5.4%', positive: true, network: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana', balance: '18.40', price: '$168.20', change: '+12.4%', positive: true, network: 'Solana' },
  { symbol: 'USDC', name: 'USD Coin', balance: '1,250.00', price: '$1.00', change: '+0.01%', positive: true, network: 'Multi-Chain' },
  { symbol: 'AVAX', name: 'Avalanche', balance: '45.00', price: '$27.80', change: '-1.4%', positive: false, network: 'Avalanche' },
  { symbol: 'NEAR', name: 'NEAR Protocol', balance: '280.00', price: '$5.15', change: '+8.2%', positive: true, network: 'NEAR' },
  { symbol: 'RENDER', name: 'Render', balance: '140.00', price: '$6.20', change: '+4.1%', positive: true, network: 'Solana' },
  { symbol: 'ARB', name: 'Arbitrum', balance: '850.00', price: '$0.58', change: '-2.1%', positive: false, network: 'Arbitrum' },
  { symbol: 'POL', name: 'Polygon', balance: '1,250.00', price: '$0.38', change: '+3.5%', positive: true, network: 'Polygon' },
  { symbol: 'OP', name: 'Optimism', balance: '320.00', price: '$1.65', change: '+6.2%', positive: true, network: 'Optimism' },
  { symbol: 'LINK', name: 'Chainlink', balance: '65.00', price: '$11.80', change: '+1.9%', positive: true, network: 'Ethereum' },
  { symbol: 'BNB', name: 'BNB Chain', balance: '1.20', price: '$592.40', change: '+2.1%', positive: true, network: 'BNB Chain' },
];

export default function PortfolioScreen({ navigation, route }: { navigation: any; route?: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const initialTab = route?.params?.initialTab === 'transactions' ? 'transactions' : 'assets';
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>(initialTab);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { transactions, loadTransactions, balances: dynamicBalances } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab === 'transactions' ? 'transactions' : 'assets');
    }
  }, [route?.params?.initialTab]);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#303030' : '#E5E5E5';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  // Calculate dynamic balances for top 4 assets if present in dynamic store
  const mergedAssets = ALL_PORTFOLIO_ASSETS.map(asset => {
    const symKey = asset.symbol as keyof typeof dynamicBalances;
    if (dynamicBalances && dynamicBalances[symKey] !== undefined) {
      return {
        ...asset,
        balance: dynamicBalances[symKey].toFixed(dynamicBalances[symKey] < 1 ? 4 : 2),
      };
    }
    return asset;
  });

  const filteredAssets = mergedAssets.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q);
  });

  const filteredTxs = transactions.filter(tx => {
    if (activeFilter === 'Sent' && tx.type !== 'sent') return false;
    if (activeFilter === 'Received' && tx.type !== 'received') return false;
    if (activeFilter === 'Swaps' && tx.type !== 'swap') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.asset.toLowerCase().includes(q) ||
        (tx.hash && tx.hash.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Screen Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.screenTitle, { color: colors.text.primary }]}>Portfolio</Text>
      </View>

      {/* Segmented Switcher: [ Assets | Transactions ] */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentTrack, { backgroundColor: monoMutedSurface }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('assets')}
            style={[
              styles.segmentBtn,
              activeTab === 'assets' && { backgroundColor: monoPrimary },
            ]}
            activeOpacity={0.75}
          >
            <Text style={[
              styles.segmentBtnText,
              activeTab === 'assets'
                ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                : { color: colors.text.muted },
            ]}>
              Assets ({mergedAssets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('transactions')}
            style={[
              styles.segmentBtn,
              activeTab === 'transactions' && { backgroundColor: monoPrimary },
            ]}
            activeOpacity={0.75}
          >
            <Text style={[
              styles.segmentBtnText,
              activeTab === 'transactions'
                ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                : { color: colors.text.muted },
            ]}>
              Transactions ({transactions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <SearchIcon color={colors.text.muted} size={15} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={activeTab === 'assets' ? 'Search token by name or symbol...' : 'Search transactions by coin, hash...'}
            placeholderTextColor={colors.text.muted}
            style={[styles.searchInput, { color: colors.text.primary }]}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Transaction Filter Chips */}
      {activeTab === 'transactions' && (
        <View style={styles.filtersRow}>
          {FILTERS.map(filter => {
            const active = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? monoPrimary : cardBg,
                    borderColor: active ? monoPrimary : cardBorder,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: active ? (isDark ? '#000000' : '#FFFFFF') : colors.text.secondary },
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={monoPrimary}
          />
        }
      >
        {/* ======================================================== */}
        {/* OPTION 1: ALL ASSETS LIST                                */}
        {/* ======================================================== */}
        {activeTab === 'assets' && (
          <View style={[styles.listCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {filteredAssets.map((asset, index) => {
              const isLast = index === filteredAssets.length - 1;
              return (
                <TouchableOpacity
                  key={asset.symbol}
                  onPress={() => navigation.navigate('TokenDetail', {
                    symbol: asset.symbol,
                    name: asset.name,
                    price: asset.price,
                    change: asset.change,
                    positive: asset.positive,
                    network: asset.network,
                  })}
                  style={[
                    styles.assetRow,
                    !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder },
                  ]}
                  activeOpacity={0.7}
                >
                  <TokenLogo symbol={asset.symbol} size={38} />
                  <View style={styles.assetColLeft}>
                    <Text style={[styles.assetName, { color: colors.text.primary }]}>{asset.name}</Text>
                    <Text style={[styles.assetSymbol, { color: colors.text.muted }]}>
                      {asset.symbol} • {asset.network}
                    </Text>
                  </View>

                  <View style={styles.assetColRight}>
                    <Text style={[styles.assetBalance, { color: colors.text.primary }]}>
                      {asset.balance} {asset.symbol}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.assetPrice, { color: colors.text.muted }]}>{asset.price}</Text>
                      <Text style={[styles.assetDelta, { color: asset.positive ? '#22C55E' : '#EF4444' }]}>
                        {asset.change}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ======================================================== */}
        {/* OPTION 2: TRANSACTIONS LIST                              */}
        {/* ======================================================== */}
        {activeTab === 'transactions' && (
          <View>
            {filteredTxs.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Transactions Found</Text>
                <Text style={[styles.emptySub, { color: colors.text.muted }]}>
                  Your on-chain transfers, swaps, and received assets will appear here.
                </Text>
              </View>
            ) : (
              filteredTxs.map(tx => {
                const IconComponent = TX_ICONS[tx.type] || TX_ICONS.sent;

                return (
                  <TouchableOpacity
                    key={tx.id}
                    onPress={() => navigation.navigate('TransactionDetail', { tx })}
                    style={[styles.txCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                    activeOpacity={0.75}
                  >
                    <View style={styles.txLeft}>
                      <View style={[styles.txIconCircle, { backgroundColor: monoMutedSurface }]}>
                        <IconComponent color={colors.text.primary} size={16} />
                      </View>
                      <View style={styles.txInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={[styles.txType, { color: colors.text.primary }]}>
                            {tx.type === 'sent' ? 'Sent' : tx.type === 'received' ? 'Received' : 'Swap'}
                          </Text>
                          <Text style={[styles.txTime, { color: colors.text.muted }]}>
                            {tx.time || 'Just now'}
                          </Text>
                        </View>
                        <Text style={[styles.txAssetSub, { color: colors.text.muted }]} numberOfLines={1}>
                          {tx.asset}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <Text style={[styles.txAmount, { color: colors.text.primary }]}>
                        {tx.type === 'received' ? '+' : tx.type === 'swap' ? '' : '-'}{tx.amount} {tx.asset.includes('→') ? '' : tx.asset}
                      </Text>
                      <View style={styles.txStatusRow}>
                        <Text style={[styles.txValue, { color: colors.text.muted }]}>{tx.value}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: monoMutedSurface }]}>
                          <Text style={[styles.statusText, { color: colors.text.secondary }]}>
                            {tx.status}
                          </Text>
                        </View>
                        <ChevronRightIcon color={colors.text.muted} size={12} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  assetColLeft: {
    flex: 1,
    marginLeft: 12,
  },
  assetName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  assetSymbol: {
    fontSize: 12,
    marginTop: 2,
  },
  assetColRight: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  assetPrice: {
    fontSize: 12,
  },
  assetDelta: {
    fontSize: 12,
    fontWeight: '700',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  txIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    gap: 3,
  },
  txType: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  txTime: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  txAssetSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  txStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyCard: {
    padding: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

