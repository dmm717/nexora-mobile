import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TouchableScaleProps extends PressableProps {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  activeOpacity?: number;
}

export const TouchableScale: React.FC<TouchableScaleProps> = ({
  scaleTo = 0.96,
  activeOpacity = 0.85,
  style,
  children,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = (e: any) => {
    if (!disabled) {
      scale.set(withSpring(scaleTo, { damping: 15, stiffness: 300 }));
      opacity.set(withSpring(activeOpacity, { damping: 15, stiffness: 300 }));
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!disabled) {
      scale.set(withSpring(1, { damping: 15, stiffness: 300 }));
      opacity.set(withSpring(1, { damping: 15, stiffness: 300 }));
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
};
