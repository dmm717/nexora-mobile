/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';
import { CVAnalysisResultView } from '@/components/cv-analysis/CVAnalysisResultView';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { ReportContentButton } from '@/components/moderation/ReportContentButton';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { exportCVAnalysisPdf } from '@/utils/exportOtherPdfs';
import { parseAnalysisData } from '@/components/cv-analysis/result-view/CVAnalysisResultHelpers';
import { toast } from '@/components/ui/toast/ToastProvider';

export default function CVAnalysisDetailScreen() {
  usePreventScreenCapture();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const [analysisId, setAnalysisId] = useState<string | null>(id || null);
  const { data: analysisResult, isError, isLoading } = useQuery({
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

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (!analysisResult || analysisResult.status !== 'completed' || isExporting) return;
    setIsExporting(true);
    try {
      const parsedData = parseAnalysisData(analysisResult, (analysisResult as any)?.mode || 'standard');
      await exportCVAnalysisPdf(parsedData);
    } catch {
      toast.error('Không thể xuất báo cáo PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  }, [analysisResult, isExporting]);

  if (isError) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four }}>
         <Ionicons name="warning-outline" size={48} color={colors.error || '#ef4444'} style={{ marginBottom: Spacing.three }} />
         <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>Không tìm thấy báo cáo CV</ThemedText>
         <ThemedText style={{ color: colors.textSecondary, marginTop: Spacing.two, textAlign: 'center', marginHorizontal: Spacing.four }}>
            Báo cáo này không tồn tại hoặc bạn không có quyền truy cập.
         </ThemedText>
         <TouchableOpacity
           style={{ marginTop: Spacing.five, backgroundColor: colors.primary, paddingHorizontal: Spacing.five, paddingVertical: Spacing.three, borderRadius: 12 }}
           onPress={() => router.replace('/(tabs)/cv-jd')}
         >
           <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Quay lại</ThemedText>
         </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <AppScreenHeader 
          title="Báo Cáo Phân Tích" 
          fallbackRoute="/(tabs)/cv-jd" 
          rightElement={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ReportContentButton 
                contentType="cv_analysis"
                contentId={analysisResult?.status === 'completed' && analysisResult.result ? analysisResult.id : undefined}
                iconSize={20}
                color={colors.primary}
              />
              <TouchableOpacity onPress={handleExportPdf} disabled={isExporting} style={{ padding: 6, opacity: isExporting ? 0.5 : 1 }}>
                <Ionicons name="download-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
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
