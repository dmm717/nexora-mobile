import { NextPracticeRecommendationResponse } from '@/api/types';
import { getLocalizedCompetencyLabel } from './competencyLocalization';

export function getLocalizedRecommendationReason(
  recommendation?: NextPracticeRecommendationResponse | null
): string {
  if (!recommendation) {
    return 'Chọn bài luyện phù hợp với điều bạn muốn cải thiện tiếp theo.';
  }

  const activityType = (recommendation.activityType || '').toLowerCase();

  const activityLabel =
    {
      scenario: 'Luyện tình huống thực tế',
      star: 'Luyện trả lời STAR',
      star_drill: 'Luyện trả lời STAR',
      interview: 'Luyện phỏng vấn AI',
      resume: 'Cải thiện CV',
      resume_improvement: 'Cải thiện CV',
      external_learning: 'Xem tài liệu học phù hợp',
    }[activityType] || 'Bài luyện tiếp theo';

  const priorityLabel =
    recommendation.priority <= 1
      ? 'đang được ưu tiên'
      : recommendation.priority === 2
        ? 'nên thực hiện tiếp theo'
        : 'có thể thực hiện sau';

  const action = recommendation.action;
  if (action?.reason && typeof action.reason === 'string' && action.reason.trim().length > 0) {
    return action.reason;
  }

  if (recommendation.reason && typeof recommendation.reason === 'string' && recommendation.reason.trim().length > 0) {
    // If recommendation.reason is in Vietnamese or meaningful, check if rationale exists
    const rationale = (recommendation as any).rationale;
    if (rationale && (rationale.competencyCode || rationale.competencyName)) {
      const compLabel = getLocalizedCompetencyLabel(
        rationale.competencyCode || rationale.competencyName,
        activityType
      );
      const priorityReason =
        recommendation.priority <= 1
          ? 'điểm cần ưu tiên cao'
          : recommendation.priority === 2
            ? 'điểm nên củng cố tiếp theo'
            : 'một phần trong lộ trình hiện tại';
      const actionPrefix =
        activityType === 'resume' || activityType === 'resume_improvement'
          ? 'Nên hoàn thiện'
          : 'Nên luyện';
      const evidenceCount = Math.max(0, rationale.evidenceCount ?? 0);
      return `${actionPrefix} ${compLabel} tiếp theo vì đây là ${priorityReason}, dựa trên ${evidenceCount} bằng chứng đã ghi nhận.`;
    }
  }

  return `${activityLabel} ${priorityLabel} theo lộ trình hiện tại của bạn.`;
}

export function getRecommendationDeepLink(
  recommendation?: NextPracticeRecommendationResponse | null
): string | null {
  if (!recommendation || !recommendation.activityType) {
    return null;
  }

  const act = recommendation.activityType.toLowerCase();

  switch (act) {
    case 'scenario':
      return recommendation.resourceId
        ? `/(app)/scenarios/${recommendation.resourceId}`
        : '/(app)/scenarios';
    case 'star':
    case 'star_drill':
      return '/(app)/scenarios';
    case 'interview':
      return '/(app)/interview/preflight';
    case 'resume':
    case 'resume_improvement':
      return '/(tabs)/cv-jd';
    default:
      return null;
  }
}
