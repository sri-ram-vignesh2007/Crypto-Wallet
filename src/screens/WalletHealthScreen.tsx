// src/screens/WalletHealthScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { WalletHealthService, WalletHealthResult, WalletHealthInput } from '../services/WalletHealthService';

export default function WalletHealthScreen() {
  const [result, setResult] = useState<WalletHealthResult | null>(null);
  const defaultInput: WalletHealthInput = {
    hasBackedUpSeed: true,
    hasDeviceBiometricsEnabled: true,
    walletCreatedAt: Date.now() - 30 * 86400000,  // 30d ago
    riskyApprovalsCount: 0,
    largestExposureUsd: 800,
    totalValueUsd: 1200,
  };

  useEffect(() => { run(); }, []);

  const run = async () => {
    const r = WalletHealthService.evaluate(defaultInput);
    setResult(r);
    try { await WalletHealthService.saveHistory(r); } catch {}
  };

  const color = result
    ? result.level === 'excellent' ? theme.colors.success
    : result.level === 'good' ? theme.colors.success
    : result.level === 'fair' ? theme.colors.warning
    : result.level === 'poor' ? theme.colors.danger
    : theme.colors.danger
    : theme.colors.textMuted;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Wallet Health</Text>
      <Text style={styles.subtitle}>A security score across seed backup, device, age, approvals, exposure.</Text>

      <View style={[styles.scoreCircle, { borderColor: color }]}>
        <Text style={[styles.scoreNumber, { color }]}>{result ? result.score : '–'}</Text>
        <Text style={[styles.scoreMax, { color }]}>{result ? '/ 100' : ''}</Text>
      </View>
      <Text style={[styles.level, { color }]}>{result ? result.level.toUpperCase() : 'Loading…'}</Text>

      <View style={styles.checksSection}>
        {result?.checks.map((c, i) => (
          <View key={i} style={styles.checkRow}>
            <Text style={styles.checkIcon}>{c.ok ? '✓' : '✗'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkLabel}>{c.label}</Text>
              <Text style={styles.checkDetail}>{c.detail}</Text>
            </View>
            {!c.ok && <Text style={styles.checkPenalty}>−{c.penalty}</Text>}
          </View>
        ))}
      </View>

      {result && result.recommendations.length > 0 && (
        <Card style={styles.recCard}>
          <Text style={styles.recTitle}>Recommendations</Text>
          {result.recommendations.map((r, i) => (
            <Text key={i} style={styles.recItem}>• {r}</Text>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: 24 },
  scoreCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  scoreNumber: { fontSize: 48, fontWeight: '800' },
  scoreMax: { fontSize: 14, color: theme.colors.textMuted, marginTop: -8 },
  level: { textAlign: 'center', fontWeight: '700', letterSpacing: 1, fontSize: 14, marginBottom: 24 },
  checksSection: { marginBottom: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  checkIcon: { fontSize: 18, color: theme.colors.success, marginRight: 12, width: 24 },
  checkLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  checkDetail: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  checkPenalty: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
  recCard: { borderRadius: theme.borderRadius.md, padding: 14, marginBottom: 16 },
  recTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: theme.colors.textMuted, marginBottom: 8 },
  recItem: { fontSize: 14, color: theme.colors.text, lineHeight: 20, marginVertical: 4 },
});
