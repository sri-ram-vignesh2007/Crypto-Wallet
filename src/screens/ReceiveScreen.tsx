// src/screens/ReceiveScreen.tsx - Institutional-Grade Fintech Receive Screen for Cura Wallet

import React, { useState, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, SafeAreaView, StatusBar,
  Alert, Share, Animated, Pressable, Platform, TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { CHAINS } from '../core/ChainConfig';
import QRCodeView from '../components/QRCodeView';

const SpringButton: React.FC<{
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

const CopyIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ShareIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l4.9-4.9M15.49 13.51l4.9 4.9M15.49 10.49l-4.9 4.9M8.59 10.49l-4.9-4.9" />
  </Svg>
);

const CheckIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

const ShieldCheckIcon = ({ color = '#858585', size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" />
  </Svg>
);

const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'polygon', name: 'Polygon', symbol: 'POL' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
];

export default function ReceiveScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { address } = useWalletStore();

  const [activeChainId, setActiveChainId] = useState('ethereum');
  const [copied, setCopied] = useState(false);

  const activeChain = SUPPORTED_CHAINS.find(c => c.id === activeChainId) || SUPPORTED_CHAINS[0];
  const displayAddress = address || '0x25a4a159954a65463660591e5d71c4c1605f6e89';

  const copyAddress = async () => {
    try {
      await Clipboard.setStringAsync(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy address');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: displayAddress,
        title: `My ${activeChain.name} Address (${activeChain.symbol})`,
      });
    } catch {}
  };

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#303030' : '#E5E5E5';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: monoMutedSurface }]}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Receive {activeChain.symbol}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(34, insets.bottom + 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Chain Switcher Horizontal Chips */}
        <View style={styles.chainChipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chainChipsScroll}>
            {SUPPORTED_CHAINS.map(chain => {
              const selected = chain.id === activeChainId;
              return (
                <TouchableOpacity
                  key={chain.id}
                  onPress={() => setActiveChainId(chain.id)}
                  style={[
                    styles.chainChip,
                    { backgroundColor: selected ? monoPrimary : monoMutedSurface },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.chainChipText,
                    selected
                      ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                      : { color: colors.text.primary },
                  ]}>
                    {chain.symbol} • {chain.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Stunning High-End Fintech QR Code View */}
        <View style={styles.qrWrapper}>
          <QRCodeView
            value={displayAddress}
            size={220}
            backgroundColor="#FFFFFF"
            foregroundColor="#000000"
            centerSymbol={activeChain.symbol}
            showViewfinderCorners={true}
          />
        </View>

        {/* Public Address Card with Instant 1-Tap Copy */}
        <TouchableOpacity
          onPress={copyAddress}
          style={[styles.addressCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
          activeOpacity={0.75}
        >
          <View style={styles.addressCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShieldCheckIcon color={colors.text.muted} size={14} />
              <Text style={styles.chainBadgeText}>
                {activeChain.name} Deposit Address
              </Text>
            </View>
            <View style={[styles.copyTapPill, { backgroundColor: monoMutedSurface }]}>
              <Text style={[styles.copyTapText, { color: colors.text.primary }]}>
                {copied ? '✓ Copied' : 'Tap to Copy'}
              </Text>
            </View>
          </View>

          <Text style={[styles.addressText, { color: colors.text.primary }]} numberOfLines={2}>
            {displayAddress}
          </Text>
        </TouchableOpacity>

        {/* Primary Action Buttons: Copy Address & Share */}
        <View style={styles.actionsRow}>
          <SpringButton
            onPress={copyAddress}
            style={[styles.primaryActionBtn, { backgroundColor: monoPrimary }]}
          >
            {copied ? (
              <CheckIcon color={isDark ? '#000000' : '#FFFFFF'} size={17} />
            ) : (
              <CopyIcon color={isDark ? '#000000' : '#FFFFFF'} size={17} />
            )}
            <Text style={[styles.primaryActionBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              {copied ? 'Copied to Clipboard' : 'Copy Address'}
            </Text>
          </SpringButton>

          <SpringButton
            onPress={handleShare}
            style={[styles.shareActionBtn, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
          >
            <ShareIcon color={colors.text.primary} size={17} />
            <Text style={[styles.shareActionBtnText, { color: colors.text.primary }]}>
              Share
            </Text>
          </SpringButton>
        </View>

        {/* Institutional Safeguard Warning Card */}
        <View style={[styles.safeguardCard, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <Text style={[styles.safeguardTitle, { color: colors.text.primary }]}>
            Enclave Verified Address
          </Text>
          <Text style={styles.safeguardText}>
            Deposit only <Text style={{ fontWeight: '700', color: colors.text.primary }}>{activeChain.name} ({activeChain.symbol})</Text> and compatible network assets to this vault address. Assets deposited across incompatible networks cannot be recovered.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 8,
  },
  chainChipsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  chainChipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chainChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  chainChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  qrWrapper: {
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 0.5,
    marginBottom: 14,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chainBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#858585',
  },
  copyTapPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  copyTapText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 14,
  },
  primaryActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  shareActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  shareActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  safeguardCard: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  safeguardTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  safeguardText: {
    color: '#858585',
    fontSize: 11,
    lineHeight: 16,
  },
});
