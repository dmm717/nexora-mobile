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
  displayName?: string;
  emailVerified?: boolean;
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

// =======================
// M2: Job Descriptions
// =======================

export interface JobDescriptionView {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateJobDescriptionRequest {
  title: string;
  content: string;
}

// =======================
// M3: Interview Flow
// =======================

export interface StartInterviewRequest {
  role?: string | null;
  seniority?: string | null;
  interviewType: string;
  difficulty: string;
  resumeId?: string | null;
  jobDescriptionId?: string | null;
  careerGoalId?: string | null;
}

export interface SubmitAnswerRequest {
  questionId: string;
  content: string;
  durationSeconds?: number | null;
}

export interface PracticeAgainRequest {
  questionId?: string | null;
  focus?: string | null;
  reason?: string | null; // 'repeat_question' | 'rubric_weakness' | 'recommendation' | 'manual'
}

export interface QuestionView {
  id: string;
  sequence: number;
  kind: string; // 'primary' | 'followup'
  topic: string;
  parentQuestionId?: string | null;
  content: string;
  createdAt: string;
}

export interface AnswerView {
  id: string;
  questionId: string;
  content: string;
  durationSeconds?: number | null;
  evaluation?: any | null;
  createdAt: string;
}

export interface InterviewContinuationView {
  state: string; // 'in_progress' | 'upgrade_required' | 'max_questions_reached'
  canFinishNow: boolean;
  canUpgradeAndContinue: boolean;
}

export interface InterviewView {
  id: string;
  status: string; // 'starting' | 'active' | 'completing' | 'completed' | 'failed'
  role: string;
  seniority: string;
  interviewType: string;
  difficulty: string;
  version: number;
  questions: QuestionView[];
  answers: AnswerView[];
  createdAt: string;
  updatedAt: string;
  continuation?: InterviewContinuationView | null;
}

export interface AnswerResult {
  answer: AnswerView;
  nextQuestion?: QuestionView | null;
  isComplete: boolean;
  continuation?: InterviewContinuationView | null;
}

export interface InterviewHistoryItemResponse {
  id: string;
  status: string;
  role: string;
  seniority: string;
  interviewType: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  answeredQuestionCount: number;
  issuedQuestionCount: number;
  reportAvailable: boolean;
  careerGoalId?: string | null;
  sourceInterviewId?: string | null;
  sourceQuestionId?: string | null;
  practiceReason?: string | null;
  focusTopic?: string | null;
}

export interface InterviewHistoryResponse {
  items: InterviewHistoryItemResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface RubricScore {
  criterion: string;
  score: number; // 0..100
  weight?: number;
  feedback?: string;
}

export interface StarEvaluation {
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  missingElements?: string[];
}

export interface InterviewQuestionReviewView {
  questionId: string;
  sequence: number;
  kind: string;
  topic: string;
  parentQuestionId?: string | null;
  question: string;
  answer: string;
  rubric: RubricScore[];
  feedback: string;
  star?: StarEvaluation | null;
  strengths: string[];
  improvements: string[];
  suggestedImprovedAnswer?: string | null;
}

export interface SuggestedImprovedAnswerView {
  questionId: string;
  sequence: number;
  answer: string;
}

export interface ReportSampleView {
  answeredQuestions: number;
  issuedQuestions: number;
  isPartial: boolean;
}

export interface ReportView {
  id: string;
  interviewId: string;
  overallScore: number;
  rubric: any;
  strengths: any;
  gaps: any;
  actionPlan: any;
  disclaimer: string;
  createdAt: string;
  starSummary?: any | null;
  questionReviews?: InterviewQuestionReviewView[] | null;
  suggestedImprovedAnswers?: SuggestedImprovedAnswerView[] | null;
  sample?: ReportSampleView | null;
}

// =======================
// M4: Scenarios & STAR
// =======================

export interface ScenarioCategoryResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ScenarioCardResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  difficulty: string;
  competency: string;
  estimatedMinutes: number;
}

export interface ScenarioPageResponse {
  total: number;
  items: ScenarioCardResponse[];
}

export interface ScenarioDetailResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  difficulty: string;
  competency: string;
  estimatedMinutes: number;
  content: string;
}

