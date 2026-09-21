import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { interviewApi } from '@/api/interview.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from './[id].styles';

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

  const { data: report, isLoading, isError, refetch } = useQuery({
    queryKey: ['interview-report', id],
    queryFn: () => interviewApi.getReport(id!),
    enabled: !!id,
  });

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
    }
  });

  // Retry Report mutation
  const retryReportMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.retryReport(id!);
      return res;
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Đang yêu cầu hệ thống tạo lại báo cáo...');
      refetch();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể yêu cầu tạo lại báo cáo.');
    }
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: Spacing.two }}>Đang tải báo cáo đánh giá AI...</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !report) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>Chưa thể hiển thị báo cáo</ThemedText>
        <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginVertical: Spacing.two }}>
          Báo cáo phỏng vấn của bạn có thể đang được tạo hoặc gặp sự cố.
        </ThemedText>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, width: 220 }]}
          onPress={() => retryReportMutation.mutate()}
          disabled={retryReportMutation.isPending}
        >
          {retryReportMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.primaryButtonText}>Thử Tạo Lại Báo Cáo</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const scoreColor = report.overallScore >= 80 ? colors.accent : report.overallScore >= 60 ? colors.warning : colors.danger;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home' as any)} style={styles.backButton}>
            <Ionicons name="home-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Báo Cáo Phỏng Vấn AI</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Overall Score Badge Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
            <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}15` }]}>
              <ThemedText style={[styles.scoreNumber, { color: scoreColor }]}>
                {report.overallScore}
              </ThemedText>
              <ThemedText style={styles.scoreMax}>/ 100</ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.scoreTitle}>
              {report.overallScore >= 80 ? '🌟 Đạt Chuẩn Xuất Sắc' : report.overallScore >= 60 ? '👍 Khá Tốt - Cần Tối Ưu' : '💡 Cần Cải Thiện Thêm'}
            </ThemedText>
            <ThemedText style={styles.disclaimerText}>{report.disclaimer}</ThemedText>
          </View>

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
