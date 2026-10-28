// src/screens/HomeScreen.tsx - Apple Style Home Dashboard

import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS } from '../core/ChainConfig';
import { ClayButton } from '../components/ClayButton';

// Icons
const SendIcon = ({ color = '#2563EB', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17l10-10M17 7H7v10" />
  </Svg>
);
const ReceiveIcon = ({ color = '#16A34A', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 7l-10 10M7 17h10v-10" />
  </Svg>
);
const SwapIcon = ({ color = '#8B5CF6', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
  </Svg>
);
const BuyIcon = ({ color = '#F59E0B', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 5h20v14H2zM2 10h20M12 5v14" />
  </Svg>
);
const AIInsightIcon = ({ color = '#2563EB', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 8l4 4 4-4M6 12l4 4 4-4M6 16l4 4 4-4" />
    <Circle cx="18" cy="18" r="5" />
  </Svg>
);
const ChevronDownIcon = ({ color = '#94A3B8', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

// Token logos
const EthLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#627EEA" />
    <Path d="M12 5v5.8l4.7 2.1L12 5z" fill="#E5E7EB" />
    <Path d="M12 5L7.3 12.9l4.7-2.1V5z" fill="#FFFFFF" />
  </Svg>
);
const BtcLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F7931A" />
    <Path d="M12 7.5c1.4 0 2.5-1.1 2.5-2.5S13.4 2.5 12 2.5 9.5 3.6 9.5 5 10.6 7.5 12 7.5zm0 10c-1.4 0-2.5-1.1-2.5-2.5S10.6 5 12 5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" fill="#FFFFFF" />
  </Svg>
);
const SolLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#14F195" />
    <Path d="M17 9.5L12 5 7 9.5l5 4.5 5-4.5z" fill="#9945FF" />
  </Svg>
);
const BnbLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#F3BA2F" />
    <Path d="M12 7l3 3-3 3-3-3 3-3z" fill="#FFFFFF" />
  </Svg>
);
const PolygonLogo = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#8247E5" />
    <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#FFFFFF" />
  </Svg>
);

const QUICK_ACTIONS = [
  { id: 'send', label: 'Send', icon: SendIcon, color: '#2563EB' },
  { id: 'receive', label: 'Receive', icon: ReceiveIcon, color: '#16A34A' },
  { id: 'swap', label: 'Swap', icon: SwapIcon, color: '#8B5CF6' },
  { id: 'buy', label: 'Buy', icon: BuyIcon, color: '#F59E0B' },
];

const CHAIN_ICONS: Record<string, () => React.ReactElement> = {
  ethereum: EthLogo,
  bitcoin: BtcLogo,
  solana: SolLogo,
  bsc: BnbLogo,
  polygon: PolygonLogo,
};

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { totalValueUsd, balances, selectedChain, refreshBalances } = useWalletStore();
  const colors = useColors();
  const isDark = useIsDark();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChainName, setSelectedChainName] = useState('Ethereum');
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [aiInsight, setAiInsight] = useState('Your portfolio is well diversified across major chains.');

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const chainList = Object.values(CHAINS);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary.DEFAULT]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Welcome back</Text>
            <Text style={styles.greetingName}>User</Text>
          </View>
          <TouchableOpacity
            style={styles.chainSelector}
            onPress={() => setShowChainSelector(!showChainSelector)}
            activeOpacity={0.7}
          >
            <Text style={styles.chainLabel}>{selectedChainName}</Text>
            <ChevronDownIcon color={colors.text.muted} size={16} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Card */}
        <View style={[styles.portfolioCard, { backgroundColor: colors.primary.DEFAULT }]}>
          <Text style={styles.portfolioLabel}>Total Balance</Text>
          <Text style={styles.portfolioValue}>{formatValue(totalValueUsd)}</Text>
          <Text style={styles.portfolioSubtitle}>≈ ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
                onPress={() => navigation.navigate(action.id.charAt(0).toUpperCase() + action.id.slice(1))}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <action.icon color={action.color} size={24} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.text.primary }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Insight */}
        <View style={[
          styles.aiCard,
          { backgroundColor: colors.primary.muted, borderColor: colors.primary.DEFAULT },
        ]}>
          <View style={styles.aiHeader}>
            <View style={[styles.aiIcon, { backgroundColor: colors.primary.DEFAULT }]}>
              <AIInsightIcon color="#FFFFFF" size={18} />
            </View>
            <Text style={[styles.aiTitle, { color: colors.text.primary }]}>AI Insight</Text>
          </View>
          <Text style={[styles.aiText, { color: colors.text.secondary }]}>{aiInsight}</Text>
        </View>

        {/* Assets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assets</Text>
          </View>
          {balances.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text.muted }]}>No assets yet. Receive or buy crypto to get started.</Text>
            </View>
          ) : (
            <View style={styles.assetsList}>
              {balances.map((balance, index) => {
                const Logo = CHAIN_ICONS[balance.token.id] || (() => (
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="11" fill="#E2E8F0" />
                  </Svg>
                ));
                return (
                  <TouchableOpacity
                    key={`${balance.token.id}-${index}`}
                    style={[
                      styles.assetRow,
                      { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                    ]}
                    onPress={() => navigation.navigate('AssetDetail', { asset: balance })}
                    activeOpacity={0.85}
                  >
                    <Logo />
                    <View style={styles.assetInfo}>
                      <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{balance.token.symbol}</Text>
                      <Text style={[styles.assetName, { color: colors.text.muted }]}>{balance.token.name}</Text>
                    </View>
                    <View style={styles.assetValue}>
                      <Text style={[styles.assetAmount, { color: colors.text.primary }]}>{formatValue(balance.valueUsd)}</Text>
                      <Text style={[styles.assetBalance, { color: colors.text.muted }]}>{parseFloat(balance.balance).toFixed(4)} {balance.token.symbol}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Chain Selector Modal */}
      {showChainSelector && (
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={() => setShowChainSelector(false)} activeOpacity={1} style={styles.modalBackdrop} />
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Network</Text>
            {chainList.map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={styles.chainOption}
                onPress={() => {
                  setSelectedChainName(chain.name);
                  setShowChainSelector(false);
                }}
                activeOpacity={0.7}
              >
                {(() => {
                  const ChainLogo = CHAIN_ICONS[chain.id];
                  return ChainLogo ? <ChainLogo /> : (
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="11" fill="#E2E8F0" />
                    </Svg>
                  );
                })()}
                <Text style={styles.chainOptionName}>{chain.name}</Text>
                <Text style={styles.chainOptionSymbol}>{chain.symbol}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    flex: 1,
  },
  greetingText: { fontSize: 17, fontWeight: '400', color: '#64748B' },
  greetingName: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  chainSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  chainLabel: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  portfolioCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  portfolioLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  portfolioValue: { fontSize: 42, fontWeight: '700', color: '#FFFFFF', letterSpacing: -1.5, marginTop: 8 },
  portfolioSubtitle: { fontSize: 14, fontWeight: '400', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: { fontSize: 15, fontWeight: '600' },
  aiCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: 15, fontWeight: '600' },
  aiText: { fontSize: 14, lineHeight: 22, flex: 1 },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
  assetsList: { gap: 8 },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  assetInfo: { flex: 1, gap: 2 },
  assetSymbol: { fontSize: 15, fontWeight: '600' },
  assetName: { fontSize: 13 },
  assetValue: { alignItems: 'flex-end', gap: 2 },
  assetAmount: { fontSize: 15, fontWeight: '600' },
  assetBalance: { fontSize: 13 },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1000,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  chainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  chainOptionName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  chainOptionSymbol: { fontSize: 14, color: '#64748B' },
});