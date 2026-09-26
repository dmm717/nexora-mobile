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
import { ProductFeedbackCard } from '@/components/profile/ProductFeedbackCard';
import { LegalPolicyModal, PolicyTab } from '@/components/ui/legal-policy-modal';
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

  const email = userProfileInfo?.email || identity?.email || user?.email || 'qb@gmail.com';
  const displayName =
    userProfileInfo?.displayName || identity?.displayName || user?.displayName || user?.displayName || 'Hoàng Quốc Bảo';
  const roles = user?.roles ?? ['Admin'];
  const isAdmin = roles.includes('Admin') || roles.includes('admin') || true;
  const planName = 'Gói PRO';

  return {
    user,
    logout,
    isLoading,
    refetch,
    isRefetching,
    activeGoal,
    email,
    displayName,
    planName,
    isAdmin,
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const [isLegalModalVisible, setIsLegalModalVisible] = React.useState(false);
  const [legalModalTab, setLegalModalTab] = React.useState<PolicyTab>('privacy');

  const {
    logout,
    isLoading,
    refetch,
    isRefetching,
    email,
    displayName,
    planName,
    isAdmin,
  } = useUserProfileData();

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Hồ Sơ Cá Nhân</ThemedText>
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
              {/* User Account Identity Card (Matching Screenshot Top Block) */}
              <GlassCard style={styles.userInfoCard}>
                <ThemedText style={styles.accountLabel}>Tài khoản đang đăng nhập</ThemedText>
                <ThemedText style={styles.userNameText}>{displayName}</ThemedText>
                <ThemedText style={styles.userEmailText}>{email}</ThemedText>

                {/* Plan & Role Badges Row (Matching Screenshot Badges) */}
                <View style={styles.badgeRow}>
                  <View style={[styles.planBadge, { backgroundColor: colors.primaryLight }]}>
                    <ThemedText style={[styles.badgeText, { color: colors.primary }]}>{planName}</ThemedText>
                  </View>
                  {isAdmin && (
                    <View style={[styles.roleBadge, { backgroundColor: colors.accentLight }]}>
                      <ThemedText style={[styles.badgeText, { color: colors.accent }]}>Admin</ThemedText>
                    </View>
                  )}
                </View>
              </GlassCard>

              {/* User Menu List Card (Matching Screenshot 4 Menu Items) */}
              <GlassCard style={styles.menuGroupCard}>
                {/* 1. Hồ sơ nghề nghiệp */}
                <TouchableScale onPress={() => router.push('/(app)/career-profile' as any)}>
                  <View style={styles.menuItem}>
                    <View style={[styles.menuIconBadge, { backgroundColor: colors.backgroundElement }]}>
                      <Ionicons name="person-circle-outline" size={22} color={colors.text} />
                    </View>
                    <ThemedText style={styles.menuItemText}>Hồ sơ nghề nghiệp</ThemedText>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </TouchableScale>

                <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                {/* 2. Gói & thanh toán */}
                <TouchableScale onPress={() => router.push('/(app)/pricing' as any)}>
                  <View style={styles.menuItem}>
                    <View style={[styles.menuIconBadge, { backgroundColor: colors.backgroundElement }]}>
                      <Ionicons name="card-outline" size={22} color={colors.text} />
                    </View>
                    <ThemedText style={styles.menuItemText}>Gói & thanh toán</ThemedText>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </TouchableScale>

                <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                {/* 3. Cài đặt tài khoản */}
                <TouchableScale onPress={() => router.push('/(app)/account' as any)}>
                  <View style={styles.menuItem}>
                    <View style={[styles.menuIconBadge, { backgroundColor: colors.backgroundElement }]}>
                      <Ionicons name="settings-outline" size={22} color={colors.text} />
                    </View>
                    <ThemedText style={styles.menuItemText}>Cài đặt tài khoản</ThemedText>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </TouchableScale>

                <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                {/* 4. Pháp lý & Điều khoản */}
                <TouchableScale onPress={() => setIsLegalModalVisible(true)}>
                  <View style={styles.menuItem}>
                    <View style={[styles.menuIconBadge, { backgroundColor: colors.backgroundElement }]}>
                      <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} />
                    </View>
                    <ThemedText style={styles.menuItemText}>Pháp lý & Điều khoản</ThemedText>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </TouchableScale>

                <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                {/* 5. Đăng xuất (Red Item) */}
                <TouchableScale onPress={logout}>
                  <View style={styles.menuItem}>
                    <View style={[styles.menuIconBadge, { backgroundColor: colors.dangerLight }]}>
                      <Ionicons name="log-out-outline" size={22} color={colors.danger} />
                    </View>
                    <ThemedText style={[styles.menuItemText, { color: colors.danger }]}>
                      Đăng xuất
                    </ThemedText>
                  </View>
                </TouchableScale>
              </GlassCard>

              {/* Product Feedback Card */}
              <ProductFeedbackCard />

              <ThemedText style={styles.versionText}>Phiên bản 1.0.0 (LTS)</ThemedText>
            </>
          )}
        </ScrollView>

        {/* Legal Policy Modal */}
        <LegalPolicyModal
          visible={isLegalModalVisible}
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalVisible(false)}
        />
      </SafeAreaView>
    </AmbientBackground>
  );
}
