// src/screens/NFTAgentScreen.tsx
// NFT Agent — portfolio monitoring, floor price alerts, collection analytics

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Text, Button, Card, Switch, TextInput } from 'react-native-paper';
import Svg, { Rect, Text as SvgText, Path, Line } from 'react-native-svg';
import { theme } from '../theme/Theme';
import { useWalletStore } from '../store/walletStore';
import { NFTService, NFTAsset, NFTCollectionSummary, NFTAlert } from '../services/NFTService';
import { PortfolioStats } from '../services/NFTService';

const SCREEN_W = Dimensions.get('window').width;

export default function NFTAgentScreen() {
  const { address } = useWalletStore();
  const [assets, setAssets] = useState<NFTAsset[]>([]);
  const [collections, setCollections] = useState<NFTCollectionSummary[]>([]);
  const [alerts, setAlerts] = useState<NFTAlert[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(20);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => { load(); }, [address]);

  const load = async () => {
    setLoading(true);
    try {
      const [a, c, al, s] = await Promise.all([
        NFTService.getOwnedNFTs(address || '0x0'),
        NFTService.getCollectionSummaries([]), // will be called with assets
        NFTService.checkAlerts(address || '0x0', alertThreshold),
        NFTService.getPortfolioStats(address || '0x0'),
      ]);
      setAssets(a);
      const coll = await NFTService.getCollectionSummaries(a);
      setCollections(coll);
      setAlerts(al);
      setStats(s);
    } catch (e) {
      console.error('NFT load error:', e);
    }
    setLoading(false);
  };

  const checkAlertsNow = async () => {
    const al = await NFTService.checkAlerts(address || '0x0', alertThreshold);
    setAlerts(al);
    setShowAlerts(true);
    if (al.length === 0) Alert.alert('No Alerts', `No floor price movements exceed ${alertThreshold}% threshold.`);
  };

  if (loading) return <View style={styles.root}><Text style={styles.title}>NFT Agent</Text></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={styles.title}>NFT Agent</Text>
        <Text style={styles.subtitle}>Monitor collections, floor prices, and portfolio value</Text>
      </View>

      {/* Portfolio Summary */}
      {stats && (
        <View style={styles.summaryRow}>
          <SummaryCard label="Total Value" value={`$${stats.totalFloorValueUsd.toLocaleString()}`} sub={`${stats.totalFloorValueEth.toFixed(2)} ETH`} />
          <SummaryCard label="Assets" value={stats.totalAssets.toString()} sub={stats.collectionsCount + ' collections'}/>
          <SummaryCard label="Est. P/L" value={`+$${stats.pnlEstimateUsd.toLocaleString()}`} sub={stats.topCollection} />
        </View>
      )}

      {/* Alert Settings */}
      <Card style={styles.card}>
        <View style={styles.alertSettingsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Alert Threshold</Text>
            <Text style={styles.settingValue}>{alertThreshold}% floor change</Text>
          </View>
          <TextInput
            mode="outlined"
            value={alertThreshold.toString()}
            onChangeText={t => setAlertThreshold(parseInt(t) || 20)}
            style={styles.thresholdInput}
            keyboardType="numeric"
            textColor={theme.colors.text}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            editable={false}
          />
        </View>
        <View style={styles.sliderTrack}>
          {[10, 15, 20, 25, 30, 40, 50].map(v => (
            <TouchableOpacity key={v} onPress={() => setAlertThreshold(v)} style={styles.sliderOption}>
              <Text style={[styles.sliderOptionText, alertThreshold === v && styles.sliderOptionActive]}>{v}%</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button mode="outlined" onPress={checkAlertsNow} textColor={theme.colors.primary} style={styles.checkBtn}>
          Check Alerts Now
        </Button>
      </Card>

      {/* Active Alerts */}
      {showAlerts && alerts.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Alerts ({alerts.length})</Text>
          </View>
          {alerts.map((a, i) => (
            <AlertRow key={i} alert={a} />
          ))}
        </Card>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Collections</Text>
          </View>
          {collections.map((c, i) => (
            <CollectionRow key={i} collection={c} assets={assets.filter(a => a.collectionSlug === c.slug)} />
          ))}
        </Card>
      )}

      {collections.length === 0 && assets.length === 0 && (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🖼</Text>
            <Text style={styles.emptyTitle}>No NFTs Detected</Text>
            <Text style={styles.emptyDesc}>Connect a wallet with NFTs or import NFTs to start monitoring.</Text>
          </View>
        </Card>
      )}

      {/* Individual Assets */}
      {assets.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Assets ({assets.length})</Text>
          </View>
          {assets.map((a, i) => (
            <AssetRow key={i} asset={a} />
          ))}
        </Card>
      )}

      {/* Floor Price Chart */}
      {collections.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Floor Price Trend (30d)</Text>
          </View>
          <FloorTrendChart collections={collections} width={SCREEN_W - 48} height={200} />
        </Card>
      )}
    </ScrollView>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      {sub && <Text style={styles.summarySub}>{sub}</Text>}
    </View>
  );
}

