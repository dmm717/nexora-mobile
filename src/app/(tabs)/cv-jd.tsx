import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { profileApi } from '@/api/profile.api';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function CvJdTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: profileData } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  const activeGoal = profileData?.activeCareerGoal;
  const primaryResume = profileData?.primaryResume;

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Hồ Sơ & Mục Tiêu</ThemedText>
          <ThemedText style={styles.headerSub}>Quản lý dữ liệu phân tích phỏng vấn</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Dashboard Summary: Active Goal */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Mục tiêu nghề nghiệp</ThemedText>
            </View>
            <TouchableScale onPress={() => router.push('/(app)/career-goals' as any)}>
              <GlassCard hasGlow glowColor={colors.glowPrimary} style={styles.dashboardCard}>
                {activeGoal ? (
                  <View style={styles.goalActiveContainer}>
                    <View style={[styles.bigIconBadge, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="briefcase" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.goalInfo}>
                      <ThemedText style={styles.goalRoleText}>{activeGoal.targetRole}</ThemedText>
                      <View style={styles.goalTagsRow}>
                        <View style={[styles.tagBadge, { backgroundColor: colors.cardBorder }]}>
                          <ThemedText style={styles.tagText}>{activeGoal.seniority}</ThemedText>
                        </View>
                        {activeGoal.industry && (
                          <View style={[styles.tagBadge, { backgroundColor: colors.cardBorder }]}>
                            <ThemedText style={styles.tagText}>{activeGoal.industry}</ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </View>
                ) : (
                  <View style={styles.goalEmptyContainer}>
                    <Ionicons name="flag-outline" size={32} color={colors.textMuted} />
                    <ThemedText style={styles.emptyText}>Chưa thiết lập mục tiêu.</ThemedText>
                    <ThemedText style={[styles.actionLinkText, { color: colors.primary }]}>Thiết lập ngay</ThemedText>
                  </View>
                )}
              </GlassCard>
            </TouchableScale>
          </View>

          {/* Primary Resume Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>CV Phân tích chính</ThemedText>
            </View>
            <TouchableScale onPress={() => router.push('/(app)/resumes' as any)}>
              <GlassCard hasGlow={!!primaryResume} glowColor={colors.glowSecondary} style={styles.dashboardCard}>
                {primaryResume ? (
                  <View style={styles.resumeActiveContainer}>
                    <View style={[styles.bigIconBadge, { backgroundColor: colors.accentLight }]}>
                      <Ionicons name="document-text" size={28} color={colors.accent} />
                    </View>
                    <View style={styles.goalInfo}>
                      <ThemedText style={styles.resumeNameText} numberOfLines={1}>{primaryResume.fileName}</ThemedText>
                      <ThemedText style={styles.resumeDateText}>
                        Đã tải lên: {new Date(primaryResume.createdAt).toLocaleDateString('vi-VN')}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </View>
                ) : (
                  <View style={styles.goalEmptyContainer}>
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.textMuted} />
                    <ThemedText style={styles.emptyText}>Chưa có CV nào được chọn.</ThemedText>
                    <ThemedText style={[styles.actionLinkText, { color: colors.accent }]}>Tải lên CV mới</ThemedText>
                  </View>
                )}
              </GlassCard>
            </TouchableScale>
          </View>

          {/* Action List Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Công cụ phân tích</ThemedText>
            <View style={styles.listGroup}>
              <TouchableScale onPress={() => router.push('/(app)/cv-analysis' as any)}>
                <GlassCard style={styles.listCard}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.warningLight }]}>
                    <Ionicons name="analytics" size={22} color={colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.listTitle}>Đánh giá & Bóc tách CV</ThemedText>
                    <ThemedText style={styles.listSub}>Phân tích độ phù hợp với JD mục tiêu</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </GlassCard>
              </TouchableScale>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    padding: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.9,
  },
  dashboardCard: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
  },
  goalActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  bigIconBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    gap: 4,
  },
  goalRoleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  goalTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  goalEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  resumeActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  resumeNameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  resumeDateText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  listGroup: {
    gap: Spacing.three,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.three,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  listSub: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
});
