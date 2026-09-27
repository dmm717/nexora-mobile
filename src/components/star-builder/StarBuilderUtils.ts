import { NormalizedStarComponent, NormalizedStarEvaluation } from './StarBuilderTypes';

export function parseStarComponent(
  raw: any,
  key: 'S' | 'T' | 'A' | 'R',
  title: string,
  fallbackEmptyText: string
): NormalizedStarComponent {
  const labelMap = { S: 'Situation', T: 'Task', A: 'Action', R: 'Result' };
  const label = labelMap[key];

  if (!raw) {
    return {
      key,
      label,
      title,
      content: fallbackEmptyText,
      detected: false,
    };
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return {
      key,
      label,
      title,
      content: trimmed || fallbackEmptyText,
      detected: !!trimmed,
    };
  }

  if (typeof raw === 'object') {
    const feedback = raw.feedback || raw.Feedback || raw.text || raw.Text || raw.content || raw.Content || '';
    const evidence = raw.evidence || raw.Evidence || '';
    const score = typeof raw.score === 'number' ? raw.score : typeof raw.Score === 'number' ? raw.Score : null;
    const detected = typeof raw.detected === 'boolean' ? raw.detected : typeof raw.Detected === 'boolean' ? raw.Detected : true;

    return {
      key,
      label,
      title,
      content: feedback || evidence || (detected ? 'Đã ghi nhận trong câu trả lời' : fallbackEmptyText),
      evidence,
      feedback,
      score,
      detected,
    };
  }

  return {
    key,
    label,
    title,
    content: fallbackEmptyText,
    detected: false,
  };
}

export function normalizeStarEvaluation(raw: any): NormalizedStarEvaluation | null {
  if (!raw) return null;

  const situationRaw = raw.situation || raw.Situation;
  const taskRaw = raw.task || raw.Task;
  const actionRaw = raw.action || raw.Action;
  const resultRaw = raw.result || raw.Result;

  const situation = parseStarComponent(situationRaw, 'S', 'Bối Cảnh (Situation)', 'Chưa phát hiện rõ bối cảnh tình huống.');
  const task = parseStarComponent(taskRaw, 'T', 'Nhiệm Vụ (Task)', 'Chưa phát hiện rõ mục tiêu / nhiệm vụ.');
  const action = parseStarComponent(actionRaw, 'A', 'Hành Động (Action)', 'Chưa phát hiện rõ hành động xử lý.');
  const result = parseStarComponent(resultRaw, 'R', 'Kết Quả (Result)', 'Chưa phát hiện chỉ số / kết quả đạt được.');

  const rawMissing = raw.missingElements || raw.MissingElements || [];
  const missingElements: string[] = Array.isArray(rawMissing)
    ? rawMissing.filter((m: any) => typeof m === 'string' && m.trim())
    : [];

  const rawStrengths = raw.strengths || raw.Strengths || [];
  const strengths: string[] = Array.isArray(rawStrengths)
    ? rawStrengths.filter((s: any) => typeof s === 'string' && s.trim())
    : [];

  const rawTips = raw.coachingTips || raw.CoachingTips || raw.improvements || raw.Improvements || raw.recommendedApproach || raw.RecommendedApproach || [];
  const coachingTips: string[] = Array.isArray(rawTips)
    ? rawTips.filter((t: any) => typeof t === 'string' && t.trim())
    : [];

  const rawScore = raw.overallScore ?? raw.OverallScore ?? raw.score ?? raw.Score ?? null;

  return {
    overallScore: typeof rawScore === 'number' ? rawScore : null,
    situation,
    task,
    action,
    result,
    missingElements,
    strengths,
    coachingTips,
    applicable: typeof raw.applicable === 'boolean' ? raw.applicable : true,
  };
}