function AlertRow({ alert }: { alert: NFTAlert }) {
  const severityColor = alert.severity === 'critical' ? theme.colors.danger : alert.severity === 'warn' ? theme.colors.warning : theme.colors.primary;
  const typeIcon = alert.type === 'floor_drop' ? '▼' : alert.type === 'floor_rise' ? '▲' : '●';
  return (
    <View style={[styles.alertRow, { borderLeftColor: severityColor }]}>
      <View style={[styles.alertIcon, { backgroundColor: severityColor + '20' }]}>
        <Text style={[styles.alertIconText, { color: severityColor }]}>{typeIcon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.alertMessage}>{alert.message}</Text>
        <Text style={styles.alertTime}>{new Date(alert.timestamp).toLocaleString()}</Text>
      </View>
      <View style={[styles.alertBadge, { backgroundColor: severityColor + '20' }]}>
        <Text style={[styles.alertBadgeText, { color: severityColor }]}>{alert.severity.toUpperCase()}</Text>
      </View>
    </View>
  );
}

function CollectionRow({ collection, assets }: { collection: NFTCollectionSummary; assets: NFTAsset[] }) {
  const positive = collection.floorPriceChange24h >= 0;
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.collectionRow}>
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName}>{collection.name}</Text>
        <Text style={styles.collectionMeta}>
          {collection.assetCount} items · Floor: {collection.floorPriceChange24h >= 0 ? '▲' : '▼'} {Math.abs(collection.floorPriceChange24h).toFixed(1)}%
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.collectionValue}>${collection.totalFloorValueUsd.toLocaleString()}</Text>
        <Text style={[styles.collectionChange, { color: positive ? theme.colors.success : theme.colors.danger }]}>
          {positive ? '+' : ''}{collection.floorPriceChange24h.toFixed(1)}% (24h)
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function AssetRow({ asset }: { asset: NFTAsset }) {
  return (
    <View style={styles.assetRow}>
      <View style={[styles.assetImage, { backgroundColor: theme.colors.surfaceMuted }]} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <Text style={styles.assetCollection}>{asset.collectionName}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.assetFloor}>Floor: {asset.floorPriceEth.toFixed(3)} ETH</Text>
        <Text style={styles.assetUsd}>${asset.floorPriceUsd.toLocaleString()}</Text>
      </View>
    </View>
  );
}

function FloorTrendChart({ collections, width, height }: { collections: NFTCollectionSummary[]; width: number; height: number }) {
  // Generate mock 30-day trend data for each collection
  const padding = { top: 12, right: 8, bottom: 20, left: 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const days = 30;
  const xStep = innerW / (days - 1);
  
  // Generate synthetic trend data
  const allSeries = collections.map(c => {
    const base = c.totalFloorValueUsd / c.assetCount;
    return Array.from({ length: days }, (_, i) => base * (0.8 + Math.random() * 0.4) * (1 + i * 0.01));
  });
  
  const allValues = allSeries.flat();
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;
  const yFor = (v: number) => padding.top + (1 - (v - min) / range) * innerH;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <Line key={i} x1={padding.left} x2={width - padding.right}
            y1={padding.top + innerH * t} y2={padding.top + innerH * t}
            stroke={theme.colors.borderLight} strokeWidth={1} strokeDasharray="4,4" />
        ))}
        {/* Series */}
        {allSeries.map((series, si) => {
          const color = [theme.colors.primary, theme.colors.success, theme.colors.warning, theme.colors.danger, theme.colors.primaryLight][si % 5];
          return (
            <Path
              key={si}
              d={series.map((v, i) => `${i === 0 ? 'M' : 'L'}${padding.left + i * xStep} ${yFor(v)}`).join(' ')}
              stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.8}
            />
          );
        })}
        {/* Legend */}
        {collections.map((c, i) => (
          <View key={i} style={{ position: 'absolute', top: padding.top + i * 20, left: padding.left, flexDirection: 'row', alignItems: 'center' }}>
            <Rect x={0} y={0} width={12} height={3} fill={[theme.colors.primary, theme.colors.success, theme.colors.warning, theme.colors.danger, theme.colors.primaryLight][i % 5]} rx={1} />
            <SvgText x={16} y={10} fontSize={10} fill={theme.colors.textMuted} fontFamily="monospace">{c.name.slice(0, 12)}</SvgText>
          </View>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screenPadding },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, padding: 16, backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border },
  summaryLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  summarySub: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  card: { borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 16, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  alertSettingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  settingLabel: { fontSize: 13, color: theme.colors.textMuted },
  settingValue: { fontSize: 15, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
  thresholdInput: { width: 60, textAlign: 'center', backgroundColor: theme.colors.surfaceMuted },
  sliderTrack: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  sliderOption: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.borderRadius.full },
  sliderOptionText: { fontSize: 11, fontWeight: '600', color: theme.colors.text },
  sliderOptionActive: { color: '#FFFFFF' },
  checkBtn: { marginTop: 4, borderRadius: theme.borderRadius.full, borderColor: theme.colors.primary },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, borderLeftWidth: 4 },
  alertIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertIconText: { fontSize: 14, fontWeight: '700' },
  alertMessage: { fontSize: 13, color: theme.colors.text, lineHeight: 18 },
  alertTime: { fontSize: 10, color: theme.colors.textMuted, marginTop: 2 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.full },
  alertBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  collectionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  collectionInfo: { flex: 1 },
  collectionName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  collectionMeta: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  collectionValue: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  collectionChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  assetImage: { width: 44, height: 44, borderRadius: 8 },
  assetName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  assetCollection: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  assetFloor: { fontSize: 12, color: theme.colors.text, fontFamily: 'monospace' },
  assetUsd: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 18 },
});