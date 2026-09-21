import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState, memo } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { jobDescriptionsApi } from '@/api/job-descriptions.api';
import { profileApi } from '@/api/profile.api';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';
import { resumesApi } from '@/api/resumes.api';
import {
  AnalysisTypeSelector,
  FieldBenchmarkCard,
  JobDescriptionCard,
  ResumeUploadCard
} from '@/components/cv-analysis/CVAnalysisForms';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { tokenStorage } from '@/services/storage';

// ---------- Module-level pure helpers (React Compiler can fully optimize these) ----------

type UploadResumeParams = {
  useCurrentProfile: boolean;
  queryClient: ReturnType<typeof import('@tanstack/react-query').useQueryClient>;
  setSelectedResumeId: (id: string) => void;
  setCurrentFileName: (name: string) => void;
};

async function uploadResumeFile(params: UploadResumeParams): Promise<void> {
  const { useCurrentProfile, queryClient, setSelectedResumeId, setCurrentFileName } = params;

  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    copyToCacheDirectory: true,
  });

  if (res.canceled || !res.assets || res.assets.length === 0) return;
  const file = res.assets[0];

  if (file.size && file.size > 10 * 1024 * 1024) {
    Alert.alert('Lỗi', 'Dung lượng file vượt quá 10MB.');
    return;
  }

  const fileUri = file.uri;
  const fileName = file.name || 'resume.pdf';
  const contentType = file.mimeType || 'application/pdf';

  let fileData: ArrayBuffer | Blob;
  let fileSize = file.size || 0;

  if (typeof window !== 'undefined' && 'file' in file && file.file) {
    fileData = file.file as File;
    fileSize = (file.file as File).size;
  } else {
    fileData = await fetch(fileUri).then((r) => {
      if (!r.ok) throw new Error(`Không thể đọc file từ thiết bị (status ${r.status})`);
      return r.blob();
    });
    fileSize = (fileData as Blob).size || file.size || 0;
  }

  if (!fileSize) {
    Alert.alert('Lỗi', 'Không thể xác định kích thước file.');
    return;
  }

  const presignData = await resumesApi.presign({ fileName, contentType, size: fileSize });
  await resumesApi.uploadRawBytes(presignData.uploadUrl, fileData, contentType);
  const finalizedResume = await resumesApi.finalize({ uploadToken: presignData.token });

  setSelectedResumeId(finalizedResume.id);
  setCurrentFileName(finalizedResume.fileName);

  if (useCurrentProfile) {
    await profileApi.setPrimaryResume({ resumeId: finalizedResume.id });
    queryClient.invalidateQueries({ queryKey: ['career-profile'] });
  }

  queryClient.invalidateQueries({ queryKey: ['resumes-list'] });
  Alert.alert('Thành công', 'Đã tải lên CV thành công.');
}

// --------------------------------------------------------------------------------------------

const getFileIconProps = (fileName?: string) => {
  if (!fileName) return { color: '#6B7280', label: 'FILE' };
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { color: '#EF4444', label: 'PDF' };
  if (ext === 'doc' || ext === 'docx') return { color: '#2563EB', label: 'DOC' };
  if (ext === 'txt') return { color: '#4B5563', label: 'TXT' };
  return { color: '#6B7280', label: 'FILE' };
};

