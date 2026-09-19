import { apiClient } from './client';

export interface InterviewSummary {
  id: string;
  role: string;
  status: string;
  updatedAt: string;
}

export interface ReportSummary {
  id: string;
  interviewId: string;
  overallScore: number;
  createdAt: string;
}

export interface DashboardResponse {
  interviews: InterviewSummary[];
  reports: ReportSummary[];
}

export const dashboardApi = {
  getDashboardSummary: async (): Promise<DashboardResponse> => {
    const res = await apiClient.get<{ data?: DashboardResponse } | DashboardResponse>('/dashboard');
    return 'data' in res.data && res.data.data ? res.data.data : (res.data as DashboardResponse);
  },
};
