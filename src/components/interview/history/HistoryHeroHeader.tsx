import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { Spacing } from '@/constants/theme';

export const HistoryHeroHeader = React.memo(({ colors }: { colors: any }) => (
  <SurfaceCard style={{ padding: Spacing.four, borderRadius: 16, backgroundColor: colors.primary }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: Spacing.two }}>
        <ThemedText style={{ color: '#ffffff', fontSize: 18, fontWeight: '800' }}>
          Lịch sử Phỏng vấn Giả lập
        </ThemedText>
        <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, lineHeight: 17, marginTop: 4 }}>
          Theo dõi toàn bộ các phiên phỏng vấn đã thực hiện, trạng thái hoàn tất và báo cáo đánh giá chi tiết theo từng năng lực.
        </ThemedText>
      </View>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="mic-outline" size={24} color="#ffffff" />
      </View>
    </View>
  </SurfaceCard>
));
