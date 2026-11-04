// src/screens/WalletScreen.tsx
// Cryptonite Web3 Fintech UI & UX — Responsive Dark Gradient Hero Card, Watchlist 2x2 Grid & Dynamic Device Safe Areas.

import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet,
  RefreshControl, Platform, Modal, Pressable, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useProfileStore } from '../store/profileStore';
import { theme } from '../theme/Theme';

interface Props {
  navigation?: any;
}

// ── CRYPTONITE SVG ICONS ───────────────────────────────────────────────────
const SendArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ReceiveArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M12 19l-6-6M12 19l6-6" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BuyCreditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="12" rx="3" stroke="#FFFFFF" strokeWidth={2} />
    <Path d="M3 10h18" stroke="#FFFFFF" strokeWidth={2} />
  </Svg>
);

const ExchangeRefreshIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 11A8 8 0 0 0 4.5 9M4 5v4h4M4 13a8 8 0 0 0 15.5 2m.5 4v-4h-4" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BellIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ChevronDownSmallIcon = () => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.7)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusSmallIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#A1A1AA" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const TrendUpIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M7 17L17 7M17 7H9M17 7V15" stroke="#10B981" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Coin SVG Logos
const BtcLogo = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F7931A" />
    <Path d="M14.8 10.5c.3-.8 0-1.7-.8-2.1-.4-.2-1-.3-1.6-.3H9.5v4.6h3.2c.7 0 1.5-.2 1.8-.9.2-.4.2-.9.3-1.3zM15.4 14.8c.4-.9 0-2-.9-2.4-.5-.3-1.1-.4-1.8-.4H9.5v5.3h3.5c.9 0 1.7-.2 2.1-1 .3-.4.4-1 .3-1.5z" fill="#FFFFFF" />
  </Svg>
);

const EthLogo = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#8B5CF6" />
    <Path d="M12 5v5.8l4.7 2.1L12 5z" fill="#E5E7EB" />
    <Path d="M12 5L7.3 12.9l4.7-2.1V5z" fill="#FFFFFF" />
    <Path d="M12 14.2v4.8l4.7-6.7-4.7 1.9z" fill="#E5E7EB" />
    <Path d="M12 19v-4.8L7.3 12.3l4.7 6.7z" fill="#FFFFFF" />
  </Svg>
);

const BnbLogo = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F3BA2F" />
    <Path d="M12 6l2.2 2.2-2.2 2.2L9.8 8.2 12 6zm-4.4 4.4L9.8 12.6 7.6 14.8 5.4 12.6l2.2-2.2zm8.8 0l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zM12 15l2.2 2.2-2.2 2.2-2.2-2.2L12 15z" fill="#FFFFFF" />
  </Svg>
);

const AdaLogo = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#0033AD" />
    <Circle cx="12" cy="12" r="3.5" fill="#FFFFFF" />
    <Circle cx="12" cy="5.5" r="1.2" fill="#FFFFFF" />
    <Circle cx="12" cy="18.5" r="1.2" fill="#FFFFFF" />
    <Circle cx="5.5" cy="12" r="1.2" fill="#FFFFFF" />
    <Circle cx="18.5" cy="12" r="1.2" fill="#FFFFFF" />
  </Svg>
);

