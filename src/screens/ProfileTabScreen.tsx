// src/screens/ProfileTabScreen.tsx
// Profile — minimal fintech style: large avatar header, settings list with hairlines.

import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useProfileStore } from '../store/profileStore';
import { useWalletStore } from '../store/walletStore';
import { theme } from '../theme/Theme';
import { Alert } from 'react-native';

interface Row {
  icon: string;
  label: string;
  sublabel: string;
  tint: string;
  onPress?: () => void;
}

export default function ProfileTabScreen({ navigation }: any) {
  const { name, email, avatar, signOut } = useProfileStore();
  const { address, balance } = useWalletStore();

  const rows: Row[] = [
    { icon: '🤖', label: 'AI Model Selector', sublabel: 'Choose your preferred AI engine', tint: theme.colors.primary, onPress: () => navigation?.navigate?.('Settings') },
    { icon: '🔐', label: 'Security',           sublabel: 'Biometric authentication',          tint: theme.colors.success },
    { icon: '🌐', label: 'Network',            sublabel: 'Sepolia Testnet',                   tint: theme.colors.warning, onPress: () => navigation?.navigate?.('Settings') },
    { icon: '💾', label: 'Backup Wallet',     sublabel: 'View your seed phrase',             tint: theme.colors.primaryLight, onPress: () => navigation?.navigate?.('Settings') },
    { icon: '⚙️', label: 'Settings',          sublabel: 'App preferences, dev dashboard',   tint: theme.colors.textSecondary, onPress: () => navigation?.navigate?.('Settings') },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out?',
      'You will be sent back to the sign-in screen. Your wallet stays on this device — sign back in with the same email to access it.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 56, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{avatar || 'U'}</Text>
          </View>
          <Text style={styles.nameText}>{name || 'User'}</Text>
          {email ? <Text style={styles.emailText}>{email}</Text> : null}
        </View>

        {/* Wallet summary */}
        <View style={styles.walletCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">
              {address || 'Not connected'}
            </Text>
          </View>
          <View style={styles.walletBalancePill}>
            <Text style={styles.walletBalance}>
              {parseFloat(balance || '0').toFixed(4)} ETH
            </Text>
          </View>
        </View>

        {/* Settings list */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.listCard}>
          {rows.map((r, i) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.listRow, i !== rows.length - 1 && styles.rowHairline]}
              activeOpacity={0.7}
              onPress={r.onPress}
            >
              <View style={[styles.rowIconWrap, { backgroundColor: r.tint + '22' }]}>
                <Text style={styles.rowIcon}>{r.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowSublabel}>{r.sublabel}</Text>
              </View>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1, paddingHorizontal: theme.spacing.screen },

  pageTitle: { fontSize: 34, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5, marginBottom: 16 },

  headerWrap: { alignItems: 'center', paddingVertical: 16, marginBottom: 24 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 38, fontWeight: '700', color: theme.colors.primary },
  nameText: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  emailText: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },

  walletCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl, padding: 16, marginBottom: 28,
  },
  walletLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: theme.colors.textMuted, marginBottom: 4 },
  walletAddress: { fontSize: 13, fontFamily: 'monospace', color: theme.colors.text, maxWidth: 180 },
  walletBalancePill: {
    backgroundColor: theme.colors.primaryMuted, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: theme.borderRadius.full, marginLeft: 12,
  },
  walletBalance: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },

  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: theme.colors.textMuted, marginBottom: 10, marginLeft: 4 },
  listCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
  },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  rowHairline: { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  rowIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  rowSublabel: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  rowChevron: { fontSize: 22, color: theme.colors.textMuted, marginLeft: 8 },

  logoutBtn: {
    alignSelf: 'center', marginTop: 28,
    backgroundColor: '#FFE5E5', paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
  },
  logoutText: { color: theme.colors.danger, fontSize: 14, fontWeight: '700' },
});
