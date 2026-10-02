/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Animated, Easing, View, LayoutAnimation, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ResumeAnalysisView } from '@/api/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from './CVAnalysisResultView.styles';

import { parseAnalysisData, ANALYSIS_ANIMATION_CONFIG } from './result-view/CVAnalysisResultHelpers';
import {
  CVActionCtaBanner,
  CVAnalysisFailedState,
  CVAnalysisLoadingState,
  CVAnalysisSkeleton,
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

  const [internalState, setInternalState] = useState<'loading' | 'success' | 'skeleton' | 'completed' | 'failed'>(
    (analysisResult?.status === 'completed') ? 'completed' : 
    (analysisResult?.status === 'failed' ? 'failed' : 'loading')
  );

  const [pulseAnim] = useState(() => new Animated.Value(0.3));
  const [simulatedProgressAnim] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const parsed = parseAnalysisData(analysisResult, mode);

  useEffect(() => {
    if (internalState === 'loading') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();

      Animated.timing(simulatedProgressAnim, {
        toValue: 90,
        duration: 15000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      pulseAnim.stopAnimation();
      if (internalState !== 'success') {
        simulatedProgressAnim.stopAnimation();
      }
    }
  }, [internalState, pulseAnim, simulatedProgressAnim]);

  const [initialStatus] = useState(analysisResult?.status);
  const prevStatus = React.useRef(analysisResult?.status);

  useEffect(() => {
    let timeoutId1: ReturnType<typeof setTimeout>;
    let timeoutId2: ReturnType<typeof setTimeout>;
    const currentStatus = analysisResult?.status;
    
    if (currentStatus === 'completed') {
      if (internalState === 'loading') {
        if (!prevStatus.current) {
          // If the status was undefined before and is now completed, it's an old report loading.
          // Skip the success animation and jump straight to the completed state.
          setInternalState('completed');
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
          simulatedProgressAnim.setValue(100);
        } else {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setInternalState('success');
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          
          const typingDuration = ANALYSIS_ANIMATION_CONFIG.successDescText.length * ANALYSIS_ANIMATION_CONFIG.typingSpeedMs;
          const totalWaitTime = ANALYSIS_ANIMATION_CONFIG.successDescDelayMs + typingDuration + ANALYSIS_ANIMATION_CONFIG.postTypingWaitMs;
          
          timeoutId1 = setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setInternalState('skeleton');
            
            timeoutId2 = setTimeout(() => {
              setInternalState('completed');
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }).start();
            }, 1500);
          }, totalWaitTime);
        }
      } else if (internalState === 'completed') {
         fadeAnim.setValue(1);
         simulatedProgressAnim.setValue(100);
      }
    } else if (currentStatus === 'failed') {
      setInternalState('failed');
    }
    
    prevStatus.current = currentStatus;
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [analysisResult?.status]);

  if (!analysisId || !analysisResult) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayState = (analysisResult?.status === 'completed' && !initialStatus && internalState === 'loading') 
    ? 'completed' 
    : internalState;

  if (displayState === 'loading' || displayState === 'success') {
    return (
      <CVAnalysisLoadingState 
        simulatedProgressAnim={simulatedProgressAnim} 
        pulseAnim={pulseAnim} 
        colors={colors} 
        isDark={isDark} 
        isSuccess={displayState === 'success'}
      />
    );
  }

  if (displayState === 'skeleton') {
    return <CVAnalysisSkeleton colors={colors} isDark={isDark} />;
  }

  if (displayState === 'failed') {
    return <CVAnalysisFailedState errorCode={(analysisResult as any).errorCode} colors={colors} onReset={() => setAnalysisId(null)} />;
  }

  // COMPLETED STATE
  const {
    isBenchmark, score, summary, strengths, gaps, recommendations, sectionFeedback,
    industry, targetRole, seniority, createdAt, rubricVersion, modelVersion,
    matchedSkills, missingSkills, breakdownEntries, hasBreakdown, scoreLabel, scoreSublabel,
  } = parsed;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
    </Animated.View>
  );
}

