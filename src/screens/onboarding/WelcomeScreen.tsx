// src/screens/onboarding/WelcomeScreen.tsx - Apple Pay / Apple Card Executive Onboarding

import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, SafeAreaView, Animated, Pressable, Dimensions, Platform,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

let useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
try {
  const safeAreaContext = require('react-native-safe-area-context');
  if (safeAreaContext.useSafeAreaInsets) {
    useSafeAreaInsets = safeAreaContext.useSafeAreaInsets;
  }
} catch (e) {}

// Apple Spring Scale Button
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

// Apple Contactless NFC Waves
const ContactlessIcon = ({ color = 'rgba(255,255,255,0.6)', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8.5 16.5a5 5 0 0 1 0-7M12 19a8.5 8.5 0 0 0 0-14M15.5 21.5a12 12 0 0 0 0-19" />
  </Svg>
);

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 220,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        damping: 16,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, cardScaleAnim]);

  const handleCreate = () => {
    navigation.navigate('SeedPhrase', { mode: 'create' });
  };

  const handleImport = () => {
    navigation.navigate('SeedPhrase', { mode: 'import' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 20,
            paddingBottom: Math.max(24, insets.bottom + 16),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* ======================================================== */}
        {/* TITANIUM APPLE CARD PREVIEW (Apple Pay Presentation)      */}
        {/* ======================================================== */}
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScaleAnim }] }]}>
          <View style={[styles.titaniumCard, { backgroundColor: '#161618' }]}>
            <View style={styles.cardSpecularLine} />

            <View style={styles.cardTopRow}>
              <Text style={styles.cardBrandText}>CURA WALLET</Text>
              <ContactlessIcon size={20} />
            </View>

            <View style={styles.cardMiddle}>
              <View style={styles.cardChip}>
                <View style={styles.chipInner} />
              </View>
              <Text style={styles.cardPassType}>TITANIUM PASS</Text>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={styles.cardholderText}>SELF-CUSTODY</Text>
              <Text style={styles.cardNetworkText}>EVM & MULTI-CHAIN</Text>
            </View>
          </View>
        </Animated.View>

        {/* Title & Subtitle */}
        <View style={styles.headingSection}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Cura Wallet
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Engineered for high-speed, self-custody crypto payments with Apple-grade security.
          </Text>
        </View>

        {/* Apple Inset Highlights Group */}
        <View style={[styles.highlightsCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightBullet}>🔐</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.highlightTitle, { color: colors.text.primary }]}>True Self-Custody</Text>
              <Text style={[styles.highlightSub, { color: colors.text.muted }]}>You hold full ownership of your private keys and 12-word recovery phrase.</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />

          <View style={styles.highlightRow}>
            <Text style={styles.highlightBullet}>🌐</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.highlightTitle, { color: colors.text.primary }]}>Multi-Chain & DeFi Hub</Text>
              <Text style={[styles.highlightSub, { color: colors.text.muted }]}>100+ blockchains, Web3 DApp browser, and decentralized perpetuals.</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />

          <View style={styles.highlightRow}>
            <Text style={styles.highlightBullet}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.highlightTitle, { color: colors.text.primary }]}>Cross-Compatibility</Text>
              <Text style={[styles.highlightSub, { color: colors.text.muted }]}>Easily import recovery phrases from Trust Wallet, Coinbase Wallet, or MetaMask.</Text>
            </View>
          </View>
        </View>

        {/* Solid Apple Pay Style Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppleButton
            onPress={handleCreate}
            style={[
              styles.primaryButton,
              { backgroundColor: isDark ? '#FFFFFF' : '#000000' },
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              Create a New Wallet
            </Text>
          </AppleButton>

          <AppleButton
            onPress={handleImport}
            style={[styles.secondaryButton, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>
              I Already Have a Wallet
            </Text>
          </AppleButton>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  cardContainer: {
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  titaniumCard: {
    width: SCREEN_WIDTH - 48,
    height: 195,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  cardSpecularLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrandText: {
    color: '#D1D1D6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 36,
    height: 26,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInner: {
    width: 20,
    height: 14,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardPassType: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardholderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardNetworkText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headingSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  highlightsCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  highlightBullet: {
    fontSize: 20,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  highlightSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 0.5,
    marginVertical: 6,
    marginLeft: 32,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
