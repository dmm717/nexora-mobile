import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface AnimatedHandTriggerProps {
  size?: number;
}

export function AnimatedHandTrigger({ size = 22 }: AnimatedHandTriggerProps) {
  const colors = useTheme();

  // Continuous looping 60fps tap gesture pulse animation
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0.92, { duration: 350, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: 250 })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 400 }),
        withTiming(2, { duration: 400 }),
        withTiming(0, { duration: 200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={[styles.wrapper, { width: size, height: size }]} pointerEvents="none">
      <Animated.View style={[styles.container, animatedStyle]}>
        <Ionicons name="hand-left-outline" size={size * 0.8} color={colors.primary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
