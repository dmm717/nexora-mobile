import React from 'react';
import { ActivityIndicator, Modal, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from '@/app/(app)/interview/[id].styles';
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
