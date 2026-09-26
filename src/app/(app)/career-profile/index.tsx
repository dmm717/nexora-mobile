import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { profileApi } from '@/api/profile.api';
import { careerGoalsApi } from '@/api/career-goals.api';
import { resumesApi } from '@/api/resumes.api';
import { useAuth } from '@/context/auth-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { TouchableScale } from '@/components/ui/touchable-scale';
import { AppBottomNavBar } from '@/components/navigation/app-bottom-nav-bar';
import { AppScreenHeader } from '@/components/navigation/app-screen-header';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { safeBack } from '@/utils/navigation';
import {
  formatSeniorityLabel,
  formatDate,
  formatFileSize,
  getAvatarColor,
  reconcileCareerGoals,
} from '@/utils/career-goal-contract';
import { styles } from '@/styles/career-profile.styles';

export default function CareerProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const themeKey = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[themeKey];
  const queryClient = useQueryClient();

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

  const displayName = identity?.displayName || user?.displayName || user?.displayName || 'Chưa cập nhật tên';
  const email = identity?.email || user?.email || 'Chưa cập nhật email';
  const avatarChar = (displayName || email || 'N').charAt(0).toUpperCase();

  // --- MUTATIONS ---

  // Career Goal: Set Active
  const reactivateGoalMutation = useMutation({
    mutationFn: (id: string) => careerGoalsApi.update(id, { active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Kích hoạt mục tiêu nghề nghiệp thành công!');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể kích hoạt mục tiêu.');
    },
  });

  // Career Goal: Archive Active Goal
  const archiveGoalMutation = useMutation({
    mutationFn: (id: string) => careerGoalsApi.update(id, { active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Đã lưu trữ mục tiêu nghề nghiệp');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể lưu trữ mục tiêu.');
    },
  });

  // Career Goal: Delete
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => careerGoalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Đã xóa mục tiêu nghề nghiệp');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể xóa mục tiêu.');
    },
  });

  const handleDeleteGoalPrompt = (goal: { id: string; targetRole: string }) => {
    Alert.alert(
      'Xóa mục tiêu',
      `Bạn có chắc chắn muốn xóa mục tiêu "${goal.targetRole}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteGoalMutation.mutate(goal.id),
        },
      ]
    );
  };

  // Resume: Set Primary Resume
  const setPrimaryResumeMutation = useMutation({
    mutationFn: (resumeId: string | null) => profileApi.setPrimaryResume({ resumeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      Alert.alert('Thành công', 'Đã cập nhật CV chính');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể cập nhật CV chính.');
    },
  });

  // Resume: Delete Resume
  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => resumesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['career-profile'] });
      Alert.alert('Thành công', 'Đã xóa CV');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err?.message || 'Không thể xóa CV.');
    },
  });

  const handleDeleteResumePrompt = (id: string, fileName: string) => {
    Alert.alert(
      'Xóa CV',
      `Bạn có chắc chắn muốn xóa CV "${fileName}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteResumeMutation.mutate(id),
        },
      ]
    );
  };

  // Resume: Direct Document Upload
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const handleUploadNewCv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setIsUploadingCv(true);

        const intent = await resumesApi.presign({
          fileName: file.name,
          contentType: file.mimeType || 'application/pdf',
          size: file.size || 0,
        });

        const response = await fetch(file.uri);
        const fileBlob = await response.blob();

        await resumesApi.uploadRawBytes(
          intent.uploadUrl,
          fileBlob,
          file.mimeType || 'application/pdf'
        );

        await resumesApi.finalize({ uploadToken: intent.token });

        queryClient.invalidateQueries({ queryKey: ['resumes'] });
        queryClient.invalidateQueries({ queryKey: ['career-profile'] });
        Alert.alert('Thành công', 'Đã tải lên CV mới thành công!');
      }
    } catch (err: any) {
      Alert.alert('Lỗi tải lên', err?.message || 'Không thể tải lên CV. Vui lòng thử lại.');
    } finally {
      setIsUploadingCv(false);
    }
  };

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

              {/* SECTION 1: CÁ NHÂN & ĐỊNH DANH (CareerIdentityCard) */}
              <GlassCard style={styles.card}>
                <View style={styles.identityRow}>
                  {/* Yellow square box avatar matching web */}
                  <View style={styles.avatarCircle}>
                    <ThemedText style={styles.avatarText}>{avatarChar}</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.identityName}>{displayName}</ThemedText>
                    <ThemedText style={styles.identityEmail}>{email}</ThemedText>
                    <View style={styles.xpBadge}>
                      <ThemedText style={styles.xpText}>
                        {identity?.yearsOfExperience != null
                          ? `${identity.yearsOfExperience} năm kinh nghiệm`
                          : 'Chưa khai báo kinh nghiệm'}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                <View style={styles.statusRow}>
                  <ThemedText style={styles.statusLabel}>Trạng thái onboarding:</ThemedText>
                  <ThemedText
                    style={[
                      styles.statusVal,
                      { color: onboarding?.isComplete ? '#047857' : colors.warning },
                    ]}
                  >
                    {onboarding?.isComplete ? 'Đã hoàn tất' : 'Chưa hoàn thiện'}
                  </ThemedText>
                </View>

                <View style={styles.statusRow}>
                  <ThemedText style={styles.statusLabel}>Quyền riêng tư dữ liệu:</ThemedText>
                  <ThemedText style={styles.statusVal}>Được mã hóa & bảo vệ</ThemedText>
                </View>

                <TouchableScale
                  style={[
                    styles.btnOutline,
                    { borderColor: colors.cardBorder, backgroundColor: colors.surface },
                  ]}
                  onPress={() => router.push('/(app)/account' as any)}
                >
                  <Ionicons name="create-outline" size={15} color={colors.text} />
                  <ThemedText style={[styles.btnText, { color: colors.text }]}>
                    Cập nhật thông tin cá nhân
                  </ThemedText>
                </TouchableScale>
              </GlassCard>

              {/* SECTION 2: MỤC TIÊU NGHỀ NGHIỆP (CareerGoalsSection) */}
              <GlassCard style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="flag-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ThemedText style={styles.cardTitle}>Mục tiêu nghề nghiệp</ThemedText>
                        {activeGoal && (
                          <View style={[styles.activeGoalBadge, { backgroundColor: colors.primaryLight }]}>
                            <ThemedText style={[styles.activeGoalBadgeText, { color: colors.primary }]}>
                              Đang kích hoạt
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.cardSubtitle}>
                        Định hướng tuyển dụng được Nexora dùng làm bối cảnh cho phân tích và luyện tập AI.
                      </ThemedText>
                    </View>
                  </View>

                  {/* Header Button: + Thêm mục tiêu */}
                  <TouchableScale
                    style={[styles.btnOutline, { borderColor: colors.cardBorder }]}
                    onPress={() => router.push('/(app)/career-goals/create' as any)}
                  >
                    <Ionicons name="add" size={15} color={colors.text} />
                    <ThemedText style={[styles.btnText, { color: colors.text }]}>Thêm mục tiêu</ThemedText>
                  </TouchableScale>
                </View>

                {/* Active Goal Display Container */}
                {activeGoal ? (
                  <View style={[styles.activeGoalContainer, { backgroundColor: colors.backgroundElement }]}>
                    <ThemedText style={[styles.activeGoalHeaderLabel, { color: colors.primary }]}>
                      MỤC TIÊU HIỆN TẠI
                    </ThemedText>

                    {/* Row 1: Vị trí, Cấp bậc, Ngành */}
                    <View style={styles.grid3Col}>
                      <View style={styles.goalFieldItem}>
                        <ThemedText style={styles.fieldLabel}>Vị trí mục tiêu</ThemedText>
                        <ThemedText style={styles.fieldValBold}>{activeGoal.targetRole}</ThemedText>
                      </View>
                      <View style={styles.goalFieldItem}>
                        <ThemedText style={styles.fieldLabel}>Cấp bậc</ThemedText>
                        <ThemedText style={[styles.fieldValBold, { color: colors.primary }]}>
                          {formatSeniorityLabel(activeGoal.seniority)}
                        </ThemedText>
                      </View>
                      <View style={styles.goalFieldItem}>
                        <ThemedText style={styles.fieldLabel}>Ngành ưu tiên</ThemedText>
                        <ThemedText style={styles.fieldValBold}>
                          {activeGoal.industry?.trim() || 'Chưa cập nhật'}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Row 2: Công ty, Mốc thời gian */}
                    <View style={styles.grid2Col}>
                      <View style={styles.goalFieldItem}>
                        <ThemedText style={styles.fieldLabel}>Công ty mục tiêu</ThemedText>
                        <ThemedText style={styles.fieldValBold}>
                          {activeGoal.targetCompany?.trim() || 'Chưa cập nhật'}
                        </ThemedText>
                      </View>
                      <View style={styles.goalFieldItem}>
                        <ThemedText style={styles.fieldLabel}>Mốc thời gian</ThemedText>
                        <ThemedText style={styles.fieldValBold}>
                          {formatDate(activeGoal.targetDate)}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Active Goal Action Buttons: Chỉnh sửa mục tiêu + Lưu trữ */}
                    <View style={styles.goalActionsRow}>
                      <TouchableScale
                        style={[styles.btnOutline, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
                        onPress={() => router.push('/(app)/career-goals' as any)}
                      >
                        <Ionicons name="options-outline" size={14} color={colors.text} />
                        <ThemedText style={[styles.btnText, { color: colors.text }]}>
                          Chỉnh sửa mục tiêu
                        </ThemedText>
                      </TouchableScale>
                      {activeGoal.id && (
                        <TouchableScale
                          style={styles.btnGhost}
                          onPress={() => archiveGoalMutation.mutate(activeGoal.id)}
                          disabled={archiveGoalMutation.isPending}
                        >
                          <ThemedText style={[styles.btnText, { color: colors.textMuted }]}>
                            {archiveGoalMutation.isPending ? 'Đang xử lý...' : 'Lưu trữ'}
                          </ThemedText>
                        </TouchableScale>
                      )}
                    </View>
                  </View>
                ) : (
                  <EmptyStateCard
                    icon="flag-outline"
                    title="Chưa có mục tiêu nghề nghiệp"
                    description="Hãy thiết lập mục tiêu nghề nghiệp để Nexora giúp bạn chuẩn bị lộ trình tốt nhất và cá nhân hóa trải nghiệm luyện tập AI."
                    actionLabel="Tạo mục tiêu đầu tiên"
                    onAction={() => router.push('/(app)/career-goals/create' as any)}
                  />
                )}

                {/* Other Inactive Goals List */}
                {otherGoals.length > 0 && (
                  <View style={[styles.otherGoalsSection, { borderTopColor: colors.cardBorder }]}>
                    <View style={styles.otherGoalsHeader}>
                      <ThemedText style={styles.otherGoalsTitle}>Mục tiêu khác</ThemedText>
                      <View style={[styles.countBadge, { backgroundColor: colors.primaryLight }]}>
                        <ThemedText style={[styles.countBadgeText, { color: colors.primary }]}>
                          {otherGoals.length}
                        </ThemedText>
                      </View>
                    </View>

                    {otherGoals.map((goal) => (
                      <View
                        key={goal.id}
                        style={[
                          styles.inactiveGoalCard,
                          { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder },
                        ]}
                      >
                        <View style={styles.inactiveGoalTitleRow}>
                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <ThemedText style={styles.inactiveGoalRole}>{goal.targetRole}</ThemedText>
                            <ThemedText style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>
                              · {formatSeniorityLabel(goal.seniority)}
                            </ThemedText>
                          </View>
                          <View style={[styles.countBadge, { backgroundColor: colors.cardBorder }]}>
                            <ThemedText style={[styles.countBadgeText, { color: colors.textMuted }]}>
                              Tạm dừng
                            </ThemedText>
                          </View>
                        </View>

                        <View style={styles.inactiveGoalMetaRow}>
                          <ThemedText style={styles.inactiveGoalMetaText}>
                            Ngành: {goal.industry?.trim() || 'Chưa cập nhật'}
                          </ThemedText>
                          <ThemedText style={styles.inactiveGoalMetaText}>
                            Công ty: {goal.targetCompany?.trim() || 'Chưa cập nhật'}
                          </ThemedText>
                          {goal.targetDate && (
                            <ThemedText style={styles.inactiveGoalMetaText}>
                              Hạn: {formatDate(goal.targetDate)}
                            </ThemedText>
                          )}
                        </View>

                        <View style={styles.goalActionsRow}>
                          <TouchableScale
                            style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.primary }]}
                            onPress={() => reactivateGoalMutation.mutate(goal.id)}
                            disabled={reactivateGoalMutation.isPending}
                          >
                            <ThemedText style={[styles.btnText, { color: colors.primary, fontSize: 11 }]}>
                              Kích hoạt lại
                            </ThemedText>
                          </TouchableScale>
                          <TouchableScale
                            style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
                            onPress={() => router.push('/(app)/career-goals' as any)}
                          >
                            <ThemedText style={[styles.btnText, { color: colors.text, fontSize: 11 }]}>
                              Chỉnh sửa
                            </ThemedText>
                          </TouchableScale>
                          <TouchableScale
                            style={[styles.btnGhost, styles.btnSmall]}
                            onPress={() => handleDeleteGoalPrompt(goal)}
                          >
                            <Ionicons name="trash-outline" size={14} color={colors.danger} />
                          </TouchableScale>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>

              {/* SECTION 3: QUẢN LÝ CV & HỒ SƠ ĐÍNH KÈM (ResumeManagementSection) */}
              <GlassCard style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconBadge, { backgroundColor: '#d1fae5' }]}>
                      <Ionicons name="document-text-outline" size={20} color="#047857" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.cardTitle}>Quản lý CV & Hồ sơ đính kèm</ThemedText>
                      <ThemedText style={styles.cardSubtitle}>
                        Chỉ 1 CV được đánh dấu là CV chính (Primary Resume) dùng làm nguồn bối cảnh mặc định cho các bài test.
                      </ThemedText>
                    </View>
                  </View>

                  {/* Header Button: Tải thêm CV mới */}
                  <TouchableScale
                    style={[
                      styles.btnPrimary,
                      { backgroundColor: colors.primary },
                      isUploadingCv && { opacity: 0.6 },
                    ]}
                    onPress={handleUploadNewCv}
                    disabled={isUploadingCv}
                  >
                    {isUploadingCv ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Ionicons name="cloud-upload-outline" size={15} color="#ffffff" />
                    )}
                    <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>
                      {isUploadingCv ? 'Đang tải lên...' : 'Tải thêm CV mới'}
                    </ThemedText>
                  </TouchableScale>
                </View>

                {/* Resumes List */}
                {resumes.length === 0 ? (
                  <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement }]}>
                    <Ionicons name="document-outline" size={28} color={colors.textMuted} />
                    <ThemedText style={styles.emptyTitle}>Bạn chưa có CV nào trong hồ sơ</ThemedText>
                    <ThemedText style={styles.emptySub}>
                      Hãy tải lên bản CV đầu tiên để làm dữ liệu bối cảnh cho các bài kiểm tra năng lực và phỏng vấn AI.
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.resumeListContainer}>
                    {resumes.map((res) => {
                      const isPrimary = res.id === primaryResume?.id;
                      const isReady = res.status === 'ready';

                      return (
                        <View
                          key={res.id}
                          style={[
                            styles.resumeItemCard,
                            {
                              backgroundColor: isPrimary ? colors.secondaryLight : colors.backgroundElement,
                              borderColor: isPrimary ? colors.secondary : colors.cardBorder,
                            },
                          ]}
                        >
                          <View style={styles.resumeItemHeader}>
                            <View style={[styles.fileIconBox, { backgroundColor: isPrimary ? colors.secondary : colors.primaryLight }]}>
                              <Ionicons
                                name="document-text"
                                size={20}
                                color={isPrimary ? '#ffffff' : colors.primary}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <ThemedText style={styles.resumeNameText} numberOfLines={1}>
                                  {res.fileName || 'CV Không tên'}
                                </ThemedText>
                                {isPrimary && (
                                  <View style={[styles.primaryCvBadge, { backgroundColor: colors.secondary }]}>
                                    <ThemedText style={styles.primaryCvBadgeText}>CV Chính thức</ThemedText>
                                  </View>
                                )}
                              </View>

                              <ThemedText style={styles.resumeMetaText}>
                                {formatFileSize(res.size)} · Tải lên lúc {formatDate(res.createdAt)} ·{' '}
                                <ThemedText
                                  style={{
                                    fontWeight: '700',
                                    color: isReady ? '#047857' : colors.warning,
                                  }}
                                >
                                  {isReady ? 'Sẵn sàng phân tích' : res.status}
                                </ThemedText>
                              </ThemedText>
                            </View>
                          </View>

                          <View style={styles.resumeActionsRow}>
                            {!isPrimary ? (
                              <TouchableScale
                                style={[styles.btnOutline, styles.btnSmall, { borderColor: colors.cardBorder }]}
                                onPress={() => setPrimaryResumeMutation.mutate(res.id)}
                                disabled={setPrimaryResumeMutation.isPending || !isReady}
                              >
                                <ThemedText style={[styles.btnText, { color: colors.text, fontSize: 11 }]}>
                                  Đặt làm CV chính
                                </ThemedText>
                              </TouchableScale>
                            ) : (
                              <TouchableScale
                                style={[styles.btnGhost, styles.btnSmall]}
                                onPress={() => setPrimaryResumeMutation.mutate(null)}
                                disabled={setPrimaryResumeMutation.isPending}
                              >
                                <ThemedText style={[styles.btnText, { color: colors.danger, fontSize: 11 }]}>
                                  Bỏ chọn CV chính
                                </ThemedText>
                              </TouchableScale>
                            )}

                            <TouchableScale
                              style={[styles.btnPrimary, styles.btnSmall, { backgroundColor: colors.primary }]}
                              onPress={() => router.push('/(app)/resumes' as any)}
                            >
                              <Ionicons name="bar-chart-outline" size={13} color="#ffffff" />
                              <ThemedText style={{ color: '#ffffff', fontWeight: '700', fontSize: 11 }}>
                                Quét phân tích
                              </ThemedText>
                            </TouchableScale>

                            <TouchableScale
                              style={[styles.btnGhost, styles.btnSmall]}
                              onPress={() => handleDeleteResumePrompt(res.id, res.fileName)}
                              disabled={deleteResumeMutation.isPending}
                            >
                              <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                              <ThemedText style={[styles.btnText, { color: colors.textMuted, fontSize: 11 }]}>
                                Xóa
                              </ThemedText>
                            </TouchableScale>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </GlassCard>

              {/* SECTION 4: HỒ SƠ NĂNG LỰC THỰC CHỨNG (SkillProfileSection) */}
              <GlassCard style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconBadge, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.cardTitle}>Hồ sơ năng lực thực chứng (Skill Profile)</ThemedText>
                      <ThemedText style={styles.cardSubtitle}>
                        Tổng hợp 100% từ dữ kiện đánh giá qua phỏng vấn và CV. (Chỉ đọc, không chỉnh sửa thủ công)
                      </ThemedText>
                    </View>
                  </View>

                  {/* Header Badge: Bằng chứng tự động */}
                  <View style={[styles.autoBadge, { borderColor: colors.cardBorder }]}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} />
                    <ThemedText style={[styles.autoBadgeText, { color: colors.text }]}>
                      Bằng chứng tự động
                    </ThemedText>
                  </View>
                </View>

                {topCompetencies.length === 0 ? (
                  <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElement }]}>
                    <ThemedText style={styles.emptyTitle}>Chưa có đủ bằng chứng năng lực</ThemedText>
                    <ThemedText style={styles.emptySub}>
                      Hồ sơ năng lực sẽ tự động hình thành sau khi bạn thực hiện các bài phỏng vấn thử hoặc quét phân tích CV.
                    </ThemedText>
                  </View>
                ) : (
                  <View style={{ gap: Spacing.two }}>
                    {topCompetencies.map((comp) => {
                      const score = comp.score != null ? Math.round(comp.score) : null;
                      return (
                        <View key={comp.code} style={[styles.compCard, { backgroundColor: colors.backgroundElement }]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={styles.compCategoryText}>{comp.category}</ThemedText>
                              <ThemedText style={styles.compNameText}>{comp.name || comp.code}</ThemedText>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <ThemedText style={[styles.compScoreText, { color: colors.primary }]}>
                                {score !== null ? `${score}/100` : '--/100'}
                              </ThemedText>
                              <ThemedText style={styles.compEvidenceText}>{comp.evidenceCount} bằng chứng</ThemedText>
                            </View>
                          </View>

                          {score !== null && (
                            <View style={styles.progressTrack}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${Math.min(100, Math.max(5, score))}%`,
                                    backgroundColor: colors.primary,
                                  },
                                ]}
                              />
                            </View>
                          )}

                          <View style={[styles.compFooter, { borderTopColor: colors.cardBorder }]}>
                            <ThemedText style={styles.compFooterText}>
                              Nguồn: Phỏng vấn giả lập & CV Analysis
                            </ThemedText>
                            <ThemedText style={styles.compFooterText}>
                              Chưa có mốc cập nhật
                            </ThemedText>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Weakness Signals Box */}
                {topWeaknessSignals.length > 0 && (
                  <View
                    style={[
                      styles.weaknessBox,
                      {
                        backgroundColor: '#fffbe8', // Light amber background
                        borderColor: '#fcd34d', // Amber border
                      },
                    ]}
                  >
                    <View style={styles.weaknessHeader}>
                      <Ionicons name="warning-outline" size={16} color="#d97706" />
                      <ThemedText style={[styles.weaknessTitle, { color: '#92400e' }]}>
                        Tín hiệu khuyết thiếu năng lực đã được ghi nhận:
                      </ThemedText>
                    </View>
                    {topWeaknessSignals.map((w, idx) => (
                      <View key={idx} style={styles.weaknessItem}>
                        <ThemedText style={[styles.weaknessBullet, { color: '#92400e' }]}>•</ThemedText>
                        <ThemedText style={[styles.weaknessText, { color: '#78350f' }]}>
                          {w.label} <ThemedText style={{ opacity: 0.7 }}>({w.sourceType})</ThemedText>
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>
            </>
          )}
        </ScrollView>
        <AppBottomNavBar activeTab="profile" />
      </SafeAreaView>
    </ThemedView>
  );
}
