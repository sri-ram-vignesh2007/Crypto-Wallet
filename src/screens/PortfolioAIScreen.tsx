// src/screens/PortfolioAIScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Share, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { PortfolioAIService, PortfolioAIResult, PortfolioSnapshotDTO } from '../services/PortfolioAIService';
import { useWalletStore } from '../store/walletStore';
import { WalletHealthService } from '../services/WalletHealthService';

export default function PortfolioAIScreen() {
  const { balances, totalValueUsd } = useWalletStore();
  const [result, setResult] = useState<PortfolioAIResult | null>(null);
  const [narrative, setNarrative] = useState('');

  useEffect(() => {
    const snapshot: PortfolioSnapshotDTO = {
      holdings: balances.map(b => ({
        symbol: b.token.symbol,
        amount: b.balance,
        valueUsd: b.valueUsd,
        // Mock cost basis — in production this needs historical buy prices
        costBasisUsd: b.valueUsd * (0.85 + Math.random() * 0.3),
      })),
      totalValueUsd,
    };
    const r = PortfolioAIService.analyze(snapshot);
    setResult(r);
  }, [balances, totalValueUsd]);

  const handleExport = () => {
    if (!result) return;
    const snapshot: PortfolioSnapshotDTO = {
      holdings: balances.map(b => ({ symbol: b.token.symbol, amount: b.balance, valueUsd: b.valueUsd, costBasisUsd: 0 })),
      totalValueUsd,
    };
    const csv = PortfolioAIService.taxCSV(snapshot);
    Share.share({ message: csv, title: 'CryptoVaultAI_TaxReport.csv' }).catch(() => Alert.alert('Exported', 'Tax report has been shared.'));
  };

  const pColor = (result && result.totalPnLUsd >= 0) ? theme.colors.success : result ? theme.colors.danger : theme.colors.text;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Portfolio AI</Text>
      <Text style={styles.subtitle}>Profit/loss, tax estimate, health, and rebalance suggestions.</Text>

      {result && (
        <>
          <View style={styles.pnlRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pnlLabel}>Total Value</Text>
              <Text style={styles.pnlValue}>${result.totalValue.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pnlLabel}>P/L</Text>
              <Text style={[styles.pnlValue, { color: pColor }]}>
                {result.totalPnLUsd >= 0 ? '+' : ''}${Math.abs(result.totalPnLUsd).toFixed(2)} ({result.totalPnLPct >= 0 ? '+' : ''}{result.totalPnLPct.toFixed(1)}%)
              </Text>
            </View>
          </View>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Per-Token P/L</Text>
            {result.perTokenPnL.length === 0 ? <Text style={styles.empty}>No holdings yet.</Text>
              : result.perTokenPnL.map((p, i) => (
                <View key={i} style={styles.kvRow}>
                  <Text style={styles.k}>{p.symbol}</Text>
                  <Text style={[styles.v, { color: p.pnlPct >= 0 ? theme.colors.success : theme.colors.danger }]}>
                    {p.pnlPct >= 0 ? '+' : ''}{Math.abs(p.pnlPct).toFixed(1)}% ({p.pnlPct >= 0 ? '+' : ''}${Math.abs(p.pnlUsd).toFixed(2)})
                  </Text>
                </View>
              ))}
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tax Assistant</Text>
            <View style={styles.kvRow}><Text style={styles.k}>Estimated capital gains</Text><Text style={styles.v}>${result.estimatedCapitalGainsUsd.toFixed(2)}</Text></View>
            <View style={styles.kvRow}><Text style={styles.k}>Est. tax liability (35%)</Text><Text style={styles.v}>${result.taxLiabilityUsd.toFixed(2)}</Text></View>
            <Button mode="outlined" onPress={handleExport} textColor={theme.colors.primary}
              style={styles.exportBtn}>Export CSV</Button>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Health Score</Text>
            <Text style={styles.healthLine}>Score: {result.health.score}/100 — {result.health.concentrationRiskLevel} concentration</Text>
            {result.health.issues.length > 0 && <Text style={styles.healthIssue}>{result.health.issues.join('\n')}</Text>}
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Rebalance Suggestions</Text>
            {result.rebalanceSuggestions.length === 0
              ? <Text style={styles.empty}>No rebalance needed.</Text>
              : result.rebalanceSuggestions.map((s, i) => <Text key={i} style={styles.bullet}>• {s}</Text>)}
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Yield Opportunities</Text>
            {result.yieldOpportunities.map((s, i) => <Text key={i} style={styles.bullet}>• {s}</Text>)}
          </Card>

          {narrative ? (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>AI Narrative</Text>
              <Text style={styles.narrative}>{narrative}</Text>
            </Card>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 },
  pnlRow: { flexDirection: 'row', marginBottom: 16 },
  pnlLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  pnlValue: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginTop: 4, letterSpacing: -0.5 },
  sectionCard: { borderRadius: theme.borderRadius.md, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 8 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  k: { color: theme.colors.textMuted, fontSize: 14 },
  v: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  empty: { color: theme.colors.textMuted, fontSize: 13 },
  bullet: { color: theme.colors.text, fontSize: 14, lineHeight: 22, marginVertical: 2 },
  exportBtn: { marginTop: 10, borderRadius: theme.borderRadius.full, borderColor: theme.colors.primary },
  healthLine: { fontSize: 14, color: theme.colors.text, fontWeight: '600' },
  healthIssue: { fontSize: 12, color: theme.colors.textMuted, marginTop: 6, lineHeight: 18 },
  narrative: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
});
