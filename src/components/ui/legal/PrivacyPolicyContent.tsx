import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';

export const PrivacyPolicyContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Cập nhật lần cuối: 28 tháng 9, 2026</ThemedText>

    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Thu thập dữ liệu', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI cam kết bảo vệ thông tin riêng tư của ứng viên. Chúng tôi thu thập các dữ liệu cần thiết để phục vụ trải nghiệm luyện phỏng vấn:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Thông tin tài khoản: Email, tên hiển thị, mật khẩu được mã hóa qua ASP.NET Core Identity.', colors, styles)}
        {renderBullet('Hồ sơ nghề nghiệp: Nội dung CV, Mô tả công việc (JD), lịch sử các buổi phỏng vấn mô phỏng.', colors, styles)}
        {renderBullet('Giọng nói: Khi bạn chọn phỏng vấn bằng giọng nói, âm thanh được ghi và gửi tới Microsoft Azure Speech Services để chuyển đổi thành văn bản. File ghi âm được xóa khỏi thiết bị ngay sau khi xử lý. Dữ liệu âm thanh không được sử dụng để huấn luyện mô hình AI của bất kỳ bên nào.', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Bên thứ ba nhận dữ liệu', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Để cung cấp dịch vụ, chúng tôi chia sẻ một phần dữ liệu với các nhà cung cấp sau. Dữ liệu KHÔNG được bán hoặc chia sẻ vì mục đích quảng cáo:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Microsoft Azure Speech Services: Nhận dữ liệu âm thanh ghi âm để chuyển đổi giọng nói thành văn bản (STT) và tổng hợp giọng nói (TTS).', colors, styles)}
        {renderBullet('Nhà cung cấp mô hình AI (Google Gemini / Azure OpenAI): Nhận nội dung câu trả lời và CV để phân tích, đánh giá và tạo phản hồi AI.', colors, styles)}
        {renderBullet('Sentry: Nhận dữ liệu crash report (đã loại bỏ thông tin cá nhân nhạy cảm) để theo dõi lỗi ứng dụng.', colors, styles)}
        {renderBullet('Nhà cung cấp hạ tầng máy chủ: Dữ liệu được lưu trữ trên các dịch vụ đám mây có tiêu chuẩn bảo mật quốc tế.', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Quyền truy cập thiết bị', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Ứng dụng chỉ yêu cầu quyền truy cập Microphone khi bạn chủ động chọn phỏng vấn bằng giọng nói. Quyền này có thể được thu hồi bất kỳ lúc nào trong cài đặt hệ thống. Nếu từ chối quyền mic, ứng dụng tự động chuyển sang chế độ phỏng vấn bằng văn bản. Ứng dụng tuyệt đối không ghi âm dưới nền hoặc khi ở chế độ nền.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Quyền của bạn', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Bạn có các quyền sau đối với dữ liệu cá nhân:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Quyền truy cập: Xem toàn bộ dữ liệu cá nhân trong ứng dụng.', colors, styles)}
        {renderBullet('Quyền xuất dữ liệu: Tải bản sao dữ liệu cá nhân dạng JSON (Cài đặt → Xuất dữ liệu).', colors, styles)}
        {renderBullet('Quyền chỉnh sửa: Cập nhật thông tin cá nhân, CV, mục tiêu nghề nghiệp bất kỳ lúc nào.', colors, styles)}
        {renderBullet('Quyền xóa: Yêu cầu xóa toàn bộ tài khoản và dữ liệu (Cài đặt → Khu vực nguy hiểm, hoặc qua trang web https://nexora.vn/xoa-tai-khoan).', colors, styles)}
        {renderBullet('Quyền phản đối: Báo cáo nội dung AI không phù hợp bằng nút "🚩 Báo cáo" ngay tại nơi nội dung hiển thị.', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('5', 'Lưu trữ & bảo mật', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Tất cả dữ liệu được truyền qua kết nối mã hóa TLS/HTTPS. Dữ liệu cá nhân chỉ được lưu trữ trong thời gian tài khoản hoạt động. Sau khi yêu cầu xóa, tài khoản bị vô hiệu hóa ngay lập tức và dữ liệu được xóa cứng hoàn toàn trong tối đa 30 ngày.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('6', 'Giới hạn độ tuổi', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI là dịch vụ hỗ trợ sự nghiệp và ứng tuyển dành riêng cho người dùng từ 18 tuổi trở lên. Chúng tôi không chủ động thu thập thông tin cá nhân của bất kỳ ai dưới 18 tuổi. Nếu phát hiện vi phạm, tài khoản sẽ bị vô hiệu hóa ngay lập tức.
      </ThemedText>
    </View>
  </View>
);
