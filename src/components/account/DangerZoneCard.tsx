import React from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';

import { userApi } from '@/api/user.api';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/account.styles';

export const DangerZoneCard = ({ logout }: { logout: () => void }) => {
  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      Alert.alert(
        'Đã Xóa Tài Khoản',
        'Tài khoản của bạn đã được xóa vĩnh viễn khỏi hệ thống.',
        [{ text: 'OK', onPress: () => logout() }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể xóa tài khoản. Vui lòng thử lại sau.');
    },
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      'XÓA TÀI KHOẢN VĨNH VIỄN',
      'Hành động này không thể hoàn tác.\n\nToàn bộ dữ liệu, lịch sử phỏng vấn, và gói đăng ký PRO (nếu có) sẽ bị xóa NGAY LẬP TỨC. Bạn có chắc chắn muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa Vĩnh Viễn',
          style: 'destructive',
          onPress: () => deleteAccountMutation.mutate(),
        },
      ]
    );
  };

  return (
    <View style={[styles.dangerZoneContainer, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
      <View style={styles.dangerHeaderRow}>
        <Ionicons name="warning" size={20} color="#dc2626" />
        <ThemedText style={[styles.dangerTitle, { color: '#dc2626' }]}>
          Khu vực nguy hiểm
        </ThemedText>
      </View>

      <View style={{ gap: 4 }}>
        <ThemedText style={{ fontSize: 13, fontWeight: '700', color: '#991b1b' }}>
          Xóa tài khoản người dùng
        </ThemedText>
        <ThemedText style={[styles.dangerSub, { color: '#7f1d1d' }]}>
          Xóa vĩnh viễn tài khoản của bạn khỏi hệ thống (bao gồm mọi dữ liệu và gói PRO). Hành động này diễn ra ngay lập tức và không thể hoàn tác.
        </ThemedText>
      </View>

      <TouchableScale
        style={[styles.btnDanger, { backgroundColor: '#dc2626', alignSelf: 'flex-start' }]}
        onPress={handleDeleteAccount}
        disabled={deleteAccountMutation.isPending}
      >
        {deleteAccountMutation.isPending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : null}
        <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
          Xóa tài khoản vĩnh viễn
        </ThemedText>
      </TouchableScale>
    </View>
  );
};
