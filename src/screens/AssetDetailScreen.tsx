// src/screens/AssetDetailScreen.tsx
// Vault System — Asset Detail Screen
// Asset balance, fiat value, price/change, selected network, small chart, transaction list,
// Send, Receive, Swap, and AI explanation entry point

import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import {
  useTheme, useColors, useSpacing, useBorderRadius, useShadows, useTypography, useIsDark,
  spacing, borderRadius, colors, shadows, typography, theme,
} from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { AIAssistantFAB } from '../components/AIAssistantFAB';

interface Props {
  navigation?: any;
  route?: { params?: { asset?: any } };
}

// ── ICONS ───────────────────────────────────────────────────────────────────
const ArrowUpRightIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="13" x2="18" y2="6" />
    <Line x1="18" y1="6" x2="12" y2="6" />
    <Path d="M8 14l6-6" />
  </Svg>
);

const ArrowDownLeftIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="6" y1="18" x2="6" y2="11" />
    <Line x1="6" y1="11" x2="12" y2="11" />
    <Path d="M16 10l-6 6" />
  </Svg>
);

const ArrowLeftIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const MoreVerticalIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="1" />
    <Circle cx="12" cy="5" r="1" />
    <Circle cx="12" cy="19" r="1" />
  </Svg>
);

const SendIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Path d="M19 12H5" />
    <Path d="M12 5l-7 7" />
    <Path d="M12 5l7 7" />
  </Svg>
);

const ReceiveIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Path d="M5 12h14" />
    <Path d="M12 5l7 7" />
    <Path d="M5 12l7 7" />
  </Svg>
);

const SwapIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 16h10" />
    <Path d="M11 20a8 8 0 0 0 8-8" />
    <Path d="M17 16l4 4-4 4" />
    <Path d="M17 4a8 8 0 1 1-16 0" />
    <Path d="M7 8l-4 4 4 4" />
  </Svg>
);

const SparklesIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2v4" />
    <Path d="M12 18v4" />
    <Path d="M4.93 4.93l2.83 2.83" />
    <Path d="M16.24 16.24l2.83 2.83" />
    <Path d="M2 12h4" />
    <Path d="M18 12h4" />
    <Path d="M4.93 19.07l2.83-2.83" />
    <Path d="M16.24 7.76l2.83-2.83" />
  </Svg>
);

const ClockIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

const ExternalLinkIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <Path d="M15 3h6v6" />
    <Path d="M10 14L21 3" />
  </Svg>
);

const ChevronRightIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const ChevronDownIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const NetworkIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="2" width="20" height="20" rx="2" />
    <Path d="M7 12h10" />
    <Path d="M12 7v10" />
  </Svg>
);

const RefreshCwIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 4v6h-6" />
    <Path d="M1 20v-6h6" />
    <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Svg>
);

// Token logos
const EthLogo = () => (
  <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="#627EEA" />
    <Path d="M12 5v5.8l4.7 2.1L12 5z" fill="#E5E7EB" />
    <Path d="M12 5L7.3 12.9l4.7-2.1V5z" fill="#FFFFFF" />
    <Path d="M12 14.2v4.8l4.7-6.7-4.7 1.9z" fill="#E5E7EB" />
    <Path d="M12 19v-4.8L7.3 12.3l4.7 6.7z" fill="#FFFFFF" />
  </Svg>
);

