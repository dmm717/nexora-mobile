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
        {renderBullet('Qua trang web: Truy cập https://nexora.vn/xoa-tai-khoan mà không cần đăng nhập.', colors, styles)}
        {renderBullet('Gửi email yêu cầu: Gửi tới support@nexora.vn với chủ đề "Yêu cầu xóa tài khoản Nexora".', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('3', 'Dữ liệu giữ lại & Xóa bỏ', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Khi bạn yêu cầu xóa, các dữ liệu sau sẽ bị xóa vĩnh viễn:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Hồ sơ CV và Mục tiêu nghề nghiệp', colors, styles)}
        {renderBullet('Lịch sử phỏng vấn và các báo cáo AI', colors, styles)}
        {renderBullet('Điểm năng lực và lộ trình học tập', colors, styles)}
      </View>
      
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary, marginTop: 12 }]}>
        Tuy nhiên, để tuân thủ pháp luật, chúng tôi buộc phải giữ lại:
      </ThemedText>
      <View style={styles.bulletList}>
        {renderBullet('Hóa đơn thanh toán (được lưu trữ vô thời hạn theo luật kế toán)', colors, styles)}
        {renderBullet('Lịch sử vi phạm nội dung AI hoặc lạm dụng nền tảng (lưu trữ 90 ngày để audit)', colors, styles)}
      </View>
    </View>

    <View style={styles.contentBlock}>
      {renderSectionHeader('4', 'Thời gian xử lý & Ân hạn (Grace Period)', colors, styles)}
      <ThemedText style={[styles.paragraph, { color: colors.textSecondary }]}>
        Sau khi tiếp nhận yêu cầu, tài khoản của bạn sẽ bị vô hiệu hóa ngay lập tức. Hệ thống sẽ có một khoảng thời gian ân hạn (Grace Period) là 30 ngày. Trong 30 ngày này, nếu bạn đổi ý, bạn có thể đăng nhập lại và chọn "Hủy Yêu Cầu". Hết 30 ngày, toàn bộ dữ liệu trên hệ thống cơ sở dữ liệu sẽ được xóa cứng hoàn toàn và không thể khôi phục.
      </ThemedText>
    </View>
  </View>
);
