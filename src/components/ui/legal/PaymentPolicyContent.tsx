import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { renderSectionHeader } from './LegalContentHelpers';

export const PaymentPolicyContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Quyền lợi tài khoản & chính sách giao dịch</ThemedText>
    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Sử dụng quyền lợi hiện có', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Ứng dụng Android không xử lý mua hàng trong ứng dụng. Bạn sử dụng các quyền lợi hiện có gắn với tài khoản Nexora. Ứng dụng không trực tiếp thu thập thông tin thẻ thanh toán, mã CVV hay mật khẩu tài khoản thanh toán.
      </ThemedText>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Hạn mức & thời hạn', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Gói tài khoản, quyền truy cập tính năng, lượt đã sử dụng, lượt còn lại và thời hạn do máy chủ Nexora xác định. Ứng dụng hiển thị thông tin quyền lợi và lịch sử giao dịch hiện có do máy chủ cung cấp.
      </ThemedText>
    </View>
    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Giao dịch & hoàn tiền', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Nếu tài khoản có giao dịch trên nền tảng web, điều kiện mua, hoàn tiền và thời hạn áp dụng theo hợp đồng và chính sách của giao dịch đó. Ứng dụng Android không thực hiện thanh toán, gia hạn, hủy đăng ký hoặc xử lý hoàn tiền.
      </ThemedText>
    </View>
  </View>
);
