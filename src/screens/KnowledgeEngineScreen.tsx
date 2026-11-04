// src/screens/KnowledgeEngineScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { KnowledgeEngineService, KnowledgeContext, KnowledgeAnswer } from '../services/KnowledgeEngineService';

const mockContext: KnowledgeContext = {
  walletAddress: '0xAbC123…4567',
  selectedChain: 'sepolia',
  recentTransactions: [
    { to: '0x1234…abcd', value: '5000000000000000', timestamp: Date.now() / 1000 - 3600 },
    { to: '0x5678…efgh', value: '200000000000000000', timestamp: Date.now() / 1000 - 7200 },
  ],
  balancesSnapshot: [
    { symbol: 'ETH', balance: '0.45', valueUsd: 1575 },
    { symbol: 'USDC', balance: '1200', valueUsd: 1200 },
  ],
};

export default function KnowledgeEngineScreen() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<KnowledgeAnswer | null>(null);
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setBusy(true);
    const a = await KnowledgeEngineService.ask(question, mockContext);
    setAnswer(a);
    setBusy(false);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Ask your wallet</Text>
      <Text style={styles.subtitle}>Why did my balance drop? Where are staking rewards? Can I unstake?</Text>

      <Card style={styles.card}>
        <TextInput placeholder='Try: "Why did my balance decrease?"' value={question} onChangeText={setQuestion}
          mode='outlined' multiline style={styles.input}
          outlineColor={theme.colors.border} activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text} placeholderTextColor={theme.colors.textMuted} />
        <Button mode='contained' onPress={ask} loading={busy}
          buttonColor={theme.colors.primary} textColor='#FFF' style={styles.btn}>Ask</Button>
      </Card>

      {answer && (
        <Card style={styles.resultCard}>
          <Text style={styles.answerText}>{answer.answer}</Text>
          <Text style={styles.evidenceLabel}>Based on</Text>
          {answer.evidenceChunks.map((e, i) => (
            <Text key={i} style={styles.evidenceItem}>• {e}</Text>
          ))}
        </Card>
      )}

      <View style={styles.suggestions}>
        <Text style={styles.suggestionTitle}>Suggested questions</Text>
        {[
          'Why did my balance decrease?',
          'Where are my staking rewards?',
          'Can I unstake today?',
          'What was my largest recent transaction?',
          'How much ETH do I have?',
        ].map((q, i) => (
          <TouchableOpacity key={i} onPress={() => { setQuestion(q); ask(); }} style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 },
  card: { borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 16 },
  input: { minHeight: 50, backgroundColor: theme.colors.surfaceMuted },
  btn: { borderRadius: theme.borderRadius.full },
  resultCard: { borderRadius: theme.borderRadius.lg, padding: 14, marginBottom: 16 },
  answerText: { fontSize: 15, color: theme.colors.text, lineHeight: 22, marginBottom: 12 },
  evidenceLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 4 },
  evidenceItem: { fontSize: 12, color: theme.colors.textMuted, lineHeight: 18, marginVertical: 2 },
  suggestions: { marginTop: 16 },
  suggestionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 8 },
  suggestionChip: { backgroundColor: theme.colors.surfaceMuted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.borderRadius.full, marginRight: 8 },
  suggestionText: { fontSize: 13, color: theme.colors.text },
});