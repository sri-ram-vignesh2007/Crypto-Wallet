// src/screens/BuyScreen.tsx
// Institutional-grade crypto purchasing via MoonPay/Transak (Strict Monochrome)

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useWalletStore } from '../store/walletStore';
import { useColors, useIsDark } from '../theme/ThemeContext';

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
  const colors = useColors();
  const isDark = useIsDark();
  const [selectedChain, setSelectedChain] = useState(BUY_CHAINS[0]);
  const [showWebView, setShowWebView] = useState(false);
  const [provider, setProvider] = useState<'moonpay' | 'transak'>('moonpay');

  const getMoonPayUrl = () => {
    return `https://buy.moonpay.com/?apiKey=${MOONPAY_KEY}&walletAddress=${address}&currencyCode=${selectedChain.provider}&colorCode=%23000000`;
  };

  const getTransakUrl = () => {
    return `https://global.transak.com/?apiKey=${TRANSAK_KEY}&walletAddress=${address}&cryptoCurrencyCode=${selectedChain.provider}&defaultPaymentMethod=credit_debit_card`;
  };

  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoPrimaryText = isDark ? '#000000' : '#FFFFFF';

  if (showWebView) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
        <View style={[styles.webviewHeader, { backgroundColor: colors.bg.canvas, borderBottomColor: colors.border.subtle }]}>
          <Text style={[styles.webviewTitle, { color: colors.text.primary }]}>Buy {selectedChain.symbol}</Text>
          <TouchableOpacity onPress={() => setShowWebView(false)}>
            <Text style={[styles.closeBtn, { color: colors.text.primary }]}>✕</Text>
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
    <ScrollView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Text style={[styles.title, { color: colors.text.primary }]}>Buy Crypto</Text>
      <Text style={[styles.subtitle, { color: colors.text.muted }]}>Purchase with credit card, Apple Pay, or bank transfer</Text>

      <Card style={[styles.addressCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT }]}>
        <Card.Content>
          <Text style={[styles.label, { color: colors.text.muted }]}>Receiving Address</Text>
          <Text style={[styles.address, { color: colors.text.primary }]}>{address || 'Connect wallet first'}</Text>
        </Card.Content>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Select Chain</Text>
      <View style={styles.chainGrid}>
        {BUY_CHAINS.map((chain) => {
          const active = selectedChain.key === chain.key;
          return (
            <TouchableOpacity
              key={chain.key}
              style={[
                styles.chainBtn,
                {
                  backgroundColor: active ? monoPrimary : colors.bg.surface,
                  borderColor: active ? monoPrimary : colors.border.DEFAULT,
                },
              ]}
              onPress={() => setSelectedChain(chain)}
            >
              <Text style={[
                styles.chainBtnText,
                { color: active ? monoPrimaryText : colors.text.primary },
              ]}>
                {chain.symbol}
              </Text>
              <Text style={[
                styles.chainBtnSub,
                { color: active ? monoPrimaryText : colors.text.muted },
              ]}>
                {chain.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Select Provider</Text>

      <Card style={[styles.providerCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT }]}>
        <Card.Content>
          <View style={styles.providerRow}>
            <Text style={{ fontSize: 26 }}>🌙</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.providerName, { color: colors.text.primary }]}>MoonPay</Text>
              <Text style={[styles.providerFee, { color: colors.text.muted }]}>Fee: 1.5% - 4.5% | 160+ countries</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => { setProvider('moonpay'); setShowWebView(true); }}
              buttonColor={monoPrimary}
              textColor={monoPrimaryText}
            >
              Buy
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.providerCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT }]}>
        <Card.Content>
          <View style={styles.providerRow}>
            <Text style={{ fontSize: 26 }}>💳</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.providerName, { color: colors.text.primary }]}>Transak</Text>
              <Text style={[styles.providerFee, { color: colors.text.muted }]}>Fee: 1.0% - 3.5% | 100+ countries</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => { setProvider('transak'); setShowWebView(true); }}
              buttonColor={monoPrimary}
              textColor={monoPrimaryText}
            >
              Buy
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Text style={[styles.hint, { color: colors.text.muted }]}>
        💡 To enable real purchases, sign up at moonpay.com or transak.com and replace the API keys in BuyScreen.tsx.{'\n\n'}
        Your wallet address is pre-filled. Funds arrive directly to your non-custodial wallet.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 40, letterSpacing: -0.4 },
  subtitle: { marginBottom: 24, marginTop: 4, fontSize: 13 },
  addressCard: { borderWidth: 0.5, borderRadius: 16, marginBottom: 24 },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  address: { fontSize: 13, marginTop: 6, fontVariant: ['tabular-nums'] },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8, fontWeight: '700' },
  chainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chainBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 0.5, minWidth: 80, alignItems: 'center' },
  chainBtnText: { fontWeight: '700', fontSize: 14 },
  chainBtnSub: { fontSize: 10, marginTop: 2 },
  providerCard: { borderWidth: 0.5, marginBottom: 10, borderRadius: 14 },
  providerRow: { flexDirection: 'row', alignItems: 'center' },
  providerName: { fontSize: 16, fontWeight: '700' },
  providerFee: { fontSize: 12, marginTop: 2 },
  hint: { fontSize: 12, marginTop: 20, lineHeight: 18, textAlign: 'center' },
  webviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 0.5 },
  webviewTitle: { fontSize: 16, fontWeight: '700' },
  closeBtn: { fontSize: 20, fontWeight: '700' },
});
