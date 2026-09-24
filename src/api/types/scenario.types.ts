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

export interface ScenarioEvaluationDimension {
  criterion: string;
  score: number;
  evidence?: string;
  feedback?: string;
}

export interface ScenarioEvaluation {
  overallScore?: number | null;
  feedback?: string;
  dimensions?: ScenarioEvaluationDimension[];
  strengths?: string[];
  gaps?: string[];
  recommendedApproach?: string[];
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
  evaluation?: ScenarioEvaluation | null;
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
