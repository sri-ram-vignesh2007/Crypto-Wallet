// src/screens/ReceiveScreen.tsx - Apple iPhone Style Receive Screen

import React, { useState, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, SafeAreaView, StatusBar,
  Alert, Share, Animated, Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { CHAINS } from '../core/ChainConfig';

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
          toValue: 0.95,
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

const CopyIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2.5" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ShareIcon = ({ color = '#007AFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l4.9-4.9M15.49 13.51l4.9 4.9M15.49 10.49l-4.9 4.9M8.59 10.49l-4.9-4.9" />
  </Svg>
);

export default function ReceiveScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { address, selectedChain } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const activeChain = CHAINS[selectedChain] || CHAINS.ethereum;
  const displayAddress = address || '0x0000000000000000000000000000000000000000';

  const copyAddress = async () => {
    try {
      await Clipboard.setStringAsync(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy address');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: displayAddress,
        title: 'My Crypto Wallet Address',
      });
    } catch {}
  };

  // Generate deterministic QR matrix pattern based on address characters
  const qrCells: boolean[][] = [];
  const matrixSize = 21;
  const addrHash = displayAddress.toLowerCase().replace('0x', '');
  for (let r = 0; r < matrixSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < matrixSize; c++) {
      if (
        (r < 7 && c < 7) ||
        (r < 7 && c >= matrixSize - 7) ||
        (r >= matrixSize - 7 && c < 7)
      ) {
        const inOuter =
          r === 0 || r === 6 || c === 0 || c === 6 ||
          r === matrixSize - 7 || r === matrixSize - 1 ||
          c === matrixSize - 7 || c === matrixSize - 1;
        const inInner =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= matrixSize - 5 && c <= matrixSize - 3) ||
          (r >= matrixSize - 5 && r <= matrixSize - 3 && c >= 2 && c <= 4);
        row.push(inOuter || inInner);
      } else {
        const idx = (r * matrixSize + c) % addrHash.length;
        const charCode = addrHash.charCodeAt(idx);
        row.push(charCode % 2 === 0 || (r + c) % 3 === 0);
      }
    }
    qrCells.push(row);
  }

  const cellSize = 10;
  const qrSize = matrixSize * cellSize;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Apple Navigation Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <AppleButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </AppleButton>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Receive {activeChain.symbol}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Apple Inset QR Container */}
        <View style={styles.qrContainer}>
          <View style={[styles.qrBox, { backgroundColor: '#FFFFFF', borderColor: colors.border.subtle }]}>
            <Svg width={qrSize} height={qrSize} viewBox={`0 0 ${qrSize} ${qrSize}`}>
              {qrCells.map((row, r) =>
                row.map((filled, c) =>
                  filled ? (
                    <Rect
                      key={`${r}-${c}`}
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill="#000000"
                    />
                  ) : null
                )
              )}
            </Svg>
          </View>
        </View>

        {/* Public Address Card (Apple Inset Style) */}
        <View style={[styles.addressCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <Text style={[styles.chainBadgeText, { color: colors.text.muted }]}>
            {activeChain.name} Public Address
          </Text>
          <Text style={[styles.addressText, { color: colors.text.primary }]} selectable>
            {displayAddress}
          </Text>
          {copied && (
            <Text style={[styles.copiedText, { color: colors.text.primary }]}>✓ Copied to clipboard</Text>
          )}
        </View>

        {/* Apple Action Buttons */}
        <View style={styles.actionsRow}>
          <AppleButton
            onPress={copyAddress}
            style={[styles.primaryBtn, { backgroundColor: colors.primary.DEFAULT }]}
          >
            <CopyIcon color={colors.text.inverse} size={17} />
            <Text style={[styles.primaryBtnText, { color: colors.text.inverse }]}>{copied ? 'Copied' : 'Copy'}</Text>
          </AppleButton>

          <AppleButton
            onPress={handleShare}
            style={[styles.secondaryBtn, { backgroundColor: isDark ? '#202020' : '#F7F7F7', borderColor: colors.border.subtle }]}
          >
            <ShareIcon color={colors.text.primary} size={17} />
            <Text style={[styles.secondaryBtnText, { color: colors.text.primary }]}>Share</Text>
          </AppleButton>
        </View>

        {/* Apple Clean Inset Notice */}
        <View style={[styles.noticeCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <Text style={[styles.noticeText, { color: colors.text.secondary }]}>
            Only send <Text style={{ color: colors.text.primary, fontWeight: '600' }}>{activeChain.name} ({activeChain.symbol})</Text> and EVM-compatible tokens to this address. Sending non-compatible coins may result in loss.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 16,
  },
  qrContainer: {
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBox: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addressCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: 'center',
    marginBottom: 16,
  },
  chainBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  copiedText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginRight: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    marginLeft: 6,
  },
  secondaryBtnText: {
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  noticeCard: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});
