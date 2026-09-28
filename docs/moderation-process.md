# Quy Trình Xử Lý Báo Cáo Nội Dung AI (AI Content Moderation Process)

> Tài liệu nội bộ — Nexora AI  
> Phiên bản: 1.0 — Ngày tạo: 2026-09-28

---

## 1. Mục đích

Tài liệu này mô tả quy trình xử lý các báo cáo nội dung AI (content report) từ người dùng, đáp ứng yêu cầu của Google Play Store: *"utilize user reports to inform content filtering and moderation"*.

---

## 2. Kênh tiếp nhận

| Kênh | Chi tiết |
|------|----------|
| **Trong ứng dụng** | Người dùng nhấn nút **🚩 Báo cáo** tại vị trí nội dung AI (9 surface). Gửi tới `POST /content-reports`. |
| **Email** | Gửi tới `support@nexora.vn` với chủ đề chứa từ khóa "báo cáo nội dung". |

---

## 3. Cấu trúc dữ liệu báo cáo

Mỗi báo cáo chứa:
- `contentType`: Loại nội dung (interview_question, interview_report, coaching_note, cv_analysis, learning_path, skill_profile, scenario_result, star_suggestion).
- `contentId`: ID nội dung cụ thể.
- `reasonCode`: Lý do (offensive, inaccurate, irrelevant, privacy_violation, discriminatory, other).
- `description`: Mô tả chi tiết từ người dùng (tùy chọn, tối đa 1000 ký tự).
- `contentSnapshot`: Đoạn nội dung bị báo cáo, để moderation review.

---

## 4. Quy trình xử lý

### 4.1 Tiếp nhận
- Hệ thống ghi nhận báo cáo, trả về `{ reportId, receivedAt }` cho người dùng.
- Hiện toast xác nhận: "Cảm ơn bạn. Chúng tôi sẽ xem xét nội dung này."
- Báo cáo được lưu trong bảng `content_reports` với trạng thái `pending`.

### 4.2 Phân loại tự động (Triage)
- Báo cáo có `reasonCode = offensive | discriminatory | privacy_violation` → **Ưu tiên cao** (P1).
- Báo cáo có `reasonCode = inaccurate | irrelevant | other` → **Ưu tiên thường** (P2).

### 4.3 Xem xét (Review)
- **Người phụ trách**: Thành viên team được chỉ định (Content Moderator hoặc Product Owner).
- **Nội dung xem xét**:
  - Đọc `contentSnapshot` và `description` người dùng.
  - Đánh giá nội dung có thực sự vi phạm không.
  - Ghi nhận quyết định: `approved` (xác nhận vi phạm) hoặc `dismissed` (không vi phạm).

### 4.4 Hành động
| Quyết định | Hành động |
|-----------|----------|
| **Xác nhận vi phạm** | Đánh dấu nội dung, cập nhật prompt/rubric AI để tránh lặp lại. Nếu nghiêm trọng (phân biệt đối xử, vi phạm quyền riêng tư): xóa/ẩn nội dung và gửi email thông báo cho người dùng. |
| **Không vi phạm** | Đóng báo cáo. Nếu nhiều báo cáo cùng loại nội dung → xem xét cải thiện prompt. |

### 4.5 Phản hồi
- SLA phản hồi: tối đa **72 giờ** kể từ khi nhận báo cáo P1, **7 ngày** cho P2.
- Gửi email thông báo kết quả xử lý cho người dùng (nếu có email liên kết).

---

## 5. Cải thiện liên tục

- Thống kê số lượng báo cáo theo `contentType`, `reasonCode`, thời gian.
- Dùng dữ liệu báo cáo để cải thiện prompt AI, rubric đánh giá và bộ lọc nội dung.
- Review quy trình hàng quý.

---

## 6. Lưu trữ

- Dữ liệu báo cáo được lưu tối thiểu **90 ngày** để phục vụ audit.
- Sau 90 ngày, dữ liệu PII trong báo cáo được ẩn danh hóa (anonymize), chỉ giữ lại thống kê tổng hợp.
