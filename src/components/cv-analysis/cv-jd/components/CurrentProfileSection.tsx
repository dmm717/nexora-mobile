import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/cv-jd.styles';
import { PrimaryCvSpotlightCard } from './PrimaryCvSpotlightCard';
import { AnalysisTypeSelector, JobDescriptionCard } from '../../CVAnalysisForms';

export const CurrentProfileSection = React.memo(({
  profile, colorScheme, colors, mode, setMode, jdTitle, setJdTitle, jdContent, setJdContent, analyzeMutation, handleStartAnalysis, isResumeReady
}: any) => {
  return (
    <View style={{ gap: Spacing.four }}>
      <PrimaryCvSpotlightCard profile={profile} colorScheme={colorScheme} colors={colors} />
      <AnalysisTypeSelector mode={mode} setMode={setMode} colors={colors} colorScheme={colorScheme} defaultTargetRole={profile?.activeCareerGoal?.targetRole} isCustomProfile={false} />
      {mode === 'job_targeted' && (
        <JobDescriptionCard jdTitle={jdTitle} setJdTitle={setJdTitle} jdContent={jdContent} setJdContent={setJdContent} colors={colors} />
      )}
      <TouchableScale
        style={[styles.primaryButtonPremium, (analyzeMutation.isPending || !profile?.primaryResume || !isResumeReady) && styles.disabledButtonPremium]}
        onPress={handleStartAnalysis}
        disabled={analyzeMutation.isPending || !profile?.primaryResume || !isResumeReady}
      >
        {analyzeMutation.isPending ? <ActivityIndicator color="#fff" /> : (
          <>
            <ThemedText style={styles.primaryButtonTextPremium}>Phân tích độ phù hợp</ThemedText>
            <View style={styles.buttonIconWrapPremium}><Ionicons name="rocket" size={16} color="#FFF" /></View>
          </>
        )}
      </TouchableScale>
    </View>
  );
});
