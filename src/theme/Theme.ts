// src/theme/Theme.ts - Pure Apple iPhone Human Interface Design System

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const isTablet = SCREEN_WIDTH >= 768;
export const isSmallScreen = SCREEN_WIDTH < 375;

export const scale = Math.min(SCREEN_WIDTH / 375, SCREEN_HEIGHT / 812);
export const moderateScale = (size: number, factor = 0.5) => size + (scale - 1) * size * factor;
export const verticalScale = (size: number) => size * scale;

// ============================================
// LIGHT PALETTE — Strict Monochrome Fintech
// ============================================
export const lightColors = {
  // Base
  bg: {
    canvas: '#FFFFFF',           // Primary background: #FFFFFF
    surface: '#FFFFFF',          // Card background: #FFFFFF
    surfaceElevated: '#F7F7F7',  // Secondary background: #F7F7F7
    surfaceMuted: '#F2F2F2',     // Disabled background: #F2F2F2
    surfacePressed: '#EEEEEE',   // Dividers: #EEEEEE
    toString() { return '#FFFFFF'; },
  },

  // Text
  text: {
    primary: '#111111',          // Primary text: #111111
    secondary: '#666666',        // Secondary text: #666666
    muted: '#999999',            // Tertiary text: #999999
    inverse: '#FFFFFF',
    onPrimary: '#FFFFFF',
    toString() { return '#111111'; },
  },

  // Primary - Black (#111111)
  primary: {
    DEFAULT: '#111111',
    pressed: '#333333',
    muted: '#F2F2F2',
    container: '#F7F7F7',
    onContainer: '#111111',
    light: '#444444',
    dark: '#000000',
    toString() { return '#111111'; },
  },

  // Semantic (Monochrome status with restrained danger)
  success: {
    DEFAULT: '#111111',
    light: '#444444',
    muted: '#F2F2F2',
    container: '#F7F7F7',
    onContainer: '#111111',
    toString() { return '#111111'; },
  },

  danger: {
    DEFAULT: '#DC2626',          // Restrained Red (safety only)
    light: '#EF4444',
    muted: '#FEF2F2',
    container: '#FEF2F2',
    onContainer: '#991B1B',
    toString() { return '#DC2626'; },
  },

  warning: {
    DEFAULT: '#666666',          // Monochrome Warning
    light: '#888888',
    muted: '#F2F2F2',
    container: '#F7F7F7',
    onContainer: '#111111',
    toString() { return '#666666'; },
  },

  info: {
    DEFAULT: '#111111',
    light: '#444444',
    muted: '#F2F2F2',
    container: '#F7F7F7',
    onContainer: '#111111',
    toString() { return '#111111'; },
  },

  // Borders & Dividers
  border: {
    subtle: '#EEEEEE',           // Dividers: #EEEEEE
    DEFAULT: '#E5E5E5',          // Borders: #E5E5E5
    strong: '#CCCCCC',
    highlight: '#FFFFFF',
    shadow: '#EEEEEE',
    divider: '#EEEEEE',
    toString() { return '#E5E5E5'; },
  },

  // Flat Monochrome Depth
  gradient: {
    primary: ['#111111', '#111111'],
    hero: ['#FFFFFF', '#F7F7F7'],
    success: ['#111111', '#111111'],
    danger: ['#DC2626', '#DC2626'],
    warning: ['#666666', '#666666'],
    chatBot: ['#111111', '#111111'],
  },

  clay: {
    overlay: 'rgba(0, 0, 0, 0.02)',
    cardBorderHighlight: '#FFFFFF',
    cardBorderShadow: '#E5E5E5',
  },

  shadow: {
    color: '#000000',
    opacity: 0.03,
    opacityStrong: 0.06,
  },

  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayStrong: 'rgba(0, 0, 0, 0.7)',

  online: '#111111',
  offline: '#999999',
  pending: '#666666',

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
  surfaceElevated: '#F7F7F7',
  surfaceMuted: '#F2F2F2',
  surfacePressed: '#EEEEEE',
  background: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textMuted: '#999999',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  borderLight: '#E5E5E5',
  borderHighlight: '#FFFFFF',
  borderShadow: '#E5E5E5',
  shadowColor: '#000000',
  primaryMuted: '#F2F2F2',
  warningContainer: '#F7F7F7',
  divider: '#EEEEEE',
};

