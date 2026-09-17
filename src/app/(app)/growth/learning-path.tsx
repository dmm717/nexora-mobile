import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { growthApi } from '@/api/growth.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  };

  const isCareerGoalRequired = isError && ((error as any)?.response?.data?.code === 'ACTIVE_CAREER_GOAL_REQUIRED' || (error as any)?.status === 400);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Lộ Trình Học Tập AI</ThemedText>
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
          ) : isError || !path ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(app)/profile' as any)}
                >
                  <ThemedText style={styles.primaryButtonText}>Thiết Lập Mục Tiêu Nghề Nghiệp</ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <ThemedText style={styles.primaryButtonText}>Tạo Lộ Trình Mới Ngay</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Progress Banner */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
                <TouchableOpacity
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
                </TouchableOpacity>
              </View>

              {/* Milestones Stepper */}
              {path.milestones.map((milestone) => (
                <View key={milestone.id} style={{ gap: Spacing.two }}>
                  <View style={styles.milestoneHeader}>
                    <View style={[styles.milestoneBadge, { backgroundColor: colors.secondaryLight }]}>
                      <ThemedText style={[styles.milestoneBadgeText, { color: colors.secondary }]}>
                        Cột Mốc #{milestone.sortOrder}
                      </ThemedText>
                    </View>
                    <ThemedText type="subtitle" style={styles.milestoneTitle}>{milestone.title}</ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two }}>
                    {milestone.activities.map((activity) => (
                      <View
                        key={activity.id}
                        style={[
                          styles.card,
                          { backgroundColor: colors.card, borderColor: colors.cardBorder },
                          activity.status === 'completed' && { opacity: 0.75, backgroundColor: colors.backgroundElement }
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
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleActivityAction(activity.type, activity.resourceId)}
                          >
                            <ThemedText style={styles.actionButtonText}>Luyện Tập ngay</ThemedText>
                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                          </TouchableOpacity>

                          {activity.status !== 'completed' && (
                            <TouchableOpacity
                              style={[styles.completeButton, { borderColor: colors.accent }]}
                              onPress={() => completeActivityMutation.mutate(activity.id)}
                              disabled={completeActivityMutation.isPending}
                            >
                              <Ionicons name="checkmark" size={16} color={colors.accent} style={{ marginRight: 4 }} />
                              <ThemedText style={[styles.completeButtonText, { color: colors.accent }]}>Đánh dấu Xong</ThemedText>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
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
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressSub: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.one,
  },
  refreshButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.two,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  milestoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  milestoneBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  activityDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  activityFooterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  completeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
