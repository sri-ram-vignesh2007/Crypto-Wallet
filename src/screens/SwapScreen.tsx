// src/screens/SwapScreen.tsx - Institutional-Grade Fintech Token Swapper with Inbuilt Keypad & Slide-to-Swap (Trust Wallet & Coinbase Scale)

import React, { useState, useEffect, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, Animated, Pressable, Dimensions,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useTransactionStore } from '../store/transactionStore';
import { TokenLogo } from '../components/TokenLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Reusable Spring Pressable Component
const SpringButton: React.FC<{
  onPress: () => void;
  style?: any;
  containerStyle?: any;
  children: React.ReactNode;
  activeScale?: number;
  disabled?: boolean;
}> = ({ onPress, style, containerStyle, children, activeScale = 0.94, disabled = false }) => {
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

// Vector Glyphs
const ChevronDownIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const SwapFlipIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
  </Svg>
);

const BackspaceIcon = ({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <Path d="M18 9l-6 6M12 9l6 6" />
  </Svg>
);

const SliderArrowIcon = ({ color = '#000000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);

const SettingsIcon = ({ color = '#858585', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const CheckIcon = ({ color = '#FFFFFF', size = 26 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

interface SwapAsset {
  symbol: string;
  name: string;
  network: string;
  balance: string;
  priceUsd: number;
}

const BASE_SWAP_ASSETS: SwapAsset[] = [
  { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', balance: '2.54', priceUsd: 2700.00 },
  { symbol: 'USDC', name: 'USD Coin', network: 'Multi-Chain', balance: '1,250.00', priceUsd: 1.00 },
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', balance: '0.0452', priceUsd: 67540.00 },
  { symbol: 'SOL', name: 'Solana', network: 'Solana', balance: '18.40', priceUsd: 168.20 },
  { symbol: 'USDT', name: 'Tether USD', network: 'Ethereum', balance: '3,450.00', priceUsd: 1.00 },
  { symbol: 'BNB', name: 'BNB Chain', network: 'BNB Chain', balance: '1.20', priceUsd: 592.40 },
  { symbol: 'ARB', name: 'Arbitrum', network: 'Arbitrum', balance: '850.00', priceUsd: 0.58 },
  { symbol: 'POL', name: 'Polygon', network: 'Polygon', balance: '1,250.00', priceUsd: 0.38 },
  { symbol: 'OP', name: 'Optimism', network: 'Optimism', balance: '320.00', priceUsd: 1.65 },
  { symbol: 'LINK', name: 'Chainlink', network: 'Ethereum', balance: '65.00', priceUsd: 11.80 },
];

export default function SwapScreen({ navigation }: { navigation?: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { balances: liveBalances, executeSwap, loadTransactions } = useTransactionStore();

  const [fromAsset, setFromAsset] = useState<SwapAsset>(BASE_SWAP_ASSETS[0]);
  const [toAsset, setToAsset] = useState<SwapAsset>(BASE_SWAP_ASSETS[1]);
  const [fromAmount, setFromAmount] = useState<string>('0');
  const [slippage, setSlippage] = useState<string>('0.5%');
  const [showSlippageModal, setShowSlippageModal] = useState<boolean>(false);
  const [selectorTarget, setSelectorTarget] = useState<'from' | 'to' | null>(null);
  const [tokenSearchQuery, setTokenSearchQuery] = useState<string>('');
  const [swapping, setSwapping] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#2B2B2B' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  // Live balance from transaction store
  const getLiveBalance = (symbol: string): number => {
    const symKey = symbol as keyof typeof liveBalances;
    if (liveBalances && liveBalances[symKey] !== undefined) {
      return liveBalances[symKey];
    }
    const found = BASE_SWAP_ASSETS.find(a => a.symbol === symbol);
    return found ? parseFloat(found.balance.replace(/,/g, '')) : 0;
  };

  const fromLiveBalance = getLiveBalance(fromAsset.symbol);
  const toLiveBalance = getLiveBalance(toAsset.symbol);

  const fromBalanceFormatted = fromLiveBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: fromLiveBalance < 1 ? 4 : 2,
  });

  const toBalanceFormatted = toLiveBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: toLiveBalance < 1 ? 4 : 2,
  });

  // Calculate quoted output
  const numericFromAmount = parseFloat(fromAmount) || 0;
  const quoteRatio = fromAsset.priceUsd / toAsset.priceUsd;
  const numericToAmount = numericFromAmount * quoteRatio;
  const toAmount = numericFromAmount > 0
    ? numericToAmount.toFixed(numericToAmount < 1 ? 6 : 4)
    : '0.00';

  const isInsufficientFunds = numericFromAmount > fromLiveBalance;
  const isInputEmpty = numericFromAmount <= 0;

  // Inbuilt Number Keypad Handler
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      if (fromAmount.length <= 1 || fromAmount === '0') {
        setFromAmount('0');
      } else {
        setFromAmount(fromAmount.slice(0, -1));
      }
      return;
    }

    if (val === '.') {
      if (!fromAmount.includes('.')) {
        setFromAmount(fromAmount + '.');
      }
      return;
    }

    // Number digits 0-9
    if (fromAmount === '0') {
      setFromAmount(val);
    } else {
      const parts = fromAmount.split('.');
      if (parts.length > 1 && parts[1].length >= 6) return;
      setFromAmount(fromAmount + val);
    }
  };

  const handlePercentPress = (pct: number) => {
    const val = fromLiveBalance * (pct / 100);
    setFromAmount(val <= 0 ? '0' : val.toFixed(val < 1 ? 4 : 2));
  };

  const handleFlipAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount('0');
  };

  // Execute Swap Logic
  const handleExecuteSwap = () => {
    if (isInputEmpty || isInsufficientFunds || swapping) return;

    setSwapping(true);
    setTimeout(() => {
      const usdEquivalent = `$${(numericFromAmount * fromAsset.priceUsd).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      executeSwap(fromAsset.symbol, toAsset.symbol, numericFromAmount, numericToAmount, usdEquivalent);

      setSwapping(false);
      setShowSuccessModal(true);
      setFromAmount('0');
    }, 850);
  };

  // ── SLIDE TO SWAP PAN RESPONDER ────────────────────────────────
  const sliderTrackWidth = SCREEN_WIDTH - 40;
  const thumbWidth = 56;
  const maxSlideDistance = sliderTrackWidth - thumbWidth - 8;

  const slideX = useRef(new Animated.Value(0)).current;

  const slidePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isInputEmpty && !isInsufficientFunds && !swapping,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        const clampedX = Math.max(0, Math.min(gesture.dx, maxSlideDistance));
        slideX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx >= maxSlideDistance * 0.65) {
          Animated.timing(slideX, {
            toValue: maxSlideDistance,
            duration: 140,
            useNativeDriver: true,
          }).start(() => {
            handleExecuteSwap();
            setTimeout(() => {
              Animated.spring(slideX, {
                toValue: 0,
                useNativeDriver: true,
                damping: 18,
                stiffness: 240,
              }).start();
            }, 1000);
          });
        } else {
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 240,
          }).start();
        }
      },
    })
  ).current;

  const filteredAssets = BASE_SWAP_ASSETS.filter(a =>
    tokenSearchQuery
      ? a.name.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
        a.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase())
      : true
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Swap</Text>

        <TouchableOpacity
          onPress={() => setShowSlippageModal(true)}
          style={[styles.slippageHeaderPill, { backgroundColor: cardBg, borderColor: cardBorder }]}
          activeOpacity={0.7}
        >
          <SettingsIcon color={colors.text.muted} size={15} />
          <Text style={[styles.slippageHeaderText, { color: colors.text.primary }]}>{slippage}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* SWAP CARDS: YOU PAY & YOU RECEIVE                        */}
        {/* ======================================================== */}
        <View style={styles.swapBoxesWrapper}>
          {/* 1. YOU PAY CARD */}
          <View style={[styles.swapCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderLabel}>YOU PAY</Text>
              <Text style={styles.balanceText}>
                Bal: {fromBalanceFormatted} {fromAsset.symbol}
              </Text>
            </View>

            <View style={styles.inputDisplayRow}>
              <Text
                style={[
                  styles.amountDisplayText,
                  { color: isInsufficientFunds ? '#EF4444' : colors.text.primary },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {fromAmount}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectorTarget('from')}
                style={[styles.tokenSelectorPill, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
                activeOpacity={0.7}
              >
                <TokenLogo symbol={fromAsset.symbol} size={28} />
                <Text style={[styles.tokenSymbolText, { color: colors.text.primary }]}>
                  {fromAsset.symbol}
                </Text>
                <ChevronDownIcon color={colors.text.muted} size={12} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooterRow}>
              <Text style={styles.usdEquivalentText}>
                {numericFromAmount > 0
                  ? `≈ $${(numericFromAmount * fromAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '≈ $0.00'}
              </Text>
              {isInsufficientFunds && (
                <Text style={styles.insufficientWarning}>Insufficient Balance</Text>
              )}
            </View>
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
              <SwapFlipIcon color={isDark ? '#000000' : '#FFFFFF'} size={20} />
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

            <View style={styles.inputDisplayRow}>
              <Text
                style={[
                  styles.amountDisplayText,
                  { color: toAmount !== '0.00' ? colors.text.primary : colors.text.muted },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {toAmount}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectorTarget('to')}
                style={[styles.tokenSelectorPill, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
                activeOpacity={0.7}
              >
                <TokenLogo symbol={toAsset.symbol} size={28} />
                <Text style={[styles.tokenSymbolText, { color: colors.text.primary }]}>
                  {toAsset.symbol}
                </Text>
                <ChevronDownIcon color={colors.text.muted} size={12} />
              </TouchableOpacity>
            </View>

            <Text style={styles.usdEquivalentText}>
              {parseFloat(toAmount) > 0
                ? `≈ $${(parseFloat(toAmount) * toAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '≈ $0.00'}
            </Text>
          </View>
        </View>

        {/* ── PERCENTAGE SHORTCUT PILLS ──────────────────────────── */}
        <View style={styles.percentagePillRow}>
          {[25, 50, 75, 100].map((pct) => (
            <TouchableOpacity
              key={pct}
              onPress={() => handlePercentPress(pct)}
              style={[styles.percentBtn, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.percentBtnText, { color: colors.text.primary }]}>
                {pct === 100 ? 'MAX' : `${pct}%`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ======================================================== */}
        {/* INBUILT NUMERIC KEYPAD                                   */}
        {/* ======================================================== */}
        <View style={[styles.keypadContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleKeypadPress(key)}
                style={styles.keypadKey}
                activeOpacity={0.65}
              >
                <Text style={[styles.keypadDigit, { color: colors.text.primary }]}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleKeypadPress(key)}
                style={styles.keypadKey}
                activeOpacity={0.65}
              >
                <Text style={[styles.keypadDigit, { color: colors.text.primary }]}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleKeypadPress(key)}
                style={styles.keypadKey}
                activeOpacity={0.65}
              >
                <Text style={[styles.keypadDigit, { color: colors.text.primary }]}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            <TouchableOpacity
              onPress={() => handleKeypadPress('.')}
              style={styles.keypadKey}
              activeOpacity={0.65}
            >
              <Text style={[styles.keypadDigit, { color: colors.text.primary }]}>.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleKeypadPress('0')}
              style={styles.keypadKey}
              activeOpacity={0.65}
            >
              <Text style={[styles.keypadDigit, { color: colors.text.primary }]}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleKeypadPress('backspace')}
              style={styles.keypadKey}
              activeOpacity={0.65}
            >
              <BackspaceIcon color={colors.text.primary} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* SLIDE TO SWAP INTERACTIVE SLIDER                         */}
        {/* ======================================================== */}
        <View style={styles.slideContainer}>
          <View
            style={[
              styles.slideTrack,
              {
                backgroundColor: isInputEmpty || isInsufficientFunds
                  ? monoMutedSurface
                  : (isDark ? '#222222' : '#E8E8E8'),
                borderColor: cardBorder,
              },
            ]}
          >
            {/* Background shimmer / instruction text */}
            <Text
              style={[
                styles.slideTrackLabel,
                {
                  color: isInsufficientFunds
                    ? '#EF4444'
                    : isInputEmpty
                    ? colors.text.muted
                    : colors.text.primary,
                },
              ]}
            >
              {swapping
                ? 'Routing & Executing Swap…'
                : isInsufficientFunds
                ? `Insufficient ${fromAsset.symbol} Balance`
                : isInputEmpty
                ? 'Enter an Amount to Swap'
                : `Slide to Swap ${fromAsset.symbol} →`}
            </Text>

            {/* Draggable Slider Thumb */}
            <Animated.View
              {...slidePanResponder.panHandlers}
              style={[
                styles.slideThumb,
                {
                  backgroundColor: isInputEmpty || isInsufficientFunds
                    ? (isDark ? '#333333' : '#CCCCCC')
                    : monoPrimary,
                  transform: [{ translateX: slideX }],
                },
              ]}
            >
              <SliderArrowIcon color={isDark ? '#000000' : '#FFFFFF'} size={20} />
            </Animated.View>
          </View>
        </View>
      </ScrollView>

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

            <ScrollView style={{ maxHeight: 360 }}>
              {filteredAssets.map((asset) => {
                const isSelected =
                  selectorTarget === 'from'
                    ? asset.symbol === fromAsset.symbol
                    : asset.symbol === toAsset.symbol;

                return (
                  <TouchableOpacity
                    key={asset.symbol}
                    onPress={() => {
                      if (selectorTarget === 'from') {
                        setFromAsset(asset);
                      } else {
                        setToAsset(asset);
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
                      <TokenLogo symbol={asset.symbol} size={36} />
                      <View style={{ marginLeft: 14 }}>
                        <Text style={[styles.tokenItemSymbol, { color: colors.text.primary }]}>
                          {asset.symbol}
                        </Text>
                        <Text style={[styles.tokenItemName, { color: colors.text.muted }]}>{asset.name}</Text>
                      </View>
                    </View>

                    <View style={styles.tokenItemRight}>
                      <Text style={[styles.tokenItemBalance, { color: colors.text.primary }]}>
                        {asset.balance}
                      </Text>
                      <Text style={[styles.tokenItemUsd, { color: colors.text.muted }]}>
                        ${(parseFloat(asset.balance.replace(/,/g, '')) * asset.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
      {/* SLIPPAGE SETTINGS MODAL                                  */}
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
              Transactions will revert if the execution rate slips below this limit.
            </Text>

            <View style={styles.slippagePillRow}>
              {['0.1%', '0.5%', '1.0%', '2.0%'].map((slip) => (
                <TouchableOpacity
                  key={slip}
                  onPress={() => {
                    setSlippage(slip);
                    setShowSlippageModal(false);
                  }}
                  style={[
                    styles.slippageChoiceBtn,
                    {
                      backgroundColor: slippage === slip ? monoPrimary : monoMutedSurface,
                      borderColor: cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.slippageChoiceText,
                      { color: slippage === slip ? (isDark ? '#000000' : '#FFFFFF') : colors.text.primary },
                    ]}
                  >
                    {slip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* SUCCESS CONFIRMATION MODAL                               */}
      {/* ======================================================== */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.successModalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[styles.successIconCircle, { backgroundColor: monoPrimary }]}>
              <CheckIcon color={isDark ? '#000000' : '#FFFFFF'} size={28} />
            </View>

            <Text style={[styles.successTitle, { color: colors.text.primary }]}>Swap Executed</Text>
            <Text style={styles.successSub}>
              Successfully routed and exchanged through Cura Smart Aggregator.
            </Text>

            <SpringButton
              onPress={() => setShowSuccessModal(false)}
              style={[styles.successCloseBtn, { backgroundColor: monoPrimary }]}
            >
              <Text style={[styles.successCloseText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                Done
              </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  slippageHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  slippageHeaderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  swapBoxesWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  swapCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLabel: {
    color: '#858585',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  balanceText: {
    color: '#858585',
    fontSize: 12,
    fontWeight: '600',
  },
  inputDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  amountDisplayText: {
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    flex: 1,
    marginRight: 12,
  },
  tokenSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tokenSymbolText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  usdEquivalentText: {
    color: '#858585',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  insufficientWarning: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingFlipContainer: {
    position: 'absolute',
    top: '49%',
    left: '50%',
    marginLeft: -22,
    marginTop: -22,
    zIndex: 10,
  },
  flipButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  percentagePillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 12,
  },
  percentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  keypadContainer: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 4,
  },
  keypadKey: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  keypadDigit: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  slideContainer: {
    marginTop: 4,
    marginBottom: 16,
  },
  slideTrack: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slideTrackLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  slideThumb: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  sheetCard: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    padding: 22,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#858585',
    opacity: 0.4,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  tokenItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  tokenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenItemSymbol: {
    fontSize: 16,
    fontWeight: '800',
  },
  tokenItemName: {
    fontSize: 12,
    marginTop: 2,
  },
  tokenItemRight: {
    alignItems: 'flex-end',
  },
  tokenItemBalance: {
    fontSize: 15,
    fontWeight: '700',
  },
  tokenItemUsd: {
    fontSize: 12,
    marginTop: 2,
  },
  slippageSubtitle: {
    color: '#858585',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  slippagePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slippageChoiceBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slippageChoiceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  successModalCard: {
    margin: 24,
    borderRadius: 26,
    borderWidth: 1,
    padding: 26,
    alignItems: 'center',
    alignSelf: 'center',
    width: SCREEN_WIDTH - 44,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  successSub: {
    color: '#858585',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  successCloseBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCloseText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
