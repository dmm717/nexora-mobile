import React from 'react';
import { View } from 'react-native';
import { DataSourceToggleBar } from './DataSourceToggleBar';
import { CurrentProfileSection } from './CurrentProfileSection';
import { CustomProfileSection } from './CustomProfileSection';
import { CvJdHistorySection } from './CvJdHistorySection';
import { useCvJdTabState } from '../useCvJdTabState';

export const CvJdFormContent = React.memo(({
  state,
  colorScheme,
  colors,
}: {
  state: ReturnType<typeof useCvJdTabState>;
  colorScheme: string;
  colors: any;
}) => (
  <View>
    <DataSourceToggleBar
      useCurrentProfile={state.useCurrentProfile}
      setUseCurrentProfile={state.setUseCurrentProfile}
      mode={state.mode}
      setMode={state.setMode}
      colorScheme={colorScheme}
      colors={colors}
    />

    {state.useCurrentProfile ? (
      <CurrentProfileSection
        profile={state.profile}
        colorScheme={colorScheme}
        colors={colors}
        mode={state.mode}
        setMode={state.setMode}
        jdTitle={state.jdTitle}
        setJdTitle={state.setJdTitle}
        jdContent={state.jdContent}
        setJdContent={state.setJdContent}
        analyzeMutation={state.analyzeMutation}
        handleStartAnalysis={state.handleStartAnalysis}
        isResumeReady={state.isResumeReady}
      />
    ) : (
      <CustomProfileSection
        isUploading={state.isUploading}
        colors={colors}
        colorScheme={colorScheme}
        handleUploadResume={state.handleUploadResume}
        userResumes={state.userResumes}
        selectedResumeId={state.selectedResumeId}
        setSelectedResumeId={state.setSelectedResumeId}
        currentFileName={state.currentFileName}
        setCurrentFileName={state.setCurrentFileName}
        mode={state.mode}
        setMode={state.setMode}
        jdTitle={state.jdTitle}
        setJdTitle={state.setJdTitle}
        jdContent={state.jdContent}
        setJdContent={state.setJdContent}
        industry={state.industry}
        setIndustry={state.setIndustry}
        targetRole={state.targetRole}
        setTargetRole={state.setTargetRole}
        seniority={state.seniority}
        setSeniority={state.setSeniority}
        analyzeMutation={state.analyzeMutation}
        handleStartAnalysis={state.handleStartAnalysis}
        isResumeReady={state.isResumeReady}
      />
    )}

    <CvJdHistorySection
      isHistoryLoading={state.isHistoryLoading}
      currentHistoryItems={state.currentHistoryItems}
      profile={state.profile}
      colors={colors}
      setPrimaryResumeMutation={state.setPrimaryResumeMutation}
      router={state.router}
      onLayout={(e) => {
        if (state.setHistorySectionY) {
          state.setHistorySectionY(e.nativeEvent.layout.y);
        }
      }}
    />
  </View>
));
