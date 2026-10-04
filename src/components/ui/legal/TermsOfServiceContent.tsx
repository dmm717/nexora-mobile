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
        Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình. Các lượt phỏng vấn và tính năng AI được cấp hạn mức dựa trên gói tài khoản (FREE / PRO). Ứng dụng Android chỉ sử dụng quyền lợi hiện có của tài khoản, không xử lý mua hàng. Hạn mức và thời hạn do máy chủ Nexora cung cấp. Nexora cũng hỗ trợ phân tích CV và phát triển nghề nghiệp.
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
        Nexora sử dụng AI để tạo câu hỏi, phản hồi, gợi ý STAR, lộ trình học tập và phân tích CV. Một số điểm số được máy chủ tính từ tiêu chí đánh giá. Nội dung AI có thể sai hoặc thiếu chính xác, chỉ hỗ trợ luyện tập, không dự đoán tuyển dụng hay xác minh kinh nghiệm của bạn.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('5', 'Cơ chế báo cáo nội dung AI', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nếu bạn phát hiện nội dung AI không phù hợp, xúc phạm, thiếu chính xác, phân biệt đối xử, hoặc vi phạm quyền riêng tư, hãy dùng nút báo cáo tại nội dung có hỗ trợ chức năng này. Chỉ khi máy chủ chấp nhận, báo cáo mới được ghi nhận; thông báo lỗi không có nghĩa báo cáo đã được gửi.
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Báo cáo được máy chủ chấp nhận có mã định danh để xem xét.', colors, styles)}
        {renderBullet('Báo cáo được gửi để xem xét; ứng dụng không cam kết thời hạn phản hồi cụ thể.', colors, styles)}
        {renderBullet('Không gửi nội dung đe dọa, thù ghét, bóc lột tình dục, vi phạm pháp luật hoặc dữ liệu của người khác khi chưa được phép. Không sử dụng Nexora để tạo nội dung gây hại.', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('6', 'Quyền riêng tư & Thu âm', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nexora AI chỉ sử dụng microphone khi bạn chủ động bắt đầu phỏng vấn bằng giọng nói và đã cấp quyền. Bạn có thể sử dụng chế độ văn bản thay cho giọng nói. Âm thanh được gửi tới Azure Speech để chuyển thành văn bản; ứng dụng cố gắng dọn tệp tạm sau xử lý. Quyền riêng tư và quyền yêu cầu xóa được mô tả trong các chính sách tương ứng của ứng dụng.
      </ThemedText>
    </View>
  </View>
);
