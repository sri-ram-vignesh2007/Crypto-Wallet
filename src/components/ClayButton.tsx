// src/components/ClayButton.tsx
// Clean, professional button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, ActivityIndicator, View } from 'react-native';
import { useColors, useSpacing, useBorderRadius, useShadows, useTypography } from '../theme/ThemeContext';

export interface ClayButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function ClayButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ClayButtonProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();

  const getVariantStyles = () => {
    const isDisabled = disabled || loading;

    if (isDisabled) {
      return {
        backgroundColor: colors.bg.surfaceMuted,
        borderColor: colors.border.subtle,
        textColor: colors.text.muted,
        shadowOpacity: 0,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary.DEFAULT,
          borderColor: colors.primary.DEFAULT,
          textColor: colors.text.onPrimary,
          shadowColor: colors.primary.DEFAULT,
        };
      case 'secondary':
        return {
          backgroundColor: colors.bg.surface,
          borderColor: colors.border.DEFAULT,
          textColor: colors.text.primary,
          shadowColor: colors.shadow.color,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary.DEFAULT,
          textColor: colors.primary.DEFAULT,
          shadowOpacity: 0,
        };
      case 'success':
        return {
          backgroundColor: colors.success.DEFAULT,
          borderColor: colors.success.DEFAULT,
          textColor: colors.text.onPrimary,
          shadowColor: colors.success.DEFAULT,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger.DEFAULT,
          borderColor: colors.danger.DEFAULT,
          textColor: colors.text.onPrimary,
          shadowColor: colors.danger.DEFAULT,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.primary.DEFAULT,
          shadowOpacity: 0,
        };
      default:
        return {
          backgroundColor: colors.primary.DEFAULT,
          borderColor: colors.primary.DEFAULT,
          textColor: colors.text.onPrimary,
          shadowColor: colors.primary.DEFAULT,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: borderRadius.button,
          fontSize: typography.labelSmall.fontSize,
          height: 36,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          borderRadius: borderRadius.buttonLarge,
          fontSize: typography.labelLarge.fontSize,
          height: 56,
        };
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          borderRadius: borderRadius.button,
          fontSize: typography.labelMedium.fontSize,
          height: 44,
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  const baseShadow = variant === 'outline' || variant === 'ghost' 
    ? { shadowOpacity: 0, elevation: 0 }
    : shadows.sm;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          backgroundColor: vStyles.backgroundColor,
          borderColor: vStyles.borderColor,
          borderWidth: variant === 'outline' ? 1.5 : variant === 'ghost' ? 0 : 0,
          paddingVertical: sStyles.paddingVertical,
          paddingHorizontal: sStyles.paddingHorizontal,
          borderRadius: sStyles.borderRadius,
          height: sStyles.height,
          width: fullWidth ? '100%' : undefined,
          ...baseShadow,
          shadowColor: vStyles.shadowColor || colors.shadow.color,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vStyles.textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[
            styles.text,
            { fontSize: sStyles.fontSize, color: vStyles.textColor, fontWeight: '600' },
            textStyle,
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrap: {
    flexShrink: 0,
  },
  text: {
    letterSpacing: 0.1,
    textAlign: 'center',
    fontWeight: '600',
  },
});