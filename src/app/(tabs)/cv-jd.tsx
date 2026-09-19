import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profileApi } from '@/api/profile.api';
import { ThemedText } from '@/components/themed-text';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

  const listData = [
    {
      id: 'goals',
      title: 'Mục tiêu nghề nghiệp',
      type: 'goal',
    },
    {
      id: 'primary_resume',
      title: 'CV Phân tích chính',
      type: 'resume',
    },
    {
      id: 'tools',
      title: 'Công cụ phân tích',
      type: 'tool',
    }
  ];

  const renderItem = ({ item }: ListRenderItemInfo<typeof listData[0]>) => {
    if (item.type === 'goal') {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{item.title}</ThemedText>
          </View>
          <TouchableScale onPress={() => router.push('/(app)/career-goals' as any)}>
            <GlassCard style={styles.dashboardCard}>
              {activeGoal ? (
                <View style={styles.goalActiveContainer}>
                  <View style={[styles.bigIconBadge, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="briefcase" size={28} color={colors.primary} />
                  </View>
                  <View style={styles.goalInfo}>
                    <ThemedText style={styles.goalRoleText}>{activeGoal.targetRole}</ThemedText>
                    <View style={styles.goalTagsRow}>
                      <Badge variant="neutral" size="sm">{activeGoal.seniority}</Badge>
                      {activeGoal.industry && (
                        <Badge variant="neutral" size="sm">{activeGoal.industry}</Badge>
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
      );
    }

    if (item.type === 'resume') {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{item.title}</ThemedText>
          </View>
          <TouchableScale onPress={() => router.push('/(app)/resumes' as any)}>
            <GlassCard style={styles.dashboardCard}>
              {primaryResume ? (
                <View style={styles.resumeActiveContainer}>
                  <View style={[styles.bigIconBadge, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="document-text" size={28} color={colors.accent} />
                  </View>
                  <View style={styles.goalInfo}>
                    <ThemedText style={styles.resumeNameText} numberOfLines={1}>{primaryResume.fileName}</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Badge variant="success" size="sm">CV Chính</Badge>
                      <ThemedText style={[styles.resumeDateText, { marginLeft: 8 }]}>
                        {new Date(primaryResume.createdAt).toLocaleDateString('vi-VN')}
                      </ThemedText>
                    </View>
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
      );
    }

    return (
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{item.title}</ThemedText>
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
    );
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Hồ Sơ & Mục Tiêu</ThemedText>
          <ThemedText style={styles.headerSub}>Quản lý dữ liệu phân tích phỏng vấn</ThemedText>
        </View>

        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
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
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    borderRadius: Radius.md,
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
