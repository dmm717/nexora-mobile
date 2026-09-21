import { useCallback, useMemo, useState } from 'react';
import { Alert, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useRouter } from 'expo-router';

import { jobDescriptionsApi } from '@/api/job-descriptions.api';
import { profileApi } from '@/api/profile.api';
import { resumeAnalysesApi } from '@/api/resume-analyses.api';
import { resumesApi } from '@/api/resumes.api';
import { tokenStorage } from '@/services/storage';

type UploadResumeParams = {
  useCurrentProfile: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
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

export const getFileIconProps = (fileName?: string) => {
  if (!fileName) return { color: '#6B7280', label: 'FILE' };
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { color: '#EF4444', label: 'PDF' };
  if (ext === 'doc' || ext === 'docx') return { color: '#2563EB', label: 'DOC' };
  if (ext === 'txt') return { color: '#4B5563', label: 'TXT' };
  return { color: '#6B7280', label: 'FILE' };
};

export function useCvJdTabState() {
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
