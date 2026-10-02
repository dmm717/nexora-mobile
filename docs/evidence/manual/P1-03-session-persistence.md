# Báo cáo Lưu trữ Phiên (Session Persistence)

**Ngày:** 2026-10-02
**Phương pháp:** Kiểm tra module `src/services/storage/index.ts` và `src/services/storage/tokenStorage.ts`.

## Cơ chế lưu trữ
- Ứng dụng sử dụng `expo-secure-store` để lưu trữ `accessToken` và `refreshToken`.
- `expo-secure-store` mã hóa dữ liệu cục bộ bằng Keystore (Android) và Keychain (iOS).
- Dữ liệu không được sao lưu (backup) lên Google Drive hoặc iCloud vì tùy chọn bảo mật mặc định của Keychain/Keystore.

## Quản lý vòng đời token
- Token được đọc một lần duy nhất vào bộ nhớ (in-memory) hoặc gọi bất đồng bộ mỗi khi Axios request được tạo.
- Khi người dùng đăng xuất, hàm `tokenStorage.clearTokens()` được gọi để xoá hoàn toàn token khỏi SecureStore.

**Kết luận:** Token và phiên làm việc được lưu trữ mã hóa và an toàn. Yêu cầu P1-03 được xác nhận hoàn thành.
