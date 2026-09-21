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
import { styles } from '@/styles/profile.styles';

function useUserProfileData() {
  const { user, logout } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  const rawData = data as any;
  const userProfileInfo = rawData?.identity || rawData?.profile || {};
  const identity = data?.identity;
  const activeGoal = data?.activeCareerGoal;
  const primaryResume = data?.primaryResume;

  const email = userProfileInfo?.email || identity?.email || user?.email || '';
  const displayName = userProfileInfo?.displayName || identity?.displayName || user?.displayName || user?.fullName || 'Người dùng Nexora';
  const yearsOfExperience = userProfileInfo?.yearsOfExperience ?? identity?.yearsOfExperience ?? null;
  const avatarLetter = (displayName || email || 'N').charAt(0).toUpperCase();

  return {
    user,
    logout,
    isLoading,
    refetch,
    isRefetching,
    activeGoal,
    primaryResume,
    email,
    displayName,
    yearsOfExperience,
    avatarLetter,
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const {
    logout,
    isLoading,
    refetch,
    isRefetching,
    activeGoal,
    primaryResume,
    email,
    displayName,
    yearsOfExperience,
    avatarLetter,
  } = useUserProfileData();

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
              <UserProfileHeaderCard
                avatarLetter={avatarLetter}
                displayName={displayName}
                email={email}
                yearsOfExperience={yearsOfExperience}
                colors={colors}
              />

              <AccountSettingsCard
                activeGoal={activeGoal}
                primaryResume={primaryResume}
                colors={colors}
                onNavigatePricing={() => router.push('/(app)/pricing' as any)}
                onNavigateCareerGoals={() => router.push('/(app)/career-goals' as any)}
                onNavigateResumes={() => router.push('/(app)/resumes' as any)}
              />

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

const UserProfileHeaderCard = React.memo(({
  avatarLetter,
  displayName,
  email,
  yearsOfExperience,
  colors,
}: {
  avatarLetter: string;
  displayName: string;
  email: string;
  yearsOfExperience: number | null;
  colors: any;
}) => (
  <View style={styles.profileHeaderCenter}>
    <View style={[styles.avatarPlaceholderLarge, { backgroundColor: colors.primary }]}>
      <ThemedText style={styles.avatarTextLarge}>{avatarLetter}</ThemedText>
    </View>
    <ThemedText style={styles.profileNameLarge}>{displayName}</ThemedText>
    <ThemedText style={styles.profileEmailCenter}>{email}</ThemedText>
    <View style={[styles.xpBadgeCenter, { backgroundColor: colors.primaryLight }]}>
      <Ionicons name="briefcase" size={14} color={colors.primary} style={{ marginRight: 4 }} />
      <ThemedText style={[styles.xpTextCenter, { color: colors.primary }]}>
        {yearsOfExperience != null ? `${yearsOfExperience} năm kinh nghiệm` : 'Chưa khai báo kinh nghiệm'}
      </ThemedText>
    </View>
  </View>
));

const AccountSettingsCard = React.memo(({
  activeGoal,
  primaryResume,
  colors,
  onNavigatePricing,
  onNavigateCareerGoals,
  onNavigateResumes,
}: {
  activeGoal: any;
  primaryResume: any;
  colors: any;
  onNavigatePricing: () => void;
  onNavigateCareerGoals: () => void;
  onNavigateResumes: () => void;
}) => (
  <View style={styles.section}>
    <ThemedText style={styles.sectionTitle}>Cài đặt tài khoản</ThemedText>
    <GlassCard style={styles.settingsGroup}>
      <TouchableScale onPress={onNavigatePricing}>
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

      <TouchableScale onPress={onNavigateCareerGoals}>
        <View style={styles.settingItem}>
          <View style={[styles.settingIconBadge, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="briefcase" size={20} color={colors.primary} />
          </View>
          <View style={styles.settingTextContent}>
            <ThemedText style={styles.settingTitle}>Mục Tiêu</ThemedText>
            <ThemedText style={styles.settingSub} numberOfLines={1}>
              {activeGoal ? `${activeGoal.targetRole}` : 'Chưa thiết lập'}
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableScale>

      <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

      <TouchableScale onPress={onNavigateResumes}>
        <View style={styles.settingItem}>
          <View style={[styles.settingIconBadge, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="document-text" size={20} color={colors.accent} />
          </View>
          <View style={styles.settingTextContent}>
            <ThemedText style={styles.settingTitle}>CV Chính</ThemedText>
            <ThemedText style={styles.settingSub} numberOfLines={1}>
              {primaryResume ? primaryResume.fileName : 'Chưa có'}
            </ThemedText>
          </View>
        </View>
      </TouchableScale>
    </GlassCard>
  </View>
));
