import React, { memo } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { styles } from '../CVAnalysisResultView.styles';

export const CVAnalysisLoadingState = memo(({
  slideAnim,
  pulseAnim,
  colors,
  isDark,
}: {
  slideAnim: any;
  pulseAnim: any;
  colors: any;
  isDark: boolean;
}) => {
  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIconWrapper}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.pulseCircle, { opacity: pulseAnim, backgroundColor: colors.primaryLight }]} />
        <View style={[styles.mainIconCircle, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="document-scanner" size={32} color="#FFF" />
        </View>
      </View>

      <View style={styles.loadingTextContainer}>
        <View style={[styles.loadingBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
          <Animated.View style={[styles.loadingBadgeDot, { opacity: pulseAnim, backgroundColor: colors.secondary }]} />
          <ThemedText style={[styles.loadingBadgeText, { color: colors.primary }]}>Xử lý bất đồng bộ · Nexora AI Engine</ThemedText>
        </View>
        <ThemedText style={styles.loadingTitle}>Đang phân tích hồ sơ chuyên sâu...</ThemedText>
        <ThemedText style={styles.loadingDesc}>
          Hệ thống đang trích xuất dữ liệu, đối chiếu các trục tiêu chuẩn và đánh giá bằng chứng.
        </ThemedText>
      </View>

      <View style={[styles.loadingBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
        <Animated.View style={[styles.loadingBarFill, { backgroundColor: colors.primary, width: '33%', left: slideInterpolate }]} />
      </View>

      <ThemedText style={styles.loadingHint}>Bạn có thể rời trang này an toàn · Báo cáo sẽ được lưu giữ</ThemedText>
    </View>
  );
});

export const CVAnalysisFailedState = memo(({
  errorCode,
  colors,
  onReset,
}: {
  errorCode?: string;
  colors: any;
  onReset: () => void;
}) => (
  <View style={styles.failedContainer}>
    <View style={[styles.failedIconBox, { backgroundColor: colors.errorLight, borderColor: 'rgba(239,68,68,0.2)' }]}>
      <Ionicons name="warning-outline" size={32} color={colors.error} />
    </View>
    <ThemedText style={styles.failedTitle}>Phân tích CV không thành công</ThemedText>
    <ThemedText style={styles.failedDesc}>
      Hệ thống không thể bóc tách nội dung hoặc dịch vụ AI gặp sự cố. {errorCode ? `(Mã lỗi: ${errorCode})` : ''}
    </ThemedText>
    <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={onReset}>
      <Ionicons name="refresh" size={18} color="#FFF" />
      <ThemedText style={styles.btnPrimaryText}>Thực hiện phân tích mới</ThemedText>
    </TouchableOpacity>
  </View>
));

export const CVActionCtaBanner = memo(({ colors, onNavigate }: { colors: any; onNavigate: () => void }) => (
  <View style={[styles.ctaBanner, { backgroundColor: colors.primary }]}>
    <View style={styles.ctaBadge}>
      <ThemedText style={styles.ctaBadgeText}>Hành động tiếp theo</ThemedText>
    </View>
    <ThemedText style={styles.ctaTitle}>Luyện phỏng vấn AI</ThemedText>
    <ThemedText style={styles.ctaDesc}>
      Chuyển sang phòng phỏng vấn để bám sát JD và CV của bạn.
    </ThemedText>
    <TouchableOpacity style={styles.ctaButton} onPress={onNavigate}>
      <ThemedText style={[styles.ctaButtonText, { color: colors.primary }]}>Chuyển sang phòng phỏng vấn</ThemedText>
      <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
    </TouchableOpacity>
  </View>
));
