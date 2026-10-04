import React from 'react';
import { Linking, TouchableOpacity } from 'react-native';
import { ACCOUNT_DELETION_URL } from '@/constants/legal';
import { ThemedText } from '@/components/themed-text';
import { toast } from '@/components/ui/toast/ToastProvider';

export const PublicDeletionLink = ({ colors }: { colors: any }) => (
  <TouchableOpacity
    accessibilityRole="link"
    accessibilityLabel="Mở trang yêu cầu xóa tài khoản Nexora"
    accessibilityHint="Mở trình duyệt để yêu cầu qua xác minh email, không cần đăng nhập"
    style={{ minHeight: 44, justifyContent: 'center', paddingVertical: 8 }}
    onPress={async () => {
      try {
        await Linking.openURL(ACCOUNT_DELETION_URL);
      } catch {
        toast.error('Không thể mở trình duyệt. Bạn vẫn có thể gửi yêu cầu xóa trong Cài đặt tài khoản khi đã đăng nhập.');
      }
    }}
  >
    <ThemedText style={{ color: colors.primary, textDecorationLine: 'underline' }}>
      Yêu cầu xóa tài khoản trên website Nexora
    </ThemedText>
  </TouchableOpacity>
);
