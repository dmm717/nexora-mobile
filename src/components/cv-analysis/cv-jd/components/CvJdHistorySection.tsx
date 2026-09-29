import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { styles } from '@/styles/cv-jd.styles';
import { AnalysisHistoryItemCard } from './AnalysisHistoryItemCard';

export const CvJdHistorySection = React.memo(({
  isHistoryLoading,
  isFetchingNextPage,
  currentHistoryItems,
  profile,
  colors,
  setPrimaryResumeMutation,
  router,
  onLayout,
}: {
  isHistoryLoading: boolean;
  isFetchingNextPage?: boolean;
  currentHistoryItems: any[];
  profile: any;
  colors: any;
  setPrimaryResumeMutation: any;
  router: any;
  onLayout?: (event: any) => void;
}) => {
  return (
    <View style={styles.historySection} onLayout={onLayout}>
      <View style={styles.historyHeader}>
        <Ionicons name="time" size={20} color={colors.text} />
        <ThemedText style={styles.historyTitle}>Lịch sử phân tích</ThemedText>
      </View>

      {isHistoryLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
      ) : currentHistoryItems.length ? (
        <View style={{ gap: 12 }}>
          {currentHistoryItems.map((item: any) => (
            <AnalysisHistoryItemCard
              key={item.id}
              item={item}
              profile={profile}
              colors={colors}
              onSetPrimary={(resumeId) => setPrimaryResumeMutation.mutate(resumeId)}
              isSettingPrimary={setPrimaryResumeMutation.isPending}
              onViewResult={() => router.push(`/(app)/cv-analysis/${item.id}` as any)}
            />
          ))}
          {isFetchingNextPage && (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12, marginBottom: 24 }} />
          )}
        </View>
      ) : (
        <View style={{ alignItems: 'center', marginTop: 24, padding: 24, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16 }}>
          <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12, opacity: 0.5 }} />
          <ThemedText style={[styles.emptyHistory, { color: colors.textSecondary }]}>
            Bạn chưa thực hiện bài phân tích nào. Hãy bắt đầu ngay để khám phá tiềm năng hồ sơ của bạn.
          </ThemedText>
        </View>
      )}
    </View>
  );
});
