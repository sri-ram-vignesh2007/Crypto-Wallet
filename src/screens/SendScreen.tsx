// src/screens/SendScreen.tsx - Trust Wallet Style Send Screen

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Alert, Modal, KeyboardAvoidingView, Platform,
  ActivityIndicator, Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { ethers } from 'ethers';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS, Chain, Token } from '../core/ChainConfig';
import { rpcManager } from '../core/RPCManager';

const ChevronDownIcon = ({ color = '#94A3B8', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

export default function SendScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { balances, selectedChain, sendCrypto, refreshBalances } = useWalletStore();

  const currentChainObj = CHAINS[selectedChain] || CHAINS.ethereum;

  // Selected token state
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(currentChainObj.symbol);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [gasFeeEstimate, setGasFeeEstimate] = useState<string>('~0.0004 ' + currentChainObj.symbol);
  const [txSuccessHash, setTxSuccessHash] = useState<string | null>(null);

  // Available tokens for current network
  const availableTokens = balances.length > 0
    ? balances
    : [{
        token: {
          address: '',
          symbol: currentChainObj.symbol,
          name: currentChainObj.name,
          decimals: 18,
          logo: currentChainObj.logo,
          chainKey: selectedChain,
          isNative: true,
        },
        balance: '0.00',
        valueUsd: 0,
      }];

  const currentSelectedBalance = availableTokens.find(
    b => b.token.symbol.toUpperCase() === selectedTokenSymbol.toUpperCase()
  ) || availableTokens[0];

  useEffect(() => {
    async function estimateFee() {
      try {
        const feeData = await rpcManager.getFeeData(selectedChain);
        if (feeData.gasPrice) {
          const estimatedCost = ethers.formatEther(feeData.gasPrice * BigInt(21000));
          setGasFeeEstimate(`~${parseFloat(estimatedCost).toFixed(5)} ${currentChainObj.symbol}`);
        }
      } catch {
        setGasFeeEstimate(`~0.0004 ${currentChainObj.symbol}`);
      }
    }
    estimateFee();
  }, [selectedChain, currentChainObj.symbol]);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setRecipient(text.trim());
      }
    } catch {
      Alert.alert('Paste Error', 'Unable to paste from clipboard');
    }
  };

  const handleMaxAmount = () => {
    const totalBal = parseFloat(currentSelectedBalance.balance) || 0;
    if (totalBal <= 0) {
      setAmount('0');
      return;
    }
    // If native coin, reserve a tiny amount for gas
    if (currentSelectedBalance.token.isNative) {
      const safeAmount = Math.max(0, totalBal - 0.001);
      setAmount(safeAmount.toFixed(4));
    } else {
      setAmount(totalBal.toString());
    }
  };

  const handleSendPress = () => {
    const cleanRecipient = recipient.trim();
    if (!cleanRecipient) {
      Alert.alert('Missing Address', 'Please enter a recipient address.');
      return;
    }
    if (!ethers.isAddress(cleanRecipient)) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum / EVM address (starts with 0x).');
      return;
    }
    const sendNum = parseFloat(amount);
    if (isNaN(sendNum) || sendNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than 0.');
      return;
    }
    const currentBal = parseFloat(currentSelectedBalance.balance) || 0;
    if (sendNum > currentBal) {
      Alert.alert('Insufficient Balance', `You have ${currentBal} ${currentSelectedBalance.token.symbol} available.`);
      return;
    }

    setShowConfirm(true);
  };

  const executeSend = async () => {
    setLoading(true);
    try {
      const result = await sendCrypto(
        recipient.trim(),
        amount.trim(),
        currentSelectedBalance.token
      );

      if (result.success && result.txHash) {
        setTxSuccessHash(result.txHash);
        setShowConfirm(false);
        setRecipient('');
        setAmount('');
        await refreshBalances();
      } else {
        Alert.alert('Transaction Failed', result.error || 'Failed to broadcast transaction on RPC.');
        setShowConfirm(false);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Transaction could not be completed.');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const openExplorer = (hash: string) => {
    const url = `${currentChainObj.explorer}/tx/${hash}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Send Crypto</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 20) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Asset Selector Row */}
          <TouchableOpacity
            onPress={() => setShowTokenSelector(true)}
            activeOpacity={0.75}
            style={[styles.assetSelector, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
          >
            <View style={styles.assetLeft}>
              <View style={[styles.tokenLogoCircle, { backgroundColor: colors.primary.muted }]}>
                <Text style={[styles.tokenLogoText, { color: colors.primary.DEFAULT }]}>
                  {currentSelectedBalance.token.symbol.slice(0, 3)}
                </Text>
              </View>
              <View>
                <Text style={[styles.assetName, { color: colors.text.primary }]}>
                  {currentSelectedBalance.token.name}
                </Text>
                <Text style={[styles.assetChain, { color: colors.text.muted }]}>
                  {currentChainObj.name} • Available: {parseFloat(currentSelectedBalance.balance).toFixed(4)}
                </Text>
              </View>
            </View>
            <ChevronDownIcon color={colors.text.muted} size={18} />
          </TouchableOpacity>

          {/* Recipient Address Input */}
          <View style={[styles.inputGroup, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Recipient Address</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.addressInput, { color: colors.text.primary }]}
                placeholder="Paste EVM address (0x...)"
                placeholderTextColor={colors.text.muted}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={handlePaste}
                style={[styles.pasteBtn, { backgroundColor: colors.primary.muted }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pasteBtnText, { color: colors.primary.DEFAULT }]}>Paste</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View style={[styles.inputGroup, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <View style={styles.amountHeader}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Amount</Text>
              <TouchableOpacity onPress={handleMaxAmount} activeOpacity={0.7}>
                <Text style={[styles.maxBtnText, { color: colors.primary.DEFAULT }]}>Use Max</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.amountInput, { color: colors.text.primary }]}
                placeholder="0.00"
                placeholderTextColor={colors.text.muted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.currencyLabel, { color: colors.text.primary }]}>
                {currentSelectedBalance.token.symbol}
              </Text>
            </View>
          </View>

          {/* Network Fee Estimate */}
          <View style={[styles.feeRow, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Text style={[styles.feeLabel, { color: colors.text.secondary }]}>Estimated Network Fee</Text>
            <Text style={[styles.feeValue, { color: colors.text.primary }]}>{gasFeeEstimate}</Text>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendPress}
            disabled={loading}
            activeOpacity={0.88}
            style={[styles.primaryBtn, { backgroundColor: colors.primary.DEFAULT }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Preview Send</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmSheet, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Text style={[styles.confirmTitle, { color: colors.text.primary }]}>Confirm Transaction</Text>
            
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.text.secondary }]}>Sending</Text>
              <Text style={[styles.confirmVal, { color: colors.text.primary }]}>{amount} {currentSelectedBalance.token.symbol}</Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.text.secondary }]}>To</Text>
              <Text style={[styles.confirmVal, { color: colors.text.primary }]} numberOfLines={1}>
                {recipient.slice(0, 10)}...{recipient.slice(-8)}
              </Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.text.secondary }]}>Network</Text>
              <Text style={[styles.confirmVal, { color: colors.text.primary }]}>{currentChainObj.name}</Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.text.secondary }]}>Est. Gas</Text>
              <Text style={[styles.confirmVal, { color: colors.text.primary }]}>{gasFeeEstimate}</Text>
            </View>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={() => setShowConfirm(false)}
                style={[styles.cancelBtn, { borderColor: colors.border.subtle }]}
              >
                <Text style={[styles.cancelBtnText, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={executeSend}
                disabled={loading}
                style={[styles.confirmBtn, { backgroundColor: colors.primary.DEFAULT }]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm & Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Transaction Modal */}
      <Modal
        visible={!!txSuccessHash}
        transparent
        animationType="fade"
        onRequestClose={() => setTxSuccessHash(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successBox, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <View style={[styles.successCheckCircle, { backgroundColor: '#10B981' }]}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M20 6L9 17l-5-5" />
              </Svg>
            </View>
            <Text style={[styles.successTitle, { color: colors.text.primary }]}>Transaction Broadcast!</Text>
            <Text style={[styles.successSubtitle, { color: colors.text.secondary }]}>
              Your transaction has been submitted to {currentChainObj.name} via free public RPC.
            </Text>
            <Text style={[styles.successHash, { color: colors.text.muted }]} numberOfLines={1}>
              Hash: {txSuccessHash}
            </Text>

            <TouchableOpacity
              onPress={() => txSuccessHash && openExplorer(txSuccessHash)}
              style={[styles.explorerBtn, { backgroundColor: colors.primary.muted }]}
            >
              <Text style={[styles.explorerBtnText, { color: colors.primary.DEFAULT }]}>View on Explorer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTxSuccessHash(null)}
              style={[styles.doneBtn, { backgroundColor: colors.primary.DEFAULT }]}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Token Selector Modal */}
      <Modal
        visible={showTokenSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTokenSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowTokenSelector(false)}
          />
          <View style={[styles.tokenSheet, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Select Asset</Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {availableTokens.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.token.symbol}-${idx}`}
                  onPress={() => {
                    setSelectedTokenSymbol(item.token.symbol);
                    setShowTokenSelector(false);
                  }}
                  style={[styles.tokenSelectItem, { borderBottomColor: colors.border.subtle }]}
                >
                  <View>
                    <Text style={[styles.tokenSelectSymbol, { color: colors.text.primary }]}>{item.token.symbol}</Text>
                    <Text style={[styles.tokenSelectName, { color: colors.text.muted }]}>{item.token.name}</Text>
                  </View>
                  <Text style={[styles.tokenSelectBal, { color: colors.text.primary }]}>{item.balance}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  assetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenLogoText: {
    fontSize: 14,
    fontWeight: '800',
  },
  assetName: {
    fontSize: 15,
    fontWeight: '700',
  },
  assetChain: {
    fontSize: 12,
    marginTop: 2,
  },
  inputGroup: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  pasteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pasteBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  maxBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 4,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  feeLabel: {
    fontSize: 13,
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  confirmSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 18,
    textAlign: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  confirmLabel: {
    fontSize: 13,
  },
  confirmVal: {
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 200,
  },
  confirmActions: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successBox: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
  },
  successCheckCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  successHash: {
    fontSize: 11,
    marginBottom: 18,
  },
  explorerBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  explorerBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tokenSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  tokenSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  tokenSelectSymbol: {
    fontSize: 15,
    fontWeight: '700',
  },
  tokenSelectName: {
    fontSize: 12,
    marginTop: 2,
  },
  tokenSelectBal: {
    fontSize: 14,
    fontWeight: '600',
  },
});