export default function WalletScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { totalValueUsd, refreshBalances } = useWalletStore();
  const { name, avatar } = useProfileStore();

  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isTablet = width >= 768;
  const gridCardWidth = isTablet ? (width - 64) / 3 : (width - 44) / 2;

  useEffect(() => {
    refreshBalances();
    const interval = setInterval(refreshBalances, 15000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
  };

  const watchlistItems = [
    { id: 'btc', symbol: 'BTC', name: 'Bitcoin',  price: '$61,724.53', pnl: '+1.98%', positive: true,  Logo: BtcLogo },
    { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: '$4,379.48',  pnl: '+2.92%', positive: true,  Logo: EthLogo },
    { id: 'bnb', symbol: 'BNB', name: 'BNB Chain',price: '$584.20',   pnl: '+0.85%', positive: true,  Logo: BnbLogo },
    { id: 'ada', symbol: 'ADA', name: 'Cardano',  price: '$0.485',    pnl: '+3.12%', positive: true,  Logo: AdaLogo },
  ];

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'A';

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Math.max(16, insets.top + 8),
          paddingBottom: Math.max(90, insets.bottom + 85),
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
      >
        {/* ── HEADER (Avatar + Hi Andreas & Bell Icon) ─────────────────── */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.userProfileChip} onPress={() => setProfileOpen(true)} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatar && avatar !== 'U' ? avatar : initials}</Text>
            </View>
            <Text style={styles.greetingText}>Hi, {name || 'Andreas'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation?.navigate?.('History')} activeOpacity={0.8}>
            <BellIcon />
          </TouchableOpacity>
        </View>

        {/* ── GLOWING GRADIENT HERO CARD (Cryptonite Header Banner) ────── */}
        <View style={styles.gradientHeroCard}>
          <Text style={styles.totalAssetsLabel}>Total Assets</Text>

          <Text style={styles.heroBalanceText}>
            {hideBalance
              ? '$••••••••'
              : `$${totalValueUsd > 0 ? totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '124,224.05'}`}
          </Text>

          <View style={styles.pnlRow}>
            <Text style={styles.pnlText}>+2,92% ($16,148.82)</Text>
          </View>

          <TouchableOpacity
            style={styles.hidePillBtn}
            onPress={() => setHideBalance(!hideBalance)}
            activeOpacity={0.8}
          >
            <ChevronDownSmallIcon />
            <Text style={styles.hidePillText}>{hideBalance ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>

          {/* 4 CIRCULAR ACTION BUTTONS */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation?.navigate?.('Send')} activeOpacity={0.8}>
              <View style={styles.actionCircleBg}>
                <SendArrowIcon />
              </View>
              <Text style={styles.actionItemLabel}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation?.navigate?.('Receive')} activeOpacity={0.8}>
              <View style={styles.actionCircleBg}>
                <ReceiveArrowIcon />
              </View>
              <Text style={styles.actionItemLabel}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation?.navigate?.('Buy')} activeOpacity={0.8}>
              <View style={styles.actionCircleBg}>
                <BuyCreditIcon />
              </View>
              <Text style={styles.actionItemLabel}>Buy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation?.navigate?.('Swap')} activeOpacity={0.8}>
              <View style={styles.actionCircleBg}>
                <ExchangeRefreshIcon />
              </View>
              <Text style={styles.actionItemLabel}>Exchange</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── WATCHLIST SECTION (Matching Image 2x2 Grid) ───────────────── */}
        <View style={styles.watchlistHeaderRow}>
          <Text style={styles.watchlistTitle}>Watchlist</Text>
          <TouchableOpacity style={styles.addNewPill} onPress={() => navigation?.navigate?.('Markets')} activeOpacity={0.8}>
            <PlusSmallIcon />
            <Text style={styles.addNewText}>Add new</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.watchlistGrid}>
          {watchlistItems.map((coin) => (
            <TouchableOpacity
              key={coin.id}
              style={[styles.gridCard, { width: gridCardWidth }]}
              activeOpacity={0.8}
              onPress={() => navigation?.navigate?.('CoinDetail', {
                coin: {
                  id: coin.id,
                  symbol: coin.symbol,
                  name: coin.name,
                  current_price: parseFloat(coin.price.replace('$', '').replace(',', '')),
                  price_change_percentage_24h: 2.92,
                },
              })}
            >
              <View style={styles.gridCardTop}>
                <coin.Logo />
              </View>
              <Text style={styles.coinNameText}>{coin.name}</Text>
              <Text style={styles.coinSymbolText}>{coin.symbol}</Text>

              <Text style={styles.coinPriceText}>{coin.price}</Text>

              <View style={styles.coinPnlRow}>
                <TrendUpIcon />
                <Text style={styles.coinPnlText}>{coin.pnl}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D15',
  },

  // HEADER
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E1B32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#3B2D60',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  greetingText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#171723',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },

  // HERO GRADIENT BANNER CARD (Cryptonite Header Card)
  gradientHeroCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 32,
    padding: 24,
    paddingBottom: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.40,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalAssetsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  heroBalanceText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'] as any,
    marginBottom: 4,
  },
  pnlRow: {
    marginBottom: 12,
  },
  pnlText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  hidePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 22,
  },
  hidePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // 4 CIRCULAR ACTION BUTTONS
  heroActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircleBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  actionItemLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // WATCHLIST SECTION
  watchlistHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  watchlistTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  addNewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#171723',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  addNewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA',
  },

  // WATCHLIST 2x2 GRID
  watchlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    backgroundColor: '#171723',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gridCardTop: {
    marginBottom: 12,
  },
  coinNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coinSymbolText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 12,
  },
  coinPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'] as any,
    marginBottom: 4,
  },
  coinPnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  coinPnlText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
});
