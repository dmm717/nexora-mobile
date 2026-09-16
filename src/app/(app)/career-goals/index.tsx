import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { careerGoalsApi } from '@/api/career-goals.api';
import { Colors, Spacing } from '@/constants/theme';
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
        <ActivityIndicator size="large" color="#3525CD" />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Có lỗi xảy ra khi tải danh sách mục tiêu. Vui lòng thử lại.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Mục Tiêu Nghề Nghiệp</ThemedText>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => router.push('/(app)/career-goals/create' as any)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={styles.createButtonText}>Tạo mục tiêu mới</ThemedText>
          </TouchableOpacity>
          {goals?.length === 0 ? (
            <ThemedText style={styles.emptyText}>Chưa có mục tiêu nào được tạo.</ThemedText>
          ) : (
            goals?.map((goal) => (
              <View 
                key={goal.id} 
                style={[
                  styles.card, 
                  { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' },
                  goal.active && styles.activeCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.goalRole}>{goal.targetRole}</ThemedText>
                  {goal.active && (
                    <View style={styles.activeBadge}>
                      <ThemedText style={styles.activeBadgeText}>Đang chọn</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.goalDetail}>Kinh nghiệm: {goal.seniority}</ThemedText>
                {goal.industry && <ThemedText style={styles.goalDetail}>Ngành: {goal.industry}</ThemedText>}
                {goal.targetCompany && <ThemedText style={styles.goalDetail}>Công ty: {goal.targetCompany}</ThemedText>}

                {!goal.active && (
                  <TouchableOpacity 
                    style={styles.setActiveBtn}
                    onPress={() => setActiveMutation.mutate(goal.id)}
                    disabled={setActiveMutation.isPending}
                  >
                    <ThemedText style={styles.setActiveText}>
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
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  backButton: {
    marginRight: Spacing.four,
  },
  title: {
    fontSize: 20,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  createButton: {
    backgroundColor: '#3525CD',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: Spacing.two,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: '#3525CD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalRole: {
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#3525CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalDetail: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  setActiveBtn: {
    marginTop: Spacing.two,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(53, 37, 205, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setActiveText: {
    color: '#3525CD',
    fontWeight: '600',
    fontSize: 13,
  }
});
