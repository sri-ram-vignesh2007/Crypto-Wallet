// src/screens/SettingsScreen.tsx - Apple Style Settings

import React, { useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, Switch,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useProfileStore } from '../store/profileStore';
import { useWalletStore } from '../store/walletStore';
import { useAppLock } from '../hooks/useAppLock';
import { ClayButton } from '../components/ClayButton';

const ChevronRightIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const SectionIcons = {
  wallet: (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h14v-4" />
    </Svg>
  ),
  security: (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Path d="M9 12l2 2 4-4" />
    </Svg>
  ),
  ai: (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 8l4 4 4-4M6 12l4 4 4-4M6 16l4 4 4-4" />
      <Circle cx="18" cy="18" r="5" />
    </Svg>
  ),
  networks: (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 12h20M12 2a20 20 0 1 0 0 40 20 20 0 0 0 0-40z" />
    </Svg>
  ),
  appearance: (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="5" />
      <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </Svg>
  ),
  support: (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Path d="M12 17h.01" />
    </Svg>
  ),
};

const SETTINGS_SECTIONS = [
  {
    id: 'wallet',
    title: 'Wallet',
    icon: SectionIcons.wallet,
    items: [
      { id: 'manage', label: 'Manage Wallets', action: () => {} },
      { id: 'connect', label: 'Connect Hardware Wallet', action: () => {} },
      { id: 'export', label: 'Export Private Keys', action: () => Alert.alert('Security', 'Requires biometric authentication') },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: SectionIcons.security,
    items: [
      { id: 'biometric', label: 'Biometric Lock', type: 'switch', value: true },
      { id: 'auto-lock', label: 'Auto-lock Timer', value: '1 minute' },
      { id: 'change-pin', label: 'Change PIN', action: () => {} },
    ],
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    icon: SectionIcons.ai,
    items: [
      { id: 'enable-ai', label: 'Enable AI Insights', type: 'switch', value: true },
      { id: 'risk-level', label: 'Risk Sensitivity', value: 'Balanced' },
      { id: 'data-sharing', label: 'Share Analytics', type: 'switch', value: false },
    ],
  },
  {
    id: 'networks',
    title: 'Networks',
    icon: SectionIcons.networks,
    items: [
      { id: 'default', label: 'Default Network', value: 'Ethereum' },
      { id: 'manage', label: 'Manage Networks', action: () => {} },
      { id: 'rpc', label: 'Custom RPC', action: () => {} },
    ],
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: SectionIcons.appearance,
    items: [
      { id: 'theme', label: 'Theme', value: 'System' },
      { id: 'currency', label: 'Currency', value: 'USD' },
      { id: 'language', label: 'Language', value: 'English' },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    icon: SectionIcons.support,
    items: [
      { id: 'help', label: 'Help Center', action: () => {} },
      { id: 'feedback', label: 'Send Feedback', action: () => {} },
      { id: 'terms', label: 'Terms of Service', action: () => {} },
      { id: 'privacy', label: 'Privacy Policy', action: () => {} },
      { id: 'version', label: 'Version', value: '1.0.0' },
    ],
  },
];

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { isUnlocked } = useAppLock();
  const { hasWallet } = useWalletStore();
  const { name, avatar } = useProfileStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.primary.muted, borderColor: colors.primary.DEFAULT }]}>
          <View style={[
            styles.avatar,
            { backgroundColor: colors.primary.DEFAULT },
          ]}>
            <Text style={styles.avatarText}>{avatar || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name || 'User'}</Text>
            <Text style={styles.profileStatus}>
              {hasWallet ? 'Wallet Active' : 'No Wallet'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                {section.icon}
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionList}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={`${section.id}-${item.id}`}
                  style={[
                    styles.item,
                    index === section.items.length - 1 ? styles.itemLast : null,
                    { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                  ]}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <Text style={[
                      styles.itemLabel,
                      { color: colors.text.primary },
                    ]}>
                      {item.label}
                    </Text>
                    {item.value && (
                      <Text style={[styles.itemValue, { color: colors.text.muted }]}>{item.value}</Text>
                    )}
                  </View>
                  <View style={styles.itemRight}>
                    {item.type === 'switch' && (
                      <Switch
                        value={item.value}
                        onValueChange={() => {}}
                        thumbColor={item.value ? colors.primary.DEFAULT : colors.text.muted}
                        trackColor={{ false: colors.border.DEFAULT, true: colors.primary.muted }}
                      />
                    )}
                    {!item.type && !item.value && <ChevronRightIcon color={colors.text.muted} size={20} />}
                    {item.value && !item.type && !item.action && (
                      <Text style={[styles.itemValue, { color: colors.text.muted }]}>{item.value}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.danger.muted, borderColor: colors.danger.DEFAULT }]}
            onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive' },
            ])}
            activeOpacity={0.85}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.danger.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </Svg>
            <Text style={[styles.dangerText, { color: colors.danger.DEFAULT }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.version}>
          <Text style={styles.versionText}>CryptoVaultAI v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: '600', color: '#0F172A' },
  profileStatus: { fontSize: 13, fontWeight: '500', color: '#16A34A' },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  editText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  sectionList: { gap: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  itemLast: { borderBottomWidth: 1 },
  itemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemLabel: { fontSize: 15, fontWeight: '500' },
  itemValue: { fontSize: 14, fontWeight: '500' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dangerSection: { marginTop: 16, marginBottom: 24 },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerText: { fontSize: 15, fontWeight: '600' },
  version: { alignItems: 'center', paddingTop: 16, paddingBottom: 32 },
  versionText: { fontSize: 12, fontWeight: '500', color: '#94A3B8' },
});