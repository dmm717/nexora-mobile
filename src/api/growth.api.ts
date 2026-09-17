import { apiClient } from './client';
import {
  SkillProfileResponse,
  ProgressDashboardResponse,
  ProgressResponse,
  LearningPathResponse,
  NextPracticeRecommendationResponse,
} from './types';

export const growthApi = {
  getSkillProfile: async (): Promise<SkillProfileResponse> => {
    const res = await apiClient.get<{ data?: SkillProfileResponse } | SkillProfileResponse>('/skill-profile');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as SkillProfileResponse);
  },

  getProgressDashboard: async (): Promise<ProgressDashboardResponse> => {
    const res = await apiClient.get<{ data?: ProgressDashboardResponse } | ProgressDashboardResponse>('/progress/dashboard');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ProgressDashboardResponse);
  },

  getProgressStats: async (): Promise<ProgressResponse> => {
    const res = await apiClient.get<{ data?: ProgressResponse } | ProgressResponse>('/progress');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ProgressResponse);
  },

  getLearningPath: async (): Promise<LearningPathResponse> => {
    const res = await apiClient.get<{ data?: LearningPathResponse } | LearningPathResponse>('/learning-path');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as LearningPathResponse);
  },

  generateLearningPath: async (): Promise<LearningPathResponse> => {
    const res = await apiClient.post<{ data?: LearningPathResponse } | LearningPathResponse>('/learning-path', {});
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as LearningPathResponse);
  },

  refreshLearningPath: async (): Promise<LearningPathResponse> => {
    const res = await apiClient.post<{ data?: LearningPathResponse } | LearningPathResponse>('/learning-path/refresh', {});
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as LearningPathResponse);
  },

  completeActivity: async (activityId: string): Promise<LearningPathResponse> => {
    const res = await apiClient.patch<{ data?: LearningPathResponse } | LearningPathResponse>(
      `/learning-path/activities/${activityId}`,
      { status: 'completed' }
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as LearningPathResponse);
  },

  getNextRecommendation: async (): Promise<NextPracticeRecommendationResponse | null> => {
    const res = await apiClient.get<{ data?: NextPracticeRecommendationResponse | null } | NextPracticeRecommendationResponse | null>(
      '/recommendations/next'
    );
    if (!res.data) return null;
    return 'data' in res.data ? res.data.data ?? null : (res.data as NextPracticeRecommendationResponse);
  },
};
