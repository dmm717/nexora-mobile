import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import { ResumeAnalysisView } from '@/api/types';

interface Props {
  analysisId: string | null;
  analysisResult: ResumeAnalysisView | undefined;
  setAnalysisId: (id: string | null) => void;
  mode: 'standard' | 'job_targeted';
  colors: any;
}

export const CVAnalysisResultView = memo(({ analysisId, analysisResult, setAnalysisId, mode, colors }: Props) => {
  if (!analysisId || !analysisResult) return null;

  return (
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
            onPress={() => setAnalysisId(null)}
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  }
});
