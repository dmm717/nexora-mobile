import React, { useState, useMemo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { starApi } from '@/api/star.api';
import { speechService } from '@/services/speech';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/star-builder.styles';
import { safeBack } from '@/utils/navigation';

export default function StarBuilderScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const params = useLocalSearchParams<{ question?: string; scenario?: string }>();
  const [question, setQuestion] = useState(params.question || '');
  const [answer, setAnswer] = useState('');
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (params.question) {
      setQuestion(params.question);
    } else if (params.scenario) {
      setQuestion(`Tình huống phỏng vấn: ${params.scenario}`);
    }
  }, [params.question, params.scenario]);

  const { data: starAttempts } = useQuery({
    queryKey: ['star-attempts'],
    queryFn: starApi.list,
  });

  const { data: activeAttempt } = useQuery({
    queryKey: ['star-attempt', attemptId],
    queryFn: () => starApi.get(attemptId!),
    enabled: !!attemptId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'queued' || status === 'processing') {
        return 3000;
      }
      return false;
    }
  });

  const createStarMutation = useMutation({
    mutationFn: async () => {
      if (!question.trim()) throw new Error('Vui lòng nhập câu hỏi phỏng vấn');
      if (!answer.trim()) throw new Error('Vui lòng nhập câu trả lời');

      const res = await starApi.create({
        question: question.trim(),
        answer: answer.trim(),
      });
      return res;
    },
    onSuccess: (data) => {
      setAttemptId(data.id);
      queryClient.invalidateQueries({ queryKey: ['star-attempts'] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể phân tích mô hình STAR. Vui lòng thử lại.');
    }
  });

  const evaluation = activeAttempt?.evaluation || (activeAttempt as any)?.Evaluation;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <AppScreenHeader title="Chuẩn Hóa STAR Builder AI" fallbackRoute="/(tabs)/practice" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <StarQuestionInputCard question={question} setQuestion={setQuestion} colors={colors} />

          <StarAnswerInputCard
            colors={colors}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={() => createStarMutation.mutate()}
            isSubmitting={createStarMutation.isPending}
          />

          {attemptId && activeAttempt && (
            <StarEvaluationResultCard
              activeAttempt={activeAttempt}
              evaluation={evaluation}
              colors={colors}
            />
          )}

          {starAttempts && starAttempts.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>Lịch Sử Phân Tích STAR ({starAttempts.length})</ThemedText>
              <View style={{ gap: Spacing.two, marginTop: Spacing.one }}>
                {starAttempts.slice(0, 5).map((att) => (
                  <TouchableOpacity
                    key={att.id}
                    style={[styles.historyRow, { backgroundColor: colors.backgroundElement }]}
                    onPress={() => setAttemptId(att.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.historyQuestion} numberOfLines={1}>Q: {att.question}</ThemedText>
                      <ThemedText style={styles.historyDate}>{new Date(att.createdAt).toLocaleDateString('vi-VN')}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="practice" />
      </SafeAreaView>
    </ThemedView>
  );
}

const StarQuestionInputCard = React.memo(({
  question,
  setQuestion,
  colors,
}: {
  question: string;
  setQuestion: (q: string) => void;
  colors: any;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Tình Huống Phỏng Vấn (Question / Scenario)</ThemedText>
    </View>

    <TextInput
      style={[
        styles.textArea,
        { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement, height: 90 }
      ]}
      placeholder="Nhập câu hỏi hoặc tình huống phỏng vấn bạn muốn rèn luyện..."
      placeholderTextColor={colors.textMuted}
      multiline
      numberOfLines={3}
      value={question}
      onChangeText={setQuestion}
    />
  </View>
));

const StarAnswerInputCard = React.memo(({
  colors,
  answer,
  setAnswer,
  onSubmit,
  isSubmitting,
}: {
  colors: any;
  answer: string;
  setAnswer: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="chatbubble-outline" size={22} color={colors.secondary} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Câu Trả Lời Tự Nhiên Của Bạn</ThemedText>
    </View>

    <ThemedText style={styles.subTip}>
      💡 Nhập một câu trả lời tự nhiên dạng văn bản. AI sẽ tự bóc tách thành 4 thành phần S-T-A-R.
    </ThemedText>

    <TextInput
      style={[
        styles.textArea,
        { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }
      ]}
      placeholder="Ví dụ: Trong một dự án E-commerce, hệ thống bị nghẽn thanh toán khi flash sale (Situation). Tôi được giao xử lý khắc phục trong 24h (Task). Tôi đã thêm Redis caching và tối ưu query (Action), giúp hệ thống chịu tải gấp 3 lần không bị sập (Result)..."
      placeholderTextColor={colors.textMuted}
      multiline
      numberOfLines={7}
      value={answer}
      onChangeText={setAnswer}
    />

    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary, width: '100%' },
          (!answer.trim() || isSubmitting) && styles.disabledButton
        ]}
        onPress={onSubmit}
        disabled={!answer.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
            <ThemedText style={styles.submitButtonText}>Phân Tích Cấu Trúc STAR</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
));

export interface NormalizedStarComponent {
  label: string;
  key: 'S' | 'T' | 'A' | 'R';
  title: string;
  content: string;
  evidence?: string;
  feedback?: string;
  score?: number | null;
  detected?: boolean;
}

export interface NormalizedStarEvaluation {
  overallScore: number | null;
  situation: NormalizedStarComponent;
  task: NormalizedStarComponent;
  action: NormalizedStarComponent;
  result: NormalizedStarComponent;
  missingElements: string[];
  strengths: string[];
  coachingTips: string[];
  applicable: boolean;
}

function parseStarComponent(
  raw: any,
  key: 'S' | 'T' | 'A' | 'R',
  title: string,
  fallbackEmptyText: string
): NormalizedStarComponent {
  const labelMap = { S: 'Situation', T: 'Task', A: 'Action', R: 'Result' };
  const label = labelMap[key];

  if (!raw) {
    return {
      key,
      label,
      title,
      content: fallbackEmptyText,
      detected: false,
    };
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return {
      key,
      label,
      title,
      content: trimmed || fallbackEmptyText,
      detected: !!trimmed,
    };
  }

  if (typeof raw === 'object') {
    const feedback = raw.feedback || raw.Feedback || raw.text || raw.Text || raw.content || raw.Content || '';
    const evidence = raw.evidence || raw.Evidence || '';
    const score = typeof raw.score === 'number' ? raw.score : typeof raw.Score === 'number' ? raw.Score : null;
    const detected = typeof raw.detected === 'boolean' ? raw.detected : typeof raw.Detected === 'boolean' ? raw.Detected : true;

    return {
      key,
      label,
      title,
      content: feedback || evidence || (detected ? 'Đã ghi nhận trong câu trả lời' : fallbackEmptyText),
      evidence,
      feedback,
      score,
      detected,
    };
  }

  return {
    key,
    label,
    title,
    content: fallbackEmptyText,
    detected: false,
  };
}

function normalizeStarEvaluation(raw: any): NormalizedStarEvaluation | null {
  if (!raw) return null;

  const situationRaw = raw.situation || raw.Situation;
  const taskRaw = raw.task || raw.Task;
  const actionRaw = raw.action || raw.Action;
  const resultRaw = raw.result || raw.Result;

  const situation = parseStarComponent(situationRaw, 'S', 'Bối Cảnh (Situation)', 'Chưa phát hiện rõ bối cảnh tình huống.');
  const task = parseStarComponent(taskRaw, 'T', 'Nhiệm Vụ (Task)', 'Chưa phát hiện rõ mục tiêu / nhiệm vụ.');
  const action = parseStarComponent(actionRaw, 'A', 'Hành Động (Action)', 'Chưa phát hiện rõ hành động xử lý.');
  const result = parseStarComponent(resultRaw, 'R', 'Kết Quả (Result)', 'Chưa phát hiện chỉ số / kết quả đạt được.');

  const rawMissing = raw.missingElements || raw.MissingElements || [];
  const missingElements: string[] = Array.isArray(rawMissing)
    ? rawMissing.filter((m: any) => typeof m === 'string' && m.trim())
    : [];

  const rawStrengths = raw.strengths || raw.Strengths || [];
  const strengths: string[] = Array.isArray(rawStrengths)
    ? rawStrengths.filter((s: any) => typeof s === 'string' && s.trim())
    : [];

  const rawTips = raw.coachingTips || raw.CoachingTips || raw.improvements || raw.Improvements || raw.recommendedApproach || raw.RecommendedApproach || [];
  const coachingTips: string[] = Array.isArray(rawTips)
    ? rawTips.filter((t: any) => typeof t === 'string' && t.trim())
    : [];

  const rawScore = raw.overallScore ?? raw.OverallScore ?? raw.score ?? raw.Score ?? null;

  return {
    overallScore: typeof rawScore === 'number' ? rawScore : null,
    situation,
    task,
    action,
    result,
    missingElements,
    strengths,
    coachingTips,
    applicable: typeof raw.applicable === 'boolean' ? raw.applicable : true,
  };
}

const StarEvaluationDetailsContent = React.memo(({
  evaluation,
  colors,
}: {
  evaluation: any;
  colors: any;
}) => {
  const normEval = useMemo(() => normalizeStarEvaluation(evaluation), [evaluation]);

  if (!normEval) return null;

  const components = [normEval.situation, normEval.task, normEval.action, normEval.result];
  const colorMap = {
    S: { tagBg: '#e0f2fe', tagText: '#0369a1' },
    T: { tagBg: '#fef3c7', tagText: '#b45309' },
    A: { tagBg: '#fce7f3', tagText: '#be185d' },
    R: { tagBg: '#dcfce7', tagText: '#15803d' },
  };

  return (
    <View style={{ gap: Spacing.three }}>
      {/* Overall Score Banner (if available) */}
      {normEval.overallScore !== null && (
        <View style={[styles.evalScoreHero, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
          <View style={[styles.scoreGauge, { backgroundColor: '#059669' }]}>
            <ThemedText style={styles.scoreGaugeText}>{normEval.overallScore}</ThemedText>
            <ThemedText style={styles.scoreGaugeLabel}>/100</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.evalScoreTitle, { color: '#065f46' }]}>Đánh Giá Cấu Trúc STAR</ThemedText>
            <ThemedText style={[styles.evalScoreFeedback, { color: '#047857' }]}>
              {normEval.applicable
                ? 'AI đã phân tích đầy đủ các thành phần bối cảnh, mục tiêu, hành động và kết quả trong câu trả lời.'
                : 'Câu trả lời chưa đầy đủ thành phần STAR tiêu chuẩn.'}
            </ThemedText>
          </View>
        </View>
      )}

      {/* 4 STAR Component Cards */}
      {components.map((comp) => {
        const theme = colorMap[comp.key];
        return (
          <View
            key={comp.key}
            style={[
              styles.starBox,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.starBadgeTag, { backgroundColor: theme.tagBg }]}>
                  <ThemedText style={[styles.starBadgeTagText, { color: theme.tagText }]}>{comp.key}</ThemedText>
                </View>
                <ThemedText style={[styles.starLabel, { color: colors.text }]}>{comp.title}</ThemedText>
              </View>

              {comp.score !== null && comp.score !== undefined ? (
                <View style={[styles.scoreBadgePill, { backgroundColor: comp.score >= 80 ? '#dcfce7' : comp.score >= 60 ? '#fef3c7' : '#fee2e2' }]}>
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: comp.score >= 80 ? '#15803d' : comp.score >= 60 ? '#b45309' : '#b91c1c' }}>
                    {comp.score}/100
                  </ThemedText>
                </View>
              ) : comp.detected === false ? (
                <View style={[styles.scoreBadgePill, { backgroundColor: '#fee2e2' }]}>
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: '#b91c1c' }}>Chưa phát hiện</ThemedText>
                </View>
              ) : null}
            </View>

            {/* Evidence blockquote if present */}
            {comp.evidence ? (
              <View style={[styles.evidenceBox, { backgroundColor: colors.card, borderLeftColor: theme.tagText }]}>
                <ThemedText style={[styles.evidenceText, { color: colors.text }]}>
                  &ldquo;{comp.evidence}&rdquo;
                </ThemedText>
              </View>
            ) : null}

            <ThemedText style={[styles.starText, { color: colors.text }]}>{comp.content}</ThemedText>
          </View>
        );
      })}

      {/* Missing Elements */}
      {normEval.missingElements.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1 }]}>
          <Ionicons name="warning" size={18} color="#b45309" />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={[styles.warningHeader, { color: '#b45309' }]}>⚠️ Yếu tố STAR còn thiếu:</ThemedText>
            {normEval.missingElements.map((m: string, idx: number) => (
              <ThemedText key={`m-${idx}`} style={[styles.bulletText, { color: '#78350f' }]}>• {m}</ThemedText>
            ))}
          </View>
        </View>
      )}

      {/* Strengths */}
      {normEval.strengths.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1 }]}>
          <Ionicons name="checkmark-circle" size={18} color="#047857" />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={[styles.warningHeader, { color: '#047857' }]}>👍 Điểm mạnh ghi nhận:</ThemedText>
            {normEval.strengths.map((s: string, idx: number) => (
              <ThemedText key={`s-${idx}`} style={[styles.bulletText, { color: '#065f46' }]}>• {s}</ThemedText>
            ))}
          </View>
        </View>
      )}

      {/* Coaching Tips */}
      {normEval.coachingTips.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1 }]}>
          <Ionicons name="bulb" size={18} color="#1d4ed8" />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={[styles.warningHeader, { color: '#1d4ed8' }]}>💡 Lời khuyên cải thiện chuyên gia:</ThemedText>
            {normEval.coachingTips.map((t: string, idx: number) => (
              <ThemedText key={`t-${idx}`} style={[styles.bulletText, { color: '#1e40af' }]}>• {t}</ThemedText>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

const StarEvaluationResultCard = React.memo(({
  activeAttempt,
  evaluation,
  colors,
}: {
  activeAttempt: any;
  evaluation: any;
  colors: any;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="analytics" size={22} color={colors.warning} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Phân Tích Cấu Trúc STAR từ AI</ThemedText>
    </View>

    {(activeAttempt.status === 'queued' || activeAttempt.status === 'processing') && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: Spacing.two }} />
        <ThemedText style={{ textAlign: 'center', opacity: 0.8 }}>
          AI đang bóc tách các yếu tố S-T-A-R trong câu trả lời của bạn...
        </ThemedText>
      </View>
    )}

    {activeAttempt.status === 'completed' && (evaluation || (activeAttempt as any).Evaluation) && (
      <StarEvaluationDetailsContent evaluation={evaluation || (activeAttempt as any).Evaluation} colors={colors} />
    )}
  </View>
));
