export interface NormalizedStarComponent {
  label: string;
  key: 'S' | 'T' | 'A' | 'R';
  title: string;
  content: string;
  evidence?: string;
  feedback?: string;
  score?: number | null;
  detected?: boolean;
}

export interface NormalizedStarEvaluation {
  overallScore: number | null;
  situation: NormalizedStarComponent;
  task: NormalizedStarComponent;
  action: NormalizedStarComponent;
  result: NormalizedStarComponent;
  missingElements: string[];
  strengths: string[];
  coachingTips: string[];
  applicable: boolean;
}
