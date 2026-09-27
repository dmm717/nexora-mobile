import { apiClient } from './client';
import { CreateResumeAnalysisRequest, ResumeAnalysisHistoryResponse, ResumeAnalysisView } from './types';
import { generateIdempotencyKey } from '../utils/uuid';

export const resumeAnalysesApi = {
  create: async (request: CreateResumeAnalysisRequest): Promise<ResumeAnalysisView> => {
    const res = await apiClient.post<{ data?: ResumeAnalysisView } | ResumeAnalysisView>('/resume-analyses', request, {
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
      },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ResumeAnalysisView);
  },

  list: async (page: number = 1, pageSize: number = 20): Promise<ResumeAnalysisHistoryResponse> => {
    const res = await apiClient.get<{ data?: ResumeAnalysisHistoryResponse } | ResumeAnalysisHistoryResponse>('/resume-analyses', {
      params: { page, pageSize },
    });
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ResumeAnalysisHistoryResponse);
  },

  get: async (id: string): Promise<ResumeAnalysisView> => {
    const res = await apiClient.get<{ data?: ResumeAnalysisView } | ResumeAnalysisView>(`/resume-analyses/${id}`);
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as ResumeAnalysisView);
  },
};
