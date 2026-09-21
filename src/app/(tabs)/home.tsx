import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { profileApi } from '@/api/profile.api';
import { growthApi } from '@/api/growth.api';
import { dashboardApi } from '@/api/dashboard.api';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { AmbientBackground as SolidBackground } from '@/components/ui/ambient-background';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { RadialScoreRing } from '@/components/ui/radial-score';

function renderStatusBadge(status: string) {
  const normalized = (status || '').toLowerCase().trim();

  let variant: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral' = 'neutral';
  let label = status;

  if (normalized === 'completed' || normalized === 'hoàn thành') {
    variant = 'success';
    label = 'Hoàn thành';
  } else if (normalized === 'in_progress' || normalized === 'inprogress' || normalized === 'đang diễn ra') {
    variant = 'info';
    label = 'Đang làm';
  } else if (normalized === 'pending' || normalized === 'đang chờ') {
    variant = 'warning';
    label = 'Đang chờ';
  } else if (normalized === 'failed' || normalized === 'thất bại') {
    variant = 'error';
    label = 'Lỗi';
  } else if (normalized === 'draft') {
    variant = 'neutral';
    label = 'Nháp';
  }

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

function resolveNextBestAction({
  recommendation,
  targetRole,
  hasInsufficientEvidence,
}: {
  recommendation?: any;
  targetRole?: string;
  hasInsufficientEvidence: boolean;
}) {
  if (recommendation) {
    const type = (recommendation.activityType || '').toLowerCase();
    let dest = '/(app)/growth/progress-dashboard';
    let label = 'Bắt đầu bài luyện tập đề xuất';

    if (type === 'star' || type === 'star_drill') {
      dest = '/(app)/star-builder';
      label = 'Luyện phản xạ STAR';
    } else if (type === 'scenario') {
      dest = recommendation.resourceId ? `/(app)/scenarios/${recommendation.resourceId}` : '/(app)/scenarios';
      label = 'Luyện kịch bản tình huống';
    } else if (type === 'interview') {
      dest = '/(app)/interview/preflight';
      label = 'Luyện phỏng vấn AI';
    } else if (type === 'resume' || type === 'resume_improvement') {
      dest = '/(app)/cv-analysis';
      label = 'Cải thiện & Phân tích CV';
    }

    return {
      label,
      description: recommendation.reason || 'Chọn bài luyện phù hợp với điều bạn muốn cải thiện tiếp theo.',
      destination: dest,
      estimatedMinutes: recommendation.estimatedMinutes,
    };
  }

  if (hasInsufficientEvidence) {
    return {
      label: targetRole ? `Phân tích CV theo mục tiêu ${targetRole}` : 'Thiết lập mục tiêu & phân tích CV',
      description: 'Chọn vị trí bạn hướng tới và tải CV lên để hệ thống bắt đầu tích lũy bằng chứng năng lực.',
      destination: '/(app)/cv-analysis',
      estimatedMinutes: undefined,
    };
  }

  if (!targetRole) {
    return {
      label: 'Thiết lập mục tiêu nghề nghiệp',
      description: 'Chọn vị trí mục tiêu để các đề xuất bài tập tiếp theo có bối cảnh cá nhân hóa chính xác.',
      destination: '/(app)/career-goals',
      estimatedMinutes: undefined,
    };
  }

  return {
    label: 'Bắt đầu phỏng vấn AI',
    description: 'Thực hiện bài phỏng vấn đầu tiên để bắt đầu tích lũy bằng chứng năng lực thực tế.',
    destination: '/(app)/interview/preflight',
    estimatedMinutes: undefined,
  };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // 1. Career Profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  // 2. Next Recommendation
  const { data: recommendation } = useQuery({
    queryKey: ['next-recommendation'],
    queryFn: growthApi.getNextRecommendation,
    enabled: !!user,
  });

  // 3. Dashboard Summary (Interviews & Reports)
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getDashboardSummary,
    enabled: !!user,
  });

  // 4. Progress Dashboard (Readiness Score & Gaps)
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['progress-dashboard'],
    queryFn: growthApi.getProgressDashboard,
    enabled: !!user,
  });

  // 5. Learning Path
  const { data: learningPathData, isLoading: isLoadingLearningPath } = useQuery({
    queryKey: ['learning-path'],
    queryFn: growthApi.getLearningPath,
    enabled: !!user,
  });

  const {
    activeGoal,
    primaryResume,
    userProfileInfo,
    yearsOfExperience,
  } = useMemo(() => {
    const rawProfileObj = profileData as any;
    const info = rawProfileObj?.profile || rawProfileObj?.identity || {};
    return {
      activeGoal: profileData?.activeCareerGoal,
      primaryResume: profileData?.primaryResume,
      userProfileInfo: info,
      yearsOfExperience: info?.yearsOfExperience ?? null,
    };
  }, [profileData]);

  const {
    readinessScore,
    evidenceCount,
    priorityGapCount,
    hasInsufficientEvidence,
  } = useMemo(() => {
    const score = progressData?.readiness?.score;
    return {
      readinessScore: score,
      evidenceCount: progressData?.readiness?.evidenceCount || 0,
      priorityGapCount: progressData?.readiness?.priorityGapCount || 0,
      hasInsufficientEvidence: score === null || score === undefined,
    };
  }, [progressData]);

  const nextAction = useMemo(() => resolveNextBestAction({
    recommendation,
    targetRole: activeGoal?.targetRole,
    hasInsufficientEvidence,
  }), [recommendation, activeGoal?.targetRole, hasInsufficientEvidence]);

  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      interviewId: string;
      role: string;
      status: string;
      updatedAt: string;
      score: number | null;
      fullTimestamp: string;
    }> = [];

    if (dashboardData?.interviews) {
      dashboardData.interviews.slice(0, 4).forEach((iv) => {
        const matchedReport = dashboardData.reports?.find((r) => r.interviewId === iv.id);
        const timestamp = matchedReport?.createdAt || iv.updatedAt;
        
        let fullTimestamp = '';
        if (timestamp) {
          const dateObj = new Date(timestamp);
          const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          fullTimestamp = `${timeStr} · ${dateStr}`;
        }

        activities.push({
          id: `iv-${iv.id}`,
          interviewId: iv.id,
          role: iv.role,
          status: iv.status,
          updatedAt: timestamp,
          score: matchedReport?.overallScore ?? null,
          fullTimestamp,
        });
      });
    }
    return activities;
  }, [dashboardData]);

  const { learningProgress, nextMilestone } = useMemo(() => {
    return {
      learningProgress: learningPathData?.progress,
      nextMilestone: learningPathData?.milestones?.find(
        (m) => m.status === 'in_progress' || m.status === 'pending'
      ),
    };
  }, [learningPathData]);

  return (
    <SolidBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* TOP BAR */}
        <View style={[styles.topBar, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.brandHeaderGroup}>
            <ThemedText style={[styles.greetingText, { color: colors.textSecondary }]}>
              Xin chào,
            </ThemedText>
            <ThemedText style={styles.appName} numberOfLines={1}>
              {user?.displayName || user?.fullName || 'Ứng viên'}
            </ThemedText>
          </View>

          <View style={styles.headerBtnGroupRight}>
            <TouchableScale
              style={[styles.headerBtnPrimaryCompact, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(app)/cv-analysis' as any)}
            >
              <Ionicons name="document-text" size={12} color="#ffffff" />
              <ThemedText style={styles.headerBtnPrimaryText}>Cải thiện CV</ThemedText>
            </TouchableScale>

            <TouchableScale
              style={[styles.headerBtnSecondaryCompact, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}
              onPress={() => router.push('/(tabs)/profile' as any)}
            >
              <Ionicons name="person" size={12} color={colors.textPrimary} />
            </TouchableScale>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* KHỐI 1: COMBINED HERO CONTEXT CARD */}
          <HomeHeroSection
            colors={colors}
            isLoadingProfile={isLoadingProfile}
            activeGoal={activeGoal}
            primaryResume={primaryResume}
            onNavigateCareerGoals={() => router.push('/(app)/career-goals' as any)}
            onNavigateCvAnalysis={() => router.push('/(app)/cv-analysis' as any)}
          />

          {/* KHỐI 2: UNIFIED EXECUTIVE DASHBOARD CARD */}
          <ExecutiveDashboardCard
            colors={colors}
            isLoadingProgress={isLoadingProgress}
            readinessScore={readinessScore}
            evidenceCount={evidenceCount}
            priorityGapCount={priorityGapCount}
            nextAction={nextAction}
            onNavigateDashboard={() => router.push('/(app)/growth/progress-dashboard' as any)}
            onNavigateNextAction={() => router.push(nextAction.destination as any)}
            onNavigateHistory={() => router.push('/(app)/interview/history' as any)}
          />

          {/* INSIGHT PANEL BANNER */}
          <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
            <View style={[styles.insightPanel, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <Ionicons name="bulb-outline" size={18} color={colors.primary} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.insightTitle}>Nexora học gì từ hành trình của bạn?</ThemedText>
                <ThemedText style={[styles.insightDesc, { color: colors.textSecondary }]}>
                  Mỗi bài luyện tập và phân tích CV đều tích lũy bằng chứng thực tế giúp AI gợi ý chính xác hơn.
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* KHỐI 3: HOẠT ĐỘNG GẦN ĐÂY */}
          <RecentActivitiesSection
            colors={colors}
            isLoadingDashboard={isLoadingDashboard}
            recentActivities={recentActivities}
            onNavigateHistory={() => router.push('/(app)/interview/history' as any)}
            onNavigateInterview={(id) => router.push(`/(app)/interview/${id}` as any)}
          />

          {/* KHỐI 4: GROUPED INSET SURFACE CARD */}
          <GroupedNavInsetCard
            user={user}
            colors={colors}
            userProfileInfo={userProfileInfo}
            yearsOfExperience={yearsOfExperience}
            primaryResume={primaryResume}
            activeGoal={activeGoal}
            isLoadingLearningPath={isLoadingLearningPath}
            learningProgress={learningProgress}
            nextMilestone={nextMilestone}
            onNavigateProfile={() => router.push('/(tabs)/profile' as any)}
            onNavigateCareerGoals={() => router.push('/(app)/career-goals' as any)}
            onNavigateLearningPath={() => router.push('/(app)/growth/learning-path' as any)}
          />
        </ScrollView>
      </SafeAreaView>
    </SolidBackground>
  );
}

const HomeHeroSection = React.memo(({
  colors,
  isLoadingProfile,
  activeGoal,
  primaryResume,
  onNavigateCareerGoals,
  onNavigateCvAnalysis,
}: {
  colors: any;
  isLoadingProfile: boolean;
  activeGoal: any;
  primaryResume: any;
  onNavigateCareerGoals: () => void;
  onNavigateCvAnalysis: () => void;
}) => (
  <Animated.View entering={FadeInDown.duration(400).springify()}>
    <SurfaceCard style={styles.combinedHeroCard}>
      <View style={styles.combinedHeroRow}>
        <TouchableScale onPress={onNavigateCareerGoals} style={styles.heroCol}>
          <View style={styles.contextHeader}>
            <View style={[styles.miniIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="flag" size={12} color={colors.primary} />
            </View>
            <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>MỤC TIÊU</ThemedText>
          </View>
          {isLoadingProfile ? (
            <SkeletonLoader width="80%" height={14} style={{ marginTop: 4 }} />
          ) : (
            <ThemedText style={styles.contextValue} numberOfLines={1}>
              {activeGoal ? activeGoal.targetRole : 'Chưa thiết lập'}
            </ThemedText>
          )}
          <View style={styles.badgeSubRow}>
            {activeGoal ? (
              <Badge variant="primary" size="sm">{activeGoal.seniority}</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Cần cài đặt</Badge>
            )}
          </View>
        </TouchableScale>

        <View style={[styles.verticalDivider, { backgroundColor: colors.cardBorder }]} />

        <TouchableScale onPress={onNavigateCvAnalysis} style={styles.heroCol}>
          <View style={styles.contextHeader}>
            <View style={[styles.miniIconBox, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="document-text" size={12} color={colors.accent} />
            </View>
            <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>CV CHÍNH</ThemedText>
          </View>
          {isLoadingProfile ? (
            <SkeletonLoader width="80%" height={14} style={{ marginTop: 4 }} />
          ) : (
            <ThemedText style={styles.contextValue} numberOfLines={1}>
              {primaryResume ? primaryResume.fileName : 'Chưa chọn'}
            </ThemedText>
          )}
          <View style={styles.badgeSubRow}>
            {primaryResume ? (
              <Badge variant="success" size="sm">Đã đối chiếu</Badge>
            ) : (
              <Badge variant="warning" size="sm">Chưa có CV</Badge>
            )}
          </View>
        </TouchableScale>
      </View>
    </SurfaceCard>
  </Animated.View>
));

const ExecutiveDashboardCard = React.memo(({
  colors,
  isLoadingProgress,
  readinessScore,
  evidenceCount,
  priorityGapCount,
  nextAction,
  onNavigateDashboard,
  onNavigateNextAction,
  onNavigateHistory,
}: {
  colors: any;
  isLoadingProgress: boolean;
  readinessScore: number | null | undefined;
  evidenceCount: number;
  priorityGapCount: number;
  nextAction: any;
  onNavigateDashboard: () => void;
  onNavigateNextAction: () => void;
  onNavigateHistory: () => void;
}) => (
  <Animated.View entering={FadeInDown.duration(400).delay(100).springify()}>
    <SurfaceCard style={styles.unifiedDashboardCard}>
      <View style={styles.cardHeaderBetween}>
        <ThemedText style={[styles.cardHeaderTitle, { color: colors.textSecondary }]}>
          CHỈ SỐ SẴN SÀNG ÚNG TUYỂN
        </ThemedText>
        <TouchableScale onPress={onNavigateDashboard} style={styles.detailLinkBtn}>
          <ThemedText style={[styles.detailLinkText, { color: colors.primary }]}>Chi tiết</ThemedText>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableScale>
      </View>

      {isLoadingProgress ? (
        <SkeletonLoader width="100%" height={140} style={{ borderRadius: 12, marginTop: 4 }} />
      ) : readinessScore != null ? (
        <View style={styles.centeredReadinessBody}>
          <ThemedText style={styles.centeredScoreTitle}>Chỉ số hiện tại</ThemedText>
          <RadialScoreRing score={readinessScore} size={110} strokeWidth={8} />
          <ThemedText style={[styles.centeredScoreSub, { color: colors.textSecondary }]}>
            Dựa trên {evidenceCount} bằng chứng do máy chủ tổng hợp.
          </ThemedText>

          {priorityGapCount > 0 && (
            <TouchableScale
              onPress={onNavigateDashboard}
              style={[
                styles.gapAlertBanner,
                {
                  backgroundColor: colors.warningLight || '#ffddb8',
                  borderColor: (colors.warning || '#694100') + '35',
                },
              ]}
            >
              <View style={[styles.gapIconBadge, { backgroundColor: colors.surface }]}>
                <Ionicons name="warning" size={13} color={colors.warning || '#694100'} />
              </View>
              <ThemedText style={[styles.gapAlertText, { color: colors.warning || '#694100' }]} numberOfLines={1}>
                Có <ThemedText style={{ color: colors.warning || '#694100', fontFamily: Typography.fontFamily.bold }}>{priorityGapCount} khoảng trống</ThemedText> năng lực cần bổ sung
              </ThemedText>
              <Ionicons name="chevron-forward" size={14} color={colors.warning || '#694100'} />
            </TouchableScale>
          )}
        </View>
      ) : (
        <View style={styles.emptyReadinessBox}>
          <ThemedText style={styles.emptyReadinessTitle}>Chưa đủ dữ liệu tính chỉ số</ThemedText>
          <ThemedText style={[styles.emptyReadinessSub, { color: colors.textSecondary }]}>
            Tải CV hoặc làm bài phỏng vấn để bắt đầu tích lũy bằng chứng.
          </ThemedText>
        </View>
      )}

      <View style={[styles.horizontalDivider, { backgroundColor: colors.cardBorder }]} />

      <View style={[styles.actionSubCard, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.spotlightHeader}>
          <View style={[styles.sparkleBox, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
          </View>
          <ThemedText style={[styles.spotlightBadge, { color: colors.primary }]}>
            GỢI Ý TIẾP THEO
          </ThemedText>
          {nextAction.estimatedMinutes && (
            <View style={[styles.timeBadge, { backgroundColor: colors.surface }]}>
              <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
              <ThemedText style={styles.timeText}>{nextAction.estimatedMinutes} phút</ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.spotlightTitle}>{nextAction.label}</ThemedText>
        <ThemedText style={[styles.spotlightDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {nextAction.description}
        </ThemedText>

        <TouchableScale
          onPress={onNavigateNextAction}
          style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
        >
          <ThemedText style={styles.primaryActionBtnText}>Bắt đầu ngay</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
        </TouchableScale>

        <TouchableScale onPress={onNavigateHistory} style={styles.secondaryLinkBtn}>
          <ThemedText style={[styles.secondaryLinkBtnText, { color: colors.textSecondary }]}>
            Lịch sử phỏng vấn
          </ThemedText>
        </TouchableScale>
      </View>
    </SurfaceCard>
  </Animated.View>
));

const RecentActivitiesSection = React.memo(({
  colors,
  isLoadingDashboard,
  recentActivities,
  onNavigateHistory,
  onNavigateInterview,
}: {
  colors: any;
  isLoadingDashboard: boolean;
  recentActivities: any[];
  onNavigateHistory: () => void;
  onNavigateInterview: (id: string) => void;
}) => (
  <Animated.View entering={FadeInDown.duration(400).delay(200).springify()}>
    <View style={styles.sectionHeaderBetween}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="time-outline" size={18} color={colors.primary} />
        <ThemedText style={styles.sectionTitle}>Hoạt Động Gần Đây</ThemedText>
      </View>
      <TouchableScale onPress={onNavigateHistory}>
        <ThemedText style={[styles.seeAllLink, { color: colors.primary }]}>Xem tất cả &gt;</ThemedText>
      </TouchableScale>
    </View>

    {isLoadingDashboard ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        <SkeletonLoader width={210} height={105} style={{ borderRadius: 14 }} />
        <SkeletonLoader width={210} height={105} style={{ borderRadius: 14 }} />
      </ScrollView>
    ) : recentActivities.length > 0 ? (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalCarouselContainer}
        data={recentActivities}
        keyExtractor={(act) => act.id}
        renderItem={({ item: act }) => (
          <TouchableScale onPress={() => onNavigateInterview(act.interviewId)}>
            <SurfaceCard style={styles.miniCarouselCard}>
              <View style={styles.miniCardTopRow}>
                <View style={styles.miniCardHeaderLeft}>
                  <View style={[styles.miniActIconBox, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="mic" size={14} color={colors.primary} />
                  </View>
                  <ThemedText style={[styles.miniActTypeLabel, { color: colors.textSecondary }]}>
                    Phỏng vấn AI
                  </ThemedText>
                </View>

                {act.score != null && (
                  <View style={[styles.actScorePill, { backgroundColor: colors.primaryLight }]}>
                    <ThemedText style={[styles.actScoreText, { color: colors.primary }]}>
                      {act.score}/100
                    </ThemedText>
                  </View>
                )}
              </View>

              <ThemedText style={styles.miniCardTitle} numberOfLines={1}>
                {act.role}
              </ThemedText>

              <View style={styles.miniCardBottomRow}>
                {renderStatusBadge(act.status)}
                <ThemedText style={[styles.miniCardTime, { color: colors.textSecondary }]}>
                  {act.fullTimestamp}
                </ThemedText>
              </View>
            </SurfaceCard>
          </TouchableScale>
        )}
      />
    ) : (
      <SurfaceCard style={styles.emptyActivityCard}>
        <Ionicons name="time-outline" size={28} color={colors.textSecondary} />
        <ThemedText style={styles.emptyActTitle}>Chưa có hoạt động phỏng vấn nào</ThemedText>
        <ThemedText style={[styles.emptyActSub, { color: colors.textSecondary }]}>
          Kết quả phân tích CV và phỏng vấn sẽ lưu vết tại đây.
        </ThemedText>
      </SurfaceCard>
    )}
  </Animated.View>
));

const GroupedNavInsetCard = React.memo(({
  user,
  colors,
  userProfileInfo,
  yearsOfExperience,
  primaryResume,
  activeGoal,
  isLoadingLearningPath,
  learningProgress,
  nextMilestone,
  onNavigateProfile,
  onNavigateCareerGoals,
  onNavigateLearningPath,
}: {
  user: any;
  colors: any;
  userProfileInfo: any;
  yearsOfExperience: number | null;
  primaryResume: any;
  activeGoal: any;
  isLoadingLearningPath: boolean;
  learningProgress: any;
  nextMilestone: any;
  onNavigateProfile: () => void;
  onNavigateCareerGoals: () => void;
  onNavigateLearningPath: () => void;
}) => (
  <Animated.View entering={FadeInDown.duration(400).delay(250).springify()}>
    <SurfaceCard style={styles.groupedInsetCard}>
      <TouchableScale onPress={onNavigateProfile} style={styles.insetItemRow}>
        <View style={[styles.navIconBox, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="person" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText style={styles.navCardTitle}>1. HỒ SƠ CỦA TÔI</ThemedText>
          <ThemedText style={styles.navCardValue} numberOfLines={1}>
            {userProfileInfo?.displayName || user?.displayName || user?.fullName || 'Chưa cập nhật tên'}
          </ThemedText>
          <ThemedText style={[styles.navCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
            Kinh nghiệm: {yearsOfExperience != null ? `${yearsOfExperience} năm` : 'Chưa khai báo'} · CV: {primaryResume ? primaryResume.fileName : 'Chưa chọn'}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      </TouchableScale>

      <View style={[styles.horizontalDivider, { backgroundColor: colors.cardBorder }]} />

      <TouchableScale onPress={onNavigateCareerGoals} style={styles.insetItemRow}>
        <View style={[styles.navIconBox, { backgroundColor: colors.secondaryLight }]}>
          <Ionicons name="flag" size={18} color={colors.secondary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText style={styles.navCardTitle}>2. MỤC TIÊU NGHỀ NGHIỆP</ThemedText>
          <ThemedText style={styles.navCardValue} numberOfLines={1}>
            {activeGoal ? `${activeGoal.targetRole} (${activeGoal.seniority})` : 'Chưa thiết lập mục tiêu'}
          </ThemedText>
          <ThemedText style={[styles.navCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
            Ngành: {activeGoal?.industry || 'Chưa chọn'} · Công ty: {activeGoal?.targetCompany || 'Chưa chọn'}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      </TouchableScale>

      <View style={[styles.horizontalDivider, { backgroundColor: colors.cardBorder }]} />

      <TouchableScale onPress={onNavigateLearningPath} style={styles.insetItemRow}>
        <View style={[styles.navIconBox, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="map" size={18} color={colors.accent} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText style={styles.navCardTitle}>3. LỘ TRÌNH HỌC TẬP</ThemedText>
          <ThemedText style={styles.navCardValue} numberOfLines={1}>
            {isLoadingLearningPath ? (
              'Đang tải lộ trình...'
            ) : learningProgress ? (
              `Hoàn thành ${learningProgress.completedActivityCount}/${learningProgress.totalActivityCount} bài (${learningProgress.percentage}%)`
            ) : (
              'Chưa có lộ trình học tập'
            )}
          </ThemedText>
          <ThemedText style={[styles.navCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
            {nextMilestone ? `Tiếp theo: ${nextMilestone.title}` : 'Chạm để xem chi tiết lộ trình'}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      </TouchableScale>
    </SurfaceCard>
  </Animated.View>
));

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  brandHeaderGroup: {
    flex: 1,
    marginRight: Spacing.two,
  },
  appName: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
  },
  greetingText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  headerBtnGroupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtnPrimaryCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  headerBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
  },
  headerBtnSecondaryCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  headerBtnSecondaryText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semibold,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  // COMBINED HERO CARD
  combinedHeroCard: {
    padding: Spacing.three,
    borderRadius: 14,
  },
  combinedHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCol: {
    flex: 1,
    paddingHorizontal: 4,
    gap: 2,
  },
  verticalDivider: {
    width: 1,
    height: '80%',
    marginHorizontal: Spacing.two,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  contextValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },
  badgeSubRow: {
    marginTop: 2,
  },
  // UNIFIED DASHBOARD CARD
  unifiedDashboardCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
    marginVertical: 2,
  },
  actionSubCard: {
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  detailLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  readinessBody: {
    gap: Spacing.two,
  },
  centeredReadinessBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    gap: 4,
  },
  centeredScoreTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  centeredScoreSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: 6,
  },
  gapAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    gap: 8,
    width: '100%',
  },
  gapIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gapAlertText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
    flex: 1,
  },
  emptyReadinessBox: {
    paddingVertical: Spacing.two,
    gap: 2,
  },
  emptyReadinessTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  emptyReadinessSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  // SPOTLIGHT INSIDE DASHBOARD CARD
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparkleBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlightBadge: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
    letterSpacing: 0.5,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  spotlightTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },
  spotlightDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 18,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  secondaryLinkBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  secondaryLinkBtnText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  // INSIGHT PANEL
  insightPanel: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  insightTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  insightDesc: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 16,
    marginTop: 2,
  },
  // RECENT ACTIVITIES (HORIZONTAL MINI CAROUSEL)
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  seeAllLink: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  horizontalCarouselContainer: {
    gap: Spacing.three,
    paddingRight: Spacing.two,
  },
  miniCarouselCard: {
    width: 215,
    padding: Spacing.three,
    borderRadius: 14,
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  miniCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniActIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniActTypeLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  miniCardTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  miniCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  miniCardTime: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
  },
  actScorePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actScoreText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  emptyActivityCard: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 2,
  },
  emptyActTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 4,
  },
  emptyActSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  // GROUPED INSET SURFACE CARD FOR 3 BOTTOM ITEMS
  groupedInsetCard: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
  },
  insetItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCardTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  navCardValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  navCardSub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
  },
});
