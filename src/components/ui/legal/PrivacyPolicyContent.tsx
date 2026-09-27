import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';

export const PrivacyPolicyContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Cập nhật lần cuối: 25.09.2026</ThemedText>

    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Thu thập dữ liệu', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI cam kết bảo vệ thông tin riêng tư của ứng viên. Chúng tôi thu thập các dữ liệu cần thiết để phục vụ trải nghiệm luyện phỏng vấn:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Thông tin tài khoản: Email, tên hiển thị, mật khẩu được mã hóa qua ASP.NET Core Identity.', colors, styles)}
        {renderBullet('Hồ sơ nghề nghiệp: Nội dung CV, Mô tả công việc (JD), lịch sử các buổi phỏng vấn thử.', colors, styles)}
        {renderBullet('Giọng nói & Âm thanh: Dữ liệu ghi âm giọng nói khi thực hiện phỏng vấn (chỉ dùng cho chuyển đổi văn bản và phân tích giọng nói).', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Sử dụng & bảo mật dữ liệu AI', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Tất cả dữ liệu câu trả lời và thông tin hồ sơ được truyền qua kết nối mã hóa TLS/HTTPS tới hệ thống backend. Nexora không bao giờ chia sẻ hoặc bán dữ liệu cá nhân của ứng viên cho bên thứ ba vì mục đích quảng cáo.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Quyền của ứng viên & lưu trữ', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Bạn có toàn quyền trích xuất bản sao dữ liệu cá nhân (định dạng JSON) hoặc yêu cầu xóa toàn bộ lịch sử và tài khoản người dùng trực tiếp trong ứng dụng. Dữ liệu cá nhân chỉ được lưu trữ trong thời gian tài khoản hoạt động và được xóa vĩnh viễn trong vòng 30 ngày sau khi tiếp nhận yêu cầu.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Quyền truy cập thiết bị & ghi âm', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Ứng dụng yêu cầu quyền truy cập Micro duy nhất cho mục đích thu âm câu trả lời phỏng vấn thử nghiệm bằng giọng nói. Dữ liệu âm thanh không bao giờ được ghi âm ngầm hay chạy dưới nền khi ứng dụng không thực hiện phỏng vấn.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('5', 'Giới hạn độ tuổi & trẻ em', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI là dịch vụ hỗ trợ sự nghiệp và ứng tuyển dành cho người dùng từ 18 tuổi trở lên (hoặc từ 13 tuổi với sự giám sát của người giám hộ). Chúng tôi không chủ động thu thập thông tin cá nhân của trẻ em dưới 13 tuổi.
      </ThemedText>
    </View>
  </View>
);
