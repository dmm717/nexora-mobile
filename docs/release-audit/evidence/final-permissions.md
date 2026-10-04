> HISTORICAL / SUPERSEDED — 2026-10-04: Original audit/plan/evidence retained below. Billing implementation, checkout steering, retention/recovery, universal policy PASS and binary-certification claims are not current release evidence. See [current handoff](../../release/GOOGLE-PLAY-HANDOFF.md) and [Data Safety matrix](../../evidence/release/DATA-SAFETY-FORM-ANSWERS.md). Prior screenshots/test results have not been repeated for this release.

# Danh sách quyền cuối cùng của ứng dụng (Android Permissions)

Dưới đây là danh sách những quyền bị chặn và những quyền được phép sử dụng (dựa theo kết quả cấu hình `app.json` và Expo Prebuild).

## Danh sách quyền bị CHẶN HOÀN TOÀN (Blocked)
1. `android.permission.ACCESS_FINE_LOCATION`
2. `android.permission.ACCESS_COARSE_LOCATION`
3. `android.permission.READ_CONTACTS`
4. `android.permission.CAMERA`
5. `android.permission.READ_EXTERNAL_STORAGE`
6. `android.permission.WRITE_EXTERNAL_STORAGE`
7. `android.permission.READ_PHONE_STATE`
8. `android.permission.QUERY_ALL_PACKAGES`
9. `android.permission.SYSTEM_ALERT_WINDOW`
10. `android.permission.RECEIVE_BOOT_COMPLETED`

## Danh sách quyền được PHÉP (Sử dụng thực tế)
1. `android.permission.INTERNET` - Yêu cầu bắt buộc để gọi API và upload/download CV/JD.
2. `android.permission.RECORD_AUDIO` - (Yêu cầu qua `expo-audio`) để thực hành phỏng vấn bằng giọng nói.
3. Billing - Dùng cho In-app Purchases qua thư viện `expo-iap`.
4. `android.permission.READ_MEDIA_IMAGES` - Hỗ trợ thư viện ảnh qua `expo-image-picker`.

Tất cả các quyền rác đã bị xóa hoặc add vào block-list, đảm bảo tuân thủ nghiêm ngặt chuẩn Play Store.
