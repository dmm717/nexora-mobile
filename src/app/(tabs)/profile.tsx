import React from 'react';
import { ActivityIndicator, StyleSheet, ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { profileApi } from '@/api/profile.api';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['career-profile'],
    queryFn: profileApi.getCareerProfile,
  });

  if (isLoading && !isRefetching) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3525CD" />
      </ThemedView>
    );
  }

  if (isError || !data) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Có lỗi xảy ra khi tải hồ sơ. Vui lòng thử lại.</ThemedText>
      </ThemedView>
    );
  }

  const profile = data.identity;
  const activeGoal = data.activeCareerGoal;
  const primaryResume = data.primaryResume;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {/* Header Profile */}
          <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholder}>
                <ThemedText style={styles.avatarText}>
                  {profile.displayName?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.profileInfo}>
                <ThemedText type="title">{profile.displayName || 'Người dùng Nexora'}</ThemedText>
                <ThemedText>{profile.email}</ThemedText>
                <ThemedText style={styles.xpText}>{profile.yearsOfExperience ?? 0} năm kinh nghiệm</ThemedText>
              </View>
            </View>
          </View>

          {/* Active Career Goal */}
          <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Mục Tiêu Nghề Nghiệp</ThemedText>
            {activeGoal ? (
              <View>
                <ThemedText style={styles.goalRole}>{activeGoal.targetRole} - {activeGoal.seniority}</ThemedText>
                {activeGoal.industry && <ThemedText style={styles.goalDetail}>Ngành: {activeGoal.industry}</ThemedText>}
                {activeGoal.targetCompany && <ThemedText style={styles.goalDetail}>Công ty: {activeGoal.targetCompany}</ThemedText>}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>Chưa có mục tiêu nghề nghiệp nào được đặt.</ThemedText>
            )}
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/career-goals' as any)}
            >
              <ThemedText style={styles.actionButtonText}>Quản lý mục tiêu</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Primary Resume */}
          <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>CV Hiện Tại (Primary Resume)</ThemedText>
            {primaryResume ? (
              <View>
                <ThemedText style={styles.resumeName}>{primaryResume.fileName}</ThemedText>
                <ThemedText style={styles.resumeStatus}>Trạng thái: {primaryResume.status}</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>Chưa có CV nào được chọn làm CV chính.</ThemedText>
            )}

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/resumes' as any)}
            >
              <ThemedText style={styles.actionButtonText}>Quản lý CV</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Phân tích CV */}
          <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff' }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Phân Tích CV</ThemedText>
            <ThemedText style={styles.goalDetail}>Nhận đánh giá chuyên sâu và điểm số cho CV của bạn dựa trên mục tiêu nghề nghiệp.</ThemedText>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3525CD' }]}
              onPress={() => router.push('/(app)/cv-analysis' as any)}
            >
              <ThemedText style={[styles.actionButtonText, { color: '#ffffff' }]}>Phân tích ngay</ThemedText>
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
  },
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: Spacing.three,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3525CD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  xpText: {
    opacity: 0.7,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: Spacing.one,
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  goalRole: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  goalDetail: {
    fontSize: 14,
    opacity: 0.8,
  },
  resumeName: {
    fontWeight: '600',
    fontSize: 15,
  },
  resumeStatus: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  actionButton: {
    marginTop: Spacing.three,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(53, 37, 205, 0.1)',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#3525CD',
    fontWeight: '600',
    fontSize: 14,
  }
});