function useCvJdTabState() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [useCurrentProfile, setUseCurrentProfile] = useState(true);
  const [mode, setMode] = useState<'standard' | 'job_targeted' | 'field_benchmark'>('standard');
  const [jdTitle, setJdTitle] = useState('');
  const [jdContent, setJdContent] = useState('');

  const [industry, setIndustry] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [seniority, setSeniority] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 6;
  const [showFloatingNav, setShowFloatingNav] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > 400;
    setShowFloatingNav((prev) => (prev !== shouldShow ? shouldShow : prev));
  }, []);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['resume-analysis-history'],
    queryFn: () => resumeAnalysesApi.list(1, 20),
  });

  const { data: userResumes } = useQuery({
    queryKey: ['resumes-list'],
    queryFn: () => resumesApi.list(),
  });

  const latestCompletedAnalysis = useMemo(() => {
    if (!historyData?.items) return null;
    return historyData.items.find((item: any) => item.status === 'completed');
  }, [historyData]);

  const currentHistoryItems = useMemo(() => {
    if (!historyData?.items) return [];
    const startIndex = (historyPage - 1) * itemsPerPage;
    return historyData.items.slice(startIndex, startIndex + itemsPerPage);
  }, [historyData, historyPage]);

  const totalHistoryPages = Math.ceil((historyData?.items?.length || 0) / itemsPerPage);
  const hasNextPage = historyPage < totalHistoryPages;

  useFocusEffect(
    useCallback(() => {
      const checkPopupStatus = async () => {
        if (!isHistoryLoading && latestCompletedAnalysis) {
          const hidePopup = await tokenStorage.getHidePopup();
          if (hidePopup !== 'true') {
            setShowPopup(true);
          }
        }
      };
      checkPopupStatus();
    }, [isHistoryLoading, latestCompletedAnalysis])
  );

  const handleClosePopup = async () => {
    if (doNotShowAgain) {
      await tokenStorage.setHidePopup('true');
    }
    setShowPopup(false);
  };

  const setPrimaryResumeMutation = useMutation({
    mutationFn: (resumeId: string) => profileApi.setPrimaryResume({ resumeId }),
    onSuccess: (_, resumeId) => {
      const selectedResume = userResumes?.find(r => r.id === resumeId);
      if (selectedResume) {
        queryClient.setQueryData(['career-profile'], (old: any) => {
          if (!old) return old;
          return { ...old, primaryResume: selectedResume };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể thiết lập CV chính.');
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.primaryResume?.id) throw new Error('No primary resume found');

      let finalResumeId = profile.primaryResume.id;
      let finalMode = mode;
      let finalCareerGoalId = undefined;
      let finalIndustry = undefined;
      let finalTargetRole = undefined;
      let finalSeniority = undefined;
      let createdJdId = undefined;

      if (useCurrentProfile) {
        if (mode === 'job_targeted') {
          if (!jdTitle.trim() || !jdContent.trim()) {
            throw new Error('Vui lòng nhập tiêu đề và nội dung Mô Tả Công Việc (JD)');
          }
          const createdJd = await jobDescriptionsApi.create({
            title: jdTitle.trim(),
            content: jdContent.trim(),
          });
          createdJdId = createdJd.id;
        } else {
          finalMode = 'standard';
          finalCareerGoalId = profile.activeCareerGoal?.id;
          if (!finalCareerGoalId) {
            throw new Error('Vui lòng thiết lập Mục Tiêu Nghề Nghiệp trong hồ sơ trước khi phân tích mặc định.');
          }
        }
      } else {
        if (!selectedResumeId) {
          throw new Error('Vui lòng tải lên hoặc chọn một CV.');
        }
        finalResumeId = selectedResumeId;

        if (mode === 'job_targeted') {
          if (!jdTitle.trim() || !jdContent.trim()) {
            throw new Error('Vui lòng nhập tiêu đề và nội dung Mô Tả Công Việc (JD)');
          }
          const createdJd = await jobDescriptionsApi.create({
            title: jdTitle.trim(),
            content: jdContent.trim(),
          });
          createdJdId = createdJd.id;
        } else if (mode === 'field_benchmark') {
          if (!industry.trim() || !targetRole.trim() || !seniority.trim()) {
            throw new Error('Vui lòng nhập đủ Ngành nghề, Vị trí và Cấp bậc kinh nghiệm.');
          }
          finalIndustry = industry.trim();
          finalTargetRole = targetRole.trim();
          finalSeniority = seniority.trim();
        } else {
          finalMode = 'standard';
          finalCareerGoalId = profile.activeCareerGoal?.id;
        }
      }

      const res = await resumeAnalysesApi.create({
        resumeId: finalResumeId,
        mode: finalMode,
        jobDescriptionId: createdJdId,
        careerGoalId: finalCareerGoalId,
        industry: finalIndustry,
        targetRole: finalTargetRole,
        seniority: finalSeniority,
      });
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resume-analyses-history'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      router.push(`/(app)/cv-analysis/${data.id}` as any);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể bắt đầu phân tích CV. Vui lòng thử lại.');
    }
  });

  const handleStartAnalysis = useCallback(() => {
    if (useCurrentProfile && !profile?.primaryResume) {
      Alert.alert('Chưa có CV chính', 'Vui lòng tải lên và chọn một CV làm Primary CV trước khi bắt đầu phân tích.');
      return;
    }
    analyzeMutation.mutate();
  }, [profile, useCurrentProfile, analyzeMutation]);

  const uploadMutation = useMutation({
    mutationFn: () =>
      uploadResumeFile({
        useCurrentProfile,
        queryClient,
        setSelectedResumeId,
        setCurrentFileName,
      }),
    onError: (error: any) => {
      Alert.alert('Lỗi tải lên', error.message || 'Đã xảy ra lỗi khi upload CV.');
    },
  });

  const handleUploadResume = useCallback(() => uploadMutation.mutate(), [uploadMutation]);

  return {
    router,
    useCurrentProfile,
    setUseCurrentProfile,
    mode,
    setMode,
    jdTitle,
    setJdTitle,
    jdContent,
    setJdContent,
    isUploading: uploadMutation.isPending,
    industry,
    setIndustry,
    targetRole,
    setTargetRole,
    seniority,
    setSeniority,
    selectedResumeId,
    setSelectedResumeId,
    currentFileName,
    setCurrentFileName,
    showPopup,
    setShowPopup,
    doNotShowAgain,
    setDoNotShowAgain,
    historyPage,
    setHistoryPage,
    showFloatingNav,
    handleScroll,
    profile,
    isProfileLoading,
    historyData,
    isHistoryLoading,
    userResumes,
    latestCompletedAnalysis,
    currentHistoryItems,
    totalHistoryPages,
    hasNextPage,
    handleClosePopup,
    setPrimaryResumeMutation,
    analyzeMutation,
    handleStartAnalysis,
    handleUploadResume,
  };
}

