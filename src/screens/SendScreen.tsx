// src/screens/SendScreen.tsx - Apple Style Send

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS } from '../core/ChainConfig';
import { ClayButton } from '../components/ClayButton';

const ChevronRightIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const ScanIcon = ({ color = '#2563EB', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 5h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <Path d="M7 7h10v10H7z" />
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
};

const MOCK_BALANCES: Record<string, string> = { ETH: '2.54', USDC: '1,250.00', SOL: '15.7' };
const MOCK_USD_VALUES: Record<string, string> = { ETH: '$6,858.00', USDC: '$1,250.00', SOL: '$2,639.00' };

const ASSETS = ['ETH', 'USDC', 'SOL'];

export default function SendScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { sendCrypto, totalValueUsd } = useWalletStore();

  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fee, setFee] = useState('$0.00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateFee();
  }, [amount, selectedNetwork]);

  const calculateFee = () => {
    const fees: Record<string, string> = {
      ethereum: '$2.45',
      polygon: '$0.01',
      bsc: '$0.05',
      arbitrum: '$0.12',
      base: '$0.03',
      optimism: '$0.08',
      solana: '$0.00025',
    };
    setFee(fees[selectedNetwork] || '$0.00');
  };

  const handleSend = async () => {
    if (!recipient || !amount) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than 0.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setLoading(true);
    try {
      const result = await sendCrypto(recipient, amount, { symbol: selectedAsset, address: '' } as any);
      if (result.success) {
        Alert.alert('Success', `Transaction sent! Hash: ${result.txHash?.slice(0, 10)}...`);
        setRecipient('');
        setAmount('');
        setShowConfirm(false);
      } else {
        Alert.alert('Failed', result.error || 'Transaction failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const balance = MOCK_BALANCES[selectedAsset] || '0';
  const usdValue = MOCK_USD_VALUES[selectedAsset] || '$0.00';

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
            <Text style={styles.title}>Send</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Asset Selector */}
          <TouchableOpacity style={styles.assetSelector} onPress={() => setShowAssetSelector(true)} activeOpacity={0.7}>
            {TokenLogos[selectedAsset] ? <TokenLogos[selectedAsset] /> : (
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="11" fill="#E2E8F0" />
              </Svg>
            )}
            <View style={styles.assetInfo}>
              <Text style={styles.assetSymbol}>{selectedAsset}</Text>
              <Text style={styles.assetBalance}>{balance} • {usdValue}</Text>
            </View>
            <ChevronRightIcon color={colors.text.muted} size={20} />
          </TouchableOpacity>

          {/* Recipient */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Recipient Address</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0x... or scan QR"
                placeholderTextColor={colors.text.muted}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
                autoComplete="off"
              />
              <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanModal(true)} activeOpacity={0.7}>
                <ScanIcon color={colors.primary.DEFAULT} size={22} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                placeholderTextColor={colors.text.muted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
              <TouchableOpacity style={styles.maxButton} onPress={() => setAmount(balance)} activeOpacity={0.7}>
                <Text style={styles.maxButtonText}>Max</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.availableBalance}>
              <Text style={styles.availableText}>Available: {balance} {selectedAsset} ({usdValue})</Text>
            </View>
          </View>

          {/* Network */}
          <TouchableOpacity style={styles.networkSelector} onPress={() => setShowNetworkSelector(true)} activeOpacity={0.7}>
            <View style={styles.networkInfo}>
              <Text style={styles.networkLabel}>Network</Text>
              <View style={styles.networkRow}>
                <Text style={styles.networkName}>{CHAINS[selectedNetwork]?.name || selectedNetwork}</Text>
                <Text style={styles.feeText}>Fee: {fee}</Text>
              </View>
            </View>
            <ChevronRightIcon color={colors.text.muted} size={20} />
          </TouchableOpacity>

          {/* Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Text style={styles.summaryLabel}>You send</Text>
            <Text style={styles.summaryAmount}>{amount || '0.00'} {selectedAsset}</Text>
            <Text style={styles.summaryUsd}>≈ {usdValue}</Text>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Network fee</Text>
              <Text style={styles.summaryRowValue}>{fee}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Total</Text>
              <Text style={[styles.summaryRowValue, { fontWeight: '700' }]}>{parseFloat(amount || '0') > 0 ? `${parseFloat(amount) + parseFloat(fee.replace('$', ''))} ${selectedAsset}` : '0.00'}</Text>
            </View>
          </View>

          {/* Send Button */}
          <ClayButton
            title={loading ? 'Sending...' : `Send ${selectedAsset}`}
            onPress={handleSend}
            disabled={loading || !recipient || !amount || parseFloat(amount) <= 0}
            fullWidth
            size="large"
          />

          {/* Risk Warning */}
          <View style={[styles.riskWarning, { backgroundColor: colors.warning.muted, borderColor: colors.warning.DEFAULT }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.warning.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
            </Svg>
            <Text style={styles.riskText}>Double-check the recipient address. Transactions cannot be reversed.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Asset Selector Modal */}
      {showAssetSelector && (
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={() => setShowAssetSelector(false)} activeOpacity={1} style={styles.modalBackdrop} />
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Asset</Text>
            {ASSETS.map((asset) => (
              <TouchableOpacity
                key={asset}
                style={styles.modalItem}
                onPress={() => { setSelectedAsset(asset); setShowAssetSelector(false); }}
                activeOpacity={0.7}
              >
                {TokenLogos[asset] ? <TokenLogos[asset] /> : null}
                <View>
                  <Text style={styles.modalItemSymbol}>{asset}</Text>
                  <Text style={styles.modalItemBalance}>{MOCK_BALANCES[asset]} {asset}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Network Selector Modal */}
      {showNetworkSelector && (
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={() => setShowNetworkSelector(false)} activeOpacity={1} style={styles.modalBackdrop} />
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Network</Text>
            {Object.values(CHAINS).map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={styles.modalItem}
                onPress={() => { setSelectedNetwork(chain.id); setShowNetworkSelector(false); }}
                activeOpacity={0.7}
              >
                <View style={styles.modalItemNetwork}>
                  <Text style={styles.modalItemName}>{chain.name}</Text>
                  <Text style={styles.modalItemSymbol}>{chain.symbol}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Scan QR Modal */}
      {showScanModal && (
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={() => setShowScanModal(false)} activeOpacity={1} style={styles.modalBackdrop} />
          <View style={styles.scanModal}>
            <Text style={styles.modalTitle}>Scan QR Code</Text>
            <View style={styles.scanArea}>
              <Svg width={200} height={200} viewBox="0 0 200 200">
                <Rect x="10" y="10" width="180" height="180" stroke={colors.border.DEFAULT} strokeWidth={2} />
                {/* QR pattern placeholder */}
                {[...Array(10)].map((_, i) => (
                  <Rect key={i} x={20 + i * 16} y={20} width={8} height={8} fill={colors.text.muted} />
                ))}
              </Svg>
            </View>
            <Text style={styles.scanHint}>Point camera at QR code</Text>
            <ClayButton title="Cancel" variant="secondary" onPress={() => setShowScanModal(false)} fullWidth size="medium" />
          </View>
        </View>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={() => setShowConfirm(false)} activeOpacity={1} style={styles.modalBackdrop} />
          <View style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Confirm Transaction</Text>
            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Send</Text>
                <Text style={styles.confirmValue}>{amount} {selectedAsset}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>To</Text>
                <Text style={styles.confirmValue}>{recipient.slice(0, 10)}...</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Network</Text>
                <Text style={styles.confirmValue}>{CHAINS[selectedNetwork]?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Fee</Text>
                <Text style={styles.confirmValue}>{fee}</Text>
              </View>
            </View>
            <View style={styles.confirmActions}>
              <ClayButton title="Cancel" variant="secondary" onPress={() => setShowConfirm(false)} fullWidth size="medium" />
              <ClayButton title={loading ? 'Sending...' : 'Confirm Send'} onPress={confirmSend} disabled={loading} fullWidth size="large" />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center' },
  assetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  assetInfo: { flex: 1 },
  assetSymbol: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  assetBalance: { fontSize: 13, color: '#64748B' },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  amountInput: { textAlign: 'right' },
  scanButton: { padding: 12 },
  maxButton: { paddingHorizontal: 16, paddingVertical: 8 },
  maxButtonText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  availableBalance: { marginTop: 8 },
  availableText: { fontSize: 13, color: '#64748B' },
  networkSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  networkInfo: { flex: 1 },
  networkLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  networkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  networkName: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  feeText: { fontSize: 13, color: '#64748B' },
  summaryCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  summaryLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  summaryAmount: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  summaryUsd: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryRowLabel: { fontSize: 15, color: '#64748B' },
  summaryRowValue: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  riskWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  riskText: { fontSize: 13, color: '#78350F', flex: 1 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  modalItemSymbol: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  modalItemBalance: { fontSize: 13, color: '#64748B' },
  modalItemNetwork: { flex: 1 },
  modalItemName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  modalItemSymbol: { fontSize: 13, color: '#64748B' },
  scanModal: { paddingBottom: 20 },
  scanArea: { alignItems: 'center', marginVertical: 20 },
  scanHint: { fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' },
  confirmModal: { paddingBottom: 20 },
  confirmDetails: { marginVertical: 20, gap: 16 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  confirmLabel: { fontSize: 15, color: '#64748B' },
  confirmValue: { fontSize: 15, fontWeight: '600', color: '#0F172A', textAlign: 'right', flex: 1 },
  confirmActions: { gap: 12, marginTop: 8 },
});