// src/theme/Theme.ts - Pure Apple iPhone Human Interface Design System

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const isTablet = SCREEN_WIDTH >= 768;
export const isSmallScreen = SCREEN_WIDTH < 375;

export const scale = Math.min(SCREEN_WIDTH / 375, SCREEN_HEIGHT / 812);
export const moderateScale = (size: number, factor = 0.5) => size + (scale - 1) * size * factor;
export const verticalScale = (size: number) => size * scale;

// ============================================
// LIGHT PALETTE — Apple iOS Human Interface
// ============================================
export const lightColors = {
  // Base
  bg: {
    canvas: '#F2F2F7',           // Apple System Grouped Background
    surface: '#FFFFFF',          // Apple Secondary System Background / Inset Card
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#E5E5EA',
    surfacePressed: '#E5E5EA',
    toString() { return '#F2F2F7'; },
  },

  // Text
  text: {
    primary: '#000000',          // iOS Primary Label
    secondary: '#6C6C70',        // iOS Secondary Label
    muted: '#8E8E93',            // iOS Tertiary Label
    inverse: '#FFFFFF',
    onPrimary: '#FFFFFF',
    toString() { return '#000000'; },
  },

  // Primary - Official Apple iOS Blue
  primary: {
    DEFAULT: '#007AFF',
    pressed: '#0056CC',
    muted: '#E5F1FF',
    container: '#E5F1FF',
    onContainer: '#007AFF',
    light: '#4DA6FF',
    dark: '#0056CC',
    toString() { return '#007AFF'; },
  },

  // Semantic
  success: {
    DEFAULT: '#34C759',
    light: '#5DD072',
    muted: '#EBF9EE',
    container: '#EBF9EE',
    onContainer: '#248A3D',
    toString() { return '#34C759'; },
  },

  danger: {
    DEFAULT: '#FF3B30',
    light: '#FF6B66',
    muted: '#FEECEB',
    container: '#FEECEB',
    onContainer: '#D70015',
    toString() { return '#FF3B30'; },
  },

  warning: {
    DEFAULT: '#FF9500',
    light: '#FFB340',
    muted: '#FFF4E5',
    container: '#FFF4E5',
    onContainer: '#C97700',
    toString() { return '#FF9500'; },
  },

  info: {
    DEFAULT: '#007AFF',
    light: '#4DA6FF',
    muted: '#E5F1FF',
    container: '#E5F1FF',
    onContainer: '#0056CC',
    toString() { return '#007AFF'; },
  },

  // Borders
  border: {
    subtle: '#E5E5EA',
    DEFAULT: '#D1D1D6',
    strong: '#8E8E93',
    highlight: '#FFFFFF',
    shadow: '#E5E5EA',
    divider: '#E5E5EA',
    toString() { return '#E5E5EA'; },
  },

  // Gradients
  gradient: {
    primary: ['#007AFF', '#0056CC'],
    hero: ['#F2F2F7', '#E5E5EA'],
    success: ['#34C759', '#248A3D'],
    danger: ['#FF3B30', '#D70015'],
    warning: ['#FF9500', '#C97700'],
    chatBot: ['#007AFF', '#0056CC'],
  },

  // Clay / Shadow
  clay: {
    overlay: 'rgba(0, 0, 0, 0.04)',
    cardBorderHighlight: '#FFFFFF',
    cardBorderShadow: '#E5E5EA',
  },

  shadow: {
    color: '#000000',
    opacity: 0.04,
    opacityStrong: 0.08,
  },

  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayStrong: 'rgba(0, 0, 0, 0.5)',

  online: '#34C759',
  offline: '#8E8E93',
  pending: '#FF9500',

  network: {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F0B90B',
    arbitrum: '#28A0F0',
    base: '#007AFF',
    optimism: '#FF3B30',
    avalanche: '#E84142',
    fantom: '#5856D6',
    cronos: '#007AFF',
    solana: '#AF52DE',
    sepolia: '#627EEA',
  },

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#E5E5EA',
  surfacePressed: '#E5E5EA',
  background: '#F2F2F7',
  textPrimary: '#000000',
  textSecondary: '#6C6C70',
  textMuted: '#8E8E93',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  borderLight: '#E5E5EA',
  borderHighlight: '#FFFFFF',
  borderShadow: '#E5E5EA',
  shadowColor: '#000000',
  primaryMuted: '#E5F1FF',
  warningContainer: '#FFF4E5',
  divider: '#E5E5EA',
};

