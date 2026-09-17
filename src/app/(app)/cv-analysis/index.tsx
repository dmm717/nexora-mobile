import React, { useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';
import { jobDescriptionsApi } from '@/api/job-descriptions.api';
import { profileApi } from '@/api/profile.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CVAnalysisConfigCard } from '@/components/cv-analysis/CVAnalysisConfigCard';
import { CVAnalysisResultView } from '@/components/cv-analysis/CVAnalysisResultView';

export default function CVAnalysisScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [mode, setMode] = useState<'standard' | 'job_targeted'>('standard');
  const [jdTitle, setJdTitle] = useState('');
  const [jdContent, setJdContent] = useState('');
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const { data: analysisResult } = useQuery({
    queryKey: ['resume-analysis', analysisId],
    queryFn: () => resumeAnalysesApi.get(analysisId!),
    enabled: !!analysisId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'processing' || status === 'queued') {
        return 3000;
      }
      return false;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.primaryResume?.id) throw new Error('No primary resume');
      
      let createdJdId: string | undefined = undefined;
      if (mode === 'job_targeted') {
        if (!jdTitle.trim() || !jdContent.trim()) {
          throw new Error('Vui lòng nhập tiêu đề và nội dung Mô Tả Công Việc (JD)');
        }
        const createdJd = await jobDescriptionsApi.create({
          title: jdTitle.trim(),
          content: jdContent.trim(),
        });
        createdJdId = createdJd.id;
      }

      const res = await resumeAnalysesApi.create({
        resumeId: profile.primaryResume.id,
        mode: mode,
        jobDescriptionId: createdJdId,
        careerGoalId: mode === 'standard' ? profile.activeCareerGoal?.id : undefined,
      });
      return res;
    },
    onSuccess: (data) => {
      setAnalysisId(data.id);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể bắt đầu phân tích CV. Vui lòng thử lại.');
      console.error(err);
    }
  });

  const handleStartAnalysis = useCallback(() => {
    if (!profile?.primaryResume) {
      Alert.alert('Chưa có CV chính', 'Vui lòng tải lên và chọn một CV làm Primary CV trước khi bắt đầu phân tích.');
      return;
    }
    analyzeMutation.mutate();
  }, [profile, analyzeMutation]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Phân Tích CV Chuyên Sâu</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isProfileLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : (
            <>
              <CVAnalysisConfigCard
                mode={mode}
                setMode={setMode}
                profile={profile}
                jdTitle={jdTitle}
                setJdTitle={setJdTitle}
                jdContent={jdContent}
                setJdContent={setJdContent}
                analysisId={analysisId}
                handleStartAnalysis={handleStartAnalysis}
                analyzeMutation={analyzeMutation}
                colors={colors}
              />
            </>
          )}

          {/* Result / Processing State */}
          <CVAnalysisResultView
            analysisId={analysisId}
            analysisResult={analysisResult}
            setAnalysisId={setAnalysisId}
            mode={mode}
            colors={colors}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
});
