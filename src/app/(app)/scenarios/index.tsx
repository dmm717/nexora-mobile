import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, TextInput, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { scenariosApi } from '@/api/scenarios.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { styles } from '@/styles/scenarios.styles';
import { safeBack } from '@/utils/navigation';

const DIFFICULTIES = [
  { id: '', label: 'Tất cả' },
  { id: 'easy', label: 'Dễ' },
  { id: 'medium', label: 'Trung bình' },
  { id: 'hard', label: 'Khó' },
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

  const formatDifficultyLabel = (diff: string) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'DỄ';
    if (d === 'medium') return 'TRUNG BÌNH';
    if (d === 'hard') return 'KHÓ';
    return diff.toUpperCase();
  };

  const recommendedScenario = React.useMemo(() => {
    const items = scenarioPage?.items || [];
    if (items.length === 0) return null;
    const recDiff = progress?.recommendedDifficulty;
    if (recDiff) {
      const match = items.find((s) => s.difficulty === recDiff);
      if (match) return match;
    }
    return items[0];
  }, [scenarioPage?.items, progress]);

  const hasProgressAuthority = progress !== undefined;
  const isNewUser = hasProgressAuthority && (progress.attemptCount === 0 || progress.completedAttempts === 0);
  const recommendationLabel = !hasProgressAuthority
    ? 'Tình huống gợi ý'
    : isNewUser
      ? 'Gợi ý để bắt đầu'
      : 'Tình huống ưu tiên hôm nay';

  const recommendationAction = !hasProgressAuthority
    ? 'Xem tình huống'
    : isNewUser
      ? 'Bắt đầu giải quyết'
      : 'Luyện lại tình huống';

  const hasFilters = Boolean(selectedCategory || selectedDifficulty || search.trim());

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSearch('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <AppScreenHeader title="Kịch Bản Tình Huống AI" fallbackRoute="/(tabs)/practice" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {/* Progress Banner */}
          {progress ? (
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
                    {formatDifficultyLabel(progress.recommendedDifficulty || 'medium')}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Đề xuất</ThemedText>
                </View>
              </View>
            </View>
          ) : null}

          {/* Featured / Recommended Scenario Card */}
          {recommendedScenario && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.featuredCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/(app)/scenarios/${recommendedScenario.slug}` as any)}
            >
              <View style={styles.featuredHeaderBadges}>
                <View style={styles.featuredTagPill}>
                  <ThemedText style={styles.featuredTagText}>{recommendationLabel}</ThemedText>
                </View>

                {recommendedScenario.categoryName ? (
                  <View style={styles.featuredCategoryBadge}>
                    <ThemedText style={styles.featuredCategoryText}>{recommendedScenario.categoryName}</ThemedText>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.featuredDiffBadge,
                    {
                      backgroundColor:
                        (recommendedScenario.difficulty || '').toLowerCase() === 'easy'
                          ? '#e0f2fe'
                          : (recommendedScenario.difficulty || '').toLowerCase() === 'medium'
                            ? '#fef3c7'
                            : '#fee2e2',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.featuredDiffText,
                      {
                        color:
                          (recommendedScenario.difficulty || '').toLowerCase() === 'easy'
                            ? '#0369a1'
                            : (recommendedScenario.difficulty || '').toLowerCase() === 'medium'
                              ? '#b45309'
                              : '#b91c1c',
                      },
                    ]}
                  >
                    {formatDifficultyLabel(recommendedScenario.difficulty)}
                  </ThemedText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>
                    {recommendedScenario.estimatedMinutes} phút
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={[styles.featuredTitle, { color: colors.text }]}>
                {recommendedScenario.title}
              </ThemedText>

              <ThemedText style={[styles.featuredSummary, { color: colors.textMuted }]} numberOfLines={3}>
                {recommendedScenario.summary}
              </ThemedText>

              {recommendedScenario.competency ? (
                <View style={styles.featuredCompetencyRow}>
                  <ThemedText style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500' }}>
                    Năng lực trọng tâm:
                  </ThemedText>
                  <View style={styles.featuredCompetencyBadge}>
                    <ThemedText style={styles.featuredCompetencyText}>
                      {recommendedScenario.competency}
                    </ThemedText>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.featuredButton}
                onPress={() => router.push(`/(app)/scenarios/${recommendedScenario.slug}` as any)}
              >
                <ThemedText style={styles.featuredButtonText}>{recommendationAction}</ThemedText>
                <Ionicons name="play" size={14} color="#ffffff" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* Search & Filter Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Bộ Lọc Tình Huống</ThemedText>
            {hasFilters && (
              <TouchableOpacity onPress={handleResetFilters}>
                <ThemedText style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>Xóa bộ lọc</ThemedText>
              </TouchableOpacity>
            )}
          </View>

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
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
              data={categories}
              keyExtractor={(cat) => cat.id}
              ListHeaderComponent={
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
              }
              renderItem={({ item: cat }) => (
                <TouchableOpacity
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
              )}
            />
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
                      <ThemedText style={[styles.badgeText, { color: colors.accent }]}>
                        {formatDifficultyLabel(scenario.difficulty)}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="subtitle" style={styles.scenarioTitle}>{scenario.title}</ThemedText>
                  <ThemedText style={styles.scenarioSummary}>{scenario.summary}</ThemedText>

                  {scenario.competency ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="sparkles" size={13} color={colors.secondary} />
                      <ThemedText style={{ fontSize: 12, color: colors.secondary, fontWeight: '600' }}>
                        {scenario.competency}
                      </ThemedText>
                    </View>
                  ) : null}

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

        {/* Global Bottom Navigation Bar */}
        <AppBottomNavBar activeTab="practice" />
      </SafeAreaView>
    </ThemedView>
  );
}
