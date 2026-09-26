import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { dashboardApi } from '@/api/dashboard.api';
import { growthApi } from '@/api/growth.api';
import { profileApi } from '@/api/profile.api';
import { useAuth } from '@/context/auth-context';

export function resolveNextBestAction({
  recommendation,
  targetRole,
  hasInsufficientEvidence,
}: {
  recommendation?: any;
  targetRole?: string;
  hasInsufficientEvidence: boolean;
}) {
  if (recommendation) {
    const type = (recommendation.activityType || '').toLowerCase();
    let dest = '/(app)/growth/progress-dashboard';
    let label = 'Bắt đầu bài luyện tập đề xuất';

    if (type === 'star' || type === 'star_drill') {
      dest = '/(app)/star-builder';
      label = 'Luyện phản xạ STAR';
    } else if (type === 'scenario') {
      dest = recommendation.resourceId ? `/(app)/scenarios/${recommendation.resourceId}` : '/(app)/scenarios';
      label = 'Luyện kịch bản tình huống';
    } else if (type === 'interview') {
      dest = '/(app)/interview/preflight';
      label = 'Luyện phỏng vấn AI';
    } else if (type === 'resume' || type === 'resume_improvement') {
      dest = '/(app)/cv-analysis';
      label = 'Cải thiện & Phân tích CV';
    }

    return {
      label,
      description: recommendation.reason || 'Chọn bài luyện phù hợp với điều bạn muốn cải thiện tiếp theo.',
      destination: dest,
      estimatedMinutes: recommendation.estimatedMinutes,
    };
  }

  if (hasInsufficientEvidence) {
    return {
      label: targetRole ? `Phân tích CV theo mục tiêu ${targetRole}` : 'Thiết lập mục tiêu & phân tích CV',
      description: 'Chọn vị trí bạn hướng tới và tải CV lên để hệ thống bắt đầu tích lũy bằng chứng năng lực.',
      destination: '/(app)/cv-analysis',
      estimatedMinutes: undefined,
    };
  }

  if (!targetRole) {
    return {
      label: 'Thiết lập mục tiêu nghề nghiệp',
      description: 'Chọn vị trí mục tiêu để các đề xuất bài tập tiếp theo có bối cảnh cá nhân hóa chính xác.',
      destination: '/(app)/career-goals',
      estimatedMinutes: undefined,
    };
  }

  return {
    label: 'Bắt đầu phỏng vấn AI',
    description: 'Thực hiện bài phỏng vấn đầu tiên để bắt đầu tích lũy bằng chứng năng lực thực tế.',
    destination: '/(app)/interview/preflight',
    estimatedMinutes: undefined,
  };
}

export function useHomeState() {
  const { user } = useAuth();
  const router = useRouter();

  // 1. Career Profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  // 2. Next Recommendation
  const { data: recommendation } = useQuery({
    queryKey: ['next-recommendation'],
    queryFn: growthApi.getNextRecommendation,
    enabled: !!user,
  });

  // 3. Dashboard Summary (Interviews & Reports)
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getDashboardSummary,
    enabled: !!user,
  });

  // 4. Progress Dashboard (Readiness Score & Gaps)
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['progress-dashboard'],
    queryFn: growthApi.getProgressDashboard,
    enabled: !!user,
  });

  // 5. Learning Path
  const { data: learningPathData, isLoading: isLoadingLearningPath } = useQuery({
    queryKey: ['learning-path'],
    queryFn: growthApi.getLearningPath,
    enabled: !!user,
  });

  const {
    activeGoal,
    primaryResume,
    userProfileInfo,
    yearsOfExperience,
  } = useMemo(() => {
    const rawProfileObj = profileData as any;
    const info = rawProfileObj?.profile || rawProfileObj?.identity || {};
    return {
      activeGoal: profileData?.activeCareerGoal,
      primaryResume: profileData?.primaryResume,
      userProfileInfo: info,
      yearsOfExperience: info?.yearsOfExperience ?? null,
    };
  }, [profileData]);

  const {
    readinessScore,
    evidenceCount,
    priorityGapCount,
    hasInsufficientEvidence,
  } = useMemo(() => {
    const score = progressData?.readiness?.score;
    return {
      readinessScore: score,
      evidenceCount: progressData?.readiness?.evidenceCount || 0,
      priorityGapCount: progressData?.readiness?.priorityGapCount || 0,
      hasInsufficientEvidence: score === null || score === undefined,
    };
  }, [progressData]);

  const nextAction = useMemo(() => {
    const rec = (progressData as any)?.nextRecommendedPractice || recommendation;
    return resolveNextBestAction({
      recommendation: rec,
      targetRole: activeGoal?.targetRole,
      hasInsufficientEvidence,
    });
  }, [recommendation, progressData, activeGoal?.targetRole, hasInsufficientEvidence]);

  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      interviewId: string;
      role: string;
      status: string;
      updatedAt: string;
      score: number | null;
      fullTimestamp: string;
    }> = [];

    if (dashboardData?.interviews) {
      dashboardData.interviews.slice(0, 4).forEach((iv) => {
        const matchedReport = dashboardData.reports?.find((r) => r.interviewId === iv.id);
        const timestamp = matchedReport?.createdAt || iv.updatedAt;
        
        let fullTimestamp = '';
        if (timestamp) {
          const dateObj = new Date(timestamp);
          const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          fullTimestamp = `${timeStr} · ${dateStr}`;
        }

        activities.push({
          id: `iv-${iv.id}`,
          interviewId: iv.id,
          role: iv.role,
          status: iv.status,
          updatedAt: timestamp,
          score: matchedReport?.overallScore ?? null,
          fullTimestamp,
        });
      });
    }
    return activities;
  }, [dashboardData]);

  const { learningProgress, nextMilestone } = useMemo(() => {
    return {
      learningProgress: learningPathData?.progress,
      nextMilestone: learningPathData?.milestones?.find(
        (m) => m.status === 'in_progress' || m.status === 'pending'
      ),
    };
  }, [learningPathData]);

  return {
    user,
    router,
    activeGoal,
    primaryResume,
    userProfileInfo,
    yearsOfExperience,
    readinessScore,
    evidenceCount,
    priorityGapCount,
    nextAction,
    recentActivities,
    learningProgress,
    nextMilestone,
    isLoadingProfile,
    isLoadingDashboard,
    isLoadingProgress,
    isLoadingLearningPath,
  };
}
