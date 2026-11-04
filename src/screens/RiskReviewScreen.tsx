// src/screens/RiskReviewScreen.tsx
// Vault System — Risk Review Screen with Normal/Attention/High-Risk States
// Clear safe/attention/high-risk state; findings, what this means, recommended action,
// view technical details, and an explicit confirmation

import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform,
  Modal, Pressable, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import {
  useTheme, useColors, useSpacing, useBorderRadius, useShadows, useTypography, useIsDark,
  spacing, borderRadius, colors, shadows, typography,
} from '../theme/ThemeContext';
import { theme, riskStates } from '../theme/Theme';
import { ClayButton } from '../components/ClayButton';
import { Card } from '../components/Card';

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

const ClockIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

export default function RiskReviewScreen({ navigation, route }: { navigation?: any; route?: any }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();
  const isDark = useIsDark();
  const { tx } = route?.params || {};

  const [riskState, setRiskState] = useState<'normal' | 'attention' | 'high'>('normal');
  const [showFindings, setShowFindings] = useState(true);
  const [technicalDetailsVisible, setTechnicalDetailsVisible] = useState(false);

  useEffect(() => {
    if (tx?.risk && (tx.risk === 'normal' || tx.risk === 'attention' || tx.risk === 'high')) {
      setRiskState(tx.risk);
    }
  }, [tx]);

  const riskStateData = riskStates[riskState];
  const StateIcon = riskState === 'high' ? ShieldAlertIcon : riskState === 'attention' ? ShieldAlertIcon : CheckIcon;
  const stateColor = riskState === 'high' ? colors.danger.DEFAULT : riskState === 'attention' ? colors.warning.DEFAULT : colors.success.DEFAULT;

  const handleConfirm = () => {
    navigation?.goBack();
  };

  const handleViewTechnical = () => {
    setTechnicalDetailsVisible(!technicalDetailsVisible);
  };

  return (
    <SafeAreaView style={[
      styles.root,
      { backgroundColor: colors.bg.canvas },
    ]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: Math.max(100, insets.bottom + 80),
          paddingHorizontal: spacing.screenPaddingHorizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={navigation?.goBack} activeOpacity={0.8} style={styles.backButton} accessibilityLabel="Go back">
            <ArrowLeftIcon color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.riskCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.subtle }]}>
          {/* Risk State Header */}
          <View style={styles.riskStateHeader}>
            <StateIcon color={stateColor} size={48} />
            <Text style={[styles.riskStateTitle, { color: stateColor }]}>
              {riskState === 'normal' ? 'Normal' : riskState === 'attention' ? 'Attention Required' : 'High Risk'}
            </Text>
          </View>

          {/* Risk Findings */}
          {showFindings && (
            <View style={styles.riskFindings}>
              {riskStateData.findings.map((finding: string, index: number) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
                  <StateIcon color={stateColor} size={16} />
                  <Text style={[{ color: colors.text.primary, ...typography.bodyMedium, flex: 1 }]}>
                    {finding}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* What This Means */}
          <View style={styles.riskDetails}>
            <Text style={styles.riskDetailsTitle}>What this means</Text>
            <Text style={[styles.riskDetailsText, { color: colors.text.secondary }]}>
              {riskStateData.description || 'Review the transaction details carefully before proceeding.'}
            </Text>
          </View>

          {/* Recommended Action */}
          <View style={styles.riskAction}>
            <Text style={styles.riskActionTitle}>Recommended action</Text>
            <Text style={[styles.riskActionText, { color: stateColor }]}>
              {riskStateData.primaryActionLabel}
            </Text>
          </View>

          {/* Advanced Details Accordion */}
          <View style={[styles.accordion, { backgroundColor: colors.bg.surfaceElevated }]}>
            <TouchableOpacity onPress={handleViewTechnical} activeOpacity={0.8} style={styles.accordionHeader}>
              <Text style={styles.accordionHeaderText}>
                {technicalDetailsVisible ? 'Hide technical details' : 'View technical details'}
              </Text>
            </TouchableOpacity>
            {technicalDetailsVisible && (
              <View style={styles.accordionContent}>
                <Text style={[styles.accordionContentText, { color: colors.text.secondary }]}>
                  {riskStateData.technicalDetails || 'No technical details available. For full contract data, view on explorer.'}
                </Text>
                {tx && (
                  <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
                    <Text style={styles.accordionLabel}>From: <Text style={styles.accordionValue}>{tx.from}</Text></Text>
                    <Text style={styles.accordionLabel}>To: <Text style={styles.accordionValue}>{tx.to}</Text></Text>
                    <Text style={styles.accordionLabel}>Network: <Text style={styles.accordionValue}>{tx.network}</Text></Text>
                    <Text style={styles.accordionLabel}>Gas Fee: <Text style={styles.accordionValue}>{tx.gasFee || 'Not specified'}</Text></Text>
                    <Text style={styles.accordionLabel}>Hash: <Text style={styles.accordionValue}>{tx.hash}</Text></Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Confirmation Action */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            style={[styles.confirmButton, { backgroundColor: stateColor }]}
            accessibilityLabel={riskStateData.primaryActionLabel}
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>
              {riskStateData.primaryActionLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice at bottom */}
        <View style={styles.privacyBar}>
          <Text style={styles.privacyText}>
            Blockchain transfers cannot be reversed. Always verify recipient addresses and network before confirming.
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerSpacer: {
    width: 44,
  },
  riskCard: {
    borderRadius: theme.borderRadius.cardLarge,
    padding: theme.spacing.cardPadding,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
  },
  riskStateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  riskStateTitle: {
    fontWeight: '700',
    fontSize: 20,
  },
  riskFindings: {
    marginBottom: theme.spacing.lg,
  },
  riskDetails: {
    marginBottom: theme.spacing.lg,
  },
  riskDetailsTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: theme.spacing.sm,
    color: '#0B1220',
  },
  riskDetailsText: {
    lineHeight: 20,
    fontSize: 14,
  },
  riskAction: {
    marginBottom: theme.spacing.lg,
  },
  riskActionTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: theme.spacing.sm,
    color: '#0B1220',
  },
  riskActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  accordion: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  accordionHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  accordionHeaderText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#2563EB',
  },
  accordionContent: {
    padding: theme.spacing.md,
  },
  accordionContentText: {
    lineHeight: 18,
    fontSize: 13,
  },
  accordionLabel: {
    fontWeight: '600',
    fontSize: 12,
    color: '#64748B',
  },
  accordionValue: {
    fontWeight: '400',
    color: '#0B1220',
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    marginTop: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  privacyBar: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export { RiskReviewScreen };