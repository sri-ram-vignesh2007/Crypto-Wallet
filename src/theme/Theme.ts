// src/theme/Theme.ts - Pure Apple iPhone Human Interface Design System

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const isTablet = SCREEN_WIDTH >= 768;
export const isSmallScreen = SCREEN_WIDTH < 375;

export const scale = Math.min(SCREEN_WIDTH / 375, SCREEN_HEIGHT / 812);
export const moderateScale = (size: number, factor = 0.5) => size + (scale - 1) * size * factor;
export const verticalScale = (size: number) => size * scale;

// ============================================
// LIGHT PALETTE — Institutional Solid Fintech
// ============================================
export const lightColors = {
  // Base
  bg: {
    canvas: '#F8FAFC',           // Off White (#F8FAFC)
    surface: '#FFFFFF',          // Pure White
    surfaceElevated: '#FFFFFF',  // Elevated Card
    surfaceMuted: '#F1F5F9',     // Muted Surface
    surfacePressed: '#E2E8F0',   // Border Grey pressed state
    toString() { return '#F8FAFC'; },
  },

  // Text
  text: {
    primary: '#111827',          // Midnight Navy (#111827)
    secondary: '#64748B',        // Slate (#64748B)
    muted: '#94A3B8',            // Light Slate
    inverse: '#FFFFFF',
    onPrimary: '#FFFFFF',
    toString() { return '#111827'; },
  },

  // Primary - Forest Green (#166B52)
  primary: {
    DEFAULT: '#166B52',
    pressed: '#0F4C3A',
    muted: '#E6F4EA',
    container: '#E6F4EA',
    onContainer: '#166B52',
    light: '#2E8B6E',
    dark: '#0F4C3A',
    toString() { return '#166B52'; },
  },

  // Semantic
  success: {
    DEFAULT: '#166B52',          // Muted Forest Green
    light: '#2E8B6E',
    muted: '#E6F4EA',
    container: '#E6F4EA',
    onContainer: '#166B52',
    toString() { return '#166B52'; },
  },

  danger: {
    DEFAULT: '#DC2626',          // Professional Red
    light: '#EF4444',
    muted: '#FEF2F2',
    container: '#FEF2F2',
    onContainer: '#991B1B',
    toString() { return '#DC2626'; },
  },

  warning: {
    DEFAULT: '#D97706',          // Restrained Amber
    light: '#F59E0B',
    muted: '#FFFBEB',
    container: '#FFFBEB',
    onContainer: '#92400E',
    toString() { return '#D97706'; },
  },

  info: {
    DEFAULT: '#2563EB',          // Muted Blue
    light: '#3B82F6',
    muted: '#EFF6FF',
    container: '#EFF6FF',
    onContainer: '#1D4ED8',
    toString() { return '#2563EB'; },
  },

  // Borders
  border: {
    subtle: '#E2E8F0',           // Border Grey (#E2E8F0)
    DEFAULT: '#CBD5E1',
    strong: '#94A3B8',
    highlight: '#FFFFFF',
    shadow: '#E2E8F0',
    divider: '#E2E8F0',
    toString() { return '#E2E8F0'; },
  },

  // Gradients (Subtle flat depth)
  gradient: {
    primary: ['#166B52', '#0F4C3A'],
    hero: ['#FFFFFF', '#F8FAFC'],
    success: ['#166B52', '#0F4C3A'],
    danger: ['#DC2626', '#B91C1C'],
    warning: ['#D97706', '#B45309'],
    chatBot: ['#1F2937', '#111827'],
  },

  // Clay / Shadow
  clay: {
    overlay: 'rgba(0, 0, 0, 0.02)',
    cardBorderHighlight: '#FFFFFF',
    cardBorderShadow: '#E2E8F0',
  },

  shadow: {
    color: '#111827',
    opacity: 0.04,
    opacityStrong: 0.08,
  },

  overlay: 'rgba(17, 24, 39, 0.4)',
  overlayStrong: 'rgba(17, 24, 39, 0.7)',

  online: '#166B52',
  offline: '#94A3B8',
  pending: '#D97706',

  network: {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F0B90B',
    arbitrum: '#28A0F0',
    base: '#0052FF',
    optimism: '#FF0420',
    avalanche: '#E84142',
    fantom: '#1969FF',
    cronos: '#002D74',
    solana: '#14F195',
    sepolia: '#627EEA',
  },

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfacePressed: '#E2E8F0',
  background: '#F8FAFC',
  textPrimary: '#111827',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  borderLight: '#E2E8F0',
  borderHighlight: '#FFFFFF',
  borderShadow: '#E2E8F0',
  shadowColor: '#111827',
  primaryMuted: '#E6F4EA',
  warningContainer: '#FFFBEB',
  divider: '#E2E8F0',
};

