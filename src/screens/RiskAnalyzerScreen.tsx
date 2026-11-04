// src/screens/RiskAnalyzerScreen.tsx
// Run a risk analysis on a target address / transaction before signing.

import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { RiskAnalyzerService, RiskAnalysis, TxProfile } from '../services/RiskAnalyzerService';

export default function RiskAnalyzerScreen() {
  const [targetAddress, setTargetAddress] = useState('0x...');
  const [amountUsd, setAmountUsd] = useState('100');
  const [result, setResult] = useState<RiskAnalysis | null>(null);
  const [busy, setBusy] = useState(false);

  const analyze = async () => {
    if (!targetAddress.trim() || !targetAddress.startsWith('0x')) return;
    setBusy(true);
    const profile: TxProfile = {
      toAddress: targetAddress.trim(),
      amountUsd: parseFloat(amountUsd) || 0,
      isApproval: false,
      isContractInteraction: true,
      isNewContract: targetAddress.length < 42,
      hasBadReputation: /scam|honeypot/.test(targetAddress.toLowerCase()),
    };
    const r = await RiskAnalyzerService.analyze(profile, true);
    setResult(r);
    setBusy(false);
  };

  const scan = async () => {
    if (!targetAddress.trim() || !targetAddress.startsWith('0x')) return;
    setBusy(true);
    const r = await RiskAnalyzerService.scanAddress(targetAddress.trim());
    setResult(r);
    setBusy(false);
  };

  const levelColor = result
    ? result.level === 'safe' ? theme.colors.success
    : result.level === 'caution' ? theme.colors.warning
    : result.level === 'high' ? theme.colors.danger
    : theme.colors.danger
    : theme.colors.textMuted;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Risk Analyzer</Text>
      <Text style={styles.subtitle}>Analyze a transaction or scan an address before signing.</Text>

      <Card style={styles.card}>
        <TextInput label='Target address' value={targetAddress} onChangeText={setTargetAddress}
          mode='outlined' autoCapitalize='none'
          outlineColor={theme.colors.border} activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text} style={styles.input} />
        <TextInput label='Amount in USD' value={amountUsd} onChangeText={setAmountUsd}
          mode='outlined' keyboardType='decimal-pad'
          outlineColor={theme.colors.border} activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text} style={styles.input} />
        <Button mode='contained' onPress={analyze} loading={busy}
          buttonColor={theme.colors.primary} textColor='#FFF' style={styles.btn}>Analyze Tx</Button>
        <Button mode='outlined' onPress={scan} loading={busy}
          textColor={theme.colors.primary} style={[styles.btn, { marginTop: 8 }]}>Scan Address</Button>
      </Card>

      {result && (
        <Card style={styles.resultCard}>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreText, { color: levelColor }]}>{result.score}</Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
          <Text style={[styles.level, { color: levelColor }]}>{result.level.toUpperCase()}</Text>
          <Text style={styles.summary}>{result.summary}</Text>

          {result.reasons.map((r, i) => (
            <Text key={i} style={[styles.reason, { color: r.level === 'danger' ? theme.colors.danger : r.level === 'warn' ? theme.colors.warning : theme.colors.textMuted }]}>
              {r.level === 'danger' ? '✗ ' : r.level === 'warn' ? '! ' : '• '}{r.message}
            </Text>
          ))}

          {result.canSpendAllTokens && (
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>⚠ This contract can spend ALL your tokens. Approving means the contract could drain your wallet.</Text>
            </View>
          )}

          {result.aiExplanation && (
            <View style={styles.aiBox}>
              <Text style={styles.aiLabel}>AI Explanation</Text>
              <Text style={styles.aiText}>{result.aiExplanation}</Text>
            </View>
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
  scoreRow: { flexDirection: 'row', alignItems: 'baseline' },
  scoreText: { fontSize: 52, fontWeight: '800' },
  scoreMax: { fontSize: 16, color: theme.colors.textMuted, marginLeft: 4 },
  level: { fontSize: 14, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  summary: { fontSize: 15, color: theme.colors.text, lineHeight: 22, marginBottom: 12 },
  reason: { fontSize: 13, lineHeight: 18, marginVertical: 4, paddingHorizontal: 8 },
  warnBox: { backgroundColor: '#FFE5E5', padding: 12, borderRadius: 8, marginTop: 10 },
  warnText: { color: theme.colors.danger, fontSize: 13, fontWeight: '600' },
  aiBox: { backgroundColor: theme.colors.primaryMuted, padding: 12, borderRadius: 8, marginTop: 12 },
  aiLabel: { fontSize: 11, color: theme.colors.primary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  aiText: { fontSize: 13, color: theme.colors.text, lineHeight: 18 },
});
