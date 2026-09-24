import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/utils/career-goal-contract';

export interface PlanUsageStatsGridProps {
  /** Start date string or ISO timestamp */
  startsAt?: string | null;
  /** End date string or ISO timestamp */
  endsAt?: string | null;
  /** Number of AI quota units consumed */
  consumed?: number | null;
  /** Total AI quota limit allocated */
  limit?: number | null;
  /** Available remaining AI quota units */
  available?: number | null;
  /** Outer container style override */
  style?: StyleProp<ViewStyle>;
  /** Individual metric box style override */
  boxStyle?: StyleProp<ViewStyle>;
}

export const PlanUsageStatsGrid = React.memo<PlanUsageStatsGridProps>(({
  startsAt,
  endsAt,
  consumed,
  limit,
  available,
  style,
  boxStyle,
}) => {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const startsAtText = formatDate(startsAt);
  const endsAtText = endsAt ? formatDate(endsAt) : 'Không thời hạn';
  const usedText = `${consumed || 0} / ${limit == null ? 'Không giới hạn' : limit}`;
  const availableText = available != null ? `${available}` : 'Không giới hạn';

  const metrics = [
    { label: 'NGÀY BẮT ĐẦU', value: startsAtText },
    { label: 'NGÀY HẾT HẠN', value: endsAtText },
    { label: 'ĐÃ SỬ DỤNG', value: usedText },
    { label: 'KHẢ DỤNG CÒN LẠI', value: availableText },
  ];

  return (
    <View style={[styles.grid, style]}>
      {metrics.map((m, i) => (
        <View
          key={i}
          style={[
            styles.metricBox,
            { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
            boxStyle,
          ]}
        >
          <ThemedText style={styles.metricLabel}>{m.label}</ThemedText>
          <ThemedText style={styles.metricValue}>{m.value}</ThemedText>
        </View>
      ))}
    </View>
  );
});

PlanUsageStatsGrid.displayName = 'PlanUsageStatsGrid';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricBox: {
    width: '48%',
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.6,
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
