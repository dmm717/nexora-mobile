import React, { useState, useMemo, useEffect } from 'react';
import { ActivityIndicator, ScrollView, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { scenariosApi } from '@/api/scenarios.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/scenarios-detail.styles';
import { ScenarioAttemptHistoryItemResponse, ScenarioEvaluation } from '@/api/types/scenario.types';
import { safeBack } from '@/utils/navigation';

export default function ScenarioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // slug or id
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  // Fetch scenario details
  const { data: scenario, isLoading: isScenarioLoading } = useQuery({
    queryKey: ['scenario-detail', id],
    queryFn: () => scenariosApi.get(id!),
    enabled: !!id,
  });

  // Fetch attempt history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['scenario-history', id],
    queryFn: () => scenariosApi.getHistory(id!),
    enabled: !!id,
  });

  // Automatically select in-progress or latest attempt ID
  const activeAttemptId = useMemo(() => {
    if (selectedAttemptId) return selectedAttemptId;
    if (!history?.attempts || history.attempts.length === 0) return null;
    const inProgress = history.attempts.find(
      (a) => a.status === 'draft' || a.status === 'queued' || a.status === 'processing'
    );
    return inProgress ? inProgress.id : history.attempts[0].id;
  }, [selectedAttemptId, history]);

  // Fetch active attempt details
  const {
    data: activeAttempt,
    isLoading: attemptLoading,
    refetch: refetchAttempt,
  } = useQuery({
    queryKey: ['scenario-attempt', activeAttemptId],
    queryFn: () => scenariosApi.getAttempt(activeAttemptId!),
    enabled: !!activeAttemptId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'draft' || status === 'processing' || status === 'queued') {
        return 3000;
      }
      return false;
    },
  });

  // Sync answer text if active attempt is draft
  useEffect(() => {
    if (activeAttempt?.status === 'draft' && activeAttempt.answer) {
      setAnswer(activeAttempt.answer);
    }
  }, [activeAttempt?.id, activeAttempt?.status]);

  // Start new attempt mutation
  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!scenario?.id) throw new Error('Chưa chọn tình huống');
      return await scenariosApi.createAttempt(scenario.id);
    },
    onSuccess: (newAttempt) => {
      setSelectedAttemptId(newAttempt.id);
      setAnswer(newAttempt.answer || '');
      queryClient.invalidateQueries({ queryKey: ['scenario-history', id] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể tạo lượt thử mới.');
    },
  });

  // Submit attempt mutation
  const submitAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!answer.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');
      let targetAttemptId = activeAttemptId;

      if (!targetAttemptId || activeAttempt?.status !== 'draft') {
        try {
          const draftAttempt = await scenariosApi.createAttempt(scenario!.id);
          targetAttemptId = draftAttempt.id;
        } catch (err: any) {
          const errCode = err?.code || err?.response?.data?.error?.code;
          if (errCode === 'SCENARIO_ATTEMPT_IN_PROGRESS' || err?.status === 409 || err?.response?.status === 409) {
            const inProgress = history?.attempts?.find(
              (a) => a.status === 'draft' || a.status === 'queued' || a.status === 'processing'
            );
            if (inProgress) {
              targetAttemptId = inProgress.id;
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }

      const submitted = await scenariosApi.submitAttempt(targetAttemptId!, answer.trim());
      return submitted;
    },
    onSuccess: (data) => {
      setSelectedAttemptId(data.id);
      queryClient.invalidateQueries({ queryKey: ['scenario-history', id] });
      queryClient.invalidateQueries({ queryKey: ['scenario-attempt', data.id] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể nộp bài làm tình huống. Vui lòng thử lại.');
    },
  });

  // Retry scenario mutation
  const retryMutation = useMutation({
    mutationFn: async () => {
      if (!scenario?.id) throw new Error('Chưa chọn tình huống');
      return await scenariosApi.retry(scenario.id);
    },
    onSuccess: (newAttempt) => {
      setSelectedAttemptId(newAttempt.id);
      setAnswer('');
      queryClient.invalidateQueries({ queryKey: ['scenario-history', id] });
      queryClient.invalidateQueries({ queryKey: ['scenario-attempt', newAttempt.id] });
    },
    onError: (err: any) => {
      const errCode = err?.code || err?.response?.data?.error?.code;
      if (errCode === 'SCENARIO_ATTEMPT_IN_PROGRESS' || err?.status === 409 || err?.response?.status === 409) {
        const inProgress = history?.attempts?.find(
          (a) => a.status === 'draft' || a.status === 'queued' || a.status === 'processing'
        );
        if (inProgress) {
          setSelectedAttemptId(inProgress.id);
          setAnswer(inProgress.answer || '');
          return;
        }
      }
      Alert.alert('Lỗi', err.message || 'Không thể tạo lượt luyện tập mới.');
    },
  });

  const formatDifficultyLabel = (diff: string) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'DỄ';
    if (d === 'medium') return 'TRUNG BÌNH';
    if (d === 'hard') return 'KHÓ';
    return diff.toUpperCase();
  };

  if (isScenarioLoading || !scenario) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <AppScreenHeader title="Kịch Bản Tình Huống" fallbackRoute="/(app)/scenarios" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Scenario Briefing Header */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
                  {scenario.categoryName}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      (scenario.difficulty || '').toLowerCase() === 'easy'
                        ? '#e0f2fe'
                        : (scenario.difficulty || '').toLowerCase() === 'medium'
                          ? '#fef3c7'
                          : '#fee2e2',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.badgeText,
                    {
                      color:
                        (scenario.difficulty || '').toLowerCase() === 'easy'
                          ? '#0369a1'
                          : (scenario.difficulty || '').toLowerCase() === 'medium'
                            ? '#b45309'
                            : '#b91c1c',
                    },
                  ]}
                >
                  {formatDifficultyLabel(scenario.difficulty)}
                </ThemedText>
              </View>

              {scenario.competency ? (
                <View style={[styles.badge, { backgroundColor: '#e0e7ff' }]}>
                  <ThemedText style={[styles.badgeText, { color: '#3730a3' }]}>
                    {scenario.competency}
                  </ThemedText>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>
                  {scenario.estimatedMinutes} phút
                </ThemedText>
              </View>
            </View>

            <ThemedText type="subtitle" style={styles.scenarioTitle}>
              {scenario.title}
            </ThemedText>

            <ThemedText style={styles.scenarioSummary}>{scenario.summary}</ThemedText>

            <View style={[styles.contentBox, { backgroundColor: colors.backgroundElement }]}>
              <ThemedText style={styles.contentHeader}>📌 Bối Cảnh & Đề Bài Tình Huống:</ThemedText>
              <FormattedScenarioContent text={scenario.content || scenario.summary} colors={colors} />
            </View>

            {/* Guidelines Box */}
            <View style={styles.guidelinesBox}>
              <ThemedText style={styles.guidelinesTitle}>💡 Gợi ý cấu trúc trả lời hiệu quả:</ThemedText>
              <ThemedText style={styles.guidelinesText}>
                1. <ThemedText style={{ fontWeight: '700' }}>Phân tích vấn đề:</ThemedText> Xác định rủi ro cốt lõi, người liên quan chính.
              </ThemedText>
              <ThemedText style={styles.guidelinesText}>
                2. <ThemedText style={{ fontWeight: '700' }}>Hành động cụ thể:</ThemedText> Các bước xử lý ngay lập tức và giải pháp dài hạn.
              </ThemedText>
              <ThemedText style={styles.guidelinesText}>
                3. <ThemedText style={{ fontWeight: '700' }}>Đo lường & Bài học:</ThemedText> Kết quả đạt được hoặc cơ chế phòng ngừa.
              </ThemedText>
            </View>
          </View>

          {/* Interactive Workbench Area */}
          {!activeAttemptId && !historyLoading ? (
            /* Prompt Hero: No active attempt started */
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center', paddingVertical: Spacing.five }]}>
              <Ionicons name="play-circle-outline" size={48} color={colors.primary} />
              <ThemedText type="subtitle" style={{ marginTop: Spacing.two, fontWeight: '700' }}>
                Sẵn sàng thử sức với tình huống này?
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', opacity: 0.7, marginVertical: Spacing.two, fontSize: 13 }}>
                Khởi tạo lượt luyện tập mới để nhận phản hồi chuyên sâu và đo lường tiến bộ kỹ năng.
              </ThemedText>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary, width: '100%', marginTop: Spacing.two }]}
                onPress={() => startAttemptMutation.mutate()}
                disabled={startAttemptMutation.isPending}
              >
                {startAttemptMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="flash" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <ThemedText style={styles.submitButtonText}>Bắt Đầu Làm Bài</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : attemptLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Đang tải dữ liệu bài làm...</ThemedText>
            </View>
          ) : activeAttempt ? (
            <>
              {/* State 1: DRAFT (Answer Textarea & Microphone) */}
              {activeAttempt.status === 'draft' && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                    <ThemedText type="subtitle" style={styles.cardTitle}>Phương Án Xử Lý Của Bạn</ThemedText>
                  </View>

                  <TextInput
                    style={[
                      styles.textArea,
                      { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }
                    ]}
                    placeholder="Mô tả chi tiết cách bạn sẽ xử lý tình huống này theo bối cảnh thực tế..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={8}
                    value={answer}
                    onChangeText={setAnswer}
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ThemedText style={{ fontSize: 12, color: answer.length >= 50 ? colors.accent : colors.textMuted }}>
                      Độ dài: {answer.length} ký tự {answer.length < 50 ? '(khuyến nghị >= 50)' : '✓'}
                    </ThemedText>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        { backgroundColor: colors.primary, width: '100%' },
                        (!answer.trim() || submitAttemptMutation.isPending) && styles.disabledButton
                      ]}
                      onPress={() => submitAttemptMutation.mutate()}
                      disabled={!answer.trim() || submitAttemptMutation.isPending}
                    >
                      {submitAttemptMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 6 }} />
                          <ThemedText style={styles.submitButtonText}>Nộp Bài & Chấm Điểm AI</ThemedText>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* State 2: QUEUED or PROCESSING */}
              {(activeAttempt.status === 'queued' || activeAttempt.status === 'processing') && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, paddingVertical: Spacing.five }]}>
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: Spacing.two }} />
                    <ThemedText type="subtitle" style={{ textAlign: 'center', fontWeight: '700' }}>
                      {activeAttempt.status === 'queued'
                        ? 'Đang chờ xử lý trong hàng đợi...'
                        : 'AI đang phân tích phương án của bạn...'}
                    </ThemedText>
                    <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginTop: 8, fontSize: 13, lineHeight: 18 }}>
                      Hệ thống đang đối chiếu câu trả lời với tiêu chí năng lực chuyên môn, ghi nhận bằng chứng thực tế và tổng hợp điểm số. Kết quả sẽ tự động cập nhật ngay khi hoàn tất.
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* State 3: COMPLETED (Structured Evaluation View) */}
              {activeAttempt.status === 'completed' && (activeAttempt.evaluation || (activeAttempt as any).Evaluation) && (
                <ScenarioEvaluationCard
                  evaluation={activeAttempt.evaluation || (activeAttempt as any).Evaluation}
                  onRetry={() => retryMutation.mutate()}
                  isRetrying={retryMutation.isPending}
                  colors={colors}
                />
              )}

              {/* State 4: FAILED */}
              {activeAttempt.status === 'failed' && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={24} color={colors.danger} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ color: colors.danger, fontWeight: '700' }}>Đánh giá chưa thành công</ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
                        Mã lỗi: {activeAttempt.errorCode || 'UNKNOWN_ERROR'}. Bạn có thể khởi tạo lượt mới để tiếp tục.
                      </ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary, marginTop: Spacing.two }]}
                    onPress={() => retryMutation.mutate()}
                    disabled={retryMutation.isPending}
                  >
                    {retryMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText style={styles.submitButtonText}>Bắt Đầu Lượt Mới</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : null}

          {/* History View */}
          {history && history.attempts && history.attempts.length > 0 && (
            <ScenarioHistorySection
              history={history}
              activeAttemptId={activeAttemptId || undefined}
              onSelectAttempt={(attemptId) => setSelectedAttemptId(attemptId)}
              expandedId={expandedAttemptId}
              setExpandedId={setExpandedAttemptId}
              colors={colors}
            />
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="practice" />
      </SafeAreaView>
    </ThemedView>
  );
}

