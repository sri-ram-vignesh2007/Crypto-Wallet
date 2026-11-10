// src/screens/BuyScreen.tsx - Institutional Crypto On-Ramp & Centralized Exchange Direct Deposit (Coinbase / Trust Wallet Style)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput,
  Alert, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const ShieldCheckIcon = ({ color = '#22C55E', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} />
  </Svg>
);

const BUY_CHAINS = [
  { key: 'ethereum', symbol: 'ETH', name: 'Ethereum', provider: 'ETH' },
  { key: 'bsc', symbol: 'BNB', name: 'BNB Smart Chain', provider: 'BNB' },
  { key: 'polygon', symbol: 'MATIC', name: 'Polygon', provider: 'MATIC' },
  { key: 'base', symbol: 'ETH', name: 'Base', provider: 'ETH' },
  { key: 'avalanche', symbol: 'AVAX', name: 'Avalanche', provider: 'AVAX' },
  { key: 'solana', symbol: 'SOL', name: 'Solana', provider: 'SOL' },
  { key: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', provider: 'BTC' },
];

interface ExchangeIntegration {
  id: string;
  name: string;
  iconBg: string;
  emoji: string;
  fee: string;
  depositType: string;
  guide: string;
}

const SUPPORTED_EXCHANGES: ExchangeIntegration[] = [
  {
    id: 'coinbase',
    name: 'Coinbase Exchange',
    iconBg: '#0052FF',
    emoji: '🔵',
    fee: 'Zero fee transfer',
    depositType: 'Direct Coinbase Pay',
    guide: 'Connect with your Coinbase account to move crypto directly into your self-custody wallet without entering complex addresses.',
  },
  {
    id: 'binance',
    name: 'Binance',
    iconBg: '#F3BA2F',
    emoji: '🟡',
    fee: 'Network gas fee only',
    depositType: 'Binance Direct / Pay',
    guide: 'Withdraw directly from Binance App or Web. Select matching network (BNB Chain, Ethereum, Arbitrum) and paste your address.',
  },
  {
    id: 'kraken',
    name: 'Kraken',
    iconBg: '#5741D9',
    emoji: '🐙',
    fee: 'Standard withdrawal fee',
    depositType: 'Instant Kraken Transfer',
    guide: 'Withdraw from your Kraken Funding balance directly to this self-custodial deposit address.',
  },
  {
    id: 'okx',
    name: 'OKX',
    iconBg: '#000000',
    emoji: '⬛',
    fee: 'Network fee only',
    depositType: 'OKX Web3 Transfer',
    guide: 'Use OKX Fast Withdrawal to bridge assets instantly to your Cura Wallet address.',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    iconBg: '#F7A600',
    emoji: '🔶',
    fee: 'Low network fee',
    depositType: 'Bybit Direct Deposit',
    guide: 'Select On-Chain Withdrawal on Bybit and paste your recipient address.',
  },
];

export default function BuyScreen({ navigation }: { navigation?: any }) {
  const { address } = useWalletStore();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const [activeTab, setActiveTab] = useState<'fiat' | 'exchange'>('fiat');
  const [selectedChain, setSelectedChain] = useState(BUY_CHAINS[0]);
  const [fiatAmount, setFiatAmount] = useState('200');
  const [copied, setCopied] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [providerUrl, setProviderUrl] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<ExchangeIntegration | null>(null);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#282828' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const copyAddress = async () => {
    if (!address) return;
    await Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openOnramp = (provider: 'moonpay' | 'transak' | 'ramp') => {
    let url = '';
    if (provider === 'moonpay') {
      url = `https://buy.moonpay.com/?walletAddress=${address}&currencyCode=${selectedChain.provider}&baseCurrencyAmount=${fiatAmount}`;
    } else if (provider === 'transak') {
      url = `https://global.transak.com/?walletAddress=${address}&cryptoCurrencyCode=${selectedChain.provider}&fiatAmount=${fiatAmount}`;
    } else {
      url = `https://ramp.network/buy/?userAddress=${address}&swapAsset=${selectedChain.provider}`;
    }
    setProviderUrl(url);
    setShowWebView(true);
  };

  if (showWebView) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.webviewHeader, { paddingTop: insets.top + 6, backgroundColor: cardBg, borderBottomColor: cardBorder }]}>
          <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.webCloseBtn}>
            <Text style={[styles.webCloseText, { color: isDark ? '#FFFFFF' : '#111111' }]}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={[styles.webviewTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Buy {selectedChain.symbol}</Text>
          <View style={{ width: 40 }} />
        </View>
        <WebView source={{ uri: providerUrl }} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── TOP NAV ─────────────────────────────────────────── */}
      <View style={[styles.topNav, { borderBottomColor: cardBorder }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.() || navigation?.navigate?.('Home')}
          style={[styles.backBtnCircle, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Buy & Deposit Crypto</Text>

        <View style={{ width: 36 }} />
      </View>

      {/* ── MODE SEGMENT SWITCH (Fiat vs Exchange) ──────────── */}
      <View style={styles.modeSwitchWrap}>
        <View style={[styles.modeSwitchTrack, { backgroundColor: monoMutedSurface }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('fiat')}
            style={[
              styles.modeTabBtn,
              activeTab === 'fiat' && { backgroundColor: monoPrimary },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.modeTabText,
              activeTab === 'fiat'
                ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                : { color: colors.text.muted, fontWeight: '600' }
            ]}>
              💳 Buy with Fiat
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
            <Text style={[
              styles.modeTabText,
              activeTab === 'exchange'
                ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                : { color: colors.text.muted, fontWeight: '600' }
            ]}>
              🏦 Transfer from Exchange
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Receiving Address Capsule */}
        <View style={[styles.addressCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.addressLeft}>
            <Text style={styles.addressLabel}>Receiving Self-Custody Address</Text>
            <Text style={[styles.addressVal, { color: isDark ? '#FFFFFF' : '#111111' }]} numberOfLines={1}>
              {address || '0x71C67EaE6976A0C3e54BaF88215382A61d4b389A'}
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

        {activeTab === 'fiat' ? (
          <>
            {/* Chain Selector Grid */}
            <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>Select Asset to Buy</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainScroll}>
              {BUY_CHAINS.map(chain => {
                const active = selectedChain.key === chain.key;
                return (
                  <TouchableOpacity
                    key={chain.key}
                    onPress={() => setSelectedChain(chain)}
                    style={[
                      styles.chainCard,
                      {
                        backgroundColor: active ? monoPrimary : cardBg,
                        borderColor: active ? monoPrimary : cardBorder,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <TokenLogo symbol={chain.symbol} size={28} />
                    <Text style={[
                      styles.chainSymbol,
                      { color: active ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#111111') }
                    ]}>
                      {chain.symbol}
                    </Text>
                    <Text style={[
                      styles.chainName,
                      { color: active ? (isDark ? '#222222' : '#EEEEEE') : colors.text.muted }
                    ]}>
                      {chain.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Fiat Amount Input Box */}
            <View style={[styles.fiatAmountBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={styles.fiatAmountLabel}>You Spend (USD)</Text>
              <View style={styles.fiatInputRow}>
                <Text style={[styles.fiatCurrencyPrefix, { color: isDark ? '#FFFFFF' : '#111111' }]}>$</Text>
                <TextInput
                  value={fiatAmount}
                  onChangeText={setFiatAmount}
                  keyboardType="numeric"
                  style={[styles.fiatTextInput, { color: isDark ? '#FFFFFF' : '#111111' }]}
                />
              </View>

              <View style={styles.fiatPillRow}>
                {['50', '100', '200', '500', '1000'].map(amt => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setFiatAmount(amt)}
                    style={[styles.quickAmtPill, { backgroundColor: monoMutedSurface }]}
                  >
                    <Text style={[styles.quickAmtText, { color: isDark ? '#FFFFFF' : '#111111' }]}>${amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Fiat Payment Providers (Cards, Apple Pay, PayPal) */}
            <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111', marginTop: 18 }]}>
              Payment Gateways & Providers
            </Text>

            {/* MoonPay */}
            <TouchableOpacity
              onPress={() => openOnramp('moonpay')}
              style={[styles.providerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              activeOpacity={0.85}
            >
              <View style={styles.providerLeft}>
                <Text style={{ fontSize: 26 }}>🌙</Text>
                <View style={{ marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.providerTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>MoonPay</Text>
                    <View style={[styles.recBadge, { backgroundColor: isDark ? '#22C55E22' : '#DCFCE7' }]}>
                      <Text style={styles.recBadgeText}>Apple Pay / Cards</Text>
                    </View>
                  </View>
                  <Text style={styles.providerSub}>Fee: 1.5% - 3.5% • 160+ countries • Instant Delivery</Text>
                </View>
              </View>
              <View style={[styles.buyBtnPill, { backgroundColor: monoPrimary }]}>
                <Text style={[styles.buyBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Buy</Text>
              </View>
            </TouchableOpacity>

            {/* Transak */}
            <TouchableOpacity
              onPress={() => openOnramp('transak')}
              style={[styles.providerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              activeOpacity={0.85}
            >
              <View style={styles.providerLeft}>
                <Text style={{ fontSize: 26 }}>💳</Text>
                <View style={{ marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.providerTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Transak</Text>
                    <View style={[styles.recBadge, { backgroundColor: isDark ? '#3B82F622' : '#DBEAFE' }]}>
                      <Text style={[styles.recBadgeText, { color: '#3B82F6' }]}>PayPal / SEPA</Text>
                    </View>
                  </View>
                  <Text style={styles.providerSub}>Fee: 0.99% - 2.5% • Lowest Fee • Bank Transfer</Text>
                </View>
              </View>
              <View style={[styles.buyBtnPill, { backgroundColor: monoPrimary }]}>
                <Text style={[styles.buyBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Buy</Text>
              </View>
            </TouchableOpacity>

            {/* Ramp Network */}
            <TouchableOpacity
              onPress={() => openOnramp('ramp')}
              style={[styles.providerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              activeOpacity={0.85}
            >
              <View style={styles.providerLeft}>
                <Text style={{ fontSize: 26 }}>⚡</Text>
                <View style={{ marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.providerTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Ramp Network</Text>
                    <View style={[styles.recBadge, { backgroundColor: isDark ? '#22C55E22' : '#DCFCE7' }]}>
                      <Text style={styles.recBadgeText}>Google Pay</Text>
                    </View>
                  </View>
                  <Text style={styles.providerSub}>Fee: 1.2% - 2.9% • Instant card & wire rails</Text>
                </View>
              </View>
              <View style={[styles.buyBtnPill, { backgroundColor: monoPrimary }]}>
                <Text style={[styles.buyBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Buy</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Exchange Direct Deposit Integration */}
            <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              Deposit Directly from Exchanges
            </Text>
            <Text style={styles.exchangeSub}>
              Move funds from centralized exchange balances directly into your self-custody wallet without manual address typing.
            </Text>

            {SUPPORTED_EXCHANGES.map(ex => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => setSelectedExchange(ex)}
                style={[styles.exchangeCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                activeOpacity={0.85}
              >
                <View style={styles.exchangeLeft}>
                  <Text style={{ fontSize: 28 }}>{ex.emoji}</Text>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.exchangeName, { color: isDark ? '#FFFFFF' : '#111111' }]}>{ex.name}</Text>
                    <Text style={styles.exchangeDepositType}>{ex.depositType} • {ex.fee}</Text>
                  </View>
                </View>

                <View style={[styles.transferBtnPill, { backgroundColor: monoMutedSurface }]}>
                  <Text style={[styles.transferBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>Transfer →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── EXCHANGE GUIDE MODAL ────────────────────────────── */}
      {selectedExchange && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24 }}>{selectedExchange.emoji}</Text>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                  {selectedExchange.name} Transfer
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedExchange(null)}>
                <Text style={{ color: '#858585', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalGuideText, { color: isDark ? '#CCCCCC' : '#444444' }]}>
              {selectedExchange.guide}
            </Text>

            <View style={[styles.guideAddressBox, { backgroundColor: monoMutedSurface }]}>
              <Text style={styles.guideAddressLabel}>Your Deposit Address</Text>
              <Text style={[styles.guideAddressText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                {address || '0x71C67EaE6976A0C3e54BaF88215382A61d4b389A'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={copyAddress}
              style={[styles.modalCopyBtn, { backgroundColor: monoPrimary }]}
              activeOpacity={0.85}
            >
              <CopyIcon color={isDark ? '#000000' : '#FFFFFF'} size={16} />
              <Text style={[styles.modalCopyText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                {copied ? '✓ Address Copied to Clipboard' : 'Copy Address & Open Exchange'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modeSwitchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modeSwitchTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  modeTabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabText: {
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  addressLeft: {
    flex: 1,
    marginRight: 10,
  },
  addressLabel: {
    color: '#858585',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressVal: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  copyBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  chainScroll: {
    marginBottom: 18,
  },
  chainCard: {
    width: 100,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  chainSymbol: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  chainName: {
    fontSize: 11,
    marginTop: 2,
  },
  fiatAmountBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  fiatAmountLabel: {
    color: '#858585',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  fiatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  fiatCurrencyPrefix: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 6,
  },
  fiatTextInput: {
    fontSize: 32,
    fontWeight: '800',
    padding: 0,
    flex: 1,
  },
  fiatPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmtPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmtText: {
    fontSize: 13,
    fontWeight: '700',
  },
  providerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  recBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recBadgeText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '700',
  },
  providerSub: {
    color: '#858585',
    fontSize: 11,
    marginTop: 3,
  },
  buyBtnPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buyBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  exchangeSub: {
    color: '#858585',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  exchangeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  exchangeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exchangeName: {
    fontSize: 15,
    fontWeight: '800',
  },
  exchangeDepositType: {
    color: '#858585',
    fontSize: 12,
    marginTop: 3,
  },
  transferBtnPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  transferBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  webviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  webCloseBtn: {
    paddingVertical: 4,
  },
  webCloseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  webviewTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalGuideText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  guideAddressBox: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  guideAddressLabel: {
    color: '#858585',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  guideAddressText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalCopyText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
