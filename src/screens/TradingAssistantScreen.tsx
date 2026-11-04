// src/screens/TradingAssistantScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { TradingAssistantService, TradingAssistantSignals } from '../services/TradingAssistantService';
import { useWalletStore } from '../store/walletStore';

export default function TradingAssistantScreen() {
  const { address } = useWalletStore();
  const [signals, setSignals] = useState<TradingAssistantSignals | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const s = await TradingAssistantService.collect({
      recentInTransfersUsd: [500, 14000, 300],
      recentOutTransfersUsd: [200, 12000, 50],
      tokensHeld: ['ETH', 'USDC', 'LINK', 'ARB'],
      useAI: true,
    });
    setSignals(s);
  };

  if (!signals) return <View style={styles.root}><Text style={styles.title}>Trading Assistant</Text><Text style={styles.subtitle}>Loading signals…</Text></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Trading Assistant</Text>
      <Text style={styles.subtitle}>Whale activity, unlocks, sentiment, large transfers.</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Market Sentiment</Text>
        <Text style={styles.sentimentValue}>{signals.marketSentiment.toUpperCase()}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Large Transfers</Text>
        {signals.largeTransfers.length === 0 ? <Text style={styles.empty}>None recently.</Text>
          : signals.largeTransfers.map((t, i) => (
            <Text key={i} style={styles.bullet}>• {t.direction === 'in' ? 'Incoming' : 'Outgoing'} ${t.valueUsd.toLocaleString()} {t.token}</Text>
          ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Upcoming Token Unlocks</Text>
        {signals.upcomingUnlocks.length === 0 ? <Text style={styles.empty}>None scheduled.</Text>
          : signals.upcomingUnlocks.map((u, i) => (
            <Text key={i} style={styles.bullet}>• {u.token} — {u.amountPct}% unlocking on {u.date}</Text>
          ))}
      </Card>

      {signals.whaleActivity.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Whale Activity</Text>
          {signals.whaleActivity.map((w, i) => (
            <Text key={i} style={[styles.bullet, { color: w.severity === 'danger' ? theme.colors.danger : theme.colors.text }]}>• {w.description}</Text>
          ))}
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{signals.summary}</Text>
        {signals.aiInsight ? <Text style={styles.aiLine}>AI: {signals.aiInsight}</Text> : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 },
  card: { borderRadius: theme.borderRadius.md, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 8 },
  empty: { color: theme.colors.textMuted, fontSize: 13 },
  bullet: { color: theme.colors.text, fontSize: 14, marginVertical: 3, lineHeight: 20 },
  sentimentValue: { fontSize: 24, fontWeight: '800', color: theme.colors.text, letterSpacing: 1 },
  summary: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  aiLine: { color: theme.colors.primary, fontSize: 13, marginTop: 8, fontStyle: 'italic' },
});