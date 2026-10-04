import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, ActivityIndicator, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { createIdempotencyKey } from '@/api/client';
import { DELETION_ACCEPTED_MESSAGE, isDeletionConfirmed } from '@/utils/deletion-presentation';
import { userApi } from '@/api/user.api';
import { ThemedText } from '@/components/themed-text';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { toast } from '@/components/ui/toast/ToastProvider';
interface AccountDeletionModalProps {
  visible: boolean;
  onClose: () => void;
  logout: () => Promise<void>;
  colors: any;
  userEmail: string;
}
export const AccountDeletionModal = ({ visible, onClose, logout, colors, userEmail }: AccountDeletionModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitting = useRef(false);
  // Reuse after ambiguous network errors. Never automatically retry deletion.
  const idempotencyKey = useRef<string | null>(null);
  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(idempotencyKey.current!),
    retry: false,
    onSuccess: async () => {
      setAccepted(true);
      setErrorMessage(null);
      toast.success(DELETION_ACCEPTED_MESSAGE);
      await logout();
    },
    onError: () => {
      setErrorMessage('Chưa nhận được xác nhận từ máy chủ. Yêu cầu có thể chưa được gửi hoặc phản hồi bị gián đoạn. Kiểm tra trạng thái trước khi thử lại.');
    },
    onSettled: () => { submitting.current = false; },
  });
  useEffect(() => {
    if (!visible) {
      setStep(1);
      setConfirmText('');
      setErrorMessage(null);
    }
  }, [visible]);
  const handleClose = () => {
    if (!submitting.current && !accepted) onClose();
  };
  const handleNext = () => { setStep(2); };
  const handleConfirm = () => {
    if (submitting.current || accepted || !isDeletionConfirmed(confirmText, userEmail)) return;
    submitting.current = true;
    idempotencyKey.current ??= createIdempotencyKey();
    setErrorMessage(null);
    deleteAccountMutation.mutate();
  };
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
          <ScrollView keyboardShouldPersistTaps="handled">
          {accepted ? (
            <View>
              <ThemedText style={styles.title}>Yêu cầu đã ghi nhận</ThemedText>
              <ThemedText style={styles.subTitle}>{DELETION_ACCEPTED_MESSAGE}</ThemedText>
              <ActivityIndicator accessibilityLabel="Đang kết thúc phiên đăng nhập" />
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
                <ThemedText style={[styles.listHeader, { color: colors.text }]}>Phạm vi yêu cầu xóa:</ThemedText>
                <ThemedText style={styles.listItem}>• Hồ sơ CV và Mục tiêu nghề nghiệp</ThemedText>
                <ThemedText style={styles.listItem}>• Lịch sử phỏng vấn và các báo cáo AI</ThemedText>
                <ThemedText style={styles.listItem}>• Điểm năng lực và lộ trình học tập</ThemedText>
                <ThemedText style={styles.listItem}>• Ảnh đại diện và hồ sơ tài khoản</ThemedText>
                <ThemedText style={[styles.listHeader, { color: colors.text, marginTop: Spacing.three }]}>Bản ghi máy chủ giữ lại:</ThemedText>
                <ThemedText style={styles.listItem}>• Giao dịch, quyền lợi và lịch sử sử dụng</ThemedText>
                <ThemedText style={styles.listItem}>• Yêu cầu xóa và tài khoản đã ẩn danh hóa; thời hạn lưu trữ cần được xác nhận</ThemedText>
              </View>
              <View style={styles.buttonRow}>
                <TouchableScale style={[styles.cancelButton, { borderColor: colors.cardBorder }]} onPress={handleClose}>
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
                Hành động này gửi yêu cầu xóa tài khoản. Khi máy chủ chấp nhận, bạn sẽ được đăng xuất. Ứng dụng không cung cấp chức năng hủy yêu cầu.
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
              {errorMessage && <ThemedText accessibilityRole="alert" style={styles.subTitle}>{errorMessage}</ThemedText>}
              <View style={styles.buttonRow}>
                <TouchableScale style={[styles.cancelButton, { borderColor: colors.cardBorder }]} onPress={() => setStep(1)} disabled={deleteAccountMutation.isPending}>
                  <ThemedText style={{ color: colors.text }}>Quay Lại</ThemedText>
                </TouchableScale>
                <TouchableScale
                  style={[styles.dangerButton, { backgroundColor: '#dc2626', opacity: isDeletionConfirmed(confirmText, userEmail) ? 1 : 0.5 }]}
                  onPress={handleConfirm}
                  disabled={deleteAccountMutation.isPending || !isDeletionConfirmed(confirmText, userEmail)}
                >
                  {deleteAccountMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : null}
                  <ThemedText style={{ color: '#ffffff', fontWeight: '700' }}>Xác Nhận Xóa</ThemedText>
                </TouchableScale>
              </View>
            </View>
          )}
          </ScrollView>
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
    maxHeight: '90%',
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
