import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface AvatarGlowProps {
  source: ImageSourcePropType | string;
  size?: number;
  glowColor?: string;
}

export function AvatarGlow({ source, size = 48 }: AvatarGlowProps) {
  const colors = useTheme();
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={imageSource as any}
        style={[
          styles.image,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderColor: colors.cardBorder
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderWidth: 1,
  },
});
