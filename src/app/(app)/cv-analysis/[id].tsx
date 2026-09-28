import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { ThemedView } from '@/components/themed-view';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';
import { CVAnalysisResultView } from '@/components/cv-analysis/CVAnalysisResultView';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { ReportContentButton } from '@/components/moderation/ReportContentButton';

export default function CVAnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [analysisId, setAnalysisId] = useState<string | null>(id || null);

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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <AppScreenHeader 
          title="Báo Cáo Phân Tích" 
          fallbackRoute="/(tabs)/cv-jd" 
          rightElement={
            <ReportContentButton 
              contentType="cv_analysis"
              contentId={analysisId || 'unknown'}
              iconSize={20}
              color={colors.primary}
            />
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <CVAnalysisResultView
            analysisId={analysisId}
            analysisResult={analysisResult}
            setAnalysisId={setAnalysisId}
            mode={(analysisResult as any)?.mode || 'standard'}
            colors={colors}
          />
        </ScrollView>
        <AppBottomNavBar activeTab="cv-jd" />
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
});
