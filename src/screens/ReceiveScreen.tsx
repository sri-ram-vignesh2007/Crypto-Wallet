// src/screens/ReceiveScreen.tsx - Trust Wallet Style Receive

import React, { useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { CHAINS } from '../core/ChainConfig';

const CopyIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ShareIcon = ({ color = '#0500FF', size = 18 }: { color?: string; size?: number }) => (
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
      // Corner alignment squares
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Receive {activeChain.symbol}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code Container */}
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
                      fill="#0B0E14"
                    />
                  ) : null
                )
              )}
            </Svg>
          </View>
        </View>

        {/* Public Address Card */}
        <View style={[styles.addressCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <Text style={[styles.chainBadgeText, { color: colors.text.muted }]}>
            {activeChain.name} Public Address
          </Text>
          <Text style={[styles.addressText, { color: colors.text.primary }]} selectable>
            {displayAddress}
          </Text>
          {copied && (
            <Text style={styles.copiedText}>Copied to clipboard!</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={copyAddress}
            activeOpacity={0.85}
            style={[styles.primaryBtn, { backgroundColor: colors.primary.DEFAULT }]}
          >
            <CopyIcon color="#FFFFFF" size={18} />
            <Text style={styles.primaryBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            style={[styles.secondaryBtn, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}
          >
            <ShareIcon color={colors.primary.DEFAULT} size={18} />
            <Text style={[styles.secondaryBtnText, { color: colors.text.primary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Network Notice */}
        <View style={[styles.noticeCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <Text style={[styles.noticeText, { color: colors.text.muted }]}>
            Send only <Text style={{ color: colors.text.primary, fontWeight: '700' }}>{activeChain.name} ({activeChain.symbol})</Text> and EVM-compatible tokens to this address. Sending other coins may result in permanent loss.
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
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 16,
  },
  qrContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBox: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addressCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  chainBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  copiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
  },
  secondaryBtnText: {
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  noticeCard: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
