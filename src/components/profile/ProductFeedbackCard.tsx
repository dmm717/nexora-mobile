import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { feedbackApi } from '@/api/feedback.api';
import { ProductFeedbackModal } from '@/components/feedback/ProductFeedbackModal';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';

export function ProductFeedbackCard() {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [modalVisible, setModalVisible] = useState(false);

  const { data: myFeedback, isLoading } = useQuery({
    queryKey: ['my-feedback'],
    queryFn: feedbackApi.getMyFeedback,
  });

  const getStatusBadge = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return { label: 'Đã duyệt', variant: 'success' as const };
      case 'rejected':
        return { label: 'Từ chối', variant: 'error' as const };
      case 'pending':
      default:
        return { label: 'Chờ duyệt', variant: 'warning' as const };
    }
  };

  const badgeInfo = getStatusBadge(myFeedback?.moderationStatus);

  return (
    <View style={cardStyles.section}>
      <ThemedText style={cardStyles.sectionTitle}>Đánh giá &amp; Góp ý</ThemedText>
      <GlassCard style={cardStyles.cardContent}>
        <View style={cardStyles.topRow}>
          <View style={[cardStyles.iconBadge, { backgroundColor: colors.warningLight || 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="star" size={20} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={cardStyles.cardTitle}>Góp ý sản phẩm Nexora</ThemedText>
            <ThemedText style={[cardStyles.cardSub, { color: colors.textSecondary }]}>
              Nhận xét của bạn giúp AI huấn luyện chính xác hơn
            </ThemedText>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: Spacing.two }} />
        ) : myFeedback ? (
          <View style={[cardStyles.existingBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
            <View style={cardStyles.existingHeader}>
              <View style={cardStyles.starsInline}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= myFeedback.rating ? 'star' : 'star-outline'}
                    size={16}
                    color={s <= myFeedback.rating ? '#f59e0b' : colors.cardBorder}
                  />
                ))}
                <ThemedText style={cardStyles.ratingNumber}>{myFeedback.rating}/5</ThemedText>
              </View>

              <Badge variant={badgeInfo.variant} size="sm">
                {badgeInfo.label}
              </Badge>
            </View>

            {myFeedback.comment ? (
              <ThemedText style={cardStyles.commentText} numberOfLines={2}>
                "{myFeedback.comment}"
              </ThemedText>
            ) : null}

            <TouchableScale style={cardStyles.editBtn} onPress={() => setModalVisible(true)}>
              <ThemedText style={[cardStyles.editBtnText, { color: colors.primary }]}>
                Chỉnh sửa đánh giá
              </ThemedText>
              <Ionicons name="create-outline" size={14} color={colors.primary} />
            </TouchableScale>
          </View>
        ) : (
          <TouchableScale style={[cardStyles.createBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
            <Ionicons name="create-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <ThemedText style={cardStyles.createBtnText}>Gửi Đánh Giá Ngay</ThemedText>
          </TouchableScale>
        )}
      </GlassCard>

      <ProductFeedbackModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        myFeedback={myFeedback}
      />
    </View>
  );
}

const cardStyles = StyleSheet.create({
  section: {
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  cardContent: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  existingBox: {
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.one,
  },
  existingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  commentText: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: Spacing.one,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: Spacing.two,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: Radius.md,
    marginTop: Spacing.one,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
