import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ACCOUNT_DELETION_URL, PRIVACY_URL, SUPPORT_EMAIL, WEBSITE_URL } from '@/constants/legal';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';
import { PublicDeletionLink } from './PublicDeletionLink';

export const PrivacyPolicyContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Cập nhật lần cuối: 04 tháng 10, 2026</ThemedText>
    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Dữ liệu dùng để cung cấp dịch vụ', colors, styles)}
      <View style={styles.bulletList}>
        {renderBullet('Tài khoản: Email, tên hiển thị, mã người dùng và thông tin xác thực được gửi tới máy chủ để đăng ký, đăng nhập và quản lý tài khoản. Mật khẩu được băm tại máy chủ.', colors, styles)}
        {renderBullet('Nghề nghiệp: CV tải lên, mô tả công việc, mục tiêu và hồ sơ nghề nghiệp, câu trả lời phỏng vấn, báo cáo AI, đánh giá kỹ năng và tiến độ học tập được xử lý để cung cấp các tính năng bạn sử dụng.', colors, styles)}
        {renderBullet('Ảnh đại diện: Ảnh bạn chọn tải lên được gửi tới máy chủ và hệ thống lưu trữ để hiển thị hồ sơ.', colors, styles)}
        {renderBullet('Giọng nói tùy chọn: Khi bạn bật chức năng giọng nói và cấp quyền microphone, âm thanh được ghi vào tệp tạm rồi gửi tới Azure Speech để chuyển thành văn bản. Văn bản trả lời được gửi tới máy chủ khi bạn nộp câu trả lời. Nội dung cần đọc được gửi tới Azure Speech để tổng hợp giọng nói. Ứng dụng cố gắng xóa tệp âm thanh tạm sau xử lý; điều này không xác định thời hạn lưu trữ ở nhà cung cấp.', colors, styles)}
        {renderBullet('Giao dịch: Ứng dụng nhận quyền lợi tài khoản, hạn mức và lịch sử đơn hàng từ máy chủ. Ứng dụng Android không trực tiếp thu thập thông tin thẻ thanh toán.', colors, styles)}
        {renderBullet('Phản hồi và báo cáo nội dung: Nội dung bạn gửi được chuyển tới máy chủ để tiếp nhận phản hồi và xem xét nội dung AI. Nếu bạn bật cho phép hiển thị công khai, đánh giá đã được duyệt có thể xuất hiện trên website cùng tên hiển thị và ảnh đại diện; bạn có thể thay đổi lựa chọn hoặc xóa đánh giá trong ứng dụng.', colors, styles)}
      </View>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Đơn vị xử lý & chẩn đoán', colors, styles)}
      <View style={styles.bulletList}>
        {renderBullet('Render vận hành máy chủ Nexora; Neon PostgreSQL lưu dữ liệu tài khoản và tính năng. CV và ảnh đại diện được lưu dưới dạng đối tượng riêng tư trên Cloudflare R2. Resend xử lý email nhận thông báo xác minh và khôi phục tài khoản, bao gồm xác minh yêu cầu xóa.', colors, styles)}
        {renderBullet('Nexora trích xuất văn bản PDF/DOCX tại máy chủ, không sử dụng dịch vụ OCR bên ngoài. PDF chỉ chứa ảnh hoặc bản scan có thể không đọc được; hãy dùng PDF có văn bản hoặc DOCX. Văn bản CV đã trích xuất, mô tả công việc, mục tiêu nghề nghiệp và câu trả lời liên quan được gửi tới DeepSeek API để cung cấp phân tích, phản hồi và luyện tập AI. Không gửi thông tin nhạy cảm không cần thiết hoặc dữ liệu của người khác khi chưa được phép.', colors, styles)}
        {renderBullet('Microsoft Azure Speech nhận âm thanh cho chuyển giọng nói thành văn bản và nội dung văn bản cho tổng hợp giọng nói.', colors, styles)}
        {renderBullet('Ứng dụng Mobile không tích hợp Sentry và không tự động gửi báo cáo lỗi qua SDK phân tích. Máy chủ và hạ tầng có thể xử lý nhật ký kỹ thuật, địa chỉ IP và thông tin yêu cầu để bảo mật, xử lý lỗi và vận hành dịch vụ. Việc này khác với nội dung phản hồi bạn chủ động gửi.', colors, styles)}
        {renderBullet('Các nhà cung cấp nhận dữ liệu để thực hiện những chức năng nêu trên. Việc lưu giữ và xử lý tại các dịch vụ đó phụ thuộc điều khoản áp dụng và nghĩa vụ pháp luật; Nexora không cam kết không lưu dữ liệu, không huấn luyện mô hình hoặc xóa ngay mọi bản sao. Liên hệ Nexora để yêu cầu thông tin hoặc thực hiện quyền về dữ liệu.', colors, styles)}
      </View>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Quyền truy cập & lựa chọn', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Microphone là tùy chọn và chỉ được yêu cầu khi bạn chọn sử dụng giọng nói. Bạn có thể từ chối hoặc thu hồi quyền trong cài đặt hệ thống và dùng chế độ văn bản. Bạn chọn tệp CV và ảnh đại diện khi muốn tải lên.
      </ThemedText>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Truy cập, xuất & xóa dữ liệu', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Bạn có thể xem và chỉnh sửa hồ sơ, xuất dữ liệu trong Cài đặt tài khoản, và gửi yêu cầu xóa trực tiếp tại Khu vực nguy hiểm khi đăng nhập. Bạn cũng có thể yêu cầu tại {ACCOUNT_DELETION_URL} mà không cần đăng nhập: nhập email gắn với tài khoản, mở liên kết xác minh rồi chủ động xác nhận. Liên kết chỉ dùng một lần, hết hạn sau 30 phút; gửi email hoặc mở trang chưa gửi yêu cầu xóa. Xem mục Xóa dữ liệu trong ứng dụng để biết phạm vi xử lý và dữ liệu giữ lại.
      </ThemedText>
      <PublicDeletionLink colors={colors} />
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('5', 'Lưu trữ & bảo mật', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Kết nối API trong bản phát hành và dịch vụ giọng nói sử dụng HTTPS. Khi yêu cầu xóa được chấp nhận, tài khoản bị chặn truy cập và yêu cầu được xử lý theo hàng đợi. Khi hoàn tất, dữ liệu nghề nghiệp và tệp thuộc tài khoản được xóa; các trường nhận diện tài khoản được thay thế hoặc loại bỏ. Mã tài khoản giả danh vẫn có thể gắn với giao dịch, quyền lợi, lịch sử sử dụng và nhật ký kiểm tra để đối soát, bảo mật, xử lý tranh chấp và tuân thủ pháp luật; không phải ẩn danh không thể liên kết. Các mục tiêu lưu nhật ký 30 ngày, lịch sử sử dụng không phục vụ kế toán 90 ngày và thông tin yêu cầu xóa tối thiểu 12 tháng không phải cam kết tự động xóa đang áp dụng cho mọi dữ liệu. Trường hợp lưu giữ hợp pháp có thể được miễn xóa. Bản sao lưu và dữ liệu tại nhà cung cấp có vòng đời riêng; không cam kết xóa ngay hoặc hoàn tất sau đúng 30 ngày.
      </ThemedText>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('6', 'Website & thông tin liên hệ', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Website chính thức: {WEBSITE_URL}. Chính sách công khai: {PRIVACY_URL}. Email liên hệ chính thức: {SUPPORT_EMAIL}.
      </ThemedText>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('7', 'Giới hạn độ tuổi', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI là dịch vụ hỗ trợ sự nghiệp và ứng tuyển dành cho người dùng từ 18 tuổi trở lên.
      </ThemedText>
    </View>
  </View>
);
