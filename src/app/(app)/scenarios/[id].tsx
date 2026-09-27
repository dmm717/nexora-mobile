import React, { useState, useMemo, useEffect } from 'react';
import { ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { scenariosApi } from '@/api/scenarios.api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/scenarios-detail.styles';

import { ScenarioBriefingCard } from '@/components/scenarios/ScenarioBriefingCard';
import { ActiveAttemptWorkbench } from '@/components/scenarios/ActiveAttemptWorkbench';
import { ScenarioHistorySection } from '@/components/scenarios/ScenarioHistorySection';

export default function ScenarioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // slug or id
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  // Fetch scenario details
  const { data: scenario, isLoading: isScenarioLoading } = useQuery({
    queryKey: ['scenario-detail', id],
    queryFn: () => scenariosApi.get(id!),
    enabled: !!id,
  });

  // Fetch attempt history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['scenario-history', id],
    queryFn: () => scenariosApi.getHistory(id!),
    enabled: !!id,
  });

  // Automatically select in-progress or latest attempt ID
  const activeAttemptId = useMemo(() => {
    if (selectedAttemptId) return selectedAttemptId;
    if (!history?.attempts || history.attempts.length === 0) return null;
    const inProgress = history.attempts.find(
      (a: any) => a.status === 'draft' || a.status === 'queued' || a.status === 'processing'
    );
    return inProgress ? inProgress.id : history.attempts[0].id;
  }, [selectedAttemptId, history]);

  // Fetch active attempt details
  const {
    data: activeAttempt,
    isLoading: attemptLoading,
  } = useQuery({
    queryKey: ['scenario-attempt', activeAttemptId],
    queryFn: () => scenariosApi.getAttempt(activeAttemptId!),
    enabled: !!activeAttemptId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'draft' || status === 'processing' || status === 'queued') {
        return 3000;
      }
      return false;
    },
  });

  // Sync answer text if active attempt is draft
  useEffect(() => {
    if (activeAttempt?.status === 'draft' && activeAttempt.answer) {
      setAnswer(activeAttempt.answer);
    }
  }, [activeAttempt?.id, activeAttempt?.status]);

  // Start new attempt mutation
  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!scenario?.id) throw new Error('Chưa chọn tình huống');
      return await scenariosApi.createAttempt(scenario.id);
    },
    onSuccess: (newAttempt) => {
      setSelectedAttemptId(newAttempt.id);
      setAnswer(newAttempt.answer || '');
      queryClient.invalidateQueries({ queryKey: ['scenario-history', id] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể tạo lượt thử mới.');
    },
  });

  // Submit attempt mutation
  const submitAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!answer.trim()) throw new Error('Vui lòng nhập hoặc thu âm câu trả lời');
      let targetAttemptId = activeAttemptId;

      if (!targetAttemptId || activeAttempt?.status !== 'draft') {
        try {
          const draftAttempt = await scenariosApi.createAttempt(scenario!.id);
          targetAttemptId = draftAttempt.id;
        } catch (err: any) {
          const errCode = err?.code || err?.response?.data?.error?.code;
          if (errCode === 'SCENARIO_ATTEMPT_IN_PROGRESS' || err?.status === 409 || err?.response?.status === 409) {
            const inProgress = history?.attempts?.find(
              (a: any) => a.status === 'draft' || a.status === 'queued' || a.status === 'processing'
            );
            if (inProgress) {
              targetAttemptId = inProgress.id;
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }

      const submitted = await scenariosApi.submitAttempt(targetAttemptId!, answer.trim());
      return submitted;
    },
    onSuccess: (data) => {
      setSelectedAttemptId(data.id);
      queryClient.invalidateQueries({ queryKey: ['scenario-history', id] });
      queryClient.invalidateQueries({ queryKey: ['scenario-attempt', data.id] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể nộp bài làm tình huống. Vui lòng thử lại.');
    },
  });

  // Retry scenario mutation
  const retryMutation = useMutation({
    mutationFn: async () => {
      if (!scenario?.id) throw new Error('Chưa chọn tình huống');
      return await scenariosApi.retry(scenario.id);
    },
    onSuccess: (newAttempt) => {
      setSelectedAttemptId(newAttempt.id);
      setAnswer('');
      queryClient.invalidateQueries({ queryKey: ['scenario-history', id] });
      queryClient.invalidateQueries({ queryKey: ['scenario-attempt', newAttempt.id] });
    },
    onError: (err: any) => {
      const errCode = err?.code || err?.response?.data?.error?.code;
      if (errCode === 'SCENARIO_ATTEMPT_IN_PROGRESS' || err?.status === 409 || err?.response?.status === 409) {
        const inProgress = history?.attempts?.find(
          (a: any) => a.status === 'draft' || a.status === 'queued' || a.status === 'processing'
        );
        if (inProgress) {
          setSelectedAttemptId(inProgress.id);
          setAnswer(inProgress.answer || '');
          return;
        }
      }
      Alert.alert('Lỗi', err.message || 'Không thể tạo lượt luyện tập mới.');
    },
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
        <AppScreenHeader title="Kịch Bản Tình Huống" fallbackRoute="/(app)/scenarios" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Scenario Briefing Header */}
          <ScenarioBriefingCard scenario={scenario} colors={colors} />

          {/* Interactive Workbench Area */}
          <ActiveAttemptWorkbench
            activeAttemptId={activeAttemptId}
            historyLoading={historyLoading}
            startAttemptMutation={startAttemptMutation}
            attemptLoading={attemptLoading}
            activeAttempt={activeAttempt}
            answer={answer}
            setAnswer={setAnswer}
            submitAttemptMutation={submitAttemptMutation}
            retryMutation={retryMutation}
            colors={colors}
          />

          {/* History View */}
          {history && history.attempts && history.attempts.length > 0 && (
            <ScenarioHistorySection
              history={history}
              activeAttemptId={activeAttemptId || undefined}
              onSelectAttempt={(attemptId) => setSelectedAttemptId(attemptId)}
              expandedId={expandedAttemptId}
              setExpandedId={setExpandedAttemptId}
              colors={colors}
            />
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="practice" />
      </SafeAreaView>
    </ThemedView>
  );
}
