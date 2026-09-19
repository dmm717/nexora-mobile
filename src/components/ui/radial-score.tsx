import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface RadialScoreProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  trackColor?: string;
}

export function RadialScoreRing({
  score,
  size = 110,
  strokeWidth = 8,
  primaryColor,
  trackColor,
}: RadialScoreProps) {
  const colors = useTheme();
  const mainColor = primaryColor || colors.primary || '#1b33c7';
  const bgTrackColor = trackColor || colors.backgroundElement || '#eaedff';

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated display score (starts at 0 on mount and animates smoothly to target score)
  const [displayScore, setDisplayScore] = useState<number>(0);
  const targetScore = score != null ? Math.min(Math.max(score, 0), 100) : 0;

  useEffect(() => {
    if (score == null) {
      setDisplayScore(0);
      return;
    }

    let startTime: number | null = null;
    const duration = 1000; // 1 second duration

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out curve for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeOut * targetScore);

      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [score, targetScore]);

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bgTrackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress Arc Circle */}
          {score != null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={mainColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          )}
        </svg>

        <View style={styles.innerTextContainer}>
          {score != null ? (
            <View style={styles.scoreRow}>
              <ThemedText style={[styles.scoreNumber, { color: colors.textPrimary }]}>
                {displayScore}
              </ThemedText>
              <ThemedText style={[styles.scoreTotal, { color: colors.textSecondary }]}>
                /100
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={[styles.noDataText, { color: colors.textSecondary }]}>
              --
            </ThemedText>
          )}
        </View>
      </View>
    );
  }

  // Pure React Native fallback (iOS / Android)
  const percent = displayScore / 100;
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgTrackColor,
        },
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: mainColor,
            borderTopColor: percent > 0.1 ? mainColor : 'transparent',
            borderRightColor: percent > 0.35 ? mainColor : 'transparent',
            borderBottomColor: percent > 0.6 ? mainColor : 'transparent',
            borderLeftColor: percent > 0.85 ? mainColor : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />

      <View style={styles.innerTextContainer}>
        {score != null ? (
          <View style={styles.scoreRow}>
            <ThemedText style={[styles.scoreNumber, { color: colors.textPrimary }]}>
              {displayScore}
            </ThemedText>
            <ThemedText style={[styles.scoreTotal, { color: colors.textSecondary }]}>
              /100
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[styles.noDataText, { color: colors.textSecondary }]}>
            --
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  innerTextContainer: {
    ...(StyleSheet.absoluteFill as any),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
    lineHeight: 34,
  },
  scoreTotal: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 2,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
  },
});
