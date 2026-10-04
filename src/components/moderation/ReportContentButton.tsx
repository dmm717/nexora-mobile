import { isReportableContentId, reportApi, reportContentTypes, ReportContentType, ReportReasonCode } from '@/api/report.api';
import { AppError } from '@/api/types';
import { toast } from '@/components/ui/toast/ToastProvider';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';
interface ReportContentButtonProps {
  contentType: ReportContentType;
  contentId?: string | null;
  iconSize?: number;
  color?: string;
}
const REASONS: { code: ReportReasonCode; label: string }[] = [
  { code: 'inaccurate', label: 'Nội dung không chính xác / sai sự thật' },
  { code: 'offensive', label: 'Ngôn từ xúc phạm / phản cảm' },
  { code: 'irrelevant', label: 'Nội dung không liên quan' },
  { code: 'discriminatory', label: 'Phân biệt đối xử / thiên vị' },
  { code: 'privacy_violation', label: 'Vi phạm quyền riêng tư' },
  { code: 'other', label: 'Lý do khác' },
];
export function ReportContentButton({
  contentType,
  contentId,
  iconSize = 16,
  color
}: ReportContentButtonProps) {
  const colors = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [reasonCode, setReasonCode] = useState<ReportReasonCode | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlight = useRef(false);
  const validId = isReportableContentId(contentId);
  const handleSubmit = async () => {
    if (inFlight.current) return;
    if (!reasonCode) {
      toast.error('Vui lòng chọn một lý do báo cáo.');
      return;
    }
    if (!isReportableContentId(contentId)) {
      toast.error('Tải lại nội dung để báo cáo.');
      return;
    }

    try {
      inFlight.current = true;
      setIsSubmitting(true);

      await reportApi.submitReport({
        contentType: reportContentTypes[contentType],
        contentId,
        reasonCode,
        description: description.trim() || undefined,
      });

      toast.success('Cảm ơn bạn. Chúng tôi sẽ xem xét nội dung này.');
      setModalVisible(false);
      setReasonCode(null);
      setDescription('');
    } catch (e: unknown) {
      toast.error(e instanceof AppError && e.code === 'RESOURCE_NOT_FOUND'
        ? 'Nội dung đã thay đổi hoặc không còn sẵn sàng. Vui lòng tải lại để báo cáo.'
        : e instanceof Error ? e.message : 'Không thể gửi báo cáo lúc này. Vui lòng thử lại sau.');
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <TouchableOpacity
        style={styles.flagButton}
        accessibilityRole="button"
        accessibilityLabel="Báo cáo nội dung AI"
        accessibilityHint={validId ? undefined : 'Tải lại nội dung để báo cáo.'}
        accessibilityState={{ disabled: !validId || isSubmitting }}
        disabled={!validId || isSubmitting}
        onPress={() => setModalVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="flag-outline" size={iconSize} color={color || colors.textMuted} />
      </TouchableOpacity>
      {!validId && <ThemedText>Tải lại nội dung để báo cáo.</ThemedText>}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !inFlight.current && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => !inFlight.current && setModalVisible(false)}
          />
          <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>Báo cáo nội dung AI</ThemedText>
              <TouchableOpacity accessibilityLabel="Đóng báo cáo" onPress={() => !inFlight.current && setModalVisible(false)} disabled={isSubmitting}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
                Vui lòng cho chúng tôi biết lý do bạn báo cáo nội dung này. Phản hồi của bạn giúp chúng tôi cải thiện hệ thống AI tốt hơn.
              </ThemedText>
              <View style={styles.optionsList}>
                {REASONS.map(reason => (
                  <TouchableOpacity
                    key={reason.code}
                    accessibilityRole="radio"
                    accessibilityLabel={reason.label}
                    accessibilityState={{ checked: reasonCode === reason.code, disabled: isSubmitting }}
                    disabled={isSubmitting}
                    style={[
                      styles.optionItem,
                      {
                        borderColor: reasonCode === reason.code ? colors.primary : colors.cardBorder,
                        backgroundColor: reasonCode === reason.code ? colors.primaryLight + '20' : 'transparent'
                      }
                    ]}
                    onPress={() => setReasonCode(reason.code)}
                  >
                    <Ionicons
                      name={reasonCode === reason.code ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={reasonCode === reason.code ? colors.primary : colors.textMuted}
                    />
                    <ThemedText style={[
                      styles.optionText,
                      reasonCode === reason.code && { color: colors.primary, fontFamily: Typography.fontFamily.medium }
                    ]}>
                      {reason.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.inputContainer}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Chi tiết thêm (Tùy chọn)</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: colors.cardBorder
                    }
                  ]}
                  placeholder="Mô tả cụ thể vấn đề bạn gặp phải..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                  editable={!isSubmitting}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: reasonCode ? colors.primary : colors.cardBorder }
                ]}
                accessibilityLabel="Gửi báo cáo"
                disabled={!validId || !reasonCode || isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Gửi Báo Cáo</ThemedText>
                )}
              </TouchableOpacity>
              <View style={{ height: Spacing.six }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  flagButton: {
    padding: Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
  },
  content: {
    paddingHorizontal: Spacing.four,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  optionsList: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.three,
  },
  optionText: {
    fontSize: 15,
  },
  inputContainer: {
    marginBottom: Spacing.six,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    fontSize: 15,
    minHeight: 100,
  },
  submitButton: {
    paddingVertical: Spacing.four,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
  },
});
