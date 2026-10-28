// src/screens/onboarding/CreateWalletScreen.tsx
// Clean Create/Import Wallet Choice Screen

import React from 'react';
import {
  View, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors, useIsDark, useSpacing, useBorderRadius, useTypography } from '../../theme/ThemeContext';
import { ClayButton } from '../../components/ClayButton';

// Safe area hook with fallback
let useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
try {
  const safeAreaContext = require('react-native-safe-area-context');
  if (safeAreaContext.useSafeAreaInsets) {
    useSafeAreaInsets = safeAreaContext.useSafeAreaInsets;
  }
} catch (e) {
  // Fallback already defined
}

export default function CreateWalletScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const typography = useTypography();
  const isDark = useIsDark();

  const handleCreateNew = () => {
    navigation.navigate('SeedPhrase', { mode: 'create' });
  };

  const handleImport = () => {
    navigation.navigate('SeedPhrase', { mode: 'import' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(20, insets.top + 10), paddingBottom: Math.max(60, insets.bottom + 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Set Up Wallet</Text>
          <View style={{ width: 38 }} />
        </View>

        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Choose how you want to get started</Text>

        {/* Create New Wallet Card */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT },
          ]}
          onPress={handleCreateNew}
          activeOpacity={0.85}
        >
          <View style={[
            styles.optionIcon,
            { backgroundColor: colors.primary.muted },
          ]}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primary.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colors.text.primary }]}>Create New Wallet</Text>
            <Text style={[styles.optionDesc, { color: colors.text.secondary }]}>Generate a new secure wallet with a unique seed phrase</Text>
          </View>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 18l6-6-6-6" />
          </Svg>
        </TouchableOpacity>

        {/* Import Wallet Card */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            { backgroundColor: colors.bg.surface, borderColor: colors.border.DEFAULT },
          ]}
          onPress={handleImport}
          activeOpacity={0.85}
        >
          <View style={[
            styles.optionIcon,
            { backgroundColor: colors.success.muted },
          ]}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.success.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 21l5-5-5-5M7 21l-5-5 5-5" />
            </Svg>
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colors.text.primary }]}>Import Wallet</Text>
            <Text style={[styles.optionDesc, { color: colors.text.secondary }]}>Restore using your 12-word seed phrase or private key</Text>
          </View>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 18l6-6-6-6" />
          </Svg>
        </TouchableOpacity>

        {/* Info Note */}
        <View style={[
          styles.infoNote,
          { backgroundColor: colors.info.muted, borderColor: colors.info.DEFAULT },
        ]}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.info.DEFAULT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <Path d="M9 12l2 2 4-4" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>Your seed phrase is the only way to recover your wallet. Keep it secure and never share it.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 15, marginBottom: 32 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  optionDesc: { fontSize: 13, lineHeight: 18 },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { fontSize: 12, lineHeight: 18, flex: 1 },
});