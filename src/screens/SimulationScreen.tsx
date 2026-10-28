// src/screens/SimulationScreen.tsx
// Simulation Mode — dry-run any transaction before signing
// Shows gas estimates, balance changes, approvals needed, revert reasons

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { TextInput, Button, Card, Switch } from 'react-native-paper';
import { ethers } from 'ethers';
import { theme } from '../theme/Theme';
import { useWalletStore } from '../store/walletStore';
import { SimulationService, SimulationParams, SimulationResult } from '../services/SimulationService';
import { CHAINS } from '../core/ChainConfig';
import { UniversalAddressBookService } from '../services/UniversalAddressBookService';

const SCREEN_W = Dimensions.get('window').width;

export default function SimulationScreen({ navigation }: any) {
  const { address, selectedChain, balances } = useWalletStore();
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  
  // Simple mode
  const [toAddress, setToAddress] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  
  // Advanced mode
  const [calldata, setCalldata] = useState('0x');
  
  // Common
  const [chainKey, setChainKey] = useState(selectedChain);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const chainKeys = Object.keys(CHAINS);

  const runSimulation = async () => {
    if (!address) { Alert.alert('No Wallet', 'Create or import a wallet first.'); return; }
    
    let params: SimulationParams;
    
    if (mode === 'simple') {
      if (!toAddress.trim() || (!ethAmount && !tokenAmount)) {
        Alert.alert('Missing Fields', 'Enter recipient and at least one amount.');
        return;
      }
      
      params = {
        chainKey,
        toAddress: toAddress.trim(),
        value: ethAmount ? ethers.parseEther(ethAmount).toString() : '0',
        tokenAddress: tokenAddress || undefined,
        tokenAmount: tokenAmount ? ethers.parseUnits(tokenAmount, 18).toString() : undefined,
      };
    } else {
      if (!toAddress.trim() || !calldata.trim()) {
        Alert.alert('Missing Fields', 'Enter recipient and calldata.');
        return;
      }
      params = {
        chainKey,
        toAddress: toAddress.trim(),
        data: calldata.trim(),
        value: '0',
      };
    }

    setSimulating(true);
    try {
      const res = await SimulationService.simulate(params);
      setResult(res);
      setShowResult(true);
    } catch (e: any) {
      Alert.alert('Simulation Error', e.message);
    }
    setSimulating(false);
  };

  const resolveContact = async () => {
    if (!toAddress.trim()) return;
    const entry = await UniversalAddressBookService.findByName(toAddress.trim());
    if (entry) setToAddress(entry.address);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Simulation Mode</Text>
        <Text style={styles.subtitle}>Dry-run transactions before signing — see gas, balance changes, and risks</Text>
      </View>

      {/* Mode Selector */}
      <Card style={styles.card}>
        <View style={styles.modeRow}>
          {(['simple', 'advanced'] as const).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                {m === 'simple' ? 'Simple Transfer' : 'Advanced (Calldata)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Chain Selector */}
      <Card style={styles.card}>
        <View style={styles.chainRow}>
          <Text style={styles.fieldLabel}>Network</Text>
          <TextInput
            mode="outlined"
            value={chainKey}
            onChangeText={setChainKey}
            style={styles.chainInput}
            editable={false}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
        </View>
      </Card>

      {/* Recipient */}
      <Card style={styles.card}>
        <TextInput
          label="Recipient Address or Contact Name"
          value={toAddress}
          onChangeText={setToAddress}
          mode="outlined"
          style={styles.input}
          textColor={theme.colors.text}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.resolveBtn} onPress={resolveContact} activeOpacity={0.7}>
          <Text style={styles.resolveBtnText}>Resolve from Address Book</Text>
        </TouchableOpacity>
      </Card>

      {/* Simple Mode Fields */}
      {mode === 'simple' && (
        <>
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Native Token (ETH)</Text>
            <TextInput
              label="Amount (ETH)"
              value={ethAmount}
              onChangeText={setEthAmount}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              textColor={theme.colors.text}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
            <Text style={styles.hint}>Available: {parseFloat(balances.find(b => b.token.isNative)?.balance || '0').toFixed(6)} {CHAINS[chainKey]?.symbol || 'ETH'}</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>ERC-20 Token (Optional)</Text>
            <TextInput
              label="Token Contract Address"
              value={tokenAddress}
              onChangeText={setTokenAddress}
              mode="outlined"
              style={styles.input}
              textColor={theme.colors.text}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              autoCapitalize="none"
            />
            <TextInput
              label="Amount"
              value={tokenAmount}
              onChangeText={setTokenAmount}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              textColor={theme.colors.text}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
            <TextInput
              label="Token Symbol (for display)"
              value={tokenSymbol}
              onChangeText={setTokenSymbol}
              mode="outlined"
              style={styles.input}
              textColor={theme.colors.text}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </Card>
        </>
      )}

      {/* Advanced Mode Fields */}
      {mode === 'advanced' && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Transaction Calldata</Text>
          <TextInput
            label="Calldata (hex)"
            value={calldata}
            onChangeText={setCalldata}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            autoCapitalize="none"
            placeholder="0x..."
          />
          <Text style={styles.hint}>Paste full calldata from contract interaction, DEX swap, or any transaction.</Text>
        </Card>
      )}

      {/* Simulate Button */}
      <Button
        mode="contained"
        onPress={runSimulation}
        loading={simulating}
        disabled={!toAddress.trim() || simulating}
        buttonColor={theme.colors.primary}
        textColor="#FFF"
        style={styles.simulateBtn}
        labelStyle={{ fontWeight: '700', fontSize: 16 }}
      >
        {simulating ? 'Simulating…' : 'Run Simulation'}
      </Button>

      {/* Result */}
      {showResult && result && (
        <Card style={[styles.resultCard, result.success ? styles.resultSuccess : styles.resultFail]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIcon, { backgroundColor: result.success ? theme.colors.success + '20' : theme.colors.danger + '20' }]}>
              <Text style={[styles.resultIconText, { color: result.success ? theme.colors.success : theme.colors.danger }]}>
                {result.success ? '✓' : '✗'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultTitle, { color: result.success ? theme.colors.success : theme.colors.danger }]}>
                {result.success ? 'Simulation Successful' : 'Simulation Failed'}
              </Text>
              <Text style={styles.resultSubtitle}>
                {result.success ? `Gas: ${result.gasUsed.toLocaleString()} · Cost: $${result.gasCostUsd.toFixed(4)}` : `Revert: ${result.revertReason?.slice(0, 60)}…`}
              </Text>
            </View>
          </View>

          <View style={styles.resultContent}>
            <Text style={styles.formattedResult}>{SimulationService.formatResult(result)}</Text>
          </View>

          {result.success && result.approvalsNeeded.length > 0 && (
            <View style={styles.actionRow}>
              <Button mode="outlined" onPress={() => navigation?.navigate?.('SecurityCenter')} textColor={theme.colors.primary}>
                Manage Approvals
              </Button>
            </View>
          )}

          {result.success && (
            <View style={styles.actionRow}>
              <Button mode="contained" onPress={() => {
                if (mode === 'simple') {
                  navigation?.navigate?.('Send', { toAddress, amount: ethAmount, tokenSymbol: tokenSymbol || CHAINS[chainKey]?.symbol });
                }
              }} buttonColor={theme.colors.primary} textColor="#FFF">
                Proceed to Send
              </Button>
            </View>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  card: { borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 16, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 12, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  modeBtnActive: { backgroundColor: theme.colors.text },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  modeBtnTextActive: { color: '#FFFFFF' },
  chainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted },
  chainInput: { flex: 1, textAlign: 'right', minWidth: 120, backgroundColor: theme.colors.surfaceMuted },
  input: { marginTop: 8, marginBottom: 8, backgroundColor: theme.colors.surfaceMuted },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 8 },
  hint: { fontSize: 11, color: theme.colors.textMuted, marginTop: 6, fontStyle: 'italic' },
  resolveBtn: { marginTop: 8, alignSelf: 'flex-start' },
  resolveBtnText: { fontSize: 12, fontWeight: '600', color: theme.colors.primary },
  simulateBtn: { borderRadius: theme.borderRadius.full, paddingVertical: 8, marginTop: 8, width: '100%' },
  resultCard: { borderRadius: theme.borderRadius.lg, padding: 16, marginTop: 16, borderWidth: 2 },
  resultSuccess: { borderColor: theme.colors.success },
  resultFail: { borderColor: theme.colors.danger },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  resultIconText: { fontSize: 20, fontWeight: '700' },
  resultTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  resultSubtitle: { fontSize: 12, color: theme.colors.textMuted },
  resultContent: { padding: 12, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.borderRadius.md },
  formattedResult: { fontSize: 12, color: theme.colors.text, fontFamily: 'monospace', lineHeight: 18 },
  actionRow: { marginTop: 16, flexDirection: 'row', gap: 8 },
});