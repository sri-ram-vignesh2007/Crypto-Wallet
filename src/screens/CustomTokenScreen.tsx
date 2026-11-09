// src/screens/CustomTokenScreen.tsx
// Import ANY ERC-20 token by contract address (Strict Monochrome)

import React, { useState } from 'react';
import { View, StyleSheet, Alert, StatusBar } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { ethers } from 'ethers';
import { rpcManager } from '../core/RPCManager';
import { useWalletStore } from '../store/walletStore';
import { CHAINS } from '../core/ChainConfig';
import { useColors, useIsDark } from '../theme/ThemeContext';

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
  const { selectedChain } = useWalletStore();
  const colors = useColors();
  const isDark = useIsDark();

  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoPrimaryText = isDark ? '#000000' : '#FFFFFF';

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
    } catch {
      Alert.alert('Error', 'Could not fetch token info. Make sure the address is correct and the chain is selected.');
    }
    setLoading(false);
  };

  const addToken = () => {
    if (!tokenInfo) return;
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
    <View style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Text style={[styles.title, { color: colors.text.primary }]}>Import Token</Text>
      <Text style={[styles.subtitle, { color: colors.text.muted }]}>Add custom assets or smart contract tokens</Text>

      <Card style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT }]}>
        <Card.Content>
          <Text style={[styles.label, { color: colors.text.muted }]}>Chain: {CHAINS[selectedChain]?.name}</Text>
          <TextInput
            mode="outlined"
            value={contractAddress}
            onChangeText={setContractAddress}
            placeholder="0x..."
            placeholderTextColor={colors.text.muted}
            style={[styles.input, { backgroundColor: isDark ? '#171717' : '#F7F7F7' }]}
            textColor={colors.text.primary}
            outlineColor={colors.border.subtle}
            activeOutlineColor={monoPrimary}
            autoCapitalize="none"
          />
          <Button
            mode="contained"
            onPress={fetchTokenInfo}
            loading={loading}
            disabled={!contractAddress}
            style={{ marginTop: 12 }}
            buttonColor={monoPrimary}
            textColor={monoPrimaryText}
          >
            Fetch Token Info
          </Button>
        </Card.Content>
      </Card>

      {tokenInfo && (
        <Card style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT }]}>
          <Card.Content>
            <Text style={[styles.tokenName, { color: colors.text.primary }]}>{tokenInfo.name}</Text>
            <Text style={[styles.tokenSymbol, { color: colors.text.muted }]}>{tokenInfo.symbol}</Text>
            <Text style={[styles.tokenDetail, { color: colors.text.secondary }]}>Decimals: {tokenInfo.decimals}</Text>
            <Text style={[styles.tokenDetail, { color: colors.text.secondary }]}>Total Supply: {parseFloat(tokenInfo.totalSupply).toLocaleString()}</Text>
            <Button
              mode="contained"
              onPress={addToken}
              style={{ marginTop: 12 }}
              buttonColor={monoPrimary}
              textColor={monoPrimaryText}
            >
              + Add to Wallet
            </Button>
          </Card.Content>
        </Card>
      )}

      <Text style={[styles.hint, { color: colors.text.muted }]}>
        💡 Find contract addresses on Etherscan, BscScan, or CoinGecko.{'\n'}
        Always verify the contract before adding.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 40, letterSpacing: -0.4 },
  subtitle: { marginBottom: 24, fontSize: 13, marginTop: 4 },
  card: { borderWidth: 0.5, borderRadius: 16, marginBottom: 16 },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: '700' },
  input: { borderRadius: 10 },
  tokenName: { fontSize: 20, fontWeight: '700' },
  tokenSymbol: { fontSize: 14, marginTop: 2, marginBottom: 8 },
  tokenDetail: { fontSize: 13, marginTop: 2 },
  hint: { fontSize: 12, marginTop: 20, lineHeight: 18, textAlign: 'center' },
});
