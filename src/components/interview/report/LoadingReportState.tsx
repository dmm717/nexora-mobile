import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { Spacing, Radius, Shadows } from '@/constants/theme';
import { styles } from '@/styles/interview-report.styles';
import { useRouter } from 'expo-router';

export const LoadingReportState = React.memo(({
  colors,
  interview,
}: {
  colors: any;
  interview: any;
}) => {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AppScreenHeader
          title="Báo Cáo Phỏng Vấn AI"
          fallbackRoute="/(tabs)/interview"
          rightElement={
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home' as any)} style={{ padding: 6 }}>
              <Ionicons name="home-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          }
        />
        <View style={styles.centerContainer}>
          <View
            style={{
              padding: Spacing.four,
              borderRadius: Radius.lg,
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              alignItems: 'center',
              maxWidth: 340,
              width: '90%',
              ...Shadows.md,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: Spacing.three }} />
            <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: Spacing.two }}>
              AI Đang Tổng Hợp Báo Cáo
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', opacity: 0.8, fontSize: 14, lineHeight: 20 }}>
              Hệ thống đang phân tích chi tiết câu trả lời, mô hình STAR và tổng hợp điểm số. Vui lòng đợi trong giây lát...
            </ThemedText>

            {interview?.evaluationProgress && (
              <View style={{ marginTop: Spacing.three, width: '100%' }}>
                <ThemedText style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
                  Đã xử lý: {interview.evaluationProgress.ready} / {interview.evaluationProgress.total} câu hỏi
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
});
