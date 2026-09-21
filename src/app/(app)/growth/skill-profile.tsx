import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { growthApi } from '@/api/growth.api';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from './skill-profile.styles';

export default function SkillProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: profile, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['skill-profile'],
    queryFn: growthApi.getSkillProfile,
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Hồ Sơ Năng Lực AI</ThemedText>
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
          ) : isError || !profile ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center' }]}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.8 }}>Không thể tải hồ sơ năng lực.</ThemedText>
            </View>
          ) : (
            <>
              {/* Overview Banner */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="ribbon-outline" size={24} color={colors.primary} />
                  <ThemedText type="subtitle" style={styles.cardTitle}>Tổng Quan Điểm Năng Lực</ThemedText>
                </View>

                {profile.competencies.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="information-circle-outline" size={28} color={colors.warning} />
                    <ThemedText style={styles.emptyText}>Chưa đủ dữ liệu đánh giá</ThemedText>
                    <ThemedText style={styles.emptySubText}>
                      Hãy thực hiện Phân tích CV, Phỏng vấn mô phỏng hoặc Kịch bản tình huống để tích lũy bằng chứng năng lực.
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.bannerSub}>
                    Được tổng hợp tự động từ các bằng chứng minh chứng trong hồ sơ CV, báo cáo phỏng vấn và bài làm kịch bản.
                  </ThemedText>
                )}
              </View>

              {/* Competencies List */}
              {profile.competencies.length > 0 && (
                <View style={{ gap: Spacing.three }}>
                  <ThemedText type="subtitle" style={styles.sectionHeader}>
                    Chi Tiết Năng Lực ({profile.competencies.length})
                  </ThemedText>

                  {profile.competencies.map((comp) => (
                    <View key={comp.code} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      <View style={styles.cardHeaderRow}>
                        <ThemedText type="subtitle" style={styles.compName}>{comp.name}</ThemedText>
                        <View style={[styles.scoreBadge, { backgroundColor: comp.score >= 75 ? colors.accentLight : colors.warningLight }]}>
                          <ThemedText style={[styles.scoreText, { color: comp.score >= 75 ? colors.accent : colors.warning }]}>
                            {comp.score}/100
                          </ThemedText>
                        </View>
                      </View>

                      <ThemedText style={styles.compCategory}>Nhóm: {comp.category}</ThemedText>

                      {/* Progress Bar */}
                      <View style={[styles.progressTrack, { backgroundColor: colors.backgroundElement }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(100, Math.max(0, comp.score))}%`,
                              backgroundColor: comp.score >= 75 ? colors.accent : colors.primary
                            }
                          ]}
                        />
                      </View>

                      {/* Evidence Stats */}
                      <View style={styles.evidenceRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="document-text-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                          <ThemedText style={styles.evidenceText}>{comp.evidenceCount} minh chứng</ThemedText>
                        </View>
                        <ThemedText style={styles.evidenceText}>
                          Mới nhất: {new Date(comp.latestEvidenceAt).toLocaleDateString('vi-VN')}
                        </ThemedText>
                      </View>

                      {/* Sources breakdown */}
                      {comp.sources && comp.sources.length > 0 && (
                        <View style={[styles.sourcesBox, { backgroundColor: colors.backgroundElement }]}>
                          <ThemedText style={styles.sourcesHeader}>Nguồn minh chứng:</ThemedText>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {comp.sources.map((src) => (
                              <View key={`${src.sourceType}-${src.evidenceCount}-${src.latestEvidenceAt}`} style={[styles.sourceChip, { borderColor: colors.cardBorder }]}>
                                <ThemedText style={styles.sourceText}>
                                  {src.sourceType.toUpperCase()} ({src.evidenceCount})
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Weakness Signals List */}
              {profile.weaknessSignals && profile.weaknessSignals.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.cardHeaderRow}>
                    <Ionicons name="warning-outline" size={22} color={colors.danger} />
                    <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.danger }]}>
                      Tín Hiệu Điểm Yếu Cần Lưu Ý ({profile.weaknessSignals.length})
                    </ThemedText>
                  </View>

                  <View style={{ gap: Spacing.two, marginTop: Spacing.one }}>
                    {profile.weaknessSignals.map((signal) => (
                      <View key={`${signal.label}-${signal.sourceType}-${signal.latestEvidenceAt}`} style={[styles.signalRow, { backgroundColor: colors.dangerLight }]}>
                        <Ionicons name="alert-circle" size={18} color={colors.danger} />
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[styles.signalLabel, { color: colors.danger }]}>{signal.label}</ThemedText>
                          <ThemedText style={styles.signalMeta}>
                            Nguồn: {signal.sourceType.toUpperCase()} • {new Date(signal.latestEvidenceAt).toLocaleDateString('vi-VN')}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