const CvJdHistorySection = React.memo(({
  isHistoryLoading,
  currentHistoryItems,
  profile,
  colors,
  setPrimaryResumeMutation,
  router,
}: {
  isHistoryLoading: boolean;
  currentHistoryItems: any[];
  profile: any;
  colors: any;
  setPrimaryResumeMutation: any;
  router: any;
}) => (
  <View style={styles.historySection}>
    <View style={styles.historyHeader}>
      <Ionicons name="time" size={20} color={colors.text} />
      <ThemedText style={styles.historyTitle}>Lịch sử phân tích</ThemedText>
    </View>

    {isHistoryLoading ? (
      <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
    ) : currentHistoryItems.length ? (
      <View style={{ gap: 12 }}>
        {currentHistoryItems.map((item: any) => (
          <AnalysisHistoryItemCard
            key={item.id}
            item={item}
            profile={profile}
            colors={colors}
            onSetPrimary={(resumeId) => setPrimaryResumeMutation.mutate(resumeId)}
            isSettingPrimary={setPrimaryResumeMutation.isPending}
            onViewResult={() => router.push(`/(app)/cv-analysis/${item.id}` as any)}
          />
        ))}
      </View>
    ) : (
      <View style={{ alignItems: 'center', marginTop: 24, padding: 24, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16 }}>
        <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12, opacity: 0.5 }} />
        <ThemedText style={[styles.emptyHistory, { color: colors.textSecondary }]}>
          Bạn chưa thực hiện bài phân tích nào. Hãy bắt đầu ngay để khám phá tiềm năng hồ sơ của bạn.
        </ThemedText>
      </View>
    )}
  </View>
));

