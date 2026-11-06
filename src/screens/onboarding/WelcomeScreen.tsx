// src/screens/onboarding/WelcomeScreen.tsx - Apple iPhone Style Minimalist Onboarding

import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, SafeAreaView, Animated, Pressable,
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

// Apple Spring Pressable
const AppleButton: React.FC<{
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
}> = ({ onPress, style, children }) => {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: 0.96,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
        }).start();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCreate = () => {
    navigation.navigate('SeedPhrase', { mode: 'create' });
  };

  const handleImport = () => {
    navigation.navigate('SeedPhrase', { mode: 'import' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: Math.max(30, insets.top + 20),
            paddingBottom: Math.max(20, insets.bottom + 16),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Apple Centered Brand Emblem */}
        <View style={styles.centerContainer}>
          <View style={[styles.shieldContainer, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
            <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z"
                fill={colors.primary.DEFAULT}
              />
              <Path
                d="M9 12L11 14L15 10"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]}>
            Crypto Wallet
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Self-custody crypto on Ethereum, BNB Chain, Polygon, and more with Apple-grade security.
          </Text>
        </View>

        {/* Apple Style Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppleButton
            onPress={handleCreate}
            style={[styles.primaryButton, { backgroundColor: colors.primary.DEFAULT }]}
          >
            <Text style={styles.primaryButtonText}>Create a New Wallet</Text>
          </AppleButton>

          <AppleButton
            onPress={handleImport}
            style={[styles.secondaryButton, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>I Already Have a Wallet</Text>
          </AppleButton>

          <Text style={[styles.footerText, { color: colors.text.muted }]}>
            By continuing, you agree to the Terms of Service & Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  shieldContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    marginBottom: 26,
    shadowColor: '#007AFF',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    letterSpacing: -0.2,
    maxWidth: 320,
  },
  actionsContainer: {
    width: '100%',
    paddingBottom: 8,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
});
