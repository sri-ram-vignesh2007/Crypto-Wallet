// src/screens/HistoryScreen.tsx
// Enhanced Transaction History with AI explanations, filtering, and export

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Dimensions, RefreshControl } from 'react-native';
import { Card, Button, TextInput } from 'react-native-paper';
import { Chip } from '../components/Chip';
import { theme } from '../theme/Theme';
import { useWalletStore } from '../store/walletStore';
import { rpcManager } from '../core/RPCManager';
import { AIService } from '../services/AIService';
import { CHAINS } from '../core/ChainConfig';
import { ethers } from 'ethers';

const SCREEN_W = Dimensions.get('window').width;

interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string | null;
  value: string;           // wei
  gasUsed: number;
  gasPrice: string;        // wei
  status: number;          // 1 = success, 0 = failed
  tokenTransfers: TokenTransfer[];
  aiExplanation?: string;
}

interface TokenTransfer {
  contractAddress: string;
  from: string;
  to: string;
  value: string;
  symbol: string;
  decimals: number;
}

const FILTERS = ['All', 'Sent', 'Received', 'Swaps', 'Approvals', 'Failed', 'NFT'];

export default function HistoryScreen({ navigation }: any) {
  const { address, selectedChain } = useWalletStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [explaining, setExplaining] = useState<string | null>(null);

  useEffect(() => { load(); }, [address, selectedChain]);

  const load = async () => {
    if (!address) { setLoading(false); return; }
    setLoading(true);
    try {
      // In production: query indexer (Alchemy, Covalent, Blockscout, etc.)
      // For demo, generate mock transactions
      const mock = generateMockTransactions(address, selectedChain);
      setTransactions(mock);
      setFiltered(mock);
    } catch (e) {
      console.error('History load error:', e);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    let result = transactions;
    if (activeFilter > 0) {
      const filter = FILTERS[activeFilter];
      result = result.filter(tx => matchesFilter(tx, filter));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tx => 
        tx.hash.toLowerCase().includes(q) ||
        (tx.to?.toLowerCase().includes(q)) ||
        tx.tokenTransfers.some(t => t.symbol.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [transactions, activeFilter, search]);

  const matchesFilter = (tx: Transaction, filter: string): boolean => {
    const isSent = tx.from.toLowerCase() === address?.toLowerCase();
    const isReceived = tx.to?.toLowerCase() === address?.toLowerCase();
    const isSwap = tx.tokenTransfers.length >= 2 && 
      tx.tokenTransfers.some(t => t.from.toLowerCase() === address?.toLowerCase()) &&
      tx.tokenTransfers.some(t => t.to.toLowerCase() === address?.toLowerCase());
    const isApproval = tx.tokenTransfers.some(t => 
      t.contractAddress.toLowerCase() !== '0x0000000000000000000000000000000000000000' &&
      tx.to?.toLowerCase() === t.contractAddress.toLowerCase()
    );
    const isNFT = tx.tokenTransfers.some(t => t.decimals === 0 && t.symbol.includes('NFT'));

    switch (filter) {
      case 'Sent': return isSent && !isReceived;
      case 'Received': return isReceived && !isSent;
      case 'Swaps': return isSwap;
      case 'Approvals': return isApproval;
      case 'Failed': return tx.status === 0;
      case 'NFT': return isNFT;
      default: return true;
    }
  };

  const explainTransaction = async (tx: Transaction) => {
    if (tx.aiExplanation) return;
    setExplaining(tx.hash);
    try {
      const explanation = await AIService.explainTransaction(
        tx.hash,
        tx.from,
        tx.to,
        ethers.formatEther(tx.value),
        tx.gasUsed.toString(),
        tx.status,
        CHAINS[selectedChain]?.name || 'Ethereum'
      );
      setTransactions(prev => prev.map(t => t.hash === tx.hash ? { ...t, aiExplanation: explanation } : t));
    } catch (e) {
      console.error('Explain error:', e);
    }
    setExplaining(null);
  };

  const copyHash = (hash: string) => {
    // Clipboard.setStringAsync(hash); // would need expo-clipboard
    Alert.alert('Copied', 'Transaction hash copied to clipboard');
  };

  const openExplorer = (hash: string) => {
    const explorer = CHAINS[selectedChain]?.explorer || 'https://etherscan.io';
    // Linking.openURL(`${explorer}/tx/${hash}`);
    Alert.alert('Open Explorer', `${explorer}/tx/${hash}`);
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>
          {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'No wallet connected'}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          mode="outlined"
          placeholder="Search by hash, address, token…"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          textColor={theme.colors.text}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal style={styles.chipsWrap} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.screen }}>
        {FILTERS.map((f, i) => (
          <Chip
            key={f}
            label={f}
            selected={activeFilter === i}
            onPress={() => setActiveFilter(i)}
            icon={i === 0 ? undefined : getFilterIcon(f)}
          />
        ))}
      </ScrollView>

      {/* Transaction List */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyDesc}>
              {activeFilter > 0 ? `No ${FILTERS[activeFilter].toLowerCase()} transactions found.` : 'Your transaction history will appear here.'}
            </Text>
          </View>
        ) : (
          filtered.map((tx, i) => (
            <TransactionCard
              key={tx.hash}
              tx={tx}
              index={i}
              address={address || ''}
              chainKey={selectedChain}
              onExplain={() => explainTransaction(tx)}
              onCopy={() => copyHash(tx.hash)}
              onExplorer={() => openExplorer(tx.hash)}
              isExplaining={explaining === tx.hash}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getFilterIcon(filter: string): string {
  const icons: Record<string, string> = {
    Sent: '↑',
    Received: '↓',
    Swaps: '⇄',
    Approvals: '✓',
    Failed: '✗',
    NFT: '🖼',
  };
  return icons[filter] || '';
}

function TransactionCard({ tx, index, address, chainKey, onExplain, onCopy, onExplorer, isExplaining }: {
  tx: Transaction; index: number; address: string; chainKey: string;
  onExplain: () => void; onCopy: () => void; onExplorer: () => void; isExplaining: boolean;
}) {
  const isSent = tx.from.toLowerCase() === address.toLowerCase();
  const isReceived = tx.to?.toLowerCase() === address.toLowerCase();
  const mainTransfer = tx.tokenTransfers[0];
  const valueEth = parseFloat(ethers.formatEther(tx.value));
  const gasEth = parseFloat(ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice)));
  const statusColor = tx.status === 1 ? theme.colors.success : theme.colors.danger;
  const statusText = tx.status === 1 ? 'Success' : 'Failed';

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.txCard}>
      {/* Header */}
      <View style={styles.txHeader}>
        <View style={styles.txTypeRow}>
          <View style={[styles.txDirection, { backgroundColor: isSent ? theme.colors.danger + '15' : theme.colors.success + '15' }]}>
            <Text style={[styles.txDirectionText, { color: isSent ? theme.colors.danger : theme.colors.success }]}>
              {isSent ? '↑' : '↓'}
            </Text>
          </View>
          <Text style={styles.txType}>
            {getTxTypeLabel(tx, address)}
          </Text>
        </View>
        <View style={styles.txMeta}>
          <Text style={[styles.txStatus, { color: statusColor }]}>{statusText}</Text>
          <Text style={styles.txTime}>{formatTime(tx.timestamp)}</Text>
        </View>
      </View>

      {/* Main Info */}
      <View style={styles.txMain}>
        <View style={styles.txValueRow}>
          {mainTransfer && (
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenAmount}>
                {isSent ? '-' : '+'}{formatTokenAmount(mainTransfer.value, mainTransfer.decimals)} {mainTransfer.symbol}
              </Text>
              <Text style={styles.tokenUsd}>≈ ${estimateUsd(mainTransfer)}</Text>
            </View>
          )}
          {(valueEth > 0 && (!mainTransfer || mainTransfer.symbol !== CHAINS[chainKey]?.symbol)) && (
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenAmount}>
                {isSent ? '-' : '+'}{valueEth.toFixed(6)} {CHAINS[chainKey]?.symbol || 'ETH'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.txAddresses}>
          <Text style={styles.txFrom}>{formatAddress(tx.from, tx.from === address)}</Text>
          {tx.to && <Text style={styles.txTo}>{tx.to === address ? '← You' : formatAddress(tx.to, tx.to === address)}</Text>}
        </View>

        <View style={styles.txDetails}>
          <Text style={styles.detailItem}>Gas: {tx.gasUsed.toLocaleString()} · {gasEth.toFixed(6)} {CHAINS[chainKey]?.symbol || 'ETH'}</Text>
          <Text style={styles.detailItem}>Block: #{tx.blockNumber.toLocaleString()}</Text>
        </View>
      </View>

      {/* AI Explanation */}
      {tx.aiExplanation && (
        <View style={styles.aiExplanation}>
          <Text style={styles.aiLabel}>AI Explanation</Text>
          <Text style={styles.aiText}>{tx.aiExplanation}</Text>
        </View>
      )}

      {!tx.aiExplanation && tx.status === 1 && (
        <Button mode="text" onPress={onExplain} disabled={isExplaining} style={styles.explainBtn}>
          {isExplaining ? 'Explaining…' : 'Explain with AI'}
        </Button>
      )}

      {/* Actions */}
      <View style={styles.txActions}>
        <TouchableOpacity onPress={onCopy} activeOpacity={0.7} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Copy Hash</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onExplorer} activeOpacity={0.7} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Explorer</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function getTxTypeLabel(tx: Transaction, address: string): string {
  const isSent = tx.from.toLowerCase() === address.toLowerCase();
  const isReceived = tx.to?.toLowerCase() === address.toLowerCase();
  
  if (tx.tokenTransfers.length >= 2) {
    const sent = tx.tokenTransfers.find(t => t.from.toLowerCase() === address.toLowerCase());
    const received = tx.tokenTransfers.find(t => t.to.toLowerCase() === address.toLowerCase());
    if (sent && received) return `Swap: ${sent.symbol} → ${received.symbol}`;
  }
  if (tx.tokenTransfers.some(t => t.decimals === 0)) return 'NFT Transfer';
  if (tx.to && tx.tokenTransfers.some(t => tx.to?.toLowerCase() === t.contractAddress.toLowerCase())) return 'Token Approval';
  if (isSent && isReceived) return 'Self Transfer';
  if (isSent) return 'Sent';
  if (isReceived) return 'Received';
  return 'Contract Call';
}

function formatTokenAmount(value: string, decimals: number): string {
  const num = parseFloat(ethers.formatUnits(value, decimals));
  if (num >= 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (num >= 1) return num.toFixed(4);
  return num.toFixed(6);
}

function estimateUsd(transfer: TokenTransfer): number {
  const prices: Record<string, number> = {
    ETH: 3500, BNB: 720, MATIC: 0.85, AVAX: 42, FTM: 0.72,
    USDT: 1, USDC: 1, DAI: 1, WETH: 3500, WBTC: 72000,
  };
  const amount = parseFloat(ethers.formatUnits(transfer.value, transfer.decimals));
  return amount * (prices[transfer.symbol] || 0);
}

function formatAddress(addr: string, isSelf: boolean): string {
  if (isSelf) return 'You';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTime(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000 - timestamp);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Mock transaction generator for demo
function generateMockTransactions(address: string, chainKey: string): Transaction[] {
  const now = Math.floor(Date.now() / 1000);
  const types = ['sent', 'received', 'swap', 'approval', 'nft', 'failed'];
  const tokens = [
    { symbol: 'ETH', decimals: 18, price: 3500 },
    { symbol: 'USDC', decimals: 6, price: 1 },
    { symbol: 'USDT', decimals: 6, price: 1 },
    { symbol: 'WBTC', decimals: 8, price: 72000 },
    { symbol: 'UNI', decimals: 18, price: 12 },
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const token = tokens[Math.floor(Math.random() * types.length)];
    const isSent = type === 'sent' || type === 'swap' || type === 'approval';
    const timestamp = now - Math.floor(Math.random() * 30 * 86400);
    
    let tokenTransfers: Transaction['tokenTransfers'] = [];
    let value = '0';
    
    switch (type) {
      case 'sent':
        value = ethers.parseEther((0.01 + Math.random() * 0.5).toFixed(4)).toString();
        tokenTransfers = [{
          contractAddress: '0x0000000000000000000000000000000000000000',
          from: address,
          to: '0x' + Math.random().toString(16).slice(2, 42),
          value,
          symbol: 'ETH',
          decimals: 18,
        }];
        break;
      case 'received':
        value = ethers.parseEther((0.01 + Math.random() * 1).toFixed(4)).toString();
        tokenTransfers = [{
          contractAddress: '0x0000000000000000000000000000000000000000',
          from: '0x' + Math.random().toString(16).slice(2, 42),
          to: address,
          value,
          symbol: 'ETH',
          decimals: 18,
        }];
        break;
      case 'swap':
        const tokenIn = tokens[Math.floor(Math.random() * tokens.length)];
        const tokenOut = tokens[Math.floor(Math.random() * tokens.length)];
        const rawAmountIn = (10 + Math.random() * 1000).toFixed(2);
        const amountIn = ethers.parseUnits(rawAmountIn, tokenIn.decimals).toString();
        const amountOut = ethers.parseUnits((parseFloat(rawAmountIn) / tokenIn.price * tokenOut.price).toFixed(2), tokenOut.decimals).toString();
        tokenTransfers = [
          { contractAddress: tokenIn.symbol === 'ETH' ? '0x0000000000000000000000000000000000000000' : '0x' + Math.random().toString(16).slice(2, 42), from: address, to: '0x' + Math.random().toString(16).slice(2, 42), value: amountIn, symbol: tokenIn.symbol, decimals: tokenIn.decimals },
          { contractAddress: tokenOut.symbol === 'ETH' ? '0x0000000000000000000000000000000000000000' : '0x' + Math.random().toString(16).slice(2, 42), from: '0x' + Math.random().toString(16).slice(2, 42), to: address, value: amountOut, symbol: tokenOut.symbol, decimals: tokenOut.decimals },
        ];
        value = '0';
        break;
      case 'approval':
        tokenTransfers = [{
          contractAddress: '0x' + Math.random().toString(16).slice(2, 42),
          from: address,
          to: '0x' + Math.random().toString(16).slice(2, 42),
          value: ethers.parseUnits('1000000', 18).toString(),
          symbol: tokens[Math.floor(Math.random() * tokens.length)].symbol,
          decimals: 18,
        }];
        break;
      case 'nft':
        tokenTransfers = [{
          contractAddress: '0x' + Math.random().toString(16).slice(2, 42),
          from: isSent ? address : '0x' + Math.random().toString(16).slice(2, 42),
          to: isSent ? '0x' + Math.random().toString(16).slice(2, 42) : address,
          value: '1',
          symbol: 'NFT #' + Math.floor(Math.random() * 10000),
          decimals: 0,
        }];
        break;
      case 'failed':
        value = ethers.parseEther((0.01 + Math.random() * 0.1).toFixed(4)).toString();
        tokenTransfers = [{
          contractAddress: '0x' + Math.random().toString(16).slice(2, 42),
          from: address,
          to: '0x' + Math.random().toString(16).slice(2, 42),
          value,
          symbol: 'ETH',
          decimals: 18,
        }];
        break;
    }

    return {
      hash: '0x' + Math.random().toString(16).slice(2, 66),
      blockNumber: 18000000 + Math.floor(Math.random() * 100000),
      timestamp,
      from: address,
      to: isSent ? '0x' + Math.random().toString(16).slice(2, 42) : address,
      value,
      gasUsed: 21000 + Math.floor(Math.random() * 200000),
      gasPrice: (Math.floor(Math.random() * 50) + 10).toString() + '000000000',
      status: type === 'failed' ? 0 : 1,
      tokenTransfers,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
  }

  const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 64, paddingHorizontal: theme.spacing.screen, marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4, fontWeight: '500' },
  searchWrap: { paddingHorizontal: theme.spacing.screen, marginBottom: 12 },
  searchInput: { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.borderRadius.full },
  chipsWrap: { marginBottom: 16, paddingRight: theme.spacing.screen },
  list: { flex: 1, paddingHorizontal: theme.spacing.screen },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, color: theme.colors.textMuted },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 20 },
  txCard: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  txTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txDirection: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txDirectionText: { fontSize: 12, fontWeight: '700' },
  txType: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  txMeta: { alignItems: 'flex-end' },
  txStatus: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  txTime: { fontSize: 11, color: theme.colors.textMuted },
  txMain: { marginBottom: 12 },
  txValueRow: { marginBottom: 8 },
  tokenInfo: { marginRight: 16 },
  tokenAmount: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  tokenUsd: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  txAddresses: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  txFrom: { fontSize: 12, color: theme.colors.text, fontFamily: 'monospace', flex: 1 },
  txTo: { fontSize: 12, color: theme.colors.textSecondary, fontFamily: 'monospace', flex: 1 },
  txDetails: { flexDirection: 'row', gap: 16 },
  detailItem: { fontSize: 11, color: theme.colors.textMuted, fontFamily: 'monospace' },
  aiExplanation: { paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.borderLight, marginTop: 8, paddingVertical: 8, backgroundColor: theme.colors.primaryMuted, borderRadius: theme.borderRadius.md },
  aiLabel: { fontSize: 11, color: theme.colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  aiText: { fontSize: 13, color: theme.colors.text, lineHeight: 18 },
  explainBtn: { marginTop: 8, paddingHorizontal: 0 },
  txActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: theme.colors.primary },
});