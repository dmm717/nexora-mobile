# Published Privacy edits — owner/admin approval required

**Draft only. Nothing published by this PR.** Date: 2026-10-04.
Public pages are FE shells; legal Markdown is owned by BE Site Content. Mobile changes do not update them.
Current public Privacy and Terms contact already matches nexorainterview.vn@gmail.com; do not overwrite it with an old address.
Read-only public privacy published timestamp: 2026-10-04T13:52:52.835691+00:00. Re-read before editing; this is not an optimistic-lock token.

## Proposed drafts — NOT yet approved or published

The paired Backend PR includes complete docs/release/site-content/privacy-proposed.vi.md, terms-proposed.vi.md, exact public snapshots/diffs and PUBLICATION-CHECKLIST.md. Those files supersede these paragraph examples. Reconcile fresh public/admin drafts; obtain current tokens from authenticated admin GET, never public timestamps. No new effective date selected.

## Proposed draft replacements

Preserve all unaffected paragraphs/title. These drafts describe the owner-confirmed architecture and Render deployed OCR-removal commit; owner must confirm actual AI configuration and controller identity before publishing.

### Privacy section 3 — processing of AI and optional voice

Replace generic provider paragraphs with:

> Nexora lưu CV dưới dạng đối tượng riêng tư trên Cloudflare R2 và trích xuất văn bản PDF/DOCX tại máy chủ. Nexora không sử dụng dịch vụ OCR bên ngoài; PDF chỉ chứa ảnh hoặc bản scan có thể không đọc được. Văn bản CV đã trích xuất và nội dung liên quan như mô tả công việc, mục tiêu nghề nghiệp và câu trả lời được gửi tới DeepSeek API để cung cấp phân tích, phản hồi và luyện tập AI. Không gửi dữ liệu nhạy cảm không cần thiết hoặc thông tin của người khác khi chưa được phép.
>
> Khi bạn chủ động sử dụng chức năng giọng nói và cấp quyền microphone, âm thanh được gửi tới Microsoft Azure Speech để chuyển thành văn bản; nội dung cần đọc được gửi tới Azure Speech để tổng hợp giọng nói. Bạn có thể chọn chế độ văn bản. Ứng dụng cố gắng dọn tệp âm thanh tạm sau xử lý; văn bản trả lời được lưu khi bạn nộp.
>
> Việc xử lý và lưu giữ tại nhà cung cấp phụ thuộc điều khoản áp dụng và nghĩa vụ pháp luật. Nexora không cam kết không lưu dữ liệu, không huấn luyện mô hình hoặc xóa ngay mọi bản sao. Liên hệ Nexora để yêu cầu thông tin và thực hiện quyền về dữ liệu.

Do not replace this with “paid DeepSeek never trains/retains”. Shared=Yes is a Console declaration; policy prose should explain the real transfer rather than promise a processor role not established.

### Privacy section 4 — named infrastructure and diagnostics

Replace generic infrastructure wording with:

> Render vận hành máy chủ Nexora; Neon PostgreSQL lưu dữ liệu tài khoản và tính năng. Cloudflare R2 lưu CV và ảnh đại diện riêng tư. Resend xử lý email xác minh, khôi phục và xác minh yêu cầu xóa tài khoản.
>
> Ứng dụng Mobile trong bản phát hành mới không tích hợp Sentry hoặc tự động gửi báo cáo lỗi qua SDK phân tích. Máy chủ và hạ tầng có thể xử lý nhật ký kỹ thuật, địa chỉ IP và thông tin yêu cầu để bảo mật, xử lý lỗi và vận hành. Điều này khác với phản hồi hoặc báo cáo nội dung bạn chủ động gửi.

Qualify “bản phát hành mới” until new Mobile code is actually distributed. Do not claim existing old binaries already lost Sentry.

### Privacy section 5 — public feedback

Keep moderation/explicit consent. Add:

> Nhận xét không mặc định công khai trong ứng dụng Mobile mới. Nếu bạn cho phép hiển thị, nhận xét đã được duyệt có thể xuất hiện trên website cùng tên hiển thị và ảnh đại diện. Bạn có thể thay đổi lựa chọn hoặc xóa đánh giá.

Check website flow defaults independently; do not claim all clients default private.

### Privacy section 8 — deletion and retention

Replace vague irreversible-anonymization/internal-engineering language with:

