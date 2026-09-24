import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RadialScore } from '@/components/ui/radial-score';
import { Spacing } from '@/constants/theme';
import { styles } from '../CVAnalysisResultView.styles';

export type TabKey = 'overview' | 'breakdown' | 'action';

export const CVSegmentedTabs = memo(({ activeTab, setActiveTab, colors, isDark }: {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  colors: any;
  isDark: boolean;
}) => (
  <View style={[styles.tabsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
    <TouchableOpacity 
      style={[styles.tabButton, activeTab === 'overview' && [styles.activeTab, { backgroundColor: colors.card }]]}
      onPress={() => setActiveTab('overview')}
    >
      <ThemedText style={[styles.tabText, activeTab === 'overview' && { color: colors.primary, fontWeight: 'bold' }]}>Tổng quan</ThemedText>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.tabButton, activeTab === 'breakdown' && [styles.activeTab, { backgroundColor: colors.card }]]}
      onPress={() => setActiveTab('breakdown')}
    >
      <ThemedText style={[styles.tabText, activeTab === 'breakdown' && { color: colors.primary, fontWeight: 'bold' }]}>Chi tiết</ThemedText>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.tabButton, activeTab === 'action' && [styles.activeTab, { backgroundColor: colors.card }]]}
      onPress={() => setActiveTab('action')}
    >
      <ThemedText style={[styles.tabText, activeTab === 'action' && { color: colors.primary, fontWeight: 'bold' }]}>Hành động</ThemedText>
    </TouchableOpacity>
  </View>
));

export const CVMetaHeader = memo(({ isBenchmark, targetRole, seniority, industry, createdAt, isDark, colors }: {
  isBenchmark: boolean;
  targetRole: string | null;
  seniority: string | null;
  industry: string | null;
  createdAt: string | null;
  isDark: boolean;
  colors: any;
}) => (
  <View style={styles.cardHeaderRow}>
    <View style={{ flex: 1 }}>
      <View style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
        <MaterialIcons name="verified" size={14} color={colors.primary} />
        <ThemedText style={[styles.tagText, { color: colors.primary }]}>Báo cáo phân tích chuyên sâu</ThemedText>
      </View>
      <ThemedText style={styles.mainTitle}>
        {isBenchmark ? 'Đánh giá hồ sơ theo Chuẩn năng lực' : 'Đánh giá hồ sơ theo JD'}
      </ThemedText>
      <View style={styles.metaContainer}>
        {targetRole && <ThemedText style={styles.metaText}>Vị trí: <ThemedText style={{ fontWeight: 'bold' }}>{targetRole}{seniority ? ` (${seniority})` : ''}</ThemedText></ThemedText>}
        {industry && <ThemedText style={styles.metaText}>Ngành: <ThemedText style={{ fontWeight: 'bold' }}>{industry}</ThemedText></ThemedText>}
        <ThemedText style={styles.metaText}>Hình thức: <ThemedText style={{ fontWeight: 'bold' }}>{isBenchmark ? 'Chuẩn thị trường' : 'Theo JD cụ thể'}</ThemedText></ThemedText>
        {createdAt && <ThemedText style={styles.metaText}>Thời điểm: <ThemedText style={{ fontWeight: 'bold' }}>{createdAt}</ThemedText></ThemedText>}
      </View>
    </View>
  </View>
));

