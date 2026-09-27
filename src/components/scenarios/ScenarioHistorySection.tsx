import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/scenarios-detail.styles';
import { Spacing } from '@/constants/theme';
import { ScenarioAttemptHistoryItemResponse } from '@/api/types/scenario.types';

interface ScenarioHistorySectionProps {
  history: any;
  activeAttemptId?: string;
  onSelectAttempt: (attemptId: string) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  colors: any;
}

export const ScenarioHistorySection = React.memo(({
  history,
  activeAttemptId,
  onSelectAttempt,
  expandedId,
  setExpandedId,
  colors,
}: ScenarioHistorySectionProps) => {
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeaderRow}>
        <Ionicons name="time" size={20} color={colors.primary} />
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Lịch Sử Thử Sức ({history.attempts.length} lần)
        </ThemedText>
      </View>

      <View style={styles.historyStatsRow}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Gần nhất</ThemedText>
          <ThemedText style={[styles.statValue, { color: colors.primary }]}>
            {history.latestScore !== null && history.latestScore !== undefined ? `${history.latestScore}/100` : '—'}
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Kỷ lục</ThemedText>
          <ThemedText style={[styles.statValue, { color: colors.accent }]}>
            {history.bestScore !== null && history.bestScore !== undefined ? `${history.bestScore}/100` : '—'}
          </ThemedText>
        </View>
      </View>

      <View style={{ marginTop: Spacing.two }}>
        {history.attempts.map((item: ScenarioAttemptHistoryItemResponse) => {
          const isSelected = activeAttemptId === item.id;
          const isExpanded = expandedId === item.id;

          const itemOverallScore = item.overallScore ?? (item as any).OverallScore ?? null;
          const itemScoreDelta = item.scoreDelta ?? (item as any).ScoreDelta ?? null;

          const deltaText =
            itemScoreDelta !== null && itemScoreDelta !== undefined
              ? itemScoreDelta > 0
                ? `+${itemScoreDelta}`
                : `${itemScoreDelta}`
              : 'Khởi điểm';

          return (
            <View
              key={item.id}
              style={[
                styles.historyItemRow,
                isSelected && styles.historyItemRowSelected,
              ]}
            >
              <View style={styles.historyItemHeader}>
                <ThemedText style={styles.historyNum}>#{item.attemptNumber}</ThemedText>
                <ThemedText style={styles.historyDate}>{formatDate(item.createdAt)}</ThemedText>
              </View>

              <View style={styles.historyActionsRow}>
                <ThemedText style={[styles.historyScoreText, { color: colors.text }]}>
                  {itemOverallScore !== null && itemOverallScore !== undefined ? `${itemOverallScore}/100` : '--'}
                </ThemedText>

                <View
                  style={[
                    styles.historyDeltaBadge,
                    {
                      backgroundColor:
                        itemScoreDelta && itemScoreDelta > 0 ? '#dcfce7' : '#f1f5f9',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.historyDeltaText,
                      { color: itemScoreDelta && itemScoreDelta > 0 ? '#15803d' : '#64748b' },
                    ]}
                  >
                    {deltaText}
                  </ThemedText>
                </View>

                {item.answer ? (
                  <TouchableOpacity
                    style={styles.historyButtonSmall}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <ThemedText style={styles.historyButtonTextSmall}>
                      {isExpanded ? 'Thu gọn' : 'Xem bài làm'}
                    </ThemedText>
                  </TouchableOpacity>
                ) : null}

                {item.status === 'completed' && !isSelected && (
                  <TouchableOpacity
                    style={[styles.historyButtonSmall, { backgroundColor: colors.primaryLight }]}
                    onPress={() => onSelectAttempt(item.id)}
                  >
                    <ThemedText style={[styles.historyButtonTextSmall, { color: colors.primary }]}>
                      Xem báo cáo
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {isExpanded && item.answer && (
                <View style={styles.quoteBox}>
                  <ThemedText style={styles.quoteLabel}>CÂU TRẢ LỜI ĐÃ NỘP:</ThemedText>
                  <ThemedText style={styles.quoteText}>{item.answer}</ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
});
