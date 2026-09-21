import React, { memo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { ResumeAnalysisView } from '@/api/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RadialScore } from '@/components/ui/RadialScore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useRouter } from 'expo-router';

interface Props {
  analysisId: string | null;
  analysisResult: ResumeAnalysisView | undefined;
  setAnalysisId: (id: string | null) => void;
  mode: 'standard' | 'job_targeted';
  colors: any;
}

type TabKey = 'overview' | 'breakdown' | 'action';

function parseResult(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
}

const CVAnalysisLoadingState = memo(({
  slideAnim,
  pulseAnim,
  colors,
  isDark,
}: {
  slideAnim: any;
  pulseAnim: any;
  colors: any;
  isDark: boolean;
}) => {
  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIconWrapper}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.pulseCircle, { opacity: pulseAnim, backgroundColor: colors.primaryLight }]} />
        <View style={[styles.mainIconCircle, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="document-scanner" size={32} color="#FFF" />
        </View>
      </View>

      <View style={styles.loadingTextContainer}>
        <View style={[styles.loadingBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
          <Animated.View style={[styles.loadingBadgeDot, { opacity: pulseAnim, backgroundColor: colors.secondary }]} />
          <ThemedText style={[styles.loadingBadgeText, { color: colors.primary }]}>Xử lý bất đồng bộ · Nexora AI Engine</ThemedText>
        </View>
        <ThemedText style={styles.loadingTitle}>Đang phân tích hồ sơ chuyên sâu...</ThemedText>
        <ThemedText style={styles.loadingDesc}>
          Hệ thống đang trích xuất dữ liệu, đối chiếu các trục tiêu chuẩn và đánh giá bằng chứng.
        </ThemedText>
      </View>

      <View style={[styles.loadingBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
        <Animated.View style={[styles.loadingBarFill, { backgroundColor: colors.primary, width: '33%', left: slideInterpolate }]} />
      </View>

      <ThemedText style={styles.loadingHint}>Bạn có thể rời trang này an toàn · Báo cáo sẽ được lưu giữ</ThemedText>
    </View>
  );
});

const CVAnalysisFailedState = memo(({
  errorCode,
  colors,
  onReset,
}: {
  errorCode?: string;
  colors: any;
  onReset: () => void;
}) => (
  <View style={styles.failedContainer}>
    <View style={[styles.failedIconBox, { backgroundColor: colors.errorLight, borderColor: 'rgba(239,68,68,0.2)' }]}>
      <Ionicons name="warning-outline" size={32} color={colors.error} />
    </View>
    <ThemedText style={styles.failedTitle}>Phân tích CV không thành công</ThemedText>
    <ThemedText style={styles.failedDesc}>
      Hệ thống không thể bóc tách nội dung hoặc dịch vụ AI gặp sự cố. {errorCode ? `(Mã lỗi: ${errorCode})` : ''}
    </ThemedText>
    <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={onReset}>
      <Ionicons name="refresh" size={18} color="#FFF" />
      <ThemedText style={styles.btnPrimaryText}>Thực hiện phân tích mới</ThemedText>
    </TouchableOpacity>
  </View>
));

// ---- Data derivation hook (keeps CVAnalysisResultView under complexity threshold) ----

function getScoreSublabel(score: number | null): string {
  if (score === null) return 'N/A';
  if (score >= 80) return 'Rất Tốt';
  if (score >= 60) return 'Khá Tốt';
  if (score >= 40) return 'Cần Nỗ Lực';
  return 'Kém';
}

function buildBreakdownEntries(isBenchmark: boolean, rawBreakdown: Record<string, unknown>) {
  if (isBenchmark) {
    return [
      { key: 'technicalFoundation', name: 'Nền tảng kỹ thuật', score: typeof rawBreakdown.technicalFoundation === 'number' ? rawBreakdown.technicalFoundation : null, desc: 'Kiến trúc phần mềm, cơ sở dữ liệu' },
      { key: 'projectEvidence', name: 'Bằng chứng dự án', score: typeof rawBreakdown.projectEvidence === 'number' ? rawBreakdown.projectEvidence : null, desc: 'Minh chứng qua quy mô dự án thực tế' },
      { key: 'experiencePresentation', name: 'Thể hiện kinh nghiệm', score: typeof rawBreakdown.experiencePresentation === 'number' ? rawBreakdown.experiencePresentation : null, desc: 'Làm nổi bật vai trò đóng góp cá nhân' },
      { key: 'impactAchievements', name: 'Số liệu tác động', score: typeof rawBreakdown.impactAchievements === 'number' ? rawBreakdown.impactAchievements : null, desc: 'Chỉ số định lượng về hiệu năng' },
      { key: 'clarity', name: 'Mạch lạc & Rõ ràng', score: typeof rawBreakdown.clarity === 'number' ? rawBreakdown.clarity : null, desc: 'Trình bày chuyên nghiệp, chuẩn xác' },
      { key: 'roleAlignment', name: 'Định hướng vai trò', score: typeof rawBreakdown.roleAlignment === 'number' ? rawBreakdown.roleAlignment : null, desc: 'Phù hợp với kỳ vọng cấp bậc mục tiêu' },
    ];
  }
  return [
    { key: 'technicalSkillMatch', name: 'Khớp kỹ năng kỹ thuật', score: typeof rawBreakdown.technicalSkillMatch === 'number' ? rawBreakdown.technicalSkillMatch : null, desc: 'Mức độ đáp ứng các công nghệ JD' },
    { key: 'experienceRelevance', name: 'Độ liên quan kinh nghiệm', score: typeof rawBreakdown.experienceRelevance === 'number' ? rawBreakdown.experienceRelevance : null, desc: 'Kinh nghiệm trong ngành tương đồng' },
    { key: 'impactEvidence', name: 'Bằng chứng hiệu quả', score: typeof rawBreakdown.impactEvidence === 'number' ? rawBreakdown.impactEvidence : null, desc: 'Chỉ số tải, tối ưu hóa quy trình' },
    { key: 'clarity', name: 'Độ rõ ràng & mạch lạc', score: typeof rawBreakdown.clarity === 'number' ? rawBreakdown.clarity : null, desc: 'Từ ngữ súc tích, chuẩn kỹ thuật' },
    { key: 'structure', name: 'Bố cục hồ sơ', score: typeof rawBreakdown.structure === 'number' ? rawBreakdown.structure : null, desc: 'Chuẩn ATS, bố cục dễ quét' },
  ];
}

function parseAnalysisData(analysisResult: ResumeAnalysisView | undefined, mode: Props['mode']) {
  const rawResult = parseResult(analysisResult?.result);
  const isBenchmark = (analysisResult as any)?.mode === 'field_benchmark' || rawResult?.mode === 'field_benchmark' || mode === 'standard';

  const score = isBenchmark
    ? (typeof rawResult?.readinessScore === 'number' ? rawResult.readinessScore : null)
    : (typeof rawResult?.matchScore === 'number' ? rawResult.matchScore : null);

  const summary = typeof rawResult?.summary === 'string' ? rawResult.summary : '';
  const strengths: string[] = Array.isArray(rawResult?.strengths) ? (rawResult.strengths as string[]) : [];
  const gaps: string[] = Array.isArray(rawResult?.gaps) ? (rawResult.gaps as string[]) : [];
  const recommendations: string[] = Array.isArray(rawResult?.recommendations) ? (rawResult.recommendations as string[]) : [];
  const sectionFeedback: string[] = Array.isArray(rawResult?.sectionFeedback) ? (rawResult.sectionFeedback as string[]) : [];

  const contextData = (analysisResult as any)?.context;
  const industry: string | null = contextData?.industry ?? (typeof rawResult?.industry === 'string' ? rawResult.industry : null);
  const targetRole: string | null = contextData?.targetRole ?? (typeof rawResult?.targetRole === 'string' ? rawResult.targetRole : null);
  const seniority: string | null = contextData?.seniority ?? (typeof rawResult?.seniority === 'string' ? rawResult.seniority : null);

  const createdAt = (analysisResult as any)?.createdAt ? new Date((analysisResult as any).createdAt).toLocaleDateString('vi-VN') : null;
  const rubricVersion = (analysisResult as any)?.rubricVersion;
  const modelVersion = (analysisResult as any)?.modelVersion;

  const matchedSkills: string[] = Array.isArray(rawResult?.matchedKeywordsOrSkills) ? (rawResult.matchedKeywordsOrSkills as string[]) : [];
  const missingSkills: string[] = Array.isArray(rawResult?.missingKeywordsOrSkills) ? (rawResult.missingKeywordsOrSkills as string[]) : [];

  const rawBreakdown = (rawResult?.breakdown && typeof rawResult.breakdown === 'object' ? rawResult.breakdown : {}) as Record<string, unknown>;
  const breakdownEntries = buildBreakdownEntries(isBenchmark, rawBreakdown);
  const hasBreakdown = breakdownEntries.some((e) => e.score !== null);
  const scoreLabel = isBenchmark ? 'Điểm Sẵn Sàng' : 'Mức độ Phù hợp';
  const scoreSublabel = getScoreSublabel(score);

  return {
    isBenchmark, score, summary, strengths, gaps, recommendations, sectionFeedback,
    industry, targetRole, seniority, createdAt, rubricVersion, modelVersion,
    matchedSkills, missingSkills, breakdownEntries, hasBreakdown, scoreLabel, scoreSublabel,
  };
}

// --------------------------------------------------------------------------------------

const CVSegmentedTabs = memo(({ activeTab, setActiveTab, colors, isDark }: {
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

const CVActionCtaBanner = memo(({ colors, onNavigate }: { colors: any; onNavigate: () => void }) => (
  <View style={[styles.ctaBanner, { backgroundColor: colors.primary }]}>
    <View style={styles.ctaBadge}>
      <ThemedText style={styles.ctaBadgeText}>Hành động tiếp theo</ThemedText>
    </View>
    <ThemedText style={styles.ctaTitle}>Luyện phỏng vấn AI</ThemedText>
    <ThemedText style={styles.ctaDesc}>
      Chuyển sang phòng phỏng vấn để bám sát JD và CV của bạn.
    </ThemedText>
    <TouchableOpacity style={styles.ctaButton} onPress={onNavigate}>
      <ThemedText style={[styles.ctaButtonText, { color: colors.primary }]}>Chuyển sang phòng phỏng vấn</ThemedText>
      <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
    </TouchableOpacity>
  </View>
));

export function CVAnalysisResultView({ analysisId, analysisResult, setAnalysisId, mode = 'standard', colors }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const [pulseAnim] = useState(() => new Animated.Value(0.3));
  const [slideAnim] = useState(() => new Animated.Value(0));

  const parsed = parseAnalysisData(analysisResult, mode);

  useEffect(() => {
    if (analysisResult?.status === 'pending' || analysisResult?.status === 'processing' || analysisResult?.status === 'queued') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();

      Animated.loop(
        Animated.timing(slideAnim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: false })
      ).start();
    }
  }, [analysisResult?.status, pulseAnim, slideAnim]);

  if (!analysisId || !analysisResult) return null;

  const currentStatus = analysisResult.status;

  if (currentStatus === 'pending' || currentStatus === 'processing' || currentStatus === 'queued') {
    return <CVAnalysisLoadingState slideAnim={slideAnim} pulseAnim={pulseAnim} colors={colors} isDark={isDark} />;
  }

  if (currentStatus === 'failed') {
    return <CVAnalysisFailedState errorCode={(analysisResult as any).errorCode} colors={colors} onReset={() => setAnalysisId(null)} />;
  }

  // COMPLETED STATE
  const {
    isBenchmark, score, summary, strengths, gaps, recommendations, sectionFeedback,
    industry, targetRole, seniority, createdAt, rubricVersion, modelVersion,
    matchedSkills, missingSkills, breakdownEntries, hasBreakdown, scoreLabel, scoreSublabel,
  } = parsed;

  return (
    <View style={styles.container}>
      <CVSegmentedTabs activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} isDark={isDark} />

      {/* Render Active Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && (
          <CVOverviewTab
            isBenchmark={isBenchmark}
            targetRole={targetRole}
            seniority={seniority}
            industry={industry}
            createdAt={createdAt}
            score={score}
            scoreLabel={scoreLabel}
            scoreSublabel={scoreSublabel}
            summary={summary}
            rubricVersion={rubricVersion}
            modelVersion={modelVersion}
            colors={colors}
            isDark={isDark}
          />
        )}
        {activeTab === 'breakdown' && (
          <CVBreakdownTab
            isBenchmark={isBenchmark}
            hasBreakdown={hasBreakdown}
            breakdownEntries={breakdownEntries}
            strengths={strengths}
            gaps={gaps}
            colors={colors}
            isDark={isDark}
          />
        )}
        {activeTab === 'action' && (
          <CVActionPlanTab
            matchedSkills={matchedSkills}
            missingSkills={missingSkills}
            recommendations={recommendations}
            sectionFeedback={sectionFeedback}
            colors={colors}
            isDark={isDark}
          />
        )}
      </View>

      <CVActionCtaBanner colors={colors} onNavigate={() => router.push('/interviews' as any)} />
    </View>
  );
}

// ---------- CVOverviewTab sub-components (keeps complexity low) ----------

const CVMetaHeader = memo(({ isBenchmark, targetRole, seniority, industry, createdAt, isDark, colors }: {
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

const CVOverviewTab = memo(({
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



const CVBreakdownTab = memo(({
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

const CVActionPlanTab = memo(({
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

const styles = StyleSheet.create({
  container: { gap: Spacing.four, paddingBottom: 40 },
  card: { borderRadius: Radius.lg, padding: Spacing.four, borderWidth: 1 },
  
  // Tabs Styles
  tabsContainer: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: Spacing.two },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)' },
  tabText: { fontSize: 13, opacity: 0.7 },
  tabContent: { minHeight: 300 },

  // Loading Styles
  loadingContainer: { minHeight: 400, alignItems: 'center', justifyContent: 'center', padding: Spacing.six },
  loadingIconWrapper: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.six },
  pulseCircle: { borderRadius: 40 },
  mainIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' },
  loadingTextContainer: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.six },
  loadingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 8 },
  loadingBadgeDot: { width: 8, height: 8, borderRadius: 4 },
  loadingBadgeText: { fontSize: 12, fontWeight: '600' },
  loadingTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  loadingDesc: { fontSize: 13, textAlign: 'center', opacity: 0.7, maxWidth: 280, lineHeight: 20 },
  loadingBarTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.four, position: 'relative' },
  loadingBarFill: { height: '100%', position: 'absolute' },
  loadingHint: { fontSize: 11, opacity: 0.5 },

  // Failed Styles
  failedContainer: { padding: Spacing.six, alignItems: 'center', gap: Spacing.four, marginTop: 40 },
  failedIconBox: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  failedTitle: { fontSize: 18, fontWeight: 'bold' },
  failedDesc: { fontSize: 13, textAlign: 'center', opacity: 0.7, lineHeight: 20 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
  btnPrimaryText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  // Success Styles
  cardHeaderRow: { flexDirection: 'row', marginBottom: Spacing.four },
  tag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, marginBottom: 8 },
  tagText: { fontSize: 11, fontWeight: '600' },
  mainTitle: { fontSize: 22, fontWeight: 'bold', lineHeight: 30 },
  radialScoreWrapper: { padding: Spacing.four, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  summaryBox: { marginTop: Spacing.four, padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1 },
  summaryHeader: { fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  summaryText: { fontSize: 13, lineHeight: 22 },

  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  scaleHint: { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', opacity: 0.6 },
  breakdownList: { gap: Spacing.two },
  
  keywordsContainer: { gap: 0 },
  kwHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  kwIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipMatched: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#A7F3D0' },
  chipMatchedText: { color: '#065F46', fontSize: 12, fontWeight: '600' },
  chipMissing: { backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FECACA' },
  chipMissingText: { color: '#991B1B', fontSize: 12, fontWeight: '600' },

  listSection: { gap: 8 },
  listHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  listItemText: { fontSize: 13, flex: 1, lineHeight: 20 },

  emptyBox: { padding: Spacing.six, borderRadius: Radius.md, alignItems: 'center' },
  emptyText: { fontSize: 12, opacity: 0.6 },

  metaContainer: { marginTop: Spacing.two, gap: 4 },
  metaText: { fontSize: 12, opacity: 0.8 },
  versionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.four, paddingTop: Spacing.three, borderTopWidth: 1 },
  versionText: { fontSize: 11, opacity: 0.6, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  feedbackBox: { padding: Spacing.four, borderRadius: Radius.md, borderWidth: 1 },
  feedbackBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  feedbackBoxTitle: { fontSize: 13, fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#64748B', marginTop: 8 },

  ctaBanner: { padding: Spacing.six, borderRadius: Radius.lg, marginTop: Spacing.four, alignItems: 'center', gap: Spacing.three },
  ctaBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  ctaBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  ctaTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  ctaDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center', marginBottom: Spacing.two },
  ctaButton: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaButtonText: { fontWeight: 'bold', fontSize: 14 },
});