// Simple line chart for price history
const PriceChart = ({ data, color, width = 300, height = 100 }: { data: number[]; color: string; width?: number; height?: number }) => {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((value, i) => {
    const x = i * stepX;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Mock transaction data
const MOCK_TRANSACTIONS = [
  { id: '1', type: 'sent', symbol: 'ETH', amount: '0.5 ETH', fiat: '$1,598.23', network: 'Ethereum', status: 'success', time: '2 hours ago', hash: '0xabc123...', from: '0x742...', to: '0x9f8...' },
  { id: '2', type: 'received', symbol: 'USDC', amount: '500 USDC', fiat: '$500.00', network: 'Ethereum', status: 'success', time: '5 hours ago', hash: '0xdef456...', from: '0x3a2...', to: '0x742...' },
  { id: '3', type: 'swap', symbol: 'ETH → MATIC', amount: '0.1 ETH → 723 MATIC', fiat: '$319.65', network: 'Polygon', status: 'success', time: '1 day ago', hash: '0xghi789...', from: '0x742...', to: '0x742...' },
  { id: '4', type: 'sent', symbol: 'ETH', amount: '0.05 ETH', fiat: '$159.82', network: 'Ethereum', status: 'failed', time: '2 days ago', hash: '0xjkl012...', from: '0x742...', to: '0x1b3...' },
];

export default function AssetDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();
  const isDark = useIsDark();

  const asset = route?.params?.asset || {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    logo: EthLogo,
    network: 'Ethereum',
    networkColor: '#627EEA',
    quantity: '2.45',
    fiatValue: '$7,842.30',
    change24h: '+2.34%',
    positive: true,
    price: '$3,201.45',
  };

  const [selectedNetwork, setSelectedNetwork] = useState(asset.network);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const formatChange = (change?: string) => {
    const safeStr = change || '+0.00%';
    const positive = safeStr.startsWith('+');
    return { text: safeStr, positive };
  };

  const changeData = formatChange(asset?.change24h);

  // Generate mock chart data
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const rawPriceStr = String(asset?.price || asset?.fiatValue || '100');
    const base = parseFloat(rawPriceStr.replace('$', '').replace(/,/g, '')) || 100;
    const variance = (Math.random() - 0.5) * base * 0.05;
    return base + variance;
  });

  return (
    <SafeAreaView style={[
      styles.root,
      { backgroundColor: colors.bg.canvas },
    ]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: spacing.sm,
          paddingBottom: Math.max(100, insets.bottom + 80),
          paddingHorizontal: spacing.screenPaddingHorizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeftIcon color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => { /* TODO: More options */ }}
            activeOpacity={0.8}
            accessibilityLabel="More options"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVerticalIcon color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* ── ASSET HEADER CARD ─────────────────────────────────────────────── */}
        <View style={[
          styles.assetHeaderCard,
          {
            backgroundColor: colors.bg.surface,
            borderColor: colors.border.subtle,
            borderRadius: borderRadius.cardLarge,
            ...shadows.claySubtle,
          },
        ]}>
          {/* Token icon and info */}
          <View style={styles.assetHeaderTop}>
            <View style={[
              styles.assetLogoWrap,
              { backgroundColor: asset.networkColor + '15' },
            ]}>
              <asset.logo />
            </View>
            <View style={styles.assetHeaderInfo}>
              <View style={styles.assetHeaderNameRow}>
                <Text style={[
                  styles.assetHeaderName,
                  { color: colors.text.primary, ...typography.h2 },
                ]}>
                  {asset.name}
                </Text>
                <Text style={[
                  styles.assetHeaderSymbol,
                  { color: colors.text.secondary, ...typography.bodyMedium },
                ]}>
                  {asset.symbol}
                </Text>
              </View>
              <View style={styles.assetHeaderNetworkRow}>
                <NetworkIcon color={asset.networkColor} size={12} />
                <Text style={[
                  styles.assetHeaderNetwork,
                  { color: asset.networkColor, ...typography.labelSmall },
                ]}>
                  {asset.network}
                </Text>
              </View>
            </View>
          </View>

          {/* Balance and value */}
          <View style={styles.assetHeaderBalance}>
            <Text style={[
              styles.assetHeaderQuantity,
              { color: colors.text.primary, ...typography.numberLarge },
            ]}>
              {asset.quantity} {asset.symbol}
            </Text>
            <Text style={[
              styles.assetHeaderFiat,
              { color: colors.text.secondary, ...typography.numberMedium },
            ]}>
              ≈ {asset.fiatValue}
            </Text>
          </View>

          {/* Price row with chart */}
          <View style={styles.assetHeaderPriceRow}>
            <View style={styles.priceInfo}>
              <Text style={[
                styles.priceLabel,
                { color: colors.text.secondary, ...typography.caption },
              ]}>
                Price
              </Text>
              <View style={styles.priceValueRow}>
                <Text style={[
                  styles.priceValue,
                  { color: colors.text.primary, ...typography.numberMedium },
                ]}>
                  {asset.price}
                </Text>
                <View style={[
                  styles.priceChangeBadge,
                  { backgroundColor: changeData.positive ? colors.success.muted : colors.danger.muted },
                ]}>
                  <Text style={[
                    styles.priceChangeText,
                    {
                      color: changeData.positive ? colors.success.DEFAULT : colors.danger.DEFAULT,
                      ...typography.labelSmall,
                    },
                  ]}>
                    {asset.change24h} (24h)
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.priceChartWrap}>
              <PriceChart data={chartData} color={changeData.positive ? colors.success.DEFAULT : colors.danger.DEFAULT} width={160} height={60} />
            </View>
          </View>

          {/* Action buttons row */}
          <View style={styles.assetActionsRow}>
            <TouchableOpacity
              style={[
                styles.assetActionButton,
                { backgroundColor: colors.bg.surfaceMuted, borderColor: colors.border.subtle },
              ]}
              onPress={() => navigation?.navigate?.('Send', { asset })}
              activeOpacity={0.85}
            >
              <SendIcon color={colors.text.primary} size={20} />
              <Text style={[
                styles.assetActionLabel,
                { color: colors.text.primary, ...typography.labelMedium },
              ]}>
                Send
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.assetActionButton,
                { backgroundColor: colors.bg.surfaceMuted, borderColor: colors.border.subtle },
              ]}
              onPress={() => navigation?.navigate?.('Receive', { asset })}
              activeOpacity={0.85}
            >
              <ReceiveIcon color={colors.text.primary} size={20} />
              <Text style={[
                styles.assetActionLabel,
                { color: colors.text.primary, ...typography.labelMedium },
              ]}>
                Receive
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.assetActionButton,
                { backgroundColor: colors.bg.surfaceMuted, borderColor: colors.border.subtle },
              ]}
              onPress={() => navigation?.navigate?.('Swap', { fromAsset: asset })}
              activeOpacity={0.85}
            >
              <SwapIcon color={colors.text.primary} size={20} />
              <Text style={[
                styles.assetActionLabel,
                { color: colors.text.primary, ...typography.labelMedium },
              ]}>
                Swap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.assetActionButton,
                { backgroundColor: colors.primary.muted, borderColor: colors.primary.DEFAULT + '30' },
              ]}
              onPress={() => navigation?.navigate?.('AIAssistant', { context: 'asset', asset })}
              activeOpacity={0.85}
            >
              <SparklesIcon color={colors.primary.DEFAULT} size={20} />
              <Text style={[
                styles.assetActionLabel,
                { color: colors.primary.DEFAULT, ...typography.labelMedium },
              ]}>
                AI Insight
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── TRANSACTION HISTORY ───────────────────────────────────────────── */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              { color: colors.text.primary, ...typography.h3 },
            ]}>
              Activity
            </Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation?.navigate?.('Activity', { filter: asset.symbol })}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.viewAllText,
                { color: colors.primary.DEFAULT, ...typography.labelMedium },
              ]}>
                View all
              </Text>
              <ChevronRightIcon color={colors.primary.DEFAULT} size={14} />
            </TouchableOpacity>
          </View>

          <View style={[
            styles.transactionsList,
            { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
          ]}>
            {MOCK_TRANSACTIONS.map((tx, index) => (
              <TouchableOpacity
                key={tx.id}
                style={[
                  styles.transactionRow,
                  {
                    borderBottomWidth: index < MOCK_TRANSACTIONS.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border.divider,
                  },
                ]}
                onPress={() => setExpandedTxId(expandedTxId === tx.id ? null : tx.id)}
                activeOpacity={0.8}
              >
                {/* Type indicator */}
                <View style={[
                  styles.txTypeIndicator,
                  {
                    backgroundColor: tx.type === 'sent' ? colors.danger.muted :
                                   tx.type === 'received' ? colors.success.muted :
                                   tx.type === 'swap' ? colors.primary.muted :
                                   colors.warning.muted,
                  },
                ]}>
                  {tx.type === 'sent' && <ArrowUpRightIcon color={colors.danger.DEFAULT} size={14} />}
                  {tx.type === 'received' && <ArrowDownLeftIcon color={colors.success.DEFAULT} size={14} />}
                  {tx.type === 'swap' && <SwapIcon color={colors.primary.DEFAULT} size={14} />}
                  {tx.type === 'failed' && <ExternalLinkIcon color={colors.warning.DEFAULT} size={14} />}
                </View>

                {/* Transaction details */}
                <View style={styles.txDetails}>
                  <View style={styles.txTopRow}>
                    <Text style={[
                      styles.txSymbol,
                      { color: colors.text.primary, ...typography.bodyMedium },
                    ]}>
                      {tx.symbol}
                    </Text>
                    <Text style={[
                      styles.txStatus,
                      {
                        color: tx.status === 'success' ? colors.success.DEFAULT :
                               tx.status === 'failed' ? colors.danger.DEFAULT :
                               colors.warning.DEFAULT,
                        ...typography.micro,
                      },
                    ]}>
                      {tx.status === 'success' ? 'Success' : tx.status === 'failed' ? 'Failed' : 'Pending'}
                    </Text>
                  </View>
                  <View style={styles.txBottomRow}>
                    <Text style={[
                      styles.txAmount,
                      { color: colors.text.secondary, ...typography.caption },
                    ]}>
                      {tx.amount}
                    </Text>
                    <Text style={[
                      styles.txTime,
                      { color: colors.text.muted, ...typography.micro },
                    ]}>
                      {tx.time}
                    </Text>
                  </View>
                </View>

                {/* Fiat value */}
                <View style={styles.txValueColumn}>
                  <Text style={[
                    styles.txFiatValue,
                    { color: colors.text.primary, ...typography.numberSmall },
                  ]}>
                    {tx.fiat}
                  </Text>
                  <ChevronRightIcon color={colors.text.muted} size={14} />
                </View>
              </TouchableOpacity>
            ))}

            {/* Expanded transaction details */}
            {expandedTxId && MOCK_TRANSACTIONS.find(tx => tx.id === expandedTxId) && (
              <View style={[
                styles.expandedTx,
                { backgroundColor: colors.bg.surfaceMuted, borderColor: colors.border.subtle },
              ]}>
                {(() => {
                  const tx = MOCK_TRANSACTIONS.find(t => t.id === expandedTxId)!;
                  return (
                    <View style={styles.expandedContent}>
                      <View style={styles.expandedRow}>
                        <Text style={[
                          styles.expandedLabel,
                          { color: colors.text.secondary, ...typography.caption },
                        ]}>
                          Status
                        </Text>
                        <Text style={[
                          styles.expandedValue,
                          {
                            color: tx.status === 'success' ? colors.success.DEFAULT :
                                   tx.status === 'failed' ? colors.danger.DEFAULT :
                                   colors.warning.DEFAULT,
                            ...typography.bodySmall,
                          },
                        ]}>
                          {tx.status === 'success' ? 'Success' : tx.status === 'failed' ? 'Failed' : 'Pending'}
                        </Text>
                      </View>
                      <View style={styles.expandedRow}>
                        <Text style={[
                          styles.expandedLabel,
                          { color: colors.text.secondary, ...typography.caption },
                        ]}>
                          Network
                        </Text>
                        <Text style={[
                          styles.expandedValue,
                          { color: colors.text.primary, ...typography.bodySmall },
                        ]}>
                          {tx.network}
                        </Text>
                      </View>
                      <View style={styles.expandedRow}>
                        <Text style={[
                          styles.expandedLabel,
                          { color: colors.text.secondary, ...typography.caption },
                        ]}>
                          From
                        </Text>
                        <TouchableOpacity
                          onPress={() => { /* Copy to clipboard */ }}
                          style={styles.expandedValueContainer}
                        >
                          <Text style={[
                            styles.expandedValue,
                            { color: colors.text.primary, ...typography.bodySmall },
                          ]}>
                            {tx.from}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.expandedRow}>
                        <Text style={[
                          styles.expandedLabel,
                          { color: colors.text.secondary, ...typography.caption },
                        ]}>
                          To
                        </Text>
                        <TouchableOpacity
                          onPress={() => { /* Copy to clipboard */ }}
                          style={styles.expandedValueContainer}
                        >
                          <Text style={[
                            styles.expandedValue,
                            { color: colors.text.primary, ...typography.bodySmall },
                          ]}>
                            {tx.to}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.expandedRow}>
                        <Text style={[
                          styles.expandedLabel,
                          { color: colors.text.secondary, ...typography.caption },
                        ]}>
                          Transaction Hash
                        </Text>
                        <TouchableOpacity
                          onPress={() => { /* Copy to clipboard */ }}
                          style={styles.expandedValueContainer}
                        >
                          <Text style={[
                            styles.expandedValue,
                            { color: colors.text.primary, ...typography.bodySmall },
                          ]}>
                            {tx.hash}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.expandedActions}>
                        <TouchableOpacity
                          style={[
                            styles.expandedActionButton,
                            { backgroundColor: colors.primary.muted, borderColor: colors.primary.DEFAULT + '30' },
                          ]}
                          onPress={() => navigation?.navigate?.('AIAssistant', { context: 'transaction', tx })}
                          activeOpacity={0.8}
                        >
                          <SparklesIcon color={colors.primary.DEFAULT} size={16} />
                          <Text style={[
                            styles.expandedActionText,
                            { color: colors.primary.DEFAULT, ...typography.labelSmall },
                          ]}>
                            AI Explanation
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.expandedActionButton,
                            { backgroundColor: colors.bg.surfaceMuted, borderColor: colors.border.subtle },
                          ]}
                          onPress={() => { /* Open in explorer */ }}
                          activeOpacity={0.8}
                        >
                          <ExternalLinkIcon color={colors.text.secondary} size={16} />
                          <Text style={[
                            styles.expandedActionText,
                            { color: colors.text.primary, ...typography.labelSmall },
                          ]}>
                            View on Explorer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* AI Assistant FAB */}
      <AIAssistantFAB
        onPress={() => navigation?.navigate?.('AIAssistant', { context: 'asset', asset })}
        visible={true}
        position="bottom"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerSpacer: {
    width: 44,
  },
  moreButton: {
    padding: spacing.sm,
  },
  assetHeaderCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  assetHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  assetLogoWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.tokenIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetHeaderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  assetHeaderNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  assetHeaderName: {
    fontWeight: '700',
  },
  assetHeaderSymbol: {
    fontWeight: '500',
  },
  assetHeaderNetworkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  assetHeaderNetwork: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  assetHeaderBalance: {
    marginBottom: spacing.lg,
  },
  assetHeaderQuantity: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  assetHeaderFiat: {
    fontWeight: '500',
  },
  assetHeaderPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0', // Will be overridden by theme
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  priceValue: {
    fontWeight: '700',
  },
  priceChangeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  priceChangeText: {
    fontWeight: '700',
    fontSize: 10,
  },
  priceChartWrap: {
    width: 160,
    height: 60,
  },
  assetActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  assetActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    minHeight: 44,
  },
  assetActionLabel: {
    fontWeight: '600',
  },
  transactionsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAllText: {
    fontWeight: '600',
  },
  transactionsList: {
    borderWidth: 1,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  txTypeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txSymbol: {
    fontWeight: '600',
  },
  txStatus: {
    fontWeight: '700',
    fontSize: 10,
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txAmount: {
    fontSize: 12,
  },
  txTime: {
    fontSize: 10,
  },
  txValueColumn: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  txFiatValue: {
    fontWeight: '700',
    textAlign: 'right',
  },
  expandedTx: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0', // Will be overridden
  },
  expandedContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  expandedLabel: {
    fontWeight: '500',
    fontSize: 11,
  },
  expandedValue: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  expandedValueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  expandedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  expandedActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    borderWidth: 1,
  },
  expandedActionText: {
    fontWeight: '600',
    fontSize: 12,
  },
});

export { AssetDetailScreen };