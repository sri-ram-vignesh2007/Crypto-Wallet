// src/screens/SwapScreen.tsx - Institutional-Grade Fintech Token Swapper for Cura Wallet

import React, { useState, useEffect, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Alert, Modal, KeyboardAvoidingView, Platform,
  Animated, Pressable, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useTransactionStore } from '../store/transactionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Spring Button Component with full width support
const SpringButton: React.FC<{
  onPress: () => void;
  style?: any;
  containerStyle?: any;
  children: React.ReactNode;
  activeScale?: number;
  disabled?: boolean;
}> = ({ onPress, style, containerStyle, children, activeScale = 0.96, disabled = false }) => {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[{ width: style?.width || undefined }, containerStyle]}
      onPressIn={() => {
        if (disabled) return;
        Animated.spring(scale, {
          toValue: activeScale,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
        }).start();
      }}
      onPressOut={() => {
        if (disabled) return;
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
        }).start();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// Fintech Vector Glyphs
const ChevronDownIcon = ({ color = '#858585', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const SwapFlipIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
  </Svg>
);

const SearchIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const SettingsIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const CheckIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

// High-Res Vector Logos
const EthLogo = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(98, 126, 234, 0.15)" stroke="#627EEA" strokeWidth={0.8} />
    <Path d="M12 4v6.2l5 2.3L12 4z" fill="#94A3B8" />
    <Path d="M12 4L7 12.5l5-2.3V4z" fill="#FFFFFF" />
    <Path d="M12 13.5v6.5l5-7-5 .5z" fill="#94A3B8" />
    <Path d="M12 13.5L7 13l5 7v-6.5z" fill="#FFFFFF" />
  </Svg>
);

const BtcLogo = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(247, 147, 26, 0.15)" stroke="#F7931A" strokeWidth={0.8} />
    <Path d="M14.5 10.5c.8-.4 1.2-1.2 1.2-2 0-1.5-1.1-2.5-2.8-2.5H10v9h3.3c1.9 0 3-.9 3-2.6 0-1-.5-1.6-1.8-1.9zM11.5 7.5h1.2c.8 0 1.3.4 1.3 1.1s-.5 1.1-1.3 1.1h-1.2v-2.2zm1.6 6h-1.6v-2.4h1.6c.9 0 1.4.5 1.4 1.2s-.5 1.2-1.4 1.2z" fill="#F7931A" />
  </Svg>
);

const SolLogo = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(20, 241, 149, 0.15)" stroke="#14F195" strokeWidth={0.8} />
    <Path d="M6.5 15.5l2-2h9l-2 2h-9z" fill="#14F195" />
    <Path d="M8.5 12l-2-2h9l2 2h-9z" fill="#9945FF" />
    <Path d="M6.5 8.5l2-2h9l-2 2h-9z" fill="#14F195" />
  </Svg>
);

const UsdcLogo = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" fill="rgba(39, 117, 202, 0.15)" stroke="#2775CA" strokeWidth={0.8} />
    <Path d="M12 7v10M14 9.5a2 2 0 0 0-4 0c0 2 4 1.5 4 3.5a2 2 0 0 1-4 0" stroke="#2775CA" strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

const TOKEN_LOGOS: Record<string, () => React.ReactElement> = {
  ETH: EthLogo,
  BTC: BtcLogo,
  SOL: SolLogo,
  USDC: UsdcLogo,
};

interface SwapAsset {
  symbol: string;
  name: string;
  balance: string;
  priceUsd: number;
  network: string;
}

const BASE_SWAP_ASSETS: SwapAsset[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: '306.45', priceUsd: 3420.50, network: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: '89790.00', priceUsd: 1.00, network: 'Multi-Chain' },
  { symbol: 'SOL', name: 'Solana', balance: '1095.00', priceUsd: 168.20, network: 'Solana' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '7.70', priceUsd: 67540.00, network: 'Bitcoin' },
];

