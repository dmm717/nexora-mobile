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
        {renderBullet('Phản hồi và báo cáo nội dung: Nội dung bạn gửi được chuyển tới máy chủ để tiếp nhận phản hồi và xem xét nội dung AI.', colors, styles)}
      </View>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Đơn vị xử lý & chẩn đoán', colors, styles)}
      <View style={styles.bulletList}>
        {renderBullet('Máy chủ Nexora và nhà cung cấp hạ tầng/lưu trữ xử lý thông tin tài khoản, hồ sơ, tệp tải lên và dữ liệu tính năng. Nội dung cần phân tích được xử lý bởi dịch vụ AI do máy chủ cấu hình.', colors, styles)}
        {renderBullet('Microsoft Azure Speech nhận âm thanh cho chuyển giọng nói thành văn bản và nội dung văn bản cho tổng hợp giọng nói.', colors, styles)}
        {renderBullet('Sentry, khi được cấu hình, nhận sự kiện lỗi và dữ liệu chẩn đoán/hiệu năng. Ứng dụng tắt gửi thông tin cá nhân mặc định và lọc một số nội dung yêu cầu; bộ lọc không bảo đảm mọi sự kiện đều không chứa dữ liệu cá nhân.', colors, styles)}
        {renderBullet('Thông tin về lưu trữ, xử lý và sử dụng dữ liệu ở nhà cung cấp cần được xác nhận theo cấu hình và điều khoản dịch vụ áp dụng. Không thể suy ra rằng dữ liệu không được lưu hoặc không dùng cho huấn luyện chỉ từ việc dọn tệp tạm trên thiết bị.', colors, styles)}
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
        Kết nối API trong bản phát hành yêu cầu HTTPS; dịch vụ giọng nói sử dụng HTTPS. Máy chủ lưu dữ liệu phục vụ tài khoản và các tính năng. Yêu cầu xóa được xử lý theo hàng đợi; tài khoản bị chặn truy cập sau khi yêu cầu được chấp nhận. Một số bản ghi giao dịch, sử dụng và yêu cầu xóa được giữ lại, thông tin định danh được ẩn danh hóa. Thời hạn lưu trữ bản sao lưu và dữ liệu tại nhà cung cấp cần được Nexora xác nhận. Không có cam kết mọi dữ liệu bị xóa ngay hoặc hoàn tất sau đúng 30 ngày.
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