export interface ScenarioAttemptCreateRequest {
  scenarioId: string;
}

export interface ScenarioAttemptSubmitRequest {
  answer: string;
}

export interface ScenarioAttemptResponse {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  status: string; // 'draft' | 'processing' | 'completed' | 'failed'
  answer?: string | null;
  evaluation?: any | null;
  errorCode?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface ScenarioAttemptHistoryItemResponse {
  id: string;
  attemptNumber: number;
  status: string;
  answer?: string | null;
  overallScore?: number | null;
  previousScore?: number | null;
  scoreDelta?: number | null;
  improved?: boolean | null;
  errorCode?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface ScenarioAttemptComparisonResponse {
  currentScore?: number | null;
  previousScore?: number | null;
  delta?: number | null;
  improved?: boolean | null;
}

export interface ScenarioAttemptHistoryResponse {
  scenarioId: string;
  scenarioSlug: string;
  scenarioTitle: string;
  categorySlug: string;
  categoryName: string;
  difficulty: string;
  competency: string;
  attempts: ScenarioAttemptHistoryItemResponse[];
  comparison: ScenarioAttemptComparisonResponse;
  latestScore?: number | null;
  bestScore?: number | null;
}

export interface ScenarioTrackProgressResponse {
  categorySlug: string;
  categoryName: string;
  attemptCount: number;
  completedAttempts: number;
  averageScore?: number | null;
  latestScore?: number | null;
}

export interface ScenarioCompetencyProgressResponse {
  competency: string;
  attemptCount: number;
  completedAttempts: number;
  averageScore?: number | null;
  bestScore?: number | null;
  latestScore?: number | null;
}

export interface ScenarioDifficultyProgressResponse {
  difficulty: string;
  attemptCount: number;
  completedAttempts: number;
  averageScore?: number | null;
}

export interface ScenarioProgressResponse {
  recommendedDifficulty: string;
  attemptCount: number;
  completedAttempts: number;
  averageScore?: number | null;
  latestScore?: number | null;
  bestScore?: number | null;
  tracks: ScenarioTrackProgressResponse[];
  competencies: ScenarioCompetencyProgressResponse[];
  difficulties: ScenarioDifficultyProgressResponse[];
}

export interface StarAttemptCreateRequest {
  question: string;
  answer: string;
}

export interface StarAttemptResponse {
  id: string;
  question: string;
  answer: string;
  status: string; // 'queued' | 'processing' | 'completed' | 'failed'
  evaluation?: any | null;
  errorCode?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

// =======================
// M5: Growth (Skills, Progress, Learning Path, Next Action)
// =======================

export interface SkillProfileSourceResponse {
  sourceType: string;
  evidenceCount: number;
  latestEvidenceAt: string;
}

export interface SkillProfileCompetencyResponse {
  code: string;
  name: string;
  category: string;
  score: number;
  evidenceCount: number;
  latestEvidenceAt: string;
  sources: SkillProfileSourceResponse[];
}

export interface SkillProfileWeaknessSignalResponse {
  sourceType: string;
  label: string;
  latestEvidenceAt: string;
}

export interface SkillProfileResponse {
  competencies: SkillProfileCompetencyResponse[];
  weaknessSignals: SkillProfileWeaknessSignalResponse[];
}

export interface ProgressDashboardReadinessResponse {
  score?: number | null;
  assessedCompetencies: number;
  evidenceCount: number;
  priorityGapCount: number;
  qualitativeWeaknessCount: number;
  latestEvidenceAt?: string | null;
}

export interface ProgressDashboardCompetencyResponse {
  code: string;
  name: string;
  category: string;
  score: number;
  evidenceCount: number;
  latestEvidenceAt: string;
}

export interface ProgressDashboardImprovementResponse {
  kind: string;
  resourceId: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  at: string;
}

export interface ProgressDashboardWeeklyActivitiesResponse {
  windowStart: string;
  windowEnd: string;
  total: number;
  resumeAnalyses: number;
  interviews: number;
  scenarios: number;
  starAttempts: number;
  learningPathActivities: number;
}

export interface ProgressStarAveragesResponse {
  situation: number;
  task: number;
  action: number;
  result: number;
}

export interface RecentInterviewScoreResponse {
  interviewId: string;
  score: number;
  completedAt: string;
}

export interface RecentActivityResponse {
  kind: string;
  resourceId: string;
  at: string;
}

export interface ProgressResponse {
  completedInterviews: number;
  recentInterviewScores: RecentInterviewScoreResponse[];
  averageInterviewScore?: number | null;
  starAverages?: ProgressStarAveragesResponse | null;
  completedScenarios: number;
  averageScenarioScore?: number | null;
  completedStarAttempts: number;
  recentActivity: RecentActivityResponse[];
}

export interface ProgressDashboardResponse {
  readiness: ProgressDashboardReadinessResponse;
  weakestCompetencies: ProgressDashboardCompetencyResponse[];
  recentImprovements: ProgressDashboardImprovementResponse[];
  weeklyCompletedActivities: ProgressDashboardWeeklyActivitiesResponse;
  nextRecommendedPractice?: NextPracticeRecommendationResponse | null;
  historicalStats: ProgressResponse;
}

export interface LearningPathActivityResponse {
  id: string;
  type: string; // 'scenario' | 'star_drill' | 'interview' | 'resume_improvement' | 'external_learning'
  title: string;
  description: string;
  competencyCode?: string | null;
  resourceId?: string | null;
  externalUrl?: string | null;
  priority: number;
  status: string; // 'active' | 'pending' | 'completed' | 'obsolete'
  sortOrder: number;
  completedAt?: string | null;
}

export interface LearningPathMilestoneResponse {
  id: string;
  code: string; // 'critical_gaps' | 'developing_skills' | 'supporting_improvements'
  title: string;
  sortOrder: number;
  status: string;
  activities: LearningPathActivityResponse[];
}

export interface LearningPathProgressResponse {
  completedActivityCount: number;
  totalActivityCount: number;
  percentage: number;
}

export interface LearningPathResponse {
  id: string;
  careerGoalId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  progress: LearningPathProgressResponse;
  milestones: LearningPathMilestoneResponse[];
}

export interface UpdateLearningPathActivityRequest {
  status: string; // 'completed'
}

export interface NextPracticeActionResponse {
  type: string;
  reason?: string | null;
  sourceInterviewId?: string | null;
  sourceQuestionId?: string | null;
  focusTopic?: string | null;
  suggestedInterviewType?: string | null;
}

export interface NextPracticeRecommendationResponse {
  reason: string;
  activityType: string; // 'star' | 'scenario' | 'interview' | 'resume'
  resourceId?: string | null;
  estimatedMinutes: number;
  priority: number;
  action?: NextPracticeActionResponse | null;
}

// =======================
// M6: Production Mobile (Pricing & Checkout)
// =======================

export interface PlanFeatureResponse {
  code: string;
  name: string;
  enabled: boolean;
  limit?: number | null;
  unlimited: boolean;
}

export interface PlanPriceResponseV2 {
  id: string;
  amountMinor: number;
  currency: string;
  durationDays: number;
  interviewQuota: number;
  features: PlanFeatureResponse[];
}

export interface PlanResponseV2 {
  id: string;
  code: string;
  name: string;
  description: string;
  badge?: string | null;
  isHighlighted: boolean;
  prices: PlanPriceResponseV2[];
}

export interface CheckoutFieldResponse {
  name: string;
  value: string;
}

export interface CheckoutActionResponse {
  method: string;
  url: string;
  fields: CheckoutFieldResponse[];
}

export interface CheckoutResponse {
  orderId: string;
  status: string;
  amountMinor: number;
  currency: string;
  provider: string;
  checkout?: CheckoutActionResponse | null;
}

export interface CheckoutStatusResponse {
  orderId: string;
  planCode: string;
  amountMinor: number;
  currency: string;
  provider: string;
  status: string;
  checkout?: CheckoutActionResponse | null;
  createdAt: string;
  updatedAt: string;
}



