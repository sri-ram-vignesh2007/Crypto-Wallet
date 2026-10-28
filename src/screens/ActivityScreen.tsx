// src/screens/ActivityScreen.tsx - Apple Style Activity/History

import React, { useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, FlatList, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';

const ChevronRightIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const ShieldCheckIcon = ({ color = '#16A34A', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" />
  </Svg>
);

const ShieldAlertIcon = ({ color = '#DC2626', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 9v4M12 17h.01" />
  </Svg>
);

const ClockIcon = ({ color = '#94A3B8', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

const ExternalLinkIcon = ({ color = '#94A3B8', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <Path d="M15 3h6v6" />
    <Path d="M10 14L21 3" />
  </Svg>
);

// Mock transaction data
const TRANSACTIONS = [
  { id: 1, type: 'sent', asset: 'ETH', amount: '0.52', value: '$1,782.40', to: '0x742d...8f32', time: '2 min ago', status: 'confirmed', risk: 'normal', hash: '0xabc123...' },
  { id: 2, type: 'received', asset: 'USDC', amount: '500', value: '$500.00', from: '0x8a3f...1c9d', time: '1 hour ago', status: 'confirmed', risk: 'normal', hash: '0xdef456...' },
  { id: 3, type: 'swap', asset: 'ETH → USDC', amount: '0.25', value: '$857.30', from: 'ETH', to: 'USDC', time: '3 hours ago', status: 'confirmed', risk: 'attention', hash: '0xghi789...' },
  { id: 4, type: 'sent', asset: 'SOL', amount: '2.5', value: '$418.25', to: '0x9b2e...4f1a', time: '5 hours ago', status: 'pending', risk: 'normal', hash: '0xjkl012...' },
  { id: 5, type: 'received', asset: 'MATIC', amount: '1,250', value: '$1,062.50', from: '0x4c8d...7e9f', time: '1 day ago', status: 'confirmed', risk: 'high', hash: '0xmno345...' },
  { id: 6, type: 'swap', asset: 'USDC → BTC', amount: '500', value: '$500.00', from: 'USDC', to: 'BTC', time: '2 days ago', status: 'confirmed', risk: 'normal', hash: '0xpqr678...' },
];

const FILTERS = ['All', 'Sent', 'Received', 'Swaps', 'Security'];

export default function ActivityScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  const filteredTxs = TRANSACTIONS.filter(tx => {
    if (activeFilter !== 'All' && tx.type !== activeFilter.toLowerCase()) return false;
    if (searchText && !tx.asset.toLowerCase().includes(searchText.toLowerCase()) &&
        !tx.hash.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const getRiskComponent = (risk: string) => {
    switch (risk) {
      case 'normal': return <ShieldCheckIcon color={colors.success.DEFAULT} size={14} />;
      case 'attention': return <ShieldAlertIcon color={colors.warning.DEFAULT} size={14} />;
      case 'high': return <ShieldAlertIcon color={colors.danger.DEFAULT} size={14} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success.DEFAULT;
      case 'pending': return colors.warning.DEFAULT;
      case 'failed': return colors.danger.DEFAULT;
      default: return colors.text.muted;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx="11" cy="11" r="8" />
              <Path d="M21 21l-4.35-4.35" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="11" cy="11" r="8" />
            <Path d="M21 21l-4.35-4.35" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={colors.text.muted}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter ? styles.filterChipActive : null,
                { backgroundColor: activeFilter === filter ? colors.primary.DEFAULT : colors.bg.surface, borderColor: colors.border.subtle },
              ]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterChipText,
                activeFilter === filter ? { color: colors.text.onPrimary } : { color: colors.text.primary },
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        {filteredTxs.length === 0 ? (
          <View style={styles.emptyState}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <Path d="M16 2v4" />
              <Path d="M8 2v4" />
              <Path d="M3 10h18" />
            </Svg>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No transactions</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>Transactions will appear here when you send, receive, or swap</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTxs}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.txItem,
                  { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                ]}
                onPress={() => navigation.navigate('TransactionDetail', { tx: item })}
                activeOpacity={0.85}
              >
                <View style={styles.txLeft}>
                  <View style={[
                    typesIconBg[item.type],
                    { backgroundColor: colors.primary.muted },
                  ]}>
                    {typesIcons[item.type]({ color: colors.primary.DEFAULT, size: 20 })}
                  </View>
                  <View style={styles.txInfo}>
                    <View style={styles.txTopRow}>
                      <Text style={[styles.txType, { color: colors.text.primary }]}>{txTypeLabels[item.type]}</Text>
                      <Text style={[styles.txTime, { color: colors.text.muted }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.txDetail, { color: colors.text.secondary }]}>{item.asset}</Text>
                  </View>
                </View>
                <View style={styles.txRight}>
                  <View style={styles.txValueRow}>
                    <Text style={[
                      styles.txValue,
                      item.type === 'received' ? { color: colors.success.DEFAULT } : { color: colors.text.primary },
                    ]}>
                      {item.type === 'received' ? '+' : '-'}{item.amount} {item.asset.split(' → ')[0]}
                    </Text>
                    <Text style={[styles.txUsdValue, { color: colors.text.muted }]}>{item.value}</Text>
                  </View>
                  <View style={styles.txStatusRow}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + '15', borderColor: getStatusColor(item.status) },
                    ]}>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                    {getRiskComponent(item.risk)}
                    <ChevronRightIcon color={colors.text.muted} size={16} />
                  </View>
                </View>
              </TouchableOpacity>
            )}>
              <View style={styles.txDivider} />
            </FlatList>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const typesIcons: Record<string, ({ color, size }: { color?: string; size?: number }) => React.ReactElement> = {
  sent: ({ color, size }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 17l10-10M17 7H7v10" />
    </Svg>
  ),
  received: ({ color, size }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 7l-10 10M7 17h10v-10" />
    </Svg>
  ),
  swap: ({ color, size }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 3l4 4-4 4M8 21l-4-4 4-4M4 17h16M20 7H4" />
    </Svg>
  ),
};

const typesIconBg: Record<string, { backgroundColor: string }> = {
  sent: { backgroundColor: '#2563EB15' },
  received: { backgroundColor: '#16A34A15' },
  swap: { backgroundColor: '#8B5CF615' },
};

const txTypeLabels: Record<string, string> = {
  sent: 'Sent',
  received: 'Received',
  swap: 'Swap',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  searchButton: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipActive: { borderWidth: 0 },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  searchInput: { flex: 1, fontSize: 15, color: '#0F172A' },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 40,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txInfo: { flex: 1, gap: 4 },
  txTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txType: { fontSize: 15, fontWeight: '600' },
  txTime: { fontSize: 13, color: '#94A3B8' },
  txDetail: { fontSize: 13, color: '#64748B' },
  txRight: { alignItems: 'flex-end', gap: 8 },
  txValueRow: { alignItems: 'flex-end', gap: 4 },
  txValue: { fontSize: 15, fontWeight: '600' },
  txUsdValue: { fontSize: 13 },
  txStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  txDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: -20 },
});