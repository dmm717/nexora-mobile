import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { PasswordInput } from '@/components/ui/password-input';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/account.styles';
import { toast } from '@/components/ui/toast/ToastProvider';
export const SecurityCard = ({ colors }: { colors: any }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Lỗi khi đổi mật khẩu.');
    },
  });
  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới yêu cầu tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp.');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };
  return (
    <GlassCard style={styles.card}>
      <View>
        <ThemedText style={styles.cardTitle}>Bảo mật mật khẩu</ThemedText>
        <ThemedText style={styles.cardSubtitle}>
          Đổi mật khẩu định kỳ để bảo vệ tài khoản. Mật khẩu mới yêu cầu tối thiểu 8 ký tự.
        </ThemedText>
      </View>
      <PasswordInput
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="••••••••"
      />
      <PasswordInput
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Tối thiểu 8 ký tự"
      />
      <PasswordInput
        label="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Nhập lại mật khẩu mới"
      />
      <TouchableScale
        style={[
          styles.btnPrimary,
          { backgroundColor: colors.primary, marginTop: 4 },
          changePasswordMutation.isPending && { opacity: 0.6 },
        ]}
        onPress={handleChangePassword}
        disabled={changePasswordMutation.isPending}
      >
        {changePasswordMutation.isPending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : null}
        <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>
          Đổi mật khẩu
        </ThemedText>
      </TouchableScale>
    </GlassCard>
  );
};