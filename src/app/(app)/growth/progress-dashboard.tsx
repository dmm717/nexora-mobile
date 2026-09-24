import React from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { growthApi } from '@/api/growth.api';
import { profileApi } from '@/api/profile.api';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { RadialScore } from '@/components/ui/radial-score';
import { styles } from '@/styles/progress-dashboard.styles';
import { safeBack } from '@/utils/navigation';
import {
  getLocalizedRecommendationReason,
  getRecommendationDeepLink,
} from '@/utils/recommendation-contract';

export default function ProgressDashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // 1. Fetch Progress Dashboard
  const {
    data: dashboard,
    isLoading: isLoadingProgress,
    isError: isProgressError,
    refetch: refetchProgress,
    isRefetching: isRefetchingProgress,
  } = useQuery({
    queryKey: ['progress-dashboard'],
    queryFn: growthApi.getProgressDashboard,
  });

  // 2. Fetch Career Profile (for goal context summary)
  const {
    data: careerProfile,
    isError: isProfileError,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  // 3. Fetch Skill Profile (for full quantified competencies list)
  const {
    data: skillProfile,
    isError: isSkillError,
    refetch: refetchSkillProfile,
    isRefetching: isRefetchingSkills,
  } = useQuery({
    queryKey: ['skill-profile'],
    queryFn: growthApi.getSkillProfile,
  });

  const readiness = dashboard?.readiness;
  const hasReadinessScore = readiness?.score !== null && readiness?.score !== undefined;
  const activeGoal = careerProfile?.activeCareerGoal;
  const goalSummary = activeGoal
    ? `${activeGoal.targetRole} · ${activeGoal.seniority}${activeGoal.industry ? ` (${activeGoal.industry})` : ''}`
    : 'Chưa thiết lập mục tiêu';

  const nextRec = dashboard?.nextRecommendedPractice;
  const recDeepLink = getRecommendationDeepLink(nextRec);

  // Competency evidence list: skillProfile competencies or fallback to dashboard weakestCompetencies
  const competencies = skillProfile?.competencies ?? [];
  const assessedCompetencyCount =
    readiness?.assessedCompetencies !== undefined
      ? readiness.assessedCompetencies
      : competencies.filter((c) => c.evidenceCount > 0).length;

  const isRefreshing = isRefetchingProgress || isRefetchingProfile || isRefetchingSkills;

  const handleRefresh = () => {
    void refetchProgress();
    void refetchProfile();
    void refetchSkillProfile();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Navigation Bar */}
        <AppScreenHeader title="Năng Lực & Tiến Độ" fallbackRoute="/(tabs)/growth" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {isLoadingProgress ? (
            <View style={{ gap: 16 }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <>
              {/* PAGE HERO HEADER BLOCK (Matching Web Hero Header) */}
              <View style={styles.pageHeaderBlock}>
                <View style={[styles.pillBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="trending-up" size={14} color={colors.primary} />
                  <ThemedText style={[styles.pillBadgeText, { color: colors.primary }]}>
                    Báo cáo hồ sơ năng lực thực chiến
                  </ThemedText>
                </View>

                <ThemedText style={styles.mainHeading}>
                  Chỉ số sẵn sàng & Năng lực cạnh tranh
                </ThemedText>

                <ThemedText style={styles.goalSubheading}>
                  Mục tiêu hiện tại: {goalSummary}
                </ThemedText>

                {/* Top Action Buttons (Matching Web Header Buttons) */}
                <View style={styles.headerActionRow}>
                  <TouchableScale
                    style={[styles.headerBtnOutline, { borderColor: colors.cardBorder }]}
                    onPress={() => router.push('/(app)/growth/learning-path' as any)}
                  >
                    <Ionicons name="map-outline" size={16} color={colors.text} />
                    <ThemedText style={[styles.headerBtnText, { color: colors.text }]}>
                      Xem lộ trình chi tiết
                    </ThemedText>
                  </TouchableScale>

                  <TouchableScale
                    style={[styles.headerBtnPrimary, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(tabs)/practice' as any)}
                  >
                    <Ionicons name="play" size={16} color="#ffffff" />
                    <ThemedText style={[styles.headerBtnText, { color: '#ffffff' }]}>
                      Luyện tập ngay
                    </ThemedText>
                  </TouchableScale>
                </View>
              </View>

              {/* Error Alert Banner if any */}
              {isProgressError && (
                <View style={[styles.alertBanner, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
                  <ThemedText style={[styles.alertText, { color: colors.danger }]}>
                    Chưa thể tải dữ liệu tiến độ lúc này. Hãy thử làm mới trang.
                  </ThemedText>
                  <TouchableOpacity style={[styles.alertRetryBtn, { borderColor: colors.danger }]} onPress={() => refetchProgress()}>
                    <ThemedText style={[styles.alertRetryText, { color: colors.danger }]}>Thử lại</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* READINESS METRIC CARD (Featuring RadialScore) */}
              <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.readinessCard}>
                <View style={styles.readinessContentRow}>
                  <RadialScore score={readiness?.score ?? null} size={105} strokeWidth={9} />

                  <View style={styles.readinessTextCol}>
                    <ThemedText style={styles.readinessLabel}>
                      Mức độ sẵn sàng tuyển dụng
                    </ThemedText>
                    <ThemedText style={styles.readinessScoreTitle}>
                      {hasReadinessScore
                        ? `Chỉ số hiện tại: ${readiness.score}/100`
                        : 'Chưa đủ dữ liệu đánh giá'}
                    </ThemedText>
                    <ThemedText style={styles.readinessSubtext}>
                      {hasReadinessScore
                        ? `Dựa trên ${readiness.evidenceCount} bằng chứng từ quá trình luyện tập của bạn.`
                        : 'Hoàn thành một hoạt động có bằng chứng để hệ thống tổng hợp chỉ số.'}
                    </ThemedText>
                  </View>
                </View>
              </GlassCard>

              {/* 2-COLUMN SIDE METRIC CARDS (Assessed Competencies & Weekly Activities) */}
              <View style={styles.metricRow}>
                {/* Assessed Competencies */}
                <GlassCard style={styles.metricCardSmall}>
                  <View style={styles.metricHeaderRow}>
                    <ThemedText style={styles.metricCardLabel} numberOfLines={1}>
                      Năng lực đã kiểm chứng
                    </ThemedText>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                  </View>
                  <ThemedText style={[styles.metricBigNum, { color: colors.text }]}>
                    {assessedCompetencyCount ?? '—'}
                  </ThemedText>
                  <ThemedText style={styles.metricCardSub}>Năng lực đã có bằng chứng</ThemedText>
                </GlassCard>

                {/* Weekly Activities */}
                <GlassCard style={styles.metricCardSmall}>
                  <View style={styles.metricHeaderRow}>
                    <ThemedText style={styles.metricCardLabel} numberOfLines={1}>
                      Hoạt động tuần này
                    </ThemedText>
                    <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                  </View>
                  <ThemedText style={[styles.metricBigNum, { color: colors.text }]}>
                    {dashboard?.weeklyCompletedActivities?.total ?? '—'}
                  </ThemedText>
                  <ThemedText style={styles.metricCardSub}>
                    Bao gồm {dashboard?.weeklyCompletedActivities?.interviews ?? 0} phỏng vấn
                  </ThemedText>
                </GlassCard>
              </View>

              {/* NEXT RECOMMENDED PRACTICE BANNER */}
              {nextRec && (
                <GlassCard style={[styles.recBanner, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}>
                  <View style={styles.recHeaderRow}>
                    <View style={[styles.recBadge, { backgroundColor: colors.primary }]}>
                      <ThemedText style={[styles.recBadgeText, { color: '#ffffff' }]}>
                        Đề xuất ưu tiên hàng đầu
                      </ThemedText>
                    </View>
                    {nextRec.estimatedMinutes > 0 && (
                      <ThemedText style={styles.recTimePill}>
                        Ước tính: {nextRec.estimatedMinutes} phút
                      </ThemedText>
                    )}
                  </View>

                  <ThemedText style={[styles.recReasonText, { color: colors.text }]}>
                    {getLocalizedRecommendationReason(nextRec)}
                  </ThemedText>

                  {recDeepLink && (
                    <TouchableScale
                      style={[styles.recBtn, { backgroundColor: colors.primary }]}
                      onPress={() => router.push(recDeepLink as any)}
                    >
                      <ThemedText style={styles.recBtnText}>Luyện ngay theo đề xuất</ThemedText>
                      <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                    </TouchableScale>
                  )}
                </GlassCard>
              )}

              {/* CHI TIẾT CÁC NĂNG LỰC ĐÃ ĐƯỢC ĐỊNH LƯỢNG */}
              <View style={{ gap: Spacing.two }}>
                <View style={styles.compSectionHeader}>
                  <ThemedText style={styles.compSectionTitle}>
                    Chi tiết các năng lực đã được định lượng
                  </ThemedText>
                  <ThemedText style={styles.compSectionGoal}>
                    Theo mục tiêu {activeGoal?.targetRole || 'nghề nghiệp'}
                  </ThemedText>
                </View>

                {competencies.length === 0 ? (
                  <GlassCard style={{ padding: Spacing.three, alignItems: 'center' }}>
                    <ThemedText style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
                      Chưa có năng lực nào được đánh giá. Hãy hoàn thành các hoạt động luyện tập để tạo bằng chứng.
                    </ThemedText>
                  </GlassCard>
                ) : (
                  competencies.map((comp, idx) => {
                    const score = comp.score != null ? Math.round(comp.score) : null;
                    return (
                      <GlassCard key={comp.code || idx} style={styles.compCard}>
                        <View style={styles.compHeaderRow}>
                          <View style={{ flex: 1 }}>
                            <ThemedText style={styles.compName}>{comp.name || comp.code}</ThemedText>
                            <ThemedText style={styles.compCategory}>
                              {comp.category || 'Chuyên môn'} · {comp.evidenceCount ?? 0} dẫn chứng
                            </ThemedText>
                          </View>
                          <ThemedText style={[styles.compScoreText, { color: colors.primary }]}>
                            {score === null ? 'Chưa chấm' : `${score}%`}
                          </ThemedText>
                        </View>
                        {score !== null && (
                          <View style={styles.progressTrack}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${Math.min(100, Math.max(5, score))}%`,
                                  backgroundColor: score >= 75 ? colors.accent : colors.primary,
                                },
                              ]}
                            />
                          </View>
                        )}
                      </GlassCard>
                    );
                  })
                )}
              </View>

              {/* NĂNG LỰC CÓ ĐIỂM THẤP NHẤT HIỆN TẠI */}
              {dashboard?.weakestCompetencies && dashboard.weakestCompetencies.length > 0 && (
                <GlassCard style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="analytics-outline" size={18} color={colors.primary} />
                    <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>
                      Năng Lực Có Điểm Thấp Nhất Hiện Tại
                    </ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two }}>
                    {dashboard.weakestCompetencies.map((comp) => (
                      <View key={comp.code} style={[styles.weakRow, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                        <View style={styles.weakTopRow}>
                          <ThemedText style={styles.weakName}>{comp.name}</ThemedText>
                          <ThemedText style={[styles.weakScoreText, { color: colors.primary }]}>
                            {comp.score}%
                          </ThemedText>
                        </View>

                        <ThemedText style={styles.weakExplanationText}>
                          Đây là một trong các năng lực có điểm thấp nhất hiện tại, không phải kết luận tự động rằng năng lực này là điểm yếu.
                        </ThemedText>

                        <TouchableOpacity
                          style={styles.weakPracticeBtn}
                          onPress={() => router.push('/(tabs)/practice' as any)}
                        >
                          <ThemedText style={[styles.weakPracticeText, { color: colors.primary }]}>
                            Xem bài luyện phù hợp
                          </ThemedText>
                          <Ionicons name="arrow-forward" size={13} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              )}

              {/* TIẾN BỘ GẦN ĐÂY */}
              {dashboard?.recentImprovements && dashboard.recentImprovements.length > 0 && (
                <GlassCard style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="trending-up-outline" size={18} color={colors.accent} />
                    <ThemedText style={[styles.cardTitle, { color: colors.accent }]}>
                      Tiến Bộ Gần Đây
                    </ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two }}>
                    {dashboard.recentImprovements.map((imp, idx) => {
                      const hasReportLink = imp.kind === 'interview' && Boolean(imp.resourceId);
                      return (
                        <TouchableScale
                          key={`${imp.resourceId}-${imp.at}-${idx}`}
                          disabled={!hasReportLink}
                          onPress={() => {
                            if (hasReportLink) {
                              router.push(`/(app)/interview/report/${imp.resourceId}` as any);
                            }
                          }}
                        >
                          <View style={[styles.impRow, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                            <View style={{ flex: 1 }}>
                              <View style={styles.impTitleRow}>
                                <ThemedText style={styles.impTitle}>
                                  {imp.kind === 'interview'
                                    ? 'Tiến bộ qua phiên phỏng vấn'
                                    : 'Tiến bộ được ghi nhận'}
                                </ThemedText>
                                {hasReportLink && (
                                  <Ionicons name="open-outline" size={13} color={colors.primary} />
                                )}
                              </View>
                              <ThemedText style={styles.impDetail}>
                                Điểm tăng từ {imp.previousScore}% lên {imp.currentScore}%
                              </ThemedText>
                              {imp.at && (
                                <ThemedText style={styles.impDate}>
                                  {new Date(imp.at).toLocaleDateString('vi-VN')}
                                </ThemedText>
                              )}
                            </View>

                            <View style={[styles.deltaBadge, { backgroundColor: colors.accentLight }]}>
                              <ThemedText style={[styles.deltaText, { color: colors.accent }]}>
                                +{imp.delta}%
                              </ThemedText>
                            </View>
                          </View>
                        </TouchableScale>
                      );
                    })}
                  </View>
                </GlassCard>
              )}
            </>
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="growth" />
      </SafeAreaView>
    </ThemedView>
  );
}
