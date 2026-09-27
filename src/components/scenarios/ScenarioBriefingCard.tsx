import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/scenarios-detail.styles';
import { FormattedScenarioContent } from './FormattedScenarioContent';

interface ScenarioBriefingCardProps {
  scenario: any;
  colors: any;
}

export const ScenarioBriefingCard = ({ scenario, colors }: ScenarioBriefingCardProps) => {
  const formatDifficultyLabel = (diff: string) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'DỄ';
    if (d === 'medium') return 'TRUNG BÌNH';
    if (d === 'hard') return 'KHÓ';
    return diff.toUpperCase();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
            {scenario.categoryName}
          </ThemedText>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                (scenario.difficulty || '').toLowerCase() === 'easy'
                  ? '#e0f2fe'
                  : (scenario.difficulty || '').toLowerCase() === 'medium'
                    ? '#fef3c7'
                    : '#fee2e2',
            },
          ]}
        >
          <ThemedText
            style={[
              styles.badgeText,
              {
                color:
                  (scenario.difficulty || '').toLowerCase() === 'easy'
                    ? '#0369a1'
                    : (scenario.difficulty || '').toLowerCase() === 'medium'
                      ? '#b45309'
                      : '#b91c1c',
              },
            ]}
          >
            {formatDifficultyLabel(scenario.difficulty)}
          </ThemedText>
        </View>

        {scenario.competency ? (
          <View style={[styles.badge, { backgroundColor: '#e0e7ff' }]}>
            <ThemedText style={[styles.badgeText, { color: '#3730a3' }]}>
              {scenario.competency}
            </ThemedText>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>
            {scenario.estimatedMinutes} phút
          </ThemedText>
        </View>
      </View>

      <ThemedText type="subtitle" style={styles.scenarioTitle}>
        {scenario.title}
      </ThemedText>

      <ThemedText style={styles.scenarioSummary}>{scenario.summary}</ThemedText>

      <View style={[styles.contentBox, { backgroundColor: colors.backgroundElement }]}>
        <ThemedText style={styles.contentHeader}>📌 Bối Cảnh & Đề Bài Tình Huống:</ThemedText>
        <FormattedScenarioContent text={scenario.content || scenario.summary} colors={colors} />
      </View>

      {/* Guidelines Box */}
      <View style={styles.guidelinesBox}>
        <ThemedText style={styles.guidelinesTitle}>💡 Gợi ý cấu trúc trả lời hiệu quả:</ThemedText>
        <ThemedText style={styles.guidelinesText}>
          1. <ThemedText style={{ fontWeight: '700' }}>Phân tích vấn đề:</ThemedText> Xác định rủi ro cốt lõi, người liên quan chính.
        </ThemedText>
        <ThemedText style={styles.guidelinesText}>
          2. <ThemedText style={{ fontWeight: '700' }}>Hành động cụ thể:</ThemedText> Các bước xử lý ngay lập tức và giải pháp dài hạn.
        </ThemedText>
        <ThemedText style={styles.guidelinesText}>
          3. <ThemedText style={{ fontWeight: '700' }}>Đo lường & Bài học:</ThemedText> Kết quả đạt được hoặc cơ chế phòng ngừa.
        </ThemedText>
      </View>
    </View>
  );
};
