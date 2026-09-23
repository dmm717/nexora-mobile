import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { feedbackApi } from '@/api/feedback.api';
import { FeedbackResponse } from '@/api/types/feedback.types';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  myFeedback?: FeedbackResponse | null;
}

export function ProductFeedbackModal({ visible, onClose, myFeedback }: ProductFeedbackModalProps) {
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [allowPublicDisplay, setAllowPublicDisplay] = useState<boolean>(true);

  useEffect(() => {
    if (myFeedback) {
      setRating(myFeedback.rating || 5);
      setComment(myFeedback.comment || '');
      setAllowPublicDisplay(myFeedback.allowPublicDisplay ?? true);
    } else {
      setRating(5);
      setComment('');
      setAllowPublicDisplay(true);
    }
  }, [myFeedback, visible]);

  const submitMutation = useMutation({
    mutationFn: () =>
      feedbackApi.upsertMyFeedback({
        rating,
        comment: comment.trim() || undefined,
        allowPublicDisplay,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
      Alert.alert('Cảm ơn bạn!', 'Ý kiến đánh giá của bạn đã được ghi nhận thành công.');
      onClose();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => feedbackApi.deleteMyFeedback(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
      Alert.alert('Đã xóa', 'Bài đánh giá của bạn đã được xóa.');
      onClose();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.message || 'Không thể xóa đánh giá. Vui lòng thử lại.');
    },
  });

  const handleDelete = () => {
    Alert.alert('Xóa Đánh Giá', 'Bạn có chắc chắn muốn xóa bài đánh giá này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={modalStyles.headerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle" style={modalStyles.title}>
                {myFeedback ? 'Chỉnh Sửa Đánh Giá' : 'Đánh Giá & Góp Ý'}
              </ThemedText>
              <ThemedText style={[modalStyles.subTitle, { color: colors.textSecondary }]}>
                Ý kiến của bạn giúp Nexora nâng cao độ chính xác AI và trải nghiệm phỏng vấn.
              </ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {/* Star Rating Selection */}
            <View style={modalStyles.section}>
              <ThemedText style={modalStyles.label}>Mức độ hài lòng của bạn</ThemedText>
              <View style={modalStyles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7} style={{ padding: 4 }}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? '#f59e0b' : colors.cardBorder}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment Input */}
            <View style={modalStyles.section}>
              <ThemedText style={modalStyles.label}>Ý kiến góp ý bổ sung (tùy chọn)</ThemedText>
              <TextInput
                style={[
                  modalStyles.textArea,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.cardBorder,
                  },
                ]}
                multiline
                numberOfLines={4}
                maxLength={1000}
                placeholder="Chia sẻ trải nghiệm của bạn về độ chính xác AI, giao diện hoặc tính năng muốn nâng cấp..."
                placeholderTextColor={colors.textMuted}
                value={comment}
                onChangeText={setComment}
              />
              <ThemedText style={[modalStyles.charCount, { color: colors.textMuted }]}>
                {comment.length}/1000 ký tự
              </ThemedText>
            </View>

            {/* Public Consent Checkbox */}
            <TouchableOpacity
              style={modalStyles.checkboxRow}
              onPress={() => setAllowPublicDisplay(!allowPublicDisplay)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={allowPublicDisplay ? 'checkbox' : 'square-outline'}
                size={22}
                color={allowPublicDisplay ? colors.primary : colors.textMuted}
              />
              <ThemedText style={[modalStyles.checkboxText, { color: colors.text }]}>
                Cho phép hiển thị nhận xét này công khai trên bảng vinh danh Nexora.
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Buttons */}
          <View style={modalStyles.actionsRow}>
            {myFeedback && (
              <TouchableOpacity
                style={[modalStyles.btn, modalStyles.deleteBtn, { borderColor: colors.danger }]}
                onPress={handleDelete}
                disabled={deleteMutation.isPending || submitMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator color={colors.danger} />
                ) : (
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[modalStyles.btn, modalStyles.submitBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || deleteMutation.isPending}
            >
              {submitMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={modalStyles.submitBtnText}>
                  {myFeedback ? 'Cập Nhật Đánh Giá' : 'Gửi Đánh Giá'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.four,
    ...Shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  section: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: Spacing.one,
  },
  textArea: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.two,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 90,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.three,
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  btn: {
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 44,
    borderWidth: 1,
  },
  submitBtn: {},
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
