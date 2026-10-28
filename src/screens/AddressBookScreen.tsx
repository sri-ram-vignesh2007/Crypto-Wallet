// src/screens/AddressBookScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';
import { UniversalAddressBookService, AddressBookEntry } from '../services/UniversalAddressBookService';

export default function AddressBookScreen() {
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const list = await UniversalAddressBookService.list();
    setEntries(list.sort((a, b) => a.label.localeCompare(b.label)));
  };

  const add = async () => {
    if (!name.trim() || !address.trim().startsWith('0x')) {
      Alert.alert('Invalid', 'Enter a name and a valid 0x address.');
      return;
    }
    try {
      await UniversalAddressBookService.add(name.trim(), address.trim(), note.trim() || undefined);
      setName(''); setAddress(''); setNote('');
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? 'Unknown error');
    }
  };

  const remove = (e: AddressBookEntry) => {
    Alert.alert('Remove contact?', `Delete "${e.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await UniversalAddressBookService.remove(e.id);
          await load();
        }
      },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>Address Book</Text>
      <Text style={styles.subtitle}>Send crypto to people you trust — by name.</Text>

      <Card style={styles.card}>
        <TextInput label="Name (e.g. Mom)" value={name} onChangeText={setName} style={styles.input}
          mode="outlined" outlineColor={theme.colors.border} activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text} />
        <TextInput label="0x address" value={address} onChangeText={setAddress} style={styles.input}
          mode="outlined" outlineColor={theme.colors.border} activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text} autoCapitalize="none" />
        <TextInput label="Note (optional)" value={note} onChangeText={setNote} style={styles.input}
          mode="outlined" outlineColor={theme.colors.border} activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.text} />
        <Button mode="contained" onPress={add} buttonColor={theme.colors.primary} textColor="#FFF"
          style={styles.addBtn}>Add Contact</Button>
      </Card>

      {entries.length === 0 && <Text style={styles.empty}>No contacts yet.</Text>}

      {entries.map(e => (
        <TouchableOpacity key={e.id} onLongPress={() => remove(e)}>
          <Card style={styles.row}>
            <View style={styles.rowInner}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{e.label.charAt(0).toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{e.label}</Text>
                <Text style={styles.rowAddr}>{e.address}</Text>
                {e.note ? <Text style={styles.rowNote}>{e.note}</Text> : null}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 },
  card: { borderRadius: theme.borderRadius.lg, padding: 12, marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: theme.colors.surfaceMuted },
  addBtn: { borderRadius: theme.borderRadius.full, marginTop: 4 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', padding: 24 },
  row: { borderRadius: theme.borderRadius.md, padding: 12, marginBottom: 8 },
  rowInner: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: theme.colors.primary, fontWeight: '700', fontSize: 18 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  rowAddr: { fontSize: 12, color: theme.colors.textMuted, fontFamily: 'monospace', marginTop: 2 },
  rowNote: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
});
