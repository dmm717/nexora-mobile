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

export interface SampleInterviewAnswer {
  framework: string;
  situation?: string | null;
  task?: string | null;
  action?: string | null;
  result?: string | null;
  fullAnswer: string;
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
  sampleAnswer?: SampleInterviewAnswer | null;
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
