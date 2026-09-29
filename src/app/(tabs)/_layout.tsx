import { ExitConfirmationModal } from '@/components/interview/InterviewSubComponents';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Redirect, Tabs, useRouter } from 'expo-router';
import {
  FileText,
  Home,
  LineChart,
  Mic,
  User,
  Wrench,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from 'react-native-svg';

// ─── Layout constants ─────────────────────────────────────────────────────────
const TAB_BAR_HEIGHT = 60;
/** How high the arch crown rises above the flat top edge. */
const ARCH_RISE = 28;
/** Half-span of the arch. Narrower = more visible hump, still smooth. */
const ARCH_HALF_SPAN = 100;
const ICON_NORMAL = 22;
const ICON_CENTER = 26;
/** Diameter of the circular icon background on the centre tab. */
const CENTER_BTN = 54;

/** Routes that must never appear as visible tab items. */
const HIDDEN_TABS = new Set(['profile']);

// ─── SVG path helpers ─────────────────────────────────────────────────────────
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

// ─── Shimmer centre icon ───────────────────────────────────────────────────────
/**
 * Circular icon button for the centre (interview) tab:
 *   • gradient background (system primary, lighter variant)
 *   • round border
 *   • shimmer shine that runs every 1.5 s
 */
function CenterTabIcon({
  focused,
  iconSize,
}: {
  focused: boolean;
  iconSize: number;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  // Shimmer cycle: 600ms sweep + 900ms pause = 1500ms total
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const x = interpolate(shimmerProgress.value, [0, 0.4, 0.401, 1], [-CENTER_BTN, CENTER_BTN * 1.2, -CENTER_BTN, -CENTER_BTN]);
    const opacity = interpolate(shimmerProgress.value, [0, 0.1, 0.3, 0.4, 0.401, 1], [0, 0.55, 0.55, 0, 0, 0]);
    return { transform: [{ translateX: x }, { skewX: '-18deg' }], opacity };
  });

  // Gradient uses a slightly lighter blue down to the solid primary blue
  const gradStart = '#4d65ff';
  const gradEnd = colors.primary;

  return (
    <View style={{ width: CENTER_BTN, height: CENTER_BTN, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={[
          s.centerBtn,
          {
            width: CENTER_BTN,
            height: CENTER_BTN,
            borderRadius: CENTER_BTN / 2,
            borderWidth: 0,
          },
        ]}
      >
        {/* SVG gradient fill */}
        <Svg width={CENTER_BTN} height={CENTER_BTN} style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgGradient id="ctrGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradStart} />
              <Stop offset="1" stopColor={gradEnd} />
            </SvgGradient>
          </Defs>
          <Circle
            cx={CENTER_BTN / 2}
            cy={CENTER_BTN / 2}
            r={CENTER_BTN / 2}
            fill="url(#ctrGrad)"
          />
        </Svg>

        {/* Premium Shimmer overlay (clipped by overflow: hidden on parent) */}
        <Animated.View
          style={[
            s.shimmerStrip,
            { width: CENTER_BTN * 0.8, height: CENTER_BTN, zIndex: 5 },
            shimmerStyle,
          ]}
        >
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

        {/* Icon with zIndex to render above SVG on Web */}
        <View style={{ zIndex: 10 }}>
          <Mic size={iconSize + 4} color="#ffffff" strokeWidth={2.2} />
        </View>
      </View>
    </View>
  );
}

// ─── MoMo-style tab bar ───────────────────────────────────────────────────────
function MoMoTabBar({ state, descriptors, navigation, insets }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width: W } = useWindowDimensions();

  const bottomPad = Platform.OS === 'web'
    ? Spacing.two
    : Math.max(insets.bottom * 0.5, Spacing.two);

  const barH = TAB_BAR_HEIGHT + bottomPad;
  const wrapperH = barH + ARCH_RISE;

  const bgColor = isDark ? colors.surface : colors.card;
  const border = isDark ? colors.cardBorder : colors.cardBorder;
  const inactive = colors.textMuted;

  const visibleRoutes = state.routes.filter(
    (r: any) => !HIDDEN_TABS.has(r.name),
  );

  return (
    <View style={[s.wrapper, { height: wrapperH }]}>
      {/* ── SVG background ──────────────────────────────────────────────── */}
      <Svg width={W} height={wrapperH} style={StyleSheet.absoluteFill}>
        {/* shadow layer */}
        <Path
          d={barShapePath(W, wrapperH)}
          fill={isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.05)'}
          y={1.5}
        />
        {/* background fill */}
        <Path d={barShapePath(W, wrapperH)} fill={bgColor} />
        {/* top-edge border */}
        <Path
          d={topEdgePath(W)}
          fill="none"
          stroke={border}
          strokeWidth={StyleSheet.hairlineWidth * 2}
        />
      </Svg>

      {/* ── Tab items ───────────────────────────────────────────────────── */}
      {/* The row is strictly the height of the flat tab bar part */}
      <View style={[s.row, { height: barH, paddingBottom: bottomPad }]}>
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const focused = state.routes.indexOf(route) === state.index;
          const isCenter = route.name === 'interview';
          const iconColor = focused ? colors.primary : inactive;
          const iconSize = isCenter ? ICON_CENTER : ICON_NORMAL;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={handlePress}
              style={[s.tabItem]}
            >
              {isCenter ? (
                // Wrapper to fake the size of a normal icon for flex layout
                <View style={{ height: ICON_NORMAL, width: ICON_NORMAL, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                  {/* Absolute position the giant circle so it doesn't push the label down */}
                  <View style={{ position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <CenterTabIcon
                      focused={focused}
                      iconSize={iconSize}
                    />
                  </View>
                </View>
              ) : (
                options.tabBarIcon?.({ color: iconColor, focused, size: iconSize })
              )}
              {isCenter ? null : (
                <ThemedText
                  style={[
                    s.label,
                    {
                      color: iconColor,
                      fontFamily: focused
                        ? Typography.fontFamily.bold
                        : Typography.fontFamily.medium,
                    },
                  ]}
                >
                  {options.title}
                </ThemedText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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

// ─── Root layout ──────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  const handleStay = () => {
    setShowExitModal(false);
    setPendingTarget(null);
  };

  const handleLeave = () => {
    setShowExitModal(false);
    if (pendingTarget) {
      router.push(pendingTarget as any);
      setPendingTarget(null);
    }
  };

  if (isLoading) {
    return (
      <View style={[root.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <>
      <Tabs
        tabBar={(props) => <MoMoTabBar {...props} insets={insets} />}
        screenListeners={({ navigation }) => ({
          tabPress: (e) => {
            const navState = navigation.getState();
            const current = navState.routes[navState.index];
            if (current?.name === 'interview' && current.key !== e.target) {
              e.preventDefault();
              const dest = navState.routes.find((r: any) => r.key === e.target);
              if (dest?.name && dest.name !== 'interview') {
                setPendingTarget(`/(tabs)/${dest.name}`);
                setShowExitModal(true);
              }
            }
          },
        })}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Tổng quan',
            // weight="bold" when active for thicker stroke; regular when inactive
            tabBarIcon: ({ color, focused, size }) => (
              <Home size={size} strokeWidth={focused ? 2.5 : 2} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="cv-jd"
          options={{
            title: 'CV & JD',
            tabBarIcon: ({ color, focused, size }) => (
              <FileText size={size} strokeWidth={focused ? 2.5 : 2} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="interview"
          options={{
            title: 'Phỏng vấn',
            tabBarIcon: ({ color, focused, size }) => (
              <Mic size={size} strokeWidth={focused ? 2.5 : 2} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: 'Luyện tập',
            tabBarIcon: ({ color, focused, size }) => (
              <Wrench size={size} strokeWidth={focused ? 2.5 : 2} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="growth"
          options={{
            title: 'Năng lực',
            tabBarIcon: ({ color, focused, size }) => (
              <LineChart size={size} strokeWidth={focused ? 2.5 : 2} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cá nhân',
            href: null,
            tabBarIcon: ({ color, focused, size }) => (
              <User size={size} strokeWidth={focused ? 2.5 : 2} color={color as string} />
            ),
          }}
        />
      </Tabs>

      <ExitConfirmationModal
        visible={showExitModal}
        colors={colors}
        onStay={handleStay}
        onLeave={handleLeave}
      />
    </>
  );
}

const root = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
