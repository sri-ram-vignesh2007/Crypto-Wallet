// src/screens/DeveloperDashboard.tsx
// ADMIN PANEL — view users, transactions, stats (requires PIN)
// ⚠️ ONLY accessible with PIN. Users must consent to analytics during onboarding.

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, DataTable } from 'react-native-paper';
import { SupabaseService, UserProfile, TransactionLog } from '../services/SupabaseService';
import { theme } from '../theme/Theme';

const ADMIN_PIN = '1337'; // Change this! In production, store hashed in Supabase

export default function DeveloperDashboard() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'transactions'>('users');

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, activeTab]);

  const loadData = async () => {
    if (activeTab === 'users') {
      const data = await SupabaseService.getAllUsers();
      setUsers(data);
    } else {
      const data = await SupabaseService.getAllTransactions();
      setTransactions(data);
    }
  };

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
    } else {
      Alert.alert('Access Denied', 'Invalid PIN');
    }
  };

  if (!authenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Developer Dashboard</Text>
        <Text style={styles.subtitle}>Enter admin PIN to access analytics</Text>
        <TextInput
          mode="outlined"
          value={pin}
          onChangeText={setPin}
          placeholder="Enter PIN"
          secureTextEntry
          keyboardType="number-pad"
          style={styles.input}
          textColor={theme.colors.text}
          outlineColor={theme.colors.border}
          activeOutlineColor={theme.colors.primary}
        />
        <Button mode="contained" onPress={handleLogin} buttonColor={theme.colors.primary} textColor="#FFF">
          Access Dashboard
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Developer Dashboard</Text>
      <Text style={styles.stats}>Total Users: {users.length} | Total Transactions: {transactions.length}</Text>

      <View style={styles.tabRow}>
        <Button mode={activeTab === 'users' ? 'contained' : 'outlined'} onPress={() => setActiveTab('users')} buttonColor={activeTab === 'users' ? theme.colors.primary : undefined}>
          Users
        </Button>
        <Button mode={activeTab === 'transactions' ? 'contained' : 'outlined'} onPress={() => setActiveTab('transactions')} buttonColor={activeTab === 'transactions' ? theme.colors.primary : undefined}>
          Transactions
        </Button>
      </View>

      {activeTab === 'users' ? (
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header style={{ backgroundColor: theme.colors.surfaceElevated }}>
              <DataTable.Title textStyle={{ color: theme.colors.text }}>Email</DataTable.Title>
              <DataTable.Title textStyle={{ color: theme.colors.text }}>Name</DataTable.Title>
              <DataTable.Title textStyle={{ color: theme.colors.text }}>Wallet</DataTable.Title>
            </DataTable.Header>
            {users.map((u, i) => (
              <DataTable.Row key={i} style={{ borderBottomColor: theme.colors.border }}>
                <DataTable.Cell textStyle={{ color: theme.colors.textSecondary, fontSize: 12 }}>{u.email}</DataTable.Cell>
                <DataTable.Cell textStyle={{ color: theme.colors.textSecondary, fontSize: 12 }}>{u.name}</DataTable.Cell>
                <DataTable.Cell textStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}>{u.wallet_address?.slice(0, 8)}...</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card>
      ) : (
        <Card style={styles.tableCard}>
          <DataTable>
            <DataTable.Header style={{ backgroundColor: theme.colors.surfaceElevated }}>
              <DataTable.Title textStyle={{ color: theme.colors.text }}>Hash</DataTable.Title>
              <DataTable.Title textStyle={{ color: theme.colors.text }}>Amount</DataTable.Title>
              <DataTable.Title textStyle={{ color: theme.colors.text }}>Status</DataTable.Title>
            </DataTable.Header>
            {transactions.map((t, i) => (
              <DataTable.Row key={i} style={{ borderBottomColor: theme.colors.border }}>
                <DataTable.Cell textStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}>{t.tx_hash?.slice(0, 12)}...</DataTable.Cell>
                <DataTable.Cell textStyle={{ color: theme.colors.textSecondary, fontSize: 12 }}>{t.amount} {t.token_symbol}</DataTable.Cell>
                <DataTable.Cell textStyle={{ color: t.status === 'confirmed' ? theme.colors.success : theme.colors.warning, fontSize: 12 }}>{t.status}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card>
      )}

      <Button mode="outlined" onPress={() => setAuthenticated(false)} textColor={theme.colors.danger} style={{ marginTop: 20 }}>
        Logout
      </Button>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginTop: 40 },
  subtitle: { color: theme.colors.textMuted, marginBottom: 24 },
  input: { backgroundColor: theme.colors.surfaceElevated, marginBottom: 16 },
  stats: { color: theme.colors.primary, fontSize: 14, fontWeight: '700', marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tableCard: { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 12 },
});