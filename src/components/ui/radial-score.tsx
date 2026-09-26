import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface RadialScoreProps {
  score: number | null;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg' | number;
  strokeWidth?: number;
}

export const RadialScore: React.FC<RadialScoreProps> = ({
  score,
  label,
  sublabel,
  size = 110,
  strokeWidth,
}) => {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  let numericSize = 110;
  let computedStrokeWidth = strokeWidth ?? 9;

  if (typeof size === 'string') {
    if (size === 'sm') {
      numericSize = 68;
      computedStrokeWidth = strokeWidth ?? 5;
    } else if (size === 'md') {
      numericSize = 96;
      computedStrokeWidth = strokeWidth ?? 7;
    } else {
      // lg
      numericSize = 120;
      computedStrokeWidth = strokeWidth ?? 9;
    }
  } else {
    numericSize = size;
  }

  const isValidScore =
    typeof score === 'number' &&
    !Number.isNaN(score) &&
    score !== null &&
    score !== undefined;

  const radius = (numericSize - computedStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isValidScore
    ? circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference
    : circumference;

  const scoreColor = !isValidScore
    ? colors.cardBorder
    : score >= 80
      ? colors.accent
      : score < 50
        ? colors.danger
        : colors.primary;

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { width: numericSize, height: numericSize }]}>
        <Svg width={numericSize} height={numericSize} style={styles.svg}>
          {/* Background track */}
          <Circle
            cx={numericSize / 2}
            cy={numericSize / 2}
            r={radius}
            stroke={colors.cardBorder}
            strokeWidth={computedStrokeWidth}
            fill="none"
          />
          {/* Progress ring */}
          {isValidScore && (
            <Circle
              cx={numericSize / 2}
              cy={numericSize / 2}
              r={radius}
              stroke={scoreColor}
              strokeWidth={computedStrokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              origin={`${numericSize / 2}, ${numericSize / 2}`}
              rotation="-90"
            />
          )}
        </Svg>

        <View style={styles.innerContent}>
          {isValidScore ? (
            <>
              <ThemedText style={[styles.scoreText, { color: colors.text, fontSize: numericSize > 90 ? 26 : 18 }]}>
                {Math.round(score)}
              </ThemedText>
              <ThemedText style={styles.maxText}>/100</ThemedText>
            </>
          ) : (
            <ThemedText style={styles.nullText}>Chưa đủ dữ liệu</ThemedText>
          )}
        </View>
      </View>

      {(label || sublabel) && (
        <View style={styles.labelContainer}>
          {label && (
            <ThemedText style={[styles.label, { color: scoreColor }]}>
              {label}
            </ThemedText>
          )}
          {sublabel && (
            <ThemedText style={[styles.sublabel, { color: colors.textSecondary }]}>
              {sublabel}
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
};

export const RadialScoreRing = RadialScore;

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
  maxText: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
  },
  nullText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
    opacity: 0.7,
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
