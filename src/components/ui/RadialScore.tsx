import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface RadialScoreProps {
  score: number | null;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DIMENSIONS = {
  sm: { radius: 30, strokeWidth: 4, text: 16, subtext: 10 },
  md: { radius: 45, strokeWidth: 6, text: 24, subtext: 12 },
  lg: { radius: 60, strokeWidth: 8, text: 32, subtext: 14 },
};

export const RadialScore = ({ score, label, sublabel, size = 'lg' }: RadialScoreProps) => {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const themeColors = Colors[themeKey];

  const config = DIMENSIONS[size];
  const halfCircle = config.radius + config.strokeWidth;
  const diameter = halfCircle * 2;
  const circumference = 2 * Math.PI * config.radius;
  
  const displayScore = score !== null ? Math.max(0, Math.min(100, score)) : 0;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  let scoreColor: string = themeColors.primary;
  if (score !== null) {
    if (score < 60) scoreColor = '#D97706'; // amber-600
    if (score < 40) scoreColor = '#DC2626'; // red-600
  }

  return (
    <View style={styles.container}>
      <View style={{ width: diameter, height: diameter }}>
        <Svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
          {/* Background Circle */}
          <Circle
            cx={halfCircle}
            cy={halfCircle}
            r={config.radius}
            stroke={colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            strokeWidth={config.strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          {score !== null && (
            <Circle
              cx={halfCircle}
              cy={halfCircle}
              r={config.radius}
              stroke={scoreColor}
              strokeWidth={config.strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${halfCircle} ${halfCircle})`}
            />
          )}
        </Svg>
        
        {/* Score Text inside Circle */}
        <View style={[StyleSheet.absoluteFill, styles.textContainer]}>
          {score !== null ? (
            <ThemedText style={{ fontSize: config.text, fontWeight: 'bold', color: scoreColor }}>
              {displayScore}
            </ThemedText>
          ) : (
            <ThemedText style={{ fontSize: config.text, fontWeight: 'bold', color: themeColors.textSecondary }}>
              --
            </ThemedText>
          )}
        </View>
      </View>

      {/* Labels below */}
      {(label || sublabel) && (
        <View style={styles.labelContainer}>
          {label && (
            <ThemedText style={[styles.label, { color: scoreColor }]}>
              {label}
            </ThemedText>
          )}
          {sublabel && (
            <ThemedText style={[styles.sublabel, { color: themeColors.textSecondary }]}>
              {sublabel}
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
