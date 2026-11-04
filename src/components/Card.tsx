// src/components/Card.tsx
// Clean, professional card component
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors, useSpacing, useBorderRadius, useShadows } from '../theme/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  style, 
  elevated = false, 
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.bg.surface,
          borderColor: colors.border.DEFAULT,
          borderWidth: 1,
          ...(elevated ? shadows.sm : { shadowOpacity: 0, elevation: 0 }),
        };
      case 'elevated':
        return {
          backgroundColor: colors.bg.surface,
          borderColor: 'transparent',
          borderWidth: 0,
          ...shadows.md,
        };
      case 'filled':
        return {
          backgroundColor: colors.bg.surfaceMuted,
          borderColor: 'transparent',
          borderWidth: 0,
          ...(elevated ? shadows.sm : { shadowOpacity: 0, elevation: 0 }),
        };
      default:
        return {
          backgroundColor: colors.bg.surface,
          borderColor: colors.border.subtle,
          borderWidth: 1,
          ...(elevated ? shadows.sm : { shadowOpacity: 0, elevation: 0 }),
        };
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return spacing.sm;
      case 'md': return spacing.cardPadding;
      case 'lg': return spacing.xl;
      default: return spacing.cardPadding;
    }
  };

  const vStyles = getVariantStyles();
  const p = getPadding();

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: borderRadius.card,
          padding: p,
          ...vStyles,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default Card;