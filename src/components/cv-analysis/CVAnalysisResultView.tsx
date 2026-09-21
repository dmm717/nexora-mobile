import React, { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ResumeAnalysisView } from '@/api/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from './CVAnalysisResultView.styles';

import { parseAnalysisData } from './result-view/CVAnalysisResultHelpers';
import {
  CVActionCtaBanner,
  CVAnalysisFailedState,
  CVAnalysisLoadingState,
} from './result-view/CVAnalysisResultStates';
import {
  CVActionPlanTab,
  CVBreakdownTab,
  CVOverviewTab,
  CVSegmentedTabs,
  TabKey,
} from './result-view/CVAnalysisResultTabs';

interface Props {
  analysisId: string | null;
  analysisResult: ResumeAnalysisView | undefined;
  setAnalysisId: (id: string | null) => void;
  mode: 'standard' | 'job_targeted';
  colors: any;
}

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
