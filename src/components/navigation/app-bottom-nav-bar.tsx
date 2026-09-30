import React, { useEffect } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { Home, FileText, Mic, Wrench, LineChart } from 'lucide-react-native';
import Svg, { Circle, Defs, Path, Rect, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
export type TabId = 'home' | 'cv-jd' | 'interview' | 'practice' | 'growth' | 'profile';
interface AppBottomNavBarProps {
  activeTab?: TabId | 'none';
}
// ─── Layout constants ─────────────────────────────────────────────────────────
export const TAB_BAR_HEIGHT = 60;
export const ARCH_RISE = 28;
export const ARCH_HALF_SPAN = 100;
export const ICON_NORMAL = 22;
export const ICON_CENTER = 26;
export const CENTER_BTN = 54;
export function useAppBottomNavBarHeight() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? Spacing.two : Math.max(insets.bottom * 0.5, Spacing.two);
  return TAB_BAR_HEIGHT + bottomPad + ARCH_RISE;
}
function barShapePath(w: number, h: number): string {
  const cx = w / 2;
  const lx = cx - ARCH_HALF_SPAN;
  const rx = cx + ARCH_HALF_SPAN;
  const cp1 = ARCH_HALF_SPAN * 0.5;
  const cp2 = ARCH_HALF_SPAN * 0.4;
  return [
    `M 0 ${ARCH_RISE}`,
    `L ${lx} ${ARCH_RISE}`,
    `C ${lx + cp1} ${ARCH_RISE} ${cx - cp2} 0 ${cx} 0`,
    `C ${cx + cp2} 0 ${rx - cp1} ${ARCH_RISE} ${rx} ${ARCH_RISE}`,
    `L ${w} ${ARCH_RISE}`,
    `L ${w} ${h}`,
    `L 0 ${h}`,
    `Z`,
  ].join(' ');
}
function topEdgePath(w: number): string {
  const cx = w / 2;
  const lx = cx - ARCH_HALF_SPAN;
  const rx = cx + ARCH_HALF_SPAN;
  const cp1 = ARCH_HALF_SPAN * 0.5;
  const cp2 = ARCH_HALF_SPAN * 0.4;
  return [
    `M 0 ${ARCH_RISE}`,
    `L ${lx} ${ARCH_RISE}`,
    `C ${lx + cp1} ${ARCH_RISE} ${cx - cp2} 0 ${cx} 0`,
    `C ${cx + cp2} 0 ${rx - cp1} ${ARCH_RISE} ${rx} ${ARCH_RISE}`,
    `L ${w} ${ARCH_RISE}`,
  ].join(' ');
}
function CenterTabIcon({ focused, iconSize }: { focused: boolean; iconSize: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shimmerProgress = useSharedValue(0);
  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);
  const shimmerStyle = useAnimatedStyle(() => {
    const x = interpolate(shimmerProgress.value, [0, 0.4, 0.401, 1], [-CENTER_BTN, CENTER_BTN * 1.2, -CENTER_BTN, -CENTER_BTN]);
    const opacity = interpolate(shimmerProgress.value, [0, 0.1, 0.3, 0.4, 0.401, 1], [0, 0.55, 0.55, 0, 0, 0]);
    return { transform: [{ translateX: x }, { skewX: '-18deg' }], opacity };
  });
  const gradStart = '#4d65ff';
  const gradEnd = colors.primary;
  return (
    <View style={{ width: CENTER_BTN, height: CENTER_BTN, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={[
          s.centerBtn,
          { width: CENTER_BTN, height: CENTER_BTN, borderRadius: CENTER_BTN / 2, borderWidth: 0 },
        ]}
      >
        <Svg width={CENTER_BTN} height={CENTER_BTN} style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgGradient id="ctrGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradStart} />
              <Stop offset="1" stopColor={gradEnd} />
            </SvgGradient>
          </Defs>
          <Circle cx={CENTER_BTN / 2} cy={CENTER_BTN / 2} r={CENTER_BTN / 2} fill="url(#ctrGrad)" />
        </Svg>
        <Animated.View style={[s.shimmerStrip, { width: CENTER_BTN * 0.8, height: CENTER_BTN, zIndex: 5 }, shimmerStyle]}>
          <Svg width="100%" height="100%">
            <Defs>
              <SvgGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.6" />
                <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#shimmer)" />
          </Svg>
        </Animated.View>
        <View style={{ zIndex: 10 }}>
          <Mic size={iconSize + 4} color="#ffffff" strokeWidth={2.2} />
        </View>
      </View>
    </View>
  );
}
export function AppBottomNavBar({ activeTab = 'none' }: AppBottomNavBarProps) {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width: W } = useWindowDimensions();
  const isInsideTabs = (segments as string[]).includes('(tabs)') || (typeof pathname === 'string' && pathname.startsWith('/(tabs)'));
  if (isInsideTabs) {
    return null;
  }
  const bottomPad = Platform.OS === 'web' ? Spacing.two : Math.max(insets.bottom * 0.5, Spacing.two);
  const barH = TAB_BAR_HEIGHT + bottomPad;
  const wrapperH = barH + ARCH_RISE;
  const bgColor = isDark ? colors.surface : colors.card;
  const border = isDark ? colors.cardBorder : colors.cardBorder;
  const inactive = colors.textMuted;
  const tabs: {
    id: TabId;
    title: string;
    route: string;
    IconComponent: any;
  }[] = [
    { id: 'home', title: 'Tổng quan', route: '/(tabs)/home', IconComponent: Home },
    { id: 'cv-jd', title: 'CV & JD', route: '/(tabs)/cv-jd', IconComponent: FileText },
    { id: 'interview', title: 'Phỏng vấn', route: '/(tabs)/interview', IconComponent: Mic },
    { id: 'practice', title: 'Luyện tập', route: '/(tabs)/practice', IconComponent: Wrench },
    { id: 'growth', title: 'Năng lực', route: '/(tabs)/growth', IconComponent: LineChart },
  ];
  return (
    <View style={[s.wrapper, { height: wrapperH }]}>
      <Svg width={W} height={wrapperH} style={StyleSheet.absoluteFill}>
        <Path d={barShapePath(W, wrapperH)} fill={isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.05)'} y={1.5} />
        <Path d={barShapePath(W, wrapperH)} fill={bgColor} />
        <Path d={topEdgePath(W)} fill="none" stroke={border} strokeWidth={StyleSheet.hairlineWidth * 2} />
      </Svg>
      <View style={[s.row, { height: barH, paddingBottom: bottomPad }]}>
        {tabs.map((tab) => {
          const focused = activeTab === tab.id;
          const isCenter = tab.id === 'interview';
          const iconColor = focused ? colors.primary : inactive;
          const iconSize = isCenter ? ICON_CENTER : ICON_NORMAL;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => router.replace(tab.route as any)}
              style={[s.tabItem]}
            >
              {isCenter ? (
                <View style={{ height: ICON_NORMAL, width: ICON_NORMAL, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                  <View style={{ position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <CenterTabIcon focused={focused} iconSize={iconSize} />
                  </View>
                </View>
              ) : (
                <tab.IconComponent size={iconSize} strokeWidth={focused ? 2.5 : 2} color={iconColor} />
              )}
              {isCenter ? null : (
                <ThemedText
                  style={[
                    s.label,
                    {
                      color: iconColor,
                      fontFamily: focused ? Typography.fontFamily.bold : Typography.fontFamily.medium,
                    },
                  ]}
                >
                  {tab.title}
                </ThemedText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  row: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  centerBtn: {
    overflow: 'hidden',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmerStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  label: {
    fontSize: Typography.sizes.xs,
  },
});