import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { scenariosApi } from '@/api/scenarios.api';
import { speechService } from '@/services/speech';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from '@/styles/scenarios-detail.styles';

export default function ScenarioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // slug or id
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const { data: scenario, isLoading: isScenarioLoading } = useQuery({
    queryKey: ['scenario-detail', id],
    queryFn: () => scenariosApi.get(id!),
    enabled: !!id,
  });

  const { data: history } = useQuery({
    queryKey: ['scenario-history', id],
    queryFn: () => scenariosApi.getHistory(id!),
    enabled: !!id,
  });

  const { data: activeAttempt } = useQuery({
    queryKey: ['scenario-attempt', attemptId],
    queryFn: () => scenariosApi.getAttempt(attemptId!),
    enabled: !!attemptId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'draft' || status === 'processing' || status === 'queued') {
        return 3000;
      }
      return false;
    }
  });

  const toggleSpeech = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.startListening({
        onResult: (transcript) => {
          setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: (err) => {
          Alert.alert('Lỗi thu âm', err);
          setIsRecording(false);
        },
        onEnd: () => setIsRecording(false),
      });
    }
  };

  const submitAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!scenario?.id) throw new Error('Chưa chọn tình huống');
      if (!answer.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');

      const draftAttempt = await scenariosApi.createAttempt(scenario.id);
      const submitted = await scenariosApi.submitAttempt(draftAttempt.id, answer.trim());
      return submitted;
    },
    onSuccess: (data) => {
      setAttemptId(data.id);
      setIsRecording(false);
      queryClient.invalidateQueries({ queryKey: ['scenario-history', id] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể nộp bài làm tình huống. Vui lòng thử lại.');
    }
  });

  if (isScenarioLoading || !scenario) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Kịch Bản Tình Huống</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ScenarioHeaderCard scenario={scenario} colors={colors} />

          <ScenarioHistoryCard history={history} colors={colors} />

          <ScenarioAnswerCard
            colors={colors}
            answer={answer}
            setAnswer={setAnswer}
            isRecording={isRecording}
            toggleSpeech={toggleSpeech}
            onSubmit={() => submitAttemptMutation.mutate()}
            isSubmitting={submitAttemptMutation.isPending}
          />

          {attemptId && activeAttempt && (
            <ScenarioResultCard activeAttempt={activeAttempt} colors={colors} />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const ScenarioHeaderCard = React.memo(({ scenario, colors }: { scenario: any; colors: any }) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <ThemedText style={[styles.badgeText, { color: colors.primary }]}>{scenario.categoryName}</ThemedText>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
        <ThemedText style={[styles.badgeText, { color: colors.accent }]}>{scenario.difficulty.toUpperCase()}</ThemedText>
      </View>
    </View>

    <ThemedText type="subtitle" style={styles.scenarioTitle}>{scenario.title}</ThemedText>
    <ThemedText style={styles.scenarioSummary}>{scenario.summary}</ThemedText>

    <View style={[styles.contentBox, { backgroundColor: colors.backgroundElement }]}>
      <ThemedText style={styles.contentHeader}>📌 Đề Bài Tình Huống:</ThemedText>
      <ThemedText style={styles.contentText}>{scenario.content}</ThemedText>
    </View>
  </View>
));

const ScenarioHistoryCard = React.memo(({ history, colors }: { history: any; colors: any }) => {
  if (!history || !history.comparison) return null;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>Lịch Sử & So Sánh Kết Quả</ThemedText>
      <View style={styles.historyStatsRow}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Lần mới nhất</ThemedText>
          <ThemedText style={[styles.statValue, { color: colors.primary }]}>
            {history.latestScore !== null && history.latestScore !== undefined ? `${history.latestScore}/100` : '—'}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Cao nhất</ThemedText>
          <ThemedText style={[styles.statValue, { color: colors.accent }]}>
            {history.bestScore !== null && history.bestScore !== undefined ? `${history.bestScore}/100` : '—'}
          </ThemedText>
        </View>

        {history.comparison.delta !== null && history.comparison.delta !== undefined && (
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Mức cải thiện</ThemedText>
            <ThemedText style={[styles.statValue, { color: history.comparison.improved ? colors.accent : colors.danger }]}>
              {history.comparison.delta > 0 ? `+${history.comparison.delta}` : `${history.comparison.delta}`}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
});

const ScenarioAnswerCard = React.memo(({
  colors,
  answer,
  setAnswer,
  isRecording,
  toggleSpeech,
  onSubmit,
  isSubmitting,
}: {
  colors: any;
  answer: string;
  setAnswer: (text: string) => void;
  isRecording: boolean;
  toggleSpeech: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => (
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
      placeholder="Nhập hoặc nhấn Micro thu âm phương án xử lý tình huống..."
      placeholderTextColor={colors.textMuted}
      multiline
      numberOfLines={6}
      value={answer}
      onChangeText={setAnswer}
    />

    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[styles.micButton, isRecording && { backgroundColor: colors.danger }]}
        onPress={toggleSpeech}
      >
        <Ionicons name={isRecording ? 'mic-off' : 'mic'} size={20} color="#fff" />
        <ThemedText style={styles.micButtonText}>{isRecording ? 'Dừng' : 'Thu Âm'}</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary },
          (!answer.trim() || isSubmitting) && styles.disabledButton
        ]}
        onPress={onSubmit}
        disabled={!answer.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 6 }} />
            <ThemedText style={styles.submitButtonText}>Nộp Bài Làm</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
));

const ScenarioResultCard = React.memo(({ activeAttempt, colors }: { activeAttempt: any; colors: any }) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="analytics" size={20} color={colors.warning} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Kết Quả Xử Lý Tình Huống AI</ThemedText>
    </View>

    {(activeAttempt.status === 'draft' || activeAttempt.status === 'processing' || activeAttempt.status === 'queued') && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: Spacing.two }} />
        <ThemedText style={{ textAlign: 'center', opacity: 0.8 }}>
          AI đang đánh giá phương án xử lý tình huống của bạn...
        </ThemedText>
      </View>
    )}

    {activeAttempt.status === 'completed' && (
      <View style={{ gap: Spacing.two }}>
        <View style={styles.successRow}>
          <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
          <ThemedText style={[styles.successText, { color: colors.accent }]}>Hoàn tất đánh giá!</ThemedText>
        </View>

        <View style={[styles.evaluationBox, { backgroundColor: colors.backgroundElement }]}>
          <ThemedText style={styles.evaluationText}>
            {activeAttempt.evaluation
              ? typeof activeAttempt.evaluation === 'string'
                ? activeAttempt.evaluation
                : JSON.stringify(activeAttempt.evaluation, null, 2)
              : 'Phương án xử lý đã được ghi nhận.'}
          </ThemedText>
        </View>
      </View>
    )}

    {activeAttempt.status === 'failed' && (
      <View style={styles.errorRow}>
        <Ionicons name="alert-circle" size={22} color={colors.danger} />
        <ThemedText style={{ color: colors.danger }}>Đánh giá thất bại. Vui lòng thử lại.</ThemedText>
      </View>
    )}
  </View>
));
