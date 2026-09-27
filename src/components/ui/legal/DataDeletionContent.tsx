import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { renderBullet, renderSectionHeader } from './LegalContentHelpers';

export const DataDeletionContent = ({ colors, styles }: { colors: any, styles: any }) => (
  <View style={styles.docSection}>
    <ThemedText style={[styles.docMeta, { color: colors.textMuted }]}>Tuân thủ quy định Google Play Store</ThemedText>

    <View style={styles.contentBlock}>
      {renderSectionHeader('1', 'Cam kết xóa dữ liệu', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Theo quy chuẩn dành cho ứng dụng Android trên Google Play Store, bạn có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu cá nhân (CV, lịch sử phỏng vấn, báo cáo điểm số).
      </ThemedText>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('2', 'Cách thực hiện', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Bạn có thể thực hiện xóa tài khoản bằng 2 cách:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Trực tiếp trong app: Vào Cài đặt tài khoản → Khu vực nguy hiểm → Yêu cầu xóa tài khoản.', colors, styles)}
        {renderBullet('Gửi email yêu cầu: Gửi tới support@nexora.vn với chủ đề "Yêu cầu xóa tài khoản Nexora".', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Thời gian xử lý', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Sau khi tiếp nhận yêu cầu, tài khoản của bạn sẽ bị vô hiệu hóa ngay lập tức và toàn bộ dữ liệu trên hệ thống cơ sở dữ liệu sẽ được hủy bỏ hoàn toàn trong tối đa 30 ngày làm việc.
      </ThemedText>
    </View>
  </View>
);
