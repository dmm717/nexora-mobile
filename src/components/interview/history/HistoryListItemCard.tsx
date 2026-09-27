import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Badge } from '@/components/ui/badge';
import { styles } from '@/styles/interview-history.styles';

export const HistoryListItemCard = React.memo(({
  item,
  colors,
  onPress,
}: {
  item: any;
  colors: any;
  onPress: () => void;
}) => {
  const isCompleted = item.status === 'completed' || Boolean(item.reportAvailable);
  const statusNorm = (item.status || '').toLowerCase();

  let statusLabel = 'Đang diễn ra';
  let statusVariant = 'info';

  if (isCompleted) {
    statusLabel = 'Đã hoàn thành';
    statusVariant = 'success';
  } else if (statusNorm === 'starting') {
    statusLabel = 'Đang khởi tạo';
    statusVariant = 'info';
  } else if (statusNorm === 'completing' || statusNorm === 'evaluating' || statusNorm === 'processing') {
    statusLabel = 'Đang chấm điểm';
    statusVariant = 'warning';
  } else if (statusNorm === 'failed') {
    statusLabel = 'Thất bại';
    statusVariant = 'error';
  } else if (statusNorm === 'abandoned') {
    statusLabel = 'Đã hủy';
    statusVariant = 'neutral';
  } else {
    statusLabel = 'Đang diễn ra';
    statusVariant = 'info';
  }

  const dateObj = new Date(item.createdAt);
  const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fullTimestamp = `${timeStr} • ${dateStr}`;
  
  const answeredCount = item.answeredQuestionCount ?? 0;
  const issuedCount = item.issuedQuestionCount ?? 3;
  const questionCountStr = `${answeredCount}/${issuedCount} câu hỏi`;

  const actionText = isCompleted ? 'Xem báo cáo' : 'Tiếp tục phỏng vấn';
  const actionIcon = isCompleted ? 'arrow-forward' : 'play-circle-outline';

  return (
    <TouchableScale
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={onPress}
    >
      <View style={styles.cardHeaderRow}>
        <ThemedText style={styles.cardTitle} numberOfLines={1}>
          {item.role || 'Business Analyst'} <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>({item.seniority || 'intern'})</ThemedText>
        </ThemedText>
        <Badge variant={statusVariant as any} size="sm">
          {statusLabel}
        </Badge>
      </View>

      <View style={styles.metaBadgesRow}>
        {item.interviewType && (
          <Badge variant="info" size="sm">
            {item.interviewType === 'technical' ? 'Kỹ thuật' : item.interviewType}
          </Badge>
        )}
        <Badge variant="neutral" size="sm">
          {questionCountStr}
        </Badge>
      </View>

      <View style={styles.footerRow}>
        <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
          {fullTimestamp}
        </ThemedText>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ThemedText style={[styles.actionText, { color: colors.primary }]}>
            {actionText}
          </ThemedText>
          <Ionicons name={actionIcon as any} size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableScale>
  );
});
