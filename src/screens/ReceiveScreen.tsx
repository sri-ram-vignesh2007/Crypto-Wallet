// src/screens/ReceiveScreen.tsx - Apple Style Receive

import React, { useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useWalletStore } from '../store/walletStore';
import { ClayButton } from '../components/ClayButton';

const CopyIcon = ({ color = '#2563EB', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const ShareIcon = ({ color = '#2563EB', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l4.9-4.9M15.49 13.51l4.9 4.9M15.49 10.49l-4.9 4.9M8.59 10.49l-4.9-4.9" />
  </Svg>
);

const ChevronRightIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const ChevronDownIcon = ({ color = '#94A3B8', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9l6 6 6-6" />
  </Svg>
);

const CheckIcon = ({ color = '#16A34A', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l5 5" />
  </Svg>
);

const InfoIcon = ({ color = '#2563EB', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 16v-4M12 8h.01" />
  </Svg>
);

const WarningIcon = ({ color = '#F59E0B', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
  </Svg>
);

const NETWORKS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
  { id: 'bsc', name: 'BSC', symbol: 'BNB', color: '#F3BA2F' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0' },
  { id: 'base', name: 'Base', symbol: 'ETH', color: '#0052FF' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', color: '#14F195' },
];

const ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export default function ReceiveScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { hasWallet } = useWalletStore();
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy address');
    }
  };

  const currentNetwork = NETWORKS.find(n => n.id === selectedNetwork) || NETWORKS[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.text.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.title}>Receive</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* QR Code Card */}
        <View style={[styles.qrCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <Text style={styles.qrLabel}>Your Address</Text>
          
          {/* QR Code */}
          <View style={styles.qrWrapper}>
            <View style={styles.qrCode}>
              <Svg width={200} height={200} viewBox="0 0 200 200">
                <Rect x="10" y="10" width="180" height="180" fill="#FFFFFF" />
                <Rect x="10" y="10" width="180" height="180" stroke={colors.border.DEFAULT} strokeWidth={2} />
                {/* QR Pattern - placeholder */}
                <Rect x="10" y="10" width="80" height="80" fill="#000" />
                <Rect x="110" y="10" width="80" height="80" fill="#000" />
                <Rect x="10" y="110" width="80" height="80" fill="#000" />
                <Rect x="30" y="30" width="40" height="40" fill="#FFF" />
                <Rect x="130" y="30" width="40" height="40" fill="#FFF" />
                <Rect x="30" y="130" width="40" height="40" fill="#FFF" />
                {/* Timing patterns */}
                <>
                  {[...Array(10)].map((_, i) => (
                    <Rect key={i} x={10 + i * 16} y={90} width={8} height={8} fill={i % 2 === 0 ? '#000' : '#FFF'} />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <Rect key={`v${i}`} x={90} y={10 + i * 16} width={8} height={8} fill={i % 2 === 0 ? '#000' : '#FFF'} />
                  ))}
                </>
              </Svg>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressWrapper}>
            <Text style={styles.addressLabel}>Ethereum Mainnet</Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressText} numberOfLines={1}>{ADDRESS}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={copyAddress} activeOpacity={0.7}>
                <CopyIcon color={copied ? '#16A34A' : colors.primary.DEFAULT} size={20} />
              </TouchableOpacity>
            </View>
            {copied && <Text style={styles.copiedText}>Copied to clipboard</Text>}
          </View>

          {/* Network Selector */}
          <TouchableOpacity style={styles.networkSelector} onPress={() => setShowNetworkSelector(true)} activeOpacity={0.7}>
            <View style={styles.networkInfo}>
              <Text style={styles.networkLabel}>Network</Text>
              <View style={styles.networkRow}>
                <View style={[
                  styles.networkColor,
                  { backgroundColor: currentNetwork.color },
                ]} />
                <Text style={styles.networkName}>{currentNetwork.name} ({currentNetwork.symbol})</Text>
              </View>
            </View>
            <ChevronRightIcon color={colors.text.muted} size={20} />
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.qrActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary.DEFAULT }]} onPress={copyAddress} activeOpacity={0.85}>
              <CopyIcon color="#FFFFFF" size={20} />
              <Text style={styles.actionBtnText}>Copy Address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: colors.border.DEFAULT }]} activeOpacity={0.85}>
              <ShareIcon color={colors.text.primary} size={20} />
              <Text style={[styles.actionBtnOutlineText, { color: colors.text.primary }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Network Warning */}
        <View style={[styles.warningCard, { backgroundColor: colors.warning.muted, borderColor: colors.warning.DEFAULT }]}>
          <View style={styles.warningRow}>
            <WarningIcon color={colors.warning.DEFAULT} size={20} />
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>Wrong Network?</Text>
              <Text style={styles.warningDesc}>Sending tokens on the wrong network may result in permanent loss. Always verify the network matches the sender's network.</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.info.muted, borderColor: colors.info.DEFAULT }]}>
            <InfoIcon color={colors.info.DEFAULT} size={20} />
            <View>
              <Text style={styles.infoTitle}>Your address is the same across all EVM chains</Text>
              <Text style={styles.infoDesc}>Use this address for Ethereum, Polygon, Arbitrum, Base, Optimism, and BSC.</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.success.muted, borderColor: colors.success.DEFAULT }]}>
            <CheckIcon color={colors.success.DEFAULT} size={20} />
            <View>
              <Text style={styles.infoTitle}>Never share your private keys</Text>
              <Text style={styles.infoDesc}>Your address is public and safe to share. Only share your seed phrase with trusted wallet imports.</Text>
            </View>
          </View>
        </View>

        {/* Supported Networks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Networks</Text>
          <View style={styles.networksGrid}>
            {NETWORKS.map((network) => (
              <TouchableOpacity
                key={network.id}
                style={[
                  styles.networkCard,
                  { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle },
                ]}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.networkBadge,
                  { backgroundColor: network.color },
                ]}>
                  <Text style={styles.networkBadgeText}>{network.symbol}</Text>
                </View>
                <Text style={styles.networkCardName}>{network.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Network Selector Modal */}
      {showNetworkSelector && (
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <TouchableOpacity onPress={() => setShowNetworkSelector(false)} activeOpacity={1} style={styles.modalBackdrop} />
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Network</Text>
            {NETWORKS.map((network) => (
              <TouchableOpacity
                key={network.id}
                style={styles.modalItem}
                onPress={() => { setSelectedNetwork(network.id); setShowNetworkSelector(false); }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.modalNetworkBadge,
                  { backgroundColor: network.color },
                ]}>
                  <Text style={styles.modalNetworkText}>{network.symbol}</Text>
                </View>
                <Text style={styles.modalNetworkName}>{network.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center' },
  qrCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  qrLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, textAlign: 'center' },
  qrWrapper: { alignItems: 'center', marginBottom: 20 },
  qrCode: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  addressWrapper: { marginBottom: 20 },
  addressLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, textAlign: 'center' },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressText: { fontSize: 14, fontWeight: '500', color: '#0F172A', fontFamily: 'monospace' },
  copyBtn: { padding: 4 },
  copiedText: { fontSize: 12, color: '#16A34A', textAlign: 'center', marginTop: 8 },
  networkSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  networkInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  networkLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  networkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  networkColor: { width: 10, height: 10, borderRadius: 5 },
  networkName: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  qrActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnOutlineText: { fontSize: 15, fontWeight: '600' },
  warningCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  warningRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  warningText: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '600', color: '#78350F', marginBottom: 4 },
  warningDesc: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  infoSection: { gap: 12, marginBottom: 24 },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  infoDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#0F172A', marginBottom: 16 },
  networksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  networkCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  networkBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  networkBadgeText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  networkCardName: { fontSize: 14, fontWeight: '600', color: '#0F172A', textAlign: 'center' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  modalNetworkBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNetworkText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  modalNetworkName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
});