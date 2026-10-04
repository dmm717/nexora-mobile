import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/account.styles';

export const LegalComplianceCard = ({ openLegalModal, colors }: { openLegalModal: (tab: any) => void; colors: any }) => {
  return (
    <GlassCard style={styles.card}>
      <View>
        <ThemedText style={styles.cardTitle}>Pháp lý & Điều khoản</ThemedText>
        <ThemedText style={styles.cardSubtitle}>
          Các điều khoản sử dụng, chính sách bảo mật và quyền lợi dữ liệu người dùng.
        </ThemedText>
      </View>

      <View style={{ gap: Spacing.two, marginTop: 4 }}>
        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => openLegalModal('privacy')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <ThemedText style={[styles.btnText, { color: colors.text }]}>Chính sách bảo mật</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableScale>

        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => openLegalModal('terms')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <ThemedText style={[styles.btnText, { color: colors.text }]}>Điều khoản dịch vụ</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableScale>

        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => openLegalModal('payment')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="card-outline" size={18} color={colors.primary} />
            <ThemedText style={[styles.btnText, { color: colors.text }]}>Chính sách thanh toán & hoàn tiền</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableScale>

        <TouchableScale
          style={[styles.btnOutline, { borderColor: colors.cardBorder, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => openLegalModal('deletion')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="trash-bin-outline" size={18} color={colors.primary} />
            <ThemedText style={[styles.btnText, { color: colors.text }]}>Quy trình xóa tài khoản & dữ liệu</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableScale>
      </View>
    </GlassCard>
  );
};
