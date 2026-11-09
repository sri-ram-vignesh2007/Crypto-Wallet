// src/screens/ExploreScreen.tsx - Apple Style with News Section

import React, { useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';

const SearchIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const FilterIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 3h18M7 9h10M9 15h6" />
  </Svg>
);

const TrendingIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 9l-6 6-6-6" />
    <Path d="M4 15h16" />
  </Svg>
);

// News data
const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Bitcoin ETF Inflows Hit Record High as Institutions Accumulate',
    source: 'CoinDesk',
    time: '2h ago',
    image: null,
  },
  {
    id: 2,
    title: 'Ethereum Layer 2 Solutions Process 10x More Transactions Than Mainnet',
    source: 'The Block',
    time: '4h ago',
    image: null,
  },
  {
    id: 3,
    title: 'Solana DeFi TVL Surpasses $2B Amid New Protocol Launches',
    source: 'Decrypt',
    time: '6h ago',
    image: null,
  },
  {
    id: 4,
    title: 'Regulatory Clarity Boosts Crypto Market Sentiment',
    source: 'Bloomberg',
    time: '8h ago',
    image: null,
  },
];

const MARKET_MOVERS = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,432', change: '+2.4%', positive: true },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,421', change: '+1.8%', positive: true },
  { symbol: 'SOL', name: 'Solana', price: '$167.32', change: '-0.9%', positive: false },
  { symbol: 'AVAX', name: 'Avalanche', price: '$42.15', change: '+3.2%', positive: true },
  { symbol: 'ARB', name: 'Arbitrum', price: '$1.87', change: '-1.4%', positive: false },
];

const WATCHLIST = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,432', change: '+2.4%', positive: true },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,421', change: '+1.8%', positive: true },
  { symbol: 'SOL', name: 'Solana', price: '$167.32', change: '-0.9%', positive: false },
];

