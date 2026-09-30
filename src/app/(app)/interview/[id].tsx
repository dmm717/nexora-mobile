import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View, AppState, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInterviewSession } from '@/components/interview/useInterviewSession';
import { AiInterviewerPresence } from '@/components/interview/AiInterviewerPresence';
import { AudioSpeechDock } from '@/components/interview/AudioSpeechDock';
import { QuickCoachingModal } from '@/components/interview/QuickCoachingModal';
import { GlassCard } from '@/components/ui/glass-card';
import {
  CurrentQuestionCard,
  Q2BoundaryModal,
  Q3BoundaryModal,
  QuestionCoachTipCard,
  SessionTranscriptAccordion,
  ExitConfirmationModal,
} from '@/components/interview/InterviewSubComponents';
import { styles } from '@/styles/interview-room.styles';

export default function InterviewRoomScreen() {
  const { id, micMode } = useLocalSearchParams<{ id: string; micMode?: string }>();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [showExitModal, setShowExitModal] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [appState, setAppState] = useState(AppState.currentState);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, []);

  const handleToggleCamera = async () => {
    if (isCameraOn) {
      setIsCameraOn(false);
      return;
    }
    
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        if (!response.canAskAgain) {
           Alert.alert('Cấp quyền Camera', 'Chúng tôi cần camera để phân tích biểu cảm phỏng vấn. Vui lòng vào Cài đặt để cấp quyền cho Nexora.', [
             { text: 'Hủy', style: 'cancel' },
             { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() }
           ]);
        }
        return;
      }
    }
    setIsCameraOn(true);
  };

  const {
    router,
    interview,
    isLoading,
    currentQuestion,
    answerText,
    setAnswerText,
    isRecording,
    isProcessingStt,
    toggleSpeech,
    isTtsSpeaking,
    toggleTts,
    durationSeconds,
    aiState,
    lastCoaching,
    showCoachingModal,
    setShowCoachingModal,
    handleContinueAfterCoaching,
    showQ2BoundaryModal,
    setShowQ2BoundaryModal,
    showQ3BoundaryModal,
    setShowQ3BoundaryModal,
    submitAnswerMutation,
    completeMutation,
    continueMutation,
    retryQuestionPreparationMutation,
    isMicAllowed,
  } = useInterviewSession(id);

  const isMicEnabled = true;

  if (isLoading || !interview) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: Spacing.two }}>Đang tải phòng phỏng vấn...</ThemedText>
      </ThemedView>
    );
  }

  // 1. Preparing State (status === 'starting')
  if (interview.status === 'starting' && interview.questionPreparationState !== 'failed') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: 'transparent', backgroundColor: colors.background, paddingBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }]}>
            <TouchableOpacity onPress={() => setShowExitModal(true)} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText type="title" style={[styles.title, { fontSize: 18, fontWeight: '800' }]}>{interview.role || 'Phỏng Vấn AI'}</ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                <ThemedText style={styles.subtitle}>Cấp bậc: {interview.seniority} • {(interview.interviewType || '').toUpperCase()}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: colors.accentLight || '#d1fae5', paddingVertical: 2, paddingHorizontal: 6 }]}>
                  <ThemedText style={[styles.statusText, { color: colors.accent || '#059669', fontSize: 10 }]}>
                    STARTING
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={{ width: 32 }} />
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four }}>
            <GlassCard style={{ padding: Spacing.five, borderRadius: 24, alignItems: 'center', width: '100%', maxWidth: 450, gap: Spacing.three }}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: Spacing.two }} />
              <ThemedText type="title" style={{ textAlign: 'center', fontSize: 18, fontWeight: '700' }}>
                Đang chuẩn bị câu hỏi phỏng vấn...
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                Nexora AI đang tổng hợp các tình huống phù hợp nhất với vị trí {interview.role || 'mục tiêu'}. Vui lòng chờ trong giây lát.
              </ThemedText>
            </GlassCard>
          </View>

          <ExitConfirmationModal
            visible={showExitModal}
            colors={colors}
            onStay={() => setShowExitModal(false)}
            onLeave={() => {
              setShowExitModal(false);
              router.replace('/(app)/interview/history' as any);
            }}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 1.5. Preparation Failed State
  if (interview.status === 'starting' && interview.questionPreparationState === 'failed') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: 'transparent', backgroundColor: colors.background, paddingBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }]}>
            <TouchableOpacity onPress={() => setShowExitModal(true)} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText type="title" style={[styles.title, { fontSize: 18, fontWeight: '800' }]}>{interview.role || 'Phỏng Vấn AI'}</ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                <ThemedText style={styles.subtitle}>Cấp bậc: {interview.seniority} • {(interview.interviewType || '').toUpperCase()}</ThemedText>
              </View>
            </View>
            <View style={{ width: 32 }} />
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four }}>
            <GlassCard style={{ padding: Spacing.five, borderRadius: 24, alignItems: 'center', width: '100%', maxWidth: 450, gap: Spacing.three, borderColor: colors.danger }}>
              <Ionicons name="warning" size={48} color={colors.danger} />
              <ThemedText type="title" style={{ textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.danger }}>
                Lỗi chuẩn bị câu hỏi
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                Đã có sự cố khi AI sinh câu hỏi phỏng vấn. Vui lòng thử lại.
              </ThemedText>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.danger, marginTop: Spacing.three, width: '100%' }]}
                onPress={() => retryQuestionPreparationMutation.mutate()}
                disabled={retryQuestionPreparationMutation.isPending}
              >
                {retryQuestionPreparationMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Thử lại chuẩn bị câu hỏi</ThemedText>
                )}
              </TouchableOpacity>
            </GlassCard>
          </View>

          <ExitConfirmationModal
            visible={showExitModal}
            colors={colors}
            onStay={() => setShowExitModal(false)}
            onLeave={() => {
              setShowExitModal(false);
              router.replace('/(app)/interview/history' as any);
            }}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 2. Processing / Completing State (status === 'completing' || status === 'evaluating')
  if (interview.status === 'completing' || interview.status === 'evaluating') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: 'transparent', backgroundColor: colors.background, paddingBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }]}>
            <TouchableOpacity onPress={() => setShowExitModal(true)} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText type="title" style={[styles.title, { fontSize: 18, fontWeight: '800' }]}>{interview.role || 'Phỏng Vấn AI'}</ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                <ThemedText style={styles.subtitle}>Cấp bậc: {interview.seniority} • {(interview.interviewType || '').toUpperCase()}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: colors.accentLight || '#d1fae5', paddingVertical: 2, paddingHorizontal: 6 }]}>
                  <ThemedText style={[styles.statusText, { color: colors.accent || '#059669', fontSize: 10 }]}>
                    {interview.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={{ width: 32 }} />
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four }}>
            <GlassCard style={{ padding: Spacing.five, borderRadius: 24, alignItems: 'center', width: '100%', maxWidth: 450, gap: Spacing.three }}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: Spacing.two }} />
              <ThemedText type="title" style={{ textAlign: 'center', fontSize: 18, fontWeight: '700' }}>
                Đang chấm điểm & Tổng hợp báo cáo...
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                AI đang hoàn tất đánh giá 4 trục Rubric và mô hình STAR cho buổi phỏng vấn.
              </ThemedText>
            </GlassCard>
          </View>

          <ExitConfirmationModal
            visible={showExitModal}
            colors={colors}
            onStay={() => setShowExitModal(false)}
            onLeave={() => {
              setShowExitModal(false);
              router.replace('/(app)/interview/history' as any);
            }}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const answeredCount = interview.answers?.length || 0;
  const currentSequence = currentQuestion?.sequence ?? (answeredCount + 1);

  const handleEarlyExit = () => {
    if (answeredCount === 0) {
      setShowExitModal(true);
      return;
    }
    Alert.alert(
      'Nộp Bài Phỏng Vấn Sớm',
      'Bạn có chắc chắn muốn kết thúc bài phỏng vấn ngay bây giờ và nhận Báo Cáo Đánh Giá?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nộp Bài & Nhận Báo Cáo',
          style: 'destructive',
          onPress: () => completeMutation.mutate(),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: 'transparent', backgroundColor: colors.background, paddingBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }]}>
          <TouchableOpacity onPress={() => setShowExitModal(true)} style={{ padding: 4 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <ThemedText type="title" style={[styles.title, { fontSize: 18, fontWeight: '800' }]}>{interview.role || 'Phỏng Vấn AI'}</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
              <ThemedText style={styles.subtitle}>Cấp bậc: {interview.seniority} • {(interview.interviewType || '').toUpperCase()}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: colors.accentLight || '#d1fae5', paddingVertical: 2, paddingHorizontal: 6 }]}>
                <ThemedText style={[styles.statusText, { color: colors.accent || '#059669', fontSize: 10 }]}>
                  {interview.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {isCameraOn && permission?.granted && appState === 'active' && (
          <View style={{
            position: 'absolute',
            top: 75,
            right: 16,
            width: 100,
            height: 140,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: colors.cardBorder,
            backgroundColor: '#000',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            zIndex: 100,
          }}>
            <CameraView style={{ flex: 1 }} facing="front" mute={true} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* AI Presence Header */}
          <AiInterviewerPresence
            state={aiState}
            interviewerName="Nexora AI"
            roleLabel={`${interview.role} (${interview.seniority})`}
            colors={colors}
          />

          {/* Current Question Card or Question Preparation Status */}
          {!currentQuestion && interview.questionPreparationState === 'processing' ? (
            <GlassCard style={{ padding: Spacing.four, borderRadius: 16, alignItems: 'center', marginVertical: Spacing.two }}>
              <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: Spacing.two }} />
              <ThemedText type="subtitle" style={{ fontSize: 16, textAlign: 'center' }}>Đang chuẩn bị câu hỏi tiếp theo...</ThemedText>
              <ThemedText style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 13, marginTop: Spacing.one }}>
                Nexora AI đang tạo câu hỏi tiếp theo dựa trên diễn biến phỏng vấn thực tế của bạn.
              </ThemedText>
            </GlassCard>
          ) : !currentQuestion && interview.questionPreparationState === 'failed' ? (
            <GlassCard style={{ padding: Spacing.four, borderRadius: 16, alignItems: 'center', marginVertical: Spacing.two, borderColor: colors.danger, borderWidth: 1 }}>
              <ThemedText type="subtitle" style={{ fontSize: 16, color: colors.danger, textAlign: 'center' }}>Chưa thể chuẩn bị câu hỏi tiếp theo.</ThemedText>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.danger, marginTop: Spacing.three, width: '100%' }]}
                onPress={() => retryQuestionPreparationMutation.mutate()}
                disabled={retryQuestionPreparationMutation.isPending}
              >
                {retryQuestionPreparationMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.primaryButtonText}>Thử lại</ThemedText>
                )}
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <CurrentQuestionCard
              currentQuestion={currentQuestion}
              colors={colors}
              onComplete={() => completeMutation.mutate()}
              isCompleting={completeMutation.isPending}
            />
          )}

          {/* AI Coach Tip Card */}
          {currentQuestion && (
            <QuestionCoachTipCard sequence={currentSequence} colors={colors} />
          )}

          {/* Session Transcript Accordion for answered questions */}
          <SessionTranscriptAccordion
            answers={interview.answers}
            questions={interview.questions}
            colors={colors}
          />
        </ScrollView>

        {/* Bottom Audio Speech Call Dock */}
        {currentQuestion && (
          <AudioSpeechDock
            answerText={answerText}
            setAnswerText={setAnswerText}
            isRecording={isRecording}
            isProcessingStt={isProcessingStt}
            toggleSpeech={toggleSpeech}
            isTtsSpeaking={isTtsSpeaking}
            toggleTts={toggleTts}
            durationSeconds={durationSeconds}
            onSubmit={() => submitAnswerMutation.mutate()}
            isSubmitting={submitAnswerMutation.isPending}
            onFinishEarly={handleEarlyExit}
            canFinishEarly={interview.continuation?.canFinishNow === true}
            colors={colors}
            isMicEnabled={isMicEnabled}
            isCameraOn={isCameraOn}
            onToggleCamera={handleToggleCamera}
          />
        )}

        {/* Quick Coaching Drawer / Modal */}
        <QuickCoachingModal
          visible={showCoachingModal}
          coaching={lastCoaching}
          questionSequence={answeredCount}
          onContinue={handleContinueAfterCoaching}
          onClose={() => setShowCoachingModal(false)}
          colors={colors}
        />

        {/* Q2 Boundary Modal */}
        <Q2BoundaryModal
          visible={showQ2BoundaryModal}
          colors={colors}
          onContinue={() => setShowQ2BoundaryModal(false)}
          onComplete={() => completeMutation.mutate()}
        />

        {/* Q3 Boundary Modal */}
        <Q3BoundaryModal
          visible={showQ3BoundaryModal}
          colors={colors}
          onComplete={() => completeMutation.mutate()}
          isCompleting={completeMutation.isPending}
          onContinueDeep={() => continueMutation.mutate()}
          isContinuing={continueMutation.isPending}
        />

        {/* Exit Confirmation Modal */}
        <ExitConfirmationModal
          visible={showExitModal}
          colors={colors}
          onStay={() => setShowExitModal(false)}
          onLeave={() => {
            setShowExitModal(false);
            router.replace('/(app)/interview/history' as any);
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}
