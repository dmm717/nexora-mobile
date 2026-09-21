import React from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInterviewSession } from '@/components/interview/useInterviewSession';
import {
  AnswerInputCard,
  CurrentQuestionCard,
  Q2BoundaryModal,
  Q3BoundaryModal,
} from '@/components/interview/InterviewSubComponents';
import { styles } from './[id].styles';

export default function InterviewRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const {
    router,
    interview,
    isLoading,
    currentQuestion,
    answerText,
    setAnswerText,
    isRecording,
    toggleSpeech,
    durationSeconds,
    lastCoaching,
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
          <CurrentQuestionCard
            currentQuestion={currentQuestion}
            colors={colors}
            onComplete={() => completeMutation.mutate()}
            isCompleting={completeMutation.isPending}
          />

          {/* Quick Coaching Feedback Card */}
          {lastCoaching && (
            <View style={[styles.card, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.primary }]}>Quick Coaching AI</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 13, lineHeight: 18 }}>
                {typeof lastCoaching === 'string' ? lastCoaching : JSON.stringify(lastCoaching)}
              </ThemedText>
            </View>
          )}

          {/* Input & Speech STT Section */}
          {currentQuestion && (
            <AnswerInputCard
              colors={colors}
              answerText={answerText}
              setAnswerText={setAnswerText}
              isRecording={isRecording}
              toggleSpeech={toggleSpeech}
              durationSeconds={durationSeconds}
              onSubmit={() => submitAnswerMutation.mutate()}
              isSubmitting={submitAnswerMutation.isPending}
            />
          )}
        </ScrollView>

        <Q2BoundaryModal
          visible={showQ2BoundaryModal}
          colors={colors}
          onContinue={() => setShowQ2BoundaryModal(false)}
          onComplete={() => completeMutation.mutate()}
        />

        <Q3BoundaryModal
          visible={showQ3BoundaryModal}
          colors={colors}
          onComplete={() => completeMutation.mutate()}
          isCompleting={completeMutation.isPending}
          onContinueDeep={() => continueMutation.mutate()}
          isContinuing={continueMutation.isPending}
        />
      </SafeAreaView>
    </ThemedView>
  );
}
