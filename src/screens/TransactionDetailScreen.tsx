// src/screens/TransactionDetailScreen.tsx
// Vault System — Transaction Detail with AI Explanation and Risk Review
// Status, amount, recipient/sender, network, fee, hash copy, explorer link,
// timestamp, details accordion, AI explanation and scam affordance

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform,
  Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme, useColors, useSpacing, useBorderRadius, useShadows, useTypography, useIsDark,
  spacing, borderRadius, colors, shadows, typography,
} from '../theme/ThemeContext';
import { theme, riskStates } from '../theme/Theme';
import { ClayButton } from '../components/ClayButton';
import { Card } from '../components/Card';
import { AIAssistantFAB } from '../components/AIAssistantFAB';

// ── ICONS ───────────────────────────────────────────────────────────────────
const ArrowLeftIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const CheckIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="9" fill={color} />
    <Path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth={2} />
  </Svg>
);

const ClockIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

const ShieldCheckIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const ShieldAlertIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const ExternalLinkIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <Path d="M15 3h6v6" />
    <Path d="M10 14L21 3" />
  </Svg>
);

const ChevronRightIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const CopyIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15l7-7 7 7" />
  </Svg>
);

const SparklesIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2v4" />
    <Path d="M12 18v4" />
    <Path d="M4.93 4.93l2.83 2.83" />
    <Path d="M16.24 16.24l2.83 2.83" />
    <Path d="M2 12h4" />
    <Path d="M18 12h4" />
  </Svg>
);

const MoreVerticalIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="1" />
    <Circle cx="12" cy="5" r="1" />
    <Circle cx="12" cy="19" r="1" />
  </Svg>
);

const AlertTriangleIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

const XIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="18" x2="18" y2="6" />
  </Svg>
);

interface Props {
  navigation?: any;
  route?: { params?: { transaction?: any } };
}

