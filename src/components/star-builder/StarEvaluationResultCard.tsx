import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { normalizeStarEvaluation } from './StarBuilderUtils';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/star-builder.styles';
import { AIGeneratedLabel } from '@/components/moderation/AIGeneratedLabel';

const StarEvaluationDetailsContent = React.memo(({
  evaluation,
  colors,
}: {
  evaluation: any;
  colors: any;
}) => {
  const normEval = useMemo(() => normalizeStarEvaluation(evaluation), [evaluation]);

  if (!normEval) return null;

  const components = [normEval.situation, normEval.task, normEval.action, normEval.result];
  const colorMap = {
    S: { tagBg: '#e0f2fe', tagText: '#0369a1' },
    T: { tagBg: '#fef3c7', tagText: '#b45309' },
    A: { tagBg: '#fce7f3', tagText: '#be185d' },
    R: { tagBg: '#dcfce7', tagText: '#15803d' },
  };

  return (
    <View style={{ gap: Spacing.three }}>
      {/* Overall Score Banner (if available) */}
      {normEval.overallScore !== null && (
        <View style={[styles.evalScoreHero, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
          <View style={[styles.scoreGauge, { backgroundColor: '#059669' }]}>
            <ThemedText style={styles.scoreGaugeText}>{normEval.overallScore}</ThemedText>
            <ThemedText style={styles.scoreGaugeLabel}>/100</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
              <ThemedText style={[styles.evalScoreTitle, { color: '#065f46' }]}>Đánh Giá Cấu Trúc STAR</ThemedText>
              <AIGeneratedLabel />
            </View>
            <ThemedText style={[styles.evalScoreFeedback, { color: '#047857', marginTop: 4 }]}>
              {normEval.applicable
                ? 'AI đã phân tích đầy đủ các thành phần bối cảnh, mục tiêu, hành động và kết quả trong câu trả lời.'
                : 'Câu trả lời chưa đầy đủ thành phần STAR tiêu chuẩn.'}
            </ThemedText>
          </View>
        </View>
      )}

      {/* 4 STAR Component Cards */}
      {components.map((comp) => {
        const theme = colorMap[comp.key];
        return (
          <View
            key={comp.key}
            style={[
              styles.starBox,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.starBadgeTag, { backgroundColor: theme.tagBg }]}>
                  <ThemedText style={[styles.starBadgeTagText, { color: theme.tagText }]}>{comp.key}</ThemedText>
                </View>
                <ThemedText style={[styles.starLabel, { color: colors.text }]}>{comp.title}</ThemedText>
              </View>

              {comp.score !== null && comp.score !== undefined ? (
                <View style={[styles.scoreBadgePill, { backgroundColor: comp.score >= 80 ? '#dcfce7' : comp.score >= 60 ? '#fef3c7' : '#fee2e2' }]}>
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: comp.score >= 80 ? '#15803d' : comp.score >= 60 ? '#b45309' : '#b91c1c' }}>
                    {comp.score}/100
                  </ThemedText>
                </View>
              ) : comp.detected === false ? (
                <View style={[styles.scoreBadgePill, { backgroundColor: '#fee2e2' }]}>
                  <ThemedText style={{ fontSize: 11, fontWeight: '700', color: '#b91c1c' }}>Chưa phát hiện</ThemedText>
                </View>
              ) : null}
            </View>

            {/* Evidence blockquote if present */}
            {comp.evidence ? (
              <View style={[styles.evidenceBox, { backgroundColor: colors.card, borderLeftColor: theme.tagText }]}>
                <ThemedText style={[styles.evidenceText, { color: colors.text }]}>
                  &ldquo;{comp.evidence}&rdquo;
                </ThemedText>
              </View>
            ) : null}

            <ThemedText style={[styles.starText, { color: colors.text }]}>{comp.content}</ThemedText>
          </View>
        );
      })}

      {/* Missing Elements */}
      {normEval.missingElements.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1 }]}>
          <Ionicons name="warning" size={18} color="#b45309" />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={[styles.warningHeader, { color: '#b45309' }]}>⚠️ Yếu tố STAR còn thiếu:</ThemedText>
            {normEval.missingElements.map((m: string, idx: number) => (
              <ThemedText key={`m-${idx}`} style={[styles.bulletText, { color: '#78350f' }]}>• {m}</ThemedText>
            ))}
          </View>
        </View>
      )}

      {/* Strengths */}
      {normEval.strengths.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1 }]}>
          <Ionicons name="checkmark-circle" size={18} color="#047857" />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={[styles.warningHeader, { color: '#047857' }]}>👍 Điểm mạnh ghi nhận:</ThemedText>
            {normEval.strengths.map((s: string, idx: number) => (
              <ThemedText key={`s-${idx}`} style={[styles.bulletText, { color: '#065f46' }]}>• {s}</ThemedText>
            ))}
          </View>
        </View>
      )}

      {/* Coaching Tips */}
      {normEval.coachingTips.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1 }]}>
          <Ionicons name="bulb" size={18} color="#1d4ed8" />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={[styles.warningHeader, { color: '#1d4ed8' }]}>💡 Lời khuyên cải thiện chuyên gia:</ThemedText>
            {normEval.coachingTips.map((t: string, idx: number) => (
              <ThemedText key={`t-${idx}`} style={[styles.bulletText, { color: '#1e40af' }]}>• {t}</ThemedText>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

export const StarEvaluationResultCard = React.memo(({
  activeAttempt,
  evaluation,
  colors,
}: {
  activeAttempt: any;
  evaluation: any;
  colors: any;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.cardHeaderRow}>
      <Ionicons name="analytics" size={22} color={colors.warning} />
      <ThemedText type="subtitle" style={styles.cardTitle}>Phân Tích Cấu Trúc STAR từ AI</ThemedText>
    </View>

    {(activeAttempt.status === 'queued' || activeAttempt.status === 'processing') && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: Spacing.two }} />
        <ThemedText style={{ textAlign: 'center', opacity: 0.8 }}>
          AI đang bóc tách các yếu tố S-T-A-R trong câu trả lời của bạn...
        </ThemedText>
      </View>
    )}

    {activeAttempt.status === 'completed' && (evaluation || (activeAttempt as any).Evaluation) && (
      <StarEvaluationDetailsContent evaluation={evaluation || (activeAttempt as any).Evaluation} colors={colors} />
    )}
  </View>
));
