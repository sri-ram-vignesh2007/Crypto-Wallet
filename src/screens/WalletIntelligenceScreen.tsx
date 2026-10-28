// src/screens/WalletIntelligenceScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, Alert } from 'react-native';
import { TextInput as PaperTextInput, Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { WalletIntelligenceService, WalletIntelligenceResult } from '../services/WalletIntelligenceService';

export default function WalletIntelligenceScreen() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<WalletIntelligenceResult | null>(null);
  const [busy, setBusy] = useState(false);

  const analyze = async () => {
    if (!address.trim() || !address.startsWith('0x')) return;
    setBusy(true);
    try {
      const r = await WalletIntelligenceService.analyze(address.trim());
      setResult(r);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to analyze');
    }
    setBusy(false);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Wallet Intelligence</Text>
      <Text style={styles.subtitle}>Analyze any address — profit, win rate, holdings, style.</Text>

      <Card style={styles.card}>
        <PaperTextInput label='Target address' value={address} onChangeText={setAddress}
          mode='outlined' autoCapitalize='none'
          outlineColor={theme.colors.border} activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text} style={styles.input} />
        <Button mode='contained' onPress={analyze} loading={busy}
          buttonColor={theme.colors.primary} textColor='#FFF' style={styles.btn}>Analyze</Button>
      </Card>

      {result && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultLabel}>Overview</Text>
          <View style={styles.kvRow}><Text style={styles.k}>First seen</Text><Text style={styles.v}>{result.firstSeenOn ? new Date(result.firstSeenOn * 1000).toLocaleDateString() : '—'}</Text></View>
          <View style={styles.kvRow}><Text style={styles.k}>Tx count (approx)</Text><Text style={styles.v}>{result.numTx}</Text></View>
          <View style={styles.kvRow}><Text style={styles.k}>Distinct tokens</Text><Text style={styles.v}>{result.distinctTokensSeen}</Text></View>
          <View style={styles.kvRow}><Text style={styles.k}>Est. profit</Text><Text style={styles.v}>${result.estimatedProfitUsd.toFixed(2)}</Text></View>
          <View style={styles.kvRow}><Text style={styles.k}>Est. win rate</Text><Text style={styles.v}>{result.estimatedWinRatePct}%</Text></View>
          <View style={styles.kvRow}><Text style={styles.k}>Trading style</Text><Text style={styles.v}>{result.tradingStyle.toUpperCase()}</Text></View>

          {result.topTransfersUsd.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Top Holdings</Text>
              {result.topTransfersUsd.map((t, i) => (
                <Text key={i} style={styles.bullet}>• {t.token}: $${t.valueUsd.toLocaleString()}</Text>
              ))}
            </>
          )}

          {result.defiPositionHints.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>DeFi Hints</Text>
              {result.defiPositionHints.map((h, i) => (
                <Text key={i} style={styles.bullet}>• {h}</Text>
              ))}
            </>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 },
  card: { borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: theme.colors.surfaceMuted },
  btn: { borderRadius: theme.borderRadius.full },
  resultCard: { borderRadius: theme.borderRadius.lg, padding: 14, marginBottom: 16 },
  resultLabel: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 8 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  k: { color: theme.colors.textMuted, fontSize: 14 },
  v: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  bullet: { color: theme.colors.text, fontSize: 14, marginVertical: 2, lineHeight: 20 },
});