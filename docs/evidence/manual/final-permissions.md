> HISTORICAL / SUPERSEDED — 2026-10-04: Original audit/plan/evidence retained below. Billing implementation, checkout steering, retention/recovery, universal policy PASS and binary-certification claims are not current release evidence. See [current handoff](../../release/GOOGLE-PLAY-HANDOFF.md) and [Data Safety matrix](../release/DATA-SAFETY-FORM-ANSWERS.md). Prior screenshots/test results have not been repeated for this release.

# Báo cáo Quyền ứng dụng (Final Permissions)

**Nguồn:** `app.json`
**Ngày:** 2026-10-02

## 1. Quyền bị chặn (Blocked Permissions)
Ứng dụng đã chủ động loại bỏ (block) các quyền không cần thiết trên Android để tuân thủ chính sách tối giản và bảo vệ quyền riêng tư:
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.READ_CONTACTS`
- `android.permission.CAMERA`
- `android.permission.READ_EXTERNAL_STORAGE`
- `android.permission.WRITE_EXTERNAL_STORAGE`
- `android.permission.READ_PHONE_STATE`
- `android.permission.QUERY_ALL_PACKAGES`
- `android.permission.SYSTEM_ALERT_WINDOW`
- `android.permission.RECEIVE_BOOT_COMPLETED`

## 2. Quyền thực tế yêu cầu
Ứng dụng chỉ xin cấp 2 quyền (thông qua plugins) theo đúng chức năng:
- **Microphone:** `"Nexora cần quyền truy cập microphone để bạn thực hành phỏng vấn qua giọng nói."` (Qua `expo-audio` / `NSMicrophoneUsageDescription`).
- **Thư viện ảnh:** `"Nexora cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện."` (Qua `expo-image-picker`).

**Kết luận:** Quyền ứng dụng hoàn toàn khớp với tài liệu và không có quyền lạ.
