// src/screens/ActivityScreen.tsx - Institutional Activity & Transaction History

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useTransactionStore, WalletTransaction } from '../store/transactionStore';

const ChevronRightIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const ShieldCheckIcon = ({ color = '#16A34A', size = 13 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" />
  </Svg>
);

const ShieldAlertIcon = ({ color = '#DC2626', size = 13 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 9v4M12 17h.01" />
  </Svg>
);

const FILTERS = ['All', 'Sent', 'Received', 'Swaps', 'Security'];

export default function ActivityScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  const { transactions, loadTransactions } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#303030' : '#E5E5E5';
  const monoMuted = isDark ? '#202020' : '#F2F2F2';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';

  const filteredTxs = transactions.filter(tx => {
    if (activeFilter === 'Sent' && tx.type !== 'sent') return false;
    if (activeFilter === 'Received' && tx.type !== 'received') return false;
    if (activeFilter === 'Swaps' && tx.type !== 'swap') return false;
    if (activeFilter === 'Security' && tx.risk !== 'attention' && tx.risk !== 'high') return false;
    if (searchText && !tx.asset.toLowerCase().includes(searchText.toLowerCase()) &&
        !tx.hash.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const getRiskComponent = (risk: string) => {
    switch (risk) {
      case 'normal': return <ShieldCheckIcon color={colors.text.primary} size={13} />;
      case 'attention': return <ShieldAlertIcon color={colors.text.secondary} size={13} />;
      case 'high': return <ShieldAlertIcon color={colors.danger.DEFAULT} size={13} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header Bar (Matching Community, Swap, and Settings) */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Activity</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="11" cy="11" r="8" />
            <Path d="M21 21l-4.35-4.35" />
          </Svg>
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search transactions, hashes, assets..."
            placeholderTextColor={colors.text.muted}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {FILTERS.map((filter) => {
            const active = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? monoPrimary : cardBg,
                    borderColor: active ? monoPrimary : cardBorder,
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
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

        {/* Transactions List */}
        {filteredTxs.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <Path d="M16 2v4" />
              <Path d="M8 2v4" />
              <Path d="M3 10h18" />
            </Svg>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No transactions found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
              Transactions will appear here when you send, receive, or swap assets.
            </Text>
          </View>
        ) : (
          <View>
            {filteredTxs.map((item) => (
              <TouchableOpacity
                key={item.id.toString()}
                style={[
                  styles.txItem,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
                onPress={() => navigation.navigate('TransactionDetail', { tx: item })}
                activeOpacity={0.8}
              >
                {/* Left Side: Circular Icon + Title + Asset / Time */}
                <View style={styles.txLeft}>
                  <View style={[styles.txIconBox, { backgroundColor: monoMuted }]}>
                    {typesIcons[item.type]
                      ? typesIcons[item.type]({ color: colors.text.primary, size: 18 })
                      : <Circle cx="12" cy="12" r="8" fill={colors.text.primary} />}
                  </View>
                  <View style={styles.txInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.txType, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                        {txTypeLabels[item.type] || 'Transaction'}
                      </Text>
                      <Text style={{ fontSize: 11.5, color: colors.text.muted, fontWeight: '500' }}>
                        {item.time || 'Just now'}
                      </Text>
                    </View>
                    <Text style={[styles.txSubtitle, { color: colors.text.muted }]} numberOfLines={1}>
                      {item.asset}
                    </Text>
                  </View>
                </View>

                {/* Right Side: Amount on top, Value + Status Pill + Chevron on bottom */}
                <View style={styles.txRight}>
                  <Text style={[styles.txValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                    {item.type === 'received' ? '+' : item.type === 'swap' ? '' : '-'}{item.amount} {item.asset.includes('→') ? '' : item.asset}
                  </Text>
                  <View style={styles.txMetaRow}>
                    <Text style={[styles.txUsdValue, { color: colors.text.muted }]}>{item.value}</Text>
                    <View style={[
                      styles.statusBadge,
                      {
                        backgroundColor: item.status === 'failed' ? 'rgba(239, 68, 68, 0.15)' : monoMuted,
                        borderColor: item.status === 'failed' ? '#EF4444' : cardBorder,
                      },
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: item.status === 'failed' ? '#EF4444' : colors.text.secondary },
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                    <ChevronRightIcon color={colors.text.muted} size={12} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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

const txTypeLabels: Record<string, string> = {
  sent: 'Sent',
  received: 'Received',
  swap: 'Swap',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 14,
    borderWidth: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  emptyState: {
    padding: 36,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
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
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    gap: 3,
  },
  txType: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  txSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txUsdValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});