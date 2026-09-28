import React, { memo } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/interview-preflight.styles';
import { Spacing } from '@/constants/theme';

export const EntranceActionCard = memo(({
  onStart,
  isPending,
  colors,
}: {
  onStart: () => void;
  isPending: boolean;
  colors: any;
}) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1.5 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
        <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
          ⚡ Q1–Q3 thuộc phạm vi miễn phí
        </ThemedText>
      </View>
    </View>

    <ThemedText type="subtitle" style={{ fontSize: 17, fontWeight: '700', marginTop: 4 }}>
      Sẵn sàng bước vào phòng?
    </ThemedText>

    <ThemedText style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
      Máy chủ quyết định khả năng kết thúc hoặc tiếp tục cùng phiên sau ranh giới miễn phí, dựa trên quyền hiện tại của bạn.
    </ThemedText>

    <TouchableOpacity
      style={[
        styles.primaryButton,
        { backgroundColor: colors.primary, marginTop: Spacing.two },
        isPending && styles.disabledButton,
      ]}
      onPress={onStart}
      disabled={isPending}
    >
      {isPending ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons name="play-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={styles.primaryButtonText}>Vào phòng phỏng vấn ngay</ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
        </>
      )}
    </TouchableOpacity>
  </View>
));
