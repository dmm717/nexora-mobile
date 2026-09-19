import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { interviewApi } from '@/api/interview.api';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Badge } from '@/components/ui/badge';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard as SurfaceCard } from '@/components/ui/glass-card';
import { AmbientBackground as SolidBackground } from '@/components/ui/ambient-background';

type FilterType = 'all' | 'active' | 'completed';

export default function InterviewHistoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all');

  // Fetch Interview History
  const { data: rawData, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ['interview-history'],
    queryFn: () => interviewApi.list(1, 50),
  });

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1); // Reset to page 1 on status change
  };

  const handleRefresh = () => {
    refetch();
  };

  // Helper to check if item is completed
  const isItemCompleted = (item: any) =>
    item.status === 'completed' || Boolean(item.reportAvailable);

  // Ensure items are sorted by latest first (descending date), safely handling missing dates
  const allItems = [...(rawData?.items ?? [])].sort((a, b) => {
    const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // Categorize items dynamically for counts & accurate filter sorting
  const activeItems = allItems.filter((item) => !isItemCompleted(item));
  const completedItems = allItems.filter((item) => isItemCompleted(item));

  const totalCountAll = allItems.length;
  const totalCountActive = activeItems.length;
  const totalCountCompleted = completedItems.length;

  // Selected filter list & pagination
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

  return (
    <SolidBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableScale onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableScale>
          <ThemedText style={styles.headerTitle}>Lịch sử phỏng vấn</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />}
        >
          {/* TOP CONTROL BAR (Sort Pills) */}
          <View style={styles.topControlContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarScroll}>
              <View>
                <TouchableScale
                  onPress={() => handleFilterChange('all')}
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
                  onPress={() => handleFilterChange('active')}
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
                  onPress={() => handleFilterChange('completed')}
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

          {/* LIST CONTENT */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <SurfaceCard style={styles.emptyCard}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.danger + '20' }]}>
                <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
              </View>
              <ThemedText style={styles.emptyTitle}>Lỗi tải dữ liệu</ThemedText>
              <ThemedText style={[styles.emptySub, { color: colors.textSecondary }]}>
                {String((error as any)?.message || error)}
              </ThemedText>
              <TouchableScale
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleRefresh}
              >
                <Ionicons name="refresh" size={18} color="#ffffff" />
                <ThemedText style={styles.primaryActionBtnText}>Thử Lại</ThemedText>
              </TouchableScale>
            </SurfaceCard>
          ) : paginatedItems.length === 0 ? (
            <SurfaceCard style={styles.emptyCard}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="journal-outline" size={32} color={colors.primary} />
              </View>
              <ThemedText style={styles.emptyTitle}>Không tìm thấy phiên phỏng vấn nào</ThemedText>
              <ThemedText style={[styles.emptySub, { color: colors.textSecondary }]}>
                {filter === 'completed'
                  ? 'Bạn chưa có bài phỏng vấn đã hoàn thành.'
                  : filter === 'active'
                  ? 'Không có bài phỏng vấn nào đang diễn ra.'
                  : 'Bắt đầu luyện tập bài phỏng vấn đầu tiên để tích lũy dữ liệu.'}
              </ThemedText>

              <TouchableScale
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(app)/interview/preflight' as any)}
              >
                <Ionicons name="add" size={18} color="#ffffff" />
                <ThemedText style={styles.primaryActionBtnText}>Tạo Phiên Phỏng Vấn Mới</ThemedText>
              </TouchableScale>
            </SurfaceCard>
          ) : (
            <Animated.View entering={FadeInDown.duration(400).springify()} style={{ gap: Spacing.three }}>
              {paginatedItems.map((item) => {
                const isCompleted = item.status === 'completed' || item.reportAvailable;
                const dateObj = new Date(item.createdAt);
                const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const fullTimestamp = `${timeStr}  •  ${dateStr}`;

                return (
                  <TouchableScale
                    key={item.id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => {
                      if (isCompleted) {
                        router.push(`/(app)/interview/report/${item.id}` as any);
                      } else {
                        router.push(`/(app)/interview/${item.id}` as any);
                      }
                    }}
                  >
                    {/* Header Row: Role Title + Status Badge */}
                    <View style={styles.cardHeaderRow}>
                      <ThemedText style={styles.cardTitle} numberOfLines={1}>
                        {item.role || 'Phỏng Vấn AI'}
                      </ThemedText>
                      <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                        {isCompleted ? 'Hoàn thành' : 'Đang làm'}
                      </Badge>
                    </View>

                    {/* Middle Row: Pill Badges */}
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

                    {/* Footer Row: Date Time + Action Link */}
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
              })}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Floating Pagination Bar (Always Visible) */}
      <View style={styles.floatingNavContainer}>
        <View style={[styles.inlineNavContainer, { 
          backgroundColor: colors.card, 
          borderColor: colors.cardBorder, 
          shadowColor: '#000', 
          shadowOpacity: 0.1, 
          shadowRadius: 8, 
          shadowOffset: { width: 0, height: 4 }, 
          elevation: 5,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 24
        }]}>
          <TouchableScale
            style={[styles.miniPageBtn, page === 1 ? styles.disabledButton : null]}
            disabled={page === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
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
            onPress={() => setPage((p) => p + 1)}
          >
            <ThemedText style={[styles.miniPageBtnText, { color: (!hasNextPage) ? colors.border : colors.textPrimary }]}>
              Sau
            </ThemedText>
            <Ionicons name="chevron-forward" size={16} color={(!hasNextPage) ? colors.border : colors.primary} />
          </TouchableScale>
        </View>
      </View>
    </SolidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  topControlContainer: {
    height: 42,
    position: 'relative',
    justifyContent: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  overlayControlRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filterBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.semibold,
  },
  circleTriggerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pageDotBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pageDotText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
  },
  inlineNavContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  miniPageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 2,
  },
  miniPageBtnText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.semibold,
  },
  inlinePageIndicator: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  centerContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
    marginRight: 8,
  },
  metaBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  actionText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  emptyCard: {
    padding: Spacing.five,
    borderRadius: 16,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fontFamily.bold,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    marginTop: 8,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  disabledButton: {
    opacity: 0.4,
  },
});
