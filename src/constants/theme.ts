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
    secondaryLight: '#6cf8bb',
    accent: '#384ddc',
    accentLight: '#dae2fd',
    background: '#faf8ff',
    surface: '#ffffff',
    text: '#131b2e',
    textPrimary: '#131b2e',
    textSecondary: '#444655',
    border: '#c5c5d7',
    error: '#ba1a1a',
    errorLight: '#ffdad6',
    warning: '#694100',
    warningLight: '#ffddb8',
    success: '#006c49',
    
    // Web alignment
    backgroundElement: '#eaedff', // surface-container
    backgroundSelected: '#dfe0ff', // primaryLight
    card: '#ffffff',
    cardBorder: '#e2e7ff', // surface-container-high
    glassBackground: '#ffffff', // No glass on web
    glassBorder: '#c5c5d7', // outline-variant
    textMuted: '#757686',
    glowPrimary: 'rgba(27, 51, 199, 0.4)',
    glowSecondary: 'rgba(0, 108, 73, 0.4)',
    danger: '#ba1a1a',
    dangerLight: '#ffdad6',
    inputBorder: '#c5c5d7',
  },
  dark: {
    primary: '#bcc3ff',
    primaryLight: '#3b50df',
    secondary: '#4edea3',
    secondaryLight: '#005236',
    accent: '#bcc3ff',
    accentLight: '#384ddc',
    background: '#131b2e',
    surface: '#283044',
    text: '#eef0ff',
    textPrimary: '#eef0ff',
    textSecondary: '#c5c5d7',
    border: '#757686',
    error: '#ffdad6',
    errorLight: '#93000a',
    warning: '#ffb95f',
    warningLight: '#653e00',
    success: '#4edea3',
    
    backgroundElement: '#283044',
    backgroundSelected: '#3b50df', // primaryLight
    card: '#283044',
    cardBorder: '#444655',
    glassBackground: '#283044',
    glassBorder: '#757686',
    textMuted: '#c5c5d7',
    glowPrimary: 'rgba(188, 195, 255, 0.4)',
    glowSecondary: 'rgba(78, 222, 163, 0.4)',
    danger: '#ffdad6',
    dangerLight: '#93000a',
    inputBorder: '#757686',
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

export const Typography = {
  fontFamily: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  }
};

export const Shadows = Platform.select({
  web: {
    sm: { boxShadow: '0px 1px 2px rgba(19, 27, 46, 0.04)' },
    md: { boxShadow: '0px 10px 26px rgba(19, 27, 46, 0.08)' },
    lg: { boxShadow: '0px 22px 48px rgba(19, 27, 46, 0.12)' },
  },
  default: {
    sm: {
      shadowColor: '#131b2e',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#131b2e',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 26,
      elevation: 5,
    },
    lg: {
      shadowColor: '#131b2e',
      shadowOffset: { width: 0, height: 22 },
      shadowOpacity: 0.12,
      shadowRadius: 48,
      elevation: 10,
    },
  },
})!;

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