// ============================================
// DARK PALETTE — Deep Charcoal & Graphite Institutional
// ============================================
export const darkColors = {
  bg: {
    canvas: '#171C24',           // Deep Charcoal (#171C24)
    surface: '#1F2937',          // Graphite (#1F2937)
    surfaceElevated: '#283548',  // Elevated Graphite
    surfaceMuted: '#111827',     // Midnight Navy (#111827)
    surfacePressed: '#374151',
    toString() { return '#171C24'; },
  },

  text: {
    primary: '#FFFFFF',          // Solid White
    secondary: '#94A3B8',        // Slate Light
    muted: '#64748B',            // Slate (#64748B)
    inverse: '#111827',
    onPrimary: '#FFFFFF',
    toString() { return '#FFFFFF'; },
  },

  primary: {
    DEFAULT: '#166B52',          // Forest Green (#166B52)
    pressed: '#0F4C3A',
    muted: 'rgba(22, 107, 82, 0.2)',
    container: 'rgba(22, 107, 82, 0.25)',
    onContainer: '#34D399',
    light: '#2E8B6E',
    dark: '#0F4C3A',
    toString() { return '#166B52'; },
  },

  success: {
    DEFAULT: '#10B981',          // Muted Green (Solid, non-neon)
    light: '#34D399',
    muted: 'rgba(16, 185, 129, 0.15)',
    container: 'rgba(16, 185, 129, 0.15)',
    onContainer: '#34D399',
    toString() { return '#10B981'; },
  },

  danger: {
    DEFAULT: '#EF4444',          // Professional Red
    light: '#F87171',
    muted: 'rgba(239, 68, 68, 0.15)',
    container: 'rgba(239, 68, 68, 0.15)',
    onContainer: '#F87171',
    toString() { return '#EF4444'; },
  },

  warning: {
    DEFAULT: '#F59E0B',          // Restrained Amber
    light: '#FBBF24',
    muted: 'rgba(245, 158, 11, 0.15)',
    container: 'rgba(245, 158, 11, 0.15)',
    onContainer: '#FBBF24',
    toString() { return '#F59E0B'; },
  },

  info: {
    DEFAULT: '#3B82F6',          // Muted Blue
    light: '#60A5FA',
    muted: 'rgba(59, 130, 246, 0.15)',
    container: 'rgba(59, 130, 246, 0.15)',
    onContainer: '#60A5FA',
    toString() { return '#3B82F6'; },
  },

  border: {
    subtle: '#2A3441',           // Subtle Slate/Graphite Border
    DEFAULT: '#374151',          // Standard Border
    strong: '#4B5563',
    highlight: '#374151',
    shadow: '#111827',
    divider: '#2A3441',
    toString() { return '#2A3441'; },
  },

  gradient: {
    primary: ['#166B52', '#0F4C3A'],
    hero: ['#1F2937', '#171C24'],
    success: ['#10B981', '#166B52'],
    danger: ['#EF4444', '#DC2626'],
    warning: ['#F59E0B', '#D97706'],
    chatBot: ['#1F2937', '#111827'],
  },

  clay: {
    overlay: 'rgba(255, 255, 255, 0.02)',
    cardBorderHighlight: '#2A3441',
    cardBorderShadow: '#111827',
  },

  shadow: {
    color: '#000000',
    opacity: 0.25,
    opacityStrong: 0.45,
  },

  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayStrong: 'rgba(0, 0, 0, 0.85)',

  online: '#10B981',
  offline: '#64748B',
  pending: '#F59E0B',

  network: {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F0B90B',
    arbitrum: '#28A0F0',
    base: '#0052FF',
    optimism: '#FF0420',
    avalanche: '#E84142',
    fantom: '#1969FF',
    cronos: '#002D74',
    solana: '#14F195',
    sepolia: '#627EEA',
  },

  surface: '#1F2937',
  surfaceElevated: '#283548',
  surfaceMuted: '#111827',
  surfacePressed: '#374151',
  background: '#171C24',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#111827',
  textOnPrimary: '#FFFFFF',
  borderLight: '#2A3441',
  borderHighlight: '#374151',
  borderShadow: '#111827',
  shadowColor: '#000000',
  primaryMuted: 'rgba(22, 107, 82, 0.2)',
  warningContainer: 'rgba(245, 158, 11, 0.15)',
  divider: '#2A3441',
};

