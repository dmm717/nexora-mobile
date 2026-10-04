import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ACCOUNT_DELETION_URL } from '@/constants/legal';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';
import { PublicDeletionLink } from './PublicDeletionLink';

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
        Bạn có thể yêu cầu xóa tại {ACCOUNT_DELETION_URL} mà không cần đăng nhập, kể cả khi không còn sử dụng ứng dụng. Nhập email gắn với tài khoản, mở liên kết xác minh trong email rồi chủ động xác nhận. Liên kết chỉ dùng một lần và hết hạn sau 30 phút. Việc gửi email hoặc chỉ mở trang xác nhận chưa gửi yêu cầu xóa. Đây là thời hạn xác minh email, không phải thời gian ân hạn xóa tài khoản. Chức năng xóa trực tiếp trong ứng dụng hoạt động độc lập với website.
      </ThemedText>
      <PublicDeletionLink colors={colors} />
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Phạm vi xử lý dữ liệu', colors, styles)}
      <View style={styles.bulletList}>
        {renderBullet('Khi xử lý hoàn tất, máy chủ xóa hồ sơ nghề nghiệp, CV và ảnh đại diện thuộc tài khoản trên Cloudflare R2, mô tả công việc, câu trả lời phỏng vấn, báo cáo AI, lộ trình học tập và báo cáo nội dung gắn với tài khoản. Lỗi lưu trữ hoặc lượt tải lên còn hiệu lực có thể làm việc hoàn tất chậm hơn.', colors, styles)}
        {renderBullet('Tài khoản bị vô hiệu hóa và các trường nhận diện được thay thế hoặc loại bỏ. Mã tài khoản giả danh vẫn có thể liên kết với giao dịch, quyền lợi, lịch sử sử dụng và audit được giữ lại để đối soát, bảo mật, tranh chấp và nghĩa vụ pháp luật. Không phải mọi bản ghi trở thành ẩn danh không thể liên kết.', colors, styles)}
        {renderBullet('Thông tin xác minh hết hạn và thông tin yêu cầu xóa đã hoàn tất đủ 12 tháng có thể thuộc diện dọn định kỳ, trừ trường hợp lưu giữ hợp pháp; việc dọn tự động chưa được áp dụng cho mọi dữ liệu. Mục tiêu 90 ngày cho lịch sử sử dụng không phục vụ kế toán và 30 ngày cho nhật ký chưa phải thời hạn xóa được bảo đảm; bản ghi tài chính không áp dụng mục tiêu 90 ngày.', colors, styles)}
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
