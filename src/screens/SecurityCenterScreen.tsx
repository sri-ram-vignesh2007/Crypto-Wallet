// src/screens/SecurityCenterScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { TextInput as PaperTextInput, Button, Switch } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { SecurityService, SpendingLimits, EmergencyLockService, GuardianService, Guardian, AgentService, AgentRule, SocialRecoveryService, SocialClaim } from '../services/SecurityService';

export default function SecurityCenterScreen() {
  const [limits, setLimits] = useState<SpendingLimits | null>(null);
  const [emergency, setEmergency] = useState<{ locked: boolean } | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [rules, setRules] = useState<AgentRule[]>([]);
  const [claims, setClaims] = useState<SocialClaim[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [l, e, g, r, c] = await Promise.all([
      SecurityService.getLimits(),
      EmergencyLockService.getState(),
      GuardianService.list(),
      AgentService.listRules(),
      SocialRecoveryService.listClaims(),
    ]);
    setLimits(l); setEmergency(e); setGuardians(g); setRules(r); setClaims(c);
  };

  const updateLimits = async (patch: Partial<SpendingLimits>) => {
    await SecurityService.setLimits(patch);
    await loadAll();
  };

  const handleEmergencyLock = async () => {
    await EmergencyLockService.lock('User initiated');
    await loadAll();
  };
  const handleEmergencyUnlock = async () => {
    await EmergencyLockService.unlock();
    await loadAll();
  };

  const addGuardian = () => {
    Alert.prompt('Add Guardian', 'Enter name and address', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add', onPress: async (name: string | undefined) => {
        if (!name) return;
        Alert.prompt('Address', 'Guardian wallet address', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: async (address: string | undefined) => {
            if (!address) return;
            await GuardianService.add({ name, address, role: 'friend' });
            await loadAll();
          }},
        ]);
      }},
    ]);
  };

  const removeGuardian = async (id: string) => {
    await GuardianService.remove(id);
    await loadAll();
  };

  const addRule = () => {
    Alert.prompt('Add Agent Rule', 'Description (e.g. "DCA $50 BTC weekly")', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Next', onPress: async (description: string | undefined) => {
        if (!description) return;
        Alert.prompt('Amount (USD)', 'How much per interval?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Next', onPress: async (amt: string | undefined) => {
            if (!amt) return;
            Alert.prompt('Frequency (days)', 'Every how many days?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Add', onPress: async (days: string | undefined) => {
                if (!days) return;
                await AgentService.addRule({
                  description,
                  amountUsd: parseFloat(amt) || 0,
                  frequencyDays: parseInt(days) || 7,
                  intervalAsset: 'BTC',
                });
                await loadAll();
              }},
            ]);
          }},
        ]);
      }},
    ]);
  };

  const togglePause = async (id: string) => {
    await AgentService.togglePause(id);
    await loadAll();
  };
  const removeRule = async (id: string) => {
    await AgentService.removeRule(id);
    await loadAll();
  };

  const createClaim = () => {
    Alert.prompt('Send via Social Recovery', 'Recipient email/phone/username', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Next', onPress: async (recipient: string | undefined) => {
        if (!recipient) return;
        Alert.prompt('Amount (USD)', '', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create', onPress: async (amt: string | undefined) => {
            if (!amt) return;
            await SocialRecoveryService.createClaim({
              senderAddress: '0xMe',
              recipientHandle: recipient,
              amountUsd: parseFloat(amt) || 0,
              tokenSymbol: 'USDC',
            });
            await loadAll();
          }},
        ]);
      }},
    ]);
  };

  const claimIt = async (id: string) => {
    await SocialRecoveryService.claim(id, '0xMyWallet');
    await loadAll();
  };

  if (!limits || !emergency) return <View style={styles.root}><Text style={styles.title}>Security Center</Text><Text style={styles.subtitle}>Loading…</Text></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Security Center</Text>
      <Text style={styles.subtitle}>Spending limits, emergency lock, guardians, agent rules, social recovery.</Text>

      {/* Spending Limits */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Spending Limits</Text>
        <View style={styles.kvRow}><Text style={styles.k}>Daily limit</Text>
          <PaperTextInput value={`${limits.dailyLimitUsd}`} onChangeText={t => updateLimits({ dailyLimitUsd: parseFloat(t) || 0 })}
            style={styles.miniInput} keyboardType='decimal-pad' textColor={theme.colors.text} />
        </View>
        <View style={styles.kvRow}><Text style={styles.k}>Large tx threshold</Text>
          <PaperTextInput value={`${limits.largeTransferThresholdUsd}`} onChangeText={t => updateLimits({ largeTransferThresholdUsd: parseFloat(t) || 0 })}
            style={styles.miniInput} keyboardType='decimal-pad' textColor={theme.colors.text} />
        </View>
        <View style={styles.kvRow}><Text style={styles.k}>Spent today</Text><Text style={styles.v}>${limits.spentTodayUsd.toFixed(2)}</Text></View>
      </Card>

      {/* Emergency Lock */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Emergency Lock</Text>
        <View style={styles.kvRow}>
          <Text style={styles.k}>Status</Text>
          <Text style={[styles.v, { color: emergency.locked ? theme.colors.danger : theme.colors.success }]}>
            {emergency.locked ? 'LOCKED' : 'ACTIVE'}
          </Text>
        </View>
        {emergency.locked
          ? <Button mode='contained' onPress={handleEmergencyUnlock} buttonColor={theme.colors.success} textColor='#FFF' style={styles.btn}>Unlock</Button>
          : <Button mode='contained' onPress={handleEmergencyLock} buttonColor={theme.colors.danger} textColor='#FFF' style={styles.btn}>Lock Wallet</Button>}
      </Card>

      {/* Guardians */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Guardian Recovery</Text>
        {guardians.length === 0 ? <Text style={styles.empty}>No guardians. Add trusted contacts for wallet recovery.</Text>
          : guardians.map(g => (
            <View key={g.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{g.name} ({g.role})</Text>
                <Text style={styles.rowAddr}>{g.address}</Text>
              </View>
              <Button mode='outlined' onPress={() => removeGuardian(g.id)} textColor={theme.colors.danger} style={styles.smallBtn}>Remove</Button>
            </View>
          ))}
        <Button mode='contained' onPress={addGuardian} buttonColor={theme.colors.primary} textColor='#FFF' style={styles.btn}>Add Guardian</Button>
      </Card>

      {/* Agent Rules */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Agent Rules (Recurring)</Text>
        {rules.length === 0 ? <Text style={styles.empty}>No automated rules yet.</Text>
          : rules.map(r => (
            <View key={r.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{r.description}</Text>
                <Text style={styles.rowAddr}>$${r.amountUsd} every ${r.frequencyDays}d — ${r.paused ? 'PAUSED' : 'ACTIVE'}</Text>
              </View>
              <View style={styles.rowActions}>
                <Button mode='outlined' onPress={() => togglePause(r.id)} textColor={r.paused ? theme.colors.success : theme.colors.warning} style={styles.smallBtn}>
                  {r.paused ? 'Resume' : 'Pause'}
                </Button>
                <Button mode='outlined' onPress={() => removeRule(r.id)} textColor={theme.colors.danger} style={styles.smallBtn}>Delete</Button>
              </View>
            </View>
          ))}
        <Button mode='contained' onPress={addRule} buttonColor={theme.colors.primary} textColor='#FFF' style={styles.btn}>Add Rule</Button>
      </Card>

      {/* Social Recovery */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Social Recovery (Claim)</Text>
        {claims.length === 0 ? <Text style={styles.empty}>No pending claims.</Text>
          : claims.map(c => (
            <View key={c.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>To: {c.recipientHandle}</Text>
                <Text style={styles.rowAddr}>$${c.amountUsd} {c.tokenSymbol} — {c.claimedAddress ? 'CLAIMED' : 'PENDING'}</Text>
              </View>
              {!c.claimedAddress && <Button mode='outlined' onPress={() => claimIt(c.id)} textColor={theme.colors.primary} style={styles.smallBtn}>Claim</Button>}
            </View>
          ))}
        <Button mode='contained' onPress={createClaim} buttonColor={theme.colors.primary} textColor='#FFF' style={styles.btn}>Create Claim</Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 },
  card: { borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 8 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  k: { color: theme.colors.textMuted, fontSize: 14 },
  v: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  empty: { color: theme.colors.textMuted, fontSize: 13, marginVertical: 8 },
  miniInput: { width: 80, textAlign: 'right', backgroundColor: theme.colors.surfaceMuted, borderRadius: 8, padding: 4 },
  btn: { borderRadius: theme.borderRadius.full, marginTop: 8 },
  smallBtn: { borderRadius: theme.borderRadius.full, marginLeft: 4, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  rowLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  rowAddr: { fontSize: 12, color: theme.colors.textMuted },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
});