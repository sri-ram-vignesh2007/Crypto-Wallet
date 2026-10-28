// src/components/FloatingBottomNav.tsx
// Clean, professional floating bottom navigation
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, StyleProp, ViewStyle, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useColors, useSpacing, useBorderRadius, useShadows, useIsDark, useTypography } from '../theme/ThemeContext';

export type TabKey = 'Home' | 'Explore' | 'Actions' | 'Activity' | 'Settings';

interface NavProps {
  active: TabKey;
  onNavigate: (tab: TabKey) => void;
  onActionsPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const ICON_SIZE = IS_SMALL_DEVICE ? 22 : 24;

// Lucide-style precision rounded outline icons
const HomeIcon = ({ active, color }: { active: boolean; color: string }) => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const ExploreIcon = ({ active, color }: { active: boolean; color: string }) => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20" />
    <Path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
  </Svg>
);

const ActionsIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Line x1={12} y1={5} x2={12} y2={19} />
    <Line x1={5} y1={12} x2={19} y2={12} />
  </Svg>
);

const ActivityIcon = ({ active, color }: { active: boolean; color: string }) => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M16 2v4" />
    <Path d="M8 2v4" />
    <Path d="M3 10h18" />
    <Path d="M16 14h-8" />
    <Path d="M16 18h-8" />
  </Svg>
);

const SettingsIcon = ({ active, color }: { active: boolean; color: string }) => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export function FloatingBottomNav({ active, onNavigate, onActionsPress, style }: NavProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const shadows = useShadows();
  const typography = useTypography();
  const isDark = useIsDark();

  const bottomOffset = Math.max(spacing.md, Platform.OS === 'ios' ? insets.bottom + spacing.sm : insets.bottom + spacing.md);

  const navBackground = isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.92)';
  const navBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.9)';

  const tabBarStyles = [
    styles.tabBar,
    {
      backgroundColor: navBackground,
      borderColor: navBorder,
      borderTopColor: navBorder,
      borderTopWidth: 1,
      ...shadows.lg,
    },
  ];

  return (
    <View style={[styles.container, { bottom: bottomOffset }, style]} pointerEvents="box-none">
      <View style={tabBarStyles}>
        {/* TAB 1: Home */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onNavigate('Home')}
          activeOpacity={0.7}
          accessibilityLabel="Home"
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'Home' }}
        >
          <HomeIcon active={active === 'Home'} color={active === 'Home' ? colors.primary.DEFAULT : colors.text.muted} />
          <Text style={[
            styles.tabLabel,
            { color: active === 'Home' ? colors.primary.DEFAULT : colors.text.muted, ...typography.labelSmall },
            active === 'Home' && styles.tabLabelActive,
          ]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* TAB 2: Explore */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onNavigate('Explore')}
          activeOpacity={0.7}
          accessibilityLabel="Explore"
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'Explore' }}
        >
          <ExploreIcon active={active === 'Explore'} color={active === 'Explore' ? colors.primary.DEFAULT : colors.text.muted} />
          <Text style={[
            styles.tabLabel,
            { color: active === 'Explore' ? colors.primary.DEFAULT : colors.text.muted, ...typography.labelSmall },
            active === 'Explore' && styles.tabLabelActive,
          ]}>
            Explore
          </Text>
        </TouchableOpacity>

        {/* TAB 3: Center Actions Button */}
        <View style={styles.centerAction}>
          <TouchableOpacity
            style={[
              styles.centerActionInner,
              {
                backgroundColor: colors.primary.DEFAULT,
                ...shadows.md,
              },
            ]}
            onPress={onActionsPress}
            activeOpacity={0.85}
            accessibilityLabel="Actions"
            accessibilityRole="button"
          >
            <ActionsIcon color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[
            styles.swapLabel,
            { color: colors.text.muted, ...typography.labelSmall },
          ]}>
            Actions
          </Text>
        </View>

        {/* TAB 4: Activity */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onNavigate('Activity')}
          activeOpacity={0.7}
          accessibilityLabel="Activity"
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'Activity' }}
        >
          <ActivityIcon active={active === 'Activity'} color={active === 'Activity' ? colors.primary.DEFAULT : colors.text.muted} />
          <Text style={[
            styles.tabLabel,
            { color: active === 'Activity' ? colors.primary.DEFAULT : colors.text.muted, ...typography.labelSmall },
            active === 'Activity' && styles.tabLabelActive,
          ]}>
            Activity
          </Text>
        </TouchableOpacity>

        {/* TAB 5: Settings */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onNavigate('Settings')}
          activeOpacity={0.7}
          accessibilityLabel="Settings"
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'Settings' }}
        >
          <SettingsIcon active={active === 'Settings'} color={active === 'Settings' ? colors.primary.DEFAULT : colors.text.muted} />
          <Text style={[
            styles.tabLabel,
            { color: active === 'Settings' ? colors.primary.DEFAULT : colors.text.muted, ...typography.labelSmall },
            active === 'Settings' && styles.tabLabelActive,
          ]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: IS_SMALL_DEVICE ? 12 : 16,
    right: IS_SMALL_DEVICE ? 12 : 16,
    zIndex: 999,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderRadius: 30,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
    minWidth: 52,
  },
  tabLabel: {
    lineHeight: 13,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  centerAction: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -8,
    minWidth: 58,
  },
  centerActionInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapLabel: {
    marginTop: 2,
    lineHeight: 13,
  },
});

export default FloatingBottomNav;