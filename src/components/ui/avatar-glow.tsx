import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

interface AvatarGlowProps {
  source: ImageSourcePropType | string;
  size?: number;
  glowColor?: string;
}

export function AvatarGlow({ source, size = 48, glowColor }: AvatarGlowProps) {
  const colors = useTheme();
  const activeGlowColor = glowColor || colors.primary;

  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.25]) }],
      opacity: interpolate(pulse.value, [0, 1], [0.6, 0.1]),
    };
  });

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: activeGlowColor,
          },
        ]}
      />
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
  glow: {
    position: 'absolute',
  },
  image: {
    borderWidth: 1,
    zIndex: 1,
  },
});
