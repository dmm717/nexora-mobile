import React from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { styles } from '@/styles/home.styles';
import { ThemedText } from '@/components/themed-text';
import { AmbientBackground as SolidBackground } from '@/components/ui/ambient-background';
import { Badge } from '@/components/ui/badge';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { RadialScoreRing } from '@/components/ui/radial-score';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Typography } from '@/constants/theme';

export const StatusBadge = React.memo(({ status }: { status: string }) => {
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
});

export const HomeHeroSection = React.memo(({
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

export const ExecutiveDashboardCard = React.memo(({
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

export const RecentActivitiesSection = React.memo(({
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
                <StatusBadge status={act.status} />
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

export const GroupedNavInsetCard = React.memo(({
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