> Khi yêu cầu xóa được chấp nhận, tài khoản bị chặn truy cập và yêu cầu được xử lý theo hàng đợi, không phải cam kết hoàn tất ngay. Khi hoàn tất, Nexora xóa dữ liệu nghề nghiệp và tệp thuộc tài khoản, thay thế hoặc loại bỏ các trường nhận diện tài khoản. Lượt tải lên còn hiệu lực hoặc lỗi lưu trữ có thể làm việc hoàn tất chậm hơn.
>
> Mã tài khoản giả danh vẫn có thể gắn với giao dịch, quyền lợi, lịch sử sử dụng và audit để đối soát, bảo mật, tranh chấp và nghĩa vụ pháp luật. Việc này không phải ẩn danh không thể liên kết.
>
> Thông tin xác minh hết hạn và thông tin yêu cầu xóa đã hoàn tất đủ 12 tháng có thể thuộc diện dọn định kỳ, trừ trường hợp lưu giữ hợp pháp. Các mục tiêu nhật ký 30 ngày và lịch sử sử dụng không phục vụ kế toán 90 ngày chưa phải thời hạn xóa được bảo đảm. Không cam kết mọi dữ liệu được tự động xóa theo các mốc này; bản ghi tài chính được giữ khi cần thiết. Bản sao lưu và dữ liệu tại nhà cung cấp có vòng đời riêng.
>
> Bạn có thể yêu cầu xóa trong Cài đặt tài khoản hoặc tại https://www.nexorainterview.io.vn/account-deletion không cần đăng nhập. Liên kết xác minh email chỉ dùng một lần, hết hạn sau 30 phút; đây không phải thời gian ân hạn 30 ngày. Chỉ khi bạn chủ động xác nhận và máy chủ chấp nhận thì yêu cầu mới được gửi. Không có chức năng hủy yêu cầu hoặc khôi phục bằng đăng nhập lại.

Owner/legal must approve retained purposes/necessary duration; no unspecified universal lifetime or provider-backup erasure deadline is invented.

### Privacy section 9 / identity

Keep official contact: **nexorainterview.vn@gmail.com**.
Owner must supply legal/publisher/controller identity matching Play listing; do not invent a corporation/address.

### Terms compatibility (separate page approval)

Preserve legitimate WEBSITE payment paths; this is not removal of web monetization. Add:

> Ứng dụng Android chỉ sử dụng quyền lợi hiện có của tài khoản, không xử lý mua hàng hoặc hướng người dùng tới thanh toán ngoài ứng dụng. Các kết quả AI là hỗ trợ luyện tập, có thể sai, không dự đoán tuyển dụng hoặc xác minh kinh nghiệm. Một số điểm được máy chủ tính từ tiêu chí đánh giá.

No unsupported every-report-accepted promise. Reporting code is corrected by the paired patches; coordinated migration/deployment and device moderation remain required. Legal wording is not proof of rollout.

## Admin sequence (do not execute without owner publication approval)

1. Owner approves paragraphs above, sharing choice, identity and actual provider settings.
2. Authorized Admin: `GET /api/v1/admin/site-pages/privacy`. Save private rollback copy outside source control; never include tokens/account data in PR.
3. Preserve current title/about/effectiveAt; edit only bodyMarkdown sections specified. Choose effective date only with owner approval.
4. `PUT /api/v1/admin/site-pages/privacy` with JSON:
   `{ "title": "<current title>", "bodyMarkdown": "<complete edited current Markdown>", "about": null, "effectiveAt": "<owner-approved ISO date or preserved value>", "concurrencyToken": "<latest GET token>" }`.
   This updates draft, not publication. Do not send a partial body that discards other sections.
5. Independent legal/owner review of draft preview.
6. ONLY after approval: `POST /api/v1/admin/site-pages/privacy/publish` with `{ "concurrencyToken": "<token from successful PUT>" }`.
7. Repeat GET/draft/review/publish separately for terms if approved.
8. On 409 re-read and reconcile; never overwrite another admin's draft. 401/403 means stop/obtain legitimate access, not bypass.
9. Public GET `/api/v1/public/pages/privacy` and website `/privacy`; allow 300-second public cache. Verify exact paragraphs, official email, links and mobile consistency. Public 404 is not “published”.
10. Do not run deletion or upload calls merely to validate legal text.

No FE code change is required for these Site Content edits. No production content write was made in this task.

