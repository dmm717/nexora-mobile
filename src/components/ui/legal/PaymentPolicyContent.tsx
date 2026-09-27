import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';
import { Spacing } from '@/constants/theme';

export const PaymentPolicyContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Quy định nâng cấp gói & hoàn tiền</ThemedText>

    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Phương thức thanh toán', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Các giao dịch nâng cấp gói cước (Gói PRO) được thực hiện an toàn qua hệ thống đối tác thanh toán chính thức hoặc cơ chế thanh toán trong ứng dụng (Google Play Billing). Nexora KHÔNG trực tiếp thu thập hay lưu trữ số thẻ ngân hàng, mã CVV hay mật khẩu tài khoản thanh toán của bạn.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Hạn mức & lượt sử dụng', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Mỗi đơn hàng thành công sẽ cấp quyền truy cập tính năng phỏng vấn AI tương ứng với gói đã chọn. Lịch sử đơn hàng, mã giao dịch và thời hạn gói cước được minh bạch trực tiếp trong trang "Cài đặt tài khoản".
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Chính sách hoàn tiền', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Người dùng có quyền yêu cầu hoàn tiền trong các trường hợp:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Phát sinh sự cố kỹ thuật từ phía hệ thống Nexora dẫn đến việc không thể khởi tạo lượt phỏng vấn quá 24h.', colors, styles)}
        {renderBullet('Giao dịch bị thanh toán trùng lặp do sự cố cổng thanh toán.', colors, styles)}
      </View>
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary, marginTop: Spacing.two }]}>
        Yêu cầu hoàn tiền cần được gửi trong vòng 7 ngày làm việc kể từ thời điểm phát sinh giao dịch qua email support@nexora.vn hoặc mục "Đánh giá & Góp ý".
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Hủy gói & gia hạn', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Bạn có thể chủ động ngừng gia hạn hoặc chuyển đổi gói cước bất kỳ lúc nào mà không phát sinh thêm chi phí ẩn. Sau khi hủy, quyền lợi gói PRO hiện tại sẽ duy trì cho đến hết chu kỳ đã thanh toán.
      </ThemedText>
    </View>
  </View>
);
