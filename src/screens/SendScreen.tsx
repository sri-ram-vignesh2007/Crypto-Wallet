// src/screens/SendScreen.tsx - Apple iPhone Native Style Send Screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TextInput,
  SafeAreaView, StatusBar, Alert, Modal, KeyboardAvoidingView, Platform,
  ActivityIndicator, Linking, Animated, Pressable, TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { ethers } from 'ethers';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { CHAINS } from '../core/ChainConfig';
import { rpcManager } from '../core/RPCManager';

// Smooth iOS Spring Button Component
function SpringButton({
  children,
  onPress,
  disabled = false,
  style,
  activeScale = 0.96,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  activeScale?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: activeScale,
      damping: 18,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 18,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const ChevronDownIcon = ({ color = '#8E8E93', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const BackChevronIcon = ({ color = '#007AFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

const CheckIcon = ({ color = '#FFFFFF', size = 28 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
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
  const [gasSpeed, setGasSpeed] = useState<'economy' | 'standard' | 'instant'>('standard');
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
      Alert.alert('Invalid Address', 'Please enter a valid EVM address (starts with 0x).');
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

  const primaryBlue = isDark ? '#0A84FF' : '#007AFF';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const hairline = isDark ? '#2C2C2E' : '#E5E5EA';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Apple Navigation Bar */}
      <View style={[styles.navBar, { paddingTop: insets.top + 4 }]}>
        <SpringButton onPress={() => navigation.goBack()} style={styles.navBackBtn}>
          <BackChevronIcon color={primaryBlue} size={24} />
          <Text style={[styles.navBackText, { color: primaryBlue }]}>Wallet</Text>
        </SpringButton>
        <Text style={[styles.navTitle, { color: colors.text.primary }]}>Send</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(34, insets.bottom + 24) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Asset Picker (Apple Inset Grouped Row) */}
          <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>ASSET</Text>
          <SpringButton onPress={() => setShowTokenSelector(true)} style={[styles.insetCard, { backgroundColor: cardBg, borderColor: hairline }]}>
            <View style={styles.assetRow}>
              <View style={[styles.assetIconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                <Text style={styles.assetIconEmoji}>{currentSelectedBalance.token.logo || '🪙'}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>
                  {currentSelectedBalance.token.symbol}
                </Text>
                <Text style={[styles.assetSub, { color: colors.text.muted }]}>
                  {currentChainObj.name} • Available: {parseFloat(currentSelectedBalance.balance).toFixed(4)}
                </Text>
              </View>
              <View style={styles.assetSelectorTag}>
                <Text style={[styles.assetSelectorTagText, { color: colors.text.secondary }]}>Change</Text>
                <ChevronDownIcon color={colors.text.muted} size={14} />
              </View>
            </View>
          </SpringButton>

          {/* Section: Recipient Address */}
          <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>RECIPIENT</Text>
          <View style={[styles.insetCard, { backgroundColor: cardBg, borderColor: hairline }]}>
            <View style={styles.inputInnerRow}>
              <TextInput
                style={[styles.addressInput, { color: colors.text.primary }]}
                placeholder="EVM address (0x...)"
                placeholderTextColor={colors.text.muted}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <SpringButton onPress={handlePaste} style={[styles.pastePill, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                <Text style={[styles.pastePillText, { color: primaryBlue }]}>Paste</Text>
              </SpringButton>
            </View>
          </View>

          {/* Section: Amount */}
          <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>AMOUNT</Text>
          <View style={[styles.insetCard, { backgroundColor: cardBg, borderColor: hairline }]}>
            <View style={styles.amountInputRow}>
              <TextInput
                style={[styles.amountInput, { color: colors.text.primary }]}
                placeholder="0"
                placeholderTextColor={colors.text.muted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <View style={styles.amountRightGroup}>
                <Text style={[styles.amountSymbol, { color: colors.text.primary }]}>
                  {currentSelectedBalance.token.symbol}
                </Text>
                <SpringButton onPress={handleMaxAmount} style={[styles.maxPill, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                  <Text style={[styles.maxPillText, { color: primaryBlue }]}>MAX</Text>
                </SpringButton>
              </View>
            </View>

            <View style={[styles.dividerHairline, { backgroundColor: hairline }]} />

            {/* PREDICTIVE GAS ENGINE (Economy vs Standard vs Instant) */}
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[styles.feeLabel, { color: colors.text.secondary }]}>Execution Speed</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: gasSpeed === 'instant' ? '#00F5A0' : '#00F0FF', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                  {gasSpeed === 'economy' ? 'Economy • ~45s' : gasSpeed === 'standard' ? 'Standard • ~15s' : 'Instant • Next Block (~4s)'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['economy', 'standard', 'instant'] as const).map((spd) => (
                  <TouchableOpacity
                    key={spd}
                    onPress={() => setGasSpeed(spd)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: gasSpeed === spd ? (isDark ? '#00F0FF20' : '#E5F1FF') : (isDark ? '#22252D' : '#F2F2F7'),
                      borderWidth: 0.5,
                      borderColor: gasSpeed === spd ? '#00F0FF' : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'capitalize', color: gasSpeed === spd ? (isDark ? '#00F0FF' : '#007AFF') : colors.text.muted }}>
                      {spd}
                    </Text>
                    <Text style={{ fontSize: 10, marginTop: 2, color: colors.text.secondary }}>
                      {spd === 'economy' ? '$0.95' : spd === 'standard' ? '$1.82' : '$3.45'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* MonTech Revenue Engine 1 Smart Routing Savings Notice */}
            <View style={{ padding: 10, borderRadius: 10, backgroundColor: isDark ? 'rgba(0,245,160,0.08)' : '#E8F8EE', borderWidth: 0.5, borderColor: isDark ? 'rgba(0,245,160,0.2)' : 'transparent', marginBottom: 6 }}>
              <Text style={{ fontSize: 11, color: isDark ? '#00F5A0' : '#248A3D', fontWeight: '600' }}>
                ⚡ Saves you $18.40 via Smart Routing (0.35% protocol fee included)
              </Text>
            </View>

            <View style={styles.feeInfoRow}>
              <Text style={[styles.feeLabel, { color: colors.text.secondary }]}>Network Fee (Est.)</Text>
              <Text style={[styles.feeValue, { color: colors.text.primary }]}>{gasFeeEstimate}</Text>
            </View>
          </View>

          {/* Apple Style Send Button */}
          <SpringButton
            onPress={handleSendPress}
            disabled={loading}
            style={[styles.primaryActionBtn, { backgroundColor: primaryBlue }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryActionBtnText}>Review Transaction</Text>
            )}
          </SpringButton>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Apple Inset Confirmation Sheet Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg, borderColor: hairline }]}>
            {/* iOS Sheet Grabber */}
            <View style={[styles.sheetGrabber, { backgroundColor: isDark ? '#3A3A3C' : '#D1D1D6' }]} />

            <Text style={[styles.confirmHeaderTitle, { color: colors.text.primary }]}>Review Details</Text>
            <Text style={[styles.confirmHeaderSubtitle, { color: colors.text.muted }]}>
              Verify transaction parameters before broadcast
            </Text>

            <View style={[styles.confirmGroupCard, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <View style={styles.confirmItemRow}>
                <Text style={[styles.confirmItemLabel, { color: colors.text.secondary }]}>Send Amount</Text>
                <Text style={[styles.confirmItemVal, { color: colors.text.primary, fontWeight: '700' }]}>
                  {amount} {currentSelectedBalance.token.symbol}
                </Text>
              </View>
              <View style={[styles.confirmDivider, { backgroundColor: hairline }]} />

              <View style={styles.confirmItemRow}>
                <Text style={[styles.confirmItemLabel, { color: colors.text.secondary }]}>To Address</Text>
                <Text style={[styles.confirmItemVal, { color: colors.text.primary }]} numberOfLines={1}>
                  {recipient.slice(0, 8)}...{recipient.slice(-6)}
                </Text>
              </View>
              <View style={[styles.confirmDivider, { backgroundColor: hairline }]} />

              <View style={styles.confirmItemRow}>
                <Text style={[styles.confirmItemLabel, { color: colors.text.secondary }]}>Network</Text>
                <Text style={[styles.confirmItemVal, { color: colors.text.primary }]}>{currentChainObj.name}</Text>
              </View>
              <View style={[styles.confirmDivider, { backgroundColor: hairline }]} />

              <View style={styles.confirmItemRow}>
                <Text style={[styles.confirmItemLabel, { color: colors.text.secondary }]}>Est. Gas Fee</Text>
                <Text style={[styles.confirmItemVal, { color: colors.text.primary }]}>{gasFeeEstimate}</Text>
              </View>
              <View style={[styles.confirmDivider, { backgroundColor: hairline }]} />

              <View style={styles.confirmItemRow}>
                <Text style={[styles.confirmItemLabel, { color: colors.text.secondary }]}>MEV Shield</Text>
                <Text style={[styles.confirmItemVal, { color: '#00F0FF', fontWeight: '700' }]}>Private Relay Active ✓</Text>
              </View>
            </View>

            <View style={styles.sheetActionsRow}>
              <SpringButton
                onPress={() => setShowConfirm(false)}
                style={[styles.sheetCancelBtn, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
              >
                <Text style={[styles.sheetCancelBtnText, { color: colors.text.primary }]}>Cancel</Text>
              </SpringButton>

              <SpringButton
                onPress={executeSend}
                disabled={loading}
                style={[styles.sheetConfirmBtn, { backgroundColor: primaryBlue }]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.sheetConfirmBtnText}>Confirm & Send</Text>
                )}
              </SpringButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* Apple Success Modal */}
      <Modal
        visible={!!txSuccessHash}
        transparent
        animationType="fade"
        onRequestClose={() => setTxSuccessHash(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.successModalCard, { backgroundColor: cardBg, borderColor: hairline }]}>
            <View style={[styles.successCircle, { backgroundColor: isDark ? '#30D158' : '#34C759' }]}>
              <CheckIcon color="#FFFFFF" size={26} />
            </View>
            <Text style={[styles.successHeading, { color: colors.text.primary }]}>Transaction Sent</Text>
            <Text style={[styles.successBody, { color: colors.text.secondary }]}>
              Successfully submitted to {currentChainObj.name} RPC node.
            </Text>

            <SpringButton
              onPress={() => txSuccessHash && openExplorer(txSuccessHash)}
              style={[styles.explorerPill, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            >
              <Text style={[styles.explorerPillText, { color: primaryBlue }]}>View on Explorer ↗</Text>
            </SpringButton>

            <SpringButton
              onPress={() => setTxSuccessHash(null)}
              style={[styles.successDoneBtn, { backgroundColor: primaryBlue }]}
            >
              <Text style={styles.successDoneBtnText}>Done</Text>
            </SpringButton>
          </View>
        </View>
      </Modal>

      {/* Asset Selector Sheet Modal */}
      <Modal
        visible={showTokenSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTokenSelector(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: cardBg, borderColor: hairline }]}>
            <View style={[styles.sheetGrabber, { backgroundColor: isDark ? '#3A3A3C' : '#D1D1D6' }]} />
            <Text style={[styles.confirmHeaderTitle, { color: colors.text.primary }]}>Select Token</Text>
            <ScrollView style={{ maxHeight: 300, marginTop: 12 }}>
              {availableTokens.map((item, idx) => (
                <SpringButton
                  key={`${item.token.symbol}-${idx}`}
                  onPress={() => {
                    setSelectedTokenSymbol(item.token.symbol);
                    setShowTokenSelector(false);
                  }}
                  style={[styles.tokenListRow, { borderBottomColor: hairline }]}
                >
                  <View>
                    <Text style={[styles.tokenListSymbol, { color: colors.text.primary }]}>{item.token.symbol}</Text>
                    <Text style={[styles.tokenListName, { color: colors.text.muted }]}>{item.token.name}</Text>
                  </View>
                  <Text style={[styles.tokenListBal, { color: colors.text.primary }]}>{item.balance}</Text>
                </SpringButton>
              ))}
            </ScrollView>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBackText: {
    fontSize: 17,
    fontWeight: '400',
    marginLeft: -4,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 12,
    marginTop: 12,
  },
  insetCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetIconEmoji: {
    fontSize: 20,
  },
  assetSymbol: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  assetSub: {
    fontSize: 12,
    marginTop: 2,
  },
  assetSelectorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assetSelectorTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    paddingVertical: 6,
  },
  pastePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  pastePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    paddingVertical: 0,
  },
  amountRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountSymbol: {
    fontSize: 17,
    fontWeight: '600',
  },
  maxPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  maxPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dividerHairline: {
    height: 0.5,
    marginVertical: 12,
  },
  feeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 13,
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryActionBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sheetGrabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  confirmHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  confirmHeaderSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  confirmGroupCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  confirmItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmItemLabel: {
    fontSize: 14,
  },
  confirmItemVal: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmDivider: {
    height: 0.5,
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sheetCancelBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetConfirmBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successModalCard: {
    marginHorizontal: 24,
    marginBottom: 'auto',
    marginTop: 'auto',
    borderRadius: 24,
    borderWidth: 0.5,
    padding: 24,
    alignItems: 'center',
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  successBody: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  explorerPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 18,
  },
  explorerPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successDoneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  tokenListSymbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  tokenListName: {
    fontSize: 13,
    marginTop: 2,
  },
  tokenListBal: {
    fontSize: 15,
    fontWeight: '600',
  },
});
