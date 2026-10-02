# Hướng Dẫn Kiểm Thử Chính Sách (POL-01 -> POL-05)

Tài liệu này ghi chú lại những việc cần làm để hoàn tất BƯỚC 3 (Test Chính sách) trong lộ trình `06-EXECUTION-ORDER.md`.

## 🤖 1. Việc của AI (Tự động quét code và tạo Báo cáo)
AI sẽ tự động chạy các lệnh scan code để chấm đậu/rớt và tạo ra các file báo cáo lưu vào thư mục `docs/evidence/policy/` cho các case sau:
- **POL-01 (Thanh toán):** Quét code để làm bằng chứng là App không hề có bất kỳ thư viện `expo-iap` hay link web thanh toán nào vi phạm luật Google.
- **POL-02 (Tính năng hỏng):** Quét toàn bộ code để lùng sục và chứng minh App không có bất kỳ nút bấm "chết" nào (không xài `alert('Đang phát triển')` hay `onPress={() => {}}`).
- **POL-05 (Nội dung pháp lý):** Đối chiếu xem cách App xin quyền micro và HTTPS có khớp với các cam kết trong chính sách bảo mật không.

---

## 👤 2. Việc của Người dùng (Thao tác App và chụp 2 TẤM ẢNH)
Người dùng mở app trên điện thoại (hoặc Web) và test 2 trường hợp sau, chụp màn hình rồi kéo thả ảnh vào chat cho AI:

| Case ID | Thao tác cần làm | Yêu cầu bằng chứng |
|---|---|---|
| **POL-04 (Xóa tài khoản)** | 1. Vào màn hình Hồ sơ -> Cài đặt.<br>2. Bấm nút **Xóa tài khoản**. | 📸 **Chụp 1 tấm ảnh** hộp thoại/màn hình xác nhận xóa tài khoản (chứng minh app có tính năng xóa tài khoản hợp lệ). |
| **POL-03 (Báo cáo nội dung AI)** | 1. Mở lại một Bài phân tích CV hoặc một Bài phỏng vấn bất kỳ.<br>2. Bấm vào nút Cờ 🚩 hoặc **"Báo cáo nội dung"**. | 📸 **Chụp 1 tấm ảnh** màn hình báo cáo thành công. |

---
> **Lưu ý:** Sau khi nhận được 2 tấm ảnh trên, AI sẽ lập tức tạo ra file `POL-TEST-REPORT.md` để đóng sổ hạng mục Chính sách (POL).
