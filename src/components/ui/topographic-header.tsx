import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface TopographicHeaderProps {
  color?: string;
  triggerKey?: string | number;
}

interface AnimatedWavePathProps {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  duration?: number;
  delay?: number;
  ampX?: number;
  ampY?: number;
  width: number;
  height: number;
}

const AnimatedWavePath: React.FC<AnimatedWavePathProps> = React.memo(({
  d,
  stroke = 'rgba(255, 255, 255, 0.35)',
  strokeWidth = 1.6,
  fill = 'none',
  duration = 4000,
  delay = 0,
  ampX = 6,
  ampY = 6,
  width,
  height,
}) => {
  const transX = useSharedValue(0);
  const transY = useSharedValue(0);

  useEffect(() => {
    transX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(ampX, { duration: duration, easing: Easing.inOut(Easing.quad) }),
          withTiming(-ampX, { duration: duration * 1.15, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    transY.value = withDelay(
      delay * 0.6,
      withRepeat(
        withSequence(
          withTiming(-ampY, { duration: duration * 1.1, easing: Easing.inOut(Easing.sin) }),
          withTiming(ampY, { duration: duration * 0.85, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [delay, duration, ampX, ampY, transX, transY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: transX.value },
      { translateY: transY.value },
    ],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animStyle]} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={d} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
      </Svg>
    </Animated.View>
  );
});

export const TopographicHeader: React.FC<TopographicHeaderProps> = React.memo(({ color, triggerKey }) => {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const systemPrimary = Colors[themeKey].primary;
  const headerColor = color || (themeKey === 'dark' ? '#1b33c7' : systemPrimary);

  const isSmallScreen = height < 760;
  const headerHeight = Math.max(
    Math.round(height * (isSmallScreen ? 0.33 : 0.38)),
    isSmallScreen ? 240 : 320
  );

  const waveBase = headerHeight - Math.min(100, Math.round(headerHeight * 0.28));

  // Exact 100% original design Bezier control point Y values at rest
  const y0 = waveBase + 55;
  const y1 = waveBase - 25;
  const y2 = waveBase - 25;
  const y3 = waveBase + 25;
  const y4 = waveBase + 75;
  const y5 = waveBase + 45;
  const y6 = waveBase - 20;

  // Cubic Bezier math evaluator helper
  const getCubicBezierPoint = (
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    u: number
  ) => {
    'worklet';
    const oneMinusU = 1 - u;
    return (
      oneMinusU * oneMinusU * oneMinusU * p0 +
      3 * oneMinusU * oneMinusU * u * p1 +
      3 * oneMinusU * u * u * p2 +
      u * u * u * p3
    );
  };

  // Get exact baseline original curve (X, Y) for any parameter t in [0, 1]
  const getBaselinePoint = (t: number) => {
    'worklet';
    let x: number;
    let y: number;
    if (t <= 0.48) {
      const u = t / 0.48;
      x = getCubicBezierPoint(0, width * 0.14, width * 0.32, width * 0.48, u);
      y = getCubicBezierPoint(y0, y1, y2, y3, u);
    } else {
      const u = (t - 0.48) / 0.52;
      x = getCubicBezierPoint(width * 0.48, width * 0.62, width * 0.82, width, u);
      y = getCubicBezierPoint(y3, y4, y5, y6, u);
    }
    return { x, y };
  };

  // Traveling Left-to-Right wave progress (0 to 1) - Starts instantly on frame 0 with silk motion
  const waveProgress = useSharedValue(0);

  useEffect(() => {
    waveProgress.value = 0;
    waveProgress.value = withTiming(1, {
      duration: 1800,
      easing: Easing.out(Easing.cubic),
    });
  }, [triggerKey, waveProgress]);

  const NUM_SAMPLES = 32;

  // Animated SVG props for the main solid header background fill with 32 dense spline points
  const animatedFillProps = useAnimatedProps(() => {
    const p = waveProgress.value;

    const sampledPoints = [];
    for (let i = 0; i < NUM_SAMPLES; i++) {
      const t = i / (NUM_SAMPLES - 1);
      const base = getBaselinePoint(t);
      let dy = 0;

      if (p > 0 && p < 1) {
        const envelope = Math.sin(p * Math.PI);
        // Traveling harmonic wave formula: sin(2.2 * 2pi * t - 2.8 * 2pi * p)
        const wavePhase = (t * 2.2 - p * 2.8) * Math.PI * 2;
        dy = Math.sin(wavePhase) * envelope * 20;
      }

      sampledPoints.push({ x: base.x, y: base.y + dy });
    }

    // Construct smooth path with quadratic spline interpolation
    let pathD = `M 0 0 L ${width} 0 L ${sampledPoints[NUM_SAMPLES - 1].x} ${sampledPoints[NUM_SAMPLES - 1].y}`;

    for (let i = NUM_SAMPLES - 1; i > 0; i--) {
      const ptCurr = sampledPoints[i];
      const ptPrev = sampledPoints[i - 1];
      const midX = (ptCurr.x + ptPrev.x) / 2;
      const midY = (ptCurr.y + ptPrev.y) / 2;
      pathD += ` Q ${ptCurr.x} ${ptCurr.y}, ${midX} ${midY}`;
    }

    pathD += ` L ${sampledPoints[0].x} ${sampledPoints[0].y} Z`;

    return { d: pathD };
  });

  // Animated SVG props for the stroke line running along the wave edge with phase offset
  const animatedStrokeProps = useAnimatedProps(() => {
    const p = waveProgress.value;

    const sampledPoints = [];
    for (let i = 0; i < NUM_SAMPLES; i++) {
      const t = i / (NUM_SAMPLES - 1);
      const base = getBaselinePoint(t);
      let dy = 0;

      if (p > 0 && p < 1) {
        const envelope = Math.sin(p * Math.PI);
        const wavePhase = (t * 2.2 - (p - 0.03) * 2.8) * Math.PI * 2;
        dy = Math.sin(wavePhase) * envelope * 20;
      }

      sampledPoints.push({ x: base.x, y: base.y + dy });
    }

    let pathD = `M ${sampledPoints[0].x} ${sampledPoints[0].y}`;

    for (let i = 0; i < NUM_SAMPLES - 1; i++) {
      const ptCurr = sampledPoints[i];
      const ptNext = sampledPoints[i + 1];
      const midX = (ptCurr.x + ptNext.x) / 2;
      const midY = (ptCurr.y + ptNext.y) / 2;
      pathD += ` Q ${ptCurr.x} ${ptCurr.y}, ${midX} ${midY}`;
    }

    pathD += ` L ${sampledPoints[NUM_SAMPLES - 1].x} ${sampledPoints[NUM_SAMPLES - 1].y}`;

    return { d: pathD };
  });

  // Array of 16 distinct, individual wave paths with independent randomized animation parameters
  const waveLines = useMemo(() => [
    // Major S-Curves across the header
    { d: `M -30 25 C ${width * 0.25} -15, ${width * 0.55} 45, ${width * 0.8} 15 C ${width + 10} -10, ${width + 40} 40, ${width + 30} 85`, duration: 4800, delay: 0, ampX: 8, ampY: -6, stroke: 'rgba(255,255,255,0.32)', strokeWidth: 1.6 },
    { d: `M -30 55 C ${width * 0.22} 15, ${width * 0.48} 75, ${width * 0.76} 45 C ${width + 10} 20, ${width + 35} 70, ${width + 30} 115`, duration: 3600, delay: 350, ampX: -7, ampY: 8, stroke: 'rgba(255,255,255,0.38)', strokeWidth: 1.8 },
    { d: `M -30 85 C ${width * 0.2} 45, ${width * 0.42} 105, ${width * 0.72} 75 C ${width * 0.95} 50, ${width + 30} 100, ${width + 30} 145`, duration: 5200, delay: 700, ampX: 9, ampY: -9, stroke: 'rgba(255,255,255,0.28)', strokeWidth: 1.5 },
    { d: `M -30 115 C ${width * 0.18} 75, ${width * 0.38} 135, ${width * 0.32} 205 C ${width * 0.26} 275, ${width * 0.62} 245, ${width + 30} 175`, duration: 4100, delay: 200, ampX: -10, ampY: 7, stroke: 'rgba(255,255,255,0.35)', strokeWidth: 1.7 },
    { d: `M -30 145 C ${width * 0.15} 105, ${width * 0.34} 165, ${width * 0.28} 235 C ${width * 0.22} 305, ${width * 0.58} 275, ${width + 30} 205`, duration: 5800, delay: 900, ampX: 6, ampY: -11, stroke: 'rgba(255,255,255,0.40)', strokeWidth: 1.9 },
    { d: `M -30 175 C ${width * 0.12} 135, ${width * 0.3} 195, ${width * 0.24} 265 C ${width * 0.18} 335, ${width * 0.54} 305, ${width + 30} 235`, duration: 3300, delay: 500, ampX: -8, ampY: 10, stroke: 'rgba(255,255,255,0.30)', strokeWidth: 1.5 },
    { d: `M -30 205 C ${width * 0.08} 165, ${width * 0.26} 225, ${width * 0.2} 295 C ${width * 0.14} 365, ${width * 0.5} 335, ${width + 30} 265`, duration: 4600, delay: 1100, ampX: 7, ampY: -7, stroke: 'rgba(255,255,255,0.36)', strokeWidth: 1.6 },
    { d: `M -30 235 C ${width * 0.05} 195, ${width * 0.22} 255, ${width * 0.16} 325 C ${width * 0.1} 395, ${width * 0.46} 365, ${width + 30} 295`, duration: 6200, delay: 400, ampX: -9, ampY: 6, stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1.4 },

    // Peak 1: Top Right Nested Concentric Ring Loops
    { d: `M ${width * 0.52} 40 C ${width * 0.72} 20, ${width * 0.9} 70, ${width * 0.74} 125 C ${width * 0.55} 170, ${width * 0.4} 95, ${width * 0.52} 40 Z`, duration: 3900, delay: 150, ampX: 11, ampY: -8, stroke: 'rgba(255,255,255,0.42)', strokeWidth: 1.8 },
    { d: `M ${width * 0.56} 55 C ${width * 0.7} 38, ${width * 0.84} 80, ${width * 0.7} 115 C ${width * 0.56} 145, ${width * 0.46} 95, ${width * 0.56} 55 Z`, duration: 4400, delay: 600, ampX: -6, ampY: 9, stroke: 'rgba(255,255,255,0.45)', strokeWidth: 2.0 },
    { d: `M ${width * 0.6} 70 C ${width * 0.68} 56, ${width * 0.78} 90, ${width * 0.68} 108 C ${width * 0.58} 122, ${width * 0.5} 90, ${width * 0.6} 70 Z`, duration: 3100, delay: 850, ampX: 8, ampY: -10, stroke: 'rgba(255,255,255,0.38)', strokeWidth: 1.6 },
    { d: `M ${width * 0.63} 82 C ${width * 0.67} 72, ${width * 0.74} 95, ${width * 0.67} 102 C ${width * 0.6} 110, ${width * 0.55} 92, ${width * 0.63} 82 Z`, duration: 5000, delay: 250, ampX: -10, ampY: 6, stroke: 'rgba(255,255,255,0.48)', strokeWidth: 1.8 },

    // Peak 2: Bottom Right Nested Loops
    { d: `M ${width * 0.68} 185 C ${width * 0.84} 155, ${width * 0.98} 210, ${width * 0.86} 265 C ${width * 0.74} 310, ${width * 0.6} 230, ${width * 0.68} 185 Z`, duration: 4700, delay: 750, ampX: -9, ampY: 11, stroke: 'rgba(255,255,255,0.39)', strokeWidth: 1.8 },
    { d: `M ${width * 0.72} 200 C ${width * 0.82} 175, ${width * 0.94} 220, ${width * 0.84} 255 C ${width * 0.74} 285, ${width * 0.64} 225, ${width * 0.72} 200 Z`, duration: 3700, delay: 100, ampX: 7, ampY: -8, stroke: 'rgba(255,255,255,0.43)', strokeWidth: 1.9 },
    { d: `M ${width * 0.75} 215 C ${width * 0.82} 195, ${width * 0.9} 230, ${width * 0.82} 248 C ${width * 0.74} 265, ${width * 0.68} 220, ${width * 0.75} 215 Z`, duration: 5500, delay: 450, ampX: -6, ampY: 7, stroke: 'rgba(255,255,255,0.35)', strokeWidth: 1.6 },

    // Peak 3: Center Left Organic Loop
    { d: `M ${width * 0.12} 130 C ${width * 0.28} 95, ${width * 0.42} 155, ${width * 0.28} 215 C ${width * 0.14} 260, ${width * 0.02} 175, ${width * 0.12} 130 Z`, duration: 4300, delay: 300, ampX: 10, ampY: -7, stroke: 'rgba(255,255,255,0.37)', strokeWidth: 1.7 },
  ], [width]);

  return (
    <View style={[styles.container, { width, height: headerHeight, backgroundColor: '#FFFFFF' }]}>
      {/* 1-Shot Traveling Left-to-Right Animated Wave Divider */}
      <Svg width={width} height={headerHeight} style={StyleSheet.absoluteFill}>
        <AnimatedPath animatedProps={animatedFillProps} fill={headerColor} />
        <AnimatedPath
          animatedProps={animatedStrokeProps}
          stroke="rgba(255, 255, 255, 0.55)"
          strokeWidth={2.8}
          fill="none"
        />
      </Svg>

      {/* Render 16 independent, non-uniform animated wave paths */}
      {waveLines.map((line, index) => (
        <AnimatedWavePath
          key={`wave-line-${index}`}
          d={line.d}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          duration={line.duration}
          delay={line.delay}
          ampX={line.ampX}
          ampY={line.ampY}
          width={width}
          height={headerHeight}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
