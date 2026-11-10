// src/screens/PerpetualsScreen.tsx - Institutional Decentralized Perpetual Futures Trading (Trust Wallet ApolloX / GMX Style)

import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  StatusBar, Dimensions, Modal, Animated, Pressable, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { TokenLogo } from '../components/TokenLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vector Glyphs
const ArrowLeftIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const ChevronDownIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const ShieldCheckIcon = ({ color = '#22C55E', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} />
  </Svg>
);

interface PerpMarket {
  pair: string;
  baseSymbol: string;
  quoteSymbol: string;
  price: number;
  change24h: string;
  positive: boolean;
  fundingRate: string;
  high24h: number;
  low24h: number;
  volume24h: string;
  maxLeverage: number;
}

const PERP_MARKETS: PerpMarket[] = [
  {
    pair: 'BTC/USD',
    baseSymbol: 'BTC',
    quoteSymbol: 'USD',
    price: 67850.50,
    change24h: '+3.42%',
    positive: true,
    fundingRate: '+0.0100%',
    high24h: 68420.00,
    low24h: 65120.00,
    volume24h: '$1.42B',
    maxLeverage: 50,
  },
  {
    pair: 'ETH/USD',
    baseSymbol: 'ETH',
    quoteSymbol: 'USD',
    price: 2715.80,
    change24h: '+5.12%',
    positive: true,
    fundingRate: '+0.0084%',
    high24h: 2750.00,
    low24h: 2580.00,
    volume24h: '$840M',
    maxLeverage: 50,
  },
  {
    pair: 'SOL/USD',
    baseSymbol: 'SOL',
    quoteSymbol: 'USD',
    price: 184.25,
    change24h: '+8.65%',
    positive: true,
    fundingRate: '+0.0125%',
    high24h: 189.50,
    low24h: 168.00,
    volume24h: '$420M',
    maxLeverage: 25,
  },
  {
    pair: 'BNB/USD',
    baseSymbol: 'BNB',
    quoteSymbol: 'USD',
    price: 618.40,
    change24h: '+2.18%',
    positive: true,
    fundingRate: '+0.0062%',
    high24h: 625.00,
    low24h: 602.00,
    volume24h: '$190M',
    maxLeverage: 25,
  },
  {
    pair: 'ARB/USD',
    baseSymbol: 'ARB',
    quoteSymbol: 'USD',
    price: 0.624,
    change24h: '-1.45%',
    positive: false,
    fundingRate: '-0.0020%',
    high24h: 0.655,
    low24h: 0.612,
    volume24h: '$98M',
    maxLeverage: 20,
  },
];

interface Position {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  sizeUsd: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  pnlUsd: number;
  roePercent: number;
  timestamp: number;
}