export default function ExploreScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'markets' | 'news' | 'chains'>('markets');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <View style={[styles.searchInputWrapper, { backgroundColor: isDark ? '#171717' : '#F7F7F7', borderColor: colors.border.DEFAULT, borderWidth: 0.5 }]}>
            <SearchIcon color={colors.text.muted} size={18} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search tokens, chains, contracts..."
              placeholderTextColor={colors.text.muted}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: isDark ? '#171717' : '#F7F7F7', borderColor: colors.border.DEFAULT, borderWidth: 0.5 }]}
            onPress={() => navigation.navigate('CustomToken')}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={[styles.tabSelector, { backgroundColor: isDark ? '#171717' : '#F2F2F2' }]}>
          {['markets', 'news', 'chains'].map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  active ? [styles.tabButtonActive, { backgroundColor: isDark ? '#FFFFFF' : '#111111' }] : null,
                ]}
                onPress={() => setActiveTab(tab as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabButtonText,
                  active
                    ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                    : { color: colors.text.muted },
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <>
            {/* Watchlist */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Watchlist</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Explore')} activeOpacity={0.7}>
                  <Text style={[styles.seeAll, { color: colors.text.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.watchlist}>
                {WATCHLIST.map((asset) => (
                  <TouchableOpacity
                    key={asset.symbol}
                    style={[
                      styles.watchlistItem,
                      { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                    ]}
                    onPress={() => navigation.navigate('TokenDetail', { ...asset })}
                    activeOpacity={0.85}
                  >
                    <View style={[
                      styles.assetAvatar,
                      { backgroundColor: isDark ? '#202020' : '#F2F2F2' },
                    ]}>
                      <Text style={[
                        styles.assetAvatarText,
                        { color: colors.text.primary },
                      ]}>
                        {asset.symbol.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.assetInfo}>
                      <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{asset.symbol}</Text>
                      <Text style={[styles.assetName, { color: colors.text.muted }]}>{asset.name}</Text>
                    </View>
                    <View style={styles.assetValue}>
                      <Text style={[styles.assetPrice, { color: colors.text.primary }]}>{asset.price}</Text>
                      <Text style={[
                        styles.assetChange,
                        { color: asset.positive ? colors.text.primary : colors.danger.DEFAULT },
                      ]}>
                        {asset.change}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Market Movers */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Top Movers</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Explore')} activeOpacity={0.7}>
                  <Text style={[styles.seeAll, { color: colors.text.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.moversList}>
                {MARKET_MOVERS.map((asset, i) => (
                  <TouchableOpacity
                    key={asset.symbol}
                    style={[
                      styles.moverItem,
                      { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                    ]}
                    onPress={() => navigation.navigate('TokenDetail', { ...asset })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.moverRank}>
                      <Text style={[styles.moverRankText, { color: colors.text.primary }]}>#{i + 1}</Text>
                    </View>
                    <View style={styles.assetInfo}>
                      <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{asset.symbol}</Text>
                      <Text style={[styles.assetName, { color: colors.text.muted }]}>{asset.name}</Text>
                    </View>
                    <View style={styles.assetValue}>
                      <Text style={[styles.assetPrice, { color: colors.text.primary }]}>{asset.price}</Text>
                      <Text style={[
                        styles.assetChange,
                        { color: asset.positive ? colors.text.primary : colors.danger.DEFAULT },
                      ]}>
                        {asset.change}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <View style={styles.newsList}>
            {NEWS_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.newsCard,
                  { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                ]}
                onPress={() => {}}
                activeOpacity={0.85}
              >
                <View style={styles.newsContent}>
                  <Text style={[styles.newsTitle, { color: colors.text.primary }]}>{item.title}</Text>
                  <View style={styles.newsMeta}>
                    <Text style={[styles.newsSource, { color: colors.text.primary }]}>{item.source}</Text>
                    <Text style={[styles.newsTime, { color: colors.text.muted }]}>{item.time}</Text>
                  </View>
                </View>
                <TrendingIcon color={colors.text.primary} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chains Tab */}
        {activeTab === 'chains' && (
          <View style={styles.chainsList}>
            {['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Base', 'Optimism', 'Avalanche', 'Fantom', 'Solana'].map((chain) => (
              <TouchableOpacity
                key={chain}
                style={[
                  styles.chainCard,
                  { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                ]}
                onPress={() => navigation.navigate('ChainDetail', { chain: { id: chain.toLowerCase(), name: chain, symbol: chain.slice(0, 3).toUpperCase(), color: colors.primary.DEFAULT, tvl: '$' + (Math.random() * 10 + 1).toFixed(1) + 'B', dapps: Math.floor(Math.random() * 500 + 50) + '+' } })}
                activeOpacity={0.85}
              >
                <View style={[
                  styles.chainAvatar,
                  { backgroundColor: isDark ? '#202020' : '#F2F2F2' },
                ]}>
                  <Text style={[
                    styles.chainAvatarText,
                    { color: colors.text.primary },
                  ]}>
                    {chain.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.chainInfo}>
                  <Text style={[styles.chainName, { color: colors.text.primary }]}>{chain}</Text>
                  <Text style={[styles.chainDetail, { color: colors.text.muted }]}>L1 Blockchain</Text>
                </View>
                <Text style={[styles.chainTvl, { color: colors.text.primary }]}>$5.2B TVL</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabButtonText: { fontSize: 14, fontWeight: '500' },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  seeAll: { fontSize: 14, fontWeight: '500', color: '#2563EB' },
  watchlist: { gap: 8 },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  assetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetAvatarText: { fontSize: 16, fontWeight: '700' },
  assetInfo: { flex: 1, gap: 2 },
  assetSymbol: { fontSize: 15, fontWeight: '600' },
  assetName: { fontSize: 13, color: '#64748B' },
  assetValue: { alignItems: 'flex-end', gap: 2 },
  assetPrice: { fontSize: 15, fontWeight: '600' },
  assetChange: { fontSize: 12, fontWeight: '600' },
  moversList: { gap: 8 },
  moverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  moverRank: { width: 28, alignItems: 'center' },
  moverRankText: { fontSize: 13, fontWeight: '600' },
  newsList: { gap: 12 },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  newsContent: { flex: 1, gap: 4 },
  newsTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  newsMeta: { flexDirection: 'row', gap: 8 },
  newsSource: { fontSize: 12, fontWeight: '500' },
  newsTime: { fontSize: 12 },
  chainsList: { gap: 12 },
  chainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  chainAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainAvatarText: { fontSize: 16, fontWeight: '700' },
  chainInfo: { flex: 1, gap: 2 },
  chainName: { fontSize: 15, fontWeight: '600' },
  chainDetail: { fontSize: 13 },
  chainTvl: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
});