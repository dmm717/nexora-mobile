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
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [showExitModal, setShowExitModal] = useState(false);

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
  } = useInterviewSession(id);

  if (isLoading || !interview) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: Spacing.two }}>Đang tải phòng phỏng vấn...</ThemedText>
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
          <TouchableOpacity onPress={() => setShowExitModal(true)} style={styles.backButton}>
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
