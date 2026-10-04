> HISTORICAL / SUPERSEDED — 2026-10-04: Original audit/plan/evidence retained below. Billing implementation, checkout steering, retention/recovery, universal policy PASS and binary-certification claims are not current release evidence. See [current handoff](release/GOOGLE-PLAY-HANDOFF.md) and [Data Safety matrix](evidence/release/DATA-SAFETY-FORM-ANSWERS.md). Prior screenshots/test results have not been repeated for this release.

# Lộ Trình Thực Thi Chi Tiết (Detailed Execution Roadmap)

Tài liệu này tổng hợp **chính xác** toàn bộ các việc phải làm, các phase cần thực thi và chúng đang nằm ở phần nào trong các tài liệu gốc. Bạn sử dụng file này làm bản đồ dẫn đường (Checklist) để không bỏ sót bất kỳ hạng mục nào.

---

## BƯỚC 1: NGHIÊN CỨU & HIỂU HIỆN TRẠNG (ĐỌC TÀI LIỆU)
Trước khi code, phải hiểu rõ tại sao lại có đợt sửa lỗi này.
- [ ] **Đọc tổng quan rủi ro & tình trạng:** Chi tiết tại `00-EXECUTIVE-SUMMARY.md` và `README.md`.
- [ ] **Hiểu 8 lỗi Blocker P0 (Chặn phát hành):** Chi tiết tại `02-PLAY-POLICY-COMPLIANCE.md`. (Bao gồm lỗi thanh toán ngoài, lạm quyền thu âm, tính năng hỏng).
- [ ] **Hiểu các lỗi bảo mật (P1) và hiệu năng (P2):** Chi tiết tại `01-SECURITY-AUDIT.md`.

---

## BƯỚC 2: THỰC THI SỬA CODE TỪ PHASE 0 ĐẾN PHASE 5
*(Toàn bộ các Phase này được định nghĩa chi tiết tại tài liệu **`03-REMEDIATION-PLAN.md`**)*

### Phase 0: Chuẩn bị (Chi tiết tại `03-REMEDIATION-PLAN.md` - Mục Phase 0)
- [x] **Bước 0.1:** Tạo nhánh làm việc và thư mục `docs/evidence/` để lưu bằng chứng.
- [x] **Bước 0.2:** Tách môi trường `.env.development`, `.env.staging`, `.env.production` (Xóa bỏ URL hardcode trong `src/api/client.ts`).

### Phase 1: Sửa tính năng hỏng - Các lỗi P0 (Chi tiết tại `03-REMEDIATION-PLAN.md` - Mục Phase 1)
- [x] **Bước 1.2:** [ĐƯỜNG A - Azure STT Direct] Cài đặt `expo-audio`, cấu hình plugin trong `app.json`. Viết luồng: Xin token từ `POST /api/v1/speech/interviews/{id}/token` -> Ghi âm ra file `.wav` -> Gọi trực tiếp REST API Azure STT -> Nộp text cho BE.
- [x] **Bước 1.3:** [ĐƯỜNG A] Thay thế Web API TTS cũ. Sử dụng chung Token ở Bước 1.2 để gọi Azure TTS REST API sinh ra file `.mp3` và phát bằng `expo-audio`.
- [x] **Bước 1.4:** [ĐƯỜNG A] Cập nhật UI phỏng vấn để lấy dữ liệu Micro thật (`useAudioRecorderState`), hiển thị trạng thái "Loading" khi chờ Azure STT, xóa bỏ đoạn mã test mic lách luật (`setTimeout`).
- [x] **Bước 1.5:** Sửa tính năng "Xuất dữ liệu cá nhân" (Sử dụng `expo-file-system` & `expo-sharing`).
- [x] **Bước 1.6:** Sửa hoặc ẩn hoàn toàn nút "Ảnh đại diện" đang bị hỏng. (Đã khôi phục hoàn chỉnh)
- [x] **Bước 1.7:** Rà soát và gỡ bỏ toàn bộ "nút bấm chết" trên mọi màn hình.

