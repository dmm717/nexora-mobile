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
import { styles } from '@/styles/scenarios.styles';

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
                    {progress.recommendedDifficulty?.toUpperCase() || 'MEDIUM'}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Đề xuất</ThemedText>
                </View>
              </View>
            </View>
          ) : null}

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