export default function TransactionDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();
  const isDark = useIsDark();
  const tx = route?.params?.transaction;

  const [showRiskReview, setShowRiskReview] = useState(false);
  const [riskState, setRiskState] = useState<'normal' | 'attention' | 'high'>('normal');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    if (tx?.risk && (tx.risk === 'normal' || tx.risk === 'attention' || tx.risk === 'high')) {
      setRiskState(tx.risk);
    }
  }, [tx]);

  const handleRiskAcknowledge = () => {
    setShowRiskReview(false);
  };

  const handleConfirm = () => {
    navigation?.goBack();
  };

  if (!tx) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Transaction Details</Text>
          <Text style={styles.emptySubtitle}>No transaction selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.root,
      { backgroundColor: colors.bg.canvas },
    ]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={navigation?.goBack} activeOpacity={0.8} style={styles.backButton} accessibilityLabel="Go back">
          <ArrowLeftIcon color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity activeOpacity={0.8} style={styles.moreButton} accessibilityLabel="More options">
          <MoreVerticalIcon color={colors.text.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: Math.max(100, insets.bottom + 80),
          paddingHorizontal: spacing.screenPaddingHorizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Overview */}
        <View style={[styles.overviewCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          <View style={styles.overviewHeader}>
            <Text style={[styles.overviewTitle, { color: colors.text.primary }]}>Transaction Details</Text>
          </View>

          {/* Status */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Status</Text>
            <View style={styles.statusChip}>
              {tx.status === 'success' ? (
                <CheckIcon color={colors.success.DEFAULT} size={16} />
              ) : tx.status === 'failed' ? (
                <ExternalLinkIcon color={colors.danger.DEFAULT} size={16} />
              ) : (
                <ClockIcon color={colors.warning.DEFAULT} size={16} />
              )}
              <Text style={[styles.statusText, { color: colors.text.primary }]}>{tx.status}</Text>
            </View>
          </View>

          {/* Basic info rows */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Amount</Text>
            <Text style={[styles.detailValue, { color: colors.text.primary }]}>{tx.amount || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Network</Text>
            <Text style={[styles.detailValue, { color: colors.text.primary }]}>{tx.network || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Timestamp</Text>
            <Text style={[styles.detailValue, { color: colors.text.primary }]}>{tx.time || 'N/A'}</Text>
          </View>

          {/* Transaction Hash */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Transaction Hash</Text>
            <Text style={[styles.detailValue, { color: colors.text.primary }]} numberOfLines={1}>
              {tx.hash || 'N/A'}
            </Text>
          </View>

          {/* Explorer Link */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>View on Explorer</Text>
            <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ExternalLinkIcon color={colors.primary.DEFAULT} size={14} />
              <Text style={{ color: colors.primary.DEFAULT, fontSize: 13, fontWeight: '600' }}>Explorer</Text>
            </TouchableOpacity>
          </View>

          {/* AI Risk Explanation */}
          {(() => {
            const stateColor = riskState === 'high' ? colors.danger.DEFAULT : riskState === 'attention' ? colors.warning.DEFAULT : colors.success.DEFAULT;
            const stateBg = riskState === 'high' ? colors.danger.muted : riskState === 'attention' ? colors.warning.muted : colors.success.muted;
            const riskData = riskStates[riskState];

            return (
              <>
                <View style={[
                  styles.aiExplanationCard,
                  {
                    backgroundColor: stateBg,
                    borderColor: stateColor,
                    borderWidth: 1,
                    borderRadius: borderRadius.md,
                    marginTop: spacing.lg,
                  },
                ]}
                >
                  <View style={styles.aiExplanationContent}>
                    <SparklesIcon color={stateColor} size={16} />
                    <Text style={[
                      styles.aiExplanationText,
                      { color: stateColor },
                    ]}>
                      {riskData.primaryActionLabel === 'I understand, continue'
                        ? 'This transaction sends funds to a new address. Blockchain transfers cannot be reversed.'
                        : riskData.primaryActionLabel === 'Continue'
                          ? 'This transaction has attention points. Please review the details carefully before continuing.'
                          : 'This transaction appears safe. No known risks identified.'}
                    </Text>
                  </View>
                </View>

                {/* Risk Review Bottom Sheet */}
                {showRiskReview && (
                  <View style={[styles.riskSheet, { backgroundColor: colors.bg.surface }]}>
                    <View style={styles.riskSheetHeader}>
                      <Text style={[styles.riskSheetTitle, { color: colors.text.primary }]}>Risk Assessment</Text>
                      <TouchableOpacity onPress={() => setShowRiskReview(false)} activeOpacity={0.8} style={styles.riskSheetClose}>
                        <XIcon color={colors.text.muted} size={20} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.riskSheetContent}>
                      <SparklesIcon color={stateColor} size={20} />
                      <Text style={[styles.riskSheetTitleText, { color: colors.text.primary }]}>
                        {riskState.toUpperCase()} Risk
                      </Text>
                      <View style={styles.riskSheetMessage}>
                        {riskData.findings.map((f: string, i: number) => (
                          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <AlertTriangleIcon color={stateColor} size={12} />
                            <Text style={{ color: colors.text.primary, fontSize: 13 }}>{f}</Text>
                          </View>
                        ))}
                      </View>
                      {'requiresExplicitConfirm' in riskData && riskData.requiresExplicitConfirm && (
                        <TouchableOpacity onPress={handleRiskAcknowledge} activeOpacity={0.8} style={[styles.riskAcknowledgeButton, { borderColor: colors.border.subtle }]}>
                          <Text style={[styles.riskAcknowledgeText, { color: colors.text.primary }]}>{riskData.primaryActionLabel}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={handleConfirm} activeOpacity={0.8} style={[styles.riskConfirmButton, { backgroundColor: colors.primary.DEFAULT }]}>
                        <Text style={[styles.riskConfirmButtonText, { color: colors.text.onPrimary }]}>{riskData.primaryActionLabel}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            );
          })()}
        </View>
      </ScrollView>

      {/* AI Assistant FAB */}
      <AIAssistantFAB
        onPress={() => navigation?.navigate?.('AIAssistant', { context: 'transaction', tx })}
        visible={true}
        position="bottom"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPaddingHorizontal,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerSpacer: {
    width: 44,
  },
  moreButton: {
    padding: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#0B1220',
  },
  emptySubtitle: {
    color: '#64748B',
    marginTop: theme.spacing.sm,
    fontSize: 14,
  },
  overviewCard: {
    borderRadius: theme.borderRadius.cardLarge,
    padding: theme.spacing.cardPadding,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  overviewTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  aiExplanationCard: {
    padding: theme.spacing.cardPadding,
    marginBottom: theme.spacing.md,
  },
  aiExplanationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  aiExplanationText: {
    lineHeight: 18,
    fontSize: 13,
    flex: 1,
  },
  riskSheet: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.modal,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  riskSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  riskSheetTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  riskSheetClose: {
    padding: theme.spacing.xs,
  },
  riskSheetContent: {
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  riskSheetTitleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  riskSheetMessage: {
    marginVertical: theme.spacing.xs,
  },
  riskAcknowledgeButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
  },
  riskAcknowledgeText: {
    fontWeight: '600',
  },
  riskConfirmButton: {
    width: '100%',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
  },
  riskConfirmButtonText: {
    fontWeight: '600',
  },
});

export { TransactionDetailScreen };