// ============================================
// DARK PALETTE — Institutional Obsidian & Neon Emerald / Surgical Cyan
// ============================================
export const darkColors = {
  bg: {
    canvas: '#0B0B0C',           // Deep obsidian black base
    surface: '#121316',          // Rich midnight slate
    surfaceElevated: '#1A1C22',  // Dimensional slate
    surfaceMuted: '#16171B',
    surfacePressed: '#22252D',
    toString() { return '#0B0B0C'; },
  },

  text: {
    primary: '#FFFFFF',          // Razor sharp label
    secondary: '#8E8E93',        // Secondary label
    muted: '#636366',            // Tertiary label
    inverse: '#0B0B0C',
    onPrimary: '#0B0B0C',
    toString() { return '#FFFFFF'; },
  },

  primary: {
    DEFAULT: '#00F0FF',          // Surgical Cyan Blue
    pressed: '#00B8CC',
    muted: 'rgba(0, 240, 255, 0.12)',
    container: 'rgba(0, 240, 255, 0.12)',
    onContainer: '#00F0FF',
    light: '#66F6FF',
    dark: '#00A3B3',
    toString() { return '#00F0FF'; },
  },

  success: {
    DEFAULT: '#00F5A0',          // Hyper-saturated Neon Emerald Green
    light: '#5DFFC5',
    muted: 'rgba(0, 245, 160, 0.14)',
    container: 'rgba(0, 245, 160, 0.14)',
    onContainer: '#00F5A0',
    toString() { return '#00F5A0'; },
  },

  danger: {
    DEFAULT: '#FF453A',
    light: '#FF6B66',
    muted: '#3D1514',
    container: '#3D1514',
    onContainer: '#FF453A',
    toString() { return '#FF453A'; },
  },

  warning: {
    DEFAULT: '#FF9F0A',
    light: '#FFB340',
    muted: '#3B2605',
    container: '#3B2605',
    onContainer: '#FF9F0A',
    toString() { return '#FF9F0A'; },
  },

  info: {
    DEFAULT: '#0A84FF',
    light: '#64A9FF',
    muted: '#0F2744',
    container: '#0F2744',
    onContainer: '#64A9FF',
    toString() { return '#0A84FF'; },
  },

  border: {
    subtle: '#2C2C2E',
    DEFAULT: '#38383A',
    strong: '#636366',
    highlight: '#38383A',
    shadow: '#000000',
    divider: '#2C2C2E',
    toString() { return '#2C2C2E'; },
  },

  gradient: {
    primary: ['#0A84FF', '#007AFF'],
    hero: ['#1C1C1E', '#2C2C2E'],
    success: ['#30D158', '#248A3D'],
    danger: ['#FF453A', '#D70015'],
    warning: ['#FF9F0A', '#C97700'],
    chatBot: ['#0A84FF', '#007AFF'],
  },

  clay: {
    overlay: 'rgba(255, 255, 255, 0.05)',
    cardBorderHighlight: '#2C2C2E',
    cardBorderShadow: '#000000',
  },

  shadow: {
    color: '#000000',
    opacity: 0.2,
    opacityStrong: 0.35,
  },

  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayStrong: 'rgba(0, 0, 0, 0.8)',

  online: '#30D158',
  offline: '#636366',
  pending: '#FF9F0A',

  network: {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    bsc: '#F0B90B',
    arbitrum: '#28A0F0',
    base: '#007AFF',
    optimism: '#FF3B30',
    avalanche: '#E84142',
    fantom: '#5856D6',
    cronos: '#007AFF',
    solana: '#AF52DE',
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
  borderLight: '#2C2C2E',
  borderHighlight: '#38383A',
  borderShadow: '#000000',
  shadowColor: '#000000',
  primaryMuted: '#0F2744',
  warningContainer: '#3B2605',
  divider: '#2C2C2E',
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
