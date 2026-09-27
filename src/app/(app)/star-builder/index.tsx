import React, { useState, useMemo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { starApi } from '@/api/star.api';

import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/star-builder.styles';
import { safeBack } from '@/utils/navigation';

import { StarQuestionInputCard } from '@/components/star-builder/StarQuestionInputCard';
import { StarAnswerInputCard } from '@/components/star-builder/StarAnswerInputCard';
import { StarEvaluationResultCard } from '@/components/star-builder/StarEvaluationResultCard';

export default function StarBuilderScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const params = useLocalSearchParams<{ question?: string; scenario?: string; attempt?: string }>();
  const [question, setQuestion] = useState(params.question || '');
  const [answer, setAnswer] = useState('');
  const [attemptId, setAttemptId] = useState<string | null>(params.attempt || null);

  useEffect(() => {
    if (params.question) {
      setQuestion(params.question);
    } else if (params.scenario) {
      setQuestion(`Tình huống phỏng vấn: ${params.scenario}`);
    }
  }, [params.question, params.scenario]);

  const { data: starAttempts } = useQuery({
    queryKey: ['star-attempts'],
    queryFn: starApi.list,
  });

  const { data: activeAttempt } = useQuery({
    queryKey: ['star-attempt', attemptId],
    queryFn: () => starApi.get(attemptId!),
    enabled: !!attemptId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'queued' || status === 'processing') {
        return 3000;
      }
      return false;
    }
  });

  useEffect(() => {
    if (activeAttempt) {
      if (activeAttempt.question) setQuestion(activeAttempt.question);
      if (activeAttempt.answer) setAnswer(activeAttempt.answer);
    }
  }, [activeAttempt]);

  const createStarMutation = useMutation({
    mutationFn: async () => {
      if (!question.trim()) throw new Error('Vui lòng nhập câu hỏi phỏng vấn');
      if (!answer.trim()) throw new Error('Vui lòng nhập câu trả lời');

      const res = await starApi.create({
        question: question.trim(),
        answer: answer.trim(),
      });
      return res;
    },
    onSuccess: (data) => {
      setAttemptId(data.id);
      queryClient.invalidateQueries({ queryKey: ['star-attempts'] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể phân tích mô hình STAR. Vui lòng thử lại.');
    }
  });

  const evaluation = activeAttempt?.evaluation || (activeAttempt as any)?.Evaluation;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <AppScreenHeader title="Chuẩn Hóa STAR Builder AI" fallbackRoute="/(tabs)/practice" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <StarQuestionInputCard question={question} setQuestion={setQuestion} colors={colors} />

          <StarAnswerInputCard
            colors={colors}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={() => createStarMutation.mutate()}
            isSubmitting={createStarMutation.isPending}
          />

          {attemptId && activeAttempt && (
            <StarEvaluationResultCard
              activeAttempt={activeAttempt}
              evaluation={evaluation}
              colors={colors}
            />
          )}

          {starAttempts && starAttempts.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>Lịch Sử Phân Tích STAR ({starAttempts.length})</ThemedText>
              <View style={{ gap: Spacing.two, marginTop: Spacing.one }}>
                {starAttempts.slice(0, 5).map((att) => (
                  <TouchableOpacity
                    key={att.id}
                    style={[styles.historyRow, { backgroundColor: colors.backgroundElement }]}
                    onPress={() => setAttemptId(att.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.historyQuestion} numberOfLines={1}>Q: {att.question}</ThemedText>
                      <ThemedText style={styles.historyDate}>{new Date(att.createdAt).toLocaleDateString('vi-VN')}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="practice" />
      </SafeAreaView>
    </ThemedView>
  );
}
