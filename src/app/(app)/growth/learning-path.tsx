import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { styles } from './learning-path.styles';

interface ActivityCardProps {
  activity: any;
  aIdx: number;
  totalActivities: number;
  colors: any;
  onActivityAction: (type: string, resourceId?: string | null) => void;
  onComplete: (id: string) => void;
  isCompleting: boolean;
}

const ActivityCardItem = React.memo(({
  activity,
  aIdx,
  totalActivities,
  colors,
  onActivityAction,
  onComplete,
  isCompleting,
}: ActivityCardProps) => (
  <View key={activity.id} style={styles.timelineRow}>
    {/* Timeline Node Line Connector */}
    <View style={styles.timelineNodeCol}>
      <View
        style={[
          styles.timelineDot,
          activity.status === 'completed'
            ? { backgroundColor: colors.accent, borderColor: colors.accentLight }
            : { backgroundColor: colors.warning, borderColor: colors.warningLight },
        ]}
      />
      {aIdx < totalActivities - 1 && (
        <View style={[styles.timelineLine, { backgroundColor: colors.cardBorder }]} />
      )}
    </View>

    {/* Activity Glass Card */}
    <GlassCard
      style={[
        styles.activityCard,
        activity.status === 'completed' && { opacity: 0.8 },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
          <ThemedText style={[styles.typeBadgeText, { color: colors.primary }]}>
            {activity.type.toUpperCase().replace('_', ' ')}
          </ThemedText>
        </View>
        {activity.status === 'completed' ? (
          <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.accent} style={{ marginRight: 4 }} />
            <ThemedText style={[styles.statusText, { color: colors.accent }]}>Đã hoàn thành</ThemedText>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: colors.warningLight }]}>
            <ThemedText style={[styles.statusText, { color: colors.warning }]}>Đang chờ</ThemedText>
          </View>
        )}
      </View>

      <ThemedText type="subtitle" style={styles.activityTitle}>{activity.title}</ThemedText>
      <ThemedText style={styles.activityDesc}>{activity.description}</ThemedText>

      <View style={styles.activityFooterRow}>
        <TouchableScale
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => onActivityAction(activity.type, activity.resourceId)}
        >
          <ThemedText style={styles.actionButtonText}>Luyện Tập Ngay</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableScale>

        {activity.status !== 'completed' && (
          <TouchableScale
            style={[styles.completeButton, { borderColor: colors.accent }]}
            onPress={() => onComplete(activity.id)}
            disabled={isCompleting}
          >
            <Ionicons name="checkmark" size={16} color={colors.accent} style={{ marginRight: 4 }} />
            <ThemedText style={[styles.completeButtonText, { color: colors.accent }]}>Đánh Dấu Xong</ThemedText>
          </TouchableScale>
        )}
      </View>
    </GlassCard>
  </View>
));

interface MilestoneSectionProps {
  milestone: any;
  colors: any;
  onActivityAction: (type: string, resourceId?: string | null) => void;
  onComplete: (id: string) => void;
  isCompleting: boolean;
}

const MilestoneSectionItem = React.memo(({
  milestone,
  colors,
  onActivityAction,
  onComplete,
  isCompleting,
}: MilestoneSectionProps) => (
  <View style={{ gap: Spacing.two }}>
    <View style={styles.milestoneHeader}>
      <View style={[styles.milestoneIconRing, { backgroundColor: colors.secondaryLight }]}>
        <Ionicons name="flag" size={16} color={colors.secondary} />
      </View>
      <ThemedText type="subtitle" style={styles.milestoneTitle}>
        Cột Mốc #{milestone.sortOrder}: {milestone.title}
      </ThemedText>
    </View>

    <View style={styles.timelineList}>
      {milestone.activities.map((activity: any, aIdx: number) => (
        <ActivityCardItem
          key={activity.id}
          activity={activity}
          aIdx={aIdx}
          totalActivities={milestone.activities.length}
          colors={colors}
          onActivityAction={onActivityAction}
          onComplete={onComplete}
          isCompleting={isCompleting}
        />
      ))}
    </View>
  </View>
));

function executeActivityAction(type: string, resourceId: string | null | undefined, router: ReturnType<typeof useRouter>) {
  switch (type.toLowerCase()) {
    case 'star':
    case 'star_drill':
      router.push('/(app)/star-builder' as any);
      break;
    case 'scenario':
      if (resourceId) {
        router.push(`/(app)/scenarios/${resourceId}` as any);
      } else {
        router.push('/(app)/scenarios' as any);
      }
      break;
    case 'interview':
      router.push('/(app)/interview/preflight' as any);
      break;
    case 'resume_improvement':
      router.push('/(app)/profile' as any);
      break;
    default:
      router.push('/(app)/scenarios' as any);
      break;
  }
}

