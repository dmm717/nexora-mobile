import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ACCOUNT_DELETION_URL } from '@/constants/legal';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';

export const DataDeletionContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Yêu cầu xóa tài khoản Nexora</ThemedText>
    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Yêu cầu trong ứng dụng', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Khi đã đăng nhập, vào Cài đặt tài khoản → Khu vực nguy hiểm → Yêu cầu xóa tài khoản. Đọc thông tin và nhập chữ XÓA hoặc email của bạn để xác nhận. Khi máy chủ chấp nhận, phiên đăng nhập sẽ được kết thúc và yêu cầu được đưa vào quy trình xử lý.
      </ThemedText>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Yêu cầu qua website', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Kênh dành cho người không thể đăng nhập đang được triển khai tại {ACCOUNT_DELETION_URL}. Trang này chưa được xác minh sẵn sàng. Khi được triển khai, bạn có thể yêu cầu qua website bằng xác minh email; liên kết xác minh hết hạn sau 30 phút. Đây là thời hạn xác minh email, không phải thời gian ân hạn xóa tài khoản. Chức năng xóa trong ứng dụng hoạt động độc lập với website.
      </ThemedText>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Phạm vi xử lý dữ liệu', colors, styles)}
      <View style={styles.bulletList}>
        {renderBullet('Quy trình máy chủ xóa hồ sơ nghề nghiệp, CV và ảnh đại diện đã lưu, mô tả công việc, câu trả lời phỏng vấn, báo cáo AI, lộ trình học tập và báo cáo nội dung gắn với tài khoản.', colors, styles)}
        {renderBullet('Thông tin định danh tài khoản được ẩn danh hóa. Một số bản ghi giao dịch, quyền lợi, sử dụng và yêu cầu xóa được giữ lại trên máy chủ; thời hạn lưu trữ cần được Nexora xác nhận theo chính sách áp dụng.', colors, styles)}
        {renderBullet('Việc xử lý bản sao lưu và dữ liệu tại nhà cung cấp phụ thuộc quy trình lưu trữ của các bên đó; việc gửi yêu cầu không có nghĩa mọi bản sao bị xóa ngay.', colors, styles)}
      </View>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Trạng thái xử lý', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Máy chủ ghi nhận thời điểm yêu cầu và trạng thái xử lý. Không có ngày hoàn tất được cam kết trong ứng dụng. Ứng dụng không cung cấp chức năng hủy yêu cầu hoặc khôi phục tài khoản bằng đăng nhập lại.
      </ThemedText>
    </View>
  </View>
);
