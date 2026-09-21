import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { starApi } from '@/api/star.api';
import { speechService } from '@/services/speech';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SAMPLE_QUESTIONS = [
  'Kể về một lần bạn gặp xung đột ý kiến trong nhóm và cách bạn xử lý.',
  'Hãy mô tả một sự cố kĩ thuật nghiêm trọng bạn từng giải quyết.',
  'Kể về một project bạn phải hoàn thành dưới áp lực thời gian gấp rút.',
  'Hãy đưa ra ví dụ về một lần bạn thuyết phục thành công stakeholder.',
];

export default function StarBuilderScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

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

  const toggleSpeech = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.startListening({
        onResult: (transcript) => {
          setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: (err) => {
          Alert.alert('Lỗi thu âm', err);
          setIsRecording(false);
        },
        onEnd: () => setIsRecording(false),
      });
    }
  };

  const createStarMutation = useMutation({
    mutationFn: async () => {
      if (!question.trim()) throw new Error('Vui lòng nhập hoặc chọn câu hỏi');
      if (!answer.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');

      const res = await starApi.create({
        question: question.trim(),
        answer: answer.trim(),
      });
      return res;
    },
    onSuccess: (data) => {
      setAttemptId(data.id);
      setIsRecording(false);
      queryClient.invalidateQueries({ queryKey: ['star-attempts'] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể phân tích mô hình STAR. Vui lòng thử lại.');
    }
  });

  const evaluation = activeAttempt?.evaluation;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Chuẩn Hóa STAR Builder AI</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SampleQuestionPickerCard question={question} setQuestion={setQuestion} colors={colors} />

          <StarAnswerInputCard
            colors={colors}
            answer={answer}
            setAnswer={setAnswer}
            isRecording={isRecording}
            toggleSpeech={toggleSpeech}
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
      </SafeAreaView>
    </ThemedView>
  );
}

const SampleQuestionPickerCard = React.memo(({
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
      <ThemedText type="subtitle" style={styles.cardTitle}>Câu Hỏi Tình Huống Phỏng Vấn</ThemedText>
    </View>

    <View style={{ gap: Spacing.two }}>
      {SAMPLE_QUESTIONS.map((q) => (
        <TouchableOpacity
          key={q}
          style={[
            styles.sampleRow,
            { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
            question === q && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
          ]}
          onPress={() => setQuestion(q)}
        >
          <Ionicons
            name={question === q ? 'radio-button-on' : 'radio-button-off'}
            size={18}
            color={question === q ? colors.primary : colors.textMuted}
          />
          <ThemedText style={[styles.sampleText, question === q && { color: colors.primary, fontWeight: '600' }]}>
            {q}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>

    <ThemedText style={styles.inputLabel}>Hoặc tự nhập câu hỏi tình huống khác:</ThemedText>
    <TextInput
      style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }]}
      placeholder="Nhập nội dung câu hỏi..."
      placeholderTextColor={colors.textMuted}
      value={question}
      onChangeText={setQuestion}
    />
  </View>
));

const StarAnswerInputCard = React.memo(({
  colors,
  answer,
  setAnswer,
  isRecording,
  toggleSpeech,
  onSubmit,
  isSubmitting,
}: {
  colors: any;
  answer: string;
  setAnswer: (text: string) => void;
  isRecording: boolean;
  toggleSpeech: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="chatbubble-outline" size={22} color={colors.secondary} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Câu Trả Lời Tự Nhiên Của Bạn</ThemedText>
    </View>

    <ThemedText style={styles.subTip}>
      💡 Nhập một câu trả lời tự nhiên dạng văn bản hoặc giọng nói. AI sẽ tự bóc tách thành 4 thành phần S-T-A-R.
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
        style={[styles.micButton, isRecording && { backgroundColor: colors.danger }]}
        onPress={toggleSpeech}
      >
        <Ionicons name={isRecording ? 'mic-off' : 'mic'} size={20} color="#fff" />
        <ThemedText style={styles.micButtonText}>{isRecording ? 'Dừng' : 'Thu Giọng Nói'}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary },
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

const StarEvaluationDetailsContent = React.memo(({
  evaluation,
  colors,
}: {
  evaluation: any;
  colors: any;
}) => (
  <View style={{ gap: Spacing.three }}>
    <View style={styles.successRow}>
      <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
      <ThemedText style={[styles.successText, { color: colors.accent }]}>Hoàn tất phân tích!</ThemedText>
    </View>

    <View style={[styles.starBox, { backgroundColor: colors.backgroundElement }]}>
      <ThemedText style={[styles.starLabel, { color: colors.primary }]}>S - Situation (Bối cảnh / Tình huống):</ThemedText>
      <ThemedText style={styles.starText}>{evaluation.situation || evaluation.Situation || 'Chưa phát hiện rõ bối cảnh'}</ThemedText>
    </View>

    <View style={[styles.starBox, { backgroundColor: colors.backgroundElement }]}>
      <ThemedText style={[styles.starLabel, { color: colors.secondary }]}>T - Task (Nhiệm vụ / Mục tiêu):</ThemedText>
      <ThemedText style={styles.starText}>{evaluation.task || evaluation.Task || 'Chưa phát hiện rõ mục tiêu'}</ThemedText>
    </View>

    <View style={[styles.starBox, { backgroundColor: colors.backgroundElement }]}>
      <ThemedText style={[styles.starLabel, { color: colors.warning }]}>A - Action (Hành động thực hiện):</ThemedText>
      <ThemedText style={styles.starText}>{evaluation.action || evaluation.Action || 'Chưa phát hiện rõ hành động'}</ThemedText>
    </View>

    <View style={[styles.starBox, { backgroundColor: colors.backgroundElement }]}>
      <ThemedText style={[styles.starLabel, { color: colors.accent }]}>R - Result (Kết quả đạt được):</ThemedText>
      <ThemedText style={styles.starText}>{evaluation.result || evaluation.Result || 'Chưa có chỉ số / kết quả rõ ràng'}</ThemedText>
    </View>

    {evaluation.missingElements && Array.isArray(evaluation.missingElements) && evaluation.missingElements.length > 0 && (
      <View style={[styles.warningBox, { backgroundColor: colors.warningLight }]}>
        <Ionicons name="warning-outline" size={20} color={colors.warning} />
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.warningHeader, { color: colors.warning }]}>⚠️ Yếu tố STAR còn thiếu:</ThemedText>
          {evaluation.missingElements.map((m: string, idx: number) => (
            <ThemedText key={`${m}-${idx}`} style={styles.bulletText}>• {m}</ThemedText>
          ))}
        </View>
      </View>
    )}
  </View>
));

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

    {activeAttempt.status === 'completed' && evaluation && (
      <StarEvaluationDetailsContent evaluation={evaluation} colors={colors} />
    )}
  </View>
));

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
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  sampleText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 14,
  },
  subTip: {
    fontSize: 12,
    opacity: 0.75,
    fontStyle: 'italic',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    height: 130,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  successText: {
    fontWeight: '700',
    fontSize: 15,
  },
  starBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: 4,
  },
  starLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  starText: {
    fontSize: 13,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  warningHeader: {
    fontSize: 13,
    fontWeight: '700',
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 18,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  historyQuestion: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
});
