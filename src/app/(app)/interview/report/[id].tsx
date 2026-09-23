import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { interviewApi } from '@/api/interview.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from '@/styles/interview-report.styles';

const PRACTICE_REASONS = [
  { id: 'repeat_question', label: 'Luyện lại câu hỏi này (Repeat Question)' },
  { id: 'rubric_weakness', label: 'Khắc phục điểm yếu Rubric (Rubric Weakness)' },
  { id: 'recommendation', label: 'Theo đề xuất của AI (Recommendation)' },
  { id: 'manual', label: 'Tự chọn chủ đề (Manual)' },
];

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();

  const [selectedQuestionForPractice, setSelectedQuestionForPractice] = useState<string | null>(null);
  const [practiceReason, setPracticeReason] = useState('rubric_weakness');
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  // Query interview lifecycle state
  const { data: interview, isLoading: isInterviewLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const reportState = query.state.data?.reportState;
      const resultState = query.state.data?.resultState;
      if (status === 'failed' || reportState === 'failed' || resultState === 'failed') {
        return false;
      }
      if (
        status === 'starting' ||
        status === 'completing' ||
        status === 'evaluating' ||
        reportState === 'processing'
      ) {
        return 3000;
      }
      return false;
    },
  });

  // Query interview report data
  const {
    data: report,
    isLoading: isReportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ['interview-report', id],
    queryFn: () => interviewApi.getReport(id!),
    enabled: !!id,
    retry: false,
    refetchInterval: (query) => {
      const err = query.state.error as any;
      const isFailed =
        interview?.status === 'failed' ||
        interview?.reportState === 'failed' ||
        interview?.resultState === 'failed' ||
        err?.code === 'INTERVIEW_REPORT_FAILED' ||
        err?.code === 'INTERVIEW_REPORT_UNAVAILABLE';

      if (isFailed) {
        return false;
      }

      const isProcessing =
        interview?.status === 'completing' ||
        interview?.status === 'evaluating' ||
        interview?.reportState === 'processing' ||
        interview?.resultState === 'processing' ||
        err?.code === 'INTERVIEW_REPORT_PROCESSING' ||
        err?.status === 409 ||
        (err?.status === 404 && (interview?.status === 'completing' || interview?.status === 'evaluating'));

      if (isProcessing) {
        return 3000;
      }
      return false;
    },
  });

  const handleShareReport = async () => {
    if (!report) return;
    try {
      await Share.share({
        title: 'Báo Cáo Phỏng Vấn Nexora AI',
        message: `Báo Cáo Phỏng Vấn AI của tôi đạt ${report.overallScore ?? 0}/100 điểm trên Nexora.`,
      });
    } catch {
      // Ignore share cancellation
    }
  };

  // Practice Again mutation
  const practiceAgainMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.practiceAgain(id!, {
        questionId: selectedQuestionForPractice,
        reason: practiceReason,
        focus: 'correctness',
      });
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interview-history'] });
      queryClient.invalidateQueries({ queryKey: ['interview-report', id] });
      setShowPracticeModal(false);
      router.replace(`/(app)/interview/${data.id}` as any);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể tạo phiên luyện tập lại. Vui lòng thử lại.');
    },
  });

  // Retry Report mutation
  const retryReportMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.retryReport(id!);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', id] });
      queryClient.invalidateQueries({ queryKey: ['interview-report', id] });
      Alert.alert('Đang gửi yêu cầu', 'Hệ thống đang tiến hành chấm điểm lại báo cáo...');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể yêu cầu chấm điểm lại.');
    },
  });

  const isFailed =
    interview?.status === 'failed' ||
    interview?.reportState === 'failed' ||
    interview?.resultState === 'failed' ||
    (reportError as any)?.code === 'INTERVIEW_REPORT_FAILED';

  const isProcessing =
    !isFailed &&
    (interview?.status === 'completing' ||
      interview?.status === 'evaluating' ||
      interview?.reportState === 'processing' ||
      interview?.resultState === 'processing' ||
      (reportError as any)?.code === 'INTERVIEW_REPORT_PROCESSING' ||
      ((reportError as any)?.status === 404 &&
        (interview?.status === 'completing' || interview?.status === 'evaluating')) ||
      (!report && (isReportLoading || isInterviewLoading)));

  if (isProcessing) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/interview' as any);
                }
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={styles.title}>Báo Cáo Phỏng Vấn AI</ThemedText>
            </View>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home' as any)} style={{ padding: 6 }}>
              <Ionicons name="home-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.centerContainer}>
            <View
              style={{
                padding: Spacing.four,
                borderRadius: Radius.lg,
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: 1,
                alignItems: 'center',
                maxWidth: 340,
                width: '90%',
                ...Shadows.md,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: Spacing.three }} />
              <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: Spacing.two }}>
                AI Đang Tổng Hợp Báo Cáo
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', opacity: 0.8, fontSize: 14, lineHeight: 20 }}>
                Hệ thống đang phân tích chi tiết câu trả lời, mô hình STAR và tổng hợp điểm số. Vui lòng đợi trong giây lát...
              </ThemedText>

              {interview?.evaluationProgress && (
                <View style={{ marginTop: Spacing.three, width: '100%' }}>
                  <ThemedText style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
                    Đã xử lý: {interview.evaluationProgress.ready} / {interview.evaluationProgress.total} câu hỏi
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isFailed || !report) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/interview' as any);
                }
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={styles.title}>Báo Cáo Phỏng Vấn AI</ThemedText>
            </View>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home' as any)} style={{ padding: 6 }}>
              <Ionicons name="home-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={56} color={colors.danger} />
            <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>
              Chưa thể tạo báo cáo phỏng vấn
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginVertical: Spacing.two, paddingHorizontal: Spacing.four }}>
              Đã xảy ra sự cố trong quá trình phân tích AI. Vui lòng bấm bên dưới để hệ thống tiến hành chấm điểm lại.
            </ThemedText>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary, width: 220, marginTop: Spacing.two }]}
              onPress={() => retryReportMutation.mutate()}
              disabled={retryReportMutation.isPending}
            >
              {retryReportMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.primaryButtonText}>Thử Lại Chấm Điểm</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const overallScore = report.overallScore ?? 0;
  const scoreColor = overallScore >= 80 ? colors.accent : overallScore >= 60 ? colors.warning : colors.danger;
  const isPartial = report.sample?.isPartial ?? false;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/interview' as any);
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ThemedText type="title" style={styles.title}>Báo Cáo Phỏng Vấn AI</ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home' as any)} style={{ padding: 6, marginRight: 4 }}>
            <Ionicons name="home-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareReport} style={{ padding: 6 }}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Overall Score Badge Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
            {isPartial && (
              <View style={{ backgroundColor: colors.warningLight || '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: Spacing.two }}>
                <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.warning }}>
                  ⚡ Báo Cáo Thu Gọn (Nộp bài sớm)
                </ThemedText>
              </View>
            )}

            <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}15` }]}>
              <ThemedText style={[styles.scoreNumber, { color: scoreColor }]}>
                {overallScore}
              </ThemedText>
              <ThemedText style={styles.scoreMax}>/ 100</ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.scoreTitle}>
              {overallScore >= 80 ? '🌟 Đạt Chuẩn Xuất Sắc' : overallScore >= 60 ? '👍 Khá Tốt - Cần Tối Ưu' : '💡 Cần Cải Thiện Thêm'}
            </ThemedText>
            <ThemedText style={styles.disclaimerText}>{report.disclaimer}</ThemedText>
          </View>

          {/* Action Plan Section */}
          {report.actionPlan && Array.isArray(report.actionPlan) && report.actionPlan.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                <Ionicons name="flag-outline" size={20} color={colors.primary} />
                <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: '700' }}>Kế Hoạch Hành Động Đề Xuất (Action Plan)</ThemedText>
              </View>

              <View style={{ gap: Spacing.two, marginTop: Spacing.one }}>
                {report.actionPlan.map((step: string, idx: number) => (
                  <View key={`step-${idx}-${step.substring(0, 10)}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, backgroundColor: colors.backgroundElement, padding: Spacing.two, borderRadius: Radius.md }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                      <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{idx + 1}</ThemedText>
                    </View>
                    <ThemedText style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>{step}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Detailed Question Reviews */}
          {report.questionReviews && report.questionReviews.length > 0 && (
            <View style={{ gap: Spacing.four }}>
              <ThemedText type="subtitle" style={styles.sectionHeader}>Chi Tiết Đánh Giá Theo Câu Hỏi</ThemedText>
              
              {report.questionReviews.map((review) => (
                <View key={review.questionId || `q-${review.sequence}-${review.topic}`} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.questionReviewHeader}>
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.badgeText}>Câu #{review.sequence}</ThemedText>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={[styles.badgeText, { color: colors.text }]}>{review.topic}</ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.questionTitle}>Q: {review.question}</ThemedText>
                  <View style={[styles.answerBox, { backgroundColor: colors.backgroundElement }]}>
                    <ThemedText style={styles.answerText}>A: {review.answer}</ThemedText>
                  </View>

                  {/* Rubric Scores */}
                  {review.rubric && review.rubric.length > 0 && (
                    <View style={{ gap: 4, marginTop: Spacing.one }}>
                      <ThemedText style={styles.subTitle}>📊 Điểm Tiêu Chí Rubric:</ThemedText>
                      {review.rubric.map((r, rIdx) => (
                        <View key={r.criterion || `r-${r.score}-${rIdx}`} style={styles.rubricRow}>
                          <ThemedText style={styles.rubricLabel}>{r.criterion}:</ThemedText>
                          <ThemedText style={[styles.rubricScore, { color: colors.primary }]}>{r.score}/100</ThemedText>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Feedback & STAR */}
                  {review.feedback && (
                    <View style={{ marginTop: Spacing.one }}>
                      <ThemedText style={styles.subTitle}>💡 Nhận Xét Chuyên Sâu:</ThemedText>
                      <ThemedText style={styles.bodyText}>{review.feedback}</ThemedText>
                    </View>
                  )}

                  {/* Strengths & Improvements */}
                  {review.strengths && review.strengths.length > 0 && (
                    <View style={{ marginTop: Spacing.one }}>
                      <ThemedText style={[styles.subTitle, { color: colors.accent }]}>💪 Điểm mạnh:</ThemedText>
                      {review.strengths.map((s, sIdx) => (
                        <ThemedText key={sIdx} style={styles.bulletText}>• {s}</ThemedText>
                      ))}
                    </View>
                  )}

                  {review.improvements && review.improvements.length > 0 && (
                    <View style={{ marginTop: Spacing.one }}>
                      <ThemedText style={[styles.subTitle, { color: colors.warning }]}>🚀 Cần cải thiện:</ThemedText>
                      {review.improvements.map((imp, impIdx) => (
                        <ThemedText key={impIdx} style={styles.bulletText}>• {imp}</ThemedText>
                      ))}
                    </View>
                  )}

                  {/* Suggested Answer */}
                  {review.suggestedImprovedAnswer && (
                    <View style={[styles.suggestedBox, { backgroundColor: colors.accentLight }]}>
                      <ThemedText style={[styles.subTitle, { color: colors.accent }]}>✨ Câu trả lời mẫu gợi ý:</ThemedText>
                      <ThemedText style={styles.bodyText}>{review.suggestedImprovedAnswer}</ThemedText>
                    </View>
                  )}

                  {/* Practice Again for this question */}
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.primary }]}
                    onPress={() => {
                      setSelectedQuestionForPractice(review.questionId);
                      setShowPracticeModal(true);
                    }}
                  >
                    <Ionicons name="refresh" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
                      Luyện Tập Lại Câu Này
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Global Practice Again Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setSelectedQuestionForPractice(null);
              setShowPracticeModal(true);
            }}
          >
            <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={styles.primaryButtonText}>Tạo Phiên Luyện Tập Lại Mô Phỏng (Practice Again)</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Practice Again Modal */}
        <Modal visible={showPracticeModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="refresh-circle" size={40} color={colors.primary} />
              <ThemedText type="subtitle" style={styles.modalTitle}>Tạo Phiên Luyện Tập Lại</ThemedText>
              <ThemedText style={styles.modalSub}>
                Chọn lý do & tiêu chí bạn muốn tập trung cải thiện cho phiên mới này:
              </ThemedText>

              <View style={{ width: '100%', gap: Spacing.two, marginVertical: Spacing.two }}>
                {PRACTICE_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.reasonOption,
                      { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                      practiceReason === r.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                    ]}
                    onPress={() => setPracticeReason(r.id)}
                  >
                    <Ionicons
                      name={practiceReason === r.id ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={practiceReason === r.id ? colors.primary : colors.textMuted}
                    />
                    <ThemedText style={[styles.reasonOptionText, practiceReason === r.id && { color: colors.primary, fontWeight: '700' }]}>
                      {r.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }]}
                onPress={() => practiceAgainMutation.mutate()}
                disabled={practiceAgainMutation.isPending}
              >
                {practiceAgainMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Bắt Đầu Phỏng Vấn Mới</ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.cardBorder, width: '100%' }]}
                onPress={() => setShowPracticeModal(false)}
              >
                <ThemedText style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Hủy</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}
