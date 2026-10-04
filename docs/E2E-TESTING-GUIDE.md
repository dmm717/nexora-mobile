> HISTORICAL / SUPERSEDED — 2026-10-04: Original audit/plan/evidence retained below. Billing implementation, checkout steering, retention/recovery, universal policy PASS and binary-certification claims are not current release evidence. See [current handoff](release/GOOGLE-PLAY-HANDOFF.md) and [Data Safety matrix](evidence/release/DATA-SAFETY-FORM-ANSWERS.md). Prior screenshots/test results have not been repeated for this release.

# Hướng Dẫn Kiểm Thử Chức Năng E2E (E2E-01 -> E2E-05)

Tài liệu này ghi chú lại những việc cần làm để hoàn tất hạng mục **Test Chức năng (E2E)** trong Bước 3 của lộ trình. Đây là các bài test bắt buộc thao tác thủ công trên giao diện thực tế.

---

## 👤 1. Việc của Tester (Thao tác App & Chụp 5 tấm ảnh)
Bạn hãy mở App lên (trên Web hoặc điện thoại), chạy thử 5 luồng cơ bản nhất và chụp lại **1 tấm ảnh màn hình kết quả** cho mỗi luồng để làm bằng chứng:

| Case ID | Thao tác cần làm | Yêu cầu bằng chứng |
|---|---|---|
| **E2E-01 (Tài khoản mới)** | Đăng xuất, tạo 1 tài khoản mới tinh, nhập mã xác thực email và đăng nhập thành công. | 📸 **Chụp 1 tấm ảnh** màn hình lúc vừa vào lại trang Home. |
| **E2E-02 (Phỏng vấn AI)** | Tạo 1 phiên phỏng vấn mới, trả lời 1-2 câu, kết thúc sớm và chờ AI chấm điểm xong. | 📸 **Chụp 1 tấm ảnh** bảng kết quả / Báo cáo phỏng vấn. |
| **E2E-03 (Phân tích CV)** | Tải lên 1 file CV (PDF), tạo 1 JD (Mô tả công việc) và bấm phân tích độ khớp. | 📸 **Chụp 1 tấm ảnh** màn hình Kết quả phân tích CV-JD. |
| **E2E-04 (Gói cước / Quota)** | Vào trang Pricing, bấm nâng cấp (hoặc kiểm tra xem số lượt FREE còn lại có hiển thị đúng không). | 📸 **Chụp 1 tấm ảnh** trang Gói cước / Quota. |
| **E2E-05 (Phát triển sự nghiệp)**| Tạo 1 Mục tiêu nghề nghiệp (Career Goal) hoặc tạo 1 kỹ năng STAR. | 📸 **Chụp 1 tấm ảnh** sau khi tạo thành công (danh sách mục tiêu/kỹ năng). |

> **Lưu ý:** Sau khi hoàn thành, hãy gom 5 tấm ảnh này và kéo thả vào khung chat cho AI.

---

## 🤖 2. Việc của AI (Làm báo cáo)
Ngay khi AI nhận được 5 tấm ảnh bằng chứng này, AI sẽ:
1. Đối chiếu hình ảnh để đóng dấu **PASS** cho 5 kịch bản.
2. Tự động viết và xuất file Báo cáo `docs/evidence/e2e/E2E-TEST-REPORT.md`.
3. Đánh dấu hoàn thành trên file checklist `06-EXECUTION-ORDER.md` để team đi tới chặng cuối (AUTO & PERF).
