import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { deletionDateText, deletionStatusText } from '@/utils/deletion-presentation';
import { userApi } from '@/api/user.api';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
export const AccountPendingDeletionBanner = () => {
  const { data: request, isLoading, isError } = useQuery({
    queryKey: ['deletion-request'],
    queryFn: async () => {
      try {
        return await userApi.getDeletionRequest();
      } catch (err: any) {
        if (err?.status === 404 || err?.response?.status === 404 ||
            err?.originalError?.response?.status === 404) return null;
        throw err;
      }
    },
    retry: false,
  });

  if (isLoading) return <ThemedText>Đang kiểm tra trạng thái yêu cầu xóa…</ThemedText>;
  if (isError) return <ThemedText accessibilityRole="alert">Không thể kiểm tra trạng thái yêu cầu xóa. Vui lòng thử lại sau.</ThemedText>;
  if (!request) return null;
  const completedAt = deletionDateText(request.completedAt);
  const requestedAt = deletionDateText(request.requestedAt);
  return (
    <View style={[styles.bannerContainer, { paddingTop: Spacing.three }]}>
      <View style={styles.contentRow}>
        <Ionicons name="warning" size={24} color="#7f1d1d" style={styles.icon} />
        <View style={styles.textContainer}>
          <ThemedText style={styles.titleText}>{deletionStatusText(request)}</ThemedText>
          <ThemedText style={styles.subText}>
            {request.status === 'completed' && completedAt ? `Đã xử lý lúc: ${completedAt}` : requestedAt ? `Ghi nhận lúc: ${requestedAt}` : 'Máy chủ chưa cung cấp thời điểm hợp lệ.'}
          </ThemedText>
        </View>
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
});
