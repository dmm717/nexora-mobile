import React, { useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/scenarios-detail.styles';
import { Spacing } from '@/constants/theme';
import { ScenarioEvaluation } from '@/api/types/scenario.types';

interface NormalizedDimension {
  criterion: string;
  score: number;
  evidence: string;
  feedback: string;
}

interface NormalizedEvaluation {
  overallScore: number | null;
  feedback: string;
  dimensions: NormalizedDimension[];
  strengths: string[];
  gaps: string[];
  recommendedApproach: string[];
}

function normalizeEvaluation(raw: any): NormalizedEvaluation | null {
  if (!raw) return null;

  const rawDimensions = raw.dimensions || raw.Dimensions || raw.dimensionEvaluations || [];
  const dimensions: NormalizedDimension[] = Array.isArray(rawDimensions)
    ? rawDimensions.map((dim: any) => ({
        criterion:
          dim.criterion ||
          dim.Criterion ||
          dim.name ||
          dim.Name ||
          dim.criterionName ||
          dim.title ||
          'Tiêu chí',
        score: typeof dim.score === 'number' ? dim.score : typeof dim.Score === 'number' ? dim.Score : 0,
        evidence: dim.evidence || dim.Evidence || '',
        feedback: dim.feedback || dim.Feedback || '',
      }))
    : [];

  const rawStrengths = raw.strengths || raw.Strengths || [];
  const strengths: string[] = Array.isArray(rawStrengths)
    ? rawStrengths.filter((s: any) => typeof s === 'string' && s.trim())
    : [];

  const rawGaps = raw.gaps || raw.Gaps || [];
  const gaps: string[] = Array.isArray(rawGaps)
    ? rawGaps.filter((g: any) => typeof g === 'string' && g.trim())
    : [];

  const rawApproach = raw.recommendedApproach || raw.RecommendedApproach || raw.recommendations || [];
  const recommendedApproach: string[] = Array.isArray(rawApproach)
    ? rawApproach.filter((a: any) => typeof a === 'string' && a.trim())
    : [];

  const rawOverallScore = raw.overallScore ?? raw.OverallScore ?? raw.score ?? null;

  return {
    overallScore: typeof rawOverallScore === 'number' ? rawOverallScore : null,
    feedback: raw.feedback || raw.Feedback || '',
    dimensions,
    strengths,
    gaps,
    recommendedApproach,
  };
}

interface ScenarioEvaluationCardProps {
  evaluation: ScenarioEvaluation;
  onRetry: () => void;
  isRetrying: boolean;
  colors: any;
}

export const ScenarioEvaluationCard = React.memo(({
  evaluation,
  onRetry,
  isRetrying,
  colors,
}: ScenarioEvaluationCardProps) => {
  const normEval = useMemo(() => normalizeEvaluation(evaluation), [evaluation]);

  if (!normEval) return null;

  const score = normEval.overallScore;

  return (
    <View style={{ gap: Spacing.three }}>
      {/* Score Hero */}
      <View style={styles.evalScoreHero}>
        <View style={styles.scoreGauge}>
          <ThemedText style={styles.scoreGaugeText}>
            {score !== null && score !== undefined ? score : '--'}
          </ThemedText>
          <ThemedText style={styles.scoreGaugeLabel}>/100</ThemedText>
        </View>

        <View style={styles.evalScoreContent}>
          <ThemedText style={styles.evalScoreTitle}>Đánh giá tổng quan</ThemedText>
          <ThemedText style={styles.evalScoreFeedback}>
            {normEval.feedback || 'Chưa có nhận xét tổng quan cho lượt luyện tập này.'}
          </ThemedText>
        </View>
      </View>

      {/* Dimensions Breakdown */}
      {normEval.dimensions && normEval.dimensions.length > 0 && (
        <View>
          <ThemedText style={[styles.sectionHeading, { color: colors.text }]}>Phân tích theo tiêu chí</ThemedText>
          {normEval.dimensions.map((dim, idx) => (
            <View key={`dim-${idx}`} style={styles.dimensionCard}>
              <View style={styles.dimensionHeader}>
                <ThemedText style={[styles.dimensionName, { color: colors.text }]}>{dim.criterion}</ThemedText>
                <View
                  style={[
                    styles.dimensionBadge,
                    {
                      backgroundColor:
                        dim.score >= 80 ? '#dcfce7' : dim.score >= 60 ? '#fef3c7' : '#fee2e2',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.dimensionBadgeText,
                      {
                        color:
                          dim.score >= 80 ? '#15803d' : dim.score >= 60 ? '#b45309' : '#b91c1c',
                      },
                    ]}
                  >
                    {dim.score}/100
                  </ThemedText>
                </View>
              </View>

              {dim.evidence ? (
                <View style={[styles.dimensionEvidenceBox, { backgroundColor: colors.backgroundElement, borderLeftColor: colors.primary }]}>
                  <ThemedText style={[styles.dimensionEvidenceText, { color: colors.text }]}>
                    &ldquo;{dim.evidence}&rdquo;
                  </ThemedText>
                </View>
              ) : null}

              {dim.feedback ? (
                <ThemedText style={styles.dimensionFeedbackText}>{dim.feedback}</ThemedText>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* Strengths */}
      {normEval.strengths && normEval.strengths.length > 0 && (
        <View style={styles.strengthsCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="checkmark-circle" size={18} color="#047857" />
            <ThemedText style={styles.strengthsTitle}>Điểm mạnh ghi nhận</ThemedText>
          </View>
          {normEval.strengths.map((str, idx) => (
            <View key={`str-${idx}`} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#059669" style={{ marginTop: 6 }} />
              <ThemedText style={[styles.bulletText, { color: '#065f46' }]}>{str}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Gaps */}
      {normEval.gaps && normEval.gaps.length > 0 && (
        <View style={styles.gapsCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="warning" size={18} color="#b45309" />
            <ThemedText style={styles.gapsTitle}>Điểm cần hoàn thiện</ThemedText>
          </View>
          {normEval.gaps.map((gap, idx) => (
            <View key={`gap-${idx}`} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color="#d97706" style={{ marginTop: 6 }} />
              <ThemedText style={[styles.bulletText, { color: '#78350f' }]}>{gap}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Recommended Approach */}
      {normEval.recommendedApproach && normEval.recommendedApproach.length > 0 && (
        <View style={styles.approachCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="bulb" size={18} color="#1d4ed8" />
            <ThemedText style={styles.approachTitle}>Hướng tiếp cận chuyên gia khuyến nghị</ThemedText>
          </View>
          {normEval.recommendedApproach.map((step, idx) => (
            <View key={`step-${idx}`} style={styles.stepRow}>
              <ThemedText style={styles.stepNum}>{idx + 1}.</ThemedText>
              <ThemedText style={styles.stepText}>{step}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Retry Action */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
            <ThemedText style={styles.submitButtonText}>Thử Lại Tình Huống Này</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
});
