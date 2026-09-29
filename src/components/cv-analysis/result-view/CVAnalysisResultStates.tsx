import React, { memo, useState, useEffect } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { ThemedText } from '@/components/themed-text';
import { styles } from '../CVAnalysisResultView.styles';
import { useTypewriter } from '@/hooks/useTypewriter';
import { ANALYSIS_ANIMATION_CONFIG } from '../CVAnalysisResultView';

const DynamicText = memo(({ loadingText, successText, delay, speed = 35, isSuccess, style }: { loadingText: string, successText: string, delay: number, speed?: number, isSuccess: boolean, style: any }) => {
  const { displayedText } = useTypewriter(successText, speed, delay, isSuccess);
  return <ThemedText style={style}>{isSuccess ? displayedText : loadingText}</ThemedText>;
});

export const CVAnalysisSkeleton = memo(({ colors, isDark }: { colors: any; isDark: boolean }) => {
  const baseColor = isDark ? '#374151' : '#E5E7EB';
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {/* Skeleton Header */}
      <View style={{ height: 100, backgroundColor: baseColor, borderRadius: 12, opacity: 0.5 }} />
      {/* Skeleton Body */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, height: 80, backgroundColor: baseColor, borderRadius: 12, opacity: 0.5 }} />
        <View style={{ flex: 1, height: 80, backgroundColor: baseColor, borderRadius: 12, opacity: 0.5 }} />
      </View>
      <View style={{ height: 200, backgroundColor: baseColor, borderRadius: 12, opacity: 0.5 }} />
    </View>
  );
});

export const CVAnalysisLoadingState = memo(({
  simulatedProgressAnim,
  pulseAnim,
  colors,
  isDark,
  isSuccess = false,
}: {
  simulatedProgressAnim: any;
  pulseAnim: any;
  colors: any;
  isDark: boolean;
  isSuccess?: boolean;
}) => {
  const [badgeScaleAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (isSuccess) {
      Animated.spring(badgeScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Ensure progress reaches 100% when success triggers
      setTimeout(() => {
        Animated.timing(simulatedProgressAnim, {
          toValue: 100,
          duration: 600,
          useNativeDriver: false,
        }).start();
      }, 50);
    } else {
      badgeScaleAnim.setValue(0);
    }
  }, [isSuccess, badgeScaleAnim, simulatedProgressAnim]);

  const widthInterpolate = simulatedProgressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIconWrapper}>
        {!isSuccess && <Animated.View style={[StyleSheet.absoluteFill, styles.pulseCircle, { opacity: pulseAnim, backgroundColor: colors.primaryLight }]} />}
        <View style={[
          styles.mainIconCircle, 
          isSuccess 
            ? { backgroundColor: 'transparent', shadowColor: 'transparent', elevation: 0 } 
            : { backgroundColor: colors.primary }
        ]}>
          {isSuccess ? (
            <LottieView
              source={require('../../../assets/lottie/success-check.json')}
              autoPlay
              loop={false}
              style={{ width: 180, height: 180, transform: [{ scale: 1.2 }] }}
            />
          ) : (
            <MaterialIcons name="document-scanner" size={32} color="#FFF" />
          )}
        </View>
      </View>

      <View style={styles.loadingTextContainer}>
        {isSuccess ? (
          <Animated.View style={[styles.loadingBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6', transform: [{ scaleX: badgeScaleAnim }] }]}>
            <ThemedText style={[styles.loadingBadgeText, { color: colors.success || '#10B981' }]}>
              Phân tích hoàn tất
            </ThemedText>
          </Animated.View>
        ) : (
          <View style={[styles.loadingBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
            <Animated.View style={[styles.loadingBadgeDot, { opacity: pulseAnim, backgroundColor: colors.secondary }]} />
            <ThemedText style={[styles.loadingBadgeText, { color: colors.primary }]}>
              Xử lý bất đồng bộ · Nexora AI Engine
            </ThemedText>
          </View>
        )}
        <DynamicText 
          loadingText="Đang phân tích hồ sơ chuyên sâu..."
          successText={ANALYSIS_ANIMATION_CONFIG.successTitleText}
          delay={ANALYSIS_ANIMATION_CONFIG.successTitleDelayMs}
          speed={ANALYSIS_ANIMATION_CONFIG.typingSpeedMs}
          isSuccess={!!isSuccess}
          style={styles.loadingTitle}
        />
        <DynamicText 
          loadingText="Hệ thống đang trích xuất dữ liệu, đối chiếu các trục tiêu chuẩn và đánh giá bằng chứng."
          successText={ANALYSIS_ANIMATION_CONFIG.successDescText}
          delay={ANALYSIS_ANIMATION_CONFIG.successDescDelayMs}
          speed={ANALYSIS_ANIMATION_CONFIG.typingSpeedMs}
          isSuccess={!!isSuccess}
          style={styles.loadingDesc}
        />
      </View>

      <View style={[styles.loadingBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB', overflow: 'hidden' }]}>
        <Animated.View style={[styles.loadingBarFill, { backgroundColor: isSuccess ? (colors.success || '#10B981') : colors.primary, width: widthInterpolate, left: 0 }]} />
      </View>

      <ThemedText style={[styles.loadingHint, { textAlign: 'center' }]} numberOfLines={1} adjustsFontSizeToFit>
        Bạn có thể rời trang này an toàn · Báo cáo sẽ được lưu giữ
      </ThemedText>
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
