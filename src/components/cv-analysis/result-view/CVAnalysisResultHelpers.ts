import { ResumeAnalysisView } from '@/api/types';

export function parseResult(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
}

export function getScoreSublabel(score: number | null): string {
  if (score === null) return 'N/A';
  if (score >= 80) return 'Rất Tốt';
  if (score >= 60) return 'Khá Tốt';
  if (score >= 40) return 'Cần Nỗ Lực';
  return 'Kém';
}

export function buildBreakdownEntries(isBenchmark: boolean, rawBreakdown: Record<string, unknown>) {
  if (isBenchmark) {
    return [
      { key: 'technicalFoundation', name: 'Nền tảng kỹ thuật', score: typeof rawBreakdown.technicalFoundation === 'number' ? rawBreakdown.technicalFoundation : null, desc: 'Kiến trúc phần mềm, cơ sở dữ liệu' },
      { key: 'projectEvidence', name: 'Bằng chứng dự án', score: typeof rawBreakdown.projectEvidence === 'number' ? rawBreakdown.projectEvidence : null, desc: 'Minh chứng qua quy mô dự án thực tế' },
      { key: 'experiencePresentation', name: 'Thể hiện kinh nghiệm', score: typeof rawBreakdown.experiencePresentation === 'number' ? rawBreakdown.experiencePresentation : null, desc: 'Làm nổi bật vai trò đóng góp cá nhân' },
      { key: 'impactAchievements', name: 'Số liệu tác động', score: typeof rawBreakdown.impactAchievements === 'number' ? rawBreakdown.impactAchievements : null, desc: 'Chỉ số định lượng về hiệu năng' },
      { key: 'clarity', name: 'Mạch lạc & Rõ ràng', score: typeof rawBreakdown.clarity === 'number' ? rawBreakdown.clarity : null, desc: 'Trình bày chuyên nghiệp, chuẩn xác' },
      { key: 'roleAlignment', name: 'Định hướng vai trò', score: typeof rawBreakdown.roleAlignment === 'number' ? rawBreakdown.roleAlignment : null, desc: 'Phù hợp với kỳ vọng cấp bậc mục tiêu' },
    ];
  }
  return [
    { key: 'technicalSkillMatch', name: 'Khớp kỹ năng kỹ thuật', score: typeof rawBreakdown.technicalSkillMatch === 'number' ? rawBreakdown.technicalSkillMatch : null, desc: 'Mức độ đáp ứng các công nghệ JD' },
    { key: 'experienceRelevance', name: 'Độ liên quan kinh nghiệm', score: typeof rawBreakdown.experienceRelevance === 'number' ? rawBreakdown.experienceRelevance : null, desc: 'Kinh nghiệm trong ngành tương đồng' },
    { key: 'impactEvidence', name: 'Bằng chứng hiệu quả', score: typeof rawBreakdown.impactEvidence === 'number' ? rawBreakdown.impactEvidence : null, desc: 'Chỉ số tải, tối ưu hóa quy trình' },
    { key: 'clarity', name: 'Độ rõ ràng & mạch lạc', score: typeof rawBreakdown.clarity === 'number' ? rawBreakdown.clarity : null, desc: 'Từ ngữ súc tích, chuẩn kỹ thuật' },
    { key: 'structure', name: 'Bố cục hồ sơ', score: typeof rawBreakdown.structure === 'number' ? rawBreakdown.structure : null, desc: 'Chuẩn ATS, bố cục dễ quét' },
  ];
}

export function parseAnalysisData(analysisResult: ResumeAnalysisView | undefined, mode: 'standard' | 'job_targeted') {
  const rawResult = parseResult(analysisResult?.result);
  const isBenchmark = (analysisResult as any)?.mode === 'field_benchmark' || rawResult?.mode === 'field_benchmark' || mode === 'standard';

  const score = isBenchmark
    ? (typeof rawResult?.readinessScore === 'number' ? rawResult.readinessScore : null)
    : (typeof rawResult?.matchScore === 'number' ? rawResult.matchScore : null);

  const summary = typeof rawResult?.summary === 'string' ? rawResult.summary : '';
  const strengths: string[] = Array.isArray(rawResult?.strengths) ? (rawResult.strengths as string[]) : [];
  const gaps: string[] = Array.isArray(rawResult?.gaps) ? (rawResult.gaps as string[]) : [];
  const recommendations: string[] = Array.isArray(rawResult?.recommendations) ? (rawResult.recommendations as string[]) : [];
  const sectionFeedback: string[] = Array.isArray(rawResult?.sectionFeedback) ? (rawResult.sectionFeedback as string[]) : [];

  const contextData = (analysisResult as any)?.context;
  const industry: string | null = contextData?.industry ?? (typeof rawResult?.industry === 'string' ? rawResult.industry : null);
  const targetRole: string | null = contextData?.targetRole ?? (typeof rawResult?.targetRole === 'string' ? rawResult.targetRole : null);
  const seniority: string | null = contextData?.seniority ?? (typeof rawResult?.seniority === 'string' ? rawResult.seniority : null);

  const createdAt = (analysisResult as any)?.createdAt ? new Date((analysisResult as any).createdAt).toLocaleDateString('vi-VN') : null;
  const rubricVersion = (analysisResult as any)?.rubricVersion;
  const modelVersion = (analysisResult as any)?.modelVersion;

  const matchedSkills: string[] = Array.isArray(rawResult?.matchedKeywordsOrSkills) ? (rawResult.matchedKeywordsOrSkills as string[]) : [];
  const missingSkills: string[] = Array.isArray(rawResult?.missingKeywordsOrSkills) ? (rawResult.missingKeywordsOrSkills as string[]) : [];

  const rawBreakdown = (rawResult?.breakdown && typeof rawResult.breakdown === 'object' ? rawResult.breakdown : {}) as Record<string, unknown>;
  const breakdownEntries = buildBreakdownEntries(isBenchmark, rawBreakdown);
  const hasBreakdown = breakdownEntries.some((e) => e.score !== null);
  const scoreLabel = isBenchmark ? 'Điểm Sẵn Sàng' : 'Mức độ Phù hợp';
  const scoreSublabel = getScoreSublabel(score);

  return {
    isBenchmark, score, summary, strengths, gaps, recommendations, sectionFeedback,
    industry, targetRole, seniority, createdAt, rubricVersion, modelVersion,
    matchedSkills, missingSkills, breakdownEntries, hasBreakdown, scoreLabel, scoreSublabel,
  };
}
