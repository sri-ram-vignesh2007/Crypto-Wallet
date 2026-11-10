// src/screens/TransactionDetailScreen.tsx - Institutional-Grade Transaction Detail for Cura Wallet

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform,
  Modal, Pressable, Linking, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';

const ArrowLeftIcon = ({ color, size = 22 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const CheckCircleIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9 12l2 2 4-4" />
  </Svg>
);

const CopyIcon = ({ color, size = 15 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ExternalLinkIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <Path d="M15 3h6v6" />
    <Path d="M10 14L21 3" />
  </Svg>
);

interface Props {
  navigation?: any;
  route?: { params?: { tx?: any; transaction?: any } };
}

export default function TransactionDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const tx = route?.params?.tx || route?.params?.transaction;
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#303030' : '#E5E5E5';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  if (!tx) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={[styles.backButton, { backgroundColor: monoMutedSurface }]}>
            <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={20} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Transaction</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>No Transaction Selected</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>Select a transaction to inspect on-chain details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const assetSymbol = (tx.asset || 'ETH').split(' ')[0].replace('→', '').trim();
  const isConfirmed = tx.status === 'confirmed' || tx.status === 'success';
  const isPending = tx.status === 'pending';
  const txHash = tx.hash || '0xabc1234567890abcdef1234567890abcdef1234';
  const targetAddress = tx.to || tx.from || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const copyToClipboard = async (text: string, type: 'hash' | 'addr') => {
    try {
      await Clipboard.setStringAsync(text);
      if (type === 'hash') {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      } else {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      }
    } catch {}
  };

  const openExplorer = () => {
    const explorerBase = tx.explorer || 'https://etherscan.io/tx/';
    const url = explorerBase.includes('http') ? (explorerBase.endsWith('/') ? `${explorerBase}${txHash}` : explorerBase) : `https://etherscan.io/tx/${txHash}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Explorer Link', url);
    });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      {/* Top Header */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={[styles.backButton, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={20} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Transaction Detail</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.heroLogoRow}>
            <TokenLogo symbol={assetSymbol} size={50} />
          </View>
          <Text style={[styles.heroAmount, { color: isDark ? '#FFFFFF' : '#111111' }]}>
            {tx.type === 'received' ? '+' : tx.type === 'swap' ? '' : '-'}{tx.amount} {tx.asset}
          </Text>
          <Text style={[styles.heroUsd, { color: colors.text.muted }]}>
            {tx.value || '$0.00'}
          </Text>

          <View style={[
            styles.statusPill,
            {
              backgroundColor: isConfirmed
                ? 'rgba(34, 197, 94, 0.15)'
                : isPending
                ? 'rgba(234, 179, 8, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            },
          ]}>
            <CheckCircleIcon
              color={isConfirmed ? '#22C55E' : isPending ? '#EAB308' : '#EF4444'}
              size={14}
            />
            <Text style={[
              styles.statusPillText,
              { color: isConfirmed ? '#22C55E' : isPending ? '#EAB308' : '#EF4444' },
            ]}>
              {tx.status || 'Confirmed'}
            </Text>
          </View>
        </View>

        {/* Breakdown Card */}
        <View style={[styles.detailsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text.muted }]}>Transaction Type</Text>
            <Text style={[styles.value, { color: monoPrimary, textTransform: 'capitalize' }]}>
              {tx.type || 'Transfer'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text.muted }]}>Timestamp</Text>
            <Text style={[styles.value, { color: monoPrimary }]}>
              {tx.time || 'Just now'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text.muted }]}>Network</Text>
            <Text style={[styles.value, { color: monoPrimary }]}>
              {tx.network || 'Ethereum Mainnet'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text.muted }]}>
              {tx.type === 'received' ? 'Sender' : 'Recipient'}
            </Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(targetAddress, 'addr')}
              style={styles.copyRow}
              activeOpacity={0.7}
            >
              <Text style={[styles.valueMono, { color: monoPrimary }]}>
                {targetAddress.slice(0, 8)}...{targetAddress.slice(-6)}
              </Text>
              <CopyIcon color={colors.text.muted} size={14} />
              {copiedAddress && <Text style={styles.copiedText}>Copied</Text>}
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text.muted }]}>Network Gas Fee</Text>
            <Text style={[styles.value, { color: monoPrimary }]}>
              {tx.fee || '~0.0004 ETH ($1.38)'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text.muted }]}>Transaction Hash</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(txHash, 'hash')}
              style={styles.copyRow}
              activeOpacity={0.7}
            >
              <Text style={[styles.valueMono, { color: monoPrimary }]}>
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </Text>
              <CopyIcon color={colors.text.muted} size={14} />
              {copiedHash && <Text style={styles.copiedText}>Copied</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* View on Explorer Button */}
        <TouchableOpacity
          onPress={openExplorer}
          style={[styles.explorerBtn, { backgroundColor: monoPrimary }]}
          activeOpacity={0.8}
        >
          <ExternalLinkIcon color={isDark ? '#000000' : '#FFFFFF'} size={16} />
          <Text style={[styles.explorerBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
            View on Blockchain Explorer
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLogoRow: {
    marginBottom: 14,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroUsd: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 14,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  value: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  valueMono: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copiedText: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '700',
    marginLeft: 2,
  },
  divider: {
    height: 0.5,
  },
  explorerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  explorerBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
