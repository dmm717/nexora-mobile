import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, ScrollView, View, ListRenderItemInfo, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { interviewApi } from '@/api/interview.api';
import { scenariosApi } from '@/api/scenarios.api';
import { starApi } from '@/api/star.api';
import { growthApi } from '@/api/growth.api';
import { profileApi } from '@/api/profile.api';
import { styles } from '@/styles/practice.styles';

type HistoryFilter = 'all' | 'interview' | 'scenario' | 'star';

export default function PracticeTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  // Fetch Next Best Action Recommendation & Profiles
  const { data: recommendation } = useQuery({
    queryKey: ['next-recommendation'],
    queryFn: growthApi.getNextRecommendation,
  });

  const { data: careerProfile } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress-dashboard'],
    queryFn: growthApi.getProgressDashboard,
  });

  // Fetch Learning Path summary
  const { data: learningPath } = useQuery({
    queryKey: ['learning-path'],
    queryFn: growthApi.getLearningPath,
  });

  // Fetch practice histories
  const { data: interviewHistory, isLoading: isInterviewsLoading } = useQuery({
    queryKey: ['interview-history'],
    queryFn: () => interviewApi.list(1, 15),
  });

  const { data: scenarioAttempts, isLoading: isScenariosLoading } = useQuery({
    queryKey: ['scenario-attempts'],
    queryFn: () => scenariosApi.listAttempts(),
  });

  const { data: starAttempts, isLoading: isStarsLoading } = useQuery({
    queryKey: ['star-attempts'],
    queryFn: () => starApi.list(),
  });

  const isHistoryLoading = isInterviewsLoading || isScenariosLoading || isStarsLoading;

  // Resolve Next Best Action Card content
  const nextAction = useMemo(() => {
    const targetRole = careerProfile?.activeCareerGoal?.targetRole;
    const needsFirstEvidence = progress?.readiness?.score === null || progress?.readiness?.score === undefined;

    let label = 'Tạo buổi thực hành tiếp theo';
    let description = 'Chọn bài luyện phù hợp với điều bạn muốn cải thiện tiếp theo.';
    let destination: string | null = '/(app)/interview/preflight';
    let estimatedMinutes: number | undefined =
      recommendation?.estimatedMinutes && recommendation.estimatedMinutes > 0
        ? recommendation.estimatedMinutes
        : undefined;

    if (recommendation?.activityType === 'star' || recommendation?.activityType === 'star_drill') {
      label = 'Luyện phản xạ STAR';
      description = recommendation.reason || 'Bẻ gãy thói quen lan man, định lượng hóa thành phần Kết quả (Result).';
      destination = '/(app)/star-builder';
    } else if (recommendation?.activityType === 'scenario') {
      label = 'Luyện tình huống thực tế';
      description = recommendation.reason || 'Luyện tập phương án xử lý tình huống thực tế theo vị trí chuyên môn.';
      destination = recommendation.resourceId ? `/(app)/scenarios/${recommendation.resourceId}` : '/(app)/scenarios';
    } else if (recommendation?.activityType === 'interview') {
      const isRetry = recommendation.action?.type === 'repeat_question';
      label = isRetry ? 'Luyện lại câu hỏi phỏng vấn' : 'Luyện phỏng vấn AI';
      description = recommendation.reason || 'Trả lời câu hỏi 1-1 với AI, nhận phân tích Rubric 4 tiêu chí.';
      destination = '/(app)/interview/preflight';
    } else if (recommendation?.activityType === 'resume' || recommendation?.activityType === 'resume_improvement') {
      label = 'Cải thiện CV';
      description = recommendation.reason || 'Tải lên hoặc phân tích CV để cập nhật bằng chứng năng lực.';
      destination = '/(tabs)/cv-jd';
    } else if (needsFirstEvidence) {
      label = targetRole ? `Phân tích CV theo mục tiêu ${targetRole}` : 'Thiết lập mục tiêu và phân tích CV đầu tiên';
      description = 'Chọn vị trí bạn đang hướng tới và thêm CV để bắt đầu xây dựng bằng chứng năng lực của riêng bạn.';
      destination = '/(tabs)/cv-jd';
    } else if (!targetRole) {
      label = 'Thiết lập mục tiêu nghề nghiệp';
      description = 'Chọn vai trò mục tiêu để các đề xuất bài luyện có bối cảnh phù hợp.';
      destination = '/(app)/career-goals';
    }

    return { label, description, destination, estimatedMinutes };
  }, [recommendation, careerProfile, progress]);

  // Combine practice history items (Interviews, Scenarios & STAR)
  const unifiedHistory = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'interview' | 'scenario' | 'star';
      title: string;
      subtitle: string;
      date: string;
      score?: number | null;
      actionUrl: string;
      actionLabel: string;
    }> = [];

    // 1. Interviews
    (interviewHistory?.items || []).forEach((iv: any) => {
      const isCompleted = iv.status === 'completed' || Boolean(iv.reportAvailable);
      const isRepeat = Boolean(iv.sourceInterviewId || iv.sourceQuestionId || iv.practiceReason);
      list.push({
        id: `iv-${iv.id}`,
        type: 'interview',
        title: isRepeat
          ? (iv.role || 'Phỏng vấn AI')
          : iv.interviewType === 'behavioral'
          ? `Phỏng vấn ứng xử: ${iv.role || 'Chuyên môn'}`
          : `Phỏng vấn kỹ thuật: ${iv.role || 'Chuyên môn'}`,
        subtitle: `${iv.role || 'Ứng viên'}${iv.seniority ? ` (${iv.seniority})` : ''} • ${isCompleted ? 'Hoàn thành' : 'Đang diễn ra'}`,
        date: iv.createdAt,
        score: null,
        actionUrl: isCompleted ? `/(app)/interview/report/${iv.id}` : `/(app)/interview/${iv.id}`,
        actionLabel: isCompleted ? 'Báo cáo' : 'Vào lại',
      });
    });

    // 2. Scenarios
    (scenarioAttempts || []).forEach((sc) => {
      list.push({
        id: `sc-${sc.id}`,
        type: 'scenario',
        title: `Tình huống: ${sc.scenarioTitle || 'Kịch bản'}`,
        subtitle: sc.status === 'completed' ? 'Hoàn thành' : 'Đang thực hiện',
        date: sc.createdAt,
        score: sc.evaluation?.overallScore ?? null,
        actionUrl: `/(app)/scenarios/${sc.scenarioId || sc.id}`,
        actionLabel: 'Xem bài',
      });
    });

    // 3. STAR Attempts
    (starAttempts || []).forEach((st) => {
      list.push({
        id: `star-${st.id}`,
        type: 'star',
        title: 'Luyện phản xạ STAR',
        subtitle: st.question || 'Câu hỏi STAR',
        date: st.createdAt,
        score: st.evaluation?.overallScore ?? null,
        actionUrl: '/(app)/star-builder',
        actionLabel: 'Chi tiết',
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interviewHistory, scenarioAttempts, starAttempts]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return unifiedHistory;
    return unifiedHistory.filter((item) => item.type === historyFilter);
  }, [unifiedHistory, historyFilter]);

  const listData = [
    { id: 'next_action', type: 'next_action' },
    { id: 'tools', type: 'tools' },
    { id: 'learning_path', type: 'learning_path' },
    { id: 'history', type: 'history' },
  ];

  const renderItem = ({ item }: ListRenderItemInfo<(typeof listData)[0]>) => {
    if (item.type === 'next_action') {
      return (
        <GlassCard
          style={{
            padding: Spacing.four,
            borderRadius: Radius.lg,
            backgroundColor: colors.card,
            borderColor: colors.primary,
            borderWidth: 1.5,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: Radius.md,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                    Hành động tốt nhất tiếp theo
                  </ThemedText>
                </View>
                {nextAction.estimatedMinutes && (
                  <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
                    ⏱ {nextAction.estimatedMinutes} phút
                  </ThemedText>
                )}
              </View>
              <ThemedText style={{ fontSize: 16, fontWeight: '800', marginTop: 6, color: colors.text }}>
                {nextAction.label}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 18 }}>
                {nextAction.description}
              </ThemedText>

              <TouchableScale
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: Radius.md,
                  alignSelf: 'flex-start',
                  marginTop: Spacing.three,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
                onPress={() => {
                  if (nextAction.destination) {
                    router.push(nextAction.destination as any);
                  }
                }}
              >
                <ThemedText style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>
                  Thực hiện ngay
                </ThemedText>
                <Ionicons name="play" size={14} color="#ffffff" />
              </TouchableScale>
            </View>
          </View>
        </GlassCard>
      );
    }
    if (item.type === 'tools') {
      return (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>3 Chế độ rèn luyện độc lập</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.three, paddingRight: Spacing.two }}>
            {/* Card 1: Mock Interview */}
            <TouchableScale
              style={{ width: 200 }}
              onPress={() => router.push('/(app)/interview/preflight' as any)}
            >
              <GlassCard style={styles.gridCard}>
                <View style={[styles.gridIconBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="mic" size={24} color={colors.primary} />
                </View>
                <ThemedText style={styles.gridTitle}>Phỏng Vấn AI</ThemedText>
                <ThemedText style={styles.gridSub} numberOfLines={2}>
                  Luyện phỏng vấn 1-1 giọng nói/text, đánh giá Rubric 4 tiêu chí
                </ThemedText>
              </GlassCard>
            </TouchableScale>

            {/* Card 2: Scenarios */}
            <TouchableScale
              style={{ width: 200 }}
              onPress={() => router.push('/(app)/scenarios' as any)}
            >
              <GlassCard style={styles.gridCard}>
                <View style={[styles.gridIconBadge, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="construct" size={24} color={colors.accent} />
                </View>
                <ThemedText style={styles.gridTitle}>Kho Kịch Bản</ThemedText>
                <ThemedText style={styles.gridSub} numberOfLines={2}>
                  Xử lý tình huống thực tế theo vị trí & cấp bậc chuyên môn
                </ThemedText>
              </GlassCard>
            </TouchableScale>

            {/* Card 3: STAR Builder */}
            <TouchableScale
              style={{ width: 200 }}
              onPress={() => router.push('/(app)/star-builder' as any)}
            >
              <GlassCard style={styles.gridCard}>
                <View style={[styles.gridIconBadge, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="star" size={24} color={colors.warning} />
                </View>
                <ThemedText style={styles.gridTitle}>Mô hình STAR</ThemedText>
                <ThemedText style={styles.gridSub} numberOfLines={2}>
                  Bẻ gãy thói quen lan man, chuẩn hóa 4 thành phần S-T-A-R
                </ThemedText>
              </GlassCard>
            </TouchableScale>
          </ScrollView>
        </View>
      );
    }

    if (item.type === 'learning_path') {
      const percentage = learningPath?.progress?.percentage ?? 0;
      return (
        <TouchableScale onPress={() => router.push('/(app)/growth/learning-path' as any)}>
          <GlassCard style={{ padding: Spacing.four, borderRadius: Radius.lg, backgroundColor: colors.card, borderColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
              <View style={{ width: 44, height: 44, borderRadius: Radius.md, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="map-outline" size={24} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ThemedText style={{ fontSize: 15, fontWeight: '700' }}>Lộ Trình Phát Triển</ThemedText>
                  {percentage > 0 && (
                    <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <ThemedText style={{ fontSize: 10, fontWeight: '700', color: colors.primary }}>{percentage}%</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  Theo dõi các cột mốc & bài học cá nhân hóa
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </GlassCard>
        </TouchableScale>
      );
    }

    return (
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two }}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Lịch sử luyện tập</ThemedText>
          <TouchableOpacity onPress={() => router.push('/(app)/interview/history' as any)}>
            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Tất cả phỏng vấn ›</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: Spacing.two, flexWrap: 'wrap' }}>
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'interview', label: 'Phỏng vấn' },
              { id: 'scenario', label: 'Tình huống' },
              { id: 'star', label: 'Luyện STAR' },
            ] as const
          ).map((tab) => {
            const isSelected = historyFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.cardBorder },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setHistoryFilter(tab.id)}
              >
                <ThemedText style={[{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }, isSelected && { color: '#fff' }]}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* History items */}
        {isHistoryLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : filteredHistory.length > 0 ? (
          <View style={{ gap: Spacing.two }}>
            {filteredHistory.slice(0, 8).map((h) => {
              const iconName = h.type === 'interview' ? 'mic-outline' : h.type === 'scenario' ? 'construct-outline' : 'star-outline';
              const iconColor = h.type === 'interview' ? colors.primary : h.type === 'scenario' ? colors.accent : colors.warning;
              const dateStr = new Date(h.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

              return (
                <TouchableScale key={h.id} onPress={() => router.push(h.actionUrl as any)}>
                  <GlassCard style={styles.listCard}>
                    <View style={[styles.iconBadge, { backgroundColor: `${iconColor}15` }]}>
                      <Ionicons name={iconName} size={22} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.listTitle} numberOfLines={1}>{h.title}</ThemedText>
                      <ThemedText style={styles.listSub} numberOfLines={1}>{h.subtitle} • {dateStr}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {h.score != null && (
                        <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{h.score}đ</ThemedText>
                      )}
                      <ThemedText style={{ fontSize: 11, color: colors.primary, fontWeight: '600', marginRight: 2 }}>{h.actionLabel}</ThemedText>
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </View>
                  </GlassCard>
                </TouchableScale>
              );
            })}
          </View>
        ) : (
          <ThemedText style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginVertical: 12 }}>
            Chưa có lịch sử luyện tập ở mục này.
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Trung Tâm Luyện Tập</ThemedText>
          <ThemedText style={styles.headerSub}>Rèn luyện kỹ năng xử lý tình huống thực tế & phản xạ STAR</ThemedText>
        </View>

        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </AmbientBackground>
  );
}


