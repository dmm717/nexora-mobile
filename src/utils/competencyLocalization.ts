/**
 * Localized Competency Mapping for Nexora Mobile.
 * Maps backend taxonomy competency codes to natural, friendly Vietnamese labels.
 */

export const KNOWN_COMPETENCY_LABELS: Record<string, string> = {
  // behavioral.*
  'behavioral.situation': 'Bối cảnh (Situation)',
  'behavioral.task': 'Nhiệm vụ (Task)',
  'behavioral.action': 'Hành động (Action)',
  'behavioral.result': 'Kết quả (Result)',

  // interview.*
  'interview.structure': 'Cấu trúc câu trả lời',
  'interview.clarity': 'Độ rõ ràng trong câu trả lời',
  'interview.correctness': 'Độ chính xác câu trả lời',
  'interview.completeness': 'Tính đầy đủ của câu trả lời',
  'interview.communication': 'Kỹ năng giao tiếp',
  'interview.risk_management': 'Quản lý rủi ro',
  'interview.problem_solving': 'Giải quyết vấn đề',
  'interview.leadership': 'Năng lực lãnh đạo',

  // resume.*
  'resume.impact_evidence': 'Minh chứng tác động trong CV',
  'resume.impact_achievements': 'Thành tích tạo ra tác động',
  'resume.clarity': 'Độ rõ ràng của CV',
  'resume.structure': 'Cấu trúc CV',
  'resume.technical_skill_match': 'Độ phù hợp kỹ năng chuyên môn',
  'resume.project_evidence': 'Minh chứng dự án',
  'resume.quantifiable_results': 'Kết quả định lượng',

  // scenario.*
  'scenario.problem_solving': 'Khả năng giải quyết vấn đề',
  'scenario.customer_service': 'Dịch vụ khách hàng',
  'scenario.prioritization': 'Sắp xếp thứ tự ưu tiên',
  'scenario.incident_response': 'Ứng phó sự cố',
  'scenario.conflict_resolution': 'Giải quyết xung đột',
  'scenario.communication': 'Kỹ năng giao tiếp',
  'scenario.teamwork': 'Làm việc nhóm',
  'scenario.time_management': 'Quản lý thời gian',
  'scenario.leadership': 'Năng lực lãnh đạo',
};

/**
 * Resolves a natural Vietnamese label for a competency code.
 * If code is missing or unknown, falls back to a safe activity-based Vietnamese label.
 */
export function getLocalizedCompetencyLabel(
  competencyCode?: string | null,
  activityType?: string | null
): string {
  if (competencyCode && typeof competencyCode === 'string') {
    const normalized = competencyCode.trim().toLowerCase();
    if (KNOWN_COMPETENCY_LABELS[normalized]) {
      return KNOWN_COMPETENCY_LABELS[normalized];
    }
  }

  switch (activityType?.toLowerCase()) {
    case 'interview':
      return 'Kỹ năng phỏng vấn cần ưu tiên';
    case 'star':
    case 'star_drill':
      return 'Kỹ năng trả lời STAR cần ưu tiên';
    case 'scenario':
      return 'Kỹ năng xử lý tình huống cần ưu tiên';
    case 'resume':
    case 'resume_improvement':
      return 'Điểm cần cải thiện trong CV';
    case 'external_learning':
      return 'Chủ đề học tập cần ưu tiên';
    default:
      return 'Kỹ năng cần ưu tiên';
  }
}
