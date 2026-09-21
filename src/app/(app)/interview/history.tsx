import React, { useState, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { interviewApi } from '@/api/interview.api';
import { Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Badge } from '@/components/ui/badge';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { AmbientBackground as SolidBackground } from '@/components/ui/ambient-background';
import { styles } from './history.styles';

type FilterType = 'all' | 'active' | 'completed';

function useFilteredInterviewHistory(rawData: any, filter: FilterType, page: number) {
  return useMemo(() => {
    const isItemCompleted = (item: any) =>
      item.status === 'completed' || Boolean(item.reportAvailable);

    const allItems = [...(rawData?.items ?? [])].sort((a, b) => {
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const activeItems = allItems.filter((item) => !isItemCompleted(item));
    const completedItems = allItems.filter((item) => isItemCompleted(item));

    const totalCountAll = allItems.length;
    const totalCountActive = activeItems.length;
    const totalCountCompleted = completedItems.length;

    const filteredList =
      filter === 'active'
        ? activeItems
        : filter === 'completed'
        ? completedItems
        : allItems;

    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
    const paginatedItems = filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasNextPage = page < totalPages;

    return {
      totalCountAll,
      totalCountActive,
      totalCountCompleted,
      totalPages,
      paginatedItems,
      hasNextPage,
    };
  }, [rawData, filter, page]);
}

const HistoryEmptyOrErrorStateCard = React.memo(({
  isLoading,
  error,
  paginatedLength,
  colors,
  onStartNewInterview,
}: {
  isLoading: boolean;
  error: any;
  paginatedLength: number;
  colors: any;
  onStartNewInterview: () => void;
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || paginatedLength === 0) {
    return (
      <SurfaceCard style={styles.emptyCard}>
        <View style={[styles.emptyIconBox, { backgroundColor: colors.backgroundElement }]}>
          <Ionicons
            name={error ? 'alert-circle-outline' : 'document-text-outline'}
            size={28}
            color={colors.textSecondary}
          />
        </View>
        <ThemedText style={styles.emptyTitle}>
          {error ? 'Không thể tải lịch sử' : 'Chưa có lịch sử phỏng vấn'}
        </ThemedText>
        <ThemedText style={[styles.emptySub, { color: colors.textSecondary }]}>
          {error
            ? 'Đã có lỗi xảy ra khi kết nối tới máy chủ.'
            : 'Hãy bắt đầu tạo buổi phỏng vấn đầu tiên của bạn ngay!'}
        </ThemedText>
        <TouchableScale
          style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
          onPress={onStartNewInterview}
        >
          <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
          <ThemedText style={styles.primaryActionBtnText}>
            Tạo phỏng vấn mới
          </ThemedText>
        </TouchableScale>
      </SurfaceCard>
    );
  }

  return null;
});

export default function InterviewHistoryScreen() {
  const colors = useTheme();
  const router = useRouter();
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

  return (
    <SolidBackground style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Navigation */}
        <View style={[styles.header, { borderColor: colors.cardBorder }]}>
          <TouchableScale style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableScale>
          <ThemedText style={styles.headerTitle}>Lịch Sử Phỏng Vấn</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
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
            onStartNewInterview={() => router.push('/(tabs)/cv-jd' as any)}
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

      {/* Floating Pagination Bar (Always Visible) */}
      <HistoryPaginationBar
        page={page}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        colors={colors}
        onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setPage((p) => p + 1)}
      />
    </SolidBackground>
  );
}

const HistoryFilterHeader = React.memo(({
  filter,
  colors,
  totalCountAll,
  totalCountActive,
  totalCountCompleted,
  onFilterChange,
}: {
  filter: FilterType;
  colors: any;
  totalCountAll: number;
  totalCountActive: number;
  totalCountCompleted: number;
  onFilterChange: (newFilter: FilterType) => void;
}) => (
  <View style={styles.topControlContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarScroll}>
      <View>
        <TouchableScale
          onPress={() => onFilterChange('all')}
          style={[
            styles.filterChip,
            filter === 'all'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.filterChipText, { color: filter === 'all' ? '#ffffff' : colors.textSecondary }]}>
            Tất cả ({totalCountAll})
          </ThemedText>
        </TouchableScale>
      </View>

      <View>
        <TouchableScale
          onPress={() => onFilterChange('active')}
          style={[
            styles.filterChip,
            filter === 'active'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.filterChipText, { color: filter === 'active' ? '#ffffff' : colors.textSecondary }]}>
            Đang làm ({totalCountActive})
          </ThemedText>
        </TouchableScale>
      </View>

      <View>
        <TouchableScale
          onPress={() => onFilterChange('completed')}
          style={[
            styles.filterChip,
            filter === 'completed'
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.filterChipText, { color: filter === 'completed' ? '#ffffff' : colors.textSecondary }]}>
            Đã xong ({totalCountCompleted})
          </ThemedText>
        </TouchableScale>
      </View>
    </ScrollView>
  </View>
));

const HistoryListItemCard = React.memo(({
  item,
  colors,
  onPress,
}: {
  item: any;
  colors: any;
  onPress: () => void;
}) => {
  const isCompleted = item.status === 'completed' || item.reportAvailable;
  const dateObj = new Date(item.createdAt);
  const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fullTimestamp = `${timeStr}  •  ${dateStr}`;

  return (
    <TouchableScale
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={onPress}
    >
      <View style={styles.cardHeaderRow}>
        <ThemedText style={styles.cardTitle} numberOfLines={1}>
          {item.role || 'Phỏng Vấn AI'}
        </ThemedText>
        <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
          {isCompleted ? 'Hoàn thành' : 'Đang làm'}
        </Badge>
      </View>

      <View style={styles.metaBadgesRow}>
        {item.seniority && (
          <Badge variant="neutral" size="sm">
            {item.seniority}
          </Badge>
        )}
        {item.interviewType && (
          <Badge variant="info" size="sm">
            {item.interviewType}
          </Badge>
        )}
        <Badge variant={isCompleted ? 'success' : 'primary'} size="sm">
          Đã trả lời: {item.answeredQuestionCount} câu
        </Badge>
      </View>

      <View style={styles.footerRow}>
        <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
          {fullTimestamp}
        </ThemedText>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ThemedText style={[styles.actionText, { color: colors.primary }]}>
            {isCompleted ? 'Xem Báo Cáo' : 'Tiếp Tục'}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableScale>
  );
});

const HistoryPaginationBar = React.memo(({
  page,
  totalPages,
  hasNextPage,
  colors,
  onPrevPage,
  onNextPage,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  colors: any;
  onPrevPage: () => void;
  onNextPage: () => void;
}) => (
  <View style={styles.floatingNavContainer}>
    <View style={[styles.inlineNavContainer, { 
      backgroundColor: colors.card, 
      borderColor: colors.cardBorder, 
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 24
    }]}>
      <TouchableScale
        style={[styles.miniPageBtn, page === 1 ? styles.disabledButton : null]}
        disabled={page === 1}
        onPress={onPrevPage}
      >
        <Ionicons name="chevron-back" size={16} color={page === 1 ? colors.border : colors.primary} />
        <ThemedText style={[styles.miniPageBtnText, { color: page === 1 ? colors.border : colors.textPrimary }]}>
          Trước
        </ThemedText>
      </TouchableScale>

      <ThemedText style={[styles.inlinePageIndicator, { color: colors.textPrimary, marginHorizontal: 16 }]}>
        Trang {page}/{totalPages}
      </ThemedText>

      <TouchableScale
        style={[styles.miniPageBtn, (!hasNextPage) ? styles.disabledButton : null]}
        disabled={!hasNextPage}
        onPress={onNextPage}
      >
        <ThemedText style={[styles.miniPageBtnText, { color: (!hasNextPage) ? colors.border : colors.textPrimary }]}>
          Sau
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={(!hasNextPage) ? colors.border : colors.primary} />
      </TouchableScale>
    </View>
  </View>
));
