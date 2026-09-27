import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/cv-jd.styles';
import { ResumeUploadCard, AnalysisTypeSelector, JobDescriptionCard, FieldBenchmarkCard } from '../../CVAnalysisForms';

export const CustomProfileSection = React.memo(({
  isUploading, colors, colorScheme, handleUploadResume, userResumes, selectedResumeId, setSelectedResumeId, currentFileName, setCurrentFileName, mode, setMode, jdTitle, setJdTitle, jdContent, setJdContent, industry, setIndustry, targetRole, setTargetRole, seniority, setSeniority, analyzeMutation, handleStartAnalysis, isResumeReady
}: any) => {
  return (
    <View style={{ gap: Spacing.four }}>
      <ResumeUploadCard
        isUploading={isUploading}
        colors={colors}
        colorScheme={colorScheme}
        onUploadResume={handleUploadResume}
        existingResumes={userResumes}
        selectedResumeId={selectedResumeId}
        onSelectExistingResume={(r: any) => { setSelectedResumeId(r.id); setCurrentFileName(r.fileName); }}
        onClearSelectedResume={() => { setSelectedResumeId(null); setCurrentFileName(null); }}
        currentFileName={currentFileName}
      />
      <AnalysisTypeSelector mode={mode} setMode={setMode} colors={colors} colorScheme={colorScheme} isCustomProfile={true} />
      {mode === 'job_targeted' ? (
        <JobDescriptionCard jdTitle={jdTitle} setJdTitle={setJdTitle} jdContent={jdContent} setJdContent={setJdContent} colors={colors} />
      ) : (
        <FieldBenchmarkCard industry={industry} setIndustry={setIndustry} targetRole={targetRole} setTargetRole={setTargetRole} seniority={seniority} setSeniority={setSeniority} colors={colors} />
      )}
      <TouchableScale
        style={[styles.primaryButtonPremium, (analyzeMutation.isPending || !selectedResumeId || !isResumeReady) && styles.disabledButtonPremium]}
        onPress={handleStartAnalysis}
        disabled={analyzeMutation.isPending || !selectedResumeId || !isResumeReady}
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