interface NormalizedDimension {
  criterion: string;
  score: number;
  evidence: string;
  feedback: string;
}

interface NormalizedEvaluation {
  overallScore: number | null;
  feedback: string;
  dimensions: NormalizedDimension[];
  strengths: string[];
  gaps: string[];
  recommendedApproach: string[];
}

function normalizeEvaluation(raw: any): NormalizedEvaluation | null {
  if (!raw) return null;

  const rawDimensions = raw.dimensions || raw.Dimensions || raw.dimensionEvaluations || [];
  const dimensions: NormalizedDimension[] = Array.isArray(rawDimensions)
    ? rawDimensions.map((dim: any) => ({
        criterion:
          dim.criterion ||
          dim.Criterion ||
          dim.name ||
          dim.Name ||
          dim.criterionName ||
          dim.title ||
          'Tiêu chí',
        score: typeof dim.score === 'number' ? dim.score : typeof dim.Score === 'number' ? dim.Score : 0,
        evidence: dim.evidence || dim.Evidence || '',
        feedback: dim.feedback || dim.Feedback || '',
      }))
    : [];

  const rawStrengths = raw.strengths || raw.Strengths || [];
  const strengths: string[] = Array.isArray(rawStrengths)
    ? rawStrengths.filter((s: any) => typeof s === 'string' && s.trim())
    : [];

  const rawGaps = raw.gaps || raw.Gaps || [];
  const gaps: string[] = Array.isArray(rawGaps)
    ? rawGaps.filter((g: any) => typeof g === 'string' && g.trim())
    : [];

  const rawApproach = raw.recommendedApproach || raw.RecommendedApproach || raw.recommendations || [];
  const recommendedApproach: string[] = Array.isArray(rawApproach)
    ? rawApproach.filter((a: any) => typeof a === 'string' && a.trim())
    : [];

  const rawOverallScore = raw.overallScore ?? raw.OverallScore ?? raw.score ?? null;

  return {
    overallScore: typeof rawOverallScore === 'number' ? rawOverallScore : null,
    feedback: raw.feedback || raw.Feedback || '',
    dimensions,
    strengths,
    gaps,
    recommendedApproach,
  };
}

