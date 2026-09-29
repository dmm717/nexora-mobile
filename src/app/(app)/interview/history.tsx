import React, { useState } from 'react';
import { ScrollView, View, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { interviewApi } from '@/api/interview.api';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { AmbientBackground as SolidBackground } from '@/components/ui/ambient-background';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/interview-history.styles';

import { useFilteredInterviewHistory, FilterType } from '@/components/interview/history/useFilteredInterviewHistory';
import { HistoryHeroHeader } from '@/components/interview/history/HistoryHeroHeader';
import { HistoryEmptyOrErrorStateCard } from '@/components/interview/history/HistoryEmptyOrErrorStateCard';
import { HistoryFilterHeader } from '@/components/interview/history/HistoryFilterHeader';
import { HistoryListItemCard } from '@/components/interview/history/HistoryListItemCard';
export default function InterviewHistoryScreen() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState<number>(1);

  const { data: rawData, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['interview-history'],
    queryFn: () => interviewApi.list(1, 50),
  });

  const {
    totalCountAll,
    totalCountActive,
    totalCountCompleted,
    totalPages,
    paginatedItems,
    hasNextPage,
  } = useFilteredInterviewHistory(rawData, filter, page);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  };

  const isWeb = Platform.OS === 'web';
  const bottomBarHeight = isWeb ? 66 : 54 + insets.bottom;

  return (
    <SolidBackground style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Navigation */}
        <AppScreenHeader
          title="Lịch Sử Phỏng Vấn"
          onBack={() => router.replace('/(tabs)/interview' as any)}
          rightElement={
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home' as any)}>
              <Ionicons name="home-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
            if (isCloseToBottom && hasNextPage) {
              setPage((p) => p + 1);
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header Hero */}
          <HistoryHeroHeader colors={colors} />

          {/* Action Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <ThemedText style={{ fontSize: 15, fontWeight: '700' }}>Danh sách phiên phỏng vấn</ThemedText>
              <ThemedText style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                Hệ thống lưu giữ đầy đủ biên bản âm thanh & chấm điểm.
              </ThemedText>
            </View>
            <TouchableScale
              style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
              onPress={() => router.push('/(app)/interview/preflight' as any)}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <ThemedText style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>+ Bắt đầu mới</ThemedText>
            </TouchableScale>
          </View>

          {/* Header Filter Options */}
          <HistoryFilterHeader
            filter={filter}
            colors={colors}
            totalCountAll={totalCountAll}
            totalCountActive={totalCountActive}
            totalCountCompleted={totalCountCompleted}
            onFilterChange={handleFilterChange}
          />

          {/* Render State / Items */}
          <HistoryEmptyOrErrorStateCard
            isLoading={isLoading}
            error={error}
            paginatedLength={paginatedItems.length}
            colors={colors}
            onStartNewInterview={() => router.push('/(app)/interview/preflight' as any)}
          />

          {!isLoading && !error && paginatedItems.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).springify()} style={{ gap: Spacing.three }}>
              {paginatedItems.map((item: any) => (
                <HistoryListItemCard
                  key={item.id}
                  item={item}
                  colors={colors}
                  onPress={() => {
                    const isCompleted = item.status === 'completed' || item.reportAvailable;
                    if (isCompleted) {
                      router.push(`/(app)/interview/report/${item.id}` as any);
                    } else {
                      router.push(`/(app)/interview/${item.id}` as any);
                    }
                  }}
                />
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>


      {/* Bottom Navigation Bar */}
      <AppBottomNavBar activeTab="interview" />
    </SolidBackground>
  );
}

