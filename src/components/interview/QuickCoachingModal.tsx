import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface QuickCoachingModalProps {
  visible: boolean;
  coaching: any;
  candidateAnswer?: string | null;
  questionSequence: number;
  onContinue: () => void;
  onClose: () => void;
  colors: any;
}

export function QuickCoachingModal({
  visible,
  coaching,
  questionSequence,
  onContinue,
  onClose,
  colors,
}: QuickCoachingModalProps) {
  if (!coaching) return null;

  const scores = Array.isArray(coaching.scores) ? coaching.scores : [];
  const strengths = Array.isArray(coaching.strengths) ? coaching.strengths : [];
  const improvements = Array.isArray(coaching.improvements) ? coaching.improvements : [];

  let nextSequenceLabel = `Tiếp tục Câu ${questionSequence + 1}`;
  if (questionSequence >= 3) {
    nextSequenceLabel = 'Xem kết quả & Tổng kết 3 câu';
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={20} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <ThemedText type="subtitle" style={styles.headerTitle}>
                    Nhận xét nhanh AI
                  </ThemedText>
                  <View style={[styles.seqBadge, { backgroundColor: colors.accentLight }]}>
                    <ThemedText style={[styles.seqText, { color: colors.accent }]}>
                      Đã đánh giá Câu {questionSequence}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.headerSub, { color: colors.icon }]}>
                  Phản hồi tức thì giúp bạn cải thiện ngay cho câu tiếp theo.
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Body Scroll */}
          <ScrollView contentContainerStyle={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Overall Feedback */}
            {coaching.feedback && (
              <View style={[styles.feedbackBox, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <ThemedText style={styles.feedbackText}>{coaching.feedback}</ThemedText>
              </View>
            )}

            {/* Rubric Scores */}
            {scores.length > 0 && (
              <View style={styles.rubricSection}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Đánh giá theo Rubric tiêu chuẩn
                </ThemedText>
                {scores.map((sc: any, idx: number) => {
                  const percent = Math.min(100, Math.max(0, ((sc.score || 0) / (sc.maxScore || 10)) * 100));
                  return (
                    <View key={idx} style={styles.scoreRow}>
                      <View style={styles.scoreLabelRow}>
                        <ThemedText style={styles.criterionName}>
                          {sc.criterion || `Tiêu chuẩn ${idx + 1}`}
                        </ThemedText>
                        <ThemedText style={[styles.scoreValue, { color: colors.primary }]}>
                          {sc.score}/{sc.maxScore || 10}
                        </ThemedText>
                      </View>
                      <View style={[styles.trackBar, { backgroundColor: colors.cardBorder }]}>
                        <View
                          style={[
                            styles.fillBar,
                            {
                              width: `${percent}%`,
                              backgroundColor: percent >= 70 ? colors.accent : percent >= 50 ? colors.primary : colors.warning || '#f59e0b',
                            },
                          ]}
                        />
                      </View>
                      {sc.feedback && (
                        <ThemedText style={[styles.scoreSub, { color: colors.icon }]}>
                          {sc.feedback}
                        </ThemedText>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Strengths Card */}
            {strengths.length > 0 && (
              <View style={[styles.boxCard, { backgroundColor: colors.accentLight || '#d1fae5', borderColor: colors.accent || '#10b981' }]}>
                <View style={styles.boxTitleRow}>
                  <Ionicons name="thumbs-up-outline" size={18} color={colors.accent || '#10b981'} style={{ marginRight: 6 }} />
                  <ThemedText style={[styles.boxTitle, { color: colors.accent || '#065f46' }]}>
                    Điểm sáng nổi bật
                  </ThemedText>
                </View>
                {strengths.map((item: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <ThemedText style={{ color: colors.accent || '#065f46', marginRight: 6 }}>•</ThemedText>
                    <ThemedText style={[styles.bulletText, { color: colors.text }]}>{item}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* Improvements Card */}
            {improvements.length > 0 && (
              <View style={[styles.boxCard, { backgroundColor: colors.warningLight || '#fef3c7', borderColor: colors.warning || '#f59e0b' }]}>
                <View style={styles.boxTitleRow}>
                  <Ionicons name="bulb-outline" size={18} color={colors.warning || '#d97706'} style={{ marginRight: 6 }} />
                  <ThemedText style={[styles.boxTitle, { color: colors.warning || '#92400e' }]}>
                    Điểm cần cải thiện
                  </ThemedText>
                </View>
                {improvements.map((item: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <ThemedText style={{ color: colors.warning || '#92400e', marginRight: 6 }}>•</ThemedText>
                    <ThemedText style={[styles.bulletText, { color: colors.text }]}>{item}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer CTA */}
          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: colors.primary }]}
              onPress={onContinue}
            >
              <ThemedText style={styles.continueBtnText}>{nextSequenceLabel}</ThemedText>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.two,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  seqText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  bodyScroll: {
    padding: Spacing.two,
    gap: Spacing.two,
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    lineHeight: 18,
  },
  rubricSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreRow: {
    gap: 4,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  criterionName: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  trackBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreSub: {
    fontSize: 11,
    marginTop: 2,
  },
  boxCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  boxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    padding: Spacing.two,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
