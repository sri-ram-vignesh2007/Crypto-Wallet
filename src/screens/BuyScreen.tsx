// src/screens/BuyScreen.tsx - Institutional Direct Crypto Buying & Multi-Exchange Deposit Hub
// High-velocity self-custodial on-ramp with direct balance crediting and zero emojis

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';
import QRCodeView from '../components/QRCodeView';
import { useTransactionStore, WalletTransaction } from '../store/transactionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── VECTOR MONOCHROME GLYPHS (NO EMOJIS) ──────────────────────────
const ArrowLeftIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const CopyIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const CheckCircleIcon = ({ color = '#22C55E', size = 28 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M8 12l2.5 2.5L16 9" />
  </Svg>
);

const ApplePayIcon = ({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.01-.49 2.63-1.24z" />
  </Svg>
);

const CreditCardMonoIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="5" width="20" height="14" rx="2" />
    <Path d="M2 10h20M6 15h2M10 15h4" />
  </Svg>
);

const BankWireMonoIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 21h18M3 10h18M5 10v7M9 10v7M15 10v7M19 10v7M12 3L2 8h20L12 3z" />
  </Svg>
);

// Monochrome Exchange Glyphs
const CoinbaseMonoIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="12" r="9.5" />
    <Circle cx="12" cy="12" r="4" fill={color} />
  </Svg>
);

const BinanceMonoIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2L6 8l6 6 6-6-6-6z" />
    <Path d="M2 12l4-4 4 4-4 4-4-4z" />
    <Path d="M14 12l4-4 4 4-4 4-4-4z" />
    <Path d="M12 16l-6 6 6 6 6-6-6-6z" />
  </Svg>
);

const KrakenMonoIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 3h12a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
    <Path d="M8 18v3M12 18v3M16 18v3" />
    <Circle cx="9" cy="10" r="1.5" fill={color} />
    <Circle cx="15" cy="10" r="1.5" fill={color} />
  </Svg>
);

const OkxMonoIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} />
    <Rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} />
  </Svg>
);

const BybitMonoIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h7v16H4zM13 10h7v10h-7z" fill={color} />
  </Svg>
);

// ── AVAILABLE ASSETS FOR DIRECT IN-APP BUY ─────────────────────────
interface BuyableCrypto {
  symbol: string;
  name: string;
  chain: string;
  priceUsd: number;
}

const BUYABLE_CRYPTOS: BuyableCrypto[] = [
  { symbol: 'BTC', name: 'Bitcoin', chain: 'Bitcoin Core', priceUsd: 67540.0 },
  { symbol: 'ETH', name: 'Ethereum', chain: 'Ethereum Mainnet', priceUsd: 2700.0 },
  { symbol: 'SOL', name: 'Solana', chain: 'Solana L1', priceUsd: 168.2 },
  { symbol: 'BNB', name: 'BNB', chain: 'BNB Smart Chain', priceUsd: 592.4 },
  { symbol: 'USDC', name: 'USD Coin', chain: 'Multi-Chain Standard', priceUsd: 1.0 },
  { symbol: 'USDT', name: 'Tether USD', chain: 'Ethereum & Tron', priceUsd: 1.0 },
  { symbol: 'LIBRA', name: 'Libra', chain: 'BNB Smart Chain', priceUsd: 0.006222 },
];

// ── PAYMENT METHODS (MONOCHROME ICONS) ─────────────────────────────
interface PaymentMethod {
  id: string;
  name: string;
  badge: string;
  feeText: string;
  icon: (color: string) => React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'apple_pay',
    name: 'Apple Pay / Google Pay',
    badge: 'Fastest Checkout',
    feeText: '0% Processing Fee • Instant',
    icon: (color) => <ApplePayIcon color={color} size={22} />,
  },
  {
    id: 'card',
    name: 'Credit or Debit Card',
    badge: 'Visa / Mastercard',
    feeText: '1.2% Network Rail Fee • Instant',
    icon: (color) => <CreditCardMonoIcon color={color} size={20} />,
  },
  {
    id: 'bank',
    name: 'Bank Wire / Direct ACH',
    badge: 'High Limit Rail',
    feeText: 'Zero Fee • Same Day Settlement',
    icon: (color) => <BankWireMonoIcon color={color} size={20} />,
  },
];

