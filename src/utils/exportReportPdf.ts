import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { logger } from '@/services/logger';

interface RubricItem {
  criterion: string;
  score: number;
}

interface QuestionReview {
  sequence: number;
  question: string;
  answer: string;
  topic?: string | null;
  feedback?: string | null;
  score?: number | null;
  suggestedImprovedAnswer?: string | null;
}

interface ReportData {
  overallScore: number | null;
  rubric?: RubricItem[] | null;
  strengths?: string[] | null;
  gaps?: string[] | null;
  actionPlan?: string[] | null;
  questionReviews?: QuestionReview[] | null;
}

interface InterviewData {
  role?: string;
  seniority?: string;
  interviewType?: string;
  difficulty?: string;
  completedAt?: string;
}

const RUBRIC_LABELS: Record<string, string> = {
  correctness: 'Tính chính xác kỹ thuật',
  structure: 'Cấu trúc & Mạch lạc',
  completeness: 'Độ bao quát & Đầy đủ',
  clarity: 'Sự rõ ràng & Tự tin',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#6366f1';
  return '#d97706';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('vi-VN');
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildReportHtml(report: ReportData, interview?: InterviewData): string {
  const score = report.overallScore ?? 0;
  const scoreColor = getScoreColor(score);

  const rubricHtml = (report.rubric ?? [])
    .map((r) => {
      const label = RUBRIC_LABELS[r.criterion] || r.criterion;
      const color = getScoreColor(r.score);
      const widthPct = Math.min(100, Math.max(0, r.score));
      return `
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-weight:600;color:#1e293b;">${escapeHtml(label)}</span>
            <span style="font-weight:700;color:${color};">${r.score}/100</span>
          </div>
          <div style="background:#f1f5f9;border-radius:6px;height:8px;overflow:hidden;">
            <div style="width:${widthPct}%;height:100%;background:${color};border-radius:6px;"></div>
          </div>
        </div>`;
    })
    .join('');

  const strengthsHtml = (report.strengths ?? [])
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('');

  const gapsHtml = (report.gaps ?? [])
    .map((g) => `<li>${escapeHtml(g)}</li>`)
    .join('');

  const actionPlanHtml = (report.actionPlan ?? [])
    .map(
      (step, idx) => `
        <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:8px;">
          <span style="min-width:24px;height:24px;border-radius:50%;background:#e0e7ff;color:#4338ca;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;">${idx + 1}</span>
          <span style="font-size:13px;color:#1e293b;">${escapeHtml(step)}</span>
        </div>`,
    )
    .join('');

  const questionsHtml = (report.questionReviews ?? [])
    .map(
      (q) => `
        <div style="page-break-inside:avoid;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">
            <span style="font-weight:700;font-size:14px;color:#1e293b;">Câu ${q.sequence}${q.topic ? ` · ${escapeHtml(q.topic)}` : ''}</span>
            ${q.score != null ? `<span style="font-weight:700;color:${getScoreColor(q.score)};font-size:14px;">${q.score}/100</span>` : ''}
          </div>
          <div style="background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:10px;font-style:italic;color:#334155;font-size:13px;">
            "${escapeHtml(q.question)}"
          </div>
          <div style="margin-bottom:10px;">
            <div style="font-weight:600;font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Câu trả lời của bạn</div>
            <div style="font-size:13px;color:#1e293b;line-height:1.6;white-space:pre-wrap;">${escapeHtml(q.answer)}</div>
          </div>
          ${q.feedback ? `
          <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;padding:12px;margin-bottom:10px;">
            <div style="font-weight:600;font-size:11px;color:#3730a3;text-transform:uppercase;margin-bottom:4px;">Nhận xét từ AI</div>
            <div style="font-size:13px;color:#334155;line-height:1.6;">${escapeHtml(q.feedback)}</div>
          </div>` : ''}
          ${q.suggestedImprovedAnswer ? `
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px;">
            <div style="font-weight:600;font-size:11px;color:#065f46;text-transform:uppercase;margin-bottom:4px;">Gợi ý cải thiện</div>
            <div style="font-size:13px;color:#1e293b;line-height:1.6;font-style:italic;">${escapeHtml(q.suggestedImprovedAnswer)}</div>
          </div>` : ''}
        </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1e293b; line-height:1.5; padding:32px; max-width:800px; margin:0 auto; }
    h1 { font-size:22px; font-weight:800; margin-bottom:4px; }
    h2 { font-size:16px; font-weight:700; color:#1e293b; margin-bottom:12px; padding-bottom:6px; border-bottom:2px solid #e2e8f0; }
    .header { text-align:center; margin-bottom:32px; padding-bottom:24px; border-bottom:1px solid #e2e8f0; }
    .meta { font-size:12px; color:#64748b; margin-top:8px; }
    .score-circle { width:120px; height:120px; border-radius:50%; border:6px solid ${scoreColor}; display:flex; align-items:center; justify-content:center; margin:16px auto; }
    .score-value { font-size:36px; font-weight:800; color:${scoreColor}; }
    .score-label { font-size:13px; color:#64748b; text-align:center; }
    .section { margin-bottom:28px; }
    .strengths ul, .gaps ul { list-style:disc; padding-left:20px; font-size:13px; line-height:1.8; color:#334155; }
    .strengths { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; }
    .gaps { background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:16px; }
    .footer { text-align:center; margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; }
    @media print { body { padding:16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Báo Cáo Phỏng Vấn AI</h1>
    <div class="meta">Nexora AI · ${interview?.role ? escapeHtml(interview.role) : 'Ứng viên'}${interview?.seniority ? ` · ${escapeHtml(interview.seniority)}` : ''}${interview?.interviewType ? ` · ${escapeHtml(interview.interviewType)}` : ''}</div>
    <div class="meta">Ngày hoàn thành: ${formatDate(interview?.completedAt)}</div>
    <div class="score-circle"><span class="score-value">${score}</span></div>
    <div class="score-label">Điểm tổng hợp / 100</div>
  </div>

  ${rubricHtml ? `<div class="section"><h2>Đánh giá theo Rubric</h2>${rubricHtml}</div>` : ''}

  <div class="section" style="display:flex;gap:16px;flex-wrap:wrap;">
    ${strengthsHtml ? `<div class="strengths" style="flex:1;min-width:240px;"><h2 style="border:none;padding:0;margin-bottom:8px;">✅ Điểm sáng</h2><ul>${strengthsHtml}</ul></div>` : ''}
    ${gapsHtml ? `<div class="gaps" style="flex:1;min-width:240px;"><h2 style="border:none;padding:0;margin-bottom:8px;">💡 Cần cải thiện</h2><ul>${gapsHtml}</ul></div>` : ''}
  </div>

  ${actionPlanHtml ? `<div class="section"><h2>Kế hoạch hành động</h2>${actionPlanHtml}</div>` : ''}

  ${questionsHtml ? `<div class="section"><h2>Chi tiết từng câu hỏi</h2>${questionsHtml}</div>` : ''}

  <div class="footer">
    <p>Được tạo bởi Nexora AI · ${formatDate()}</p>
    <p>Báo cáo này được lưu trữ theo thông tin tại thời điểm phỏng vấn.</p>
  </div>
</body>
</html>`;
}

export async function exportReportAsPdf(
  report: ReportData,
  interview?: InterviewData,
): Promise<void> {
  try {
    const html = buildReportHtml(report, interview);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      await Print.printAsync({ html });
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Chia sẻ Báo cáo Phỏng vấn AI',
      UTI: 'com.adobe.pdf',
    });
  } catch (err: any) {
    if (err?.message?.includes('cancelled') || err?.message?.includes('canceled')) {
      return;
    }
    logger.warn('Failed to export PDF:', { error: err?.message || err });
    throw err;
  }
}
