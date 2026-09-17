import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import { CareerProfileResponse } from '@/api/types';

interface Props {
  mode: 'standard' | 'job_targeted';
  setMode: (mode: 'standard' | 'job_targeted') => void;
  profile: CareerProfileResponse | undefined;
  jdTitle: string;
  setJdTitle: (text: string) => void;
  jdContent: string;
  setJdContent: (text: string) => void;
  analysisId: string | null;
  handleStartAnalysis: () => void;
  analyzeMutation: any;
  colors: any;
}

export const CVAnalysisConfigCard = memo(({ 
  mode, setMode, profile, jdTitle, setJdTitle, 
  jdContent, setJdContent, analysisId, 
  handleStartAnalysis, analyzeMutation, colors 
}: Props) => {
  return (
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
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.three,
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
  primaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    ...Shadows.sm,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
