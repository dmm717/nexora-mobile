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