// Structured Evaluation Component
const ScenarioEvaluationCard = React.memo(({
  evaluation,
  onRetry,
  isRetrying,
  colors,
}: {
  evaluation: ScenarioEvaluation;
  onRetry: () => void;
  isRetrying: boolean;
  colors: any;
}) => {
  const normEval = useMemo(() => normalizeEvaluation(evaluation), [evaluation]);

  if (!normEval) return null;

  const score = normEval.overallScore;

  return (
    <View style={{ gap: Spacing.three }}>
      {/* Score Hero */}
      <View style={styles.evalScoreHero}>
        <View style={styles.scoreGauge}>
          <ThemedText style={styles.scoreGaugeText}>
            {score !== null && score !== undefined ? score : '--'}
          </ThemedText>
          <ThemedText style={styles.scoreGaugeLabel}>/100</ThemedText>
        </View>

        <View style={styles.evalScoreContent}>
          <ThemedText style={styles.evalScoreTitle}>Đánh giá tổng quan</ThemedText>
          <ThemedText style={styles.evalScoreFeedback}>
            {normEval.feedback || 'Chưa có nhận xét tổng quan cho lượt luyện tập này.'}
          </ThemedText>
        </View>
      </View>

      {/* Dimensions Breakdown */}
      {normEval.dimensions && normEval.dimensions.length > 0 && (
        <View>
          <ThemedText style={[styles.sectionHeading, { color: colors.text }]}>Phân tích theo tiêu chí</ThemedText>
          {normEval.dimensions.map((dim, idx) => (
            <View key={`dim-${idx}`} style={styles.dimensionCard}>
              <View style={styles.dimensionHeader}>
                <ThemedText style={[styles.dimensionName, { color: colors.text }]}>{dim.criterion}</ThemedText>
                <View
                  style={[
                    styles.dimensionBadge,
                    {
                      backgroundColor:
                        dim.score >= 80 ? '#dcfce7' : dim.score >= 60 ? '#fef3c7' : '#fee2e2',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.dimensionBadgeText,
                      {
                        color:
                          dim.score >= 80 ? '#15803d' : dim.score >= 60 ? '#b45309' : '#b91c1c',
                      },
                    ]}
                  >
                    {dim.score}/100
                  </ThemedText>
                </View>
              </View>

              {dim.evidence ? (
                <View style={[styles.dimensionEvidenceBox, { backgroundColor: colors.backgroundElement, borderLeftColor: colors.primary }]}>
                  <ThemedText style={[styles.dimensionEvidenceText, { color: colors.text }]}>
                    &ldquo;{dim.evidence}&rdquo;
                  </ThemedText>
                </View>
              ) : null}

              {dim.feedback ? (
                <ThemedText style={styles.dimensionFeedbackText}>{dim.feedback}</ThemedText>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Strengths */}
      {normEval.strengths && normEval.strengths.length > 0 && (
        <View style={styles.strengthsCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="checkmark-circle" size={18} color="#047857" />
            <ThemedText style={styles.strengthsTitle}>Điểm mạnh ghi nhận</ThemedText>
          </View>
          {normEval.strengths.map((str, idx) => (
            <View key={`str-${idx}`} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#059669" style={{ marginTop: 6 }} />
              <ThemedText style={[styles.bulletText, { color: '#065f46' }]}>{str}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Gaps */}
      {normEval.gaps && normEval.gaps.length > 0 && (
        <View style={styles.gapsCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="warning" size={18} color="#b45309" />
            <ThemedText style={styles.gapsTitle}>Điểm cần hoàn thiện</ThemedText>
          </View>
          {normEval.gaps.map((gap, idx) => (
            <View key={`gap-${idx}`} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#d97706" style={{ marginTop: 6 }} />
              <ThemedText style={[styles.bulletText, { color: '#78350f' }]}>{gap}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Recommended Approach */}
      {normEval.recommendedApproach && normEval.recommendedApproach.length > 0 && (
        <View style={styles.approachCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bulb" size={18} color="#1d4ed8" />
            <ThemedText style={styles.approachTitle}>Hướng tiếp cận chuyên gia khuyến nghị</ThemedText>
          </View>
          {normEval.recommendedApproach.map((step, idx) => (
            <View key={`step-${idx}`} style={styles.stepRow}>
              <ThemedText style={styles.stepNum}>{idx + 1}.</ThemedText>
              <ThemedText style={styles.stepText}>{step}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Retry Action */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
            <ThemedText style={styles.submitButtonText}>Thử Lại Tình Huống Này</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
});

// Structured History Section Component
const ScenarioHistorySection = React.memo(({
  history,
  activeAttemptId,
  onSelectAttempt,
  expandedId,
  setExpandedId,
  colors,
}: {
  history: any;
  activeAttemptId?: string;
  onSelectAttempt: (attemptId: string) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  colors: any;
}) => {
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeaderRow}>
        <Ionicons name="time" size={20} color={colors.primary} />
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Lịch Sử Thử Sức ({history.attempts.length} lần)
        </ThemedText>
      </View>

      <View style={styles.historyStatsRow}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Gần nhất</ThemedText>
          <ThemedText style={[styles.statValue, { color: colors.primary }]}>
            {history.latestScore !== null && history.latestScore !== undefined ? `${history.latestScore}/100` : '—'}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Kỷ lục</ThemedText>
          <ThemedText style={[styles.statValue, { color: colors.accent }]}>
            {history.bestScore !== null && history.bestScore !== undefined ? `${history.bestScore}/100` : '—'}
          </ThemedText>
        </View>
      </View>

      <View style={{ marginTop: Spacing.two }}>
        {history.attempts.map((item: ScenarioAttemptHistoryItemResponse) => {
          const isSelected = activeAttemptId === item.id;
          const isExpanded = expandedId === item.id;

          const itemOverallScore = item.overallScore ?? (item as any).OverallScore ?? null;
          const itemScoreDelta = item.scoreDelta ?? (item as any).ScoreDelta ?? null;

          const deltaText =
            itemScoreDelta !== null && itemScoreDelta !== undefined
              ? itemScoreDelta > 0
                ? `+${itemScoreDelta}`
                : `${itemScoreDelta}`
              : 'Khởi điểm';

          return (
            <View
              key={item.id}
              style={[
                styles.historyItemRow,
                isSelected && styles.historyItemRowSelected,
              ]}
            >
              <View style={styles.historyItemHeader}>
                <ThemedText style={styles.historyNum}>#{item.attemptNumber}</ThemedText>
                <ThemedText style={styles.historyDate}>{formatDate(item.createdAt)}</ThemedText>
              </View>

              <View style={styles.historyActionsRow}>
                <ThemedText style={[styles.historyScoreText, { color: colors.text }]}>
                  {itemOverallScore !== null && itemOverallScore !== undefined ? `${itemOverallScore}/100` : '--'}
                </ThemedText>

                <View
                  style={[
                    styles.historyDeltaBadge,
                    {
                      backgroundColor:
                        itemScoreDelta && itemScoreDelta > 0 ? '#dcfce7' : '#f1f5f9',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.historyDeltaText,
                      { color: itemScoreDelta && itemScoreDelta > 0 ? '#15803d' : '#64748b' },
                    ]}
                  >
                    {deltaText}
                  </ThemedText>
                </View>

                {item.answer ? (
                  <TouchableOpacity
                    style={styles.historyButtonSmall}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <ThemedText style={styles.historyButtonTextSmall}>
                      {isExpanded ? 'Thu gọn' : 'Xem bài làm'}
                    </ThemedText>
                  </TouchableOpacity>
                ) : null}

                {item.status === 'completed' && !isSelected && (
                  <TouchableOpacity
                    style={[styles.historyButtonSmall, { backgroundColor: colors.primaryLight }]}
                    onPress={() => onSelectAttempt(item.id)}
                  >
                    <ThemedText style={[styles.historyButtonTextSmall, { color: colors.primary }]}>
                      Xem báo cáo
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {isExpanded && item.answer && (
                <View style={styles.quoteBox}>
                  <ThemedText style={styles.quoteLabel}>CÂU TRẢ LỜI ĐÃ NỘP:</ThemedText>
                  <ThemedText style={styles.quoteText}>{item.answer}</ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
});

type ContentBlock =
  | { type: 'h3'; content: string }
  | { type: 'h4'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'p'; content: string };

function parseMarkdownBlocks(text: string): ContentBlock[] {
  if (!text) return [];
  const lines = text.split('\n');
  const blocks: ContentBlock[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: [...currentList] });
      currentList = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.replace(/^- \s*/, ''));
      continue;
    }

    flushList();

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h3', content: trimmed.replace(/^# \s*/, '') });
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      blocks.push({ type: 'h4', content: trimmed.replace(/^###?\s*/, '') });
    } else {
      blocks.push({ type: 'p', content: trimmed });
    }
  }
  flushList();
  return blocks;
}

const FormattedScenarioContent = ({ text, colors }: { text: string; colors: any }) => {
  const blocks = useMemo(() => parseMarkdownBlocks(text), [text]);

  return (
    <View style={{ gap: 6 }}>
      {blocks.map((block, idx) => {
        if (block.type === 'h3' || block.type === 'h4') {
          return (
            <ThemedText key={`h-${idx}`} style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 4 }}>
              {block.content}
            </ThemedText>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={`ul-${idx}`} style={{ gap: 4, paddingLeft: 4 }}>
              {block.items.map((item, itemIdx) => (
                <View key={`li-${idx}-${itemIdx}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                  <ThemedText style={{ fontSize: 13, color: colors.primary, fontWeight: '700' }}>•</ThemedText>
                  <ThemedText style={{ fontSize: 13, lineHeight: 19, color: colors.text, flex: 1 }}>{item}</ThemedText>
                </View>
              ))}
            </View>
          );
        }
        return (
          <ThemedText key={`p-${idx}`} style={{ fontSize: 13, lineHeight: 19, color: colors.text }}>
            {block.content}
          </ThemedText>
        );
      })}
    </View>
  );
};
