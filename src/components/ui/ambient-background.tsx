import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export interface AmbientBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ children, style }) => {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {/* Ambient Glow Orbs */}
      <View
        style={[
          styles.orb,
          styles.topRightOrb,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(79, 70, 229, 0.08)',
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.bottomLeftOrb,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(139, 92, 246, 0.10)' : 'rgba(124, 58, 237, 0.06)',
          },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.centerOrb,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(52, 211, 153, 0.06)' : 'rgba(16, 185, 129, 0.04)',
          },
        ]}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  topRightOrb: {
    width: width * 0.75,
    height: width * 0.75,
    top: -width * 0.25,
    right: -width * 0.2,
  },
  bottomLeftOrb: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: -width * 0.2,
    left: -width * 0.25,
  },
  centerOrb: {
    width: width * 0.6,
    height: width * 0.6,
    top: width * 0.6,
    left: width * 0.2,
  },
});