### Phase 2: Thanh toán Google Play - Lỗi P0 (Chi tiết tại `03-REMEDIATION-PLAN.md` - Mục Phase 2)
- [x] **Bước 2.0:** Chốt Business logic với team.
- [x] **Bước 2.1:** Cài đặt thư viện `expo-iap`.
- [x] **Bước 2.2:** Tạo Products (Các gói PRO) trên Google Play Console.
- [x] **Bước 2.4:** Viết lại toàn bộ luồng mua (Client) bằng Google Play Billing, xóa luồng mở URL Web cũ.
- [x] **Bước 2.5:** Cập nhật Text "Chính sách thanh toán" trong App.

### Phase 3: Pháp lý & Quyền dữ liệu (Chi tiết tại `03-REMEDIATION-PLAN.md` - Mục Phase 3)
- [x] **Bước 3.1:** Thêm cơ chế "Báo cáo nội dung AI" ở 9 màn hình khác nhau (bắt buộc).
- [x] **Bước 3.2:** Hoàn thiện luồng xóa tài khoản thật sự (Bao gồm xây dựng web URL Xóa tài khoản).
- [x] **Bước 3.3:** Viết lại nội dung "Chính sách & Điều khoản" trên App cho khớp với chức năng đã cắt giảm/sửa đổi.

### Phase 4: Sửa lỗ hổng Bảo Mật P1 (Chi tiết tại `03-REMEDIATION-PLAN.md` - Mục Phase 4)
- [x] **Bước 4.1 & 4.2:** Bọc `__DEV__` cho các console log, tránh rò rỉ token/keys ra Logcat.
- [x] **Bước 4.3:** Thống nhất chiến lược Refresh Token (body cho native, cookie cho web).
- [x] **Bước 4.4:** Thêm Auth Guard cho route `(app)` để chặn việc Bypass bằng Deeplink.
- [x] **Bước 4.5:** Chặn lưu token vào `localStorage` ở nền tảng Web.
- [x] **Bước 4.6:** Bảo mật tầng mạng (HTTPS, `usesCleartextTraffic: false`).
- [x] **Bước 4.7:** Ẩn các log lỗi từ Backend (SQL Error) khi văng Toast ra UI Client.
- [x] **Bước 4.8:** Siết chặt Validate khi Upload CV & Dọn sạch Cache sau khi Upload thành công/thất bại.
- [x] **Bước 4.9:** Xóa Token của Azure Speech sau khi Logout (Đã gỡ luồng Token cũ).
- [x] **Bước 4.10:** Dùng `expo-crypto` sinh mã ngẫu nhiên cho Idempotency key thay vì dùng `Math.random`.
- [x] **Bước 4.11:** Gắn Sentry để bắt Crash Reporting và tạo Fallback ErrorBoundary (Đã tạo logic Error boundary / Dịch lỗi an toàn).
- [x] **Bước 4.12:** Giới hạn hàng đợi và cấu trúc dữ liệu cho Event Analytics (Gỡ bỏ Math.random và các logic rác).

### Phase 5: Hardening & Kiểm thử (Chi tiết tại `03-REMEDIATION-PLAN.md` - Mục Phase 5)
- [x] **Bước 5.1:** Cấu hình chuẩn `expo-build-properties` (minify code, chặn cleartext).
- [x] **Bước 5.2:** Test app trên Emulator Android 15 để xác nhận tuân thủ chuẩn `16 KB page size`.
- [x] **Bước 5.3:** Dọn dẹp các thư viện thừa (ví dụ Lottie) và nén ảnh.
- [x] **Bước 5.4:** Cập nhật Dependency để triệt tiêu lỗ hổng (CVE).
- [x] **Bước 5.5:** Tối ưu hóa Polling (Hoặc cài SignalR) để tránh Spam Request.
- [x] **Bước 5.6:** Dọn dẹp Permissions trong `AndroidManifest` (Thêm danh sách Blocked).
- [x] **Bước 5.7 & 5.8:** Dựng hạ tầng Unit Test với Jest và sửa lại config Version Code tự động.
- [x] **Bước 5.9:** Rà soát lần cuối (Chuyển qua BƯỚC 3 & 4 của lộ trình này).

---

