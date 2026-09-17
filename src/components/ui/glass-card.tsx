import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassCardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  withBorder?: boolean;
  intensity?: 'light' | 'medium' | 'heavy'; // Reserved for future blur intensity expansion
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
        styles.container,
        {
          backgroundColor: colors.glassBackground,
          borderColor: borderColor || (withBorder ? colors.glassBorder : 'transparent'),
          borderWidth: withBorder || borderColor ? 1 : 0,
          shadowColor: hasGlow && glowColor ? glowColor : colors.text,
          shadowOffset: { width: 0, height: hasGlow ? 8 : 4 },
          shadowOpacity: hasGlow ? 0.3 : (isDark ? 0.2 : 0.05),
          shadowRadius: hasGlow ? 16 : 12,
          elevation: hasGlow ? 10 : 5,
        },
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
    borderRadius: 24, // Modern large border radius
    padding: 20,
    overflow: 'hidden',
  },
});
