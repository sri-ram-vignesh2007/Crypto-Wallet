// src/screens/BuyScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useWalletStore } from '../store/walletStore';
import { theme } from '../theme/Theme';

export default function BuyScreen() {
  const { address } = useWalletStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buy Crypto</Text>
      <Text style={styles.subtitle}>Purchase with card or bank transfer</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Your Wallet Address</Text>
          <Text style={styles.address}>{address || 'Not connected'}</Text>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Choose Provider</Text>

      <Button
        mode="contained"
        onPress={() => {
          // In production: open WebView to MoonPay with your API key
          // Linking.openURL(`https://buy.moonpay.com/?apiKey=YOUR_KEY&walletAddress=${address}`);
          alert('In production: Opens MoonPay widget. Sign up at moonpay.com to get API key.');
        }}
        style={styles.providerBtn}
        buttonColor="#7B3FE4"
        textColor="#FFF"
      >
        🌙 MoonPay
      </Button>

      <Button
        mode="contained"
        onPress={() => alert('Sign up at transak.com for API key')}
        style={styles.providerBtn}
        buttonColor="#0066FF"
        textColor="#FFF"
      >
        💳 Transak
      </Button>

      <Button
        mode="contained"
        onPress={() => alert('Sign up at ramp.network for API key')}
        style={styles.providerBtn}
        buttonColor="#0A4DC2"
        textColor="#FFF"
      >
        🚀 Ramp
      </Button>

      <Text style={styles.hint}>
        To enable real purchases:{'\n'}
        1. Sign up at one of the providers above{'\n'}
        2. Get a free API key{'\n'}
        3. Replace the alert() with Linking.openURL()
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginTop: 40 },
  subtitle: { color: theme.colors.textMuted, marginBottom: 24 },
  card: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 14, marginBottom: 24 },
  label: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  address: { color: theme.colors.text, fontSize: 13, fontFamily: 'monospace', marginTop: 6 },
  sectionTitle: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  providerBtn: { marginBottom: 10, borderRadius: 14, paddingVertical: 4 },
  hint: { color: theme.colors.textMuted, fontSize: 12, marginTop: 20, lineHeight: 18, textAlign: 'center' },
});