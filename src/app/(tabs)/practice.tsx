import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, View, ListRenderItemInfo, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { scenariosApi } from '@/api/scenarios.api';
import { starApi } from '@/api/star.api';
import { growthApi } from '@/api/growth.api';
import { styles } from '@/styles/practice.styles';

type HistoryFilter = 'all' | 'scenario' | 'star';

export default function PracticeTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  // Fetch Learning Path summary
  const { data: learningPath } = useQuery({
    queryKey: ['learning-path'],
    queryFn: growthApi.getLearningPath,
  });

  // Fetch practice histories
  const { data: scenarioAttempts, isLoading: isScenariosLoading } = useQuery({
    queryKey: ['scenario-attempts'],
    queryFn: () => scenariosApi.listAttempts(),
  });

  const { data: starAttempts, isLoading: isStarsLoading } = useQuery({
    queryKey: ['star-attempts'],
    queryFn: () => starApi.list(),
  });

  const isHistoryLoading = isScenariosLoading || isStarsLoading;

  // Combine practice history items (Scenarios & STAR)
  const unifiedHistory = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'scenario' | 'star';
      title: string;
      subtitle: string;
      date: string;
      score?: number | null;
      actionUrl: string;
      actionLabel: string;
    }> = [];

    // 1. Scenarios
    (scenarioAttempts || []).forEach((sc) => {
      list.push({
        id: `sc-${sc.id}`,
        type: 'scenario',
        title: `Tình huống: ${sc.scenarioTitle || 'Kịch bản'}`,
        subtitle: sc.status === 'completed' ? 'Hoàn thành' : 'Đang thực hiện',
        date: sc.createdAt,
        score: sc.evaluation?.overallScore ?? null,
        actionUrl: `/(app)/scenarios/${sc.scenarioId || sc.id}`,
        actionLabel: 'Xem bài',
      });
    });

    // 2. STAR Attempts
    (starAttempts || []).forEach((st) => {
      list.push({
        id: `star-${st.id}`,
        type: 'star',
        title: 'Luyện phản xạ STAR',
        subtitle: st.question || 'Câu hỏi STAR',
        date: st.createdAt,
        score: st.evaluation?.overallScore ?? null,
        actionUrl: '/(app)/star-builder',
        actionLabel: 'Chi tiết',
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [scenarioAttempts, starAttempts]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return unifiedHistory;
    return unifiedHistory.filter((item) => item.type === historyFilter);
  }, [unifiedHistory, historyFilter]);

  const listData = [
    { id: 'tools', type: 'tools' },
    { id: 'learning_path', type: 'learning_path' },
    { id: 'history', type: 'history' },
  ];

  const renderItem = ({ item }: ListRenderItemInfo<(typeof listData)[0]>) => {
    if (item.type === 'tools') {
      return (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Công cụ rèn luyện chuyên sâu</ThemedText>
          <View style={styles.gridContainer}>
            <TouchableScale 
              style={styles.gridItemWrapper} 
              onPress={() => router.push('/(app)/scenarios' as any)}
            >
              <GlassCard style={styles.gridCard}>
                <View style={[styles.gridIconBadge, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="construct" size={24} color={colors.accent} />
                </View>
                <ThemedText style={styles.gridTitle}>Kho Kịch Bản</ThemedText>
                <ThemedText style={styles.gridSub} numberOfLines={2}>
                  Giải quyết tình huống thực tế theo vị trí & cấp bậc
                </ThemedText>
              </GlassCard>
            </TouchableScale>

            <TouchableScale 
              style={styles.gridItemWrapper}
              onPress={() => router.push('/(app)/star-builder' as any)}
            >
              <GlassCard style={styles.gridCard}>
                <View style={[styles.gridIconBadge, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="star" size={24} color={colors.warning} />
                </View>
                <ThemedText style={styles.gridTitle}>Mô hình STAR</ThemedText>
                <ThemedText style={styles.gridSub} numberOfLines={2}>
                  Bẻ gãy thói quen lan man, chuẩn hóa 4 thành phần S-T-A-R
                </ThemedText>
              </GlassCard>
            </TouchableScale>
          </View>
        </View>
      );
    }

    if (item.type === 'learning_path') {
      const percentage = learningPath?.progress?.percentage ?? 0;
      return (
        <TouchableScale onPress={() => router.push('/(app)/growth/learning-path' as any)}>
          <GlassCard style={{ padding: Spacing.four, borderRadius: Radius.lg, backgroundColor: colors.card, borderColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
              <View style={{ width: 44, height: 44, borderRadius: Radius.md, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="map-outline" size={24} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ThemedText style={{ fontSize: 15, fontWeight: '700' }}>Lộ Trình Phát Triển</ThemedText>
                  {percentage > 0 && (
                    <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                      <ThemedText style={{ fontSize: 10, fontWeight: '700', color: colors.primary }}>{percentage}%</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  Theo dõi lộ trình kỹ năng cá nhân hóa
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </GlassCard>
        </TouchableScale>
      );
    }

    return (
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two }}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Lịch sử luyện tập chuyên sâu</ThemedText>
        </View>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: Spacing.two, flexWrap: 'wrap' }}>
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'scenario', label: 'Tình huống' },
              { id: 'star', label: 'Luyện STAR' },
            ] as const
          ).map((tab) => {
            const isSelected = historyFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.cardBorder },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setHistoryFilter(tab.id)}
              >
                <ThemedText style={[{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }, isSelected && { color: '#fff' }]}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* History items */}
        {isHistoryLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : filteredHistory.length > 0 ? (
          <View style={{ gap: Spacing.two }}>
            {filteredHistory.slice(0, 5).map((h) => {
              const iconName = h.type === 'scenario' ? 'construct-outline' : 'star-outline';
              const iconColor = h.type === 'scenario' ? colors.accent : colors.warning;
              const dateStr = new Date(h.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

              return (
                <TouchableScale key={h.id} onPress={() => router.push(h.actionUrl as any)}>
                  <GlassCard style={styles.listCard}>
                    <View style={[styles.iconBadge, { backgroundColor: `${iconColor}15` }]}>
                      <Ionicons name={iconName} size={22} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.listTitle} numberOfLines={1}>{h.title}</ThemedText>
                      <ThemedText style={styles.listSub} numberOfLines={1}>{h.subtitle} • {dateStr}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {h.score != null && (
                        <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{h.score}đ</ThemedText>
                      )}
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>
                  </GlassCard>
                </TouchableScale>
              );
            })}
          </View>
        ) : (
          <ThemedText style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginVertical: 12 }}>
            Chưa có lịch sử luyện tập ở mục này.
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Trung Tâm Luyện Tập</ThemedText>
          <ThemedText style={styles.headerSub}>Rèn luyện kỹ năng xử lý tình huống thực tế & phản xạ STAR</ThemedText>
        </View>

        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </AmbientBackground>
  );
}


