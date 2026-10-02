# Hướng Dẫn Khai Báo Data Safety & Play Console

Tài liệu này cung cấp đáp án CHÍNH XÁC để bạn copy/paste vào form "Data Safety" và "App Content" trên Google Play Console, đảm bảo khớp 100% với code thực tế của Nexora AI và chính sách bảo mật đã cập nhật.

---

## 1. Data Safety (Bảo mật dữ liệu)

### Tổng quan (Overview)
- **App có thu thập hoặc chia sẻ dữ liệu không?** CÓ
- **Toàn bộ dữ liệu có được mã hóa khi truyền không?** CÓ (mã hóa qua HTTPS/TLS).
- **App có cung cấp cách để user xóa dữ liệu không?** CÓ (Xóa tài khoản trong Cài đặt).
- **App có tuân theo Families policy không?** KHÔNG (Target audience là 18+).

### Thu thập và Chia sẻ dữ liệu (Data types)

Bạn tick chọn các loại dữ liệu sau, và trả lời chi tiết cho TỪNG LOẠI như sau:

| Loại dữ liệu | Thu thập? | Chia sẻ? | Xử lý tạm thời? (Ephemeral) | Mục đích | Bắt buộc? |
|---|---|---|---|---|---|
| **Email address** | ✅ Có | ❌ Không | ❌ Không | App functionality, Account management | Có |
| **Name (Tên hiển thị)** | ✅ Có | ❌ Không | ❌ Không | App functionality, Account management | Có |
| **User IDs** | ✅ Có | ❌ Không | ❌ Không | App functionality, Account management | Có |
| **Purchase history** | ✅ Có | ❌ Không | ❌ Không | Account management | Có |
| **Files and docs (CV upload)** | ✅ Có | ✅ Có (Chia sẻ cho LLM Provider, AWS) | ❌ Không | App functionality | Có |
| **Voice or sound recordings** | ✅ Có | ✅ Có (Chia sẻ cho Microsoft Azure) | ✅ Có (Ephemeral - Xóa ngay sau STT) | App functionality | Không (Tùy chọn) |
| **Crash logs** | ✅ Có | ✅ Có (Chia sẻ cho Sentry) | ❌ Không | Analytics | Không (Tùy chọn) |

> ⚠️ **Quan trọng về "Chia sẻ" (Sharing):** 
> Vì ứng dụng Nexora gửi CV, câu trả lời, và giọng nói cho các dịch vụ AI bên thứ 3 (Gemini/OpenAI, Microsoft Azure), bạn BẮT BUỘC phải chọn **CÓ CHIA SẺ** đối với "Files and docs" và "Voice recordings" theo luật mới của Play Store về tích hợp AI.

---

## 2. AI-Generated Content (Nội dung do AI tạo)

Khi form Play Console hỏi về tính năng AI (AI-generated content):
- **App có chứa nội dung do AI tạo không?** CÓ.
- **Biện pháp chống sinh nội dung vi phạm:** Hệ thống sử dụng prompt guardrails kết hợp với content filter API của LLM provider.
- **Cơ chế report:** "Ứng dụng có tích hợp nút Report/Cờ Báo Cáo tại mọi vị trí hiển thị kết quả AI sinh ra, cho phép người dùng báo cáo mà không cần thoát app." (Đã code ở Bước 3.1).

---

## 3. Quyền (Permissions)
Nếu được yêu cầu giải trình về các quyền truy cập:
- **`RECORD_AUDIO`**: Sử dụng để thu âm giọng nói người dùng nhằm thực hiện tính năng phỏng vấn mô phỏng qua giọng nói (chuyển đổi Speech-to-Text). Không chạy ngầm.

---

## 4. Content Rating & Target Audience
- **Target Age:** Từ 18 tuổi trở lên (18+). (Tuyệt đối không chọn 13-17 để tránh dính Families Policy cực kỳ phức tạp).
- **Chứa nội dung người dùng tạo (UGC):** CÓ (Do có phần nhập câu trả lời phỏng vấn và upload CV).
- **Moderation:** Có cơ chế report nội dung xấu.

---

## 5. Chính sách hoàn tiền (Payments)
- Mọi giao dịch được xử lý 100% qua Google Play Billing. Chính sách hoàn tiền tuân thủ hoàn toàn quy định chuẩn của Google Play.

---

💡 **Hành động của bạn:**
1. Mở Play Console -> App Content.
2. Mở từng mục Data Safety, Target Audience, AI-generated content.
3. Bê nguyên xi các câu trả lời trên vào form.
4. Nhấn Save & Submit.
