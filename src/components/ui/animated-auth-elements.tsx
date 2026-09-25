import React, { useEffect } from 'react';
import { View, StyleSheet, TextStyle, ViewStyle, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';

interface StaggeredTitleProps {
  text: string;
  style?: TextStyle;
  letterDelay?: number;
  triggerKey?: string | number;
}

interface StaggeredLetterProps {
  char: string;
  globalIndex: number;
  letterDelay: number;
  style?: TextStyle;
  triggerKey?: string | number;
}

const StaggeredLetter: React.FC<StaggeredLetterProps> = React.memo(({
  char,
  globalIndex,
  letterDelay,
  style,
  triggerKey,
}) => {
  const translateY = useSharedValue(-24);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = -24;
    opacity.value = 0;

    const delay = globalIndex * letterDelay;
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 14,
        stiffness: 120,
        mass: 0.8,
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) })
    );
  }, [globalIndex, letterDelay, triggerKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={style}>{char}</Text>
    </Animated.View>
  );
});

export const StaggeredTitle: React.FC<StaggeredTitleProps> = React.memo(({
  text,
  style,
  letterDelay = 45,
  triggerKey,
}) => {
  const words = text.split(' ');
  let currentGlobalIndex = 0;

  return (
    <View style={styles.titleRow}>
      {words.map((word, wordIndex) => {
        const letters = word.split('');
        const startIndex = currentGlobalIndex;
        currentGlobalIndex += letters.length;

        return (
          <View key={`word-${wordIndex}-${word}-${triggerKey ?? ''}`} style={styles.wordRow}>
            {letters.map((char, letterIndex) => {
              const globalIndex = startIndex + letterIndex;
              return (
                <StaggeredLetter
                  key={`let-${globalIndex}-${char}-${triggerKey ?? ''}`}
                  char={char}
                  globalIndex={globalIndex}
                  letterDelay={letterDelay}
                  style={style}
                  triggerKey={triggerKey}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
});

interface CenterExpandViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle | (ViewStyle | false | undefined)[];
  triggerKey?: string | number;
}

export const CenterExpandView: React.FC<CenterExpandViewProps> = React.memo(({
  children,
  delay = 0,
  style,
  triggerKey,
}) => {
  const scaleX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scaleX.value = 0;
    opacity.value = 0;

    scaleX.value = withDelay(
      delay,
      withTiming(1, {
        duration: 480,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    );

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) })
    );
  }, [delay, triggerKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleX: scaleX.value }],
  }));

  return (
    <Animated.View style={[{ width: '100%' }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    marginRight: 8,
  },
});
