/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#4F46E5',
    primaryLight: 'rgba(79, 70, 229, 0.1)',
    secondary: '#7C3AED',
    secondaryLight: 'rgba(124, 58, 237, 0.1)',
    accent: '#10B981',
    accentLight: 'rgba(16, 185, 129, 0.1)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    danger: '#EF4444',
    dangerLight: 'rgba(239, 68, 68, 0.1)',

    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',

    card: '#FFFFFF',
    cardBorder: 'rgba(226, 232, 240, 0.8)',
    glowPrimary: 'rgba(79, 70, 229, 0.15)',
    glowSecondary: 'rgba(124, 58, 237, 0.15)',
    glassBackground: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    inputBackground: '#F8FAFC',
    inputBorder: '#E2E8F0',
  },
  dark: {
    primary: '#6366F1',
    primaryLight: 'rgba(99, 102, 241, 0.18)',
    secondary: '#8B5CF6',
    secondaryLight: 'rgba(139, 92, 246, 0.18)',
    accent: '#34D399',
    accentLight: 'rgba(52, 211, 153, 0.18)',
    warning: '#FBBF24',
    warningLight: 'rgba(251, 191, 36, 0.18)',
    danger: '#F87171',
    dangerLight: 'rgba(248, 113, 113, 0.18)',

    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    background: '#090D16',
    backgroundElement: '#131A29',
    backgroundSelected: '#1E293B',

    card: '#131A29',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    glowPrimary: 'rgba(99, 102, 241, 0.25)',
    glowSecondary: 'rgba(139, 92, 246, 0.25)',
    glassBackground: 'rgba(19, 26, 41, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    inputBackground: '#0F172A',
    inputBorder: '#1E293B',
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
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    default: {
      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: { elevation: 4 },
    default: {
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
    default: {
      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
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
