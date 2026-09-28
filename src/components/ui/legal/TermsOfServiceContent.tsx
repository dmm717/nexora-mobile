import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';

export const TermsOfServiceContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Áp dụng cho nền tảng Nexora AI Mobile</ThemedText>

    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Mục đích sử dụng', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI là sản phẩm hỗ trợ luyện tập phỏng vấn mô phỏng và nhận đánh giá phản hồi dựa trên tiêu chí tuyển dụng. Nền tảng tuyệt đối KHÔNG phải công cụ gian lận phỏng vấn trực tiếp, phần mềm nhắc bài thời gian thực, hay bất kỳ hình thức hỗ trợ ngầm nào trong phỏng vấn thật.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Tài khoản & gói sử dụng', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình. Các lượt phỏng vấn và tính năng AI được cấp hạn mức dựa trên gói tài khoản (FREE / PRO). Gói PRO được thanh toán thông qua Google Play Billing và tuân theo chính sách của Google Play.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Sở hữu trí tuệ', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Toàn bộ thuật toán, giao diện và nội dung câu hỏi được bảo hộ bản quyền bởi Nexora Platform. Người dùng sở hữu nội dung câu trả lời và hồ sơ cá nhân của mình.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Nội dung do AI tạo & Miễn trừ', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Tất cả nội dung đánh giá, nhận xét, điểm số, gợi ý STAR, lộ trình học tập, và phân tích CV trong Nexora AI đều được tạo tự động bởi mô hình AI. Nội dung này được đánh dấu rõ ràng với nhãn &quot;AI Generated&quot; tại nơi hiển thị. Kết quả AI chỉ mang tính chất tham khảo, không phải đánh giá của chuyên gia tuyển dụng thực tế.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('5', 'Cơ chế báo cáo nội dung AI', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nếu bạn phát hiện nội dung AI không phù hợp, xúc phạm, thiếu chính xác, phân biệt đối xử, hoặc vi phạm quyền riêng tư, bạn có thể báo cáo trực tiếp bằng cách nhấn nút &quot;🚩 Báo cáo&quot; ngay tại vị trí nội dung đó.
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Mỗi báo cáo được ghi nhận với mã định danh riêng và gửi tới đội ngũ kiểm duyệt.', colors, styles)}
        {renderBullet('Đội ngũ sẽ xem xét và phản hồi trong vòng 72 giờ (nội dung vi phạm nghiêm trọng) hoặc 7 ngày (nội dung khác).', colors, styles)}
        {renderBullet('Dữ liệu báo cáo được sử dụng để cải thiện bộ lọc và chất lượng nội dung AI.', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('6', 'Quyền riêng tư & Thu âm', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI chỉ sử dụng microphone khi bạn chủ động bắt đầu phỏng vấn bằng giọng nói và đã cấp quyền. Ứng dụng không ghi âm dưới nền, không ghi âm khi ở chế độ nền, và file ghi âm được xóa khỏi thiết bị ngay sau khi xử lý xong.
      </ThemedText>
    </View>
  </View>
);
