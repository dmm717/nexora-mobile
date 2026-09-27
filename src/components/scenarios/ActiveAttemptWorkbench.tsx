import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/scenarios-detail.styles';
import { Spacing } from '@/constants/theme';
import { ScenarioEvaluationCard } from './ScenarioEvaluationCard';

interface ActiveAttemptWorkbenchProps {
  activeAttemptId: string | null;
  historyLoading: boolean;
  startAttemptMutation: any;
  attemptLoading: boolean;
  activeAttempt: any;
  answer: string;
  setAnswer: (val: string) => void;
  submitAttemptMutation: any;
  retryMutation: any;
  colors: any;
}

export const ActiveAttemptWorkbench = ({
  activeAttemptId,
  historyLoading,
  startAttemptMutation,
  attemptLoading,
  activeAttempt,
  answer,
  setAnswer,
  submitAttemptMutation,
  retryMutation,
  colors,
}: ActiveAttemptWorkbenchProps) => {
  if (!activeAttemptId && !historyLoading) {
    return (
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
    );
  }

  if (attemptLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Đang tải dữ liệu bài làm...</ThemedText>
      </View>
    );
  }

  if (activeAttempt) {
    return (
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
    );
  }

  return null;
};