const CvJdFloatingPagination = React.memo(({
  showFloatingNav,
  totalHistoryPages,
  historyPage,
  hasNextPage,
  colorScheme,
  colors,
  onPrev,
  onNext,
}: {
  showFloatingNav: boolean;
  totalHistoryPages: number;
  historyPage: number;
  hasNextPage: boolean;
  colorScheme: string;
  colors: any;
  onPrev: () => void;
  onNext: () => void;
}) => {
  if (!showFloatingNav || totalHistoryPages <= 1) return null;
  return (
    <View style={styles.floatingNavContainer}>
      <View style={[styles.inlineNavContainer, {
        backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#fff',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }]}>
        <TouchableScale
          style={[styles.miniPageBtn, historyPage === 1 ? styles.disabledButton : null]}
          disabled={historyPage === 1}
          onPress={onPrev}
        >
          <Ionicons name="chevron-back" size={16} color={historyPage === 1 ? colors.textSecondary : colors.primary} />
          <ThemedText style={[styles.miniPageBtnText, { color: historyPage === 1 ? colors.textSecondary : colors.text }]}>
            Trước
          </ThemedText>
        </TouchableScale>

        <ThemedText style={[styles.inlinePageIndicator, { color: colors.text, marginHorizontal: 16 }]}>
          Trang {historyPage}/{totalHistoryPages}
        </ThemedText>

        <TouchableScale
          style={[styles.miniPageBtn, (!hasNextPage) ? styles.disabledButton : null]}
          disabled={!hasNextPage}
          onPress={onNext}
        >
          <ThemedText style={[styles.miniPageBtnText, { color: (!hasNextPage) ? colors.textSecondary : colors.text }]}>
            Sau
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={(!hasNextPage) ? colors.textSecondary : colors.primary} />
        </TouchableScale>
      </View>
    </View>
  );
});

const CurrentProfileSection = React.memo(({
  profile, colorScheme, colors, mode, setMode, jdTitle, setJdTitle, jdContent, setJdContent, analyzeMutation, handleStartAnalysis,
}: any) => (
  <View style={{ gap: Spacing.four }}>
    <PrimaryCvSpotlightCard profile={profile} colorScheme={colorScheme} colors={colors} />
    <AnalysisTypeSelector mode={mode} setMode={setMode} colors={colors} colorScheme={colorScheme} defaultTargetRole={profile?.activeCareerGoal?.targetRole} isCustomProfile={false} />
    {mode === 'job_targeted' && (
      <JobDescriptionCard jdTitle={jdTitle} setJdTitle={setJdTitle} jdContent={jdContent} setJdContent={setJdContent} colors={colors} />
    )}
    <TouchableScale
      style={[styles.primaryButtonPremium, (analyzeMutation.isPending || !profile?.primaryResume) && styles.disabledButtonPremium]}
      onPress={handleStartAnalysis}
      disabled={analyzeMutation.isPending || !profile?.primaryResume}
    >
      {analyzeMutation.isPending ? <ActivityIndicator color="#fff" /> : (
        <>
          <ThemedText style={styles.primaryButtonTextPremium}>Phân tích độ phù hợp</ThemedText>
          <View style={styles.buttonIconWrapPremium}><Ionicons name="rocket" size={16} color="#FFF" /></View>
        </>
      )}
    </TouchableScale>
  </View>
));

const CustomProfileSection = React.memo(({
  isUploading, colors, colorScheme, handleUploadResume, userResumes, selectedResumeId, setSelectedResumeId, currentFileName, setCurrentFileName, mode, setMode, jdTitle, setJdTitle, jdContent, setJdContent, industry, setIndustry, targetRole, setTargetRole, seniority, setSeniority, analyzeMutation, handleStartAnalysis,
}: any) => (
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
      style={[styles.primaryButtonPremium, (analyzeMutation.isPending || !selectedResumeId) && styles.disabledButtonPremium]}
      onPress={handleStartAnalysis}
      disabled={analyzeMutation.isPending || !selectedResumeId}
    >
      {analyzeMutation.isPending ? <ActivityIndicator color="#fff" /> : (
        <>
          <ThemedText style={styles.primaryButtonTextPremium}>Phân tích độ phù hợp</ThemedText>
          <View style={styles.buttonIconWrapPremium}><Ionicons name="rocket" size={16} color="#FFF" /></View>
        </>
      )}
    </TouchableScale>
  </View>
));

const ToggleItem = React.memo(({
  active,
  title,
  subtitle,
  onPress,
  colorScheme,
  colors,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
  colorScheme: string;
  colors: any;
}) => {
  const activeBg = colorScheme === 'dark' ? '#374151' : '#FFFFFF';
  const activeColor = colorScheme === 'dark' ? colors.primaryLight : colors.primary;
  const textColor = active ? activeColor : colors.text;
  const subColor = active ? activeColor : colors.textSecondary;

  return (
    <TouchableScale
      style={[styles.toggleBtnPremium, active && [styles.toggleBtnActivePremium, { backgroundColor: activeBg }]]}
      onPress={onPress}
    >
      <ThemedText style={[styles.toggleBtnTextPremium, { color: textColor }]}>{title}</ThemedText>
      <ThemedText style={{ fontSize: 10, color: subColor, marginTop: 2 }}>{subtitle}</ThemedText>
    </TouchableScale>
  );
});

const DataSourceToggleBar = React.memo(({
  useCurrentProfile,
  setUseCurrentProfile,
  mode,
  setMode,
  colorScheme,
  colors,
}: {
  useCurrentProfile: boolean;
  setUseCurrentProfile: (v: boolean) => void;
  mode: string;
  setMode: (m: any) => void;
  colorScheme: string;
  colors: any;
}) => {
  const onSelectCurrent = () => {
    setUseCurrentProfile(true);
    if (mode === 'field_benchmark') setMode('standard');
  };

  const onSelectCustom = () => {
    setUseCurrentProfile(false);
    if (mode === 'standard') setMode('field_benchmark');
  };

  const wrapBg = colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  return (
    <View style={styles.dataSourceContainerPremium}>
      <ThemedText style={[styles.dataSourceTitlePremium, { color: colors.textSecondary }]}>NGUỒN DỮ LIỆU PHÂN TÍCH</ThemedText>
      <View style={[styles.toggleWrapPremium, { backgroundColor: wrapBg }]}>
        <ToggleItem
          active={useCurrentProfile}
          title="Dùng hồ sơ hiện tại"
          subtitle="CV chính + mục tiêu nghề nghiệp"
          onPress={onSelectCurrent}
          colorScheme={colorScheme}
          colors={colors}
        />
        <ToggleItem
          active={!useCurrentProfile}
          title="Tùy chỉnh lần phân tích"
          subtitle="CV+mục tiêu riêng cho lần này"
          onPress={onSelectCustom}
          colorScheme={colorScheme}
          colors={colors}
        />
      </View>
    </View>
  );
});

const CvJdFormContent = React.memo(({
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
      />
    )}

    <CvJdHistorySection
      isHistoryLoading={state.isHistoryLoading}
      currentHistoryItems={state.currentHistoryItems}
      profile={state.profile}
      colors={colors}
      setPrimaryResumeMutation={state.setPrimaryResumeMutation}
      router={state.router}
    />
  </View>
));

export default function CvJdTabScreen() {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const state = useCvJdTabState();
  const {
    router,
    useCurrentProfile, setUseCurrentProfile,
    mode, setMode,
    jdTitle, setJdTitle,
    jdContent, setJdContent,
    isUploading,
    industry, setIndustry,
    targetRole, setTargetRole,
    seniority, setSeniority,
    selectedResumeId, setSelectedResumeId,
    currentFileName, setCurrentFileName,
    showPopup,
    doNotShowAgain, setDoNotShowAgain,
    historyPage, setHistoryPage,
    showFloatingNav, handleScroll,
    profile, isProfileLoading,
    isHistoryLoading,
    userResumes,
    latestCompletedAnalysis,
    currentHistoryItems,
    totalHistoryPages, hasNextPage,
    handleClosePopup,
    setPrimaryResumeMutation,
    analyzeMutation,
    handleStartAnalysis,
    handleUploadResume,
  } = state;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <ThemedText type="title" style={styles.title}>Phân tích CV</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {isProfileLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : (
            <CvJdFormContent
              state={state}
              colorScheme={colorScheme}
              colors={colors}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <CvJdFloatingPagination
        showFloatingNav={showFloatingNav}
        totalHistoryPages={totalHistoryPages}
        historyPage={historyPage}
        hasNextPage={hasNextPage}
        colorScheme={colorScheme}
        colors={colors}
        onPrev={() => setHistoryPage((p) => Math.max(1, p - 1))}
        onNext={() => setHistoryPage((p) => p + 1)}
      />

      <LatestAnalysisModal
        visible={showPopup}
        latestCompletedAnalysis={latestCompletedAnalysis}
        colors={colors}
        colorScheme={colorScheme}
        doNotShowAgain={doNotShowAgain}
        onClose={handleClosePopup}
        onViewResult={(analysisId) => {
          handleClosePopup();
          router.push(`/(app)/cv-analysis/${analysisId}` as any);
        }}
        onToggleDoNotShow={async () => {
          setDoNotShowAgain(true);
          await tokenStorage.setHidePopup('true');
          handleClosePopup();
        }}
      />
    </ThemedView>
  );
}

const PrimaryCvSpotlightCard = React.memo(({
  profile,
  colorScheme,
  colors,
}: {
  profile: any;
  colorScheme: string;
  colors: any;
}) => {
  const fileProps = getFileIconProps(profile?.primaryResume?.fileName);
  return (
    <View style={[styles.contextCardPremium, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: 'rgba(0,0,0,0.05)' }]}>
      <ThemedText style={[styles.dataSourceTitlePremium, { color: colors.textSecondary, marginBottom: 12 }]}>BỐI CẢNH ĐÃ SẴN SÀNG</ThemedText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{
          width: 68,
          height: 90,
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
          overflow: 'visible'
        }}>
          <View style={{ height: 16, backgroundColor: fileProps.color, borderTopLeftRadius: 5, borderTopRightRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
            <ThemedText style={{ color: '#FFF', fontSize: 7, fontFamily: Typography.fontFamily.bold, letterSpacing: 0.5 }}>{fileProps.label}</ThemedText>
          </View>
          <View style={{ padding: 8, gap: 5 }}>
            <View style={{ height: 3, width: '60%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : '#E5E7EB', borderRadius: 2 }} />
            <View style={{ height: 3, width: '90%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '80%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '85%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
            <View style={{ height: 3, width: '40%', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6', borderRadius: 2 }} />
          </View>

          <View style={{ position: 'absolute', bottom: -6, right: -6, backgroundColor: '#10B981', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF', boxShadow: '0px 2px 4px rgba(16, 185, 129, 0.3)' }}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        </View>

        <View style={{ flex: 1, gap: 10 }}>
          <View>
            <ThemedText style={styles.contextItemLabelPremium}>CV chính:</ThemedText>
            <ThemedText style={styles.contextItemValuePremium} numberOfLines={1}>{profile?.primaryResume?.fileName || 'Chưa thiết lập'}</ThemedText>
          </View>

          <View style={[styles.contextDivider, { marginVertical: 0, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

          <View>
            <ThemedText style={styles.contextItemLabelPremium}>Mục tiêu nghề nghiệp:</ThemedText>
            <ThemedText style={styles.contextItemValuePremium} numberOfLines={1}>
              {profile?.activeCareerGoal?.targetRole || 'Chưa thiết lập'}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
});

const AnalysisHistoryItemCard = React.memo(({
  item,
  profile,
  colors,
  onSetPrimary,
  isSettingPrimary,
  onViewResult,
}: {
  item: any;
  profile: any;
  colors: any;
  onSetPrimary: (resumeId: string) => void;
  isSettingPrimary: boolean;
  onViewResult: () => void;
}) => {
  const isTargeted = item.mode === 'job_targeted';
  const isPrimary = profile?.primaryResume?.id === item.resumeId;
  const dateObj = new Date(item.createdAt);
  const dateStr = dateObj.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <View style={[styles.historyCard, { backgroundColor: '#fff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <View style={styles.historyCardTop}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Badge variant={isTargeted ? 'primary' : 'secondary'} size="sm" style={isTargeted ? { backgroundColor: '#F3E8FF' } : {}}>
            <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: isTargeted ? '#7E22CE' : colors.text }}>{isTargeted ? 'Theo JD mục tiêu' : 'Chuẩn thị trường'}</ThemedText>
          </Badge>
          {isPrimary && (
            <Badge variant="warning" size="sm" style={{ backgroundColor: '#FEF3C7' }}>
              <Ionicons name="star" size={10} color="#D97706" />
              <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#D97706', marginLeft: 4 }}>CV chính</ThemedText>
            </Badge>
          )}
        </View>
        <Badge variant="success" size="sm" style={{ backgroundColor: '#DCFCE7' }}>
          <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#15803D' }}>Hoàn thành</ThemedText>
        </Badge>
      </View>

      <View style={styles.nestedContextBox}>
        <View style={styles.nestedContextTop}>
          <ThemedText style={styles.nestedContextLabel}>Bối cảnh đối chiếu:</ThemedText>
          <ThemedText style={styles.nestedContextDate}>{dateStr}</ThemedText>
        </View>

        <ThemedText style={styles.historyContextTitle} numberOfLines={2}>
          {isTargeted ? 'Phân tích CV theo JD' : (item.context?.targetRole || 'Định hướng chuẩn ngành')}
          {item.context?.seniority ? ` (${item.context.seniority})` : ''}
        </ThemedText>

        {item.context?.industry && (
          <ThemedText style={styles.nestedContextIndustry}>
            Ngành: <ThemedText style={{ fontFamily: Typography.fontFamily.semibold, color: '#111827' }}>{item.context.industry}</ThemedText>
          </ThemedText>
        )}
      </View>

      <View style={styles.historyActions}>
        <View style={{ flex: 1 }}>
          {!isPrimary && item.resumeId ? (
            <TouchableOpacity
              onPress={() => onSetPrimary(item.resumeId)}
              style={styles.btnSecondary}
              disabled={isSettingPrimary}
            >
              {isSettingPrimary ? (
                <ActivityIndicator size="small" color="#111827" />
              ) : (
                <ThemedText style={styles.btnSecondaryText}>Đặt làm CV chính</ThemedText>
              )}
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <TouchableOpacity
            onPress={onViewResult}
            style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="eye" size={16} color="#fff" />
            <ThemedText style={styles.btnPrimaryText}>Xem kết quả</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const LatestAnalysisModal = React.memo(({
  visible,
  latestCompletedAnalysis,
  colors,
  colorScheme,
  doNotShowAgain,
  onClose,
  onViewResult,
  onToggleDoNotShow,
}: {
  visible: boolean;
  latestCompletedAnalysis: any;
  colors: any;
  colorScheme: string;
  doNotShowAgain: boolean;
  onClose: () => void;
  onViewResult: (id: string) => void;
  onToggleDoNotShow: () => void;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlayPremium}>
      {latestCompletedAnalysis && (
        <SurfaceCard style={[styles.modalCardPremium, { backgroundColor: colors.background, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={{ padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="checkmark-done" size={20} color="#10B981" />
              </View>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ThemedText style={{ fontSize: 11, fontFamily: Typography.fontFamily.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              KẾT QUẢ ĐÃ SẴN SÀNG
            </ThemedText>
            <ThemedText style={{ fontSize: 24, fontFamily: Typography.fontFamily.bold, color: colors.text }}>
              Bản phân tích gần nhất
            </ThemedText>
          </View>

          <View style={{ padding: 24, gap: 16 }}>
            <View style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Chế độ</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text }}>
                  {latestCompletedAnalysis.mode === 'job_targeted' ? 'Đánh giá theo JD' : 'Tiêu chuẩn ngành'}
                </ThemedText>
              </View>
              <View style={{ height: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Mục tiêu</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text, maxWidth: 180 }} numberOfLines={1}>
                  {latestCompletedAnalysis.mode === 'job_targeted' ? 'Mô tả công việc (JD)' : (latestCompletedAnalysis.context?.targetRole || 'Mặc định')}
                </ThemedText>
              </View>
              <View style={{ height: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Thời gian</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text }}>
                  {new Date(latestCompletedAnalysis.createdAt).toLocaleDateString('vi-VN')}
                </ThemedText>
              </View>
            </View>

            <TouchableScale
              onPress={() => onViewResult(latestCompletedAnalysis.id)}
              style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 }}
            >
              <ThemedText style={{ color: '#fff', fontSize: 15, fontFamily: Typography.fontFamily.semibold }}>Xem ngay kết quả</ThemedText>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableScale>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
              onPress={onToggleDoNotShow}
              activeOpacity={0.7}
            >
              <View style={[{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' }, doNotShowAgain && { backgroundColor: colors.textSecondary, borderColor: colors.textSecondary }]}>
                {doNotShowAgain && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>
                Không hiện lại hộp thoại này
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SurfaceCard>
      )}
    </View>
  </Modal>
));

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.six, paddingBottom: Spacing.six * 2 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 0,
    borderWidth: 1,
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  modalContent: {
    padding: Spacing.six,
    alignItems: 'center',
    gap: 16,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitleContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroSubTitle: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
  },
  modalMainTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  heroButtonText: {
    color: '#fff',
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  checkboxLabel: {
    fontSize: 12,
  },

  // DATA SOURCE TOGGLE
  dataSourceContainer: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  dataSourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dataSourceTitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
  },
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  toggleBtnText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
  },
  toggleBtnSubText: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },

  // CONTEXT CARD (Current Profile)
  contextCard: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  contextGrid: {
    gap: 8,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  contextItemIcon: {
    opacity: 0.8,
  },
  contextItemLabel: {
    fontSize: 11,
    opacity: 0.7,
  },
  contextItemValue: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },

  // COMMON BUTTONS
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontFamily: Typography.fontFamily.bold, fontSize: 15 },

  // Upload Card (Custom Setup)
  uploadCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.four,
    borderWidth: 1,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  uploadTitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
  },
  uploadBody: { gap: 16 },
  currentCvBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cvIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvNameText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
  },
  noCvText: { fontSize: 14, fontStyle: 'italic' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
  },
  uploadButtonText: { fontSize: 14, fontFamily: Typography.fontFamily.bold },

  // History Section
  historySection: { gap: 16, marginTop: 12, paddingBottom: 24 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  historyTitle: { fontSize: 17, fontFamily: Typography.fontFamily.bold },
  historyCard: { borderRadius: 16, padding: 16, gap: 16, marginHorizontal: 2 },
  historyCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nestedContextBox: { gap: 6 },
  nestedContextTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  nestedContextLabel: { fontSize: 12, fontFamily: Typography.fontFamily.medium, color: '#6B7280' },
  nestedContextDate: { fontSize: 12, fontFamily: Typography.fontFamily.medium, color: '#6B7280' },
  historyContextTitle: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: '#111827', lineHeight: 24 },
  nestedContextIndustry: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  btnSecondary: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnPrimaryText: { color: '#fff', fontSize: 13, fontFamily: Typography.fontFamily.bold },
  emptyHistory: { fontSize: 14, textAlign: 'center' },

  // PREMIUM STYLES
  dataSourceContainerPremium: {
    gap: 16,
  },
  dataSourceTitlePremium: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1,
    marginLeft: 4,
  },
  toggleWrapPremium: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
  },
  toggleBtnPremium: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActivePremium: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
  },
  toggleBtnTextPremium: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semibold,
  },
  contextCardPremium: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  contextItemPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contextIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextItemLabelPremium: {
    fontSize: 12,
    color: '#6B7280',
  },
  contextItemValuePremium: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
  },
  contextDivider: {
    height: 1,
    marginVertical: 16,
  },
  primaryButtonPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 32,
    backgroundColor: '#3730A3',
    boxShadow: '0px 8px 16px rgba(55, 48, 163, 0.3)',
    gap: 12,
  },
  primaryButtonTextPremium: {
    color: '#fff',
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
  },
  buttonIconWrapPremium: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButtonPremium: {
    opacity: 0.5,
    boxShadow: 'none',
  },

  // PREMIUM MODAL STYLES
  modalOverlayPremium: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCardPremium: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 0,
    borderWidth: 1,
    boxShadow: '0px 24px 32px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  closeButtonPremium: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContentPremium: {
    padding: 32,
    alignItems: 'center',
    gap: 20,
  },
  heroIconWrapPremium: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleContainerPremium: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroSubTitlePremium: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontFamily: Typography.fontFamily.bold,
  },
  modalMainTitlePremium: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
    lineHeight: 30,
  },
  modalDescPremium: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  modalPrimaryButtonPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 100, // pill shape
    gap: 10,
    width: '100%',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
  },
  modalPrimaryButtonTextPremium: {
    color: '#fff',
    fontFamily: Typography.fontFamily.semibold,
    fontSize: 15,
  },
  checkboxContainerPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabelPremium: {
    fontSize: 13,
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  inlineNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
  },
  miniPageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  miniPageBtnText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
  },
  inlinePageIndicator: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
  },
});


