// src/components/ActionsBottomSheet.tsx
// Vault System — Center action sheet with Send, Receive, Swap, Scan QR, Add Token

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle, Rect } from 'react-native-svg';
import { useTheme, useColors, useSpacing, useBorderRadius, useShadows, useTypography, useIsDark } from '../theme/ThemeContext';

export type ActionType = 'Send' | 'Receive' | 'Swap' | 'ScanQR' | 'AddToken';

interface ActionItem {
  type: ActionType;
  label: string;
  description: string;
  icon: React.FC<{ color: string }>;
  requiresNavigation: boolean; // Shows chevron if true
}

interface ActionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onActionPress: (action: ActionType) => void;
}

// Lucide-style icons for actions
const SendIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Path d="M19 12H5" />
    <Path d="M12 5l-7 7" />
    <Path d="M12 5l7 7" />
  </Svg>
);

const ReceiveIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Path d="M5 12h14" />
    <Path d="M12 5l7 7" />
    <Path d="M5 12l7 7" />
  </Svg>
);

const SwapIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 16h10" />
    <Path d="M11 20a8 8 0 0 0 8-8" />
    <Path d="M17 16l4 4-4 4" />
    <Path d="M17 4a8 8 0 1 1-16 0" />
    <Path d="M7 8l-4 4 4 4" />
  </Svg>
);

const ScanQRIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <Path d="M17 5h2a2 2 0 0 1 2 2v2" />
    <Path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <Path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <Rect x="7" y="7" width="10" height="10" rx="1" />
  </Svg>
);

const AddTokenIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Circle cx="12" cy="12" r="10" />
  </Svg>
);

const ChevronIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const DragHandle = ({ color }: { color: string }) => (
  <Svg width={36} height={4} viewBox="0 0 36 4" fill={color}>
    <Rect x="0" y="0" width="36" height="4" rx="2" />
  </Svg>
);

const ACTIONS: ActionItem[] = [
  {
    type: 'Send',
    label: 'Send',
    description: 'Transfer crypto to another address',
    icon: SendIcon,
    requiresNavigation: true,
  },
  {
    type: 'Receive',
    label: 'Receive',
    description: 'Get your address or QR code to receive funds',
    icon: ReceiveIcon,
    requiresNavigation: true,
  },
  {
    type: 'Swap',
    label: 'Swap',
    description: 'Exchange one token for another',
    icon: SwapIcon,
    requiresNavigation: true,
  },
  {
    type: 'ScanQR',
    label: 'Scan QR',
    description: 'Scan a QR code to send or connect',
    icon: ScanQRIcon,
    requiresNavigation: true,
  },
  {
    type: 'AddToken',
    label: 'Add Token',
    description: 'Import a custom token to track',
    icon: AddTokenIcon,
    requiresNavigation: true,
  },
];

export function ActionsBottomSheet({ visible, onClose, onActionPress }: ActionsBottomSheetProps) {
  if (!visible) return null;

  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();
  const isDark = useIsDark();

  const handleBackdropPress = () => onClose();

  return (
    <View style={styles.backdrop} onStartShouldSetResponder={() => true} onResponderGrant={handleBackdropPress}>
      <TouchableOpacity
        style={styles.backdropTouch}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={[
        styles.sheet,
        {
          backgroundColor: colors.bg.surface,
          borderTopLeftRadius: borderRadius.modal,
          borderTopRightRadius: borderRadius.modal,
          ...shadows.xl,
        },
      ]}>
        {/* Drag Handle */}
        <TouchableOpacity style={styles.dragHandle} onPress={onClose} activeOpacity={0.7}>
          <DragHandle color={colors.border.subtle} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={[
          styles.title,
          { color: colors.text.primary, ...typography.h3 },
        ]}>
          Actions
        </Text>

        {/* Action Rows */}
        <View style={styles.actionsList}>
          {ACTIONS.map((action, index) => (
            <TouchableOpacity
              key={action.type}
              style={[
                styles.actionRow,
                {
                  borderBottomWidth: index < ACTIONS.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border.divider,
                },
              ]}
              onPress={() => {
                onActionPress(action.type);
                onClose();
              }}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
            >
              {/* Leading Icon */}
              <View style={styles.iconContainer}>
                <action.icon color={colors.text.primary} />
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={[
                  styles.actionLabel,
                  { color: colors.text.primary, ...typography.bodyLarge },
                ]}>
                  {action.label}
                </Text>
                <Text style={[
                  styles.actionDescription,
                  { color: colors.text.secondary, ...typography.bodySmall },
                ]}>
                  {action.description}
                </Text>
              </View>

              {/* Trailing Chevron */}
              {action.requiresNavigation && (
                <ChevronIcon color={colors.text.muted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[
            styles.cancelButton,
            {
              backgroundColor: colors.bg.surfaceMuted,
              borderRadius: borderRadius.button,
            },
          ]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.cancelLabel,
            { color: colors.text.primary, ...typography.labelLarge },
          ]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  dragHandle: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -4,
  },
  actionsList: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontWeight: '600',
  },
  actionDescription: {
    fontWeight: '400',
  },
  cancelButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  cancelLabel: {
    fontWeight: '600',
  },
});

export default ActionsBottomSheet;