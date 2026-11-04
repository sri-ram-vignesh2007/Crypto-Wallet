// src/screens/onboarding/WelcomeScreen.tsx
// Clean Welcome Screen - No emojis, minimal text

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useColors, useIsDark } from '../../theme/ThemeContext';

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

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const handleContinue = () => {
    navigation.navigate('Email');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <View style={[styles.content, { paddingTop: Math.max(40, insets.top + 20), paddingBottom: Math.max(30, insets.bottom + 16) }]}>
        {/* Brand Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackdrop, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z"
                fill={colors.primary.DEFAULT}
              />
              <Path
                d="M12 7V17M9 12H15"
                stroke="#FFFFFF"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Title & Tagline */}
        <View style={styles.headerBlock}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            CryptoVault<Text style={{ color: colors.primary.DEFAULT }}>AI</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Secure self-custodial wallet with AI-powered security.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.primary.DEFAULT,
              shadowColor: colors.primary.DEFAULT,
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            },
          ]}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  iconContainer: { marginTop: 20, alignItems: 'center' },
  iconBackdrop: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  headerBlock: { alignItems: 'center', marginVertical: 16 },
  title: {
    fontWeight: '800',
    fontSize: 32,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});