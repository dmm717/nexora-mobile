import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { profileApi } from '@/api/profile.api';
import { useAuth } from '@/context/auth-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  const identity = data?.identity;
  const activeGoal = data?.activeCareerGoal;
  const primaryResume = data?.primaryResume;

  const email = identity?.email || user?.email || '';
  const displayName = identity?.displayName || user?.displayName || user?.fullName || 'Người dùng Nexora';
  const yearsOfExperience = identity?.yearsOfExperience ?? 0;
  const avatarLetter = (displayName || email || 'N').charAt(0).toUpperCase();

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Hồ Sơ Cán Bộ</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {isLoading && !isRefetching ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* User Identity Header - Centered */}
              <View style={styles.profileHeaderCenter}>
                <View style={[styles.avatarPlaceholderLarge, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.avatarTextLarge}>{avatarLetter}</ThemedText>
                </View>
                <ThemedText style={styles.profileNameLarge}>{displayName}</ThemedText>
                <ThemedText style={styles.profileEmailCenter}>{email}</ThemedText>
                <View style={[styles.xpBadgeCenter, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="briefcase" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <ThemedText style={[styles.xpTextCenter, { color: colors.primary }]}>
                    {yearsOfExperience} năm kinh nghiệm
                  </ThemedText>
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Cài đặt tài khoản</ThemedText>
                <GlassCard style={styles.settingsGroup}>
                  
                  {/* Pricing & Subscription */}
                  <TouchableScale onPress={() => router.push('/(app)/pricing' as any)}>
                    <View style={styles.settingItem}>
                      <View style={[styles.settingIconBadge, { backgroundColor: colors.secondaryLight }]}>
                        <Ionicons name="card" size={20} color={colors.secondary} />
                      </View>
                      <View style={styles.settingTextContent}>
                        <ThemedText style={styles.settingTitle}>Gói Dịch Vụ (Pricing)</ThemedText>
                        <ThemedText style={styles.settingSub}>Quản lý quyền hạn nâng cao</ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </View>
                  </TouchableScale>

                  <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                  {/* Career Goal */}
                  <TouchableScale onPress={() => router.push('/(app)/career-goals' as any)}>
                    <View style={styles.settingItem}>
                      <View style={[styles.settingIconBadge, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="briefcase" size={20} color={colors.primary} />
                      </View>
                      <View style={styles.settingTextContent}>
                        <ThemedText style={styles.settingTitle}>Mục Tiêu Nghề Nghiệp</ThemedText>
                        <ThemedText style={styles.settingSub} numberOfLines={1}>
                          {activeGoal ? `${activeGoal.targetRole}` : 'Chưa thiết lập'}
                        </ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </View>
                  </TouchableScale>

                  <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                  {/* Primary Resume */}
                  <TouchableScale onPress={() => router.push('/(app)/resumes' as any)}>
                    <View style={styles.settingItem}>
                      <View style={[styles.settingIconBadge, { backgroundColor: colors.accentLight }]}>
                        <Ionicons name="document-text" size={20} color={colors.accent} />
                      </View>
                      <View style={styles.settingTextContent}>
                        <ThemedText style={styles.settingTitle}>CV Phân Tích Chính</ThemedText>
                        <ThemedText style={styles.settingSub} numberOfLines={1}>
                          {primaryResume ? primaryResume.fileName : 'Chưa có CV nào'}
                        </ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </View>
                  </TouchableScale>

                </GlassCard>
              </View>

              {/* Red Logout Button */}
              <TouchableScale
                style={styles.logoutBtn}
                onPress={logout}
              >
                <ThemedText style={[styles.logoutBtnText, { color: colors.danger }]}>Đăng Xuất</ThemedText>
              </TouchableScale>

              <ThemedText style={styles.versionText}>Phiên bản 1.0.0</ThemedText>
            </>
          )}
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
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.six,
  },
  centerContainer: {
    padding: Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderCenter: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  avatarPlaceholderLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  avatarTextLarge: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  profileNameLarge: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileEmailCenter: {
    fontSize: 14,
    opacity: 0.6,
  },
  xpBadgeCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.two,
  },
  xpTextCenter: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
    marginLeft: Spacing.one,
  },
  settingsGroup: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  settingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
    marginLeft: 60,
  },
  logoutBtn: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.4,
    marginTop: Spacing.two,
  },
});
