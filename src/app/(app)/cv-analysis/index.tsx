import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';
import { profileApi } from '@/api/profile.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CVAnalysisScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const { data: analysisResult, refetch: refetchAnalysis } = useQuery({
    queryKey: ['resume-analysis', analysisId],
    queryFn: () => resumeAnalysesApi.get(analysisId!),
    enabled: !!analysisId,
    refetchInterval: (query) => {
      // Polling fallback 5s if still processing
      if (query.state.data?.status === 'pending' || query.state.data?.status === 'processing') {
        return 5000;
      }
      return false;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.primaryResume?.id) throw new Error('No primary resume');
      const res = await resumeAnalysesApi.create({
        resumeId: profile.primaryResume.id,
        mode: 'standard', // default mode
        careerGoalId: profile.activeCareerGoal?.id,
      });
      return res;
    },
    onSuccess: (data) => {
      setAnalysisId(data.id);
    },
    onError: (err) => {
      Alert.alert('Lỗi', 'Không thể bắt đầu phân tích CV.');
      console.error(err);
    }
  });

  const handleStartAnalysis = () => {
    if (!profile?.primaryResume) {
      Alert.alert('Chưa có CV', 'Vui lòng tải lên và đặt một CV làm Primary CV trước khi phân tích.');
      return;
    }
    analyzeMutation.mutate();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Phân Tích CV</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isProfileLoading ? (
            <ActivityIndicator size="large" color="#3525CD" />
          ) : (
            <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
              <ThemedText type="subtitle">Thông tin phân tích</ThemedText>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>CV sử dụng:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile?.primaryResume ? profile.primaryResume.fileName : 'Chưa thiết lập CV chính'}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Mục tiêu:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile?.activeCareerGoal ? `${profile.activeCareerGoal.targetRole} (${profile.activeCareerGoal.seniority})` : 'Không có mục tiêu active'}
                </ThemedText>
              </View>

              {!analysisId && (
                <TouchableOpacity 
                  style={[styles.primaryButton, analyzeMutation.isPending && styles.disabledButton]} 
                  onPress={handleStartAnalysis}
                  disabled={analyzeMutation.isPending || !profile?.primaryResume}
                >
                  {analyzeMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>Bắt đầu phân tích</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Analysis Progress / Result */}
          {analysisId && analysisResult && (
            <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
              <ThemedText type="subtitle">Kết quả phân tích</ThemedText>
              <ThemedText style={styles.statusText}>Trạng thái: {analysisResult.status.toUpperCase()}</ThemedText>
              
              {(analysisResult.status === 'pending' || analysisResult.status === 'processing') && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3525CD" style={{ marginBottom: 12 }} />
                  <ThemedText>AI đang phân tích CV của bạn. Quá trình này có thể mất tới 30 giây...</ThemedText>
                </View>
              )}

              {analysisResult.status === 'completed' && analysisResult.result && (
                <View style={styles.resultContainer}>
                  <ThemedText style={{ color: 'green', fontWeight: 'bold', marginBottom: 8 }}>
                    Phân tích hoàn tất!
                  </ThemedText>
                  <ThemedText>{JSON.stringify(analysisResult.result, null, 2)}</ThemedText>
                </View>
              )}

              {analysisResult.status === 'failed' && (
                <ThemedText style={{ color: 'red' }}>Phân tích thất bại. Vui lòng thử lại sau.</ThemedText>
              )}
            </View>
          )}
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
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  backButton: { marginRight: Spacing.four },
  title: { fontSize: 20 },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  infoValue: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#3525CD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statusText: {
    fontWeight: '600',
    marginTop: Spacing.two,
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  resultContainer: {
    marginTop: Spacing.four,
    backgroundColor: 'rgba(150,150,150,0.1)',
    padding: Spacing.three,
    borderRadius: 8,
  }
});
