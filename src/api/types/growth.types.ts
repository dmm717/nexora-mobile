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
