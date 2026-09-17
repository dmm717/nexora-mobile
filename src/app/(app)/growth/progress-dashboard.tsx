import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { growthApi } from '@/api/growth.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Tổng Quan Tiến Độ & Readiness</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {isLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : isError || !dashboard ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.8 }}>Không thể tải bảng tổng quan tiến độ.</ThemedText>
            </View>
          ) : (
            <>
              {/* Readiness Score Card */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="speedometer-outline" size={24} color={colors.primary} />
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
                      <Ionicons name="sparkles" size={32} color={colors.warning} />
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
              </View>

              {/* Weekly Completed Activities Card */}
              {dashboard.weeklyCompletedActivities && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="calendar-outline" size={22} color={colors.secondary} />
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
                </View>
              )}

              {/* Weakest Competencies Card */}
              {dashboard.weakestCompetencies && dashboard.weakestCompetencies.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="trending-down-outline" size={22} color={colors.warning} />
                    <ThemedText type="subtitle" style={styles.cardTitle}>Năng Lực Cần Cải Thiện Nhất</ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two }}>
                    {dashboard.weakestCompetencies.map((comp) => (
                      <View key={comp.code} style={[styles.weakRow, { backgroundColor: colors.backgroundElement }]}>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.weakName}>{comp.name}</ThemedText>
                          <ThemedText style={styles.weakMeta}>{comp.category} • {comp.evidenceCount} minh chứng</ThemedText>
                        </View>
                        <View style={[styles.scoreBadge, { backgroundColor: colors.warningLight }]}>
                          <ThemedText style={[styles.scoreText, { color: colors.warning }]}>{comp.score}/100</ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recent Improvements Card */}
              {dashboard.recentImprovements && dashboard.recentImprovements.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="trending-up-outline" size={22} color={colors.accent} />
                    <ThemedText type="subtitle" style={styles.cardTitle}>Tiến Bộ Điểm Số Gần Đây</ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two }}>
                    {dashboard.recentImprovements.map((imp, idx) => (
                      <View key={idx} style={[styles.impRow, { backgroundColor: colors.accentLight }]}>
                        <Ionicons name="arrow-up-circle" size={22} color={colors.accent} />
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[styles.impTitle, { color: colors.accent }]}>
                            +{imp.delta} Điểm (Từ {imp.previousScore} lên {imp.currentScore})
                          </ThemedText>
                          <ThemedText style={styles.impDate}>{new Date(imp.at).toLocaleDateString('vi-VN')}</ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  readinessBox: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 18,
    opacity: 0.6,
    marginLeft: 4,
  },
  nullScoreBox: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: 6,
  },
  nullScoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  readinessGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  gridNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  gridLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
    textAlign: 'center',
  },
  weeklyGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  weeklyStat: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Radius.md,
  },
  weeklyNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  weeklyLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  weakName: {
    fontSize: 14,
    fontWeight: '700',
  },
  weakMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  impRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  impTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  impDate: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
});
