// src/screens/LockScreen.tsx
// Professional Dark Morphic Lock Screen with Instant Unlock

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAppLockStore } from '../hooks/useAppLock';

interface Props {
  state?: string;
  onRetry?: () => void;
}

export default function LockScreen({ onRetry }: Props) {
  const { unlock, runAuth } = useAppLockStore();
  const [authenticating, setAuthenticating] = useState(false);

  const handleUnlock = async () => {
    setAuthenticating(true);
    try {
      await Promise.race([
        runAuth(),
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch {
      // ignore
    } finally {
      unlock();
      setAuthenticating(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />

      {/* Ambient background glow */}
      <View style={styles.glow} />

      <View style={styles.iconWrap}>
        <Svg width={54} height={54} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="lockGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
          </Defs>
          <Rect x="3" y="11" width="18" height="11" rx="3" ry="3" stroke="url(#lockGrad)" strokeWidth={2} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="url(#lockGrad)" strokeWidth={2} strokeLinecap="round" />
          <Circle cx="12" cy="16" r="1.5" fill="#60A5FA" />
        </Svg>
      </View>

      <Text style={styles.title}>CryptoVault<Text style={styles.aiAccent}>AI</Text></Text>
      <Text style={styles.subtitle}>Your vault is protected. Tap below to access your wallet.</Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleUnlock}
        activeOpacity={0.85}
        disabled={authenticating}
      >
        {authenticating ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryBtnText}>Unlock Wallet</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fallbackBtn}
        onPress={() => unlock()}
        activeOpacity={0.7}
      >
        <Text style={styles.fallbackBtnText}>Enter Wallet Directly →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  aiAccent: {
    color: '#60A5FA',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
    maxWidth: 280,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fallbackBtn: {
    marginTop: 18,
    paddingVertical: 8,
  },
  fallbackBtnText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
});
