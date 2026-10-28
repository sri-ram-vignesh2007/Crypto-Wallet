// src/theme/Theme.ts - Apple Style Design System

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const isTablet = SCREEN_WIDTH >= 768;
export const isSmallScreen = SCREEN_WIDTH < 375;

export const scale = Math.min(SCREEN_WIDTH / 375, SCREEN_HEIGHT / 812);
export const moderateScale = (size: number, factor = 0.5) => size + (scale - 1) * size * factor;
export const verticalScale = (size: number) => size * scale;

// ============================================
// LIGHT PALETTE — Apple Style Clean Design
// ============================================
export const lightColors = {
  // Base
  bg: {
    canvas: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#F8FAFC',
    surfaceMuted: '#F1F5F9',
    surfacePressed: '#E2E8F0',
    toString() { return '#FFFFFF'; },
  },

  // Text
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
    onPrimary: '#FFFFFF',
    toString() { return '#0F172A'; },
  },

  // Primary - iOS Blue
  primary: {
    DEFAULT: '#007AFF',
    pressed: '#0056CC',
    muted: '#E5F0FF',
    container: '#E5F0FF',
    onContainer: '#003D99',
    light: '#4DA6FF',
    dark: '#0056CC',
    toString() { return '#007AFF'; },
  },

  // Semantic
  success: {
    DEFAULT: '#34C759',
    light: '#5DD072',
    muted: '#F0FFF4',
    container: '#E8FCEB',
    onContainer: '#1E7A2E',
    toString() { return '#34C759'; },
  },

  danger: {
    DEFAULT: '#FF3B30',
    light: '#FF6B66',
    muted: '#FFF0F0',
    container: '#FFEBEB',
    onContainer: '#9B1B1B',
    toString() { return '#FF3B30'; },
  },

  warning: {
    DEFAULT: '#FF9F0A',
    light: '#FFB340',
    muted: '#FFF8F0',
    container: '#FFF4E6',
    onContainer: '#9A5C00',
    toString() { return '#FF9F0A'; },
  },

  info: {
    DEFAULT: '#007AFF',
    light: '#4DA6FF',
    muted: '#E5F0FF',
    container: '#E5F0FF',
    onContainer: '#003D99',
    toString() { return '#007AFF'; },
  },

  // Borders
  border: {
    subtle: '#E2E8F0',
    DEFAULT: '#CBD5E1',
    strong: '#94A3B8',
    highlight: '#FFFFFF',
    shadow: '#E2E8F0',
    divider: '#E2E8F0',
    toString() { return '#CBD5E1'; },
  },

  // Gradients (subtle)
  gradient: {
    primary: ['#007AFF', '#0056CC'],
    hero: ['#0F172A', '#1E293B'],
    success: ['#34C759', '#28A745'],
    danger: ['#FF3B30', '#E03029'],
    warning: ['#FF9F0A', '#E08900'],
    chatBot: ['#007AFF', '#0056CC'],
  },

  // Claymorphism (minimal)
  clay: {
    overlay: 'rgba(15, 23, 42, 0.25)',
    cardBorderHighlight: '#FFFFFF',
    cardBorderShadow: '#E2E8F0',
  },

  // Shadows - iOS style
  shadow: {
    color: '#000000',
    opacity: 0.08,
    opacityStrong: 0.15,
  },

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayStrong: 'rgba(0, 0, 0, 0.6)',

  // Status
  online: '#34C759',
  offline: '#94A3B8',
  pending: '#FF9F0A',

  // Network colors
  network: {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F3BA2F',
    arbitrum: '#28A0F0',
    base: '#0052FF',
    optimism: '#FF0420',
    avalanche: '#E84142',
    fantom: '#1969FF',
    cronos: '#0038FF',
    solana: '#14F195',
    sepolia: '#627EEA',
  },

  // Backward compatibility
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  surfaceMuted: '#F1F5F9',
  surfacePressed: '#E2E8F0',
  background: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  borderLight: '#E2E8F0',
  borderHighlight: '#FFFFFF',
  borderShadow: '#E2E8F0',
  shadowColor: '#000000',
  primaryMuted: '#E5F0FF',
  warningContainer: '#FFF4E6',
  divider: '#E2E8F0',
};

