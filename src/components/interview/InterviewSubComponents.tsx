import React from 'react';
import { ActivityIndicator, Modal, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from '@/styles/interview-room.styles';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ttsService } from '@/services/tts';

export const Q2BoundaryModal = React.memo(({
  visible,
  colors,
  onContinue,
  onComplete,
}: {
  visible: boolean;
  colors: any;
  onContinue: () => void;
  onComplete: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Ionicons name="star-outline" size={40} color={colors.warning} />
        <ThemedText type="subtitle" style={styles.modalTitle}>Bạn đã hoàn thành 2 câu hỏi!</ThemedText>
        <ThemedText style={styles.modalSub}>
          Bạn muốn tiếp tục câu 3 để có đánh giá đầy đủ hay kết thúc sớm ngay bây giờ?
        </ThemedText>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }]}
          onPress={onContinue}
        >
          <ThemedText style={styles.primaryButtonText}>Tiếp Tục Câu 3</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary, width: '100%' }]}
          onPress={onComplete}
        >
          <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
            Kết Thúc Sớm & Nhận Báo Cáo
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
));

export const Q3BoundaryModal = React.memo(({
  visible,
  colors,
  onComplete,
  isCompleting,
  onContinueDeep,
  isContinuing,
}: {
  visible: boolean;
  colors: any;
  onComplete: () => void;
  isCompleting: boolean;
  onContinueDeep: () => void;
  isContinuing: boolean;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Ionicons name="ribbon-outline" size={40} color={colors.accent} />
        <ThemedText type="subtitle" style={styles.modalTitle}>Chúc mừng! Bạn đã hoàn thành 3 câu hỏi miễn phí</ThemedText>
        <ThemedText style={styles.modalSub}>
          Bạn có thể nhận Báo Cáo Đánh Giá Miễn Phí ngay hoặc tiếp tục phỏng vấn chuyên sâu nâng cao.
        </ThemedText>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.accent, width: '100%' }]}
          onPress={onComplete}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.primaryButtonText}>Nhận Báo Cáo Miễn Phí</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary, width: '100%' }]}
          onPress={onContinueDeep}
          disabled={isContinuing}
        >
          {isContinuing ? (
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
));

export const CurrentQuestionCard = React.memo(({
  currentQuestion,
  colors,
  onComplete,
  isCompleting,
}: {
  currentQuestion: any;
  colors: any;
  onComplete: () => void;
  isCompleting: boolean;
}) => {
  if (!currentQuestion) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
        <Ionicons name="checkmark-done-circle" size={48} color={colors.accent} />
        <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>Đã hoàn tất các câu hỏi hiện tại!</ThemedText>
        <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginVertical: Spacing.two }}>
          Bạn có thể hoàn thành phỏng vấn ngay bây giờ để nhận báo cáo đánh giá chi tiết.
        </ThemedText>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }]}
          onPress={onComplete}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.primaryButtonText}>Hoàn Thành & Nhận Báo Cáo</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
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
  );
});

export const AnswerInputCard = React.memo(({
  colors,
  answerText,
  setAnswerText,
  isRecording,
  toggleSpeech,
  durationSeconds,
  onSubmit,
  isSubmitting,
}: {
  colors: any;
  answerText: string;
  setAnswerText: (text: string) => void;
  isRecording: boolean;
  toggleSpeech: () => void;
  durationSeconds: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.primary} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Câu Trả Lời Của Bạn</ThemedText>
      {durationSeconds > 0 && (
        <ThemedText style={styles.timerText}>⏱ {durationSeconds}s</ThemedText>
      )}
    </View>

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

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary },
          (!answerText.trim() || isSubmitting) && styles.disabledButton
        ]}
        onPress={onSubmit}
        disabled={!answerText.trim() || isSubmitting}
      >
        {isSubmitting ? (
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
));

export const QuestionCoachTipCard = React.memo(({
  sequence,
  colors,
}: {
  sequence: number;
  colors: any;
}) => {
  const tipText =
    sequence === 1
      ? 'Nêu bật kinh nghiệm thực chiến gần nhất, nhấn mạnh công nghệ chủ đạo và đóng góp cá nhân nổi bật.'
      : sequence === 2
      ? 'Trình bày có cấu trúc: 1) Cô lập và chẩn đoán sự cố; 2) Giải pháp ứng phó; 3) Thiết kế phòng ngừa lâu dài.'
      : 'Áp dụng cấu trúc STAR: Nêu rõ Bối cảnh (S), Mục tiêu (T), Hành động cụ thể (A), và Kết quả định lượng (R).';

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeaderRow}>
        <Ionicons name="bulb-outline" size={18} color={colors.warning} />
        <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.warning }}>
          Mẹo trả lời AI (Coach Tip)
        </ThemedText>
      </View>
      <ThemedText style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
        {tipText}
      </ThemedText>
    </View>
  );
});

export const SessionTranscriptAccordion = React.memo(({
  answers,
  questions,
  colors,
}: {
  answers?: any[];
  questions?: any[];
  colors: any;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!answers || answers.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 }}>
          <Ionicons name="receipt-outline" size={18} color={colors.primary} />
          <ThemedText style={{ fontSize: 13, fontWeight: '700' }}>
            Xem Transcript ({answers.length} câu đã trả lời)
          </ThemedText>
        </View>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {isOpen && (
        <View style={{ gap: Spacing.two, marginTop: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
          {answers.map((ans, idx) => {
            const qObj = questions?.find((q) => q.id === ans.questionId);
            return (
              <View key={ans.id || `ans-${ans.questionId}-${idx}`} style={{ padding: Spacing.two, backgroundColor: colors.backgroundElement, borderRadius: 8, gap: 4 }}>
                <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                  Q#{qObj?.sequence || idx + 1}: {qObj?.content || 'Câu hỏi phỏng vấn'}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.text }}>
                  A: {ans.content}
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
});

export const ExitConfirmationModal = React.memo(({
  visible,
  colors,
  onStay,
  onLeave,
}: {
  visible: boolean;
  colors: any;
  onStay: () => void;
  onLeave: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: Spacing.one }}>
          <ThemedText type="subtitle" style={{ fontSize: 18, fontWeight: '700' }}>Rời phòng phỏng vấn?</ThemedText>
          <TouchableOpacity onPress={onStay} style={{ padding: 4 }}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ThemedText style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: Spacing.three }}>
          Bạn đang trong phiên luyện tập tập trung. Tiến trình câu trả lời của các câu trước đã được lưu an toàn. Bạn có muốn quay về màn hình chính?
        </ThemedText>

        <View style={{ flexDirection: 'row', gap: Spacing.two, width: '100%' }}>
          <TouchableOpacity
            style={[styles.secondaryButton, { flex: 1, borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement }]}
            onPress={onStay}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: colors.text }]}>Ở lại luyện tập</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1, backgroundColor: colors.danger || '#dc2626' }]}
            onPress={onLeave}
          >
            <ThemedText style={styles.primaryButtonText}>Xác nhận rời phòng</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
));


