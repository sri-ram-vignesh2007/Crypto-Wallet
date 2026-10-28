// src/theme/ThemeContext.tsx
// Theme Context Provider for light/dark mode support

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { createTheme, Theme, ColorScheme } from './Theme';

type ThemeContextType = {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('light');
  const [theme, setTheme] = useState<Theme>(() => createTheme('light'));

  // Initialize from system or stored preference
  useEffect(() => {
    const stored = Appearance.getColorScheme();
    const initial: ColorScheme = (stored === 'dark') ? 'dark' : 'light';
    setColorSchemeState(initial);
    setTheme(createTheme(initial === 'dark' ? 'dark' : 'light'));
  }, []);

  // Listen for system changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (colorScheme === 'system') {
        const s: ColorScheme = (newScheme === 'dark') ? 'dark' : 'light';
        setColorSchemeState(s);
        setTheme(createTheme(s === 'dark' ? 'dark' : 'light'));
      }
    });
    return () => subscription.remove();
  }, [colorScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    setTheme(createTheme(scheme === 'dark' ? 'dark' : 'light'));
    // Could persist to AsyncStorage here
  }, []);

  const toggleTheme = useCallback(() => {
    const newScheme: ColorScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  }, [colorScheme, setColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hooks for specific theme values
export function useColors() {
  return useTheme().theme.colors;
}

export function useTypography() {
  return useTheme().theme.typography;
}

export function useSpacing() {
  return useTheme().theme.spacing;
}

export function useBorderRadius() {
  return useTheme().theme.borderRadius;
}

export function useShadows() {
  return useTheme().theme.shadows;
}

export function useLayout() {
  return useTheme().theme.layout;
}

export function useAnimation() {
  return useTheme().theme.animation;
}

export function useZIndex() {
  return useTheme().theme.zIndex;
}

export function useIconSizes() {
  return useTheme().theme.iconSizes;
}

export function useComponents() {
  return useTheme().theme.components;
}

export function useIsDark() {
  return useTheme().theme.isDark;
}

export function useScale() {
  return useTheme().theme.scale;
}

export function useModerateScale() {
  return useTheme().theme.moderateScale;
}

export function useVerticalScale() {
  return useTheme().theme.verticalScale;
}

// Responsive value helper
export function useResponsiveValue<T>(values: { base: T; sm?: T; md?: T; lg?: T; xl?: T }): T {
  const { theme } = useTheme();
  const { isTablet, isSmallScreen } = theme;
  const { breakpoints } = theme;
  
  // This is a simplified version - in practice you'd use useWindowDimensions
  if (isTablet && values.lg) return values.lg;
  if (values.md && !isSmallScreen) return values.md;
  return values.base;
}

// Re-export all tokens and constants for direct consumption in StyleSheet.create
export {
  spacing,
  borderRadius,
  shadows,
  typography,
  colors,
  lightColors,
  darkColors,
  theme,
  riskStates,
  layout,
  iconSizes,
  breakpoints,
  zIndex,
  animation,
  scale,
  moderateScale,
  verticalScale,
  isTablet,
  isSmallScreen,
  createTheme,
} from './Theme';
export type { Theme, ColorScheme } from './Theme';