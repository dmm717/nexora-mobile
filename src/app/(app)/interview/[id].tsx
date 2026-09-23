import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

  const {
    router,
    interview,
    isLoading,
    currentQuestion,
    answerText,
    setAnswerText,
    isRecording,
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
  if (interview.status === 'starting') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowExitModal(true)} style={styles.exitSessionBtn}>
              <Ionicons name="log-out-outline" size={16} color={colors.danger} />
              <ThemedText style={[styles.exitSessionText, { color: colors.danger }]}>Thoát phiên</ThemedText>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={styles.title}>{interview.role || 'Phỏng Vấn AI'}</ThemedText>
              <ThemedText style={styles.subtitle}>Cấp bậc: {interview.seniority} • {(interview.interviewType || '').toUpperCase()}</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
              <ThemedText style={[styles.statusText, { color: colors.accent }]}>
                STARTING
              </ThemedText>
            </View>
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

  // 2. Processing / Completing State (status === 'completing' || status === 'processing')
  if (interview.status === 'completing' || interview.status === 'processing') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setShowExitModal(true)} style={styles.exitSessionBtn}>
              <Ionicons name="log-out-outline" size={16} color={colors.danger} />
              <ThemedText style={[styles.exitSessionText, { color: colors.danger }]}>Thoát phiên</ThemedText>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={styles.title}>{interview.role || 'Phỏng Vấn AI'}</ThemedText>
              <ThemedText style={styles.subtitle}>Cấp bậc: {interview.seniority} • {(interview.interviewType || '').toUpperCase()}</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
              <ThemedText style={[styles.statusText, { color: colors.accent }]}>
                {interview.status.toUpperCase()}
              </ThemedText>
            </View>
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
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => setShowExitModal(true)} style={styles.exitSessionBtn}>
            <Ionicons name="log-out-outline" size={16} color={colors.danger} />
            <ThemedText style={[styles.exitSessionText, { color: colors.danger }]}>Thoát phiên</ThemedText>
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
          {/* AI Presence Header */}
          <AiInterviewerPresence
            state={aiState}
            interviewerName="Nexora AI"
            roleLabel={`${interview.role} (${interview.seniority})`}
            colors={colors}
          />

          {/* Current Question Card */}
          <CurrentQuestionCard
            currentQuestion={currentQuestion}
            colors={colors}
            onComplete={() => completeMutation.mutate()}
            isCompleting={completeMutation.isPending}
          />

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
            toggleSpeech={toggleSpeech}
            isTtsSpeaking={isTtsSpeaking}
            toggleTts={toggleTts}
            durationSeconds={durationSeconds}
            onSubmit={() => submitAnswerMutation.mutate()}
            isSubmitting={submitAnswerMutation.isPending}
            onFinishEarly={handleEarlyExit}
            canFinishEarly={answeredCount > 0}
            colors={colors}
            isMicEnabled={isMicEnabled}
            isCameraOn={isCameraOn}
            onToggleCamera={() => setIsCameraOn(prev => !prev)}
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
