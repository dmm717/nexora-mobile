import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { starApi } from '@/api/star.api';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/star-builder.styles';
import { ReportContentButton } from '@/components/moderation/ReportContentButton';

import { StarQuestionInputCard } from '@/components/star-builder/StarQuestionInputCard';
import { StarAnswerInputCard } from '@/components/star-builder/StarAnswerInputCard';
import { StarEvaluationResultCard } from '@/components/star-builder/StarEvaluationResultCard';
import { toast } from '@/components/ui/toast/ToastProvider';
import { exportStarPdf } from '@/utils/exportOtherPdfs';

export default function StarBuilderScreen() {
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

  const { data: activeAttempt, isError: isActiveAttemptError } = useQuery({
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
    if (isActiveAttemptError) {
      toast.error('Không tìm thấy lịch sử phân tích STAR này.');
      setAttemptId(null);
    }
  }, [activeAttempt, isActiveAttemptError]);

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
      toast.error(err.message || 'Không thể phân tích mô hình STAR. Vui lòng thử lại.');
    }
  });

  const evaluation = activeAttempt?.evaluation || (activeAttempt as any)?.Evaluation;

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (!activeAttempt || activeAttempt.status !== 'completed' || isExporting) return;
    setIsExporting(true);
    try {
      await exportStarPdf(activeAttempt);
    } catch {
      toast.error('Không thể xuất báo cáo PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [activeAttempt, isExporting]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <AppScreenHeader 
          title="Chuẩn Hóa STAR Builder AI" 
          fallbackRoute="/(tabs)/practice" 
          rightElement={
            activeAttempt ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ReportContentButton 
                  contentType="star_suggestion"
                  contentId={activeAttempt.id || 'star-builder'}
                  iconSize={20}
                  color={colors.primary}
                />
                <TouchableOpacity onPress={handleExportPdf} disabled={isExporting} style={{ padding: 6, opacity: isExporting ? 0.5 : 1 }}>
                  <Ionicons name="download-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />

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
