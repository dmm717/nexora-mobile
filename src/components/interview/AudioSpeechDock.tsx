import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/audio-speech-dock.styles';

export interface AudioSpeechDockProps {
  answerText: string;
  setAnswerText: (text: string | ((prev: string) => string)) => void;
  isRecording: boolean;
  isProcessingStt?: boolean;
  toggleSpeech: () => void;
  isTtsSpeaking: boolean;
  toggleTts: () => void;
  durationSeconds: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  onFinishEarly: () => void;
  canFinishEarly: boolean;
  colors: any;
  isMicEnabled?: boolean;
  isCameraOn?: boolean;
  onToggleCamera?: () => void;
}

export function AudioSpeechDock({
  answerText,
  setAnswerText,
  isRecording,
  isProcessingStt = false,
  toggleSpeech,
  isTtsSpeaking,
  toggleTts,
  durationSeconds,
  onSubmit,
  isSubmitting,
  onFinishEarly,
  canFinishEarly,
  colors,
  isMicEnabled = true,
  isCameraOn = false,
  onToggleCamera,
}: AudioSpeechDockProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState<'voice' | 'keyboard'>('voice');

  const handleOpenEditor = () => {
    setActiveInputMode('keyboard');
    if (isRecording) {
      toggleSpeech();
    }
    setIsClosing(false);
    setEditorOpen(true);
  };

  const handleCloseEditor = (onComplete?: () => void) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setEditorOpen(false);
      if (onComplete) {
        onComplete();
      }
    }, 250);
  };

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
      {Boolean(answerText.trim() || isRecording || isProcessingStt) && (
        <View style={[styles.draftContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <View style={styles.draftHeader}>
            <View style={styles.draftHeaderLeft}>
              <Ionicons
                name={isProcessingStt ? 'cloud-upload-outline' : isRecording ? 'mic' : 'create-outline'}
                size={16}
                color={isProcessingStt ? colors.warning || '#f59e0b' : isRecording ? colors.danger || '#ef4444' : colors.primary}
              />
              <ThemedText style={styles.draftLabel}>
                {isProcessingStt ? 'Đang xử lý giọng nói...' : isRecording ? 'Đang nhận diện giọng nói...' : `Phụ đề câu trả lời · ${wordCount} từ`}
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
              onPress={handleOpenEditor}
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
              disabled={!answerText.trim() || isSubmitting || isRecording || isProcessingStt}
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

      {/* 6-Button Bottom Call Action Bar (Matching Web FE UI) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonBarScroll}
      >
        {/* Nút 1: Trả lời bằng Voice (Microphone STT) - luôn hiển thị */}
        <TouchableOpacity
          style={[
            styles.actionBtnCall,
            isProcessingStt
              ? { backgroundColor: colors.warning || '#f59e0b' }
              : isRecording
              ? { backgroundColor: colors.danger || '#ef4444' }
              : { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
          ]}
          onPress={() => {
            setActiveInputMode('voice');
            toggleSpeech();
          }}
          disabled={isSubmitting || isProcessingStt}
        >
          {isProcessingStt ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons
              name={isRecording ? 'stop-circle' : 'mic'}
              size={18}
              color={isRecording ? '#ffffff' : (colors.primary || '#6366f1')}
            />
          )}
          <ThemedText style={[styles.actionBtnCallText, { color: isProcessingStt || isRecording ? '#ffffff' : (colors.primary || '#6366f1') }]}>
            {isProcessingStt ? 'Đang xử lý...' : isRecording ? 'Dừng nói' : 'Trả lời'}
          </ThemedText>
        </TouchableOpacity>

        {/* Nút 3: Bàn phím */}
        <TouchableOpacity
          style={[
            styles.actionBtnCall,
            activeInputMode === 'keyboard'
              ? { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' }
              : { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.cardBorder },
          ]}
          onPress={handleOpenEditor}
          disabled={isSubmitting}
        >
          <Ionicons
            name="keypad-outline"
            size={16}
            color={activeInputMode === 'keyboard' ? (colors.primary || '#6366f1') : colors.text}
          />
          <ThemedText
            style={[
              styles.actionBtnCallText,
              { color: activeInputMode === 'keyboard' ? (colors.primary || '#6366f1') : colors.text },
            ]}
          >
            Bàn phím
          </ThemedText>
        </TouchableOpacity>

        {/* Nút 4: Bật/Tắt Camera */}
        <TouchableOpacity
          style={[
            styles.actionBtnCall,
            isCameraOn
              ? { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' }
              : { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.cardBorder },
          ]}
          onPress={onToggleCamera}
          disabled={isSubmitting}
        >
          <Ionicons
            name={isCameraOn ? 'videocam' : 'videocam-off-outline'}
            size={16}
            color={isCameraOn ? (colors.primary || '#6366f1') : colors.text}
          />
          <ThemedText
            style={[
              styles.actionBtnCallText,
              { color: isCameraOn ? (colors.primary || '#6366f1') : colors.text },
            ]}
          >
            {isCameraOn ? 'Tắt camera' : 'Bật camera'}
          </ThemedText>
        </TouchableOpacity>

        {/* Nút 5: Nghe lại câu hỏi (TTS Speaker) */}
        <TouchableOpacity
          style={[
            styles.actionBtnCall,
            isTtsSpeaking
              ? { backgroundColor: colors.accent || '#10b981' }
              : { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.cardBorder },
          ]}
          onPress={toggleTts}
          disabled={isSubmitting}
        >
          <Ionicons
            name={isTtsSpeaking ? 'volume-mute' : 'volume-high-outline'}
            size={16}
            color={isTtsSpeaking ? '#ffffff' : colors.text}
          />
          <ThemedText
            style={[
              styles.actionBtnCallText,
              { color: isTtsSpeaking ? '#ffffff' : colors.text },
            ]}
          >
            {isTtsSpeaking ? 'Dừng đọc' : 'Nghe lại câu hỏi'}
          </ThemedText>
        </TouchableOpacity>

        {/* Nút 6: Nộp bài sớm */}
        <TouchableOpacity
          style={[
            styles.actionBtnCall,
            { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
          ]}
          onPress={onFinishEarly}
          disabled={isSubmitting || !canFinishEarly}
        >
          <Ionicons name="call-outline" size={16} color={colors.danger || '#ef4444'} />
          <ThemedText style={[styles.actionBtnCallText, { color: colors.danger || '#ef4444' }]}>
            Nộp bài sớm
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Status Hint Caption (Matching Web FE Copy) */}
      <View style={styles.statusHintContainer}>
        <ThemedText style={[styles.statusHintText, { color: colors.textSecondary }]}>
          {isProcessingStt
            ? 'Đang gửi bản ghi âm lên hệ thống xử lý giọng nói...'
            : isRecording
            ? `Đang nhận diện giọng nói ${formatTimer(durationSeconds)} · Bấm Dừng nói để lấy phụ đề (không tự động nộp)`
            : 'Nhấn microphone để bắt đầu trả lời · không tự động nộp'}
        </ThemedText>
      </View>

      {/* Text Answer Modal (for typing or deep editing) */}
      <Modal
        visible={editorOpen}
        animationType="none"
        transparent={true}
        onRequestClose={() => handleCloseEditor()}
      >
        {!isClosing && (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(180)}
            style={styles.modalBackdrop}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => handleCloseEditor()}
            />

            <Animated.View
              entering={SlideInDown.duration(320).springify().damping(20).stiffness(140)}
              exiting={SlideOutDown.duration(200)}
              style={[styles.editorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              {/* Sheet Handle */}
              <View style={styles.sheetHandleBox}>
                <View style={[styles.sheetHandlePill, { backgroundColor: (colors.cardBorder || '#e2e8f0') }]} />
              </View>

              {/* Header */}
              <View style={styles.editorHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.editorHeaderIconBox, { backgroundColor: (colors.primary || '#6366f1') + '15' }]}>
                    <Ionicons name="create-outline" size={20} color={colors.primary || '#6366f1'} />
                  </View>
                  <View>
                    <ThemedText type="subtitle" style={styles.editorTitle}>
                      Chỉnh sửa câu trả lời
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: colors.icon || '#64748b', marginTop: 1 }}>
                      Gõ văn bản chi tiết trước khi nộp
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.closeIconBtn, { backgroundColor: (colors.cardBorder || '#e2e8f0') + '50' }]}
                  onPress={() => handleCloseEditor()}
                >
                  <Ionicons name="close" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Textarea Container */}
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.editorInput,
                    {
                      color: colors.text,
                    },
                  ]}
                  autoFocus={true}
                  multiline
                  numberOfLines={6}
                  value={answerText}
                  onChangeText={setAnswerText}
                  placeholder="Nhập nội dung câu trả lời của bạn tại đây..."
                  placeholderTextColor={(colors.icon || '#64748b') + '80'}
                  textAlignVertical="top"
                />
              </View>

              {/* Footer */}
              <View style={styles.editorFooter}>
                <View style={[styles.wordCountBadge, { backgroundColor: (colors.primary || '#6366f1') + '12' }]}>
                  <Ionicons name="document-text-outline" size={14} color={colors.primary || '#6366f1'} />
                  <ThemedText style={[styles.wordCounter, { color: colors.primary || '#6366f1' }]}>
                    {wordCount} từ
                  </ThemedText>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.cancelModalBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                    onPress={() => handleCloseEditor()}
                  >
                    <ThemedText style={[styles.cancelModalText, { color: colors.text }]}>Đóng</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitModalBtn,
                      {
                        backgroundColor: !answerText.trim()
                          ? (colors.cardBorder || '#cbd5e1')
                          : (colors.primary || '#6366f1'),
                      },
                    ]}
                    disabled={!answerText.trim()}
                    onPress={() => handleCloseEditor(() => onSubmit())}
                  >
                    <Ionicons name="send" size={13} color="#ffffff" style={{ marginRight: 6 }} />
                    <ThemedText style={styles.submitModalText}>Nộp ngay</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </Modal>
    </View>
  );
}