// ============================================
// TYPOGRAPHY — SF Pro / System Font
// ============================================
export const typography = {
  displayLarge: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41, letterSpacing: -0.8 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.6 },

  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.6 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.4 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26, letterSpacing: -0.3 },
  h4: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22, letterSpacing: -0.2 },

  bodyLarge: { fontSize: 17, fontWeight: '400' as const, lineHeight: 24, letterSpacing: -0.2 },
  bodyMedium: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22, letterSpacing: -0.1 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, letterSpacing: 0 },

  labelLarge: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22, letterSpacing: -0.1 },
  labelMedium: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 0 },
  labelSmall: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.2 },

  numberDisplay: { fontSize: 40, fontWeight: '700' as const, lineHeight: 48, letterSpacing: -1.0, fontVariant: ['tabular-nums'] as any },
  numberLarge: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.8, fontVariant: ['tabular-nums'] as any },
  numberMedium: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.4, fontVariant: ['tabular-nums'] as any },
  numberSmall: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22, letterSpacing: -0.2, fontVariant: ['tabular-nums'] as any },

  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, letterSpacing: 0 },
  micro: { fontSize: 10, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 0.2 },
};

// ============================================
// SPACING — 4pt Grid
// ============================================
export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32,
  10: 40, 12: 48, 14: 56, 16: 64, 20: 80, 24: 96,
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 48,
  cardPadding: 16,
  cardGap: 12,
  sectionGap: 24,
  screenPaddingHorizontal: isTablet ? 32 : 16,
  screenPaddingVertical: isTablet ? 24 : 16,
  navHeight: 56,
  tabBarHeight: 60,
  screen: isTablet ? 32 : 16,
  section: 20,
};

// ============================================
// BORDER RADIUS — Apple Continuous Squircle
// ============================================
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
  full: 999,
  button: 14,
  buttonLarge: 16,
  card: 16,
  cardLarge: 20,
  clay: 16,
  input: 12,
  chip: 999,
  modal: 24,
  avatar: 999,
  tokenIcon: 18,
};

