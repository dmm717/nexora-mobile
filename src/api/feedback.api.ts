import { apiClient } from './client';
import { FeedbackRequest, FeedbackResponse, PublicFeedbackPageResponse } from './types/feedback.types';

export const feedbackApi = {
  getMyFeedback: async (): Promise<FeedbackResponse | null> => {
    const res = await apiClient.get<{ data?: FeedbackResponse | null } | FeedbackResponse | null>('/me/feedback');
    if (!res.data) return null;
    return 'data' in res.data ? (res.data.data ?? null) : (res.data as FeedbackResponse);
  },

  upsertMyFeedback: async (request: FeedbackRequest): Promise<FeedbackResponse> => {
    const res = await apiClient.put<{ data?: FeedbackResponse } | FeedbackResponse>('/me/feedback', request);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as FeedbackResponse);
  },

  deleteMyFeedback: async (): Promise<void> => {
    await apiClient.delete('/me/feedback');
  },

  getPublicFeedback: async (limit = 20): Promise<PublicFeedbackPageResponse> => {
    const res = await apiClient.get<{ data?: PublicFeedbackPageResponse } | PublicFeedbackPageResponse>(
      `/feedback/public?limit=${limit}`
    );
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as PublicFeedbackPageResponse);
  },
};
