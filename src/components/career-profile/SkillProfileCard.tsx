import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { styles } from '@/styles/career-profile.styles';
import { Spacing } from '@/constants/theme';

interface SkillProfileCardProps {
  topCompetencies: any[];
  topWeaknessSignals: any[];
  colors: any;
}

export const SkillProfileCard = ({ topCompetencies, topWeaknessSignals, colors }: SkillProfileCardProps) => {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.cardTitle}>Hồ sơ năng lực thực chứng (Skill Profile)</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Tổng hợp 100% từ dữ kiện đánh giá qua phỏng vấn và CV. (Chỉ đọc, không chỉnh sửa thủ công)
            </ThemedText>
          </View>
        </View>

        <View style={[styles.autoBadge, { borderColor: colors.cardBorder }]}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} />
          <ThemedText style={[styles.autoBadgeText, { color: colors.text }]}>
            Bằng chứng tự động
          </ThemedText>
        </View>
      </View>

      {topCompetencies.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement }]}>
          <ThemedText style={styles.emptyTitle}>Chưa có đủ bằng chứng năng lực</ThemedText>
          <ThemedText style={styles.emptySub}>
            Hồ sơ năng lực sẽ tự động hình thành sau khi bạn thực hiện các bài phỏng vấn thử hoặc quét phân tích CV.
          </ThemedText>
        </View>
      ) : (
        <View style={{ gap: Spacing.two }}>
          {topCompetencies.map((comp) => {
            const score = comp.score != null ? Math.round(comp.score) : null;
            return (
              <View key={comp.code} style={[styles.compCard, { backgroundColor: colors.backgroundElement }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.compCategoryText}>{comp.category}</ThemedText>
                    <ThemedText style={styles.compNameText}>{comp.name || comp.code}</ThemedText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <ThemedText style={[styles.compScoreText, { color: colors.primary }]}>
                      {score !== null ? `${score}/100` : '--/100'}
                    </ThemedText>
                    <ThemedText style={styles.compEvidenceText}>{comp.evidenceCount} bằng chứng</ThemedText>
                  </View>
                </View>

                {score !== null && (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, Math.max(5, score))}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                )}

                <View style={[styles.compFooter, { borderTopColor: colors.cardBorder }]}>
                  <ThemedText style={styles.compFooterText}>
                    Nguồn: Phỏng vấn giả lập & CV Analysis
                  </ThemedText>
                  <ThemedText style={styles.compFooterText}>
                    Chưa có mốc cập nhật
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {topWeaknessSignals.length > 0 && (
        <View
          style={[
            styles.weaknessBox,
            {
              backgroundColor: '#fffbe8',
              borderColor: '#fcd34d',
            },
          ]}
        >
          <View style={styles.weaknessHeader}>
            <Ionicons name="warning-outline" size={16} color="#d97706" />
            <ThemedText style={[styles.weaknessTitle, { color: '#92400e' }]}>
              Tín hiệu khuyết thiếu năng lực đã được ghi nhận:
            </ThemedText>
          </View>
          {topWeaknessSignals.map((w, idx) => (
            <View key={idx} style={styles.weaknessItem}>
              <ThemedText style={[styles.weaknessBullet, { color: '#92400e' }]}>•</ThemedText>
              <ThemedText style={[styles.weaknessText, { color: '#78350f' }]}>
                {w.label} <ThemedText style={{ opacity: 0.7 }}>({w.sourceType})</ThemedText>
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
};