const LearningPathEmptyOrErrorCard = React.memo(({
  isCareerGoalRequired,
  isGenerating,
  colors,
  onSetupGoal,
  onGenerate,
}: {
  isCareerGoalRequired: boolean;
  isGenerating: boolean;
  colors: any;
  onSetupGoal: () => void;
  onGenerate: () => void;
}) => (
  <GlassCard style={{ padding: Spacing.four, alignItems: 'center' }}>
    <Ionicons name="map-outline" size={48} color={colors.primary} style={{ alignSelf: 'center' }} />
    <ThemedText type="subtitle" style={{ textAlign: 'center', marginTop: Spacing.two }}>
      {isCareerGoalRequired ? 'Yêu Cầu Mục Tiêu Nghề Nghiệp' : 'Chưa Có Lộ Trình Học Tập'}
    </ThemedText>
    <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginVertical: Spacing.two }}>
      {isCareerGoalRequired
        ? 'Bạn cần thiết lập Mục tiêu Nghề nghiệp (Career Goal) trước khi hệ thống AI có thể tạo lộ trình học tập cá nhân hóa.'
        : 'Hệ thống AI chưa tạo lộ trình học tập cho bạn. Hãy bấm nút bên dưới để tạo lộ trình tối ưu.'}
    </ThemedText>

    {isCareerGoalRequired ? (
      <TouchableScale
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={onSetupGoal}
      >
        <ThemedText style={styles.primaryButtonText}>Thiết Lập Mục Tiêu Nghề Nghiệp</ThemedText>
      </TouchableScale>
    ) : (
      <TouchableScale
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
            <ThemedText style={styles.primaryButtonText}>Tạo Lộ Trình Mới Ngay</ThemedText>
          </>
        )}
      </TouchableScale>
    )}
  </GlassCard>
));

export default function LearningPathScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: path, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['learning-path'],
    queryFn: growthApi.getLearningPath,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: growthApi.generateLearningPath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-path'] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể tạo lộ trình. Bạn đã có Mục tiêu Nghề nghiệp chưa?');
    },
  });

  const refreshMutation = useMutation({
    mutationFn: growthApi.refreshLearningPath,
    onSuccess: () => {
      Alert.alert('Thành công', 'Đã cập nhật lộ trình học tập dựa trên minh chứng mới nhất!');
      queryClient.invalidateQueries({ queryKey: ['learning-path'] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể làm mới lộ trình học tập.');
    },
  });

  const completeActivityMutation = useMutation({
    mutationFn: (activityId: string) => growthApi.completeActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-path'] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái nhiệm vụ.');
    },
  });

  const handleActivityAction = (type: string, resourceId?: string | null) => {
    executeActivityAction(type, resourceId, router);
  };

  const isCareerGoalRequired = isError && ((error as any)?.response?.data?.code === 'ACTIVE_CAREER_GOAL_REQUIRED' || (error as any)?.status === 400);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableScale onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableScale>
          <ThemedText type="title" style={styles.title}>Lộ Trình Học Tập AI</ThemedText>
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
            </View>
          ) : isError || !path ? (
            <LearningPathEmptyOrErrorCard
              isCareerGoalRequired={Boolean(isCareerGoalRequired)}
              isGenerating={generateMutation.isPending}
              colors={colors}
              onSetupGoal={() => router.push('/(app)/profile' as any)}
              onGenerate={() => generateMutation.mutate()}
            />
          ) : (
            <>
              {/* Progress Spotlight Card */}
              <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.progressCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Tiến Độ Hoàn Thành Lộ Trình</ThemedText>
                    <ThemedText style={styles.progressSub}>
                      {path.progress.completedActivityCount}/{path.progress.totalActivityCount} Nhiệm vụ hoàn tất
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.percentageText, { color: colors.primary }]}>
                    {path.progress.percentage}%
                  </ThemedText>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressTrack, { backgroundColor: colors.backgroundElement }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, Math.max(0, path.progress.percentage))}%`, backgroundColor: colors.primary }
                    ]}
                  />
                </View>

                {/* Refresh Path Action */}
                <TouchableScale
                  style={[styles.refreshButton, { borderColor: colors.primaryLight, backgroundColor: colors.primaryLight }]}
                  onPress={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                >
                  {refreshMutation.isPending ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                      <ThemedText style={[styles.refreshButtonText, { color: colors.primary }]}>
                        Cập Nhật Lộ Trình Theo Minh Chứng Mới
                      </ThemedText>
                    </>
                  )}
                </TouchableScale>
              </GlassCard>

              {/* Milestones Stepper Timeline */}
              {path.milestones.map((milestone) => (
                <MilestoneSectionItem
                  key={milestone.id}
                  milestone={milestone}
                  colors={colors}
                  onActivityAction={handleActivityAction}
                  onComplete={(actId) => completeActivityMutation.mutate(actId)}
                  isCompleting={completeActivityMutation.isPending}
                />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
