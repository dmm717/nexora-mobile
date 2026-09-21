import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { interviewApi } from '@/api/interview.api';
import { profileApi } from '@/api/profile.api';
import { resumesApi } from '@/api/resumes.api';
import { jobDescriptionsApi } from '@/api/job-descriptions.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Kỹ Thuật (Technical)', icon: 'code-slash' },
  { id: 'behavioral', label: 'Hành Vi (Behavioral STAR)', icon: 'people' },
  { id: 'cv_targeted', label: 'Bám Sát CV (CV Targeted)', icon: 'document-text' },
  { id: 'jd_targeted', label: 'Bám Sát JD (JD Targeted)', icon: 'briefcase' },
  { id: 'scenario', label: 'Tình Huống (Scenario)', icon: 'construct' },
];

const DIFFICULTIES = [
  { id: 'junior', label: 'Junior' },
  { id: 'medium', label: 'Mid-Level' },
  { id: 'senior', label: 'Senior / Lead' },
];

export default function PreflightScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [role, setRole] = useState('');
  const [seniority, setSeniority] = useState('medium');
  const [interviewType, setInterviewType] = useState('technical');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
  });

  const { data: jobDescriptions } = useQuery({
    queryKey: ['job-descriptions'],
    queryFn: jobDescriptionsApi.list,
  });

  // Auto-fill from active goal & primary resume
  React.useEffect(() => {
    if (profile) {
      if (profile.activeCareerGoal) {
        setRole(profile.activeCareerGoal.targetRole);
        setSeniority(profile.activeCareerGoal.seniority.toLowerCase());
      }
      if (profile.primaryResume?.id) {
        setSelectedResumeId(profile.primaryResume.id);
      }
    }
  }, [profile]);

  const startMutation = useMutation({
    mutationFn: async () => {
      const activeGoalId = profile?.activeCareerGoal?.id;
      const res = await interviewApi.start({
        role: role.trim() || undefined,
        seniority: seniority || undefined,
        interviewType: interviewType,
        difficulty: seniority,
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJdId,
        careerGoalId: activeGoalId,
      });
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interview-history'] });
      queryClient.invalidateQueries({ queryKey: ['progress-dashboard'] });
      router.replace(`/(app)/interview/${data.id}` as any);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể khởi tạo phiên phỏng vấn. Vui lòng thử lại.');
      console.error(err);
    },
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Thiết Thiết Phiên Phỏng Vấn</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isProfileLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : (
            <>
              {/* Target Role & Seniority */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
                  <ThemedText type="subtitle" style={styles.cardTitle}>Vị Trí & Cấp Bậc Phỏng Vấn</ThemedText>
                </View>

                <ThemedText style={styles.inputLabel}>Vị trí mong muốn (Target Role):</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }]}
                  placeholder="Ví dụ: Backend Developer, React Native Engineer"
                  placeholderTextColor={colors.textMuted}
                  value={role}
                  onChangeText={setRole}
                />

                <ThemedText style={styles.inputLabel}>Cấp bậc mong muốn (Seniority):</ThemedText>
                <View style={styles.chipGroup}>
                  {DIFFICULTIES.map((diff) => (
                    <TouchableOpacity
                      key={diff.id}
                      style={[
                        styles.chip,
                        seniority === diff.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSeniority(diff.id)}
                    >
                      <ThemedText style={[styles.chipText, seniority === diff.id && { color: '#fff' }]}>
                        {diff.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Interview Type Picker */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="layers-outline" size={22} color={colors.secondary} />
                  <ThemedText type="subtitle" style={styles.cardTitle}>Loại Hình Phỏng Vấn</ThemedText>
                </View>

                <View style={styles.typeGrid}>
                  {INTERVIEW_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeCard,
                        { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                        interviewType === type.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                      ]}
                      onPress={() => setInterviewType(type.id)}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={interviewType === type.id ? colors.primary : colors.textSecondary}
                      />
                      <ThemedText
                        style={[
                          styles.typeCardText,
                          interviewType === type.id && { color: colors.primary, fontWeight: '700' }
                        ]}
                      >
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Resume Context Selection */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="document-text-outline" size={22} color={colors.accent} />
                  <ThemedText type="subtitle" style={styles.cardTitle}>Hồ Sơ CV Sử Dụng</ThemedText>
                </View>

                {resumes && resumes.length > 0 ? (
                  <View style={{ gap: Spacing.two }}>
                    {resumes.map((cv) => (
                      <TouchableOpacity
                        key={cv.id}
                        style={[
                          styles.selectionRow,
                          { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                          selectedResumeId === cv.id && { borderColor: colors.accent, backgroundColor: colors.accentLight }
                        ]}
                        onPress={() => setSelectedResumeId(cv.id)}
                      >
                        <Ionicons
                          name={selectedResumeId === cv.id ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={selectedResumeId === cv.id ? colors.accent : colors.textMuted}
                        />
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.selectionTitle}>{cv.fileName}</ThemedText>
                          <ThemedText style={styles.selectionSub}>Trạng thái: {cv.status}</ThemedText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <ThemedText style={styles.emptyText}>Chưa có CV nào. Bạn vẫn có thể tiếp tục phỏng vấn theo mục tiêu chung.</ThemedText>
                )}
              </View>

              {/* Job Description Selection */}
              {jobDescriptions && jobDescriptions.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="briefcase-outline" size={22} color={colors.warning} />
                    <ThemedText type="subtitle" style={styles.cardTitle}>Gắn Mô Tả Công Việc (JD)</ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two }}>
                    <TouchableOpacity
                      style={[
                        styles.selectionRow,
                        { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                        selectedJdId === null && { borderColor: colors.warning, backgroundColor: colors.warningLight }
                      ]}
                      onPress={() => setSelectedJdId(null)}
                    >
                      <Ionicons
                        name={selectedJdId === null ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={selectedJdId === null ? colors.warning : colors.textMuted}
                      />
                      <ThemedText style={styles.selectionTitle}>Không sử dụng JD cụ thể</ThemedText>
                    </TouchableOpacity>

                    {jobDescriptions.map((jd) => (
                      <TouchableOpacity
                        key={jd.id}
                        style={[
                          styles.selectionRow,
                          { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                          selectedJdId === jd.id && { borderColor: colors.warning, backgroundColor: colors.warningLight }
                        ]}
                        onPress={() => setSelectedJdId(jd.id)}
                      >
                        <Ionicons
                          name={selectedJdId === jd.id ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={selectedJdId === jd.id ? colors.warning : colors.textMuted}
                        />
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.selectionTitle}>{jd.title}</ThemedText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Start Action */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  startMutation.isPending && styles.disabledButton
                ]}
                onPress={() => startMutation.mutate()}
                disabled={startMutation.isPending}
              >
                {startMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="play-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <ThemedText style={styles.primaryButtonText}>Bắt Đầu Phỏng Vấn Ngay</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </>
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
  chipGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeGrid: {
    gap: Spacing.two,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  typeCardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionSub: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.6,
  },
  primaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    ...Shadows.md,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
