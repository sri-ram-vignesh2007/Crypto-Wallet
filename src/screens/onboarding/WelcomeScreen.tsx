// src/screens/onboarding/WelcomeScreen.tsx
// Trust Wallet Minimalist Welcome Screen

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors, useIsDark } from '../../theme/ThemeContext';

let useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
try {
  const safeAreaContext = require('react-native-safe-area-context');
  if (safeAreaContext.useSafeAreaInsets) {
    useSafeAreaInsets = safeAreaContext.useSafeAreaInsets;
  }
} catch (e) {}

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const handleCreate = () => {
    navigation.navigate('SeedPhrase', { mode: 'create' });
  };

  const handleImport = () => {
    navigation.navigate('SeedPhrase', { mode: 'import' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <View style={[styles.content, { paddingTop: Math.max(30, insets.top + 20), paddingBottom: Math.max(20, insets.bottom + 16) }]}>
        {/* Brand Shield Logo */}
        <View style={styles.centerContainer}>
          <View style={[styles.shieldContainer, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Svg width={76} height={76} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z"
                fill={colors.primary.DEFAULT}
              />
              <Path
                d="M9 12L11 14L15 10"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]}>
            The Most Trusted & Secure Crypto Wallet
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Store, send, and swap your crypto across major blockchains with non-custodial security.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleCreate}
            activeOpacity={0.88}
            style={[styles.primaryButton, { backgroundColor: colors.primary.DEFAULT }]}
          >
            <Text style={styles.primaryButtonText}>Create a new wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImport}
            activeOpacity={0.8}
            style={[styles.secondaryButton, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>I already have a wallet</Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.text.muted }]}>
            By continuing, you agree to our Terms of Service & Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  shieldContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 320,
  },
  actionsContainer: {
    width: '100%',
    paddingBottom: 8,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
