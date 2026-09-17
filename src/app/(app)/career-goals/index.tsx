import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { careerGoalsApi } from '@/api/career-goals.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CareerGoalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: goals, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['career-goals'],
    queryFn: careerGoalsApi.list,
  });

  const queryClient = useQueryClient();
  const setActiveMutation = useMutation({
    mutationFn: (id: string) => careerGoalsApi.update(id, { active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
    },
  });

  if (isLoading && !isRefetching) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <ThemedText style={{ marginTop: Spacing.two }}>Có lỗi xảy ra khi tải danh sách mục tiêu. Vui lòng thử lại.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Mục Tiêu Nghề Nghiệp</ThemedText>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: colors.primary }]} 
            onPress={() => router.push('/(app)/career-goals/create' as any)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={styles.createButtonText}>Tạo mục tiêu mới</ThemedText>
          </TouchableOpacity>

          {goals?.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="flag-outline" size={48} color={colors.textMuted} />
              <ThemedText style={styles.emptyText}>Chưa có mục tiêu nào được tạo.</ThemedText>
            </View>
          ) : (
            goals?.map((goal) => (
              <View 
                key={goal.id} 
                style={[
                  styles.card, 
                  { backgroundColor: colors.card, borderColor: goal.active ? colors.primary : colors.cardBorder },
                  goal.active && styles.activeCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.goalRole}>{goal.targetRole}</ThemedText>
                  {goal.active ? (
                    <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.activeBadgeText}>Đang chọn</ThemedText>
                    </View>
                  ) : (
                    <View style={[styles.seniorityBadge, { backgroundColor: colors.primaryLight }]}>
                      <ThemedText style={[styles.seniorityBadgeText, { color: colors.primary }]}>
                        {goal.seniority}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {goal.active && (
                  <View style={[styles.seniorityBadge, { backgroundColor: colors.primaryLight, alignSelf: 'flex-start' }]}>
                    <ThemedText style={[styles.seniorityBadgeText, { color: colors.primary }]}>
                      Cấp bậc: {goal.seniority}
                    </ThemedText>
                  </View>
                )}

                {goal.industry && <ThemedText style={styles.goalDetail}>Ngành: {goal.industry}</ThemedText>}
                {goal.targetCompany && <ThemedText style={styles.goalDetail}>Công ty mục tiêu: {goal.targetCompany}</ThemedText>}

                {!goal.active && (
                  <TouchableOpacity 
                    style={[styles.setActiveBtn, { backgroundColor: colors.primaryLight }]}
                    onPress={() => setActiveMutation.mutate(goal.id)}
                    disabled={setActiveMutation.isPending}
                  >
                    <ThemedText style={[styles.setActiveText, { color: colors.primary }]}>
                      {setActiveMutation.isPending && setActiveMutation.variables === goal.id ? 'Đang chọn...' : 'Chọn làm mục tiêu chính'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: Spacing.three,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  createButton: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    ...Shadows.sm,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.two,
  },
  activeCard: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalRole: {
    fontWeight: '700',
    fontSize: 17,
    flex: 1,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  seniorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  seniorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalDetail: {
    fontSize: 14,
    opacity: 0.8,
  },
  setActiveBtn: {
    marginTop: Spacing.two,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  setActiveText: {
    fontWeight: '700',
    fontSize: 13,
  }
});
