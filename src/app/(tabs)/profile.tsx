import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { profileApi } from '@/api/profile.api';
import { useAuth } from '@/context/auth-context';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  if (isLoading && !isRefetching) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  const identity = data?.identity;
  const activeGoal = data?.activeCareerGoal;
  const primaryResume = data?.primaryResume;

  const email = identity?.email || user?.email || '';
  const displayName = identity?.displayName || user?.displayName || user?.fullName || 'Người dùng Nexora';
  const yearsOfExperience = identity?.yearsOfExperience ?? 0;
  const avatarLetter = (displayName || email || 'N').charAt(0).toUpperCase();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {/* Header Profile Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.avatarText}>
                  {avatarLetter}
                </ThemedText>
              </View>
              <View style={styles.profileInfo}>
                <ThemedText type="title" style={styles.profileName}>
                  {displayName}
                </ThemedText>
                <ThemedText style={styles.profileEmail}>{email}</ThemedText>
                <View style={[styles.xpBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="briefcase-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <ThemedText style={[styles.xpText, { color: colors.primary }]}>
                    {yearsOfExperience} năm kinh nghiệm
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Active Career Goal */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="flag-outline" size={20} color={colors.primary} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>Mục Tiêu Nghề Nghiệp</ThemedText>
            </View>
            {activeGoal ? (
              <View style={styles.goalDetailBox}>
                <View style={styles.roleBadgeRow}>
                  <ThemedText style={styles.goalRole}>{activeGoal.targetRole}</ThemedText>
                  <View style={[styles.seniorityBadge, { backgroundColor: colors.accentLight }]}>
                    <ThemedText style={[styles.seniorityText, { color: colors.accent }]}>
                      {activeGoal.seniority}
                    </ThemedText>
                  </View>
                </View>
                {activeGoal.industry && (
                  <ThemedText style={styles.goalDetail}>Ngành: {activeGoal.industry}</ThemedText>
                )}
                {activeGoal.targetCompany && (
                  <ThemedText style={styles.goalDetail}>Mục tiêu công ty: {activeGoal.targetCompany}</ThemedText>
                )}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>Chưa có mục tiêu nghề nghiệp nào được đặt.</ThemedText>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => router.push('/(app)/career-goals' as any)}
            >
              <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>Quản lý mục tiêu</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Primary Resume */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="document-text-outline" size={20} color={colors.accent} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>CV Hiện Tại (Primary Resume)</ThemedText>
            </View>
            {primaryResume ? (
              <View style={styles.resumeDetailBox}>
                <View style={styles.resumeHeaderRow}>
                  <ThemedText style={styles.resumeName}>{primaryResume.fileName}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
                    <ThemedText style={[styles.statusBadgeText, { color: colors.accent }]}>
                      {primaryResume.status}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>Chưa có CV nào được chọn làm CV chính.</ThemedText>
            )}

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.accentLight }]}
              onPress={() => router.push('/(app)/resumes' as any)}
            >
              <ThemedText style={[styles.actionButtonText, { color: colors.accent }]}>Quản lý CV</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Phân tích CV */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="analytics-outline" size={20} color={colors.warning} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>Phân Tích CV</ThemedText>
            </View>
            <ThemedText style={styles.goalDetail}>
              Nhận đánh giá chuyên sâu và điểm số cho CV của bạn dựa trên mục tiêu nghề nghiệp.
            </ThemedText>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(app)/cv-analysis' as any)}
            >
              <ThemedText style={[styles.actionButtonText, { color: '#ffffff' }]}>Phân tích ngay</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Growth & Roadmap Shortcuts */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="trending-up-outline" size={20} color={colors.secondary} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>Phát Triển & Lộ Trình</ThemedText>
            </View>

            <TouchableOpacity 
              style={[styles.growthLinkRow, { backgroundColor: colors.backgroundElement }]}
              onPress={() => router.push('/(app)/growth/skill-profile' as any)}
            >
              <Ionicons name="ribbon-outline" size={20} color={colors.accent} style={{ marginRight: 8 }} />
              <ThemedText style={styles.growthLinkText}>Hồ Sơ Năng Lực AI</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.growthLinkRow, { backgroundColor: colors.backgroundElement }]}
              onPress={() => router.push('/(app)/growth/progress-dashboard' as any)}
            >
              <Ionicons name="speedometer-outline" size={20} color={colors.warning} style={{ marginRight: 8 }} />
              <ThemedText style={styles.growthLinkText}>Bảng Tiến Độ & Readiness</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.growthLinkRow, { backgroundColor: colors.backgroundElement }]}
              onPress={() => router.push('/(app)/growth/learning-path' as any)}
            >
              <Ionicons name="map-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <ThemedText style={styles.growthLinkText}>Lộ Trình Học Tập AI (Learning Path)</ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>


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
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  retryBtn: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: '#4F46E5',
    borderRadius: Radius.sm,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
    gap: Spacing.three,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    opacity: 0.7,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  goalDetailBox: {
    gap: 6,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalRole: {
    fontWeight: '700',
    fontSize: 16,
  },
  seniorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  seniorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  goalDetail: {
    fontSize: 13,
    opacity: 0.8,
  },
  resumeDetailBox: {
    gap: 4,
  },
  resumeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeName: {
    fontWeight: '600',
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: Spacing.two,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  growthLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginTop: 4,
  },
  growthLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

