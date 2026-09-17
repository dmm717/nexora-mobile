import React from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { profileApi } from '@/api/profile.api';
import { growthApi } from '@/api/growth.api';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { GlassCard } from '@/components/ui/glass-card';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { AvatarGlow } from '@/components/ui/avatar-glow';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  const { data: recommendation, isLoading: isLoadingRec } = useQuery({
    queryKey: ['next-recommendation'],
    queryFn: growthApi.getNextRecommendation,
    enabled: !!user,
  });

  const activeGoal = profileData?.activeCareerGoal;

  const handleNextActionClick = () => {
    if (!recommendation) {
      router.push('/(app)/growth/progress-dashboard' as any);
      return;
    }

    const type = (recommendation.activityType || '').toLowerCase();
    switch (type) {
      case 'star':
        router.push('/(app)/star-builder' as any);
        break;
      case 'scenario':
        if (recommendation.resourceId) {
          router.push(`/(app)/scenarios/${recommendation.resourceId}` as any);
        } else {
          router.push('/(app)/scenarios' as any);
        }
        break;
      case 'interview':
        router.push('/(app)/interview/preflight' as any);
        break;
      case 'resume':
        router.push('/(app)/cv-analysis' as any);
        break;
      default:
        router.push('/(app)/growth/progress-dashboard' as any);
        break;
    }
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Sleek Top Header - High-End Premium layout */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={[styles.topBar, { borderBottomColor: 'transparent' }]}>
          <View style={styles.brandGroup}>
            <View>
              <ThemedText style={styles.greetingText}>
                Hi, {user?.displayName || user?.fullName?.split(' ')[0] || 'Friend'}
              </ThemedText>
              <ThemedText style={styles.appName}>Ready to level up?</ThemedText>
            </View>
          </View>

          <TouchableScale onPress={() => router.push('/(tabs)/profile' as any)}>
            <AvatarGlow 
               source={{ uri: user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.displayName || 'N') + '&background=random' }} 
               size={46} 
               glowColor={colors.primary} 
            />
          </TouchableScale>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* AI Spotlight Recommendation Banner */}
          {isLoadingRec ? (
             <View style={styles.recBanner}>
                <SkeletonLoader width="100%" height={200} style={{ borderRadius: 24 }} />
             </View>
          ) : recommendation && (
            <Animated.View entering={FadeInDown.duration(800).delay(100).springify()}>
              <TouchableScale onPress={handleNextActionClick}>
                <GlassCard
                  intensity="heavy"
                  style={[styles.recBanner, { borderColor: colors.secondary, borderWidth: 1 }]}
                >
                  <View style={styles.recHeaderRow}>
                    <View style={[styles.recSparkleBox, { backgroundColor: colors.secondaryLight }]}>
                      <Ionicons name="sparkles" size={16} color={colors.secondary} />
                    </View>
                    <ThemedText style={[styles.recBadgeText, { color: colors.secondary }]}>
                      NEXT BEST ACTION
                    </ThemedText>
                    <View style={[styles.timeChip, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                      <Ionicons name="time" size={12} color={colors.textSecondary} />
                      <ThemedText style={styles.timeChipText}>{recommendation.estimatedMinutes}m</ThemedText>
                    </View>
                  </View>

                  <ThemedText type="title" style={styles.recReason}>
                    {recommendation.reason}
                  </ThemedText>
                  
                  <View style={[styles.recButton, { backgroundColor: colors.secondary }]}>
                    <ThemedText style={styles.recButtonText}>Thực Hiện Ngay</ThemedText>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </View>
                </GlassCard>
              </TouchableScale>
            </Animated.View>
          )}

          {/* Practice Hub Shortcuts - Bento Grid */}
          <Animated.View entering={FadeInDown.duration(800).delay(200).springify()}>
            <ThemedText type="subtitle" style={styles.sectionHeader}>
              Luyện Tập
            </ThemedText>

            <View style={styles.bentoGrid}>
              {/* Tile 1: Preflight Room */}
              <TouchableScale
                style={[styles.bentoHeroTile, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(app)/interview/preflight' as any)}
              >
                <View style={styles.bentoTileHeader}>
                  <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                    <Ionicons name="mic" size={24} color="#ffffff" />
                  </View>
                  <View style={[styles.liveBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <View style={styles.liveDot} />
                    <ThemedText style={styles.liveText}>LIVE</ThemedText>
                  </View>
                </View>
                <View style={styles.bentoHeroBottom}>
                  <ThemedText style={styles.bentoHeroTitle}>Phòng Phỏng Vấn AI</ThemedText>
                  <ThemedText style={styles.bentoHeroSub}>Giọng nói real-time & feedback</ThemedText>
                </View>
              </TouchableScale>

              <View style={styles.bentoColumn}>
                {/* Tile 2: Scenarios */}
                <TouchableScale
                  style={styles.bentoTileItem}
                  onPress={() => router.push('/(app)/scenarios' as any)}
                >
                  <GlassCard style={styles.bentoInnerCard}>
                    <View style={styles.bentoTileHeader}>
                       <View style={[styles.bentoIconBox, { backgroundColor: colors.accentLight }]}>
                         <Ionicons name="layers" size={20} color={colors.accent} />
                       </View>
                       <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                    </View>
                    <View>
                      <ThemedText style={styles.bentoTileTitle}>Kịch Bản</ThemedText>
                      <ThemedText style={styles.bentoTileSub}>Tình huống khó</ThemedText>
                    </View>
                  </GlassCard>
                </TouchableScale>

                {/* Tile 3: STAR Builder */}
                <TouchableScale
                  style={styles.bentoTileItem}
                  onPress={() => router.push('/(app)/star-builder' as any)}
                >
                  <GlassCard style={styles.bentoInnerCard}>
                    <View style={styles.bentoTileHeader}>
                      <View style={[styles.bentoIconBox, { backgroundColor: colors.warningLight }]}>
                        <Ionicons name="star" size={20} color={colors.warning} />
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                    </View>
                    <View>
                      <ThemedText style={styles.bentoTileTitle}>Chuẩn STAR</ThemedText>
                      <ThemedText style={styles.bentoTileSub}>Story Builder</ThemedText>
                    </View>
                  </GlassCard>
                </TouchableScale>
              </View>
            </View>
          </Animated.View>

          {/* Status Overview Card */}
          <Animated.View entering={FadeInDown.duration(800).delay(300).springify()}>
            <GlassCard style={styles.overviewCard}>
              <View style={styles.overviewRow}>
                <View style={[styles.overviewIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="briefcase" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.overviewLabel}>Mục tiêu hiện tại</ThemedText>
                  {isLoadingProfile ? (
                     <SkeletonLoader width={150} height={18} style={{ marginTop: 6 }} />
                  ) : (
                     <ThemedText style={styles.overviewVal}>
                       {activeGoal ? `${activeGoal.targetRole} · ${activeGoal.seniority}` : 'Chưa thiết lập mục tiêu'}
                     </ThemedText>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </GlassCard>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  recBanner: {
    padding: Spacing.five,
    gap: Spacing.four,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recSparkleBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    flex: 1,
    letterSpacing: 1,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  recReason: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  recButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  recButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overviewCard: {
    padding: Spacing.four,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    letterSpacing: -0.5,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    height: 220,
  },
  bentoHeroTile: {
    flex: 1,
    borderRadius: 24,
    padding: Spacing.four,
    justifyContent: 'space-between',
  },
  bentoTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bentoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bentoHeroBottom: {
    gap: 4,
  },
  bentoHeroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  bentoHeroSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  bentoColumn: {
    flex: 1,
    gap: Spacing.three,
  },
  bentoTileItem: {
    flex: 1,
  },
  bentoInnerCard: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  bentoTileTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  bentoTileSub: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
    marginTop: 2,
  },
});