export const CVOverviewTab = memo(({
  isBenchmark,
  targetRole,
  seniority,
  industry,
  createdAt,
  score,
  scoreLabel,
  scoreSublabel,
  summary,
  rubricVersion,
  modelVersion,
  colors,
  isDark,
}: {
  isBenchmark: boolean;
  targetRole: string | null;
  seniority: string | null;
  industry: string | null;
  createdAt: string | null;
  score: number | null;
  scoreLabel: string;
  scoreSublabel: string;
  summary: string;
  rubricVersion?: string;
  modelVersion?: string;
  colors: any;
  isDark: boolean;
}) => (
  <View style={{ gap: Spacing.four }}>
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <CVMetaHeader
        isBenchmark={isBenchmark}
        targetRole={targetRole}
        seniority={seniority}
        industry={industry}
        createdAt={createdAt}
        isDark={isDark}
        colors={colors}
      />

      <View style={[styles.radialScoreWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB' }]}>
        <RadialScore score={score} label={scoreLabel} sublabel={scoreSublabel} size="lg" />
      </View>

      {summary ? (
        <View style={[styles.summaryBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <ThemedText style={[styles.summaryHeader, { color: colors.primary }]}>Tóm lược từ Nexora AI:</ThemedText>
          <ThemedText style={styles.summaryText}>{summary}</ThemedText>
        </View>
      ) : null}

      {(rubricVersion || modelVersion) && (
        <View style={[styles.versionContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          {rubricVersion && <ThemedText style={styles.versionText}>Rubric: {rubricVersion}</ThemedText>}
          {modelVersion && <ThemedText style={styles.versionText}>Model: {modelVersion}</ThemedText>}
        </View>
      )}
    </View>
  </View>
));

export const CVBreakdownTab = memo(({
  isBenchmark,
  hasBreakdown,
  breakdownEntries,
  strengths,
  gaps,
  colors,
  isDark,
}: {
  isBenchmark: boolean;
  hasBreakdown: boolean;
  breakdownEntries: Array<{ key: string; name: string; score: number | null; desc: string }>;
  strengths: string[];
  gaps: string[];
  colors: any;
  isDark: boolean;
}) => (
  <View style={{ gap: Spacing.four }}>
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.breakdownHeader}>
        <ThemedText style={styles.sectionTitle}>
          {isBenchmark ? 'Đánh giá 6 trục chuẩn năng lực' : 'Đánh giá 5 trục tiêu chuẩn'}
        </ThemedText>
        <ThemedText style={styles.scaleHint}>Scale 0-100</ThemedText>
      </View>
      <View style={styles.breakdownList}>
        {hasBreakdown ? (
          breakdownEntries.map((item) => {
            if (item.score === null) return null;
            return (
              <ProgressBar 
                key={item.key}
                progress={item.score}
                label={item.name}
                color={colors.primary}
                trackColor={isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}
              />
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <ThemedText style={styles.emptyText}>Chưa có dữ liệu đánh giá chi tiết</ThemedText>
          </View>
        )}
      </View>
    </View>

    {(strengths.length > 0 || gaps.length > 0) && (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <ThemedText style={[styles.sectionTitle, { marginBottom: 12 }]}>Phân tích chi tiết</ThemedText>
        
        {strengths.length > 0 && (
          <View style={styles.listSection}>
            <ThemedText style={[styles.listHeader, { color: '#059669' }]}>Điểm mạnh & Lợi thế</ThemedText>
            {strengths.map((s) => (
              <View key={s} style={styles.listItem}>
                <Ionicons name="checkmark" size={16} color="#10B981" style={{ marginTop: 2 }} />
                <ThemedText style={styles.listItemText}>{s}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {gaps.length > 0 && (
          <View style={[styles.listSection, { marginTop: 16 }]}>
            <ThemedText style={[styles.listHeader, { color: '#991B1B' }]}>Lỗ hổng & Điểm trừ</ThemedText>
            {gaps.map((s) => (
              <View key={s} style={styles.listItem}>
                <Ionicons name="remove" size={16} color="#EF4444" style={{ marginTop: 2 }} />
                <ThemedText style={styles.listItemText}>{s}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    )}
  </View>
));

export const CVActionPlanTab = memo(({
  matchedSkills,
  missingSkills,
  recommendations,
  sectionFeedback,
  colors,
  isDark,
}: {
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  sectionFeedback: string[];
  colors: any;
  isDark: boolean;
}) => (
  <View style={{ gap: Spacing.four }}>
    {(matchedSkills.length > 0 || missingSkills.length > 0) && (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.kwHeader}>
          <View style={[styles.kwIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}><MaterialIcons name="radar" size={18} color="#10B981" /></View>
          <View>
            <ThemedText style={styles.sectionTitle}>Từ khóa & Kỹ năng</ThemedText>
          </View>
        </View>
        
        {matchedSkills.length > 0 && (
          <View style={[styles.keywordsContainer, { marginBottom: missingSkills.length > 0 ? Spacing.four : 0 }]}>
            <ThemedText style={[styles.listHeader, { color: '#059669', marginBottom: 8 }]}>Từ khóa trùng khớp</ThemedText>
            <View style={styles.chipsWrap}>
              {matchedSkills.map((sk) => (
                <View key={sk} style={[styles.chipMatched, isDark && { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }]}>
                  <ThemedText style={[styles.chipMatchedText, isDark && { color: '#34D399' }]}>{sk}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {missingSkills.length > 0 && (
          <View style={styles.keywordsContainer}>
            <ThemedText style={[styles.listHeader, { color: '#991B1B', marginBottom: 8 }]}>Từ khóa còn thiếu</ThemedText>
            <View style={styles.chipsWrap}>
              {missingSkills.map((sk) => (
                <View key={sk} style={[styles.chipMissing, isDark && { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }]}>
                  <ThemedText style={[styles.chipMissingText, isDark && { color: '#F87171' }]}>{sk}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    )}

    {(recommendations.length > 0 || sectionFeedback.length > 0) && (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.kwHeader}>
          <View style={[styles.kwIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}><MaterialIcons name="lightbulb" size={18} color="#2563EB" /></View>
          <View>
            <ThemedText style={styles.sectionTitle}>Khuyến nghị hoàn thiện</ThemedText>
          </View>
        </View>
        
        <View style={{ gap: Spacing.four }}>
          {recommendations.length > 0 && (
            <View style={[styles.feedbackBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
              <View style={styles.feedbackBoxHeader}>
                <MaterialIcons name="task-alt" size={16} color={colors.primary} />
                <ThemedText style={[styles.feedbackBoxTitle, { color: colors.primary }]}>Hành động khuyến nghị</ThemedText>
              </View>
              {recommendations.map((rec) => (
                <View key={rec} style={styles.listItem}>
                  <View style={styles.dot} />
                  <ThemedText style={styles.listItemText}>{rec}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {sectionFeedback.length > 0 && (
            <View style={[styles.feedbackBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
              <View style={styles.feedbackBoxHeader}>
                <MaterialIcons name="feedback" size={16} color={colors.secondary} />
                <ThemedText style={[styles.feedbackBoxTitle, { color: colors.secondary }]}>Góp ý từng phần hồ sơ</ThemedText>
              </View>
              {sectionFeedback.map((fb) => (
                <View key={fb} style={styles.listItem}>
                  <View style={styles.dot} />
                  <ThemedText style={styles.listItemText}>{fb}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    )}
  </View>
));
