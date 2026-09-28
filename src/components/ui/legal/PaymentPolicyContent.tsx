import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';
import { Spacing } from '@/constants/theme';

export const PaymentPolicyContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Quy định nâng cấp gói & thanh toán</ThemedText>

    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Phương thức thanh toán', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Các giao dịch nâng cấp gói cước (Gói PRO) được xử lý an toàn thông qua hệ thống thanh toán của Google Play (Google Play Billing). Nexora KHÔNG trực tiếp thu thập hay lưu trữ số thẻ ngân hàng, mã CVV hay mật khẩu tài khoản thanh toán của bạn.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Hạn mức & lượt sử dụng', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Mỗi đơn hàng thành công sẽ cấp quyền truy cập tính năng phỏng vấn AI tương ứng với gói đã chọn. Lịch sử đơn hàng, mã giao dịch và thời hạn gói cước được hiển thị trực tiếp trong ứng dụng.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Chính sách hoàn tiền', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Thanh toán được xử lý bởi Google Play. Mọi yêu cầu hoàn tiền tuân theo chính sách hoàn tiền của Google. Vui lòng truy cập trang hỗ trợ của Google Play để tìm hiểu thêm chi tiết và gửi yêu cầu nếu cần.
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Hủy gói & gia hạn', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Bạn có thể quản lý, ngừng gia hạn hoặc chuyển đổi gói cước bất kỳ lúc nào thông qua trình quản lý đăng ký của Google Play. Sau khi hủy, quyền lợi gói PRO hiện tại sẽ duy trì cho đến hết chu kỳ đã thanh toán.
      </ThemedText>
      <TouchableOpacity 
        onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions?package=com.nexora.app')}
        style={{ marginTop: Spacing.two, paddingVertical: Spacing.one }}
      >
        <ThemedText style={{ color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }}>
          Mở Quản lý đăng ký (Google Play)
        </ThemedText>
      </TouchableOpacity>
    </View>
  </View>
);
