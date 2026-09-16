export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export class AppError extends Error {
  code: string;
  requestId?: string;
  originalError?: unknown;

  constructor(code: string, message: string, requestId?: string, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.requestId = requestId;
    this.originalError = originalError;
  }
}

export interface UserDto {
  id: string;
  email: string;
  fullName?: string;
  emailVerified: boolean;
  roles?: string[];
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword?: string;
  resetToken?: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  user?: UserDto;
}

// =======================
// M2: Profile & Career
// =======================

export interface CareerGoalResponse {
  id: string;
  targetRole: string;
  seniority: string;
  industry?: string | null;
  targetCompany?: string | null;
  targetJobDescriptionId?: string | null;
  targetDate?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerGoalRequest {
  targetRole: string;
  seniority: string;
  industry?: string;
  targetCompany?: string;
  targetJobDescriptionId?: string;
  targetDate?: string; // YYYY-MM-DD
}

export interface UpdateCareerGoalRequest {
  targetRole?: string;
  seniority?: string;
  industry?: string;
  targetCompany?: string;
  targetJobDescriptionId?: string;
  targetDate?: string;
  active?: boolean;
}

export interface CareerProfileIdentityResponse {
  userId: string;
  email: string;
  displayName: string | null;
  yearsOfExperience: number | null;
  avatarUrl: string | null;
}

export interface CareerProfileGoalResponse {
  id: string;
  targetRole: string;
  seniority: string;
  industry: string | null;
  targetCompany: string | null;
  targetDate: string | null;
  active: boolean;
}

export interface CareerProfileCompetencyResponse {
  code: string;
  name: string;
  category: string;
  score: number;
  evidenceCount: number;
}

export interface CareerProfileWeaknessResponse {
  sourceType: string;
  label: string;
  latestEvidenceAt: string;
}

export interface CareerProfileSkillSummaryResponse {
  topCompetencies: CareerProfileCompetencyResponse[];
  topWeaknessSignals: CareerProfileWeaknessResponse[];
}

export interface CareerProfileLearningPathResponse {
  id: string;
  status: string;
  pendingActivityCount: number;
  completedActivityCount: number;
}

export interface CareerProfileOnboardingResponse {
  hasDisplayName: boolean;
  hasYearsOfExperience: boolean;
  hasPrimaryResume: boolean;
  hasActiveCareerGoal: boolean;
  isComplete: boolean;
}

export interface ResumeAnalysisSummaryResponse {
  id: string;
  mode: string;
  status: string;
  createdAt: string;
}

export interface PrimaryResumeResponse {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
  latestAnalysis: ResumeAnalysisSummaryResponse | null;
}

export interface CareerProfileResponse {
  identity: CareerProfileIdentityResponse;
  primaryResume: PrimaryResumeResponse | null;
  activeCareerGoal: CareerProfileGoalResponse | null;
  skillSummary: CareerProfileSkillSummaryResponse;
  learningPath: CareerProfileLearningPathResponse | null;
  onboarding: CareerProfileOnboardingResponse;
}

export interface SetPrimaryResumeRequest {
  resumeId: string | null;
}

// =======================
// M2: Resumes & Uploads
// =======================

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
