import React, { useState } from 'react';
import { View, Modal, ActivityIndicator, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';

import { userApi } from '@/api/user.api';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { toast } from '@/components/ui/toast/ToastProvider';

interface AccountDeletionModalProps {
  visible: boolean;
  onClose: () => void;
  logout: () => void;
  colors: any;
  userEmail: string;
}

export const AccountDeletionModal = ({ visible, onClose, logout, colors, userEmail }: AccountDeletionModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');
  const [deleteScheduledAt, setDeleteScheduledAt] = useState<string | null>(null);

  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: (data: any) => {
      // Backend should return scheduledHardDeleteAt
      const scheduledAt = data?.scheduledHardDeleteAt || data?.data?.scheduledHardDeleteAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setDeleteScheduledAt(scheduledAt);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Không thể gửi yêu cầu xóa tài khoản. Vui lòng thử lại sau.');
      onClose();
    },
  });

  const handleNext = () => {
    setStep(2);
  };

  const handleConfirm = () => {
    if (confirmText !== 'XÓA' && confirmText !== userEmail) {
      toast.error('Vui lòng nhập chính xác từ "XÓA" hoặc email của bạn để xác nhận.');
      return;
    }
    deleteAccountMutation.mutate();
  };

  const handleFinalOk = () => {
    logout();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          
          {deleteScheduledAt ? (
            <View style={{ alignItems: 'center', padding: Spacing.four }}>
              <Ionicons name="checkmark-circle" size={64} color={colors.accent} style={{ marginBottom: Spacing.three }} />
              <ThemedText style={styles.title}>Yêu Cầu Đã Ghi Nhận</ThemedText>
              <ThemedText style={[styles.textCenter, { marginTop: Spacing.two }]}>
                Tài khoản của bạn đã được vô hiệu hóa và đang trong hàng đợi xóa vĩnh viễn.
              </ThemedText>
              <View style={[styles.dateBox, { backgroundColor: colors.card }]}>
                <ThemedText style={[styles.dateBoxTitle, { color: colors.warning }]}>Ngày xóa vĩnh viễn dự kiến:</ThemedText>
                <ThemedText style={[styles.dateBoxText, { color: colors.text }]}>
                  {new Date(deleteScheduledAt).toLocaleDateString('vi-VN')}
                </ThemedText>
              </View>
              <ThemedText style={[styles.textCenter, { marginTop: Spacing.three, fontSize: 13, color: colors.textSecondary }]}>
                Nếu bạn đổi ý, vui lòng đăng nhập lại trước thời hạn trên để hủy yêu cầu.
              </ThemedText>
              <TouchableScale style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: Spacing.four, width: '100%' }]} onPress={handleFinalOk}>
                <ThemedText style={styles.primaryButtonText}>Đóng & Đăng Xuất</ThemedText>
              </TouchableScale>
            </View>
          ) : step === 1 ? (
            <View>
              <View style={styles.header}>
                <Ionicons name="warning" size={24} color="#dc2626" />
                <ThemedText style={[styles.title, { color: '#dc2626' }]}>Xóa Tài Khoản (Bước 1/2)</ThemedText>
              </View>
              
              <ThemedText style={[styles.subTitle, { color: colors.text }]}>
                Vui lòng đọc kỹ các thông tin sau trước khi tiếp tục:
              </ThemedText>

              <View style={[styles.listContainer, { backgroundColor: colors.backgroundElement }]}>
                <ThemedText style={[styles.listHeader, { color: colors.text }]}>Dữ liệu sẽ bị xóa hoàn toàn:</ThemedText>
                <ThemedText style={styles.listItem}>• Hồ sơ CV và Mục tiêu nghề nghiệp</ThemedText>
                <ThemedText style={styles.listItem}>• Lịch sử phỏng vấn và các báo cáo AI</ThemedText>
                <ThemedText style={styles.listItem}>• Điểm năng lực và lộ trình học tập</ThemedText>
                <ThemedText style={styles.listItem}>• Gói PRO (nếu có, không hoàn tiền)</ThemedText>

                <ThemedText style={[styles.listHeader, { color: colors.text, marginTop: Spacing.three }]}>Dữ liệu được giữ lại (để tuân thủ pháp luật):</ThemedText>
                <ThemedText style={styles.listItem}>• Hóa đơn thanh toán (giữ theo luật kế toán)</ThemedText>
                <ThemedText style={styles.listItem}>• Lịch sử vi phạm nội dung AI (giữ 90 ngày để audit)</ThemedText>
              </View>

              <View style={styles.buttonRow}>
                <TouchableScale style={[styles.cancelButton, { borderColor: colors.cardBorder }]} onPress={onClose}>
                  <ThemedText style={{ color: colors.text }}>Hủy Bỏ</ThemedText>
                </TouchableScale>
                <TouchableScale style={[styles.dangerButton, { backgroundColor: '#dc2626' }]} onPress={handleNext}>
                  <ThemedText style={{ color: '#ffffff', fontWeight: '700' }}>Tiếp Tục</ThemedText>
                </TouchableScale>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.header}>
                <Ionicons name="alert-circle" size={24} color="#dc2626" />
                <ThemedText style={[styles.title, { color: '#dc2626' }]}>Xác Nhận (Bước 2/2)</ThemedText>
              </View>
              
              <ThemedText style={[styles.subTitle, { color: colors.text }]}>
                Hành động này sẽ gửi yêu cầu xóa tài khoản. Hệ thống sẽ có một khoảng thời gian ân hạn (grace period) trước khi xóa cứng dữ liệu.
              </ThemedText>

              <View style={{ marginVertical: Spacing.four }}>
                <ThemedText style={{ fontSize: 13, marginBottom: Spacing.one, color: colors.textSecondary }}>
                  Để xác nhận, vui lòng nhập chữ <ThemedText style={{ fontWeight: 'bold', color: colors.text }}>XÓA</ThemedText> hoặc email <ThemedText style={{ fontWeight: 'bold', color: colors.text }}>{userEmail}</ThemedText>:
                </ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.card }]}
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="XÓA"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableScale style={[styles.cancelButton, { borderColor: colors.cardBorder }]} onPress={() => setStep(1)} disabled={deleteAccountMutation.isPending}>
                  <ThemedText style={{ color: colors.text }}>Quay Lại</ThemedText>
                </TouchableScale>
                <TouchableScale 
                  style={[styles.dangerButton, { backgroundColor: '#dc2626', opacity: (confirmText === 'XÓA' || confirmText === userEmail) ? 1 : 0.5 }]} 
                  onPress={handleConfirm}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : null}
                  <ThemedText style={{ color: '#ffffff', fontWeight: '700' }}>Xác Nhận Xóa</ThemedText>
                </TouchableScale>
              </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
  listContainer: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginBottom: Spacing.four,
  },
  listHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  listItem: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 15,
  },
  textCenter: {
    textAlign: 'center',
    lineHeight: 22,
  },
  dateBox: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.md,
    width: '100%',
    alignItems: 'center',
  },
  dateBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateBoxText: {
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
