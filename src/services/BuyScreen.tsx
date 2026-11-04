// src/screens/BuyScreen.tsx
// REAL crypto buying via MoonPay/Transak WebView
// Supports multi-chain: ETH, BNB, MATIC, AVAX, etc.

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useWalletStore } from '../store/walletStore';
import { CHAINS } from '../core/ChainConfig';
import { theme } from '../theme/Theme';

const MOONPAY_KEY = 'pk_live_YOUR_MOONPAY_KEY'; // Get from moonpay.com
const TRANSAK_KEY = 'YOUR_TRANSAK_API_KEY';      // Get from transak.com

const BUY_CHAINS = [
  { key: 'ethereum', symbol: 'ETH', name: 'Ethereum', provider: 'ETH' },
  { key: 'bsc', symbol: 'BNB', name: 'BNB Smart Chain', provider: 'BNB' },
  { key: 'polygon', symbol: 'MATIC', name: 'Polygon', provider: 'MATIC' },
  { key: 'base', symbol: 'ETH', name: 'Base', provider: 'ETH' },
  { key: 'avalanche', symbol: 'AVAX', name: 'Avalanche', provider: 'AVAX' },
];

export default function BuyScreen() {
  const { address } = useWalletStore();
  const [selectedChain, setSelectedChain] = useState(BUY_CHAINS[0]);
  const [showWebView, setShowWebView] = useState(false);
  const [provider, setProvider] = useState<'moonpay' | 'transak'>('moonpay');

  const getMoonPayUrl = () => {
    return `https://buy.moonpay.com/?apiKey=${MOONPAY_KEY}&walletAddress=${address}&currencyCode=${selectedChain.provider}&colorCode=%230052FF`;
  };

  const getTransakUrl = () => {
    return `https://global.transak.com/?apiKey=${TRANSAK_KEY}&walletAddress=${address}&cryptoCurrencyCode=${selectedChain.provider}&defaultPaymentMethod=credit_debit_card`;
  };

  if (showWebView) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.webviewHeader}>
          <Text style={styles.webviewTitle}>Buy {selectedChain.symbol}</Text>
          <TouchableOpacity onPress={() => setShowWebView(false)}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: provider === 'moonpay' ? getMoonPayUrl() : getTransakUrl() }}
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Buy Crypto</Text>
      <Text style={styles.subtitle}>Purchase with credit card, Apple Pay, or bank transfer</Text>

      <Card style={styles.addressCard}>
        <Card.Content>
          <Text style={styles.label}>Receiving Address</Text>
          <Text style={styles.address}>{address || 'Connect wallet first'}</Text>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Select Chain</Text>
      <View style={styles.chainGrid}>
        {BUY_CHAINS.map((chain) => (
          <TouchableOpacity
            key={chain.key}
            style={[
              styles.chainBtn,
              selectedChain.key === chain.key ? styles.chainBtnActive : null,
            ]}
            onPress={() => setSelectedChain(chain)}
          >
            <Text style={[
              styles.chainBtnText,
              selectedChain.key === chain.key ? styles.chainBtnTextActive : null,
            ]}>
              {chain.symbol}
            </Text>
            <Text style={styles.chainBtnSub}>{chain.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Select Provider</Text>

      <Card style={styles.providerCard}>
        <Card.Content>
          <View style={styles.providerRow}>
            <Text style={{ fontSize: 28 }}>🌙</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.providerName}>MoonPay</Text>
              <Text style={styles.providerFee}>Fee: 1.5% - 4.5% | 160+ countries</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => { setProvider('moonpay'); setShowWebView(true); }}
              buttonColor="#7B3FE4"
              textColor="#FFF"
            >
              Buy
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.providerCard}>
        <Card.Content>
          <View style={styles.providerRow}>
            <Text style={{ fontSize: 28 }}>💳</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.providerName}>Transak</Text>
              <Text style={styles.providerFee}>Fee: 1.0% - 3.5% | 100+ countries</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => { setProvider('transak'); setShowWebView(true); }}
              buttonColor="#0066FF"
              textColor="#FFF"
            >
              Buy
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Text style={styles.hint}>
        💡 To enable real purchases, sign up at moonpay.com or transak.com and replace the API keys in BuyScreen.tsx.{'\n\n'}
        Your wallet address is pre-filled. Funds arrive directly to your non-custodial wallet.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginTop: 40 },
  subtitle: { color: theme.colors.textMuted, marginBottom: 24, marginTop: 4 },
  addressCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 14, marginBottom: 24 },
  label: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  address: { color: theme.colors.text, fontSize: 13, fontFamily: 'monospace', marginTop: 6 },
  sectionTitle: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  chainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chainBtn: { backgroundColor: theme.colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.border, minWidth: 80, alignItems: 'center' },
  chainBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chainBtnText: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
  chainBtnTextActive: { color: '#FFF' },
  chainBtnSub: { color: theme.colors.textMuted, fontSize: 10, marginTop: 2 },
  providerCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 10, borderRadius: 12 },
  providerRow: { flexDirection: 'row', alignItems: 'center' },
  providerName: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  providerFee: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  hint: { color: theme.colors.textMuted, fontSize: 12, marginTop: 20, lineHeight: 18, textAlign: 'center' },
  webviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  webviewTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  closeBtn: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
});