import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/constants/theme';
import { styles } from '@/styles/cv-jd.styles';

export const AnalysisHistoryItemCard = React.memo(({
  item,
  profile,
  colors,
  onSetPrimary,
  isSettingPrimary,
  onViewResult,
}: {
  item: any;
  profile: any;
  colors: any;
  onSetPrimary: (resumeId: string) => void;
  isSettingPrimary: boolean;
  onViewResult: () => void;
}) => {
  const isTargeted = item.mode === 'job_targeted';
  const isPrimary = profile?.primaryResume?.id === item.resumeId;
  const dateObj = new Date(item.createdAt);
  const dateStr = dateObj.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <View style={[styles.historyCard, { backgroundColor: '#fff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <View style={styles.historyCardTop}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Badge variant={isTargeted ? 'primary' : 'secondary'} size="sm" style={isTargeted ? { backgroundColor: '#F3E8FF' } : {}}>
            <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: isTargeted ? '#7E22CE' : colors.text }}>{isTargeted ? 'Theo JD mục tiêu' : 'Chuẩn thị trường'}</ThemedText>
          </Badge>
          {isPrimary && (
            <Badge variant="warning" size="sm" style={{ backgroundColor: '#FEF3C7' }}>
              <Ionicons name="star" size={10} color="#D97706" />
              <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#D97706', marginLeft: 4 }}>CV chính</ThemedText>
            </Badge>
          )}
        </View>
        {item.status === 'completed' ? (
          <Badge variant="success" size="sm" style={{ backgroundColor: '#DCFCE7' }}>
            <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#15803D' }}>Hoàn thành</ThemedText>
          </Badge>
        ) : item.status === 'failed' ? (
          <Badge variant="error" size="sm" style={{ backgroundColor: '#FEE2E2' }}>
            <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#991B1B' }}>Lỗi</ThemedText>
          </Badge>
        ) : (
          <Badge variant="warning" size="sm" style={{ backgroundColor: '#FEF3C7' }}>
            <ThemedText style={{ fontSize: 10, fontFamily: Typography.fontFamily.bold, color: '#D97706' }}>Đang xử lý</ThemedText>
          </Badge>
        )}
      </View>

      <View style={styles.nestedContextBox}>
        <View style={styles.nestedContextTop}>
          <ThemedText style={styles.nestedContextLabel}>Bối cảnh đối chiếu:</ThemedText>
          <ThemedText style={styles.nestedContextDate}>{dateStr}</ThemedText>
        </View>

        <ThemedText style={styles.historyContextTitle} numberOfLines={2}>
          {isTargeted ? 'Phân tích CV theo JD' : (item.context?.targetRole || 'Định hướng chuẩn ngành')}
          {item.context?.seniority ? ` (${item.context.seniority})` : ''}
        </ThemedText>

        {item.context?.industry && (
          <ThemedText style={styles.nestedContextIndustry}>
            Ngành: <ThemedText style={{ fontFamily: Typography.fontFamily.semibold, color: '#111827' }}>{item.context.industry}</ThemedText>
          </ThemedText>
        )}
      </View>

      <View style={styles.historyActions}>
        <View style={{ flex: 1 }}>
          {!isPrimary && item.resumeId ? (
            <TouchableOpacity
              onPress={() => onSetPrimary(item.resumeId)}
              style={styles.btnSecondary}
              disabled={isSettingPrimary}
            >
              {isSettingPrimary ? (
                <ActivityIndicator size="small" color="#111827" />
              ) : (
                <ThemedText style={styles.btnSecondaryText}>Đặt làm CV chính</ThemedText>
              )}
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <TouchableOpacity
            onPress={onViewResult}
            style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="eye" size={16} color="#fff" />
            <ThemedText style={styles.btnPrimaryText}>Xem kết quả</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
