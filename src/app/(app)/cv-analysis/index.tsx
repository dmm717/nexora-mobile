import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';
import { jobDescriptionsApi } from '@/api/job-descriptions.api';
import { profileApi } from '@/api/profile.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

  const handleStartAnalysis = () => {
    if (!profile?.primaryResume) {
      Alert.alert('Chưa có CV chính', 'Vui lòng tải lên và chọn một CV làm Primary CV trước khi bắt đầu phân tích.');
      return;
    }
    analyzeMutation.mutate();
  };

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
              {/* Mode Switcher */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Chọn Chế Độ Phân Tích</ThemedText>
                
                <View style={styles.modeRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      mode === 'standard' && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setMode('standard')}
                  >
                    <Ionicons 
                      name="compass-outline" 
                      size={18} 
                      color={mode === 'standard' ? '#fff' : colors.text} 
                    />
                    <ThemedText style={[styles.modeTabText, mode === 'standard' && { color: '#fff' }]}>
                      Mục Tiêu Sự Nghiệp
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      mode === 'job_targeted' && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setMode('job_targeted')}
                  >
                    <Ionicons 
                      name="briefcase-outline" 
                      size={18} 
                      color={mode === 'job_targeted' ? '#fff' : colors.text} 
                    />
                    <ThemedText style={[styles.modeTabText, mode === 'job_targeted' && { color: '#fff' }]}>
                      JD Công Việc Cụ Thể
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Selected CV Banner */}
                <View style={[styles.infoRow, { marginTop: Spacing.two }]}>
                  <ThemedText style={styles.infoLabel}>CV Sử Dụng:</ThemedText>
                  <ThemedText style={[styles.infoValue, { color: profile?.primaryResume ? colors.accent : colors.danger }]}>
                    {profile?.primaryResume ? profile.primaryResume.fileName : '⚠️ Chưa có CV chính'}
                  </ThemedText>
                </View>

                {mode === 'standard' ? (
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Mục Tiêu:</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {profile?.activeCareerGoal 
                        ? `${profile.activeCareerGoal.targetRole} (${profile.activeCareerGoal.seniority})` 
                        : 'Chưa chọn mục tiêu'}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
                    <ThemedText style={styles.inputLabel}>Tiêu đề Vị Trí (Job Title):</ThemedText>
                    <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }]}
                      placeholder="Ví dụ: Senior Backend Engineer"
                      placeholderTextColor={colors.textMuted}
                      value={jdTitle}
                      onChangeText={setJdTitle}
                    />

                    <ThemedText style={styles.inputLabel}>Nội dung Mô Tả Công Việc (JD):</ThemedText>
                    <TextInput
                      style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }]}
                      placeholder="Dán nội dung yêu cầu tuyển dụng (Job Description) vào đây..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={5}
                      value={jdContent}
                      onChangeText={setJdContent}
                    />
                  </View>
                )}

                {!analysisId && (
                  <TouchableOpacity 
                    style={[
                      styles.primaryButton, 
                      { backgroundColor: colors.primary },
                      (analyzeMutation.isPending || !profile?.primaryResume) && styles.disabledButton
                    ]} 
                    onPress={handleStartAnalysis}
                    disabled={analyzeMutation.isPending || !profile?.primaryResume}
                  >
                    {analyzeMutation.isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="sparkles-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <ThemedText style={styles.primaryButtonText}>
                          {mode === 'standard' ? 'Phân tích theo Mục Tiêu' : 'Phân tích theo JD này'}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Result / Processing State */}
          {analysisId && analysisResult && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="analytics" size={22} color={colors.warning} />
                <ThemedText type="subtitle" style={styles.cardTitle}>Kết Quả Phân Tích AI</ThemedText>
              </View>

              <View style={[styles.statusChip, { backgroundColor: colors.warningLight }]}>
                <ThemedText style={[styles.statusChipText, { color: colors.warning }]}>
                  Trạng thái: {analysisResult.status.toUpperCase()}
                </ThemedText>
              </View>
              
              {(analysisResult.status === 'pending' || analysisResult.status === 'processing' || analysisResult.status === 'queued') && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: Spacing.three }} />
                  <ThemedText style={styles.loadingText}>
                    AI đang đối chiếu CV của bạn với {mode === 'standard' ? 'mục tiêu sự nghiệp' : 'mô tả công việc'}. Quá trình này diễn ra trong 15-30 giây...
                  </ThemedText>
                </View>
              )}

              {analysisResult.status === 'completed' && (
                <View style={styles.resultContainer}>
                  <View style={styles.successRow}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                    <ThemedText style={[styles.successText, { color: colors.accent }]}>
                      Phân tích hoàn tất thành công!
                    </ThemedText>
                  </View>
                  
                  {analysisResult.result ? (
                    <View style={styles.analysisDetails}>
                      {analysisResult.result.score !== undefined && (
                        <View style={[styles.scoreBadge, { backgroundColor: colors.primaryLight }]}>
                          <ThemedText style={[styles.scoreNumber, { color: colors.primary }]}>
                            {analysisResult.result.score}/100
                          </ThemedText>
                          <ThemedText style={styles.scoreLabel}>Điểm tương thích CV</ThemedText>
                        </View>
                      )}

                      {analysisResult.result.summary && (
                        <View style={[styles.resultSection, { backgroundColor: colors.backgroundElement }]}>
                          <ThemedText style={styles.sectionHeader}>📋 Tổng quan đánh giá</ThemedText>
                          <ThemedText style={styles.sectionText}>{analysisResult.result.summary}</ThemedText>
                        </View>
                      )}

                      {analysisResult.result.strengths && Array.isArray(analysisResult.result.strengths) && (
                        <View style={[styles.resultSection, { backgroundColor: colors.backgroundElement }]}>
                          <ThemedText style={styles.sectionHeader}>💪 Điểm mạnh nổi bật</ThemedText>
                          {analysisResult.result.strengths.map((item: string, idx: number) => (
                            <ThemedText key={idx} style={styles.bulletText}>• {item}</ThemedText>
                          ))}
                        </View>
                      )}

                      {analysisResult.result.improvements && Array.isArray(analysisResult.result.improvements) && (
                        <View style={[styles.resultSection, { backgroundColor: colors.backgroundElement }]}>
                          <ThemedText style={styles.sectionHeader}>🚀 Điểm cần bổ sung & tối ưu</ThemedText>
                          {analysisResult.result.improvements.map((item: string, idx: number) => (
                            <ThemedText key={idx} style={styles.bulletText}>• {item}</ThemedText>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={[styles.resultBox, { backgroundColor: colors.backgroundElement }]}>
                      <ThemedText style={styles.resultJsonText}>
                        Đã ghi nhận dữ liệu phân tích.
                      </ThemedText>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.primary }]}
                    onPress={() => {
                      setAnalysisId(null);
                    }}
                  >
                    <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
                      Phân Tích Khác
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {analysisResult.status === 'failed' && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={24} color={colors.danger} />
                  <ThemedText style={{ color: colors.danger }}>Phân tích thất bại. Vui lòng thử lại sau.</ThemedText>
                </View>
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
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#ccc',
    gap: 6,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    width: 110,
    fontWeight: '700',
    opacity: 0.8,
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    ...Shadows.sm,
  },
  secondaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  secondaryButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  loadingText: {
    textAlign: 'center',
    opacity: 0.8,
    fontSize: 13,
  },
  resultContainer: {
    gap: Spacing.two,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  successText: {
    fontWeight: '700',
    fontSize: 16,
  },
  analysisDetails: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  scoreBadge: {
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
  },
  resultSection: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.one,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 18,
  },
  resultBox: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginTop: Spacing.one,
  },
  resultJsonText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  }
});

