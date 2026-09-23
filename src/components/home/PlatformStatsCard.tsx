import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { GlassCard } from '@/components/ui/glass-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function PlatformStatsCard() {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: stats, isLoading } = usePlatformStats();

  if (isLoading) {
    return (
      <GlassCard style={cardStyles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </GlassCard>
    );
  }

  const interviewCount = stats?.completedInterviewCount ?? 0;
  const cvCount = stats?.completedCvAnalysisCount ?? 0;
  const avgRating = stats?.averageRating ? stats.averageRating.toFixed(1) : '5.0';
  const userCount = stats?.userCount ?? 0;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
      <GlassCard style={cardStyles.container}>
        {/* Title Header */}
        <View style={cardStyles.headerRow}>
          <View style={cardStyles.headerLeft}>
            <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
            <ThemedText style={cardStyles.headerTitle}>Thống Kê Nền Tảng Realtime</ThemedText>
          </View>
          <View style={[cardStyles.liveBadge, { backgroundColor: colors.success ? `${colors.success}20` : '#d1fae5' }]}>
            <View style={[cardStyles.dot, { backgroundColor: colors.secondary || '#10b981' }]} />
            <ThemedText style={[cardStyles.liveText, { color: colors.secondary || '#047857' }]}>TRỰC TUYẾN</ThemedText>
          </View>
        </View>

        {/* 4 Metrics Grid */}
        <View style={cardStyles.grid}>
          <View style={[cardStyles.metricItem, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <Ionicons name="mic-outline" size={20} color={colors.primary} />
            <ThemedText style={cardStyles.metricValue}>{interviewCount.toLocaleString('vi-VN')}</ThemedText>
            <ThemedText style={[cardStyles.metricLabel, { color: colors.textSecondary }]}>Lượt Phỏng Vấn</ThemedText>
          </View>

          <View style={[cardStyles.metricItem, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <Ionicons name="document-text-outline" size={20} color={colors.secondary} />
            <ThemedText style={cardStyles.metricValue}>{cvCount.toLocaleString('vi-VN')}</ThemedText>
            <ThemedText style={[cardStyles.metricLabel, { color: colors.textSecondary }]}>Phân Tích CV</ThemedText>
          </View>

          <View style={[cardStyles.metricItem, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <Ionicons name="star-outline" size={20} color="#f59e0b" />
            <ThemedText style={cardStyles.metricValue}>{avgRating} ⭐</ThemedText>
            <ThemedText style={[cardStyles.metricLabel, { color: colors.textSecondary }]}>Đánh Giá AI</ThemedText>
          </View>

          <View style={[cardStyles.metricItem, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <Ionicons name="people-outline" size={20} color={colors.accent} />
            <ThemedText style={cardStyles.metricValue}>{userCount.toLocaleString('vi-VN')}</ThemedText>
            <ThemedText style={[cardStyles.metricLabel, { color: colors.textSecondary }]}>Ứng Viên Đồng Hành</ThemedText>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    marginVertical: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricItem: {
    width: '47.5%',
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