export default function PerpetualsScreen({ navigation }: { navigation?: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { address } = useWalletStore();

  const [selectedMarket, setSelectedMarket] = useState<PerpMarket>(PERP_MARKETS[0]);
  const [showPairModal, setShowPairModal] = useState(false);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [leverage, setLeverage] = useState<number>(10);
  const [collateralAmount, setCollateralAmount] = useState<string>('250');
  const [limitPrice, setLimitPrice] = useState<string>(selectedMarket.price.toString());
  const [activeTab, setActiveTab] = useState<'positions' | 'orders'>('positions');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live positions state
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'pos-1',
      pair: 'BTC/USD',
      type: 'LONG',
      sizeUsd: 5000,
      entryPrice: 66800.00,
      markPrice: 67850.50,
      leverage: 10,
      margin: 500,
      liquidationPrice: 60800.00,
      pnlUsd: 78.60,
      roePercent: 15.72,
      timestamp: Date.now() - 3600000,
    },
  ]);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const numericCollateral = parseFloat(collateralAmount) || 0;
  const positionSizeUsd = numericCollateral * leverage;
  const executionPrice = orderType === 'Market' ? selectedMarket.price : (parseFloat(limitPrice) || selectedMarket.price);

  // Liquidation calculation
  const estLiquidationPrice = useMemo(() => {
    if (executionPrice <= 0 || leverage <= 0) return 0;
    const maintenanceMargin = 0.01; // 1%
    if (side === 'LONG') {
      return executionPrice * (1 - (1 / leverage) + maintenanceMargin);
    } else {
      return executionPrice * (1 + (1 / leverage) - maintenanceMargin);
    }
  }, [executionPrice, leverage, side]);

  const estTradingFee = (positionSizeUsd * 0.0006).toFixed(2); // 0.06% DEX fee

  const handleOpenPosition = () => {
    if (numericCollateral <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid collateral amount.');
      return;
    }

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      pair: selectedMarket.pair,
      type: side,
      sizeUsd: positionSizeUsd,
      entryPrice: executionPrice,
      markPrice: executionPrice,
      leverage: leverage,
      margin: numericCollateral,
      liquidationPrice: estLiquidationPrice,
      pnlUsd: 0,
      roePercent: 0,
      timestamp: Date.now(),
    };

    setPositions([newPos, ...positions]);
    setSuccessToast(`Opened ${leverage}x ${side} position on ${selectedMarket.pair}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleClosePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
    setSuccessToast('Position closed and settled to wallet!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const LEVERAGE_PRESETS = [2, 5, 10, 20, 50];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP NAV BAR ─────────────────────────────────────── */}
      <View style={[styles.topNav, { borderBottomColor: cardBorder }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.() || navigation?.navigate?.('Home')}
          style={[styles.backBtnCircle, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
        </TouchableOpacity>

        {/* Pair Selector Pill */}
        <TouchableOpacity
          onPress={() => setShowPairModal(true)}
          style={[styles.pairSelectorPill, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
          activeOpacity={0.8}
        >
          <TokenLogo symbol={selectedMarket.baseSymbol} size={22} />
          <Text style={[styles.pairText, { color: isDark ? '#FFFFFF' : '#111111' }]}>{selectedMarket.pair} Perp</Text>
          <ChevronDownIcon color="#858585" size={12} />
        </TouchableOpacity>

        {/* TrustGuard Security Badge */}
        <View style={[styles.shieldBadge, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7' }]}>
          <ShieldCheckIcon color="#22C55E" size={14} />
          <Text style={styles.shieldText}>GMX/ApolloX</Text>
        </View>
      </View>

      {/* ── MARKET STATS BAR ────────────────────────────────── */}
      <View style={[styles.marketStatsBar, { backgroundColor: cardBg, borderBottomColor: cardBorder }]}>
        <View>
          <Text style={[styles.livePriceText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
            ${selectedMarket.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.priceChangeText, { color: selectedMarket.positive ? '#22C55E' : '#EF4444' }]}>
            {selectedMarket.change24h}
          </Text>
        </View>

        <View style={styles.statMiniCol}>
          <Text style={styles.statMiniLabel}>Funding / 8h</Text>
          <Text style={[styles.statMiniVal, { color: '#22C55E' }]}>{selectedMarket.fundingRate}</Text>
        </View>

        <View style={styles.statMiniCol}>
          <Text style={styles.statMiniLabel}>24h High</Text>
          <Text style={[styles.statMiniVal, { color: isDark ? '#DDDDDD' : '#333333' }]}>
            ${selectedMarket.high24h.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statMiniCol}>
          <Text style={styles.statMiniLabel}>24h Volume</Text>
          <Text style={[styles.statMiniVal, { color: isDark ? '#DDDDDD' : '#333333' }]}>{selectedMarket.volume24h}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Toast Alert */}
        {successToast && (
          <View style={styles.toastCard}>
            <ShieldCheckIcon color="#FFFFFF" size={16} />
            <Text style={styles.toastText}>{successToast}</Text>
          </View>
        )}

        {/* ── ORDER ENTRY CARD ────────────────────────────────── */}
        <View style={[styles.orderEntryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {/* Long / Short Toggle */}
          <View style={[styles.sideSwitchRow, { backgroundColor: monoMutedSurface }]}>
            <TouchableOpacity
              onPress={() => setSide('LONG')}
              style={[
                styles.sideBtn,
                side === 'LONG' && { backgroundColor: '#22C55E' },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.sideBtnText, side === 'LONG' ? { color: '#FFFFFF' } : { color: colors.text.muted }]}>
                ↗ Buy / Long
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSide('SHORT')}
              style={[
                styles.sideBtn,
                side === 'SHORT' && { backgroundColor: '#EF4444' },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.sideBtnText, side === 'SHORT' ? { color: '#FFFFFF' } : { color: colors.text.muted }]}>
                ↘ Sell / Short
              </Text>
            </TouchableOpacity>
          </View>

          {/* Market / Limit Order Segment */}
          <View style={styles.orderTypeRow}>
            {(['Market', 'Limit'] as const).map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setOrderType(type)}
                style={[
                  styles.orderTypeTab,
                  orderType === type && { borderBottomColor: monoPrimary, borderBottomWidth: 2 },
                ]}
              >
                <Text style={[
                  styles.orderTypeText,
                  orderType === type ? { color: isDark ? '#FFFFFF' : '#111111', fontWeight: '800' } : { color: colors.text.muted }
                ]}>
                  {type} Order
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Limit Price Input if Limit Order */}
          {orderType === 'Limit' && (
            <View style={[styles.inputBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder, marginBottom: 12 }]}>
              <Text style={styles.inputPrefix}>Limit Price</Text>
              <TextInput
                value={limitPrice}
                onChangeText={setLimitPrice}
                keyboardType="numeric"
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
              />
              <Text style={styles.inputSuffix}>USD</Text>
            </View>
          )}

          {/* Collateral Input */}
          <View style={[styles.inputBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
            <Text style={styles.inputPrefix}>Collateral</Text>
            <TextInput
              value={collateralAmount}
              onChangeText={setCollateralAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#777777"
              style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
            />
            <Text style={styles.inputSuffix}>USDC</Text>
          </View>

          {/* Leverage Selector Row */}
          <View style={styles.leverageSection}>
            <View style={styles.leverageHeaderRow}>
              <Text style={[styles.leverageLabel, { color: colors.text.muted }]}>Leverage</Text>
              <Text style={[styles.leverageVal, { color: isDark ? '#FFFFFF' : '#111111' }]}>{leverage}x</Text>
            </View>

            <View style={styles.leveragePillRow}>
              {LEVERAGE_PRESETS.map(lev => (
                <TouchableOpacity
                  key={lev}
                  onPress={() => setLeverage(lev)}
                  style={[
                    styles.leveragePill,
                    {
                      backgroundColor: leverage === lev ? monoPrimary : monoMutedSurface,
                      borderColor: leverage === lev ? monoPrimary : cardBorder,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.leveragePillText,
                    { color: leverage === lev ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#CCCCCC' : '#444444') }
                  ]}>
                    {lev}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Order Calculations Breakdown */}
          <View style={[styles.calcBreakdownCard, { backgroundColor: monoMutedSurface }]}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Position Size</Text>
              <Text style={[styles.calcValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                ${positionSizeUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Est. Liquidation Price</Text>
              <Text style={[styles.calcValue, { color: '#EF4444', fontWeight: '700' }]}>
                ${estLiquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Trading Fee (0.06%)</Text>
              <Text style={[styles.calcValue, { color: colors.text.muted }]}>${estTradingFee}</Text>
            </View>
          </View>

          {/* Submit Order Button */}
          <TouchableOpacity
            onPress={handleOpenPosition}
            style={[
              styles.openPositionBtn,
              { backgroundColor: side === 'LONG' ? '#22C55E' : '#EF4444' },
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.openPositionBtnText}>
              {side === 'LONG' ? `↗ Open ${leverage}x Long ${selectedMarket.baseSymbol}` : `↘ Open ${leverage}x Short ${selectedMarket.baseSymbol}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── POSITIONS & ORDERS TABS ─────────────────────────── */}
        <View style={styles.positionsSectionHeader}>
          <View style={styles.positionsTabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('positions')}
              style={[styles.posTabBtn, activeTab === 'positions' && { borderBottomColor: monoPrimary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.posTabText, activeTab === 'positions' ? { color: isDark ? '#FFFFFF' : '#111111', fontWeight: '800' } : { color: colors.text.muted }]}>
                Positions ({positions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('orders')}
              style={[styles.posTabBtn, activeTab === 'orders' && { borderBottomColor: monoPrimary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.posTabText, activeTab === 'orders' ? { color: isDark ? '#FFFFFF' : '#111111', fontWeight: '800' } : { color: colors.text.muted }]}>
                Open Orders (0)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Position Cards List */}
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <View style={[styles.emptyPosBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={styles.emptyPosEmoji}>📊</Text>
              <Text style={[styles.emptyPosTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>No Open Positions</Text>
              <Text style={styles.emptyPosSub}>Enter an order above to trade perpetual futures with up to 50x leverage.</Text>
            </View>
          ) : (
            positions.map(pos => {
              const isLong = pos.type === 'LONG';
              const isProfit = pos.pnlUsd >= 0;

              return (
                <View key={pos.id} style={[styles.positionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                  <View style={styles.posCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.posPairTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>{pos.pair}</Text>
                      <View style={[styles.posSideBadge, { backgroundColor: isLong ? 'rgba(34, 197, 94, 0.16)' : 'rgba(239, 68, 68, 0.16)' }]}>
                        <Text style={[styles.posSideText, { color: isLong ? '#22C55E' : '#EF4444' }]}>
                          {pos.type} {pos.leverage}x
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleClosePosition(pos.id)}
                      style={[styles.closePosBtn, { backgroundColor: monoMutedSurface }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.closePosText, { color: isDark ? '#FFFFFF' : '#111111' }]}>Close Position</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.posPnlRow}>
                    <View>
                      <Text style={styles.posPnlLabel}>Unrealized PnL (ROE %)</Text>
                      <Text style={[styles.posPnlVal, { color: isProfit ? '#22C55E' : '#EF4444' }]}>
                        {isProfit ? '+' : ''}${pos.pnlUsd.toFixed(2)} ({isProfit ? '+' : ''}{pos.roePercent.toFixed(2)}%)
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.posPnlLabel}>Position Size</Text>
                      <Text style={[styles.posSizeVal, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                        ${pos.sizeUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.posMetricsGrid}>
                    <View style={styles.posMetricCol}>
                      <Text style={styles.posMetricLabel}>Entry Price</Text>
                      <Text style={[styles.posMetricVal, { color: isDark ? '#CCCCCC' : '#444444' }]}>
                        ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>

                    <View style={styles.posMetricCol}>
                      <Text style={styles.posMetricLabel}>Mark Price</Text>
                      <Text style={[styles.posMetricVal, { color: isDark ? '#CCCCCC' : '#444444' }]}>
                        ${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>

                    <View style={styles.posMetricCol}>
                      <Text style={styles.posMetricLabel}>Liq. Price</Text>
                      <Text style={[styles.posMetricVal, { color: '#EF4444' }]}>
                        ${pos.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>

                    <View style={styles.posMetricCol}>
                      <Text style={styles.posMetricLabel}>Margin</Text>
                      <Text style={[styles.posMetricVal, { color: isDark ? '#CCCCCC' : '#444444' }]}>
                        ${pos.margin.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )
        )}
      </ScrollView>

      {/* ── PAIR SELECTOR MODAL ─────────────────────────────── */}
      <Modal visible={showPairModal} transparent animationType="slide" onRequestClose={() => setShowPairModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPairModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.modalSheetHeader}>
              <Text style={[styles.modalSheetTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Select Perpetual Contract</Text>
              <TouchableOpacity onPress={() => setShowPairModal(false)}>
                <Text style={{ color: '#858585', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {PERP_MARKETS.map(market => (
                <TouchableOpacity
                  key={market.pair}
                  onPress={() => {
                    setSelectedMarket(market);
                    setLimitPrice(market.price.toString());
                    setShowPairModal(false);
                  }}
                  style={[
                    styles.marketListItem,
                    { borderBottomColor: cardBorder },
                    selectedMarket.pair === market.pair && { backgroundColor: monoMutedSurface },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TokenLogo symbol={market.baseSymbol} size={32} />
                    <View>
                      <Text style={[styles.marketPairText, { color: isDark ? '#FFFFFF' : '#111111' }]}>{market.pair}</Text>
                      <Text style={styles.marketVolText}>Vol: {market.volume24h} • Max {market.maxLeverage}x</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.marketPriceText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                      ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.marketChangeText, { color: market.positive ? '#22C55E' : '#EF4444' }]}>
                      {market.change24h}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pairText: {
    fontSize: 14,
    fontWeight: '800',
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  shieldText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
  },
  marketStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  livePriceText: {
    fontSize: 18,
    fontWeight: '800',
  },
  priceChangeText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statMiniCol: {
    alignItems: 'flex-end',
  },
  statMiniLabel: {
    color: '#858585',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  statMiniVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  orderEntryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sideSwitchRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  sideBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  orderTypeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  orderTypeTab: {
    paddingBottom: 6,
  },
  orderTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  inputPrefix: {
    color: '#858585',
    fontSize: 13,
    fontWeight: '600',
    width: 80,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    padding: 0,
  },
  inputSuffix: {
    color: '#858585',
    fontSize: 13,
    fontWeight: '700',
  },
  leverageSection: {
    marginBottom: 14,
  },
  leverageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leverageLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  leverageVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  leveragePillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  leveragePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leveragePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  calcBreakdownCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    color: '#858585',
    fontSize: 12,
    fontWeight: '500',
  },
  calcValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  openPositionBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openPositionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  positionsSectionHeader: {
    marginBottom: 12,
  },
  positionsTabRow: {
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  posTabBtn: {
    paddingBottom: 8,
  },
  posTabText: {
    fontSize: 14,
  },
  emptyPosBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyPosEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyPosTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyPosSub: {
    color: '#858585',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  positionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  posCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  posPairTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  posSideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  posSideText: {
    fontSize: 11,
    fontWeight: '800',
  },
  closePosBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  closePosText: {
    fontSize: 12,
    fontWeight: '700',
  },
  posPnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  posPnlLabel: {
    color: '#858585',
    fontSize: 11,
    marginBottom: 4,
  },
  posPnlVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  posSizeVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  posMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  posMetricCol: {
    alignItems: 'flex-start',
  },
  posMetricLabel: {
    color: '#858585',
    fontSize: 10,
    marginBottom: 2,
  },
  posMetricVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '65%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  marketListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderRadius: 12,
  },
  marketPairText: {
    fontSize: 15,
    fontWeight: '800',
  },
  marketVolText: {
    color: '#858585',
    fontSize: 11,
    marginTop: 2,
  },
  marketPriceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  marketChangeText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
