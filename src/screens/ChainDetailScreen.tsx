// src/screens/ChainDetailScreen.tsx - Apple Style Chain Detail

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme, useColors, useSpacing, useBorderRadius, useTypography } from '../theme/ThemeContext';

interface Props {
  navigation: any;
  route: { params: { chain: { id: string; name: string; symbol: string; color: string; tvl: string; dapps: string; icon: string } } };
}

export default function ChainDetailScreen({ navigation, route }: Props) {
  const { chain } = route.params;
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const typography = useTypography();

  const chainColors: Record<string, string> = {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F3BA2F',
    arbitrum: '#28A0F0',
    base: '#0052FF',
    optimism: '#FF0420',
    avalanche: '#E84142',
    fantom: '#1969FF',
    cronos: '#0038FF',
    solana: '#9945FF',
  };

  const chainColor = chainColors[chain.id] || chain.color;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[
          styles.header,
          { backgroundColor: chainColor },
        ]}>
          <View style={styles.chainBadge}>
            <Text style={styles.chainSymbol}>{chain.symbol}</Text>
          </View>
          <View>
            <Text style={styles.chainName}>{chain.name}</Text>
            <Text style={styles.chainSymbol}>Native: {chain.symbol}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Network Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Total Value Locked</Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{chain.tvl}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Active dApps</Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{chain.dapps}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary.DEFAULT }]}>
            <Text style={styles.actionBtnText}>Add Network</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: colors.border.DEFAULT }]}>
            <Text style={[styles.actionBtnOutlineText, { color: colors.text.primary }]}>View on Explorer</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About</Text>
          <Text style={[styles.aboutText, { color: colors.text.secondary }]}>
            {chain.name} is a high-performance blockchain network supporting smart contracts and decentralized applications.
            Native token: {chain.symbol}. Compatible with EVM and major DeFi protocols.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  chainBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chainSymbol: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  chainName: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 16, color: '#0F172A' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  statLabel: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  actionBtnOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBtnOutlineText: { fontSize: 16, fontWeight: '600' },
  aboutText: { fontSize: 14, lineHeight: 22, color: '#64748B' },
});