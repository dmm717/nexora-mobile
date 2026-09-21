import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/use-theme';


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
          boxShadow: '0px 10px 26px rgba(19, 27, 46, 0.08)',
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
