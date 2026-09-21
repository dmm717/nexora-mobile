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
import { styles } from '@/styles/career-goals.styles';

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
