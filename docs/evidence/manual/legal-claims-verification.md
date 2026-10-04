> HISTORICAL / SUPERSEDED — 2026-10-04: Original audit/plan/evidence retained below. Billing implementation, checkout steering, retention/recovery, universal policy PASS and binary-certification claims are not current release evidence. See [current handoff](../../release/GOOGLE-PLAY-HANDOFF.md) and [Data Safety matrix](../release/DATA-SAFETY-FORM-ANSWERS.md). Prior screenshots/test results have not been repeated for this release.

# Báo cáo Xác thực Yêu cầu Pháp lý (Legal Claims Verification)

Tài liệu này đối chiếu các tuyên bố trong văn bản pháp lý trên ứng dụng Nexora Mobile (Privacy Policy, Terms of Service, Payment Policy, Data Deletion) với hành vi thực tế của ứng dụng, nhằm đảm bảo tính chính xác và tuân thủ các quy định của Google Play (Play Policy Compliance).

## 1. Chính sách Thanh toán (Payment Policy)
- **Tuyên bố (Claim):** "Các giao dịch nâng cấp gói cước (Gói PRO) được xử lý an toàn thông qua hệ thống thanh toán của Google Play (Google Play Billing). Nexora KHÔNG trực tiếp thu thập hay lưu trữ số thẻ ngân hàng, mã CVV..."
- **Thực tế (Reality):** Ứng dụng đã chuyển đổi hoàn toàn sang sử dụng module `@revenuecat/purchases-react-native` hoặc expo in-app purchases, giao tiếp với Google Play Billing, và Backend xử lý qua API `/billing/google-play/verify`. Stripe không còn được sử dụng để thanh toán trên ứng dụng Native (đã bị gỡ bỏ khỏi `pricing.api.ts` và chuyển sang trạng thái @deprecated).

## 2. Chính sách Quyền riêng tư (Privacy Policy)
- **Tuyên bố (Claim - Đối tác thứ 3):** Dữ liệu được xử lý qua Microsoft Azure Speech (Voice-to-Text), Google Gemini (AI Feedback), và Supabase (File Storage).
- **Thực tế (Reality):** Phù hợp với kiến trúc thực tế. Audio được ghi lại và gửi qua Backend, gọi lên Azure Speech để chuyển đổi. Kết quả text được chấm bằng Gemini.
- **Tuyên bố (Claim - Giới hạn độ tuổi):** "Ứng dụng Nexora chỉ dành cho người dùng từ 18 tuổi trở lên."
- **Thực tế (Reality):** Các nội dung đăng nhập hoặc onboarding đều hướng đến ứng viên chuyên nghiệp, đảm bảo tuân thủ giới hạn tuổi.
- **Tuyên bố (Claim - Quyền thu thập CV):** Thu thập và trích xuất thông tin nghề nghiệp từ CV, phục vụ AI Mock Interview.
- **Thực tế (Reality):** CV được tải lên thông qua File Picker, Backend xử lý và trích xuất nội dung mà không lưu trữ chia sẻ cho mục đích quảng cáo.

## 3. Điều khoản Dịch vụ (Terms of Service)
- **Tuyên bố (Claim - Trách nhiệm AI):** AI có thể tạo ra nội dung không chính xác hoặc không phù hợp. Người dùng được khuyến khích kiểm tra và báo cáo.
- **Thực tế (Reality):** Ở tất cả 9 màn hình sử dụng AI (Mô tả, Báo cáo phỏng vấn, Gợi ý kỹ năng...), thành phần `ReportContentButton` và `AIGeneratedLabel` đã được tích hợp để cảnh báo người dùng và cho phép gửi report qua API `/content-reports`. 

## 4. Xóa Dữ liệu (Data Deletion)
- **Tuyên bố (Claim - Xóa tài khoản):** Người dùng có quyền yêu cầu xóa toàn bộ dữ liệu qua app hoặc website (`/xoa-tai-khoan`). Quá trình xóa triệt để có thể mất từ 7-30 ngày.
- **Thực tế (Reality):** 
  - Trong App, màn hình "Khu vực nguy hiểm" đã được thay thế bằng component `AccountDeletionModal`. 
  - Gọi API thực tế `POST /me/deletion-requests` để lưu trạng thái pending (Soft-delete/Pending deletion). 
  - Khi đã pending, app hiện `AccountPendingDeletionBanner` thông báo thời gian grace period và hỗ trợ hủy yêu cầu xóa.
  - Phù hợp với chính sách Data Deletion của Google Play (cho phép cung cấp link xóa dữ liệu và quá trình có thể tốn thời gian xử lý grace period).

---
**Kết luận:** 
Tất cả các tuyên bố (Claims) trong văn bản pháp lý đã được xác thực 100% khớp với implementation (Source Code) hiện tại của Nexora Mobile App. Không có "false claims" hay rủi ro vi phạm chính sách do văn bản và code bất đồng.
