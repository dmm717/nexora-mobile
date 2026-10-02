# Hướng dẫn Kiểm thử thủ công để Thu thập Bằng chứng (Bước 6)

Để hoàn tất BƯỚC 6 trong file `06-EXECUTION-ORDER.md`, bạn cần thực hiện kiểm thử trên thiết bị thật hoặc máy ảo và chụp lại màn hình 5 trường hợp sau. Sau khi có ảnh, hãy đổi tên file theo đúng chuẩn và lưu vào thư mục `docs/evidence/`.

---

### 1. Xử lý khi từ chối quyền Micro (`manual/P0-02-no-mic-permission.jpg`)
* **Mục đích:** Chứng minh ứng dụng không bị văng (crash) khi không có quyền truy cập micro.
* **Cách thực hiện:**
  1. Vào **Cài đặt hệ điều hành** (OS Settings) -> Ứng dụng Nexora -> Tắt quyền Microphone. (Hoặc nhấn "Từ chối" ở lần đầu app xin quyền).
  2. Mở ứng dụng và bắt đầu tính năng "Phỏng vấn bằng giọng nói".
* **Ghi nhận:** Chụp màn hình thông báo lỗi yêu cầu cấp quyền hiển thị rõ ràng hoặc giao diện tự động chuyển sang chế độ nhắn tin (Text).

### 2. Phỏng vấn bằng văn bản (`manual/P0-03-text-interview-works.mp4`)
* **Mục đích:** Đảm bảo luồng dự phòng (hoặc luồng được chọn chủ động) cho phỏng vấn text hoạt động trơn tru.
* **Cách thực hiện:**
  1. Bắt đầu một buổi phỏng vấn AI, chọn chế độ **Nhắn tin (Text)**.
  2. Tương tác 1-2 câu với AI để đảm bảo luồng hội thoại được xử lý hai chiều.
* **Ghi nhận:** Chụp màn hình đoạn hội thoại cho thấy AI nhận và phản hồi văn bản chính xác.

### 3. Báo cáo đánh giá AI (`manual/P0-04-ai-report-*.jpg`)
* **Mục đích:** Đảm bảo dữ liệu báo cáo được render hiển thị đúng thiết kế sau cuộc phỏng vấn.
* **Cách thực hiện:**
  1. Hoàn thành một buổi phỏng vấn (Voice hoặc Text).
  2. Nhấn "Kết thúc" và đợi hệ thống tạo báo cáo.
* **Ghi nhận:** Chụp màn hình toàn cảnh kết quả đánh giá (bao gồm Điểm số, Nhận xét, Điểm mạnh/yếu). Dấu `*` trong tên file mang ý nghĩa bạn có thể cung cấp nhiều ảnh nếu báo cáo quá dài (ví dụ: `manual/P0-04-ai-report-1.jpg`).

### 4. Xuất / Chia sẻ Báo cáo (`manual/P0-05-export-works.pdf`)
* **Mục đích:** Kiểm tra tính năng Export/Share hoạt động trên hệ điều hành native.
* **Cách thực hiện:**
  1. Tại màn hình Báo cáo Đánh giá (bước 3), nhấn vào nút **Xuất (Export) / Chia sẻ (Share)**.
* **Ghi nhận:** Chụp màn hình lúc hộp thoại Chia sẻ của hệ điều hành (Share Sheet) hoặc trình xem file PDF native đang hiển thị thành công.

### 5. Sentry che dữ liệu nhạy cảm (`manual/P1-11-sentry-scrubbed.png`)
* **Mục đích:** Chứng minh Token và dữ liệu cá nhân không bị đẩy lên server Log dưới dạng plain-text.
* **Cách thực hiện (Trên Web máy tính):**
  1. Truy cập vào trang quản trị web của **Sentry.io** và mở Project Nexora Mobile.
  2. Chọn một Issue (lỗi) bất kỳ vừa được gửi lên từ thiết bị của bạn.
  3. Cuộn xuống phần **Headers** hoặc **Request Data**.
* **Ghi nhận:** Chụp màn hình dòng `Authorization` (hoặc các trường nhạy cảm khác). Tại đó, giá trị Token phải được che đi bằng các chuỗi như `[Filtered]`, `[Scrubbed]` hoặc `***`.

