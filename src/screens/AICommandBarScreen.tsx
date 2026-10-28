// src/screens/AICommandBarScreen.tsx
// Natural-language wallet AI entry. Users type "Send $50 USDC to Alex"
// and the AI parses + simulates the intent. Tapping Confirm goes to Send.

import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { IntentService, ParsedIntent } from '../services/IntentService';
import { useWalletStore } from '../store/walletStore';

interface AICommandBarScreenProps {
  navigation?: any;
}

export default function AICommandBarScreen({ navigation }: AICommandBarScreenProps) {
  const { address } = useWalletStore();
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedIntent | null>(null);
  const [sim, setSim] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const handleParse = async () => {
    if (!input.trim()) return;
    setBusy(true);
    try {
      const p = await IntentService.parse(input, true);
      setParsed(p);
      setSim(IntentService.simulate(p, address ?? '0x0'));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = () => {
    if (!parsed) return;
    if (parsed.type === 'send' && parsed.toAddress) {
      // Hand off to the Send screen via navigation params (existing SendScreen reads toAddress from its own route)
      Alert.alert('Coming soon', 'Auto-routing to the Send screen with the parsed fields will be wired in the next phase.');
      // Real handing-off: navigation?.navigate?.('Send', { toAddress: parsed.toAddress, amount: parsed.amount, tokenSymbol: parsed.tokenSymbol });
    } else if (parsed.type === 'send' && !parsed.toAddress) {
      Alert.alert('Contact not found', `We couldn't resolve "${parsed.toLabel}" in your Address Book. Try Adding it first or use a 0x… address.`);
      navigation?.navigate?.('AddressBook');
    } else {
      Alert.alert('Ready to execute', sim);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
        <Text style={styles.title}>Ask your wallet</Text>
        <Text style={styles.subtitle}>Type what you want — the AI writes the transaction.</Text>

        <Card style={styles.card}>
          <TextInput
            placeholder='Try: "Send $50 USDC to Alex"'
            placeholderTextColor={theme.colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            style={styles.input}
          />
          <Button mode='contained' onPress={handleParse} loading={busy} buttonColor={theme.colors.primary}
            textColor='#FFF' style={styles.parseBtn} labelStyle={{ fontWeight: '700' }}>
            Parse Intent
          </Button>
        </Card>

        {parsed && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>Interpreted intent</Text>
            <View style={styles.kvRow}><Text style={styles.k}>Type</Text><Text style={styles.v}>{parsed.type}</Text></View>
            {parsed.amount && <View style={styles.kvRow}><Text style={styles.k}>Amount</Text><Text style={styles.v}>{parsed.amount} {parsed.amountUnit}</Text></View>}
            {parsed.tokenSymbol && <View style={styles.kvRow}><Text style={styles.k}>Token</Text><Text style={styles.v}>{parsed.tokenSymbol}</Text></View>}
            {parsed.targetToken && <View style={styles.kvRow}><Text style={styles.k}>Target</Text><Text style={styles.v}>{parsed.targetToken}</Text></View>}
            {parsed.toLabel && <View style={styles.kvRow}><Text style={styles.k}>To</Text><Text style={styles.v}>{parsed.toLabel}</Text></View>}
            {parsed.toAddress && <View style={styles.kvRow}><Text style={styles.k}>Address</Text><Text style={styles.v}>{parsed.toAddress}</Text></View>}

            <Text style={[styles.resultLabel, { marginTop: 12 }]}>Simulation (read-only)</Text>
            <Text style={styles.simText}>{sim}</Text>

            <Button mode='contained' onPress={handleConfirm}
              buttonColor={theme.colors.primary} textColor='#FFF'
              style={styles.confirmBtn}>Confirm</Button>
          </Card>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 30, fontWeight: '800', color: theme.colors.text },
  subtitle: { color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 },
  card: { borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 12 },
  input: { minHeight: 60, backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text, fontSize: 15, padding: 8, borderRadius: theme.borderRadius.sm },
  parseBtn: { marginTop: 8, borderRadius: theme.borderRadius.full },
  resultCard: { borderRadius: theme.borderRadius.lg, padding: 14 },
  resultLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  k: { color: theme.colors.textMuted, fontSize: 14 },
  v: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  simText: { color: theme.colors.text, fontSize: 13, lineHeight: 18 },
  confirmBtn: { marginTop: 14, borderRadius: theme.borderRadius.full },
});
