import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { profileApi } from '@/api/profile.api';
import { careerGoalsApi } from '@/api/career-goals.api';
import { resumesApi } from '@/api/resumes.api';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { reconcileCareerGoals } from '@/utils/career-goal-contract';
import { styles } from '@/styles/career-profile.styles';

import { CareerIdentityCard } from '@/components/career-profile/CareerIdentityCard';
import { CareerGoalsCard } from '@/components/career-profile/CareerGoalsCard';
import { ResumesCard } from '@/components/career-profile/ResumesCard';
import { SkillProfileCard } from '@/components/career-profile/SkillProfileCard';

export default function CareerProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  // 1. Fetch Canonical Career Profile
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
    isRefetching: isProfileRefetching,
  } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  // 2. Fetch Full Career Goals List
  const {
    data: allGoals = [],
    refetch: refetchGoals,
  } = useQuery({
    queryKey: ['career-goals'],
    queryFn: careerGoalsApi.list,
    enabled: !!user,
  });

  // 3. Fetch Full Resumes List
  const {
    data: resumes = [],
    refetch: refetchResumes,
  } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
    enabled: !!user,
  });

  // Combined Refreshing State
  const isRefreshing = isProfileRefetching;
  const handleRefresh = async () => {
    await Promise.all([refetchProfile(), refetchGoals(), refetchResumes()]);
  };

  // Reconcile Canonical Profile Active Goal with Management List
  const { activeGoal, otherGoals } = reconcileCareerGoals(
    profile?.activeCareerGoal,
    allGoals
  );

  const identity = profile?.identity;
  const primaryResume = profile?.primaryResume;
  const onboarding = profile?.onboarding;
  const skillSummary = profile?.skillSummary;
  const topCompetencies = skillSummary?.topCompetencies ?? [];
  const topWeaknessSignals = skillSummary?.topWeaknessSignals ?? [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Header */}
        <AppScreenHeader title="Hồ Sơ Nghề Nghiệp" fallbackRoute="/(tabs)/profile" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          {isProfileLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : isProfileError || !profile ? (
            <GlassCard style={{ alignItems: 'center', padding: Spacing.four }}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <ThemedText style={{ marginTop: Spacing.two, opacity: 0.8 }}>
                Không thể tải hồ sơ nghề nghiệp.
              </ThemedText>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => handleRefresh()}
              >
                <ThemedText style={{ color: colors.primary, fontWeight: '700' }}>Thử lại</ThemedText>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <>
              {/* PAGE HERO HEADER BLOCK (CareerProfileHeader) */}
              <View style={styles.heroBlock}>
                <View style={[styles.pillBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="finger-print-outline" size={14} color={colors.primary} />
                  <ThemedText style={[styles.pillBadgeText, { color: colors.primary }]}>
                    Bối cảnh cá nhân hóa
                  </ThemedText>
                </View>

                <ThemedText style={styles.mainHeading}>
                  Hồ sơ nghề nghiệp & Trung tâm bối cảnh
                </ThemedText>

                <ThemedText style={styles.subHeading}>
                  Tổng hợp định danh, CV chính, mục tiêu tuyển dụng và bản đồ năng lực từ bằng chứng thực tế.
                </ThemedText>

                <TouchableScale
                  style={[styles.heroCtaBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(app)/resumes' as any)}
                >
                  <Ionicons name="document-text-outline" size={16} color="#ffffff" />
                  <ThemedText style={styles.heroCtaBtnText}>Phân tích CV chuyên sâu</ThemedText>
                </TouchableScale>
              </View>

              <CareerIdentityCard
                identity={identity}
                user={user}
                onboarding={onboarding}
                colors={colors}
              />

              <CareerGoalsCard
                activeGoal={activeGoal}
                otherGoals={otherGoals}
                colors={colors}
              />

              <ResumesCard
                resumes={resumes}
                primaryResume={primaryResume}
                colors={colors}
              />

              <SkillProfileCard
                topCompetencies={topCompetencies}
                topWeaknessSignals={topWeaknessSignals}
                colors={colors}
              />
            </>
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="profile" />
      </SafeAreaView>
    </ThemedView>
  );
}
