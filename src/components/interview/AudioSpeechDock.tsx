import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface AudioSpeechDockProps {
  answerText: string;
  setAnswerText: (text: string | ((prev: string) => string)) => void;
  isRecording: boolean;
  toggleSpeech: () => void;
  isTtsSpeaking: boolean;
  toggleTts: () => void;
  durationSeconds: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  onFinishEarly: () => void;
  canFinishEarly: boolean;
  colors: any;
}

export function AudioSpeechDock({
  answerText,
  setAnswerText,
  isRecording,
  toggleSpeech,
  isTtsSpeaking,
  toggleTts,
  durationSeconds,
  onSubmit,
  isSubmitting,
  onFinishEarly,
  canFinishEarly,
  colors,
}: AudioSpeechDockProps) {
  const [editorOpen, setEditorOpen] = useState(false);

  const wordCount = answerText.trim()
    ? answerText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
      {/* Draft Caption Preview Bar (if candidate has transcribed speech or typed text) */}
      {Boolean(answerText.trim() || isRecording) && (
        <View style={[styles.draftContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <View style={styles.draftHeader}>
            <View style={styles.draftHeaderLeft}>
              <Ionicons
                name={isRecording ? 'mic' : 'create-outline'}
                size={16}
                color={isRecording ? colors.danger || '#ef4444' : colors.primary}
              />
              <ThemedText style={styles.draftLabel}>
                {isRecording ? 'Đang nhận diện giọng nói...' : `Phụ đề câu trả lời · ${wordCount} từ`}
              </ThemedText>
            </View>
            <ThemedText style={[styles.durationText, { color: colors.primary }]}>
              {formatTimer(durationSeconds)}
            </ThemedText>
          </View>

          <View style={styles.draftPreviewBox}>
            <ThemedText style={styles.draftText} numberOfLines={3}>
              {answerText.trim() || '(Nói vào micro để câu trả lời tự động xuất hiện ở đây...)'}
            </ThemedText>
          </View>

          <View style={styles.draftFooter}>
            <TouchableOpacity
              style={[styles.editBtn, { borderColor: colors.cardBorder }]}
              onPress={() => setEditorOpen(true)}
              disabled={isSubmitting}
            >
              <Ionicons name="create-outline" size={14} color={colors.text} style={{ marginRight: 4 }} />
              <ThemedText style={styles.editBtnText}>Chỉnh sửa</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: !answerText.trim() || isSubmitting || isRecording
                    ? colors.cardBorder
                    : colors.accent || '#10b981',
                },
              ]}
              onPress={onSubmit}
              disabled={!answerText.trim() || isSubmitting || isRecording}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <ThemedText style={styles.submitBtnText}>Nộp câu trả lời</ThemedText>
                  <Ionicons name="send" size={14} color="#ffffff" style={{ marginLeft: 4 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 4-Button Bottom Call Action Bar */}
      <View style={styles.buttonBar}>
        {/* Button 1: Microphone STT */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            isRecording
              ? { backgroundColor: colors.danger || '#ef4444' }
              : { backgroundColor: colors.primary },
          ]}
          onPress={toggleSpeech}
          disabled={isSubmitting}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={20}
            color="#ffffff"
          />
          <ThemedText style={styles.actionBtnText}>
            {isRecording ? 'Dừng nói' : 'Trả lời'}
          </ThemedText>
        </TouchableOpacity>

        {/* Button 2: Text Keyboard Editor */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.cardBorder }]}
          onPress={() => setEditorOpen(true)}
          disabled={isSubmitting}
        >
          <Ionicons name="keypad-outline" size={18} color={colors.text} />
          <ThemedText style={[styles.actionBtnText, { color: colors.text }]}>
            Gõ văn bản
          </ThemedText>
        </TouchableOpacity>

        {/* Button 3: TTS Speaker */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            isTtsSpeaking
              ? { backgroundColor: colors.accent || '#10b981' }
              : { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.cardBorder },
          ]}
          onPress={toggleTts}
          disabled={isSubmitting}
        >
          <Ionicons
            name={isTtsSpeaking ? 'volume-mute' : 'volume-high'}
            size={18}
            color={isTtsSpeaking ? '#ffffff' : colors.text}
          />
          <ThemedText
            style={[
              styles.actionBtnText,
              { color: isTtsSpeaking ? '#ffffff' : colors.text },
            ]}
          >
            {isTtsSpeaking ? 'Dừng đọc' : 'Nghe lại'}
          </ThemedText>
        </TouchableOpacity>

        {/* Button 4: Finish Early */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: colors.dangerLight || '#fee2e2', borderWidth: 1, borderColor: colors.danger || '#ef4444' },
          ]}
          onPress={onFinishEarly}
          disabled={isSubmitting || !canFinishEarly}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger || '#ef4444'} />
          <ThemedText style={[styles.actionBtnText, { color: colors.danger || '#ef4444' }]}>
            Nộp sớm
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Text Answer Modal (for typing or deep editing) */}
      <Modal
        visible={editorOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditorOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.editorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.editorHeader}>
              <ThemedText type="subtitle" style={styles.editorTitle}>
                Chỉnh sửa câu trả lời của bạn
              </ThemedText>
              <TouchableOpacity onPress={() => setEditorOpen(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.editorInput,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.cardBorder,
                },
              ]}
              multiline
              numberOfLines={6}
              value={answerText}
              onChangeText={setAnswerText}
              placeholder="Nhập hoặc bổ sung nội dung câu trả lời của bạn..."
              placeholderTextColor={colors.icon}
              textAlignVertical="top"
            />

            <View style={styles.editorFooter}>
              <ThemedText style={[styles.wordCounter, { color: colors.icon }]}>
                {wordCount} từ
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.cancelModalBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => setEditorOpen(false)}
                >
                  <ThemedText style={styles.cancelModalText}>Đóng</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitModalBtn,
                    { backgroundColor: !answerText.trim() ? colors.cardBorder : colors.primary },
                  ]}
                  disabled={!answerText.trim()}
                  onPress={() => {
                    setEditorOpen(false);
                    onSubmit();
                  }}
                >
                  <ThemedText style={styles.submitModalText}>Nộp ngay</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.one,
    borderTopWidth: 1,
    gap: Spacing.one,
  },
  draftContainer: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  draftLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  draftPreviewBox: {
    minHeight: 36,
  },
  draftText: {
    fontSize: 13,
    lineHeight: 18,
  },
  draftFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 3,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editorCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  editorInput: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
  },
  editorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCounter: {
    fontSize: 12,
  },
  cancelModalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  submitModalText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
