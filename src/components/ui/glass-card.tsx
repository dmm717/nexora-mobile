import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassCardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  withBorder?: boolean;
  intensity?: 'light' | 'medium' | 'heavy'; // Kept for prop compatibility
  hasGlow?: boolean;
  glowColor?: string;
  borderColor?: string;
}

export function GlassCard({
  children,
  style,
  withBorder = true,
  intensity = 'medium',
  hasGlow,
  glowColor,
  borderColor,
  ...props
}: GlassCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = useTheme();

  return (
    <View
      style={[
        {
          shadowColor: hasGlow && glowColor ? glowColor : colors.text,
          shadowOffset: { width: 0, height: hasGlow ? 8 : 2 },
          shadowOpacity: hasGlow ? 0.3 : (isDark ? 0.2 : 0.04),
          shadowRadius: hasGlow ? 16 : 8,
          elevation: hasGlow ? 10 : 2,
          backgroundColor: colors.card,
          borderColor: borderColor || (withBorder ? colors.cardBorder : 'transparent'),
          borderWidth: withBorder || borderColor ? 1 : 0,
        },
        styles.container,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16, // Matched web rounding
    padding: 20,
    overflow: 'hidden',
  },
});