// ── CENTRALIZED EXCHANGES (MONOCHROME ICONS, NO EMOJIS) ─────────────
interface ExchangeItem {
  id: string;
  name: string;
  depositType: string;
  fee: string;
  guide: string;
  icon: (color: string) => React.ReactNode;
}

const SUPPORTED_EXCHANGES: ExchangeItem[] = [
  {
    id: 'coinbase',
    name: 'Coinbase Exchange',
    depositType: 'Direct Transfer Rail',
    fee: 'Zero fee transfer',
    guide: 'Connect directly or withdraw from Coinbase. Select the matching network (Ethereum, Solana, BNB) and copy your self-custody address below.',
    icon: (color) => <CoinbaseMonoIcon color={color} size={24} />,
  },
  {
    id: 'binance',
    name: 'Binance',
    depositType: 'Binance Direct / Pay',
    fee: 'Network gas fee only',
    guide: 'On Binance, tap Withdraw Crypto. Choose your token and matching network (BNB Chain, Ethereum, Arbitrum), then paste your address.',
    icon: (color) => <BinanceMonoIcon color={color} size={24} />,
  },
  {
    id: 'kraken',
    name: 'Kraken',
    depositType: 'Instant Kraken Transfer',
    fee: 'Standard withdrawal fee',
    guide: 'Withdraw from your Kraken Funding balance directly to this self-custodial address. Confirm the network matches before sending.',
    icon: (color) => <KrakenMonoIcon color={color} size={24} />,
  },
  {
    id: 'okx',
    name: 'OKX',
    depositType: 'OKX Web3 Fast Rail',
    fee: 'Network fee only',
    guide: 'Use OKX Fast Withdrawal to transfer assets instantly to your self-custodial deposit address.',
    icon: (color) => <OkxMonoIcon color={color} size={24} />,
  },
  {
    id: 'bybit',
    name: 'Bybit',
    depositType: 'Bybit Direct Deposit',
    fee: 'Low network fee',
    guide: 'Navigate to On-Chain Withdrawal on Bybit and paste your self-custodial address.',
    icon: (color) => <BybitMonoIcon color={color} size={24} />,
  },
];

