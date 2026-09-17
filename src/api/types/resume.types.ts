export interface PresignUploadRequest {
  fileName: string;
  contentType: string;
  size: number;
}

export interface UploadIntent {
  token: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface FinalizeResumeRequest {
  uploadToken: string;
}

export interface ResumeView {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  status: string; // 'uploaded' | 'extracting' | 'ready' | 'failed'
  createdAt: string;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface CreateResumeAnalysisRequest {
  resumeId: string | null;
  mode: string;
  jobDescriptionId?: string | null;
  industry?: string | null;
  targetRole?: string | null;
  seniority?: string | null;
  careerGoalId?: string | null;
}

export interface ResumeAnalysisContextResponse {
  mode: string;
  industry: string | null;
  targetRole: string | null;
  seniority: string | null;
}

export interface ResumeAnalysisHistoryItemResponse {
  id: string;
  resumeId: string;
  mode: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  context: ResumeAnalysisContextResponse | null;
  errorCode: string | null;
}

export interface ResumeAnalysisHistoryResponse {
  items: ResumeAnalysisHistoryItemResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface ResumeAnalysisView {
  id: string;
  status: string;
  result: any | null;
}
