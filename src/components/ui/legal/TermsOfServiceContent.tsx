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
        Nexora là sản phẩm hỗ trợ luyện tập phỏng vấn và nhận đánh giá phản hồi dựa trên tiêu chí tuyển dụng. Nền tảng tuyệt đối KHÔNG phải công cụ gian lận phỏng vấn trực tiếp hay phần mềm nhắc bài thời gian thực.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Tài khoản & gói sử dụng', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình. Các lượt phỏng vấn và tính năng AI được cấp hạn mức dựa trên gói tài khoản (FREE / PRO).
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Sở hữu trí tuệ', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Toàn bộ thuật toán, giao diện và nội dung câu hỏi được bảo hộ bản quyền bởi Nexora Platform. Người dùng sở hữu nội dung câu trả lời và hồ sơ cá nhân của mình.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Nội dung phản hồi AI', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Các nhận xét và điểm số được khởi tạo tự động bởi mô hình AI dựa trên tiêu chí tuyển dụng. Nếu bạn phát hiện phản hồi AI không phù hợp hoặc không chính xác, bạn có thể gửi báo cáo trực tiếp thông qua tính năng "Đánh giá & Góp ý" tích hợp trong ứng dụng.
      </ThemedText>
    </View>
  </View>
);