export default function SwapScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { balances, executeSwap, loadTransactions } = useTransactionStore();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const [fromAsset, setFromAsset] = useState<SwapAsset>(BASE_SWAP_ASSETS[0]);
  const [toAsset, setToAsset] = useState<SwapAsset>(BASE_SWAP_ASSETS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5%');

  // Modals
  const [selectorTarget, setSelectorTarget] = useState<'from' | 'to' | null>(null);
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Dynamic user live balances
  const getLiveBalance = (symbol: string): number => {
    const key = symbol.toUpperCase() as keyof typeof balances;
    return balances[key] !== undefined ? balances[key] : 0;
  };

  const fromAvailableBalance = getLiveBalance(fromAsset.symbol);
  const toAvailableBalance = getLiveBalance(toAsset.symbol);

  // Formatted balances for display
  const fromBalanceFormatted = fromAvailableBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: fromAvailableBalance < 1 ? 4 : 2,
  });

  const toBalanceFormatted = toAvailableBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: toAvailableBalance < 1 ? 4 : 2,
  });

  // Monochrome Theme Tokens
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#303030' : '#E5E5E5';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  // Exchange rate calculation
  const exchangeRate = fromAsset.priceUsd / toAsset.priceUsd;

  // Amount synchronizer
  useEffect(() => {
    const parsed = parseFloat(fromAmount);
    if (!isNaN(parsed) && parsed > 0) {
      const calculated = parsed * exchangeRate;
      setToAmount(calculated >= 1 ? calculated.toFixed(4) : calculated.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromAsset, toAsset, exchangeRate]);

  // Flip assets
  const handleFlipAssets = () => {
    const oldFrom = fromAsset;
    const oldTo = toAsset;
    setFromAsset(oldTo);
    setToAsset(oldFrom);
    setFromAmount(toAmount);
  };

  // Max balance fill
  const handleMaxPress = () => {
    setFromAmount(fromAvailableBalance > 0 ? fromAvailableBalance.toString() : '0');
  };

  // Balance & Input Validation
  const numericFromAmount = parseFloat(fromAmount) || 0;
  const isInsufficientFunds = numericFromAmount > fromAvailableBalance;
  const isInputEmpty = numericFromAmount <= 0;

  // Execute Swap with real balance deduction and activity log
  const handleExecuteSwap = () => {
    if (isInputEmpty || isInsufficientFunds || swapping) return;

    setSwapping(true);
    setTimeout(() => {
      const numericToAmount = parseFloat(toAmount) || (numericFromAmount * exchangeRate);
      const usdEquivalent = `$${(numericFromAmount * fromAsset.priceUsd).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      executeSwap(fromAsset.symbol, toAsset.symbol, numericFromAmount, numericToAmount, usdEquivalent);

      setSwapping(false);
      setShowSuccessModal(true);
    }, 900);
  };

  const FromLogo = TOKEN_LOGOS[fromAsset.symbol] || EthLogo;
  const ToLogo = TOKEN_LOGOS[toAsset.symbol] || UsdcLogo;

  const SWAP_ASSETS: SwapAsset[] = BASE_SWAP_ASSETS.map(asset => ({
    ...asset,
    balance: getLiveBalance(asset.symbol).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: getLiveBalance(asset.symbol) < 1 ? 4 : 2,
    }),
  }));

  const filteredAssets = SWAP_ASSETS.filter(a =>
    tokenSearchQuery
      ? a.name.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
        a.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase())
      : true
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar */}
        <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Swap</Text>

          <TouchableOpacity
            onPress={() => setShowSlippageModal(true)}
            style={[styles.slippageHeaderPill, { backgroundColor: cardBg, borderColor: cardBorder }]}
            activeOpacity={0.7}
          >
            <SettingsIcon color={colors.text.muted} size={13} />
            <Text style={[styles.slippageHeaderText, { color: colors.text.primary }]}>{slippage}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 36 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ======================================================== */}
          {/* SWAP CARDS CONTAINER                                     */}
          {/* ======================================================== */}
          <View style={styles.swapBoxesWrapper}>
            {/* 1. YOU PAY CARD */}
            <View style={[styles.swapCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel}>YOU PAY</Text>
                <View style={styles.balanceRightRow}>
                  <Text style={styles.balanceText}>
                    Bal: {fromBalanceFormatted} {fromAsset.symbol}
                  </Text>
                  <TouchableOpacity onPress={handleMaxPress} style={[styles.maxPill, { backgroundColor: monoMutedSurface }]}>
                    <Text style={[styles.maxPillText, { color: colors.text.primary }]}>MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  value={fromAmount}
                  onChangeText={setFromAmount}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                  style={[
                    styles.amountInput,
                    { color: isInsufficientFunds ? '#EF4444' : colors.text.primary },
                  ]}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  onPress={() => setSelectorTarget('from')}
                  style={[styles.tokenSelectorPill, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
                  activeOpacity={0.7}
                >
                  <FromLogo />
                  <Text style={[styles.tokenSymbolText, { color: colors.text.primary }]}>
                    {fromAsset.symbol}
                  </Text>
                  <ChevronDownIcon color={colors.text.muted} size={11} />
                </TouchableOpacity>
              </View>

              <Text style={styles.usdEquivalentText}>
                {numericFromAmount > 0
                  ? `≈ $${(numericFromAmount * fromAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '≈ $0.00'}
              </Text>
            </View>

            {/* FLOATING FLIP SWITCH BUTTON */}
            <View style={styles.floatingFlipContainer}>
              <TouchableOpacity
                onPress={handleFlipAssets}
                style={[
                  styles.flipButtonCircle,
                  { backgroundColor: monoPrimary, borderColor: colors.bg.canvas },
                ]}
                activeOpacity={0.8}
              >
                <SwapFlipIcon color={isDark ? '#000000' : '#FFFFFF'} size={18} />
              </TouchableOpacity>
            </View>

            {/* 2. YOU RECEIVE CARD */}
            <View style={[styles.swapCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderLabel}>YOU RECEIVE</Text>
                <Text style={styles.balanceText}>
                  Bal: {toBalanceFormatted} {toAsset.symbol}
                </Text>
              </View>

              <View style={styles.inputRow}>
                <Text
                  style={[
                    styles.amountOutputText,
                    { color: toAmount ? colors.text.primary : colors.text.muted },
                  ]}
                  numberOfLines={1}
                >
                  {toAmount || '0.00'}
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectorTarget('to')}
                  style={[styles.tokenSelectorPill, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
                  activeOpacity={0.7}
                >
                  <ToLogo />
                  <Text style={[styles.tokenSymbolText, { color: colors.text.primary }]}>
                    {toAsset.symbol}
                  </Text>
                  <ChevronDownIcon color={colors.text.muted} size={11} />
                </TouchableOpacity>
              </View>

              <Text style={styles.usdEquivalentText}>
                {parseFloat(toAmount) > 0
                  ? `≈ $${(parseFloat(toAmount) * toAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '≈ $0.00'}
              </Text>
            </View>
          </View>

          {/* ======================================================== */}
          {/* MARKET & ROUTE DETAILS ACCORDION                         */}
          {/* ======================================================== */}
          <View style={[styles.detailsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rate</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                1 {fromAsset.symbol} = {exchangeRate >= 1 ? exchangeRate.toFixed(4) : exchangeRate.toFixed(6)} {toAsset.symbol}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network Cost</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                ≈ $1.42 (12 Gwei)
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price Impact</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>&lt; 0.05%</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Routing Source</Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                Cura Smart Aggregator (Uniswap V3)
              </Text>
            </View>

            <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.detailLabel}>Slippage Tolerance</Text>
              <TouchableOpacity onPress={() => setShowSlippageModal(true)}>
                <Text style={[styles.detailValue, { color: colors.text.primary, fontWeight: '700' }]}>
                  {slippage} (Tap to change)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================================================== */}
          {/* PRIMARY SWAP ACTION BUTTON                               */}
          {/* ======================================================== */}
          <SpringButton
            onPress={handleExecuteSwap}
            disabled={isInputEmpty || isInsufficientFunds || swapping}
            style={[
              styles.actionButton,
              { backgroundColor: monoPrimary },
              (isInputEmpty || isInsufficientFunds || swapping) && { opacity: 0.4 },
            ]}
          >
            <Text style={[styles.actionButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              {swapping
                ? 'Routing & Swapping…'
                : isInsufficientFunds
                ? `Insufficient ${fromAsset.symbol} Balance`
                : isInputEmpty
                ? 'Enter an Amount'
                : `Swap ${fromAsset.symbol} for ${toAsset.symbol}`}
            </Text>
          </SpringButton>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ======================================================== */}
      {/* TOKEN SELECTOR BOTTOM SHEET MODAL                        */}
      {/* ======================================================== */}
      <Modal
        visible={!!selectorTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectorTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setSelectorTarget(null)} />
          <View style={[styles.sheetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Select a Token</Text>

            {/* Token Search */}
            <View style={[styles.sheetSearchBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
              <SearchIcon color={colors.text.muted} size={15} />
              <TextInput
                value={tokenSearchQuery}
                onChangeText={setTokenSearchQuery}
                placeholder="Search by token name or symbol..."
                placeholderTextColor={colors.text.muted}
                style={[styles.sheetSearchInput, { color: colors.text.primary }]}
                autoCapitalize="none"
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
              {filteredAssets.map(asset => {
                const isSelected = selectorTarget === 'from' ? fromAsset.symbol === asset.symbol : toAsset.symbol === asset.symbol;
                const Logo = TOKEN_LOGOS[asset.symbol] || EthLogo;

                return (
                  <TouchableOpacity
                    key={asset.symbol}
                    onPress={() => {
                      if (selectorTarget === 'from') {
                        if (toAsset.symbol === asset.symbol) handleFlipAssets();
                        else setFromAsset(asset);
                      } else {
                        if (fromAsset.symbol === asset.symbol) handleFlipAssets();
                        else setToAsset(asset);
                      }
                      setSelectorTarget(null);
                      setTokenSearchQuery('');
                    }}
                    style={[
                      styles.tokenItemRow,
                      isSelected && { backgroundColor: monoMutedSurface },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tokenItemLeft}>
                      <Logo />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.tokenItemSymbol, { color: colors.text.primary }]}>
                          {asset.symbol}
                        </Text>
                        <Text style={styles.tokenItemName}>{asset.name}</Text>
                      </View>
                    </View>

                    <View style={styles.tokenItemRight}>
                      <Text style={[styles.tokenItemBalance, { color: colors.text.primary }]}>
                        {asset.balance}
                      </Text>
                      <Text style={styles.tokenItemUsd}>
                        ${(parseFloat(asset.balance.replace(',', '')) * asset.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* SLIPPAGE SETTING BOTTOM SHEET MODAL                      */}
      {/* ======================================================== */}
      <Modal
        visible={showSlippageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSlippageModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setShowSlippageModal(false)} />
          <View style={[styles.sheetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Slippage Tolerance</Text>
            <Text style={styles.slippageSubtitle}>
              Your swap will revert automatically if the execution price shifts unfavorably by more than this percentage.
            </Text>

            <View style={styles.slippagePillRow}>
              {['0.1%', '0.5%', '1.0%', 'Auto'].map(opt => {
                const active = slippage === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      setSlippage(opt);
                      setShowSlippageModal(false);
                    }}
                    style={[
                      styles.slippageChoiceBtn,
                      { backgroundColor: active ? monoPrimary : monoMutedSurface },
                    ]}
                  >
                    <Text style={[
                      styles.slippageChoiceText,
                      active
                        ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                        : { color: colors.text.primary },
                    ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* SWAP SUCCESS MODAL                                       */}
      {/* ======================================================== */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.successModalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[styles.successIconCircle, { backgroundColor: monoPrimary }]}>
              <CheckIcon color={isDark ? '#000000' : '#FFFFFF'} size={26} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text.primary }]}>Swap Executed</Text>
            <Text style={styles.successSub}>
              Successfully exchanged {fromAmount} {fromAsset.symbol} for ≈ {toAmount} {toAsset.symbol} via Cura Smart Aggregator.
            </Text>
            <SpringButton
              onPress={() => {
                setShowSuccessModal(false);
                setFromAmount('');
                setToAmount('');
              }}
              containerStyle={{ width: '100%' }}
              style={[styles.successCloseBtn, { backgroundColor: monoPrimary }]}
            >
              <Text style={[styles.successCloseText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Done</Text>
            </SpringButton>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  slippageHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 0.5,
    gap: 5,
  },
  slippageHeaderText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  swapBoxesWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  swapCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLabel: {
    color: '#858585',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  balanceRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceText: {
    color: '#858585',
    fontSize: 11,
  },
  maxPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  maxPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    paddingVertical: 4,
    marginRight: 10,
  },
  amountOutputText: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    paddingVertical: 4,
    marginRight: 10,
  },
  tokenSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0.5,
    gap: 6,
  },
  tokenSymbolText: {
    fontSize: 14,
    fontWeight: '700',
  },
  usdEquivalentText: {
    color: '#858585',
    fontSize: 12,
    marginTop: 4,
  },
  floatingFlipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
    zIndex: 10,
  },
  flipButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  detailsCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#858585',
    fontSize: 11.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  // MODALS
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  sheetCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 0.5,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#858585',
    opacity: 0.4,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  sheetSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 0.5,
    gap: 8,
    marginBottom: 14,
  },
  sheetSearchInput: {
    flex: 1,
    fontSize: 13.5,
  },
  tokenItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tokenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenItemSymbol: {
    fontSize: 14,
    fontWeight: '700',
  },
  tokenItemName: {
    color: '#858585',
    fontSize: 11,
    marginTop: 1,
  },
  tokenItemRight: {
    alignItems: 'flex-end',
  },
  tokenItemBalance: {
    fontSize: 14,
    fontWeight: '700',
  },
  tokenItemUsd: {
    color: '#858585',
    fontSize: 11,
    marginTop: 1,
  },
  slippageSubtitle: {
    color: '#858585',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 16,
  },
  slippagePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slippageChoiceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slippageChoiceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  successModalCard: {
    margin: 24,
    borderRadius: 24,
    borderWidth: 0.5,
    padding: 24,
    alignItems: 'center',
    alignSelf: 'center',
    width: SCREEN_WIDTH - 48,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  successSub: {
    color: '#858585',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  successCloseBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCloseText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
