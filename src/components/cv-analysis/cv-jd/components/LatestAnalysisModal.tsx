import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Typography } from '@/constants/theme';
import { styles } from '@/styles/cv-jd.styles';

export const LatestAnalysisModal = React.memo(({
  visible,
  latestCompletedAnalysis,
  colors,
  colorScheme,
  doNotShowAgain,
  onClose,
  onViewResult,
  onToggleDoNotShow,
}: {
  visible: boolean;
  latestCompletedAnalysis: any;
  colors: any;
  colorScheme: string;
  doNotShowAgain: boolean;
  onClose: () => void;
  onViewResult: (id: string) => void;
  onToggleDoNotShow: () => void;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlayPremium}>
      {latestCompletedAnalysis && (
        <SurfaceCard style={[styles.modalCardPremium, { backgroundColor: colors.background, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={{ padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="checkmark-done" size={20} color="#10B981" />
              </View>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ThemedText style={{ fontSize: 11, fontFamily: Typography.fontFamily.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              KẾT QUẢ ĐÃ SẴN SÀNG
            </ThemedText>
            <ThemedText style={{ fontSize: 24, fontFamily: Typography.fontFamily.bold, color: colors.text }}>
              Bản phân tích gần nhất
            </ThemedText>
          </View>

          <View style={{ padding: 24, gap: 16 }}>
            <View style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9FAFB', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Chế độ</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text }}>
                  {latestCompletedAnalysis.mode === 'job_targeted' ? 'Đánh giá theo JD' : 'Tiêu chuẩn ngành'}
                </ThemedText>
              </View>
              <View style={{ height: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Mục tiêu</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text, maxWidth: 180 }} numberOfLines={1}>
                  {latestCompletedAnalysis.mode === 'job_targeted' ? 'Mô tả công việc (JD)' : (latestCompletedAnalysis.context?.targetRole || 'Mặc định')}
                </ThemedText>
              </View>
              <View style={{ height: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>Thời gian</ThemedText>
                <ThemedText style={{ fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: colors.text }}>
                  {new Date(latestCompletedAnalysis.createdAt).toLocaleDateString('vi-VN')}
                </ThemedText>
              </View>
            </View>

            <TouchableScale
              onPress={() => onViewResult(latestCompletedAnalysis.id)}
              style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 }}
            >
              <ThemedText style={{ color: '#fff', fontSize: 15, fontFamily: Typography.fontFamily.semibold }}>Xem ngay kết quả</ThemedText>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableScale>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
              onPress={onToggleDoNotShow}
              activeOpacity={0.7}
            >
              <View style={[{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' }, doNotShowAgain && { backgroundColor: colors.textSecondary, borderColor: colors.textSecondary }]}>
                {doNotShowAgain && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>
                Không hiện lại hộp thoại này
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SurfaceCard>
      )}
    </View>
  </Modal>
));
