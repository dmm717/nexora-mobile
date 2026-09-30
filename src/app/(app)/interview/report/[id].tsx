import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, Share, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { interviewApi } from '@/api/interview.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar, useAppBottomNavBarHeight } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/interview-report.styles';

import { LoadingReportState } from '@/components/interview/report/LoadingReportState';
import { FailedReportState } from '@/components/interview/report/FailedReportState';
import { ScoreBadgeCard } from '@/components/interview/report/ScoreBadgeCard';
import { ActionPlanSection } from '@/components/interview/report/ActionPlanSection';
import { QuestionReviewCard } from '@/components/interview/report/QuestionReviewCard';
import { PracticeAgainModal } from '@/components/interview/report/PracticeAgainModal';
import { ReportContentButton } from '@/components/moderation/ReportContentButton';
import { toast } from '@/components/ui/toast/ToastProvider';

const PRACTICE_REASONS = [
  { id: 'repeat_question', label: 'Luyện lại câu hỏi này (Repeat Question)' },
  { id: 'rubric_weakness', label: 'Khắc phục điểm yếu Rubric (Rubric Weakness)' },
  { id: 'recommendation', label: 'Theo đề xuất của AI (Recommendation)' },
  { id: 'manual', label: 'Tự chọn chủ đề (Manual)' },
];

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();
  const bottomNavBarHeight = useAppBottomNavBarHeight();

  const [selectedQuestionForPractice, setSelectedQuestionForPractice] = useState<string | null>(null);
  const [practiceReason, setPracticeReason] = useState('rubric_weakness');
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  // Query interview lifecycle state
  const { data: interview, isLoading: isInterviewLoading, refetch: refetchInterview } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      if (AppState.currentState !== 'active') return false;
      const status = query.state.data?.status;
      const reportState = query.state.data?.reportState;
      const resultState = query.state.data?.resultState;
      if (status === 'failed' || reportState === 'failed' || resultState === 'failed') {
        return false;
      }
      if (
        status === 'starting' ||
        status === 'completing' ||
        status === 'evaluating' ||
        reportState === 'processing'
      ) {
        const attempt = query.state.dataUpdateCount + query.state.fetchFailureCount;
        if (attempt > 15) return false;
        return Math.min(3000 * Math.pow(1.5, attempt), 30000);
      }
      return false;
    },
  });

  // Query interview report data
  const {
    data: report,
    isLoading: isReportLoading,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ['interview-report', id],
    queryFn: () => interviewApi.getReport(id!),
    enabled: !!id,
    retry: false,
    refetchInterval: (query) => {
      if (AppState.currentState !== 'active') return false;
      const err = query.state.error as any;
      const isFailed =
        interview?.status === 'failed' ||
        interview?.reportState === 'failed' ||
        interview?.resultState === 'failed' ||
        err?.code === 'INTERVIEW_REPORT_FAILED' ||
        err?.code === 'INTERVIEW_REPORT_UNAVAILABLE';

      if (isFailed) {
        return false;
      }

      const isProcessing =
        interview?.status === 'completing' ||
        interview?.status === 'evaluating' ||
        interview?.reportState === 'processing' ||
        interview?.resultState === 'processing' ||
        err?.code === 'INTERVIEW_REPORT_PROCESSING' ||
        err?.status === 409 ||
        (err?.status === 404 && (interview?.status === 'completing' || interview?.status === 'evaluating'));

      if (isProcessing) {
        const attempt = query.state.dataUpdateCount + query.state.fetchFailureCount;
        if (attempt > 15) return false;
        return Math.min(3000 * Math.pow(1.5, attempt), 30000);
      }
      return false;
    },
  });

  const handleShareReport = async () => {
    if (!report) return;
    try {
      await Share.share({
        title: 'Báo Cáo Phỏng Vấn Nexora AI',
        message: `Báo Cáo Phỏng Vấn AI của tôi đạt ${report.overallScore ?? 0}/100 điểm trên Nexora.`,
      });
    } catch {
      // Ignore share cancellation
    }
  };

  // Practice Again mutation
  const practiceAgainMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.practiceAgain(id!, {
        questionId: selectedQuestionForPractice,
        reason: practiceReason,
        focus: 'correctness',
      });
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interview-history'] });
      queryClient.invalidateQueries({ queryKey: ['interview-report', id] });
      setShowPracticeModal(false);
      router.replace(`/(app)/interview/${data.id}` as any);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể tạo phiên luyện tập lại. Vui lòng thử lại.');
    },
  });

  // Retry Report mutation
  const retryReportMutation = useMutation({
    mutationFn: async () => {
      const res = await interviewApi.retryReport(id!);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', id] });
      queryClient.invalidateQueries({ queryKey: ['interview-report', id] });
      toast.info('Hệ thống đang tiến hành chấm điểm lại báo cáo...');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể yêu cầu chấm điểm lại.');
    },
  });

  const isFailed =
    interview?.status === 'failed' ||
    interview?.reportState === 'failed' ||
    interview?.resultState === 'failed' ||
    (reportError as any)?.code === 'INTERVIEW_REPORT_FAILED';

  const isProcessing =
    !isFailed &&
    (interview?.status === 'completing' ||
      interview?.status === 'evaluating' ||
      interview?.reportState === 'processing' ||
      interview?.resultState === 'processing' ||
      (reportError as any)?.code === 'INTERVIEW_REPORT_PROCESSING' ||
      ((reportError as any)?.status === 404 &&
        (interview?.status === 'completing' || interview?.status === 'evaluating')) ||
      (!report && (isReportLoading || isInterviewLoading)));

  if (isProcessing) {
    return (
      <LoadingReportState 
        colors={colors} 
        interview={interview} 
        onReload={() => {
          refetchInterview();
          refetchReport();
        }}
      />
    );
  }

  if (isFailed || !report) {
    return <FailedReportState colors={colors} retryReportMutation={retryReportMutation} />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <AppScreenHeader
          title="Báo Cáo Phỏng Vấn AI"
          fallbackRoute="/(tabs)/interview"
          rightElement={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ReportContentButton 
                contentType="interview_report" 
                contentId={report.id || id} 
              />
              <TouchableOpacity onPress={() => router.replace('/(tabs)/home' as any)} style={{ padding: 6 }}>
                <Ionicons name="home-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShareReport} style={{ padding: 6 }}>
                <Ionicons name="share-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavBarHeight + Spacing.four }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Score Badge Card */}
          <ScoreBadgeCard report={report} colors={colors} />

          {/* Action Plan Section */}
          <ActionPlanSection report={report} colors={colors} />

          {/* Detailed Question Reviews */}
          {report.questionReviews && report.questionReviews.length > 0 && (
            <View style={{ gap: Spacing.four }}>
              <ThemedText type="subtitle" style={styles.sectionHeader}>Chi Tiết Đánh Giá Theo Câu Hỏi</ThemedText>
              
              {report.questionReviews.map((review: any) => (
                <QuestionReviewCard
                  key={review.questionId || `q-${review.sequence}-${review.topic}`}
                  review={review}
                  colors={colors}
                  onPracticeAgain={(qId) => {
                    setSelectedQuestionForPractice(qId);
                    setShowPracticeModal(true);
                  }}
                />
              ))}
            </View>
          )}

          {/* Global Practice Again Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setSelectedQuestionForPractice(null);
              setShowPracticeModal(true);
            }}
          >
            <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={styles.primaryButtonText}>Tạo Phiên Luyện Tập Lại Mô Phỏng</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Practice Again Modal */}
        <PracticeAgainModal
          visible={showPracticeModal}
          colors={colors}
          practiceReason={practiceReason}
          setPracticeReason={setPracticeReason}
          practiceAgainMutation={practiceAgainMutation}
          onClose={() => setShowPracticeModal(false)}
          PRACTICE_REASONS={PRACTICE_REASONS}
        />

        {/* Global Bottom Navigation Bar */}
        <AppBottomNavBar activeTab="interview" />
      </SafeAreaView>
    </ThemedView>
  );
}
