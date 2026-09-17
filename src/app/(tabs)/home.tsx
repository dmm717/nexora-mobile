import React from 'react';
import { Pressable, StyleSheet, ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { profileApi } from '@/api/profile.api';
import { growthApi } from '@/api/growth.api';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data: profileData } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
    enabled: !!user,
  });

  const { data: recommendation } = useQuery({
    queryKey: ['next-recommendation'],
    queryFn: growthApi.getNextRecommendation,
    enabled: !!user,
  });

  const activeGoal = profileData?.activeCareerGoal;
  const primaryResume = profileData?.primaryResume;

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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header Banner */}
          <ThemedView type="backgroundElement" style={styles.authBanner}>
            <View style={styles.userInfo}>
              <View style={styles.avatarCircle}>
                <ThemedText style={styles.avatarText}>
                  {(user?.displayName || user?.email || 'N').charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.userTextContainer}>
                <ThemedText style={styles.welcomeText}>Xin chào,</ThemedText>
                <ThemedText type="subtitle" style={styles.userName}>
                  {user?.displayName || user?.fullName || user?.email}
                </ThemedText>
                <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Hero Welcome Card */}
          <View style={[styles.heroCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <View style={styles.heroTextContainer}>
              <ThemedText type="title" style={styles.heroTitle}>
                Nexora AI Interview
              </ThemedText>
              <ThemedText style={styles.heroSub}>
                Nền tảng phỏng vấn và huấn luyện kỹ năng sự nghiệp thông minh
              </ThemedText>
            </View>
          </View>

          {/* Next Best Action Recommendation Banner */}
          {recommendation && (
            <View style={[styles.recommendationBanner, { backgroundColor: colors.secondaryLight, borderColor: colors.secondary }]}>
              <View style={styles.recHeaderRow}>
                <Ionicons name="sparkles" size={20} color={colors.secondary} />
                <ThemedText style={[styles.recBadgeText, { color: colors.secondary }]}>
                  HÀNH ĐỘNG TIẾP THEO TỐI ƯU
                </ThemedText>
                <View style={[styles.timeChip, { backgroundColor: colors.backgroundElement }]}>
                  <ThemedText style={styles.timeChipText}>{recommendation.estimatedMinutes} phút</ThemedText>
                </View>
              </View>

              <ThemedText type="subtitle" style={styles.recReason}>
                {recommendation.reason}
              </ThemedText>

              <TouchableOpacity
                style={[styles.recButton, { backgroundColor: colors.secondary }]}
                onPress={handleNextActionClick}
              >
                <ThemedText style={styles.recButtonText}>Thực Hiện Ngay</ThemedText>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Growth & Roadmap Shortcuts */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Phát triển & Lộ trình học tập
          </ThemedText>

          {/* Shortcut: Learning Path */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/growth/learning-path' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="map-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Lộ Trình Học Tập AI (Learning Path)</ThemedText>
              <ThemedText style={styles.featureSub}>
                Roadmap nhiệm vụ cá nhân hóa khắc phục lỗ hổng kỹ năng
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Shortcut: Skill Profile */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/growth/skill-profile' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="ribbon-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Hồ Sơ Năng Lực AI (Skill Profile)</ThemedText>
              <ThemedText style={styles.featureSub}>
                Tổng hợp chứng cứ điểm số & tín hiệu điểm yếu canonical
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Shortcut: Progress Dashboard */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/growth/progress-dashboard' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="speedometer-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Bảng Tiến Độ & Readiness Gauge</ThemedText>
              <ThemedText style={styles.featureSub}>
                Chỉ số sẵn sàng phỏng vấn & hoạt động hoàn thành tuần này
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Shortcut: Pricing & Entitlements */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/pricing' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="card-outline" size={24} color={colors.secondary} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Gói Dịch Vụ & Quyền Hạn (Pricing)</ThemedText>
              <ThemedText style={styles.featureSub}>
                Quản lý gói dịch vụ và mở khóa các tính năng nâng cao
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>


          {/* M3 Feature Shortcuts: Interview Room */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Huấn luyện Phỏng vấn AI
          </ThemedText>

          {/* Primary Action Card: Preflight Room */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => router.push('/(app)/interview/preflight' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="play-circle" size={28} color="#ffffff" />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={[styles.featureTitle, { color: '#ffffff' }]}>Vào Phòng Phỏng Vấn AI</ThemedText>
              <ThemedText style={[styles.featureSub, { color: 'rgba(255, 255, 255, 0.85)' }]}>
                Mô phỏng phỏng vấn trực tiếp bằng giọng nói & nhận báo cáo ngay
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Shortcut: Scenarios */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/scenarios' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="construct-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Kịch Bản Tình Huống AI (Scenarios)</ThemedText>
              <ThemedText style={styles.featureSub}>
                Luyện giải quyết các tình huống phỏng vấn thực tế theo ngành
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Shortcut: STAR Builder */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/star-builder' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="star-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Chuẩn Hóa STAR Builder</ThemedText>
              <ThemedText style={styles.featureSub}>
                Bóc tách 4 yếu tố S-T-A-R từ câu trả lời tự nhiên của bạn
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>


          {/* Shortcut: Interview History */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/interview/history' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="journal-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Lịch Sử Phỏng Vấn</ThemedText>
              <ThemedText style={styles.featureSub}>
                Xem lại các phiên phỏng vấn & báo cáo đánh giá đã làm
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Feature Shortcuts (M2 Features) */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quản lý hồ sơ & CV
          </ThemedText>

          {/* Shortcut 1: Career Goals */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/career-goals' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(53, 37, 205, 0.1)' }]}>
              <Ionicons name="flag-outline" size={24} color="#3525CD" />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Mục Tiêu Nghề Nghiệp</ThemedText>
              <ThemedText style={styles.featureSub}>
                {activeGoal 
                  ? `${activeGoal.targetRole} (${activeGoal.seniority})`
                  : 'Chưa thiết lập mục tiêu sự nghiệp'}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Shortcut 2: Resumes */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/resumes' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
              <Ionicons name="document-text-outline" size={24} color="#34C759" />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Quản Lý CV & Primary Resume</ThemedText>
              <ThemedText style={styles.featureSub}>
                {primaryResume 
                  ? `CV chính: ${primaryResume.fileName}`
                  : 'Tải lên CV & chọn CV chính'}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>

          {/* Shortcut 3: CV Analysis */}
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}
            onPress={() => router.push('/(app)/cv-analysis' as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
              <Ionicons name="analytics-outline" size={24} color="#FF9500" />
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Phân Tích CV Đã Tải lên</ThemedText>
              <ThemedText style={styles.featureSub}>
                Đánh giá mức độ phù hợp CV theo vị trí tuyển dụng
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>


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
    gap: Spacing.three,
  },
  authBanner: {
    padding: Spacing.three,
    borderRadius: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3525CD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    opacity: 0.7,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    opacity: 0.6,
  },
  logoutButton: {
    padding: Spacing.two,
  },
  heroCard: {
    borderRadius: 20,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logo: {
    width: 56,
    height: 56,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroSub: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  featureSub: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  recommendationBanner: {
    borderRadius: 18,
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.two,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.5,
  },
  timeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  timeChipText: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.8,
  },
  recReason: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  recButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  recButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