// ============================================
// DARK PALETTE — Apple Style Dark Mode
// ============================================
export const darkColors = {
  bg: {
    canvas: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    surfaceMuted: '#1C1C1E',
    surfacePressed: '#2C2C2E',
    toString() { return '#000000'; },
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    muted: '#636366',
    inverse: '#000000',
    onPrimary: '#FFFFFF',
    toString() { return '#FFFFFF'; },
  },

  primary: {
    DEFAULT: '#0A84FF',
    pressed: '#007AFF',
    muted: '#1A3A5C',
    container: '#1A3A5C',
    onContainer: '#E5F0FF',
    light: '#64A9FF',
    dark: '#007AFF',
    toString() { return '#0A84FF'; },
  },

  success: {
    DEFAULT: '#30D158',
    light: '#5DD072',
    muted: '#143B1C',
    container: '#143B1C',
    onContainer: '#E8FCEB',
    toString() { return '#30D158'; },
  },

  danger: {
    DEFAULT: '#FF453A',
    light: '#FF6B66',
    muted: '#3B1412',
    container: '#3B1412',
    onContainer: '#FFEBEB',
    toString() { return '#FF453A'; },
  },

  warning: {
    DEFAULT: '#FF9F0A',
    light: '#FFB340',
    muted: '#3B2C00',
    container: '#3B2C00',
    onContainer: '#FFF4E6',
    toString() { return '#FF9F0A'; },
  },

  info: {
    DEFAULT: '#0A84FF',
    light: '#64A9FF',
    muted: '#1A3A5C',
    container: '#1A3A5C',
    onContainer: '#E5F0FF',
    toString() { return '#0A84FF'; },
  },

  border: {
    subtle: '#38383A',
    DEFAULT: '#48484A',
    strong: '#636366',
    highlight: '#38383A',
    shadow: '#000000',
    divider: '#38383A',
    toString() { return '#48484A'; },
  },

  gradient: {
    primary: ['#0A84FF', '#007AFF'],
    hero: ['#1C1C1E', '#2C2C2E'],
    success: ['#30D158', '#28A745'],
    danger: ['#FF453A', '#E03029'],
    warning: ['#FF9F0A', '#E08900'],
    chatBot: ['#0A84FF', '#007AFF'],
  },

  clay: {
    overlay: 'rgba(0, 0, 0, 0.4)',
    cardBorderHighlight: '#38383A',
    cardBorderShadow: '#000000',
  },

  shadow: {
    color: '#000000',
    opacity: 0.25,
    opacityStrong: 0.4,
  },

  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayStrong: 'rgba(0, 0, 0, 0.7)',

  online: '#30D158',
  offline: '#636366',
  pending: '#FF9F0A',

  network: {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F3BA2F',
    arbitrum: '#28A0F0',
    base: '#0052FF',
    optimism: '#FF0420',
    avalanche: '#E84142',
    fantom: '#1969FF',
    cronos: '#0038FF',
    solana: '#14F195',
    sepolia: '#627EEA',
  },

  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  surfaceMuted: '#1C1C1E',
  surfacePressed: '#2C2C2E',
  background: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',
  textInverse: '#000000',
  textOnPrimary: '#FFFFFF',
  borderLight: '#38383A',
  borderHighlight: '#38383A',
  borderShadow: '#000000',
  shadowColor: '#000000',
  primaryMuted: '#1A3A5C',
  warningContainer: '#3B2C00',
  divider: '#38383A',
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
  cardPadding: 20,
  cardGap: 12,
  sectionGap: 24,
  screenPaddingHorizontal: isTablet ? 32 : 20,
  screenPaddingVertical: isTablet ? 24 : 16,
  navHeight: 56,
  tabBarHeight: 56,
  screen: isTablet ? 32 : 16,
  section: 20,
};

// ============================================
// BORDER RADIUS
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
  button: 12,
  buttonLarge: 14,
  card: 16,
  cardLarge: 20,
  clay: 16,
  input: 12,
  chip: 999,
  modal: 20,
  avatar: 999,
  tokenIcon: 16,
};

// ============================================
// SHADOWS — iOS Style
// ============================================
export const shadows = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, elevation: 0, shadowOffset: { width: 0, height: 0 } },
  xs: { shadowColor: '#000000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, shadowOffset: { width: 0, height: 1 } },
  sm: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, shadowOffset: { width: 0, height: 2 } },
  md: { shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, shadowOffset: { width: 0, height: 4 } },
  lg: { shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 16, elevation: 6, shadowOffset: { width: 0, height: 6 } },
  xl: { shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 20, elevation: 8, shadowOffset: { width: 0, height: 8 } },
  inner: { shadowColor: '#000000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 0, shadowOffset: { width: 0, height: 1 } },
};

export const breakpoints = { sm: 375, md: 768, lg: 1024, xl: 1440 };
export const animation = {
  fast: 120, normal: 180, slow: 250, slower: 350,
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: { damping: 16, stiffness: 200 },
    springSoft: { damping: 22, stiffness: 150 },
  },
};
export const zIndex = { base: 0, dropdown: 100, sticky: 200, fixed: 300, modalBackdrop: 400, modal: 500, popover: 600, tooltip: 700, toast: 800, navigation: 900, fab: 1000 };

export const iconSizes = {
  xs: 12, sm: 16, md: 20, lg: 24, xl: 28, xxl: 32, xxxl: 40,
  tab: 24, inline: 20, action: 28, compact: 16, card: 20, header: 22, fab: 24,
};

export const layout = {
  maxContentWidth: '100%',
  cardMaxWidth: 420,
  modalWidth: '92%',
  sidebarWidth: 280,
  headerHeight: 44,
  tabBarHeight: 56,
  searchBarHeight: 44,
  inputHeight: 44,
  buttonHeight: 44,
  buttonHeightLarge: 50,
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
        borderWidth: 1,
        shadow: shadows.sm,
        shadowHover: shadows.md,
      },
      cardProminent: {
        borderRadius: borderRadius.cardLarge,
        padding: spacing.cardPadding,
        backgroundColor: colors.bg.surface,
        borderColor: colors.border.subtle,
        borderWidth: 1,
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
        borderWidth: 1,
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
        dragHandleSize: { width: 36, height: 4 },
        backdropOpacity: 0.4,
      },
    },
  };
}

export type Theme = ReturnType<typeof createTheme>;
export const theme: Theme = createTheme('light');