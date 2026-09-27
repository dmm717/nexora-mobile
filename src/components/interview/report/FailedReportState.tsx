import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { Spacing } from '@/constants/theme';
import { styles } from '@/styles/interview-report.styles';
import { useRouter } from 'expo-router';

export const FailedReportState = React.memo(({
  colors,
  retryReportMutation,
}: {
  colors: any;
  retryReportMutation: any;
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
          <Ionicons name="alert-circle-outline" size={56} color={colors.danger} />
          <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>
            Chưa thể tạo báo cáo phỏng vấn
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginVertical: Spacing.two, paddingHorizontal: Spacing.four }}>
            Đã xảy ra sự cố trong quá trình phân tích AI. Vui lòng bấm bên dưới để hệ thống tiến hành chấm điểm lại.
          </ThemedText>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, width: 220, marginTop: Spacing.two }]}
            onPress={() => retryReportMutation.mutate()}
            disabled={retryReportMutation.isPending}
          >
            {retryReportMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>Thử Lại Chấm Điểm</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
});
