import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { logger } from '@/services/logger';

function escapeHtml(text: string): string {
  if (!text) return '';
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

const commonStyles = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1e293b; line-height:1.5; padding:32px; max-width:800px; margin:0 auto; }
  h1 { font-size:22px; font-weight:800; margin-bottom:4px; }
  h2 { font-size:16px; font-weight:700; color:#1e293b; margin-bottom:12px; padding-bottom:6px; border-bottom:2px solid #e2e8f0; }
  .header { text-align:center; margin-bottom:32px; padding-bottom:24px; border-bottom:1px solid #e2e8f0; }
  .meta { font-size:12px; color:#64748b; margin-top:8px; }
  .score-circle { width:120px; height:120px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:16px auto; }
  .score-value { font-size:36px; font-weight:800; }
  .score-label { font-size:13px; color:#64748b; text-align:center; }
  .section { margin-bottom:28px; }
  .list-box ul { list-style:disc; padding-left:20px; font-size:13px; line-height:1.8; color:#334155; }
  .list-box { border-radius:12px; padding:16px; flex:1; min-width:240px; }
  .strengths { background:#f0fdf4; border:1px solid #bbf7d0; }
  .gaps { background:#fffbeb; border:1px solid #fde68a; }
  .footer { text-align:center; margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; }
  @media print { body { padding:16px; } }
`;

async function printAndShare(html: string, title: string) {
  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
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
      dialogTitle: title,
      UTI: 'com.adobe.pdf',
    });
  } catch (err: any) {
    if (err?.message?.includes('cancel')) return;
    logger.warn('Failed to export PDF:', { error: err?.message || err });
    throw err;
  }
}

// -------------------------------------------------------------
// CV Analysis PDF
// -------------------------------------------------------------
export async function exportCVAnalysisPdf(parsedData: any) {
  const score = parsedData.score ?? 0;
  const scoreColor = getScoreColor(score);
  
  const strengthsHtml = parsedData.strengths?.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('') || '';
  const gapsHtml = parsedData.gaps?.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('') || '';
  const matchedHtml = parsedData.matchedSkills?.map((s: string) => `<span style="display:inline-block;background:#e0e7ff;color:#4338ca;padding:4px 8px;border-radius:4px;font-size:11px;margin:0 4px 4px 0;">${escapeHtml(s)}</span>`).join('') || '';
  const missingHtml = parsedData.missingSkills?.map((s: string) => `<span style="display:inline-block;background:#fee2e2;color:#b91c1c;padding:4px 8px;border-radius:4px;font-size:11px;margin:0 4px 4px 0;">${escapeHtml(s)}</span>`).join('') || '';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="header">
    <h1>Báo Cáo Phân Tích CV</h1>
    <div class="meta">${escapeHtml(parsedData.targetRole || 'Ứng viên')} ${parsedData.seniority ? `· ${escapeHtml(parsedData.seniority)}` : ''}</div>
    <div class="meta">Ngày phân tích: ${formatDate(parsedData.createdAt)}</div>
    <div class="score-circle" style="border:6px solid ${scoreColor};"><span class="score-value" style="color:${scoreColor}">${score}</span></div>
    <div class="score-label">${parsedData.scoreLabel || 'Điểm'} / 100</div>
    <div style="font-size:14px;color:#334155;margin-top:16px;">${escapeHtml(parsedData.summary)}</div>
  </div>

  <div class="section" style="display:flex;gap:16px;flex-wrap:wrap;">
    ${strengthsHtml ? `<div class="list-box strengths"><h2 style="border:none;padding:0;margin-bottom:8px;">✅ Điểm mạnh CV</h2><ul>${strengthsHtml}</ul></div>` : ''}
    ${gapsHtml ? `<div class="list-box gaps"><h2 style="border:none;padding:0;margin-bottom:8px;">💡 Điểm cần cải thiện</h2><ul>${gapsHtml}</ul></div>` : ''}
  </div>

  <div class="section">
    <h2>Phân tích Từ khóa & Kỹ năng</h2>
    <div style="margin-bottom:12px;"><strong>Kỹ năng đã có:</strong><br/>${matchedHtml || '<span style="font-size:12px;color:#64748b;">Không có dữ liệu</span>'}</div>
    <div><strong>Kỹ năng còn thiếu:</strong><br/>${missingHtml || '<span style="font-size:12px;color:#64748b;">Không có dữ liệu</span>'}</div>
  </div>

  <div class="footer">
    <p>Được tạo bởi Nexora AI · ${formatDate()}</p>
  </div>
</body>
</html>`;
  
  await printAndShare(html, 'Chia sẻ Báo cáo CV');
}

// -------------------------------------------------------------
// Scenario PDF
// -------------------------------------------------------------
export async function exportScenarioPdf(scenario: any, attempt: any) {
  const result = attempt?.result;
  const score = result?.score ?? 0;
  const scoreColor = getScoreColor(score);
  
  const strengthsHtml = result?.feedback?.strengths?.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('') || '';
  const weaknessesHtml = result?.feedback?.weaknesses?.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('') || '';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="header">
    <h1>Đánh Giá Xử Lý Tình Huống AI</h1>
    <div class="meta">${escapeHtml(scenario?.title || '')}</div>
    <div class="meta">Độ khó: ${escapeHtml(scenario?.difficulty || '')} · Hoàn thành: ${formatDate(attempt?.completedAt)}</div>
    ${score ? `
    <div class="score-circle" style="border:6px solid ${scoreColor};"><span class="score-value" style="color:${scoreColor}">${score}</span></div>
    <div class="score-label">Điểm xử lý / 100</div>
    ` : ''}
  </div>

  <div class="section">
    <h2>Nội dung Tình huống</h2>
    <div style="font-size:13px;color:#334155;background:#f8fafc;padding:12px;border-radius:8px;">${escapeHtml(scenario?.description || '')}</div>
  </div>

  ${result?.suggestedResponse ? `
  <div class="section">
    <h2>Gợi ý Cách xử lý Tối ưu (AI Suggestion)</h2>
    <div style="font-size:13px;color:#065f46;background:#ecfdf5;padding:12px;border-radius:8px;font-style:italic;">${escapeHtml(result.suggestedResponse)}</div>
  </div>` : ''}

  <div class="section" style="display:flex;gap:16px;flex-wrap:wrap;">
    ${strengthsHtml ? `<div class="list-box strengths"><h2 style="border:none;padding:0;margin-bottom:8px;">✅ Xử lý tốt</h2><ul>${strengthsHtml}</ul></div>` : ''}
    ${weaknessesHtml ? `<div class="list-box gaps"><h2 style="border:none;padding:0;margin-bottom:8px;">💡 Cần khắc phục</h2><ul>${weaknessesHtml}</ul></div>` : ''}
  </div>

  <div class="footer">
    <p>Được tạo bởi Nexora AI · ${formatDate()}</p>
  </div>
</body>
</html>`;

  await printAndShare(html, 'Chia sẻ Báo cáo Tình huống');
}

// -------------------------------------------------------------
// STAR Builder PDF
// -------------------------------------------------------------
export async function exportStarPdf(attempt: any) {
  const evalData = attempt?.evaluation || attempt?.Evaluation;
  const comps = evalData?.components;
  
  const strengthsHtml = evalData?.strengths?.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('') || '';
  const improvementsHtml = evalData?.improvements?.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('') || '';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="header">
    <h1>Đánh Giá Cấu Trúc STAR</h1>
    <div class="meta">Ngày phân tích: ${formatDate(attempt?.createdAt)}</div>
    <div style="margin-top:16px;">
      ${evalData?.isStarFormat ? 
        '<span style="background:#dcfce7;color:#166534;padding:6px 12px;border-radius:20px;font-weight:700;font-size:13px;">✅ Đạt chuẩn cấu trúc STAR</span>' : 
        '<span style="background:#fee2e2;color:#991b1b;padding:6px 12px;border-radius:20px;font-weight:700;font-size:13px;">❌ Chưa đạt cấu trúc STAR</span>'
      }
    </div>
  </div>

  <div class="section">
    <h2>Câu hỏi & Câu trả lời gốc</h2>
    <div style="margin-bottom:12px;"><strong>Câu hỏi:</strong> <span style="font-size:13px;color:#334155;">${escapeHtml(attempt?.question || '')}</span></div>
    <div><strong>Trả lời:</strong> <div style="font-size:13px;color:#334155;background:#f8fafc;padding:12px;border-radius:8px;margin-top:4px;white-space:pre-wrap;">${escapeHtml(attempt?.answer || '')}</div></div>
  </div>

  ${comps ? `
  <div class="section">
    <h2>Phân tích Thành phần STAR</h2>
    <div style="margin-bottom:8px;"><strong>S (Tình huống):</strong> <span style="font-size:13px;">${escapeHtml(comps.situation || 'Không rõ ràng')}</span></div>
    <div style="margin-bottom:8px;"><strong>T (Nhiệm vụ):</strong> <span style="font-size:13px;">${escapeHtml(comps.task || 'Không rõ ràng')}</span></div>
    <div style="margin-bottom:8px;"><strong>A (Hành động):</strong> <span style="font-size:13px;">${escapeHtml(comps.action || 'Không rõ ràng')}</span></div>
    <div style="margin-bottom:8px;"><strong>R (Kết quả):</strong> <span style="font-size:13px;">${escapeHtml(comps.result || 'Không rõ ràng')}</span></div>
    <div style="margin-bottom:8px;"><strong>L (Bài học):</strong> <span style="font-size:13px;">${escapeHtml(comps.learning || 'Không rõ ràng')}</span></div>
  </div>
  ` : ''}

  <div class="section" style="display:flex;gap:16px;flex-wrap:wrap;">
    ${strengthsHtml ? `<div class="list-box strengths"><h2 style="border:none;padding:0;margin-bottom:8px;">✅ Điểm mạnh</h2><ul>${strengthsHtml}</ul></div>` : ''}
    ${improvementsHtml ? `<div class="list-box gaps"><h2 style="border:none;padding:0;margin-bottom:8px;">💡 Cần cải thiện</h2><ul>${improvementsHtml}</ul></div>` : ''}
  </div>

  ${evalData?.suggestedAnswer ? `
  <div class="section">
    <h2>Gợi ý Diễn đạt lại (Tối ưu STAR)</h2>
    <div style="font-size:13px;color:#065f46;background:#ecfdf5;padding:12px;border-radius:8px;font-style:italic;white-space:pre-wrap;">${escapeHtml(evalData.suggestedAnswer)}</div>
  </div>` : ''}

  <div class="footer">
    <p>Được tạo bởi Nexora AI · ${formatDate()}</p>
  </div>
</body>
</html>`;

  await printAndShare(html, 'Chia sẻ Đánh giá STAR');
}
