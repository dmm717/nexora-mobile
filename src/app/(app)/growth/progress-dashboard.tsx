import React from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { growthApi } from '@/api/growth.api';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from './progress-dashboard.styles';

export default function ProgressDashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: dashboard, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['progress-dashboard'],
    queryFn: growthApi.getProgressDashboard,
  });

  const readiness = dashboard?.readiness;
  const hasReadinessScore = readiness?.score !== null && readiness?.score !== undefined;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableScale onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableScale>
          <ThemedText type="title" style={styles.title}>Tổng Quan Tiến Độ & Readiness</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {isLoading ? (
            <View style={{ gap: 16 }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : isError || !dashboard ? (
            <GlassCard style={{ alignItems: 'center', padding: Spacing.four }}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.8 }}>Không thể tải bảng tổng quan tiến độ.</ThemedText>
            </GlassCard>
          ) : (
            <>
              {/* Readiness Score Card */}
              <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="speedometer-outline" size={22} color={colors.primary} />
                  </View>
                  <ThemedText type="subtitle" style={styles.cardTitle}>Chỉ Số Sẵn Sàng Phỏng Vấn (Readiness)</ThemedText>
                </View>

                <View style={styles.readinessBox}>
                  {hasReadinessScore ? (
                    <View style={styles.scoreCircle}>
                      <ThemedText style={[styles.scoreNumber, { color: colors.primary }]}>{readiness.score}</ThemedText>
                      <ThemedText style={styles.scoreMax}>/100</ThemedText>
                    </View>
                  ) : (
                    <View style={styles.nullScoreBox}>
                      <Ionicons name="sparkles" size={36} color={colors.warning} />
                      <ThemedText style={[styles.nullScoreText, { color: colors.warning }]}>
                        Chưa đủ dữ liệu đánh giá
                      </ThemedText>
                    </View>
                  )}
                </View>

                {readiness && (
                  <View style={styles.readinessGrid}>
                    <View style={[styles.gridItem, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={styles.gridNumber}>{readiness.assessedCompetencies}</ThemedText>
                      <ThemedText style={styles.gridLabel}>Năng lực đánh giá</ThemedText>
                    </View>

                    <View style={[styles.gridItem, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={styles.gridNumber}>{readiness.evidenceCount}</ThemedText>
                      <ThemedText style={styles.gridLabel}>Tổng minh chứng</ThemedText>
                    </View>

                    <View style={[styles.gridItem, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={[styles.gridNumber, { color: colors.danger }]}>{readiness.priorityGapCount}</ThemedText>
                      <ThemedText style={styles.gridLabel}>Lỗ hổng ưu tiên</ThemedText>
                    </View>
                  </View>
                )}
              </GlassCard>

              {/* Weekly Completed Activities Card */}
              {dashboard.weeklyCompletedActivities && (
                <GlassCard style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.iconBadge, { backgroundColor: colors.secondaryLight }]}>
                      <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
                    </View>
                    <ThemedText type="subtitle" style={styles.cardTitle}>
                      Hoạt Động Tuần Này ({dashboard.weeklyCompletedActivities.total})
                    </ThemedText>
                  </View>

                  <View style={styles.weeklyGrid}>
                    <View style={[styles.weeklyStat, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={[styles.weeklyNum, { color: colors.primary }]}>
                        {dashboard.weeklyCompletedActivities.interviews}
                      </ThemedText>
                      <ThemedText style={styles.weeklyLabel}>Phỏng vấn</ThemedText>
                    </View>

                    <View style={[styles.weeklyStat, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={[styles.weeklyNum, { color: colors.accent }]}>
                        {dashboard.weeklyCompletedActivities.scenarios}
                      </ThemedText>
                      <ThemedText style={styles.weeklyLabel}>Kịch bản</ThemedText>
                    </View>

                    <View style={[styles.weeklyStat, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={[styles.weeklyNum, { color: colors.secondary }]}>
                        {dashboard.weeklyCompletedActivities.starAttempts}
                      </ThemedText>
                      <ThemedText style={styles.weeklyLabel}>STAR</ThemedText>
                    </View>

                    <View style={[styles.weeklyStat, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={[styles.weeklyNum, { color: colors.warning }]}>
                        {dashboard.weeklyCompletedActivities.resumeAnalyses}
                      </ThemedText>
                      <ThemedText style={styles.weeklyLabel}>Phân tích CV</ThemedText>
                    </View>
                  </View>
                </GlassCard>
              )}

              {/* Weakest Competencies Card with Progress Visualizers */}
              {dashboard.weakestCompetencies && dashboard.weakestCompetencies.length > 0 && (
                <GlassCard style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.iconBadge, { backgroundColor: colors.warningLight }]}>
                      <Ionicons name="trending-down-outline" size={20} color={colors.warning} />
                    </View>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Năng Lực Cần Cải Thiện Nhất</ThemedText>
                  </View>

                  <View style={{ gap: Spacing.three }}>
                    {dashboard.weakestCompetencies.map((comp) => (
                      <View key={comp.code} style={[styles.weakRow, { backgroundColor: colors.backgroundElement }]}>
                        <View style={styles.weakTopRow}>
                          <View style={{ flex: 1 }}>
                            <ThemedText style={styles.weakName}>{comp.name}</ThemedText>
                            <ThemedText style={styles.weakMeta}>{comp.category} • {comp.evidenceCount} minh chứng</ThemedText>
                          </View>
                          <View style={[styles.scoreBadge, { backgroundColor: colors.warningLight }]}>
                            <ThemedText style={[styles.scoreText, { color: colors.warning }]}>{comp.score}/100</ThemedText>
                          </View>
                        </View>
                        {/* Progress visualizer bar */}
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${Math.min(100, Math.max(5, comp.score))}%`, backgroundColor: colors.warning },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              )}

              {/* Recent Improvements Card */}
              {dashboard.recentImprovements && dashboard.recentImprovements.length > 0 && (
                <GlassCard style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.iconBadge, { backgroundColor: colors.accentLight }]}>
                      <Ionicons name="trending-up-outline" size={20} color={colors.accent} />
                    </View>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Tiến Bộ Điểm Số Gần Đây</ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two }}>
                    {dashboard.recentImprovements.map((imp) => (
                      <View key={`${imp.resourceId}-${imp.at}-${imp.delta}`} style={[styles.impRow, { backgroundColor: colors.accentLight }]}>
                        <Ionicons name="arrow-up-circle" size={24} color={colors.accent} />
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[styles.impTitle, { color: colors.accent }]}>
                            +{imp.delta} Điểm (Từ {imp.previousScore} lên {imp.currentScore})
                          </ThemedText>
                          <ThemedText style={styles.impDate}>{new Date(imp.at).toLocaleDateString('vi-VN')}</ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
