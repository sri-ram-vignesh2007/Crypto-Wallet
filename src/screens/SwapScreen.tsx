// src/screens/SwapScreen.tsx - Apple Style Swap

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { ClayButton } from '../components/ClayButton';

const ChevronRightIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const SwapArrowIcon = ({ color = '#2563EB', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 16h10l-4-4M17 14H3l4 4" />
  </Svg>
);

const TokenLogos: Record<string, React.ReactElement> = {
  ETH: (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#627EEA" />
      <Path d="M12 5v5.8l4.7 2.1L12 5z" fill="#E5E7EB" />
      <Path d="M12 5L7.3 12.9l4.7-2.1V5z" fill="#FFFFFF" />
    </Svg>
  ),
  USDC: (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#2775CA" />
      <Text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">USDC</Text>
    </Svg>
  ),
  SOL: (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#14F195" />
      <Path d="M17 9.5L12 5 7 9.5l5 4.5 5-4.5z" fill="#9945FF" />
    </Svg>
  ),
  BTC: (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#F7931A" />
      <Path d="M12 7.5c1.4 0 2.5-1.1 2.5-2.5S13.4 2.5 12 2.5 9.5 3.6 9.5 5 10.6 7.5 12 7.5zm0 10c-1.4 0-2.5-1.1-2.5-2.5S10.6 5 12 5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" fill="#FFFFFF" />
    </Svg>
  ),
  MATIC: (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#8247E5" />
      <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#FFFFFF" />
    </Svg>
  ),
  ARB: (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#28A0F0" />
      <Text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">ARB</Text>
    </Svg>
  ),
};

const ASSETS = [
  { symbol: 'ETH', name: 'Ethereum', balance: '2.54', usd: '$6,858', logo: TokenLogos.ETH },
  { symbol: 'USDC', name: 'USD Coin', balance: '1,250.00', usd: '$1,250', logo: TokenLogos.USDC },
  { symbol: 'SOL', name: 'Solana', balance: '15.7', usd: '$2,639', logo: TokenLogos.SOL },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.12', usd: '$3,420', logo: TokenLogos.BTC },
  { symbol: 'MATIC', name: 'Polygon', balance: '1,250', usd: '$1,062', logo: TokenLogos.MATIC },
  { symbol: 'ARB', name: 'Arbitrum', balance: '5,000', usd: '$9,350', logo: TokenLogos.ARB },
];

const PAIRS = [
  { from: 'ETH', to: 'USDC', rate: 2700 },
  { from: 'USDC', to: 'ETH', rate: 0.00037 },
  { from: 'SOL', to: 'USDC', rate: 168 },
  { from: 'USDC', to: 'SOL', rate: 0.0059 },
  { from: 'ETH', to: 'SOL', rate: 16.1 },
  { from: 'SOL', to: 'ETH', rate: 0.062 },
];

const SLIPPAGE_OPTIONS = ['0.1%', '0.5%', '1%', 'Auto'];

export default function SwapScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { swapCrypto } = useWalletStore();

  const [fromAsset, setFromAsset] = useState('ETH');
  const [toAsset, setToAsset] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromAmountUsd, setFromAmountUsd] = useState('');
  const [slippage, setSlippage] = useState('0.5%');
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [showSlippageSelector, setShowSlippageSelector] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState('< 0.1%');
  const [minReceived, setMinReceived] = useState('0.00');
  const [route, setRoute] = useState('Uniswap V3');

  const fromAssetData = ASSETS.find(a => a.symbol === fromAsset) || ASSETS[0];
  const toAssetData = ASSETS.find(a => a.symbol === toAsset) || ASSETS[1];
  const balance = fromAssetData.balance;

  // Calculate amounts
  useEffect(() => {
    if (fromAmount && fromAsset && toAsset) {
      const pair = PAIRS.find(p => p.from === fromAsset && p.to === toAsset);
      if (pair) {
        const calcTo = parseFloat(fromAmount) * pair.rate;
        setToAmount(calcTo.toFixed(4));
        setFromAmountUsd(`$${(parseFloat(fromAmount) * (fromAsset === 'ETH' ? 2700 : fromAsset === 'SOL' ? 168 : 1)).toFixed(2)}`);
        
        // Calculate price impact (simplified)
        const amt = parseFloat(fromAmount);
        if (amt > 100) setPriceImpact('> 1%');
        else if (amt > 10) setPriceImpact('0.5-1%');
        else if (amt > 1) setPriceImpact('0.1-0.5%');
        else setPriceImpact('< 0.1%');
        
        // Min received with slippage
        const slippagePct = parseFloat(slippage.replace('%', '')) / 100;
        const min = calcTo * (1 - slippagePct);
        setMinReceived(min.toFixed(4));
        setRoute('Uniswap V3');
      }
    } else {
      setToAmount('');
      setFromAmountUsd('');
      setPriceImpact('< 0.1%');
      setMinReceived('0.00');
    }
  }, [fromAmount, fromAsset, toAsset]);

  const swapAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    const temp = fromAmount;
    setFromAmount(toAmount);
    setToAmount(temp);
  };

  const handleSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      Alert.alert('Enter Amount', 'Please enter an amount to swap.');
      return;
    }
    if (parseFloat(fromAmount) > parseFloat(balance.replace(',', ''))) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance for this swap.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSwap = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Swap Successful', `${fromAmount} ${fromAsset} swapped for ${toAmount} ${toAsset}`);
      setFromAmount('');
      setToAmount('');
      setShowConfirm(false);
    } catch (e: any) {
      Alert.alert('Swap Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const fromBalance = parseFloat(fromAssetData.balance.replace(',', ''));
  const insufficient = fromAmount && parseFloat(fromAmount) > fromBalance;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M19 12H5M12 19l-7-7 7-7" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.title}>Swap</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Swap Card */}
          <View style={[styles.swapCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            {/* From Asset */}
            <TouchableOpacity style={styles.assetRow} onPress={() => setShowFromSelector(true)} activeOpacity={0.7}>
              <View style={[
                styles.assetSelector,
                { backgroundColor: colors.primary.muted },
              ]}>
                {fromAssetData.logo}
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetSymbol}>{fromAsset}</Text>
                <Text style={styles.assetBalance}>{fromAssetData.balance} • {fromAssetData.usd}</Text>
              </View>
              <ChevronRightIcon color={colors.text.muted} size={20} />
            </TouchableOpacity>

            {/* Amount Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.amountInput, { color: colors.text.primary }]}
                placeholder="0.00"
                placeholderTextColor={colors.text.muted}
                value={fromAmount}
                onChangeText={setFromAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
              <TouchableOpacity style={styles.maxButton} onPress={() => setFromAmount(ASSETS.find(a => a.symbol === fromAsset)?.balance || '')} activeOpacity={0.7}>
                <Text style={styles.maxButtonText}>Max</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.availableBalance}>Available: {fromAssetData.balance} {fromAsset}</Text>

            {/* Swap Arrow Button */}
            <TouchableOpacity style={styles.swapButton} onPress={swapAssets} activeOpacity={0.7}>
              <SwapArrowIcon color={colors.primary.DEFAULT} size={24} />
            </TouchableOpacity>

            {/* To Asset */}
            <TouchableOpacity style={styles.assetRow} onPress={() => setShowToSelector(true)} activeOpacity={0.7}>
              <View style={[
                styles.assetSelector,
                { backgroundColor: colors.success.muted },
              ]}>
                {toAssetData.logo}
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetSymbol}>{toAsset}</Text>
                <Text style={styles.assetBalance}>{toAssetData.balance} • {toAssetData.usd}</Text>
              </View>
              <ChevronRightIcon color={colors.text.muted} size={20} />
            </TouchableOpacity>

            {/* To Amount Display */}
            <View style={styles.outputWrapper}>
              <View style={styles.outputAmount}>
                <Text style={styles.outputAmountText}>{toAmount || '0.0000'}</Text>
                <Text style={styles.outputSymbol}>{toAsset}</Text>
              </View>
              <Text style={styles.outputUsd}>{toAmount ? `$${(parseFloat(toAmount) * (toAsset === 'USDC' ? 1 : toAsset === 'ETH' ? 2700 : toAsset === 'SOL' ? 168 : 1)).toFixed(2)}` : '$0.00'}</Text>
            </View>
          </View>

          {/* Swap Details */}
          <View style={[styles.detailsCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Exchange Rate</Text>
                <Text style={styles.detailValue}>1 ${fromAsset} = {PAIRS.find(p => p.from === fromAsset && p.to === toAsset)?.rate?.toLocaleString() || '—'} ${toAsset}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Price Impact</Text>
                <Text style={[styles.detailValue, { color: priceImpact.includes('>') ? colors.danger.DEFAULT : colors.success.DEFAULT }]}>{priceImpact}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Min Received</Text>
                <Text style={styles.detailValue}>{minReceived} {toAsset}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Route</Text>
                <Text style={styles.detailValue}>{route}</Text>
              </View>
            </View>
          </View>

          {/* Slippage */}
          <TouchableOpacity style={[styles.slippageRow, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]} onPress={() => setShowSlippageSelector(true)} activeOpacity={0.7}>
            <View style={styles.slippageInfo}>
              <Text style={styles.slippageLabel}>Slippage Tolerance</Text>
              <Text style={styles.slippageDesc}>Your transaction will revert if price moves unfavorably</Text>
            </View>
            <View style={styles.slippageValue}>
              <Text style={styles.slippageValueText}>{slippage}</Text>
              <ChevronRightIcon color={colors.text.muted} size={16} />
            </View>
          </TouchableOpacity>

          {/* Swap Button */}
          <ClayButton
            title={loading ? 'Swapping...' : `Swap ${fromAsset} → ${toAsset}`}
            onPress={handleSwap}
            disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0 || insufficient}
            fullWidth
            size="large"
          />

          {/* Warnings */}
          <View style={[styles.warningRow, { backgroundColor: colors.warning.muted, borderColor: colors.warning.DEFAULT }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.warning.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
            </Svg>
            <Text style={styles.warningText}>Price impact {priceImpact}. Min received: {minReceived} {toAsset}. Verify details before confirming.</Text>
          </View>

          {insufficient && (
            <View style={[styles.errorRow, { backgroundColor: colors.danger.muted, borderColor: colors.danger.DEFAULT }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.danger.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M12 9v4M12 17h.01" />
                <Circle cx="12" cy="12" r="10" />
              </Svg>
              <Text style={styles.errorText}>Insufficient balance. You have {fromAssetData.balance} {fromAsset}.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Asset Selector Modals */}
      {showFromSelector && renderAssetSelector('from')}
      {showToSelector && renderAssetSelector('to')}
      {showSlippageSelector && renderSlippageSelector()}

      {/* Confirm Modal */}
      {showConfirm && (
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={() => setShowConfirm(false)} activeOpacity={1} style={styles.modalBackdrop} />
          <View style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Confirm Swap</Text>
            <View style={styles.confirmSummary}>
              <View style={styles.confirmSwapRow}>
                <View style={styles.confirmAsset}>
                  {fromAssetData.logo}
                  <Text style={styles.confirmAssetSymbol}>{fromAmount} ${fromAsset}</Text>
                </View>
                <SwapArrowIcon color={colors.primary.DEFAULT} size={20} />
                <View style={styles.confirmAsset}>
                  {toAssetData.logo}
                  <Text style={styles.confirmAssetSymbol}>{toAmount} ${toAsset}</Text>
                </View>
              </View>
              <View style={styles.confirmDetails}>
                <View style={styles.confirmDetailRow}>
                  <Text style={styles.confirmDetailLabel}>Min Received</Text>
                  <Text style={styles.confirmDetailValue}>{minReceived} ${toAsset}</Text>
                </View>
                <View style={styles.confirmDetailRow}>
                  <Text style={styles.confirmDetailLabel}>Price Impact</Text>
                  <Text style={[styles.confirmDetailValue, { color: priceImpact.includes('>') ? colors.danger.DEFAULT : colors.success.DEFAULT }]}>{priceImpact}</Text>
                </View>
                <View style={styles.confirmDetailRow}>
                  <Text style={styles.confirmDetailLabel}>Route</Text>
                  <Text style={styles.confirmDetailValue}>{route}</Text>
                </View>
                <View style={styles.confirmDetailRow}>
                  <Text style={styles.confirmDetailLabel}>Slippage</Text>
                  <Text style={styles.confirmDetailValue}>{slippage}</Text>
                </View>
              </View>
            </View>
            <View style={styles.confirmActions}>
              <ClayButton title="Cancel" variant="secondary" onPress={() => setShowConfirm(false)} fullWidth size="medium" />
              <ClayButton title={loading ? 'Swapping...' : 'Confirm Swap'} onPress={confirmSwap} disabled={loading} fullWidth size="large" />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );

  // Render functions
  function renderAssetSelector(type: 'from' | 'to') {
    return (
      <View style={styles.modalOverlay} onStartShouldSetResponder={() => true} key={type}>
        <TouchableOpacity onPress={() => type === 'from' ? setShowFromSelector(false) : setShowToSelector(false)} activeOpacity={1} style={styles.modalBackdrop} />
        <View style={styles.assetModal}>
          <Text style={styles.modalTitle}>{type === 'from' ? 'From' : 'To'}</Text>
          {ASSETS.filter(a => a.symbol !== (type === 'from' ? toAsset : fromAsset)).map((asset) => (
            <TouchableOpacity
              key={asset.symbol}
              style={styles.assetModalItem}
              onPress={() => {
                if (type === 'from') { setFromAsset(asset.symbol); setShowFromSelector(false); }
                else { setToAsset(asset.symbol); setShowToSelector(false); }
              }}
              activeOpacity={0.7}
            >
              {asset.logo}
              <View style={styles.assetModalInfo}>
                <Text style={styles.assetModalSymbol}>{asset.symbol}</Text>
                <Text style={styles.assetModalName}>{asset.name}</Text>
              </View>
              <View style={styles.assetModalBalance}>
                <Text style={styles.assetModalBalanceText}>{asset.balance}</Text>
                <Text style={styles.assetModalUsd}>{asset.usd}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function renderSlippageSelector() {
    return (
      <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
        <TouchableOpacity onPress={() => setShowSlippageSelector(false)} activeOpacity={1} style={styles.modalBackdrop} />
        <View style={styles.slippageModal}>
          <Text style={styles.modalTitle}>Slippage Tolerance</Text>
          {SLIPPAGE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.slippageOption, slippage === opt ? styles.slippageOptionActive : null]}
              onPress={() => { setSlippage(opt); setShowSlippageSelector(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.slippageOptionText, slippage === opt ? { color: colors.primary.DEFAULT, fontWeight: '600' } : { color: colors.text.primary }]}>{opt}</Text>
              {slippage === opt && <CheckIcon color={colors.primary.DEFAULT} size={20} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center' },
  swapCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  assetSelector: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetInfo: { flex: 1 },
  assetSymbol: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  assetBalance: { fontSize: 12, color: '#64748B' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlign: 'right',
  },
  maxButton: { paddingHorizontal: 12, paddingVertical: 8 },
  maxButtonText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  availableBalance: { fontSize: 12, color: '#64748B', textAlign: 'right', marginBottom: 16 },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  outputWrapper: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  outputAmount: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  outputAmountText: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  outputSymbol: { fontSize: 17, fontWeight: '600', color: '#64748B' },
  outputUsd: { fontSize: 13, color: '#64748B', marginTop: 2 },
  detailsCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  detailRow: { flexDirection: 'row', gap: 16 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  slippageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  slippageInfo: { flex: 1 },
  slippageLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  slippageDesc: { fontSize: 11, color: '#64748B' },
  slippageValue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slippageValueText: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: { fontSize: 12, color: '#78350F', flex: 1 },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: '#991B1B', flex: 1 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  assetModal: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  slippageModal: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  assetModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  assetModalInfo: { flex: 1 },
  assetModalSymbol: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  assetModalName: { fontSize: 12, color: '#64748B' },
  assetModalBalance: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  assetModalBalanceText: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  assetModalUsd: { fontSize: 13, color: '#64748B' },
  slippageModal: { paddingBottom: 20 },
  slippageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  slippageOptionActive: { backgroundColor: '#EFF6FF' },
  slippageOptionText: { fontSize: 16 },
  confirmModal: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  confirmSummary: { marginBottom: 24 },
  confirmSwapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  confirmAsset: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confirmAssetSymbol: { fontSize: 18, fontWeight: '600', color: '#0F172A' },
  confirmDetails: { gap: 12, paddingHorizontal: 4 },
  confirmDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  confirmDetailLabel: { fontSize: 14, color: '#64748B' },
  confirmDetailValue: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  confirmActions: { gap: 12, marginTop: 8 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
});