// ============================================
// SHADOWS — Apple iOS Style
// ============================================
export const shadows = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, elevation: 0, shadowOffset: { width: 0, height: 0 } },
  xs: { shadowColor: '#000000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1, shadowOffset: { width: 0, height: 1 } },
  sm: { shadowColor: '#000000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, shadowOffset: { width: 0, height: 2 } },
  md: { shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, shadowOffset: { width: 0, height: 3 } },
  lg: { shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 16, elevation: 6, shadowOffset: { width: 0, height: 6 } },
  xl: { shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 20, elevation: 8, shadowOffset: { width: 0, height: 8 } },
  inner: { shadowColor: '#000000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 0, shadowOffset: { width: 0, height: 1 } },
};

export const breakpoints = { sm: 375, md: 768, lg: 1024, xl: 1440 };
export const animation = {
  fast: 120, normal: 200, slow: 300, slower: 400,
  easing: {
    standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: { damping: 18, stiffness: 220 },
    springSoft: { damping: 24, stiffness: 160 },
  },
};
export const zIndex = { base: 0, dropdown: 100, sticky: 200, fixed: 300, modalBackdrop: 400, modal: 500, popover: 600, tooltip: 700, toast: 800, navigation: 900, fab: 1000 };

export const iconSizes = {
  xs: 12, sm: 16, md: 20, lg: 24, xl: 28, xxl: 32, xxxl: 40,
  tab: 24, inline: 20, action: 26, compact: 16, card: 20, header: 22, fab: 24,
};

export const layout = {
  maxContentWidth: '100%',
  cardMaxWidth: 440,
  modalWidth: '92%',
  sidebarWidth: 280,
  headerHeight: 44,
  tabBarHeight: 60,
  searchBarHeight: 44,
  inputHeight: 48,
  buttonHeight: 48,
  buttonHeightLarge: 52,
  chipHeight: 32,
  screen: isTablet ? 32 : 16,
  avatarSizes: { xs: 26, sm: 34, md: 42, lg: 54, xl: 66, xxl: 82 },
};

// ============================================
// RISK STATES
// ============================================
export const riskStates = {
  normal: {
    bg: 'info.muted',
    border: 'info.DEFAULT',
    icon: 'info',
    iconColor: 'info.DEFAULT',
    textColor: 'text.primary',
    primaryActionEnabled: true,
    primaryActionLabel: 'Confirm',
    findings: ['Transaction appears safe and valid.', 'Network gas fees are within standard ranges.'],
    description: 'This transaction follows all standard security parameters.',
    technicalDetails: 'Standard EVM transfer / interaction. Gas parameters verified.',
  },
  attention: {
    bg: 'warning.muted',
    border: 'warning.DEFAULT',
    icon: 'alertTriangle',
    iconColor: 'warning.DEFAULT',
    textColor: 'text.primary',
    primaryActionEnabled: true,
    primaryActionLabel: 'Continue',
    requiresAcknowledgement: true,
    findings: ['Recipient address has limited transaction history.', 'Amount exceeds typical single transaction average.'],
    description: 'Please review recipient address and transfer amount carefully before confirming.',
    technicalDetails: 'Interaction with unverified contract or new address. Caution advised.',
  },
  highRisk: {
    bg: 'danger.muted',
    border: 'danger.DEFAULT',
    icon: 'shieldAlert',
    iconColor: 'danger.DEFAULT',
    textColor: 'text.primary',
    primaryActionEnabled: false,
    primaryActionLabel: 'I understand, continue',
    requiresExplicitConfirm: true,
    findings: ['High risk: Address flagged in community threat database.', 'Potential honeypot or drainer contract pattern detected.'],
    description: 'Transferring to this address could lead to irreversible loss of funds.',
    technicalDetails: 'Known phishing address pattern or signature request with malicious permissions.',
  },
  high: {
    bg: 'danger.muted',
    border: 'danger.DEFAULT',
    icon: 'shieldAlert',
    iconColor: 'danger.DEFAULT',
    textColor: 'text.primary',
    primaryActionEnabled: false,
    primaryActionLabel: 'I understand, continue',
    requiresExplicitConfirm: true,
    findings: ['High risk: Address flagged in community threat database.', 'Potential honeypot or drainer contract pattern detected.'],
    description: 'Transferring to this address could lead to irreversible loss of funds.',
    technicalDetails: 'Known phishing address pattern or signature request with malicious permissions.',
  },
} as const;

type ColorToken<T> = T & string;

function wrapColors<T extends typeof lightColors | typeof darkColors>(c: T) {
  return {
    ...c,
    text: c.text as unknown as ColorToken<T['text']>,
    primary: c.primary as unknown as ColorToken<T['primary']>,
    border: c.border as unknown as ColorToken<T['border']>,
    bg: c.bg as unknown as ColorToken<T['bg']>,
    success: c.success as unknown as ColorToken<T['success']>,
    danger: c.danger as unknown as ColorToken<T['danger']>,
    warning: c.warning as unknown as ColorToken<T['warning']>,
    info: c.info as unknown as ColorToken<T['info']>,
  };
}

export const colors = wrapColors(lightColors);

export type ColorScheme = 'light' | 'dark' | 'system';

export function createTheme(colorScheme: ColorScheme = 'light') {
  const colors = wrapColors(colorScheme === 'dark' ? darkColors : lightColors);
  return {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    breakpoints,
    animation,
    zIndex,
    iconSizes,
    layout,
    riskStates,
    isDark: colorScheme === 'dark',
    isTablet,
    isSmallScreen,
    scale,
    moderateScale,
    verticalScale,
    components: {
      button: {
        height: layout.buttonHeight,
        heightLarge: layout.buttonHeightLarge,
        borderRadius: borderRadius.button,
        borderRadiusLarge: borderRadius.buttonLarge,
        paddingHorizontal: spacing.lg,
        paddingHorizontalLarge: spacing.xl,
        gradient: colors.gradient.primary,
        dangerGradient: colors.gradient.danger,
      },
      card: {
        borderRadius: borderRadius.card,
        padding: spacing.cardPadding,
        backgroundColor: colors.bg.surface,
        borderColor: colors.border.subtle,
        borderWidth: 0.5,
        shadow: shadows.sm,
        shadowHover: shadows.md,
      },
      cardProminent: {
        borderRadius: borderRadius.cardLarge,
        padding: spacing.cardPadding,
        backgroundColor: colors.bg.surface,
        borderColor: colors.border.subtle,
        borderWidth: 0.5,
        shadow: shadows.md,
        shadowHover: shadows.lg,
      },
      input: {
        height: layout.inputHeight,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.bg.surfaceElevated,
        borderColor: colors.border.DEFAULT,
        borderWidth: 0.5,
      },
      chip: {
        height: layout.chipHeight,
        borderRadius: borderRadius.chip,
        paddingHorizontal: spacing.md,
      },
      modal: {
        width: layout.modalWidth,
        borderRadius: borderRadius.modal,
        padding: spacing.xl,
        shadow: shadows.xl,
      },
      tabBar: {
        height: layout.tabBarHeight,
        paddingHorizontal: spacing.md,
        itemSpacing: spacing.xs,
      },
      avatar: layout.avatarSizes,
      fab: {
        size: 56,
        borderRadius: 28,
        shadow: shadows.lg,
      },
      bottomSheet: {
        borderRadius: borderRadius.modal,
        dragHandleSize: { width: 36, height: 5 },
        backdropOpacity: 0.4,
      },
    },
  };
}

export type Theme = ReturnType<typeof createTheme>;
export const theme: Theme = createTheme('light');
