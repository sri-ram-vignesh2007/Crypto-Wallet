// src/screens/TokenDetailScreen.tsx - Apple Style Token Detail

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme, useColors, useSpacing, useBorderRadius, useTypography } from '../theme/ThemeContext';

interface Props {
  navigation: any;
  route: { params: { symbol: string; name: string; price: string; change: string; icon?: string } };
}

export default function TokenDetailScreen({ navigation, route }: Props) {
  const { params } = route;
  const { symbol, name, price, change } = params;
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const typography = useTypography();
  const isPositive = !change.startsWith('-');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[
            styles.tokenBadge,
            { backgroundColor: colors.primary.muted },
          ]}>
            <Text style={[styles.tokenSymbol, { color: colors.primary.DEFAULT }]}>{symbol}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.tokenName, { color: colors.text.primary }]}>{name}</Text>
            <Text style={[styles.tokenPrice, { color: colors.text.primary }]}>${price}</Text>
            <Text style={[
              styles.priceChange,
              { color: isPositive ? colors.success.DEFAULT : colors.danger.DEFAULT },
            ]}>
              {change} (24h)
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary.DEFAULT }]}>
            <Text style={styles.actionBtnText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT, borderWidth: 1 }]}>
            <Text style={[styles.actionBtnText, { color: colors.text.primary }]}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT, borderWidth: 1 }]}>
            <Text style={[styles.actionBtnText, { color: colors.text.primary }]}>Swap</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Market Data</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Market Cap', value: '$1.2B' },
              { label: 'Volume (24h)', value: '$45.6M' },
              { label: 'Circulating Supply', value: '100M' },
              { label: 'Total Supply', value: '1B' },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{stat.label}</Text>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About</Text>
          <Text style={[styles.aboutText, { color: colors.text.secondary }]}>
            {name} ({symbol}) is a decentralized cryptocurrency token built on blockchain technology.
            It enables secure, fast, and low-cost transactions across the network.
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  tokenBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSymbol: { fontSize: 20, fontWeight: '700' },
  headerInfo: { flex: 1 },
  tokenName: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  tokenPrice: { fontSize: 28, fontWeight: '700' },
  priceChange: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  statLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '600' },
  aboutText: { fontSize: 14, lineHeight: 22 },
});