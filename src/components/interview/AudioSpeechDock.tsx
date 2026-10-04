/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
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
    <>
      <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
      {editorOpen ? (
        <View style={{ backgroundColor: colors.card, paddingVertical: 16 }}>
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
                marginBottom: 16,
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
        </View>
      ) : (
        <>
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
      {/* Bottom Action Bar */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12, backgroundColor: colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <ThemedText style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
            {isProcessingStt
              ? 'Đang gửi bản ghi âm lên hệ thống...'
              : isRecording
                ? `Đang nhận diện giọng nói ${formatTimer(durationSeconds)}...`
                : 'Nhấn micro để ghi âm và gửi tới Azure Speech chuyển thành văn bản (không tự động nộp). Bạn có thể dùng Bàn phím.'}
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Bàn phím */}
          <TouchableOpacity style={{ alignItems: 'center', width: 60 }} onPress={handleOpenEditor} disabled={isSubmitting}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundElement, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="keypad" size={20} color={colors.text} />
            </View>
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Bàn phím</ThemedText>
          </TouchableOpacity>
          {/* Camera */}
          <TouchableOpacity style={{ alignItems: 'center', width: 60 }} onPress={onToggleCamera} disabled={isSubmitting}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isCameraOn ? (colors.primary || '#6366f1') + '20' : colors.backgroundElement, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name={isCameraOn ? 'videocam' : 'videocam-off'} size={20} color={isCameraOn ? colors.primary : colors.text} />
            </View>
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Camera</ThemedText>
          </TouchableOpacity>
          {/* MAIN MIC */}
          <TouchableOpacity
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isProcessingStt ? (colors.warning || '#f59e0b') : isRecording ? (colors.danger || '#ef4444') : (colors.primary || '#6366f1'),
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: isRecording ? (colors.danger || '#ef4444') : (colors.primary || '#6366f1'),
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              marginTop: -20,
            }}
            onPress={() => {
              setActiveInputMode('voice');
              toggleSpeech();
            }}
            disabled={isSubmitting || isProcessingStt}
          >
            {isProcessingStt ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color="#ffffff" />
            )}
          </TouchableOpacity>
          {/* Nghe lại */}
          <TouchableOpacity style={{ alignItems: 'center', width: 60 }} onPress={toggleTts} disabled={isSubmitting}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isTtsSpeaking ? (colors.accent || '#10b981') + '20' : colors.backgroundElement, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name={isTtsSpeaking ? 'volume-mute' : 'volume-high'} size={20} color={isTtsSpeaking ? (colors.accent || '#10b981') : colors.text} />
            </View>
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Nghe lại</ThemedText>
          </TouchableOpacity>
          {/* Nộp sớm */}
          <TouchableOpacity style={{ alignItems: 'center', width: 60 }} onPress={onFinishEarly} disabled={isSubmitting || !canFinishEarly}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: (colors.danger || '#ef4444') + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="checkmark-done" size={20} color={colors.danger} />
            </View>
            <ThemedText style={{ fontSize: 10, color: colors.danger }}>Nộp sớm</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
        </>
      )}
    </View>
    <View style={{ height: keyboardHeight }} />
    </>
  );
}
