// src/screens/DeveloperDashboard.tsx
// Developer Dashboard — RPC debugging, contract inspection, transaction builder, network tools

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, Switch } from 'react-native-paper';
import { ethers } from 'ethers';
import { theme } from '../theme/Theme';
import { rpcManager } from '../core/RPCManager';
import { CHAINS } from '../core/ChainConfig';
import { SecureKeyManager } from '../core/SecureKeyManager';

export default function DeveloperDashboard() {
  // RPC Tab State
  const [rpcMethod, setRpcMethod] = useState('eth_blockNumber');
  const [rpcParams, setRpcParams] = useState('[]');
  const [rpcUrl, setRpcUrl] = useState(CHAINS.sepolia.rpcUrls[0]);
  const [rpcResult, setRpcResult] = useState<string>('');
  const [rpcLoading, setRpcLoading] = useState(false);

  // Contract Tab State
  const [contractAddress, setContractAddress] = useState('');
  const [contractAbi, setContractAbi] = useState('[{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]');
  const [contractMethod, setContractMethod] = useState('name');
  const [contractArgs, setContractArgs] = useState('[]');
  const [contractResult, setContractResult] = useState<string>('');
  const [contractLoading, setContractLoading] = useState(false);

  // TX Builder State
  const [txTo, setTxTo] = useState('');
  const [txValue, setTxValue] = useState('0');
  const [txData, setTxData] = useState('0x');
  const [txSimulate, setTxSimulate] = useState(true);
  const [txResult, setTxResult] = useState<string>('');
  const [txLoading, setTxLoading] = useState(false);

  // Network Tab State
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<string>('');
  const [netLoading, setNetLoading] = useState(false);

  // Shared State
  const [activeTab, setActiveTab] = useState<'rpc' | 'contract' | 'tx' | 'network'>('rpc');
  const [selectedChain, setSelectedChain] = useState('sepolia');

  const tabs = [
    { key: 'rpc', label: 'RPC Debug' },
    { key: 'contract', label: 'Contract' },
    { key: 'tx', label: 'TX Builder' },
    { key: 'network', label: 'Network' },
  ];

  const callRpc = async () => {
    setRpcLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true });
      const method = rpcMethod.trim();
      const params = JSON.parse(rpcParams || '[]');
      const result = await provider.send(method, params);
      setRpcResult(JSON.stringify(result, null, 2));
    } catch (e: any) {
      setRpcResult(`Error: ${e.message}`);
    }
    setRpcLoading(false);
  };

  const callContract = async () => {
    if (!ethers.isAddress(contractAddress)) { Alert.alert('Invalid address'); return; }
    setContractLoading(true);
    try {
      const provider = rpcManager.getProvider(selectedChain);
      const abi = JSON.parse(contractAbi);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const args = JSON.parse(contractArgs || '[]');
      const result = await contract[contractMethod](...args);
      setContractResult(typeof result === 'bigint' ? result.toString() : JSON.stringify(result));
    } catch (e: any) {
      setContractResult(`Error: ${e.message}`);
    }
    setContractLoading(false);
  };

  const buildTx = async () => {
    if (!ethers.isAddress(txTo)) { Alert.alert('Invalid to address'); return; }
    setTxLoading(true);
    try {
      const address = await SecureKeyManager.getAddress();
      if (!address) { setTxResult('No wallet'); return; }

      const chain = CHAINS[selectedChain];
      const provider = rpcManager.getProvider(selectedChain);
      const feeData = await provider.getFeeData();
      const nonce = await provider.getTransactionCount(address);

      const txRequest: ethers.TransactionRequest = {
        to: txTo,
        from: address,
        value: ethers.parseEther(txValue || '0'),
        data: txData,
        chainId: chain.id,
        nonce,
        maxFeePerGas: feeData.maxFeePerGas || undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
        type: 2,
      };

      const gasLimit = await provider.estimateGas(txRequest);
      txRequest.gasLimit = gasLimit;

      if (txSimulate) {
        const costEth = Number(ethers.formatEther(gasLimit * (feeData.maxFeePerGas || 0n)));
        setTxResult(`Gas Estimate: ${gasLimit.toLocaleString()} units\nEst. Cost: ~${costEth.toFixed(6)} ${chain.symbol} ($${(costEth * 3500).toFixed(2)})`);
      } else {
        const signedTx = await SecureKeyManager.signTransaction(txRequest);
        const txHash = await rpcManager.broadcastTransaction(signedTx, selectedChain);
        setTxResult(`Sent! TX Hash: ${txHash}\nExplorer: ${chain.explorer}/tx/${txHash}`);
      }
    } catch (e: any) {
      setTxResult(`Error: ${e.message}`);
    }
    setTxLoading(false);
  };

  const loadNetworkInfo = async () => {
    setNetLoading(true);
    try {
      const provider = rpcManager.getProvider(selectedChain);
      const [block, feeData] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData(),
      ]);
      setBlockNumber(block);
      setGasPrice(ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setNetLoading(false);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Developer Dashboard</Text>
        <Text style={styles.subtitle}>Debug, inspect, and build transactions</Text>
      </View>

      {/* Chain Selector */}
      <Card style={styles.card}>
        <View style={styles.chainRow}>
          <Text style={styles.chainLabel}>Network</Text>
          <TextInput
            mode="outlined"
            value={selectedChain}
            onChangeText={setSelectedChain}
            style={styles.chainInput}
            editable={false}
          />
        </View>
      </Card>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(t.key as typeof activeTab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RPC Debug Tab */}
      {activeTab === 'rpc' && (
        <Card style={styles.card}>
          <TextInput
            label="RPC Endpoint"
            value={rpcUrl}
            onChangeText={setRpcUrl}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
          <TextInput
            label="Method (e.g., eth_blockNumber, eth_getBalance)"
            value={rpcMethod}
            onChangeText={setRpcMethod}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
          <TextInput
            label="Params (JSON array)"
            value={rpcParams}
            onChangeText={setRpcParams}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
          <Button mode="contained" onPress={callRpc} loading={rpcLoading} buttonColor={theme.colors.primary} textColor="#FFF" style={styles.btn}>
            Call RPC
          </Button>
          {rpcResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Response</Text>
              <Text style={styles.resultText}>{rpcResult}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Contract Tab */}
      {activeTab === 'contract' && (
        <Card style={styles.card}>
          <TextInput
            label="Contract Address"
            value={contractAddress}
            onChangeText={setContractAddress}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            autoCapitalize="none"
          />
          <TextInput
            label="ABI (JSON)"
            value={contractAbi}
            onChangeText={setContractAbi}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
          <TextInput
            label="Method Name"
            value={contractMethod}
            onChangeText={setContractMethod}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
          <TextInput
            label="Args (JSON array)"
            value={contractArgs}
            onChangeText={setContractArgs}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
          <Button mode="contained" onPress={callContract} loading={contractLoading} buttonColor={theme.colors.primary} textColor="#FFF" style={styles.btn}>
            Read Contract
          </Button>
          {contractResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result</Text>
              <Text style={styles.resultText}>{contractResult}</Text>
            </View>
          )}
        </Card>
      )}

      {/* TX Builder Tab */}
      {activeTab === 'tx' && (
        <Card style={styles.card}>
          <TextInput
            label="To Address"
            value={txTo}
            onChangeText={setTxTo}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            autoCapitalize="none"
          />
          <TextInput
            label="Value (ETH)"
            value={txValue}
            onChangeText={setTxValue}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
          />
          <TextInput
            label="Data (hex)"
            value={txData}
            onChangeText={setTxData}
            mode="outlined"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            autoCapitalize="none"
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Simulate Only (estimate gas)</Text>
            <Switch value={txSimulate} onValueChange={setTxSimulate} />
          </View>
          <Button mode="contained" onPress={buildTx} loading={txLoading} buttonColor={theme.colors.primary} textColor="#FFF" style={styles.btn}>
            {txSimulate ? 'Estimate Gas' : 'Sign & Send'}
          </Button>
          {txResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result</Text>
              <Text style={styles.resultText}>{txResult}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <Card style={styles.card}>
          <Button mode="contained" onPress={loadNetworkInfo} loading={netLoading} buttonColor={theme.colors.primary} textColor="#FFF" style={styles.btn}>
            Refresh Network Info
          </Button>
          {blockNumber !== null && (
            <View style={styles.resultBox}>
              <View style={styles.kvRow}><Text style={styles.k}>Block Number</Text><Text style={styles.v}>{blockNumber.toLocaleString()}</Text></View>
              <View style={styles.kvRow}><Text style={styles.k}>Gas Price</Text><Text style={styles.v}>{gasPrice} gwei</Text></View>
              <View style={styles.kvRow}><Text style={styles.k}>Chain ID</Text><Text style={styles.v}>{CHAINS[selectedChain].id}</Text></View>
              <View style={styles.kvRow}><Text style={styles.k}>RPC URL</Text><Text style={styles.v}>{CHAINS[selectedChain].rpcUrls[0]}</Text></View>
            </View>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  card: { borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 16, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border },
  chainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chainLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted },
  chainInput: { flex: 1, textAlign: 'right', minWidth: 120 },
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.borderRadius.full },
  tabBtnActive: { backgroundColor: theme.colors.text },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  tabTextActive: { color: '#FFFFFF' },
  input: { marginBottom: 12, backgroundColor: theme.colors.surfaceMuted },
  btn: { borderRadius: theme.borderRadius.full, marginTop: 8, width: '100%' },
  resultBox: { marginTop: 16, padding: 12, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.borderRadius.md },
  resultLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 6 },
  resultText: { fontSize: 12, color: theme.colors.text, fontFamily: 'monospace', lineHeight: 18 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  k: { color: theme.colors.textMuted, fontSize: 13 },
  v: { color: theme.colors.text, fontSize: 13, fontWeight: '600', fontFamily: 'monospace' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  switchLabel: { fontSize: 14, color: theme.colors.text },
});