// ============================================
// DARK PALETTE — Strict Monochrome Fintech
// ============================================
export const darkColors = {
  bg: {
    canvas: '#000000',           // Primary background: #000000
    surface: '#171717',          // Card background: #171717
    surfaceElevated: '#202020',  // Elevated surface: #202020
    surfaceMuted: '#101010',     // Secondary background: #101010
    surfacePressed: '#262626',   // Dividers: #262626
    toString() { return '#000000'; },
  },

  text: {
    primary: '#FFFFFF',          // Primary text: #FFFFFF
    secondary: '#B3B3B3',        // Secondary text: #B3B3B3
    muted: '#858585',            // Tertiary text: #858585
    inverse: '#000000',
    onPrimary: '#000000',
    toString() { return '#FFFFFF'; },
  },

  primary: {
    DEFAULT: '#FFFFFF',          // Primary button: #FFFFFF
    pressed: '#E5E5E5',
    muted: '#202020',
    container: '#171717',
    onContainer: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#E5E5E5',
    toString() { return '#FFFFFF'; },
  },

  success: {
    DEFAULT: '#FFFFFF',          // Monochrome Checkmark
    light: '#FFFFFF',
    muted: '#202020',
    container: '#171717',
    onContainer: '#FFFFFF',
    toString() { return '#FFFFFF'; },
  },

  danger: {
    DEFAULT: '#EF4444',          // Restrained Red (safety only)
    light: '#F87171',
    muted: '#3B1818',
    container: '#2A1212',
    onContainer: '#F87171',
    toString() { return '#EF4444'; },
  },

  warning: {
    DEFAULT: '#B3B3B3',          // Monochrome Warning
    light: '#CCCCCC',
    muted: '#202020',
    container: '#171717',
    onContainer: '#FFFFFF',
    toString() { return '#B3B3B3'; },
  },

  info: {
    DEFAULT: '#FFFFFF',
    light: '#FFFFFF',
    muted: '#202020',
    container: '#171717',
    onContainer: '#FFFFFF',
    toString() { return '#FFFFFF'; },
  },

  border: {
    subtle: '#262626',           // Dividers: #262626
    DEFAULT: '#303030',          // Borders: #303030
    strong: '#404040',
    highlight: '#303030',
    shadow: '#000000',
    divider: '#262626',
    toString() { return '#303030'; },
  },

  gradient: {
    primary: ['#FFFFFF', '#FFFFFF'],
    hero: ['#171717', '#101010'],
    success: ['#FFFFFF', '#FFFFFF'],
    danger: ['#EF4444', '#EF4444'],
    warning: ['#B3B3B3', '#B3B3B3'],
    chatBot: ['#171717', '#101010'],
  },

  clay: {
    overlay: 'rgba(255, 255, 255, 0.02)',
    cardBorderHighlight: '#303030',
    cardBorderShadow: '#000000',
  },

  shadow: {
    color: '#000000',
    opacity: 0.3,
    opacityStrong: 0.5,
  },

  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayStrong: 'rgba(0, 0, 0, 0.9)',

  online: '#FFFFFF',
  offline: '#858585',
  pending: '#B3B3B3',

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

  surface: '#171717',
  surfaceElevated: '#202020',
  surfaceMuted: '#101010',
  surfacePressed: '#262626',
  background: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#858585',
  textInverse: '#000000',
  textOnPrimary: '#000000',
  borderLight: '#303030',
  borderHighlight: '#303030',
  borderShadow: '#000000',
  shadowColor: '#000000',
  primaryMuted: '#202020',
  warningContainer: '#171717',
  divider: '#262626',
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
