import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { AmbientBackground as SolidBackground } from '@/components/ui/ambient-background';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useHomeState } from '@/components/home/useHomeState';
import {
  ExecutiveDashboardCard,
  GroupedNavInsetCard,
  HomeHeroSection,
  RecentActivitiesSection,
} from '@/components/home/HomeSubComponents';
import { PlatformStatsCard } from '@/components/home/PlatformStatsCard';
import { styles } from '@/styles/home.styles';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const {
    user,
    router,
    activeGoal,
    primaryResume,
    userProfileInfo,
    yearsOfExperience,
    readinessScore,
    evidenceCount,
    priorityGapCount,
    nextAction,
    recentActivities,
    learningProgress,
    nextMilestone,
    isLoadingProfile,
    isLoadingDashboard,
    isLoadingProgress,
    isLoadingLearningPath,
  } = useHomeState();

  return (
    <SolidBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* TOP BAR */}
        <View style={[styles.topBar, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.brandHeaderGroup}>
            <ThemedText style={[styles.greetingText, { color: colors.textSecondary }]}>
              Xin chào,
            </ThemedText>
            <ThemedText style={styles.appName} numberOfLines={1}>
              {user?.displayName || user?.displayName || 'Ứng viên'}
            </ThemedText>
          </View>

          <View style={styles.headerBtnGroupRight}>
            <TouchableScale
              style={[styles.headerBtnPrimaryCompact, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(app)/cv-analysis' as any)}
            >
              <Ionicons name="document-text" size={12} color="#ffffff" />
              <ThemedText style={styles.headerBtnPrimaryText}>Cải thiện CV</ThemedText>
            </TouchableScale>

            <TouchableScale
              style={{ borderRadius: 16 }}
              onPress={() => router.push('/(tabs)/profile' as any)}
            >
              <UserAvatar name={user?.displayName || user?.displayName} email={user?.email} size={32} />
            </TouchableScale>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* KHỐI 1: COMBINED HERO CONTEXT CARD */}
          <HomeHeroSection
            colors={colors}
            isLoadingProfile={isLoadingProfile}
            activeGoal={activeGoal}
            primaryResume={primaryResume}
            onNavigateCareerGoals={() => router.push('/(app)/career-goals' as any)}
            onNavigateCvAnalysis={() => router.push('/(app)/cv-analysis' as any)}
          />

          {/* KHỐI 2: UNIFIED EXECUTIVE DASHBOARD CARD */}
          <ExecutiveDashboardCard
            colors={colors}
            isLoadingProgress={isLoadingProgress}
            readinessScore={readinessScore}
            evidenceCount={evidenceCount}
            priorityGapCount={priorityGapCount}
            nextAction={nextAction}
            onNavigateDashboard={() => router.push('/(app)/growth/progress-dashboard' as any)}
            onNavigateNextAction={() => router.push(nextAction.destination as any)}
            onNavigateHistory={() => router.push('/(app)/interview/history' as any)}
          />

          {/* INSIGHT PANEL BANNER */}
          <Animated.View entering={FadeInDown.duration(400).delay(150).springify()}>
            <View style={[styles.insightPanel, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <Ionicons name="bulb-outline" size={18} color={colors.primary} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.insightTitle}>Nexora học gì từ hành trình của bạn?</ThemedText>
                <ThemedText style={[styles.insightDesc, { color: colors.textSecondary }]}>
                  Mỗi bài luyện tập và phân tích CV đều tích lũy bằng chứng thực tế giúp AI gợi ý chính xác hơn.
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* REALTIME PLATFORM STATS CARD */}
          <PlatformStatsCard />

          {/* KHỐI 3: HOẠT ĐỘNG GẦN ĐÂY */}
          <RecentActivitiesSection
            colors={colors}
            isLoadingDashboard={isLoadingDashboard}
            recentActivities={recentActivities}
            onNavigateHistory={() => router.push('/(app)/interview/history' as any)}
            onNavigateInterview={(id) => router.push(`/(app)/interview/${id}` as any)}
          />

          {/* KHỐI 4: GROUPED INSET SURFACE CARD */}
          <GroupedNavInsetCard
            user={user}
            colors={colors}
            userProfileInfo={userProfileInfo}
            yearsOfExperience={yearsOfExperience}
            primaryResume={primaryResume}
            activeGoal={activeGoal}
            isLoadingLearningPath={isLoadingLearningPath}
            learningProgress={learningProgress}
            nextMilestone={nextMilestone}
            onNavigateProfile={() => router.push('/(tabs)/profile' as any)}
            onNavigateCareerGoals={() => router.push('/(app)/career-goals' as any)}
            onNavigateLearningPath={() => router.push('/(app)/growth/learning-path' as any)}
          />
        </ScrollView>
      </SafeAreaView>
    </SolidBackground>
  );
}
