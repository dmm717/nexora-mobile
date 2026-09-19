import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const colors = useTheme();

  // Mapping based on Web design (M3 style badges)
  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryLight || '#dfe0ff', text: colors.primary || '#1b33c7' };
      case 'secondary':
        return { bg: colors.secondaryLight || '#6ffbbe', text: colors.secondary || '#006c49' };
      case 'success':
        return { bg: '#d1fae5', text: '#047857' }; // emerald-100 / emerald-700
      case 'warning':
        return { bg: '#fef3c7', text: '#b45309' }; // amber-100 / amber-700
      case 'error':
        return { bg: colors.dangerLight || '#ffdad6', text: colors.danger || '#ba1a1a' };
      case 'info':
        return { bg: '#e0e7ff', text: '#4338ca' }; // indigo-100 / indigo-700
      case 'neutral':
      default:
        return { bg: colors.backgroundElement || '#eaedff', text: colors.textSecondary || '#444655' };
    }
  };

  const getSizeStyles = (): { paddingVertical: number; paddingHorizontal: number; fontSize: number } => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 2, paddingHorizontal: 8, fontSize: 10 };
      case 'lg':
        return { paddingVertical: 6, paddingHorizontal: 16, fontSize: 14 };
      case 'md':
      default:
        return { paddingVertical: 4, paddingHorizontal: 12, fontSize: 12 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.bg,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderColor: variantStyles.border || 'transparent',
          borderWidth: variantStyles.border ? 1 : 0,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: variantStyles.text,
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999, // Pill shape
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
