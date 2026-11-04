// src/components/AIAssistantFAB.tsx
// Minimal FAB for AI Assistant

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useColors, useShadows, useBorderRadius } from '../theme/ThemeContext';

interface AIAssistantFABProps {
  onPress: () => void;
  visible?: boolean;
  position?: 'bottom' | 'top';
}

export function AIAssistantFAB({ onPress, visible = true, position = 'bottom' }: AIAssistantFABProps) {
  if (!visible) return null;

  const colors = useColors();
  const shadows = useShadows();
  const borderRadius = useBorderRadius();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.fab,
        {
          backgroundColor: colors.primary.DEFAULT,
          ...shadows.lg,
          position: 'absolute',
          right: 20,
          [position]: position === 'bottom' ? 100 : 20,
        },
      ]}
    >
      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M6 8l4 4 4-4M6 12l4 4 4-4M6 16l4 4 4-4" />
        <Circle cx="18" cy="18" r="5" />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AIAssistantFAB;