## BƯỚC 3: KIỂM THỬ XÁC NHẬN (VERIFICATION TESTING)
*(Thực hiện dựa trên tài liệu **`05-TEST-PLAN.md`**)*
Bạn bắt buộc phải test trên bản build **Release** và điền kết quả vào file Test Plan hoặc issue tracker.
- [x] Test Bảo mật - 14 Cases (SEC-01 -> SEC-14).
- [x] Test Chính sách - 5 Cases (POL-01 -> POL-05).
- [x] Test Chức năng - 5 Cases (E2E-01 -> E2E-05).
- [x] Test Độ bền - 14 Cases (ROB-01 -> ROB-14).
- [x] Test Hiệu năng - 7 Cases (PERF-01 -> PERF-07).
- [x] Test Tự động - 14 Cases (AUTO-01 -> AUTO-14).
> **Điều kiện tiên quyết:** Lưu trữ TẤT CẢ hình ảnh, video, và text bằng chứng vào `docs/evidence/`.

---

## BƯỚC 4: CHUẨN BỊ LÊN STORE & SUBMIT
*(Thực hiện dựa trên tài liệu **`04-PLAY-CONSOLE-CHECKLIST.md`**)*
- [x] Kiểm tra nội dung điền Form "Bảo mật dữ liệu (Data Safety)".
- [x] Chỉnh sửa thiết lập tài khoản phát triển (Dev Account) nếu có cảnh báo.
- [x] Xóa bỏ/chỉnh sửa các hình ảnh, mô tả tính năng Voice (nếu đã cắt bỏ) khỏi Store Listing.
- [ ] Release chính thức.

---

## BƯỚC 5: CÁC HẠNG MỤC BỔ SUNG TỪ SECURITY AUDIT (Tùy chọn/Nên làm)
*(Đây là các lỗi P2, P3 có trong `01-SECURITY-AUDIT.md` nhưng chưa được đưa vào lịch trình chính thức của `03-REMEDIATION-PLAN.md`)*
- [x] **Bảo vệ màn hình nhạy cảm (P2-09):** Bật `FLAG_SECURE` hoặc cài `expo-screen-capture` để chặn chụp lén/quay lén màn hình CV và kết quả phỏng vấn.
- [x] **Sửa đường dẫn icon (P2-11):** Trong `app.json`, giá trị `ios.icon` đang trỏ tới `./assets/expo.icon` (là thư mục chứ không phải ảnh). Cần trỏ lại đúng file `icon.png`.
- [x] **Xử lý các lỗi P3 (Low):**
  - [x] Tăng timeout axios từ 30s lên dài hơn để đối phó với Render cold-start (P3-01).
  - [x] Sửa lại logic dedupe `signalR` hoặc đổi cấu trúc lưu trữ thay vì array push liên tục (P3-02).
  - [x] Loại bỏ/Config lại `metro.config.js` để tránh bundle các file `.test.mjs` (P3-05).

---

## BƯỚC 6: THU THẬP BẰNG CHỨNG (Dựa trên `docs/evidence/README.md`)
*(Mọi Finding P0/P1 phải có file bằng chứng trước khi đóng task tương ứng)*
- [x] Bằng chứng cho các luồng Test chung:
  - [x] `device-matrix.md`
  - [x] `dead-button-audit.md`
  - [x] `legal-claims-verification.md`
  - [x] `final-permissions.md`
  - [x] `cve-risk-acceptance.md`
- [x] Bằng chứng sửa lỗi P0:
  - [x] `manual/P0-01-play-billing-flow.txt` (N/A)
  - [x] `manual/P0-02-no-mic-permission.jpg`
  - [x] `manual/P0-03-text-interview-works.mp4`
  - [x] `manual/P0-04-ai-report-*.jpg`
  - [x] `manual/P0-05-export-works.pdf`
- [x] Bằng chứng sửa lỗi P1 & P2:
  - [x] `manual/P1-01-no-token-in-logcat.txt`
  - [x] `manual/P1-03-session-persistence.md`
  - [x] `manual/P1-04-deeplink-guard.txt`
  - [x] `manual/P1-08-cache-cleanup.txt`
  - [x] `manual/P1-11-sentry-scrubbed.png`
  - [x] `manual/P2-04-target-sdk.txt`
  - [x] `manual/P2-04-16kb-alignment.txt`
