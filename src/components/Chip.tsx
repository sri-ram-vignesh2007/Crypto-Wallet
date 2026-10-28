// src/components/Chip.tsx
// Clean, professional chip component
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useColors, useSpacing, useBorderRadius, useShadows, useTypography } from '../theme/ThemeContext';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'filled';
}

export function Chip({ label, selected = false, onPress, icon, variant = 'default' }: ChipProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();

  const getVariantStyles = () => {
    const base = {
      backgroundColor: colors.bg.surface,
      borderColor: colors.border.DEFAULT,
      borderWidth: 1,
      textColor: colors.text.primary,
      ...shadows.xs,
    };

    if (selected) {
      switch (variant) {
        case 'outline':
          return {
            ...base,
            borderColor: colors.primary.DEFAULT,
            borderWidth: 1.5,
            backgroundColor: colors.primary.muted,
            textColor: colors.primary.DEFAULT,
          };
        case 'filled':
          return {
            ...base,
            backgroundColor: colors.primary.DEFAULT,
            borderColor: colors.primary.DEFAULT,
            borderWidth: 0,
            textColor: colors.text.onPrimary,
            ...shadows.sm,
          };
        default:
          return {
            ...base,
            backgroundColor: colors.primary.muted,
            borderColor: colors.primary.DEFAULT,
            borderWidth: 1.5,
            textColor: colors.primary.DEFAULT,
            ...shadows.sm,
          };
      }
    }

    return base;
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.wrap,
        {
          backgroundColor: vStyles.backgroundColor,
          borderColor: vStyles.borderColor,
          borderWidth: vStyles.borderWidth,
          borderRadius: borderRadius.chip,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          marginRight: spacing.sm,
          ...(selected && variant === 'filled' ? shadows.sm : {}),
        },
      ]}
      activeOpacity={0.85}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[
        styles.label,
        { color: vStyles.textColor, ...typography.labelSmall },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconWrap: {
    flexShrink: 0,
  },
  label: {
    fontWeight: '500',
    lineHeight: 16,
  },
});