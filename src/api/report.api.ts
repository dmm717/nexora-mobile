import { apiClient as api } from './client';

export type ReportContentType = 
  | 'interview_question' 
  | 'interview_report' 
  | 'coaching_note'
  | 'cv_analysis' 
  | 'learning_path' 
  | 'skill_profile'
  | 'scenario_result'
  | 'star_suggestion';

export type ReportReasonCode = 
  | 'offensive' 
  | 'inaccurate' 
  | 'irrelevant'
  | 'privacy_violation' 
  | 'discriminatory' 
  | 'other';

export interface ReportContentPayload {
  contentType: ReportContentType;
  contentId: string;
  reasonCode: ReportReasonCode;
  description?: string;
  contentSnapshot?: string;
}

export const reportApi = {
  submitReport: async (payload: ReportContentPayload) => {
    const { data } = await api.post('/content-reports', payload);
    return data;
  },
};