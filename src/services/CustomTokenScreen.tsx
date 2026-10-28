// src/screens/CustomTokenScreen.tsx
// Import ANY ERC-20 token by contract address (alpha coins, new tokens)

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { ethers } from 'ethers';
import { rpcManager } from '../core/RPCManager';
import { useWalletStore } from '../store/walletStore';
import { CHAINS, Token } from '../core/ChainConfig';
import { theme } from '../theme/Theme';

const ERC20_ABI_MINIMAL = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
];

export default function CustomTokenScreen() {
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const { address, selectedChain, balances } = useWalletStore();

  const fetchTokenInfo = async () => {
    if (!ethers.isAddress(contractAddress)) {
      Alert.alert('Invalid Address', 'Please enter a valid contract address.');
      return;
    }

    setLoading(true);
    try {
      const provider = rpcManager.getProvider(selectedChain);
      const contract = new ethers.Contract(contractAddress, ERC20_ABI_MINIMAL, provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name().catch(() => 'Unknown'),
        contract.symbol().catch(() => '???'),
        contract.decimals().catch(() => 18),
        contract.totalSupply().catch(() => '0'),
      ]);

      setTokenInfo({ name, symbol, decimals, totalSupply: ethers.formatUnits(totalSupply, decimals) });
    } catch (e) {
      Alert.alert('Error', 'Could not fetch token info. Make sure the address is correct and the chain is selected.');
    }
    setLoading(false);
  };

  const addToken = () => {
    if (!tokenInfo) return;
    // In production: save to AsyncStorage + update token list
    Alert.alert(
      'Add Token',
      `Add ${tokenInfo.name} (${tokenInfo.symbol}) to your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            Alert.alert('Added!', `${tokenInfo.name} will appear in your asset list.`);
            setContractAddress('');
            setTokenInfo(null);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Token</Text>
      <Text style={styles.subtitle}>Add alpha coins, new tokens, or custom assets</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Chain: {CHAINS[selectedChain]?.name}</Text>
          <TextInput
            mode="outlined"
            value={contractAddress}
            onChangeText={setContractAddress}
            placeholder="0x..."
            placeholderTextColor="#555"
            style={styles.input}
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            autoCapitalize="none"
          />
          <Button
            mode="contained"
            onPress={fetchTokenInfo}
            loading={loading}
            disabled={!contractAddress}
            style={{ marginTop: 12 }}
            buttonColor={theme.colors.primary}
            textColor="#FFF"
          >
            Fetch Token Info
          </Button>
        </Card.Content>
      </Card>

      {tokenInfo && (
        <Card style={[styles.card, { borderColor: theme.colors.success }]}>
          <Card.Content>
            <Text style={styles.tokenName}>{tokenInfo.name}</Text>
            <Text style={styles.tokenSymbol}>{tokenInfo.symbol}</Text>
            <Text style={styles.tokenDetail}>Decimals: {tokenInfo.decimals}</Text>
            <Text style={styles.tokenDetail}>Total Supply: {parseFloat(tokenInfo.totalSupply).toLocaleString()}</Text>
            <Button
              mode="contained"
              onPress={addToken}
              style={{ marginTop: 12 }}
              buttonColor={theme.colors.success}
              textColor="#FFF"
            >
              + Add to Wallet
            </Button>
          </Card.Content>
        </Card>
      )}

      <Text style={styles.hint}>
        💡 Find contract addresses on Etherscan, BscScan, or CoinGecko.{'\n'}
        Always verify the contract before adding.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginTop: 40 },
  subtitle: { color: theme.colors.textMuted, marginBottom: 24 },
  card: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 14, marginBottom: 16 },
  label: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: theme.colors.surfaceMuted },
  tokenName: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  tokenSymbol: { color: theme.colors.primary, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  tokenDetail: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
  hint: { color: theme.colors.textMuted, fontSize: 12, marginTop: 20, lineHeight: 18, textAlign: 'center' },
});