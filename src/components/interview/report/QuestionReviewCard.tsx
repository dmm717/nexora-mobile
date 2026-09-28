import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Radius } from '@/constants/theme';
import { styles } from '@/styles/interview-report.styles';
import { AIGeneratedLabel } from '@/components/moderation/AIGeneratedLabel';
import { ReportContentButton } from '@/components/moderation/ReportContentButton';

export const QuestionReviewCard = React.memo(({
  review,
  colors,
  onPracticeAgain,
}: {
  review: any;
  colors: any;
  onPracticeAgain: (questionId: string) => void;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={[styles.questionReviewHeader, { justifyContent: 'space-between' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, flex: 1 }}>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.badgeText}>Câu #{review.sequence}</ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.backgroundElement }]}>
          <ThemedText style={[styles.badgeText, { color: colors.text }]}>{review.topic}</ThemedText>
        </View>
        <AIGeneratedLabel />
      </View>
      <ReportContentButton 
        contentType="interview_report" 
        contentId={review.questionId || `review-${review.sequence}`}
        contentSnapshot={JSON.stringify(review)}
      />
    </View>

    <ThemedText style={styles.questionTitle}>Q: {review.question}</ThemedText>
    <View style={[styles.answerBox, { backgroundColor: colors.backgroundElement }]}>
      <ThemedText style={styles.answerText}>A: {review.answer}</ThemedText>
    </View>

    {/* Rubric Scores */}
    {review.rubric && review.rubric.length > 0 && (
      <View style={{ gap: 4, marginTop: Spacing.one }}>
        <ThemedText style={styles.subTitle}>📊 Điểm Tiêu Chí Rubric:</ThemedText>
        {review.rubric.map((r: any, rIdx: number) => (
          <View key={r.criterion || `r-${r.score}-${rIdx}`} style={styles.rubricRow}>
            <ThemedText style={styles.rubricLabel}>{r.criterion}:</ThemedText>
            <ThemedText style={[styles.rubricScore, { color: colors.primary }]}>{r.score}/100</ThemedText>
          </View>
        ))}
      </View>
    )}

    {/* STAR Evaluation */}
    {review.star && review.star.applicable && (
      <View style={{ marginTop: Spacing.three, backgroundColor: colors.backgroundElement, borderRadius: 12, padding: Spacing.three, borderWidth: 1, borderColor: colors.cardBorder }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
            <Ionicons name="star" size={16} color={colors.primary} />
            <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Mô hình phản xạ STAR</ThemedText>
          </View>
          <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
            Điểm: {review.star.overallScore != null ? `${review.star.overallScore}/100` : 'Chưa có'}
          </ThemedText>
        </View>
        
        <View style={{ gap: Spacing.two }}>
          {[
            { key: 'situation', name: 'S — Situation (Bối cảnh)', comp: review.star.situation, weight: '20%' },
            { key: 'task', name: 'T — Task (Mục tiêu)', comp: review.star.task, weight: '20%' },
            { key: 'action', name: 'A — Action (Hành động)', comp: review.star.action, weight: '35%' },
            { key: 'result', name: 'R — Result (Kết quả)', comp: review.star.result, weight: '25%' },
          ].map((item) => {
            const isDetected = item.comp?.detected ?? false;
            const score = item.comp?.score ?? 0;
            return (
              <View key={item.key} style={{ backgroundColor: isDetected ? colors.card : colors.warningLight, padding: Spacing.two, borderRadius: 8, borderWidth: 1, borderColor: isDetected ? colors.cardBorder : colors.warning }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{item.name}</ThemedText>
                  <View style={{ backgroundColor: isDetected ? '#d1fae5' : '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <ThemedText style={{ fontSize: 10, fontWeight: '700', color: isDetected ? '#065f46' : '#92400e' }}>
                      {isDetected ? `${score}đ (${item.weight})` : 'Chưa rõ'}
                    </ThemedText>
                  </View>
                </View>
                {isDetected && item.comp?.evidence ? (
                  <View style={{ backgroundColor: colors.background, padding: 6, borderRadius: 4, marginTop: 4 }}>
                    <ThemedText style={{ fontSize: 11, fontStyle: 'italic', color: colors.textSecondary }}>"{item.comp.evidence}"</ThemedText>
                  </View>
                ) : (
                  <ThemedText style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>
                    {item.comp?.feedback || 'Không phát hiện thành phần này.'}
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>

        {review.star.missingElements && review.star.missingElements.length > 0 && (
          <View style={{ marginTop: Spacing.two, backgroundColor: '#fef3c7', padding: Spacing.two, borderRadius: 8, flexDirection: 'row', gap: 6 }}>
            <Ionicons name="warning" size={16} color="#d97706" />
            <ThemedText style={{ fontSize: 11, color: '#92400e', flex: 1 }}>
              <ThemedText style={{ fontWeight: '700' }}>Điểm khuyết thiếu: </ThemedText>
              Câu trả lời chưa thể hiện rõ ràng phần {review.star.missingElements.map((m: string) => m.toUpperCase()).join(', ')}. Bổ sung thêm bối cảnh và kết quả cụ thể để nâng cao điểm số.
            </ThemedText>
          </View>
        )}
      </View>
    )}

    {/* Feedback & STAR */}
    {review.feedback && (
      <View style={{ marginTop: Spacing.one }}>
        <ThemedText style={styles.subTitle}>💡 Nhận Xét Chuyên Sâu:</ThemedText>
        <ThemedText style={styles.bodyText}>{review.feedback}</ThemedText>
      </View>
    )}

    {/* Strengths & Improvements */}
    {review.strengths && review.strengths.length > 0 && (
      <View style={{ marginTop: Spacing.one }}>
        <ThemedText style={[styles.subTitle, { color: colors.accent }]}>💪 Điểm mạnh:</ThemedText>
        {review.strengths.map((s: string, sIdx: number) => (
          <ThemedText key={sIdx} style={styles.bulletText}>• {s}</ThemedText>
        ))}
      </View>
    )}

    {review.improvements && review.improvements.length > 0 && (
      <View style={{ marginTop: Spacing.one }}>
        <ThemedText style={[styles.subTitle, { color: colors.warning }]}>🚀 Cần cải thiện:</ThemedText>
        {review.improvements.map((imp: string, impIdx: number) => (
          <ThemedText key={impIdx} style={styles.bulletText}>• {imp}</ThemedText>
        ))}
      </View>
    )}

    {/* Suggested Answer */}
    {review.suggestedImprovedAnswer && (
      <View style={[styles.suggestedBox, { backgroundColor: colors.accentLight }]}>
        <ThemedText style={[styles.subTitle, { color: colors.accent }]}>✨ Câu trả lời mẫu gợi ý:</ThemedText>
        <ThemedText style={styles.bodyText}>{review.suggestedImprovedAnswer}</ThemedText>
      </View>
    )}

    {/* Sample Answer with Framework */}
    {review.sampleAnswer && (
      <View style={[styles.suggestedBox, { backgroundColor: colors.primaryLight, marginTop: Spacing.one }]}>
        <ThemedText style={[styles.subTitle, { color: colors.primary }]}>
          🎓 Câu Trả Lời Mẫu ({review.sampleAnswer.framework}):
        </ThemedText>
        
        {review.sampleAnswer.situation && (
          <ThemedText style={styles.bodyText}>
            <ThemedText style={{ fontWeight: '700' }}>[S] Situation: </ThemedText>
            {review.sampleAnswer.situation}
          </ThemedText>
        )}
        
        {review.sampleAnswer.task && (
          <ThemedText style={styles.bodyText}>
            <ThemedText style={{ fontWeight: '700' }}>[T] Task: </ThemedText>
            {review.sampleAnswer.task}
          </ThemedText>
        )}
        
        {review.sampleAnswer.action && (
          <ThemedText style={styles.bodyText}>
            <ThemedText style={{ fontWeight: '700' }}>[A] Action: </ThemedText>
            {review.sampleAnswer.action}
          </ThemedText>
        )}
        
        {review.sampleAnswer.result && (
          <ThemedText style={styles.bodyText}>
            <ThemedText style={{ fontWeight: '700' }}>[R] Result: </ThemedText>
            {review.sampleAnswer.result}
          </ThemedText>
        )}
        
        {review.sampleAnswer.fullAnswer && (
          <View style={{ marginTop: Spacing.one }}>
            <ThemedText style={{ fontWeight: '700', color: colors.primary }}>Đầy đủ:</ThemedText>
            <ThemedText style={styles.bodyText}>{review.sampleAnswer.fullAnswer}</ThemedText>
          </View>
        )}
      </View>
    )}

    {/* Practice Again for this question */}
    <TouchableOpacity
      style={[styles.secondaryButton, { borderColor: colors.primary }]}
      onPress={() => onPracticeAgain(review.questionId)}
    >
      <Ionicons name="refresh" size={16} color={colors.primary} style={{ marginRight: 6 }} />
      <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
        Luyện Tập Lại Câu Này
      </ThemedText>
    </TouchableOpacity>
  </View>
));
