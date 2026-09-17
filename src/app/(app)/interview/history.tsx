import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { interviewApi } from '@/api/interview.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function InterviewHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['interview-history', page],
    queryFn: () => interviewApi.list(page, 20),
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Lịch Sử Phỏng Vấn AI</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {isLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : !data || data.items.length === 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
              <Ionicons name="journal-outline" size={48} color={colors.textMuted} />
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.7 }}>Bạn chưa thực hiện phiên phỏng vấn nào.</ThemedText>
              
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%', marginTop: Spacing.three }]}
                onPress={() => router.push('/(app)/interview/preflight' as any)}
              >
                <ThemedText style={styles.primaryButtonText}>Tạo Phiên Phỏng Vấn Mới</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: Spacing.three }}>
              {data.items.map((item) => {
                const isCompleted = item.status === 'completed';
                const statusColor = isCompleted ? colors.accent : item.status === 'active' ? colors.warning : colors.textMuted;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => {
                      if (isCompleted || item.reportAvailable) {
                        router.push(`/(app)/interview/report/${item.id}` as any);
                      } else {
                        router.push(`/(app)/interview/${item.id}` as any);
                      }
                    }}
                  >
                    <View style={styles.cardHeaderRow}>
                      <ThemedText type="subtitle" style={styles.cardTitle}>{item.role || 'Phỏng Vấn AI'}</ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
                        <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                          {item.status.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.detailText}>
                      Cấp bậc: {item.seniority} • Loại: {item.interviewType} • Đã trả lời: {item.answeredQuestionCount} câu
                    </ThemedText>

                    <View style={styles.footerRow}>
                      <ThemedText style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </ThemedText>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ThemedText style={[styles.actionText, { color: colors.primary }]}>
                          {isCompleted ? 'Xem Báo Cáo' : 'Tiếp Tục'}
                        </ThemedText>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Pagination controls */}
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.pageButton, page === 1 && styles.disabledButton]}
                  disabled={page === 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ThemedText style={styles.pageButtonText}>Trang Trước</ThemedText>
                </TouchableOpacity>

                <ThemedText style={styles.pageIndicator}>Trang {data.page}</ThemedText>

                <TouchableOpacity
                  style={[styles.pageButton, !data.hasNextPage && styles.disabledButton]}
                  disabled={!data.hasNextPage}
                  onPress={() => setPage((p) => p + 1)}
                >
                  <ThemedText style={styles.pageButtonText}>Trang Sau</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: Spacing.three },
  title: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailText: {
    fontSize: 13,
    opacity: 0.8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  pageButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: '#64748B',
  },
  pageButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  pageIndicator: { fontSize: 13, fontWeight: '700' },
  disabledButton: { opacity: 0.4 },
});
