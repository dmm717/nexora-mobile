import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/interview-report.styles';

export const ScoreBadgeCard = React.memo(({
  report,
  colors,
}: {
  report: any;
  colors: any;
}) => {
  const overallScore = report.overallScore ?? 0;
  const scoreColor = overallScore >= 80 ? colors.accent : overallScore >= 60 ? colors.warning : colors.danger;
  const isPartial = report.sample?.isPartial ?? false;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
      {isPartial && (
        <View style={{ backgroundColor: colors.warningLight || '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: Spacing.two }}>
          <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.warning }}>
            ⚡ Báo Cáo Thu Gọn (Nộp bài sớm)
          </ThemedText>
        </View>
      )}

      <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}15` }]}>
        <ThemedText style={[styles.scoreNumber, { color: scoreColor }]}>
          {overallScore}
        </ThemedText>
        <ThemedText style={styles.scoreMax}>/ 100</ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.scoreTitle}>
        {overallScore >= 80 ? '🌟 Đạt Chuẩn Xuất Sắc' : overallScore >= 60 ? '👍 Khá Tốt - Cần Tối Ưu' : '💡 Cần Cải Thiện Thêm'}
      </ThemedText>
      <ThemedText style={styles.disclaimerText}>{report.disclaimer}</ThemedText>
    </View>
  );
});
