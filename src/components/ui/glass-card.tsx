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
  ...props
}: GlassCardProps) {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: withBorder ? colors.cardBorder : 'transparent',
          borderWidth: withBorder ? 1 : 0,
          shadowColor: '#131b2e',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 26,
          elevation: 5,
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
    borderRadius: 16, // Matched web rounding
    padding: 20,
    overflow: 'hidden',
  },
});
