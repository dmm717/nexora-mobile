import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { interviewApi } from '@/api/interview.api';
import { speechService } from '@/services/speech';
import { ttsService } from '@/services/tts';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { QuestionView, AnswerView } from '@/api/types';

export default function InterviewRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [showQ2BoundaryModal, setShowQ2BoundaryModal] = useState(false);
  const [showQ3BoundaryModal, setShowQ3BoundaryModal] = useState(false);
  const [lastCoaching, setLastCoaching] = useState<any | null>(null);

  const timerRef = useRef<any>(null);

  const { data: interview, isLoading, refetch } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'starting' || status === 'completing') {
        return 3000;
      }
      return false;
    }
  });

  // Automatically check completion and navigate to report when completed
  useEffect(() => {
    if (interview?.status === 'completed') {
      router.replace(`/(app)/interview/report/${interview.id}` as any);
    }
  }, [interview?.status]);

  // Answer duration timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Speech Recognition toggle
  const toggleSpeech = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.startListening({
        onResult: (transcript) => {
          setAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: (err) => {
          Alert.alert('Lỗi thu âm', err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    }
  };

  // Find unanswered current question
  const answeredQuestionIds = new Set(interview?.answers?.map((a) => a.questionId) || []);
  const currentQuestion = interview?.questions?.find((q) => !answeredQuestionIds.has(q.id));

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!currentQuestion) throw new Error('Không có câu hỏi hiện tại');
      if (!answerText.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');

      const res = await interviewApi.submitAnswer(id!, {
        questionId: currentQuestion.id,
        content: answerText.trim(),
        durationSeconds,
      });
      return res;
    },
    onSuccess: (data) => {
      setAnswerText('');
      setDurationSeconds(0);
      setIsRecording(false);
      ttsService.stop();

      // Check boundary after answer 2 & answer 3
      const newAnswerCount = (interview?.answers.length || 0) + 1;
      if (data.answer?.evaluation?.coachingFeedback) {
        setLastCoaching(data.answer.evaluation.coachingFeedback);
      } else if (data.answer?.evaluation) {
        setLastCoaching(data.answer.evaluation);
      }

      if (newAnswerCount === 2) {
        setShowQ2BoundaryModal(true);
      } else if (newAnswerCount === 3) {
        setShowQ3BoundaryModal(true);
      }

      refetch();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi nộp bài', err.message || 'Không thể nộp câu trả lời. Vui lòng thử lại.');
    }
  });

  // Complete Interview mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.completeInterview(id!);
      return res;
    },
    onSuccess: () => {
      setShowQ2BoundaryModal(false);
      setShowQ3BoundaryModal(false);
      refetch();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể hoàn thành phỏng vấn.');
    }
  });

  // Continue Interview mutation (Paid / Deep Continuation)
  const continueMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.continueInterview(id!);
      return res;
    },
    onSuccess: () => {
      setShowQ3BoundaryModal(false);
      refetch();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể tiếp tục phỏng vấn.');
    }
  });

  if (isLoading || !interview) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: Spacing.two }}>Đang tải phòng phỏng vấn...</ThemedText>
      </ThemedView>
    );
  }

  const answeredCount = interview.answers.length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ThemedText type="title" style={styles.title}>{interview.role || 'Phỏng Vấn AI'}</ThemedText>
            <ThemedText style={styles.subtitle}>Cấp bậc: {interview.seniority} • {interview.interviewType.toUpperCase()}</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
            <ThemedText style={[styles.statusText, { color: colors.accent }]}>
              {interview.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Question Sequence & Banner */}
          {currentQuestion ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.questionHeader}>
                <View style={[styles.sequenceChip, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.sequenceChipText}>Câu hỏi #{currentQuestion.sequence}</ThemedText>
                </View>
                <View style={[styles.topicChip, { backgroundColor: colors.backgroundElement }]}>
                  <ThemedText style={styles.topicChipText}>{currentQuestion.topic}</ThemedText>
                </View>
                {currentQuestion.kind === 'followup' && (
                  <View style={[styles.kindChip, { backgroundColor: colors.warningLight }]}>
                    <ThemedText style={[styles.kindChipText, { color: colors.warning }]}>Hỏi đào sâu</ThemedText>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.speakerButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => ttsService.speak(currentQuestion.content)}
                >
                  <Ionicons name="volume-medium" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.questionContent}>
                {currentQuestion.content}
              </ThemedText>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
              <Ionicons name="checkmark-done-circle" size={48} color={colors.accent} />
              <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>Đã hoàn tất các câu hỏi hiện tại!</ThemedText>
              <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginVertical: Spacing.two }}>
                Bạn có thể hoàn thành phỏng vấn ngay bây giờ để nhận báo cáo đánh giá chi tiết.
              </ThemedText>
              
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }]}
                onPress={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Hoàn Thành & Nhận Báo Cáo</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Coaching Feedback Card */}
          {lastCoaching && (
            <View style={[styles.card, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.primary }]}>Quick Coaching AI</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 13, lineHeight: 18 }}>
                {typeof lastCoaching === 'string' ? lastCoaching : JSON.stringify(lastCoaching)}
              </ThemedText>
            </View>
          )}

          {/* Input & Speech STT Section */}
          {currentQuestion && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.primary} />
                <ThemedText type="subtitle" style={styles.cardTitle}>Câu Trả Lời Của Bạn</ThemedText>
                {durationSeconds > 0 && (
                  <ThemedText style={styles.timerText}>⏱ {durationSeconds}s</ThemedText>
                )}
              </View>

              {/* Editable Transcript Area */}
              <TextInput
                style={[
                  styles.textArea,
                  { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }
                ]}
                placeholder="Nhập hoặc nhấn Micro bên dưới để thu âm trả lời..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                value={answerText}
                onChangeText={setAnswerText}
              />

              <View style={styles.actionRow}>
                {/* Speech Record Button */}
                <TouchableOpacity
                  style={[
                    styles.micButton,
                    isRecording && { backgroundColor: colors.danger }
                  ]}
                  onPress={toggleSpeech}
                >
                  <Ionicons name={isRecording ? 'mic-off' : 'mic'} size={22} color="#fff" />
                  <ThemedText style={styles.micButtonText}>
                    {isRecording ? 'Dừng Thu' : 'Thu Giọng Nói'}
                  </ThemedText>
                </TouchableOpacity>

                {/* Submit Answer Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    (!answerText.trim() || submitAnswerMutation.isPending) && styles.disabledButton
                  ]}
                  onPress={() => submitAnswerMutation.mutate()}
                  disabled={!answerText.trim() || submitAnswerMutation.isPending}
                >
                  {submitAnswerMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <ThemedText style={styles.submitButtonText}>Gửi Câu Trả Lời</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Modal Boundary after Q2 */}
        <Modal visible={showQ2BoundaryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="star-outline" size={40} color={colors.warning} />
              <ThemedText type="subtitle" style={styles.modalTitle}>Bạn đã hoàn thành 2 câu hỏi!</ThemedText>
              <ThemedText style={styles.modalSub}>
                Bạn muốn tiếp tục câu 3 để có đánh giá đầy đủ hay kết thúc sớm ngay bây giờ?
              </ThemedText>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }]}
                onPress={() => setShowQ2BoundaryModal(false)}
              >
                <ThemedText style={styles.primaryButtonText}>Tiếp Tục Câu 3</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary, width: '100%' }]}
                onPress={() => completeMutation.mutate()}
              >
                <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Kết Thúc Sớm & Nhận Báo Cáo
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Boundary after Q3 */}
        <Modal visible={showQ3BoundaryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="ribbon-outline" size={40} color={colors.accent} />
              <ThemedText type="subtitle" style={styles.modalTitle}>Chúc mừng! Bạn đã hoàn thành 3 câu hỏi miễn phí</ThemedText>
              <ThemedText style={styles.modalSub}>
                Bạn có thể nhận Báo Cáo Đánh Giá Miễn Phí ngay hoặc tiếp tục phỏng vấn chuyên sâu nâng cao.
              </ThemedText>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.accent, width: '100%' }]}
                onPress={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Nhận Báo Cáo Miễn Phí</ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary, width: '100%' }]}
                onPress={() => continueMutation.mutate()}
                disabled={continueMutation.isPending}
              >
                {continueMutation.isPending ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
                    Tiếp Tục Phỏng Vấn Chuyên Sâu
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    gap: Spacing.two,
  },
  backButton: { marginRight: Spacing.two },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, opacity: 0.7 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
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
    gap: Spacing.three,
  },
  questionHeader: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  sequenceChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  sequenceChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  topicChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  topicChipText: { fontSize: 12, fontWeight: '600' },
  kindChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  kindChipText: { fontSize: 12, fontWeight: '700' },
  questionContent: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  timerText: { fontSize: 13, fontWeight: '700', opacity: 0.8 },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#64748B',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  micButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabledButton: { opacity: 0.5 },
  primaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  secondaryButtonText: { fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSub: { fontSize: 13, textAlign: 'center', opacity: 0.8 },
  coachingBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    width: '100%',
    marginVertical: Spacing.one,
  },
  coachingText: { fontSize: 13, lineHeight: 18 },
  speakerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
