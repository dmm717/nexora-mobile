import React from 'react';
import { View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/interview-report.styles';

export const PracticeAgainModal = React.memo(({
  visible,
  colors,
  practiceReason,
  setPracticeReason,
  practiceAgainMutation,
  onClose,
  PRACTICE_REASONS,
}: {
  visible: boolean;
  colors: any;
  practiceReason: string;
  setPracticeReason: (reason: string) => void;
  practiceAgainMutation: any;
  onClose: () => void;
  PRACTICE_REASONS: Array<{ id: string, label: string }>;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Ionicons name="refresh-circle" size={40} color={colors.primary} />
        <ThemedText type="subtitle" style={styles.modalTitle}>Tạo Phiên Luyện Tập Lại</ThemedText>
        <ThemedText style={styles.modalSub}>
          Chọn lý do & tiêu chí bạn muốn tập trung cải thiện cho phiên mới này:
        </ThemedText>

        <View style={{ width: '100%', gap: Spacing.two, marginVertical: Spacing.two }}>
          {PRACTICE_REASONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.reasonOption,
                { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                practiceReason === r.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
              ]}
              onPress={() => setPracticeReason(r.id)}
            >
              <Ionicons
                name={practiceReason === r.id ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={practiceReason === r.id ? colors.primary : colors.textMuted}
              />
              <ThemedText style={[styles.reasonOptionText, practiceReason === r.id && { color: colors.primary, fontWeight: '700' }]}>
                {r.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }]}
          onPress={() => practiceAgainMutation.mutate()}
          disabled={practiceAgainMutation.isPending}
        >
          {practiceAgainMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.primaryButtonText}>Bắt Đầu Phỏng Vấn Mới</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.cardBorder, width: '100%' }]}
          onPress={onClose}
        >
          <ThemedText style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Hủy</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
));
