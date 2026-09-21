import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ProgressBarProps {
  progress: number | null; // 0-100
  color: string;
  label: string;
  description?: string;
  trackColor?: string;
}

export const ProgressBar = ({ progress, color, label, description, trackColor }: ProgressBarProps) => {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const themeColors = Colors[themeKey];
  
  const [animatedWidth] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (progress !== null) {
      Animated.timing(animatedWidth, {
        toValue: Math.max(0, Math.min(100, progress)),
        duration: 800,
        useNativeDriver: false, // width animation doesn't support native driver
      }).start();
    }
  }, [progress, animatedWidth]);

  const defaultTrackColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  
  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={[styles.value, { color: progress !== null && progress < 60 ? '#D97706' : color }]}>
          {progress !== null ? `${progress}/100` : 'Chưa đủ dữ liệu'}
        </ThemedText>
      </View>
      
      <View style={[styles.track, { backgroundColor: trackColor || defaultTrackColor }]}>
        <Animated.View 
          style={[
            styles.fill, 
            { 
              backgroundColor: progress !== null && progress < 60 ? '#D97706' : color, 
              width: widthInterpolation 
            }
          ]} 
        />
      </View>
      
      {description && (
        <ThemedText style={[styles.description, { color: themeColors.textSecondary }]}>
          {description}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  track: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  description: {
    fontSize: 11,
    marginTop: 2,
  },
});
