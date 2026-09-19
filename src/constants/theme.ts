/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#1b33c7',
    primaryLight: '#dfe0ff',
    secondary: '#006c49',
    secondaryLight: '#6ffbbe',
    accent: '#694100',
    accentLight: '#ffddb8',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    danger: '#ba1a1a',
    dangerLight: '#ffdad6',

    text: '#131b2e',
    textSecondary: '#444655',
    textMuted: '#757686',

    background: '#faf8ff',
    backgroundElement: '#eaedff',
    backgroundSelected: '#e2e7ff',

    card: '#ffffff',
    cardBorder: '#c5c5d7',
    glowPrimary: 'rgba(27, 51, 199, 0.15)',
    glowSecondary: 'rgba(0, 108, 73, 0.15)',
    glassBackground: 'rgba(255, 255, 255, 0.25)', // More transparent for GlassCard
    glassBorder: 'rgba(255, 255, 255, 0.6)',
    inputBackground: '#ffffff',
    inputBorder: '#c5c5d7',
  },
  // Dark mode is identical to Light mode to lock the theme
  dark: {
    primary: '#1b33c7',
    primaryLight: '#dfe0ff',
    secondary: '#006c49',
    secondaryLight: '#6ffbbe',
    accent: '#694100',
    accentLight: '#ffddb8',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    danger: '#ba1a1a',
    dangerLight: '#ffdad6',

    text: '#131b2e',
    textSecondary: '#444655',
    textMuted: '#757686',

    background: '#faf8ff',
    backgroundElement: '#eaedff',
    backgroundSelected: '#e2e7ff',

    card: '#ffffff',
    cardBorder: '#c5c5d7',
    glowPrimary: 'rgba(27, 51, 199, 0.15)',
    glowSecondary: 'rgba(0, 108, 73, 0.15)',
    glassBackground: 'rgba(255, 255, 255, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
    inputBackground: '#ffffff',
    inputBorder: '#c5c5d7',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  full: 9999,
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#131b2e',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
    default: {
      boxShadow: '0 4px 12px rgba(19, 27, 46, 0.08)',
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#131b2e',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: { elevation: 4 },
    default: {
      boxShadow: '0 10px 24px rgba(19, 27, 46, 0.15)',
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#131b2e',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.22,
      shadowRadius: 32,
    },
    android: { elevation: 8 },
    default: {
      boxShadow: '0 16px 32px rgba(19, 27, 46, 0.22)',
    },
  }),
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
