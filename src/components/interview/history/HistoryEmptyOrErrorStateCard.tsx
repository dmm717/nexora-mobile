import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { styles } from '@/styles/interview-history.styles';

export const HistoryEmptyOrErrorStateCard = React.memo(({
  isLoading,
  error,
  paginatedLength,
  colors,
  onStartNewInterview,
}: {
  isLoading: boolean;
  error: any;
  paginatedLength: number;
  colors: any;
  onStartNewInterview: () => void;
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || paginatedLength === 0) {
    return (
      <SurfaceCard style={styles.emptyCard}>
        <View style={[styles.emptyIconBox, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons
            name={error ? 'alert-circle-outline' : 'document-text-outline'}
            size={28}
            color={colors.textSecondary}
          />
        </View>
        <ThemedText style={styles.emptyTitle}>
          {error ? 'Không thể tải lịch sử' : 'Chưa có lịch sử phỏng vấn'}
        </ThemedText>
        <ThemedText style={[styles.emptySub, { color: colors.textSecondary }]}>
          {error
            ? 'Đã có lỗi xảy ra khi kết nối tới máy chủ.'
            : 'Hãy bắt đầu tạo buổi phỏng vấn đầu tiên của bạn ngay!'}
        </ThemedText>
        <TouchableScale
          style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
          onPress={onStartNewInterview}
        >
          <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
          <ThemedText style={styles.primaryActionBtnText}>
            Tạo phỏng vấn mới
          </ThemedText>
        </TouchableScale>
      </SurfaceCard>
    );
  }

  return null;
});
