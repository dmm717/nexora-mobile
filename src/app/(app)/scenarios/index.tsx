import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { scenariosApi } from '@/api/scenarios.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DIFFICULTIES = [
  { id: '', label: 'Tất cả' },
  { id: 'junior', label: 'Junior' },
  { id: 'medium', label: 'Medium' },
  { id: 'senior', label: 'Senior' },
];

export default function ScenariosListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const { data: categories } = useQuery({
    queryKey: ['scenario-categories'],
    queryFn: scenariosApi.listCategories,
  });

  const { data: progress } = useQuery({
    queryKey: ['scenario-progress'],
    queryFn: scenariosApi.getProgress,
  });

  const { data: scenarioPage, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['scenarios', selectedCategory, selectedDifficulty, search],
    queryFn: () => scenariosApi.list({
      category: selectedCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      search: search.trim() || undefined,
      page: 1,
      pageSize: 30,
    }),
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Kịch Bản Tình Huống AI</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {/* Progress Banner */}
          {progress && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="trophy-outline" size={22} color={colors.warning} />
                <ThemedText type="subtitle" style={styles.cardTitle}>Tiến Độ Luyện Tình Huống</ThemedText>
              </View>

              <View style={styles.progressStatsRow}>
                <View style={styles.statBox}>
                  <ThemedText style={[styles.statNumber, { color: colors.primary }]}>{progress.attemptCount}</ThemedText>
                  <ThemedText style={styles.statLabel}>Lượt thử</ThemedText>
                </View>
                <View style={styles.statBox}>
                  <ThemedText style={[styles.statNumber, { color: colors.accent }]}>
                    {progress.averageScore !== null && progress.averageScore !== undefined
                      ? `${Math.round(progress.averageScore)}`
                      : 'Chưa có'}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Điểm TB</ThemedText>
                </View>
                <View style={styles.statBox}>
                  <ThemedText style={[styles.statNumber, { color: colors.warning }]}>
                    {progress.recommendedDifficulty?.toUpperCase() || 'MEDIUM'}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Đề xuất</ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Search Bar */}
          <View style={[styles.searchBox, { borderColor: colors.inputBorder, backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm kiếm kịch bản tình huống..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Category Chips */}
          {categories && categories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                  !selectedCategory && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedCategory('')}
              >
                <ThemedText style={[styles.categoryChipText, !selectedCategory && { color: '#fff' }]}>Tất cả danh mục</ThemedText>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                    selectedCategory === cat.slug && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setSelectedCategory(cat.slug)}
                >
                  <ThemedText style={[styles.categoryChipText, selectedCategory === cat.slug && { color: '#fff' }]}>
                    {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Difficulty Chips */}
          <View style={styles.difficultyRow}>
            {DIFFICULTIES.map((diff) => (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.diffChip,
                  { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                  selectedDifficulty === diff.id && { backgroundColor: colors.secondary, borderColor: colors.secondary }
                ]}
                onPress={() => setSelectedDifficulty(diff.id)}
              >
                <ThemedText style={[styles.diffChipText, selectedDifficulty === diff.id && { color: '#fff' }]}>
                  {diff.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scenario List */}
          {isLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </ThemedView>
          ) : !scenarioPage || scenarioPage.items.length === 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
              <Ionicons name="construct-outline" size={48} color={colors.textMuted} />
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.7 }}>Không tìm thấy kịch bản phù hợp.</ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.three }}>
              {scenarioPage.items.map((scenario) => (
                <TouchableOpacity
                  key={scenario.id}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => router.push(`/(app)/scenarios/${scenario.slug}` as any)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                      <ThemedText style={[styles.badgeText, { color: colors.primary }]}>{scenario.categoryName}</ThemedText>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                      <ThemedText style={[styles.badgeText, { color: colors.accent }]}>{scenario.difficulty.toUpperCase()}</ThemedText>
                    </View>
                  </View>

                  <ThemedText type="subtitle" style={styles.scenarioTitle}>{scenario.title}</ThemedText>
                  <ThemedText style={styles.scenarioSummary}>{scenario.summary}</ThemedText>

                  <View style={styles.cardFooterRow}>
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <ThemedText style={styles.timeText}>{scenario.estimatedMinutes} phút</ThemedText>
                    </View>
                    <View style={styles.actionRow}>
                      <ThemedText style={[styles.actionText, { color: colors.primary }]}>Thực Hiện</ThemedText>
                      <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.two,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryScroll: {
    gap: Spacing.two,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  diffChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  diffChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scenarioSummary: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
