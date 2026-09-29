import React from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { careerGoalsApi } from '@/api/career-goals.api';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { styles } from '@/styles/career-profile.styles';
import { formatSeniorityLabel, formatDate } from '@/utils/career-goal-contract';
import { toast } from '@/components/ui/toast/ToastProvider';

interface CareerGoalsCardProps {
  activeGoal: any;
  otherGoals: any[];
  colors: any;
}

export const CareerGoalsCard = ({ activeGoal, otherGoals, colors }: CareerGoalsCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const reactivateGoalMutation = useMutation({
    mutationFn: (id: string) => careerGoalsApi.update(id, { active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      toast.success('Kích hoạt mục tiêu nghề nghiệp thành công!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể kích hoạt mục tiêu.');
    },
  });

  const archiveGoalMutation = useMutation({
    mutationFn: (id: string) => careerGoalsApi.update(id, { active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      toast.success('Đã lưu trữ mục tiêu nghề nghiệp');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể lưu trữ mục tiêu.');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => careerGoalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      toast.success('Đã xóa mục tiêu nghề nghiệp');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể xóa mục tiêu.');
    },
  });

  const handleDeleteGoalPrompt = (goal: { id: string; targetRole: string }) => {
    Alert.alert(
      'Xóa mục tiêu',
      `Bạn có chắc chắn muốn xóa mục tiêu "${goal.targetRole}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteGoalMutation.mutate(goal.id),
        },
      ]
    );
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="flag-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ThemedText style={styles.cardTitle}>Mục tiêu nghề nghiệp</ThemedText>
              {activeGoal && (
                <View style={[styles.activeGoalBadge, { backgroundColor: colors.primaryLight }]}>
                  <ThemedText style={[styles.activeGoalBadgeText, { color: colors.primary }]}>
                    Đang kích hoạt
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.cardSubtitle}>
              Định hướng tuyển dụng được Nexora dùng làm bối cảnh cho phân tích và luyện tập AI.
            </ThemedText>
          </View>
        </View>

        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.cardBorder }]}
          onPress={() => router.push('/(app)/career-goals/create' as any)}
        >
          <Ionicons name="add" size={15} color={colors.text} />
          <ThemedText style={[styles.btnText, { color: colors.text }]}>Thêm mục tiêu</ThemedText>
        </TouchableScale>
      </View>

      {activeGoal ? (
        <View style={[styles.activeGoalContainer, { backgroundColor: colors.backgroundElement }]}>
          <ThemedText style={[styles.activeGoalHeaderLabel, { color: colors.primary }]}>
            MỤC TIÊU HIỆN TẠI
          </ThemedText>

          <View style={styles.grid3Col}>
            <View style={styles.goalFieldItem}>
              <ThemedText style={styles.fieldLabel}>Vị trí mục tiêu</ThemedText>
              <ThemedText style={styles.fieldValBold}>{activeGoal.targetRole}</ThemedText>
            </View>
            <View style={styles.goalFieldItem}>
              <ThemedText style={styles.fieldLabel}>Cấp bậc</ThemedText>
              <ThemedText style={[styles.fieldValBold, { color: colors.primary }]}>
                {formatSeniorityLabel(activeGoal.seniority)}
              </ThemedText>
            </View>
            <View style={styles.goalFieldItem}>
              <ThemedText style={styles.fieldLabel}>Ngành ưu tiên</ThemedText>
              <ThemedText style={styles.fieldValBold}>
                {activeGoal.industry?.trim() || 'Chưa cập nhật'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.grid2Col}>
            <View style={styles.goalFieldItem}>
              <ThemedText style={styles.fieldLabel}>Công ty mục tiêu</ThemedText>
              <ThemedText style={styles.fieldValBold}>
                {activeGoal.targetCompany?.trim() || 'Chưa cập nhật'}
              </ThemedText>
            </View>
            <View style={styles.goalFieldItem}>
              <ThemedText style={styles.fieldLabel}>Mốc thời gian</ThemedText>
              <ThemedText style={styles.fieldValBold}>
                {formatDate(activeGoal.targetDate)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.goalActionsRow}>
            <TouchableScale
              style={[styles.btnOutline, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
              onPress={() => router.push('/(app)/career-goals' as any)}
            >
              <Ionicons name="options-outline" size={14} color={colors.text} />
              <ThemedText style={[styles.btnText, { color: colors.text }]}>
                Chỉnh sửa mục tiêu
              </ThemedText>
            </TouchableScale>
            {activeGoal.id && (
              <TouchableScale
                style={styles.btnGhost}
                onPress={() => archiveGoalMutation.mutate(activeGoal.id)}
                disabled={archiveGoalMutation.isPending}
              >
                <ThemedText style={[styles.btnText, { color: colors.textMuted }]}>
                  {archiveGoalMutation.isPending ? 'Đang xử lý...' : 'Lưu trữ'}
                </ThemedText>
              </TouchableScale>
            )}
          </View>
        </View>
      ) : (
        <EmptyStateCard
          icon="flag-outline"
          title="Chưa có mục tiêu nghề nghiệp"
          description="Hãy thiết lập mục tiêu nghề nghiệp để Nexora giúp bạn chuẩn bị lộ trình tốt nhất và cá nhân hóa trải nghiệm luyện tập AI."
          actionLabel="Tạo mục tiêu đầu tiên"
          onAction={() => router.push('/(app)/career-goals/create' as any)}
        />
      )}

      {otherGoals.length > 0 && (
        <View style={[styles.otherGoalsSection, { borderTopColor: colors.cardBorder }]}>
          <View style={styles.otherGoalsHeader}>
            <ThemedText style={styles.otherGoalsTitle}>Mục tiêu khác</ThemedText>
            <View style={[styles.countBadge, { backgroundColor: colors.primaryLight }]}>
              <ThemedText style={[styles.countBadgeText, { color: colors.primary }]}>
                {otherGoals.length}
              </ThemedText>
            </View>
          </View>

          {otherGoals.map((goal) => (
            <View
              key={goal.id}
              style={[
                styles.inactiveGoalCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.inactiveGoalTitleRow}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <ThemedText style={styles.inactiveGoalRole}>{goal.targetRole}</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>
                    · {formatSeniorityLabel(goal.seniority)}
                  </ThemedText>
                </View>
                <View style={[styles.countBadge, { backgroundColor: colors.cardBorder }]}>
                  <ThemedText style={[styles.countBadgeText, { color: colors.textMuted }]}>
                    Tạm dừng
                  </ThemedText>
                </View>
              </View>

              <View style={styles.inactiveGoalMetaRow}>
                <ThemedText style={styles.inactiveGoalMetaText}>
                  Ngành: {goal.industry?.trim() || 'Chưa cập nhật'}
                </ThemedText>
                <ThemedText style={styles.inactiveGoalMetaText}>
                  Công ty: {goal.targetCompany?.trim() || 'Chưa cập nhật'}
                </ThemedText>
                {goal.targetDate && (
                  <ThemedText style={styles.inactiveGoalMetaText}>
                    Hạn: {formatDate(goal.targetDate)}
                  </ThemedText>
                )}
              </View>

              <View style={styles.goalActionsRow}>
                <TouchableScale
                  style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.primary }]}
                  onPress={() => reactivateGoalMutation.mutate(goal.id)}
                  disabled={reactivateGoalMutation.isPending}
                >
                  <ThemedText style={[styles.btnText, { color: colors.primary, fontSize: 11 }]}>
                    Kích hoạt lại
                  </ThemedText>
                </TouchableScale>
                <TouchableScale
                  style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
                  onPress={() => router.push('/(app)/career-goals' as any)}
                >
                  <ThemedText style={[styles.btnText, { color: colors.text, fontSize: 11 }]}>
                    Chỉnh sửa
                  </ThemedText>
                </TouchableScale>
                <TouchableScale
                  style={[styles.btnGhost, styles.btnSmall]}
                  onPress={() => handleDeleteGoalPrompt(goal)}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.danger} />
                </TouchableScale>
              </View>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
};
