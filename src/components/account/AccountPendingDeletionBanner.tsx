import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radius, Spacing } from '@/constants/theme';
import { toast } from '@/components/ui/toast/ToastProvider';
export const AccountPendingDeletionBanner = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: request, isLoading, isError } = useQuery({
    queryKey: ['deletion-request'],
    queryFn: async () => {
      try {
        return await userApi.getDeletionRequest();
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    retry: false,
  });
  const cancelMutation = useMutation({
    mutationFn: () => userApi.cancelDeletionRequest(),
    onSuccess: () => {
      toast.success('Đã hủy yêu cầu xóa tài khoản. Dữ liệu của bạn được an toàn.');
      queryClient.setQueryData(['deletion-request'], null);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể hủy yêu cầu xóa. Vui lòng thử lại sau.');
    },
  });
  if (isLoading || isError || !request) {
    return null; // Don't show anything if no pending request
  }
  const scheduledDate = request.scheduledHardDeleteAt ? new Date(request.scheduledHardDeleteAt).toLocaleDateString('vi-VN') : 'Sắp tới';
  return (
    <View style={[styles.bannerContainer, { paddingTop: Spacing.three }]}>
      <View style={styles.contentRow}>
        <Ionicons name="warning" size={24} color="#7f1d1d" style={styles.icon} />
        <View style={styles.textContainer}>
          <ThemedText style={styles.titleText}>Tài khoản đang chờ xóa vĩnh viễn</ThemedText>
          <ThemedText style={styles.subText}>
            Dự kiến xóa vào: {scheduledDate}
          </ThemedText>
        </View>
        <TouchableScale 
          style={styles.cancelBtn} 
          onPress={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <ThemedText style={styles.cancelBtnText}>Hủy Yêu Cầu</ThemedText>
          )}
        </TouchableScale>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderRadius: Radius.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  icon: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
  },
  subText: {
    fontSize: 12,
    color: '#7f1d1d',
    marginTop: 2,
  },
  cancelBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  }
});