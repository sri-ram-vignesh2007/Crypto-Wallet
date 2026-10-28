// src/screens/SpendingInsightsScreen.tsx
// AI Spending Insights — category breakdown, monthly trends, anomalies

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Svg, { Rect, Text as SvgText, Circle, Line, Path } from 'react-native-svg';
import { theme } from '../theme/Theme';
import { useWalletStore } from '../store/walletStore';
import { SpendingInsightsService, SpendingInsight, SpendingCategory, Movement, Anomaly } from '../services/SpendingInsightsService';

const SCREEN_W = Dimensions.get('window').width;

export default function SpendingInsightsScreen() {
  const { balances, totalValueUsd } = useWalletStore();
  const [insight, setInsight] = useState<SpendingInsight | null>(null);

  useEffect(() => { load(); }, [totalValueUsd]);

  const load = async () => {
    const i = await SpendingInsightsService.analyze({ balances, totalValueUsd });
    setInsight(i);
  };

  if (!insight) return <View style={styles.root}><Text style={styles.title}>Spending Insights</Text></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending Insights</Text>
        <Text style={styles.subtitle}>Where your portfolio moved this month</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Total Volume" value={`$${insight.totalVolumeUsd.toLocaleString()}`} icon="volume" />
        <SummaryCard label="Trades" value={insight.tradeCount.toString()} icon="trades" />
        <SummaryCard label="Gas Spent" value={`$${insight.gasSpentUsd.toFixed(2)}`} icon="gas" />
      </View>

      {/* Category Breakdown */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
        </View>
        {insight.categories.map((cat, i) => (
          <CategoryBar key={i} category={cat} total={insight.totalVolumeUsd} />
        ))}
      </Card>

      {/* Monthly Trend */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>30-Day Trend</Text>
        </View>
        <TrendChart data={insight.monthlyTrend} width={SCREEN_W - 48} height={180} />
      </Card>

      {/* Top Movements */}
      {insight.topMovements.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Largest Movements</Text>
          </View>
          {insight.topMovements.map((m, i) => (
            <MovementRow key={i} movement={m} />
          ))}
        </Card>
      )}

      {/* Anomalies */}
      {insight.anomalies.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detected Anomalies</Text>
          </View>
          {insight.anomalies.map((a, i) => (
            <AnomalyRow key={i} anomaly={a} />
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const colors = { volume: theme.colors.primary, trades: theme.colors.success, gas: theme.colors.warning };
  return (
    <View style={[styles.summaryCard, { borderLeftColor: colors[icon as keyof typeof colors] }]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function CategoryBar({ category, total }: { category: SpendingCategory; total: number }) {
  const pct = total > 0 ? (category.valueUsd / total) * 100 : 0;
  return (
    <View style={styles.catRow}>
      <View style={[styles.catColor, { backgroundColor: category.color }]} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.catHeader}>
          <Text style={styles.catLabel}>{category.label}</Text>
          <Text style={styles.catPct}>{pct.toFixed(1)}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: category.color }]} />
        </View>
        <Text style={styles.catValue}>${category.valueUsd.toLocaleString()}</Text>
      </View>
    </View>
  );
}

function MovementRow({ movement }: { movement: Movement }) {
  const isIn = movement.direction === 'in';
  return (
    <View style={styles.movementRow}>
      <View style={[styles.movementDir, { backgroundColor: isIn ? theme.colors.success + '20' : theme.colors.danger + '20' }]}>
        <Text style={[styles.movementDirText, { color: isIn ? theme.colors.success : theme.colors.danger }]}>
          {isIn ? '↑' : '↓'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.movementToken}>{movement.token}</Text>
        <Text style={styles.movementDetail}>{movement.type} · {new Date(movement.timestamp).toLocaleDateString()}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.movementAmount, { color: isIn ? theme.colors.success : theme.colors.danger }]}>
          {isIn ? '+' : '-'}$${movement.valueUsd.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

function AnomalyRow({ anomaly }: { anomaly: Anomaly }) {
  return (
    <View style={styles.anomalyRow}>
      <View style={[styles.anomalyDot, { backgroundColor: theme.colors.warning }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.anomalyTitle}>{anomaly.title}</Text>
        <Text style={styles.anomalyDesc}>{anomaly.description}</Text>
      </View>
      <Text style={styles.anomalySeverity}>{anomaly.severity}</Text>
    </View>
  );
}

function TrendChart({ data, width, height }: { data: number[]; width: number; height: number }) {
  if (!data.length) return <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.colors.textMuted }}>No trend data</Text></View>;
  
  const padding = { top: 12, right: 8, bottom: 20, left: 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const xStep = innerW / (data.length - 1 || 1);
  
  const yFor = (v: number) => padding.top + (1 - (v - min) / range) * innerH;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <Line key={i} x1={padding.left} x2={width - padding.right}
            y1={padding.top + innerH * t} y2={padding.top + innerH * t}
            stroke={theme.colors.borderLight} strokeWidth={1} strokeDasharray="4,4" />
        ))}
        {/* Area */}
        <Path
          d={data.map((v, i) => `${i === 0 ? 'M' : 'L'}${padding.left + i * xStep} ${yFor(v)}`).join(' ') + ` L${width - padding.right} ${height - padding.bottom} L${padding.left} ${height - padding.bottom} Z`}
          fill={theme.colors.primary + '15'}
        />
        {/* Line */}
        <Path
          d={data.map((v, i) => `${i === 0 ? 'M' : 'L'}${padding.left + i * xStep} ${yFor(v)}`).join(' ')}
          stroke={theme.colors.primary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Dots */}
        {data.map((v, i) => (
          <Circle key={i} cx={padding.left + i * xStep} cy={yFor(v)} r={4}
            fill={theme.colors.background} stroke={theme.colors.primary} strokeWidth={2} />
        ))}
        {/* Y-axis labels */}
        <SvgText x={width - padding.right + 4} y={padding.top + 4} fontSize={10} fill={theme.colors.textMuted} fontFamily="monospace">
          ${max.toLocaleString()}
        </SvgText>
        <SvgText x={width - padding.right + 4} y={height - padding.bottom - 4} fontSize={10} fill={theme.colors.textMuted} fontFamily="monospace">
          ${min.toLocaleString()}
        </SvgText>
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
  summaryCard: { flex: 1, padding: 16, backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.borderRadius.lg, borderLeftWidth: 4, borderWidth: 1, borderColor: theme.colors.border },
  summaryLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  card: { borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 16, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  catRow: { marginBottom: 16 },
  catColor: { width: 4, height: 4, borderRadius: 2, marginRight: 12, marginTop: 8 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catLabel: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
  catPct: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },
  barTrack: { height: 6, backgroundColor: theme.colors.surfaceMuted, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: '100%', borderRadius: 3 },
  catValue: { fontSize: 12, color: theme.colors.textMuted },
  movementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  movementDir: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  movementDirText: { fontSize: 14, fontWeight: '700' },
  movementToken: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  movementDetail: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  movementAmount: { fontSize: 14, fontWeight: '600' },
  anomalyRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  anomalyDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12, marginTop: 4, flexShrink: 0 },
  anomalyTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  anomalyDesc: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  anomalySeverity: { fontSize: 10, fontWeight: '700', color: theme.colors.warning, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
});