export default function BuyScreen({ navigation }: { navigation?: any }) {
  const { address } = useWalletStore();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { executeBuy } = useTransactionStore();

  const [activeTab, setActiveTab] = useState<'buy' | 'exchange'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState<BuyableCrypto>(BUYABLE_CRYPTOS[0]);
  const [fiatAmount, setFiatAmount] = useState<string>('200');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessingBuy, setIsProcessingBuy] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<WalletTransaction | null>(null);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeItem | null>(null);

  const cardBg = isDark ? '#141720' : '#FFFFFF';
  const cardBorder = isDark ? '#232938' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#1C212E' : '#F2F2F2';

  const userAddress = address || '0x71C67EaE6976A0C3e54BaF88215382A61d4b389A';

  const numericFiat = parseFloat(fiatAmount) || 0;
  const calculatedCrypto = useMemo(() => {
    if (numericFiat <= 0 || !selectedCrypto.priceUsd) return '0';
    const amount = numericFiat / selectedCrypto.priceUsd;
    return amount < 1 ? amount.toFixed(6) : amount.toFixed(4);
  }, [numericFiat, selectedCrypto]);

  const copyAddress = async () => {
    await Clipboard.setStringAsync(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteBuy = () => {
    if (numericFiat <= 0) return;

    setIsProcessingBuy(true);
    setTimeout(() => {
      const cryptoAmountNum = numericFiat / selectedCrypto.priceUsd;
      const tx = executeBuy(
        selectedCrypto.symbol,
        cryptoAmountNum,
        numericFiat,
        selectedPayment.name
      );
      setIsProcessingBuy(false);
      setCompletedTx(tx);
    }, 900);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <View style={[styles.topNav, { borderBottomColor: cardBorder }]}>
        <TouchableOpacity
          onPress={() => navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.('Main')}
          style={[styles.backBtnCircle, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>
          Buy & Deposit Crypto
        </Text>

        <View style={{ width: 36 }} />
      </View>

      {/* ── CLEAN SEGMENTED TOGGLE (ZERO EMOJIS) ─────────────── */}
      <View style={styles.modeSwitchWrap}>
        <View style={[styles.modeSwitchTrack, { backgroundColor: monoMutedSurface }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('buy')}
            style={[
              styles.modeTabBtn,
              activeTab === 'buy' && { backgroundColor: monoPrimary },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeTabText,
                activeTab === 'buy'
                  ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                  : { color: colors.text.muted, fontWeight: '600' },
              ]}
            >
              Buy Crypto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('exchange')}
            style={[
              styles.modeTabBtn,
              activeTab === 'exchange' && { backgroundColor: monoPrimary },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeTabText,
                activeTab === 'exchange'
                  ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                  : { color: colors.text.muted, fontWeight: '600' },
              ]}
            >
              Deposit from Exchange
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Receiving Self-Custody Address Capsule */}
        <View style={[styles.addressCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.addressLeft}>
            <Text style={styles.addressLabel}>Receiving Self-Custody Address</Text>
            <Text style={[styles.addressVal, { color: isDark ? '#FFFFFF' : '#111111' }]} numberOfLines={1}>
              {userAddress}
            </Text>
          </View>

          <TouchableOpacity
            onPress={copyAddress}
            style={[styles.copyBtnPill, { backgroundColor: monoMutedSurface }]}
            activeOpacity={0.7}
          >
            <CopyIcon color={isDark ? '#FFFFFF' : '#111111'} size={14} />
            <Text style={[styles.copyBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'buy' ? (
          <>
            {/* ── 1. SELECT ASSET TO BUY ──────────────────────── */}
            <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              Select Crypto Asset
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainScroll}>
              {BUYABLE_CRYPTOS.map((crypto) => {
                const active = selectedCrypto.symbol === crypto.symbol;
                return (
                  <TouchableOpacity
                    key={crypto.symbol}
                    onPress={() => setSelectedCrypto(crypto)}
                    style={[
                      styles.cryptoCard,
                      {
                        backgroundColor: active ? monoPrimary : cardBg,
                        borderColor: active ? monoPrimary : cardBorder,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <TokenLogo symbol={crypto.symbol} size={30} />
                    <Text
                      style={[
                        styles.cryptoSymbol,
                        { color: active ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#111111') },
                      ]}
                    >
                      {crypto.symbol}
                    </Text>
                    <Text
                      style={[
                        styles.cryptoPrice,
                        { color: active ? (isDark ? '#222222' : '#EEEEEE') : colors.text.muted },
                      ]}
                    >
                      ${crypto.priceUsd < 1 ? crypto.priceUsd.toFixed(4) : crypto.priceUsd.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ── 2. FIAT SPEND & CRYPTO RECEIVE CALCULATOR ──── */}
            <View style={[styles.calculatorCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.calcHeaderRow}>
                <Text style={styles.calcLabel}>You Spend (USD)</Text>
                <Text style={styles.calcLiveRate}>
                  1 {selectedCrypto.symbol} = ${selectedCrypto.priceUsd < 1 ? selectedCrypto.priceUsd.toFixed(4) : selectedCrypto.priceUsd.toLocaleString()}
                </Text>
              </View>

              <View style={styles.fiatInputRow}>
                <Text style={[styles.fiatCurrencyPrefix, { color: isDark ? '#FFFFFF' : '#111111' }]}>$</Text>
                <TextInput
                  value={fiatAmount}
                  onChangeText={setFiatAmount}
                  keyboardType="numeric"
                  placeholder="200"
                  placeholderTextColor={colors.text.muted}
                  style={[styles.fiatTextInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
                />
              </View>

              {/* Quick Amount Presets */}
              <View style={styles.quickAmtRow}>
                {['50', '100', '200', '500', '1000'].map((amt) => {
                  const isSelected = fiatAmount === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setFiatAmount(amt)}
                      style={[
                        styles.quickAmtPill,
                        {
                          backgroundColor: isSelected ? monoPrimary : monoMutedSurface,
                          borderColor: isSelected ? monoPrimary : cardBorder,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.quickAmtText,
                          {
                            color: isSelected
                              ? (isDark ? '#000000' : '#FFFFFF')
                              : (isDark ? '#FFFFFF' : '#111111'),
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        ${amt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Output Crypto Preview */}
              <View style={[styles.receivePreviewBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                <Text style={styles.receiveLabel}>You Receive Directly into Wallet</Text>
                <View style={styles.receiveValueRow}>
                  <TokenLogo symbol={selectedCrypto.symbol} size={24} />
                  <Text style={[styles.receiveAmountText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                    ≈ {calculatedCrypto} {selectedCrypto.symbol}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── 3. PAYMENT METHOD SELECTOR (MONOCHROME ICONS) ── */}
            <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111', marginTop: 20 }]}>
              Payment Method
            </Text>

            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPayment.id === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedPayment(method)}
                  style={[
                    styles.paymentCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: isSelected ? monoPrimary : cardBorder,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentLeft}>
                    <View style={[styles.paymentIconWrap, { backgroundColor: monoMutedSurface }]}>
                      {method.icon(isDark ? '#FFFFFF' : '#111111')}
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.paymentTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                          {method.name}
                        </Text>
                        <View style={[styles.methodBadge, { backgroundColor: monoMutedSurface }]}>
                          <Text style={[styles.methodBadgeText, { color: isDark ? '#CCCCCC' : '#444444' }]}>
                            {method.badge}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.paymentSub}>{method.feeText}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? monoPrimary : colors.text.muted,
                        backgroundColor: isSelected ? monoPrimary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.radioDot, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* ── 4. BUY INSTANTLY ACTION BUTTON ──────────────── */}
            <TouchableOpacity
              onPress={handleExecuteBuy}
              disabled={isProcessingBuy || numericFiat <= 0}
              style={[
                styles.buyActionBtn,
                {
                  backgroundColor: numericFiat > 0 ? monoPrimary : monoMutedSurface,
                  opacity: isProcessingBuy ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.85}
            >
              {isProcessingBuy ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} size="small" />
                  <Text style={[styles.buyActionBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    Processing Settlement…
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buyActionBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                  Buy {calculatedCrypto} {selectedCrypto.symbol} Instantly
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* ── DEPOSIT FROM EXCHANGES (MONOCHROME ICONS, NO EMOJIS) ── */}
            <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              Supported Exchange Integrations
            </Text>
            <Text style={styles.exchangeSub}>
              Select any exchange to view your direct deposit address, QR code, and settlement instructions.
            </Text>

            {SUPPORTED_EXCHANGES.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => setSelectedExchange(ex)}
                style={[styles.exchangeCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                activeOpacity={0.85}
              >
                <View style={styles.exchangeLeft}>
                  <View style={[styles.exchangeIconWrap, { backgroundColor: monoMutedSurface }]}>
                    {ex.icon(isDark ? '#FFFFFF' : '#111111')}
                  </View>
                  <View style={{ marginLeft: 14 }}>
                    <Text style={[styles.exchangeName, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                      {ex.name}
                    </Text>
                    <Text style={styles.exchangeDepositType}>
                      {ex.depositType} • {ex.fee}
                    </Text>
                  </View>
                </View>

                <View style={[styles.transferBtnPill, { backgroundColor: monoMutedSurface }]}>
                  <Text style={[styles.transferBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                    Deposit →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── ORDER CONFIRMATION / SUCCESS MODAL ───────────────── */}
      <Modal
        visible={!!completedTx}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletedTx(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.successCheckCircle}>
              <CheckCircleIcon color="#22C55E" size={38} />
            </View>

            <Text style={[styles.successModalTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              Purchase Completed!
            </Text>
            <Text style={styles.successModalSub}>
              Your self-custody wallet has been credited immediately.
            </Text>

            {completedTx && (
              <View style={[styles.receiptBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Asset Credited</Text>
                  <Text style={[styles.receiptValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                    +{completedTx.amount} {completedTx.asset}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount Paid</Text>
                  <Text style={[styles.receiptValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                    {completedTx.value} USD
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Method</Text>
                  <Text style={[styles.receiptValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                    {completedTx.from}
                  </Text>
                </View>

                <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.receiptLabel}>Tx Hash</Text>
                  <Text
                    style={[styles.receiptValue, { color: colors.text.muted, fontSize: 11 }]}
                    numberOfLines={1}
                  >
                    {completedTx.hash.slice(0, 10)}...{completedTx.hash.slice(-8)}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setCompletedTx(null);
                navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.('Main');
              }}
              style={[styles.successDoneBtn, { backgroundColor: monoPrimary }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.successDoneBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                Done & View Assets
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── EXCHANGE DIRECT DEPOSIT SHEET MODAL ──────────────── */}
      {selectedExchange && (
        <Modal
          visible={!!selectedExchange}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedExchange(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.exchangeSheetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.exchangeIconWrap, { backgroundColor: monoMutedSurface }]}>
                    {selectedExchange.icon(isDark ? '#FFFFFF' : '#111111')}
                  </View>
                  <Text style={[styles.sheetTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                    Deposit from {selectedExchange.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedExchange(null)}
                  style={[styles.sheetCloseBtn, { backgroundColor: monoMutedSurface }]}
                >
                  <Text style={{ color: isDark ? '#FFFFFF' : '#111111', fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* QR Code */}
              <View style={styles.sheetQrWrap}>
                <QRCodeView
                  value={userAddress}
                  size={170}
                  backgroundColor="#FFFFFF"
                  foregroundColor="#0B0E14"
                  centerSymbol="ETH"
                />
              </View>

              {/* Instructions */}
              <Text style={[styles.sheetGuideText, { color: isDark ? '#CCCCCC' : '#444444' }]}>
                {selectedExchange.guide}
              </Text>

              {/* Deposit Address Box */}
              <View style={[styles.sheetAddressBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                <Text style={styles.sheetAddressLabel}>Your Deposit Address</Text>
                <Text style={[styles.sheetAddressText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                  {userAddress}
                </Text>
              </View>

              {/* Copy Address Button */}
              <TouchableOpacity
                onPress={copyAddress}
                style={[styles.sheetCopyBtn, { backgroundColor: monoPrimary }]}
                activeOpacity={0.85}
              >
                <CopyIcon color={isDark ? '#000000' : '#FFFFFF'} size={16} />
                <Text style={[styles.sheetCopyBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                  {copied ? '✓ Address Copied to Clipboard' : 'Copy Deposit Address'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modeSwitchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  modeSwitchTrack: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  modeTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  modeTabText: {
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 16,
  },
  addressLeft: {
    flex: 1,
    marginRight: 10,
  },
  addressLabel: {
    fontSize: 11,
    color: '#858585',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  addressVal: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  copyBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  chainScroll: {
    marginBottom: 16,
  },
  cryptoCard: {
    width: 96,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cryptoSymbol: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  cryptoPrice: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  calculatorCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  calcHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcLabel: {
    fontSize: 12,
    color: '#858585',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calcLiveRate: {
    fontSize: 11,
    color: '#858585',
    fontWeight: '600',
  },
  fiatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fiatCurrencyPrefix: {
    fontSize: 34,
    fontWeight: '800',
    marginRight: 6,
  },
  fiatTextInput: {
    fontSize: 34,
    fontWeight: '800',
    flex: 1,
    padding: 0,
  },
  quickAmtRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickAmtPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmtText: {
    fontSize: 12,
  },
  receivePreviewBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  receiveLabel: {
    fontSize: 11,
    color: '#858585',
    fontWeight: '600',
    marginBottom: 6,
  },
  receiveValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiveAmountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  paymentSub: {
    fontSize: 11,
    color: '#858585',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buyActionBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  buyActionBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  exchangeSub: {
    fontSize: 12,
    color: '#858585',
    lineHeight: 18,
    marginBottom: 14,
  },
  exchangeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  exchangeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exchangeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exchangeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  exchangeDepositType: {
    fontSize: 11,
    color: '#858585',
    marginTop: 2,
  },
  transferBtnPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  transferBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 24,
    alignItems: 'center',
  },
  successCheckCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  successModalSub: {
    fontSize: 13,
    color: '#858585',
    textAlign: 'center',
    marginBottom: 18,
  },
  receiptBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  receiptLabel: {
    fontSize: 12,
    color: '#858585',
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  successDoneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDoneBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  exchangeSheetCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 22,
    borderWidth: 0.5,
    padding: 20,
    alignItems: 'center',
  },
  sheetHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetQrWrap: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
  },
  sheetGuideText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  sheetAddressBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    marginBottom: 14,
  },
  sheetAddressLabel: {
    fontSize: 10,
    color: '#858585',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  sheetAddressText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sheetCopyBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sheetCopyBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
