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

export type CanonicalReportContentType =
  | 'interview_question' | 'interview_answer_evaluation' | 'interview_report'
  | 'resume_analysis' | 'scenario_evaluation' | 'star_evaluation'
  | 'learning_path' | 'skill_profile';

export const reportContentTypes: Record<ReportContentType, CanonicalReportContentType> = {
  interview_question: 'interview_question',
  interview_report: 'interview_report',
  coaching_note: 'interview_answer_evaluation',
  cv_analysis: 'resume_analysis',
  learning_path: 'learning_path',
  skill_profile: 'skill_profile',
  scenario_result: 'scenario_evaluation',
  star_suggestion: 'star_evaluation',
};

export function isReportableContentId(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) &&
    value !== '00000000-0000-0000-0000-000000000000';
}

export interface ReportReceipt {
  reportId: string;
  receivedAt: string;
}

export type ReportReasonCode = 
  | 'offensive' 
  | 'inaccurate' 
  | 'irrelevant'
  | 'privacy_violation' 
  | 'discriminatory' 
  | 'other';

export interface ReportContentPayload {
  contentType: CanonicalReportContentType;
  contentId: string;
  reasonCode: ReportReasonCode;
  description?: string;
}

export const reportApi = {
  submitReport: async (payload: ReportContentPayload): Promise<ReportReceipt> => {
    if (!isReportableContentId(payload.contentId)) throw new Error('Tải lại nội dung để báo cáo.');
    // Explicit allow-list: callers cannot attach snapshots or reporter identities.
    const { data, status } = await api.post<{ data?: ReportReceipt }>('/content-reports', {
      contentType: payload.contentType,
      contentId: payload.contentId,
      reasonCode: payload.reasonCode,
      description: payload.description,
    });
    const receipt = data?.data;
    if (status !== 202 || !receipt || !isReportableContentId(receipt.reportId) ||
        typeof receipt.receivedAt !== 'string' || !Number.isFinite(Date.parse(receipt.receivedAt))) {
      throw new Error('Máy chủ chưa xác nhận đã nhận báo cáo. Vui lòng thử lại sau.');
    }
    return receipt;
  },
};
