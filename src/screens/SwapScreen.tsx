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

const DownArrowIcon = ({ color = '#6366F1', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M19 12l-7 7-7-7" />
  </Svg>
);

const BackspaceIcon = ({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <Path d="M18 9l-6 6M12 9l6 6" />
  </Svg>
);

const SettingsIcon = ({ color = '#858585', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const WalletSmallIcon = ({ color = '#858585', size = 13 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <Path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
    <Path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </Svg>
);

const SliderChevronIcon = ({ color = '#858585', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
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
  { symbol: 'BNB', name: 'BNB', network: 'BNB Chain', balance: '0.00042273', priceUsd: 592.40 },
  { symbol: 'LIBRA', name: 'Libra', network: 'BNB Chain', balance: '0', priceUsd: 0.006222 },
  { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', balance: '2.54', priceUsd: 2700.00 },
  { symbol: 'USDC', name: 'USD Coin', network: 'Multi-Chain', balance: '1,250.00', priceUsd: 1.00 },
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', balance: '0.0452', priceUsd: 67540.00 },
  { symbol: 'SOL', name: 'Solana', network: 'Solana', balance: '18.40', priceUsd: 168.20 },
  { symbol: 'USDT', name: 'Tether USD', network: 'Ethereum', balance: '3,450.00', priceUsd: 1.00 },
  { symbol: 'ARB', name: 'Arbitrum', network: 'Arbitrum', balance: '850.00', priceUsd: 0.58 },
  { symbol: 'POL', name: 'Polygon', network: 'Polygon', balance: '1,250.00', priceUsd: 0.38 },
  { symbol: 'OP', name: 'Optimism', network: 'Optimism', balance: '320.00', priceUsd: 1.65 },
  { symbol: 'LINK', name: 'Chainlink', network: 'Ethereum', balance: '65.00', priceUsd: 11.80 },
];

const PERCENT_STOPS = [0, 25, 50, 75, 100];

export default function SwapScreen({ navigation, route }: { navigation?: any; route?: { params?: { tokenSymbol?: string } } }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { balances: liveBalances, executeSwap, loadTransactions } = useTransactionStore();

  const routeSymbol = route?.params?.tokenSymbol?.toUpperCase();

  const [fromAsset, setFromAsset] = useState<SwapAsset>(BASE_SWAP_ASSETS[0]); // BNB
  const [toAsset, setToAsset] = useState<SwapAsset>(BASE_SWAP_ASSETS[1]); // LIBRA
  const [fromAmount, setFromAmount] = useState<string>('0.00035013');
  const [selectedPercent, setSelectedPercent] = useState<number>(75);
  const [slippage, setSlippage] = useState<string>('0.5%');
  const [showSlippageModal, setShowSlippageModal] = useState<boolean>(false);
  const [selectorTarget, setSelectorTarget] = useState<'from' | 'to' | null>(null);
  const [tokenSearchQuery, setTokenSearchQuery] = useState<string>('');
  const [swapping, setSwapping] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (routeSymbol) {
      const match = BASE_SWAP_ASSETS.find(a => a.symbol === routeSymbol);
      if (match) {
        if (fromAsset.symbol === routeSymbol) {
          // already from
        } else {
          setToAsset(match);
        }
      }
    }
  }, [routeSymbol]);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#2B2B2B' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#222222' : '#F2F2F2';

  // Live balance from transaction store
  const getLiveBalance = (symbol: string): number => {
    const symUpper = symbol.toUpperCase();
    if (liveBalances && liveBalances[symUpper] !== undefined) {
      return liveBalances[symUpper];
    }
    const found = BASE_SWAP_ASSETS.find(a => a.symbol.toUpperCase() === symUpper);
    return found ? parseFloat(found.balance.replace(/,/g, '')) : 0;
  };

  const fromLiveBalance = getLiveBalance(fromAsset.symbol);
  const toLiveBalance = getLiveBalance(toAsset.symbol);

  const fromBalanceFormatted = fromLiveBalance.toLocaleString(undefined, {
    minimumFractionDigits: fromLiveBalance < 1 ? 6 : 2,
    maximumFractionDigits: fromLiveBalance < 1 ? 8 : 4,
  });

  const toBalanceFormatted = toLiveBalance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: toLiveBalance < 1 ? 4 : 2,
  });

  // Calculate quoted output
  const numericFromAmount = parseFloat(fromAmount) || 0;
  const quoteRatio = fromAsset.priceUsd / toAsset.priceUsd;
  const numericToAmount = numericFromAmount * quoteRatio;
  const toAmount = numericFromAmount > 0
    ? numericToAmount.toFixed(numericToAmount < 1 ? 8 : 4)
    : '0';

  const isInsufficientFunds = numericFromAmount > fromLiveBalance && fromLiveBalance > 0;
  const isInputEmpty = numericFromAmount <= 0;

  // Keypad handler
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
      if (parts.length > 1 && parts[1].length >= 8) return;
      setFromAmount(fromAmount + val);
    }
  };

  const handlePercentPress = (pct: number) => {
    setSelectedPercent(pct);
    const balance = fromLiveBalance > 0 ? fromLiveBalance : 0.00042273;
    const val = balance * (pct / 100);
    setFromAmount(val <= 0 ? '0' : val.toFixed(val < 1 ? 8 : 4));
  };

  const handleFlipAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount('0');
    setSelectedPercent(0);
  };

  // Execute Swap Logic
  const handleExecuteSwap = () => {
    if (isInputEmpty || swapping) return;

    setSwapping(true);
    setTimeout(() => {
      const usdEquivalent = `$${(numericFromAmount * fromAsset.priceUsd).toFixed(2)}`;
      executeSwap(fromAsset.symbol, toAsset.symbol, numericFromAmount, numericToAmount, usdEquivalent);

      setSwapping(false);
      setShowSuccessModal(true);
      setFromAmount('0');
      setSelectedPercent(0);
    }, 600);
  };

  // ── SLIDE TO SWAP PAN RESPONDER ────────────────────────────────
  const sliderTrackWidth = SCREEN_WIDTH - 36;
  const thumbWidth = 50;
  const maxSlideDistance = sliderTrackWidth - thumbWidth - 8;

  const slideX = useRef(new Animated.Value(0)).current;

  const slidePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isInputEmpty && !swapping,
      onStartShouldSetPanResponderCapture: () => !isInputEmpty && !swapping,
      onMoveShouldSetPanResponder: (_, gesture) => !isInputEmpty && !swapping && Math.abs(gesture.dx) > 2,
      onMoveShouldSetPanResponderCapture: (_, gesture) => !isInputEmpty && !swapping && Math.abs(gesture.dx) > 2,
      onPanResponderGrant: () => {
        setScrollEnabled(false);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gesture) => {
        const clampedX = Math.max(0, Math.min(gesture.dx, maxSlideDistance));
        slideX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gesture) => {
        setScrollEnabled(true);
        if (gesture.dx >= maxSlideDistance * 0.65) {
          Animated.timing(slideX, {
            toValue: maxSlideDistance,
            duration: 100,
            useNativeDriver: true,
          }).start(() => {
            handleExecuteSwap();
            setTimeout(() => {
              Animated.spring(slideX, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 4,
                speed: 18,
              }).start();
            }, 600);
          });
        } else {
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 18,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        Animated.spring(slideX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 18,
        }).start();
      },
    })
  ).current;

  const filteredAssets = BASE_SWAP_ASSETS.filter(a =>
    tokenSearchQuery
      ? a.name.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
        a.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase())
      : true
  );

  const usdFromEquivalent = (numericFromAmount * fromAsset.priceUsd).toFixed(2);
  const usdToEquivalent = (parseFloat(toAmount) * toAsset.priceUsd).toFixed(2);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP HEADER (Image 2: ←, Market ˅, 🎛) ─────────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.('Home')}
          style={[styles.headerCircleBtn, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
        </TouchableOpacity>

        {/* Center Market Dropdown Pill */}
        <View style={[styles.marketPill, { backgroundColor: monoMutedSurface }]}>
          <Text style={[styles.marketPillText, { color: isDark ? '#FFFFFF' : '#111111' }]}>Market</Text>
          <ChevronDownIcon color={isDark ? '#AAAAAA' : colors.text.muted} size={12} />
        </View>

        {/* Slippage Settings Button */}
        <TouchableOpacity
          onPress={() => setShowSlippageModal(true)}
          style={[styles.headerCircleBtn, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <SettingsIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: Math.max(16, insets.bottom + 8) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* SWAP CARDS: YOU PAY & YOU RECEIVE (Image 2)              */}
        {/* ======================================================== */}
        <View style={styles.swapCardsContainer}>
          {/* 1. YOU PAY CARD */}
          <View style={[styles.swapCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.cardInputRow}>
              <Text
                style={[
                  styles.cardInputText,
                  { color: isDark ? '#FFFFFF' : '#111111' },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {fromAmount}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectorTarget('from')}
                style={[styles.tokenPill, { backgroundColor: monoMutedSurface }]}
                activeOpacity={0.75}
              >
                <TokenLogo symbol={fromAsset.symbol} size={24} />
                <Text style={[styles.tokenPillText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                  {fromAsset.symbol}
                </Text>
                <ChevronDownIcon color={colors.text.muted} size={12} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardSubRow}>
              <Text style={styles.cardUsdText}>
                ${usdFromEquivalent} ⇅
              </Text>

              <View style={styles.balanceRightRow}>
                <WalletSmallIcon color="#7E8B9B" size={13} />
                <Text style={styles.balanceNumberText}>
                  {fromBalanceFormatted}
                </Text>
              </View>
            </View>
          </View>

          {/* CIRCULAR FLIP SWITCH BUTTON (Image 2: centered circle with ↓) */}
          <View style={styles.flipWrapper}>
            <TouchableOpacity
              onPress={handleFlipAssets}
              style={[
                styles.flipCircleBtn,
                { backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF', borderColor: isDark ? '#333333' : '#E0E0E0' },
              ]}
              activeOpacity={0.8}
            >
              <DownArrowIcon color="#6366F1" size={17} />
            </TouchableOpacity>
          </View>

          {/* 2. YOU RECEIVE CARD */}
          <View style={[styles.swapCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.cardInputRow}>
              <Text
                style={[
                  styles.cardInputText,
                  { color: isDark ? '#C7CAD4' : '#111111' },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {toAmount}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectorTarget('to')}
                style={[styles.tokenPill, { backgroundColor: monoMutedSurface }]}
                activeOpacity={0.75}
              >
                <TokenLogo symbol={toAsset.symbol} size={24} />
                <Text style={[styles.tokenPillText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                  {toAsset.symbol}
                </Text>
                <ChevronDownIcon color={colors.text.muted} size={12} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardSubRow}>
              <Text style={styles.cardUsdText}>
                ${usdToEquivalent}
              </Text>

              <View style={styles.balanceRightRow}>
                <WalletSmallIcon color="#7E8B9B" size={13} />
                <Text style={styles.balanceNumberText}>
                  {toBalanceFormatted}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 5-DOT PERCENTAGE SLIDER (Image 2) ─────────────────── */}
        <View style={styles.fiveDotSliderContainer}>
          {/* Base background bar */}
          <View style={[styles.sliderTrackLine, { backgroundColor: isDark ? '#262626' : '#E5E5E5' }]}>
            {/* Active purple filled bar */}
            <View style={[styles.sliderActiveLine, { width: `${selectedPercent}%`, backgroundColor: '#5865F2' }]} />
          </View>

          {/* 5 Dots Row */}
          <View style={styles.dotsRow}>
            {PERCENT_STOPS.map((pct) => (
              <TouchableOpacity
                key={pct}
                onPress={() => handlePercentPress(pct)}
                style={styles.dotTouchItem}
                hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
              >
                <View
                  style={[
                    styles.sliderDotCircle,
                    {
                      backgroundColor: pct <= selectedPercent ? '#FFFFFF' : '#4E576B',
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* White Round Thumb Circle positioned at selectedPercent */}
          <View
            style={[
              styles.sliderThumbCircle,
              {
                left: `${Math.min(96, Math.max(0, selectedPercent))}%`,
              },
            ]}
          />
        </View>

        {/* ======================================================== */}
        {/* INBUILT NUMERIC KEYPAD (Image 2)                         */}
        {/* ======================================================== */}
        <View style={styles.keypadWrapper}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleKeypadPress(key)}
                style={styles.keypadButton}
                activeOpacity={0.65}
              >
                <Text style={[styles.keypadDigitText, { color: isDark ? '#FFFFFF' : '#111111' }]}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleKeypadPress(key)}
                style={styles.keypadButton}
                activeOpacity={0.65}
              >
                <Text style={[styles.keypadDigitText, { color: isDark ? '#FFFFFF' : '#111111' }]}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleKeypadPress(key)}
                style={styles.keypadButton}
                activeOpacity={0.65}
              >
                <Text style={[styles.keypadDigitText, { color: isDark ? '#FFFFFF' : '#111111' }]}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            <TouchableOpacity
              onPress={() => handleKeypadPress('.')}
              style={styles.keypadButton}
              activeOpacity={0.65}
            >
              <Text style={[styles.keypadDigitText, { color: isDark ? '#FFFFFF' : '#111111' }]}>.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleKeypadPress('0')}
              style={styles.keypadButton}
              activeOpacity={0.65}
            >
              <Text style={[styles.keypadDigitText, { color: isDark ? '#FFFFFF' : '#111111' }]}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleKeypadPress('backspace')}
              style={styles.keypadButton}
              activeOpacity={0.65}
            >
              <BackspaceIcon color={isDark ? '#FFFFFF' : '#111111'} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* SLIDE TO SWAP GESTURE BAR (Image 2)                      */}
        {/* ======================================================== */}
        <View style={styles.slideContainer}>
          <View
            style={[
              styles.slideTrack,
              {
                backgroundColor: isDark ? '#1C1C1C' : '#E8E8E8',
                borderColor: cardBorder,
              },
            ]}
          >
            {/* Center Slide to Swap Label */}
            <Text style={[styles.slideTrackLabel, { color: isDark ? '#888888' : '#666666' }]}>
              {swapping ? 'Executing Swap…' : 'Slide to Swap'}
            </Text>

            {/* Draggable Circle Handle (Image 2: > icon inside circular handle) */}
            <Animated.View
              {...slidePanResponder.panHandlers}
              style={[
                styles.slideThumb,
                {
                  backgroundColor: isDark ? '#2C2C2C' : '#D0D0D0',
                  transform: [{ translateX: slideX }],
                },
              ]}
            >
              <SliderChevronIcon color={isDark ? '#AAAAAA' : '#333333'} size={22} />
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* TOKEN SELECTOR MODAL                                     */}
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
                    ? fromAsset.symbol === asset.symbol
                    : toAsset.symbol === asset.symbol;

                return (
                  <TouchableOpacity
                    key={asset.symbol}
                    onPress={() => {
                      if (selectorTarget === 'from') {
                        if (toAsset.symbol === asset.symbol) {
                          setToAsset(fromAsset);
                        }
                        setFromAsset(asset);
                      } else {
                        if (fromAsset.symbol === asset.symbol) {
                          setFromAsset(toAsset);
                        }
                        setToAsset(asset);
                      }
                      setSelectorTarget(null);
                    }}
                    style={[
                      styles.tokenItemRow,
                      { borderBottomColor: cardBorder },
                      isSelected && { backgroundColor: monoMutedSurface },
                    ]}
                    activeOpacity={0.7}
                  >
                    <TokenLogo symbol={asset.symbol} size={36} />
                    <View style={styles.tokenItemMiddle}>
                      <Text style={[styles.tokenItemSymbol, { color: colors.text.primary }]}>
                        {asset.symbol}
                      </Text>
                      <Text style={[styles.tokenItemName, { color: colors.text.muted }]}>
                        {asset.name} • {asset.network}
                      </Text>
                    </View>

                    <View style={styles.tokenItemRight}>
                      <Text style={[styles.tokenItemBalance, { color: colors.text.primary }]}>
                        {asset.balance}
                      </Text>
                      <Text style={[styles.tokenItemUsd, { color: colors.text.muted }]}>
                        ${(parseFloat(asset.balance.replace(/,/g, '')) * asset.priceUsd).toFixed(2)}
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
      {/* SLIPPAGE MODAL                                           */}
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
                      backgroundColor: slippage === slip ? '#5865F2' : monoMutedSurface,
                      borderColor: cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.slippageChoiceText,
                      { color: slippage === slip ? '#FFFFFF' : colors.text.primary },
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
          <View style={[styles.successModalCard, { backgroundColor: isDark ? '#171717' : '#FFFFFF', borderColor: cardBorder }]}>
            <View style={[styles.successIconCircle, { backgroundColor: '#FFFFFF' }]}>
              <CheckIcon color="#000000" size={28} />
            </View>

            <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Swap Executed</Text>
            <Text style={[styles.successSub, { color: isDark ? '#AAAAAA' : '#666666' }]}>
              Successfully exchanged {fromAmount} {fromAsset.symbol} for ≈ {toAmount} {toAsset.symbol} via Cura Smart Aggregator.
            </Text>

            <TouchableOpacity
              onPress={() => setShowSuccessModal(false)}
              style={styles.successDonePill}
              activeOpacity={0.8}
            >
              <Text style={styles.successDoneText}>Done</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  marketPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  swapCardsContainer: {
    gap: 6,
    position: 'relative',
    marginBottom: 16,
  },
  swapCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardInputText: {
    fontSize: 26,
    fontWeight: '800',
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tokenPillText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardUsdText: {
    fontSize: 13,
    color: '#7E8B9B',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  balanceRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  balanceNumberText: {
    fontSize: 12.5,
    color: '#7E8B9B',
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  flipWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    zIndex: 10,
  },
  flipCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fiveDotSliderContainer: {
    height: 32,
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 6,
    position: 'relative',
  },
  sliderTrackLine: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderActiveLine: {
    height: 6,
    borderRadius: 3,
  },
  dotsRow: {
    position: 'absolute',
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotTouchItem: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDotCircle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sliderThumbCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: -10 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  keypadWrapper: {
    marginVertical: 10,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  keypadButton: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadDigitText: {
    fontSize: 24,
    fontWeight: '600',
  },
  slideContainer: {
    marginTop: 'auto',
    marginBottom: 6,
    paddingTop: 10,
  },
  slideTrack: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  slideTrackLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  slideThumb: {
    position: 'absolute',
    left: 4,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  sheetCard: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555555',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  tokenItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    paddingHorizontal: 4,
  },
  tokenItemMiddle: {
    flex: 1,
    marginLeft: 12,
  },
  tokenItemSymbol: {
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 16,
    lineHeight: 18,
  },
  slippagePillRow: {
    flexDirection: 'row',
    gap: 10,
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
  successDonePill: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDoneText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
